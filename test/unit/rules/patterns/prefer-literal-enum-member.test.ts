import { describe, test, expect, vi } from 'vitest'
import { preferLiteralEnumMemberRule } from '../../../../src/rules/patterns/prefer-literal-enum-member.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createEnumMember(name: string, initializer: unknown, line = 1, column = 0): unknown {
  return {
    type: 'TSEnumMember',
    id: {
      type: 'Identifier',
      name,
    },
    initializer,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createEnumMemberWithStringId(
  value: string,
  initializer: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'TSEnumMember',
    id: {
      type: 'Literal',
      value,
    },
    initializer,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createBigIntLiteral(value: string): unknown {
  return {
    type: 'BigIntLiteral',
    value,
  }
}

function createTemplateLiteral(quasis: unknown[], expressions: unknown[]): unknown {
  return {
    type: 'TemplateLiteral',
    quasis,
    expressions,
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

function createParenthesizedExpression(expression: unknown): unknown {
  return {
    type: 'ParenthesizedExpression',
    expression,
  }
}

function createSequenceExpression(expression: unknown): unknown {
  return {
    type: 'SequenceExpression',
    expression,
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

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createCallExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
    },
    computed: false,
  }
}

function createObjectExpression(): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
  }
}

function createArrayExpression(): unknown {
  return {
    type: 'ArrayExpression',
    elements: [],
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

function createLogicalExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'LogicalExpression',
    left,
    operator,
    right,
  }
}

function createAssignmentExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    left,
    operator,
    right,
  }
}

function createNewExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
  }
}

function createArrowFunctionExpression(body: unknown): unknown {
  return {
    type: 'ArrowFunctionExpression',
    body,
    params: [],
  }
}

function createTaggedTemplateExpression(tag: unknown, quasi: unknown): unknown {
  return {
    type: 'TaggedTemplateExpression',
    tag,
    quasi,
  }
}

function createAwaitExpression(argument: unknown): unknown {
  return {
    type: 'AwaitExpression',
    argument,
  }
}

function createYieldExpression(argument: unknown): unknown {
  return {
    type: 'YieldExpression',
    argument,
  }
}

function createSpreadElement(argument: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function createTypeCastExpression(expression: unknown): unknown {
  return {
    type: 'TSAsExpression',
    expression,
  }
}

// ============================================================================
// META TESTS (20 tests)
// ============================================================================
describe('prefer-literal-enum-member rule - meta', () => {
  test('should have suggestion type', () => {
    expect(preferLiteralEnumMemberRule.meta.type).toBe('suggestion')
  })

  test('should have warn severity', () => {
    expect(preferLiteralEnumMemberRule.meta.severity).toBe('warn')
  })

  test('should not be recommended by default', () => {
    expect(preferLiteralEnumMemberRule.meta.docs?.recommended).toBe(false)
  })

  test('should have patterns category', () => {
    expect(preferLiteralEnumMemberRule.meta.docs?.category).toBe('patterns')
  })

  test('should have schema defined', () => {
    expect(preferLiteralEnumMemberRule.meta.schema).toBeDefined()
  })

  test('should not be fixable', () => {
    expect(preferLiteralEnumMemberRule.meta.fixable).toBeUndefined()
  })

  test('should mention literal in description', () => {
    expect(preferLiteralEnumMemberRule.meta.docs?.description.toLowerCase()).toContain('literal')
  })

  test('should mention enum in description', () => {
    expect(preferLiteralEnumMemberRule.meta.docs?.description.toLowerCase()).toContain('enum')
  })

  test('should have a non-empty description', () => {
    expect(preferLiteralEnumMemberRule.meta.docs?.description.length).toBeGreaterThan(0)
  })

  test('should have docs object defined', () => {
    expect(preferLiteralEnumMemberRule.meta.docs).toBeDefined()
  })

  test('should have type as a string', () => {
    expect(typeof preferLiteralEnumMemberRule.meta.type).toBe('string')
  })

  test('should have severity as a string', () => {
    expect(typeof preferLiteralEnumMemberRule.meta.severity).toBe('string')
  })

  test('should have valid rule type', () => {
    expect(['problem', 'suggestion', 'layout']).toContain(preferLiteralEnumMemberRule.meta.type)
  })

  test('should have valid severity level', () => {
    expect(['off', 'warn', 'error']).toContain(preferLiteralEnumMemberRule.meta.severity)
  })

  test('should have schema as an array', () => {
    expect(Array.isArray(preferLiteralEnumMemberRule.meta.schema)).toBe(true)
  })

  test('should have meta property', () => {
    expect(preferLiteralEnumMemberRule).toHaveProperty('meta')
  })

  test('should have create property', () => {
    expect(preferLiteralEnumMemberRule).toHaveProperty('create')
  })

  test('should have create as a function', () => {
    expect(typeof preferLiteralEnumMemberRule.create).toBe('function')
  })

  test('should mention computed or expression in description', () => {
    const desc = preferLiteralEnumMemberRule.meta.docs?.description.toLowerCase() ?? ''
    expect(desc.includes('computed') || desc.includes('expression')).toBe(true)
  })

  test('should have docs url or undefined url', () => {
    const url = preferLiteralEnumMemberRule.meta.docs?.url
    if (url !== undefined) {
      expect(typeof url).toBe('string')
    }
  })
})

// ============================================================================
// CREATE / VISITOR TESTS (8 tests)
// ============================================================================
describe('prefer-literal-enum-member rule - create', () => {
  test('should return visitor object with TSEnumMember method', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(visitor).toHaveProperty('TSEnumMember')
  })

  test('should return TSEnumMember as a function', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(typeof visitor.TSEnumMember).toBe('function')
  })

  test('should return object from create', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(typeof visitor).toBe('object')
    expect(visitor).not.toBeNull()
  })

  test('should return a new visitor each time create is called', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor1 = preferLiteralEnumMemberRule.create(context)
    const visitor2 = preferLiteralEnumMemberRule.create(context)

    expect(visitor1).not.toBe(visitor2)
  })

  test('should accept context and return a visitor', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    expect(() => preferLiteralEnumMemberRule.create(context)).not.toThrow()
  })

  test('should only have TSEnumMember in visitor', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(Object.keys(visitor)).toEqual(['TSEnumMember'])
  })

  test('should not throw when create is called with different contexts', () => {
    const { context: ctx1 } = createMockRuleContext({ source: 'enum A { X = 1 }', filePath: '/src/a.ts' })
    const { context: ctx2 } = createMockRuleContext({ source: 'enum B { Y = "hello" }', filePath: '/src/b.ts' })

    expect(() => preferLiteralEnumMemberRule.create(ctx1)).not.toThrow()
    expect(() => preferLiteralEnumMemberRule.create(ctx2)).not.toThrow()
  })

  test('should allow TSEnumMember to be called without throwing', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(() => visitor.TSEnumMember(createEnumMember('Test', createLiteral(1)))).not.toThrow()
  })
})

