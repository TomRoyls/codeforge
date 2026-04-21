import { describe, test, expect, vi } from 'vitest'
import { noUselessConcatRule } from '../../../../src/rules/patterns/no-useless-concat.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const s = "" + str;',
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

function createBinaryExpression(
  operator: string,
  left: unknown,
  right: unknown,
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createEmptyStringLiteral(): unknown {
  return {
    type: 'Literal',
    value: '',
  }
}

function createNonEmptyStringLiteral(value: string): unknown {
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

function createNumericLiteral(value: number): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createBooleanLiteral(value: boolean): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createNullLiteral(): unknown {
  return {
    type: 'Literal',
    value: null,
  }
}

function createTemplateLiteral(): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: [],
    expressions: [],
  }
}

function createCallExpression(calleeName: string): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [],
  }
}

function createMemberExpression(): unknown {
  return {
    type: 'MemberExpression',
    object: createIdentifier('obj'),
    property: createIdentifier('prop'),
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
  }
}

function createArrayExpression(): unknown {
  return {
    type: 'ArrayExpression',
    elements: [],
  }
}

function createObjectExpression(): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
  }
}

function createConditionalExpression(): unknown {
  return {
    type: 'ConditionalExpression',
    test: createIdentifier('cond'),
    consequent: createIdentifier('a'),
    alternate: createIdentifier('b'),
  }
}

function createFunctionExpression(): unknown {
  return {
    type: 'FunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createArrowFunctionExpression(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
    expression: false,
  }
}

function createAssignmentExpression(): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: createIdentifier('x'),
    right: createIdentifier('y'),
  }
}

function createLogicalExpression(operator: string): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left: createIdentifier('a'),
    right: createIdentifier('b'),
  }
}

function createNewExpression(): unknown {
  return {
    type: 'NewExpression',
    callee: createIdentifier('MyClass'),
    arguments: [],
  }
}

function createSequenceExpression(): unknown {
  return {
    type: 'SequenceExpression',
    expressions: [createIdentifier('a'), createIdentifier('b')],
  }
}

function createAwaitExpression(): unknown {
  return {
    type: 'AwaitExpression',
    argument: createIdentifier('promise'),
  }
}

function createUpdateExpression(): unknown {
  return {
    type: 'UpdateExpression',
    operator: '++',
    argument: createIdentifier('x'),
    prefix: true,
  }
}

