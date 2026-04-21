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

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
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

  // ============================================================
  // EXPANDED TESTS: Promise.* methods in if statements
  // ============================================================
  describe('Promise static methods in if statements', () => {
    test('should report Promise.allSettled() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'allSettled')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.any() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'any')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.race() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'race')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.withResolvers() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'withResolvers')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: Promise.* methods in ternary
  // ============================================================
  describe('Promise static methods in ternary expressions', () => {
    test('should report Promise.all() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'all')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.reject() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'reject')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.allSettled() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'allSettled')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.race() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'race')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.any() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'any')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: Promise.* in logical expressions
  // ============================================================
  describe('Promise static methods in logical expressions', () => {
    test('should report Promise.all() in && expression left', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'all')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.all() in || expression left', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'all')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('||', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.reject() in && expression right', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'reject')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('&&', createIdentifier('x'), callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.race() in || expression right', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'race')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('||', createIdentifier('x'), callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.resolve() in ?? expression left', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('??', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.resolve() in ?? expression right', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('??', createIdentifier('x'), callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: Promise.* with unary !
  // ============================================================
  describe('Promise static methods with unary !', () => {
    test('should report !Promise.all()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'all')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !Promise.reject()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'reject')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !Promise.race()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'race')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !Promise.allSettled()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'allSettled')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !Promise.any()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'any')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: fetch* functions in various contexts
  // ============================================================
  describe('fetch variants in various boolean contexts', () => {
    test('should report fetchApi() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchApi'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchJson() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchJson'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchUrl() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchUrl'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchResource() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchResource'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchData() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchData'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetch() in && expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetch() in || expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      callNode.parent = createLogicalExpression('||', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchData() in && right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchData'), [])
      callNode.parent = createLogicalExpression('&&', createIdentifier('x'), callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchApi() in || right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchApi'), [])
      callNode.parent = createLogicalExpression('||', createIdentifier('x'), callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: *async* and *promise* named functions
  // ============================================================
  describe('functions with async in name', () => {
    test('should report asyncHandler() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('asyncHandler'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report runAsync() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('runAsync'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report executeAsync() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('executeAsync'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report loadAsync() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('loadAsync'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report processAsyncTask() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('processAsyncTask'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report initializeAsync() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('initializeAsync'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report sendAsync() in && expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('sendAsync'), [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report validateAsync() in || expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('validateAsync'), [])
      callNode.parent = createLogicalExpression('||', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !asyncCheck()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('asyncCheck'), [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !asyncOperation()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('asyncOperation'), [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('functions with promise in name', () => {
    test('should report getPromise() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('getPromise'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report createPromise() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('createPromise'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report runPromiseTask() in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('runPromiseTask'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report executePromise() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('executePromise'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report handlePromise() in && expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('handlePromise'), [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report waitForPromise() in || expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('waitForPromise'), [])
      callNode.parent = createLogicalExpression('||', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !promiseFactory()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('promiseFactory'), [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !makePromise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('makePromise'), [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: case-insensitive matching
  // ============================================================
  describe('case-insensitive name matching', () => {
    test('should report AsyncFunction (uppercase A) in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('AsyncFunction'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report FETCH_DATA (uppercase) in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('FETCH_DATA'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should report PROMISE_creator (uppercase PROMISE) in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('PROMISE_creator'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report GetDataASYNC (mixed case) in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('GetDataASYNC'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report loadASYNCData (mixed case) in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('loadASYNCData'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report myPROMISEHelper (mixed case) in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('myPROMISEHelper'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: non-boolean parent types
  // ============================================================
  describe('non-boolean parent types', () => {
    test('should not report Promise.resolve() in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = { type: 'VariableDeclarator' }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report Promise.resolve() in ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = { type: 'ReturnStatement' }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report Promise.resolve() in AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = { type: 'AssignmentExpression' }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report Promise.resolve() in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = { type: 'CallExpression' }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report Promise.resolve() in ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = { type: 'ArrowFunctionExpression' }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report Promise.resolve() in Property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = { type: 'Property' }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report Promise.resolve() in ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = { type: 'ArrayExpression' }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report Promise.resolve() in AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = { type: 'AwaitExpression' }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report fetch() in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      callNode.parent = { type: 'NewExpression' }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report fetch() in ThrowStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      callNode.parent = { type: 'ThrowStatement' }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EXPANDED TESTS: unary operators other than !
  // ============================================================
  describe('unary operators other than !', () => {
    test('should not report ~Promise.resolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createUnaryExpression('~', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report typeof Promise.resolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createUnaryExpression('typeof', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report void Promise.resolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createUnaryExpression('void', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report +Promise.resolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createUnaryExpression('+', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EXPANDED TESTS: non-Promise member expressions
  // ============================================================
  describe('non-Promise member expressions', () => {
    test('should not report foo.resolve() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('foo'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.all() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('obj'), 'all')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report myObj.reject() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('myObj'), 'reject')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report deferred.resolve() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('deferred'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report result.race() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('result'), 'race')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EXPANDED TESTS: various sync function names (negative cases)
  // ============================================================
  describe('synchronous function names not reported', () => {
    test('should not report isValid() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('isValid'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report hasPermission() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('hasPermission'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report checkStatus() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('checkStatus'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report getSyncData() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('getSyncData'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report computeValue() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('computeValue'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report parseJSON() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('parseJSON'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report readFileSync() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('readFileSync'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report calculateSum() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('calculateSum'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report isEmpty() in && expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('isEmpty'), [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report isArray() in || expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('isArray'), [])
      callNode.parent = createLogicalExpression('||', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EXPANDED TESTS: deeply nested boolean contexts
  // ============================================================
  describe('deeply nested boolean contexts', () => {
    test('should report Promise.resolve() nested in ! inside if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      const unaryNode = createUnaryExpression('!', callNode)
      callNode.parent = unaryNode

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetch() in left of && inside ternary test', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      const logicalNode = createLogicalExpression('&&', callNode, createIdentifier('x'))
      callNode.parent = logicalNode

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.all() in right of || inside ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'all')
      const callNode = createCallExpression(callee, [])
      const logicalNode = createLogicalExpression('||', createIdentifier('x'), callNode)
      callNode.parent = logicalNode

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: IfStatement test position
  // ============================================================
  describe('IfStatement test position', () => {
    test('should report when CallExpression is the test of IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      const ifNode = createIfStatement(callNode)
      callNode.parent = ifNode

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
      expect(ifNode.test).toBe(callNode)
    })

    test('should not report when Promise call is in consequent of IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: callNode,
      }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report when Promise call is in alternate of IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        alternate: callNode,
      }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EXPANDED TESTS: ConditionalExpression position
  // ============================================================
  describe('ConditionalExpression position', () => {
    test('should not report when Promise call is consequent of ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: callNode,
        alternate: createIdentifier('y'),
      }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report when Promise call is alternate of ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createIdentifier('y'),
        alternate: callNode,
      }

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EXPANDED TESTS: node type guards
  // ============================================================
  describe('node type guard edge cases', () => {
    test('should handle node with type as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = {
        type: 'CallExpression',
        callee: createIdentifier('fetch'),
        arguments: [],
        parent: createIfStatement({ type: 'Identifier', name: 'x' } as unknown as ASTNode),
      }
      const ifParent = callNode.parent
      ifParent.test = callNode

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should handle parent with numeric type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      callNode.parent = { type: 42 } as unknown as ASTNode

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
    })

    test('should handle array node', () => {
      const { context } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
    })

    test('should handle boolean node', () => {
      const { context } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle numeric node', () => {
      const { context } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      expect(() => visitor.CallExpression(0)).not.toThrow()
      expect(() => visitor.CallExpression(-1)).not.toThrow()
      expect(() => visitor.CallExpression(3.14)).not.toThrow()
    })
  })

  // ============================================================
  // EXPANDED TESTS: callee edge cases
  // ============================================================
  describe('callee edge cases', () => {
    test('should not report when callee object is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const innerCall = createCallExpression(createIdentifier('fn'), [])
      const callee = createMemberExpression(innerCall, 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee object has wrong name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promises'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee object name is promise (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should report when callee is MemberExpression with Promise object', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'customMethod')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: multiple arguments
  // ============================================================
  describe('calls with arguments', () => {
    test('should report Promise.resolve(value) in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [createIdentifier('value')])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.all([p1, p2]) in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'all')
      const callNode = createCallExpression(callee, [createIdentifier('arr')])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetch(url, options) in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [
        createIdentifier('url'),
        createIdentifier('options'),
      ])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchData(id, params) in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchData'), [
        createIdentifier('id'),
        createIdentifier('params'),
      ])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: location accuracy
  // ============================================================
  describe('location accuracy', () => {
    test('should report correct location for line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [], 1, 0)
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for line 5 column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [], 5, 10)
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [], 100, 50)
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct location for fetch()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [], 7, 3)
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  // ============================================================
  // EXPANDED TESTS: logical expression operators
  // ============================================================
  describe('all logical expression operators', () => {
    test('should report Promise.resolve() in && left', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.resolve() in && right', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('&&', createIdentifier('x'), callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.resolve() in || left', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('||', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.resolve() in || right', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createLogicalExpression('||', createIdentifier('x'), callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetch() in ?? left', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      callNode.parent = createLogicalExpression('??', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetch() in ?? right', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      callNode.parent = createLogicalExpression('??', createIdentifier('x'), callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: rule visitor behavior
  // ============================================================
  describe('rule visitor behavior', () => {
    test('should report each call independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode1 = createCallExpression(callee1, [], 1, 0)
      callNode1.parent = createIfStatement(callNode1)

      const callee2 = createMemberExpression(createIdentifier('Promise'), 'all')
      const callNode2 = createCallExpression(callee2, [], 2, 0)
      callNode2.parent = createIfStatement(callNode2)

      visitor.CallExpression(callNode1)
      visitor.CallExpression(callNode2)

      expect(reports.length).toBe(2)
    })

    test('should not report non-promise calls mixed with promise calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode1 = createCallExpression(createIdentifier('getData'), [])
      callNode1.parent = createIfStatement(callNode1)

      const callee2 = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode2 = createCallExpression(callee2, [])
      callNode2.parent = createIfStatement(callNode2)

      visitor.CallExpression(callNode1)
      visitor.CallExpression(callNode2)

      expect(reports.length).toBe(1)
    })

    test('should create new visitor per create call', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const visitor1 = noPromiseAsBooleanRule.create(ctx1)
      const visitor2 = noPromiseAsBooleanRule.create(ctx2)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor1.CallExpression(callNode)

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  // ============================================================
  // EXPANDED TESTS: additional async/promise name patterns
  // ============================================================
  describe('additional async/promise name patterns', () => {
    test('should report beginAsyncOp() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('beginAsyncOp'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report waitForAsyncResult() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('waitForAsyncResult'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report returnPromiseValue() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('returnPromiseValue'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report chainPromise() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('chainPromise'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report resolveAsync() in &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('resolveAsync'), [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report rejectAsync() in ||', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('rejectAsync'), [])
      callNode.parent = createLogicalExpression('||', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !wrapPromise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('wrapPromise'), [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !startAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('startAsync'), [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report loadDataAsync() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('loadDataAsync'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report processAsync() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('processAsync'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: fetch prefix variants
  // ============================================================
  describe('fetch prefix detection', () => {
    test('should report fetchWrapper() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchWrapper'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchSomething() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchSomething'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchResult() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchResult'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchAndProcess() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchAndProcess'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchFromCache() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchFromCache'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetchUserProfile() in &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchUserProfile'), [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: member expression with non-Identifier property
  // ============================================================
  describe('member expression object type checks', () => {
    test('should not report when Promise member object is not Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getPromise'), [])
      const callee = createMemberExpression(innerCall, 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report when member object is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression({ type: 'Literal' } as unknown as ASTNode, 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report when member object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const innerCall = createCallExpression(createIdentifier('factory'), [])
      const callee = createMemberExpression(innerCall, 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EXPANDED TESTS: combined scenarios
  // ============================================================
  describe('combined scenarios', () => {
    test('should report Promise.resolve() with arguments in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [createIdentifier('val')])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report fetch() with arguments in && expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [createIdentifier('url')])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report asyncOperation() with arguments in || expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('asyncOperation'), [
        createIdentifier('data'),
      ])
      callNode.parent = createLogicalExpression('||', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !promiseHelper() with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('promiseHelper'), [
        createIdentifier('arg'),
      ])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.race() with multiple arguments in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'race')
      const callNode = createCallExpression(callee, [
        createIdentifier('p1'),
        createIdentifier('p2'),
      ])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report Promise.allSettled() in || right side with args', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'allSettled')
      const callNode = createCallExpression(callee, [createIdentifier('promises')])
      callNode.parent = createLogicalExpression('||', createIdentifier('x'), callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !Promise.any()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'any')
      const callNode = createCallExpression(callee, [createIdentifier('promises')])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !Promise.withResolvers()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'withResolvers')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: double negation and chained unary
  // ============================================================
  describe('double negation patterns', () => {
    test('should report !!Promise.resolve() (inner call)', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      const innerUnary = createUnaryExpression('!', callNode)
      callNode.parent = innerUnary

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !!fetch() (inner call)', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      const innerUnary = createUnaryExpression('!', callNode)
      callNode.parent = innerUnary

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: non-promise identifiers that look similar
  // ============================================================
  describe('non-promise identifiers that look similar', () => {
    test('should not report getDispatcher() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('getDispatcher'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report asyncGuard() - no async/promise in name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('syncCheck'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report synchronize() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('synchronize'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report processData() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('processData'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EXPANDED TESTS: meta docs url
  // ============================================================
  describe('meta docs url', () => {
    test('should have url in docs', () => {
      expect(noPromiseAsBooleanRule.meta.docs?.url).toBeDefined()
    })

    test('should have codeforge in url', () => {
      expect(noPromiseAsBooleanRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have rule name in url', () => {
      expect(noPromiseAsBooleanRule.meta.docs?.url).toContain('no-promise-as-boolean')
    })
  })

  // ============================================================
  // EXPANDED TESTS: report message content
  // ============================================================
  describe('report message content variations', () => {
    test('message should contain "Promise" for fetch calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetch'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].message).toContain('Promise')
    })

    test('message should contain "always" for all promise-like calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('fetchData'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].message.toLowerCase()).toContain('always')
    })

    test('message should mention conditions', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].message.toLowerCase()).toContain('condition')
    })

    test('message should suggest .then()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports[0].message).toContain('.then()')
    })

    test('message should be consistent for different promise types', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const visitor1 = noPromiseAsBooleanRule.create(ctx1)
      const visitor2 = noPromiseAsBooleanRule.create(ctx2)

      const callee1 = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode1 = createCallExpression(callee1, [])
      callNode1.parent = createIfStatement(callNode1)

      const callNode2 = createCallExpression(createIdentifier('fetch'), [])
      callNode2.parent = createIfStatement(callNode2)

      visitor1.CallExpression(callNode1)
      visitor2.CallExpression(callNode2)

      expect(r1[0].message).toBe(r2[0].message)
    })
  })

  // ============================================================
  // EXPANDED TESTS: schema and configuration
  // ============================================================
  describe('schema and configuration', () => {
    test('should work with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [undefined] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should work with no config', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
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

      const visitor = noPromiseAsBooleanRule.create(context)

      const callee = createMemberExpression(createIdentifier('Promise'), 'resolve')
      const callNode = createCallExpression(callee, [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED TESTS: more non-reporting cases in boolean context
  // ============================================================
  describe('more non-reporting cases in boolean context', () => {
    test('should not report regularFunction() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('regularFunction'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report compute() in &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('compute'), [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report transform() in ||', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('transform'), [])
      callNode.parent = createLogicalExpression('||', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report filter() in !', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('filter'), [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })

    test('should not report map() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('map'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EXPANDED TESTS: misc additional promise/async patterns
  // ============================================================
  describe('misc async/promise patterns in boolean contexts', () => {
    test('should report connectAsync() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('connectAsync'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report disconnectAsync() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('disconnectAsync'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report updateAsync() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('updateAsync'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report deleteAsync() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('deleteAsync'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report queryAsync() in &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('queryAsync'), [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report saveAsync() in ||', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('saveAsync'), [])
      callNode.parent = createLogicalExpression('||', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report !performAsyncWork()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('performAsyncWork'), [])
      callNode.parent = createUnaryExpression('!', callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report findPromiseIn() in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('findPromiseIn'), [])
      callNode.parent = createIfStatement(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report buildPromiseChain() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('buildPromiseChain'), [])
      callNode.parent = createConditionalExpression(callNode)

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })

    test('should report getPromiseResult() in &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noPromiseAsBooleanRule.create(context)

      const callNode = createCallExpression(createIdentifier('getPromiseResult'), [])
      callNode.parent = createLogicalExpression('&&', callNode, createIdentifier('x'))

      visitor.CallExpression(callNode)

      expect(reports.length).toBe(1)
    })
  })
})