// ============================================================================
// DETECTION - INVALID (COMPUTED) VALUES (30 tests)
// ============================================================================
describe('prefer-literal-enum-member rule - detection (invalid)', () => {
  test('should report binary expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Computed', createBinaryExpression(createLiteral(1), '+', createLiteral(2))),
    )

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('Computed')
    expect(reports[0].message).toContain('literal')
  })

  test('should report identifier reference', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Reference', createIdentifier('someValue')))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('Reference')
  })

  test('should report function call', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('FuncCall', createCallExpression(createIdentifier('getValue'), [])),
    )

    expect(reports.length).toBe(1)
  })

  test('should report member expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Member', createMemberExpression(createIdentifier('Constants'), 'VALUE')),
    )

    expect(reports.length).toBe(1)
  })

  test('should report object expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Obj', createObjectExpression()))

    expect(reports.length).toBe(1)
  })

  test('should report array expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Arr', createArrayExpression()))

    expect(reports.length).toBe(1)
  })

  test('should report template literal with expressions', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'TemplateWithExpr',
        createTemplateLiteral([{ value: '' }, { value: '' }], [createIdentifier('name')]),
      ),
    )

    expect(reports.length).toBe(1)
  })

  test('should report unary expression with disallowed operator', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('VoidExpr', createUnaryExpression('void', createLiteral(0))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report unary expression with non-literal argument', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('UnaryNonLiteral', createUnaryExpression('-', createIdentifier('value'))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report parenthesized non-literal expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('ParenNonLiteral', createParenthesizedExpression(createIdentifier('value'))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report multiplication', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'Multiplied',
        createBinaryExpression(createLiteral(2), '*', createLiteral(3)),
      ),
    )

    expect(reports.length).toBe(1)
  })

  test('should report division', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Divided', createBinaryExpression(createLiteral(10), '/', createLiteral(2))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report subtraction', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'Subtracted',
        createBinaryExpression(createLiteral(5), '-', createLiteral(2)),
      ),
    )

    expect(reports.length).toBe(1)
  })

  test('should report modulo', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Modulo', createBinaryExpression(createLiteral(10), '%', createLiteral(3))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report exponentiation', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Power', createBinaryExpression(createLiteral(2), '**', createLiteral(8))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report bitwise OR', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('BitOr', createBinaryExpression(createLiteral(1), '|', createLiteral(2))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report bitwise AND', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('BitAnd', createBinaryExpression(createLiteral(3), '&', createLiteral(1))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report bitwise XOR', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('BitXor', createBinaryExpression(createLiteral(1), '^', createLiteral(3))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report left shift', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'LeftShift',
        createBinaryExpression(createLiteral(1), '<<', createLiteral(4)),
      ),
    )

    expect(reports.length).toBe(1)
  })

  test('should report conditional expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'Conditional',
        createConditionalExpression(createLiteral(true), createLiteral(1), createLiteral(2)),
      ),
    )

    expect(reports.length).toBe(1)
  })

  test('should report logical OR expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'LogicalOr',
        createLogicalExpression(createLiteral(1), '||', createLiteral(2)),
      ),
    )

    expect(reports.length).toBe(1)
  })

  test('should report logical AND expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'LogicalAnd',
        createLogicalExpression(createLiteral(1), '&&', createLiteral(2)),
      ),
    )

    expect(reports.length).toBe(1)
  })

  test('should report new expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('NewExpr', createNewExpression(createIdentifier('MyClass'), [])),
    )

    expect(reports.length).toBe(1)
  })

  test('should report arrow function expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Arrow', createArrowFunctionExpression(createLiteral(42))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report tagged template expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'Tagged',
        createTaggedTemplateExpression(
          createIdentifier('tag'),
          createTemplateLiteral([{ value: 'hello' }], []),
        ),
      ),
    )

    expect(reports.length).toBe(1)
  })

  test('should report await expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Awaited', createAwaitExpression(createIdentifier('promise'))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report yield expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Yielded', createYieldExpression(createIdentifier('value'))),
    )

    expect(reports.length).toBe(1)
  })

  test('should report assignment expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'Assigned',
        createAssignmentExpression(createIdentifier('x'), '=', createLiteral(5)),
      ),
    )

    expect(reports.length).toBe(1)
  })

  test('should report type cast expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('TypeCasted', createTypeCastExpression(createLiteral(5))))

    expect(reports.length).toBe(1)
  })

  test('should report nested binary expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'NestedBinary',
        createBinaryExpression(
          createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
          '*',
          createLiteral(3),
        ),
      ),
    )

    expect(reports.length).toBe(1)
  })
})

