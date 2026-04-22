import { describe, test, expect, vi } from 'vitest'
import { restrictTemplateExpressionsRule } from '../../../../src/rules/patterns/restrict-template-expressions.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createTemplateLiteral(expressions: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'TemplateLiteral',
    expressions,
    quasis: [],
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

function createNumberLiteral(value: number, line = 1, column = 0): unknown {
  const length = String(value).length
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + length },
    },
  }
}

function createStringLiteral(value: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + value.length },
    },
  }
}

function createBooleanLiteral(value: boolean, line = 1, column = 0): unknown {
  const length = String(value).length
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + length },
    },
  }
}

function createNullLiteral(line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 4 },
    },
  }
}

function createCallExpression(callee: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createBinaryExpression(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: '+',
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
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createLogicalExpression(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'LogicalExpression',
    operator: '&&',
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createUnaryExpression(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createNewExpression(callee: unknown, line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
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

function createSequenceExpression(expressions: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'SequenceExpression',
    expressions,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createArrowFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: createIdentifier('x'),
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

function createArrayExpression(line = 1, column = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createUpdateExpression(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'UpdateExpression',
    operator: '++',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createTaggedTemplateExpression(tag: unknown, line = 1, column = 0): unknown {
  return {
    type: 'TaggedTemplateExpression',
    tag,
    quasi: createTemplateLiteral([]),
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createAwaitExpression(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AwaitExpression',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createYieldExpression(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'YieldExpression',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createSpreadElement(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'SpreadElement',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createTemplateExpressionWithType(
  type: string,
  extra: Record<string, unknown> = {},
): unknown {
  return {
    type,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
    ...extra,
  }
}

function createOptionsContext(options: Record<string, unknown> = {}): {
  context: RuleContext
  reports: ReportDescriptor[]
} {
  return createMockRuleContext({ options: [options], source: 'const x = `${y}`;' })
}

function createNoOptionsContext(): { context: RuleContext; reports: ReportDescriptor[] } {
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
    getSource: () => 'const x = `${y}`;',
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

  return { context, reports }
}

describe('restrict-template-expressions rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(restrictTemplateExpressionsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(restrictTemplateExpressionsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(restrictTemplateExpressionsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(restrictTemplateExpressionsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(restrictTemplateExpressionsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(restrictTemplateExpressionsRule.meta.fixable).toBeUndefined()
    })

    test('should mention template in description', () => {
      expect(restrictTemplateExpressionsRule.meta.docs?.description.toLowerCase()).toContain(
        'template',
      )
    })

    test('should have a docs URL', () => {
      expect(restrictTemplateExpressionsRule.meta.docs?.url).toBeDefined()
    })

    test('should have string coercion mention in description', () => {
      const desc = restrictTemplateExpressionsRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('coercion')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(restrictTemplateExpressionsRule.meta.schema)).toBe(true)
    })

    test('should have schema with object type', () => {
      const schema = restrictTemplateExpressionsRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].type).toBe('object')
    })

    test('should have allowNumber in schema properties', () => {
      const schema = restrictTemplateExpressionsRule.meta.schema as Record<string, unknown>[]
      const properties = schema[0].properties as Record<string, unknown>
      expect(properties).toHaveProperty('allowNumber')
    })

    test('should have allowBoolean in schema properties', () => {
      const schema = restrictTemplateExpressionsRule.meta.schema as Record<string, unknown>[]
      const properties = schema[0].properties as Record<string, unknown>
      expect(properties).toHaveProperty('allowBoolean')
    })

    test('should have allowNull in schema properties', () => {
      const schema = restrictTemplateExpressionsRule.meta.schema as Record<string, unknown>[]
      const properties = schema[0].properties as Record<string, unknown>
      expect(properties).toHaveProperty('allowNull')
    })

    test('should have allowUndefined in schema properties', () => {
      const schema = restrictTemplateExpressionsRule.meta.schema as Record<string, unknown>[]
      const properties = schema[0].properties as Record<string, unknown>
      expect(properties).toHaveProperty('allowUndefined')
    })

    test('should have additionalProperties false in schema', () => {
      const schema = restrictTemplateExpressionsRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].additionalProperties).toBe(false)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(visitor).toHaveProperty('TemplateLiteral')
    })

    test('should return a callable TemplateLiteral function', () => {
      const { context } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(typeof visitor.TemplateLiteral).toBe('function')
    })

    test('should return the same visitor shape for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const { context: ctx2 } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor1 = restrictTemplateExpressionsRule.create(ctx1)
      const visitor2 = restrictTemplateExpressionsRule.create(ctx2)

      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })
  })

  describe('detecting non-string expressions', () => {
    test('should report identifier in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("identifier 'x'")
    })

    test('should report number literal in template by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('number literal')
    })

    test('should report boolean literal in template by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean literal')
    })

    test('should report null in template by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNullLiteral()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('should report call expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createCallExpression(createIdentifier('fn'))])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function call')
    })

    test('should report binary expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createBinaryExpression(createIdentifier('a'), createIdentifier('b')),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('binary expression')
    })

    test('should not report string literal in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createStringLiteral('hello')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should report multiple non-string expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createIdentifier('x'),
        createNumberLiteral(42),
        createCallExpression(createIdentifier('fn')),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(3)
    })

    test('should report member expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('property')
    })

    test('should report arrow function expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createArrowFunctionExpression()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ArrowFunctionExpression')
    })

    test('should report object expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createObjectExpression()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ObjectExpression')
    })

    test('should report array expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createArrayExpression()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ArrayExpression')
    })

    test('should report conditional expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createConditionalExpression(
          createIdentifier('cond'),
          createIdentifier('a'),
          createIdentifier('b'),
        ),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ConditionalExpression')
    })

    test('should report logical expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createLogicalExpression(createIdentifier('a'), createIdentifier('b')),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('LogicalExpression')
    })

    test('should report unary expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createUnaryExpression(createIdentifier('x'))])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('UnaryExpression')
    })

    test('should report new expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNewExpression(createIdentifier('MyClass'))])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('NewExpression')
    })

    test('should report assignment expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AssignmentExpression')
    })

    test('should report update expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createUpdateExpression(createIdentifier('x'))])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('UpdateExpression')
    })

    test('should report sequence expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createSequenceExpression([createIdentifier('a'), createIdentifier('b')]),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('SequenceExpression')
    })

    test('should report await expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createAwaitExpression(createIdentifier('promise'))])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AwaitExpression')
    })

    test('should report yield expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createYieldExpression(createIdentifier('value'))])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('YieldExpression')
    })

    test('should report spread element in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createSpreadElement(createIdentifier('arr'))])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('SpreadElement')
    })

    test('should report tagged template expression in template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createTaggedTemplateExpression(createIdentifier('tag'))])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('string literals (always allowed)', () => {
    test('should not report empty string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createStringLiteral('')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report single-character string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createStringLiteral('a')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report multi-word string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createStringLiteral('hello world foo bar')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report string literal with special characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createStringLiteral('${special} \\n \\t')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report string literal when allowNumber is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: false }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createStringLiteral('hello')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report string literal when all options are false', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNumber: false,
        allowBoolean: false,
        allowNull: false,
        allowUndefined: false,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createStringLiteral('hello')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report string literal when all options are true', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNumber: true,
        allowBoolean: true,
        allowNull: true,
        allowUndefined: true,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createStringLiteral('hello')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report multiple string literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createStringLiteral('a'),
        createStringLiteral('b'),
        createStringLiteral('c'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('number literals', () => {
    test('should report integer literal by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(0)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('number literal')
    })

    test('should report positive integer', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(100)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report zero', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(0)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report float number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(3.14)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report negative number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(-1)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report very large number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(1e10)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should allow number literals when allowNumber is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should allow zero when allowNumber is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(0)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should allow float when allowNumber is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(3.14)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should allow negative number when allowNumber is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(-42)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report identifiers when allowNumber is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should still report boolean when allowNumber is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should still report null when allowNumber is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNullLiteral()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should allow multiple numbers when allowNumber is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(1),
        createNumberLiteral(2),
        createNumberLiteral(3),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('boolean literals', () => {
    test('should report true literal by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean literal')
    })

    test('should report false literal by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(false)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean literal')
    })

    test('should allow boolean literals when allowBoolean is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowBoolean: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should allow false literal when allowBoolean is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowBoolean: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(false)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report identifiers when allowBoolean is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowBoolean: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should still report number when allowBoolean is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowBoolean: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should still report null when allowBoolean is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowBoolean: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNullLiteral()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should allow both true and false with allowBoolean true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowBoolean: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true), createBooleanLiteral(false)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('null literals', () => {
    test('should report null by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNullLiteral()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('should allow null when allowNull is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNull: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNullLiteral()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report identifiers when allowNull is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNull: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should still report number when allowNull is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNull: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should still report boolean when allowNull is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNull: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('undefined identifier', () => {
    test('should report undefined identifier by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('undefined')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
    })

    test('should allow undefined when allowUndefined is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowUndefined: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('undefined')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report other identifiers when allowUndefined is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowUndefined: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should still report number when allowUndefined is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowUndefined: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should still report boolean when allowUndefined is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowUndefined: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should still report null when allowUndefined is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowUndefined: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNullLiteral()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report undefined-like identifier that is not exactly "undefined"', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowUndefined: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('Undefined')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report undefined-like identifier "undefine" when allowUndefined is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowUndefined: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('undefine')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowNumber', () => {
    test('should allow number literals when option is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report other types when allowNumber is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowBoolean', () => {
    test('should allow boolean literals when option is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowBoolean: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report other types when allowBoolean is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowBoolean: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowNull', () => {
    test('should allow null when option is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNull: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNullLiteral()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report other types when allowNull is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNull: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowUndefined', () => {
    test('should allow undefined when option is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowUndefined: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('undefined')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report other types when allowUndefined is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowUndefined: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple options', () => {
    test('should allow multiple types when multiple options are true', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNumber: true,
        allowBoolean: true,
        allowNull: true,
        allowUndefined: true,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createBooleanLiteral(true),
        createNullLiteral(),
        createIdentifier('undefined'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report disallowed types with mixed options', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNumber: true,
        allowBoolean: true,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createIdentifier('x'),
        createBooleanLiteral(true),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("identifier 'x'")
    })

    test('should report all disallowed when only allowNumber is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createBooleanLiteral(true),
        createNullLiteral(),
        createIdentifier('undefined'),
        createIdentifier('x'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(4)
    })

    test('should report all disallowed when only allowBoolean is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowBoolean: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createBooleanLiteral(true),
        createNullLiteral(),
        createIdentifier('x'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(3)
    })

    test('should report all disallowed when only allowNull is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNull: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createBooleanLiteral(true),
        createNullLiteral(),
        createIdentifier('x'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(3)
    })

    test('should report all disallowed when only allowUndefined is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowUndefined: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createBooleanLiteral(true),
        createNullLiteral(),
        createIdentifier('undefined'),
        createIdentifier('x'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(4)
    })

    test('should allow number and boolean with combined options', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNumber: true,
        allowBoolean: true,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createBooleanLiteral(false),
        createStringLiteral('hello'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should allow number and null with combined options', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNumber: true,
        allowNull: true,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createNullLiteral(),
        createStringLiteral('hello'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should allow boolean and null with combined options', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowBoolean: true,
        allowNull: true,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createBooleanLiteral(true),
        createNullLiteral(),
        createStringLiteral('hello'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should allow number, boolean, null with combined options', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNumber: true,
        allowBoolean: true,
        allowNull: true,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createBooleanLiteral(true),
        createNullLiteral(),
        createStringLiteral('text'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report identifiers with three options enabled', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNumber: true,
        allowBoolean: true,
        allowNull: true,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createIdentifier('x'),
        createNullLiteral(),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("identifier 'x'")
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(() => visitor.TemplateLiteral(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(() => visitor.TemplateLiteral(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(() => visitor.TemplateLiteral('string')).not.toThrow()
      expect(() => visitor.TemplateLiteral(123)).not.toThrow()
    })

    test('should handle template without expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle template with undefined expressions array', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        expressions: undefined as unknown as unknown[],
        quasis: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        expressions: [createIdentifier('x')],
        quasis: [],
      }

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const expr = createIdentifier('x', 10, 5)
      const node = createTemplateLiteral([expr], 10, 0)
      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

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
        getSource: () => 'const x = `${y}`;',
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

      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(() =>
        visitor.TemplateLiteral(createTemplateLiteral([createIdentifier('x')])),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = {
        type: 'SomeOtherType',
        expressions: [createIdentifier('x')],
        quasis: [],
      }

      visitor.TemplateLiteral(node)
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(() => visitor.TemplateLiteral(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(() => visitor.TemplateLiteral(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle expressions with null entries', () => {
      const { context } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([null, createIdentifier('x')])
      expect(() => visitor.TemplateLiteral(node)).toThrow()
    })

    test('should handle expression that is a plain object without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('expression')
    })

    test('should handle expression with type but no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([{ type: 'SomeType' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('SomeType')
    })

    test('should handle expression that is empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([{}])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with missing quasis', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        expressions: [createIdentifier('x')],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle expressions array with undefined entry', () => {
      const { context } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([undefined])
      expect(() => visitor.TemplateLiteral(node)).toThrow()
    })
  })

  describe('location reporting', () => {
    test('should report location from expression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const expr = createIdentifier('myVar', 5, 10)
      const node = createTemplateLiteral([expr])
      visitor.TemplateLiteral(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report end location from expression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const expr = createIdentifier('myVar', 3, 5)
      const node = createTemplateLiteral([expr])
      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report default location for expression without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([{ type: 'SomeType' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report different locations for multiple expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const expr1 = createIdentifier('a', 2, 3)
      const expr2 = createIdentifier('b', 4, 7)
      const node = createTemplateLiteral([expr1, expr2])
      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(4)
    })

    test('should report location for null expression', () => {
      const { context } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([null])
      expect(() => visitor.TemplateLiteral(node)).toThrow()
    })

    test('should handle expression with partial loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'SomeType',
          loc: { start: { line: 5 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle expression with loc containing non-number line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'SomeType',
          loc: { start: { line: 'bad' }, end: { line: 'bad' } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle expression with loc as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'SomeType',
          loc: null,
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention string conversion in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports[0].message.toLowerCase()).toContain('string')
    })

    test('should mention template literal in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports[0].message.toLowerCase()).toContain('template')
    })

    test('should include expression type in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('myVar')])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain("identifier 'myVar'")
    })

    test('should include "Unexpected" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should suggest String() conversion in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('String()')
    })

    test('should describe number literal in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('number literal')
    })

    test('should describe boolean literal in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true)])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('boolean literal')
    })

    test('should describe null literal in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNullLiteral()])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('null')
    })

    test('should describe function call in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createCallExpression(createIdentifier('fn'))])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('function call')
    })

    test('should describe binary expression in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createBinaryExpression(createIdentifier('a'), createIdentifier('b')),
      ])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('binary expression')
    })

    test('should describe member expression in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
      ])
      visitor.TemplateLiteral(node)

      expect(reports[0].message.toLowerCase()).toContain('property')
    })

    test('should describe unknown type in message using type name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createTemplateExpressionWithType('CustomExpression')])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('CustomExpression')
    })
  })

  describe('getExpressionDescription edge cases', () => {
    test('should describe member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: { type: 'Identifier', name: 'prop' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('property')
    })

    test('should describe expression without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should describe identifier with specific name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('fooBar')])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain("identifier 'fooBar'")
    })

    test('should describe identifier "undefined" specifically', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('undefined')])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('undefined')
    })
  })

  describe('options handling variations', () => {
    test('should treat allowNumber: false as disallowing numbers', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: false }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should treat allowBoolean: false as disallowing booleans', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowBoolean: false }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should treat allowNull: false as disallowing null', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNull: false }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNullLiteral()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should treat allowUndefined: false as disallowing undefined', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowUndefined: false }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('undefined')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle options with extra unknown properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNumber: true,
        someOtherOption: true,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should use defaults when options is empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createBooleanLiteral(true),
        createNullLiteral(),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(3)
    })

    test('should handle config with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = `${y}`;',
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

      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle config with null options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = `${y}`;',
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

      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle config with options as non-array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = `${y}`;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: 'not-an-array' },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle options with non-object first element', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = `${y}`;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: ['string-not-object'] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('complex expression types', () => {
    test('should report nested call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const innerCall = createCallExpression(createIdentifier('inner'))
      const outerCall = createCallExpression(innerCall)
      const node = createTemplateLiteral([outerCall])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function call')
    })

    test('should report chained member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const inner = createMemberExpression(createIdentifier('obj'), {
        type: 'Identifier',
        name: 'a',
      })
      const outer = createMemberExpression(inner, { type: 'Identifier', name: 'b' })
      const node = createTemplateLiteral([outer])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('property')
    })

    test('should report binary expression with string literal left', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createBinaryExpression(createStringLiteral('a'), createIdentifier('b')),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('binary expression')
    })

    test('should report complex nested expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const call = createCallExpression(createIdentifier('fn'))
      const binary = createBinaryExpression(call, createIdentifier('x'))
      const node = createTemplateLiteral([binary])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template expression within template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const inner = createTemplateLiteral([createIdentifier('nested')])
      const node = createTemplateLiteral([inner])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle expression with computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: { type: 'Identifier', name: 'prop' },
          computed: true,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('property')
    })

    test('should report typeof expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createUnaryExpression(createIdentifier('x'))])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template with many expressions of different types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createIdentifier('a'),
        createNumberLiteral(1),
        createBooleanLiteral(true),
        createNullLiteral(),
        createCallExpression(createIdentifier('fn')),
        createBinaryExpression(createIdentifier('x'), createIdentifier('y')),
        createMemberExpression(createIdentifier('obj'), { type: 'Identifier', name: 'p' }),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(7)
    })

    test('should handle mixed allowed and disallowed in long template', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createStringLiteral('a'),
        createNumberLiteral(1),
        createStringLiteral('b'),
        createNumberLiteral(2),
        createIdentifier('x'),
        createStringLiteral('c'),
        createNumberLiteral(3),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("identifier 'x'")
    })
  })

  describe('call expressions - various forms', () => {
    test('should report call with identifier callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createCallExpression(createIdentifier('myFunc'))])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function call')
    })

    test('should report call with member expression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const callee = createMemberExpression(createIdentifier('obj'), {
        type: 'Identifier',
        name: 'method',
      })
      const node = createTemplateLiteral([createCallExpression(callee)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function call')
    })

    test('should report call with arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [createStringLiteral('arg')],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function call')
    })
  })

  describe('binary expressions - various forms', () => {
    test('should report addition binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createBinaryExpression(createIdentifier('a'), createIdentifier('b')),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report subtraction binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'BinaryExpression',
          operator: '-',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('binary expression')
    })

    test('should report strict equality binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'BinaryExpression',
          operator: '===',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('binary expression')
    })
  })

  describe('idempotency and re-use', () => {
    test('should report same violation on repeated calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])

      visitor.TemplateLiteral(node)
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(2)
    })

    test('should produce consistent reports across multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node1 = createTemplateLiteral([createIdentifier('a')])
      const node2 = createTemplateLiteral([createIdentifier('b')])

      visitor.TemplateLiteral(node1)
      visitor.TemplateLiteral(node2)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("identifier 'a'")
      expect(reports[1].message).toContain("identifier 'b'")
    })

    test('should handle alternating report and no-report calls', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([createStringLiteral('ok')]))
      visitor.TemplateLiteral(createTemplateLiteral([createIdentifier('bad')]))
      visitor.TemplateLiteral(createTemplateLiteral([createNumberLiteral(42)]))
      visitor.TemplateLiteral(createTemplateLiteral([createIdentifier('alsoBad')]))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("identifier 'bad'")
      expect(reports[1].message).toContain("identifier 'alsoBad'")
    })

    test('should not carry state between different context instances', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ options: [{ allowNumber: false }], source: 'const x = `${y}`;' })

      const visitor1 = restrictTemplateExpressionsRule.create(ctx1)
      const visitor2 = restrictTemplateExpressionsRule.create(ctx2)

      visitor1.TemplateLiteral(createTemplateLiteral([createNumberLiteral(42)]))
      visitor2.TemplateLiteral(createTemplateLiteral([createNumberLiteral(42)]))

      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(1)
    })
  })

  describe('distinguishing between literal types', () => {
    test('should not report number literal that looks like string (value is number)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'Literal',
          value: 123,
          raw: '123',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('number literal')
    })

    test('should distinguish string literal from number literal with same display', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const stringNode = createTemplateLiteral([createStringLiteral('42')])
      visitor.TemplateLiteral(stringNode)

      expect(reports.length).toBe(0)
    })

    test('should report Literal with boolean value as boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'Literal',
          value: false,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean literal')
    })

    test('should report Literal with null value as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'Literal',
          value: null,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('should not report Literal with string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'Literal',
          value: 'text',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should report Literal with regex value as expression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'Literal',
          value: /regex/,
          regex: { pattern: 'regex', flags: '' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Literal with undefined value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'Literal',
          value: undefined,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('mixed expression patterns', () => {
    test('should handle template with string and identifier alternating', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createStringLiteral('hello'),
        createIdentifier('name'),
        createStringLiteral('world'),
        createIdentifier('age'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(2)
    })

    test('should handle template with all allowed types and one disallowed', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNumber: true,
        allowBoolean: true,
        allowNull: true,
        allowUndefined: true,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createStringLiteral('a'),
        createNumberLiteral(1),
        createBooleanLiteral(true),
        createNullLiteral(),
        createIdentifier('undefined'),
        createCallExpression(createIdentifier('fn')),
        createStringLiteral('b'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function call')
    })

    test('should handle template with string then number then identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createStringLiteral('prefix'),
        createNumberLiteral(42),
        createIdentifier('suffix'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(2)
    })

    test('should report correctly when string literal is between two identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createIdentifier('start'),
        createStringLiteral('middle'),
        createIdentifier('end'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("identifier 'start'")
      expect(reports[1].message).toContain("identifier 'end'")
    })
  })

  describe('visitor does not modify input', () => {
    test('should not modify the node passed to TemplateLiteral', () => {
      const { context } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const originalExpr = createIdentifier('x')
      const originalNode = createTemplateLiteral([originalExpr])
      const originalType = (originalNode as Record<string, unknown>).type

      visitor.TemplateLiteral(originalNode)

      expect((originalNode as Record<string, unknown>).type).toBe(originalType)
    })
  })

  describe('multiple invocations with different options', () => {
    test('should produce different results for different option sets', () => {
      const { context: ctx1, reports: reports1 } = createOptionsContext({ allowNumber: true })
      const { context: ctx2, reports: reports2 } = createOptionsContext({ allowNumber: false })

      const v1 = restrictTemplateExpressionsRule.create(ctx1)
      const v2 = restrictTemplateExpressionsRule.create(ctx2)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      v1.TemplateLiteral(node)
      v2.TemplateLiteral(node)

      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(1)
    })

    test('should handle switching between permissive and restrictive options', () => {
      const allAllowed = createOptionsContext({
        allowNumber: true,
        allowBoolean: true,
        allowNull: true,
        allowUndefined: true,
      })
      const noneAllowed = createOptionsContext({})

      const v1 = restrictTemplateExpressionsRule.create(allAllowed.context)
      const v2 = restrictTemplateExpressionsRule.create(noneAllowed.context)

      const node = createTemplateLiteral([
        createNumberLiteral(1),
        createBooleanLiteral(true),
        createNullLiteral(),
        createIdentifier('undefined'),
      ])

      v1.TemplateLiteral(node)
      v2.TemplateLiteral(node)

      expect(allAllowed.reports.length).toBe(0)
      expect(noneAllowed.reports.length).toBe(4)
    })
  })

  describe('stringLiteral always safe regardless of options', () => {
    test('should not report string literal with allowNumber true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([createStringLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report string literal with allowBoolean true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowBoolean: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([createStringLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report string literal with all options false', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        allowNumber: false,
        allowBoolean: false,
        allowNull: false,
        allowUndefined: false,
      }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([createStringLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report string literal with no options', () => {
      const { context, reports } = createNoOptionsContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      visitor.TemplateLiteral(createTemplateLiteral([createStringLiteral('hello')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('schema validation', () => {
    test('should have correct default for allowNumber', () => {
      const schema = restrictTemplateExpressionsRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, Record<string, unknown>>
      expect(props.allowNumber.default).toBe(false)
    })

    test('should have correct default for allowBoolean', () => {
      const schema = restrictTemplateExpressionsRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, Record<string, unknown>>
      expect(props.allowBoolean.default).toBe(false)
    })

    test('should have correct default for allowNull', () => {
      const schema = restrictTemplateExpressionsRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, Record<string, unknown>>
      expect(props.allowNull.default).toBe(false)
    })

    test('should have correct default for allowUndefined', () => {
      const schema = restrictTemplateExpressionsRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, Record<string, unknown>>
      expect(props.allowUndefined.default).toBe(false)
    })

    test('should have boolean type for all schema properties', () => {
      const schema = restrictTemplateExpressionsRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, Record<string, unknown>>
      for (const key of ['allowNumber', 'allowBoolean', 'allowNull', 'allowUndefined']) {
        expect(props[key].type).toBe('boolean')
      }
    })
  })

  describe('expression with no value property', () => {
    test('should handle Literal without value property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'Literal',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Literal with value as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'Literal',
          value: { nested: true },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple expressions with various types', () => {
    test('should count reports correctly for each expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createIdentifier('a'),
        createStringLiteral('b'),
        createNumberLiteral(3),
        createStringLiteral('d'),
        createBooleanLiteral(true),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(3)
    })

    test('should report all expressions when none are strings', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createIdentifier('a'),
        createNumberLiteral(1),
        createBooleanLiteral(false),
        createNullLiteral(),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(4)
    })

    test('should report no expressions when all are strings', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createStringLiteral('a'),
        createStringLiteral('b'),
        createStringLiteral('c'),
        createStringLiteral('d'),
        createStringLiteral('e'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle single string literal expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createStringLiteral('only')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle single identifier expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('only')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("identifier 'only'")
    })
  })

  describe('allowed type combinations with string always allowed', () => {
    test('string + number should be reported for number with default options', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      visitor.TemplateLiteral(
        createTemplateLiteral([createStringLiteral('hello'), createNumberLiteral(42)]),
      )

      expect(reports.length).toBe(1)
    })

    test('string + number should not report with allowNumber', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowNumber: true }], source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      visitor.TemplateLiteral(
        createTemplateLiteral([createStringLiteral('hello'), createNumberLiteral(42)]),
      )

      expect(reports.length).toBe(0)
    })

    test('string + boolean should be reported for boolean with default options', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      visitor.TemplateLiteral(
        createTemplateLiteral([createStringLiteral('hello'), createBooleanLiteral(true)]),
      )

      expect(reports.length).toBe(1)
    })

    test('string + null should be reported for null with default options', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      visitor.TemplateLiteral(
        createTemplateLiteral([createStringLiteral('hello'), createNullLiteral()]),
      )

      expect(reports.length).toBe(1)
    })

    test('string + undefined should be reported with default options', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = `${y}`;' })
      const visitor = restrictTemplateExpressionsRule.create(context)

      visitor.TemplateLiteral(
        createTemplateLiteral([createStringLiteral('hello'), createIdentifier('undefined')]),
      )

      expect(reports.length).toBe(1)
    })
  })
})
