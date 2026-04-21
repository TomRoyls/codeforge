import { describe, test, expect, vi } from 'vitest'
import { preferTernaryOperatorRule } from '../../../../src/rules/patterns/prefer-ternary-operator.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = a || b;',
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

function createIfStatement(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'IfStatement',
    test,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function createExpressionStatement(expression: unknown): unknown {
  return { type: 'ExpressionStatement', expression }
}

function createAssignmentExpression(left: unknown, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
  }
}

function createBlockStatement(body: unknown[]): unknown {
  return { type: 'BlockStatement', body }
}

function createLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

// Helper to create a ternary-candidate if statement quickly
function createTernaryCandidate(
  varName: string,
  consequentValue: unknown,
  alternateValue: unknown,
  line = 1,
  column = 0,
): unknown {
  return createIfStatement(
    createIdentifier('condition'),
    createExpressionStatement(
      createAssignmentExpression(createIdentifier(varName), consequentValue),
    ),
    createExpressionStatement(
      createAssignmentExpression(createIdentifier(varName), alternateValue),
    ),
    line,
    column,
  )
}

describe('prefer-ternary-operator rule', () => {
  // =========================================================================
  // META PROPERTIES (20 tests)
  // =========================================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferTernaryOperatorRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferTernaryOperatorRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferTernaryOperatorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have style category', () => {
      expect(preferTernaryOperatorRule.meta.docs?.category).toBe('style')
    })

    test('should have schema defined', () => {
      expect(preferTernaryOperatorRule.meta.schema).toBeDefined()
    })

    test('should be fixable as code', () => {
      expect(preferTernaryOperatorRule.meta.fixable).toBe('code')
    })

    test('should mention ternary operator in description', () => {
      expect(preferTernaryOperatorRule.meta.docs?.description.toLowerCase()).toContain('ternary')
    })

    test('should mention if-else in description', () => {
      expect(preferTernaryOperatorRule.meta.docs?.description).toContain('if-else')
    })

    test('should have docs property', () => {
      expect(preferTernaryOperatorRule.meta.docs).toBeDefined()
    })

    test('should have docs.description as non-empty string', () => {
      expect(typeof preferTernaryOperatorRule.meta.docs?.description).toBe('string')
      expect(preferTernaryOperatorRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs.url defined', () => {
      expect(preferTernaryOperatorRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url as a string', () => {
      expect(typeof preferTernaryOperatorRule.meta.docs?.url).toBe('string')
    })

    test('should have docs.url starting with https', () => {
      expect(preferTernaryOperatorRule.meta.docs?.url).toMatch(/^https:/)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferTernaryOperatorRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(preferTernaryOperatorRule.meta.schema).toEqual([])
    })

    test('should not be deprecated', () => {
      expect(preferTernaryOperatorRule.meta.deprecated).toBeUndefined()
    })

    test('should have type as a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferTernaryOperatorRule.meta.type)
    })

    test('should have severity as a valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(preferTernaryOperatorRule.meta.severity)
    })

    test('should mention assignment in description', () => {
      expect(preferTernaryOperatorRule.meta.docs?.description.toLowerCase()).toContain('assignment')
    })

    test('should mention concise in description', () => {
      expect(preferTernaryOperatorRule.meta.docs?.description.toLowerCase()).toContain('concise')
    })
  })

  // =========================================================================
  // CREATE / VISITOR STRUCTURE (10 tests)
  // =========================================================================
  describe('create', () => {
    test('should return visitor object with IfStatement', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)
      expect(visitor).toHaveProperty('IfStatement')
    })

    test('should return IfStatement as a function', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)
      expect(typeof visitor.IfStatement).toBe('function')
    })

    test('should not throw when creating visitor', () => {
      const { context } = createMockContext()
      expect(() => preferTernaryOperatorRule.create(context)).not.toThrow()
    })

    test('should return a new visitor object on each create call', () => {
      const { context } = createMockContext()
      const visitor1 = preferTernaryOperatorRule.create(context)
      const visitor2 = preferTernaryOperatorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor with only IfStatement key', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)
      expect(Object.keys(visitor)).toEqual(['IfStatement'])
    })

    test('should accept different context objects', () => {
      const { context: ctx1 } = createMockContext({}, '/src/a.ts')
      const { context: ctx2 } = createMockContext({}, '/src/b.ts')
      expect(() => preferTernaryOperatorRule.create(ctx1)).not.toThrow()
      expect(() => preferTernaryOperatorRule.create(ctx2)).not.toThrow()
    })

    test('should not throw when calling IfStatement with no arguments', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)
      expect(() => visitor.IfStatement()).not.toThrow()
    })

    test('should return visitor whose IfStatement accepts single argument', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)
      expect(visitor.IfStatement.length).toBe(1)
    })

    test('should create visitor with empty options', () => {
      const { context } = createMockContext()
      expect(() => preferTernaryOperatorRule.create(context)).not.toThrow()
    })

    test('should create visitor with populated options', () => {
      const { context } = createMockContext({ checkReturns: true })
      expect(() => preferTernaryOperatorRule.create(context)).not.toThrow()
    })
  })

  // =========================================================================
  // DETECTION: SIMPLE IF-ELSE ASSIGNMENTS (25 tests)
  // =========================================================================
  describe('detecting simple if-else assignments', () => {
    test('should report simple if-else with same variable assignment in expression statements', () => {
      const source = 'if (condition) { x = 1; } else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ternary')
      expect(reports[0].message).toContain('x')
    })

    test('should report if-else with block statements containing single assignment', () => {
      const source = 'if (condition) { x = 1; } else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
      ])
      const alternate = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
      ])

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ternary')
    })

    test('should report if-else with mixed block and expression statements', () => {
      const source = 'if (condition) { x = 1; } else x = 2;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
      ])
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(1)
    })

    test('should report if-else with variable expressions', () => {
      const source = 'if (condition) { x = a; } else { x = b; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('a')),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('b')),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(1)
    })

    test('should report if-else with expression in consequent and block in alternate', () => {
      const source = 'if (condition) x = 1; else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
      ])

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(1)
    })

    test('should report with literal values in both branches', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(true), createLiteral(false)))

      expect(reports.length).toBe(1)
    })

    test('should report with string literal values in both branches', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('name', createLiteral('yes'), createLiteral('no')))

      expect(reports.length).toBe(1)
    })

    test('should report with null literal in branches', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('val', createLiteral(null), createLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should report with identifier right-hand values', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createTernaryCandidate('result', createIdentifier('a'), createIdentifier('b')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with numeric literal values', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('count', createLiteral(0), createLiteral(1)))

      expect(reports.length).toBe(1)
    })

    test('should report with negative numeric literal values', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('num', createLiteral(-1), createLiteral(1)))

      expect(reports.length).toBe(1)
    })

    test('should report with call expression test condition', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const callExpr = { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] }

      visitor.IfStatement(
        createIfStatement(
          callExpr,
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
          ),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with binary expression test condition', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '>',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      }

      visitor.IfStatement(
        createIfStatement(
          binaryExpr,
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
          ),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with logical expression test condition', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      }

      visitor.IfStatement(
        createIfStatement(
          logicalExpr,
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
          ),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with member expression as right-hand value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('prop'),
      }

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement(createAssignmentExpression(createIdentifier('x'), memberExpr)),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(0)),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with call expression as right-hand value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const callExpr = { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] }

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement(createAssignmentExpression(createIdentifier('x'), callExpr)),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(0)),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with unary expression test condition', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const unaryExpr = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createIdentifier('flag'),
      }

      visitor.IfStatement(
        createIfStatement(
          unaryExpr,
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
          ),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(0)),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with underscore variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('_result', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should report with dollar sign variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createTernaryCandidate('$el', createLiteral(null), createLiteral(undefined)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with single letter variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('a', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should report with long descriptive variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createTernaryCandidate(
          'isUserAuthenticatedAndAuthorized',
          createLiteral(true),
          createLiteral(false),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with boolean literal test condition', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLiteral(true),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
          ),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with empty string source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should report with same literal value in both branches', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(5), createLiteral(5)))

      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // LOCATION REPORTING (15 tests)
  // =========================================================================
  describe('location reporting', () => {
    test('should report correct location for if statement at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2), 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for if statement at line 10 column 5', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2), 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for if statement at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2), 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2), 5, 10))

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location with correct end column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2), 5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should report when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should use default location when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
      }

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with only start property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
        loc: {
          start: { line: 3, column: 7 },
        },
      }

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should handle location with non-numeric line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
        loc: {
          start: { line: 'not-a-number', column: 5 },
          end: { line: 'not-a-number', column: 25 },
        },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle location with non-numeric column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
        loc: {
          start: { line: 1, column: 'zero' },
          end: { line: 1, column: 'twenty' },
        },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle location with null start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
        loc: {
          start: null,
          end: { line: 1, column: 20 },
        },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle location with null end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
        loc: {
          start: { line: 5, column: 3 },
          end: null,
        },
      }

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle location with zero line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      }

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with very large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2), 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle location with very large column number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2), 1, 9999))

      expect(reports[0].loc?.start.column).toBe(9999)
    })
  })

  // =========================================================================
  // MESSAGE CONTENT (15 tests)
  // =========================================================================
  describe('message quality', () => {
    test('should mention variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('result', createLiteral(1), createLiteral(2)))

      expect(reports[0].message).toContain('result')
    })

    test('should mention ternary operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports[0].message).toContain('ternary')
    })

    test('should mention if-else in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports[0].message).toContain('if-else')
    })

    test('should mention simple assignment in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports[0].message).toContain('assignment')
    })

    test('should have correct message format for variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('myVar', createLiteral(1), createLiteral(2)))

      expect(reports[0].message).toContain("'myVar'")
    })

    test('should mention underscore variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('_private', createLiteral(1), createLiteral(2)))

      expect(reports[0].message).toContain('_private')
    })

    test('should mention dollar variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('$elem', createLiteral(1), createLiteral(2)))

      expect(reports[0].message).toContain('$elem')
    })

    test('should produce consistent messages for the same variable', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = preferTernaryOperatorRule.create(ctx1)
      const visitor2 = preferTernaryOperatorRule.create(ctx2)

      visitor1.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))
      visitor2.IfStatement(createTernaryCandidate('x', createLiteral('a'), createLiteral('b')))

      expect(rep1[0].message).toBe(rep2[0].message)
    })

    test('should produce different messages for different variables', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = preferTernaryOperatorRule.create(ctx1)
      const visitor2 = preferTernaryOperatorRule.create(ctx2)

      visitor1.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))
      visitor2.IfStatement(createTernaryCandidate('y', createLiteral(1), createLiteral(2)))

      expect(rep1[0].message).not.toBe(rep2[0].message)
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should have message containing quoted variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('count', createLiteral(1), createLiteral(2)))

      expect(reports[0].message).toContain("'count'")
    })

    test('should have message that starts with Use', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports[0].message).toMatch(/^Use /)
    })

    test('should mention operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports[0].message).toContain('operator')
    })

    test('should be a non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should be a string message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(typeof reports[0].message).toBe('string')
    })
  })

  // =========================================================================
  // PATTERNS THAT SHOULD NOT BE REPORTED (30 tests)
  // =========================================================================
  describe('patterns that should NOT be reported', () => {
    test('should not report if-else without alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, null))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else without consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), null, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with different variable assignments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with multiple statements in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
        ),
      ])
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with multiple statements in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('y'), createLiteral(3)),
        ),
      ])

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else without assignment in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(createIdentifier('console.log'))
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else without assignment in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(createIdentifier('console.log'))

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with non-assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(createIdentifier('doSomething'))
      const alternate = createExpressionStatement(createIdentifier('doSomethingElse'))

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with empty block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createBlockStatement([])
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with empty block in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createBlockStatement([])

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with compound assignment operator in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '+=',
        left: createIdentifier('x'),
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with compound assignment operator in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '-=',
        left: createIdentifier('x'),
        right: createLiteral(2),
      })

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with compound assignment operator *=', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '*=',
        left: createIdentifier('x'),
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with MemberExpression left side in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression' },
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with MemberExpression left side in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression' },
        right: createLiteral(2),
      })

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with MemberExpression on both sides', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression' },
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression' },
        right: createLiteral(2),
      })

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with return statements', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'ReturnStatement', argument: createLiteral(1) }
      const alternate = { type: 'ReturnStatement', argument: createLiteral(2) }

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if with undefined consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: undefined,
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report if with undefined alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: undefined,
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with case-sensitive different variable names', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('myVar'), createLiteral(1)),
      )
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('myvar'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with throw statements', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'ThrowStatement' }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with variable declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = {
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'let',
      }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with function declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'FunctionDeclaration', id: createIdentifier('fn') }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report if-else with if-else chain in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const innerIf = {
        type: 'IfStatement',
        test: createIdentifier('condition2'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(3)),
        ),
      }

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, innerIf))

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent has for statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'ForStatement' }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report when both branches are while loops', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'WhileStatement' }
      const alternate = { type: 'WhileStatement' }

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is a switch statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'SwitchStatement' }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is a try statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const alternate = { type: 'TryStatement' }

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should not report when both branches have different operators', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '+=',
        left: createIdentifier('x'),
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '-=',
        left: createIdentifier('x'),
        right: createLiteral(2),
      })

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // EDGE CASES (30 tests)
  // =========================================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle non-object string node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
    })

    test('should handle non-object number node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement(123)).not.toThrow()
    })

    test('should handle non-object boolean node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement(true)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle if statement without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report even without test (rule still detects pattern)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without consequent property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without alternate property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle block statement with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'BlockStatement', body: null }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle block statement with undefined body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'BlockStatement' }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle expression statement without expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'ExpressionStatement' }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment expression with non-identifier left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression' },
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression' },
        right: createLiteral(2),
      })

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

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
        getSource: () => 'const x = a || b;',
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

      const visitor = preferTernaryOperatorRule.create(context)

      expect(() =>
        visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2))),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement({
        type: 'ForStatement',
        test: createIdentifier('condition'),
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
        ),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() =>
        visitor.IfStatement({
          test: createIdentifier('condition'),
          consequent: createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
          ),
          alternate: createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        }),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle expression statement with null expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'ExpressionStatement', expression: null }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment expression without left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment expression without right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
      })
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle assignment expression without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        left: createIdentifier('x'),
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle identifier without name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier' },
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle identifier with non-string name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = createExpressionStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 123 },
        right: createLiteral(1),
      })
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(() =>
        visitor.IfStatement(
          createIfStatement(createIdentifier('condition'), consequent, alternate),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Date object as node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex as node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement(/test/)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Symbol as node', () => {
      const { context } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement(Symbol('test'))).not.toThrow()
    })

    test('should handle function as node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(() => visitor.IfStatement(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // MULTIPLE REPORTS (10 tests)
  // =========================================================================
  describe('multiple reports', () => {
    test('should report multiple if-statements in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))
      visitor.IfStatement(createTernaryCandidate('y', createLiteral(3), createLiteral(4)))

      expect(reports.length).toBe(2)
    })

    test('should report three if-statements in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('a', createLiteral(1), createLiteral(2)))
      visitor.IfStatement(createTernaryCandidate('b', createLiteral(3), createLiteral(4)))
      visitor.IfStatement(createTernaryCandidate('c', createLiteral(5), createLiteral(6)))

      expect(reports.length).toBe(3)
    })

    test('should accumulate reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.IfStatement(createTernaryCandidate(`v${i}`, createLiteral(i), createLiteral(i + 1)))
      }

      expect(reports.length).toBe(5)
    })

    test('should report each variable name correctly in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))
      visitor.IfStatement(createTernaryCandidate('y', createLiteral(3), createLiteral(4)))

      expect(reports[0].message).toContain('x')
      expect(reports[1].message).toContain('y')
    })

    test('should report locations correctly for multiple if-statements', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2), 1, 0))
      visitor.IfStatement(createTernaryCandidate('y', createLiteral(3), createLiteral(4), 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should report matching and skip non-matching in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      // Non-matching: different variables
      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('a'), createLiteral(1)),
          ),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('b'), createLiteral(2)),
          ),
        ),
      )

      visitor.IfStatement(createTernaryCandidate('z', createLiteral(3), createLiteral(4)))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('x')
      expect(reports[1].message).toContain('z')
    })

    test('should report 10 if-statements in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.IfStatement(createTernaryCandidate('x', createLiteral(i), createLiteral(i + 1)))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle mix of null and valid nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(null)
      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))
      visitor.IfStatement(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle mix of matching and empty objects', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement({})
      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))
      visitor.IfStatement({})

      expect(reports.length).toBe(1)
    })

    test('should not mix up reports between calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('first', createLiteral(1), createLiteral(2)))

      const firstReportCount = reports.length
      expect(firstReportCount).toBe(1)

      visitor.IfStatement(createTernaryCandidate('second', createLiteral(3), createLiteral(4)))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('first')
      expect(reports[1].message).toContain('second')
    })
  })

  // =========================================================================
  // CONTEXT VARIATIONS (15 tests)
  // =========================================================================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with different file extensions', () => {
      const { context, reports } = createMockContext({}, '/project/src/component.tsx')
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with JavaScript file path', () => {
      const { context, reports } = createMockContext({}, '/project/src/index.js')
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockContext(
        {},
        '/project/src/features/auth/utils/helpers.ts',
      )
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'if (a) { b = 1; } else { b = 2; }',
      )
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with multiline source code', () => {
      const source = `if (condition) {\n  x = 1;\n} else {\n  x = 2;\n}`
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with options object', () => {
      const { context, reports } = createMockContext({ strictMode: true })
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with context that has parserServices', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
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

      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with Windows-style file path', () => {
      const { context, reports } = createMockContext({}, 'C:\\project\\src\\file.ts')
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with relative file path', () => {
      const { context, reports } = createMockContext({}, './src/file.ts')
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with unicode source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const 你好 = 1;')
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with very long source code', () => {
      const longSource = 'const x = 1;\n'.repeat(1000)
      const { context, reports } = createMockContext({}, '/src/file.ts', longSource)
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should work with context that returns empty comments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      expect(context.getComments()).toEqual([])
      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // test.each - SAFE CASES (detectable patterns)
  // =========================================================================
  describe('detectable patterns via test.each', () => {
    test.each([
      {
        name: 'simple literal assignment',
        varName: 'x',
        consequentVal: { type: 'Literal', value: 1 },
        alternateVal: { type: 'Literal', value: 2 },
      },
      {
        name: 'string literal assignment',
        varName: 'msg',
        consequentVal: { type: 'Literal', value: 'hello' },
        alternateVal: { type: 'Literal', value: 'world' },
      },
      {
        name: 'boolean literal assignment',
        varName: 'flag',
        consequentVal: { type: 'Literal', value: true },
        alternateVal: { type: 'Literal', value: false },
      },
      {
        name: 'null assignment',
        varName: 'val',
        consequentVal: { type: 'Literal', value: null },
        alternateVal: { type: 'Literal', value: 0 },
      },
      {
        name: 'identifier assignment',
        varName: 'result',
        consequentVal: { type: 'Identifier', name: 'a' },
        alternateVal: { type: 'Identifier', name: 'b' },
      },
      {
        name: 'mixed literal and identifier',
        varName: 'mixed',
        consequentVal: { type: 'Literal', value: 0 },
        alternateVal: { type: 'Identifier', name: 'fallback' },
      },
      {
        name: 'zero values',
        varName: 'num',
        consequentVal: { type: 'Literal', value: 0 },
        alternateVal: { type: 'Literal', value: 0 },
      },
      {
        name: 'negative values',
        varName: 'offset',
        consequentVal: { type: 'Literal', value: -1 },
        alternateVal: { type: 'Literal', value: 1 },
      },
      {
        name: 'empty string and non-empty',
        varName: 'text',
        consequentVal: { type: 'Literal', value: '' },
        alternateVal: { type: 'Literal', value: 'default' },
      },
      {
        name: 'undefined literal',
        varName: 'opt',
        consequentVal: { type: 'Literal', value: undefined },
        alternateVal: { type: 'Literal', value: null },
      },
    ] as const)('should report $name', ({ varName, consequentVal, alternateVal }) => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('cond'),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier(varName), consequentVal),
          ),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier(varName), alternateVal),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // test.each - NON-MATCHING CASES (should not report)
  // =========================================================================
  describe('non-matching patterns via test.each', () => {
    test.each([
      {
        name: 'no alternate',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
              ),
              null,
            ),
          )
          return reports.length
        },
      },
      {
        name: 'different variables',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
              ),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
              ),
            ),
          )
          return reports.length
        },
      },
      {
        name: 'multiple statements in consequent block',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              createBlockStatement([
                createExpressionStatement(
                  createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
                ),
                createExpressionStatement(
                  createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
                ),
              ]),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
              ),
            ),
          )
          return reports.length
        },
      },
      {
        name: 'compound operator +=',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              createExpressionStatement({
                type: 'AssignmentExpression',
                operator: '+=',
                left: createIdentifier('x'),
                right: createLiteral(1),
              }),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
              ),
            ),
          )
          return reports.length
        },
      },
      {
        name: 'member expression left side',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              createExpressionStatement({
                type: 'AssignmentExpression',
                operator: '=',
                left: { type: 'MemberExpression' },
                right: createLiteral(1),
              }),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
              ),
            ),
          )
          return reports.length
        },
      },
      {
        name: 'empty consequent block',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              createBlockStatement([]),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
              ),
            ),
          )
          return reports.length
        },
      },
      {
        name: 'non-assignment expression in consequent',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              createExpressionStatement(createIdentifier('doSomething')),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
              ),
            ),
          )
          return reports.length
        },
      },
      {
        name: 'return statement in consequent',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              { type: 'ReturnStatement', argument: createLiteral(1) },
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
              ),
            ),
          )
          return reports.length
        },
      },
      {
        name: 'null node',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(null)
          return reports.length
        },
      },
      {
        name: 'undefined node',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(undefined)
          return reports.length
        },
      },
      {
        name: 'empty object node',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement({})
          return reports.length
        },
      },
      {
        name: 'wrong type ForStatement',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement({
            type: 'ForStatement',
            test: createIdentifier('cond'),
            consequent: createExpressionStatement(
              createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
            ),
            alternate: createExpressionStatement(
              createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
            ),
          })
          return reports.length
        },
      },
      {
        name: 'string node',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement('not a node')
          return reports.length
        },
      },
      {
        name: 'number node',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(42)
          return reports.length
        },
      },
      {
        name: 'boolean node',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(true)
          return reports.length
        },
      },
      {
        name: 'block with multiple statements in both branches',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              createBlockStatement([
                createExpressionStatement(
                  createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
                ),
                createExpressionStatement(
                  createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
                ),
              ]),
              createBlockStatement([
                createExpressionStatement(
                  createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
                ),
                createExpressionStatement(
                  createAssignmentExpression(createIdentifier('y'), createLiteral(3)),
                ),
              ]),
            ),
          )
          return reports.length
        },
      },
      {
        name: 'expression statement without expression property',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              { type: 'ExpressionStatement' },
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
              ),
            ),
          )
          return reports.length
        },
      },
      {
        name: 'assignment without operator property',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              createExpressionStatement({
                type: 'AssignmentExpression',
                left: createIdentifier('x'),
                right: createLiteral(1),
              }),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
              ),
            ),
          )
          return reports.length
        },
      },
      {
        name: 'case-different variables (myVar vs myvar)',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('myVar'), createLiteral(1)),
              ),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('myvar'), createLiteral(2)),
              ),
            ),
          )
          return reports.length
        },
      },
      {
        name: 'both branches have empty blocks',
        build: () => {
          const { context, reports } = createMockContext()
          const visitor = preferTernaryOperatorRule.create(context)
          visitor.IfStatement(
            createIfStatement(
              createIdentifier('cond'),
              createBlockStatement([]),
              createBlockStatement([]),
            ),
          )
          return reports.length
        },
      },
    ] as const)('should not report for $name', ({ build }) => {
      expect(build()).toBe(0)
    })
  })

  // =========================================================================
  // BLOCK STATEMENT VARIATIONS (10 tests)
  // =========================================================================
  describe('block statement variations', () => {
    test('should detect assignment inside block statement in consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createBlockStatement([
            createExpressionStatement(
              createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
            ),
          ]),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect assignment inside block statement in alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
          ),
          createBlockStatement([
            createExpressionStatement(
              createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
            ),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect assignment in both block statements', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createBlockStatement([
            createExpressionStatement(
              createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
            ),
          ]),
          createBlockStatement([
            createExpressionStatement(
              createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
            ),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report block with zero items', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createBlockStatement([]),
          createBlockStatement([]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report block with two items', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createBlockStatement([
            createExpressionStatement(
              createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
            ),
            createExpressionStatement(
              createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
            ),
          ]),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(3)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report block with exactly one statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createBlockStatement([
            createExpressionStatement(
              createAssignmentExpression(createIdentifier('val'), createLiteral('a')),
            ),
          ]),
          createBlockStatement([
            createExpressionStatement(
              createAssignmentExpression(createIdentifier('val'), createLiteral('b')),
            ),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report when block contains non-expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createBlockStatement([{ type: 'ReturnStatement', argument: createLiteral(1) }]),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when block body is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      const consequent = { type: 'BlockStatement', body: 'not-array' }
      const alternate = createExpressionStatement(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      visitor.IfStatement(createIfStatement(createIdentifier('condition'), consequent, alternate))

      expect(reports.length).toBe(0)
    })

    test('should report with deeply nested block containing single assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createBlockStatement([
            createBlockStatement([
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
              ),
            ]),
          ]),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      // The outer block has 1 item which is a BlockStatement, not an ExpressionStatement
      // So getSingleAssignment on the outer block would recurse into inner block
      expect(reports.length).toBe(1)
    })

    test('should not report when inner block has multiple items', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createBlockStatement([
            createBlockStatement([
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
              ),
              createExpressionStatement(
                createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
              ),
            ]),
          ]),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // FIX GENERATION (10 tests)
  // =========================================================================
  describe('fix generation', () => {
    test('should not include fix when nodes lack range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      // Nodes without range property should produce no fix
      expect(reports[0].fix).toBeUndefined()
    })

    test('should include fix when all nodes have range', () => {
      const source = 'if (cond) { x = 1; } else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond', range: [4, 8] },
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 1,
            range: [15, 16],
          }),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 2,
            range: [31, 32],
          }),
        ),
        range: [0, 40] as [number, number],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 40 },
        },
      }

      visitor.IfStatement(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toEqual([0, 40])
    })

    test('should generate fix text with ternary operator', () => {
      const source = 'if (cond) { x = 1; } else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond', range: [4, 8] },
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 1,
            range: [15, 16],
          }),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 2,
            range: [31, 32],
          }),
        ),
        range: [0, 40] as [number, number],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 40 },
        },
      }

      visitor.IfStatement(node)

      expect(reports[0].fix?.text).toContain('cond')
      expect(reports[0].fix?.text).toContain('?')
      expect(reports[0].fix?.text).toContain(':')
    })

    test('should generate fix text starting with variable name', () => {
      const source = 'if (cond) { x = 1; } else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond', range: [4, 8] },
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 1,
            range: [15, 16],
          }),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 2,
            range: [31, 32],
          }),
        ),
        range: [0, 40] as [number, number],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 40 },
        },
      }

      visitor.IfStatement(node)

      expect(reports[0].fix?.text).toMatch(/^x = /)
    })

    test('should not include fix when if node lacks range', () => {
      const source = 'if (cond) { x = 1; } else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond', range: [4, 8] },
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 1,
            range: [15, 16],
          }),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 2,
            range: [31, 32],
          }),
        ),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 40 },
        },
      }

      visitor.IfStatement(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not include fix when test node lacks range', () => {
      const source = 'if (cond) { x = 1; } else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 1,
            range: [15, 16],
          }),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 2,
            range: [31, 32],
          }),
        ),
        range: [0, 40] as [number, number],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 40 },
        },
      }

      visitor.IfStatement(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not include fix when consequent right lacks range', () => {
      const source = 'if (cond) { x = 1; } else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond', range: [4, 8] },
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 2,
            range: [31, 32],
          }),
        ),
        range: [0, 40] as [number, number],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 40 },
        },
      }

      visitor.IfStatement(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not include fix when alternate right lacks range', () => {
      const source = 'if (cond) { x = 1; } else { x = 2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond', range: [4, 8] },
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), {
            type: 'Literal',
            value: 1,
            range: [15, 16],
          }),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
        ),
        range: [0, 40] as [number, number],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 40 },
        },
      }

      visitor.IfStatement(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should generate fix text with variable assignment format', () => {
      const source = 'if (cond) { result = val1; } else { result = val2; }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferTernaryOperatorRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond', range: [4, 8] },
        consequent: createExpressionStatement(
          createAssignmentExpression(createIdentifier('result'), {
            type: 'Identifier',
            name: 'val1',
            range: [21, 25],
          }),
        ),
        alternate: createExpressionStatement(
          createAssignmentExpression(createIdentifier('result'), {
            type: 'Identifier',
            name: 'val2',
            range: [45, 49],
          }),
        ),
        range: [0, 52] as [number, number],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 52 },
        },
      }

      visitor.IfStatement(node)

      expect(reports[0].fix?.text).toBe('result = cond ? val1 : val2')
    })

    test('should report even when fix cannot be generated', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      // No range on any node
      visitor.IfStatement(createTernaryCandidate('x', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  // =========================================================================
  // ADDITIONAL EDGE CASES - OPERATORS AND TYPES (10 tests)
  // =========================================================================
  describe('additional operator and type variations', () => {
    test('should not report for /= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement({
            type: 'AssignmentExpression',
            operator: '/=',
            left: createIdentifier('x'),
            right: createLiteral(1),
          }),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for %= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement({
            type: 'AssignmentExpression',
            operator: '%=',
            left: createIdentifier('x'),
            right: createLiteral(1),
          }),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for **= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement({
            type: 'AssignmentExpression',
            operator: '**=',
            left: createIdentifier('x'),
            right: createLiteral(2),
          }),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(3)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for <<= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement({
            type: 'AssignmentExpression',
            operator: '<<=',
            left: createIdentifier('x'),
            right: createLiteral(1),
          }),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for >>= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement({
            type: 'AssignmentExpression',
            operator: '>>=',
            left: createIdentifier('x'),
            right: createLiteral(1),
          }),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for &= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement({
            type: 'AssignmentExpression',
            operator: '&=',
            left: createIdentifier('x'),
            right: createLiteral(1),
          }),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for |= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement({
            type: 'AssignmentExpression',
            operator: '|=',
            left: createIdentifier('x'),
            right: createLiteral(1),
          }),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for ^= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement({
            type: 'AssignmentExpression',
            operator: '^=',
            left: createIdentifier('x'),
            right: createLiteral(1),
          }),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for &&= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement({
            type: 'AssignmentExpression',
            operator: '&&=',
            left: createIdentifier('x'),
            right: createLiteral(1),
          }),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for ||= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTernaryOperatorRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createIdentifier('condition'),
          createExpressionStatement({
            type: 'AssignmentExpression',
            operator: '||=',
            left: createIdentifier('x'),
            right: createLiteral(1),
          }),
          createExpressionStatement(
            createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // RULE EXPORT DEFAULT (5 tests)
  // =========================================================================
  describe('default export', () => {
    test('should have a default export via module', async () => {
      const mod = await import('../../../../src/rules/patterns/prefer-ternary-operator.js')
      expect(mod.default).toBeDefined()
    })

    test('should have default export equal to named export', async () => {
      const mod = await import('../../../../src/rules/patterns/prefer-ternary-operator.js')
      expect(mod.default).toBe(mod.preferTernaryOperatorRule)
    })

    test('should have meta on default export', async () => {
      const mod = await import('../../../../src/rules/patterns/prefer-ternary-operator.js')
      expect(mod.default.meta).toBeDefined()
    })

    test('should have create on default export', async () => {
      const mod = await import('../../../../src/rules/patterns/prefer-ternary-operator.js')
      expect(typeof mod.default.create).toBe('function')
    })

    test('should have meta.type on default export', async () => {
      const mod = await import('../../../../src/rules/patterns/prefer-ternary-operator.js')
      expect(mod.default.meta.type).toBe('suggestion')
    })
  })
})