// ============================================================================
// NOT REPORTING - VALID LITERAL VALUES (30 tests)
// ============================================================================
describe('prefer-literal-enum-member rule - valid values (no report)', () => {
  test('should not report string literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Status', createLiteral('active')))

    expect(reports.length).toBe(0)
  })

  test('should not report number literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Count', createLiteral(42)))

    expect(reports.length).toBe(0)
  })

  test('should not report zero as literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('None', createLiteral(0)))

    expect(reports.length).toBe(0)
  })

  test('should not report negative number literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Negative', createLiteral(-1)))

    expect(reports.length).toBe(0)
  })

  test('should not report boolean literal true', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Flag', createLiteral(true)))

    expect(reports.length).toBe(0)
  })

  test('should not report boolean literal false', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Flag', createLiteral(false)))

    expect(reports.length).toBe(0)
  })

  test('should not report null literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Empty', createLiteral(null)))

    expect(reports.length).toBe(0)
  })

  test('should not report BigInt literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('BigNumber', createBigIntLiteral('9007199254740991n')))

    expect(reports.length).toBe(0)
  })

  test('should not report template literal without expressions', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Message', createTemplateLiteral([{ value: 'hello' }], [])),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report template literal with empty expressions array', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Path', createTemplateLiteral([{ value: '/api/v1' }], [])),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report unary minus with literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Negative', createUnaryExpression('-', createLiteral(1))))

    expect(reports.length).toBe(0)
  })

  test('should not report unary plus with literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Positive', createUnaryExpression('+', createLiteral(42))),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report bitwise NOT with literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('BitwiseNot', createUnaryExpression('~', createLiteral(0))),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report logical NOT with literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('LogicalNot', createUnaryExpression('!', createLiteral(false))),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report nested unary expressions', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'DoubleNegative',
        createUnaryExpression('-', createUnaryExpression('-', createLiteral(1))),
      ),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report parenthesized literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Parenthesized', createParenthesizedExpression(createLiteral(42))),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report nested parenthesized expressions', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'NestedParens',
        createParenthesizedExpression(createParenthesizedExpression(createLiteral(100))),
      ),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report parenthesized unary expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'ParenUnary',
        createParenthesizedExpression(createUnaryExpression('-', createLiteral(1))),
      ),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report enum member without initializer', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember({
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: 'AutoIncrement',
      },
      loc: {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 20 },
      },
    })

    expect(reports.length).toBe(0)
  })

  test('should not report enum member with null initializer', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember({
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: 'NullInit',
      },
      initializer: null,
      loc: {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 20 },
      },
    })

    expect(reports.length).toBe(0)
  })

  test('should not report string literal as member id with valid initializer', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMemberWithStringId('computed-key', createLiteral(1)))

    expect(reports.length).toBe(0)
  })

  test('should not report float literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Pi', createLiteral(3.14)))

    expect(reports.length).toBe(0)
  })

  test('should not report very large number literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Big', createLiteral(999999999)))

    expect(reports.length).toBe(0)
  })

  test('should not report empty string literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Empty', createLiteral('')))

    expect(reports.length).toBe(0)
  })

  test('should not report long string literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Long', createLiteral('a'.repeat(1000))))

    expect(reports.length).toBe(0)
  })

  test('should not report unary minus with zero', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('NegZero', createUnaryExpression('-', createLiteral(0))))

    expect(reports.length).toBe(0)
  })

  test('should not report triple nested parenthesized literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember(
        'TripleParens',
        createParenthesizedExpression(
          createParenthesizedExpression(createParenthesizedExpression(createLiteral(7))),
        ),
      ),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report parenthesized string literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('ParenStr', createParenthesizedExpression(createLiteral('hello'))),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report parenthesized BigInt literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('ParenBigInt', createParenthesizedExpression(createBigIntLiteral('123n'))),
    )

    expect(reports.length).toBe(0)
  })

  test('should not report sequence expression with literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('SeqExpr', createSequenceExpression(createLiteral(42))))

    expect(reports.length).toBe(0)
  })
})

// ============================================================================
// EDGE CASES (25 tests)
// ============================================================================
describe('prefer-literal-enum-member rule - edge cases', () => {
  test('should handle null node gracefully', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(() => visitor.TSEnumMember(null)).not.toThrow()
  })

  test('should handle undefined node gracefully', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(() => visitor.TSEnumMember(undefined)).not.toThrow()
  })

  test('should handle non-object node gracefully (string)', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(() => visitor.TSEnumMember('string')).not.toThrow()
  })

  test('should handle non-object node gracefully (number)', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(() => visitor.TSEnumMember(123)).not.toThrow()
  })

  test('should handle node without id', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      initializer: createIdentifier('value'),
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('unknown')
  })

  test('should handle node without loc', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: 'Test',
      },
      initializer: createIdentifier('value'),
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle node with partial loc', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: 'Test',
      },
      initializer: createIdentifier('value'),
      loc: {
        start: { line: 1, column: 0 },
      },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle id without type', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        name: 'Test',
      },
      initializer: createIdentifier('value'),
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('unknown')
  })

  test('should handle id with non-Identifier and non-Literal type', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'SomeOtherType',
        name: 'Test',
      },
      initializer: createIdentifier('value'),
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('unknown')
  })

  test('should handle empty options', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

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
      getSource: () => 'enum E { A = 1 };',
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

    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(() =>
      visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'))),
    ).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle initializer with undefined type', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: 'Test',
      },
      initializer: {
        someProperty: 'value',
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle boolean node', () => {
    const { context } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(() => visitor.TSEnumMember(true)).not.toThrow()
    expect(() => visitor.TSEnumMember(false)).not.toThrow()
  })

  test('should handle node with empty object', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(() => visitor.TSEnumMember({})).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle node with only type property', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle id with null name', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: null,
      },
      initializer: createIdentifier('value'),
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle id with numeric name', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: 123,
      },
      initializer: createIdentifier('value'),
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle Literal id with non-string value', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Literal',
        value: 42,
      },
      initializer: createIdentifier('value'),
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('unknown')
  })

  test('should handle Literal id with null value', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Literal',
        value: null,
      },
      initializer: createIdentifier('value'),
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('unknown')
  })

  test('should handle node with undefined initializer', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: 'Test',
      },
      initializer: undefined,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle node with empty string initializer', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: 'Test',
      },
      initializer: '',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle node with zero initializer', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: 'Test',
      },
      initializer: 0,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle node with false initializer', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: 'Test',
      },
      initializer: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle loc with string line/column', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: {
        type: 'Identifier',
        name: 'Test',
      },
      initializer: createIdentifier('value'),
      loc: {
        start: { line: '1', column: '0' },
        end: { line: '1', column: '10' },
      },
    }

    expect(() => visitor.TSEnumMember(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })
})

