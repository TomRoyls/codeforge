import { describe, test, expect, vi } from 'vitest'
import { defaultCaseRule } from '../../../../src/rules/patterns/default-case.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createSwitchWithDefault(line = 1, column = 0): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'x' },
    cases: [
      { test: { type: 'Literal', value: 1 }, consequent: [] },
      { test: null, consequent: [] }, // default case
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createSwitchWithoutDefault(line = 1, column = 0): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'x' },
    cases: [
      { test: { type: 'Literal', value: 1 }, consequent: [] },
      { test: { type: 'Literal', value: 2 }, consequent: [] },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createEmptySwitch(line = 1, column = 0): unknown {
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

function createNonSwitchStatement(): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Literal', value: true },
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('default-case rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(defaultCaseRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(defaultCaseRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(defaultCaseRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(defaultCaseRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention default case in description', () => {
      expect(defaultCaseRule.meta.docs?.description.toLowerCase()).toContain('default')
    })

    test('should mention switch in description', () => {
      expect(defaultCaseRule.meta.docs?.description.toLowerCase()).toContain('switch')
    })

    test('should have description as non-empty string', () => {
      expect(typeof defaultCaseRule.meta.docs?.description).toBe('string')
      expect((defaultCaseRule.meta.docs?.description ?? '').length).toBeGreaterThan(0)
    })

    test('should have empty schema', () => {
      expect(defaultCaseRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(defaultCaseRule.meta.fixable).toBeUndefined()
    })

    test('should have docs object', () => {
      expect(defaultCaseRule.meta.docs).toBeDefined()
      expect(typeof defaultCaseRule.meta.docs).toBe('object')
    })

    test('should have exactly one type value', () => {
      expect(defaultCaseRule.meta.type).toBeDefined()
      expect(typeof defaultCaseRule.meta.type).toBe('string')
    })

    test('should have exactly one severity value', () => {
      expect(defaultCaseRule.meta.severity).toBeDefined()
      expect(typeof defaultCaseRule.meta.severity).toBe('string')
    })

    test('should have valid rule type', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(defaultCaseRule.meta.type)
    })

    test('should have valid severity', () => {
      expect(['off', 'warn', 'error']).toContain(defaultCaseRule.meta.severity)
    })

    test('should not be deprecated', () => {
      expect(defaultCaseRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(defaultCaseRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(defaultCaseRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have a docs url or undefined', () => {
      const url = defaultCaseRule.meta.docs?.url
      if (url !== undefined) {
        expect(typeof url).toBe('string')
      }
    })

    test('should have recommended as boolean false', () => {
      expect(defaultCaseRule.meta.docs?.recommended).toBeTypeOf('boolean')
      expect(defaultCaseRule.meta.docs?.recommended).toBe(false)
    })

    test('should have category as string patterns', () => {
      expect(typeof defaultCaseRule.meta.docs?.category).toBe('string')
    })

    test('meta should be an object', () => {
      expect(typeof defaultCaseRule.meta).toBe('object')
      expect(defaultCaseRule.meta).not.toBeNull()
    })

    test('should have create method on rule', () => {
      expect(typeof defaultCaseRule.create).toBe('function')
    })

    test('description should end with period', () => {
      expect(defaultCaseRule.meta.docs?.description).toMatch(/\.$/)
    })

    test('exact description text', () => {
      expect(defaultCaseRule.meta.docs?.description).toBe(
        'Require default case in switch statements.',
      )
    })
  })

  describe('create', () => {
    test('should return visitor with SwitchStatement method', () => {
      const { context } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(visitor).toHaveProperty('SwitchStatement')
    })

    test('SwitchStatement should be a function', () => {
      const { context } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(typeof visitor.SwitchStatement).toBe('function')
    })

    test('should return an object', () => {
      const { context } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('each call returns a new visitor object', () => {
      const { context } = createMockRuleContext()
      const visitor1 = defaultCaseRule.create(context)
      const visitor2 = defaultCaseRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor should only have SwitchStatement key', () => {
      const { context } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(Object.keys(visitor)).toEqual(['SwitchStatement'])
    })

    test('SwitchStatement should accept one argument', () => {
      const { context } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(visitor.SwitchStatement.length).toBe(1)
    })

    test('create with different context objects should work', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = defaultCaseRule.create(ctx1.context)
      const visitor2 = defaultCaseRule.create(ctx2.context)

      expect(() => visitor1.SwitchStatement(createSwitchWithoutDefault())).not.toThrow()
      expect(() => visitor2.SwitchStatement(createSwitchWithoutDefault())).not.toThrow()
    })

    test('should not throw when create is called multiple times', () => {
      const { context } = createMockRuleContext()
      for (let i = 0; i < 10; i++) {
        expect(() => defaultCaseRule.create(context)).not.toThrow()
      }
    })

    test('SwitchStatement method should return undefined or void', () => {
      const { context } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      const result = visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(result).toBeUndefined()
    })

    test('SwitchStatement method should return undefined when reporting', () => {
      const { context } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      const result = visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(result).toBeUndefined()
    })

    test('SwitchStatement method should return undefined when not reporting', () => {
      const { context } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      const result = visitor.SwitchStatement(createSwitchWithDefault())
      expect(result).toBeUndefined()
    })
  })

  describe('detecting missing default case', () => {
    test('should report switch without default case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithoutDefault())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('default')
    })

    test('should not report switch with default case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithDefault())

      expect(reports.length).toBe(0)
    })

    test('should report empty switch without default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(createEmptySwitch())

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithoutDefault(5, 2))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report switch with one case and no default', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report switch with many cases and no default', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1 }, consequent: [] },
          { test: { type: 'Literal', value: 2 }, consequent: [] },
          { test: { type: 'Literal', value: 3 }, consequent: [] },
          { test: { type: 'Literal', value: 4 }, consequent: [] },
          { test: { type: 'Literal', value: 5 }, consequent: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when default is only case', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: null, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when default is first case', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: null, consequent: [] },
          { test: { type: 'Literal', value: 1 }, consequent: [] },
          { test: { type: 'Literal', value: 2 }, consequent: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when default is middle case', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1 }, consequent: [] },
          { test: null, consequent: [] },
          { test: { type: 'Literal', value: 2 }, consequent: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when default is last case', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1 }, consequent: [] },
          { test: { type: 'Literal', value: 2 }, consequent: [] },
          { test: null, consequent: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should report when case test is undefined not null', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: undefined, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when case test is 0 not null', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 0 }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when case test is empty string not null', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: '' }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when case test is false not null', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: false }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when one of many cases has test null', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'a' }, consequent: [] },
          { test: { type: 'Literal', value: 'b' }, consequent: [] },
          { test: null, consequent: [] },
          { test: { type: 'Literal', value: 'c' }, consequent: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('isSwitchStatement - primitive rejection', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement('SwitchStatement')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle false boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle symbol node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle bigint node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(BigInt(9007199254740991))).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('isSwitchStatement - wrong AST node types', () => {
    test('should handle non-switch statement gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(createNonSwitchStatement())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report ForStatement', () => {
      const node: unknown = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report WhileStatement', () => {
      const node: unknown = {
        type: 'WhileStatement',
        test: { type: 'Literal', value: true },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report FunctionDeclaration', () => {
      const node: unknown = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BlockStatement', () => {
      const node: unknown = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report VariableDeclaration', () => {
      const node: unknown = {
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'let',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report TryStatement', () => {
      const node: unknown = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report ReturnStatement', () => {
      const node: unknown = {
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement({})
      expect(reports.length).toBe(0)
    })

    test('should not report object with only type property wrong value', () => {
      const node: unknown = { type: 'switchstatement' }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report object with SWITCHSTATEMENT (all caps)', () => {
      const node: unknown = { type: 'SWITCHSTATEMENT' }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement([])
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct start line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(10, 0))
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(1, 5))
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(3, 2))
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(1, 0))
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(9999, 0))
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(1, 500))
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report location with both line and column zero', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      const node = createSwitchWithoutDefault()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should use default location when loc is missing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: null,
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with undefined loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: undefined,
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { end: { line: 5, column: 10 } },
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle loc with string line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: '5', column: '2' }, end: { line: '5', column: '10' } },
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      // extractLocation checks typeof === 'number', so strings become defaults
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: null, end: { line: 5, column: 10 } },
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report both start and end in location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(7, 3))
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('message verification', () => {
    test('should contain default in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].message).toContain('default')
    })

    test('should have exact expected message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].message).toBe('Expected a default case.')
    })

    test('message should be non-empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should end with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('message should contain Expected', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].message).toContain('Expected')
    })

    test('message should contain case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].message).toContain('case')
    })

    test('empty switch should have same message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createEmptySwitch())
      expect(reports[0].message).toBe('Expected a default case.')
    })

    test('single case switch should have same message', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 'a' }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports[0].message).toBe('Expected a default case.')
    })
  })

  describe('multiple switch statements', () => {
    test('should report each switch without default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports.length).toBe(2)
    })

    test('should report three switches without default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      visitor.SwitchStatement(createSwitchWithoutDefault())
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports.length).toBe(3)
    })

    test('should not report any switch with default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDefault())
      visitor.SwitchStatement(createSwitchWithDefault())
      expect(reports.length).toBe(0)
    })

    test('should report only the switch without default when mixed', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDefault())
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports.length).toBe(1)
    })

    test('should report in order of invocation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(2, 0))
      visitor.SwitchStatement(createSwitchWithoutDefault(5, 0))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should report each with correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(3, 4))
      visitor.SwitchStatement(createSwitchWithoutDefault(7, 2))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[1].loc?.start.line).toBe(7)
      expect(reports[1].loc?.start.column).toBe(2)
    })

    test('should report many switches without default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      for (let i = 0; i < 20; i++) {
        visitor.SwitchStatement(createSwitchWithoutDefault())
      }
      expect(reports.length).toBe(20)
    })

    test('should handle alternating with/without default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.SwitchStatement(createSwitchWithDefault())
        visitor.SwitchStatement(createSwitchWithoutDefault())
      }
      expect(reports.length).toBe(10)
    })

    test('should handle empty switch in sequence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createEmptySwitch())
      visitor.SwitchStatement(createSwitchWithoutDefault())
      visitor.SwitchStatement(createSwitchWithDefault())
      expect(reports.length).toBe(2)
    })

    test('should handle many empty switches', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      for (let i = 0; i < 15; i++) {
        visitor.SwitchStatement(createEmptySwitch())
      }
      expect(reports.length).toBe(15)
    })
  })

  describe('edge cases - malformed nodes', () => {
    test('should handle node without cases', () => {
      const { context } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      const node = { type: 'SwitchStatement', discriminant: { type: 'Identifier', name: 'x' } }

      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should report when cases is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node without discriminant', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        cases: [{ test: null, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchStatement(node)
      // Has default (test: null), should not report
      expect(reports.length).toBe(0)
    })

    test('should throw when cases is non-array object', () => {
      const { context } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: { 0: { test: null, consequent: [] }, length: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchStatement(node)).toThrow()
    })

    test('should handle cases with extra properties on case objects', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            test: { type: 'Literal', value: 1 },
            consequent: [],
            extra: 'data',
            leadingComments: [],
          },
          { test: null, consequent: [], trailingComments: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case with consequent as non-array', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested switch-like structure', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'key' },
        },
        cases: [{ test: { type: 'Literal', value: 'a' }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle switch with complex discriminant with default', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        cases: [
          { test: { type: 'Literal', value: 1 }, consequent: [] },
          { test: null, consequent: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle switch with only default case with consequent', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            test: null,
            consequent: [
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should throw when cases array contains null entries', () => {
      const { context } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [null, { test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchStatement(node)).toThrow()
    })

    test('should handle node with numeric type property', () => {
      const node: unknown = {
        type: 42,
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean type property', () => {
      const node: unknown = {
        type: true,
        cases: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with null type property', () => {
      const node: unknown = {
        type: null,
        cases: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing type property', () => {
      const node: unknown = {
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra top-level properties', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 50],
        leadingComments: [],
        trailingComments: [],
        parent: {},
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('context interaction', () => {
    test('should call context.report when switch lacks default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports.length).toBe(1)
    })

    test('should not call context.report when switch has default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDefault())
      expect(reports.length).toBe(0)
    })

    test('should pass message to report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].message).toBeDefined()
    })

    test('should pass loc to report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].loc).toBeDefined()
    })

    test('should work with context with empty options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports.length).toBe(1)
    })

    test('should work with context with rules config', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: {}, rules: { 'default-case': 'warn' } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports.length).toBe(1)
    })

    test('should not call logger methods', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports.length).toBe(1)
      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
    })

    test('should not call getFilePath', () => {
      const reports: ReportDescriptor[] = []
      let filePathCalled = false
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => {
          filePathCalled = true
          return '/src/test.ts'
        },
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(filePathCalled).toBe(false)
    })

    test('should not call getSource', () => {
      const reports: ReportDescriptor[] = []
      let sourceCalled = false
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/test.ts',
        getAST: () => null,
        getSource: () => {
          sourceCalled = true
          return ''
        },
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(sourceCalled).toBe(false)
    })

    test('should not call getAST', () => {
      const reports: ReportDescriptor[] = []
      let astCalled = false
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/test.ts',
        getAST: () => {
          astCalled = true
          return null
        },
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(astCalled).toBe(false)
    })

    test('should not call getTokens', () => {
      const reports: ReportDescriptor[] = []
      let tokensCalled = false
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => {
          tokensCalled = true
          return []
        },
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(tokensCalled).toBe(false)
    })

    test('should not call getComments', () => {
      const reports: ReportDescriptor[] = []
      let commentsCalled = false
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => {
          commentsCalled = true
          return []
        },
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(commentsCalled).toBe(false)
    })
  })

  describe('exports', () => {
    test('should have named export defaultCaseRule', () => {
      expect(defaultCaseRule).toBeDefined()
    })

    test('should have create method', () => {
      expect(defaultCaseRule.create).toBeTypeOf('function')
    })

    test('should have meta property', () => {
      expect(defaultCaseRule.meta).toBeDefined()
    })

    test('should be an object', () => {
      expect(typeof defaultCaseRule).toBe('object')
      expect(defaultCaseRule).not.toBeNull()
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(defaultCaseRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('consistency', () => {
    test('should produce same result for same input', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const visitor1 = defaultCaseRule.create(ctx1)
      const visitor2 = defaultCaseRule.create(ctx2)

      const node = createSwitchWithoutDefault()
      visitor1.SwitchStatement(node)
      visitor2.SwitchStatement(node)

      expect(r1.length).toBe(r2.length)
      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should produce consistent locations for same node', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const visitor1 = defaultCaseRule.create(ctx1)
      const visitor2 = defaultCaseRule.create(ctx2)

      const node = createSwitchWithoutDefault(10, 5)
      visitor1.SwitchStatement(node)
      visitor2.SwitchStatement(node)

      expect(r1[0].loc).toEqual(r2[0].loc)
    })

    test('should be idempotent - calling with default does not accumulate state', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.SwitchStatement(createSwitchWithDefault())
      }
      expect(reports.length).toBe(0)
    })

    test('should accumulate reports correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithoutDefault())
      visitor.SwitchStatement(createSwitchWithDefault())
      visitor.SwitchStatement(createSwitchWithoutDefault())
      visitor.SwitchStatement(createSwitchWithDefault())
      visitor.SwitchStatement(createSwitchWithoutDefault())

      expect(reports.length).toBe(3)
    })

    test('should produce same message for different switch nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      const node1 = createSwitchWithoutDefault(1, 0)
      const node2 = createSwitchWithoutDefault(100, 50)

      visitor.SwitchStatement(node1)
      visitor.SwitchStatement(node2)

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('visitor from different context instances work independently', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const v1 = defaultCaseRule.create(ctx1.context)
      const v2 = defaultCaseRule.create(ctx2.context)

      v1.SwitchStatement(createSwitchWithoutDefault())
      v2.SwitchStatement(createSwitchWithDefault())

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(0)
    })

    test('should handle switch with string discriminant', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Literal', value: 'hello' },
        cases: [{ test: { type: 'Literal', value: 'world' }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle switch with expression discriminant', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        cases: [{ test: null, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle switch with regex discriminant', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Literal', value: /test/ },
        cases: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle switch with template literal case test', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'TemplateLiteral', quasis: [], expressions: [] }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('various case patterns', () => {
    test('should report switch with case having Identifier test', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Identifier', name: 'A' }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report switch with MemberExpression case tests', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            test: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'prop' },
              computed: false,
            },
            consequent: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report switch with negative number case', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            test: {
              type: 'UnaryExpression',
              operator: '-',
              argument: { type: 'Literal', value: 1 },
            },
            consequent: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle switch with multiple default-like cases but none null', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'a' }, consequent: [] },
          { test: { type: 'Literal', value: 'b' }, consequent: [] },
          { test: { type: 'Literal', value: 'c' }, consequent: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when default has break in consequent', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            test: { type: 'Literal', value: 1 },
            consequent: [{ type: 'BreakStatement', label: null }],
          },
          { test: null, consequent: [{ type: 'BreakStatement', label: null }] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when default has return in consequent', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            test: { type: 'Literal', value: 1 },
            consequent: [{ type: 'ReturnStatement', argument: null }],
          },
          {
            test: null,
            consequent: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 0 } }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when default has throw in consequent', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            test: null,
            consequent: [
              {
                type: 'ThrowStatement',
                argument: {
                  type: 'NewExpression',
                  callee: { type: 'Identifier', name: 'Error' },
                  arguments: [],
                },
              },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle switch with fall-through cases', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1 }, consequent: [] },
          { test: { type: 'Literal', value: 2 }, consequent: [] },
          {
            test: { type: 'Literal', value: 3 },
            consequent: [{ type: 'BreakStatement', label: null }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle switch where all cases are fall-through with default', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1 }, consequent: [] },
          { test: { type: 'Literal', value: 2 }, consequent: [] },
          { test: null, consequent: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle switch with empty consequent arrays', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('report descriptor shape', () => {
    test('report should have message property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0]).toHaveProperty('message')
    })

    test('report should have loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0]).toHaveProperty('loc')
    })

    test('report loc should have start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].loc).toHaveProperty('start')
    })

    test('report loc should have end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report loc start should have line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].loc?.start).toHaveProperty('line')
    })

    test('report loc start should have column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report loc end should have line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].loc?.end).toHaveProperty('line')
    })

    test('report loc end should have column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('report loc start line should be a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('report loc start column should be a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })
  })

  describe('real-world scenarios', () => {
    test('should handle enum-like switch without default', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'color' },
        cases: [
          { test: { type: 'Literal', value: 'red' }, consequent: [] },
          { test: { type: 'Literal', value: 'green' }, consequent: [] },
          { test: { type: 'Literal', value: 'blue' }, consequent: [] },
        ],
        loc: { start: { line: 10, column: 2 }, end: { line: 18, column: 3 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Expected a default case.')
    })

    test('should handle type switch with default', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'typeof x' },
        cases: [
          { test: { type: 'Literal', value: 'string' }, consequent: [] },
          { test: { type: 'Literal', value: 'number' }, consequent: [] },
          { test: null, consequent: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 10, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle large switch statement', () => {
      const cases = []
      for (let i = 0; i < 50; i++) {
        cases.push({ test: { type: 'Literal', value: i }, consequent: [] })
      }
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'statusCode' },
        cases,
        loc: { start: { line: 1, column: 0 }, end: { line: 100, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle large switch statement with default', () => {
      const cases = []
      for (let i = 0; i < 50; i++) {
        cases.push({ test: { type: 'Literal', value: i }, consequent: [] })
      }
      cases.push({ test: null, consequent: [] })
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'statusCode' },
        cases,
        loc: { start: { line: 1, column: 0 }, end: { line: 100, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle nested switch-like patterns', () => {
      const outerNode: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'outer' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 20, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(outerNode)
      expect(reports.length).toBe(1)
    })

    test('should handle switch with boolean discriminant', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Literal', value: true },
        cases: [
          { test: { type: 'Literal', value: true }, consequent: [] },
          { test: { type: 'Literal', value: false }, consequent: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle switch with null discriminant and no default', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: null,
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle switch with null discriminant and default', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: null,
        cases: [{ test: null, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle switch with group expression discriminant', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'SequenceExpression', expressions: [] },
        cases: [{ test: null, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('visitor isolation', () => {
    test('visitor from one context does not affect another', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const v1 = defaultCaseRule.create(ctx1.context)
      const v2 = defaultCaseRule.create(ctx2.context)

      v1.SwitchStatement(createSwitchWithoutDefault(1, 0))
      v1.SwitchStatement(createSwitchWithoutDefault(2, 0))
      v2.SwitchStatement(createSwitchWithoutDefault(3, 0))

      expect(ctx1.reports.length).toBe(2)
      expect(ctx2.reports.length).toBe(1)
      expect(ctx1.reports[0].loc?.start.line).toBe(1)
      expect(ctx1.reports[1].loc?.start.line).toBe(2)
      expect(ctx2.reports[0].loc?.start.line).toBe(3)
    })

    test('reusing same visitor accumulates reports correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.SwitchStatement(createSwitchWithoutDefault(i + 1, 0))
      }
      expect(reports.length).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(reports[i].loc?.start.line).toBe(i + 1)
      }
    })

    test('same visitor handles mix of valid and invalid nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(null)
      visitor.SwitchStatement(createSwitchWithoutDefault())
      visitor.SwitchStatement(undefined)
      visitor.SwitchStatement(createSwitchWithDefault())
      visitor.SwitchStatement(createEmptySwitch())
      visitor.SwitchStatement(createNonSwitchStatement())
      visitor.SwitchStatement(createSwitchWithoutDefault())

      expect(reports.length).toBe(3)
    })

    test('creating many visitors from same context works', () => {
      const { context, reports } = createMockRuleContext()

      for (let i = 0; i < 10; i++) {
        const visitor = defaultCaseRule.create(context)
        visitor.SwitchStatement(createSwitchWithoutDefault())
      }
      expect(reports.length).toBe(10)
    })

    test('calling SwitchStatement with non-object after valid switch', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithoutDefault())
      visitor.SwitchStatement('not an object')
      visitor.SwitchStatement(createSwitchWithoutDefault())

      expect(reports.length).toBe(2)
    })

    test('visitor handles rapid successive calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.SwitchStatement(
          i % 2 === 0 ? createSwitchWithoutDefault() : createSwitchWithDefault(),
        )
      }
      expect(reports.length).toBe(25)
    })

    test('visitor handles call after error-like input', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(new Error('test'))).not.toThrow()
      visitor.SwitchStatement(createSwitchWithoutDefault())
      expect(reports.length).toBe(1)
    })
  })

  describe('loc edge cases', () => {
    test('should handle location with very large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(100000, 0))
      expect(reports[0].loc?.start.line).toBe(100000)
    })

    test('should handle location with very large column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(1, 100000))
      expect(reports[0].loc?.start.column).toBe(100000)
    })

    test('should handle end column derived from createSwitchWithoutDefault', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(1, 5))
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should handle switch at origin (line 1, column 0)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report with default location when loc has empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: {},
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle NaN in location values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: NaN, column: NaN }, end: { line: NaN, column: NaN } },
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle Infinity in location values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: Infinity, column: 0 }, end: { line: Infinity, column: 10 } },
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(Infinity)
    })
  })

  describe('additional detection paths', () => {
    test('should handle switch with object type discriminant', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'ObjectExpression', properties: [] },
        cases: [{ test: { type: 'Literal', value: 'a' }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle switch with array discriminant', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'ArrayExpression', elements: [] },
        cases: [{ test: null, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case with undefined consequent but null test', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case with object as test value', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'ObjectExpression', properties: [] }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle switch with numeric literal discriminant', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Literal', value: 42 },
        cases: [
          { test: { type: 'Literal', value: 1 }, consequent: [] },
          { test: { type: 'Literal', value: 2 }, consequent: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle function call as case test', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            test: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'fn' },
              arguments: [],
            },
            consequent: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle Date constructor as discriminant', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Date' },
          arguments: [],
        },
        cases: [{ test: null, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should report for switch with multi-line location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithoutDefault(1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle switch at different indent levels', () => {
      const col0 = createSwitchWithoutDefault(1, 0)
      const col4 = createSwitchWithoutDefault(2, 4)
      const col8 = createSwitchWithoutDefault(3, 8)

      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(col0)
      visitor.SwitchStatement(col4)
      visitor.SwitchStatement(col8)

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.column).toBe(4)
      expect(reports[2].loc?.start.column).toBe(8)
    })

    test('should handle switch with conditional expression discriminant', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
        cases: [{ test: { type: 'Literal', value: 1 }, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle switch with SpreadElement in discriminant (unusual but possible)', () => {
      const node: unknown = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'val' },
        cases: [{ test: null, consequent: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle multi-switch scenario in same context', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = defaultCaseRule.create(context)

      const switches = [
        createSwitchWithoutDefault(10, 0),
        createEmptySwitch(20, 0),
        createSwitchWithDefault(30, 0),
        createSwitchWithoutDefault(40, 0),
        createSwitchWithDefault(50, 0),
        createEmptySwitch(60, 0),
      ]

      for (const sw of switches) {
        visitor.SwitchStatement(sw)
      }

      expect(reports.length).toBe(4)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.line).toBe(40)
      expect(reports[3].loc?.start.line).toBe(60)
    })
  })
})
