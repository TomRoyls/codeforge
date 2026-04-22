import { describe, test, expect, vi } from 'vitest'
import { noLoopFuncRule } from '../../../../src/rules/patterns/no-loop-func.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

// Factory functions for creating AST nodes
function createForStatement(body: unknown, lineNumber = 1, column = 0): unknown {
  return {
    type: 'ForStatement',
    body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 50 },
    },
  }
}

function createForInStatement(body: unknown, lineNumber = 1, column = 0): unknown {
  return {
    type: 'ForInStatement',
    body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 50 },
    },
  }
}

function createForOfStatement(body: unknown, lineNumber = 1, column = 0): unknown {
  return {
    type: 'ForOfStatement',
    body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 50 },
    },
  }
}

function createWhileStatement(body: unknown, lineNumber = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 50 },
    },
  }
}

function createBlockStatement(body: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body,
  }
}

function createFunctionDeclaration(name = 'myFunc'): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name },
    params: [],
    body: { type: 'BlockStatement', body: [] },
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
  }
}

function createIfStatement(consequent: unknown, alternate: unknown = null): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Literal', value: true },
    consequent,
    alternate,
  }
}

function createExpressionStatement(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: { type: 'Literal', value: 1 },
  }
}

// Additional AST node factories
function createDoWhileStatement(body: unknown): unknown {
  return {
    type: 'DoWhileStatement',
    body,
    test: { type: 'Literal', value: true },
  }
}

function createSwitchStatement(cases: unknown[]): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'x' },
    cases,
  }
}

function createSwitchCase(consequent: unknown[]): unknown {
  return {
    type: 'SwitchCase',
    test: null,
    consequent,
  }
}

function createTryStatement(block: unknown, handler: unknown = null): unknown {
  return {
    type: 'TryStatement',
    block,
    handler,
    finalizer: null,
  }
}

function createCatchClause(body: unknown): unknown {
  return {
    type: 'CatchClause',
    param: { type: 'Identifier', name: 'e' },
    body,
  }
}

function createReturnStatement(): unknown {
  return {
    type: 'ReturnStatement',
    argument: null,
  }
}

function createVariableDeclaration(): unknown {
  return {
    type: 'VariableDeclaration',
    declarations: [],
    kind: 'let',
  }
}

function createLabeledStatement(body: unknown): unknown {
  return {
    type: 'LabeledStatement',
    label: { type: 'Identifier', name: 'label' },
    body,
  }
}

function createWithStatement(body: unknown): unknown {
  return {
    type: 'WithStatement',
    object: { type: 'Identifier', name: 'obj' },
    body,
  }
}

function createCallExpression(): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'fn' },
    arguments: [],
  }
}