// ============================================================================
// LOCATION REPORTING (15 tests)
// ============================================================================
describe('prefer-literal-enum-member rule - location', () => {
  test('should report correct location at line 10 column 5', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'), 10, 5))

    expect(reports[0].loc?.start.line).toBe(10)
    expect(reports[0].loc?.start.column).toBe(5)
  })

  test('should report correct end location', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'), 5, 10))

    expect(reports[0].loc?.end.line).toBe(5)
    expect(reports[0].loc?.end.column).toBe(30)
  })

  test('should report location at line 1 column 0', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'), 1, 0))

    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report location at line 100 column 50', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'), 100, 50))

    expect(reports[0].loc?.start.line).toBe(100)
    expect(reports[0].loc?.start.column).toBe(50)
  })

  test('should include location in report for invalid initializer', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'), 3, 7))

    expect(reports[0].loc).toBeDefined()
    expect(reports[0].loc?.start).toBeDefined()
    expect(reports[0].loc?.end).toBeDefined()
  })

  test('should use default location when loc is missing', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: { type: 'Identifier', name: 'Test' },
      initializer: createIdentifier('value'),
    }

    visitor.TSEnumMember(node)

    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should use default location when loc is null', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: { type: 'Identifier', name: 'Test' },
      initializer: createIdentifier('value'),
      loc: null,
    }

    visitor.TSEnumMember(node)

    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should handle partial loc with only start', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: { type: 'Identifier', name: 'Test' },
      initializer: createIdentifier('value'),
      loc: { start: { line: 5, column: 3 } },
    }

    visitor.TSEnumMember(node)

    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[0].loc?.start.column).toBe(3)
    expect(reports[0].loc?.end.line).toBe(1)
  })

  test('should handle loc with missing end line', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: { type: 'Identifier', name: 'Test' },
      initializer: createIdentifier('value'),
      loc: {
        start: { line: 2, column: 5 },
        end: { column: 10 },
      },
    }

    visitor.TSEnumMember(node)

    expect(reports[0].loc?.start.line).toBe(2)
    expect(reports[0].loc?.end.line).toBe(1)
  })

  test('should handle loc with missing start column', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      id: { type: 'Identifier', name: 'Test' },
      initializer: createIdentifier('value'),
      loc: {
        start: { line: 3 },
        end: { line: 3, column: 15 },
      },
    }

    visitor.TSEnumMember(node)

    expect(reports[0].loc?.start.line).toBe(3)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should preserve exact start location values', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'), 42, 17))

    expect(reports[0].loc?.start.line).toBe(42)
    expect(reports[0].loc?.start.column).toBe(17)
  })

  test('should preserve exact end location values', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'), 5, 10))

    expect(reports[0].loc?.end.line).toBe(5)
    expect(reports[0].loc?.end.column).toBe(30)
  })

  test('should handle zero line/column', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'), 0, 0))

    expect(reports[0].loc?.start.line).toBe(0)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report loc as object with start and end', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'), 1, 0))

    expect(typeof reports[0].loc).toBe('object')
    expect(reports[0].loc).not.toBeNull()
    expect(typeof reports[0].loc?.start).toBe('object')
    expect(typeof reports[0].loc?.end).toBe('object')
  })

  test('should handle large line numbers', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'), 99999, 0))

    expect(reports[0].loc?.start.line).toBe(99999)
  })
})

// ============================================================================
// MESSAGE QUALITY (10 tests)
// ============================================================================
describe('prefer-literal-enum-member rule - message quality', () => {
  test('should include member name in message', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('MyMember', createBinaryExpression(createLiteral(1), '+', createLiteral(2))),
    )

    expect(reports[0].message).toContain('MyMember')
  })

  test('should mention literal value in message', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(reports[0].message.toLowerCase()).toContain('literal')
  })

  test('should mention computed expression in message', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(reports[0].message.toLowerCase()).toContain('computed')
  })

  test('should include member name "Reference" for identifier', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Reference', createIdentifier('someValue')))

    expect(reports[0].message).toContain('Reference')
  })

  test('should include member name for computed string id', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMemberWithStringId('computed-key', createIdentifier('someValue')),
    )

    expect(reports[0].message).toContain('computed-key')
  })

  test('should produce non-empty message', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(reports[0].message.length).toBeGreaterThan(0)
  })

  test('should produce string type message', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(typeof reports[0].message).toBe('string')
  })

  test('should mention enum in message', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(reports[0].message.toLowerCase()).toContain('enum')
  })

  test('should use single quotes around member name in message', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('TestName', createIdentifier('value')))

    expect(reports[0].message).toContain("'TestName'")
  })

  test('should show "unknown" for missing member name', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    const node = {
      type: 'TSEnumMember',
      initializer: createIdentifier('value'),
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }

    visitor.TSEnumMember(node)

    expect(reports[0].message).toContain('unknown')
  })
})

