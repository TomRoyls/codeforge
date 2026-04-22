import { describe, test, expect, vi } from 'vitest'
import {
  noUnusedExpressionsRule,
  default as defaultExport,
} from '../../../../src/rules/patterns/no-unused-expressions.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createExpressionStatement(
  expression: unknown,
  lineNumber: number = 1,
  column: number = 0,
): unknown {
  return {
    type: 'ExpressionStatement',
    expression: expression,
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 10 },
    },
  }
}

function createBinaryExpression(operator: string, left?: unknown, right?: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator: operator,
    left: left || { type: 'Literal', value: 1 },
    right: right || { type: 'Literal', value: 2 },
  }
}

function createLogicalExpression(operator: string, left?: unknown, right?: unknown): unknown {
  return {
    type: 'LogicalExpression',
    operator: operator,
    left: left || { type: 'Identifier', name: 'a' },
    right: right || { type: 'Identifier', name: 'b' },
  }
}

function createCallExpression(callee?: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: callee || { type: 'Identifier', name: 'func' },
  }
}

function createAssignmentExpression(operator = '=', left?: unknown, right?: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    operator: operator,
    left: left || { type: 'Identifier', name: 'x' },
    right: right || { type: 'Literal', value: 1 },
  }
}

function createUpdateExpression(operator: string, argument?: unknown): unknown {
  return {
    type: 'UpdateExpression',
    operator: operator,
    argument: argument || { type: 'Identifier', name: 'x' },
  }
}

function createIdentifier(name: string): unknown {
  return { type: 'Identifier', name: name }
}

function createLiteral(value: unknown): unknown {
  return { type: 'Literal', value: value }
}

function createUnaryExpression(operator: string, argument?: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator: operator,
    argument: argument || { type: 'Identifier', name: 'x' },
  }
}

function createConditionalExpression(
  test?: unknown,
  consequent?: unknown,
  alternate?: unknown,
): unknown {
  return {
    type: 'ConditionalExpression',
    test: test || createIdentifier('a'),
    consequent: consequent || createIdentifier('b'),
    alternate: alternate || createIdentifier('c'),
  }
}

function createSequenceExpression(expressions: unknown[]): unknown {
  return {
    type: 'SequenceExpression',
    expressions: expressions,
  }
}

function createMemberExpression(object: unknown, property: unknown, computed = false): unknown {
  return {
    type: 'MemberExpression',
    object: object,
    property: property,
    computed: computed,
  }
}

function createChainExpression(expression: unknown): unknown {
  return {
    type: 'ChainExpression',
    expression: expression,
  }
}

function createTaggedTemplateExpression(): unknown {
  return {
    type: 'TaggedTemplateExpression',
    tag: { type: 'Identifier', name: 'tag' },
    quasi: { type: 'TemplateLiteral', expressions: [], quasis: [] },
  }
}

function createTemplateLiteral(): unknown {
  return {
    type: 'TemplateLiteral',
    expressions: [],
    quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
  }
}

