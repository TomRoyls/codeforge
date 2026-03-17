import { describe, test, expect, vi } from 'vitest'
import { noCaseDeclarationsRule } from '../../../../src/rules/patterns/no-case-declarations.js'
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
    getSource: () => 'switch(x) { case 1: let a = 1; break; }',
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

function createSwitchCase(consequent: unknown[], line = 1): unknown {
  return {
    type: 'SwitchCase',
    test: { type: 'Literal', value: 1 },
    consequent,
    loc: {
      start: { line, column: 0 },
      end: { line, column: 30 },
    },
  }
}

function createLetDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'let',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'a' },
        init: { type: 'Literal', value: 1 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createConstDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'b' },
        init: { type: 'Literal', value: 2 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 12 },
    },
  }
}

function createVarDeclaration(): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'c' },
        init: { type: 'Literal', value: 3 },
      },
    ],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createFunctionDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBreakStatement(): unknown {
  return {
    type: 'BreakStatement',
    label: null,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
  }
}

function createExpressionStatement(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'doSomething' },
      arguments: [],
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 15 },
    },
  }
}

function createNonSwitchCase(): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Literal', value: true },
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

describe('no-case-declarations rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noCaseDeclarationsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noCaseDeclarationsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noCaseDeclarationsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noCaseDeclarationsRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention lexical or declaration in description', () => {
      const desc = noCaseDeclarationsRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/lexical|declaration/)
    })
  })

  describe('create', () => {
    test('should return visitor with SwitchCase method', () => {
      const { context } = createMockContext()
      const visitor = noCaseDeclarationsRule.create(context)

      expect(visitor).toHaveProperty('SwitchCase')
    })
  })

  describe('detecting lexical declarations', () => {
    test('should report let declaration in case clause', () => {
      const { context, reports } = createMockContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createLetDeclaration(), createBreakStatement()]))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('lexical')
    })

    test('should report const declaration in case clause', () => {
      const { context, reports } = createMockContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createConstDeclaration(), createBreakStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report function declaration in case clause', () => {
      const { context, reports } = createMockContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createFunctionDeclaration(), createBreakStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should not report var declaration in case clause', () => {
      const { context, reports } = createMockContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createVarDeclaration(), createBreakStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report regular statements in case clause', () => {
      const { context, reports } = createMockContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createBreakStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report non-SwitchCase nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createNonSwitchCase())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noCaseDeclarationsRule.create(context)

      expect(() => visitor.SwitchCase(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noCaseDeclarationsRule.create(context)

      expect(() => visitor.SwitchCase(undefined)).not.toThrow()
    })

    test('should handle empty consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([]))

      expect(reports.length).toBe(0)
    })

    test('should handle node without consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noCaseDeclarationsRule.create(context)

      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.SwitchCase(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})
