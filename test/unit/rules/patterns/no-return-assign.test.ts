import { describe, test, expect, vi } from 'vitest'
import { noReturnAssignRule } from '../../../../src/rules/patterns/no-return-assign.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'return x;',
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
    config: { rules: { 'no-return-assign': ['error', options] } },
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

function createReturnStatement(argument: unknown, lineNumber = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: argument,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 10 },
    },
  }
}

function createAssignmentExpression(operator: string = '=', lineNumber = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: operator,
    left: { type: 'Identifier', name: 'a' },
    right: { type: 'Identifier', name: 'b' },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 5 },
    },
  }
}

function createIdentifier(name: string = 'x'): unknown {
  return {
    type: 'Identifier',
    name: name,
  }
}

describe('no-return-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noReturnAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noReturnAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noReturnAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noReturnAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noReturnAssignRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noReturnAssignRule.meta.fixable).toBeUndefined()
    })

    test('should mention return in description', () => {
      const desc = noReturnAssignRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('return')
    })

    test('should mention assignment in description', () => {
      const desc = noReturnAssignRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/assign/)
    })

    test('should have empty schema array', () => {
      expect(noReturnAssignRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with ReturnStatement method', () => {
      const { context } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(visitor).toHaveProperty('ReturnStatement')
    })
  })

  describe('detecting return with assignment', () => {
    test('should report return with assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for return with assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].message).toBe('Return statement should not contain assignment.')
    })

    test('should report return with += assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('+=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with -= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('-=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with *= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('*=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with /= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('/=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with %= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('%=')))

      expect(reports.length).toBe(1)
    })
  })

  describe('compound assignment operators', () => {
    test('should report return with <<= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('<<=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with >>= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('>>=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with >>>= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('>>>=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with &= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('&=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with |= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('|=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with ^= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('^=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with **= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('**=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with &&= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('&&=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with ||= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('||=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with ??= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('??=')))

      expect(reports.length).toBe(1)
    })

    test('should report all compound operators with consistent message', () => {
      const operators = [
        '=',
        '+=',
        '-=',
        '*=',
        '/=',
        '%=',
        '<<=',
        '>>=',
        '>>>=',
        '&=',
        '|=',
        '^=',
        '**=',
        '&&=',
        '||=',
        '??=',
      ]
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (const op of operators) {
        visitor.ReturnStatement(createReturnStatement(createAssignmentExpression(op)))
      }

      expect(reports.length).toBe(operators.length)
      for (const report of reports) {
        expect(report.message).toBe('Return statement should not contain assignment.')
      }
    })

    test('should produce exactly one report per compound assignment operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('&=')))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('x')))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('|=')))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('y')))

      expect(reports.length).toBe(2)
    })
  })

  describe('not reporting regular return statements', () => {
    test('should not report return with identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('x')))

      expect(reports.length).toBe(0)
    })

    test('should not report return with literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const literal = {
        type: 'Literal',
        value: 42,
      }
      visitor.ReturnStatement(createReturnStatement(literal))

      expect(reports.length).toBe(0)
    })

    test('should not report return with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const returnNode = {
        type: 'ReturnStatement',
        argument: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ReturnStatement(returnNode)

      expect(reports.length).toBe(0)
    })

    test('should not report return with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const returnNode = {
        type: 'ReturnStatement',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ReturnStatement(returnNode)

      expect(reports.length).toBe(0)
    })

    test('should not report return with binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(binaryExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      }
      visitor.ReturnStatement(createReturnStatement(callExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('safe return expressions', () => {
    test('should not report return with conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const condExpr = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(condExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(logicalExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }
      visitor.ReturnStatement(createReturnStatement(memberExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const arrayExpr = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
        ],
      }
      visitor.ReturnStatement(createReturnStatement(arrayExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const objectExpr = {
        type: 'ObjectExpression',
        properties: [],
      }
      visitor.ReturnStatement(createReturnStatement(objectExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const unaryExpr = {
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
      }
      visitor.ReturnStatement(createReturnStatement(unaryExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with update expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const updateExpr = {
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: false,
      }
      visitor.ReturnStatement(createReturnStatement(updateExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const newExpr = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyClass' },
        arguments: [],
      }
      visitor.ReturnStatement(createReturnStatement(newExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const seqExpr = {
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'a' }],
      }
      visitor.ReturnStatement(createReturnStatement(seqExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const templateLit = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }
      visitor.ReturnStatement(createReturnStatement(templateLit))

      expect(reports.length).toBe(0)
    })

    test('should not report return with arrow function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Identifier', name: 'x' },
      }
      visitor.ReturnStatement(createReturnStatement(arrowExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.ReturnStatement(createReturnStatement(funcExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with tagged template expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const taggedExpr = {
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }
      visitor.ReturnStatement(createReturnStatement(taggedExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const yieldExpr = {
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'x' },
      }
      visitor.ReturnStatement(createReturnStatement(yieldExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const awaitExpr = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetch' },
          arguments: [],
        },
      }
      visitor.ReturnStatement(createReturnStatement(awaitExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple return statements', () => {
    test('should report multiple returns with assignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=', 1, 0)))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('x')))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('+=', 2, 0)))

      expect(reports.length).toBe(2)
    })

    test('should not report any returns without assignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('x')))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('y')))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('z')))

      expect(reports.length).toBe(0)
    })
  })

  describe('mixed return sequences', () => {
    test('should report only the assignment returns in a mixed sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('a')))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('b')))

      expect(reports.length).toBe(1)
    })

    test('should report all-assignment sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('+=')))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('-=')))

      expect(reports.length).toBe(3)
    })

    test('should handle alternating safe and unsafe returns', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.ReturnStatement(createReturnStatement(createIdentifier(`x${i}`)))
        visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
      }

      expect(reports.length).toBe(5)
    })

    test('should report zero for all-safe long sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.ReturnStatement(createReturnStatement(createIdentifier(`x${i}`)))
      }

      expect(reports.length).toBe(0)
    })

    test('should report all for all-unsafe long sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
      }

      expect(reports.length).toBe(20)
    })

    test('should handle single safe return', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('only')))

      expect(reports.length).toBe(0)
    })

    test('should handle single unsafe return', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should report after many safe returns', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.ReturnStatement(createReturnStatement(createIdentifier(`x${i}`)))
      }
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should count reports accurately for interleaved pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const safeTypes = [
        { type: 'Literal', value: 1 },
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'f' }, arguments: [] },
        {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'o' },
          property: { type: 'Identifier', name: 'p' },
        },
        {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 't' },
          consequent: { type: 'Identifier', name: 'c' },
          alternate: { type: 'Identifier', name: 'a' },
        },
      ]

      for (const expr of safeTypes) {
        visitor.ReturnStatement(createReturnStatement(expr))
      }
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
      for (const expr of safeTypes) {
        visitor.ReturnStatement(createReturnStatement(expr))
      }
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('+=')))

      expect(reports.length).toBe(2)
    })

    test('should not affect report count when visitor is called with safe nodes after unsafe ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('*=')))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('z')))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('w')))

      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(() => visitor.ReturnStatement('string')).not.toThrow()
      expect(() => visitor.ReturnStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const node = {
        argument: createAssignmentExpression('='),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ReturnStatement without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty rule config', () => {
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
        getSource: () => 'return a = b;',
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

      const visitor = noReturnAssignRule.create(context)
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should handle argument that is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: 'string',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('additional edge cases', () => {
    test('should handle boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(() => visitor.ReturnStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(() => visitor.ReturnStatement(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({ type: 42 })

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({ type: null })

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({ type: { name: 'ReturnStatement' } })

      expect(reports.length).toBe(0)
    })

    test('should handle argument that is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle argument that is a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle argument that is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle argument that is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle argument with wrong type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(
        createReturnStatement({
          type: 'SomethingElse',
          operator: '=',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive for AssignmentExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(
        createReturnStatement({
          type: 'assignmentexpression',
          operator: '=',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive for ReturnStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'returnstatement',
        argument: createAssignmentExpression('='),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested argument that is not AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const deeplyNested = {
        type: 'BinaryExpression',
        operator: '+',
        left: {
          type: 'BinaryExpression',
          operator: '*',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Identifier', name: 'c' },
      }
      visitor.ReturnStatement(createReturnStatement(deeplyNested))

      expect(reports.length).toBe(0)
    })

    test('should handle argument with type as empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement({ type: '' }))

      expect(reports.length).toBe(0)
    })

    test('should handle NaN as node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(() => visitor.ReturnStatement(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle BigInt as node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(() => visitor.ReturnStatement(BigInt(0))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Symbol as node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(() => visitor.ReturnStatement(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with only loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle ReturnStatement with argument having type AssignmentExpression but as a string variant', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(
        createReturnStatement({
          type: 'ASSIGNMENTEXPRESSION',
          operator: '=',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for return with assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('detailed location reporting', () => {
    test('should report correct end line', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 3, 0))

      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 1, 5))

      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 1, 500))

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
      })

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report default location when loc is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
        loc: null,
      })

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report default location when loc is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
        loc: undefined,
      })

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report default location when loc has missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
        loc: { end: { line: 2, column: 5 } },
      })

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report default location when loc has missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
        loc: { start: { line: 5, column: 3 } },
      })

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle multiple reports with different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 1, 0))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('+='), 10, 5))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('-='), 100, 20))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[2].loc?.start.line).toBe(100)
    })

    test('should preserve location for each report independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 5, 10))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 50, 100))

      expect(reports[0].loc?.start.line).not.toBe(reports[1].loc?.start.line)
      expect(reports[0].loc?.start.column).not.toBe(reports[1].loc?.start.column)
    })

    test('should report location for different operators on same line', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=', 3, 0), 3, 0))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('+=', 3, 15), 3, 15))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('-=', 3, 30), 3, 30))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.column).toBe(15)
      expect(reports[2].loc?.start.line).toBe(3)
      expect(reports[2].loc?.start.column).toBe(30)
    })

    test('should handle loc with non-numeric line gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
        loc: {
          start: { line: 'abc', column: 0 },
          end: { line: 'abc', column: 5 },
        },
      })

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-numeric column gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
        loc: {
          start: { line: 1, column: 'zero' },
          end: { line: 1, column: 'five' },
        },
      })

      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention return in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].message).toContain('Return')
    })

    test('should mention assignment in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].message).toContain('assignment')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('+='), 2, 0))

      expect(reports[0].message).toBe('Return statement should not contain assignment.')
      expect(reports[1].message).toBe('Return statement should not contain assignment.')
    })
  })

  describe('extended message quality', () => {
    test('should have same message regardless of operator', () => {
      const operators = ['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=']
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (const op of operators) {
        visitor.ReturnStatement(createReturnStatement(createAssignmentExpression(op)))
      }

      const messages = reports.map((r) => r.message)
      const unique = [...new Set(messages)]
      expect(unique.length).toBe(1)
      expect(unique[0]).toBe('Return statement should not contain assignment.')
    })

    test('should have same message across different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=', 1, 0)))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=', 100, 50)))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=', 999, 0)))

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have message that is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should not include operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('+=')))

      expect(reports[0].message).not.toContain('+=')
    })

    test('should not include variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].message).not.toContain('a = b')
    })

    test('should mention should not in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].message).toContain('should not')
    })
  })

  describe('visitor and context', () => {
    test('should return visitor that is an object', () => {
      const { context } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should have ReturnStatement as a function', () => {
      const { context } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noReturnAssignRule.create(ctx1)
      const visitor2 = noReturnAssignRule.create(ctx2)

      visitor1.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
      visitor2.ReturnStatement(createReturnStatement(createIdentifier('x')))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should handle context with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path/file.ts')
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should handle context with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'return x = y;')
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should work with context having empty config', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should work when called multiple times on same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
      }

      expect(reports.length).toBe(10)
    })

    test('should have only ReturnStatement method on visitor', () => {
      const { context } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const keys = Object.keys(visitor)
      expect(keys).toEqual(['ReturnStatement'])
    })
  })

  describe('assignment expression structure', () => {
    test('should report when left side is a member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        right: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report when right side is a call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'result' },
        right: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report when right side is a binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'sum' },
        right: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report when left side is a destructuring pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'ObjectPattern',
          properties: [],
        },
        right: { type: 'Identifier', name: 'obj' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report when both sides are member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
        },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'c' },
          property: { type: 'Identifier', name: 'd' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report when assignment has no operator property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report when assignment has no left property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report when assignment has no right property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report assignment with empty operator string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report chained assignment (nested AssignmentExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const chainedAssign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'b' },
          right: { type: 'Identifier', name: 'c' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ReturnStatement(createReturnStatement(chainedAssign))

      expect(reports.length).toBe(1)
    })

    test('should not confuse LogicalExpression with AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const logicalAssign = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(logicalAssign))

      expect(reports.length).toBe(0)
    })

    test('should not confuse BinaryExpression with AssignmentExpression even with = in operator name', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '==',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(binaryExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('meta docs properties', () => {
    test('should have docs property', () => {
      expect(noReturnAssignRule.meta.docs).toBeDefined()
    })

    test('should have description in docs', () => {
      expect(noReturnAssignRule.meta.docs?.description).toBeDefined()
      expect(typeof noReturnAssignRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect((noReturnAssignRule.meta.docs?.description ?? '').length).toBeGreaterThan(0)
    })

    test('should have url in docs', () => {
      expect(noReturnAssignRule.meta.docs?.url).toBeDefined()
    })

    test('should have url containing codeforge', () => {
      expect(noReturnAssignRule.meta.docs?.url).toContain('codeforge')
    })

    test('should not be deprecated', () => {
      expect(noReturnAssignRule.meta.deprecated).toBeUndefined()
    })
  })

  describe('rule export', () => {
    test('should have create method', () => {
      expect(typeof noReturnAssignRule.create).toBe('function')
    })

    test('should have meta property', () => {
      expect(noReturnAssignRule.meta).toBeDefined()
    })

    test('should have create as a regular function', () => {
      expect(typeof noReturnAssignRule.create).toBe('function')
      expect(noReturnAssignRule.create.prototype).toBeUndefined()
    })

    test('should produce consistent results for same input', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const v1 = noReturnAssignRule.create(ctx1)
      const v2 = noReturnAssignRule.create(ctx2)

      const node = createReturnStatement(createAssignmentExpression('='))
      v1.ReturnStatement(node)
      v2.ReturnStatement(node)

      expect(r1.length).toBe(r2.length)
      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should not mutate input node', () => {
      const { context } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const node = createReturnStatement(createAssignmentExpression('=')) as Record<string, unknown>
      const originalType = (node as Record<string, unknown>).type
      visitor.ReturnStatement(node)

      expect((node as Record<string, unknown>).type).toBe(originalType)
    })
  })

  describe('bulk operations', () => {
    test('should handle 100 consecutive unsafe returns', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
      }

      expect(reports.length).toBe(100)
    })

    test('should handle 100 consecutive safe returns', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.ReturnStatement(createReturnStatement(createIdentifier(`x${i}`)))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle alternating returns in bulk', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) {
          visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
        } else {
          visitor.ReturnStatement(createReturnStatement(createIdentifier('x')))
        }
      }

      expect(reports.length).toBe(25)
    })

    test('should handle mixed types in bulk', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const safeExprs = [
        { type: 'Literal', value: 42 },
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'f' }, arguments: [] },
        {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        { type: 'Identifier', name: 'x' },
        {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'o' },
          property: { type: 'Identifier', name: 'p' },
        },
      ]

      for (let i = 0; i < 50; i++) {
        visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
        visitor.ReturnStatement(createReturnStatement(safeExprs[i % safeExprs.length]))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle one unsafe in 200 returns', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (let i = 0; i < 200; i++) {
        if (i === 100) {
          visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
        } else {
          visitor.ReturnStatement(createReturnStatement(createIdentifier(`x${i}`)))
        }
      }

      expect(reports.length).toBe(1)
    })
  })

  describe('return statement argument variations', () => {
    test('should not report bare return (no argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with argument set to 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 0,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with argument set to empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: '',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with argument set to false', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with argument as empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with argument that has no type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report when argument is exactly AssignmentExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 10 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('context variations', () => {
    test('should work with context having extra config rules', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'return a = b;',
        getTokens: () => [],
        getComments: () => [],
        config: {
          rules: {
            'no-return-assign': ['error'],
            'no-eval': ['warn'],
            'max-params': ['error', { max: 3 }],
          },
        },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noReturnAssignRule.create(context)
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should work when getAST returns an object', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => ({ type: 'Program', body: [] }),
        getSource: () => 'return a = b;',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-return-assign': ['error'] } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noReturnAssignRule.create(context)
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should work when getTokens returns tokens', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'return a = b;',
        getTokens: () => [{ type: 'Keyword', value: 'return' }],
        getComments: () => [],
        config: { rules: { 'no-return-assign': ['error'] } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noReturnAssignRule.create(context)
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should work when getComments returns comments', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'return a = b;',
        getTokens: () => [],
        getComments: () => [{ type: 'Line', value: ' comment' }],
        config: { rules: { 'no-return-assign': ['error'] } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noReturnAssignRule.create(context)
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspaceRoot', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'return a = b;',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-return-assign': ['error'] } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noReturnAssignRule.create(context)
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })
  })

  describe('loc variations on assignment expression', () => {
    test('should report when assignment expression has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: assign,
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 15 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report when ReturnStatement loc has zero values', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report when ReturnStatement loc start > end', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
        loc: { start: { line: 10, column: 5 }, end: { line: 5, column: 10 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report when ReturnStatement loc has negative values', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
        loc: { start: { line: -1, column: -5 }, end: { line: -1, column: 0 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should report when loc is an empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
        loc: {},
      })

      expect(reports.length).toBe(1)
    })

    test('should report when loc.start is an empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
        loc: { start: {}, end: {} },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('comparison operators are not assignments', () => {
    test('should not report return with equality check (==)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '==',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(binaryExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with strict equality (===)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(binaryExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with inequality (!=)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '!=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(binaryExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with strict inequality (!==)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '!==',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(binaryExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with greater than (>)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '>',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(binaryExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with less than (<)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '<',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(binaryExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with greater than or equal (>=)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '>=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(binaryExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with less than or equal (<=)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '<=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(binaryExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('type sensitivity', () => {
    test('should only match exact AssignmentExpression type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const variations = [
        'assignmentExpression',
        'assignment_expression',
        'AssignmentExpressions',
        'assignmentexpression',
      ]

      for (const typeStr of variations) {
        visitor.ReturnStatement(
          createReturnStatement({
            type: typeStr,
            operator: '=',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          }),
        )
      }

      expect(reports.length).toBe(0)
    })

    test('should only match exact ReturnStatement type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const variations = [
        'returnStatement',
        'return_statement',
        'ReturnStatements',
        'returnstatement',
      ]

      for (const typeStr of variations) {
        visitor.ReturnStatement({
          type: typeStr,
          argument: createAssignmentExpression('='),
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        })
      }

      expect(reports.length).toBe(0)
    })

    test('should not report when argument type is a subtype-like string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(
        createReturnStatement({
          type: 'AssignmentExpressionLike',
          operator: '=',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should report when argument type is exactly AssignmentExpression with no extra chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(
        createReturnStatement({
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('report descriptor completeness', () => {
    test('report should always have both message and loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].message).toBeDefined()
      expect(reports[0].loc).toBeDefined()
    })

    test('report loc should always have start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start should have line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end should have line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('every report in a batch should have complete descriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), i + 1, 0))
      }

      for (const report of reports) {
        expect(report.message).toBe('Return statement should not contain assignment.')
        expect(report.loc).toBeDefined()
        expect(report.loc?.start).toBeDefined()
        expect(report.loc?.end).toBeDefined()
      }
    })
  })

  describe('assignment with complex right-hand side', () => {
    test('should report return with ternary on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report return with object literal on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: { type: 'Identifier', name: 'a' },
              value: { type: 'Literal', value: 1 },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report return with array literal on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'arr' },
        right: {
          type: 'ArrayExpression',
          elements: [
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report return with function call on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'result' },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Math' },
            property: { type: 'Identifier', name: 'max' },
          },
          arguments: [
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report return with arrow function on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'fn' },
        right: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report return with await on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'data' },
        right: {
          type: 'AwaitExpression',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fetch' },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report return with template literal on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'str' },
        right: {
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hello ' } }],
          expressions: [{ type: 'Identifier', name: 'name' }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report return with new expression on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'instance' },
        right: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'MyClass' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report return with typeof on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 't' },
        right: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report return with logical AND on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'val' },
        right: {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report return with nullish coalescing on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'val' },
        right: {
          type: 'LogicalExpression',
          operator: '??',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Literal', value: null },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })

    test('should report return with spread element on right side via array', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'arr' },
        right: {
          type: 'ArrayExpression',
          elements: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'other' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ReturnStatement(createReturnStatement(assign))

      expect(reports.length).toBe(1)
    })
  })

  describe('meta type and severity validation', () => {
    test('meta type should be one of valid types', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(noReturnAssignRule.meta.type)
    })

    test('meta severity should be one of valid severities', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(noReturnAssignRule.meta.severity)
    })

    test('meta category should be a non-empty string when present', () => {
      const category = noReturnAssignRule.meta.docs?.category
      if (category !== undefined) {
        expect(typeof category).toBe('string')
        expect(category.length).toBeGreaterThan(0)
      }
    })

    test('meta description should not contain trailing whitespace', () => {
      const desc = noReturnAssignRule.meta.docs?.description ?? ''
      expect(desc).toBe(desc.trim())
    })

    test('meta description should not contain double spaces', () => {
      const desc = noReturnAssignRule.meta.docs?.description ?? ''
      expect(desc).not.toContain('  ')
    })

    test('meta url should be a valid URL format', () => {
      const url = noReturnAssignRule.meta.docs?.url ?? ''
      expect(url).toMatch(/^https?:\/\//)
    })
  })
})