describe('no-unused-expressions rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnusedExpressionsRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noUnusedExpressionsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnusedExpressionsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnusedExpressionsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnusedExpressionsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnusedExpressionsRule.meta.fixable).toBeUndefined()
    })

    test('should mention unused expressions in description', () => {
      const desc = noUnusedExpressionsRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/unused/)
      expect(desc).toMatch(/expression/)
    })

    test('should have empty schema array', () => {
      expect(noUnusedExpressionsRule.meta.schema).toEqual([])
    })

    test('should have docs.url as a string', () => {
      expect(typeof noUnusedExpressionsRule.meta.docs?.url).toBe('string')
    })

    test('should have docs.url containing rule name', () => {
      expect(noUnusedExpressionsRule.meta.docs?.url).toContain('no-unused-expressions')
    })

    test('should have docs.url starting with https', () => {
      expect(noUnusedExpressionsRule.meta.docs?.url).toMatch(/^https:/)
    })

    test('should have description as non-empty string', () => {
      expect(noUnusedExpressionsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should export default matching named export', () => {
      expect(defaultExport).toBe(noUnusedExpressionsRule)
    })

    test('should have create as a function', () => {
      expect(typeof noUnusedExpressionsRule.create).toBe('function')
    })

    test('should have docs with url property', () => {
      expect(noUnusedExpressionsRule.meta.docs).toHaveProperty('url')
    })

    test('should have docs with description property', () => {
      expect(noUnusedExpressionsRule.meta.docs).toHaveProperty('description')
    })

    test('should have docs with category property', () => {
      expect(noUnusedExpressionsRule.meta.docs).toHaveProperty('category')
    })

    test('should have docs with recommended property', () => {
      expect(noUnusedExpressionsRule.meta.docs).toHaveProperty('recommended')
    })

    test('should have description that does not end with period', () => {
      const desc = noUnusedExpressionsRule.meta.docs?.description
      expect(desc?.endsWith('.')).toBe(false)
    })

    test('should return consistent meta on repeated access', () => {
      const first = noUnusedExpressionsRule.meta
      const second = noUnusedExpressionsRule.meta
      expect(first).toBe(second)
    })
  })

  describe('create', () => {
    test('should return visitor object with ExpressionStatement method', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(visitor).toHaveProperty('ExpressionStatement')
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })

    test('should return a new visitor object each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noUnusedExpressionsRule.create(context)
      const visitor2 = noUnusedExpressionsRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor with only ExpressionStatement key', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(Object.keys(visitor)).toEqual(['ExpressionStatement'])
    })

    test('ExpressionStatement should return undefined', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const result = visitor.ExpressionStatement(
        createExpressionStatement(createBinaryExpression('+')),
      )
      expect(result).toBeUndefined()
    })

    test('should not throw when called with valid context', () => {
      const { context } = createMockRuleContext()
      expect(() => noUnusedExpressionsRule.create(context)).not.toThrow()
    })

    test('should accept context with minimal properties', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '',
      } as unknown as RuleContext

      expect(() => noUnusedExpressionsRule.create(context)).not.toThrow()
    })

    test('should not call report during create', () => {
      const { context, reports } = createMockRuleContext()
      noUnusedExpressionsRule.create(context)
      expect(reports.length).toBe(0)
    })

    test('visitor should accept single argument', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)
      expect(visitor.ExpressionStatement.length).toBe(1)
    })
  })

  describe('detecting comparison expressions', () => {
    test('should report strict equality expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('===')))

      expect(reports.length).toBe(1)
    })

    test('should report strict inequality expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('!==')))

      expect(reports.length).toBe(1)
    })

    test('should report loose equality expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('==')))

      expect(reports.length).toBe(1)
    })

    test('should report loose inequality expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('!=')))

      expect(reports.length).toBe(1)
    })

    test('should report less than expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('<')))

      expect(reports.length).toBe(1)
    })

    test('should report greater than expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('>')))

      expect(reports.length).toBe(1)
    })

    test('should report less than or equal expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('<=')))

      expect(reports.length).toBe(1)
    })

    test('should report greater than or equal expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('>=')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting arithmetic expressions', () => {
    test('should report addition expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })

    test('should report subtraction expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('-')))

      expect(reports.length).toBe(1)
    })

    test('should report multiplication expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('*')))

      expect(reports.length).toBe(1)
    })

    test('should report division expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('/')))

      expect(reports.length).toBe(1)
    })

    test('should report modulo expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('%')))

      expect(reports.length).toBe(1)
    })

    test('should report exponentiation expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('**')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting bitwise expressions', () => {
    test('should report bitwise AND expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('&')))

      expect(reports.length).toBe(1)
    })

    test('should report bitwise OR expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('|')))

      expect(reports.length).toBe(1)
    })

    test('should report bitwise XOR expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('^')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting shift expressions', () => {
    test('should report left shift expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('<<')))

      expect(reports.length).toBe(1)
    })

    test('should report right shift expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('>>')))

      expect(reports.length).toBe(1)
    })

    test('should report unsigned right shift expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('>>>')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting relational expressions', () => {
    test('should report in expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('in')))

      expect(reports.length).toBe(1)
    })

    test('should report instanceof expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('instanceof')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting logical expressions', () => {
    test('should report logical AND expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLogicalExpression('&&')))

      expect(reports.length).toBe(1)
    })

    test('should report logical OR expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLogicalExpression('||')))

      expect(reports.length).toBe(1)
    })

    test('should report nullish coalescing expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLogicalExpression('??')))

      expect(reports.length).toBe(1)
    })

    test('should report deeply nested logical expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createLogicalExpression(
        '&&',
        createLogicalExpression('||', createIdentifier('a'), createIdentifier('b')),
        createIdentifier('c'),
      )
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting literal and identifier expressions', () => {
    test('should report numeric literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLiteral(42)))

      expect(reports.length).toBe(1)
    })

    test('should report string literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLiteral('hello')))

      expect(reports.length).toBe(1)
    })

    test('should report boolean literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should report identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createIdentifier('x')))

      expect(reports.length).toBe(1)
    })

    test('should report null literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLiteral(null)))

      expect(reports.length).toBe(1)
    })

    test('should report undefined literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLiteral(undefined)))

      expect(reports.length).toBe(1)
    })

    test('should report regex literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(
        createExpressionStatement({
          type: 'Literal',
          value: /test/,
          regex: { pattern: 'test', flags: '' },
        }),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting template literal expressions', () => {
    test('should report template literal without tag', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createTemplateLiteral()))

      expect(reports.length).toBe(1)
    })

    test('should report template literal with interpolations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const templateLiteral = {
        type: 'TemplateLiteral',
        expressions: [createIdentifier('name')],
        quasis: [
          { type: 'TemplateElement', value: { raw: 'Hello ', cooked: 'Hello ' } },
          { type: 'TemplateElement', value: { raw: '', cooked: '' } },
        ],
      }
      visitor.ExpressionStatement(createExpressionStatement(templateLiteral))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting conditional expressions', () => {
    test('should report ternary expression with no side effects', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createConditionalExpression()))

      expect(reports.length).toBe(1)
    })

    test('should report nested conditional expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const nested = createConditionalExpression(
        createConditionalExpression(),
        createIdentifier('d'),
        createIdentifier('e'),
      )
      visitor.ExpressionStatement(createExpressionStatement(nested))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting sequence expressions', () => {
    test('should report sequence of identifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const seq = createSequenceExpression([createIdentifier('a'), createIdentifier('b')])
      visitor.ExpressionStatement(createExpressionStatement(seq))

      expect(reports.length).toBe(1)
    })

    test('should report sequence of literals', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const seq = createSequenceExpression([createLiteral(1), createLiteral(2), createLiteral(3)])
      visitor.ExpressionStatement(createExpressionStatement(seq))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting member expressions', () => {
    test('should report simple member access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      visitor.ExpressionStatement(createExpressionStatement(memberExpr))

      expect(reports.length).toBe(1)
    })

    test('should report computed member access with no side effects', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createLiteral('key'), true)
      visitor.ExpressionStatement(createExpressionStatement(memberExpr))

      expect(reports.length).toBe(1)
    })

    test('should report deep member access chain', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const inner = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const outer = createMemberExpression(inner, createIdentifier('c'))
      visitor.ExpressionStatement(createExpressionStatement(outer))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting chain expressions', () => {
    test('should report optional chain with no side effects', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const chainExpr = createChainExpression(memberExpr)
      visitor.ExpressionStatement(createExpressionStatement(chainExpr))

      expect(reports.length).toBe(1)
    })

    test('should report optional chain with computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const memberExpr = createMemberExpression(
        createIdentifier('obj'),
        createIdentifier('key'),
        true,
      )
      const chainExpr = createChainExpression(memberExpr)
      visitor.ExpressionStatement(createExpressionStatement(chainExpr))

      expect(reports.length).toBe(1)
    })
  })

  describe('NOT reporting valid expressions with side effects', () => {
    test('should NOT report assignment expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report compound assignment expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('+=')))
      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('-=')))
      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('*=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report function call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createCallExpression()))

      expect(reports.length).toBe(0)
    })

    test('should NOT report increment expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createUpdateExpression('++')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report decrement expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createUpdateExpression('--')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report new expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const newExpr = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Class' },
      }
      visitor.ExpressionStatement(createExpressionStatement(newExpr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report await expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const awaitExpr = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      }
      visitor.ExpressionStatement(createExpressionStatement(awaitExpr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report yield expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const yieldExpr = {
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'value' },
      }
      visitor.ExpressionStatement(createExpressionStatement(yieldExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT reporting unary expressions', () => {
    test('should NOT report logical NOT expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createUnaryExpression('!')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report void expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createUnaryExpression('void')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report typeof expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createUnaryExpression('typeof')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report delete expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createUnaryExpression('delete')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report unary minus expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createUnaryExpression('-')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report unary plus expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createUnaryExpression('+')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report bitwise NOT expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createUnaryExpression('~')))

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT reporting additional assignment operators', () => {
    test('should NOT report division assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('/=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report modulo assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('%=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report exponentiation assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('**=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report left shift assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('<<=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report right shift assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('>>=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report unsigned right shift assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('>>>=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report bitwise AND assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('&=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report bitwise OR assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('|=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report bitwise XOR assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('^=')))

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT reporting tagged template expressions', () => {
    test('should NOT report tagged template expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createTaggedTemplateExpression()))

      expect(reports.length).toBe(0)
    })

    test('should NOT report tagged template with arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const tagged = {
        type: 'TaggedTemplateExpression',
        tag: createCallExpression(createIdentifier('fn')),
        quasi: createTemplateLiteral(),
      }
      visitor.ExpressionStatement(createExpressionStatement(tagged))

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT reporting conditional expressions with side effects', () => {
    test('should NOT report ternary with call in test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const condExpr = createConditionalExpression(
        createCallExpression(),
        createIdentifier('b'),
        createIdentifier('c'),
      )
      visitor.ExpressionStatement(createExpressionStatement(condExpr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report ternary with call in consequent', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const condExpr = createConditionalExpression(
        createIdentifier('a'),
        createCallExpression(),
        createIdentifier('c'),
      )
      visitor.ExpressionStatement(createExpressionStatement(condExpr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report ternary with call in alternate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const condExpr = createConditionalExpression(
        createIdentifier('a'),
        createIdentifier('b'),
        createCallExpression(),
      )
      visitor.ExpressionStatement(createExpressionStatement(condExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT reporting sequence expressions with side effects', () => {
    test('should NOT report sequence with one function call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const seq = createSequenceExpression([createCallExpression(), createIdentifier('x')])
      visitor.ExpressionStatement(createExpressionStatement(seq))

      expect(reports.length).toBe(0)
    })

    test('should NOT report sequence with all function calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const seq = createSequenceExpression([createCallExpression(), createCallExpression()])
      visitor.ExpressionStatement(createExpressionStatement(seq))

      expect(reports.length).toBe(0)
    })

    test('should NOT report sequence with assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const seq = createSequenceExpression([createAssignmentExpression('='), createIdentifier('x')])
      visitor.ExpressionStatement(createExpressionStatement(seq))

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT reporting member expressions with side effects', () => {
    test('should NOT report member access on call result', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const memberExpr = createMemberExpression(createCallExpression(), createIdentifier('prop'))
      visitor.ExpressionStatement(createExpressionStatement(memberExpr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report computed member with call as property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const memberExpr = createMemberExpression(
        createIdentifier('obj'),
        createCallExpression(),
        true,
      )
      visitor.ExpressionStatement(createExpressionStatement(memberExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT reporting chain expressions with side effects', () => {
    test('should NOT report optional chain with call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const chainExpr = createChainExpression(createCallExpression())
      visitor.ExpressionStatement(createExpressionStatement(chainExpr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report optional chain with member on call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const member = createMemberExpression(createCallExpression(), createIdentifier('prop'))
      const chainExpr = createChainExpression(member)
      visitor.ExpressionStatement(createExpressionStatement(chainExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting nested expressions without side effects', () => {
    test('should report binary expression with literals', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createBinaryExpression('+', createLiteral(1), createLiteral(2))
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with identifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createLogicalExpression('&&')
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(1)
    })

    test('should report deeply nested binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const inner = createBinaryExpression('+', createLiteral(1), createLiteral(2))
      const outer = createBinaryExpression('*', inner, createLiteral(3))
      visitor.ExpressionStatement(createExpressionStatement(outer))

      expect(reports.length).toBe(1)
    })

    test('should report binary expression with identifier operands', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with mixed operands', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createLogicalExpression(
        '||',
        createBinaryExpression('>', createIdentifier('a'), createLiteral(0)),
        createIdentifier('b'),
      )
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(1)
    })

    test('should report mixed binary and logical nesting', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const inner = createBinaryExpression('+', createIdentifier('a'), createLiteral(1))
      const outer = createLogicalExpression('&&', inner, createIdentifier('b'))
      visitor.ExpressionStatement(createExpressionStatement(outer))

      expect(reports.length).toBe(1)
    })
  })

  describe('nested expressions with side effects', () => {
    test('should NOT report binary expression with assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createBinaryExpression('+', createAssignmentExpression('='), createLiteral(1))
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report logical expression with function call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createLogicalExpression('&&', createIdentifier('x'), createCallExpression())
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report binary expression with update in left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createBinaryExpression('+', createUpdateExpression('++'), createLiteral(1))
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report binary expression with call in right', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createBinaryExpression('+', createLiteral(1), createCallExpression())
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report logical expression with assignment in right', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createLogicalExpression(
        '||',
        createIdentifier('x'),
        createAssignmentExpression('='),
      )
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report logical expression with new expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const newExpr = { type: 'NewExpression', callee: { type: 'Identifier', name: 'Cls' } }
      const expr = createLogicalExpression('&&', createIdentifier('x'), newExpr)
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(() => visitor.ExpressionStatement(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(() => visitor.ExpressionStatement('string')).not.toThrow()
      expect(() => visitor.ExpressionStatement(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        expression: createBinaryExpression('+'),
      }
      visitor.ExpressionStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without expression property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
      }
      visitor.ExpressionStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: null,
      }
      visitor.ExpressionStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

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
        getSource: () => 'x + 1',
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

      const visitor = noUnusedExpressionsRule.create(context)
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })

    test('should handle NaN as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(() => visitor.ExpressionStatement(NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Infinity as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(() => visitor.ExpressionStatement(Infinity)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(() => visitor.ExpressionStatement([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(() => visitor.ExpressionStatement(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle expression as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: 42,
      }
      visitor.ExpressionStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle expression as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: 'hello',
      }
      visitor.ExpressionStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: createBinaryExpression('+'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10],
        trailingComments: [],
      }
      visitor.ExpressionStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested binary expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      let expr: unknown = createLiteral(1)
      for (let i = 0; i < 10; i++) {
        expr = createBinaryExpression('+', expr, createLiteral(i))
      }
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(1)
    })

    test('should handle config with null options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: null },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnusedExpressionsRule.create(context)
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })

    test('should handle config with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnusedExpressionsRule.create(context)
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })

    test('should handle node with falsey but existent expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: 0,
      }
      visitor.ExpressionStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty string expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: '',
      }
      visitor.ExpressionStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle prefix increment expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const updateExpr = {
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      }
      visitor.ExpressionStatement(createExpressionStatement(updateExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for unused expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 3, 2))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('should report location for literal expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLiteral(42), 7, 4))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location for identifier expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createIdentifier('x'), 15, 20))

      expect(reports[0].loc?.start.line).toBe(15)
    })

    test('should report location for logical expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLogicalExpression('&&'), 2, 8))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: createBinaryExpression('+'),
      }
      visitor.ExpressionStatement(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle large line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle large column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 1, 5000))

      expect(reports[0].loc?.start.column).toBe(5000)
    })

    test('should report different locations for different expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 1, 0))
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('-'), 2, 5))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should handle node with loc containing only start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: createBinaryExpression('+'),
        loc: {
          start: { line: 5, column: 3 },
        },
      }
      visitor.ExpressionStatement(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle node with partial loc - missing end column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: createBinaryExpression('+'),
        loc: {
          start: { line: 3, column: 1 },
          end: { line: 3 },
        },
      }
      visitor.ExpressionStatement(node)

      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should provide end column from createExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 4, 6))

      expect(reports[0].loc?.end.column).toBe(16)
    })

    test('should preserve location for nested binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const inner = createBinaryExpression('+', createLiteral(1), createLiteral(2))
      visitor.ExpressionStatement(createExpressionStatement(inner, 10, 0))

      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should handle zero line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: createBinaryExpression('+'),
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      }
      visitor.ExpressionStatement(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention unused expression in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports[0].message).toContain('Unused expression')
    })

    test('should mention no effect in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports[0].message).toContain('no effect')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))
      visitor.ExpressionStatement(createExpressionStatement(createLogicalExpression('&&')))

      expect(reports[0].message).toBe('Unused expression - this code has no effect')
      expect(reports[1].message).toBe('Unused expression - this code has no effect')
    })

    test('should have string message for literal expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLiteral(42)))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have same message for all expression types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))
      visitor.ExpressionStatement(createExpressionStatement(createLiteral('x')))
      visitor.ExpressionStatement(createExpressionStatement(createIdentifier('y')))
      visitor.ExpressionStatement(createExpressionStatement(createLogicalExpression('||')))

      const expected = 'Unused expression - this code has no effect'
      for (const report of reports) {
        expect(report.message).toBe(expected)
      }
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('*')))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should include both message and location in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 5, 3))

      expect(reports[0].message).toBeDefined()
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].message).toContain('Unused')
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should not include expression type in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports[0].message).not.toContain('BinaryExpression')
      expect(reports[0].message).not.toContain('+')
    })

    test('should have consistent message for deeply nested expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      let expr: unknown = createLiteral(1)
      for (let i = 0; i < 5; i++) {
        expr = createBinaryExpression('+', expr, createLiteral(i))
      }
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports[0].message).toBe('Unused expression - this code has no effect')
    })
  })

  describe('multiple reports', () => {
    test('should report each unused expression independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('-')))

      expect(reports.length).toBe(2)
    })

    test('should report three unused expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))
      visitor.ExpressionStatement(createExpressionStatement(createLiteral(1)))
      visitor.ExpressionStatement(createExpressionStatement(createIdentifier('x')))

      expect(reports.length).toBe(3)
    })

    test('should not report valid expressions mixed with invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))
      visitor.ExpressionStatement(createExpressionStatement(createCallExpression()))
      visitor.ExpressionStatement(createExpressionStatement(createLiteral(1)))

      expect(reports.length).toBe(2)
    })

    test('should report zero when all expressions are valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createCallExpression()))
      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('=')))
      visitor.ExpressionStatement(createExpressionStatement(createUpdateExpression('++')))

      expect(reports.length).toBe(0)
    })

    test('should report all when all expressions are invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))
      }

      expect(reports.length).toBe(5)
    })

    test('should maintain report order', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 1, 0))
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('-'), 5, 0))
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('*'), 10, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should report same expression at different locations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createBinaryExpression('+')
      visitor.ExpressionStatement(createExpressionStatement(expr, 1, 0))
      visitor.ExpressionStatement(createExpressionStatement(expr, 2, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })

    test('should handle alternating valid and invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createCallExpression()))
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))
      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('=')))
      visitor.ExpressionStatement(createExpressionStatement(createLiteral(1)))

      expect(reports.length).toBe(2)
    })

    test('should handle many reports without errors', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.ExpressionStatement(
          createExpressionStatement(createBinaryExpression('+'), i + 1, 0),
        )
      }

      expect(reports.length).toBe(50)
    })

    test('should handle valid-then-invalid-then-valid pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('=')))
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('===')))
      visitor.ExpressionStatement(createExpressionStatement(createCallExpression()))
      visitor.ExpressionStatement(createExpressionStatement(createLiteral(true)))

      expect(reports.length).toBe(2)
    })
  })

  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/custom/path.ts' })
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === 1', filePath: '/src/file.ts' })
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('===')))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })

    test('should work with options having custom properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ custom: true, value: 42 }] })
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })

    test('should work with multiple calls to create', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const visitor1 = noUnusedExpressionsRule.create(ctx1)
      const visitor2 = noUnusedExpressionsRule.create(ctx2)

      visitor1.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))
      visitor2.ExpressionStatement(createExpressionStatement(createCallExpression()))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should not affect other visitor instances', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const v1 = noUnusedExpressionsRule.create(ctx1)
      const v2 = noUnusedExpressionsRule.create(ctx2)

      v1.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))
      v1.ExpressionStatement(createExpressionStatement(createBinaryExpression('*')))

      expect(r1.length).toBe(2)
      expect(r2.length).toBe(0)

      v2.ExpressionStatement(createExpressionStatement(createLiteral(1)))
      expect(r2.length).toBe(1)
    })

    test('should work with long file path', () => {
      const longPath = '/very/deep/nested/directory/structure/src/components/utils/helpers.ts'
      const { context, reports } = createMockRuleContext({ filePath: longPath })
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })

    test('should work with source containing unicode', () => {
      const { context, reports } = createMockRuleContext({ source: 'const 你好 = 1;', filePath: '/src/file.ts' })
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })

    test('should handle context with minimal config', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '',
      } as unknown as RuleContext

      const visitor = noUnusedExpressionsRule.create(context)
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })

    test('should handle workspaceRoot correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'x + 1', filePath: '/home/user/project/src/file.ts' })
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })
  })

  describe('idempotency and immutability', () => {
    test('should not modify input node', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = createExpressionStatement(createBinaryExpression('+'), 1, 0)
      const originalExpression = (node as Record<string, unknown>).expression
      visitor.ExpressionStatement(node)
      expect((node as Record<string, unknown>).expression).toBe(originalExpression)
    })

    test('should not modify context during detection', () => {
      const { context, reports } = createMockRuleContext()
      const originalGetFilePath = context.getFilePath

      const visitor = noUnusedExpressionsRule.create(context)
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(context.getFilePath).toBe(originalGetFilePath)
      expect(reports.length).toBe(1)
    })

    test('should handle call on member expression callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('method'))
      const callExpr = createCallExpression(memberExpr)
      visitor.ExpressionStatement(createExpressionStatement(callExpr))

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested member then call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const inner = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const outer = createMemberExpression(inner, createIdentifier('c'))
      const call = createCallExpression(outer)
      visitor.ExpressionStatement(createExpressionStatement(call))

      expect(reports.length).toBe(0)
    })

    test('should report ArrayExpression without side effects', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const arrayExpr = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), createLiteral(2)],
      }
      visitor.ExpressionStatement(createExpressionStatement(arrayExpr))

      expect(reports.length).toBe(1)
    })

    test('should report ObjectExpression without side effects', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const objectExpr = {
        type: 'ObjectExpression',
        properties: [{ type: 'Property', key: createIdentifier('a'), value: createLiteral(1) }],
      }
      visitor.ExpressionStatement(createExpressionStatement(objectExpr))

      expect(reports.length).toBe(1)
    })

    test('should report ArrowFunctionExpression as unused', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: createLiteral(1),
      }
      visitor.ExpressionStatement(createExpressionStatement(arrowExpr))

      expect(reports.length).toBe(1)
    })

    test('should report FunctionExpression as unused', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.ExpressionStatement(createExpressionStatement(funcExpr))

      expect(reports.length).toBe(1)
    })

    test('should handle prefix decrement expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const updateExpr = {
        type: 'UpdateExpression',
        operator: '--',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      }
      visitor.ExpressionStatement(createExpressionStatement(updateExpr))

      expect(reports.length).toBe(0)
    })

    test('should report empty array expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const emptyArray = { type: 'ArrayExpression', elements: [] }
      visitor.ExpressionStatement(createExpressionStatement(emptyArray))

      expect(reports.length).toBe(1)
    })

    test('should report empty object expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const emptyObject = { type: 'ObjectExpression', properties: [] }
      visitor.ExpressionStatement(createExpressionStatement(emptyObject))

      expect(reports.length).toBe(1)
    })

    test('should handle sequence with update expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const seq = createSequenceExpression([createUpdateExpression('++'), createIdentifier('x')])
      visitor.ExpressionStatement(createExpressionStatement(seq))

      expect(reports.length).toBe(0)
    })

    test('should handle conditional with assignment in all branches', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const cond = createConditionalExpression(
        createIdentifier('flag'),
        createAssignmentExpression('='),
        createAssignmentExpression('+='),
      )
      visitor.ExpressionStatement(createExpressionStatement(cond))

      expect(reports.length).toBe(0)
    })

    test('should handle member expression with computed number index', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('arr'), createLiteral(0), true)
      visitor.ExpressionStatement(createExpressionStatement(memberExpr))

      expect(reports.length).toBe(1)
    })
  })

  describe('binary operators via test.each', () => {
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
      ['in'],
      ['instanceof'],
    ] as const)('should report binary expression with operator "%s"', (operator) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression(operator)))

      expect(reports.length).toBe(1)
    })
  })

  describe('assignment operators not reported via test.each', () => {
    test.each([
      ['='],
      ['+='],
      ['-='],
      ['*='],
      ['/='],
      ['%='],
      ['**='],
      ['<<='],
      ['>>='],
      ['>>>='],
      ['&='],
      ['|='],
      ['^='],
    ] as const)('should NOT report assignment expression with operator "%s"', (operator) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression(operator)))

      expect(reports.length).toBe(0)
    })
  })

  describe('logical operators via test.each', () => {
    test.each([['&&'], ['||'], ['??']] as const)(
      'should report logical expression with operator "%s"',
      (operator) => {
        const { context, reports } = createMockRuleContext()
        const visitor = noUnusedExpressionsRule.create(context)

        visitor.ExpressionStatement(createExpressionStatement(createLogicalExpression(operator)))

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('unary operators not reported via test.each', () => {
    test.each([['!'], ['void'], ['typeof'], ['delete'], ['-'], ['+'], ['~']] as const)(
      'should NOT report unary expression with operator "%s"',
      (operator) => {
        const { context, reports } = createMockRuleContext()
        const visitor = noUnusedExpressionsRule.create(context)

        visitor.ExpressionStatement(createExpressionStatement(createUnaryExpression(operator)))

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('literal types via test.each', () => {
    test.each([
      [42, 'number'],
      ['hello', 'string'],
      [true, 'boolean'],
      [null, 'null'],
      [undefined, 'undefined'],
    ])('should report %s literal (type: %s)', (value, _typeLabel) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLiteral(value)))

      expect(reports.length).toBe(1)
    })
  })

  describe('update operators not reported via test.each', () => {
    test.each([['++'], ['--']] as const)(
      'should NOT report update expression with operator "%s"',
      (operator) => {
        const { context, reports } = createMockRuleContext()
        const visitor = noUnusedExpressionsRule.create(context)

        visitor.ExpressionStatement(createExpressionStatement(createUpdateExpression(operator)))

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('side-effect expression types via test.each', () => {
    test.each([
      ['CallExpression', { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } }],
      ['NewExpression', { type: 'NewExpression', callee: { type: 'Identifier', name: 'Cls' } }],
      ['AwaitExpression', { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } }],
      ['YieldExpression', { type: 'YieldExpression', argument: { type: 'Identifier', name: 'v' } }],
    ] as const)('should NOT report %s', (_typeName, expr) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge case nodes via test.each', () => {
    test.each([
      [null, 'null node'],
      [undefined, 'undefined node'],
      ['string', 'string node'],
      [123, 'number node'],
      [true, 'boolean node'],
    ] as const)('should not report for %s', (node, _label) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('binary operator in nested expression via test.each', () => {
    test.each([
      ['+', createLiteral(1), createLiteral(2)],
      ['-', createIdentifier('a'), createLiteral(0)],
      ['*', createLiteral(2), createIdentifier('b')],
      ['===', createIdentifier('x'), createLiteral(1)],
      ['&&', createIdentifier('a'), createIdentifier('b')],
    ] as const)(
      'should report nested binary(%s) in logical expression',
      (operator, left, right) => {
        const { context, reports } = createMockRuleContext()
        const visitor = noUnusedExpressionsRule.create(context)

        const inner = createBinaryExpression(operator, left, right)
        const outer = createLogicalExpression('||', inner, createLiteral(false))
        visitor.ExpressionStatement(createExpressionStatement(outer))

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('location at various positions via test.each', () => {
    test.each([
      [1, 0],
      [5, 3],
      [10, 20],
      [100, 0],
      [1, 50],
    ] as const)('should report correct location at line %d, column %d', (line, column) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(
        createExpressionStatement(createBinaryExpression('+'), line, column),
      )

      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })
  })
})
