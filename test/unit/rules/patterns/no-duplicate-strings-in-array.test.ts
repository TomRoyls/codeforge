import { describe, test, expect } from 'vitest'
import { noDuplicateStringsInArrayRule } from '../../../../src/rules/patterns/no-duplicate-strings-in-array.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createArrayWithDupeStrings(line = 1, column = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements: [
      { type: 'Literal', value: 'foo' },
      {
        type: 'Literal',
        value: 'foo',
        loc: { start: { line, column }, end: { line, column: column + 5 } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createArrayWithUniqueStrings(line = 1, column = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements: [
      { type: 'Literal', value: 'foo' },
      { type: 'Literal', value: 'bar' },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createEmptyArray(line = 1, column = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

function createNonArrayExpression(): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 2 },
    },
  }
}

function createTemplateElement(cooked: string): unknown {
  return {
    type: 'TemplateElement',
    value: { cooked, raw: cooked },
  }
}

describe('no-duplicate-strings-in-array rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noDuplicateStringsInArrayRule.meta.type).toBe('suggestion')
    })

    test('should have warning severity', () => {
      expect(noDuplicateStringsInArrayRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noDuplicateStringsInArrayRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDuplicateStringsInArrayRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention duplicate in description', () => {
      expect(noDuplicateStringsInArrayRule.meta.docs?.description.toLowerCase()).toContain('duplicate')
    })

    test('should have empty schema', () => {
      expect(noDuplicateStringsInArrayRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noDuplicateStringsInArrayRule.meta.fixable).toBeUndefined()
    })

    test('should have a description string', () => {
      expect(typeof noDuplicateStringsInArrayRule.meta.docs?.description).toBe('string')
    })

    test('should mention array in description', () => {
      expect(noDuplicateStringsInArrayRule.meta.docs?.description.toLowerCase()).toContain('array')
    })

    test('should have meta property defined', () => {
      expect(noDuplicateStringsInArrayRule.meta).toBeDefined()
    })

    test('should have docs property defined', () => {
      expect(noDuplicateStringsInArrayRule.meta.docs).toBeDefined()
    })

    test('should not be deprecated', () => {
      expect(noDuplicateStringsInArrayRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noDuplicateStringsInArrayRule.meta.replacedBy).toBeUndefined()
    })

    test('should have docs url', () => {
      expect(noDuplicateStringsInArrayRule.meta.docs?.url).toBeDefined()
    })

    test('should not require type checking', () => {
      expect(noDuplicateStringsInArrayRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have type as one of valid RuleType values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noDuplicateStringsInArrayRule.meta.type)
    })

    test('should have severity as one of valid Severity values', () => {
      expect(['off', 'warn', 'error']).toContain(noDuplicateStringsInArrayRule.meta.severity)
    })
  })

  describe('create', () => {
    test('should return visitor with ArrayExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(visitor).toHaveProperty('ArrayExpression')
    })

    test('should return a visitor object', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return ArrayExpression as a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(typeof visitor.ArrayExpression).toBe('function')
    })

    test('should return new visitor on each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noDuplicateStringsInArrayRule.create(context)
      const visitor2 = noDuplicateStringsInArrayRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context parameter', () => {
      const { context } = createMockRuleContext()
      expect(() => noDuplicateStringsInArrayRule.create(context)).not.toThrow()
    })

    test('should return visitor with exactly one key', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(1)
    })

    test('should return visitor with only ArrayExpression key', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(Object.keys(visitor)).toEqual(['ArrayExpression'])
    })
  })

  describe('detecting duplicate strings', () => {
    test('should report array with duplicate string literals', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Duplicate string')
      expect(reports[0].message).toContain("'foo'")
    })

    test('should not report array with unique strings', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithUniqueStrings())

      expect(reports.length).toBe(0)
    })

    test('should not report empty array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createEmptyArray())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report same string appearing three times as two reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'x' },
          {
            type: 'Literal',
            value: 'x',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 8 } },
          },
          {
            type: 'Literal',
            value: 'x',
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 13 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("'x'")
      expect(reports[1].message).toContain("'x'")
    })

    test('should report multiple different duplicate pairs', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'a' },
          {
            type: 'Literal',
            value: 'a',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 8 } },
          },
          { type: 'Literal', value: 'b' },
          {
            type: 'Literal',
            value: 'b',
            loc: { start: { line: 1, column: 15 }, end: { line: 1, column: 18 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("'a'")
      expect(reports[1].message).toContain("'b'")
    })

    test('should not report when all strings are unique in larger array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 'b' },
          { type: 'Literal', value: 'c' },
          { type: 'Literal', value: 'd' },
          { type: 'Literal', value: 'e' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report duplicate string with spaces', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'hello world' },
          {
            type: 'Literal',
            value: 'hello world',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 18 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hello world')
    })

    test('should not report when strings differ by case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'Foo' },
          { type: 'Literal', value: 'foo' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate in first and last position', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'alpha' },
          { type: 'Literal', value: 'beta' },
          { type: 'Literal', value: 'gamma' },
          {
            type: 'Literal',
            value: 'alpha',
            loc: { start: { line: 1, column: 30 }, end: { line: 1, column: 37 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('alpha')
    })

    test('should report each duplicate after the first occurrence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'k' },
          {
            type: 'Literal',
            value: 'k',
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 3 } },
          },
          {
            type: 'Literal',
            value: 'k',
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 3 } },
          },
          {
            type: 'Literal',
            value: 'k',
            loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 3 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(3)
    })

    test('should detect duplicate with single-character string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'a' },
          {
            type: 'Literal',
            value: 'a',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 8 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'a'")
    })

    test('should detect duplicate empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: '' },
          {
            type: 'Literal',
            value: '',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 7 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate strings with emoji', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: '🔑' },
          {
            type: 'Literal',
            value: '🔑',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 7 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with camelCase strings', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'myStringValue' },
          {
            type: 'Literal',
            value: 'myStringValue',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 18 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myStringValue')
    })

    test('should detect duplicate in array with many elements where only two match', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 'b' },
          { type: 'Literal', value: 'c' },
          { type: 'Literal', value: 'd' },
          { type: 'Literal', value: 'e' },
          {
            type: 'Literal',
            value: 'c',
            loc: { start: { line: 1, column: 30 }, end: { line: 1, column: 33 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'c'")
    })

    test('should not report when string values differ even with same length', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'abc' },
          { type: 'Literal', value: 'def' },
          { type: 'Literal', value: 'ghi' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle duplicate keys across separate ArrayExpression calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings())
      visitor.ArrayExpression(createArrayWithDupeStrings())

      expect(reports.length).toBe(2)
    })

    test('should not carry state between separate ArrayExpression calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings())
      visitor.ArrayExpression(createArrayWithUniqueStrings())

      expect(reports.length).toBe(1)
    })

    test('should report duplicate multiline string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'line1\nline2' },
          {
            type: 'Literal',
            value: 'line1\nline2',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report duplicate string with underscores', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'my_key' },
          {
            type: 'Literal',
            value: 'my_key',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 12 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('my_key')
    })

    test('should report duplicate string with dollar sign', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: '$jquery' },
          {
            type: 'Literal',
            value: '$jquery',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 13 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$jquery')
    })

    test('should report duplicate strings at different lines', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'Literal',
            value: 'name',
            loc: { start: { line: 1, column: 2 }, end: { line: 1, column: 8 } },
          },
          {
            type: 'Literal',
            value: 'name',
            loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 8 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 4, column: 1 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should handle array with single element without reporting', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 'only' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report duplicate in first-and-last-position with only two elements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'z' },
          {
            type: 'Literal',
            value: 'z',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 8 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('mixed types', () => {
    test('should ignore non-string elements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'foo' },
          { type: 'Literal', value: 42 },
          { type: 'Literal', value: true },
          { type: 'Literal', value: null },
          { type: 'Identifier', name: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report duplicate strings alongside non-string elements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'foo' },
          { type: 'Literal', value: 42 },
          {
            type: 'Literal',
            value: 'foo',
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'foo'")
    })

    test('should not report duplicate numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 42 },
          { type: 'Literal', value: 42 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report duplicate booleans', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: true },
          { type: 'Literal', value: true },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report duplicate nulls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: null },
          { type: 'Literal', value: null },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report duplicate identifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Identifier', name: 'foo' },
          { type: 'Identifier', name: 'foo' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report objects in array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const obj = { type: 'ObjectExpression', properties: [] }
      const node = {
        type: 'ArrayExpression',
        elements: [obj, obj],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('template literals', () => {
    test('should report duplicate simple template literals without expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'TemplateLiteral',
            quasis: [createTemplateElement('hello')],
            expressions: [],
          },
          {
            type: 'TemplateLiteral',
            quasis: [createTemplateElement('hello')],
            expressions: [],
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 18 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'hello'")
    })

    test('should not report template literals with different values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'TemplateLiteral',
            quasis: [createTemplateElement('hello')],
            expressions: [],
          },
          {
            type: 'TemplateLiteral',
            quasis: [createTemplateElement('world')],
            expressions: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literals with expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'TemplateLiteral',
            quasis: [createTemplateElement('hello '), createTemplateElement('')],
            expressions: [{ type: 'Identifier', name: 'name' }],
          },
          {
            type: 'TemplateLiteral',
            quasis: [createTemplateElement('hello '), createTemplateElement('')],
            expressions: [{ type: 'Identifier', name: 'name' }],
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate between literal and template literal with same value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'foo' },
          {
            type: 'TemplateLiteral',
            quasis: [createTemplateElement('foo')],
            expressions: [],
            loc: { start: { line: 1, column: 8 }, end: { line: 1, column: 14 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'foo'")
    })

    test('should report duplicate empty template literals', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'TemplateLiteral',
            quasis: [createTemplateElement('')],
            expressions: [],
          },
          {
            type: 'TemplateLiteral',
            quasis: [createTemplateElement('')],
            expressions: [],
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 8 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('nested arrays', () => {
    test('should check each array independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const innerArray = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'dup' },
          {
            type: 'Literal',
            value: 'dup',
            loc: { start: { line: 2, column: 5 }, end: { line: 2, column: 10 } },
          },
        ],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      }

      const outerArray = {
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 'a' }, innerArray],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ArrayExpression(outerArray)
      visitor.ArrayExpression(innerArray)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'dup'")
    })

    test('should not report when outer array has unique strings and inner has duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const innerArray = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'dup' },
          {
            type: 'Literal',
            value: 'dup',
            loc: { start: { line: 2, column: 5 }, end: { line: 2, column: 10 } },
          },
        ],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      }

      const outerArray = {
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 'a' }, innerArray],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ArrayExpression(outerArray)

      expect(reports.length).toBe(0)
    })

    test('should report duplicates in outer array when inner array is a separate element', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const innerArray = {
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 'x' }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      }

      const outerArray = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'a' },
          innerArray,
          {
            type: 'Literal',
            value: 'a',
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 3 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 4, column: 1 } },
      }

      visitor.ArrayExpression(outerArray)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'a'")
    })
  })

  describe('message content', () => {
    test('should include string value in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings())

      expect(reports[0].message).toContain("'foo'")
    })

    test('should include "Duplicate string" in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings())

      expect(reports[0].message).toContain('Duplicate string')
    })

    test('should include "array" in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings())

      expect(reports[0].message.toLowerCase()).toContain('array')
    })

    test('should format message with string wrapped in single quotes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings())

      expect(reports[0].message).toMatch(/'foo'/)
    })

    test('should end message with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings())

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should produce consistent message format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings())

      expect(reports[0].message).toBe("Duplicate string 'foo' in array. Remove the duplicate string or refactor the array.")
    })

    test('should include suggestion text in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings())

      expect(reports[0].message.toLowerCase()).toContain('remove')
    })
  })

  describe('location reporting', () => {
    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at higher line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings(100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location from element', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      visitor.ArrayExpression(createArrayWithDupeStrings(5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report location of duplicate element not original', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'Literal',
            value: 'a',
            loc: { start: { line: 1, column: 2 }, end: { line: 1, column: 5 } },
          },
          {
            type: 'Literal',
            value: 'a',
            loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ArrayExpression(node)

      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should use default location when element has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 'a' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with multi-line span', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'a' },
          {
            type: 'Literal',
            value: 'a',
            loc: { start: { line: 5, column: 2 }, end: { line: 7, column: 3 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 8, column: 1 } },
      }

      visitor.ArrayExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'a' },
          {
            type: 'Literal',
            value: 'a',
            loc: { start: { line: 10, column: 0 }, end: { line: 10, column: 3 } },
          },
        ],
        loc: { start: { line: 9, column: 0 }, end: { line: 11, column: 1 } },
      }

      visitor.ArrayExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'a' },
          {
            type: 'Literal',
            value: 'a',
            loc: { start: { line: 1, column: 200 }, end: { line: 1, column: 203 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 210 } },
      }

      visitor.ArrayExpression(node)

      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('should report correct location for second duplicate pair in multi-dupe array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'a' },
          {
            type: 'Literal',
            value: 'a',
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 3 } },
          },
          { type: 'Literal', value: 'b' },
          {
            type: 'Literal',
            value: 'b',
            loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 3 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ArrayExpression(node)

      expect(reports[1].loc?.start.line).toBe(4)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(() => visitor.ArrayExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(() => visitor.ArrayExpression(undefined)).not.toThrow()
    })

    test('should handle non-ArrayExpression gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(() => visitor.ArrayExpression(createNonArrayExpression())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without elements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = { type: 'ArrayExpression' }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = createArrayWithDupeStrings() as Record<string, unknown>
      delete node.loc
      const elements = node.elements as unknown[]
      delete (elements[1] as Record<string, unknown>).loc

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node that is a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(() => visitor.ArrayExpression('not an object')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(() => visitor.ArrayExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is a boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(() => visitor.ArrayExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is an empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      expect(() => visitor.ArrayExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null elements array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = { type: 'ArrayExpression', elements: null }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined elements array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = { type: 'ArrayExpression', elements: undefined }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle elements containing null entries', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [null, null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle elements containing undefined entries', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [undefined, undefined],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle elements with numeric literal value that is a string type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: '42' },
          {
            type: 'Literal',
            value: '42',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 9 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'42'")
    })

    test('should not flag number 42 vs string "42"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 42 },
          { type: 'Literal', value: '42' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle TemplateLiteral with no quasis', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          { type: 'TemplateLiteral', quasis: [], expressions: [] },
          { type: 'TemplateLiteral', quasis: [], expressions: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle TemplateElement with non-string cooked value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateStringsInArrayRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { cooked: 123 } }],
            expressions: [],
          },
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { cooked: 123 } }],
            expressions: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
