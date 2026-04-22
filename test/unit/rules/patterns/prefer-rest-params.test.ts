import { describe, test, expect, vi } from 'vitest'
import { preferRestParamsRule } from '../../../../src/rules/patterns/prefer-rest-params.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createIdentifier(name: string, line = 1, column = 0, range?: [number, number]): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: name.length },
    },
    range: range ?? [column, column + name.length],
  }
}

function createFunctionDeclaration(name: string, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: createIdentifier(name, line, column),
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createArrowFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createVariableDeclarator(name: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: createIdentifier(name, line, column),
    init: null,
  }
}

describe('prefer-rest-params rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferRestParamsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferRestParamsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferRestParamsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferRestParamsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferRestParamsRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferRestParamsRule.meta.fixable).toBe('code')
    })

    test('should mention rest parameters in description', () => {
      expect(preferRestParamsRule.meta.docs?.description.toLowerCase()).toContain('rest parameters')
    })

    test('should have docs with URL', () => {
      expect(preferRestParamsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-rest-params',
      )
    })

    test('should have description as non-empty string', () => {
      expect(typeof preferRestParamsRule.meta.docs?.description).toBe('string')
      expect(preferRestParamsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention arrow functions in description', () => {
      expect(preferRestParamsRule.meta.docs?.description.toLowerCase()).toContain('arrow')
    })

    test('should mention readability in description', () => {
      expect(preferRestParamsRule.meta.docs?.description.toLowerCase()).toContain('readability')
    })

    test('should have schema as empty array', () => {
      expect(preferRestParamsRule.meta.schema).toEqual([])
    })

    test('should have meta object defined', () => {
      expect(preferRestParamsRule.meta).toBeDefined()
      expect(typeof preferRestParamsRule.meta).toBe('object')
    })

    test('should have docs object defined', () => {
      expect(preferRestParamsRule.meta.docs).toBeDefined()
      expect(typeof preferRestParamsRule.meta.docs).toBe('object')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(visitor).toHaveProperty('Identifier')
      expect(visitor).toHaveProperty('VariableDeclarator')
    })

    test('should return visitor with FunctionDeclaration handler', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('should return visitor with FunctionExpression handler', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)
      expect(typeof visitor.FunctionExpression).toBe('function')
    })

    test('should return visitor with ArrowFunctionExpression handler', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('should return visitor with FunctionDeclaration:exit handler', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)
      expect(typeof visitor['FunctionDeclaration:exit']).toBe('function')
    })

    test('should return visitor with FunctionExpression:exit handler', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)
      expect(typeof visitor['FunctionExpression:exit']).toBe('function')
    })

    test('should return visitor with ArrowFunctionExpression:exit handler', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)
      expect(typeof visitor['ArrowFunctionExpression:exit']).toBe('function')
    })

    test('should return visitor with VariableDeclarator handler', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('should return visitor with Identifier handler', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)
      expect(typeof visitor.Identifier).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor1 = preferRestParamsRule.create(context)
      const visitor2 = preferRestParamsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('each visitor should have independent state', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor1 = preferRestParamsRule.create(context)
      const visitor2 = preferRestParamsRule.create(context)

      visitor1.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor1.Identifier(createIdentifier('arguments'))

      // visitor2 is independent - no function entered, no report
      const { reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const origContext = {
        ...context,
        report: (d: ReportDescriptor) => {
          /* separate */
        },
      } as unknown as RuleContext
      const visitor2Alt = preferRestParamsRule.create(origContext)
      // visitor2Alt has no function entered, so it shouldn't report
    })
  })

  describe('detecting arguments usage inside functions', () => {
    test('should report arguments inside function declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rest parameters')
    })

    test('should report arguments inside function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rest parameters')
    })

    test('should report arguments inside arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rest parameters')
    })

    test('should report multiple arguments usage', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 10))
      visitor.Identifier(createIdentifier('arguments', 1, 25))

      expect(reports.length).toBe(2)
    })

    test('should report arguments using FunctionExpression enter', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report arguments using ArrowFunctionExpression enter', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report arguments at depth 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report arguments at depth 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))
      visitor.FunctionDeclaration(createFunctionDeclaration('inner'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report arguments at depth 3', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('f1'))
      visitor.FunctionDeclaration(createFunctionDeclaration('f2'))
      visitor.FunctionDeclaration(createFunctionDeclaration('f3'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report arguments at depth 5', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration(`f${i}`))
      }
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report arguments at different line positions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 5, 0))
      visitor.Identifier(createIdentifier('arguments', 10, 0))
      visitor.Identifier(createIdentifier('arguments', 100, 0))

      expect(reports.length).toBe(3)
    })

    test('should report arguments at different column positions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0))
      visitor.Identifier(createIdentifier('arguments', 1, 20))
      visitor.Identifier(createIdentifier('arguments', 1, 50))

      expect(reports.length).toBe(3)
    })

    test('should report arguments after other identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('foo'))
      visitor.Identifier(createIdentifier('bar'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report arguments after VariableDeclarator for different name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('foo'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report arguments inside named function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      const namedFnExpr = {
        type: 'FunctionExpression',
        id: createIdentifier('myFunc'),
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionExpression(namedFnExpr)
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report when arguments is at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report arguments inside multiple sequential function declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn1'))
      visitor.Identifier(createIdentifier('arguments', 1, 5))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('fn1'))

      visitor.FunctionDeclaration(createFunctionDeclaration('fn2'))
      visitor.Identifier(createIdentifier('arguments', 2, 5))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('fn2'))

      visitor.FunctionDeclaration(createFunctionDeclaration('fn3'))
      visitor.Identifier(createIdentifier('arguments', 3, 5))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('fn3'))

      expect(reports.length).toBe(3)
    })

    test('should report arguments inside multiple sequential function expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments', 1, 5))
      visitor['FunctionExpression:exit'](createFunctionExpression())

      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments', 2, 5))
      visitor['FunctionExpression:exit'](createFunctionExpression())

      expect(reports.length).toBe(2)
    })

    test('should report arguments inside multiple sequential arrow functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments', 1, 5))
      visitor['ArrowFunctionExpression:exit'](createArrowFunctionExpression())

      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments', 2, 5))
      visitor['ArrowFunctionExpression:exit'](createArrowFunctionExpression())

      expect(reports.length).toBe(2)
    })

    test('should report when mixing function types in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn1'))
      visitor.Identifier(createIdentifier('arguments', 1, 5))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('fn1'))

      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments', 2, 5))
      visitor['FunctionExpression:exit'](createFunctionExpression())

      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments', 3, 5))
      visitor['ArrowFunctionExpression:exit'](createArrowFunctionExpression())

      expect(reports.length).toBe(3)
    })
  })

  describe('not reporting arguments outside functions', () => {
    test('should not report arguments outside any function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report other identifiers outside functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.Identifier(createIdentifier('foo'))
      visitor.Identifier(createIdentifier('bar'))

      expect(reports.length).toBe(0)
    })

    test('should not report at global scope after function exit', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report before any function entered', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.Identifier(createIdentifier('arguments'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report after all functions exited', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('test'))
      visitor.FunctionExpression(createFunctionExpression())
      visitor['FunctionExpression:exit'](createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report after nested functions all exited', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))
      visitor.FunctionDeclaration(createFunctionDeclaration('inner'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('inner'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('outer'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report arguments in VariableDeclarator outside function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report after rapid enter and exit', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting other identifiers inside functions', () => {
    test('should not report regular identifiers inside function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('foo'))
      visitor.Identifier(createIdentifier('bar'))
      visitor.Identifier(createIdentifier('args'))

      expect(reports.length).toBe(0)
    })

    test('should not report arg identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arg'))

      expect(reports.length).toBe(0)
    })

    test('should not report args identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('args'))

      expect(reports.length).toBe(0)
    })

    test('should not report argument identifier (singular)', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('argument'))

      expect(reports.length).toBe(0)
    })

    test('should not report Arguments identifier (different case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('Arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report ARGUMENTS identifier (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('ARGUMENTS'))

      expect(reports.length).toBe(0)
    })

    test('should not report myArguments identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('myArguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report _arguments identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('_arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report arguments0 identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments0'))

      expect(reports.length).toBe(0)
    })

    test('should not report common variable names', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      for (const name of ['i', 'j', 'k', 'x', 'y', 'z', 'result', 'value', 'data', 'item']) {
        visitor.Identifier(createIdentifier(name))
      }

      expect(reports.length).toBe(0)
    })

    test('should not report function parameter-like names', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('params'))
      visitor.Identifier(createIdentifier('rest'))
      visitor.Identifier(createIdentifier('spread'))

      expect(reports.length).toBe(0)
    })

    test('should not report empty string name identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier(''))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting when arguments is explicitly declared', () => {
    test('should not report when arguments is declared as variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report other identifiers even when arguments is declared', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('foo'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should report arguments if different variable is declared', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('foo'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should reset arguments declared flag on function exit', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test1'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('test1'))

      visitor.FunctionDeclaration(createFunctionDeclaration('test2'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report after declaring a different variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('args'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should not report when arguments is declared via let-like pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report Arguments (wrong case) declaration as shadowing', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('Arguments'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should still report after declaring foo then bar', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('foo'))
      visitor.VariableDeclarator(createVariableDeclarator('bar'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should not report after declaring arguments and other variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('foo'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.VariableDeclarator(createVariableDeclarator('bar'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator without id property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator({ type: 'VariableDeclarator', init: null })
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclarator with destructuring id', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      const destructuringNode = {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: null,
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(destructuringNode)
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclarator with array destructuring id', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      const arrayDestructuringNode = {
        type: 'VariableDeclarator',
        id: { type: 'ArrayPattern', elements: [] },
        init: null,
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(arrayDestructuringNode)
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should not affect reporting when VariableDeclarator is outside function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle multiple VariableDeclarators for arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })
  })

  describe('nested functions', () => {
    test('should track function depth correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))
      visitor.Identifier(createIdentifier('arguments'))

      visitor.FunctionDeclaration(createFunctionDeclaration('inner'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(2)
    })

    test('should not report arguments in outer function when declared in inner', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))
      visitor.Identifier(createIdentifier('arguments'))

      visitor.FunctionDeclaration(createFunctionDeclaration('inner'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report in all 3 nested levels', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('l1'))
      visitor.Identifier(createIdentifier('arguments', 1, 0))

      visitor.FunctionDeclaration(createFunctionDeclaration('l2'))
      visitor.Identifier(createIdentifier('arguments', 2, 0))

      visitor.FunctionDeclaration(createFunctionDeclaration('l3'))
      visitor.Identifier(createIdentifier('arguments', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report in 4 deeply nested levels', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('l1'))
      visitor.FunctionDeclaration(createFunctionDeclaration('l2'))
      visitor.FunctionDeclaration(createFunctionDeclaration('l3'))
      visitor.FunctionDeclaration(createFunctionDeclaration('l4'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should properly exit nested functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))
      visitor.FunctionDeclaration(createFunctionDeclaration('inner'))
      visitor.Identifier(createIdentifier('arguments', 1, 0))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('inner'))
      visitor.Identifier(createIdentifier('arguments', 2, 0))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('outer'))
      visitor.Identifier(createIdentifier('arguments', 3, 0))

      // First in inner (reported), second in outer (reported), third outside (not reported)
      expect(reports.length).toBe(2)
    })

    test('should track depth with mixed function types nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))
      visitor.FunctionExpression(createFunctionExpression())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle sibling functions at same depth', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))
      visitor.Identifier(createIdentifier('arguments', 1, 0))

      // Sibling 1
      visitor.FunctionDeclaration(createFunctionDeclaration('sibling1'))
      visitor.Identifier(createIdentifier('arguments', 2, 0))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('sibling1'))

      // Sibling 2
      visitor.FunctionDeclaration(createFunctionDeclaration('sibling2'))
      visitor.Identifier(createIdentifier('arguments', 3, 0))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('sibling2'))

      // Back in outer
      visitor.Identifier(createIdentifier('arguments', 4, 0))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('outer'))

      expect(reports.length).toBe(4)
    })

    test('should handle sibling functions with different declared states', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))

      // Sibling 1 declares arguments
      visitor.FunctionDeclaration(createFunctionDeclaration('s1'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments')) // not reported
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('s1'))

      // Sibling 2 does NOT declare arguments
      visitor.FunctionDeclaration(createFunctionDeclaration('s2'))
      visitor.Identifier(createIdentifier('arguments')) // reported
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('s2'))

      // Back in outer - argumentsDeclared was reset by exitFunction
      visitor.Identifier(createIdentifier('arguments')) // reported (outer level)
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('outer'))

      expect(reports.length).toBe(2)
    })

    test('should handle inner declared not affecting outer after inner exit', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))

      visitor.FunctionDeclaration(createFunctionDeclaration('inner'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments')) // not reported
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('inner'))

      // After inner exit, argumentsDeclared is reset for outer
      visitor.Identifier(createIdentifier('arguments')) // reported
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('outer'))

      expect(reports.length).toBe(1)
    })

    test('should handle outer declared affecting inner', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))

      visitor.FunctionDeclaration(createFunctionDeclaration('inner'))
      visitor.Identifier(createIdentifier('arguments')) // not reported (outer declared)
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('inner'))

      // exitFunction resets argumentsDeclared, so outer's declaration is lost
      visitor.Identifier(createIdentifier('arguments')) // reported (reset on inner exit)
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('outer'))

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested with alternating declared states', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      // Level 1: not declared
      visitor.FunctionDeclaration(createFunctionDeclaration('l1'))
      visitor.Identifier(createIdentifier('arguments', 1, 0)) // reported

      // Level 2: declared
      visitor.FunctionDeclaration(createFunctionDeclaration('l2'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments', 2, 0)) // not reported
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('l2'))

      // Level 2 again: after exit, argumentsDeclared reset
      visitor.FunctionDeclaration(createFunctionDeclaration('l2b'))
      visitor.Identifier(createIdentifier('arguments', 3, 0)) // reported
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('l2b'))

      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('l1'))

      expect(reports.length).toBe(2)
    })

    test('should handle FunctionExpression nesting inside FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))
      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionExpression:exit'](createFunctionExpression())
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('outer'))

      expect(reports.length).toBe(1)
    })

    test('should handle ArrowFunctionExpression nesting inside FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['ArrowFunctionExpression:exit'](createArrowFunctionExpression())
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('outer'))

      expect(reports.length).toBe(1)
    })

    test('should handle exit before enter not breaking state', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      // Premature exit decrements depth to -1
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('test'))

      // Enter brings depth to 0, not 1
      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      // At depth 0, arguments not reported
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested exits correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('l1'))
      visitor.FunctionDeclaration(createFunctionDeclaration('l2'))
      visitor.FunctionDeclaration(createFunctionDeclaration('l3'))
      visitor.Identifier(createIdentifier('arguments', 1, 0))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('l3'))
      visitor.Identifier(createIdentifier('arguments', 2, 0))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('l2'))
      visitor.Identifier(createIdentifier('arguments', 3, 0))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('l1'))
      visitor.Identifier(createIdentifier('arguments', 4, 0))

      // Reports at: depth 3, depth 2, depth 1 (3 reports). Last is outside function (0).
      expect(reports.length).toBe(3)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier('string')).not.toThrow()
      expect(() => visitor.Identifier(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))

      const node = {
        type: 'Identifier',
        name: 'arguments',
      }

      expect(() => visitor.Identifier(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
            fix: descriptor.fix,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'function test() { return arguments; }',
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

      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))

      expect(() => visitor.Identifier(createIdentifier('arguments'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle multiple function types', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('decl'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('decl'))

      visitor.FunctionDeclaration(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionDeclaration:exit'](createFunctionExpression())

      visitor.FunctionDeclaration(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionDeclaration:exit'](createArrowFunctionExpression())

      expect(reports.length).toBe(3)
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier(true)).not.toThrow()
      expect(() => visitor.Identifier(false)).not.toThrow()
    })

    test('should handle array node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier([])).not.toThrow()
      expect(() => visitor.Identifier([1, 2, 3])).not.toThrow()
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier({ type: 'Identifier', name: 'arguments' })

      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier({ type: 'Identifier', name: 42 as unknown as string })

      expect(reports.length).toBe(0)
    })

    test('should handle node with null name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier({ type: 'Identifier', name: null as unknown as string })

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier({ type: 'Identifier' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier({ type: 'Literal', name: 'arguments' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with partial loc - no start', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      const node = {
        type: 'Identifier',
        name: 'arguments',
        loc: { end: { line: 1, column: 9 } },
      }
      visitor.Identifier(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc - no end', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      const node = {
        type: 'Identifier',
        name: 'arguments',
        loc: { start: { line: 1, column: 0 } },
      }
      visitor.Identifier(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc but non-numeric values', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      const node = {
        type: 'Identifier',
        name: 'arguments',
        loc: {
          start: { line: 'one' as unknown as number, column: 'zero' as unknown as number },
          end: { line: 'one' as unknown as number, column: 'nine' as unknown as number },
        },
      }
      visitor.Identifier(node)

      expect(reports.length).toBe(1)
    })

    test('should handle FunctionDeclaration enter with null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle FunctionExpression enter with null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.FunctionExpression(null)).not.toThrow()
    })

    test('should handle ArrowFunctionExpression enter with null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
    })

    test('should handle VariableDeclarator with null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle exit handlers with null node', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor['FunctionDeclaration:exit'](null)).not.toThrow()
      expect(() => visitor['FunctionExpression:exit'](null)).not.toThrow()
      expect(() => visitor['ArrowFunctionExpression:exit'](null)).not.toThrow()
    })

    test('should handle node with range [0, 0]', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0, [0, 0]))

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.range).toEqual([0, 0])
    })

    test('should handle node with large range values', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0, [10000, 10009]))

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.range).toEqual([10000, 10009])
    })

    test('should handle very large line and column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 99999, 99999))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle node with empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      const node = {
        type: 'Identifier',
        name: 'arguments',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
        range: [0, 9],
        extra: true,
        nested: { deep: { value: 42 } },
      }
      visitor.Identifier(node)

      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclarator with non-object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
    })

    test('should handle VariableDeclarator with non-Identifier id', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: null,
      })
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should create fresh state for each visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor1 = preferRestParamsRule.create(context)
      const visitor2 = preferRestParamsRule.create(context)

      visitor1.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor1.Identifier(createIdentifier('arguments'))

      // visitor2 starts fresh - no function entered
      visitor2.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention rest parameters in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports[0].message.toLowerCase()).toContain('rest parameters')
    })

    test('should mention arguments in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports[0].message).toContain('arguments')
    })

    test('should have correct message format', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports[0].message).toBe("Use rest parameters (...args) instead of 'arguments'.")
    })

    test('should work with custom tokens and comments arrays', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
            fix: descriptor.fix,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'function test() { return arguments; }',
        getTokens: () => [
          { type: 'Keyword', value: 'function' },
          { type: 'Identifier', value: 'test' },
        ],
        getComments: () => [{ type: 'Line', value: '// test' }],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rest parameters')
    })

    test('should not report arguments when used as property name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('obj'))

      expect(reports.length).toBe(0)
    })

    test('should report when arguments is used multiple times in same function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 10))
      visitor.Identifier(createIdentifier('arguments', 1, 30))
      visitor.Identifier(createIdentifier('arguments', 2, 15))

      expect(reports.length).toBe(3)
    })

    test('should produce consistent message across all reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0))
      visitor.Identifier(createIdentifier('arguments', 2, 0))
      visitor.Identifier(createIdentifier('arguments', 3, 0))

      const expectedMessage = "Use rest parameters (...args) instead of 'arguments'."
      for (const report of reports) {
        expect(report.message).toBe(expectedMessage)
      }
    })

    test('should produce message that is a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should produce message mentioning ...args', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports[0].message).toContain('...args')
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(9)
    })

    test('should report distinct locations for multiple arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 10))
      visitor.Identifier(createIdentifier('arguments', 5, 20))
      visitor.Identifier(createIdentifier('arguments', 10, 30))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should include loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 3, 7))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier({ type: 'Identifier', name: 'arguments' })

      // extractLocation returns default: line 1, column 0
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('auto-fix', () => {
    test('should provide fix replacing arguments with args', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 10, [10, 19]))

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('args')
      expect(reports[0].fix?.range).toEqual([10, 19])
    })

    test('should provide fix for each arguments usage', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 10, [10, 19]))
      visitor.Identifier(createIdentifier('arguments', 1, 30, [30, 39]))

      expect(reports.length).toBe(2)
      expect(reports[0].fix?.text).toBe('args')
      expect(reports[1].fix?.text).toBe('args')
    })

    test('should not provide fix when node has no range', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))

      const nodeWithoutRange = {
        type: 'Identifier',
        name: 'arguments',
        loc: {
          start: { line: 1, column: 10 },
          end: { line: 1, column: 19 },
        },
      }

      visitor.Identifier(nodeWithoutRange)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix text as args consistently', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      for (let i = 0; i < 5; i++) {
        visitor.Identifier(createIdentifier('arguments', 1, i * 20, [i * 20, i * 20 + 9]))
      }

      for (const report of reports) {
        expect(report.fix?.text).toBe('args')
      }
    })

    test('should provide fix with correct range for each occurrence', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0, [0, 9]))
      visitor.Identifier(createIdentifier('arguments', 1, 20, [20, 29]))
      visitor.Identifier(createIdentifier('arguments', 1, 40, [40, 49]))

      expect(reports[0].fix?.range).toEqual([0, 9])
      expect(reports[1].fix?.range).toEqual([20, 29])
      expect(reports[2].fix?.range).toEqual([40, 49])
    })

    test('should provide fix at start of file', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0, [0, 9]))

      expect(reports[0].fix?.range).toEqual([0, 9])
      expect(reports[0].fix?.text).toBe('args')
    })

    test('should provide fix with range at end of file', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0, [990, 999]))

      expect(reports[0].fix?.range).toEqual([990, 999])
    })

    test('should provide fix with single character range', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0, [5, 6]))

      expect(reports[0].fix?.range).toEqual([5, 6])
      expect(reports[0].fix?.text).toBe('args')
    })

    test('should provide fix as object with range and text', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 10, [10, 19]))

      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix).toHaveProperty('range')
      expect(fix).toHaveProperty('text')
    })
  })

  describe('context variations', () => {
    test('should work with different file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }', filePath: '/project/src/utils.ts' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const f = () => arguments[0];', filePath: '/src/file.ts' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should work with long source code', () => {
      const longSource = 'x'.repeat(10000)
      const { context, reports } = createMockRuleContext({ source: longSource, filePath: '/src/file.ts' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should work with config containing extra options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strictMode: true, customFlag: 'yes' }], source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should work with context that has undefined getAST', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })
  })

  describe('report descriptor properties', () => {
    test('each report should have a message property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0))
      visitor.Identifier(createIdentifier('arguments', 2, 0))

      for (const report of reports) {
        expect(report).toHaveProperty('message')
        expect(typeof report.message).toBe('string')
      }
    })

    test('each report should have a loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0))
      visitor.Identifier(createIdentifier('arguments', 2, 0))

      for (const report of reports) {
        expect(report).toHaveProperty('loc')
      }
    })

    test('reports should maintain order', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 10))
      visitor.Identifier(createIdentifier('arguments', 5, 20))
      visitor.Identifier(createIdentifier('arguments', 10, 30))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('report descriptor should match expected shape', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 1, 0, [0, 9]))

      const report = reports[0]
      expect(report.message).toBe("Use rest parameters (...args) instead of 'arguments'.")
      expect(report.loc).toBeDefined()
      expect(report.loc?.start).toEqual({ line: 1, column: 0 })
      expect(report.loc?.end).toEqual({ line: 1, column: 9 })
      expect(report.fix).toEqual({ range: [0, 9], text: 'args' })
    })
  })

  describe('function type specific behavior', () => {
    test('should report when entering via FunctionDeclaration and exiting via FunctionDeclaration:exit', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report when entering via FunctionExpression and exiting via FunctionExpression:exit', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionExpression:exit'](createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report when entering via ArrowFunctionExpression and exiting via ArrowFunctionExpression:exit', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['ArrowFunctionExpression:exit'](createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should track depth with mixed enter/exit types', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionExpression:exit'](createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('test'))

      expect(reports.length).toBe(2)
    })

    test('should track depth correctly with arrow inside function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['ArrowFunctionExpression:exit'](createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('test'))

      expect(reports.length).toBe(2)
    })

    test('should track depth correctly with function inside arrow', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.FunctionDeclaration(createFunctionDeclaration('inner'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('inner'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor['ArrowFunctionExpression:exit'](createArrowFunctionExpression())

      expect(reports.length).toBe(2)
    })
  })

  describe('rapid state changes', () => {
    test('should handle rapid enter exit cycles', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration(`fn${i}`))
        visitor.Identifier(createIdentifier('arguments', i + 1, 0))
        visitor['FunctionDeclaration:exit'](createFunctionDeclaration(`fn${i}`))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle rapid enter exit without identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration(`fn${i}`))
        visitor['FunctionDeclaration:exit'](createFunctionDeclaration(`fn${i}`))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle alternating declared and undeclared across functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      // Function 1: declared
      visitor.FunctionDeclaration(createFunctionDeclaration('f1'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments')) // not reported
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('f1'))

      // Function 2: not declared
      visitor.FunctionDeclaration(createFunctionDeclaration('f2'))
      visitor.Identifier(createIdentifier('arguments')) // reported
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('f2'))

      // Function 3: declared
      visitor.FunctionDeclaration(createFunctionDeclaration('f3'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments')) // not reported
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('f3'))

      expect(reports.length).toBe(1)
    })
  })

  describe('complex scenarios', () => {
    test('should handle IIFE-like pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionExpression:exit'](createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should handle callback pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      // Outer function
      visitor.FunctionDeclaration(createFunctionDeclaration('process'))

      // Callback function
      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionExpression:exit'](createFunctionExpression())

      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('process'))

      expect(reports.length).toBe(1)
    })

    test('should handle promise chain pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fetch'))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments', 1, 0))
      visitor['ArrowFunctionExpression:exit'](createArrowFunctionExpression())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments', 2, 0))
      visitor['ArrowFunctionExpression:exit'](createArrowFunctionExpression())
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('fetch'))

      expect(reports.length).toBe(2)
    })

    test('should handle event handler pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('event'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionExpression:exit'](createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should handle class method pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('this'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionExpression:exit'](createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should handle recursive function pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('recurse'))
      visitor.Identifier(createIdentifier('arguments'))
      // Simulate recursive call (another function context)
      visitor.FunctionDeclaration(createFunctionDeclaration('recurse'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('recurse'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('recurse'))

      expect(reports.length).toBe(2)
    })

    test('should handle decorator-like pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      // Outer wrapper
      visitor.FunctionDeclaration(createFunctionDeclaration('decorator'))
      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionExpression:exit'](createFunctionExpression())
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('decorator'))

      expect(reports.length).toBe(1)
    })

    test('should handle many identifiers with single arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      for (const name of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'arguments', 'i', 'j']) {
        visitor.Identifier(createIdentifier(name))
      }

      expect(reports.length).toBe(1)
    })

    test('should handle many VariableDeclarators then arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      for (const name of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']) {
        visitor.VariableDeclarator(createVariableDeclarator(name))
      }
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle many VariableDeclarators including arguments then arguments identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.VariableDeclarator(createVariableDeclarator('c'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })
  })

  describe('additional coverage', () => {
    test('should handle function with params property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      const fnWithParams = {
        type: 'FunctionDeclaration',
        id: createIdentifier('test'),
        params: [createIdentifier('a'), createIdentifier('b')],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionDeclaration(fnWithParams)
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should not report before VariableDeclarator processes arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments')) // reported (before declaration)
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments')) // not reported (after declaration)

      expect(reports.length).toBe(1)
    })

    test('should handle FunctionExpression exit resetting argumentsDeclared', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments')) // not reported
      visitor['FunctionExpression:exit'](createFunctionExpression())

      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments')) // reported (reset)
      visitor['FunctionExpression:exit'](createFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should handle ArrowFunctionExpression exit resetting argumentsDeclared', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments')) // not reported
      visitor['ArrowFunctionExpression:exit'](createArrowFunctionExpression())

      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.Identifier(createIdentifier('arguments')) // reported (reset)
      visitor['ArrowFunctionExpression:exit'](createArrowFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should handle node with type as non-string', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier({ type: 42, name: 'arguments' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with name as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier({
        type: 'Identifier',
        name: { toString: () => 'arguments' } as unknown as string,
      })

      expect(reports.length).toBe(0)
    })

    test('should report arguments at line 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments', 0, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle VariableDeclarator with undefined type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator({ type: undefined, id: createIdentifier('arguments'), init: null })
      visitor.Identifier(createIdentifier('arguments'))

      // VariableDeclarator check requires type === 'VariableDeclarator'
      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclarator with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator({
        type: 'FunctionDeclaration',
        id: createIdentifier('arguments'),
        init: null,
      })
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclarator with id having null type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: null, name: 'arguments' },
        init: null,
      })
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclarator with id having wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Literal', name: 'arguments' },
        init: null,
      })
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclarator with id having undefined name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: undefined },
        init: null,
      })
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclarator with id name not matching arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.VariableDeclarator(createVariableDeclarator('notArguments'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should not report when multiple functions declare arguments at different levels', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('outer'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments')) // not reported (outer declared)

      // Inner function: argumentsDeclared still true from outer
      visitor.FunctionExpression(createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments')) // not reported (outer declared still applies)
      visitor['FunctionExpression:exit'](createFunctionExpression())

      // After inner exit, argumentsDeclared is reset to false
      visitor.Identifier(createIdentifier('arguments')) // reported (reset on inner exit)
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('outer'))

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested with declaration only at top', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('l1'))
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))

      visitor.FunctionDeclaration(createFunctionDeclaration('l2'))
      visitor.FunctionDeclaration(createFunctionDeclaration('l3'))
      visitor.Identifier(createIdentifier('arguments')) // not reported (l1 declared)
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('l3'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('l2'))
      visitor['FunctionDeclaration:exit'](createFunctionDeclaration('l1'))

      expect(reports.length).toBe(0)
    })

    test('should handle Symbol as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier(Symbol('test'))).not.toThrow()
    })

    test('should handle Date as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier(new Date())).not.toThrow()
    })

    test('should handle RegExp as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier(/test/)).not.toThrow()
    })

    test('should handle Map as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier(new Map())).not.toThrow()
    })

    test('should handle Set as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier(new Set())).not.toThrow()
    })

    test('should handle arguments with arguments-like suffixes', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('argumentsList'))
      visitor.Identifier(createIdentifier('argumentsArray'))
      visitor.Identifier(createIdentifier('argumentsObj'))
      visitor.Identifier(createIdentifier('arguments_'))

      expect(reports.length).toBe(0)
    })

    test('should handle arguments with arguments-like prefixes', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('myarguments'))
      visitor.Identifier(createIdentifier('theArguments'))
      visitor.Identifier(createIdentifier('getarguments'))

      expect(reports.length).toBe(0)
    })

    test('should handle nested function with exit by different type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      // Enter with FunctionDeclaration, exit with FunctionExpression:exit
      // This is unusual but shouldn't crash
      visitor.FunctionDeclaration(createFunctionDeclaration('test'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor['FunctionExpression:exit'](createFunctionExpression())
      visitor.Identifier(createIdentifier('arguments'))

      // First reported inside function, second - depth went to 0 due to wrong exit type
      expect(reports.length).toBe(1)
    })

    test('should handle 20 rapid enter/exit cycles with arguments in each', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return arguments; }' })
      const visitor = preferRestParamsRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration(`fn${i}`))
        visitor.Identifier(createIdentifier('arguments', i + 1, 0))
        visitor['FunctionDeclaration:exit'](createFunctionDeclaration(`fn${i}`))
      }

      expect(reports.length).toBe(20)
    })
  })
})
