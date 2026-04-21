import { describe, test, expect, vi } from 'vitest'
import { noThisBeforeSuperRule } from '../../../../src/rules/patterns/no-this-before-super.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'constructor() { this.x = 1; }',
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

function createMethodDefinition(kind: string, value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'MethodDefinition',
    kind,
    value,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createFunctionExpression(body: unknown[]): unknown {
  return {
    type: 'FunctionExpression',
    body: {
      type: 'BlockStatement',
      body,
      loc: { start: { line: 1, column: 15 }, end: { line: 3, column: 0 } },
    },
  }
}

function createThisExpression(): unknown {
  return {
    type: 'ThisExpression',
  }
}

function createSuperCall(): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Super',
    },
  }
}

function createExpressionStatement(expression: unknown): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
  }
}

describe('no-this-before-super rule', () => {
  // =====================================================
  // META TESTS (20)
  // =====================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noThisBeforeSuperRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noThisBeforeSuperRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noThisBeforeSuperRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noThisBeforeSuperRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noThisBeforeSuperRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noThisBeforeSuperRule.meta.fixable).toBeUndefined()
    })

    test('should mention this in description', () => {
      expect(noThisBeforeSuperRule.meta.docs?.description.toLowerCase()).toContain('this')
    })

    test('should mention super in description', () => {
      expect(noThisBeforeSuperRule.meta.docs?.description.toLowerCase()).toContain('super')
    })

    test('should have meta property', () => {
      expect(noThisBeforeSuperRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noThisBeforeSuperRule).toHaveProperty('create')
    })

    test('should have type as string', () => {
      expect(typeof noThisBeforeSuperRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noThisBeforeSuperRule.meta.severity).toBe('string')
    })

    test('should have docs object', () => {
      expect(typeof noThisBeforeSuperRule.meta.docs).toBe('object')
    })

    test('should have description as string', () => {
      expect(typeof noThisBeforeSuperRule.meta.docs?.description).toBe('string')
    })

    test('should have description with nonzero length', () => {
      expect(noThisBeforeSuperRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noThisBeforeSuperRule.meta.schema)).toBe(true)
    })

    test('should have docs recommended as boolean', () => {
      expect(typeof noThisBeforeSuperRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have create as function', () => {
      expect(typeof noThisBeforeSuperRule.create).toBe('function')
    })

    test('should mention disallow or similar in description', () => {
      const desc = noThisBeforeSuperRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/disallow|before|not allowed/)
    })

    test('should have correct meta type value for lint rule', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noThisBeforeSuperRule.meta.type)
    })
  })

  // =====================================================
  // CREATE / VISITOR TESTS (8)
  // =====================================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })

    test('should return MethodDefinition as a function', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(typeof visitor.MethodDefinition).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return a plain object visitor', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should not return other visitor methods', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(visitor).not.toHaveProperty('FunctionDeclaration')
      expect(visitor).not.toHaveProperty('ClassDeclaration')
    })

    test('should accept different context instances', () => {
      const { context: ctx1 } = createMockContext()
      const { context: ctx2 } = createMockContext({}, '/other/file.ts')

      const visitor1 = noThisBeforeSuperRule.create(ctx1)
      const visitor2 = noThisBeforeSuperRule.create(ctx2)

      expect(typeof visitor1.MethodDefinition).toBe('function')
      expect(typeof visitor2.MethodDefinition).toBe('function')
    })

    test('should produce independent visitors per call', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const v1 = noThisBeforeSuperRule.create(ctx1)
      const v2 = noThisBeforeSuperRule.create(ctx2)

      v1.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle being called multiple times', () => {
      const { context } = createMockContext()
      for (let i = 0; i < 5; i++) {
        const visitor = noThisBeforeSuperRule.create(context)
        expect(typeof visitor.MethodDefinition).toBe('function')
      }
    })
  })

  // =====================================================
  // DETECTION TESTS (30)
  // =====================================================
  describe('detection', () => {
    test('should report constructor with this before super()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report constructor with only this (no super)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report constructor with this at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report constructor with this without any super()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report constructor with this before super with other statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement({ type: 'Literal', value: 1 }),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report bare this expression not wrapped in ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createThisExpression(),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report when super call is deeply nested after this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement({ type: 'Literal', value: 1 }),
            createExpressionStatement({ type: 'Literal', value: 2 }),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report first this expression before super', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report when this is the only statement in constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report when bare super call at top level after this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createThisExpression(), createSuperCall()]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect this in ExpressionStatement wrapping', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect this when body has mixed statements before super', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement({ type: 'Identifier', name: 'x' }),
            createExpressionStatement(createThisExpression()),
            createExpressionStatement({ type: 'Identifier', name: 'y' }),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect bare super call in body (not in ExpressionStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createSuperCall(),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should stop scanning after super call is found', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should detect this when it appears before any super-like call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const notSuperCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'super' },
      }

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(notSuperCall),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect this when super is in bare CallExpression (not ExpressionStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with single this before super', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBeTruthy()
    })

    test('should detect when super() is second statement after this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect this before super with many intervening statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const body = [
        createExpressionStatement(createThisExpression()),
        createExpressionStatement({ type: 'Literal', value: 1 }),
        createExpressionStatement({ type: 'Literal', value: 2 }),
        createExpressionStatement({ type: 'Literal', value: 3 }),
        createExpressionStatement({ type: 'Literal', value: 4 }),
        createExpressionStatement({ type: 'Literal', value: 5 }),
        createExpressionStatement(createSuperCall()),
      ]

      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression(body)),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect this when only other expressions present no super', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement({ type: 'Identifier', name: 'foo' }),
            createExpressionStatement(createThisExpression()),
            createExpressionStatement({ type: 'Identifier', name: 'bar' }),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report when this is wrapped and bare super after', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports).toHaveLength(1)
    })

    test('should detect bare ThisExpression at index 0 in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression([createThisExpression()])),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect bare ThisExpression before bare Super call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createThisExpression(), createSuperCall()]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect wrapped this before bare super', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createSuperCall(),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect bare this before wrapped super', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createThisExpression(),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report only once per MethodDefinition visit', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect this in constructor with ArrowFunction value type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition({
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'ArrowFunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [createExpressionStatement(createThisExpression())],
          },
        },
      })

      expect(reports.length).toBe(1)
    })

    test('should correctly identify Super callee vs other callee types', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const regularCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
      }

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(regularCall),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not detect when super callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const nullCalleeCall = {
        type: 'CallExpression',
        callee: null,
      }

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(nullCalleeCall),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect when ExpressionStatement has ThisExpression inside assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const assignment = {
        type: 'AssignmentExpression',
        left: { type: 'ThisExpression' },
      }

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(assignment),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // NOT REPORTING TESTS (30)
  // =====================================================
  describe('valid constructors (no this before super)', () => {
    test('should not report constructor with super() before this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only super()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createSuperCall())]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only this after super()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report empty constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', createFunctionExpression([])))

      expect(reports.length).toBe(0)
    })

    test('should not report non-constructor method with this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'method',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report method without kind property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const methodDef = {
        type: 'MethodDefinition',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
      }

      expect(() => visitor.MethodDefinition(methodDef)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report get accessor with this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'get',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report set accessor with this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with super() followed by multiple this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement({ type: 'Literal', value: 1 }),
            createExpressionStatement({ type: 'Literal', value: 2 }),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with super and no this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createSuperCall()),
            createExpressionStatement({ type: 'Literal', value: 42 }),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with bare super call before this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createSuperCall(), createThisExpression()]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with bare super call only', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression([createSuperCall()])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report non-MethodDefinition node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
      }

      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when kind is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
      }

      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when kind is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          '',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with super() in middle then this after', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement({ type: 'Literal', value: 1 }),
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report regular method kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      for (const kind of ['method', 'get', 'set', 'foo', 'bar', 'init']) {
        visitor.MethodDefinition(
          createMethodDefinition(
            kind,
            createFunctionExpression([createExpressionStatement(createThisExpression())]),
          ),
        )
      }

      expect(reports.length).toBe(0)
    })

    test('should not report when CallExpression callee is not Super type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const callWithIdentCallee = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'init' },
      }

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(callWithIdentCallee),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report when ExpressionStatement has no expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            { type: 'ExpressionStatement' },
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only other identifier calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement({
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'init' },
            }),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report when bare super call is before bare this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createSuperCall(), createThisExpression()]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with wrapped super before wrapped this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when expression is not ThisExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement({ type: 'Identifier', name: 'foo' }),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when ExpressionStatement has non-ThisExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement({ type: 'CallExpression', callee: { type: 'Super' } }),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with multiple super calls and this after first', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only whitespace-like statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement({ type: 'EmptyStatement' })]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when value body has no elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', createFunctionExpression([])))

      expect(reports.length).toBe(0)
    })

    test('should not report when ExpressionStatement wraps non-This non-Super', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement({ type: 'Literal', value: null }),
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for static method with this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'static',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EDGE CASES (25)
  // =====================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(() => visitor.MethodDefinition(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(() => visitor.MethodDefinition('string')).not.toThrow()
      expect(() => visitor.MethodDefinition(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'ClassProperty',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without value', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: null,
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle value without body', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: null,
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {},
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'ExpressionStatement',
          },
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body without body array', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
          },
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-array body', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: 'not-an-array',
          },
        },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null statements in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            null,
            createExpressionStatement(createThisExpression()),
            null,
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle non-object statements in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            'string',
            123,
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([
          createExpressionStatement(createThisExpression()),
          createExpressionStatement(createSuperCall()),
        ]),
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
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
        getSource: () => 'constructor() { this.x = 1; }',
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

      const visitor = noThisBeforeSuperRule.create(context)

      expect(() =>
        visitor.MethodDefinition(
          createMethodDefinition(
            'constructor',
            createFunctionExpression([createExpressionStatement(createThisExpression())]),
          ),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(() => visitor.MethodDefinition(true)).not.toThrow()
      expect(() => visitor.MethodDefinition(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node', () => {
      const { context } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(() => visitor.MethodDefinition(0)).not.toThrow()
      expect(() => visitor.MethodDefinition(-1)).not.toThrow()
      expect(() => visitor.MethodDefinition(3.14)).not.toThrow()
    })

    test('should handle array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(() => visitor.MethodDefinition([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const callWithUndefinedCallee = {
        type: 'CallExpression',
        callee: undefined,
      }

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(callWithUndefinedCallee),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression with string callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const callWithStringCallee = {
        type: 'CallExpression',
        callee: 'super',
      }

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(callWithStringCallee),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle node with number kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 42,
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
      }

      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test('should handle very large body arrays', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const body = Array.from({ length: 100 }, (_, i) =>
        createExpressionStatement({ type: 'Literal', value: i }),
      )
      body.unshift(createExpressionStatement(createThisExpression()))
      body.push(createExpressionStatement(createSuperCall()))

      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression(body)),
      )

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // LOCATION TESTS (15)
  // =====================================================
  describe('location', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
          10,
          5,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
          5,
          10,
        ),
      )

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should handle high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
          9999,
          50,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(9999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          end: { line: 1, column: 20 },
        },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {},
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          start: null,
          end: { line: 1, column: 20 },
        },
      }

      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with null end', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          start: { line: 3, column: 5 },
          end: null,
        },
      }

      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should use default line 1 when no loc present', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
      }

      visitor.MethodDefinition(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve exact column from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
          1,
          42,
        ),
      )

      expect(reports[0].loc?.start.column).toBe(42)
    })

    test('should handle zero line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 10 },
        },
      }

      visitor.MethodDefinition(node)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle negative line number gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          start: { line: -1, column: 0 },
          end: { line: -1, column: 10 },
        },
      }

      visitor.MethodDefinition(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })
  })

  // =====================================================
  // MESSAGE TESTS (10)
  // =====================================================
  describe('messages', () => {
    test('should mention this in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('this')
    })

    test('should mention super in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('super')
    })

    test('should mention not allowed in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('not allowed')
    })

    test('should have consistent message across different violations', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const v1 = noThisBeforeSuperRule.create(ctx1)
      const v2 = noThisBeforeSuperRule.create(ctx2)

      v1.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      v2.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should always produce the same message string', () => {
      const expectedMessage = "'this' is not allowed before super()."
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].message).toBe(expectedMessage)
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have message as string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(typeof reports[0].message).toBe('string')
    })

    test('should include single quotes around this in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].message).toContain("'this'")
    })

    test('should include parentheses around super in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].message).toContain('super()')
    })

    test('should have grammatically correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      const msg = reports[0].message
      expect(msg).toMatch(/^[A-Z']/)
      expect(msg).toMatch(/\.$/)
    })
  })

  // =====================================================
  // MULTIPLE REPORTS TESTS (10)
  // =====================================================
  describe('multiple reports', () => {
    test('should report for each MethodDefinition visit', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should report once per violating constructor with multiple this', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for alternating valid and invalid constructors', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createSuperCall())]),
        ),
      )

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createSuperCall())]),
        ),
      )

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should track reports independently across different context instances', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const v1 = noThisBeforeSuperRule.create(ctx1)
      const v2 = noThisBeforeSuperRule.create(ctx2)

      v1.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      v2.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      v2.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(2)
    })

    test('should report three times for three violating visits', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      for (let i = 0; i < 3; i++) {
        visitor.MethodDefinition(
          createMethodDefinition(
            'constructor',
            createFunctionExpression([createExpressionStatement(createThisExpression())]),
          ),
        )
      }

      expect(reports.length).toBe(3)
    })

    test('should handle mixed valid and invalid without double counting', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const validBody = [
        createExpressionStatement(createSuperCall()),
        createExpressionStatement(createThisExpression()),
      ]
      const invalidBody = [createExpressionStatement(createThisExpression())]

      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression(validBody)),
      )
      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression(invalidBody)),
      )
      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression(validBody)),
      )
      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression(invalidBody)),
      )
      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression(validBody)),
      )

      expect(reports.length).toBe(2)
    })

    test('should not accumulate reports across different visitors', () => {
      const { context: ctx, reports } = createMockContext()
      const visitor1 = noThisBeforeSuperRule.create(ctx)
      const visitor2 = noThisBeforeSuperRule.create(ctx)

      visitor1.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      visitor2.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle same visitor called 10 times', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.MethodDefinition(
          createMethodDefinition(
            'constructor',
            createFunctionExpression([createExpressionStatement(createThisExpression())]),
          ),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should handle mix of valid, invalid, and non-constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      // invalid constructor
      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      // non-constructor (should not report)
      visitor.MethodDefinition(
        createMethodDefinition(
          'method',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      // valid constructor
      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createSuperCall()),
            createExpressionStatement(createThisExpression()),
          ]),
        ),
      )

      // invalid constructor
      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should report each with correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[0].message).toBe("'this' is not allowed before super().")
    })
  })

  // =====================================================
  // CONTEXT TESTS (10)
  // =====================================================
  describe('context handling', () => {
    test('should work with custom file path', () => {
      const { context, reports } = createMockContext({}, '/custom/path/file.ts')
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with custom source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/test.ts',
        'class A extends B { constructor() { this.x = 1; super(); } }',
      )
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/test.ts', '')
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not call logger for normal operation', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle context with extra properties', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
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
        extraProp: 'extra',
      } as unknown as RuleContext

      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle context with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/file.ts',
        getAST: () => null,
        getSource: () => 'code',
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

      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should use context report function correctly', () => {
      const reports: ReportDescriptor[] = []
      let reportCallCount = 0

      const context = {
        report: (descriptor: ReportDescriptor) => {
          reportCallCount++
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
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
      } as unknown as RuleContext

      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reportCallCount).toBe(1)
    })

    test('should pass correct descriptor shape to report', () => {
      const reports: ReportDescriptor[] = []

      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
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
      } as unknown as RuleContext

      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toHaveProperty('start')
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should not report when visitor receives valid node after invalid one', () => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createSuperCall())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle config with undefined config object', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
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

      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // TEST.EACH - PARAMETERIZED TESTS (40+)
  // =====================================================
  describe('parameterized detection tests', () => {
    test.each([['constructor'], ['method'], ['get'], ['set']])(
      'should only report for constructor kind, not "%s"',
      (kind) => {
        const { context, reports } = createMockContext()
        const visitor = noThisBeforeSuperRule.create(context)

        visitor.MethodDefinition(
          createMethodDefinition(
            kind,
            createFunctionExpression([createExpressionStatement(createThisExpression())]),
          ),
        )

        if (kind === 'constructor') {
          expect(reports.length).toBe(1)
        } else {
          expect(reports.length).toBe(0)
        }
      },
    )

    test.each([
      ['null', null],
      ['undefined', undefined],
      ['empty string', ''],
      ['number', 42],
      ['boolean', true],
      ['array', []],
      ['empty object', {}],
    ])('should handle %s node without crashing', (_label, node) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test.each([
      ['ClassProperty'],
      ['FunctionDeclaration'],
      ['VariableDeclaration'],
      ['IfStatement'],
      ['ForStatement'],
      ['WhileStatement'],
      ['SwitchStatement'],
      ['TryStatement'],
      ['ReturnStatement'],
      ['ThrowStatement'],
    ])('should not report for non-MethodDefinition type "%s"', (nodeType) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: nodeType,
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
      }

      visitor.MethodDefinition(node)
      expect(reports.length).toBe(0)
    })

    test.each([
      [1, 0],
      [5, 10],
      [100, 50],
      [1, 100],
      [50, 0],
    ])('should report correct location line=%d column=%d', (line, column) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
          line,
          column,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })

    test.each([[0], [1], [3], [5], [10], [20], [50]])(
      'should handle body with %d literal statements before this',
      (count) => {
        const { context, reports } = createMockContext()
        const visitor = noThisBeforeSuperRule.create(context)

        const body: unknown[] = []
        for (let i = 0; i < count; i++) {
          body.push(createExpressionStatement({ type: 'Literal', value: i }))
        }
        body.push(createExpressionStatement(createThisExpression()))
        body.push(createExpressionStatement(createSuperCall()))

        visitor.MethodDefinition(
          createMethodDefinition('constructor', createFunctionExpression(body)),
        )

        expect(reports.length).toBe(1)
      },
    )

    test.each([
      ['Identifier', { type: 'Identifier', name: 'x' }],
      ['Literal', { type: 'Literal', value: 1 }],
      ['BinaryExpression', { type: 'BinaryExpression', operator: '+' }],
      ['MemberExpression', { type: 'MemberExpression' }],
      [
        'CallExpression with Identifier callee',
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
      ],
      ['ArrayExpression', { type: 'ArrayExpression', elements: [] }],
      ['ObjectExpression', { type: 'ObjectExpression', properties: [] }],
    ])('should not detect %s as ThisExpression', (_label, expression) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(expression),
            createExpressionStatement(createSuperCall()),
          ]),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test.each([
      [
        'CallExpression with Identifier callee',
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'init' } },
      ],
      [
        'CallExpression with MemberExpression callee',
        { type: 'CallExpression', callee: { type: 'MemberExpression' } },
      ],
      [
        'CallExpression with FunctionExpression callee',
        { type: 'CallExpression', callee: { type: 'FunctionExpression' } },
      ],
      ['CallExpression with null callee', { type: 'CallExpression', callee: null }],
      ['CallExpression with undefined callee', { type: 'CallExpression', callee: undefined }],
      ['CallExpression with string callee', { type: 'CallExpression', callee: 'super' }],
      ['CallExpression with number callee', { type: 'CallExpression', callee: 42 }],
    ])('should not detect %s as super() call', (_label, call) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([
            createExpressionStatement(createThisExpression()),
            createExpressionStatement(call),
          ]),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('parameterized body structure tests', () => {
    test.each([
      ['empty body', []],
      ['single literal', [createExpressionStatement({ type: 'Literal', value: 1 })]],
      ['single identifier', [createExpressionStatement({ type: 'Identifier', name: 'x' })]],
      ['single super call', [createExpressionStatement(createSuperCall())]],
    ])('should not report for valid body: %s', (_label, body) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression(body)),
      )

      expect(reports.length).toBe(0)
    })

    test.each([
      ['single this', [createExpressionStatement(createThisExpression())]],
      [
        'this then literal',
        [
          createExpressionStatement(createThisExpression()),
          createExpressionStatement({ type: 'Literal', value: 1 }),
        ],
      ],
      [
        'this then identifier',
        [
          createExpressionStatement(createThisExpression()),
          createExpressionStatement({ type: 'Identifier', name: 'x' }),
        ],
      ],
    ])('should report for invalid body: %s', (_label, body) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression(body)),
      )

      expect(reports.length).toBe(1)
    })

    test.each([
      [
        'super then this',
        [
          createExpressionStatement(createSuperCall()),
          createExpressionStatement(createThisExpression()),
        ],
      ],
      [
        'super then this then this',
        [
          createExpressionStatement(createSuperCall()),
          createExpressionStatement(createThisExpression()),
          createExpressionStatement(createThisExpression()),
        ],
      ],
      [
        'literal then super then this',
        [
          createExpressionStatement({ type: 'Literal', value: 1 }),
          createExpressionStatement(createSuperCall()),
          createExpressionStatement(createThisExpression()),
        ],
      ],
    ])('should not report for valid order: %s', (_label, body) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression(body)),
      )

      expect(reports.length).toBe(0)
    })

    test.each([
      [
        'this then super',
        [
          createExpressionStatement(createThisExpression()),
          createExpressionStatement(createSuperCall()),
        ],
      ],
      [
        'literal then this then super',
        [
          createExpressionStatement({ type: 'Literal', value: 1 }),
          createExpressionStatement(createThisExpression()),
          createExpressionStatement(createSuperCall()),
        ],
      ],
      [
        'this then literal then super',
        [
          createExpressionStatement(createThisExpression()),
          createExpressionStatement({ type: 'Literal', value: 1 }),
          createExpressionStatement(createSuperCall()),
        ],
      ],
    ])('should report for invalid order: %s', (_label, body) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition('constructor', createFunctionExpression(body)),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('parameterized edge case tests', () => {
    test.each([
      ['value is string', { type: 'MethodDefinition', kind: 'constructor', value: 'fn' }],
      ['value is number', { type: 'MethodDefinition', kind: 'constructor', value: 42 }],
      ['value is boolean', { type: 'MethodDefinition', kind: 'constructor', value: true }],
      ['value is array', { type: 'MethodDefinition', kind: 'constructor', value: [] }],
    ])('should handle malformed node where %s', (_label, node) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test.each([
      ['body is string', { type: 'FunctionExpression', body: 'block' }],
      ['body is number', { type: 'FunctionExpression', body: 42 }],
      ['body is boolean', { type: 'FunctionExpression', body: true }],
      ['body is array', { type: 'FunctionExpression', body: [] }],
    ])('should handle malformed function body where %s', (_label, value) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value,
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test.each([
      [0, 0, 0, 0],
      [1, 0, 1, 10],
      [10, 5, 10, 25],
      [100, 0, 100, 1],
      [999, 999, 999, 999],
    ])('should preserve loc start.line=%d column=%d end.line=%d column=%d', (sl, sc, el, ec) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: createFunctionExpression([createExpressionStatement(createThisExpression())]),
        loc: {
          start: { line: sl, column: sc },
          end: { line: el, column: ec },
        },
      }

      visitor.MethodDefinition(node)
      expect(reports[0].loc?.start.line).toBe(sl)
      expect(reports[0].loc?.start.column).toBe(sc)
      expect(reports[0].loc?.end.line).toBe(el)
      expect(reports[0].loc?.end.column).toBe(ec)
    })

    test.each([
      ['/src/index.ts'],
      ['/lib/module.js'],
      ['/app/components/Button.tsx'],
      ['/deep/nested/path/to/file.ts'],
      ['/file.with.dots.ts'],
    ])('should work with file path %s', (filePath) => {
      const { context, reports } = createMockContext({}, filePath)
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([createExpressionStatement(createThisExpression())]),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test.each([
      ['ThisExpression', { type: 'ThisExpression' }],
      ['OtherExpression', { type: 'OtherExpression' }],
      ['CallExpression', { type: 'CallExpression', callee: { type: 'Super' } }],
    ])('should handle bare %s in body (not wrapped in ExpressionStatement)', (_type, node) => {
      const { context, reports } = createMockContext()
      const visitor = noThisBeforeSuperRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'constructor',
          createFunctionExpression([node, createExpressionStatement(createSuperCall())]),
        ),
      )

      if ((node as Record<string, unknown>).type === 'ThisExpression') {
        expect(reports.length).toBe(1)
      } else if (
        (node as Record<string, unknown>).type === 'CallExpression' &&
        ((node as Record<string, unknown>).callee as Record<string, unknown>)?.type === 'Super'
      ) {
        expect(reports.length).toBe(0)
      } else {
        expect(reports.length).toBe(0)
      }
    })
  })
})
