import { describe, test, expect, vi } from 'vitest'
import { noSequencesRule } from '../../../../src/rules/patterns/no-sequences.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'a, b, c',
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
    config: { rules: { 'no-sequences': ['error', options] } },
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

// Factory functions for creating AST nodes
function createSequenceExpression(expressions: unknown[], lineNumber = 1, column = 0): unknown {
  return {
    type: 'SequenceExpression',
    expressions,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 50 },
    },
  }
}

function createLiteral(value: unknown): unknown {
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

function createCallExpression(callee: unknown): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
  }
}

function createBinaryExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
  }
}

function createAssignmentExpression(left: unknown, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
  }
}

function createConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
  }
}

function createLogicalExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'LogicalExpression',
    left,
    operator,
    right,
  }
}

function createUpdateExpression(argument: unknown, operator: string): unknown {
  return {
    type: 'UpdateExpression',
    operator,
    argument,
    prefix: false,
  }
}

function createNewExpression(callee: unknown): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: [],
  }
}

function createAwaitExpression(argument: unknown): unknown {
  return {
    type: 'AwaitExpression',
    argument,
  }
}

function createTemplateLiteral(): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: [],
    expressions: [],
  }
}

function createArrayExpression(elements: unknown[]): unknown {
  return {
    type: 'ArrayExpression',
    elements,
  }
}

function createObjectExpression(): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
  }
}

function createFunctionExpression(): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createArrowFunctionExpression(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    id: null,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    expression: false,
  }
}

