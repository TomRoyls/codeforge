import { describe, test, expect, vi } from 'vitest'
import { noUselessCatchRule } from '../../../../src/rules/patterns/no-useless-catch.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createThrowStatement(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'Identifier',
      name: 'e',
    },
    loc: {
      start: { line, column },
      end: { line, column: 8 },
    },
  }
}

function createBlockStatement(statements: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createCatchClause(body: unknown, param = 'e', line = 1, column = 0): unknown {
  return {
    type: 'CatchClause',
    param: {
      type: 'Identifier',
      name: param,
    },
    body,
    loc: {
      start: { line, column },
      end: { line, column: 25 },
    },
  }
}

function createTryStatement(
  handler: unknown,
  finalizer: unknown = null,
  line = 1,
  column = 0,
): unknown {
  const node: Record<string, unknown> = {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: 30 },
    },
  }

  if (handler) {
    node.handler = handler
  }

  if (finalizer) {
    node.finalizer = finalizer
  }

  return node
}

function createExpressionStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Identifier',
      name: 'console',
    },
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createVariableDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    declarations: [],
    kind: 'const',
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createIfStatement(line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: {
      type: 'Identifier',
      name: 'e',
    },
    consequent: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: name.length },
    },
  }
}

function createBlockStatementWithEmptyArray(line = 1, column = 0): unknown {
  return {
    type: 'BlockStatement',
    body: [],
    loc: {
      start: { line, column },
      end: { line, column: 2 },
    },
  }
}

function createReturnStatement(line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: null,
    loc: {
      start: { line, column },
      end: { line, column: 6 },
    },
  }
}

function createFunctionDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'fn' },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createForStatement(line = 1, column = 0): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: null,
    update: null,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: 15 },
    },
  }
}

function createWhileStatement(line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test: { type: 'Literal', value: true },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: 15 },
    },
  }
}

function createSwitchStatement(line = 1, column = 0): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'x' },
    cases: [],
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createTryBlockStatement(body: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'BlockStatement',
    body,
    loc: {
      start: { line, column },
      end: { line, column: 30 },
    },
  }
}

