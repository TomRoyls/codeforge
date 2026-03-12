import { describe, test, expect, vi } from 'vitest'
import { noInferrableTypesRule } from '../../../../src/rules/patterns/no-inferrable-types.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x: string = "hello";',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
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

function createVariableDeclarator(
  typeName: string,
  initType: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: 'x',
    },
    init: {
      type: initType,
    },
    typeAnnotation: {
      type: typeName,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createVariableDeclaratorNoAnnotation(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: 'x',
    },
    init: {
      type: 'StringLiteral',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-inferrable-types rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noInferrableTypesRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noInferrableTypesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noInferrableTypesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noInferrableTypesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noInferrableTypesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noInferrableTypesRule.meta.fixable).toBeUndefined()
    })

    test('should mention inferred in description', () => {
      expect(noInferrableTypesRule.meta.docs?.description.toLowerCase()).toContain('inferred')
    })

    test('should not report without type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclaratorNoAnnotation())
      expect(reports.length).toBe(0)
    })
  })

  describe('detecting inferrable types', () => {
    test('should report string type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('string')
    })

    test('should report number type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSNumberKeyword', 'NumericLiteral'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('number')
    })

    test('should report boolean type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('TSBooleanKeyword', 'BooleanLiteral'))
      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('boolean')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral')
      // Remove loc property
      delete (node as Record<string, unknown>).loc
      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral', 10, 5)
      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })
})
