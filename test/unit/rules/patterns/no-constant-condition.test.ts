import { describe, test, expect, vi } from 'vitest'
import { noConstantConditionRule } from '../../../../src/rules/patterns/no-constant-condition.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

// Helper functions to create AST nodes
function createIfStatement(test: unknown, line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test,
    consequent: { type: 'BlockStatement', body: [] },
    alternate: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createWhileStatement(test: unknown, line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createForStatement(test: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test,
    update: null,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createDoWhileStatement(test: unknown, line = 1, column = 0): unknown {
  return {
    type: 'DoWhileStatement',
    test,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createBooleanLiteral(value: boolean): unknown {
  return {
    type: 'BooleanLiteral',
    value,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createNumericLiteral(value: number): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createBinaryExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
  }
}

function createCallExpression(callee: unknown): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
  }
}

describe('no-constant-condition rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noConstantConditionRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noConstantConditionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noConstantConditionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noConstantConditionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noConstantConditionRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noConstantConditionRule.meta.fixable).toBe('code')
    })

    test('should mention constant condition in description', () => {
      expect(noConstantConditionRule.meta.docs?.description.toLowerCase()).toContain('constant')
    })

    test('should have a non-empty description', () => {
      expect(noConstantConditionRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention condition in description', () => {
      expect(noConstantConditionRule.meta.docs?.description.toLowerCase()).toContain('condition')
    })

    test('should mention control flow in description', () => {
      expect(noConstantConditionRule.meta.docs?.description.toLowerCase()).toContain('control')
    })

    test('should have docs url defined', () => {
      expect(noConstantConditionRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as string', () => {
      expect(typeof noConstantConditionRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url containing rule name', () => {
      expect(noConstantConditionRule.meta.docs?.url).toContain('no-constant-condition')
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noConstantConditionRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(noConstantConditionRule.meta.schema).toEqual([])
    })

    test('should export rule as default', () => {
      expect(noConstantConditionRule).toBeDefined()
    })

    test('should have meta property', () => {
      expect(noConstantConditionRule.meta).toBeDefined()
    })

    test('should have create method', () => {
      expect(typeof noConstantConditionRule.create).toBe('function')
    })

    test('should have problem type as exact string', () => {
      expect(noConstantConditionRule.meta.type).toBe('problem')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
      expect(visitor).toHaveProperty('WhileStatement')
      expect(visitor).toHaveProperty('ForStatement')
      expect(visitor).toHaveProperty('DoWhileStatement')
    })

    test('should return IfStatement as a function', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(typeof visitor.IfStatement).toBe('function')
    })

    test('should return WhileStatement as a function', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(typeof visitor.WhileStatement).toBe('function')
    })

    test('should return ForStatement as a function', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(typeof visitor.ForStatement).toBe('function')
    })

    test('should return DoWhileStatement as a function', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(typeof visitor.DoWhileStatement).toBe('function')
    })

    test('should return exactly 5 visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(5)
    })

    test('should return new visitor on each create call', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor1 = noConstantConditionRule.create(context)
      const visitor2 = noConstantConditionRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should not have extraneous properties on visitor', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toContain('IfStatement')
      expect(keys).toContain('WhileStatement')
      expect(keys).toContain('ForStatement')
      expect(keys).toContain('DoWhileStatement')
    })
  })

  describe('if statement - valid cases', () => {
    test('should not report variable condition', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createIdentifier('x'))

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function call condition', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createCallExpression(createIdentifier('isReady')))

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression condition', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(
        createBinaryExpression('>', createIdentifier('x'), createLiteral(5)),
      )

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report comparison with variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(
        createBinaryExpression('===', createIdentifier('a'), createIdentifier('b')),
      )

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('if statement - invalid cases', () => {
    test('should report if (true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report if (false)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(false))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report if (1) - truthy number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(1))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report if (0) - falsy number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(0))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('should report if (-1) - truthy negative number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(-1))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report if ("non-empty") - truthy string', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral('non-empty'))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report if ("") - falsy empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(''))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('should report if (null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(null))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
      expect(reports[0].message).toContain('null')
    })
  })

  describe('while statement', () => {
    test('should not report while (condition) with variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createIdentifier('running'))

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report while (true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createBooleanLiteral(true))

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report while (false)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createBooleanLiteral(false))

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report while (1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createNumericLiteral(1))

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report while (0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createNumericLiteral(0))

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })
  })

  describe('for statement', () => {
    test('should not report for with variable condition', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(
        createBinaryExpression('<', createIdentifier('i'), createLiteral(10)),
      )

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report for with true condition', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(createBooleanLiteral(true))

      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report for with false condition', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(createBooleanLiteral(false))

      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report for with numeric condition', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(createNumericLiteral(1))

      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })
  })

  describe('do-while statement', () => {
    test('should not report do-while with variable condition', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(createIdentifier('shouldContinue'))

      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report do-while (true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(createBooleanLiteral(true))

      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report do-while (false)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(createBooleanLiteral(false))

      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report do-while with numeric literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(createNumericLiteral(42))

      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })
  })

  describe('Literal type (not BooleanLiteral)', () => {
    test('should report Literal with boolean true value', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(true))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report Literal with boolean false value', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(false))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report Literal with number value', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(100))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report Literal with zero value', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral(0))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('should report Literal with string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createLiteral('hello'))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
      expect(reports[0].message).toContain('string')
    })
  })

  describe('RegExpLiteral detection', () => {
    test('should report RegExpLiteral in if statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'RegExpLiteral',
        pattern: 'test',
        flags: 'g',
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
      expect(reports[0].message).toContain('regexp')
    })

    test('should report RegExpLiteral in while statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement({
        type: 'RegExpLiteral',
        pattern: 'abc',
        flags: '',
      })

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('regexp')
    })

    test('should report RegExpLiteral in for statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement({
        type: 'RegExpLiteral',
        pattern: '\\d+',
        flags: 'gi',
      })

      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report RegExpLiteral in do-while statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement({
        type: 'RegExpLiteral',
        pattern: '[a-z]',
        flags: '',
      })

      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detection - various truthy constants across statements', () => {
    test('should report Literal true in while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.WhileStatement(createWhileStatement(createLiteral(true)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report BooleanLiteral true in for', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.ForStatement(createForStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report NumericLiteral truthy in do-while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.DoWhileStatement(createDoWhileStatement(createNumericLiteral(99)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report Literal truthy string in for', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.ForStatement(createForStatement(createLiteral('truthy')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report Literal falsy empty string in while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.WhileStatement(createWhileStatement(createLiteral('')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('should report NumericLiteral zero in while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.WhileStatement(createWhileStatement(createNumericLiteral(0)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('should report Literal null in for', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.ForStatement(createForStatement(createLiteral(null)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
      expect(reports[0].message).toContain('null')
    })

    test('should report Literal null in while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.WhileStatement(createWhileStatement(createLiteral(null)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('should report Literal null in do-while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.DoWhileStatement(createDoWhileStatement(createLiteral(null)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('should report large positive number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(1e9)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report negative number as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(-100)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report small positive float as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(0.001)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report BooleanLiteral false in for', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.ForStatement(createForStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report BooleanLiteral false in do-while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.DoWhileStatement(createDoWhileStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report BooleanLiteral true in do-while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.DoWhileStatement(createDoWhileStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report Literal true in do-while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.DoWhileStatement(createDoWhileStatement(createLiteral(true)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('should report Literal false in while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.WhileStatement(createWhileStatement(createLiteral(false)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('should report truthy Literal number in do-while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.DoWhileStatement(createDoWhileStatement(createLiteral(7)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report falsy Literal zero in for', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.ForStatement(createForStatement(createLiteral(0)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
    })

    test('should handle node without test property', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        consequent: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true))
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with incomplete loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createBooleanLiteral(true),
        loc: {},
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle test node that is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        test: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle test node that is a primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        test: 'primitive string',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle test node that is a number primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        test: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle test node that is boolean primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        test: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.IfStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.IfStatement({ type: 'IfStatement' })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested constant in node', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'SomeUnknownType', value: true },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle WhileStatement with null node', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.WhileStatement(null)).not.toThrow()
    })

    test('should handle ForStatement with null node', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.ForStatement(null)).not.toThrow()
    })

    test('should handle DoWhileStatement with null node', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.DoWhileStatement(null)).not.toThrow()
    })

    test('should handle WhileStatement with undefined node', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.WhileStatement(undefined)).not.toThrow()
    })

    test('should handle ForStatement with undefined node', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.ForStatement(undefined)).not.toThrow()
    })

    test('should handle DoWhileStatement with undefined node', () => {
      const { context } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.DoWhileStatement(undefined)).not.toThrow()
    })

    test('should handle node with null test', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: null,
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.WhileStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined test', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'ForStatement',
        test: undefined,
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with array test', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        test: [createLiteral(true)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Literal with undefined value', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({ type: 'Literal', value: undefined })

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Literal with object value', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({ type: 'Literal', value: { key: 'val' } })

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for if statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true), 5, 10)

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for while statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createBooleanLiteral(true), 10, 5)

      visitor.WhileStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for for statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(createBooleanLiteral(true), 15, 8)

      visitor.ForStatement(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location for do-while statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(createBooleanLiteral(true), 20, 12)

      visitor.DoWhileStatement(node)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location for if statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true), 3, 5)

      visitor.IfStatement(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report correct location for high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true), 999, 50)

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location for NumericLiteral in while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createNumericLiteral(1), 7, 3)

      visitor.WhileStatement(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location for Literal in for', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(createLiteral('x'), 12, 0)

      visitor.ForStatement(node)

      expect(reports[0].loc?.start.line).toBe(12)
    })

    test('should report location for RegExpLiteral in do-while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(
        { type: 'RegExpLiteral', pattern: 'test', flags: '' },
        4,
        20,
      )

      visitor.DoWhileStatement(node)

      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location with column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(false), 1, 0)

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at column beyond 100', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createBooleanLiteral(true), 5, 120)

      visitor.WhileStatement(node)

      expect(reports[0].loc?.start.column).toBe(120)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(createBooleanLiteral(true), 2, 4)

      visitor.ForStatement(node)

      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('should report location same for all statement types with same input', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const line = 42
      const col = 7

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true), line, col))
      visitor.WhileStatement(createWhileStatement(createBooleanLiteral(true), line, col))
      visitor.ForStatement(createForStatement(createBooleanLiteral(true), line, col))
      visitor.DoWhileStatement(createDoWhileStatement(createBooleanLiteral(true), line, col))

      expect(reports).toHaveLength(4)
      for (const report of reports) {
        expect(report.loc?.start.line).toBe(line)
        expect(report.loc?.start.column).toBe(col)
      }
    })
  })

  describe('message quality', () => {
    test('should mention "constant condition" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0].message.toLowerCase()).toContain('constant condition')
    })

    test('should mention "always" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0].message.toLowerCase()).toContain('always')
    })

    test('should include value in message for truthy number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(42)))

      expect(reports[0].message).toContain('42')
    })

    test('should include value in message for falsy number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(0)))

      expect(reports[0].message).toContain('0')
    })

    test('should mention "Unexpected" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should include "always true" for BooleanLiteral true', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0].message).toContain('always true')
    })

    test('should include "always false" for BooleanLiteral false', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(false)))

      expect(reports[0].message).toContain('always false')
    })

    test('should include "null" in null literal message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(null)))

      expect(reports[0].message).toContain('null')
    })

    test('should include "string" in truthy string message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral('test')))

      expect(reports[0].message).toContain('string')
    })

    test('should include "regexp" in regex message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement({ type: 'RegExpLiteral', pattern: 'a', flags: '' }))

      expect(reports[0].message).toContain('regexp')
    })
  })

  describe('various numeric literals', () => {
    test('should report floating point number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(3.14))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report negative floating point number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(-0.5))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report very large number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement(createNumericLiteral(999999999))

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })
  })

  describe('config handling', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

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
        getSource: () => 'if (true) {}',
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

      const visitor = noConstantConditionRule.create(context)

      expect(() => visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple reports', () => {
    test('should report multiple violations from same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))
      visitor.IfStatement(createIfStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(2)
    })

    test('should report violations from different statement types', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))
      visitor.WhileStatement(createWhileStatement(createBooleanLiteral(true)))
      visitor.ForStatement(createForStatement(createBooleanLiteral(true)))
      visitor.DoWhileStatement(createDoWhileStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(4)
    })

    test('should track each report independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))
      visitor.WhileStatement(createWhileStatement(createBooleanLiteral(false)))

      expect(reports[0].message).toContain('always true')
      expect(reports[1].message).toContain('always false')
    })

    test('should handle alternating valid and invalid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createIdentifier('x')))
      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))
      visitor.IfStatement(createIfStatement(createIdentifier('y')))
      visitor.IfStatement(createIfStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(2)
    })

    test('should report multiple numeric violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(1)))
      visitor.IfStatement(createIfStatement(createNumericLiteral(0)))
      visitor.IfStatement(createIfStatement(createNumericLiteral(42)))

      expect(reports.length).toBe(3)
    })

    test('should handle same visitor called many times', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))
      }

      expect(reports.length).toBe(10)
    })

    test('should report for mixed statement types in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(1)))
      visitor.WhileStatement(createWhileStatement(createIdentifier('x')))
      visitor.ForStatement(createForStatement(createLiteral('truthy')))
      visitor.DoWhileStatement(createDoWhileStatement(createIdentifier('y')))

      expect(reports.length).toBe(2)
    })

    test('should report each violation with correct message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))
      visitor.WhileStatement(createWhileStatement(createNumericLiteral(0)))

      expect(reports[0].message).toContain('always true')
      expect(reports[1].message).toContain('always falsy')
    })

    test('should handle no violations in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createIdentifier('a')))
      visitor.WhileStatement(createWhileStatement(createIdentifier('b')))
      visitor.ForStatement(createForStatement(createIdentifier('c')))
      visitor.DoWhileStatement(createDoWhileStatement(createIdentifier('d')))

      expect(reports.length).toBe(0)
    })

    test('should report across all four statement types with constants', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(null)))
      visitor.WhileStatement(createWhileStatement(createLiteral(null)))
      visitor.ForStatement(createForStatement(createLiteral(null)))
      visitor.DoWhileStatement(createDoWhileStatement(createLiteral(null)))

      expect(reports.length).toBe(4)
      for (const report of reports) {
        expect(report.message).toContain('null')
      }
    })
  })

  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({
        source: 'if (true) {}',
        options: [{}],
        filePath: '/project/src/utils.ts',
      })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({
        source: 'while (true) { break; }',
        options: [{}],
      })
      const visitor = noConstantConditionRule.create(context)

      visitor.WhileStatement(createWhileStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockRuleContext({
        source: 'if (true) {}',
        options: [{ checkLoops: true, ignoreRegExp: false }],
      })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should work with nested options', () => {
      const { context, reports } = createMockRuleContext({
        source: 'if (true) {}',
        options: [{ config: { level: 'error', overrides: {} } }],
      })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should work with long file path', () => {
      const longPath = '/very/long/path/to/some/deeply/nested/directory/structure/file.ts'
      const { context, reports } = createMockRuleContext({
        source: 'if (true) {}',
        options: [{}],
        filePath: longPath,
      })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({
        source: '',
        options: [{}],
        filePath: '/src/empty.ts',
      })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should work with windows-style file path', () => {
      const { context, reports } = createMockRuleContext({
        source: 'if (true) {}',
        options: [{}],
        filePath: 'C:\\Users\\dev\\project\\src\\file.ts',
      })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should work with special characters in file path', () => {
      const { context, reports } = createMockRuleContext({
        source: 'if (true) {}',
        options: [{}],
        filePath: '/src/[test]/file.ts',
      })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should handle multiple creates from same context', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor1 = noConstantConditionRule.create(context)
      const visitor2 = noConstantConditionRule.create(context)

      visitor1.IfStatement(createIfStatement(createBooleanLiteral(true)))
      visitor2.IfStatement(createIfStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(2)
    })

    test('should not share state between visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({
        source: 'if (true) {}',
        options: [{}],
      })
      const { context: ctx2, reports: r2 } = createMockRuleContext({
        source: 'if (true) {}',
        options: [{}],
      })

      const visitor1 = noConstantConditionRule.create(ctx1)
      const visitor2 = noConstantConditionRule.create(ctx2)

      visitor1.IfStatement(createIfStatement(createBooleanLiteral(true)))
      visitor2.IfStatement(createIfStatement(createIdentifier('x')))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('test.each - BooleanLiteral truthy/falsy across statement types', () => {
    test.each([
      { stmtType: 'IfStatement', value: true, expected: 'always true' },
      { stmtType: 'IfStatement', value: false, expected: 'always false' },
      { stmtType: 'WhileStatement', value: true, expected: 'always true' },
      { stmtType: 'WhileStatement', value: false, expected: 'always false' },
      { stmtType: 'ForStatement', value: true, expected: 'always true' },
      { stmtType: 'ForStatement', value: false, expected: 'always false' },
      { stmtType: 'DoWhileStatement', value: true, expected: 'always true' },
      { stmtType: 'DoWhileStatement', value: false, expected: 'always false' },
    ] satisfies Array<{ stmtType: string; value: boolean; expected: string }>)(
      'should report $expected for BooleanLiteral($value) in $stmtType',
      ({ stmtType, value, expected }) => {
        const { context, reports } = createMockRuleContext({
          source: 'if (true) {}',
          options: [{}],
        })
        const visitor = noConstantConditionRule.create(context)

        const testNode = createBooleanLiteral(value)
        const node =
          stmtType === 'IfStatement'
            ? createIfStatement(testNode)
            : stmtType === 'WhileStatement'
              ? createWhileStatement(testNode)
              : stmtType === 'ForStatement'
                ? createForStatement(testNode)
                : createDoWhileStatement(testNode)

        const fn = visitor[stmtType as keyof typeof visitor] as (node: unknown) => void
        fn(node)

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(expected)
      },
    )
  })

  describe('test.each - NumericLiteral truthy/falsy values', () => {
    test.each([
      { value: 1, truthy: true },
      { value: -1, truthy: true },
      { value: 42, truthy: true },
      { value: 100, truthy: true },
      { value: 3.14, truthy: true },
      { value: -0.5, truthy: true },
      { value: 0.001, truthy: true },
      { value: 999999, truthy: true },
      { value: 0, truthy: false },
    ] satisfies Array<{ value: number; truthy: boolean }>)(
      'should detect NumericLiteral($value) as $truthy',
      ({ value, truthy }) => {
        const { context, reports } = createMockRuleContext({
          source: 'if (true) {}',
          options: [{}],
        })
        const visitor = noConstantConditionRule.create(context)

        visitor.IfStatement(createIfStatement(createNumericLiteral(value)))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(truthy ? 'always truthy' : 'always falsy')
      },
    )
  })

  describe('test.each - Literal number truthy/falsy values', () => {
    test.each([
      { value: 1, truthy: true },
      { value: -1, truthy: true },
      { value: 100, truthy: true },
      { value: 0, truthy: false },
      { value: -100, truthy: true },
      { value: 0.5, truthy: true },
    ] satisfies Array<{ value: number; truthy: boolean }>)(
      'should detect Literal($value) as $truthy',
      ({ value, truthy }) => {
        const { context, reports } = createMockRuleContext({
          source: 'if (true) {}',
          options: [{}],
        })
        const visitor = noConstantConditionRule.create(context)

        visitor.IfStatement(createIfStatement(createLiteral(value)))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(truthy ? 'always truthy' : 'always falsy')
      },
    )
  })

  describe('test.each - Literal string truthy/falsy values', () => {
    test.each([
      { value: 'hello', truthy: true },
      { value: 'a', truthy: true },
      { value: ' ', truthy: true },
      { value: 'false', truthy: true },
      { value: '0', truthy: true },
      { value: '', truthy: false },
      { value: 'long string with spaces', truthy: true },
      { value: '\n', truthy: true },
    ] satisfies Array<{ value: string; truthy: boolean }>)(
      'should detect Literal(string "$value") as $truthy',
      ({ value, truthy }) => {
        const { context, reports } = createMockRuleContext({
          source: 'if (true) {}',
          options: [{}],
        })
        const visitor = noConstantConditionRule.create(context)

        visitor.IfStatement(createIfStatement(createLiteral(value)))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(truthy ? 'always truthy' : 'always falsy')
      },
    )
  })

  describe('test.each - non-constant expressions should not report', () => {
    test.each([
      { name: 'Identifier', node: createIdentifier('x') },
      { name: 'CallExpression', node: createCallExpression(createIdentifier('fn')) },
      {
        name: 'BinaryExpression',
        node: createBinaryExpression('>', createIdentifier('a'), createLiteral(5)),
      },
      {
        name: 'MemberExpression',
        node: {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('p'),
        },
      },
      {
        name: 'UnaryExpression',
        node: { type: 'UnaryExpression', operator: '!', argument: createIdentifier('x') },
      },
      {
        name: 'LogicalExpression',
        node: {
          type: 'LogicalExpression',
          operator: '&&',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
        },
      },
    ] satisfies Array<{ name: string; node: unknown }>)(
      'should not report for $name',
      ({ node }) => {
        const { context, reports } = createMockRuleContext({
          source: 'if (true) {}',
          options: [{}],
        })
        const visitor = noConstantConditionRule.create(context)

        visitor.IfStatement(createIfStatement(node))

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('test.each - valid conditions across all statement types', () => {
    test.each([
      { stmtType: 'IfStatement', name: 'variable' },
      { stmtType: 'WhileStatement', name: 'variable' },
      { stmtType: 'ForStatement', name: 'variable' },
      { stmtType: 'DoWhileStatement', name: 'variable' },
    ] satisfies Array<{ stmtType: string; name: string }>)(
      'should not report variable condition in $stmtType',
      ({ stmtType }) => {
        const { context, reports } = createMockRuleContext({
          source: 'if (true) {}',
          options: [{}],
        })
        const visitor = noConstantConditionRule.create(context)

        const testNode = createIdentifier('condition')
        const node =
          stmtType === 'IfStatement'
            ? createIfStatement(testNode)
            : stmtType === 'WhileStatement'
              ? createWhileStatement(testNode)
              : stmtType === 'ForStatement'
                ? createForStatement(testNode)
                : createDoWhileStatement(testNode)

        const fn = visitor[stmtType as keyof typeof visitor] as (node: unknown) => void
        fn(node)

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('test.each - constant condition detection in all statement types', () => {
    test.each([
      {
        stmtType: 'IfStatement',
        testType: 'BooleanLiteral true',
        testNode: createBooleanLiteral(true),
        expected: 'always true',
      },
      {
        stmtType: 'WhileStatement',
        testType: 'BooleanLiteral true',
        testNode: createBooleanLiteral(true),
        expected: 'always true',
      },
      {
        stmtType: 'ForStatement',
        testType: 'BooleanLiteral true',
        testNode: createBooleanLiteral(true),
        expected: 'always true',
      },
      {
        stmtType: 'DoWhileStatement',
        testType: 'BooleanLiteral true',
        testNode: createBooleanLiteral(true),
        expected: 'always true',
      },
      {
        stmtType: 'IfStatement',
        testType: 'NumericLiteral 1',
        testNode: createNumericLiteral(1),
        expected: 'always truthy',
      },
      {
        stmtType: 'WhileStatement',
        testType: 'NumericLiteral 1',
        testNode: createNumericLiteral(1),
        expected: 'always truthy',
      },
      {
        stmtType: 'ForStatement',
        testType: 'NumericLiteral 0',
        testNode: createNumericLiteral(0),
        expected: 'always falsy',
      },
      {
        stmtType: 'DoWhileStatement',
        testType: 'NumericLiteral 0',
        testNode: createNumericLiteral(0),
        expected: 'always falsy',
      },
      {
        stmtType: 'IfStatement',
        testType: 'Literal string',
        testNode: createLiteral('x'),
        expected: 'always truthy',
      },
      {
        stmtType: 'WhileStatement',
        testType: 'Literal empty string',
        testNode: createLiteral(''),
        expected: 'always falsy',
      },
      {
        stmtType: 'IfStatement',
        testType: 'Literal null',
        testNode: createLiteral(null),
        expected: 'always falsy',
      },
      {
        stmtType: 'ForStatement',
        testType: 'RegExpLiteral',
        testNode: { type: 'RegExpLiteral', pattern: 'a', flags: '' },
        expected: 'always truthy',
      },
    ] satisfies Array<{ stmtType: string; testType: string; testNode: unknown; expected: string }>)(
      'should report $expected for $testType in $stmtType',
      ({ stmtType, testNode, expected }) => {
        const { context, reports } = createMockRuleContext({
          source: 'if (true) {}',
          options: [{}],
        })
        const visitor = noConstantConditionRule.create(context)

        const node =
          stmtType === 'IfStatement'
            ? createIfStatement(testNode)
            : stmtType === 'WhileStatement'
              ? createWhileStatement(testNode)
              : stmtType === 'ForStatement'
                ? createForStatement(testNode)
                : createDoWhileStatement(testNode)

        const fn = visitor[stmtType as keyof typeof visitor] as (node: unknown) => void
        fn(node)

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(expected)
      },
    )
  })

  describe('complex expressions (should not trigger)', () => {
    test('should not report logical expression with variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: { type: 'Identifier', name: 'prop' },
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report unary expression with variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'UnaryExpression',
        operator: '!',
        argument: createIdentifier('x'),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'ConditionalExpression',
        test: createIdentifier('a'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT reporting - non-constant expressions', () => {
    test('should not report assignment expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createLiteral(5),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'NewExpression',
        callee: createIdentifier('MyClass'),
        arguments: [],
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report sequence expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'SequenceExpression',
        expressions: [createIdentifier('a'), createIdentifier('b')],
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report array expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'ArrayExpression',
        elements: [createLiteral(1), createLiteral(2)],
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report object expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'ObjectExpression',
        properties: [],
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'ArrowFunctionExpression',
        params: [],
        body: createLiteral(true),
        expression: true,
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report tagged template expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'TaggedTemplateExpression',
        tag: createIdentifier('tag'),
        quasi: { type: 'TemplateLiteral', expressions: [], quasis: [] },
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical OR with variables in while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement({
        type: 'LogicalExpression',
        operator: '||',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      })

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary comparison in for', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('y')),
      )

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report member expression in do-while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement({
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('flag'),
      })

      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report call expression with arguments in while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createWhileStatement(createCallExpression(createIdentifier('check')))

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report update expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'UpdateExpression',
        operator: '++',
        argument: createIdentifier('i'),
        prefix: false,
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report typeof unary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: createIdentifier('x'),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void unary expression with variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('x'),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'TemplateLiteral',
        expressions: [createIdentifier('x')],
        quasis: [{ type: 'TemplateElement', value: { raw: '', cooked: '' } }],
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report logical nullish coalescing with variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'LogicalExpression',
        operator: '??',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report call expression in for', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createForStatement(createCallExpression(createIdentifier('hasNext')))

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report binary expression in do-while', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createDoWhileStatement(
        createBinaryExpression('>=', createIdentifier('count'), createLiteral(0)),
      )

      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report chained member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('nested'),
        },
        property: createIdentifier('flag'),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report unary not with call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      const node = createIfStatement({
        type: 'UnaryExpression',
        operator: '!',
        argument: createCallExpression(createIdentifier('isEmpty')),
      })

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report identifier in any statement type', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createIdentifier('a')))
      visitor.WhileStatement(createWhileStatement(createIdentifier('b')))
      visitor.ForStatement(createForStatement(createIdentifier('c')))
      visitor.DoWhileStatement(createDoWhileStatement(createIdentifier('d')))

      expect(reports.length).toBe(0)
    })
  })

  describe('helper function consistency', () => {
    test('createBooleanLiteral creates correct type', () => {
      const node = createBooleanLiteral(true)
      expect(node).toEqual({ type: 'BooleanLiteral', value: true })
    })

    test('createLiteral creates correct type', () => {
      const node = createLiteral(42)
      expect(node).toEqual({ type: 'Literal', value: 42 })
    })

    test('createNumericLiteral creates correct type', () => {
      const node = createNumericLiteral(3.14)
      expect(node).toEqual({ type: 'Literal', value: 3.14 })
    })

    test('createIdentifier creates correct type', () => {
      const node = createIdentifier('x')
      expect(node).toEqual({ type: 'Identifier', name: 'x' })
    })

    test('createBinaryExpression creates correct structure', () => {
      const node = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))
      expect((node as Record<string, unknown>).type).toBe('BinaryExpression')
      expect((node as Record<string, unknown>).operator).toBe('+')
    })

    test('createCallExpression creates correct structure', () => {
      const node = createCallExpression(createIdentifier('fn'))
      expect((node as Record<string, unknown>).type).toBe('CallExpression')
    })
  })

  describe('Literal with various number values', () => {
    test('should report Literal with value 0 as falsy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(0)))

      expect(reports[0].message).toContain('always falsy')
    })

    test('should report Literal with value -0 as falsy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(-0)))

      expect(reports[0].message).toContain('always falsy')
    })

    test('should report Literal with value NaN as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(NaN)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report Literal with value Infinity as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(Infinity)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report Literal with value -Infinity as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(-Infinity)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report Literal with very small positive number as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(Number.MIN_VALUE)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report Literal with Number.MAX_VALUE as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(Number.MAX_VALUE)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report Literal with value 2 as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(2)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report NumericLiteral with NaN as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(NaN)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })

    test('should report NumericLiteral with Infinity as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(Infinity)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always truthy')
    })
  })

  describe('report descriptor completeness', () => {
    test('report should always have message property', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0]).toHaveProperty('message')
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report should always have loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toBeDefined()
    })

    test('report loc should have start property', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0].loc?.start).toBeDefined()
    })

    test('report loc should have end property', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start should have line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report for falsy BooleanLiteral should have correct message structure', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(false)))

      expect(reports[0].message).toMatch(/Unexpected constant condition/)
      expect(reports[0].message).toMatch(/always/)
    })

    test('report for NumericLiteral should include numeric value', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createNumericLiteral(7)))

      expect(reports[0].message).toContain('7')
    })
  })

  describe('string variations for messages', () => {
    test('should describe empty string as falsy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral('')))

      expect(reports[0].message).toContain('always falsy')
    })

    test('should describe whitespace string as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral('   ')))

      expect(reports[0].message).toContain('always truthy')
    })

    test('should describe single char string as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral('a')))

      expect(reports[0].message).toContain('always truthy')
    })

    test('should describe unicode string as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral('🎉')))

      expect(reports[0].message).toContain('always truthy')
    })

    test('should describe tab string as truthy', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (true) {}', options: [{}] })
      const visitor = noConstantConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral('\t')))

      expect(reports[0].message).toContain('always truthy')
    })
  })
})
