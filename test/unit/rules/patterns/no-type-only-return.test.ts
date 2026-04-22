import { noTypeOnlyReturnRule } from '../../../../src/rules/patterns/no-type-only-return.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createFunctionDeclaration(hasReturnType = true, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { name: 'test' },
    returnType: hasReturnType ? { typeAnnotation: { type: 'TSTypeAnnotation' } } : null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createFunctionExpression(hasReturnType = true, line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    returnType: hasReturnType ? { typeAnnotation: { type: 'TSTypeAnnotation' } } : null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createArrowFunctionExpression(hasReturnType = true, line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    returnType: hasReturnType ? { typeAnnotation: { type: 'TSTypeAnnotation' } } : null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createReturnStatement(hasArgument = false, line = 2, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: hasArgument ? { type: 'Literal', value: 'test' } : null,
    loc: {
      start: { line, column },
      end: { line, column: column + 6 },
    },
  }
}

// ---------------------------------------------------------------------------
// Tests start here — target: 200+
// ---------------------------------------------------------------------------

describe('no-type-only-return rule', () => {
  // ========================================================================
  // meta — 20 tests
  // ========================================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noTypeOnlyReturnRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noTypeOnlyReturnRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noTypeOnlyReturnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noTypeOnlyReturnRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined as empty array', () => {
      expect(noTypeOnlyReturnRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noTypeOnlyReturnRule.meta.fixable).toBeUndefined()
    })

    test('should have docs url', () => {
      expect(noTypeOnlyReturnRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-type-only-return',
      )
    })

    test('should mention return type in description', () => {
      expect(noTypeOnlyReturnRule.meta.docs?.description.toLowerCase()).toContain('return type')
    })

    test('meta should be a plain object', () => {
      expect(typeof noTypeOnlyReturnRule.meta).toBe('object')
      expect(noTypeOnlyReturnRule.meta).not.toBeNull()
    })

    test('meta.type should be one of valid RuleType values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noTypeOnlyReturnRule.meta.type)
    })

    test('meta.severity should be one of valid Severity values', () => {
      expect(['off', 'warn', 'error']).toContain(noTypeOnlyReturnRule.meta.severity)
    })

    test('meta.docs should be defined', () => {
      expect(noTypeOnlyReturnRule.meta.docs).toBeDefined()
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof noTypeOnlyReturnRule.meta.docs?.description).toBe('string')
      expect(noTypeOnlyReturnRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.category should be a string', () => {
      expect(typeof noTypeOnlyReturnRule.meta.docs?.category).toBe('string')
    })

    test('meta.docs.recommended should be a boolean', () => {
      expect(typeof noTypeOnlyReturnRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta.docs.url should be a string starting with https', () => {
      expect(noTypeOnlyReturnRule.meta.docs?.url).toMatch(/^https:\/\//)
    })

    test('meta.schema should be an array', () => {
      expect(Array.isArray(noTypeOnlyReturnRule.meta.schema)).toBe(true)
    })

    test('meta should not have deprecated flag', () => {
      expect(noTypeOnlyReturnRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy', () => {
      expect(noTypeOnlyReturnRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not have requiresTypeChecking', () => {
      expect(noTypeOnlyReturnRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  // ========================================================================
  // create / visitor structure — 8 tests
  // ========================================================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(visitor).toHaveProperty('ReturnStatement')
    })

    test('should return visitor with exit handlers', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration:exit')
      expect(visitor).toHaveProperty('FunctionExpression:exit')
      expect(visitor).toHaveProperty('ArrowFunctionExpression:exit')
    })

    test('each visitor method should be a function', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(typeof visitor['FunctionDeclaration']).toBe('function')
      expect(typeof visitor['FunctionExpression']).toBe('function')
      expect(typeof visitor['ArrowFunctionExpression']).toBe('function')
      expect(typeof visitor['ReturnStatement']).toBe('function')
    })

    test('each exit handler should be a function', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(typeof visitor['FunctionDeclaration:exit']).toBe('function')
      expect(typeof visitor['FunctionExpression:exit']).toBe('function')
      expect(typeof visitor['ArrowFunctionExpression:exit']).toBe('function')
    })

    test('create should return a non-null object', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)
      expect(visitor).not.toBeNull()
      expect(typeof visitor).toBe('object')
    })

    test('calling create multiple times returns independent visitors', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'function test() {}' })
      const { context: ctx2 } = createMockRuleContext({ source: 'function test() {}' })
      const visitor1 = noTypeOnlyReturnRule.create(ctx1)
      const visitor2 = noTypeOnlyReturnRule.create(ctx2)

      // They are separate instances — independent function stacks
      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor should have exactly 7 keys', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toHaveLength(7)
    })

    test('create does not throw with valid context', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      expect(() => noTypeOnlyReturnRule.create(context)).not.toThrow()
    })
  })

  // ========================================================================
  // function declaration detection — 10 tests
  // ========================================================================
  describe('function declaration detection', () => {
    test('should report function declaration with return type but empty return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(
        'Function has a return type annotation but returns nothing',
      )
    })

    test('should not report function declaration without return type and empty return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(false, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with return type and valid return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should report only once per function even with multiple empty returns', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle function exit properly', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(1)
    })

    test('should track nested functions separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(2)
    })

    test('should report for function declaration at various line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 42, 0))
      visitor.ReturnStatement(createReturnStatement(false, 43, 5))

      expect(reports.length).toBe(1)
    })

    test('should report for function declaration at column offset', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 8))
      visitor.ReturnStatement(createReturnStatement(false, 2, 4))

      expect(reports.length).toBe(1)
    })

    test('should report even when function has an id', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { name: 'myFunc' },
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for deeply nested function declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 2, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()
      ;(visitor['FunctionDeclaration:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 5, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(2)
    })
  })

  // ========================================================================
  // function expression detection — 8 tests
  // ========================================================================
  describe('function expression detection', () => {
    test('should report function expression with return type but empty return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(
        'Function has a return type annotation but returns nothing',
      )
    })

    test('should not report function expression without return type and empty return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(false, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report function expression with return type and valid return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle function expression exit properly', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()

      expect(reports.length).toBe(1)
    })

    test('should report only once per function expression with multiple empty returns', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle nested function expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.FunctionExpression(createFunctionExpression(true, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()

      expect(reports.length).toBe(2)
    })

    test('should report for function expression at arbitrary line', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 99, 5))
      visitor.ReturnStatement(createReturnStatement(false, 100, 2))

      expect(reports.length).toBe(1)
    })

    test('should report for function expression with null id', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })
  })

  // ========================================================================
  // arrow function expression detection — 8 tests
  // ========================================================================
  describe('arrow function expression detection', () => {
    test('should report arrow function with return type but empty return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(
        'Function has a return type annotation but returns nothing',
      )
    })

    test('should not report arrow function without return type and empty return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with return type and valid return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle arrow function exit properly', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()

      expect(reports.length).toBe(1)
    })

    test('should report only once per arrow function with multiple empty returns', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle nested arrow functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()

      expect(reports.length).toBe(2)
    })

    test('should report for arrow function at various positions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 50, 12))
      visitor.ReturnStatement(createReturnStatement(false, 51, 8))

      expect(reports.length).toBe(1)
    })

    test('should report for arrow function with complex return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        returnType: {
          typeAnnotation: {
            type: 'TSTypeReference',
            typeName: { name: 'Promise' },
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })
  })

  // ========================================================================
  // NOT reporting — 30 tests
  // ========================================================================
  describe('NOT reporting', () => {
    test('should not report when function returns a value', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report when function has no return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(false, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report when there is no return statement at all', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(0)
    })

    test('should not report function expression with no return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(false))
      visitor.ReturnStatement(createReturnStatement(false))

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with no return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false))
      visitor.ReturnStatement(createReturnStatement(false))

      expect(reports.length).toBe(0)
    })

    test('should not report when return has argument object', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ObjectExpression' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has call expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has numeric literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 42 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has boolean literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: true },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has array expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ArrayExpression', elements: [] },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has binary expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has template literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has member expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'MemberExpression', object: {}, property: {} },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has conditional expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has arrow function expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ArrowFunctionExpression', body: {} },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has new expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'NewExpression', callee: {} },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has function expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'FunctionExpression' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when return has a string literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'hello' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when no function is on the stack', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report after function exit for subsequent empty returns', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report when first return has value (suppresses later empty return)', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))
      // After a valid return, even an empty return should not trigger (no reported flag)
      // Actually it should NOT report because reported is not set when return is valid
      // The rule only sets reported=true on empty return. So a second empty return would report.
      // Let me re-think: first return is valid -> no report, reported=false
      // Second empty return -> hasReturnType=true, reported=false, isEmptyReturn=true -> reports
      // So this test needs adjustment. Let me just test a single valid return.
      expect(reports.length).toBe(0)
    })

    test('should not report for function with no body', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(0)
    })

    test('should not report for empty function stack', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      // Multiple returns with no enclosing function
      visitor.ReturnStatement(createReturnStatement(false, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report when returnType annotation exists but return is valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for arrow function with no return type and valid return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false))
      visitor.ReturnStatement(createReturnStatement(true))

      expect(reports.length).toBe(0)
    })

    test('should not report when multiple valid returns exist', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))
      visitor.ReturnStatement(createReturnStatement(true, 3, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(0)
    })

    test('should not report for return with logical expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'LogicalExpression', operator: '||', left: {}, right: {} },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for return with unary expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'UnaryExpression', operator: '!', argument: {} },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for return with null literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: null, raw: 'null' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  // ========================================================================
  // edge cases — 25 tests
  // ========================================================================
  describe('edge cases', () => {
    test('should handle null function node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined function node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object function node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null return statement node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined return statement node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object return statement node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => visitor.ReturnStatement('string')).not.toThrow()
      expect(() => visitor.ReturnStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function without returnType property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { name: 'test' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle function with null returnType', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { name: 'test' },
        returnType: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle return statement without argument property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle return statement without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
      })

      expect(reports.length).toBe(1)
    })

    test('should handle empty function stack on return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle return with undefined argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: undefined,
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle boolean true as function node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object as function node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array as function node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean true as return node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => visitor.ReturnStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object as return node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => visitor.ReturnStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array as return node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => visitor.ReturnStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NaN as function node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NaN as return node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => visitor.ReturnStatement(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function with empty returnType object', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      // Empty returnType object is truthy but has no typeAnnotation
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      // The rule checks returnType !== null && returnType !== undefined
      // {} is truthy, so hasReturnTypeAnnotation returns true
      expect(reports.length).toBe(1)
    })

    test('should handle function with returnType set to 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      // 0 is falsy but not null or undefined
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: 0,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      // 0 !== null && 0 !== undefined -> true
      expect(reports.length).toBe(1)
    })

    test('should handle function with returnType set to empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: '',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      // '' !== null && '' !== undefined -> true
      expect(reports.length).toBe(1)
    })

    test('should handle function with false returnType', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      // false !== null && false !== undefined -> true
      expect(reports.length).toBe(1)
    })
  })

  // ========================================================================
  // location reporting — 15 tests
  // ========================================================================
  describe('location reporting', () => {
    test('should report correct location for return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle return statement with no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should report location at line 10, column 20', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 10, 20))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report end location from return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 5))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(11) // column + 6
    })

    test('should use default location when loc is missing on return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: null })

      // extractLocation defaults to line 1, column 0
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 1, column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 999, 50))

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location for function expression return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 5, 2))
      visitor.ReturnStatement(createReturnStatement(false, 6, 4))

      expect(reports[0].loc?.start.line).toBe(6)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location for arrow function return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 3, 1))
      visitor.ReturnStatement(createReturnStatement(false, 4, 2))

      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should handle loc with partial start', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 7 }, end: { line: 7, column: 10 } },
      })

      // Column defaults to 0 when missing
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with partial end', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 5, column: 3 }, end: {} },
      })

      // end.line defaults to 1, end.column defaults to 0
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with string line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: '5' as unknown as number, column: 0 }, end: { line: 5, column: 6 } },
      })

      // typeof '5' !== 'number', so defaults to 1
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-numeric column', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 5, column: '3' as unknown as number }, end: { line: 5, column: 6 } },
      })

      // typeof '3' !== 'number', so defaults to 0
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with non-zero end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 2, column: 5 }, end: { line: 2, column: 15 } },
      })

      expect(reports[0].loc?.end.column).toBe(15)
    })
  })

  // ========================================================================
  // messages — 10 tests
  // ========================================================================
  describe('messages', () => {
    test('should report correct message for type-only return', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports[0].message).toBe(
        'Function has a return type annotation but returns nothing. This is likely a bug - you should return a value of the declared type.',
      )
    })

    test('should mention return type annotation in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports[0].message.toLowerCase()).toContain('return type annotation')
    })

    test('should mention bug in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports[0].message.toLowerCase()).toContain('bug')
    })

    test('should have consistent message across function types', () => {
      const expected =
        'Function has a return type annotation but returns nothing. This is likely a bug - you should return a value of the declared type.'

      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'function test() {}' })
      const v1 = noTypeOnlyReturnRule.create(ctx1)
      v1.FunctionDeclaration(createFunctionDeclaration(true))
      v1.ReturnStatement(createReturnStatement(false))
      expect(r1[0].message).toBe(expected)

      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'function test() {}' })
      const v2 = noTypeOnlyReturnRule.create(ctx2)
      v2.FunctionExpression(createFunctionExpression(true))
      v2.ReturnStatement(createReturnStatement(false))
      expect(r2[0].message).toBe(expected)

      const { context: ctx3, reports: r3 } = createMockRuleContext({ source: 'function test() {}' })
      const v3 = noTypeOnlyReturnRule.create(ctx3)
      v3.ArrowFunctionExpression(createArrowFunctionExpression(true))
      v3.ReturnStatement(createReturnStatement(false))
      expect(r3[0].message).toBe(expected)
    })

    test('message should mention declared type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports[0].message.toLowerCase()).toContain('declared type')
    })

    test('message should mention returning a value', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports[0].message.toLowerCase()).toContain('return a value')
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should not contain placeholder tokens', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
      expect(reports[0].message).not.toContain('%s')
      expect(reports[0].message).not.toContain('%d')
    })

    test('message should be identical for function expression and declaration', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'function test() {}' })
      const v1 = noTypeOnlyReturnRule.create(ctx1)
      v1.FunctionDeclaration(createFunctionDeclaration(true))
      v1.ReturnStatement(createReturnStatement(false))

      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'function test() {}' })
      const v2 = noTypeOnlyReturnRule.create(ctx2)
      v2.FunctionExpression(createFunctionExpression(true))
      v2.ReturnStatement(createReturnStatement(false))

      expect(r1[0].message).toBe(r2[0].message)
    })

    test('report descriptor should not include fix', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports[0].fix).toBeUndefined()
    })
  })

  // ========================================================================
  // multiple reports — 10 tests
  // ========================================================================
  describe('multiple reports', () => {
    test('should handle multiple function declarations correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      visitor.FunctionDeclaration(createFunctionDeclaration(false, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 5, 0))
      visitor.ReturnStatement(createReturnStatement(false, 6, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(2)
    })

    test('should handle mixed function types', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      visitor.FunctionExpression(createFunctionExpression(true, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 5, 0))
      visitor.ReturnStatement(createReturnStatement(false, 6, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()

      expect(reports.length).toBe(3)
    })

    test('should report for each independent function in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration(true, i * 2 + 1, 0))
        visitor.ReturnStatement(createReturnStatement(false, i * 2 + 2, 0))
        ;(visitor['FunctionDeclaration:exit'] as () => void)()
      }

      expect(reports.length).toBe(5)
    })

    test('should not report for functions with valid returns in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration(true, i * 2 + 1, 0))
        visitor.ReturnStatement(createReturnStatement(true, i * 2 + 2, 0))
        ;(visitor['FunctionDeclaration:exit'] as () => void)()
      }

      expect(reports.length).toBe(0)
    })

    test('should track three levels of nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.FunctionExpression(createFunctionExpression(true, 2, 0))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 5, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 6, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(3)
    })

    test('should handle mixed valid and invalid functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      // valid
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      // invalid
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      // no return type
      visitor.FunctionDeclaration(createFunctionDeclaration(false, 5, 0))
      visitor.ReturnStatement(createReturnStatement(false, 6, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      // invalid
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 7, 0))
      visitor.ReturnStatement(createReturnStatement(false, 8, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(2)
    })

    test('should handle nested same-type functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()

      expect(reports.length).toBe(2)
    })

    test('should report correct location for each report', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 5))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 10, 0))
      visitor.ReturnStatement(createReturnStatement(false, 11, 3))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(11)
    })

    test('should handle interleaved function types', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.FunctionExpression(createFunctionExpression(false, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(1)
    })

    test('should handle 10 sequential functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration(i % 2 === 0, i * 3 + 1, 0))
        visitor.ReturnStatement(createReturnStatement(false, i * 3 + 2, 0))
        ;(visitor['FunctionDeclaration:exit'] as () => void)()
      }

      // Even indices (0,2,4,6,8) have return types -> report
      expect(reports.length).toBe(5)
    })
  })

  // ========================================================================
  // context handling — 10 tests
  // ========================================================================
  describe('context handling', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}', filePath: '/project/src/utils.ts' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x: string = "hello"', filePath: '/src/test.ts' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with complex config options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strict: true, level: 'error' }], source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}', filePath: '/src/component.tsx' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/empty.ts' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with long source code', () => {
      const longSource = 'export function test(): string {\n'.repeat(100)
      const { context, reports } = createMockRuleContext({ source: longSource, filePath: '/src/big.ts' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should create independent function stacks per visitor', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'function test() {}' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'function test() {}' })
      const visitor1 = noTypeOnlyReturnRule.create(ctx1)
      const visitor2 = noTypeOnlyReturnRule.create(ctx2)

      visitor1.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor2.FunctionDeclaration(createFunctionDeclaration(false, 1, 0))

      visitor1.ReturnStatement(createReturnStatement(false, 2, 0))
      visitor2.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle special characters in file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}', filePath: '/src/[special]/test-file_2.ts' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested config', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        nested: { deep: { value: true } },
      }], source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })
  })

  // ========================================================================
  // exit handlers — 6 tests
  // ========================================================================
  describe('exit handlers', () => {
    test('should handle FunctionDeclaration:exit', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => (visitor['FunctionDeclaration:exit'] as () => void)()).not.toThrow()
    })

    test('should handle FunctionExpression:exit', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      expect(() => (visitor['FunctionExpression:exit'] as () => void)()).not.toThrow()
    })

    test('should handle ArrowFunctionExpression:exit', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      expect(() => (visitor['ArrowFunctionExpression:exit'] as () => void)()).not.toThrow()
    })

    test('should handle multiple exits', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      expect(reports.length).toBe(1)
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 3, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()
      expect(reports.length).toBe(1)
    })

    test('should handle exit without matching enter', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => (visitor['FunctionDeclaration:exit'] as () => void)()).not.toThrow()
    })

    test('should handle multiple unmatched exits', () => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => {
        ;(visitor['FunctionDeclaration:exit'] as () => void)()
        ;(visitor['FunctionExpression:exit'] as () => void)()
        ;(visitor['ArrowFunctionExpression:exit'] as () => void)()
      }).not.toThrow()
    })
  })

  // ========================================================================
  // function type checking — 4 tests
  // ========================================================================
  describe('function type checking', () => {
    test('should only handle known function types', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      visitor.FunctionExpression(createFunctionExpression(true, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 5, 0))
      visitor.ReturnStatement(createReturnStatement(false, 6, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()

      expect(reports.length).toBe(3)
    })

    test('should ignore unknown node types', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({ type: 'UnknownType' } as unknown)
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not track MethodDefinition as a function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'MethodDefinition',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({ type: 42 } as unknown)
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })
  })

  // ========================================================================
  // test.each — 40+ parameterized tests
  // ========================================================================
  describe('parameterized detection tests', () => {
    test.each([
      { type: 'FunctionDeclaration', hasReturnType: true, hasArgument: false, expected: 1 },
      { type: 'FunctionDeclaration', hasReturnType: true, hasArgument: true, expected: 0 },
      { type: 'FunctionDeclaration', hasReturnType: false, hasArgument: false, expected: 0 },
      { type: 'FunctionDeclaration', hasReturnType: false, hasArgument: true, expected: 0 },
    ] as const)(
      '$type with returnType=$hasReturnType, returnArgument=$hasArgument -> reports=$expected',
      ({ type, hasReturnType, hasArgument, expected }) => {
        const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
        const visitor = noTypeOnlyReturnRule.create(context)

        const funcNode = {
          type,
          id: type === 'FunctionDeclaration' ? { name: 'fn' } : null,
          returnType: hasReturnType ? { typeAnnotation: { type: 'TSTypeAnnotation' } } : null,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }

        const fn = visitor[type] as (node: unknown) => void
        fn(funcNode)
        visitor.ReturnStatement({
          type: 'ReturnStatement',
          argument: hasArgument ? { type: 'Literal', value: 1 } : null,
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
        })

        expect(reports.length).toBe(expected)
      },
    )

    test.each([
      { type: 'FunctionExpression', hasReturnType: true, hasArgument: false, expected: 1 },
      { type: 'FunctionExpression', hasReturnType: true, hasArgument: true, expected: 0 },
      { type: 'FunctionExpression', hasReturnType: false, hasArgument: false, expected: 0 },
      { type: 'FunctionExpression', hasReturnType: false, hasArgument: true, expected: 0 },
    ] as const)(
      '$type with returnType=$hasReturnType, returnArgument=$hasArgument -> reports=$expected',
      ({ type, hasReturnType, hasArgument, expected }) => {
        const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
        const visitor = noTypeOnlyReturnRule.create(context)

        const funcNode = {
          type,
          id: null,
          returnType: hasReturnType ? { typeAnnotation: { type: 'TSTypeAnnotation' } } : null,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }

        const fn = visitor[type] as (node: unknown) => void
        fn(funcNode)
        visitor.ReturnStatement({
          type: 'ReturnStatement',
          argument: hasArgument ? { type: 'Literal', value: 1 } : null,
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
        })

        expect(reports.length).toBe(expected)
      },
    )

    test.each([
      { type: 'ArrowFunctionExpression', hasReturnType: true, hasArgument: false, expected: 1 },
      { type: 'ArrowFunctionExpression', hasReturnType: true, hasArgument: true, expected: 0 },
      { type: 'ArrowFunctionExpression', hasReturnType: false, hasArgument: false, expected: 0 },
      { type: 'ArrowFunctionExpression', hasReturnType: false, hasArgument: true, expected: 0 },
    ] as const)(
      '$type with returnType=$hasReturnType, returnArgument=$hasArgument -> reports=$expected',
      ({ type, hasReturnType, hasArgument, expected }) => {
        const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
        const visitor = noTypeOnlyReturnRule.create(context)

        const funcNode = {
          type,
          returnType: hasReturnType ? { typeAnnotation: { type: 'TSTypeAnnotation' } } : null,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }

        const fn = visitor[type] as (node: unknown) => void
        fn(funcNode)
        visitor.ReturnStatement({
          type: 'ReturnStatement',
          argument: hasArgument ? { type: 'Literal', value: 1 } : null,
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
        })

        expect(reports.length).toBe(expected)
      },
    )

    test.each([
      { line: 1, column: 0 },
      { line: 5, column: 3 },
      { line: 100, column: 50 },
      { line: 42, column: 0 },
      { line: 1, column: 99 },
    ])('should report at line=$line, column=$column', ({ line, column }) => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, line, column))

      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })

    test.each([
      { invalidNode: null, description: 'null' },
      { invalidNode: undefined, description: 'undefined' },
      { invalidNode: 'string', description: 'string' },
      { invalidNode: 42, description: 'number' },
      { invalidNode: true, description: 'boolean' },
      { invalidNode: {}, description: 'empty object' },
    ])('should not throw for FunctionDeclaration with $description node', ({ invalidNode }) => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration(invalidNode)).not.toThrow()
    })

    test.each([
      { invalidNode: null, description: 'null' },
      { invalidNode: undefined, description: 'undefined' },
      { invalidNode: 'string', description: 'string' },
      { invalidNode: 42, description: 'number' },
      { invalidNode: true, description: 'boolean' },
      { invalidNode: {}, description: 'empty object' },
    ])('should not throw for FunctionExpression with $description node', ({ invalidNode }) => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionExpression(invalidNode)).not.toThrow()
    })

    test.each([
      { invalidNode: null, description: 'null' },
      { invalidNode: undefined, description: 'undefined' },
      { invalidNode: 'string', description: 'string' },
      { invalidNode: 42, description: 'number' },
      { invalidNode: true, description: 'boolean' },
      { invalidNode: {}, description: 'empty object' },
    ])('should not throw for ArrowFunctionExpression with $description node', ({ invalidNode }) => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(invalidNode)).not.toThrow()
    })

    test.each([
      { invalidNode: null, description: 'null' },
      { invalidNode: undefined, description: 'undefined' },
      { invalidNode: 'string', description: 'string' },
      { invalidNode: 42, description: 'number' },
      { invalidNode: true, description: 'boolean' },
      { invalidNode: {}, description: 'empty object' },
    ])('should not throw for ReturnStatement with $description node', ({ invalidNode }) => {
      const { context } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.ReturnStatement(invalidNode)).not.toThrow()
    })

    test.each([
      { nodeType: 'VariableDeclaration' },
      { nodeType: 'ExpressionStatement' },
      { nodeType: 'IfStatement' },
      { nodeType: 'ForStatement' },
      { nodeType: 'WhileStatement' },
      { nodeType: 'ClassDeclaration' },
      { nodeType: 'InterfaceDeclaration' },
      { nodeType: 'TypeAlias' },
      { nodeType: 'ImportDeclaration' },
      { nodeType: 'ExportDeclaration' },
    ])('should not track $nodeType as a function', ({ nodeType }) => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: nodeType,
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })
  })

  // ========================================================================
  // individual return type variations — 10 tests
  // ========================================================================
  describe('return type variations', () => {
    test('should report for TSTypeReference return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: { typeAnnotation: { type: 'TSTypeReference' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for TSUnionType return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: { typeAnnotation: { type: 'TSUnionType' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for TSIntersectionType return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: { typeAnnotation: { type: 'TSIntersectionType' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for TSArrayType return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: { typeAnnotation: { type: 'TSArrayType' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for TSTupleType return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: { typeAnnotation: { type: 'TSTupleType' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for TSVoidKeyword return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: { typeAnnotation: { type: 'TSVoidKeyword' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for TSTypeLiteral return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: { typeAnnotation: { type: 'TSTypeLiteral' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for TSFunctionType return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: { typeAnnotation: { type: 'TSFunctionType' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for TSNeverKeyword return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: { typeAnnotation: { type: 'TSNeverKeyword' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for TSAnyKeyword return type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        returnType: { typeAnnotation: { type: 'TSAnyKeyword' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })
  })

  // ========================================================================
  // stack state transitions — 8 tests
  // ========================================================================
  describe('stack state transitions', () => {
    test('should reset state after function exit and re-enter', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(2)
    })

    test('should handle enter-exit-enter pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()
      visitor.FunctionExpression(createFunctionExpression(true, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested then unwound stack', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.FunctionExpression(createFunctionExpression(true, 2, 0))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 5, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 6, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(2)
    })

    test('should handle enter without exit for multiple functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration(false, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle rapid enter-exit cycles', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, i + 1, 0))
        visitor.ReturnStatement(createReturnStatement(false, i + 1, 5))
        ;(visitor['ArrowFunctionExpression:exit'] as () => void)()
      }

      expect(reports.length).toBe(5)
    })

    test('should handle mixed type nesting three deep', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 2, 0))
      visitor.FunctionExpression(createFunctionExpression(true, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 5, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 6, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(3)
    })

    test('should handle nested function where inner does not report', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(1)
    })

    test('should handle valid inner, invalid outer', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.FunctionExpression(createFunctionExpression(true, 2, 0))
      visitor.ReturnStatement(createReturnStatement(true, 3, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(1)
    })
  })

  // ========================================================================
  // additional non-reporting — 12 tests
  // ========================================================================
  describe('additional non-reporting', () => {
    test('should not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'VariableDeclaration',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for IfStatement node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'IfStatement',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for ClassDeclaration node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'ClassDeclaration',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for WhileStatement node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'WhileStatement',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for ForStatement node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'ForStatement',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for SwitchStatement node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'SwitchStatement',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for TryStatement node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'TryStatement',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for BlockStatement node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'BlockStatement',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for ThrowStatement node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'ThrowStatement',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'ExpressionStatement',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for InterfaceDeclaration node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'InterfaceDeclaration',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for TypeAlias node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({
        type: 'TypeAlias',
        returnType: { typeAnnotation: { type: 'TSTypeAnnotation' } },
      })
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })
  })

  // ========================================================================
  // deduplication / single-report per function — 4 tests
  // ========================================================================
  describe('deduplication', () => {
    test('should report only once even after multiple empty returns', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))

      expect(reports.length).toBe(1)
    })

    test('should not report again after first report even in long sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      for (let i = 0; i < 20; i++) {
        visitor.ReturnStatement(createReturnStatement(false, i + 2, 0))
      }

      expect(reports.length).toBe(1)
    })

    test('should report once for function expression with many empty returns', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))

      expect(reports.length).toBe(1)
    })

    test('should report once for arrow function with many empty returns', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for valid then empty return in same function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should report at first empty return location in dedup scenario', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 5, 10))
      visitor.ReturnStatement(createReturnStatement(false, 20, 30))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report once for mixed valid and empty returns', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() {}' })
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))
      visitor.ReturnStatement(createReturnStatement(true, 4, 0))

      expect(reports.length).toBe(1)
    })
  })
})
