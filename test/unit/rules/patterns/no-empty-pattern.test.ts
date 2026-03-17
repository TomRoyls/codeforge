import { describe, test, expect, vi } from 'vitest'
import { noEmptyPatternRule } from '../../../../src/rules/patterns/no-empty-pattern.js'
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
    getSource: () => 'const {} = obj',
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

function createEmptyObjectPattern(line = 1, column = 0): unknown {
  return {
    type: 'ObjectPattern',
    properties: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

function createNonEmptyObjectPattern(line = 1, column = 0): unknown {
  return {
    type: 'ObjectPattern',
    properties: [
      {
        type: 'Property',
        key: { type: 'Identifier', name: 'a' },
        value: { type: 'Identifier', name: 'a' },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createEmptyArrayPattern(line = 1, column = 0): unknown {
  return {
    type: 'ArrayPattern',
    elements: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

function createNonEmptyArrayPattern(line = 1, column = 0): unknown {
  return {
    type: 'ArrayPattern',
    elements: [{ type: 'Identifier', name: 'a' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createNonPatternNode(): unknown {
  return {
    type: 'Identifier',
    name: 'x',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 1 },
    },
  }
}

describe('no-empty-pattern rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noEmptyPatternRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noEmptyPatternRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noEmptyPatternRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noEmptyPatternRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention empty in description', () => {
      expect(noEmptyPatternRule.meta.docs?.description.toLowerCase()).toContain('empty')
    })
  })

  describe('create', () => {
    test('should return visitor with ObjectPattern method', () => {
      const { context } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      expect(visitor).toHaveProperty('ObjectPattern')
    })

    test('should return visitor with ArrayPattern method', () => {
      const { context } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      expect(visitor).toHaveProperty('ArrayPattern')
    })
  })

  describe('detecting empty patterns', () => {
    test('should report empty object pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('empty object pattern')
    })

    test('should not report non-empty object pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createNonEmptyObjectPattern())

      expect(reports.length).toBe(0)
    })

    test('should report empty array pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('empty array pattern')
    })

    test('should not report non-empty array pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createNonEmptyArrayPattern())

      expect(reports.length).toBe(0)
    })

    test('should report correct location for object pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      visitor.ObjectPattern(createEmptyObjectPattern(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for array pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      visitor.ArrayPattern(createEmptyArrayPattern(3, 8))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for ObjectPattern', () => {
      const { context } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(null)).not.toThrow()
    })

    test('should handle null node gracefully for ArrayPattern', () => {
      const { context } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for ObjectPattern', () => {
      const { context } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(undefined)).not.toThrow()
    })

    test('should handle undefined node gracefully for ArrayPattern', () => {
      const { context } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(undefined)).not.toThrow()
    })

    test('should handle non-pattern node gracefully for ObjectPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ObjectPattern(createNonPatternNode())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-pattern node gracefully for ArrayPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      expect(() => visitor.ArrayPattern(createNonPatternNode())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc for ObjectPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      const node = createEmptyObjectPattern()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.ObjectPattern(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without loc for ArrayPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyPatternRule.create(context)

      const node = createEmptyArrayPattern()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.ArrayPattern(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