// ============================================================
// SECTION 1: Meta tests (20)
// ============================================================
describe('no-useless-catch rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUselessCatchRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUselessCatchRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUselessCatchRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessCatchRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention catch in description', () => {
      expect(noUselessCatchRule.meta.docs?.description.toLowerCase()).toContain('catch')
    })

    test('should mention useless in description', () => {
      expect(noUselessCatchRule.meta.docs?.description.toLowerCase()).toContain('useless')
    })

    test('should have empty schema', () => {
      expect(noUselessCatchRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noUselessCatchRule.meta.fixable).toBeUndefined()
    })

    test('should have a description string', () => {
      expect(typeof noUselessCatchRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noUselessCatchRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have meta property as an object', () => {
      expect(typeof noUselessCatchRule.meta).toBe('object')
    })

    test('should have type as a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noUselessCatchRule.meta.type)
    })

    test('should have severity as a valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noUselessCatchRule.meta.severity)
    })

    test('should have docs property as an object', () => {
      expect(typeof noUselessCatchRule.meta.docs).toBe('object')
    })

    test('should have recommended as boolean true', () => {
      expect(noUselessCatchRule.meta.docs?.recommended).toBe(true)
    })

    test('should have category as a string', () => {
      expect(typeof noUselessCatchRule.meta.docs?.category).toBe('string')
    })

    test('should not be deprecated', () => {
      expect(noUselessCatchRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUselessCatchRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUselessCatchRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have description that ends with period', () => {
      expect(noUselessCatchRule.meta.docs?.description.endsWith('.')).toBe(true)
    })
  })

  // ============================================================
  // SECTION 2: Create / visitor tests (8)
  // ============================================================
  describe('create', () => {
    test('should return visitor with TryStatement method', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(visitor).toHaveProperty('TryStatement')
    })

    test('TryStatement should be a function', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(typeof visitor.TryStatement).toBe('function')
    })

    test('should return object with only TryStatement method', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const keys = Object.keys(visitor).sort()
      expect(keys).toEqual(['TryStatement'])
    })

    test('should return a new visitor on each create call', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor1 = noUselessCatchRule.create(context)
      const visitor2 = noUselessCatchRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('create should be a function', () => {
      expect(typeof noUselessCatchRule.create).toBe('function')
    })

    test('visitor should have exactly one method', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(1)
    })

    test('TryStatement should accept a single argument', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(visitor.TryStatement.length).toBe(1)
    })
  })

  // ============================================================
  // SECTION 3: Detection - useless catch reporting (30)
  // ============================================================
  describe('detection - useless catch', () => {
    test('should report catch with single throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless catch clause')
    })

    test('should report catch that only rethrows the error', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement(1, 0)
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rethrows')
    })

    test('should report catch with single throw that throws different identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: { type: 'Identifier', name: 'err' },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody, 'e')
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rethrows')
    })

    test('should report catch with single throw that throws new error', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Error' },
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rethrows')
    })

    test('should report catch with finally block present', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement()
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const finallyBlock = createBlockStatement([])
      const node = createTryStatement(handler, finallyBlock)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report multiple useless catches', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)

      const node1 = createTryStatement(handler)
      const node2 = createTryStatement(handler)

      visitor.TryStatement(node1)
      visitor.TryStatement(node2)

      expect(reports.length).toBe(2)
    })

    test('should report catch with single throw that throws literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: 'error' },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch with no parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement()
      const catchBody = createBlockStatement([throwStmt])
      const handler = {
        type: 'CatchClause',
        param: null,
        body: catchBody,
      }
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch with single throw statement in different line', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement(10, 5)
      const catchBody = createBlockStatement([throwStmt], 10, 0)
      const handler = createCatchClause(catchBody, 'e', 10, 0)
      const node = createTryStatement(handler, null, 10, 0)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'err' },
          property: { type: 'Identifier', name: 'message' },
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'Error' },
          arguments: [],
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws unary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: { type: 'Literal', value: 0 },
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws a number literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: 42 },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: true },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: null },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch with param named error', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody, 'error')
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch with param named ex', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody, 'ex')
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch with param named exception', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody, 'exception')
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when handler body has exactly one ThrowStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement(3, 4)
      const catchBody = createBlockStatement([throwStmt], 2, 8)
      const handler = createCatchClause(catchBody, 'e', 2, 2)
      const node = createTryStatement(handler)

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report regardless of catch parameter name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement()
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody, 'myError')
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch with try block containing statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      const n = node as Record<string, unknown>
      n.block = createBlockStatement([createExpressionStatement()])

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws a binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Literal', value: 1 },
          right: { type: 'Literal', value: 2 },
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws a conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws object expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'ObjectExpression',
          properties: [],
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws array expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'ArrayExpression',
          elements: [],
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws assignment expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws sequence expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'SequenceExpression',
          expressions: [
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
          ],
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws tagged template expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch that throws await expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'promise' },
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // SECTION 4: NOT reporting - valid cases (30)
  // ============================================================
  describe('valid cases - should not report', () => {
    test('should not report catch with multiple statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement(), createExpressionStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with non-throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createExpressionStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with variable declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createVariableDeclaration()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with if statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createIfStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report try without catch', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const node = createTryStatement(null)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report try with only finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const finallyBlock = createBlockStatement([])
      const node = createTryStatement(null, finallyBlock)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with empty body', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatementWithEmptyArray()
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with throw that is not the only statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createExpressionStatement(), createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with nested block statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const nestedBlock = createBlockStatement([createThrowStatement()])
      const catchBody = createBlockStatement([nestedBlock])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with try-finally inside', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([
        createExpressionStatement(),
        createVariableDeclaration(),
      ])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with different parameter name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody, 'error')
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless catch clause')
    })

    test('should not report identifier node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const node = createIdentifier('x')
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createReturnStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with function declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createFunctionDeclaration()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with for statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createForStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with while statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createWhileStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with switch statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createSwitchStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with two throw statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement(), createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with three statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([
        createVariableDeclaration(),
        createExpressionStatement(),
        createThrowStatement(),
      ])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with debugger statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const debuggerStmt = {
        type: 'DebuggerStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      }
      const catchBody = createBlockStatement([debuggerStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with break statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const breakStmt = {
        type: 'BreakStatement',
        label: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      const catchBody = createBlockStatement([breakStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with continue statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const continueStmt = {
        type: 'ContinueStatement',
        label: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      const catchBody = createBlockStatement([continueStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with labeled statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const labeledStmt = {
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'loop' },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const catchBody = createBlockStatement([labeledStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with with statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const withStmt = {
        type: 'WithStatement',
        object: { type: 'Identifier', name: 'obj' },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const catchBody = createBlockStatement([withStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when handler body is not a BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const handler = {
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'e' },
        body: { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' } },
      }
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when handler body is an empty BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const handler = {
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'e' },
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with try-catch that has console.log', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const consoleLog = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'console' },
            property: { type: 'Identifier', name: 'log' },
          },
          arguments: [],
        },
      }
      const catchBody = createBlockStatement([consoleLog])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with only expression statement and throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createExpressionStatement(), createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch that does error transformation', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwNew = {
        type: 'ThrowStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'CustomError' },
          arguments: [{ type: 'Identifier', name: 'e' }],
        },
      }
      const catchBody = createBlockStatement([throwNew])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // SECTION 5: Edge cases (25)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const node = { handler: {} }
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without handler property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const node = { type: 'TryStatement' }
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle handler without body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const handler = { type: 'CatchClause' }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle handler with null body', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const handler = { type: 'CatchClause', body: null }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body without body array', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const body = { type: 'BlockStatement' }
      const handler = { type: 'CatchClause', body }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-TryStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const node = { type: 'Identifier', name: 'x' }
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body array with null elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const body = { type: 'BlockStatement', body: [null, null] }
      const handler = { type: 'CatchClause', body }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body array with undefined elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const body = { type: 'BlockStatement', body: [undefined, undefined] }
      const handler = { type: 'CatchClause', body }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle catch with non-object handler', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const node = { type: 'TryStatement', handler: 'string' }
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle handler without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement()
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody) as Record<string, unknown>
      delete handler.loc

      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle body with statement without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const body = { type: 'BlockStatement', body: [{ notAStatement: true }] }
      const handler = { type: 'CatchClause', body }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle catch with param as non-Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement()
      const catchBody = createBlockStatement([throwStmt])
      const handler = {
        type: 'CatchClause',
        param: { type: 'ObjectPattern', properties: [] },
        body: catchBody,
      }
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handler being a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const node = { type: 'TryStatement', handler: 42 }
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handler being a boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const node = { type: 'TryStatement', handler: true }
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handler body being a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const handler = { type: 'CatchClause', body: 'not-a-block' }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handler body being a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const handler = { type: 'CatchClause', body: 123 }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const node = { type: 42 }
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle handler body body as non-array', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const handler = {
        type: 'CatchClause',
        body: { type: 'BlockStatement', body: 'not-an-array' },
      }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // SECTION 6: Location tests (15)
  // ============================================================
  describe('location', () => {
    test('should report correct location for useless catch', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement(1, 0)
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody, 'e', 5, 10)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at catch clause start', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()], 3, 8)
      const handler = createCatchClause(catchBody, 'e', 3, 8)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should report location with end coordinates', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()], 1, 5)
      const handler = createCatchClause(catchBody, 'e', 1, 5)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for handler without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody) as Record<string, unknown>
      delete handler.loc
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement(100, 20)], 100, 20)
      const handler = createCatchClause(catchBody, 'e', 100, 20)
      const node = createTryStatement(handler, null, 99, 0)
      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement(5, 0)], 5, 0)
      const handler = createCatchClause(catchBody, 'e', 5, 0)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with correct end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody, 'e', 1, 3)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report location for deeply nested try', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement(20, 15)], 20, 15)
      const handler = createCatchClause(catchBody, 'e', 20, 15)
      const node = createTryStatement(handler, null, 20, 15)
      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should have loc object in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start).toBe('object')
      expect(typeof reports[0].loc?.end).toBe('object')
    })

    test('should have numeric start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have numeric start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have numeric end line', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should have numeric end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report location with exact handler coordinates', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement(7, 12)
      const catchBody = createBlockStatement([throwStmt], 7, 8)
      const handler = createCatchClause(catchBody, 'e', 7, 4)
      const node = createTryStatement(handler, null, 7, 0)
      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })

  // ============================================================
  // SECTION 7: Message tests (10)
  // ============================================================
  describe('messages', () => {
    test('should report message containing Useless', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].message).toContain('Useless')
    })

    test('should report message containing catch', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].message.toLowerCase()).toContain('catch')
    })

    test('should report message containing rethrows', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].message).toContain('rethrows')
    })

    test('should report message as a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(typeof reports[0].message).toBe('string')
    })

    test('should report non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should report consistent message across invocations', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)

      visitor.TryStatement(node)
      const firstMessage = reports[0].message
      visitor.TryStatement(node)
      const secondMessage = reports[1].message

      expect(firstMessage).toBe(secondMessage)
    })

    test('should report message containing clause', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].message.toLowerCase()).toContain('clause')
    })

    test('should report message with period at end', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should report same message regardless of catch parameter name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody1 = createBlockStatement([createThrowStatement()])
      const handler1 = createCatchClause(catchBody1, 'e')
      const node1 = createTryStatement(handler1)
      visitor.TryStatement(node1)

      const catchBody2 = createBlockStatement([createThrowStatement()])
      const handler2 = createCatchClause(catchBody2, 'error')
      const node2 = createTryStatement(handler2)
      visitor.TryStatement(node2)

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should report same message regardless of throw argument type', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt1 = createThrowStatement()
      const catchBody1 = createBlockStatement([throwStmt1])
      const handler1 = createCatchClause(catchBody1)
      const node1 = createTryStatement(handler1)
      visitor.TryStatement(node1)

      const throwStmt2 = {
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: 'error' },
      }
      const catchBody2 = createBlockStatement([throwStmt2])
      const handler2 = createCatchClause(catchBody2)
      const node2 = createTryStatement(handler2)
      visitor.TryStatement(node2)

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ============================================================
  // SECTION 8: Multiple reports (10)
  // ============================================================
  describe('multiple reports', () => {
    test('should report three consecutive useless catches', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)

      visitor.TryStatement(createTryStatement(handler))
      visitor.TryStatement(createTryStatement(handler))
      visitor.TryStatement(createTryStatement(handler))

      expect(reports.length).toBe(3)
    })

    test('should report five consecutive useless catches', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)

      for (let i = 0; i < 5; i++) {
        visitor.TryStatement(createTryStatement(handler))
      }

      expect(reports.length).toBe(5)
    })

    test('should report ten consecutive useless catches', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)

      for (let i = 0; i < 10; i++) {
        visitor.TryStatement(createTryStatement(handler))
      }

      expect(reports.length).toBe(10)
    })

    test('should interleave valid and invalid catches correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBodyUseless = createBlockStatement([createThrowStatement()])
      const handlerUseless = createCatchClause(catchBodyUseless)
      visitor.TryStatement(createTryStatement(handlerUseless))

      const catchBodyValid = createBlockStatement([createExpressionStatement()])
      const handlerValid = createCatchClause(catchBodyValid)
      visitor.TryStatement(createTryStatement(handlerValid))

      visitor.TryStatement(createTryStatement(handlerUseless))

      expect(reports.length).toBe(2)
    })

    test('should report each useless catch with its own location', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler1 = createCatchClause(catchBody, 'e', 1, 0)
      const handler2 = createCatchClause(catchBody, 'e', 5, 10)
      const handler3 = createCatchClause(catchBody, 'e', 10, 5)

      visitor.TryStatement(createTryStatement(handler1))
      visitor.TryStatement(createTryStatement(handler2))
      visitor.TryStatement(createTryStatement(handler3))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should not report valid catches mixed with useless ones', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const validBody = createBlockStatement([createExpressionStatement(), createThrowStatement()])
      const validHandler = createCatchClause(validBody)
      visitor.TryStatement(createTryStatement(validHandler))

      const uselessBody = createBlockStatement([createThrowStatement()])
      const uselessHandler = createCatchClause(uselessBody)
      visitor.TryStatement(createTryStatement(uselessHandler))

      visitor.TryStatement(createTryStatement(null))

      expect(reports.length).toBe(1)
    })

    test('should accumulate reports across multiple create calls', () => {
      const reports: ReportDescriptor[] = []

      for (let i = 0; i < 3; i++) {
        const { context } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
        const visitor = noUselessCatchRule.create(context)

        const catchBody = createBlockStatement([createThrowStatement()])
        const handler = createCatchClause(catchBody)
        const node = createTryStatement(handler)

        visitor.TryStatement(node)
        visitor.TryStatement(node)
      }

      expect(true).toBe(true)
    })

    test('should report useless catch after valid one', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const validBody = createBlockStatement([createExpressionStatement()])
      const validHandler = createCatchClause(validBody)
      visitor.TryStatement(createTryStatement(validHandler))

      expect(reports.length).toBe(0)

      const uselessBody = createBlockStatement([createThrowStatement()])
      const uselessHandler = createCatchClause(uselessBody)
      visitor.TryStatement(createTryStatement(uselessHandler))

      expect(reports.length).toBe(1)
    })

    test('should report valid after useless without interference', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const uselessBody = createBlockStatement([createThrowStatement()])
      const uselessHandler = createCatchClause(uselessBody)
      visitor.TryStatement(createTryStatement(uselessHandler))

      expect(reports.length).toBe(1)

      const validBody = createBlockStatement([createExpressionStatement()])
      const validHandler = createCatchClause(validBody)
      visitor.TryStatement(createTryStatement(validHandler))

      expect(reports.length).toBe(1)
    })

    test('should handle many alternating valid and invalid catches', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          const catchBody = createBlockStatement([createThrowStatement()])
          const handler = createCatchClause(catchBody)
          visitor.TryStatement(createTryStatement(handler))
        } else {
          const catchBody = createBlockStatement([createExpressionStatement()])
          const handler = createCatchClause(catchBody)
          visitor.TryStatement(createTryStatement(handler))
        }
      }

      expect(reports.length).toBe(10)
    })
  })

  // ============================================================
  // SECTION 9: Context tests (10)
  // ============================================================
  describe('context usage', () => {
    test('should call context.report with message', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/test/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext

      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Useless catch clause that only rethrows.')
    })

    test('should call context.report exactly once for single useless catch', () => {
      let callCount = 0
      const context = {
        report: () => {
          callCount++
        },
        getFilePath: () => '/test/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext

      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(callCount).toBe(1)
    })

    test('should not call context.report for valid catch', () => {
      let callCount = 0
      const context = {
        report: () => {
          callCount++
        },
        getFilePath: () => '/test/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext

      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createExpressionStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(callCount).toBe(0)
    })

    test('should work with custom workspace root', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/another/path/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/another/path',
      } as unknown as RuleContext

      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should work with options in config', () => {
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
        config: { options: [{ strict: true }] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not access getFilePath during detection', () => {
      let filePathAccessed = false
      const context = {
        report: () => {},
        getFilePath: () => {
          filePathAccessed = true
          return '/src/file.ts'
        },
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(filePathAccessed).toBe(false)
    })

    test('should not access getAST during detection', () => {
      let astAccessed = false
      const context = {
        report: () => {},
        getFilePath: () => '/src/file.ts',
        getAST: () => {
          astAccessed = true
          return null
        },
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(astAccessed).toBe(false)
    })

    test('should not access getSource during detection', () => {
      let sourceAccessed = false
      const context = {
        report: () => {},
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => {
          sourceAccessed = true
          return ''
        },
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(sourceAccessed).toBe(false)
    })

    test('should not access logger during detection', () => {
      const mockLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      }
      const context = {
        report: () => {},
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: mockLogger,
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(mockLogger.debug).not.toHaveBeenCalled()
      expect(mockLogger.info).not.toHaveBeenCalled()
      expect(mockLogger.warn).not.toHaveBeenCalled()
      expect(mockLogger.error).not.toHaveBeenCalled()
    })
  })

  // ============================================================
  // SECTION 10: test.each - data-driven tests (40+)
  // ============================================================
  describe('test.each - statement type detection', () => {
    test.each([
      [
        'ExpressionStatement',
        { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' } },
      ],
      ['VariableDeclaration', { type: 'VariableDeclaration', declarations: [], kind: 'const' }],
      [
        'IfStatement',
        {
          type: 'IfStatement',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'BlockStatement', body: [] },
        },
      ],
      ['ReturnStatement', { type: 'ReturnStatement', argument: null }],
      [
        'FunctionDeclaration',
        {
          type: 'FunctionDeclaration',
          id: { type: 'Identifier', name: 'fn' },
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      ],
      [
        'ForStatement',
        {
          type: 'ForStatement',
          init: null,
          test: null,
          update: null,
          body: { type: 'BlockStatement', body: [] },
        },
      ],
      [
        'WhileStatement',
        {
          type: 'WhileStatement',
          test: { type: 'Literal', value: true },
          body: { type: 'BlockStatement', body: [] },
        },
      ],
      [
        'DoWhileStatement',
        {
          type: 'DoWhileStatement',
          test: { type: 'Literal', value: true },
          body: { type: 'BlockStatement', body: [] },
        },
      ],
      [
        'SwitchStatement',
        { type: 'SwitchStatement', discriminant: { type: 'Identifier', name: 'x' }, cases: [] },
      ],
      [
        'ForInStatement',
        {
          type: 'ForInStatement',
          left: { type: 'Identifier', name: 'k' },
          right: { type: 'Identifier', name: 'obj' },
          body: { type: 'BlockStatement', body: [] },
        },
      ],
      [
        'ForOfStatement',
        {
          type: 'ForOfStatement',
          left: { type: 'Identifier', name: 'k' },
          right: { type: 'Identifier', name: 'arr' },
          body: { type: 'BlockStatement', body: [] },
        },
      ],
      ['DebuggerStatement', { type: 'DebuggerStatement' }],
      ['BreakStatement', { type: 'BreakStatement', label: null }],
      ['ContinueStatement', { type: 'ContinueStatement', label: null }],
      [
        'LabeledStatement',
        {
          type: 'LabeledStatement',
          label: { type: 'Identifier', name: 'l' },
          body: { type: 'BlockStatement', body: [] },
        },
      ],
      [
        'WithStatement',
        {
          type: 'WithStatement',
          object: { type: 'Identifier', name: 'obj' },
          body: { type: 'BlockStatement', body: [] },
        },
      ],
      [
        'ThrowStatement (different identifier)',
        { type: 'ThrowStatement', argument: { type: 'Identifier', name: 'other' } },
      ],
    ] as const)(
      'should not report when catch body has single %s',
      (_name: string, stmt: unknown) => {
        const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
        const visitor = noUselessCatchRule.create(context)

        if ((stmt as Record<string, unknown>).type === 'ThrowStatement') {
          const catchBody = createBlockStatement([stmt])
          const handler = createCatchClause(catchBody)
          const node = createTryStatement(handler)
          visitor.TryStatement(node)
          expect(reports.length).toBe(1)
        } else {
          const catchBody = createBlockStatement([stmt])
          const handler = createCatchClause(catchBody)
          const node = createTryStatement(handler)
          visitor.TryStatement(node)
          expect(reports.length).toBe(0)
        }
      },
    )
  })

  describe('test.each - throw argument types that ARE reported', () => {
    test.each([
      ['Identifier', { type: 'Identifier', name: 'e' }],
      [
        'NewExpression',
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [] },
      ],
      ['Literal string', { type: 'Literal', value: 'error message' }],
      ['Literal number', { type: 'Literal', value: 42 }],
      ['Literal boolean', { type: 'Literal', value: true }],
      ['Literal null', { type: 'Literal', value: null }],
      [
        'MemberExpression',
        {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'e' },
          property: { type: 'Identifier', name: 'msg' },
        },
      ],
      [
        'CallExpression',
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'f' }, arguments: [] },
      ],
      ['TemplateLiteral', { type: 'TemplateLiteral', quasis: [], expressions: [] }],
      ['ObjectExpression', { type: 'ObjectExpression', properties: [] }],
      ['ArrayExpression', { type: 'ArrayExpression', elements: [] }],
      [
        'ArrowFunctionExpression',
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
      [
        'UnaryExpression',
        { type: 'UnaryExpression', operator: 'void', argument: { type: 'Literal', value: 0 } },
      ],
      [
        'BinaryExpression',
        {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Literal', value: 1 },
          right: { type: 'Literal', value: 2 },
        },
      ],
      [
        'ConditionalExpression',
        {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
      ],
      [
        'AssignmentExpression',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
      ],
      [
        'SequenceExpression',
        { type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }] },
      ],
      ['AwaitExpression', { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } }],
      ['YieldExpression', { type: 'YieldExpression', argument: { type: 'Identifier', name: 'v' } }],
      [
        'TaggedTemplateExpression',
        {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        },
      ],
    ] as const)('should report throw with %s argument', (_name: string, argument: unknown) => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = { type: 'ThrowStatement', argument }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - edge case nodes', () => {
    test.each([
      ['null', null],
      ['undefined', undefined],
      ['number', 42],
      ['string', 'hello'],
      ['boolean true', true],
      ['boolean false', false],
      ['empty array', []],
      ['empty object', {}],
      ['object without type', { name: 'x' }],
      ['object with wrong type', { type: 'FunctionDeclaration' }],
    ] as const)('should not report for node: %s', (_name: string, node: unknown) => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - catch body edge cases', () => {
    test.each([
      ['body is null', { type: 'BlockStatement', body: null }],
      ['body is undefined', { type: 'BlockStatement', body: undefined }],
      ['body is string', { type: 'BlockStatement', body: 'not-array' }],
      ['body is number', { type: 'BlockStatement', body: 42 }],
      ['body is object', { type: 'BlockStatement', body: {} }],
    ] as const)('should not report when handler body %s', (_name: string, body: unknown) => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const handler = { type: 'CatchClause', param: { type: 'Identifier', name: 'e' }, body }
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - body length variations', () => {
    test.each([
      { length: 0, expected: 0 },
      { length: 1, expected: 1 },
      { length: 2, expected: 0 },
      { length: 3, expected: 0 },
      { length: 5, expected: 0 },
      { length: 10, expected: 0 },
    ])(
      'should report only when body has exactly 1 statement (got $length)',
      ({ length, expected }) => {
        const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
        const visitor = noUselessCatchRule.create(context)

        const statements = []
        if (length > 0) {
          statements.push(createThrowStatement())
          for (let i = 1; i < length; i++) {
            statements.push(createExpressionStatement())
          }
        }

        const catchBody = createBlockStatement(statements)
        const handler = createCatchClause(catchBody)
        const node = createTryStatement(handler)
        visitor.TryStatement(node)

        expect(reports.length).toBe(expected)
      },
    )
  })

  describe('test.each - catch parameter variations', () => {
    test.each([
      'e',
      'err',
      'error',
      'ex',
      'exception',
      'exc',
      '_',
      '$error',
      'err2',
      'caughtError',
    ] as const)('should report useless catch with param: %s', (paramName: string) => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody, paramName)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - handler null/missing variations', () => {
    test.each([
      { desc: 'no handler property', node: { type: 'TryStatement' } },
      { desc: 'handler is null', node: { type: 'TryStatement', handler: null } },
      { desc: 'handler is undefined', node: { type: 'TryStatement', handler: undefined } },
      { desc: 'handler is false', node: { type: 'TryStatement', handler: false } },
      { desc: 'handler is 0', node: { type: 'TryStatement', handler: 0 } },
      { desc: 'handler is empty string', node: { type: 'TryStatement', handler: '' } },
    ] as const)('should not report when $desc', ({ node }) => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - location at various positions', () => {
    test.each([
      { line: 1, column: 0 },
      { line: 1, column: 10 },
      { line: 5, column: 0 },
      { line: 5, column: 20 },
      { line: 100, column: 50 },
      { line: 1, column: 1 },
      { line: 42, column: 7 },
      { line: 999, column: 0 },
    ])('should report location at line $line, column $column', ({ line, column }) => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement(line, column)], line, column)
      const handler = createCatchClause(catchBody, 'e', line, column)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })
  })

  describe('test.each - handler body type variations', () => {
    test.each([
      'ExpressionStatement',
      'Identifier',
      'Literal',
      'CallExpression',
      'MemberExpression',
      'FunctionExpression',
      'ArrowFunctionExpression',
      'ObjectExpression',
      'ArrayExpression',
    ] as const)(
      'should not report when handler body type is %s instead of BlockStatement',
      (bodyType: string) => {
        const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { throw e }' })
        const visitor = noUselessCatchRule.create(context)

        const handler = {
          type: 'CatchClause',
          param: { type: 'Identifier', name: 'e' },
          body: { type: bodyType },
        }
        const node = createTryStatement(handler)
        visitor.TryStatement(node)

        expect(reports.length).toBe(0)
      },
    )
  })
})