describe('no-useless-concat rule', () => {
  // --- Meta Properties ---
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUselessConcatRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noUselessConcatRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUselessConcatRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessConcatRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUselessConcatRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUselessConcatRule.meta.fixable).toBeUndefined()
    })

    test('should mention concatenation in description', () => {
      expect(noUselessConcatRule.meta.docs?.description.toLowerCase()).toContain('concatenat')
    })

    test('should mention empty string in description', () => {
      expect(noUselessConcatRule.meta.docs?.description.toLowerCase()).toContain('empty string')
    })

    test('should have a meta property', () => {
      expect(noUselessConcatRule).toHaveProperty('meta')
    })

    test('should have a create method', () => {
      expect(noUselessConcatRule).toHaveProperty('create')
      expect(typeof noUselessConcatRule.create).toBe('function')
    })

    test('should have docs object', () => {
      expect(noUselessConcatRule.meta.docs).toBeDefined()
      expect(typeof noUselessConcatRule.meta.docs).toBe('object')
    })

    test('should have description string in docs', () => {
      expect(typeof noUselessConcatRule.meta.docs?.description).toBe('string')
      expect(noUselessConcatRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have a url in docs', () => {
      expect(noUselessConcatRule.meta.docs?.url).toBeDefined()
      expect(typeof noUselessConcatRule.meta.docs?.url).toBe('string')
    })

    test('should reference no-useless-concat in the url', () => {
      expect(noUselessConcatRule.meta.docs?.url).toContain('no-useless-concat')
    })

    test('should not be deprecated', () => {
      expect(noUselessConcatRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUselessConcatRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUselessConcatRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have type as one of valid rule types', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(noUselessConcatRule.meta.type)
    })

    test('should have severity as one of valid severities', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(noUselessConcatRule.meta.severity)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noUselessConcatRule.meta.schema)).toBe(true)
    })
  })

  // --- Create / Visitor ---
  describe('create', () => {
    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return a function for BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should not return undefined from create', () => {
      const { context } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noUselessConcatRule.create(context)
      const visitor2 = noUselessConcatRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with different file paths', () => {
      const { context } = createMockContext({}, '/src/other.ts')
      const visitor = noUselessConcatRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should accept context with different source code', () => {
      const { context } = createMockContext({}, '/src/file.ts', 'x + ""')
      const visitor = noUselessConcatRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should work with empty options', () => {
      const { context } = createMockContext({})
      const visitor = noUselessConcatRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  // --- Detection: Empty String Left ---
  describe('detecting empty string concat on left', () => {
    test('should report when left operand is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + variable pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('myVar'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + number pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createNumericLiteral(42))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + boolean pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createBooleanLiteral(true),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + call expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createCallExpression('fn'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + member expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createMemberExpression())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + template literal pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createTemplateLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + unary expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createUnaryExpression('-', createIdentifier('x')),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + array expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createArrayExpression())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + conditional expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createConditionalExpression(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + new expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createNewExpression())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + function expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createFunctionExpression(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + arrow function pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createArrowFunctionExpression(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + nested binary expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const innerBinary = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))
      const node = createBinaryExpression('+', createEmptyStringLiteral(), innerBinary)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + object expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createObjectExpression())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + update expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createUpdateExpression())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + await expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createAwaitExpression())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + sequence expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createSequenceExpression(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + assignment expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createAssignmentExpression(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + logical expression pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createLogicalExpression('||'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // --- Detection: Empty String Right ---
  describe('detecting empty string concat on right', () => {
    test('should report when right operand is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('str'), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report variable + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createIdentifier('myVar'),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report number + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createNumericLiteral(42), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report boolean + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createBooleanLiteral(false),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report call expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createCallExpression('fn'),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report member expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createMemberExpression(), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createTemplateLiteral(), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report unary expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createUnaryExpression('!', createIdentifier('x')),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report array expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createArrayExpression(), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report conditional expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createConditionalExpression(),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createNewExpression(), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report function expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createFunctionExpression(),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arrow function + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createArrowFunctionExpression(),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report nested binary expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const innerBinary = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))
      const node = createBinaryExpression('+', innerBinary, createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report object expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createObjectExpression(), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report update expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createUpdateExpression(), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report await expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createAwaitExpression(), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report sequence expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createSequenceExpression(),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report assignment expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createAssignmentExpression(),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report logical expression + "" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createLogicalExpression('&&'),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // --- Valid Concatenations ---
  describe('allowing valid concatenations', () => {
    test('should not report when both operands are non-empty strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('hello'),
        createNonEmptyStringLiteral('world'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when concatenating non-empty string with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('hello '),
        createIdentifier('name'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when concatenating variable with non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createIdentifier('name'),
        createNonEmptyStringLiteral('!'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when concatenating two variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when concatenating number literal with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createNumericLiteral(42), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when concatenating variable with number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createNumericLiteral(42))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when concatenating two number literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createNumericLiteral(1), createNumericLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is non-empty string and right is number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('count: '),
        createNumericLiteral(5),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is number and right is non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNumericLiteral(5),
        createNonEmptyStringLiteral(' items'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when concatenating boolean with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createBooleanLiteral(true), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when concatenating variable with boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createBooleanLiteral(false))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is non-empty string and right is call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('result: '),
        createCallExpression('getValue'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is call expression and right is non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createCallExpression('getValue'),
        createNonEmptyStringLiteral(' suffix'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when both sides are member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createMemberExpression(), createMemberExpression())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when both sides are call expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createCallExpression('fn1'),
        createCallExpression('fn2'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is non-empty single character string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('a'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right is non-empty single character string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createIdentifier('x'),
        createNonEmptyStringLiteral('b'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is non-empty string with spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('   '),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right is non-empty string with spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createIdentifier('x'),
        createNonEmptyStringLiteral('   '),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is non-empty string with special chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('\n'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right is non-empty string with tab', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createIdentifier('x'),
        createNonEmptyStringLiteral('\t'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is non-empty unicode string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('你好'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is non-empty emoji string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('🎉'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is non-empty string and right is template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('prefix: '),
        createTemplateLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when both sides are non-empty long strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('a'.repeat(1000)),
        createNonEmptyStringLiteral('b'.repeat(1000)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is conditional expression and right is variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createConditionalExpression(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is array expression and right is variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createArrayExpression(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is object expression and right is variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createObjectExpression(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is unary expression and right is variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createUnaryExpression('!', createIdentifier('x')),
        createIdentifier('y'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is new expression and right is variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createNewExpression(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // --- Non-Plus Operators ---
  describe('non-plus operators', () => {
    const nonPlusOperators = [
      '-',
      '*',
      '/',
      '%',
      '**',
      '===',
      '!==',
      '==',
      '!=',
      '<',
      '>',
      '<=',
      '>=',
      '<<',
      '>>',
      '>>>',
      '&',
      '|',
      '^',
      'in',
      'instanceof',
    ]

    test('should not report for minus operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('-', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for multiply operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('*', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for division operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('/', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for strict equality operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for less than operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('<', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for remainder operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('%', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for exponentiation operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('**', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for strict inequality operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createEmptyStringLiteral(),
        createIdentifier('str'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for loose equality operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('==', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for loose inequality operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('!=', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for greater than operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('>', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for less than or equal operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('<=', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for greater than or equal operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('>=', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for left shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('<<', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for right shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('>>', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for unsigned right shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '>>>',
        createEmptyStringLiteral(),
        createIdentifier('str'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for bitwise AND operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('&', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for bitwise OR operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('|', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for bitwise XOR operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('^', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for in operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('in', createEmptyStringLiteral(), createIdentifier('obj'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for instanceof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        'instanceof',
        createEmptyStringLiteral(),
        createIdentifier('MyClass'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for minus operator even with empty string left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('-', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for minus operator even with empty string right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('-', createIdentifier('str'), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for multiply operator even with empty string left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('*', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for division operator even with empty string right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('/', createIdentifier('str'), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for strict equality with empty string on both sides', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '===',
        createEmptyStringLiteral(),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for less than with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('<', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for greater than with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('>', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for bitwise AND with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('&', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for remainder with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('%', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for exponentiation with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('**', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // --- Edge Cases ---
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        operator: '+',
        left: createEmptyStringLiteral(),
        right: createIdentifier('str'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        operator: '+',
        left: createEmptyStringLiteral(),
        right: createIdentifier('str'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle missing operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createEmptyStringLiteral(),
        right: createIdentifier('str'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle missing left operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        right: createIdentifier('str'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle missing right operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createEmptyStringLiteral(),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle null left operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', null, createIdentifier('str'))

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null right operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('str'), null)

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle literal that is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        { type: 'Literal', value: 0 },
        createIdentifier('str'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle literal with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        { type: 'Literal', value: null },
        createIdentifier('str'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle literal without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', { type: 'Literal' }, createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty string on both sides', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty string left with boolean right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createBooleanLiteral(true),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle boolean left with empty string right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createBooleanLiteral(false),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty string left with null literal right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createNullLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle null literal left with empty string right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createNullLiteral(), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty string left with number zero right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createNumericLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle number zero left with empty string right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createNumericLiteral(0), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle NaN left with empty string right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        { type: 'Identifier', name: 'NaN' },
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty string left with undefined identifier right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), {
        type: 'Identifier',
        name: 'undefined',
      })

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty string left with nested binary on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const inner = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))
      const node = createBinaryExpression('+', createEmptyStringLiteral(), inner)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested empty string concat', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const inner = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('x'))
      const outer = createBinaryExpression('+', inner, createIdentifier('y'))

      visitor.BinaryExpression(inner)
      visitor.BinaryExpression(outer)

      expect(reports.length).toBe(1)
    })

    test('should handle node that is a plain empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      expect(() => visitor.BinaryExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // --- Location Reporting ---
  describe('location reporting', () => {
    test('should include location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
        { start: { line: 10, column: 5 }, end: { line: 10, column: 20 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct start line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
        { start: { line: 42, column: 0 }, end: { line: 42, column: 10 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
        { start: { line: 1, column: 15 }, end: { line: 1, column: 30 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
        { start: { line: 1, column: 0 }, end: { line: 5, column: 0 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
        { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report location for right-side empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createIdentifier('str'),
        createEmptyStringLiteral(),
        { start: { line: 7, column: 3 }, end: { line: 7, column: 15 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location for both-sides empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createEmptyStringLiteral(),
        { start: { line: 3, column: 8 }, end: { line: 3, column: 16 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should handle zero line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
        { start: { line: 0, column: 0 }, end: { line: 0, column: 10 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
        { start: { line: 99999, column: 0 }, end: { line: 99999, column: 10 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle large column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
        { start: { line: 1, column: 99999 }, end: { line: 1, column: 100010 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle multiline expression location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
        { start: { line: 5, column: 10 }, end: { line: 8, column: 15 } },
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createEmptyStringLiteral(),
        right: createIdentifier('str'),
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should provide default location when loc is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createEmptyStringLiteral(),
        right: createIdentifier('str'),
        loc: null,
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should provide default location when loc is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createEmptyStringLiteral(),
        right: createIdentifier('str'),
        loc: undefined,
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc).toBeDefined()
    })

    test('should provide default location when loc has missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createEmptyStringLiteral(),
        right: createIdentifier('str'),
        loc: {},
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // --- Message Quality ---
  describe('message quality', () => {
    test('should mention useless in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('useless')
    })

    test('should mention concatenation in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('concatenat')
    })

    test('should mention empty string in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('empty string')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should be the same message for left and right empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const nodeLeft = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
      )
      const nodeRight = createBinaryExpression(
        '+',
        createIdentifier('str'),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(nodeLeft)
      visitor.BinaryExpression(nodeRight)

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should start with "Unexpected" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should be consistent across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node1 = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('a'))
      const node2 = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('b'))

      visitor.BinaryExpression(node1)
      visitor.BinaryExpression(node2)

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should have message that is a string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have message ending with a period', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should have message from right-side empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('str'), createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('useless')
      expect(reports[0].message.toLowerCase()).toContain('concatenat')
      expect(reports[0].message.toLowerCase()).toContain('empty string')
    })
  })

  // --- Multiple Reports ---
  describe('multiple violations', () => {
    test('should report multiple useless concatenations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node1 = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str1'),
      )
      const node2 = createBinaryExpression(
        '+',
        createIdentifier('str2'),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node1)
      visitor.BinaryExpression(node2)

      expect(reports.length).toBe(2)
    })

    test('should report three left-side violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      for (let i = 0; i < 3; i++) {
        const node = createBinaryExpression(
          '+',
          createEmptyStringLiteral(),
          createIdentifier(`str${i}`),
        )
        visitor.BinaryExpression(node)
      }

      expect(reports.length).toBe(3)
    })

    test('should report three right-side violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      for (let i = 0; i < 3; i++) {
        const node = createBinaryExpression(
          '+',
          createIdentifier(`str${i}`),
          createEmptyStringLiteral(),
        )
        visitor.BinaryExpression(node)
      }

      expect(reports.length).toBe(3)
    })

    test('should report five mixed violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      for (let i = 0; i < 5; i++) {
        const leftEmpty = i % 2 === 0
        const node = createBinaryExpression(
          '+',
          leftEmpty ? createEmptyStringLiteral() : createIdentifier(`a${i}`),
          leftEmpty ? createIdentifier(`b${i}`) : createEmptyStringLiteral(),
        )
        visitor.BinaryExpression(node)
      }

      expect(reports.length).toBe(5)
    })

    test('should report each violation with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node1 = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('a'), {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 10 },
      })
      const node2 = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('b'), {
        start: { line: 2, column: 5 },
        end: { line: 2, column: 15 },
      })

      visitor.BinaryExpression(node1)
      visitor.BinaryExpression(node2)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })

    test('should not report when mixing valid and invalid expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const invalid = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
      )
      const valid = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral('hello'),
        createIdentifier('str'),
      )

      visitor.BinaryExpression(invalid)
      visitor.BinaryExpression(valid)

      expect(reports.length).toBe(1)
    })

    test('should report ten violations in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      for (let i = 0; i < 10; i++) {
        const node = createBinaryExpression(
          '+',
          createEmptyStringLiteral(),
          createIdentifier(`x${i}`),
        )
        visitor.BinaryExpression(node)
      }

      expect(reports.length).toBe(10)
    })

    test('should report double empty string as one violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createEmptyStringLiteral(),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report only invalid among many valid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      for (let i = 0; i < 9; i++) {
        const node = createBinaryExpression(
          '+',
          createNonEmptyStringLiteral(`prefix${i}`),
          createIdentifier(`suffix${i}`),
        )
        visitor.BinaryExpression(node)
      }

      const invalidNode = createBinaryExpression(
        '+',
        createEmptyStringLiteral(),
        createIdentifier('str'),
      )
      visitor.BinaryExpression(invalidNode)

      expect(reports.length).toBe(1)
    })

    test('should handle alternating valid and invalid expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      for (let i = 0; i < 6; i++) {
        const isEmpty = i % 2 === 0
        const node = createBinaryExpression(
          '+',
          isEmpty ? createEmptyStringLiteral() : createNonEmptyStringLiteral('x'),
          createIdentifier(`v${i}`),
        )
        visitor.BinaryExpression(node)
      }

      expect(reports.length).toBe(3)
    })
  })

  // --- Context Variations ---
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/src/components/App.tsx')
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const x = "" + y')
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockContext({}, '/src/index.js')
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with .jsx file extension', () => {
      const { context, reports } = createMockContext({}, '/src/App.jsx')
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockContext({}, '/src/App.tsx')
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with deep file path', () => {
      const { context, reports } = createMockContext({}, '/very/deep/nested/path/to/module/file.ts')
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with config options', () => {
      const { context, reports } = createMockContext({ someOption: true })
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with empty config options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/project/src/file.ts',
        getAST: () => null,
        getSource: () => '"" + x',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noUselessConcatRule.create(context)
      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with minimal source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // --- Data-Driven Tests ---
  describe('test.each - operators that should not trigger reports', () => {
    test.each([
      { op: '-', name: 'minus' },
      { op: '*', name: 'multiply' },
      { op: '/', name: 'division' },
      { op: '%', name: 'remainder' },
      { op: '**', name: 'exponentiation' },
      { op: '===', name: 'strict equality' },
      { op: '!==', name: 'strict inequality' },
      { op: '==', name: 'loose equality' },
      { op: '!=', name: 'loose inequality' },
      { op: '<', name: 'less than' },
      { op: '>', name: 'greater than' },
      { op: '<=', name: 'less or equal' },
      { op: '>=', name: 'greater or equal' },
      { op: '<<', name: 'left shift' },
      { op: '>>', name: 'right shift' },
      { op: '>>>', name: 'unsigned right shift' },
      { op: '&', name: 'bitwise AND' },
      { op: '|', name: 'bitwise OR' },
      { op: '^', name: 'bitwise XOR' },
      { op: 'in', name: 'in' },
      { op: 'instanceof', name: 'instanceof' },
    ])('should not report for $name operator ($op) with empty string left', ({ op }) => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(op, createEmptyStringLiteral(), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - plus operator should report with various right operands', () => {
    test.each([
      { rightType: 'Identifier', right: createIdentifier('x'), desc: 'identifier' },
      { rightType: 'NumericLiteral', right: createNumericLiteral(42), desc: 'number' },
      { rightType: 'BooleanLiteral', right: createBooleanLiteral(true), desc: 'boolean' },
      { rightType: 'CallExpression', right: createCallExpression('fn'), desc: 'call expression' },
      { rightType: 'MemberExpression', right: createMemberExpression(), desc: 'member expression' },
      { rightType: 'TemplateLiteral', right: createTemplateLiteral(), desc: 'template literal' },
      {
        rightType: 'UnaryExpression',
        right: createUnaryExpression('-', createIdentifier('x')),
        desc: 'unary expression',
      },
      { rightType: 'ArrayExpression', right: createArrayExpression(), desc: 'array expression' },
      { rightType: 'ObjectExpression', right: createObjectExpression(), desc: 'object expression' },
      {
        rightType: 'ConditionalExpression',
        right: createConditionalExpression(),
        desc: 'conditional expression',
      },
      { rightType: 'NewExpression', right: createNewExpression(), desc: 'new expression' },
      {
        rightType: 'FunctionExpression',
        right: createFunctionExpression(),
        desc: 'function expression',
      },
      {
        rightType: 'ArrowFunctionExpression',
        right: createArrowFunctionExpression(),
        desc: 'arrow function',
      },
    ])('should report "" + $desc', ({ right }) => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', createEmptyStringLiteral(), right)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - plus operator should report with various left operands', () => {
    test.each([
      { leftType: 'Identifier', left: createIdentifier('x'), desc: 'identifier' },
      { leftType: 'NumericLiteral', left: createNumericLiteral(42), desc: 'number' },
      { leftType: 'BooleanLiteral', left: createBooleanLiteral(true), desc: 'boolean' },
      { leftType: 'CallExpression', left: createCallExpression('fn'), desc: 'call expression' },
      { leftType: 'MemberExpression', left: createMemberExpression(), desc: 'member expression' },
      { leftType: 'TemplateLiteral', left: createTemplateLiteral(), desc: 'template literal' },
      {
        leftType: 'UnaryExpression',
        left: createUnaryExpression('!', createIdentifier('x')),
        desc: 'unary expression',
      },
      { leftType: 'ArrayExpression', left: createArrayExpression(), desc: 'array expression' },
      { leftType: 'ObjectExpression', left: createObjectExpression(), desc: 'object expression' },
      {
        leftType: 'ConditionalExpression',
        left: createConditionalExpression(),
        desc: 'conditional expression',
      },
      { leftType: 'NewExpression', left: createNewExpression(), desc: 'new expression' },
      {
        leftType: 'FunctionExpression',
        left: createFunctionExpression(),
        desc: 'function expression',
      },
      {
        leftType: 'ArrowFunctionExpression',
        left: createArrowFunctionExpression(),
        desc: 'arrow function',
      },
    ])('should report $desc + ""', ({ left }) => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', left, createEmptyStringLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - non-empty string values should not report', () => {
    test.each([
      { value: 'a', desc: 'single char' },
      { value: 'hello', desc: 'short string' },
      { value: 'hello world', desc: 'string with space' },
      { value: '  ', desc: 'whitespace string' },
      { value: '\n', desc: 'newline string' },
      { value: '\t', desc: 'tab string' },
      { value: '\r\n', desc: 'CRLF string' },
      { value: '0', desc: 'string zero' },
      { value: 'false', desc: 'string false' },
      { value: ' ', desc: 'single space' },
    ])('should not report "$value" + variable ($desc)', ({ value }) => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression(
        '+',
        createNonEmptyStringLiteral(value),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - edge case literal values should not report', () => {
    test.each([
      { value: 0, desc: 'numeric zero' },
      { value: 1, desc: 'numeric one' },
      { value: -1, desc: 'negative number' },
      { value: 3.14, desc: 'float number' },
      { value: true, desc: 'boolean true' },
      { value: false, desc: 'boolean false' },
      { value: null, desc: 'null' },
    ])('should not report literal $desc + variable', ({ value }) => {
      const { context, reports } = createMockContext()
      const visitor = noUselessConcatRule.create(context)

      const node = createBinaryExpression('+', { type: 'Literal', value }, createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
