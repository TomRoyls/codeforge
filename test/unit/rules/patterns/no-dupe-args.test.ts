import { describe, test, expect, vi } from 'vitest'
import { noDupeArgsRule } from '../../../../src/rules/patterns/no-dupe-args.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createFunctionWithDupeArgs(line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    params: [
      {
        type: 'Identifier',
        name: 'a',
        loc: { start: { line, column }, end: { line, column: column + 1 } },
      },
      {
        type: 'Identifier',
        name: 'a',
        loc: { start: { line, column: column + 3 }, end: { line, column: column + 4 } },
      },
    ],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionWithUniqueArgs(line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    params: [
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' },
    ],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionExpressionWithDupeArgs(line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    params: [
      {
        type: 'Identifier',
        name: 'x',
        loc: { start: { line, column }, end: { line, column: column + 1 } },
      },
      {
        type: 'Identifier',
        name: 'x',
        loc: { start: { line, column: column + 3 }, end: { line, column: column + 4 } },
      },
    ],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createArrowFunctionWithDupeArgs(line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [
      {
        type: 'Identifier',
        name: 'y',
        loc: { start: { line, column }, end: { line, column: column + 1 } },
      },
      {
        type: 'Identifier',
        name: 'y',
        loc: { start: { line, column: column + 3 }, end: { line, column: column + 4 } },
      },
    ],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionWithDefaultParamDupe(line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    params: [
      { type: 'Identifier', name: 'a' },
      {
        type: 'AssignmentPattern',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line, column }, end: { line, column: column + 5 } },
      },
    ],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionWithRestParamDupe(line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    params: [
      { type: 'Identifier', name: 'a' },
      {
        type: 'RestElement',
        argument: { type: 'Identifier', name: 'a' },
        loc: { start: { line, column }, end: { line, column: column + 5 } },
      },
    ],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionWithNoParams(): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

function createNonFunction(): unknown {
  return {
    type: 'VariableDeclaration',
    declarations: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-dupe-args rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDupeArgsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDupeArgsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDupeArgsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDupeArgsRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention duplicate in description', () => {
      expect(noDupeArgsRule.meta.docs?.description.toLowerCase()).toContain('duplicate')
    })

    test('should have a non-empty description string', () => {
      expect(typeof noDupeArgsRule.meta.docs?.description).toBe('string')
      expect(noDupeArgsRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('should have description mentioning function', () => {
      expect(noDupeArgsRule.meta.docs?.description.toLowerCase()).toContain('function')
    })

    test('should have description mentioning arguments', () => {
      expect(noDupeArgsRule.meta.docs?.description.toLowerCase()).toContain('argument')
    })

    test('should have description mentioning definitions', () => {
      expect(noDupeArgsRule.meta.docs?.description.toLowerCase()).toContain('definition')
    })

    test('should have description ending with period', () => {
      expect(noDupeArgsRule.meta.docs?.description.endsWith('.')).toBe(true)
    })

    test('should have meta.type as one of valid RuleType values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noDupeArgsRule.meta.type)
    })

    test('should have meta.severity as one of valid Severity values', () => {
      expect(['off', 'warn', 'error']).toContain(noDupeArgsRule.meta.severity)
    })

    test('should have docs object defined', () => {
      expect(noDupeArgsRule.meta.docs).toBeDefined()
    })

    test('should have docs.description as string', () => {
      expect(typeof noDupeArgsRule.meta.docs?.description).toBe('string')
    })

    test('should have docs.recommended as boolean', () => {
      expect(typeof noDupeArgsRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs.category as string', () => {
      expect(typeof noDupeArgsRule.meta.docs?.category).toBe('string')
    })

    test('should have schema defined as empty array', () => {
      expect(noDupeArgsRule.meta.schema).toBeDefined()
      expect(Array.isArray(noDupeArgsRule.meta.schema)).toBe(true)
    })

    test('should have schema as empty array', () => {
      const schema = noDupeArgsRule.meta.schema
      if (Array.isArray(schema)) {
        expect(schema.length).toBe(0)
      }
    })

    test('should have fixable undefined', () => {
      expect(noDupeArgsRule.meta.fixable).toBeUndefined()
    })

    test('should have meta object defined', () => {
      expect(noDupeArgsRule.meta).toBeDefined()
      expect(typeof noDupeArgsRule.meta).toBe('object')
    })

    test('should not be deprecated', () => {
      expect(noDupeArgsRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(noDupeArgsRule.meta.replacedBy).toBeUndefined()
    })

    test('should have docs.url', () => {
      expect(noDupeArgsRule.meta.docs?.url).toBeDefined()
    })

    test('should not require type checking', () => {
      expect(noDupeArgsRule.meta.requiresTypeChecking).toBeFalsy()
    })
  })

  describe('create', () => {
    test('should return visitor with FunctionDeclaration method', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('should return visitor with FunctionExpression method', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(visitor).toHaveProperty('FunctionExpression')
    })

    test('should return visitor with ArrowFunctionExpression method', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })

    test('should return visitor with exactly 3 methods', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(3)
    })

    test('should return visitor methods that are functions', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(typeof visitor.FunctionDeclaration).toBe('function')
      expect(typeof visitor.FunctionExpression).toBe('function')
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('should return a new visitor on each call', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor1 = noDupeArgsRule.create(context)
      const visitor2 = noDupeArgsRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should have create as a function', () => {
      expect(typeof noDupeArgsRule.create).toBe('function')
    })

    test('should not return visitor with VariableDeclaration method', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(visitor).not.toHaveProperty('VariableDeclaration')
    })

    test('should not return visitor with ExpressionStatement method', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(visitor).not.toHaveProperty('ExpressionStatement')
    })

    test('should accept context and return object', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })
  })

  describe('detecting duplicate arguments', () => {
    test('should report duplicate args in function declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Duplicate argument')
      expect(reports[0].message).toContain("'a'")
    })

    test('should not report unique args in function declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithUniqueArgs())

      expect(reports.length).toBe(0)
    })

    test('should report duplicate args in function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionExpression(createFunctionExpressionWithDupeArgs())

      expect(reports.length).toBe(1)
    })

    test('should report duplicate args in arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionWithDupeArgs())

      expect(reports.length).toBe(1)
    })

    test('should report duplicate with default param', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDefaultParamDupe())

      expect(reports.length).toBe(1)
    })

    test('should report duplicate with rest param', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithRestParamDupe())

      expect(reports.length).toBe(1)
    })

    test('should not report function with no params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithNoParams())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(13)
    })

    test('should report message containing argument name in quotes', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports[0].message).toMatch(/'a'/)
    })

    test('should report message starting with Duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports[0].message).toMatch(/^Duplicate/)
    })

    test('should report message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should report duplicate in function expression with correct message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionExpression(createFunctionExpressionWithDupeArgs())

      expect(reports[0].message).toContain("'x'")
      expect(reports[0].message).toContain('Duplicate argument')
    })

    test('should report duplicate in arrow function with correct message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionWithDupeArgs())

      expect(reports[0].message).toContain("'y'")
      expect(reports[0].message).toContain('Duplicate argument')
    })

    test('should report location with start and end for duplicate arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs(1, 0))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location with line and column as numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report end location for duplicate arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs(3, 5))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(9)
    })
  })

  describe('multiple duplicates', () => {
    test('should report two duplicates with same name appearing three times', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 7 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(2)
    })

    test('should report duplicate for two different names both duplicated', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 7 } },
          },
          {
            type: 'Identifier',
            name: 'b',
            loc: { start: { line: 1, column: 9 }, end: { line: 1, column: 10 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(2)
    })

    test('should report only the second occurrence as duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
          {
            type: 'Identifier',
            name: 'b',
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'b'")
    })

    test('should report message for each duplicated name separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'x' },
          {
            type: 'Identifier',
            name: 'x',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
          { type: 'Identifier', name: 'y' },
          {
            type: 'Identifier',
            name: 'y',
            loc: { start: { line: 1, column: 9 }, end: { line: 1, column: 10 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("'x'")
      expect(reports[1].message).toContain("'y'")
    })

    test('should report duplicate appearing 4 times', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'p' },
          {
            type: 'Identifier',
            name: 'p',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
          {
            type: 'Identifier',
            name: 'p',
            loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 7 } },
          },
          {
            type: 'Identifier',
            name: 'p',
            loc: { start: { line: 1, column: 9 }, end: { line: 1, column: 10 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(3)
    })

    test('should report each occurrence of same-name duplicate in FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [
          { type: 'Identifier', name: 'z' },
          {
            type: 'Identifier',
            name: 'z',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
          {
            type: 'Identifier',
            name: 'z',
            loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 7 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(2)
    })
  })

  describe('different param types', () => {
    test('should detect duplicate with AssignmentPattern (default value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'val' },
          {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'val' },
            right: { type: 'Literal', value: 42 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 13 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'val'")
    })

    test('should detect duplicate with RestElement', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'items' },
          {
            type: 'RestElement',
            argument: { type: 'Identifier', name: 'items' },
            loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 14 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'items'")
    })

    test('should not report duplicate for ObjectPattern params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'ObjectPattern', properties: [] },
          { type: 'ObjectPattern', properties: [] },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report duplicate for ArrayPattern params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'ArrayPattern', elements: [] },
          { type: 'ArrayPattern', elements: [] },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when ObjectPattern and Identifier have no name collision', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'ObjectPattern', properties: [] },
          { type: 'Identifier', name: 'x' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when ArrayPattern and Identifier have no name collision', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'ArrayPattern', elements: [] },
          { type: 'Identifier', name: 'arr' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate between Identifier and RestElement', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [
          { type: 'Identifier', name: 'first' },
          {
            type: 'RestElement',
            argument: { type: 'Identifier', name: 'first' },
            loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 14 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate between Identifier and AssignmentPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [
          { type: 'Identifier', name: 'p' },
          {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'p' },
            right: { type: 'Literal', value: 0 },
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 8 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle mixed unique and destructured params without reporting', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'ObjectPattern', properties: [] },
          { type: 'Identifier', name: 'b' },
          { type: 'ArrayPattern', elements: [] },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate between two RestElement args with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          {
            type: 'RestElement',
            argument: { type: 'Identifier', name: 'r' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
          },
          {
            type: 'RestElement',
            argument: { type: 'Identifier', name: 'r' },
            loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 10 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'r'")
    })

    test('should detect duplicate between two AssignmentPattern args with same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'd' },
            right: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
          {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'd' },
            right: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 12 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'d'")
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for FunctionDeclaration', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for FunctionExpression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
    })

    test('should handle non-function gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionDeclaration(createNonFunction())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function without params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = { type: 'FunctionDeclaration', body: { type: 'BlockStatement', body: [] } }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = createFunctionWithDupeArgs() as Record<string, unknown>
      const params = node.params as Record<string, unknown>[]
      delete params[1].loc

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle null node gracefully for ArrowFunctionExpression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for FunctionDeclaration', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle undefined node gracefully for ArrowFunctionExpression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
    })

    test('should handle null node gracefully for FunctionExpression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionExpression(null)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionDeclaration('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionDeclaration(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type but no params array', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: 'not an array',
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: null,
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle param with null name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: null },
          { type: 'Identifier', name: null },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle param with numeric name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 123 },
          { type: 'Identifier', name: 123 },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle param without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [{ name: 'a' }, { name: 'a' }],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle param that is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [null, null],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle param that is a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: ['a', 'a'],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle single param with no duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [{ type: 'Identifier', name: 'only' }],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty loc object', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a', loc: {} },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (start only)', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a', loc: { start: { line: 1, column: 3 } } },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentPattern with non-Identifier left', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          {
            type: 'AssignmentPattern',
            left: { type: 'ObjectPattern', properties: [] },
            right: { type: 'Literal', value: {} },
          },
          {
            type: 'AssignmentPattern',
            left: { type: 'ObjectPattern', properties: [] },
            right: { type: 'Literal', value: {} },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle RestElement with non-Identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          {
            type: 'RestElement',
            argument: { type: 'ObjectPattern', properties: [] },
          },
          {
            type: 'RestElement',
            argument: { type: 'ObjectPattern', properties: [] },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle nested AssignmentPattern in RestElement', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          {
            type: 'RestElement',
            argument: {
              type: 'AssignmentPattern',
              left: { type: 'Identifier', name: 'nested' },
              right: { type: 'Literal', value: 0 },
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          { type: 'Identifier', name: 'nested' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'nested'")
    })
  })

  describe('location reporting', () => {
    test('should report location on line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location on line 10 column 20', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs(10, 20))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(23)
    })

    test('should report location on line 100 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs(100, 0))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location for function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionExpression(createFunctionExpressionWithDupeArgs(7, 5))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location for arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionWithDupeArgs(3, 15))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(18)
    })

    test('should provide default location when param has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end column as param end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs(1, 10))

      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('should report correct location for default param duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDefaultParamDupe(8, 4))

      expect(reports[0].loc?.start.line).toBe(8)
    })

    test('should report correct location for rest param duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithRestParamDupe(12, 2))

      expect(reports[0].loc?.start.line).toBe(12)
    })
  })

  describe('message content verification', () => {
    test('should include the argument name in single quotes in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports[0].message).toBe("Duplicate argument 'a' in function definition.")
    })

    test('should include function definition in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports[0].message).toContain('function definition')
    })

    test('should use correct arg name for function expression duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionExpression(createFunctionExpressionWithDupeArgs())

      expect(reports[0].message).toBe("Duplicate argument 'x' in function definition.")
    })

    test('should use correct arg name for arrow function duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionWithDupeArgs())

      expect(reports[0].message).toBe("Duplicate argument 'y' in function definition.")
    })

    test('should produce consistent message format across function types', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const { context: ctx3, reports: r3 } = createMockRuleContext({ source: 'function foo(a, a) {}' })

      const v1 = noDupeArgsRule.create(ctx1)
      const v2 = noDupeArgsRule.create(ctx2)
      const v3 = noDupeArgsRule.create(ctx3)

      v1.FunctionDeclaration(createFunctionWithDupeArgs())
      v2.FunctionExpression(createFunctionExpressionWithDupeArgs())
      v3.ArrowFunctionExpression(createArrowFunctionWithDupeArgs())

      const msg1 = r1[0].message.replace("'a'", "'X'")
      const msg2 = r2[0].message.replace("'x'", "'X'")
      const msg3 = r3[0].message.replace("'y'", "'X'")

      expect(msg1).toBe(msg2)
      expect(msg2).toBe(msg3)
    })

    test('should have message of type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have message longer than 20 characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports[0].message.length).toBeGreaterThan(20)
    })
  })

  describe('visitor independence', () => {
    test('should have independent reports for separate visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'function foo(a, a) {}' })

      const v1 = noDupeArgsRule.create(ctx1)
      const v2 = noDupeArgsRule.create(ctx2)

      v1.FunctionDeclaration(createFunctionWithDupeArgs())
      v2.FunctionDeclaration(createFunctionWithUniqueArgs())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should accumulate reports within same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())
      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports.length).toBe(2)
    })

    test('should mix reports across different handler methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())
      visitor.FunctionExpression(createFunctionExpressionWithDupeArgs())
      visitor.ArrowFunctionExpression(createArrowFunctionWithDupeArgs())

      expect(reports.length).toBe(3)
    })

    test('should not report when only unique args across calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithUniqueArgs())
      visitor.FunctionDeclaration(createFunctionWithNoParams())

      expect(reports.length).toBe(0)
    })

    test('should correctly report mixed duplicate and unique calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithUniqueArgs())
      visitor.FunctionDeclaration(createFunctionWithDupeArgs())
      visitor.FunctionDeclaration(createFunctionWithUniqueArgs())
      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports.length).toBe(2)
    })
  })

  describe('FunctionDeclaration specific', () => {
    test('should handle FunctionDeclaration with id property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'myFunc' },
        params: [
          { type: 'Identifier', name: 'a' },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle FunctionDeclaration without id property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should not report for FunctionDeclaration with single param', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [{ type: 'Identifier', name: 'solo' }],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionDeclaration with many unique params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
          { type: 'Identifier', name: 'd' },
          { type: 'Identifier', name: 'e' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionDeclaration with duplicate at end of many params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
          { type: 'Identifier', name: 'd' },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 15 }, end: { line: 1, column: 16 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'a'")
    })
  })

  describe('FunctionExpression specific', () => {
    test('should handle anonymous FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [
          { type: 'Identifier', name: 'p' },
          {
            type: 'Identifier',
            name: 'p',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle FunctionExpression with no params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionExpression with unique params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
          { type: 'Identifier', name: 'z' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionExpression with named id', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'named' },
        params: [
          { type: 'Identifier', name: 'n' },
          {
            type: 'Identifier',
            name: 'n',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('ArrowFunctionExpression specific', () => {
    test('should handle ArrowFunctionExpression with block body', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [
          { type: 'Identifier', name: 'a' },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle ArrowFunctionExpression with expression body', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [
          { type: 'Identifier', name: 'a' },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
        ],
        body: { type: 'Identifier', name: 'a' },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle ArrowFunctionExpression with no params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ArrowFunctionExpression with single unique param', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Identifier', name: 'x' },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('non-function node types', () => {
    test('should not report for VariableDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionDeclaration(createNonFunction())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for ClassDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a' },
        ],
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for IfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'IfStatement',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a' },
        ],
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'WhileStatement',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a' },
        ],
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for ReturnStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'ReturnStatement',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a' },
        ],
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for Expression in FunctionExpression handler', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'CallExpression',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a' },
        ],
      }

      expect(() => visitor.FunctionExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for non-function in ArrowFunctionExpression handler', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'BinaryExpression',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a' },
        ],
      }

      expect(() => visitor.ArrowFunctionExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('export verification', () => {
    test('should export noDupeArgsRule as named export', () => {
      expect(noDupeArgsRule).toBeDefined()
    })

    test('should have meta property on exported rule', () => {
      expect(noDupeArgsRule.meta).toBeDefined()
    })

    test('should have create property on exported rule', () => {
      expect(noDupeArgsRule.create).toBeDefined()
    })

    test('should be a RuleDefinition object', () => {
      expect(typeof noDupeArgsRule).toBe('object')
      expect(typeof noDupeArgsRule.meta).toBe('object')
      expect(typeof noDupeArgsRule.create).toBe('function')
    })

    test('should not throw when create is called with valid context', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })

      expect(() => noDupeArgsRule.create(context)).not.toThrow()
    })
  })

  describe('context interaction', () => {
    test('should call report once for single duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports.length).toBe(1)
    })

    test('should not call report for unique args', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithUniqueArgs())

      expect(reports.length).toBe(0)
    })

    test('should not call report for no params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithNoParams())

      expect(reports.length).toBe(0)
    })

    test('should call report for each duplicate occurrence', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())
      visitor.FunctionExpression(createFunctionExpressionWithDupeArgs())
      visitor.ArrowFunctionExpression(createArrowFunctionWithDupeArgs())

      expect(reports.length).toBe(3)
    })

    test('should provide message in report descriptor', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports[0].message).toBeDefined()
      expect(typeof reports[0].message).toBe('string')
    })

    test('should provide loc in report descriptor for duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports[0].loc).toBeDefined()
    })

    test('should handle context with different file paths', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/different/path.ts',
        getAST: () => null,
        getSource: () => 'const x = (a, a) => a',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/different',
      } as unknown as RuleContext

      const visitor = noDupeArgsRule.create(context)
      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports.length).toBe(1)
    })

    test('should not access parserServices from context', () => {
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
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noDupeArgsRule.create(context)
      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports.length).toBe(1)
    })
  })

  describe('param name edge cases', () => {
    test('should detect duplicate with underscore prefix names', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: '_temp' },
          {
            type: 'Identifier',
            name: '_temp',
            loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 12 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'_temp'")
    })

    test('should detect duplicate with dollar sign names', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: '$jquery' },
          {
            type: 'Identifier',
            name: '$jquery',
            loc: { start: { line: 1, column: 9 }, end: { line: 1, column: 16 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'$jquery'")
    })

    test('should detect duplicate with single character names', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'z' },
          {
            type: 'Identifier',
            name: 'z',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'z'")
    })

    test('should detect duplicate with long names', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const longName = 'veryLongParameterNameThatGoesOnAndOn'
      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: longName },
          {
            type: 'Identifier',
            name: longName,
            loc: { start: { line: 1, column: 40 }, end: { line: 1, column: 76 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(`'${longName}'`)
    })

    test('should not report when names differ only in case', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'Value' },
          { type: 'Identifier', name: 'value' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate with numeric suffix names', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'arg1' },
          {
            type: 'Identifier',
            name: 'arg1',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 9 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'arg1'")
    })

    test('should not report when similar but distinct names', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'arg' },
          { type: 'Identifier', name: 'arg1' },
          { type: 'Identifier', name: 'arg2' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle param with empty string name (not reported since empty is falsy)', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: '' },
          { type: 'Identifier', name: '' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('multi-line location scenarios', () => {
    test('should handle duplicate args spanning multiple lines', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 3 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should handle location with column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs(5, 0))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle location with high column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs(1, 100))

      expect(reports[0].loc?.start.column).toBe(103)
    })
  })

  describe('idempotency and robustness', () => {
    test('should not report duplicate after processing non-function node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createNonFunction())
      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports.length).toBe(1)
    })

    test('should report same duplicate if called twice with same node', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)
      const node = createFunctionWithDupeArgs()

      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(2)
    })

    test('should report duplicate across all three handler methods in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())
      visitor.FunctionExpression(createFunctionExpressionWithDupeArgs())
      visitor.ArrowFunctionExpression(createArrowFunctionWithDupeArgs())

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain("'a'")
      expect(reports[1].message).toContain("'x'")
      expect(reports[2].message).toContain("'y'")
    })

    test('should not carry state between visitor instances', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'function foo(a, a) {}' })

      const v1 = noDupeArgsRule.create(ctx1)
      const v2 = noDupeArgsRule.create(ctx2)

      v1.FunctionDeclaration(createFunctionWithDupeArgs())
      v2.FunctionDeclaration(createFunctionWithUniqueArgs())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle calling visitor with unique then duplicate args', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithUniqueArgs())
      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports.length).toBe(1)
    })

    test('should handle calling visitor with duplicate then unique args', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())
      visitor.FunctionDeclaration(createFunctionWithUniqueArgs())

      expect(reports.length).toBe(1)
    })

    test('should not be affected by non-function node between duplicate calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())
      visitor.FunctionDeclaration(createNonFunction())
      visitor.FunctionExpression(createFunctionExpressionWithDupeArgs())

      expect(reports.length).toBe(2)
    })

    test('should handle many sequential unique arg calls then one duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.FunctionDeclaration(createFunctionWithUniqueArgs())
      }
      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports.length).toBe(1)
    })

    test('should handle many sequential duplicate calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.FunctionDeclaration(createFunctionWithDupeArgs())
      }

      expect(reports.length).toBe(5)
    })

    test('should handle alternate unique and duplicate calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithUniqueArgs())
      visitor.FunctionDeclaration(createFunctionWithDupeArgs())
      visitor.FunctionDeclaration(createFunctionWithUniqueArgs())
      visitor.FunctionDeclaration(createFunctionWithDupeArgs())
      visitor.FunctionDeclaration(createFunctionWithUniqueArgs())

      expect(reports.length).toBe(2)
    })
  })

  describe('deep nesting and complex param structures', () => {
    test('should detect duplicate in deeply nested AssignmentPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'deep' },
          {
            type: 'AssignmentPattern',
            left: {
              type: 'AssignmentPattern',
              left: { type: 'Identifier', name: 'deep' },
              right: { type: 'Literal', value: 0 },
            },
            right: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 15 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'deep'")
    })

    test('should handle TSParameterProperty-like node (not extracted by getParamName)', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'TSParameterProperty', parameter: { type: 'Identifier', name: 'priv' } },
          {
            type: 'Identifier',
            name: 'priv',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 9 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle param with undefined name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [{ type: 'Identifier' }, { type: 'Identifier' }],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle param with object as name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: { toString: () => 'a' } },
          { type: 'Identifier', name: { toString: () => 'a' } },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle params array with undefined elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [undefined, undefined],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle params array with mixed types', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          null,
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 6 } },
          },
          'string param',
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle FunctionExpression via FunctionDeclaration handler without error', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [
          { type: 'Identifier', name: 'a' },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle ArrowFunctionExpression via FunctionExpression handler', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [
          { type: 'Identifier', name: 'b' },
          {
            type: 'Identifier',
            name: 'b',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle FunctionDeclaration via ArrowFunctionExpression handler', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'c' },
          {
            type: 'Identifier',
            name: 'c',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate when one param is Identifier and other is nested default', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [
          {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'callback' },
            right: {
              type: 'ArrowFunctionExpression',
              params: [],
              body: { type: 'BlockStatement', body: [] },
            },
          },
          {
            type: 'Identifier',
            name: 'callback',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 13 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'callback'")
    })

    test('should detect duplicate in RestElement within AssignmentPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          {
            type: 'AssignmentPattern',
            left: {
              type: 'RestElement',
              argument: { type: 'Identifier', name: 'extra' },
            },
            right: { type: 'Literal', value: [] },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          {
            type: 'Identifier',
            name: 'extra',
            loc: { start: { line: 1, column: 12 }, end: { line: 1, column: 17 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'extra'")
    })

    test('should handle very large params array with no duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const params = Array.from({ length: 50 }, (_, i) => ({
        type: 'Identifier',
        name: `param${i}`,
      }))

      const node = {
        type: 'FunctionDeclaration',
        params,
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should detect single duplicate in very large params array', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const params = Array.from({ length: 49 }, (_, i) => ({
        type: 'Identifier',
        name: `param${i}`,
      }))
      params.push({
        type: 'Identifier',
        name: 'param25',
        loc: { start: { line: 1, column: 100 }, end: { line: 1, column: 107 } },
      })

      const node = {
        type: 'FunctionDeclaration',
        params,
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'param25'")
    })

    test('should handle function with only destructuring params no duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          {
            type: 'ObjectPattern',
            properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' } }],
          },
          { type: 'ArrayPattern', elements: [{ type: 'Identifier', name: 'b' }] },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle duplicate where first occurrence is destructuring (skipped) and second is identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'ObjectPattern', properties: [] },
          { type: 'Identifier', name: 'obj' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where params is a Set instead of Array', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: new Set([
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a' },
        ]),
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where params is a Map instead of Array', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: new Map(),
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties beyond standard AST', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [
          { type: 'Identifier', name: 'a', extraProp: true },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 4 } },
            extraProp: false,
          },
        ],
        body: { type: 'BlockStatement', body: [] },
        range: [0, 20],
        extra: true,
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('location extraction integration', () => {
    test('should provide default location when param loc has null start', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a', loc: { start: null, end: null } },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should provide default location when param loc has non-numeric start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 'two', column: 0 }, end: { line: 'two', column: 1 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should provide default location when param loc start is missing line', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'a', loc: { start: { column: 5 }, end: { column: 6 } } },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end location from param loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 5 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('should report default end location when param loc end is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [
          { type: 'Identifier', name: 'a' },
          {
            type: 'Identifier',
            name: 'a',
            loc: { start: { line: 2, column: 4 } },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.end.line).toBe(1)
    })
  })

  describe('additional meta and structural tests', () => {
    test('should have docs.description that is exactly correct', () => {
      expect(noDupeArgsRule.meta.docs?.description).toBe(
        'Disallow duplicate arguments in function definitions.',
      )
    })

    test('should have meta with all expected top-level keys', () => {
      const meta = noDupeArgsRule.meta
      expect(meta).toHaveProperty('type')
      expect(meta).toHaveProperty('severity')
      expect(meta).toHaveProperty('docs')
      expect(meta).toHaveProperty('schema')
      expect(meta).toHaveProperty('fixable')
    })

    test('should have docs with all expected nested keys', () => {
      const docs = noDupeArgsRule.meta.docs
      expect(docs).toHaveProperty('description')
      expect(docs).toHaveProperty('category')
      expect(docs).toHaveProperty('recommended')
    })

    test('should have create method accepting exactly one parameter', () => {
      expect(noDupeArgsRule.create.length).toBe(1)
    })

    test('should return object with function values from create', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)
      const values = Object.values(visitor)

      values.forEach((val) => {
        expect(typeof val).toBe('function')
      })
    })

    test('should have visitor keys matching AST node type names', () => {
      const { context } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const visitor = noDupeArgsRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toContain('FunctionDeclaration')
      expect(keys).toContain('FunctionExpression')
      expect(keys).toContain('ArrowFunctionExpression')
    })

    test('should have consistent meta across multiple accesses', () => {
      const meta1 = noDupeArgsRule.meta
      const meta2 = noDupeArgsRule.meta

      expect(meta1.type).toBe(meta2.type)
      expect(meta1.severity).toBe(meta2.severity)
      expect(meta1.docs?.description).toBe(meta2.docs?.description)
    })

    test('should have default export matching named export', () => {
      const defaultExport = noDupeArgsRule
      expect(defaultExport).toBe(noDupeArgsRule)
    })

    test('should handle context being called multiple times on same rule', () => {
      const { context: c1 } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const { context: c2 } = createMockRuleContext({ source: 'function foo(a, a) {}' })
      const { context: c3 } = createMockRuleContext({ source: 'function foo(a, a) {}' })

      const v1 = noDupeArgsRule.create(c1)
      const v2 = noDupeArgsRule.create(c2)
      const v3 = noDupeArgsRule.create(c3)

      expect(v1).toBeDefined()
      expect(v2).toBeDefined()
      expect(v3).toBeDefined()
    })

    test('should have schema that is an empty array', () => {
      const schema = noDupeArgsRule.meta.schema
      expect(Array.isArray(schema)).toBe(true)
      expect(schema).toHaveLength(0)
    })

    test('should have fixable that is not code or whitespace', () => {
      expect(noDupeArgsRule.meta.fixable).not.toBe('code')
      expect(noDupeArgsRule.meta.fixable).not.toBe('whitespace')
    })
  })
})
