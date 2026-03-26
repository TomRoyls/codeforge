import { describe, test, expect, vi } from 'vitest'
import { noVarRule } from '../../../../src/rules/patterns/no-var.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
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

function createVariableDeclaration(
  kind: 'var' | 'let' | 'const',
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclaration',
    kind: kind,
    declarations: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + kind.length + 10 },
    },
  }
}

describe('no-var rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noVarRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noVarRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noVarRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noVarRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noVarRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noVarRule.meta.fixable).toBeUndefined()
    })

    test('should mention var in description', () => {
      expect(noVarRule.meta.docs?.description.toLowerCase()).toContain('var')
    })

    test('should mention let or const in description', () => {
      const desc = noVarRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/let|const/)
    })

    test('should have empty schema array', () => {
      expect(noVarRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with VariableDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclaration')
    })
  })

  describe('detecting var declarations', () => {
    test('should report var declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(1)
    })

    test('should not report let declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('let'))

      expect(reports.length).toBe(0)
    })

    test('should not report const declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('const'))

      expect(reports.length).toBe(0)
    })

    test('should report correct message for var declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toBe("Use 'let' or 'const' instead of 'var'")
    })

    test('should report multiple var declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 0))
      visitor.VariableDeclaration(createVariableDeclaration('var', 2, 0))
      visitor.VariableDeclaration(createVariableDeclaration('var', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report var among let and const declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('let'))
      visitor.VariableDeclaration(createVariableDeclaration('var'))
      visitor.VariableDeclaration(createVariableDeclaration('const'))
      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration('string')).not.toThrow()
      expect(() => visitor.VariableDeclaration(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without kind property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        declarations: [],
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
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
        getSource: () => 'var x = 1;',
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

      const visitor = noVarRule.create(context)
      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention let in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain('let')
    })

    test('should mention const in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain('const')
    })

    test('should mention var in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain('var')
    })

    test('should use single quotes around var', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain("'var'")
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))
      visitor.VariableDeclaration(createVariableDeclaration('var', 2, 0))

      expect(reports[0].message).toBe("Use 'let' or 'const' instead of 'var'")
      expect(reports[1].message).toBe("Use 'let' or 'const' instead of 'var'")
    })
  })

  describe('location reporting', () => {
    test('should report correct location for var declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })
})
