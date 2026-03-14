import { describe, test, expect, vi } from 'vitest'
import { noParamReassignRule } from '../../../../src/rules/patterns/no-param-reassign.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'function foo(x) { x = 1; }',
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

function createAssignmentExpression(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createFunctionDeclaration(params: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    params,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionExpression(params: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createArrowFunctionExpression(params: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('no-param-reassign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noParamReassignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noParamReassignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noParamReassignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noParamReassignRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noParamReassignRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noParamReassignRule.meta.fixable).toBeUndefined()
    })

    test('should mention parameter in description', () => {
      expect(noParamReassignRule.meta.docs?.description.toLowerCase()).toContain('parameter')
    })

    test('should mention reassignment in description', () => {
      expect(noParamReassignRule.meta.docs?.description.toLowerCase()).toContain('reassign')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(visitor).toHaveProperty('AssignmentExpression')
    })
  })

  describe('parameter tracking in FunctionDeclaration', () => {
    test('should track parameters in function declaration', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      const funcDecl = createFunctionDeclaration([createIdentifier('x')])

      visitor.FunctionDeclaration(funcDecl)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should track multiple parameters', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      const funcDecl = createFunctionDeclaration([
        createIdentifier('x'),
        createIdentifier('y'),
        createIdentifier('z'),
      ])

      visitor.FunctionDeclaration(funcDecl)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })
  })

  describe('parameter tracking in FunctionExpression', () => {
    test('should track parameters in function expression', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      const funcExpr = createFunctionExpression([createIdentifier('x')])

      visitor.FunctionExpression(funcExpr)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should track multiple parameters in function expression', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      const funcExpr = createFunctionExpression([createIdentifier('a'), createIdentifier('b')])

      visitor.FunctionExpression(funcExpr)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })
  })

  describe('parameter tracking in ArrowFunctionExpression', () => {
    test('should track parameters in arrow function', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      const arrowFunc = createArrowFunctionExpression([createIdentifier('x')])

      visitor.ArrowFunctionExpression(arrowFunc)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should track multiple parameters in arrow function', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      const arrowFunc = createArrowFunctionExpression([
        createIdentifier('a'),
        createIdentifier('b'),
      ])

      visitor.ArrowFunctionExpression(arrowFunc)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })
  })

  describe('reporting direct parameter reassignment', () => {
    test('should report assignment to parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
      expect(reports[0].message).toContain('parameter')
    })

    test('should report with correct message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('myParam')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myParam'), { type: 'Literal', value: 42 }),
      )

      expect(reports[0].message).toBe("Reassignment of function parameter 'myParam'.")
    })

    test('should not report assignment to non-parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should report multiple parameter reassignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createIdentifier('x'), createIdentifier('y')]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 3 }),
      )

      expect(reports.length).toBe(2)
    })

    test('should report assignment to parameter with underscores', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('my_param')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('my_param'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('my_param')
    })

    test('should report assignment to parameter with dollar signs', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('$param')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$param'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$param')
    })
  })

  describe('reporting parameter property mutation', () => {
    test('should report parameter property assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('obj')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
          { type: 'Literal', value: 2 },
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('obj')
      expect(reports[0].message).toContain('parameter')
    })

    test('should report multiple property mutations on same parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('obj')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('prop1')),
          { type: 'Literal', value: 1 },
        ),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('prop2')),
          { type: 'Literal', value: 2 },
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should not report property mutation on non-parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('y'), createIdentifier('prop')),
          { type: 'Literal', value: 2 },
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('compound assignments', () => {
    test('should not report += assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '+=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report -= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '-=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report *= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '*=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report /= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '/=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node in FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle null node in FunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionExpression(null)).not.toThrow()
    })

    test('should handle undefined node in FunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
    })

    test('should handle null node in ArrowFunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
    })

    test('should handle undefined node in ArrowFunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
    })

    test('should handle null node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node in FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
    })

    test('should handle non-object node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(() => visitor.AssignmentExpression(123)).not.toThrow()
    })

    test('should handle node without loc in FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle node without loc in AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty params array', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      const funcDecl = createFunctionDeclaration([])
      expect(() => visitor.FunctionDeclaration(funcDecl)).not.toThrow()
    })

    test('should handle params without identifier', () => {
      const { context } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      const funcDecl = createFunctionDeclaration([{ type: 'Literal', value: 1 }])
      expect(() => visitor.FunctionDeclaration(funcDecl)).not.toThrow()
    })

    test('should handle assignment without identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 2 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 10, 5),
          { type: 'Literal', value: 2 },
          10,
          5,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
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
        getSource: () => 'function foo(x) { x = 1; }',
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

      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      expect(() =>
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle assignment before parameter declaration order', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should include parameter in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message.toLowerCase()).toContain('parameter')
    })

    test('should include parameter name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('testParam')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('testParam'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message).toContain('testParam')
    })

    test('should use word reassignment in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message.toLowerCase()).toContain('reassignment')
    })

    test('should use word function in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message.toLowerCase()).toContain('function')
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {},
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