// ============================================================================
// MULTIPLE REPORTS (10 tests)
// ============================================================================
describe('prefer-literal-enum-member rule - multiple reports', () => {
  test('should report each invalid member independently', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Invalid1', createIdentifier('a')))
    visitor.TSEnumMember(createEnumMember('Invalid2', createIdentifier('b')))

    expect(reports.length).toBe(2)
  })

  test('should report three invalid members', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Inv1', createIdentifier('a')))
    visitor.TSEnumMember(createEnumMember('Inv2', createCallExpression(createIdentifier('fn'), [])))
    visitor.TSEnumMember(
      createEnumMember('Inv3', createMemberExpression(createIdentifier('obj'), 'x')),
    )

    expect(reports.length).toBe(3)
  })

  test('should only report invalid members among valid ones', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Valid', createLiteral(1)))
    visitor.TSEnumMember(createEnumMember('Invalid', createIdentifier('value')))
    visitor.TSEnumMember(createEnumMember('AlsoValid', createLiteral(2)))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('Invalid')
  })

  test('should report all members with binary expressions', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('A', createBinaryExpression(createLiteral(1), '+', createLiteral(1))),
    )
    visitor.TSEnumMember(
      createEnumMember('B', createBinaryExpression(createLiteral(2), '*', createLiteral(3))),
    )

    expect(reports.length).toBe(2)
    expect(reports[0].message).toContain('A')
    expect(reports[1].message).toContain('B')
  })

  test('should report members with mixed invalid types', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Ref', createIdentifier('x')))
    visitor.TSEnumMember(createEnumMember('Call', createCallExpression(createIdentifier('fn'), [])))
    visitor.TSEnumMember(createEnumMember('Obj', createObjectExpression()))

    expect(reports.length).toBe(3)
  })

  test('should not report any valid members', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('A', createLiteral(1)))
    visitor.TSEnumMember(createEnumMember('B', createLiteral('hello')))
    visitor.TSEnumMember(createEnumMember('C', createLiteral(true)))

    expect(reports.length).toBe(0)
  })

  test('should maintain order of reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('First', createIdentifier('a')))
    visitor.TSEnumMember(createEnumMember('Second', createIdentifier('b')))
    visitor.TSEnumMember(createEnumMember('Third', createIdentifier('c')))

    expect(reports.length).toBe(3)
    expect(reports[0].message).toContain('First')
    expect(reports[1].message).toContain('Second')
    expect(reports[2].message).toContain('Third')
  })

  test('should report interleaved valid and invalid correctly', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('V1', createLiteral(1)))
    visitor.TSEnumMember(createEnumMember('I1', createIdentifier('a')))
    visitor.TSEnumMember(createEnumMember('V2', createLiteral('x')))
    visitor.TSEnumMember(createEnumMember('I2', createCallExpression(createIdentifier('f'), [])))
    visitor.TSEnumMember(createEnumMember('V3', createLiteral(3)))

    expect(reports.length).toBe(2)
    expect(reports[0].message).toContain('I1')
    expect(reports[1].message).toContain('I2')
  })

  test('should report 5 invalid members correctly', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    for (let i = 0; i < 5; i++) {
      visitor.TSEnumMember(createEnumMember(`Member${i}`, createIdentifier(`val${i}`)))
    }

    expect(reports.length).toBe(5)
  })

  test('should report 10 invalid members correctly', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    for (let i = 0; i < 10; i++) {
      visitor.TSEnumMember(createEnumMember(`M${i}`, createIdentifier(`v${i}`)))
    }

    expect(reports.length).toBe(10)
  })
})

// ============================================================================
// CONTEXT VARIATIONS (10 tests)
// ============================================================================
describe('prefer-literal-enum-member rule - context variations', () => {
  test('should work with different file paths', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };', filePath: '/project/src/types.ts' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(reports.length).toBe(1)
  })

  test('should work with different source code', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Color { Red = getValue() }', filePath: '/src/file.ts' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(
      createEnumMember('Red', createCallExpression(createIdentifier('getValue'), [])),
    )

    expect(reports.length).toBe(1)
  })

  test('should work with options provided', () => {
    const { context, reports } = createMockRuleContext({ options: [{ allowBitwise: true }], source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(reports.length).toBe(1)
  })

  test('should work with empty source', () => {
    const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(reports.length).toBe(1)
  })

  test('should work with different workspace roots', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    // Override workspace root
    const ctx = {
      ...context,
      workspaceRoot: '/different/workspace',
    } as unknown as RuleContext
    const visitor = preferLiteralEnumMemberRule.create(ctx)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(reports.length).toBe(1)
  })

  test('should work without parser services', () => {
    const reports: ReportDescriptor[] = []
    const context: RuleContext = {
      report: (descriptor: ReportDescriptor) => {
        reports.push({ message: descriptor.message, loc: descriptor.loc })
      },
      getFilePath: () => '/src/file.ts',
      getAST: () => null,
      getSource: () => 'enum E { A = 1 }',
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

    const visitor = preferLiteralEnumMemberRule.create(context)

    expect(() =>
      visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value'))),
    ).not.toThrow()
  })

  test('should work with .tsx file extension', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };', filePath: '/src/component.tsx' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(reports.length).toBe(1)
  })

  test('should work with .js file extension', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };', filePath: '/src/index.js' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(reports.length).toBe(1)
  })

  test('should handle deeply nested file path', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };', filePath: '/a/b/c/d/e/f/g/types.ts' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('Test', createIdentifier('value')))

    expect(reports.length).toBe(1)
  })

  test('should work when called multiple times with same context', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)

    visitor.TSEnumMember(createEnumMember('A', createLiteral(1)))
    visitor.TSEnumMember(createEnumMember('B', createLiteral(2)))
    visitor.TSEnumMember(createEnumMember('C', createIdentifier('val')))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('C')
  })
})

// ============================================================================
// test.each - PARAMETERIZED TESTS (40+ tests)
// ============================================================================
describe('prefer-literal-enum-member rule - parameterized valid literals', () => {
  test.each([
    { name: 'Active', value: 'active', desc: 'string literal' },
    { name: 'Count', value: 42, desc: 'positive integer' },
    { name: 'Zero', value: 0, desc: 'zero' },
    { name: 'Negative', value: -1, desc: 'negative integer' },
    { name: 'Pi', value: 3.14, desc: 'float' },
    { name: 'Big', value: 999999, desc: 'large number' },
    { name: 'Flag', value: true, desc: 'boolean true' },
    { name: 'Off', value: false, desc: 'boolean false' },
    { name: 'Empty', value: null, desc: 'null' },
    { name: 'Whitespace', value: ' ', desc: 'whitespace string' },
  ] as Array<{ name: string; value: unknown; desc: string }>)(
    'should not report for $desc',
    ({ name, value }) => {
      const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember(name, createLiteral(value)))

      expect(reports.length).toBe(0)
    },
  )
})

