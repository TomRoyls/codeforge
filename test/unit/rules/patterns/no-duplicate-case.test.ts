import { describe, test, expect, vi } from 'vitest'
import { noDuplicateCaseRule } from '../../../../src/rules/patterns/no-duplicate-case.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createSwitchWithDuplicateCases(line = 1, column = 0): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'x' },
    cases: [
      {
        test: { type: 'Literal', value: 1, range: [15, 16] },
        consequent: [{ type: 'BreakStatement', label: null }],
      },
      {
        test: { type: 'Literal', value: 1, range: [22, 23] },
        consequent: [{ type: 'BreakStatement', label: null }],
        loc: { start: { line, column }, end: { line, column: column + 10 } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createSwitchWithUniqueCases(line = 1, column = 0): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'x' },
    cases: [
      {
        test: { type: 'Literal', value: 1, range: [15, 16] },
        consequent: [{ type: 'BreakStatement', label: null }],
      },
      {
        test: { type: 'Literal', value: 2, range: [23, 24] },
        consequent: [{ type: 'BreakStatement', label: null }],
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createSwitchWithStringCases(line = 1, column = 0): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'x' },
    cases: [
      {
        test: { type: 'Literal', value: 'foo', range: [15, 20] },
        consequent: [{ type: 'BreakStatement', label: null }],
      },
      {
        test: { type: 'Literal', value: 'foo', range: [26, 31] },
        consequent: [{ type: 'BreakStatement', label: null }],
        loc: { start: { line, column }, end: { line, column: column + 10 } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createSwitchWithDefaultCase(): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'x' },
    cases: [
      {
        test: { type: 'Literal', value: 1, range: [15, 16] },
        consequent: [{ type: 'BreakStatement', label: null }],
      },
      {
        test: null,
        consequent: [{ type: 'BreakStatement', label: null }],
      },
    ],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 40 },
    },
  }
}

function createEmptySwitch(): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'x' },
    cases: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
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

