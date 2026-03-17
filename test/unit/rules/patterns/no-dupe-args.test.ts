import { describe, test, expect, vi } from 'vitest'
import { noDupeArgsRule } from '../../../../src/rules/patterns/no-dupe-args.js'
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
    getSource: () => 'function foo(a, a) {}',
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
  })

  describe('create', () => {
    test('should return visitor with FunctionDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('should return visitor with FunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      expect(visitor).toHaveProperty('FunctionExpression')
    })

    test('should return visitor with ArrowFunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })
  })

  describe('detecting duplicate arguments', () => {
    test('should report duplicate args in function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Duplicate argument')
      expect(reports[0].message).toContain("'a'")
    })

    test('should not report unique args in function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithUniqueArgs())

      expect(reports.length).toBe(0)
    })

    test('should report duplicate args in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionExpression(createFunctionExpressionWithDupeArgs())

      expect(reports.length).toBe(1)
    })

    test('should report duplicate args in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionWithDupeArgs())

      expect(reports.length).toBe(1)
    })

    test('should report duplicate with default param', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDefaultParamDupe())

      expect(reports.length).toBe(1)
    })

    test('should report duplicate with rest param', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithRestParamDupe())

      expect(reports.length).toBe(1)
    })

    test('should not report function with no params', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithNoParams())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      visitor.FunctionDeclaration(createFunctionWithDupeArgs(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(13)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for FunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
    })

    test('should handle non-function gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      expect(() => visitor.FunctionDeclaration(createNonFunction())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function without params', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      const node = { type: 'FunctionDeclaration', body: { type: 'BlockStatement', body: [] } }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeArgsRule.create(context)

      const node = createFunctionWithDupeArgs() as Record<string, unknown>
      const params = node.params as Record<string, unknown>[]
      delete params[1].loc

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
