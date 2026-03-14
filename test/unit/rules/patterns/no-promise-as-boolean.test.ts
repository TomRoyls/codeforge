import { describe, test, expect, vi } from 'vitest'
import { noPromiseAsBooleanRule } from '../../../../src/rules/patterns/no-promise-as-boolean.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'if (fetchData()) {}',
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

interface ASTNode {
  type: string
  callee?: ASTNode
  arguments?: ASTNode[]
  loc?: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
  parent?: ASTNode
  test?: ASTNode
  operator?: string
  left?: ASTNode
  right?: ASTNode
  argument?: ASTNode
  prefix?: boolean
  consequent?: ASTNode
  alternate?: ASTNode
  object?: ASTNode
  property?: ASTNode
  name?: string
}

function createCallExpression(
  callee: ASTNode,
  args: ASTNode[] = [],
  line = 1,
  column = 0,
): ASTNode {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createMemberExpression(object: ASTNode, property: string): ASTNode {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
    },
  }
}

function createIdentifier(name: string): ASTNode {
  return {
    type: 'Identifier',
    name,
  }
}

function createIfStatement(test: ASTNode): ASTNode {
  return {
    type: 'IfStatement',
    test,
  }
}

function createConditionalExpression(test: ASTNode): ASTNode {
  return {
    type: 'ConditionalExpression',
    test,
    consequent: createIdentifier('x'),
    alternate: createIdentifier('y'),
  }
}

function createLogicalExpression(operator: string, left: ASTNode, right: ASTNode): ASTNode {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
  }
}

function createUnaryExpression(operator: string, argument: ASTNode): ASTNode {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
  }
}

describe('no-promise-as-boolean rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noPromiseAsBooleanRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noPromiseAsBooleanRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noPromiseAsBooleanRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noPromiseAsBooleanRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noPromiseAsBooleanRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noPromiseAsBooleanRule.meta.fixable).toBeUndefined()
    })

    test('should mention Promise in description', () => {
      expect(noPromiseAsBooleanRule.meta.docs?.description.toLowerCase()).toContain('promise')
    })

    test('should mention boolean in description', () => {
      expect(noPromiseAsBooleanRule.meta.docs?.description.toLowerCase()).toContain('boolean')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting promises in if statements', () => {
    test('should report Promise.resolve() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('truthy')
    })

    test('should report Promise.reject() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'reject')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.all() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'all')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetch() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchData() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchData'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report getAsyncData() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('getAsyncData'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting promises in conditional expressions', () => {
    test('should report Promise.resolve() in ternary condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetch() in ternary condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting promises in logical expressions', () => {
    test('should report Promise.resolve() in && expression (left side)', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.resolve() in && expression (right side)', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('&&', createIdentifier('x'), callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.resolve() in || expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('||', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting promises with unary !', () => {
    test('should report !Promise.resolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !fetch()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid cases', () => {
    test('should not report Promise.resolve() outside boolean context', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('getData'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report loadSync() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('loadSync'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })

  describe('additional edge cases', () => {
    test('should handle node without parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('Promise'), [])
      delete (callNode as unknown as Record<string, unknown>).parent

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('Promise'), [])
      callNode.parent = undefined

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-object parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('Promise'), [])
      callNode.parent = 'not an object' as unknown as ASTNode

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = {
        type: 'CallExpression',
        arguments: [],
        parent: createIfStatement({ type: 'Identifier', name: 'x' }),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        parent: createIfStatement({ type: 'Identifier', name: 'x' }),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression({ type: 'Literal' } as ASTNode, [])
      callNode.parent = createIfStatement({ type: 'Identifier', name: 'x' })

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should handle async function call with non-fetch name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('loadDataAsync'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should handle async function call with name containing async', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('getDataAsync'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode: ASTNode = {
        type: 'CallExpression',
        callee,
        arguments: [],
        parent: createIfStatement(null as unknown as ASTNode),
      }

      expect(() => visitor.CallExpression(callNode)).not.toThrow()
    })

    test('should handle node without parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])

      expect(() => visitor.CallExpression(callNode)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [], 10, 5)
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention truthy in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].message.toLowerCase()).toContain('truthy')
    })

    test('should mention await in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].message.toLowerCase()).toContain('await')
    })

    test('should mention resolve in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].message.toLowerCase()).toContain('resolve')
    })
  })

  describe('isPromiseLike edge cases', () => {
    test('should report async function with promise in name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createIdentifier('getPromise')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report async function with async in name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createIdentifier('getAsyncData')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should not report regular function without promise/async in name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createIdentifier('getData')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })

  describe('isInBooleanContext edge cases', () => {
    test('should not report when operator is not !', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      const unaryNode = createUnaryExpression('-', callNode)
      unaryNode.parent = createIfStatement(unaryNode)
      callNode.parent = unaryNode

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report when parent is not boolean context', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = {
        type: 'ExpressionStatement',
      }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })
})