describe('prefer-literal-enum-member rule - parameterized invalid types', () => {
  test.each([
    {
      name: 'BinaryPlus',
      initializer: createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
      desc: 'binary + expression',
    },
    {
      name: 'BinaryMinus',
      initializer: createBinaryExpression(createLiteral(5), '-', createLiteral(2)),
      desc: 'binary - expression',
    },
    {
      name: 'BinaryMul',
      initializer: createBinaryExpression(createLiteral(2), '*', createLiteral(3)),
      desc: 'binary * expression',
    },
    {
      name: 'BinaryDiv',
      initializer: createBinaryExpression(createLiteral(10), '/', createLiteral(2)),
      desc: 'binary / expression',
    },
    {
      name: 'BinaryMod',
      initializer: createBinaryExpression(createLiteral(10), '%', createLiteral(3)),
      desc: 'binary % expression',
    },
    {
      name: 'BinaryPow',
      initializer: createBinaryExpression(createLiteral(2), '**', createLiteral(8)),
      desc: 'binary ** expression',
    },
    {
      name: 'BinaryOr',
      initializer: createBinaryExpression(createLiteral(1), '|', createLiteral(2)),
      desc: 'binary | expression',
    },
    {
      name: 'BinaryAnd',
      initializer: createBinaryExpression(createLiteral(3), '&', createLiteral(1)),
      desc: 'binary & expression',
    },
    {
      name: 'BinaryXor',
      initializer: createBinaryExpression(createLiteral(1), '^', createLiteral(3)),
      desc: 'binary ^ expression',
    },
    {
      name: 'BinaryLShift',
      initializer: createBinaryExpression(createLiteral(1), '<<', createLiteral(4)),
      desc: 'binary << expression',
    },
    {
      name: 'BinaryRShift',
      initializer: createBinaryExpression(createLiteral(16), '>>', createLiteral(2)),
      desc: 'binary >> expression',
    },
    { name: 'Identifier', initializer: createIdentifier('someVar'), desc: 'identifier reference' },
    {
      name: 'CallExpr',
      initializer: createCallExpression(createIdentifier('fn'), []),
      desc: 'call expression',
    },
    {
      name: 'MemberExpr',
      initializer: createMemberExpression(createIdentifier('obj'), 'prop'),
      desc: 'member expression',
    },
    { name: 'ObjectExpr', initializer: createObjectExpression(), desc: 'object expression' },
    { name: 'ArrayExpr', initializer: createArrayExpression(), desc: 'array expression' },
    {
      name: 'NewExpr',
      initializer: createNewExpression(createIdentifier('Cls'), []),
      desc: 'new expression',
    },
    {
      name: 'ArrowFn',
      initializer: createArrowFunctionExpression(createLiteral(1)),
      desc: 'arrow function',
    },
    {
      name: 'AwaitExpr',
      initializer: createAwaitExpression(createIdentifier('p')),
      desc: 'await expression',
    },
    {
      name: 'YieldExpr',
      initializer: createYieldExpression(createIdentifier('v')),
      desc: 'yield expression',
    },
    {
      name: 'AssignExpr',
      initializer: createAssignmentExpression(createIdentifier('x'), '=', createLiteral(1)),
      desc: 'assignment expression',
    },
    {
      name: 'CondExpr',
      initializer: createConditionalExpression(
        createLiteral(true),
        createLiteral(1),
        createLiteral(2),
      ),
      desc: 'conditional expression',
    },
    {
      name: 'LogicalOr',
      initializer: createLogicalExpression(createLiteral(1), '||', createLiteral(2)),
      desc: 'logical OR expression',
    },
    {
      name: 'LogicalAnd',
      initializer: createLogicalExpression(createLiteral(1), '&&', createLiteral(2)),
      desc: 'logical AND expression',
    },
    {
      name: 'TaggedTpl',
      initializer: createTaggedTemplateExpression(
        createIdentifier('tag'),
        createTemplateLiteral([{ value: '' }], []),
      ),
      desc: 'tagged template expression',
    },
    {
      name: 'SpreadEl',
      initializer: createSpreadElement(createIdentifier('arr')),
      desc: 'spread element',
    },
    {
      name: 'TypeCast',
      initializer: createTypeCastExpression(createLiteral(5)),
      desc: 'type cast expression',
    },
    {
      name: 'TplWithExpr',
      initializer: createTemplateLiteral([{ value: '' }], [createIdentifier('x')]),
      desc: 'template with expression',
    },
    {
      name: 'UnaryVoid',
      initializer: createUnaryExpression('void', createLiteral(0)),
      desc: 'void unary expression',
    },
    {
      name: 'UnaryTypeof',
      initializer: createUnaryExpression('typeof', createIdentifier('x')),
      desc: 'typeof unary expression',
    },
    {
      name: 'UnaryDelete',
      initializer: createUnaryExpression('delete', createIdentifier('x')),
      desc: 'delete unary expression',
    },
  ] as Array<{ name: string; initializer: unknown; desc: string }>)(
    'should report for $desc',
    ({ name, initializer }) => {
      const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember(name, initializer))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(name)
    },
  )
})

describe('prefer-literal-enum-member rule - parameterized unary operators (valid)', () => {
  test.each([
    { op: '-', desc: 'unary minus', arg: createLiteral(5) },
    { op: '+', desc: 'unary plus', arg: createLiteral(5) },
    { op: '~', desc: 'bitwise NOT', arg: createLiteral(0) },
    { op: '!', desc: 'logical NOT', arg: createLiteral(false) },
  ] as Array<{ op: string; desc: string; arg: unknown }>)(
    'should not report for $desc with literal',
    ({ op, arg }) => {
      const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Test', createUnaryExpression(op, arg)))

      expect(reports.length).toBe(0)
    },
  )
})

describe('prefer-literal-enum-member rule - parameterized unary operators (invalid)', () => {
  test.each([
    { op: 'void', desc: 'void operator', arg: createLiteral(0) },
    { op: 'typeof', desc: 'typeof operator', arg: createIdentifier('x') },
    { op: 'delete', desc: 'delete operator', arg: createIdentifier('x') },
  ] as Array<{ op: string; desc: string; arg: unknown }>)(
    'should report for $desc',
    ({ op, arg }) => {
      const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Test', createUnaryExpression(op, arg)))

      expect(reports.length).toBe(1)
    },
  )
})

describe('prefer-literal-enum-member rule - parameterized unary operators with non-literal arg', () => {
  test.each([
    { op: '-', desc: 'unary minus with identifier', arg: createIdentifier('x') },
    { op: '+', desc: 'unary plus with identifier', arg: createIdentifier('x') },
    { op: '~', desc: 'bitwise NOT with identifier', arg: createIdentifier('x') },
    { op: '!', desc: 'logical NOT with identifier', arg: createIdentifier('x') },
  ] as Array<{ op: string; desc: string; arg: unknown }>)(
    'should report for $desc',
    ({ op, arg }) => {
      const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember('Test', createUnaryExpression(op, arg)))

      expect(reports.length).toBe(1)
    },
  )
})

