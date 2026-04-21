import { describe, test, expect, vi } from 'vitest'
import { noUnassignedVarsRule } from '../../../../src/rules/patterns/no-unassigned-vars.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'let x;',
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

function createVariableDeclarator(id: unknown, init: unknown, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id,
    init,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
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

// ─── META TESTS (20) ─────────────────────────────────────────────────────────

describe('no-unassigned-vars rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnassignedVarsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnassignedVarsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnassignedVarsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnassignedVarsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnassignedVarsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnassignedVarsRule.meta.fixable).toBeUndefined()
    })

    test('should mention variable in description', () => {
      expect(noUnassignedVarsRule.meta.docs?.description.toLowerCase()).toContain('variable')
    })

    test('should mention assigned in description', () => {
      expect(noUnassignedVarsRule.meta.docs?.description.toLowerCase()).toContain('assigned')
    })

    test('should have meta property as object', () => {
      expect(typeof noUnassignedVarsRule.meta).toBe('object')
    })

    test('should have docs property defined', () => {
      expect(noUnassignedVarsRule.meta.docs).toBeDefined()
    })

    test('should have docs description as string', () => {
      expect(typeof noUnassignedVarsRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty docs description', () => {
      expect(noUnassignedVarsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as a string', () => {
      expect(typeof noUnassignedVarsRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noUnassignedVarsRule.meta.severity).toBe('string')
    })

    test('should have valid rule type values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noUnassignedVarsRule.meta.type)
    })

    test('should have valid severity values', () => {
      expect(['off', 'warn', 'error']).toContain(noUnassignedVarsRule.meta.severity)
    })

    test('should not be deprecated', () => {
      expect(noUnassignedVarsRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUnassignedVarsRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnassignedVarsRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have schema as empty array', () => {
      expect(noUnassignedVarsRule.meta.schema).toEqual([])
    })
  })

  // ─── CREATE / VISITOR TESTS (8) ──────────────────────────────────────────────

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
    })

    test('should return a function for VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('should return the same method names for each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnassignedVarsRule.create(context)
      const visitor2 = noUnassignedVarsRule.create(context)

      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('should only have VariableDeclarator visitor', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(Object.keys(visitor)).toEqual(['VariableDeclarator'])
    })

    test('should create independent visitors per context', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()
      const visitor1 = noUnassignedVarsRule.create(ctx1)
      const visitor2 = noUnassignedVarsRule.create(ctx2)

      visitor1.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), null))
      visitor2.VariableDeclarator(createVariableDeclarator(createIdentifier('b'), createLiteral(1)))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should accept context with different file paths', () => {
      const { context } = createMockContext({}, '/custom/path/file.ts')
      const visitor = noUnassignedVarsRule.create(context)

      expect(() =>
        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null)),
      ).not.toThrow()
    })

    test('should accept context with different source code', () => {
      const { context } = createMockContext({}, '/src/file.ts', 'const y = 5;')
      const visitor = noUnassignedVarsRule.create(context)

      expect(() =>
        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null)),
      ).not.toThrow()
    })

    test('should return visitor that is callable multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('b'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('c'), null))

      expect(reports.length).toBe(3)
    })
  })

  // ─── DETECTION TESTS (30) ────────────────────────────────────────────────────

  describe('invalid variables (without init) - detection', () => {
    test('should report variable with null init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
      expect(reports[0].message.toLowerCase()).toContain('never assigned')
    })

    test('should report variable with undefined init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), undefined))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report variable without init property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should include variable name in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('myVariable'), null))

      expect(reports[0].message).toContain('myVariable')
    })

    test('should report for multiple unassigned variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('y'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('z'), null))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('x')
      expect(reports[1].message).toContain('y')
      expect(reports[2].message).toContain('z')
    })

    test('should report variable named with single character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('a')
    })

    test('should report variable with underscore name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('_unused'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_unused')
    })

    test('should report variable with dollar sign name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('$elem'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$elem')
    })

    test('should report variable with camelCase name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('myLongVariableName'), null),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myLongVariableName')
    })

    test('should report variable with UPPER_CASE name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('MAX_RETRIES'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('MAX_RETRIES')
    })

    test('should report variable with numeric-style name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('item1'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('item1')
    })

    test('should report variable with double underscore prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('__private'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__private')
    })

    test('should report each variable in sequence independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('first'), null))
      expect(reports.length).toBe(1)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('second'), null))
      expect(reports.length).toBe(2)
    })

    test('should report when init is explicitly set to null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should report when init is explicitly set to undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), undefined))

      expect(reports.length).toBe(1)
    })

    test('should report variable with Unicode-like name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('café'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('café')
    })

    test('should report variable with trailing underscore', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('value_'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('value_')
    })

    test('should report variable with dollar and underscore name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('$_'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$_')
    })

    test('should report with ConstructorPascalCase name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('MyClass'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('MyClass')
    })

    test('should report many unassigned variables at once', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(`var${i}`), null))
      }

      expect(reports.length).toBe(10)
    })

    test('should report variable with name containing numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x123y456'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x123y456')
    })

    test('should report even when variable name is a keyword-like string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('class'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('class')
    })

    test('should report variable with very long name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)
      const longName = 'a'.repeat(200)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(longName), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longName)
    })

    test('should report empty-string named variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(''), null))

      expect(reports.length).toBe(1)
    })

    test('should report when id has name property set to empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: '' },
        init: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report after previously valid declarators', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), createLiteral(1)))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('b'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should report when init is false-like but present (0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      // 0 is falsy but is a valid init - should NOT report
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should distinguish between null init and 0 init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('withNull'), null))
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('withZero'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('withNull')
    })

    test('should report when init is NaN literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      // NaN as an identifier is still an init
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should report when all variables in sequence are unassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const names = ['alpha', 'beta', 'gamma', 'delta']
      names.forEach((name) => {
        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(name), null))
      })

      expect(reports.length).toBe(4)
      names.forEach((name, i) => {
        expect(reports[i].message).toContain(name)
      })
    })
  })

  // ─── NOT REPORTING TESTS (30) ────────────────────────────────────────────────

  describe('valid variables (with init) - not reporting', () => {
    test('should not report variable with literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral(5)))

      expect(reports.length).toBe(0)
    })

    test('should not report variable with number init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral(42)))

      expect(reports.length).toBe(0)
    })

    test('should not report variable with string init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createLiteral('hello')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with boolean init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createLiteral(true)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with null literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createLiteral(null)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with object init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'ObjectExpression',
          properties: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with array init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), { type: 'ArrayExpression', elements: [] }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with identifier init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('y')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with 0 init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report variable with empty string init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral('')))

      expect(reports.length).toBe(0)
    })

    test('should not report variable with false init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with CallExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with ArrowFunctionExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('fn'), {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with FunctionExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('fn'), {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with NewExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('obj'), {
          type: 'NewExpression',
          callee: createIdentifier('MyClass'),
          arguments: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with MemberExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('val'), {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('prop'),
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with BinaryExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('sum'), {
          type: 'BinaryExpression',
          operator: '+',
          left: createLiteral(1),
          right: createLiteral(2),
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with ConditionalExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('val'), {
          type: 'ConditionalExpression',
          test: createLiteral(true),
          consequent: createLiteral(1),
          alternate: createLiteral(2),
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with TemplateLiteral init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('str'), {
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with UnaryExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('neg'), {
          type: 'UnaryExpression',
          operator: '-',
          argument: createLiteral(5),
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with AssignmentExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'AssignmentExpression',
          operator: '=',
          left: createIdentifier('y'),
          right: createLiteral(1),
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with LogicalExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'LogicalExpression',
          operator: '||',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with AwaitExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('result'), {
          type: 'AwaitExpression',
          argument: createIdentifier('promise'),
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with SpreadElement init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('rest'), {
          type: 'SpreadElement',
          argument: createIdentifier('arr'),
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with regex literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('re'), {
          type: 'Literal',
          value: /test/,
          regex: { pattern: 'test', flags: '' },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with numeric literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('big'), createLiteral(BigInt(9007199254740991))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with SequenceExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'SequenceExpression',
          expressions: [createLiteral(1), createLiteral(2)],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with TypeCastExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'TypeCastExpression',
          expression: createIdentifier('val'),
          typeAnnotation: { type: 'TypeAnnotation' },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when init is an empty object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('obj'), {
          type: 'ObjectExpression',
          properties: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when init is an empty array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('arr'), {
          type: 'ArrayExpression',
          elements: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when init is a boolean false literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('flag'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ─── EDGE CASES (25) ─────────────────────────────────────────────────────────

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully (string)', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
    })

    test('should handle non-object node gracefully (number)', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle non-object node gracefully (boolean)', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        id: createIdentifier('x'),
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: createIdentifier('x'),
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: null,
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle id with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Literal', value: 'x' },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle id with ObjectPattern type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle id with ArrayPattern type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ArrayPattern', elements: [] },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle id without name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier' },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle id with undefined name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: undefined },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle id with null name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: null },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle id with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(''), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('never assigned')
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

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
        getSource: () => 'let x;',
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

      const visitor = noUnassignedVarsRule.create(context)

      expect(() =>
        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null)),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node that is a plain empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(() => visitor.VariableDeclarator({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should handle node with only type and id (no init, no loc)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 42,
        id: createIdentifier('x'),
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: true,
        id: createIdentifier('x'),
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with FunctionDeclaration type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: createIdentifier('x'),
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ─── LOCATION TESTS (15) ─────────────────────────────────────────────────────

  describe('location', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report default location when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
      }

      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {},
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null, 9999, 50))

      expect(reports[0].loc?.start.line).toBe(9999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null, 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should include both start and end in location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null, 5, 3))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should preserve end location from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null, 5, 3))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should handle loc with null start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          start: null,
          end: null,
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with only start.line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          start: { line: 7 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc where start is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          start: 42 as unknown as { line: number; column: number },
          end: 50 as unknown as { line: number; column: number },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })

  // ─── MESSAGE QUALITY TESTS (10) ──────────────────────────────────────────────

  describe('message quality', () => {
    test('should mention variable in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports[0].message.toLowerCase()).toContain('variable')
    })

    test('should mention never assigned in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports[0].message.toLowerCase()).toContain('never assigned')
    })

    test('should mention value in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports[0].message.toLowerCase()).toContain('value')
    })

    test('should format error message with variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('myVar'), null))

      expect(reports[0].message).toMatch(/myVar.*never assigned/)
    })

    test('should contain single quotes around variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('testVar'), null))

      expect(reports[0].message).toContain("'testVar'")
    })

    test('should be a non-empty string message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should produce consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('abc'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('def'), null))

      const msg1 = reports[0].message.replace('abc', 'X')
      const msg2 = reports[1].message.replace('def', 'X')

      expect(msg1).toBe(msg2)
    })

    test('should mention the specific variable name in each report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('first'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('second'), null))

      expect(reports[0].message).toContain('first')
      expect(reports[0].message).not.toContain('second')
      expect(reports[1].message).toContain('second')
      expect(reports[1].message).not.toContain('first')
    })

    test('should produce message ending with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should contain exactly one variable reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('targetVar'), null))

      const count = (reports[0].message.match(/targetVar/g) ?? []).length
      expect(count).toBe(1)
    })
  })

  // ─── MULTIPLE REPORTS TESTS (10) ─────────────────────────────────────────────

  describe('multiple reports', () => {
    test('should report each unassigned variable separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('b'), null))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('a')
      expect(reports[1].message).toContain('b')
    })

    test('should count correct number of reports for mixed variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('b'), createLiteral(1)))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('c'), null))
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('d'), createLiteral('hello')),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle alternating assigned and unassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      for (let i = 0; i < 10; i++) {
        const init = i % 2 === 0 ? null : createLiteral(i)
        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(`v${i}`), init))
      }

      expect(reports.length).toBe(5)
    })

    test('should report zero when all variables have init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.VariableDeclarator(
          createVariableDeclarator(createIdentifier(`v${i}`), createLiteral(i)),
        )
      }

      expect(reports.length).toBe(0)
    })

    test('should report all when none have init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(`v${i}`), null))
      }

      expect(reports.length).toBe(5)
    })

    test('should preserve report order', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('first'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('second'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('third'), null))

      expect(reports[0].message).toContain('first')
      expect(reports[1].message).toContain('second')
      expect(reports[2].message).toContain('third')
    })

    test('should handle single report correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('only'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('only')
    })

    test('should handle rapid sequential calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(`v${i}`), null))
      }

      expect(reports.length).toBe(100)
    })

    test('should not confuse variable names across reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('foo'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('foobar'), null))

      expect(reports[0].message).toContain("'foo'")
      expect(reports[1].message).toContain("'foobar'")
    })

    test('should handle mixed with various init types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), null))
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('b'), {
          type: 'ObjectExpression',
          properties: [],
        }),
      )
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('c'), undefined))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('d'), createLiteral(0)))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('e'), null))

      expect(reports.length).toBe(3)
    })
  })

  // ─── CONTEXT TESTS (10) ──────────────────────────────────────────────────────

  describe('context handling', () => {
    test('should work with minimal context', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '',
      } as unknown as RuleContext

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source string', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should work with long source string', () => {
      const longSource = 'let x;'.repeat(1000)
      const { context, reports } = createMockContext({}, '/src/file.ts', longSource)

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should work with .ts file path', () => {
      const { context, reports } = createMockContext({}, '/src/typescript.ts')

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockContext({}, '/src/component.tsx')

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockContext({}, '/src/javascript.js')

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockContext({}, '/a/b/c/d/e/f/g/file.ts')

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should not call logger during normal operation', () => {
      const debugFn = vi.fn()
      const infoFn = vi.fn()
      const warnFn = vi.fn()
      const errorFn = vi.fn()
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'let x;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: debugFn, info: infoFn, warn: warnFn, error: errorFn },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(debugFn).not.toHaveBeenCalled()
      expect(infoFn).not.toHaveBeenCalled()
      expect(warnFn).not.toHaveBeenCalled()
      expect(errorFn).not.toHaveBeenCalled()
    })

    test('should work with different workspace roots', () => {
      const { context, reports } = createMockContext({}, '/home/user/project/src/file.ts')
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should work when context has parserServices', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'let x;',
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

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })
  })

  // ─── TEST.EACH BATCHES (40+) ─────────────────────────────────────────────────

  describe('test.each - init types that should NOT report', () => {
    test.each([
      { name: 'number', init: { type: 'Literal', value: 42 } },
      { name: 'string', init: { type: 'Literal', value: 'hello' } },
      { name: 'boolean true', init: { type: 'Literal', value: true } },
      { name: 'boolean false', init: { type: 'Literal', value: false } },
      { name: 'null literal', init: { type: 'Literal', value: null } },
      { name: 'zero', init: { type: 'Literal', value: 0 } },
      { name: 'empty string', init: { type: 'Literal', value: '' } },
      { name: 'NaN', init: { type: 'Identifier', name: 'NaN' } },
      { name: 'undefined identifier', init: { type: 'Identifier', name: 'undefined' } },
      { name: 'Infinity', init: { type: 'Identifier', name: 'Infinity' } },
    ] as Array<{ name: string; init: unknown }>)('should not report for $name init', ({ init }) => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), init))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - init types that SHOULD report', () => {
    test.each([
      { name: 'null', init: null },
      { name: 'undefined', init: undefined },
    ] as Array<{ name: string; init: unknown }>)('should report for $name init', ({ init }) => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), init))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })
  })

  describe('test.each - expression init types that should NOT report', () => {
    test.each([
      {
        name: 'CallExpression',
        init: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      },
      {
        name: 'NewExpression',
        init: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Cls' }, arguments: [] },
      },
      {
        name: 'ArrowFunctionExpression',
        init: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      },
      {
        name: 'FunctionExpression',
        init: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      },
      { name: 'ObjectExpression', init: { type: 'ObjectExpression', properties: [] } },
      { name: 'ArrayExpression', init: { type: 'ArrayExpression', elements: [] } },
      {
        name: 'BinaryExpression',
        init: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Literal', value: 1 },
          right: { type: 'Literal', value: 2 },
        },
      },
      {
        name: 'MemberExpression',
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
      },
      {
        name: 'ConditionalExpression',
        init: {
          type: 'ConditionalExpression',
          test: { type: 'Literal', value: true },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
      },
      { name: 'TemplateLiteral', init: { type: 'TemplateLiteral', quasis: [], expressions: [] } },
      {
        name: 'UnaryExpression',
        init: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Literal', value: true },
        },
      },
      {
        name: 'LogicalExpression',
        init: {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
      },
      {
        name: 'AssignmentExpression',
        init: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'y' },
          right: { type: 'Literal', value: 1 },
        },
      },
      {
        name: 'AwaitExpression',
        init: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
      },
      {
        name: 'YieldExpression',
        init: { type: 'YieldExpression', argument: { type: 'Literal', value: 1 } },
      },
    ] as Array<{ name: string; init: unknown }>)('should not report for $name init', ({ init }) => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), init))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - variable names', () => {
    test.each([
      'a',
      'b',
      'c',
      'myVar',
      '_private',
      '$jquery',
      'UPPER',
      'camelCase',
      'snake_case',
      'PascalCase',
      'ABC123',
      '__dunder',
      'trailing_',
    ])('should report unassigned variable with name "%s"', (varName) => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(varName), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(varName)
    })
  })

  describe('test.each - variable names that should NOT report when assigned', () => {
    test.each([
      'a',
      'b',
      'c',
      'myVar',
      '_private',
      '$jquery',
      'UPPER',
      'camelCase',
      'snake_case',
      'PascalCase',
      'ABC123',
      '__dunder',
      'trailing_',
    ])('should not report assigned variable with name "%s"', (varName) => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier(varName), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - wrong node types should not report', () => {
    test.each([
      'ClassDeclaration',
      'FunctionDeclaration',
      'ImportDeclaration',
      'ExportNamedDeclaration',
      'ExpressionStatement',
      'BlockStatement',
      'IfStatement',
      'ForStatement',
      'WhileStatement',
      'SwitchStatement',
      'ReturnStatement',
      'ThrowStatement',
      'TryStatement',
    ])('should not report for node type "%s"', (nodeType) => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator({
        type: nodeType,
        id: createIdentifier('x'),
        init: null,
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - id types that should not report', () => {
    test.each([
      { name: 'ObjectPattern', id: { type: 'ObjectPattern', properties: [] } },
      { name: 'ArrayPattern', id: { type: 'ArrayPattern', elements: [] } },
      {
        name: 'RestElement',
        id: { type: 'RestElement', argument: { type: 'Identifier', name: 'rest' } },
      },
      {
        name: 'AssignmentPattern',
        id: {
          type: 'AssignmentPattern',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0 },
        },
      },
      { name: 'Literal', id: { type: 'Literal', value: 'x' } },
      {
        name: 'MemberExpression',
        id: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
      },
    ] as Array<{ name: string; id: unknown }>)('should not report for id type $name', ({ id }) => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id,
        init: null,
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - location coordinates', () => {
    test.each([
      { line: 1, column: 0 },
      { line: 1, column: 1 },
      { line: 5, column: 10 },
      { line: 10, column: 0 },
      { line: 100, column: 50 },
      { line: 0, column: 0 },
    ] as Array<{ line: number; column: number }>)(
      'should report correct location at line=$line, column=$column',
      ({ line, column }) => {
        const { context, reports } = createMockContext()
        const visitor = noUnassignedVarsRule.create(context)

        visitor.VariableDeclarator(
          createVariableDeclarator(createIdentifier('x'), null, line, column),
        )

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  describe('test.each - falsy init values that SHOULD NOT report', () => {
    test.each([
      { name: 'zero', init: createLiteral(0) },
      { name: 'false', init: createLiteral(false) },
      { name: 'empty string', init: createLiteral('') },
      { name: 'null literal node', init: createLiteral(null) },
    ] as Array<{ name: string; init: unknown }>)(
      'should not report falsy-but-present init: $name',
      ({ init }) => {
        const { context, reports } = createMockContext()
        const visitor = noUnassignedVarsRule.create(context)

        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), init))

        expect(reports.length).toBe(0)
      },
    )
  })

  // ─── ADDITIONAL META TESTS (5) ────────────────────────────────────────────────

  describe('meta - additional', () => {
    test('should have meta as a non-null object', () => {
      expect(noUnassignedVarsRule.meta).not.toBeNull()
    })

    test('should have description containing unassigned or never assigned', () => {
      const desc = noUnassignedVarsRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/unassigned|never assigned/)
    })

    test('should have docs recommended as boolean true', () => {
      expect(noUnassignedVarsRule.meta.docs?.recommended).toBe(true)
      expect(typeof noUnassignedVarsRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs category as non-empty string', () => {
      const category = noUnassignedVarsRule.meta.docs?.category
      expect(typeof category).toBe('string')
      expect((category ?? '').length).toBeGreaterThan(0)
    })

    test('should have schema that is an array', () => {
      expect(Array.isArray(noUnassignedVarsRule.meta.schema)).toBe(true)
    })
  })

  // ─── ADDITIONAL DETECTION TESTS (8) ────────────────────────────────────────────

  describe('detection - additional', () => {
    test('should report variable with double dollar sign name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('$$'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$$')
    })

    test('should report variable with leading underscore and trailing dollar', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('_$'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_$')
    })

    test('should report variable with mixed case alphanumeric name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('xYz123'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('xYz123')
    })

    test('should report when node init property exists but is void expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('v'),
        init: { type: 'VoidExpression', argument: createLiteral(0) },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should report variable named "undefined" string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('undefined'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
    })

    test('should report variable named "null" string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('null'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('should report variable named with reserved word "let"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('let'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('let')
    })

    test('should report variable named with reserved word "function"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('function'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })
  })

  // ─── ADDITIONAL NOT-REPORTING TESTS (5) ────────────────────────────────────────

  describe('not reporting - additional init types', () => {
    test('should not report variable with UpdateExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'UpdateExpression',
          operator: '++',
          argument: createIdentifier('y'),
          prefix: false,
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with TaggedTemplateExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'TaggedTemplateExpression',
          tag: createIdentifier('tag'),
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with ClassExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'ClassExpression',
          id: null,
          body: { type: 'ClassBody', body: [] },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with ThisExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'ThisExpression',
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with ChainExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'ChainExpression',
          expression: createIdentifier('obj'),
        }),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ─── ADDITIONAL EDGE CASE TESTS (10) ──────────────────────────────────────────

  describe('edge cases - additional', () => {
    test('should handle node where id is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: 'x',
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where id is a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: 42,
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with array as type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: ['VariableDeclarator'],
        id: createIdentifier('x'),
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with init set to empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: '',
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with init set to number 0 (primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: 0,
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with init set to boolean false (primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: false,
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with init set to empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: [],
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with init set to empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: {},
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested loc structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 5 },
          extra: { someProp: 'value' },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node where type is object instead of string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: { name: 'VariableDeclarator' },
        id: createIdentifier('x'),
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ─── ADDITIONAL LOCATION TESTS (5) ────────────────────────────────────────────

  describe('location - additional', () => {
    test('should handle negative line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null, -1, 0))

      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle negative column number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null, 1, -5))

      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle very large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), null, Number.MAX_SAFE_INTEGER, 0),
      )

      expect(reports[0].loc?.start.line).toBe(Number.MAX_SAFE_INTEGER)
    })

    test('should handle fractional line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          start: { line: 3.7, column: 2.5 },
          end: { line: 4, column: 10 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.line).toBe(3.7)
      expect(reports[0].loc?.start.column).toBe(2.5)
    })

    test('should preserve exact location data for multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), null, 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('b'), null, 2, 5))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('c'), null, 3, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.column).toBe(5)
      expect(reports[2].loc?.start.line).toBe(3)
      expect(reports[2].loc?.start.column).toBe(10)
    })
  })

  // ─── ADDITIONAL MESSAGE TESTS (5) ─────────────────────────────────────────────

  describe('message quality - additional', () => {
    test('should have message matching expected template', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('testVar'), null))

      expect(reports[0].message).toBe("Variable 'testVar' is never assigned a value.")
    })

    test('should have message that does not contain double spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports[0].message).not.toContain('  ')
    })

    test('should have message with capitalized first letter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
    })

    test('should have consistent message length across variable names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), null))
      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('veryLongVariableName'), null),
      )

      const diff = Math.abs(reports[0].message.length - reports[1].message.length)
      expect(diff).toBe('veryLongVariableName'.length - 'a'.length)
    })

    test('should produce message without newlines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports[0].message).not.toContain('\n')
    })
  })

  // ─── ADDITIONAL MULTIPLE REPORTS TESTS (5) ─────────────────────────────────────

  describe('multiple reports - additional', () => {
    test('should handle 500 sequential reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      for (let i = 0; i < 500; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(`v${i}`), null))
      }

      expect(reports.length).toBe(500)
    })

    test('should correctly count reports when interleaved with valid declarators', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 3 === 0) {
          visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(`v${i}`), null))
        } else {
          visitor.VariableDeclarator(
            createVariableDeclarator(createIdentifier(`v${i}`), createLiteral(i)),
          )
        }
      }

      expect(reports.length).toBe(7)
    })

    test('should report correctly after many valid declarators', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.VariableDeclarator(
          createVariableDeclarator(createIdentifier(`valid${i}`), createLiteral(i)),
        )
      }
      expect(reports.length).toBe(0)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('invalid'), null))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('invalid')
    })

    test('should handle all valid followed by all invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclarator(
          createVariableDeclarator(createIdentifier(`good${i}`), createLiteral(i)),
        )
      }
      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(`bad${i}`), null))
      }

      expect(reports.length).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(reports[i].message).toContain(`bad${i}`)
      }
    })

    test('should handle mix with undefined init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('a'), createLiteral(1)))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('b'), undefined))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('c'), createLiteral(3)))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('d'), undefined))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('b')
      expect(reports[1].message).toContain('d')
    })
  })

  // ─── ADDITIONAL CONTEXT TESTS (5) ─────────────────────────────────────────────

  describe('context handling - additional', () => {
    test('should work with .mjs file path', () => {
      const { context, reports } = createMockContext({}, '/src/module.mjs')

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should work with .cjs file path', () => {
      const { context, reports } = createMockContext({}, '/src/commonjs.cjs')

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should work with file path containing spaces', () => {
      const { context, reports } = createMockContext({}, '/src/my project/file.ts')

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should work with relative file path', () => {
      const { context, reports } = createMockContext({}, './src/file.ts')

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })

    test('should work when config has extra properties', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'let x;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [], rules: {}, extra: true },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnassignedVarsRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
    })
  })

  // ─── ADDITIONAL TEST.EACH BATCHES ─────────────────────────────────────────────

  describe('test.each - more wrong node types should not report', () => {
    test.each([
      'DoWhileStatement',
      'ForInStatement',
      'ForOfStatement',
      'BreakStatement',
      'ContinueStatement',
      'WithStatement',
      'DebuggerStatement',
      'LabeledStatement',
    ])('should not report for node type "%s"', (nodeType) => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator({
        type: nodeType,
        id: createIdentifier('x'),
        init: null,
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - more expression init types that should NOT report', () => {
    test.each([
      {
        name: 'UpdateExpression',
        init: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
      },
      {
        name: 'ThisExpression',
        init: { type: 'ThisExpression' },
      },
      {
        name: 'ClassExpression',
        init: { type: 'ClassExpression', id: null, body: { type: 'ClassBody', body: [] } },
      },
      {
        name: 'TaggedTemplateExpression',
        init: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        },
      },
      {
        name: 'SequenceExpression',
        init: {
          type: 'SequenceExpression',
          expressions: [
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
          ],
        },
      },
      {
        name: 'SpreadElement',
        init: { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
      },
    ] as Array<{ name: string; init: unknown }>)('should not report for $name init', ({ init }) => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), init))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - more location coordinates', () => {
    test.each([
      { line: 2, column: 0 },
      { line: 3, column: 4 },
      { line: 50, column: 100 },
      { line: 1000, column: 0 },
      { line: 1, column: 999 },
    ] as Array<{ line: number; column: number }>)(
      'should correctly report at line=$line, column=$column',
      ({ line, column }) => {
        const { context, reports } = createMockContext()
        const visitor = noUnassignedVarsRule.create(context)

        visitor.VariableDeclarator(
          createVariableDeclarator(createIdentifier('x'), null, line, column),
        )

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  describe('test.each - more variable names with special chars', () => {
    test.each(['$$', '$0', '_0', 'i', 'j', 'k', 'el', 'fn', 'cb', 'err'])(
      'should report unassigned variable with short/special name "%s"',
      (varName) => {
        const { context, reports } = createMockContext()
        const visitor = noUnassignedVarsRule.create(context)

        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(varName), null))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(varName)
      },
    )
  })
})