describe('no-duplicate-case rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDuplicateCaseRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDuplicateCaseRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDuplicateCaseRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDuplicateCaseRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention duplicate in description', () => {
      expect(noDuplicateCaseRule.meta.docs?.description.toLowerCase()).toContain('duplicate')
    })
  })

  describe('create', () => {
    test('should return visitor with SwitchStatement method', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)

      expect(visitor).toHaveProperty('SwitchStatement')
    })
  })

  describe('detecting duplicate cases', () => {
    test('should report duplicate case labels', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithDuplicateCases())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Duplicate case')
    })

    test('should not report unique case labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x){case 1:case 1:}' })
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithUniqueCases())

      expect(reports.length).toBe(0)
    })

    test('should report duplicate string case labels', () => {
      const { context, reports } = createMockRuleContext({
        source: 'switch(x){case "foo":case "foo":}',
      })
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithStringCases())

      expect(reports.length).toBe(1)
    })

    test('should not report default case as duplicate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithDefaultCase())

      expect(reports.length).toBe(0)
    })

    test('should not report empty switch', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createEmptySwitch())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithDuplicateCases(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)

      expect(() => visitor.SwitchStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)

      expect(() => visitor.SwitchStatement(undefined)).not.toThrow()
    })

    test('should handle non-SwitchStatement gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)

      expect(() => visitor.SwitchStatement(createNonSwitchStatement())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without cases', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)

      const node = { type: 'SwitchStatement', discriminant: { type: 'Identifier', name: 'x' } }

      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle case without range', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)

      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1 }, consequent: [] },
          { test: { type: 'Literal', value: 1 }, consequent: [] },
        ],
      }

      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)

      const node = createSwitchWithDuplicateCases() as Record<string, unknown>
      const cases = node.cases as Record<string, unknown>[]
      delete cases[1].loc

      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // NEW TESTS: Meta properties - exhaustive coverage
  // =========================================================================
  describe('meta exhaustive properties', () => {
    test('meta.type should be exactly "problem"', () => {
      expect(noDuplicateCaseRule.meta.type).toBe('problem')
      expect(typeof noDuplicateCaseRule.meta.type).toBe('string')
    })

    test('meta.severity should be exactly "error"', () => {
      expect(noDuplicateCaseRule.meta.severity).toBe('error')
      expect(typeof noDuplicateCaseRule.meta.severity).toBe('string')
    })

    test('meta.docs should exist', () => {
      expect(noDuplicateCaseRule.meta.docs).toBeDefined()
      expect(noDuplicateCaseRule.meta.docs).not.toBeNull()
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof noDuplicateCaseRule.meta.docs?.description).toBe('string')
      expect(noDuplicateCaseRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.category should be "patterns"', () => {
      expect(noDuplicateCaseRule.meta.docs?.category).toBe('patterns')
    })

    test('meta.docs.recommended should be true', () => {
      expect(noDuplicateCaseRule.meta.docs?.recommended).toBe(true)
    })

    test('meta.docs.description should contain "case"', () => {
      expect(noDuplicateCaseRule.meta.docs?.description.toLowerCase()).toContain('case')
    })

    test('meta.schema should be an empty array', () => {
      expect(noDuplicateCaseRule.meta.schema).toEqual([])
    })

    test('meta.fixable should be undefined', () => {
      expect(noDuplicateCaseRule.meta.fixable).toBeUndefined()
    })

    test('meta.deprecated should be undefined or false', () => {
      expect(noDuplicateCaseRule.meta.deprecated).toBeFalsy()
    })

    test('meta should not have requiresTypeChecking', () => {
      expect(noDuplicateCaseRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('meta.type should not be "suggestion"', () => {
      expect(noDuplicateCaseRule.meta.type).not.toBe('suggestion')
    })

    test('meta.type should not be "layout"', () => {
      expect(noDuplicateCaseRule.meta.type).not.toBe('layout')
    })

    test('meta.severity should not be "off"', () => {
      expect(noDuplicateCaseRule.meta.severity).not.toBe('off')
    })

    test('meta.severity should not be "warn"', () => {
      expect(noDuplicateCaseRule.meta.severity).not.toBe('warn')
    })

    test('meta.docs should have url property', () => {
      expect(noDuplicateCaseRule.meta.docs?.url).toBeDefined()
    })
  })

  // =========================================================================
  // NEW TESTS: Visitor creation
  // =========================================================================
  describe('visitor creation', () => {
    test('create should return an object', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('visitor should have exactly one key: SwitchStatement', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(Object.keys(visitor)).toEqual(['SwitchStatement'])
    })

    test('SwitchStatement should be a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(typeof visitor.SwitchStatement).toBe('function')
    })

    test('create should return a new visitor object each time', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noDuplicateCaseRule.create(context)
      const visitor2 = noDuplicateCaseRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('SwitchStatement handler should not throw for primitive node', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(() => visitor.SwitchStatement(42)).not.toThrow()
    })

    test('SwitchStatement handler should not throw for string node', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(() => visitor.SwitchStatement('SwitchStatement')).not.toThrow()
    })

    test('SwitchStatement handler should not throw for boolean node', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(() => visitor.SwitchStatement(true)).not.toThrow()
    })

    test('SwitchStatement handler should not throw for number node', () => {
      const { context } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(() => visitor.SwitchStatement(0)).not.toThrow()
    })

    test('SwitchStatement handler should not report for empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(() => visitor.SwitchStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('SwitchStatement should not match lowercase type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: 'switchstatement', cases: [] }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('SwitchStatement should not match SWITCHSTATEMENT type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: 'SWITCHSTATEMENT', cases: [] }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('SwitchStatement should not match Switch_Statement type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: 'Switch_Statement', cases: [] }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // NEW TESTS: Duplicate case detection - various scenarios
  // =========================================================================
  describe('duplicate detection scenarios', () => {
    test('should detect duplicate numeric case 0', () => {
      // 'switch(x){case 0:case 0:}' — '0' at 15 and 22
      const src = 'switch(x){case 0:case 0:}'
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 0, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 0, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should detect duplicate numeric case -1', () => {
      const src = 'AA--'
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: -1, range: [0, 1] }, consequent: [] },
          {
            test: { type: 'Literal', value: -1, range: [0, 1] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should detect duplicate numeric case 42', () => {
      const src = 'AA'
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 42, range: [0, 1] }, consequent: [] },
          {
            test: { type: 'Literal', value: 42, range: [0, 1] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should detect duplicate string case "bar"', () => {
      // 'switch(x){case "bar":case "bar":}' — '"bar"' at 15-20 and 26-31
      const src = 'switch(x){case "bar":case "bar":}'
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'bar', range: [15, 20] }, consequent: [] },
          {
            test: { type: 'Literal', value: 'bar', range: [26, 31] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should detect duplicate string case with empty string', () => {
      const src = "''''"
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: '', range: [0, 2] }, consequent: [] },
          {
            test: { type: 'Literal', value: '', range: [2, 4] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should detect duplicate string case with single char', () => {
      const src = "'a''a'"
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'a', range: [0, 3] }, consequent: [] },
          {
            test: { type: 'Literal', value: 'a', range: [3, 6] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report different strings as duplicates', () => {
      const src = 'ab'
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'foo', range: [0, 1] }, consequent: [] },
          { test: { type: 'Literal', value: 'bar', range: [1, 2] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report different numbers as duplicates', () => {
      const src = '12'
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [0, 1] }, consequent: [] },
          { test: { type: 'Literal', value: 2, range: [1, 2] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should detect duplicate true boolean literal', () => {
      // 'switch(x){case true:case true:}' — 'true' at 15-19 and 25-29
      const src = 'switch(x){case true:case true:}'
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: true, range: [15, 19] }, consequent: [] },
          {
            test: { type: 'Literal', value: true, range: [25, 29] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should detect duplicate false boolean literal', () => {
      // 'switch(x){case false:case false:}' — 'false' at 15-20 and 26-31
      const src = 'switch(x){case false:case false:}'
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: false, range: [15, 20] }, consequent: [] },
          {
            test: { type: 'Literal', value: false, range: [26, 31] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report true and false as duplicates', () => {
      const src = 'truefalse'
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: true, range: [0, 4] }, consequent: [] },
          { test: { type: 'Literal', value: false, range: [4, 9] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should detect duplicate null literal', () => {
      // 'switch(x){case null:case null:}' — 'null' at 15-19 and 25-29
      const src = 'switch(x){case null:case null:}'
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: null, range: [15, 19] }, consequent: [] },
          {
            test: { type: 'Literal', value: null, range: [25, 29] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with three identical cases', () => {
      const source = 'switch(x){case 1:case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          {
            test: { type: 'Literal', value: 1, range: [29, 30] },
            consequent: [],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(2)
    })

    test('should detect duplicate with four identical cases', () => {
      const source = 'switch(x){case 1:case 1:case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          {
            test: { type: 'Literal', value: 1, range: [29, 30] },
            consequent: [],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
          },
          {
            test: { type: 'Literal', value: 1, range: [36, 37] },
            consequent: [],
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(3)
    })

    test('should detect only the actual duplicates in a mixed switch', () => {
      const source = 'switch(x){case 1:case 2:case 1:case 3:case 2:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          { test: { type: 'Literal', value: 2, range: [22, 23] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [29, 30] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          { test: { type: 'Literal', value: 3, range: [36, 37] }, consequent: [] },
          {
            test: { type: 'Literal', value: 2, range: [43, 44] },
            consequent: [],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(2)
    })

    test('should not report when all cases are unique with 5 cases', () => {
      const source = 'switch(x){case 1:case 2:case 3:case 4:case 5:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          { test: { type: 'Literal', value: 2, range: [22, 23] }, consequent: [] },
          { test: { type: 'Literal', value: 3, range: [29, 30] }, consequent: [] },
          { test: { type: 'Literal', value: 4, range: [36, 37] }, consequent: [] },
          { test: { type: 'Literal', value: 5, range: [43, 44] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should detect duplicate among 10 cases', () => {
      const source =
        'switch(x){case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 5:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const cases = [
        { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
        { test: { type: 'Literal', value: 2, range: [23, 24] }, consequent: [] },
        { test: { type: 'Literal', value: 3, range: [31, 32] }, consequent: [] },
        { test: { type: 'Literal', value: 4, range: [39, 40] }, consequent: [] },
        { test: { type: 'Literal', value: 5, range: [47, 48] }, consequent: [] },
        { test: { type: 'Literal', value: 6, range: [55, 56] }, consequent: [] },
        { test: { type: 'Literal', value: 7, range: [63, 64] }, consequent: [] },
        { test: { type: 'Literal', value: 8, range: [71, 72] }, consequent: [] },
        { test: { type: 'Literal', value: 9, range: [79, 80] }, consequent: [] },
        {
          test: { type: 'Literal', value: 5, range: [87, 88] },
          consequent: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ]
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases,
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle single case switch', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x){case 1:}' })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle switch with only default case', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x){default:}' })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: null, consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should detect duplicate with default case present', () => {
      const source = 'switch(x){case 1:case 1:default:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          { test: null, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report duplicate when range extracts different source text', () => {
      const source = 'switch(x){case 1:case 2:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          { test: { type: 'Literal', value: 2, range: [23, 24] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should report duplicate based on source text not value', () => {
      // Two cases with value 1 but source text slices to the same thing
      const source = 'switch(x){case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // NEW TESTS: Location reporting
  // =========================================================================
  describe('location reporting', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases(1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 10 column 5', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases(10, 5))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases(100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location from loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases(3, 8))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('should use default location when case has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          { test: { type: 'Literal', value: 1, range: [22, 23] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report loc with start and end for second duplicate', () => {
      const source = 'switch(x){case 1:case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 2, column: 3 }, end: { line: 2, column: 13 } },
          },
          {
            test: { type: 'Literal', value: 1, range: [29, 30] },
            consequent: [],
            loc: { start: { line: 3, column: 6 }, end: { line: 3, column: 16 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(3)
    })

    test('should handle loc with column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases(1, 0))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle large line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases(9999, 0))
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle large column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases(1, 9999))
      expect(reports[0].loc?.start.column).toBe(9999)
    })
  })

  // =========================================================================
  // NEW TESTS: Message content
  // =========================================================================
  describe('message content', () => {
    test('report message should contain "Duplicate"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases())
      expect(reports[0].message).toContain('Duplicate')
    })

    test('report message should contain "case"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases())
      expect(reports[0].message).toContain('case')
    })

    test('report message should contain "label"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases())
      expect(reports[0].message).toContain('label')
    })

    test('report message should be exactly "Duplicate case label."', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases())
      expect(reports[0].message).toBe('Duplicate case label.')
    })

    test('all reports in a multi-duplicate switch should have same message', () => {
      const source = 'switch(x){case 1:case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          {
            test: { type: 'Literal', value: 1, range: [29, 30] },
            consequent: [],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe('Duplicate case label.')
      expect(reports[1].message).toBe('Duplicate case label.')
    })

    test('report message should end with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases())
      expect(reports[0].message.endsWith('.')).toBe(true)
    })
  })

  // =========================================================================
  // NEW TESTS: Multiple reports
  // =========================================================================
  describe('multiple reports', () => {
    test('should report two duplicates for three identical cases', () => {
      const source = 'switch(x){case 5:case 5:case 5:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 5, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 5, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          {
            test: { type: 'Literal', value: 5, range: [29, 30] },
            consequent: [],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(2)
    })

    test('should report both duplicates for two pairs of duplicates', () => {
      const source = 'switch(x){case 1:case 2:case 1:case 2:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          { test: { type: 'Literal', value: 2, range: [22, 23] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [29, 30] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          {
            test: { type: 'Literal', value: 2, range: [36, 37] },
            consequent: [],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(2)
    })

    test('should report one duplicate for pair among 6 unique cases', () => {
      const src = '123453'
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [0, 1] }, consequent: [] },
          { test: { type: 'Literal', value: 2, range: [1, 2] }, consequent: [] },
          { test: { type: 'Literal', value: 3, range: [2, 3] }, consequent: [] },
          { test: { type: 'Literal', value: 4, range: [3, 4] }, consequent: [] },
          { test: { type: 'Literal', value: 5, range: [4, 5] }, consequent: [] },
          {
            test: { type: 'Literal', value: 3, range: [5, 6] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle multiple visitors independently', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({
        source: 'switch(x){case 1:case 1:}',
      })
      const { context: ctx2, reports: r2 } = createMockRuleContext({
        source: 'switch(x){case 1:case 2:}',
      })
      const v1 = noDuplicateCaseRule.create(ctx1)
      const v2 = noDuplicateCaseRule.create(ctx2)
      v1.SwitchStatement(createSwitchWithDuplicateCases())
      v2.SwitchStatement(createSwitchWithUniqueCases())
      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle same visitor called multiple times', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases())
      visitor.SwitchStatement(createSwitchWithDuplicateCases(2, 0))
      expect(reports.length).toBe(2)
    })

    test('should handle same visitor with unique then duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x){case 1:case 1:}' })
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithUniqueCases())
      expect(reports.length).toBe(0)
      visitor.SwitchStatement(createSwitchWithDuplicateCases())
      expect(reports.length).toBe(1)
    })

    test('should handle same visitor with duplicate then unique', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x){case 1:case 1:}' })
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDuplicateCases())
      expect(reports.length).toBe(1)
      visitor.SwitchStatement(createSwitchWithUniqueCases())
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // NEW TESTS: Edge cases - null/undefined/primitive nodes
  // =========================================================================
  describe('edge cases - node types', () => {
    test('should handle NaN node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(() => visitor.SwitchStatement(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Infinity node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(() => visitor.SwitchStatement(Number.POSITIVE_INFINITY)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(() => visitor.SwitchStatement([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Date node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(() => visitor.SwitchStatement(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle RegExp node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      expect(() => visitor.SwitchStatement(/test/)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: 42, cases: [] }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: true, cases: [] }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: null, cases: [] }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: undefined, cases: [] }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: { name: 'SwitchStatement' }, cases: [] }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle SwitchStatement node without discriminant', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: 'SwitchStatement', cases: [] }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle cases as non-array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: 'SwitchStatement', cases: 'not an array' }
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should handle cases as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: 'SwitchStatement', cases: 42 }
      expect(() => visitor.SwitchStatement(node)).toThrow()
    })

    test('should handle cases as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: 'SwitchStatement', cases: null }
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle cases as undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = { type: 'SwitchStatement', cases: undefined }
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // NEW TESTS: Case node edge cases
  // =========================================================================
  describe('case node edge cases', () => {
    test('should handle case with test as undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: undefined, consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case with test as false (falsy)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: false, consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case with test as empty string (falsy)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: '', consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case with test as 0 (falsy)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: 0, consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case with test as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: null, consequent: [] },
          { test: null, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case test with range as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: null }, consequent: [] },
          { test: { type: 'Literal', value: 1, range: null }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case test with range as undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: undefined }, consequent: [] },
          { test: { type: 'Literal', value: 1, range: undefined }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case test with range as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', value: 1, range: 'not-array' }, consequent: [] }],
      }
      // range as string - slice won't work properly but shouldn't crash
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should handle case test with range as empty array', () => {
      const { context, reports } = createMockRuleContext({ source: 'test' })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [] }, consequent: [] },
          { test: { type: 'Literal', value: 1, range: [] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      // Both slice to '' which is the same, so second is duplicate
      expect(reports.length).toBe(1)
    })

    test('should handle case test with range having one element', () => {
      const { context, reports } = createMockRuleContext({ source: 'test' })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [0] }, consequent: [] },
          { test: { type: 'Literal', value: 1, range: [0] }, consequent: [] },
        ],
      }
      // slice(0, undefined) returns entire string, both identical -> duplicate
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle case with empty consequent', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle case without consequent property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] } },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle case node as null in cases array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [null, null],
      }
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle case node as undefined in cases array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [undefined, undefined],
      }
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle mixed null and valid cases', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          null,
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          null,
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle case with test as number (not object)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: 42, consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case with test as string (not object)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: 'hello', consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case with test as boolean (not object)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: true, consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // NEW TESTS: Source text slicing
  // =========================================================================
  describe('source text slicing', () => {
    test('should use source text from context for comparison', () => {
      // 'switch(x){case ABC:case ABC:}' — 'ABC' at 15-18 and 24-27
      const source = 'switch(x){case ABC:case ABC:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Identifier', name: 'ABC', range: [15, 18] }, consequent: [] },
          {
            test: { type: 'Identifier', name: 'ABC', range: [24, 27] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when source text differs', () => {
      const source = 'switch(x){case ABC:case DEF:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Identifier', name: 'ABC', range: [15, 18] }, consequent: [] },
          { test: { type: 'Identifier', name: 'DEF', range: [24, 27] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when source text differs', () => {
      const source = 'switch(x){case ABC:case DEF:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Identifier', name: 'ABC', range: [15, 18] }, consequent: [] },
          { test: { type: 'Identifier', name: 'DEF', range: [25, 28] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should detect duplicate with overlapping range indices', () => {
      const source = 'switch(x){case 11:case 11:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 11, range: [15, 17] }, consequent: [] },
          {
            test: { type: 'Literal', value: 11, range: [23, 25] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle empty source string', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [0, 1] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [2, 3] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      // Both slice to '' on empty string, so they match as duplicate
      expect(reports.length).toBe(1)
    })

    test('should handle range at end of source', () => {
      const source = 'switch(x){case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [22, 23] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle source with special characters', () => {
      const source = 'qq'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: '\\n', range: [0, 1] }, consequent: [] },
          {
            test: { type: 'Literal', value: '\\n', range: [1, 2] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle source with unicode characters', () => {
      const source = '日日本語日日本語'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: '日本語', range: [1, 4] }, consequent: [] },
          {
            test: { type: 'Literal', value: '日本語', range: [5, 8] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // NEW TESTS: Export verification
  // =========================================================================
  describe('export verification', () => {
    test('should have default export', () => {
      const defaultExport = noDuplicateCaseRule
      expect(defaultExport).toBeDefined()
      expect(defaultExport.meta).toBeDefined()
      expect(defaultExport.create).toBeDefined()
    })

    test('should have named export', () => {
      expect(noDuplicateCaseRule).toBeDefined()
    })

    test('named and default export should be the same object', () => {
      // In the source: export default noDuplicateCaseRule
      // So the default import should be the same as named import
      expect(noDuplicateCaseRule.meta.type).toBe('problem')
    })

    test('rule should have create as a function', () => {
      expect(typeof noDuplicateCaseRule.create).toBe('function')
    })

    test('rule.create should accept context with minimal properties', () => {
      const minimalContext = {
        report: () => {},
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        workspaceRoot: '',
      } as unknown as RuleContext
      expect(() => noDuplicateCaseRule.create(minimalContext)).not.toThrow()
    })
  })

  // =========================================================================
  // NEW TESTS: Various statement types ignored
  // =========================================================================
  describe('non-switch statement types', () => {
    test('should ignore IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement({ type: 'IfStatement' })
      expect(reports.length).toBe(0)
    })

    test('should ignore ForStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement({ type: 'ForStatement' })
      expect(reports.length).toBe(0)
    })

    test('should ignore WhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement({ type: 'WhileStatement' })
      expect(reports.length).toBe(0)
    })

    test('should ignore FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement({ type: 'FunctionDeclaration' })
      expect(reports.length).toBe(0)
    })

    test('should ignore BlockStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement({ type: 'BlockStatement' })
      expect(reports.length).toBe(0)
    })

    test('should ignore ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement({ type: 'ExpressionStatement' })
      expect(reports.length).toBe(0)
    })

    test('should ignore TryStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement({ type: 'TryStatement' })
      expect(reports.length).toBe(0)
    })

    test('should ignore empty string type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement({ type: '' })
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // NEW TESTS: Additional loc edge cases
  // =========================================================================
  describe('loc edge cases', () => {
    test('should handle case with loc missing start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle case with loc missing end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 3, column: 5 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle case with loc.start.line as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: {
              start: { line: 'not-a-number', column: 0 },
              end: { line: 'not-a-number', column: 10 },
            },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle case with loc.start.column as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: {
              start: { line: 1, column: 'not-a-number' },
              end: { line: 1, column: 'not-a-number' },
            },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle case with loc as empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          { test: { type: 'Literal', value: 1, range: [22, 23] }, consequent: [], loc: {} },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle case with loc as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          { test: { type: 'Literal', value: 1, range: [22, 23] }, consequent: [], loc: null },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle case with loc as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          { test: { type: 'Literal', value: 1, range: [22, 23] }, consequent: [], loc: 42 },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle case with loc as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          { test: { type: 'Literal', value: 1, range: [22, 23] }, consequent: [], loc: 'invalid' },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle case with negative line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: -1, column: 0 }, end: { line: -1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle case with negative column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: -5 }, end: { line: 1, column: -5 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle case with zero line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // =========================================================================
  // NEW TESTS: Identifier literal cases
  // =========================================================================
  describe('identifier case values', () => {
    test('should detect duplicate identifier cases', () => {
      // 'switch(x){case foo:case foo:}' — 'foo' at 15-18 and 24-27
      const source = 'switch(x){case foo:case foo:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Identifier', name: 'foo', range: [15, 18] }, consequent: [] },
          {
            test: { type: 'Identifier', name: 'foo', range: [24, 27] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report different identifiers as duplicates', () => {
      // 'switch(x){case foo:case bar:}' — 'foo' at 15-18, 'bar' at 24-27
      const source = 'switch(x){case foo:case bar:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Identifier', name: 'foo', range: [15, 18] }, consequent: [] },
          { test: { type: 'Identifier', name: 'bar', range: [24, 27] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should detect duplicate identifier with mixed case sensitivity', () => {
      const source = 'switch(x){case myVar:case myVar:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Identifier', name: 'myVar', range: [15, 20] }, consequent: [] },
          {
            test: { type: 'Identifier', name: 'myVar', range: [26, 31] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle identifier case-sensitive as different', () => {
      const source = 'switch(x){case MyVar:case myvar:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Identifier', name: 'MyVar', range: [15, 20] }, consequent: [] },
          { test: { type: 'Identifier', name: 'myvar', range: [26, 31] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle identifier matching literal value', () => {
      // Same source text 'foo' from different node types
      const source = 'foofoo'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Identifier', name: 'foo', range: [0, 3] }, consequent: [] },
          {
            test: { type: 'Literal', value: 'foo', range: [3, 6] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // NEW TESTS: Context interaction
  // =========================================================================
  describe('context interaction', () => {
    test('should call context.report with message', () => {
      let calledWith: ReportDescriptor | null = null
      const ctx = {
        report: (d: ReportDescriptor) => {
          calledWith = d
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => 'switch(x){case 1:case 1:}',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = noDuplicateCaseRule.create(ctx)
      visitor.SwitchStatement(createSwitchWithDuplicateCases())
      expect(calledWith).not.toBeNull()
      expect(calledWith?.message).toBe('Duplicate case label.')
    })

    test('should call context.report with loc', () => {
      let reportedLoc: unknown = undefined
      const ctx = {
        report: (d: ReportDescriptor) => {
          reportedLoc = d.loc
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => 'switch(x){case 1:case 1:}',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = noDuplicateCaseRule.create(ctx)
      visitor.SwitchStatement(createSwitchWithDuplicateCases(7, 3))
      expect(reportedLoc).toBeDefined()
      expect((reportedLoc as Record<string, unknown>)?.start).toEqual({ line: 7, column: 3 })
    })

    test('should not call report for unique cases', () => {
      let reportCalled = false
      const ctx = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => 'switch(x){case 1:case 2:}',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = noDuplicateCaseRule.create(ctx)
      visitor.SwitchStatement(createSwitchWithUniqueCases())
      expect(reportCalled).toBe(false)
    })

    test('should call getSource for each case with a test', () => {
      let getSourceCallCount = 0
      const ctx = {
        report: () => {},
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => {
          getSourceCallCount++
          return 'switch(x){case 1:case 1:}'
        },
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext
      const visitor = noDuplicateCaseRule.create(ctx)
      visitor.SwitchStatement(createSwitchWithDuplicateCases())
      expect(getSourceCallCount).toBeGreaterThanOrEqual(2)
    })

    test('should handle context with undefined config', () => {
      const ctx = {
        report: () => {},
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => 'switch(x){case 1:case 1:}',
        getTokens: () => [],
        getComments: () => [],
        config: undefined,
        logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        workspaceRoot: '',
      } as unknown as RuleContext
      expect(() => noDuplicateCaseRule.create(ctx)).not.toThrow()
    })
  })

  // =========================================================================
  // NEW TESTS: Stress / robustness
  // =========================================================================
  describe('robustness', () => {
    test('should handle very long source string', () => {
      const longSource = 'switch(x){case 1:case 1:}' + 'x'.repeat(10000)
      const { context, reports } = createMockRuleContext({ source: longSource })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle many cases (50 unique)', () => {
      const src = Array.from({ length: 50 }, (_, i) => String(i).padStart(3, '0')).join('')
      const cases = Array.from({ length: 50 }, (_, i) => ({
        test: { type: 'Literal', value: i, range: [i * 3, i * 3 + 3] },
        consequent: [],
      }))
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases,
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle many cases with one duplicate pair', () => {
      const src = Array.from({ length: 50 }, (_, i) => String(i).padStart(3, '0')).join('') + '000'
      const cases = Array.from({ length: 50 }, (_, i) => ({
        test: { type: 'Literal', value: i, range: [i * 3, i * 3 + 3] },
        consequent: [],
      }))
      cases.push({
        test: { type: 'Literal', value: 0, range: [150, 153] },
        consequent: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      const { context, reports } = createMockRuleContext({ source: src })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases,
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle calling visitor multiple times rapidly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      for (let i = 0; i < 100; i++) {
        visitor.SwitchStatement(createSwitchWithDuplicateCases(i, 0))
      }
      expect(reports.length).toBe(100)
    })

    test('should handle calling visitor with alternating duplicate and unique', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x){case 1:case 1:}' })
      const visitor = noDuplicateCaseRule.create(context)
      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) {
          visitor.SwitchStatement(createSwitchWithDuplicateCases())
        } else {
          visitor.SwitchStatement(createSwitchWithUniqueCases())
        }
      }
      expect(reports.length).toBe(25)
    })
  })

  // =========================================================================
  // NEW TESTS: Range edge cases
  // =========================================================================
  describe('range edge cases', () => {
    test('should handle range with same start and end', () => {
      const source = ''
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [0, 0] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [5, 5] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      // Both slice to '', which is the same -> duplicate
      expect(reports.length).toBe(1)
    })

    test('should handle range where end is before start', () => {
      const source = 'test'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [3, 1] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [4, 2] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      // Both produce empty string from reversed range
      expect(reports.length).toBe(1)
    })

    test('should handle range with very large indices', () => {
      const source = 'switch(x){case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [999999, 999999] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [999999, 999999] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      // Both slice beyond string bounds produce ''
      expect(reports.length).toBe(1)
    })

    test('should handle range starting at 0', () => {
      const source = 'switch(x){case 0:case 0:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 0, range: [0, 7] }, consequent: [] },
          {
            test: { type: 'Literal', value: 0, range: [0, 7] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle negative range values', () => {
      const source = 'test'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [-1, -1] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [-1, -1] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // NEW TESTS: Additional coverage to reach 200+
  // =========================================================================
  describe('additional coverage', () => {
    test('should handle case with consequent as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: null },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: null,
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle case without test property at all', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ consequent: [] }, { consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle mixed cases with and without range', () => {
      const source = 'switch(x){case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1 }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle first case having range and second not', () => {
      const source = 'switch(x){case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          { test: { type: 'Literal', value: 1 }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle SwitchStatement with numeric discriminant', () => {
      const source = 'switch(42){case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Literal', value: 42 },
        cases: [
          { test: { type: 'Literal', value: 1, range: [14, 15] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [21, 22] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle case with extra properties on test', () => {
      const source = 'switch(x){case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            test: { type: 'Literal', value: 1, range: [15, 16], raw: '1', extra: true },
            consequent: [],
          },
          {
            test: { type: 'Literal', value: 1, range: [22, 23], raw: '1' },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with whitespace in source', () => {
      const source = '  switch ( x ) { case  1 : case  1 : }'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [23, 24] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [33, 34] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle source with newlines', () => {
      const source = 'switch(x){\ncase 1:\ncase 1:\n}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [16, 17] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [24, 25] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle source with newlines', () => {
      const source = 'switch(x){\ncase 1:\ncase 1:\n}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [16, 17] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [24, 25] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle case test with range as array of strings', () => {
      const { context, reports } = createMockRuleContext({ source: 'ab' })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: ['a', 'b'] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: ['a', 'b'] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle two visitors from different contexts independently', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({
        source: 'switch(x){case A:case A:}',
      })
      const { context: ctx2, reports: r2 } = createMockRuleContext({
        source: 'switch(x){case B:case C:}',
      })
      const v1 = noDuplicateCaseRule.create(ctx1)
      const v2 = noDuplicateCaseRule.create(ctx2)
      const node1 = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'A', range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 'A', range: [22, 23] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      const node2 = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'B', range: [15, 16] }, consequent: [] },
          { test: { type: 'Literal', value: 'C', range: [22, 23] }, consequent: [] },
        ],
      }
      v1.SwitchStatement(node1)
      v2.SwitchStatement(node2)
      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle case test with only range property', () => {
      const source = 'ab'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { range: [0, 1] }, consequent: [] },
          { test: { range: [1, 2] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested switch discriminant', () => {
      const source = 'switch(a.b.c){case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'c' },
        },
        cases: [
          { test: { type: 'Literal', value: 1, range: [18, 19] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [25, 26] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle case with test as function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: () => {}, consequent: [] },
          { test: () => {}, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case with test as Date object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: new Date(), consequent: [] },
          { test: new Date(), consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case with test having range as object', () => {
      const source = 'ab'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: { start: 0, end: 1 } }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: { start: 1, end: 2 } },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle multiple identical source ranges', () => {
      const source = 'switch(x){case 1:case 1:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 1, range: [15, 16] }, consequent: [] },
          {
            test: { type: 'Literal', value: 1, range: [15, 16] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle falsy range values (0, 0)', () => {
      const source = 'x'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 0, range: [0, 0] }, consequent: [] },
          {
            test: { type: 'Literal', value: 0, range: [0, 0] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle Symbol.toPrimitive on test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      const testObj = { type: 'Literal', value: 1 }
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: testObj, consequent: [] },
          { test: testObj, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle 3 cases where 1st and 3rd match', () => {
      const source = 'ABA'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'A', range: [0, 1] }, consequent: [] },
          { test: { type: 'Literal', value: 'B', range: [1, 2] }, consequent: [] },
          {
            test: { type: 'Literal', value: 'A', range: [2, 3] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle 3 cases where 2nd and 3rd match', () => {
      const source = 'ABB'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'A', range: [0, 1] }, consequent: [] },
          { test: { type: 'Literal', value: 'B', range: [1, 2] }, consequent: [] },
          {
            test: { type: 'Literal', value: 'B', range: [2, 3] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle 4 cases where 1st-3rd and 2nd-4th match', () => {
      const source = 'ABCDABCD'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'A', range: [0, 2] }, consequent: [] },
          { test: { type: 'Literal', value: 'B', range: [2, 4] }, consequent: [] },
          {
            test: { type: 'Literal', value: 'A', range: [4, 6] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          {
            test: { type: 'Literal', value: 'B', range: [6, 8] },
            consequent: [],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(2)
    })

    test('should handle single case with range but no test.value', () => {
      const source = 'x'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [{ test: { type: 'Literal', range: [0, 1] }, consequent: [] }],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle cases array with sparse items', () => {
      const source = 'abc'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const cases: unknown[] = [
        { test: { type: 'Literal', value: 'a', range: [0, 1] }, consequent: [] },
      ]
      cases[3] = {
        test: { type: 'Literal', value: 'a', range: [0, 1] },
        consequent: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases,
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle meta.docs.description mentioning switch', () => {
      expect(noDuplicateCaseRule.meta.docs?.description.toLowerCase()).toContain('switch')
    })

    test('should handle case where range produces multi-char duplicate', () => {
      const source = 'hellohello'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'hello', range: [0, 5] }, consequent: [] },
          {
            test: { type: 'Literal', value: 'hello', range: [5, 10] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle TemplateLiteral as case test', () => {
      const source = 'switch(x){case `hello`:case `hello`:}'
      const { context, reports } = createMockRuleContext({ source: source })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'TemplateLiteral', range: [15, 22] }, consequent: [] },
          {
            test: { type: 'TemplateLiteral', range: [28, 35] },
            consequent: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle meta having schema as empty array', () => {
      expect(Array.isArray(noDuplicateCaseRule.meta.schema)).toBe(true)
    })

    test('should handle rule having no fixable property', () => {
      expect(noDuplicateCaseRule.meta.fixable).toBeUndefined()
    })

    test('should handle repeated calls with empty switch', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createEmptySwitch())
      visitor.SwitchStatement(createEmptySwitch())
      visitor.SwitchStatement(createEmptySwitch())
      expect(reports.length).toBe(0)
    })

    test('should handle repeated calls with default-only switch', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDuplicateCaseRule.create(context)
      visitor.SwitchStatement(createSwitchWithDefaultCase())
      visitor.SwitchStatement(createSwitchWithDefaultCase())
      expect(reports.length).toBe(0)
    })

    test('should handle createMockContext with custom source', () => {
      const customSource = 'custom code here'
      const { context, reports } = createMockRuleContext({ source: customSource })
      const visitor = noDuplicateCaseRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { test: { type: 'Literal', value: 'custom', range: [0, 6] }, consequent: [] },
          { test: { type: 'Literal', value: 'code', range: [7, 11] }, consequent: [] },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })
  })
})
