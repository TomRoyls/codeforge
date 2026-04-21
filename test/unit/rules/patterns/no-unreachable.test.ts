import { describe, test, expect, vi } from 'vitest'
import { noUnreachableRule } from '../../../../src/rules/patterns/no-unreachable.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createBlockStatement(
  body: unknown[],
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'BlockStatement',
    body,
    loc: loc ?? {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

function createReturnStatement(line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 6 },
    },
  }
}

function createThrowStatement(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Error' },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createBreakStatement(line = 1, column = 0): unknown {
  return {
    type: 'BreakStatement',
    label: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createContinueStatement(line = 1, column = 0): unknown {
  return {
    type: 'ContinueStatement',
    label: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 8 },
    },
  }
}

function createExpressionStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'foo' },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 6 },
    },
  }
}

function createNonBlockStatement(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 42,
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 2 },
    },
  }
}

function createVariableDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    declarations: [],
    kind: 'let',
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createIfStatement(line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Literal', value: true },
    consequent: { type: 'BlockStatement', body: [] },
    alternate: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
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
      end: { line, column: column + 10 },
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
      end: { line, column: column + 10 },
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
      end: { line, column: column + 10 },
    },
  }
}

function createTryStatement(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: { type: 'BlockStatement', body: [] },
    handler: null,
    finalizer: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
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
      end: { line, column: column + 10 },
    },
  }
}

