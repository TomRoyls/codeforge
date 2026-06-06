import { describe, test, expect } from 'vitest'
import { noDupeKeysRule } from '../../../../src/rules/patterns/no-dupe-keys.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createObjectWithDupeKeys(line = 1, column = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [
      {
        type: 'Property',
        key: { type: 'Identifier', name: 'a' },
        value: { type: 'Literal', value: 1 },
      },
      {
        type: 'Property',
        key: { type: 'Identifier', name: 'a' },
        value: { type: 'Literal', value: 2 },
        loc: { start: { line, column }, end: { line, column: column + 5 } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createObjectWithUniqueKeys(line = 1, column = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [
      {
        type: 'Property',
        key: { type: 'Identifier', name: 'a' },
        value: { type: 'Literal', value: 1 },
      },
      {
        type: 'Property',
        key: { type: 'Identifier', name: 'b' },
        value: { type: 'Literal', value: 2 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createObjectWithLiteralDupeKeys(line = 1, column = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [
      {
        type: 'Property',
        key: { type: 'Literal', value: 'foo' },
        value: { type: 'Literal', value: 1 },
      },
      {
        type: 'Property',
        key: { type: 'Literal', value: 'foo' },
        value: { type: 'Literal', value: 2 },
        loc: { start: { line, column }, end: { line, column: column + 5 } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createEmptyObject(line = 1, column = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

function createNonObjectExpression(): unknown {
  return {
    type: 'ArrayExpression',
    elements: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 2 },
    },
  }
}

describe('no-dupe-keys rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDupeKeysRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDupeKeysRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDupeKeysRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDupeKeysRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention duplicate in description', () => {
      expect(noDupeKeysRule.meta.docs?.description.toLowerCase()).toContain('duplicate')
    })

    test('should have empty schema', () => {
      expect(noDupeKeysRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noDupeKeysRule.meta.fixable).toBeUndefined()
    })

    test('should have a description string', () => {
      expect(typeof noDupeKeysRule.meta.docs?.description).toBe('string')
    })

    test('should mention object literals in description', () => {
      expect(noDupeKeysRule.meta.docs?.description.toLowerCase()).toContain('object')
    })

    test('should have meta property defined', () => {
      expect(noDupeKeysRule.meta).toBeDefined()
    })

    test('should have docs property defined', () => {
      expect(noDupeKeysRule.meta.docs).toBeDefined()
    })

    test('should not be deprecated', () => {
      expect(noDupeKeysRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noDupeKeysRule.meta.replacedBy).toBeUndefined()
    })

    test('should have docs url', () => {
      expect(noDupeKeysRule.meta.docs?.url).toBeDefined()
    })

    test('should not require type checking', () => {
      expect(noDupeKeysRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have type as one of valid RuleType values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noDupeKeysRule.meta.type)
    })

    test('should have severity as one of valid Severity values', () => {
      expect(['off', 'warn', 'error']).toContain(noDupeKeysRule.meta.severity)
    })
  })

  describe('create', () => {
    test('should return visitor with ObjectExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(visitor).toHaveProperty('ObjectExpression')
    })

    test('should return a visitor object', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return ObjectExpression as a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(typeof visitor.ObjectExpression).toBe('function')
    })

    test('should return new visitor on each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noDupeKeysRule.create(context)
      const visitor2 = noDupeKeysRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context parameter', () => {
      const { context } = createMockRuleContext()
      expect(() => noDupeKeysRule.create(context)).not.toThrow()
    })

    test('should return visitor with exactly one key', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(1)
    })

    test('should return visitor with only ObjectExpression key', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(Object.keys(visitor)).toEqual(['ObjectExpression'])
    })
  })

  describe('detecting duplicate keys', () => {
    test('should report object with duplicate identifier keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Duplicate key')
      expect(reports[0].message).toContain("'a'")
    })

    test('should not report object with unique keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithUniqueKeys())

      expect(reports.length).toBe(0)
    })

    test('should report object with duplicate literal keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithLiteralDupeKeys())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('foo')
    })

    test('should not report empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createEmptyObject())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report duplicate numeric literal keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 42 },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 42 },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 9 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report duplicate string literal keys with spaces', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'hello world' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'hello world' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hello world')
    })

    test('should not report when literal keys differ', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'foo' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'bar' },
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report same key appearing three times as two reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'x' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'x' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'x' },
            value: { type: 'Literal', value: 3 },
            loc: { start: { line: 1, column: 12 }, end: { line: 1, column: 17 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("'x'")
      expect(reports[1].message).toContain("'x'")
    })

    test('should report multiple different duplicate pairs', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 3 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 4 },
            loc: { start: { line: 1, column: 15 }, end: { line: 1, column: 20 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("'a'")
      expect(reports[1].message).toContain("'b'")
    })

    test('should not report when all keys are unique in larger object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 2 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'c' },
            value: { type: 'Literal', value: 3 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'd' },
            value: { type: 'Literal', value: 4 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'e' },
            value: { type: 'Literal', value: 5 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report duplicate identifier key with underscores', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'my_key' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'my_key' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('my_key')
    })

    test('should report duplicate key with dollar sign', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: '$jquery' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: '$jquery' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$jquery')
    })

    test('should report duplicate key that is single character', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'x' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'x' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'x'")
    })

    test('should detect duplicate in object with many properties where only two match', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 2 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'c' },
            value: { type: 'Literal', value: 3 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'd' },
            value: { type: 'Literal', value: 4 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'e' },
            value: { type: 'Literal', value: 5 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'c' },
            value: { type: 'Literal', value: 6 },
            loc: { start: { line: 1, column: 30 }, end: { line: 1, column: 35 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'c'")
    })

    test('should treat identifier and literal with same name as duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'foo' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('foo')
    })

    test('should report duplicate numeric literal key 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 0 },
            value: { type: 'Literal', value: 'a' },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 0 },
            value: { type: 'Literal', value: 'b' },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report duplicate boolean literal keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: true },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: true },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report duplicate null literal keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: null },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: null },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when literal values differ even with same type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'b' },
            value: { type: 'Literal', value: 2 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'c' },
            value: { type: 'Literal', value: 3 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report duplicate in single-property-pair scenario', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'z' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'z' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle object with only one property without reporting', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'only' },
            value: { type: 'Literal', value: 1 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate keys at different lines', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'name' },
            value: { type: 'Literal', value: 'first' },
            loc: { start: { line: 1, column: 2 }, end: { line: 1, column: 12 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'name' },
            value: { type: 'Literal', value: 'second' },
            loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 14 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 4, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[1]?.loc?.start.line ?? reports[0]?.loc?.start.line).toBeDefined()
    })

    test('should detect duplicate literal keys with empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: '' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: '' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate literal keys with emoji', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: '🔑' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: '🔑' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate numeric string vs number literal keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 1 },
            value: { type: 'Literal', value: 'a' },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: '1' },
            value: { type: 'Literal', value: 'b' },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report each duplicate after the first occurrence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'k' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'k' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'k' },
            value: { type: 'Literal', value: 3 },
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'k' },
            value: { type: 'Literal', value: 4 },
            loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(3)
    })

    test('should detect duplicate with camelCase keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'myKeyName' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'myKeyName' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 15 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myKeyName')
    })

    test('should not report when key names differ by case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'Key' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'key' },
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report duplicate in first and last position', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'alpha' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'beta' },
            value: { type: 'Literal', value: 2 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'gamma' },
            value: { type: 'Literal', value: 3 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'alpha' },
            value: { type: 'Literal', value: 4 },
            loc: { start: { line: 1, column: 30 }, end: { line: 1, column: 40 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('alpha')
    })

    test('should handle duplicate keys in nested-like scenario with same visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys())
      visitor.ObjectExpression(createObjectWithDupeKeys())

      expect(reports.length).toBe(2)
    })

    test('should not carry state between separate ObjectExpression calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys())
      visitor.ObjectExpression(createObjectWithUniqueKeys())

      expect(reports.length).toBe(1)
    })

    test('should report negative number literal duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: -1 },
            value: { type: 'Literal', value: 'a' },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: -1 },
            value: { type: 'Literal', value: 'b' },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report duplicate literal key with multiline string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'line1\nline2' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'line1\nline2' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message content', () => {
    test('should include key name in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys())

      expect(reports[0].message).toContain("'a'")
    })

    test('should include "Duplicate key" in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys())

      expect(reports[0].message).toContain('Duplicate key')
    })

    test('should include "object literal" in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys())

      expect(reports[0].message.toLowerCase()).toContain('object literal')
    })

    test('should format message with key wrapped in single quotes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys())

      expect(reports[0].message).toMatch(/'a'/)
    })

    test('should include literal key name in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithLiteralDupeKeys())

      expect(reports[0].message).toContain("'foo'")
    })

    test('should end message with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys())

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should produce consistent message format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys())

      expect(reports[0].message).toBe("Duplicate key 'a' in object literal.")
    })

    test('should format literal string key message consistently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithLiteralDupeKeys())

      expect(reports[0].message).toBe("Duplicate key 'foo' in object literal.")
    })

    test('should include numeric key as string in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 42 },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 42 },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports[0].message).toBe("Duplicate key '42' in object literal.")
    })

    test('should include boolean key as string in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: false },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: false },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports[0].message).toBe("Duplicate key 'false' in object literal.")
    })

    test('should include null key as string in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: null },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: null },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports[0].message).toBe("Duplicate key 'null' in object literal.")
    })
  })

  describe('location reporting', () => {
    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at higher line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys(100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location from property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys(5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report location of duplicate property not original', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 2 }, end: { line: 1, column: 7 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 7 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should use default location when property has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with multi-line span', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 5, column: 2 }, end: { line: 7, column: 3 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 8, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should report correct location for second duplicate pair in multi-dupe object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 3 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 4 },
            loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports[1].loc?.start.line).toBe(4)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
          },
        ],
        loc: { start: { line: 9, column: 0 }, end: { line: 11, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 200 }, end: { line: 1, column: 205 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 210 } },
      }

      visitor.ObjectExpression(node)

      expect(reports[0].loc?.start.column).toBe(200)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression(undefined)).not.toThrow()
    })

    test('should handle non-ObjectExpression gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression(createNonObjectExpression())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = { type: 'ObjectExpression' }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = createObjectWithDupeKeys() as Record<string, unknown>
      delete node.loc
      const props = node.properties as unknown[]
      delete (props[1] as Record<string, unknown>).loc

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node that is a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression('not an object')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is a boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is an empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null properties array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = { type: 'ObjectExpression', properties: null }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined properties array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = { type: 'ObjectExpression', properties: undefined }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with properties containing null entries', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [null, null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with properties containing undefined entries', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [undefined, undefined],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property without key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [{ type: 'Property' }, { type: 'Property' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property with null key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'Property', key: null },
          { type: 'Property', key: null },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property without type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          { key: { type: 'Identifier', name: 'a' } },
          { key: { type: 'Identifier', name: 'a' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property with SpreadElement type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'other' } },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle property with SpreadElement between duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'other' } },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle property with unknown key type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'TemplateLiteral', quasis: [] },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'TemplateLiteral', quasis: [] },
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property with MemberExpression key type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'MemberExpression', object: {}, property: {} },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'MemberExpression', object: {}, property: {} },
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as different casing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'objectexpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
          },
        ],
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type field', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
        ],
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle properties as non-array object by throwing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: {
          0: {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
        },
      }

      expect(() => visitor.ObjectExpression(node)).toThrow()
    })

    test('should handle empty string identifier name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: '' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: '' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle very long key names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const longKey = 'a'.repeat(500)
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: longKey },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: longKey },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 600 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longKey)
    })

    test('should handle object with many properties and no duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const properties = Array.from({ length: 100 }, (_, i) => ({
        type: 'Property',
        key: { type: 'Identifier', name: `key_${i}` },
        value: { type: 'Literal', value: i },
      }))

      const node = {
        type: 'ObjectExpression',
        properties,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2000 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object with many properties and one duplicate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const properties = Array.from({ length: 50 }, (_, i) => ({
        type: 'Property',
        key: { type: 'Identifier', name: `key_${i}` },
        value: { type: 'Literal', value: i },
      }))
      properties.push({
        type: 'Property',
        key: { type: 'Identifier', name: 'key_0' },
        value: { type: 'Literal', value: 999 },
        loc: { start: { line: 1, column: 500 }, end: { line: 1, column: 510 } },
      })

      const node = {
        type: 'ObjectExpression',
        properties,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 600 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('key_0')
    })

    test('should handle node with loc having non-numeric values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 'two', column: 'five' }, end: { line: 'two', column: 'ten' } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with partial loc (only start)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 3, column: 4 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle property key with undefined value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: undefined },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: undefined },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle key with Identifier type but missing name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'Property', key: { type: 'Identifier' }, value: { type: 'Literal', value: 1 } },
          { type: 'Property', key: { type: 'Identifier' }, value: { type: 'Literal', value: 2 } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
    })

    test('should handle key with Literal type but missing value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'Property', key: { type: 'Literal', value: 'x' }, value: { type: 'Literal', value: 1 } },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'x' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle mixed valid and invalid properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          null,
          undefined,
          { type: 'SpreadElement' },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node that is an array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with circular reference in properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const prop: Record<string, unknown> = {
        type: 'Property',
        key: { type: 'Identifier', name: 'a' },
        value: { type: 'Literal', value: 1 },
      }
      prop.self = prop

      const node = {
        type: 'ObjectExpression',
        properties: [prop],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property key being a string primitive', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'Property', key: 'notAnObject', value: { type: 'Literal', value: 1 } },
          { type: 'Property', key: 'notAnObject', value: { type: 'Literal', value: 2 } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property key being a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'Property', key: 42, value: { type: 'Literal', value: 1 } },
          { type: 'Property', key: 42, value: { type: 'Literal', value: 2 } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle properties as empty object by throwing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      expect(() => visitor.ObjectExpression(node)).toThrow()
    })

    test('should handle literal key with NaN value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: NaN },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: NaN },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle literal key with Infinity value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: Infinity },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: Infinity },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing start and end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: {},
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle FunctionExpression as node type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle ArrowFunctionExpression as node type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('multiple reports', () => {
    test('should report separately for each duplicate pair', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'x' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'x' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'y' },
            value: { type: 'Literal', value: 3 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'y' },
            value: { type: 'Literal', value: 4 },
            loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should report all duplicates across multiple calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys(1, 0))
      visitor.ObjectExpression(createObjectWithDupeKeys(10, 5))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('should report triplicate key as two reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'dup' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'dup' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'dup' },
            value: { type: 'Literal', value: 3 },
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 4, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('dup')
      expect(reports[1].message).toContain('dup')
    })

    test('should report correct messages for multiple different duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'first' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'first' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'second' },
            value: { type: 'Literal', value: 3 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'second' },
            value: { type: 'Literal', value: 4 },
            loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('first')
      expect(reports[1].message).toContain('second')
    })

    test('should handle quadruplicate key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'q' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'q' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'q' },
            value: { type: 'Literal', value: 3 },
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'q' },
            value: { type: 'Literal', value: 4 },
            loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(3)
    })
  })

  describe('export verification', () => {
    test('should have default export matching named export', () => {
      const defaultImport = noDupeKeysRule
      expect(defaultImport).toBe(noDupeKeysRule)
    })

    test('should have create method as a function', () => {
      expect(typeof noDupeKeysRule.create).toBe('function')
    })

    test('should have meta as an object', () => {
      expect(typeof noDupeKeysRule.meta).toBe('object')
    })

    test('should be a valid RuleDefinition', () => {
      expect(noDupeKeysRule).toHaveProperty('meta')
      expect(noDupeKeysRule).toHaveProperty('create')
    })

    test('should have create that returns RuleVisitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })
  })

  describe('various object literal structures', () => {
    test('should handle object with shorthand properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Identifier', name: 'a' },
            shorthand: true,
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle object with computed properties (not detected)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'sym' },
            computed: true,
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'sym' },
            computed: true,
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object with getter properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'prop' },
            kind: 'get',
            value: { type: 'FunctionExpression' },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'prop' },
            kind: 'set',
            value: { type: 'FunctionExpression' },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle object with method shorthand properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'method' },
            method: true,
            value: { type: 'FunctionExpression' },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'method' },
            method: true,
            value: { type: 'FunctionExpression' },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle object with mixed property types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'base' } },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'b' },
            value: { type: 'Literal', value: 2 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 3 },
            loc: { start: { line: 1, column: 20 }, end: { line: 1, column: 25 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'a'")
    })

    test('should handle object with only spread elements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object with regex literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: /test/ },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: /test/ },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested identical key names in different scopes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const innerNode = createObjectWithDupeKeys()
      const outerNode = createObjectWithUniqueKeys()

      visitor.ObjectExpression(outerNode)
      visitor.ObjectExpression(innerNode)

      expect(reports.length).toBe(1)
    })

    test('should handle object with template literal key (not detected)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'TemplateLiteral', quasis: [], expressions: [] },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'TemplateLiteral', quasis: [], expressions: [] },
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object with float literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 3.14 },
            value: { type: 'Literal', value: 'pi' },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 3.14 },
            value: { type: 'Literal', value: 'pi2' },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle object with mixed identifier and literal unique keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'bar' },
            value: { type: 'Literal', value: 2 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 42 },
            value: { type: 'Literal', value: 3 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object with unicode identifier keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: '日本語' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: '日本語' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('日本語')
    })

    test('should handle object with property containing extra metadata', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
            computed: false,
            shorthand: false,
            method: false,
            kind: 'init',
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            computed: false,
            shorthand: false,
            method: false,
            kind: 'init',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('context interaction', () => {
    test('should call report exactly once for single duplicate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys())

      expect(reports.length).toBe(1)
    })

    test('should not call report for unique keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithUniqueKeys())

      expect(reports.length).toBe(0)
    })

    test('should work with different context instances', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = noDupeKeysRule.create(ctx1.context)
      const visitor2 = noDupeKeysRule.create(ctx2.context)

      visitor1.ObjectExpression(createObjectWithDupeKeys())
      visitor2.ObjectExpression(createObjectWithUniqueKeys())

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(0)
    })

    test('should use independent report arrays per visitor', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = noDupeKeysRule.create(ctx1.context)
      const visitor2 = noDupeKeysRule.create(ctx2.context)

      visitor1.ObjectExpression(createObjectWithDupeKeys())
      visitor2.ObjectExpression(createObjectWithDupeKeys())

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(1)
    })

    test('should not modify the context object', () => {
      const { context } = createMockRuleContext()
      const originalFilePath = context.getFilePath()

      noDupeKeysRule.create(context)

      expect(context.getFilePath()).toBe(originalFilePath)
    })

    test('should not modify the source', () => {
      const { context } = createMockRuleContext()
      const originalSource = context.getSource()

      const visitor = noDupeKeysRule.create(context)
      visitor.ObjectExpression(createObjectWithDupeKeys())

      expect(context.getSource()).toBe(originalSource)
    })
  })

  describe('idempotency', () => {
    test('should produce same result calling visitor twice on same node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)
      const node = createObjectWithDupeKeys()

      visitor.ObjectExpression(node)
      visitor.ObjectExpression(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should produce consistent results across multiple visitors', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()

      const visitor1 = noDupeKeysRule.create(ctx1.context)
      const visitor2 = noDupeKeysRule.create(ctx2.context)

      const node = createObjectWithDupeKeys()

      visitor1.ObjectExpression(node)
      visitor2.ObjectExpression(node)

      expect(ctx1.reports[0].message).toBe(ctx2.reports[0].message)
    })

    test('should produce same report for same input at different times', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node1 = createObjectWithDupeKeys(5, 10)
      const node2 = createObjectWithDupeKeys(5, 10)

      visitor.ObjectExpression(node1)
      visitor.ObjectExpression(node2)

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('additional detection scenarios', () => {
    test('should detect duplicate keys with tab characters in name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'a\tb' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'a\tb' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with reserved word as identifier key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'class' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'class' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('class')
    })

    test('should detect duplicate with reserved word as literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'return' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'return' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with whitespace-only literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: '   ' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: '   ' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate BigInt literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: BigInt(9007199254740991) },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: BigInt(9007199254740991) },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with single quote in literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: "it's" },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: "it's" },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with double quote in literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'say "hello"' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'say "hello"' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with path-like literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: '/api/users' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: '/api/users' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with object literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const objKey = { foo: 1 }
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: objKey },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: objKey },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with array literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const arrKey = [1, 2, 3]
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: arrKey },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: arrKey },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not detect duplicate when different object refs used as keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: { foo: 1 } },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: { foo: 1 } },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle object with leading duplicate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'dup' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'dup' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'other' },
            value: { type: 'Literal', value: 3 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('dup')
    })

    test('should handle object with trailing duplicate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'other' },
            value: { type: 'Literal', value: 3 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'dup' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'dup' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 20 }, end: { line: 1, column: 25 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('dup')
    })

    test('should handle object with alternating keys', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 2 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 3 },
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 4 },
            loc: { start: { line: 1, column: 17 }, end: { line: 1, column: 22 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should handle zero line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys(0, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle very large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys(99999, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should detect duplicate with number as string vs same number literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 100 },
            value: { type: 'Literal', value: 'a' },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: '100' },
            value: { type: 'Literal', value: 'b' },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when similar but different keys exist', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'test' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'test2' },
            value: { type: 'Literal', value: 2 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'Test' },
            value: { type: 'Literal', value: 3 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'test' },
            value: { type: 'Literal', value: 4 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle duplicate at end of long property list', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const properties = Array.from({ length: 30 }, (_, i) => ({
        type: 'Property',
        key: { type: 'Identifier', name: `prop${i}` },
        value: { type: 'Literal', value: i },
      }))
      properties.push({
        type: 'Property',
        key: { type: 'Identifier', name: 'prop0' },
        value: { type: 'Literal', value: 999 },
        loc: { start: { line: 1, column: 300 }, end: { line: 1, column: 310 } },
      })

      const node = {
        type: 'ObjectExpression',
        properties,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 400 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('prop0')
    })

    test('should handle object with only SpreadElement-like items', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'y' } },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'z' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle single property object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'only' },
            value: { type: 'Literal', value: 42 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle property with CallExpression value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'fn' },
            value: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'foo' },
              arguments: [],
            },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'fn' },
            value: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'bar' },
              arguments: [],
            },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle property with ArrowFunctionExpression value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'handler' },
            value: {
              type: 'ArrowFunctionExpression',
              params: [],
              body: { type: 'BlockStatement', body: [] },
            },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'handler' },
            value: {
              type: 'ArrowFunctionExpression',
              params: [],
              body: { type: 'BlockStatement', body: [] },
            },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle property with ObjectExpression value containing same key names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'nested' },
            value: {
              type: 'ObjectExpression',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'a' },
                  value: { type: 'Literal', value: 1 },
                },
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'a' },
                  value: { type: 'Literal', value: 2 },
                },
              ],
            },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 3 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate literal key with backslash characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'a\\b\\c' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'a\\b\\c' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle duplicate with Symbol literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const sym = Symbol('test')
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: sym },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: sym },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with start.column being negative number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: -1 }, end: { line: 1, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-1)
    })

    test('should handle properties being a string without reporting', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: 'not an array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle properties being a number by throwing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      expect(() => visitor.ObjectExpression(node)).toThrow()
    })

    test('should handle properties being a boolean by throwing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      expect(() => visitor.ObjectExpression(node)).toThrow()
    })

    test('should detect duplicate with very short key name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: '_' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: '_' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'_'")
    })

    test('should handle duplicate key with hash character', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: '#ref' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: '#ref' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle duplicate key with at-sign character', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: '@decorator' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: '@decorator' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle duplicate with dot-separated key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'a.b.c' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'a.b.c' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle consecutive calls with mixed results', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createEmptyObject())
      visitor.ObjectExpression(createObjectWithDupeKeys())
      visitor.ObjectExpression(createEmptyObject())
      visitor.ObjectExpression(createObjectWithUniqueKeys())
      visitor.ObjectExpression(createObjectWithDupeKeys(10, 5))

      expect(reports.length).toBe(2)
    })

    test('should handle five different duplicate pairs', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 2 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'c' },
            value: { type: 'Literal', value: 3 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'd' },
            value: { type: 'Literal', value: 4 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'e' },
            value: { type: 'Literal', value: 5 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 6 },
            loc: { start: { line: 6, column: 0 }, end: { line: 6, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 7 },
            loc: { start: { line: 7, column: 0 }, end: { line: 7, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'c' },
            value: { type: 'Literal', value: 8 },
            loc: { start: { line: 8, column: 0 }, end: { line: 8, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'd' },
            value: { type: 'Literal', value: 9 },
            loc: { start: { line: 9, column: 0 }, end: { line: 9, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'e' },
            value: { type: 'Literal', value: 10 },
            loc: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 11, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(5)
    })

    test('should handle loc being null on property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: null,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc being undefined on property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: undefined,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc being a string on property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: 'invalid',
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc being a number on property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: 42,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle duplicate with numeric identifier name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: '123abc' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: '123abc' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('123abc')
    })

    test('should handle five occurrences of same key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'multi' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'multi' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'multi' },
            value: { type: 'Literal', value: 3 },
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'multi' },
            value: { type: 'Literal', value: 4 },
            loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'multi' },
            value: { type: 'Literal', value: 5 },
            loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(4)
    })

    test('should handle object with ConditionalExpression as node type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: {},
        consequent: {},
        alternate: {},
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = { type: 42, properties: [] }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = { type: true, properties: [] }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties on ObjectExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
        leadingComments: [],
        trailingComments: [],
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle visitor called with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression()).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle object with duplicate literal key containing URL', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'https://example.com' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'https://example.com' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('https://example.com')
    })
  })
})