describe('no-sequences rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noSequencesRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noSequencesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noSequencesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSequencesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noSequencesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noSequencesRule.meta.fixable).toBeUndefined()
    })

    test('should mention comma in description', () => {
      const desc = noSequencesRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('comma')
    })

    test('should mention sequence in description', () => {
      const desc = noSequencesRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('sequence')
    })

    test('should have empty schema array', () => {
      expect(noSequencesRule.meta.schema).toEqual([])
    })

    test('should have documentation URL', () => {
      expect(noSequencesRule.meta.docs?.url).toBe('https://codeforge.dev/docs/rules/no-sequences')
    })

    test('should mention confusing in description', () => {
      const desc = noSequencesRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('confusing')
    })

    test('should mention bugs in description', () => {
      const desc = noSequencesRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('bug')
    })

    test('should have a description string', () => {
      expect(typeof noSequencesRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noSequencesRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs property defined', () => {
      expect(noSequencesRule.meta.docs).toBeDefined()
    })

    test('should not be deprecated', () => {
      expect(noSequencesRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noSequencesRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noSequencesRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have type as valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noSequencesRule.meta.type)
    })

    test('should have severity as valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noSequencesRule.meta.severity)
    })

    test('should have valid documentation URL format', () => {
      const url = noSequencesRule.meta.docs?.url
      expect(url).toMatch(/^https:\/\//)
    })
  })

  describe('create', () => {
    test('should return visitor object with SequenceExpression method', () => {
      const { context } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(visitor).toHaveProperty('SequenceExpression')
      expect(typeof visitor.SequenceExpression).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return a plain object', () => {
      const { context } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should have exactly one key in visitor', () => {
      const { context } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(1)
    })

    test('should have SequenceExpression as the only key', () => {
      const { context } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(Object.keys(visitor)).toEqual(['SequenceExpression'])
    })

    test('should create independent visitors for each context', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const visitor1 = noSequencesRule.create(ctx1)
      const visitor2 = noSequencesRule.create(ctx2)

      visitor1.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))
      visitor2.SequenceExpression(createSequenceExpression([createLiteral(3), createLiteral(4)]))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })

    test('should create visitor that does not share report state', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const visitor1 = noSequencesRule.create(ctx1)
      const visitor2 = noSequencesRule.create(ctx2)

      visitor1.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))
      // ctx2 reports should be empty
      expect(r2.length).toBe(0)
    })

    test('should accept context with different file paths', () => {
      const { context } = createMockContext({}, '/custom/path.ts')
      const visitor = noSequencesRule.create(context)

      expect(visitor).toHaveProperty('SequenceExpression')
    })
  })

  describe('detecting sequence expressions', () => {
    test('should report sequence expression with 2 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence expression with 3 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2), createLiteral(3)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence expression with many expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createIdentifier('a'),
        createIdentifier('b'),
        createIdentifier('c'),
        createIdentifier('d'),
        createIdentifier('e'),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct message for sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports[0].message).toContain('comma')
    })

    test('should report sequence with mixed expression types', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createCallExpression(createIdentifier('foo')),
        createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
        createIdentifier('x'),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with exactly 2 identifier expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createIdentifier('x'), createIdentifier('y')])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with 10 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const exprs = Array.from({ length: 10 }, (_, i) => createIdentifier(`v${i}`))
      const node = createSequenceExpression(exprs)
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with 20 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const exprs = Array.from({ length: 20 }, (_, i) => createLiteral(i))
      const node = createSequenceExpression(exprs)
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with call and identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createCallExpression(createIdentifier('fn')),
        createIdentifier('result'),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with assignment expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        createAssignmentExpression(createIdentifier('y'), createLiteral(2)),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createMemberExpression(createIdentifier('obj'), createIdentifier('a')),
        createMemberExpression(createIdentifier('obj'), createIdentifier('b')),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with conditional expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createConditionalExpression(createIdentifier('x'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with unary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createUnaryExpression('!', createIdentifier('x')),
        createIdentifier('y'),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with logical expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createLogicalExpression(createIdentifier('a'), '&&', createIdentifier('b')),
        createLiteral(true),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with update expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createUpdateExpression(createIdentifier('i'), '++'),
        createIdentifier('i'),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with new expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createNewExpression(createIdentifier('Foo')),
        createIdentifier('instance'),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with await expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createAwaitExpression(createIdentifier('promise1')),
        createAwaitExpression(createIdentifier('promise2')),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with template literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createTemplateLiteral(), createLiteral('x')])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with array expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createArrayExpression([createLiteral(1)]),
        createLiteral(2),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with object expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createObjectExpression(), createLiteral(1)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createFunctionExpression(), createLiteral(null)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with arrow function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createArrowFunctionExpression(), createLiteral(42)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report deeply nested sequence in expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createSequenceExpression([createLiteral(1), createLiteral(2)]),
        createLiteral(3),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with string literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral('hello'), createLiteral('world')])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with boolean literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(true), createLiteral(false)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with null and undefined literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(null), createIdentifier('undefined')])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with numeric literal and identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(0), createIdentifier('x')])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with float literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(3.14), createLiteral(2.71)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with regex literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        { type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } },
        createLiteral('str'),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with negative number literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(-1), createLiteral(-2)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('NOT reporting', () => {
    test('should not report sequence expression with 1 expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report sequence expression with 0 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report sequence expression with undefined expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression' }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for non-SequenceExpression node types', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'Literal', value: 42 }
      // Only SequenceExpression visitor is called; other types won't match
      expect(visitor).toHaveProperty('SequenceExpression')
      expect(reports.length).toBe(0)
    })

    test('should not report for single literal expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report for single identifier expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createIdentifier('onlyOne')]))

      expect(reports.length).toBe(0)
    })

    test('should not report for single call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createCallExpression(createIdentifier('fn'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for single binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createBinaryExpression(createLiteral(1), '+', createLiteral(2))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for single assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for single member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([
          createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for single conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([
          createConditionalExpression(createIdentifier('x'), createLiteral(1), createLiteral(2)),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for single unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createUnaryExpression('!', createIdentifier('x'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for single logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([
          createLogicalExpression(createIdentifier('a'), '||', createIdentifier('b')),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for single update expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createUpdateExpression(createIdentifier('i'), '++')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for single new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createNewExpression(createIdentifier('Constructor'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for single await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createAwaitExpression(createIdentifier('promise'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for single template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createTemplateLiteral()]))

      expect(reports.length).toBe(0)
    })

    test('should not report for single array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createArrayExpression([createLiteral(1), createLiteral(2)])]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for single object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createObjectExpression()]))

      expect(reports.length).toBe(0)
    })

    test('should not report for single function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createFunctionExpression()]))

      expect(reports.length).toBe(0)
    })

    test('should not report for single arrow function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createArrowFunctionExpression()]))

      expect(reports.length).toBe(0)
    })

    test('should not report when expressions is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression', expressions: [] }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when called with a number node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(42)

      expect(reports.length).toBe(0)
    })

    test('should not report when called with a string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression('not a node')

      expect(reports.length).toBe(0)
    })

    test('should not report when called with a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(true)

      expect(reports.length).toBe(0)
    })

    test('should not report for deeply nested single expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const inner = createSequenceExpression([createLiteral(1)])
      visitor.SequenceExpression(inner)

      expect(reports.length).toBe(0)
    })

    test('should not report when expressions has length exactly 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression', expressions: [createLiteral(1)] }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for plain object with no expressions key', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression({})

      expect(reports.length).toBe(0)
    })

    test('should not report for NaN value as node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(Number.NaN)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(() => visitor.SequenceExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(() => visitor.SequenceExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(() => visitor.SequenceExpression('string')).not.toThrow()
      expect(() => visitor.SequenceExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { expressions: [createLiteral(1), createLiteral(2)] }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with null expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression', expressions: null }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle expressions as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression', expressions: 'not-an-array' }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined rule config', () => {
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
        getSource: () => 'a, b, c',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: {} },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSequencesRule.create(context)
      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle expressions array with null elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), null])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle expressions array with undefined elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), undefined])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle expressions as a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression', expressions: 42 }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle expressions as boolean true', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression', expressions: true }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle expressions as an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression', expressions: { length: 2 } }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with only loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = {
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        expressions: [createLiteral(1), createLiteral(2)],
      }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = {
        type: 'SequenceExpression',
        expressions: [createLiteral(1), createLiteral(2)],
        extra: { parenthesized: true },
        parent: { type: 'ExpressionStatement' },
      }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = {
        type: 'SequenceExpression',
        expressions: [createLiteral(1), createLiteral(2)],
        range: [0, 10],
      }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle expressions as sparse array with length > 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const sparse: unknown[] = []
      sparse[0] = createLiteral(1)
      sparse[3] = createLiteral(4)
      visitor.SequenceExpression(createSequenceExpression(sparse))

      expect(reports.length).toBe(1)
    })

    test('should handle node frozen with Object.freeze', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = Object.freeze({
        type: 'SequenceExpression',
        expressions: Object.freeze([createLiteral(1), createLiteral(2)]),
        loc: Object.freeze({
          start: Object.freeze({ line: 1, column: 0 }),
          end: Object.freeze({ line: 1, column: 10 }),
        }),
      })
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node sealed with Object.seal', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = Object.seal({
        type: 'SequenceExpression',
        expressions: [createLiteral(1), createLiteral(2)],
      })
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with Symbol properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const sym = Symbol('test')
      const node = {
        type: 'SequenceExpression',
        expressions: [createLiteral(1), createLiteral(2)],
        [sym]: 'symbol-value',
      }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle repeated calls on the same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.SequenceExpression(
          createSequenceExpression([createLiteral(i), createLiteral(i + 1)]),
        )
      }

      expect(reports.length).toBe(100)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)], 10, 5)
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)], 5, 10)
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for multiple sequence expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node1 = createSequenceExpression([createLiteral(1), createLiteral(2)], 1, 0)
      const node2 = createSequenceExpression([createLiteral(3), createLiteral(4)], 5, 10)
      const node3 = createSequenceExpression([createLiteral(5), createLiteral(6)], 10, 20)

      visitor.SequenceExpression(node1)
      visitor.SequenceExpression(node2)
      visitor.SequenceExpression(node3)

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should report correct start column for each report', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createLiteral(1), createLiteral(2)], 1, 0),
      )
      visitor.SequenceExpression(
        createSequenceExpression([createLiteral(3), createLiteral(4)], 1, 20),
      )

      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.column).toBe(20)
    })

    test('should report location with line 1 and column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = {
        type: 'SequenceExpression',
        expressions: [createLiteral(1), createLiteral(2)],
      }
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct end location from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)], 3, 7)
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(50)
    })

    test('should handle location at high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)], 9999, 0)
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle location at high column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)], 1, 500)
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle location at line 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)], 0, 0)
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location even when node has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = {
        type: 'SequenceExpression',
        expressions: [createLiteral(1), createLiteral(2)],
        loc: { start: { line: 42, column: 10 }, end: { line: 42, column: 30 } },
        range: [100, 130],
      }
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { expressions: [createLiteral(1), createLiteral(2)] }
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle multi-line location spans', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = {
        type: 'SequenceExpression',
        expressions: [createLiteral(1), createLiteral(2)],
        loc: {
          start: { line: 5, column: 0 },
          end: { line: 8, column: 15 },
        },
      }
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('should handle node with partial loc - only start', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = {
        expressions: [createLiteral(1), createLiteral(2)],
        loc: { start: { line: 7, column: 3 } },
      }
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle node with loc.start having string values gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = {
        type: 'SequenceExpression',
        expressions: [createLiteral(1), createLiteral(2)],
        loc: {
          start: { line: 'bad', column: 'bad' },
          end: { line: 'bad', column: 'bad' },
        },
      }
      visitor.SequenceExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('messages', () => {
    test('should mention comma operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('comma')
    })

    test('should mention sequence in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('sequence')
    })

    test('should mention unexpected in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node1 = createSequenceExpression([createIdentifier('a'), createIdentifier('b')])
      const node2 = createSequenceExpression([createLiteral(1), createLiteral(2), createLiteral(3)])

      visitor.SequenceExpression(node1)
      visitor.SequenceExpression(node2)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should always report the same message regardless of expression count', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))
      visitor.SequenceExpression(
        createSequenceExpression([
          createLiteral(1),
          createLiteral(2),
          createLiteral(3),
          createLiteral(4),
          createLiteral(5),
        ]),
      )

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should always report the same message regardless of expression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createIdentifier('a'), createIdentifier('b')]),
      )
      visitor.SequenceExpression(
        createSequenceExpression([createCallExpression(createIdentifier('fn')), createLiteral(42)]),
      )

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should have a non-empty message string', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should end message with a period', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should not contain placeholder tokens in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
      expect(reports[0].message).not.toContain('${')
    })

    test('should mention operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports[0].message.toLowerCase()).toContain('operator')
    })
  })

  describe('multiple reports', () => {
    test('should report each sequence expression independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))
      visitor.SequenceExpression(createSequenceExpression([createLiteral(3), createLiteral(4)]))
      visitor.SequenceExpression(createSequenceExpression([createLiteral(5), createLiteral(6)]))

      expect(reports.length).toBe(3)
    })

    test('should only report sequences with > 1 expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      // Single expression - no report
      visitor.SequenceExpression(createSequenceExpression([createLiteral(1)]))

      // Two expressions - report
      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      // Single expression - no report
      visitor.SequenceExpression(createSequenceExpression([createIdentifier('x')]))

      // Three expressions - report
      visitor.SequenceExpression(
        createSequenceExpression([createLiteral(1), createLiteral(2), createLiteral(3)]),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle mixed valid and invalid sequence expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      // Valid: empty
      visitor.SequenceExpression(createSequenceExpression([]))

      // Invalid: 2 expressions
      visitor.SequenceExpression(
        createSequenceExpression([createIdentifier('a'), createIdentifier('b')]),
      )

      // Valid: 1 expression
      visitor.SequenceExpression(createSequenceExpression([createIdentifier('x')]))

      // Invalid: 3 expressions
      visitor.SequenceExpression(
        createSequenceExpression([
          createCallExpression(createIdentifier('fn')),
          createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
          createIdentifier('result'),
        ]),
      )

      expect(reports.length).toBe(2)
    })

    test('should report 5 sequence expressions correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.SequenceExpression(
          createSequenceExpression([createLiteral(i), createLiteral(i + 1)]),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should report 50 sequence expressions correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.SequenceExpression(
          createSequenceExpression([createLiteral(i), createLiteral(i + 1)]),
        )
      }

      expect(reports.length).toBe(50)
    })

    test('should interleave valid and invalid correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      // valid: 0 exprs
      visitor.SequenceExpression(createSequenceExpression([]))
      // invalid: 2 exprs
      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))
      // valid: 1 expr
      visitor.SequenceExpression(createSequenceExpression([createLiteral(3)]))
      // invalid: 2 exprs
      visitor.SequenceExpression(createSequenceExpression([createLiteral(4), createLiteral(5)]))
      // valid: 0 exprs
      visitor.SequenceExpression(createSequenceExpression([]))

      expect(reports.length).toBe(2)
    })

    test('should maintain correct order of reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createLiteral(1), createLiteral(2)], 2, 0),
      )
      visitor.SequenceExpression(
        createSequenceExpression([createLiteral(3), createLiteral(4)], 4, 0),
      )
      visitor.SequenceExpression(
        createSequenceExpression([createLiteral(5), createLiteral(6)], 6, 0),
      )

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(4)
      expect(reports[2].loc?.start.line).toBe(6)
    })

    test('should handle alternating valid and invalid nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(null)
      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))
      visitor.SequenceExpression(undefined)
      visitor.SequenceExpression(createSequenceExpression([createLiteral(3), createLiteral(4)]))
      visitor.SequenceExpression(createSequenceExpression([createLiteral(5)]))

      expect(reports.length).toBe(2)
    })

    test('should track each report with correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))
      visitor.SequenceExpression(createSequenceExpression([createLiteral(3), createLiteral(4)]))

      expect(reports[0].message).toContain('comma')
      expect(reports[1].message).toContain('comma')
    })

    test('should handle same node reported multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(1), createLiteral(2)])
      visitor.SequenceExpression(node)
      visitor.SequenceExpression(node)
      visitor.SequenceExpression(node)

      // Each call triggers a report, even for the same node
      expect(reports.length).toBe(3)
    })
  })

  describe('context', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'x, y, z')
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createIdentifier('x'), createIdentifier('y')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/empty.ts', '')
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(1)
    })

    test('should work with long file path', () => {
      const longPath =
        '/very/long/path/that/goes/on/and/on/and/on/src/components/deep/nested/file.ts'
      const { context, reports } = createMockContext({}, longPath)
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(1)
    })

    test('should work with special characters in file path', () => {
      const { context, reports } = createMockContext({}, '/src/[special]/file.test.ts')
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(1)
    })

    test('should work with config containing other rules', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'a, b',
        getTokens: () => [],
        getComments: () => [],
        config: {
          rules: {
            'no-sequences': ['error'],
            'no-eval': ['warn'],
            'prefer-const': ['error'],
          },
        },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSequencesRule.create(context)
      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(1)
    })

    test('should work with config containing empty rule config array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'a, b',
        getTokens: () => [],
        getComments: () => [],
        config: {
          rules: {
            'no-sequences': ['error'],
          },
        },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSequencesRule.create(context)
      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(1)
    })

    test('should work when getAST returns a non-null value', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => ({ type: 'Program', body: [] }),
        getSource: () => 'a, b',
        getTokens: () => [{ type: 'Punctuator', value: ',' }],
        getComments: () => [],
        config: { rules: { 'no-sequences': ['error'] } },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSequencesRule.create(context)
      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(1)
    })

    test('should not call logger during normal operation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(1)
      // Logger is available but the rule does not use it
      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
    })

    test('should work with parserServices in context', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'a, b',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-sequences': ['error'] } },
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

      const visitor = noSequencesRule.create(context)
      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(1)
    })
  })

  describe('expression types in sequences', () => {
    test('should report sequence with identifier expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createIdentifier('foo'), createIdentifier('bar')])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with literal expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral('string'), createLiteral(42)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with call expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createCallExpression(createIdentifier('foo')),
        createCallExpression(createIdentifier('bar')),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with binary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
        createBinaryExpression(createLiteral(3), '*', createLiteral(4)),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence with mixed expression types', () => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createIdentifier('x'),
        createLiteral(42),
        createCallExpression(createIdentifier('fn')),
        createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - expression count boundaries', () => {
    test.each([
      [0, false],
      [1, false],
      [2, true],
      [3, true],
      [4, true],
      [5, true],
      [6, true],
      [7, true],
      [8, true],
      [9, true],
      [10, true],
    ] as const)('expressions.length = %i should report = %s', (count, shouldReport) => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const exprs = Array.from({ length: count }, (_, i) => createLiteral(i))
      visitor.SequenceExpression(createSequenceExpression(exprs))

      expect(reports.length).toBe(shouldReport ? 1 : 0)
    })
  })

  describe('test.each - various expression type pairs', () => {
    test.each([
      ['identifier + identifier', [createIdentifier('a'), createIdentifier('b')]],
      ['literal + literal', [createLiteral(1), createLiteral(2)]],
      ['identifier + literal', [createIdentifier('x'), createLiteral(42)]],
      ['literal + identifier', [createLiteral(0), createIdentifier('y')]],
      ['call + identifier', [createCallExpression(createIdentifier('fn')), createIdentifier('r')]],
      ['identifier + call', [createIdentifier('x'), createCallExpression(createIdentifier('fn'))]],
      [
        'binary + literal',
        [createBinaryExpression(createLiteral(1), '+', createLiteral(2)), createLiteral(3)],
      ],
      [
        'assignment + identifier',
        [
          createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
          createIdentifier('y'),
        ],
      ],
      [
        'member + literal',
        [createMemberExpression(createIdentifier('o'), createIdentifier('p')), createLiteral(1)],
      ],
      [
        'conditional + literal',
        [
          createConditionalExpression(createIdentifier('c'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ],
      ],
      [
        'unary + identifier',
        [createUnaryExpression('!', createIdentifier('x')), createIdentifier('y')],
      ],
      [
        'logical + literal',
        [
          createLogicalExpression(createIdentifier('a'), '&&', createIdentifier('b')),
          createLiteral(1),
        ],
      ],
      [
        'update + identifier',
        [createUpdateExpression(createIdentifier('i'), '++'), createIdentifier('j')],
      ],
      [
        'new + identifier',
        [createNewExpression(createIdentifier('Cls')), createIdentifier('inst')],
      ],
      [
        'await + await',
        [
          createAwaitExpression(createIdentifier('p1')),
          createAwaitExpression(createIdentifier('p2')),
        ],
      ],
      ['template + literal', [createTemplateLiteral(), createLiteral('x')]],
      ['array + literal', [createArrayExpression([createLiteral(1)]), createLiteral(2)]],
      ['object + literal', [createObjectExpression(), createLiteral(1)]],
      ['function + null', [createFunctionExpression(), createLiteral(null)]],
      ['arrow + number', [createArrowFunctionExpression(), createLiteral(42)]],
    ] as const)('should report sequence with %s', (_name, expressions) => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([...expressions]))

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - line number preservation', () => {
    test.each([
      [1, 0],
      [1, 10],
      [5, 0],
      [10, 5],
      [100, 0],
      [100, 50],
      [1, 999],
    ] as const)('should preserve location line=%i column=%i', (line, column) => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(
        createSequenceExpression([createLiteral(1), createLiteral(2)], line, column),
      )

      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })
  })

  describe('test.each - falsy node inputs', () => {
    test.each([
      ['null', null],
      ['undefined', undefined],
      ['empty string', ''],
      ['false', false],
      ['0', 0],
      ['NaN', Number.NaN],
    ] as const)('should not report and not throw for input: %s', (_name, input) => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      expect(() => visitor.SequenceExpression(input)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - single expression of various types', () => {
    test.each([
      ['Literal', createLiteral(42)],
      ['Identifier', createIdentifier('x')],
      ['CallExpression', createCallExpression(createIdentifier('fn'))],
      ['BinaryExpression', createBinaryExpression(createLiteral(1), '+', createLiteral(2))],
      ['AssignmentExpression', createAssignmentExpression(createIdentifier('x'), createLiteral(1))],
      [
        'MemberExpression',
        createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
      ],
      [
        'ConditionalExpression',
        createConditionalExpression(createIdentifier('c'), createLiteral(1), createLiteral(2)),
      ],
      ['UnaryExpression', createUnaryExpression('!', createIdentifier('x'))],
      [
        'LogicalExpression',
        createLogicalExpression(createIdentifier('a'), '||', createIdentifier('b')),
      ],
      ['UpdateExpression', createUpdateExpression(createIdentifier('i'), '++')],
      ['NewExpression', createNewExpression(createIdentifier('Constructor'))],
      ['AwaitExpression', createAwaitExpression(createIdentifier('promise'))],
    ] as const)('should NOT report single %s', (_name, expr) => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([expr]))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - single expression of various types that SHOULD report with pairs', () => {
    test.each([
      ['Literal', createLiteral(42)],
      ['Identifier', createIdentifier('x')],
      ['CallExpression', createCallExpression(createIdentifier('fn'))],
      ['BinaryExpression', createBinaryExpression(createLiteral(1), '+', createLiteral(2))],
      ['AssignmentExpression', createAssignmentExpression(createIdentifier('x'), createLiteral(1))],
      [
        'MemberExpression',
        createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
      ],
      [
        'ConditionalExpression',
        createConditionalExpression(createIdentifier('c'), createLiteral(1), createLiteral(2)),
      ],
      ['UnaryExpression', createUnaryExpression('!', createIdentifier('x'))],
      [
        'LogicalExpression',
        createLogicalExpression(createIdentifier('a'), '||', createIdentifier('b')),
      ],
      ['UpdateExpression', createUpdateExpression(createIdentifier('i'), '++')],
      ['NewExpression', createNewExpression(createIdentifier('Constructor'))],
      ['AwaitExpression', createAwaitExpression(createIdentifier('promise'))],
    ] as const)('should report pair of %s', (_name, expr) => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([expr, createLiteral(0)]))

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - meta property checks', () => {
    test.each([
      ['type', 'problem'],
      ['severity', 'warn'],
    ] as const)('meta.%s should be %s', (prop, value) => {
      expect(noSequencesRule.meta[prop]).toBe(value)
    })

    test.each([
      ['category', 'patterns'],
      ['recommended', true],
    ] as const)('meta.docs.%s should be %s', (prop, value) => {
      expect((noSequencesRule.meta.docs as Record<string, unknown>)[prop]).toBe(value)
    })
  })

  describe('test.each - expressions as non-standard values', () => {
    test.each([
      ['string', 'not-array', true],
      ['number', 42, false],
      ['boolean', true, false],
      ['object with length', { length: 2 }, true],
      ['empty object', {}, false],
    ] as const)('expressions = %s should report = %s', (_name, expressionsValue, shouldReport) => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = { type: 'SequenceExpression', expressions: expressionsValue }
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(shouldReport ? 1 : 0)
    })
  })

  describe('test.each - binary operators in sequences', () => {
    test.each([
      ['+'],
      ['-'],
      ['*'],
      ['/'],
      ['%'],
      ['**'],
      ['&'],
      ['|'],
      ['^'],
      ['<<'],
      ['>>'],
    ] as const)('should report sequence with binary %s operator', (operator) => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([
        createBinaryExpression(createLiteral(1), operator, createLiteral(2)),
        createLiteral(3),
      ])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - logical operators in sequences', () => {
    test.each([['&&'], ['||'], ['??']] as const)(
      'should report sequence with logical %s operator',
      (operator) => {
        const { context, reports } = createMockContext()
        const visitor = noSequencesRule.create(context)

        const node = createSequenceExpression([
          createLogicalExpression(createIdentifier('a'), operator, createIdentifier('b')),
          createIdentifier('c'),
        ])
        visitor.SequenceExpression(node)

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('test.each - unary operators in sequences', () => {
    test.each([['!'], ['~'], ['-'], ['+'], ['typeof'], ['void'], ['delete']] as const)(
      'should report sequence with unary %s operator',
      (operator) => {
        const { context, reports } = createMockContext()
        const visitor = noSequencesRule.create(context)

        const node = createSequenceExpression([
          createUnaryExpression(operator, createIdentifier('x')),
          createIdentifier('y'),
        ])
        visitor.SequenceExpression(node)

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('test.each - update operators in sequences', () => {
    test.each([['++'], ['--']] as const)(
      'should report sequence with update %s operator',
      (operator) => {
        const { context, reports } = createMockContext()
        const visitor = noSequencesRule.create(context)

        const node = createSequenceExpression([
          createUpdateExpression(createIdentifier('i'), operator),
          createIdentifier('i'),
        ])
        visitor.SequenceExpression(node)

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('test.each - literal value types in sequences', () => {
    test.each([
      ['number', 42],
      ['string', 'hello'],
      ['boolean true', true],
      ['boolean false', false],
      ['null', null],
    ] as const)('should report sequence with %s literal', (_name, value) => {
      const { context, reports } = createMockContext()
      const visitor = noSequencesRule.create(context)

      const node = createSequenceExpression([createLiteral(value), createLiteral(0)])
      visitor.SequenceExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - message content checks', () => {
    test.each([['comma'], ['sequence'], ['unexpected'], ['operator']] as const)(
      'message should contain word: %s',
      (word) => {
        const { context, reports } = createMockContext()
        const visitor = noSequencesRule.create(context)

        visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

        expect(reports[0].message.toLowerCase()).toContain(word)
      },
    )
  })

  describe('test.each - file path variations', () => {
    test.each([
      ['/src/file.ts'],
      ['/project/index.js'],
      ['/a/b/c/d/e.tsx'],
      ['/root.test.ts'],
      ['C:\\project\\file.ts'],
    ] as const)('should work with file path: %s', (filePath) => {
      const { context, reports } = createMockContext({}, filePath)
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - source code variations', () => {
    test.each([
      ['a, b'],
      ['x = 1, y = 2'],
      ['foo(), bar(), baz'],
      ['1, 2, 3, 4, 5'],
      ['(a, b)'],
    ] as const)('should work with source: %s', (source) => {
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noSequencesRule.create(context)

      visitor.SequenceExpression(createSequenceExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(1)
    })
  })
})
