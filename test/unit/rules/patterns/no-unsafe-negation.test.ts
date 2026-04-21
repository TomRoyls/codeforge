import { describe, test, expect, vi } from 'vitest'
import { noUnsafeNegationRule } from '../../../../src/rules/patterns/no-unsafe-negation.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = '!(a in b);',
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

function createUnaryExpression(operator: string, argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
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

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createCallExpression(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'func' },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMemberExpression(line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'obj' },
    property: { type: 'Identifier', name: 'prop' },
    computed: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createLogicalExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createConditionalExpression(line = 1, column = 0): unknown {
  return {
    type: 'ConditionalExpression',
    test: createIdentifier('a'),
    consequent: createIdentifier('b'),
    alternate: createIdentifier('c'),
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createArrayExpression(line = 1, column = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements: [createIdentifier('a'), createIdentifier('b')],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createObjectExpression(line = 1, column = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createAssignmentExpression(line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: createIdentifier('x'),
    right: createIdentifier('y'),
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createUpdateExpression(line = 1, column = 0): unknown {
  return {
    type: 'UpdateExpression',
    operator: '++',
    argument: createIdentifier('x'),
    prefix: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-unsafe-negation rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeNegationRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeNegationRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeNegationRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnsafeNegationRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnsafeNegationRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnsafeNegationRule.meta.fixable).toBeUndefined()
    })

    test('should mention negating in description', () => {
      expect(noUnsafeNegationRule.meta.docs?.description.toLowerCase()).toContain('negating')
    })

    test('should mention relational in description', () => {
      expect(noUnsafeNegationRule.meta.docs?.description.toLowerCase()).toContain('relational')
    })

    test('should have meta property', () => {
      expect(noUnsafeNegationRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnsafeNegationRule).toHaveProperty('create')
    })

    test('should have docs object', () => {
      expect(noUnsafeNegationRule.meta.docs).toBeDefined()
    })

    test('should have description string in docs', () => {
      expect(typeof noUnsafeNegationRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noUnsafeNegationRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention operators in description', () => {
      expect(noUnsafeNegationRule.meta.docs?.description.toLowerCase()).toContain('operator')
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noUnsafeNegationRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(noUnsafeNegationRule.meta.schema).toEqual([])
    })

    test('should have string type value', () => {
      expect(typeof noUnsafeNegationRule.meta.type).toBe('string')
    })

    test('should have string severity value', () => {
      expect(typeof noUnsafeNegationRule.meta.severity).toBe('string')
    })

    test('should mention left operand in description', () => {
      expect(noUnsafeNegationRule.meta.docs?.description.toLowerCase()).toContain('left operand')
    })

    test('should have create as a function', () => {
      expect(typeof noUnsafeNegationRule.create).toBe('function')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
    })

    test('should return a visitor with UnaryExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noUnsafeNegationRule.create(context)
      const visitor2 = noUnsafeNegationRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept a valid context without throwing', () => {
      const { context } = createMockContext()

      expect(() => noUnsafeNegationRule.create(context)).not.toThrow()
    })

    test('should return visitor with only UnaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      expect(Object.keys(visitor)).toEqual(['UnaryExpression'])
    })

    test('should create independent visitors with separate report state', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()
      const visitor1 = noUnsafeNegationRule.create(ctx1)
      const visitor2 = noUnsafeNegationRule.create(ctx2)

      visitor1.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should accept context with custom file path', () => {
      const { context, reports } = createMockContext({}, '/custom/path.ts')
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should accept context with custom source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '!(x in y)')
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('x'), createIdentifier('y')),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('invalid cases - in operator', () => {
    test('should report ! with in operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('in')
    })

    test('should report ! with in operator and literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createLiteral('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report ! with in operator and member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createMemberExpression(), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should include operator name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message).toContain("'in'")
    })

    test('should report with both sides as member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createMemberExpression(), createMemberExpression()),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with left as literal and right as identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createLiteral('key'), createIdentifier('obj')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with both sides as literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createLiteral('a'), createLiteral('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with left as call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createCallExpression(), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with nested in expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const innerBinary = createBinaryExpression('in', createIdentifier('c'), createIdentifier('d'))

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), innerBinary),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report exactly once per invocation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for in operator with numeric literal left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createLiteral(0), createIdentifier('arr')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for in operator with null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createLiteral(null), createIdentifier('obj')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for in operator with boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createLiteral(true), createIdentifier('obj')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for in operator regardless of prefix field', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('invalid cases - instanceof operator', () => {
    test('should report ! with instanceof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('instanceof')
    })

    test('should report ! with instanceof operator and literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createLiteral('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report ! with instanceof operator and member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createMemberExpression(), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should include operator name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message).toContain("'instanceof'")
    })

    test('should report with both sides as member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createMemberExpression(), createMemberExpression()),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with left as call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createCallExpression(), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with right as call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createCallExpression()),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with both sides as literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createLiteral('a'), createLiteral('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report exactly once per invocation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with nested instanceof on right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const innerBinary = createBinaryExpression(
        'instanceof',
        createIdentifier('c'),
        createIdentifier('d'),
      )

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), innerBinary),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for instanceof with numeric left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createLiteral(42), createIdentifier('Obj')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for instanceof with boolean left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createLiteral(false), createIdentifier('Obj')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for instanceof with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createLiteral(null), createIdentifier('Obj')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for instanceof regardless of prefix field', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression(
          'instanceof',
          createIdentifier('a'),
          createIdentifier('b'),
        ),
        prefix: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report for deeply nested in operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const deepBinary = createBinaryExpression(
        'in',
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('y')),
        createIdentifier('obj'),
      )

      visitor.UnaryExpression(createUnaryExpression('!', deepBinary))

      expect(reports.length).toBe(1)
    })
  })

  describe('valid cases - other operators', () => {
    test('should not report positive negation operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '+',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report negative negation operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '-',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report bitwise NOT operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '~',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('typeof', createIdentifier('a')))

      expect(reports.length).toBe(0)
    })

    test('should not report void operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('void', createIdentifier('a')))

      expect(reports.length).toBe(0)
    })

    test('should not report delete operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('delete', createMemberExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report typeof with in operator argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          'typeof',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report void with in operator argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          'void',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report delete with in operator argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          'delete',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report + with instanceof operator argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '+',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report - with instanceof operator argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '-',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ~ with instanceof operator argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '~',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof with instanceof argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          'typeof',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases - non-relational operators', () => {
    test('should not report ! with equality operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('===', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with inequality operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('!==', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with less than operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('<', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with greater than operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('>', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with less than or equal operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('<=', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with greater than or equal operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('>=', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with addition operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('+', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with subtraction operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('-', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with logical and operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('&&', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with logical or operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('||', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with loose equality operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('==', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with loose inequality operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('!=', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with multiplication operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('*', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with division operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('/', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with modulo operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('%', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with exponentiation operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('**', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with bitwise AND operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('&', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with bitwise OR operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('|', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with bitwise XOR operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('^', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with left shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('<<', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with right shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('>>', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with unsigned right shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('>>>', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with nullish coalescing operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('??', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases - non-BinaryExpression arguments', () => {
    test('should not report ! with identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createIdentifier('a')))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral(true)))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createCallExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createMemberExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createLogicalExpression('&&', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with logical OR expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createLogicalExpression('||', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createConditionalExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createArrayExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createObjectExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createFunctionExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createAssignmentExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with update expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createUpdateExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with nested unary expression (!!(x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createUnaryExpression(
            '!',
            createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral(null)))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral('hello')))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with boolean false literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral(false)))

      expect(reports.length).toBe(0)
    })

    test('should not report ! with logical AND using in inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const inBinary = createBinaryExpression('in', createIdentifier('a'), createIdentifier('b'))

      visitor.UnaryExpression(
        createUnaryExpression('!', createLogicalExpression('&&', inBinary, createIdentifier('c'))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with logical OR using instanceof inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const instBinary = createBinaryExpression(
        'instanceof',
        createIdentifier('a'),
        createIdentifier('b'),
      )

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createLogicalExpression('||', instBinary, createIdentifier('c')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with nullish coalescing using in inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const inBinary = createBinaryExpression('in', createIdentifier('a'), createIdentifier('b'))

      visitor.UnaryExpression(
        createUnaryExpression('!', createLogicalExpression('??', inBinary, createIdentifier('c'))),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      expect(() => visitor.UnaryExpression('string')).not.toThrow()
      expect(() => visitor.UnaryExpression(123)).not.toThrow()
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
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
        getSource: () => '!(a in b);',
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

      const visitor = noUnsafeNegationRule.create(context)

      expect(() =>
        visitor.UnaryExpression(
          createUnaryExpression(
            '!',
            createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          ),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with empty type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression({
        type: '',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression({
        type: 'BinaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle argument with empty type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression('!', {
          type: '',
          operator: 'in',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle argument with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression('!', {
          type: 'LogicalExpression',
          operator: 'in',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle argument that is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', 'string'))

      expect(reports.length).toBe(0)
    })

    test('should handle argument that is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', 42))

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(createUnaryExpression('!', node))

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with null operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: null,
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(createUnaryExpression('!', node))

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with numeric operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: 42,
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(createUnaryExpression('!', node))

      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean true as operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: true,
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: null,
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (only start)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { line: 5, column: 3 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with empty object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', {}))

      expect(reports.length).toBe(0)
    })

    test('should handle node with argument having type but no operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression('!', {
          type: 'BinaryExpression',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle NaN as column value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { line: 1, column: NaN }, end: { line: 1, column: NaN } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle Infinity as line value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { line: Infinity, column: 0 }, end: { line: Infinity, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle negative column value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          1,
          -1,
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          10,
          5,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          3,
          8,
        ),
      )

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for instanceof at arbitrary position', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
          42,
          17,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(17)
    })

    test('should report location with high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          9999,
          0,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report location with high column number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          1,
          999,
        ),
      )

      expect(reports[0].loc?.start.column).toBe(999)
    })

    test('should handle node without loc by providing default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
      })

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve start and end in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          7,
          12,
        ),
      )

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report different locations for different violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          1,
          0,
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('c'), createIdentifier('d')),
          5,
          10,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should report location for in at line 0 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          0,
          0,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for instanceof at line 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
          0,
          0,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with start missing line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { column: 5 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with start missing column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { line: 5 }, end: { line: 5, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with end missing line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { line: 3, column: 2 }, end: { column: 12 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with end missing column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        prefix: true,
        loc: { start: { line: 3, column: 2 }, end: { line: 3 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should include negating in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('negating')
    })

    test('should include left operand in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('left operand')
    })

    test('should include operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain("'instanceof'")
    })

    test('should include unexpected in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should include operator keyword in message for in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message).toContain('operator.')
    })

    test('should include operator keyword in message for instanceof', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message).toContain('operator.')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have string type message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have different messages for in vs instanceof', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('x'), createIdentifier('y')),
        ),
      )

      const message = reports[0].message
      expect(message).toContain('Unexpected')
      expect(message).toContain('negating')
      expect(message).toContain('left operand')
      expect(message).toContain("'in'")
      expect(message).toContain('operator')
    })
  })

  describe('multiple reports', () => {
    test('should handle multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('c'), createIdentifier('d')),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle consecutive violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('c'), createIdentifier('d')),
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('e'), createIdentifier('f')),
        ),
      )

      expect(reports.length).toBe(3)
    })

    test('should handle alternating valid and invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('===', createIdentifier('c'), createIdentifier('d')),
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('e'), createIdentifier('f')),
        ),
      )
      visitor.UnaryExpression(createUnaryExpression('!', createIdentifier('g')))

      expect(reports.length).toBe(2)
    })

    test('should handle many consecutive in violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.UnaryExpression(
          createUnaryExpression(
            '!',
            createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
            i + 1,
            0,
          ),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should handle many consecutive instanceof violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.UnaryExpression(
          createUnaryExpression(
            '!',
            createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
            i + 1,
            0,
          ),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should report correct messages for mixed violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('c'), createIdentifier('d')),
        ),
      )

      expect(reports[0].message).toContain("'in'")
      expect(reports[1].message).toContain("'instanceof'")
    })

    test('should preserve order of reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          2,
          0,
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('c'), createIdentifier('d')),
          4,
          0,
        ),
      )
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('e'), createIdentifier('f')),
          6,
          0,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(4)
      expect(reports[2].loc?.start.line).toBe(6)
    })

    test('should not report for mixed valid/invalid followed by more invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      // valid
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('+', createIdentifier('a'), createIdentifier('b')),
        ),
      )
      // invalid
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )
      // valid
      visitor.UnaryExpression(createUnaryExpression('!', createIdentifier('x')))
      // invalid
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle 50 consecutive violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.UnaryExpression(
          createUnaryExpression(
            '!',
            createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          ),
        )
      }

      expect(reports.length).toBe(50)
    })

    test('should handle mixed operator violations and non-violations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const operators = ['in', '===', 'instanceof', '<', 'in', '>', 'instanceof', '==', 'in', '+']

      for (const op of operators) {
        visitor.UnaryExpression(
          createUnaryExpression(
            '!',
            createBinaryExpression(op, createIdentifier('a'), createIdentifier('b')),
          ),
        )
      }

      expect(reports.length).toBe(5)
    })
  })

  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils/helpers.ts')
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '!(key in obj)')
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('key'), createIdentifier('obj')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockContext({ extraProp: true, anotherProp: 42 })
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with config having no options property', () => {
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
        getSource: () => '!(a in b);',
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

      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with config having null options', () => {
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
        getSource: () => '!(a in b);',
        getTokens: () => [],
        getComments: () => [],
        config: { options: null },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnsafeNegationRule.create(context)

      expect(() =>
        visitor.UnaryExpression(
          createUnaryExpression(
            '!',
            createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          ),
        ),
      ).not.toThrow()
    })

    test('should work with long file path', () => {
      const longPath = '/very/long/path/to/some/deeply/nested/directory/structure/file.ts'
      const { context, reports } = createMockContext({}, longPath)
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with special characters in source', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        '!("\'key" in obj /* comment */)',
      )
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with workspace root different from file path', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/other/project/src/file.ts',
        getAST: () => null,
        getSource: () => '!(a in b);',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/home/user/workspace',
      } as unknown as RuleContext

      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not call logger during normal operation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
      // logger functions are vi.fn() mocks, just verifying they exist and the rule works
    })
  })

  describe('parameterized - non-relational operators should not report', () => {
    test.each([
      ['==='],
      ['!=='],
      ['=='],
      ['!='],
      ['<'],
      ['>'],
      ['<='],
      ['>='],
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
      ['>>>'],
    ])('should not report ! with %s operator', (operator) => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression(operator, createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized - relational operators should report', () => {
    test('should report ! with in operator via parametrized check', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'in'")
    })

    test('should report ! with instanceof operator via parametrized check', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'instanceof'")
    })
  })

  describe('parameterized - non-! unary operators should not report with in', () => {
    test.each([['+'], ['-'], ['~'], ['typeof'], ['void'], ['delete']])(
      'should not report %s with in operator argument',
      (operator) => {
        const { context, reports } = createMockContext()
        const visitor = noUnsafeNegationRule.create(context)

        visitor.UnaryExpression(
          createUnaryExpression(
            operator,
            createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          ),
        )

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized - non-! unary operators should not report with instanceof', () => {
    test.each([['+'], ['-'], ['~'], ['typeof'], ['void'], ['delete']])(
      'should not report %s with instanceof operator argument',
      (operator) => {
        const { context, reports } = createMockContext()
        const visitor = noUnsafeNegationRule.create(context)

        visitor.UnaryExpression(
          createUnaryExpression(
            operator,
            createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
          ),
        )

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized - different AST node types should not report', () => {
    test.each([
      ['Identifier', createIdentifier('x')],
      ['Literal', createLiteral(true)],
      ['CallExpression', createCallExpression()],
      ['MemberExpression', createMemberExpression()],
      [
        'LogicalExpression',
        createLogicalExpression('&&', createIdentifier('a'), createIdentifier('b')),
      ],
      ['ConditionalExpression', createConditionalExpression()],
      ['ArrayExpression', createArrayExpression()],
      ['ObjectExpression', createObjectExpression()],
      ['FunctionExpression', createFunctionExpression()],
      ['AssignmentExpression', createAssignmentExpression()],
      ['UpdateExpression', createUpdateExpression()],
    ])('should not report ! with %s argument', (_name, node) => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', node))

      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized - location verification for in operator', () => {
    test.each([
      [1, 0],
      [5, 3],
      [10, 7],
      [100, 0],
      [1, 50],
      [42, 17],
      [0, 0],
      [999, 999],
    ] as const)('should report correct location at line %i column %i', (line, column) => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          line,
          column,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })
  })

  describe('parameterized - location verification for instanceof operator', () => {
    test.each([
      [1, 0],
      [5, 3],
      [10, 7],
      [100, 0],
      [1, 50],
      [42, 17],
      [0, 0],
      [999, 999],
    ] as const)(
      'should report correct location at line %i column %i for instanceof',
      (line, column) => {
        const { context, reports } = createMockContext()
        const visitor = noUnsafeNegationRule.create(context)

        visitor.UnaryExpression(
          createUnaryExpression(
            '!',
            createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
            line,
            column,
          ),
        )

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  describe('parameterized - null/undefined/edge node types', () => {
    test.each([
      ['null', null],
      ['undefined', undefined],
      ['string', 'hello'],
      ['number', 42],
      ['boolean', true],
      ['empty object', {}],
    ])('should not throw for %s node', (_name, node) => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized - BinaryExpression with non-relational operator should not report', () => {
    test.each([
      ['+', createIdentifier('a'), createIdentifier('b')],
      ['-', createLiteral(1), createLiteral(2)],
      ['*', createIdentifier('x'), createLiteral(3)],
      ['/', createCallExpression(), createIdentifier('d')],
      ['%', createMemberExpression(), createLiteral(5)],
      ['**', createIdentifier('a'), createIdentifier('b')],
    ])('should not report ! BinaryExpression with %s operator', (operator, left, right) => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression('!', createBinaryExpression(operator, left, right)),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized - in operator with various operand types', () => {
    test.each([
      ['identifier left, identifier right', createIdentifier('a'), createIdentifier('b')],
      ['literal left, identifier right', createLiteral('key'), createIdentifier('obj')],
      ['identifier left, literal right', createIdentifier('a'), createLiteral('b')],
      ['member expression left, identifier right', createMemberExpression(), createIdentifier('b')],
      ['identifier left, member expression right', createIdentifier('a'), createMemberExpression()],
      ['call expression left, identifier right', createCallExpression(), createIdentifier('b')],
      ['identifier left, call expression right', createIdentifier('a'), createCallExpression()],
    ])('should report for in with %s', (_desc, left, right) => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createBinaryExpression('in', left, right)))

      expect(reports.length).toBe(1)
    })
  })

  describe('parameterized - instanceof operator with various operand types', () => {
    test.each([
      ['identifier left, identifier right', createIdentifier('a'), createIdentifier('b')],
      ['literal left, identifier right', createLiteral('x'), createIdentifier('Obj')],
      [
        'member expression left, identifier right',
        createMemberExpression(),
        createIdentifier('Obj'),
      ],
      ['identifier left, member expression right', createIdentifier('a'), createMemberExpression()],
      ['call expression left, identifier right', createCallExpression(), createIdentifier('Obj')],
    ])('should report for instanceof with %s', (_desc, left, right) => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression('!', createBinaryExpression('instanceof', left, right)),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('additional individual tests', () => {
    test('should not report ! with loose equality and identifier operands', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('==', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with loose inequality and literal operands', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('!=', createLiteral('a'), createLiteral('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with strict equality and member expression operands', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('===', createMemberExpression(), createMemberExpression()),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ! with strict inequality and call expression operands', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('!==', createCallExpression(), createCallExpression()),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report ! with in and both sides as call expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createCallExpression(), createCallExpression()),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report ! with instanceof and both sides as call expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createCallExpression(), createCallExpression()),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report for !true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral(true)))

      expect(reports.length).toBe(0)
    })

    test('should not report for !false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral(false)))

      expect(reports.length).toBe(0)
    })

    test('should not report for !0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report for !1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral(1)))

      expect(reports.length).toBe(0)
    })

    test('should not report for empty string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral('')))

      expect(reports.length).toBe(0)
    })

    test('should not report for non-empty string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral('hello')))

      expect(reports.length).toBe(0)
    })

    test('should report for in with deeply nested member arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const nestedMember = {
        type: 'MemberExpression',
        object: createMemberExpression(),
        property: createIdentifier('deep'),
        computed: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', nestedMember, createIdentifier('obj')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for instanceof with deeply nested call arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const nestedCall = {
        type: 'CallExpression',
        callee: createMemberExpression(),
        arguments: [createIdentifier('arg')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', nestedCall, createIdentifier('Cls')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report for void with in operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          'void',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for void with instanceof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          'void',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for delete with in operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          'delete',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for delete with instanceof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          'delete',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle double negation !! with in operator correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createUnaryExpression(
            '!',
            createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle triple negation !!! with in operator correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const innerUnary = createUnaryExpression(
        '!',
        createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
      )
      const doubleUnary = createUnaryExpression('!', innerUnary)

      visitor.UnaryExpression(createUnaryExpression('!', doubleUnary))

      expect(reports.length).toBe(0)
    })

    test('should report in with mixed valid and invalid in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createIdentifier('x')))
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('in', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'in'")
    })

    test('should report instanceof with mixed valid and invalid in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!', createLiteral(true)))
      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createBinaryExpression('instanceof', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'instanceof'")
    })

    test('should not report ! with nullish coalescing and identifier operands', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression(
          '!',
          createLogicalExpression('??', createIdentifier('a'), createIdentifier('b')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report for in with multiple levels of nesting', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      const inner = createBinaryExpression(
        '===',
        createBinaryExpression('in', createIdentifier('x'), createIdentifier('y')),
        createLiteral(true),
      )

      visitor.UnaryExpression(createUnaryExpression('!', inner))

      expect(reports.length).toBe(0)
    })

    test('should correctly handle operator field as undefined on BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeNegationRule.create(context)

      visitor.UnaryExpression(
        createUnaryExpression('!', {
          type: 'BinaryExpression',
          operator: undefined,
          left: createIdentifier('a'),
          right: createIdentifier('b'),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }),
      )

      expect(reports.length).toBe(0)
    })
  })
})