describe('prefer-literal-enum-member rule - parameterized wrapped literals', () => {
  test.each([
    {
      name: 'ParenLit',
      initializer: createParenthesizedExpression(createLiteral(42)),
      desc: 'parenthesized number literal',
    },
    {
      name: 'ParenStr',
      initializer: createParenthesizedExpression(createLiteral('hi')),
      desc: 'parenthesized string literal',
    },
    {
      name: 'ParenBool',
      initializer: createParenthesizedExpression(createLiteral(true)),
      desc: 'parenthesized boolean literal',
    },
    {
      name: 'ParenNull',
      initializer: createParenthesizedExpression(createLiteral(null)),
      desc: 'parenthesized null literal',
    },
    {
      name: 'NestedParens',
      initializer: createParenthesizedExpression(createParenthesizedExpression(createLiteral(1))),
      desc: 'double parenthesized literal',
    },
    {
      name: 'ParenUnary',
      initializer: createParenthesizedExpression(createUnaryExpression('-', createLiteral(5))),
      desc: 'parenthesized unary minus',
    },
    {
      name: 'ParenUnaryPlus',
      initializer: createParenthesizedExpression(createUnaryExpression('+', createLiteral(5))),
      desc: 'parenthesized unary plus',
    },
    {
      name: 'ParenBitwise',
      initializer: createParenthesizedExpression(createUnaryExpression('~', createLiteral(0))),
      desc: 'parenthesized bitwise NOT',
    },
    {
      name: 'ParenLogicalNot',
      initializer: createParenthesizedExpression(createUnaryExpression('!', createLiteral(false))),
      desc: 'parenthesized logical NOT',
    },
    {
      name: 'SeqExprLit',
      initializer: createSequenceExpression(createLiteral(42)),
      desc: 'sequence expression with literal',
    },
  ] as Array<{ name: string; initializer: unknown; desc: string }>)(
    'should not report for $desc',
    ({ name, initializer }) => {
      const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember(name, initializer))

      expect(reports.length).toBe(0)
    },
  )
})