describe('no-loop-func rule', () => {
  // ============================================================
  // META TESTS (20 tests)
  // ============================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noLoopFuncRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noLoopFuncRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noLoopFuncRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noLoopFuncRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noLoopFuncRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noLoopFuncRule.meta.fixable).toBeUndefined()
    })

    test('should mention loop in description', () => {
      const desc = noLoopFuncRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('loop')
    })

    test('should mention function in description', () => {
      const desc = noLoopFuncRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('function')
    })

    test('should have empty schema array', () => {
      expect(noLoopFuncRule.meta.schema).toEqual([])
    })

    test('should have documentation URL', () => {
      expect(noLoopFuncRule.meta.docs?.url).toBe('https://codeforge.dev/docs/rules/no-loop-func')
    })

    test('should have meta property', () => {
      expect(noLoopFuncRule.meta).toBeDefined()
      expect(typeof noLoopFuncRule.meta).toBe('object')
    })

    test('should have docs property in meta', () => {
      expect(noLoopFuncRule.meta.docs).toBeDefined()
      expect(typeof noLoopFuncRule.meta.docs).toBe('object')
    })

    test('should have string description', () => {
      expect(typeof noLoopFuncRule.meta.docs?.description).toBe('string')
      expect(noLoopFuncRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('should mention disallow in description', () => {
      const desc = noLoopFuncRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('disallow')
    })

    test('should mention unexpected behavior in description', () => {
      const desc = noLoopFuncRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('unexpected')
    })

    test('should mention variables in description', () => {
      const desc = noLoopFuncRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('variable')
    })

    test('should have non-empty description', () => {
      expect(noLoopFuncRule.meta.docs!.description.length).toBeGreaterThan(20)
    })

    test('should have type as string', () => {
      expect(typeof noLoopFuncRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noLoopFuncRule.meta.severity).toBe('string')
    })

    test('should have URL as string', () => {
      expect(typeof noLoopFuncRule.meta.docs?.url).toBe('string')
    })
  })

  // ============================================================
  // CREATE / VISITOR TESTS (8 tests)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with ForStatement method', () => {
      const { context } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(visitor).toHaveProperty('ForStatement')
    })

    test('should return visitor object with ForInStatement method', () => {
      const { context } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(visitor).toHaveProperty('ForInStatement')
    })

    test('should return visitor object with ForOfStatement method', () => {
      const { context } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(visitor).toHaveProperty('ForOfStatement')
    })

    test('should return visitor object with WhileStatement method', () => {
      const { context } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(visitor).toHaveProperty('WhileStatement')
    })

    test('should return function type for each visitor method', () => {
      const { context } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(typeof visitor.ForStatement).toBe('function')
      expect(typeof visitor.ForInStatement).toBe('function')
      expect(typeof visitor.ForOfStatement).toBe('function')
      expect(typeof visitor.WhileStatement).toBe('function')
    })

    test('should return exactly 4 visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const keys = Object.keys(visitor)
      expect(keys).toHaveLength(4)
    })

    test('should create a new visitor on each call', () => {
      const { context } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor1 = noLoopFuncRule.create(context)
      const visitor2 = noLoopFuncRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with different file paths', () => {
      const { context } = createMockRuleContext({ source: 'for (;;) {}', filePath: '/other/path.ts' })
      const visitor = noLoopFuncRule.create(context)

      expect(visitor).toHaveProperty('ForStatement')
      expect(typeof visitor.ForStatement).toBe('function')
    })
  })

  // ============================================================
  // DETECTION TESTS (30 tests)
  // ============================================================
  describe('detecting function declarations in ForStatement', () => {
    test('should report FunctionDeclaration inside for loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for FunctionDeclaration in for loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports[0].message).toContain('for loop')
      expect(reports[0].message).toContain('function')
    })

    test('should report FunctionExpression inside for loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report ArrowFunctionExpression inside for loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report function in nested body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createFunctionDeclaration()))

      expect(reports.length).toBe(1)
    })

    test('should not report when no function in for loop body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createExpressionStatement()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should detect function declaration with various names', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration('processItem')])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting function declarations in ForInStatement', () => {
    test('should report FunctionDeclaration inside for-in loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for FunctionDeclaration in for-in loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports[0].message).toContain('for-in loop')
      expect(reports[0].message).toContain('function')
    })

    test('should report FunctionExpression inside for-in loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report ArrowFunctionExpression inside for-in loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should not report when no function in for-in loop body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createExpressionStatement()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should detect function directly as body without BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForInStatement(createForInStatement(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting function declarations in ForOfStatement', () => {
    test('should report FunctionDeclaration inside for-of loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for FunctionDeclaration in for-of loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports[0].message).toContain('for-of loop')
      expect(reports[0].message).toContain('function')
    })

    test('should report FunctionExpression inside for-of loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report ArrowFunctionExpression inside for-of loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should not report when no function in for-of loop body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createExpressionStatement()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should detect arrow function directly as body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForOfStatement(createForOfStatement(createArrowFunctionExpression()))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting function declarations in WhileStatement', () => {
    test('should report FunctionDeclaration inside while loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for FunctionDeclaration in while loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports[0].message).toContain('while loop')
      expect(reports[0].message).toContain('function')
    })

    test('should report FunctionExpression inside while loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report ArrowFunctionExpression inside while loop block', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should not report when no function in while loop body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createExpressionStatement()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should detect function declaration directly as body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.WhileStatement(createWhileStatement(createFunctionDeclaration('directFunc')))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NOT REPORTING TESTS (30 tests)
  // ============================================================
  describe('not reporting non-function constructs', () => {
    test('should not report ExpressionStatement in for loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([createExpressionStatement()])))

      expect(reports.length).toBe(0)
    })

    test('should not report VariableDeclaration in for-in loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForInStatement(
        createForInStatement(createBlockStatement([createVariableDeclaration()])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ReturnStatement in for-of loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForOfStatement(createForOfStatement(createBlockStatement([createReturnStatement()])))

      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression in while loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const callExpr = {
        type: 'ExpressionStatement',
        expression: createCallExpression(),
      }
      visitor.WhileStatement(createWhileStatement(createBlockStatement([callExpr])))

      expect(reports.length).toBe(0)
    })

    test('should not report empty BlockStatement in for loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([])))

      expect(reports.length).toBe(0)
    })

    test('should not report empty BlockStatement in for-in loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForInStatement(createForInStatement(createBlockStatement([])))

      expect(reports.length).toBe(0)
    })

    test('should not report empty BlockStatement in for-of loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForOfStatement(createForOfStatement(createBlockStatement([])))

      expect(reports.length).toBe(0)
    })

    test('should not report empty BlockStatement in while loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.WhileStatement(createWhileStatement(createBlockStatement([])))

      expect(reports.length).toBe(0)
    })

    test('should not report DoWhileStatement in for loop body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const doWhile = createDoWhileStatement(createExpressionStatement())
      visitor.ForStatement(createForStatement(createBlockStatement([doWhile])))

      expect(reports.length).toBe(0)
    })

    test('should not report plain object without type in body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const plainObj = { value: 42 }
      visitor.ForStatement(createForStatement(createBlockStatement([plainObj])))

      expect(reports.length).toBe(0)
    })

    test('should not report numeric literal in body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(
        createForStatement(createBlockStatement([{ type: 'Literal', value: 42 }])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report string literal in body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(
        createForStatement(createBlockStatement([{ type: 'Literal', value: 'hello' }])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report BreakStatement in for loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'BreakStatement' }])))

      expect(reports.length).toBe(0)
    })

    test('should not report ContinueStatement in while loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.WhileStatement(
        createWhileStatement(createBlockStatement([{ type: 'ContinueStatement' }])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ThrowStatement in for-in loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForInStatement(
        createForInStatement(createBlockStatement([{ type: 'ThrowStatement' }])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report SwitchStatement without functions in for loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const switchCase = createSwitchCase([createExpressionStatement()])
      const switchStmt = createSwitchStatement([switchCase])
      visitor.ForStatement(createForStatement(createBlockStatement([switchStmt])))

      expect(reports.length).toBe(0)
    })

    test('should not report IfStatement without functions in while loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const ifStmt = createIfStatement(createExpressionStatement())
      visitor.WhileStatement(createWhileStatement(createBlockStatement([ifStmt])))

      expect(reports.length).toBe(0)
    })

    test('should not report TryStatement without functions in for loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const block = createBlockStatement([createExpressionStatement()])
      const tryStmt = createTryStatement(block)
      visitor.ForStatement(createForStatement(createBlockStatement([tryStmt])))

      expect(reports.length).toBe(0)
    })

    test('should not report LabeledStatement with non-function body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const labeled = createLabeledStatement(createExpressionStatement())
      visitor.ForStatement(createForStatement(createBlockStatement([labeled])))

      expect(reports.length).toBe(0)
    })

    test('should not report WithStatement with non-function body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const withStmt = createWithStatement(createExpressionStatement())
      visitor.WhileStatement(createWhileStatement(createBlockStatement([withStmt])))

      expect(reports.length).toBe(0)
    })

    test('should not report UpdateExpression in for loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'UpdateExpression' }])))

      expect(reports.length).toBe(0)
    })

    test('should not report AssignmentExpression in while loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.WhileStatement(
        createWhileStatement(createBlockStatement([{ type: 'AssignmentExpression' }])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression in for-of loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForOfStatement(
        createForOfStatement(createBlockStatement([{ type: 'BinaryExpression' }])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ConditionalExpression in for-in loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForInStatement(
        createForInStatement(createBlockStatement([{ type: 'ConditionalExpression' }])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression in for loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'NewExpression' }])))

      expect(reports.length).toBe(0)
    })

    test('should not report MemberExpression in while loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.WhileStatement(
        createWhileStatement(createBlockStatement([{ type: 'MemberExpression' }])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ArrayExpression in for-of loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForOfStatement(
        createForOfStatement(createBlockStatement([{ type: 'ArrayExpression' }])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ObjectExpression in for-in loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForInStatement(
        createForInStatement(createBlockStatement([{ type: 'ObjectExpression' }])),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report TemplateLiteral in for loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'TemplateLiteral' }])))

      expect(reports.length).toBe(0)
    })

    test('should not report TaggedTemplateExpression in while loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.WhileStatement(
        createWhileStatement(createBlockStatement([{ type: 'TaggedTemplateExpression' }])),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES (25 tests)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node for ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node for ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node for ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForStatement('string')).not.toThrow()
      expect(() => visitor.ForStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node for ForInStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForInStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node for ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForOfStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node for WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.WhileStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const node = { type: 'ForStatement' }
      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const node = { type: 'ForStatement', body: null }
      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined rule config', () => {
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
        getSource: () => 'for (;;) { function foo() {} }',
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

      const visitor = noLoopFuncRule.create(context)
      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should handle IfStatement with null alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const ifStmt = createIfStatement(createExpressionStatement(), null)
      const body = createBlockStatement([ifStmt])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should handle unknown node type in body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([{ type: 'UnknownStatement' }])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should handle body as non-array in BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = { type: 'BlockStatement', body: 'not-an-array' }
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node for ForInStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForInStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node for ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForOfStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node for WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.WhileStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForStatement(true)).not.toThrow()
      expect(() => visitor.ForStatement(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node for all visitors', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForStatement(0)).not.toThrow()
      expect(() => visitor.ForInStatement(-1)).not.toThrow()
      expect(() => visitor.ForOfStatement(3.14)).not.toThrow()
      expect(() => visitor.WhileStatement(NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const node = { type: 'ForStatement', body: undefined }
      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const node = { type: 'ForStatement', body: '' }
      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested non-function structures', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const innerIf = createIfStatement(createExpressionStatement(), createExpressionStatement())
      const outerIf = createIfStatement(innerIf, createExpressionStatement())
      const body = createBlockStatement([outerIf])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should handle BlockStatement body as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = { type: 'BlockStatement', body: 42 }
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should handle node that is an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForStatement([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // LOCATION REPORTING (15 tests)
  // ============================================================
  describe('location reporting', () => {
    test('should report correct location for ForStatement with function', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position for ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body, 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for ForInStatement with function', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body, 15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location for ForOfStatement with function', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body, 20, 12))

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report correct location for WhileStatement with function', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body, 25, 3))

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end line matching node end location for ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body, 7, 2))

      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should report end column matching node end column for ForInStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body, 3, 15))

      expect(reports[0].loc?.end.column).toBe(50)
    })

    test('should report different locations for different loop types', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body, 1, 0))
      visitor.ForInStatement(createForInStatement(body, 5, 10))
      visitor.ForOfStatement(createForOfStatement(body, 10, 20))
      visitor.WhileStatement(createWhileStatement(body, 15, 30))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
      expect(reports[3].loc?.start.line).toBe(15)
    })

    test('should report location for high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body, 1000, 500))

      expect(reports[0].loc?.start.line).toBe(1000)
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body, 42, 0))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should include both start and end in location object', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body, 8, 4))

      const loc = reports[0].loc
      expect(loc).toBeDefined()
      expect(loc?.start).toHaveProperty('line')
      expect(loc?.start).toHaveProperty('column')
      expect(loc?.end).toHaveProperty('line')
      expect(loc?.end).toHaveProperty('column')
    })

    test('should report location for ForStatement at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body, 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve exact location across all loop types at same position', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body, 3, 7))
      visitor.ForInStatement(createForInStatement(body, 3, 7))

      expect(reports[0].loc?.start.line).toBe(reports[1].loc?.start.line)
      expect(reports[0].loc?.start.column).toBe(reports[1].loc?.start.column)
    })

    test('should handle location with large column offset', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body, 1, 999))

      expect(reports[0].loc?.start.column).toBe(999)
    })
  })

  // ============================================================
  // MESSAGE QUALITY (10 tests)
  // ============================================================
  describe('message quality', () => {
    test('should mention loop in ForStatement message', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports[0].message).toContain('for loop')
    })

    test('should mention loop in ForInStatement message', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports[0].message).toContain('for-in loop')
    })

    test('should mention loop in ForOfStatement message', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports[0].message).toContain('for-of loop')
    })

    test('should mention loop in WhileStatement message', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports[0].message).toContain('while loop')
    })

    test('should mention function in all messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))
      visitor.ForInStatement(createForInStatement(body))
      visitor.ForOfStatement(createForOfStatement(body))
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(4)
      reports.forEach((report) => {
        expect(report.message).toContain('function')
      })
    })

    test('should mention moving function outside in messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports[0].message.toLowerCase()).toContain('move')
    })

    test('should have unique messages for each loop type', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))
      visitor.ForInStatement(createForInStatement(body))
      visitor.ForOfStatement(createForOfStatement(body))
      visitor.WhileStatement(createWhileStatement(body))

      const messages = reports.map((r) => r.message)
      expect(new Set(messages).size).toBe(4)
    })

    test('should have non-empty messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))
      visitor.WhileStatement(createWhileStatement(body))

      reports.forEach((report) => {
        expect(report.message.length).toBeGreaterThan(0)
      })
    })

    test('should mention Unexpected in all messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))
      visitor.ForInStatement(createForInStatement(body))
      visitor.ForOfStatement(createForOfStatement(body))
      visitor.WhileStatement(createWhileStatement(body))

      reports.forEach((report) => {
        expect(report.message).toContain('Unexpected')
      })
    })

    test('should mention capturing correct variable values in messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports[0].message.toLowerCase()).toContain('captures')
    })
  })

  // ============================================================
  // MULTIPLE REPORTS (10 tests)
  // ============================================================
  describe('multiple loop types in same context', () => {
    test('should report for all loop types independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))
      visitor.ForInStatement(createForInStatement(body))
      visitor.ForOfStatement(createForOfStatement(body))
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(4)
    })

    test('should only report for loops with functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const bodyWithFunction = createBlockStatement([createFunctionDeclaration()])
      const bodyWithoutFunction = createBlockStatement([createExpressionStatement()])

      visitor.ForStatement(createForStatement(bodyWithFunction))
      visitor.ForInStatement(createForStatement(bodyWithoutFunction))
      visitor.ForOfStatement(createForOfStatement(bodyWithFunction))
      visitor.WhileStatement(createWhileStatement(bodyWithoutFunction))

      expect(reports.length).toBe(2)
    })

    test('should report once per loop even with multiple functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([
        createFunctionDeclaration('func1'),
        createFunctionDeclaration('func2'),
      ])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report for each distinct loop call', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))
      visitor.ForStatement(createForStatement(body, 2, 0))
      visitor.ForStatement(createForStatement(body, 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report correctly when mixing function types across loops', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([createFunctionDeclaration()])))
      visitor.WhileStatement(
        createWhileStatement(createBlockStatement([createFunctionExpression()])),
      )
      visitor.ForOfStatement(
        createForOfStatement(createBlockStatement([createArrowFunctionExpression()])),
      )

      expect(reports.length).toBe(3)
    })

    test('should accumulate reports across all four loop types', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const funcBody = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(funcBody))
      visitor.ForInStatement(createForInStatement(funcBody))

      expect(reports.length).toBe(2)

      visitor.ForOfStatement(createForOfStatement(funcBody))
      expect(reports.length).toBe(3)

      visitor.WhileStatement(createWhileStatement(funcBody))
      expect(reports.length).toBe(4)
    })

    test('should handle interleaved report and no-report calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const funcBody = createBlockStatement([createFunctionDeclaration()])
      const noFuncBody = createBlockStatement([createExpressionStatement()])

      visitor.ForStatement(createForStatement(funcBody))
      visitor.ForStatement(createForStatement(noFuncBody))
      visitor.WhileStatement(createWhileStatement(funcBody))
      visitor.WhileStatement(createWhileStatement(noFuncBody))

      expect(reports.length).toBe(2)
    })

    test('should not mix up messages between loop types', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports[0].message).toContain('for loop')
      expect(reports[1].message).toContain('while loop')
    })

    test('should handle 10 consecutive loop calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const funcBody = createBlockStatement([createFunctionDeclaration()])

      for (let i = 0; i < 10; i++) {
        visitor.ForStatement(createForStatement(funcBody, i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle mix of all four types called multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const funcBody = createBlockStatement([createFunctionDeclaration()])

      visitor.ForStatement(createForStatement(funcBody))
      visitor.ForInStatement(createForInStatement(funcBody))
      visitor.ForStatement(createForStatement(funcBody, 2, 0))
      visitor.ForOfStatement(createForOfStatement(funcBody))
      visitor.WhileStatement(createWhileStatement(funcBody))
      visitor.ForInStatement(createForInStatement(funcBody, 2, 0))

      expect(reports.length).toBe(6)
    })
  })

  // ============================================================
  // CONTEXT TESTS (10 tests)
  // ============================================================
  describe('context handling', () => {
    test('should work with different source code strings', () => {
      const { context, reports } = createMockRuleContext({ source: 'while (true) { function f() {} }', filePath: '/src/file.ts' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const paths = ['/src/a.ts', '/src/b.ts', '/deep/nested/c.ts']

      paths.forEach((path) => {
        const { context, reports } = createMockRuleContext({ source: 'for (;;) {}', filePath: path })
        const visitor = noLoopFuncRule.create(context)

        const body = createBlockStatement([createFunctionDeclaration()])
        visitor.ForStatement(createForStatement(body))

        expect(reports.length).toBe(1)
      })
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-loop-func': ['error', {}] } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noLoopFuncRule.create(context)
      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should work with config that has extra rules', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: {
          rules: {
            'no-loop-func': ['error', {}],
            'other-rule': ['warn'],
            'another-rule': ['error', { option: true }],
          },
        },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noLoopFuncRule.create(context)
      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ extraOption: true, anotherSetting: 'value' }], source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should work when context getAST returns an object', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => ({ type: 'Program', body: [] }),
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-loop-func': ['error', {}] } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noLoopFuncRule.create(context)
      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should work when context getTokens returns token array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [{ type: 'Keyword', value: 'for' }],
        getComments: () => [],
        config: { rules: { 'no-loop-func': ['error', {}] } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noLoopFuncRule.create(context)
      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should work when context getComments returns comment array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [{ type: 'Line', value: ' comment' }],
        config: { rules: { 'no-loop-func': ['error', {}] } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noLoopFuncRule.create(context)
      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should work with severity warn in config', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-loop-func': ['warn', {}] } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noLoopFuncRule.create(context)
      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NESTED FUNCTION DETECTION (10 tests)
  // ============================================================
  describe('nested function detection', () => {
    test('should detect function inside IfStatement consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const ifStmt = createIfStatement(createFunctionDeclaration())
      const body = createBlockStatement([ifStmt])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect function inside IfStatement alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const ifStmt = createIfStatement(createExpressionStatement(), createFunctionDeclaration())
      const body = createBlockStatement([ifStmt])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect function deeply nested in if-else chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const nestedIf = createIfStatement(createFunctionDeclaration())
      const ifStmt = createIfStatement(createExpressionStatement(), nestedIf)
      const body = createBlockStatement([ifStmt])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect function in nested BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const innerBlock = createBlockStatement([createFunctionDeclaration()])
      const outerBlock = createBlockStatement([innerBlock])
      visitor.ForStatement(createForStatement(outerBlock))

      expect(reports.length).toBe(1)
    })

    test('should detect multiple functions in loop body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([
        createFunctionDeclaration('func1'),
        createFunctionDeclaration('func2'),
      ])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect function inside nested LabeledStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const labeled = createLabeledStatement(createFunctionDeclaration())
      const body = createBlockStatement([labeled])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect function inside WithStatement body', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const withStmt = createWithStatement(createFunctionDeclaration())
      const body = createBlockStatement([withStmt])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should not traverse into TryStatement catch clause (rule limitation)', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const catchBody = createBlockStatement([createFunctionDeclaration()])
      const catchClause = createCatchClause(catchBody)
      const tryBlock = createBlockStatement([createExpressionStatement()])
      const tryStmt = createTryStatement(tryBlock, catchClause)
      visitor.ForStatement(createForStatement(createBlockStatement([tryStmt])))

      expect(reports.length).toBe(0)
    })

    test('should detect function inside IfStatement in while loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const ifStmt = createIfStatement(createBlockStatement([createArrowFunctionExpression()]))
      const body = createBlockStatement([ifStmt])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect function in deeply nested blocks in for-of loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const level3 = createBlockStatement([createFunctionExpression()])
      const level2 = createBlockStatement([level3])
      const level1 = createBlockStatement([level2])
      visitor.ForOfStatement(createForOfStatement(level1))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // PARAMETERIZED FUNCTION TYPE DETECTION (12 tests)
  // ============================================================
  describe('parameterized function type detection', () => {
    test('should detect FunctionDeclaration in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect FunctionExpression in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect ArrowFunctionExpression in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect FunctionDeclaration in ForInStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect FunctionExpression in ForInStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect ArrowFunctionExpression in ForInStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect FunctionDeclaration in ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect FunctionExpression in ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect ArrowFunctionExpression in ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect FunctionDeclaration in WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect FunctionExpression in WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect ArrowFunctionExpression in WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // PARAMETERIZED NON-FUNCTION TYPES (16 tests)
  // ============================================================
  describe('parameterized non-function types', () => {
    test('should not report ExpressionStatement in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(
        createForStatement(createBlockStatement([{ type: 'ExpressionStatement' }])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report VariableDeclaration in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(
        createForStatement(createBlockStatement([{ type: 'VariableDeclaration' }])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report ReturnStatement in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'ReturnStatement' }])))
      expect(reports.length).toBe(0)
    })

    test('should not report BreakStatement in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'BreakStatement' }])))
      expect(reports.length).toBe(0)
    })

    test('should not report ContinueStatement in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(
        createForStatement(createBlockStatement([{ type: 'ContinueStatement' }])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report ThrowStatement in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'ThrowStatement' }])))
      expect(reports.length).toBe(0)
    })

    test('should not report UpdateExpression in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'UpdateExpression' }])))
      expect(reports.length).toBe(0)
    })

    test('should not report AssignmentExpression in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(
        createForStatement(createBlockStatement([{ type: 'AssignmentExpression' }])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'BinaryExpression' }])))
      expect(reports.length).toBe(0)
    })

    test('should not report ConditionalExpression in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(
        createForStatement(createBlockStatement([{ type: 'ConditionalExpression' }])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'NewExpression' }])))
      expect(reports.length).toBe(0)
    })

    test('should not report MemberExpression in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'MemberExpression' }])))
      expect(reports.length).toBe(0)
    })

    test('should not report ArrayExpression in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'ArrayExpression' }])))
      expect(reports.length).toBe(0)
    })

    test('should not report ObjectExpression in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'ObjectExpression' }])))
      expect(reports.length).toBe(0)
    })

    test('should not report TemplateLiteral in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([{ type: 'TemplateLiteral' }])))
      expect(reports.length).toBe(0)
    })

    test('should not report TaggedTemplateExpression in ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(
        createForStatement(createBlockStatement([{ type: 'TaggedTemplateExpression' }])),
      )
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // PARAMETERIZED NULL HANDLING ACROSS LOOP TYPES (4 tests)
  // ============================================================
  describe('parameterized loop type null handling', () => {
    test('should handle null node for ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitorObj = noLoopFuncRule.create(context)

      expect(() => visitorObj.ForStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node for ForInStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitorObj = noLoopFuncRule.create(context)

      expect(() => visitorObj.ForInStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node for ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitorObj = noLoopFuncRule.create(context)

      expect(() => visitorObj.ForOfStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node for WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitorObj = noLoopFuncRule.create(context)

      expect(() => visitorObj.WhileStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // PARAMETERIZED EMPTY BODY ACROSS LOOP TYPES (4 tests)
  // ============================================================
  describe('parameterized empty body across loop types', () => {
    test('should not report empty BlockStatement for ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForStatement(createForStatement(createBlockStatement([])))
      expect(reports.length).toBe(0)
    })

    test('should not report empty BlockStatement for ForInStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForInStatement(createForInStatement(createBlockStatement([])))
      expect(reports.length).toBe(0)
    })

    test('should not report empty BlockStatement for ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.ForOfStatement(createForOfStatement(createBlockStatement([])))
      expect(reports.length).toBe(0)
    })

    test('should not report empty BlockStatement for WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      visitor.WhileStatement(createWhileStatement(createBlockStatement([])))
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // PARAMETERIZED LOCATION ACROSS LOOP TYPES (4 tests)
  // ============================================================
  describe('parameterized location across loop types', () => {
    test('should report correct location for ForStatement at line 5 col 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body, 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for ForInStatement at line 5 col 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body, 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for ForOfStatement at line 5 col 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body, 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for WhileStatement at line 5 col 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body, 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  // ============================================================
  // PARAMETERIZED MESSAGE CONTENT ACROSS LOOP TYPES (4 tests)
  // ============================================================
  describe('parameterized message content across loop types', () => {
    test('should include "for loop" in message for ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports[0].message).toContain('for loop')
    })

    test('should include "for-in loop" in message for ForInStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports[0].message).toContain('for-in loop')
    })

    test('should include "for-of loop" in message for ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports[0].message).toContain('for-of loop')
    })

    test('should include "while loop" in message for WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'for (;;) {}' })
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports[0].message).toContain('while loop')
    })
  })
})
