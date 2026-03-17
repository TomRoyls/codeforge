import { describe, test, expect, vi } from 'vitest'
import { noDuplicateCaseRule } from '../../../../src/rules/patterns/no-duplicate-case.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(source = 'switch(x){case 1:case 1:}'): {
  context: RuleContext
  reports: ReportDescriptor[]
} {
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
    getSource: () => source,
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

  return { context, reports }
}

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
      const { context } = createMockContext()
      const visitor = noDuplicateCaseRule.create(context)

      expect(visitor).toHaveProperty('SwitchStatement')
    })
  })

  describe('detecting duplicate cases', () => {
    test('should report duplicate case labels', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithDuplicateCases())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Duplicate case')
    })

    test('should not report unique case labels', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithUniqueCases())

      expect(reports.length).toBe(0)
    })

    test('should report duplicate string case labels', () => {
      const { context, reports } = createMockContext('switch(x){case "foo":case "foo":}')
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithStringCases())

      expect(reports.length).toBe(1)
    })

    test('should not report default case as duplicate', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithDefaultCase())

      expect(reports.length).toBe(0)
    })

    test('should not report empty switch', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createEmptySwitch())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithDuplicateCases(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCaseRule.create(context)

      expect(() => visitor.SwitchStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCaseRule.create(context)

      expect(() => visitor.SwitchStatement(undefined)).not.toThrow()
    })

    test('should handle non-SwitchStatement gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateCaseRule.create(context)

      expect(() => visitor.SwitchStatement(createNonSwitchStatement())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without cases', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateCaseRule.create(context)

      const node = { type: 'SwitchStatement', discriminant: { type: 'Identifier', name: 'x' } }

      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle case without range', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noDuplicateCaseRule.create(context)

      const node = createSwitchWithDuplicateCases() as Record<string, unknown>
      const cases = node.cases as Record<string, unknown>[]
      delete cases[1].loc

      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