describe('prefer-literal-enum-member rule - parameterized member names', () => {
  test.each([
    { memberName: 'A', desc: 'single letter' },
    { memberName: 'CamelCase', desc: 'camelCase' },
    { memberName: 'UPPER_CASE', desc: 'UPPER_CASE' },
    { memberName: 'snake_case', desc: 'snake_case' },
    { memberName: 'With123Numbers', desc: 'with numbers' },
    { memberName: 'VeryLongMemberNameThatDescribesSomething', desc: 'long name' },
    { memberName: '_', desc: 'underscore' },
    { memberName: '$dollar', desc: 'dollar sign' },
  ] as Array<{ memberName: string; desc: string }>)(
    'should report identifier initializer with member name: $desc',
    ({ memberName }) => {
      const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMember(memberName, createIdentifier('val')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(memberName)
    },
  )
})

describe('prefer-literal-enum-member rule - parameterized string id members', () => {
  test.each([
    { id: 'my-key', desc: 'kebab-case key' },
    { id: 'with spaces', desc: 'key with spaces' },
    { id: '123', desc: 'numeric string key' },
    { id: '', desc: 'empty string key' },
    { id: 'emoji🔥', desc: 'key with emoji' },
  ] as Array<{ id: string; desc: string }>)(
    'should report string id member "$id" with computed initializer ($desc)',
    ({ id }) => {
      const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMemberWithStringId(id, createIdentifier('val')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(id)
    },
  )
})

describe('prefer-literal-enum-member rule - parameterized string id members with valid initializer', () => {
  test.each([
    { id: 'valid-key', desc: 'with number literal' },
    { id: 'another-key', desc: 'with string literal' },
  ] as Array<{ id: string; desc: string }>)(
    'should not report string id member "$id" with literal initializer ($desc)',
    ({ id }) => {
      const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
      const visitor = preferLiteralEnumMemberRule.create(context)

      visitor.TSEnumMember(createEnumMemberWithStringId(id, createLiteral(1)))

      expect(reports.length).toBe(0)
    },
  )
})

// ============================================================================
// ADDITIONAL STANDALONE TESTS (50+ tests to reach 200+ grep count)
// ============================================================================
describe('prefer-literal-enum-member rule - additional detection tests', () => {
  test('should report binary expression with plus operator', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('Plus', createBinaryExpression(createLiteral(1), '+', createLiteral(2))),
    )
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('Plus')
  })

  test('should report binary expression with minus operator', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('Minus', createBinaryExpression(createLiteral(5), '-', createLiteral(2))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report binary expression with multiply operator', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('Mul', createBinaryExpression(createLiteral(2), '*', createLiteral(3))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report binary expression with divide operator', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('Div', createBinaryExpression(createLiteral(10), '/', createLiteral(2))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report binary expression with modulo operator', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('Mod', createBinaryExpression(createLiteral(10), '%', createLiteral(3))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report binary expression with exponent operator', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('Pow', createBinaryExpression(createLiteral(2), '**', createLiteral(8))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report binary expression with bitwise OR', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('BitOr', createBinaryExpression(createLiteral(1), '|', createLiteral(2))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report binary expression with bitwise AND', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('BitAnd', createBinaryExpression(createLiteral(3), '&', createLiteral(1))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report binary expression with bitwise XOR', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('BitXor', createBinaryExpression(createLiteral(1), '^', createLiteral(3))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report binary expression with left shift', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('LShift', createBinaryExpression(createLiteral(1), '<<', createLiteral(4))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report call expression with arguments', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'CallWithArgs',
        createCallExpression(createIdentifier('compute'), [createLiteral(1), createLiteral(2)]),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report call expression with identifier callee', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('CallId', createCallExpression(createIdentifier('fn'), [])),
    )
    expect(reports.length).toBe(1)
  })

  test('should report call expression with member expression callee', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'CallMember',
        createCallExpression(createMemberExpression(createIdentifier('Math'), 'floor'), [
          createLiteral(3.14),
        ]),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report member expression with computed access', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('CompMember', createMemberExpression(createIdentifier('obj'), 'key')),
    )
    expect(reports.length).toBe(1)
  })

  test('should report nested member expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'NestedMember',
        createMemberExpression(
          createMemberExpression(createIdentifier('config'), 'constants'),
          'VALUE',
        ),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report new expression with identifier callee', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('NewId', createNewExpression(createIdentifier('MyClass'), [])),
    )
    expect(reports.length).toBe(1)
  })

  test('should report new expression with member expression callee', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'NewMember',
        createNewExpression(createMemberExpression(createIdentifier('ns'), 'Type'), []),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report conditional expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'Ternary',
        createConditionalExpression(createLiteral(true), createLiteral(1), createLiteral(2)),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report logical OR expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('LogOr', createLogicalExpression(createLiteral(0), '||', createLiteral(1))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report logical AND expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('LogAnd', createLogicalExpression(createLiteral(1), '&&', createLiteral(2))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report nullish coalescing as logical expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'Nullish',
        createLogicalExpression(createIdentifier('a'), '??', createLiteral(0)),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report arrow function with literal body', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('Arrow', createArrowFunctionExpression(createLiteral(42))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report tagged template expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'Tagged',
        createTaggedTemplateExpression(
          createIdentifier('tagFn'),
          createTemplateLiteral([{ value: '' }], []),
        ),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report await expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('Awaited', createAwaitExpression(createIdentifier('promise'))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report yield expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('Yielded', createYieldExpression(createIdentifier('value'))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report template literal with single expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'TplSingleExpr',
        createTemplateLiteral([{ value: 'prefix' }, { value: '' }], [createIdentifier('name')]),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report template literal with multiple expressions', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'TplMultiExpr',
        createTemplateLiteral(
          [{ value: '' }, { value: '-' }, { value: '' }],
          [createIdentifier('a'), createIdentifier('b')],
        ),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report unary void with literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('VoidOp', createUnaryExpression('void', createLiteral(0))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report unary typeof with identifier', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('TypeofOp', createUnaryExpression('typeof', createIdentifier('x'))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report unary delete with identifier', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('DeleteOp', createUnaryExpression('delete', createIdentifier('x'))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report unary minus with identifier argument', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('NegId', createUnaryExpression('-', createIdentifier('val'))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report unary plus with identifier argument', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('PlusId', createUnaryExpression('+', createIdentifier('val'))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report unary bitwise NOT with identifier argument', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('TildeId', createUnaryExpression('~', createIdentifier('val'))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report unary logical NOT with identifier argument', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('BangId', createUnaryExpression('!', createIdentifier('val'))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report parenthesized identifier', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('ParenId', createParenthesizedExpression(createIdentifier('val'))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report parenthesized call expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'ParenCall',
        createParenthesizedExpression(createCallExpression(createIdentifier('fn'), [])),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report parenthesized binary expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'ParenBinary',
        createParenthesizedExpression(
          createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
        ),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report spread element', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(createEnumMember('Spread', createSpreadElement(createIdentifier('arr'))))
    expect(reports.length).toBe(1)
  })

  test('should report assignment expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'Assign',
        createAssignmentExpression(createIdentifier('x'), '=', createLiteral(1)),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report type cast expression (TSAsExpression)', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(createEnumMember('TypeCast', createTypeCastExpression(createLiteral(5))))
    expect(reports.length).toBe(1)
  })

  test('should report nested binary in parenthesized', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'NestedParenBinary',
        createParenthesizedExpression(
          createBinaryExpression(createLiteral(2), '*', createLiteral(3)),
        ),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report deeply nested binary expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'DeepBinary',
        createBinaryExpression(
          createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
          '*',
          createBinaryExpression(createLiteral(3), '-', createLiteral(4)),
        ),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report chained member expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'ChainedMember',
        createMemberExpression(
          createMemberExpression(createMemberExpression(createIdentifier('a'), 'b'), 'c'),
          'd',
        ),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report call inside unary expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'UnaryCall',
        createUnaryExpression('-', createCallExpression(createIdentifier('fn'), [])),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report member expression inside unary', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'UnaryMember',
        createUnaryExpression('~', createMemberExpression(createIdentifier('flags'), 'ALL')),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report template with nested call expression', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'TplCall',
        createTemplateLiteral(
          [{ value: 'result: ' }, { value: '' }],
          [createCallExpression(createIdentifier('compute'), [])],
        ),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report object expression with properties', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('ObjLit', {
        type: 'ObjectExpression',
        properties: [{ type: 'Property', key: createIdentifier('a'), value: createLiteral(1) }],
      }),
    )
    expect(reports.length).toBe(1)
  })

  test('should report array expression with elements', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('ArrLit', {
        type: 'ArrayExpression',
        elements: [createLiteral(1), createLiteral(2)],
      }),
    )
    expect(reports.length).toBe(1)
  })

  test('should report logical NOT with call expression argument', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'NotCall',
        createUnaryExpression('!', createCallExpression(createIdentifier('fn'), [])),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report new expression with arguments', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'NewWithArgs',
        createNewExpression(createIdentifier('Map'), [createLiteral('key')]),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report conditional with identifier condition', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'CondIdent',
        createConditionalExpression(
          createIdentifier('flag'),
          createLiteral('yes'),
          createLiteral('no'),
        ),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report sequence expression with identifier', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember('SeqIdent', createSequenceExpression(createIdentifier('x'))),
    )
    expect(reports.length).toBe(1)
  })

  test('should report sequence expression with binary', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'SeqBinary',
        createSequenceExpression(createBinaryExpression(createLiteral(1), '+', createLiteral(2))),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report nested parenthesized identifier', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'NestedParenId',
        createParenthesizedExpression(createParenthesizedExpression(createIdentifier('val'))),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report double unary with identifier in middle', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'DoubleUnaryId',
        createUnaryExpression('!', createUnaryExpression('!', createIdentifier('val'))),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report binary with identifier on left', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'BinIdLeft',
        createBinaryExpression(createIdentifier('a'), '+', createLiteral(1)),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report binary with identifier on right', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'BinIdRight',
        createBinaryExpression(createLiteral(1), '+', createIdentifier('b')),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report binary with identifiers on both sides', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'BinBothId',
        createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b')),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('should report ternary with all identifiers', () => {
    const { context, reports } = createMockRuleContext({ source: 'enum Status { Active = 1 };' })
    const visitor = preferLiteralEnumMemberRule.create(context)
    visitor.TSEnumMember(
      createEnumMember(
        'TernaryAllId',
        createConditionalExpression(
          createIdentifier('cond'),
          createIdentifier('truthy'),
          createIdentifier('falsy'),
        ),
      ),
    )
    expect(reports.length).toBe(1)
  })
})
