import { describe, test, expect, vi } from 'vitest'
import { defaultCaseRule } from '../../../../src/rules/patterns/default-case.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
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
    getSource: () => 'switch(x) { case 1: break; }',
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
  })

  describe('create', () => {
    test('should return visitor with SwitchStatement method', () => {
      const { context } = createMockContext()
      const visitor = defaultCaseRule.create(context)

      expect(visitor).toHaveProperty('SwitchStatement')
    })
  })

  describe('detecting missing default case', () => {
    test('should report switch without default case', () => {
      const { context, reports } = createMockContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithoutDefault())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('default')
    })

    test('should not report switch with default case', () => {
      const { context, reports } = createMockContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithDefault())

      expect(reports.length).toBe(0)
    })

    test('should report empty switch without default', () => {
      const { context, reports } = createMockContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(createEmptySwitch())

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = defaultCaseRule.create(context)

      visitor.SwitchStatement(createSwitchWithoutDefault(5, 2))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(undefined)).not.toThrow()
    })

    test('should handle non-switch statement gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = defaultCaseRule.create(context)

      expect(() => visitor.SwitchStatement(createNonSwitchStatement())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without cases', () => {
      const { context } = createMockContext()
      const visitor = defaultCaseRule.create(context)

      const node = { type: 'SwitchStatement', discriminant: { type: 'Identifier', name: 'x' } }

      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = defaultCaseRule.create(context)

      const node = createSwitchWithoutDefault()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