describe('no-unreachable rule', () => {
  // ============================================================
  // META PROPERTY TESTS
  // ============================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnreachableRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnreachableRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnreachableRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnreachableRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention unreachable in description', () => {
      expect(noUnreachableRule.meta.docs?.description.toLowerCase()).toContain('unreachable')
    })

    test('should have a non-empty description', () => {
      expect(noUnreachableRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have description ending with period', () => {
      expect(noUnreachableRule.meta.docs?.description.endsWith('.')).toBe(true)
    })

    test('should have docs object defined', () => {
      expect(noUnreachableRule.meta.docs).toBeDefined()
    })

    test('should have type as one of valid RuleType values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noUnreachableRule.meta.type)
    })

    test('should have severity as one of valid Severity values', () => {
      expect(['off', 'warn', 'error']).toContain(noUnreachableRule.meta.severity)
    })

    test('should not be fixable', () => {
      expect(noUnreachableRule.meta.fixable).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnreachableRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(noUnreachableRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUnreachableRule.meta.replacedBy).toBeUndefined()
    })

    test('should have schema as empty array', () => {
      expect(noUnreachableRule.meta.schema).toEqual([])
    })

    test('should have docs description as string', () => {
      expect(typeof noUnreachableRule.meta.docs?.description).toBe('string')
    })

    test('should have docs recommended as boolean true', () => {
      expect(noUnreachableRule.meta.docs?.recommended).toBe(true)
      expect(typeof noUnreachableRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs category as string', () => {
      expect(typeof noUnreachableRule.meta.docs?.category).toBe('string')
    })
  })

  // ============================================================
  // CREATE / VISITOR STRUCTURE TESTS
  // ============================================================
  describe('create', () => {
    test('should return visitor with BlockStatement method', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(visitor).toHaveProperty('BlockStatement')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('BlockStatement should be a function', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(typeof visitor.BlockStatement).toBe('function')
    })

    test('should return new visitor on each create call', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor1 = noUnreachableRule.create(context)
      const visitor2 = noUnreachableRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('BlockStatement method should not throw when called', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(() => visitor.BlockStatement(createBlockStatement([]))).not.toThrow()
    })

    test('visitor should only have BlockStatement key', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(Object.keys(visitor)).toEqual(['BlockStatement'])
    })

    test('create should accept context and return RuleVisitor', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(typeof visitor.BlockStatement).toBe('function')
    })
  })

  // ============================================================
  // DETECTING UNREACHABLE CODE - RETURN STATEMENT
  // ============================================================
  describe('detecting unreachable code after return', () => {
    test('should report code after return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('unreachable')
    })

    test('should report unreachable expression statement after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement(2, 0)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable variable declaration after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createVariableDeclaration()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable if statement after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createReturnStatement(), createIfStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report unreachable while statement after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createWhileStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable for statement after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createReturnStatement(), createForStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report unreachable function declaration after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createFunctionDeclaration()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable try statement after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createReturnStatement(), createTryStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report unreachable switch statement after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createSwitchStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report return at end of block with no subsequent code as reachable', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(), createReturnStatement()]),
      )

      expect(reports.length).toBe(0)
    })

    test('should detect unreachable code with return as only first statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createReturnStatement(),
          createExpressionStatement(2, 0),
          createExpressionStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report when return is in the middle of body', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(),
          createReturnStatement(2, 0),
          createExpressionStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // DETECTING UNREACHABLE CODE - THROW STATEMENT
  // ============================================================
  describe('detecting unreachable code after throw', () => {
    test('should report code after throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createThrowStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable expression after throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createThrowStatement(), createExpressionStatement(2, 4)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable variable declaration after throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createThrowStatement(), createVariableDeclaration()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable if statement after throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createThrowStatement(), createIfStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report unreachable while statement after throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createThrowStatement(), createWhileStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report unreachable for statement after throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createThrowStatement(), createForStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report unreachable function declaration after throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createThrowStatement(), createFunctionDeclaration()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable try statement after throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createThrowStatement(), createTryStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should not report when throw is last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(), createThrowStatement()]),
      )

      expect(reports.length).toBe(0)
    })

    test('should report throw in the middle of body', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(),
          createThrowStatement(2, 0),
          createExpressionStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // DETECTING UNREACHABLE CODE - BREAK STATEMENT
  // ============================================================
  describe('detecting unreachable code after break', () => {
    test('should report code after break statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createBreakStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable expression after break', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createBreakStatement(), createExpressionStatement(2, 0)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable variable declaration after break', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createBreakStatement(), createVariableDeclaration()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable if statement after break', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createBreakStatement(), createIfStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report unreachable while statement after break', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createBreakStatement(), createWhileStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report unreachable for statement after break', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createBreakStatement(), createForStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report unreachable function declaration after break', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createBreakStatement(), createFunctionDeclaration()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report when break is last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(), createBreakStatement()]),
      )

      expect(reports.length).toBe(0)
    })

    test('should report break in the middle of body', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(),
          createBreakStatement(2, 0),
          createExpressionStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable code after break with label', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const breakWithLabel = {
        type: 'BreakStatement',
        label: { type: 'Identifier', name: 'outer' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.BlockStatement(createBlockStatement([breakWithLabel, createExpressionStatement()]))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // DETECTING UNREACHABLE CODE - CONTINUE STATEMENT
  // ============================================================
  describe('detecting unreachable code after continue', () => {
    test('should report code after continue statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createContinueStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable expression after continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createContinueStatement(), createExpressionStatement(2, 0)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable variable declaration after continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createContinueStatement(), createVariableDeclaration()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable if statement after continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createContinueStatement(), createIfStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report unreachable while statement after continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createContinueStatement(), createWhileStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable for statement after continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createContinueStatement(), createForStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable function declaration after continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createContinueStatement(), createFunctionDeclaration()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report when continue is last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(), createContinueStatement()]),
      )

      expect(reports.length).toBe(0)
    })

    test('should report continue in the middle of body', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(),
          createContinueStatement(2, 0),
          createExpressionStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report unreachable code after continue with label', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const continueWithLabel = {
        type: 'ContinueStatement',
        label: { type: 'Identifier', name: 'outer' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.BlockStatement(createBlockStatement([continueWithLabel, createExpressionStatement()]))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NO UNREACHABLE CODE - NEGATIVE CASES
  // ============================================================
  describe('no unreachable code detected', () => {
    test('should not report when no unreachable code', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(), createReturnStatement()]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report single expression statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createExpressionStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report single return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createReturnStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report single throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createThrowStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report single break statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createBreakStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report single continue statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createContinueStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report two expression statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(1, 0), createExpressionStatement(1, 6)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report three expression statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(1, 0),
          createExpressionStatement(1, 6),
          createExpressionStatement(1, 12),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration followed by return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createVariableDeclaration(), createReturnStatement()]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report if statement followed by return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createIfStatement(), createReturnStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report non-block statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createNonBlockStatement())

      expect(reports.length).toBe(0)
    })

    test('should not report when all statements are normal followed by break at end', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(),
          createVariableDeclaration(),
          createIfStatement(),
          createBreakStatement(),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when all statements are normal followed by continue at end', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(),
          createVariableDeclaration(),
          createContinueStatement(),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when all statements are normal followed by throw at end', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(),
          createVariableDeclaration(),
          createThrowStatement(),
        ]),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES - NULL, UNDEFINED, MALFORMED
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(() => visitor.BlockStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(() => visitor.BlockStatement(undefined)).not.toThrow()
    })

    test('should handle empty body array', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(0)
    })

    test('should handle node without body', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const node = { type: 'BlockStatement' }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should stop after first unreachable code', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createReturnStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle node with non-array body', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const node = { type: 'BlockStatement', body: 'not an array' }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with body as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const node = { type: 'BlockStatement', body: 42 }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with body as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const node = { type: 'BlockStatement', body: { foo: 'bar' } }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with body as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const node = { type: 'BlockStatement', body: null }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with body as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const node = { type: 'BlockStatement', body: undefined }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(() => visitor.BlockStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node as number', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(() => visitor.BlockStatement(42)).not.toThrow()
    })

    test('should handle node as string', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(() => visitor.BlockStatement('BlockStatement')).not.toThrow()
    })

    test('should handle node as boolean true', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(() => visitor.BlockStatement(true)).not.toThrow()
    })

    test('should handle node as boolean false', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      expect(() => visitor.BlockStatement(false)).not.toThrow()
    })

    test('should handle node with type as non-string', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const node = { type: 123, body: [createReturnStatement(), createExpressionStatement()] }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body with null elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([null, createReturnStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should handle body with undefined elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([undefined, createReturnStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should handle statement without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const stmtNoType = { loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } } }

      visitor.BlockStatement(createBlockStatement([createReturnStatement(), stmtNoType]))

      expect(reports.length).toBe(1)
    })

    test('should handle statement with type as empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const stmtEmptyType = {
        type: '',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.BlockStatement(createBlockStatement([createReturnStatement(), stmtEmptyType]))

      expect(reports.length).toBe(1)
    })

    test('should handle body with single return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createReturnStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should handle body with single throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createThrowStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested location data', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const block = createBlockStatement(
        [createReturnStatement(10, 5), createExpressionStatement(12, 8)],
        { start: { line: 1, column: 0 }, end: { line: 20, column: 1 } },
      )

      visitor.BlockStatement(block)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  // ============================================================
  // LOCATION REPORTING
  // ============================================================
  describe('location reporting', () => {
    test('should report location of unreachable statement after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement(5, 4)]),
      )

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location of unreachable statement after throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createThrowStatement(), createExpressionStatement(3, 10)]),
      )

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location of unreachable statement after break', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createBreakStatement(), createExpressionStatement(7, 2)]),
      )

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location of unreachable statement after continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createContinueStatement(), createExpressionStatement(4, 6)]),
      )

      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement(5, 4)]),
      )

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report location from first unreachable statement not subsequent ones', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createReturnStatement(),
          createExpressionStatement(3, 0),
          createExpressionStatement(4, 0),
        ]),
      )

      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should handle statement without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const stmtNoLoc = { type: 'ExpressionStatement' }

      visitor.BlockStatement(createBlockStatement([createReturnStatement(), stmtNoLoc]))

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle statement with partial loc (only start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const stmtPartialLoc = {
        type: 'ExpressionStatement',
        loc: {
          start: { line: 5, column: 3 },
        },
      }

      visitor.BlockStatement(createBlockStatement([createReturnStatement(), stmtPartialLoc]))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle statement with loc start missing line', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const stmtMissingLine = {
        type: 'ExpressionStatement',
        loc: {
          start: { column: 3 },
          end: { line: 5, column: 8 },
        },
      }

      visitor.BlockStatement(createBlockStatement([createReturnStatement(), stmtMissingLine]))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location on line 1 column 0 for unreachable at start', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(1, 0), createExpressionStatement(1, 7)]),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report location with large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(500, 10), createExpressionStatement(1000, 20)]),
      )

      expect(reports[0].loc?.start.line).toBe(1000)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location with column at position 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(3, 5), createExpressionStatement(4, 0)]),
      )

      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ============================================================
  // MESSAGE VERIFICATION
  // ============================================================
  describe('message verification', () => {
    test('should contain "unreachable" in message for return case', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('unreachable')
    })

    test('should contain "unreachable" in message for throw case', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createThrowStatement(), createExpressionStatement()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('unreachable')
    })

    test('should contain "unreachable" in message for break case', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createBreakStatement(), createExpressionStatement()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('unreachable')
    })

    test('should contain "unreachable" in message for continue case', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createContinueStatement(), createExpressionStatement()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('unreachable')
    })

    test('should have consistent message across all terminator types', () => {
      const terminators = [
        createReturnStatement(),
        createThrowStatement(),
        createBreakStatement(),
        createContinueStatement(),
      ]

      const messages: string[] = []

      for (const terminator of terminators) {
        const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
        const visitor = noUnreachableRule.create(context)

        visitor.BlockStatement(createBlockStatement([terminator, createExpressionStatement()]))

        messages.push(reports[0].message)
      }

      // All messages should be identical
      expect(new Set(messages).size).toBe(1)
    })

    test('should have message that ends with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have message as string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      expect(typeof reports[0].message).toBe('string')
    })
  })

  // ============================================================
  // SINGLE REPORT BEHAVIOR (BREAK AFTER FIRST)
  // ============================================================
  describe('single report behavior', () => {
    test('should stop after first unreachable code with return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createReturnStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should stop after first unreachable code with throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createThrowStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should stop after first unreachable code with break', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createBreakStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should stop after first unreachable code with continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createContinueStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report only once with many statements after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createReturnStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
          createVariableDeclaration(),
          createIfStatement(),
          createWhileStatement(),
          createForStatement(),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report first unreachable statement not subsequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const unreachable1 = createExpressionStatement(3, 0)
      const unreachable2 = createExpressionStatement(4, 0)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(2, 0), unreachable1, unreachable2]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })
  })

  // ============================================================
  // MULTIPLE VISITOR INVOCATIONS
  // ============================================================
  describe('multiple visitor invocations', () => {
    test('should work correctly on second invocation with clean context', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(), createReturnStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should work correctly on multiple invocations all detecting unreachable', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      visitor.BlockStatement(
        createBlockStatement([createThrowStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle many sequential invocations', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.BlockStatement(
          createBlockStatement([createReturnStatement(), createExpressionStatement()]),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should handle alternating reachable and unreachable invocations', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )
      visitor.BlockStatement(createBlockStatement([createExpressionStatement()]))
      visitor.BlockStatement(
        createBlockStatement([createThrowStatement(), createExpressionStatement()]),
      )
      visitor.BlockStatement(createBlockStatement([createExpressionStatement()]))

      expect(reports.length).toBe(2)
    })

    test('should handle invocation with null followed by valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(null)
      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle valid followed by invocation with null', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )
      visitor.BlockStatement(null)

      expect(reports.length).toBe(1)
    })

    test('should not carry state between invocations', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      // First: has unreachable code
      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      // Second: no unreachable code
      visitor.BlockStatement(createBlockStatement([createExpressionStatement()]))

      // Only the first should have reported
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPORT VERIFICATION
  // ============================================================
  describe('exports', () => {
    test('should have default export that matches named export', async () => {
      const mod = await import('../../../../src/rules/patterns/no-unreachable.js')
      expect(mod.default).toBeDefined()
      expect(mod.default).toBe(noUnreachableRule)
    })

    test('should have named export noUnreachableRule', async () => {
      const mod = await import('../../../../src/rules/patterns/no-unreachable.js')
      expect(mod.noUnreachableRule).toBeDefined()
    })

    test('default export should be same object as named export', async () => {
      const mod = await import('../../../../src/rules/patterns/no-unreachable.js')
      expect(mod.default).toBe(mod.noUnreachableRule)
    })

    test('exported value should have meta property', () => {
      expect(noUnreachableRule).toHaveProperty('meta')
    })

    test('exported value should have create property', () => {
      expect(noUnreachableRule).toHaveProperty('create')
    })

    test('meta should be the same object reference on multiple accesses', () => {
      const meta1 = noUnreachableRule.meta
      const meta2 = noUnreachableRule.meta
      expect(meta1).toBe(meta2)
    })
  })

  // ============================================================
  // CONTEXT USAGE
  // ============================================================
  describe('context usage', () => {
    test('should call context.report with message', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push(descriptor)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'return; foo();',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unreachable code detected.')
    })

    test('should call context.report with loc', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push(descriptor)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'return; foo();',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement(5, 10)]),
      )

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should not call report when no unreachable code', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push(descriptor)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'foo(); return;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(), createReturnStatement()]),
      )

      expect(reports.length).toBe(0)
    })

    test('should work with different getFilePath implementations', () => {
      const { reports } = (() => {
        const r: ReportDescriptor[] = []
        const ctx = {
          report: (d: ReportDescriptor) => {
            r.push(d)
          },
          getFilePath: () => '/different/path.ts',
          getAST: () => null,
          getSource: () => '',
          getTokens: () => [],
          getComments: () => [],
          config: { options: [] },
          logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
          workspaceRoot: '/project',
        } as unknown as RuleContext

        const visitor = noUnreachableRule.create(ctx)
        visitor.BlockStatement(
          createBlockStatement([createReturnStatement(), createExpressionStatement()]),
        )

        return { reports: r }
      })()

      expect(reports.length).toBe(1)
    })

    test('should work with different getSource implementations', () => {
      const { reports } = (() => {
        const r: ReportDescriptor[] = []
        const ctx = {
          report: (d: ReportDescriptor) => {
            r.push(d)
          },
          getFilePath: () => '/src/file.ts',
          getAST: () => null,
          getSource: () => 'throw new Error("x"); console.log("y");',
          getTokens: () => [],
          getComments: () => [],
          config: { options: [] },
          logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
          workspaceRoot: '/src',
        } as unknown as RuleContext

        const visitor = noUnreachableRule.create(ctx)
        visitor.BlockStatement(
          createBlockStatement([createThrowStatement(), createExpressionStatement()]),
        )

        return { reports: r }
      })()

      expect(reports.length).toBe(1)
    })

    test('should not use logger during normal operation', () => {
      const debug = vi.fn()
      const info = vi.fn()
      const warn = vi.fn()
      const error = vi.fn()

      const context = {
        report: () => {},
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug, info, warn, error },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnreachableRule.create(context)
      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      expect(debug).not.toHaveBeenCalled()
      expect(info).not.toHaveBeenCalled()
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
    })
  })

  // ============================================================
  // COMBINATIONS OF TERMINATORS
  // ============================================================
  describe('terminator combinations', () => {
    test('should not report consecutive terminators at end of block', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      // return followed by throw - both at end means throw is after return
      // so throw IS unreachable
      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createThrowStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect unreachable throw after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createThrowStatement()]),
      )

      expect(reports[0].loc?.start).toBeDefined()
    })

    test('should detect unreachable return after throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createThrowStatement(), createReturnStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect unreachable break after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createBreakStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect unreachable continue after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createContinueStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect unreachable return after break', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createBreakStatement(), createReturnStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect unreachable return after continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createContinueStatement(), createReturnStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect unreachable expression after multiple normal statements then return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(),
          createVariableDeclaration(),
          createIfStatement(),
          createReturnStatement(5, 0),
          createExpressionStatement(6, 0),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(6)
    })

    test('should not report when terminator types are not matching', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      // ExpressionStatement is not a terminator
      const notATerminator = {
        type: 'DoWhileStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.BlockStatement(createBlockStatement([notATerminator, createExpressionStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should handle return with argument (value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const returnWithValue = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BlockStatement(createBlockStatement([returnWithValue, createExpressionStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should handle throw with complex argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const throwComplex = {
        type: 'ThrowStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'TypeError' },
          arguments: [{ type: 'Literal', value: 'message' }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.BlockStatement(createBlockStatement([throwComplex, createExpressionStatement()]))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // TYPE GUARD BEHAVIOR (isBlockStatement check)
  // ============================================================
  describe('type guard behavior', () => {
    test('should not process non-BlockStatement types', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const node = {
        type: 'Program',
        body: [createReturnStatement(), createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not process FunctionDeclaration type', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        body: {
          type: 'BlockStatement',
          body: [createReturnStatement(), createExpressionStatement()],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not process if type is case-insensitive mismatch', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const node = {
        type: 'blockstatement',
        body: [createReturnStatement(), createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.BlockStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should process BlockStatement with exact type match', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle node where type is a Symbol', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const node = {
        type: Symbol('BlockStatement'),
        body: [createReturnStatement(), createExpressionStatement()],
      }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // BODY ARRAY EDGE CASES
  // ============================================================
  describe('body array edge cases', () => {
    test('should handle body with single element', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createExpressionStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should handle body with two elements - no terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(1, 0), createExpressionStatement(1, 6)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle body with two elements - with terminator first', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(1, 0), createExpressionStatement(1, 6)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle body with two elements - with terminator second', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(1, 0), createReturnStatement(1, 6)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle large body array with terminator at position 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const body = [createReturnStatement()]
      for (let i = 1; i < 50; i++) {
        body.push(createExpressionStatement(i + 1, 0))
      }

      visitor.BlockStatement(createBlockStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should handle large body array with terminator in the middle', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const body: unknown[] = []
      for (let i = 0; i < 25; i++) {
        body.push(createExpressionStatement(i + 1, 0))
      }
      body.push(createReturnStatement(26, 0))
      for (let i = 27; i < 50; i++) {
        body.push(createExpressionStatement(i, 0))
      }

      visitor.BlockStatement(createBlockStatement(body))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(27)
    })

    test('should handle large body array with no terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const body: unknown[] = []
      for (let i = 0; i < 100; i++) {
        body.push(createExpressionStatement(i + 1, 0))
      }

      visitor.BlockStatement(createBlockStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should handle body with terminator as last of 3 elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(1, 0),
          createExpressionStatement(2, 0),
          createReturnStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle body with return as first and last element', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createReturnStatement(1, 0),
          createExpressionStatement(2, 0),
          createReturnStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })
  })

  // ============================================================
  // MIXED STATEMENT SCENARIOS
  // ============================================================
  describe('mixed statement scenarios', () => {
    test('should detect unreachable code in function-like block', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createVariableDeclaration(1, 0),
          createExpressionStatement(2, 0),
          createReturnStatement(3, 0),
          createExpressionStatement(4, 0),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(4)
    })

    test('should detect unreachable code in if-else-like block', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createIfStatement(1, 0),
          createThrowStatement(2, 0),
          createExpressionStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect unreachable code in loop-like block', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createWhileStatement(1, 0),
          createBreakStatement(2, 0),
          createExpressionStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect unreachable code in switch-like block', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createSwitchStatement(1, 0),
          createContinueStatement(2, 0),
          createExpressionStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle block with only variable declarations and return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createVariableDeclaration(1, 0),
          createVariableDeclaration(2, 0),
          createReturnStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle block starting with terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createReturnStatement(1, 0),
          createVariableDeclaration(2, 0),
          createExpressionStatement(3, 0),
          createIfStatement(4, 0),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report when all statements are non-terminating', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(1, 0),
          createVariableDeclaration(2, 0),
          createIfStatement(3, 0),
          createWhileStatement(4, 0),
          createForStatement(5, 0),
          createFunctionDeclaration(6, 0),
          createTryStatement(7, 0),
          createSwitchStatement(8, 0),
        ]),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // INVARIANTS
  // ============================================================
  describe('invariants', () => {
    test('rule meta should have consistent type value', () => {
      const meta = noUnreachableRule.meta
      expect(meta.type).toBe('problem')
      expect(meta.type).toBe('problem')
    })

    test('create should always return an object with BlockStatement', () => {
      const { context } = createMockRuleContext({ source: 'return; foo();' })

      for (let i = 0; i < 5; i++) {
        const visitor = noUnreachableRule.create(context)
        expect(typeof visitor.BlockStatement).toBe('function')
      }
    })

    test('should produce same results for same inputs', () => {
      const block = createBlockStatement([createReturnStatement(), createExpressionStatement()])

      const results1: number[] = []
      const results2: number[] = []

      {
        const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
        const visitor = noUnreachableRule.create(context)
        visitor.BlockStatement(block)
        results1.push(reports.length)
      }

      {
        const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
        const visitor = noUnreachableRule.create(context)
        visitor.BlockStatement(block)
        results2.push(reports.length)
      }

      expect(results1).toEqual(results2)
    })

    test('should produce same message for same scenario', () => {
      const block = createBlockStatement([createReturnStatement(), createExpressionStatement()])

      const messages: string[] = []

      for (let i = 0; i < 3; i++) {
        const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
        const visitor = noUnreachableRule.create(context)
        visitor.BlockStatement(block)
        messages.push(reports[0].message)
      }

      expect(messages[0]).toBe(messages[1])
      expect(messages[1]).toBe(messages[2])
    })
  })

  // ============================================================
  // ADDITIONAL COVERAGE - MISC STATEMENT TYPES AS TERMINATORS
  // ============================================================
  describe('misc statement type coverage', () => {
    test('should not treat ExpressionStatement as terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(1, 0), createExpressionStatement(2, 0)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not treat VariableDeclaration as terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createVariableDeclaration(1, 0), createExpressionStatement(2, 0)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not treat IfStatement as terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createIfStatement(1, 0), createExpressionStatement(2, 0)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not treat WhileStatement as terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createWhileStatement(1, 0), createExpressionStatement(2, 0)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not treat ForStatement as terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createForStatement(1, 0), createExpressionStatement(2, 0)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not treat FunctionDeclaration as terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createFunctionDeclaration(1, 0), createExpressionStatement(2, 0)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not treat TryStatement as terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createTryStatement(1, 0), createExpressionStatement(2, 0)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not treat SwitchStatement as terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createSwitchStatement(1, 0), createExpressionStatement(2, 0)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle BlockStatement with only a return and nothing after', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createReturnStatement(1, 0)]))

      expect(reports.length).toBe(0)
    })

    test('should handle BlockStatement with return as second of three statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(1, 0),
          createReturnStatement(2, 0),
          createExpressionStatement(3, 0),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should report when unreachable statement has type DebuggerStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const debuggerStmt = {
        type: 'DebuggerStatement',
        loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 11 } },
      }

      visitor.BlockStatement(createBlockStatement([createReturnStatement(), debuggerStmt]))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report when unreachable statement has type WithStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      const withStmt = {
        type: 'WithStatement',
        object: { type: 'Identifier', name: 'obj' },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 7, column: 0 }, end: { line: 7, column: 20 } },
      }

      visitor.BlockStatement(createBlockStatement([createThrowStatement(), withStmt]))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('should detect unreachable code after break in nested-like body', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(1, 0),
          createBreakStatement(2, 0),
          createExpressionStatement(3, 0),
          createVariableDeclaration(4, 0),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should detect unreachable code after continue in nested-like body', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createExpressionStatement(1, 0),
          createContinueStatement(2, 0),
          createVariableDeclaration(3, 0),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should handle body where first element is null after return', () => {
      const { context, reports } = createMockRuleContext({ source: 'return; foo();' })
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([createReturnStatement(), null]))

      expect(reports.length).toBe(1)
    })
  })
})
