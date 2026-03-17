import { describe, test, expect, vi } from 'vitest'
import { noUnusedLabelsRule } from '../../../../src/rules/patterns/no-unused-labels.js'
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
    getSource: () => 'label: { break label; }',
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

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createLabeledStatement(label: unknown, line = 1, column = 0): unknown {
  return {
    type: 'LabeledStatement',
    label,
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createBreakStatement(label: unknown | null = null, line = 1, column = 0): unknown {
  return {
    type: 'BreakStatement',
    label,
    loc: {
      start: { line, column },
      end: { line, column: 5 },
    },
  }
}

function createContinueStatement(label: unknown | null = null, line = 1, column = 0): unknown {
  return {
    type: 'ContinueStatement',
    label,
    loc: {
      start: { line, column },
      end: { line, column: 8 },
    },
  }
}

function createProgram(): unknown {
  return {
    type: 'Program',
    body: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 0 },
    },
  }
}

describe('no-unused-labels rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnusedLabelsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnusedLabelsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnusedLabelsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnusedLabelsRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention unused labels in description', () => {
      expect(noUnusedLabelsRule.meta.docs?.description.toLowerCase()).toContain('unused')
    })
  })

  describe('create', () => {
    test('should return visitor with LabeledStatement method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(visitor).toHaveProperty('LabeledStatement')
    })

    test('should return visitor with BreakStatement method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(visitor).toHaveProperty('BreakStatement')
    })

    test('should return visitor with ContinueStatement method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(visitor).toHaveProperty('ContinueStatement')
    })

    test('should return visitor with Program:exit method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(visitor).toHaveProperty('Program:exit')
    })

    test('LabeledStatement should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(typeof visitor.LabeledStatement).toBe('function')
    })

    test('BreakStatement should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(typeof visitor.BreakStatement).toBe('function')
    })

    test('ContinueStatement should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(typeof visitor.ContinueStatement).toBe('function')
    })

    test('Program:exit should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(typeof visitor['Program:exit']).toBe('function')
    })
  })

  describe('valid cases', () => {
    test('should not report label used by break statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('loop')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label used by continue statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('loop')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report multiple labels each used once', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('outer')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('inner')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('outer')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('inner')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label used multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('loop')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('loop')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report break without label when no labels exist', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.BreakStatement(createBreakStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report continue without label when no labels exist', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.ContinueStatement(createContinueStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should report label when matching break appears after Program:exit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      visitor['Program:exit'](createProgram())
      visitor.BreakStatement(createBreakStatement(createIdentifier('loop')))

      expect(reports.length).toBe(1)
    })
  })

  describe('invalid cases', () => {
    test('should report unused label', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('unused')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unused')
      expect(reports[0].message).toContain('unused')
    })

    test('should report multiple unused labels', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label1')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label2')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label3')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(3)
    })

    test('should report partially unused labels', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('used')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('unused')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('used')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unused')
    })

    test('should report correct location for unused label', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('unused'), 10, 5))
      visitor['Program:exit'](createProgram())

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report message with label name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('myLabel')))
      visitor['Program:exit'](createProgram())

      expect(reports[0].message).toContain('myLabel')
    })

    test('should report only unused labels, not used ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('used1')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('unused')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('used2')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('used1')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('used2')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unused')
    })

    test('should report label used by wrong type of statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('blockLabel')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('differentLabel')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('blockLabel')
    })
  })

  describe('edge cases', () => {
    test('should handle null LabeledStatement node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.LabeledStatement(null)).not.toThrow()
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle undefined LabeledStatement node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.LabeledStatement(undefined)).not.toThrow()
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle null BreakStatement node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.BreakStatement(null)).not.toThrow()
    })

    test('should handle undefined BreakStatement node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.BreakStatement(undefined)).not.toThrow()
    })

    test('should handle null ContinueStatement node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.ContinueStatement(null)).not.toThrow()
    })

    test('should handle undefined ContinueStatement node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.ContinueStatement(undefined)).not.toThrow()
    })

    test('should handle LabeledStatement without label property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle BreakStatement without label property', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'BreakStatement',
      }
      visitor.BreakStatement(node)
    })

    test('should handle ContinueStatement without label property', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'ContinueStatement',
      }
      visitor.ContinueStatement(node)
    })

    test('should handle LabeledStatement with non-Identifier label', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: { type: 'Literal', value: 'label' },
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle BreakStatement with non-Identifier label', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'BreakStatement',
        label: { type: 'Literal', value: 'label' },
      }
      visitor.BreakStatement(node)
    })

    test('should handle ContinueStatement with non-Identifier label', () => {
      const { context } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'ContinueStatement',
        label: { type: 'Literal', value: 'label' },
      }
      visitor.ContinueStatement(node)
    })

    test('should handle multiple Program:exit calls correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('unused')))
      visitor['Program:exit'](createProgram())
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(2)
    })

    test('should handle label without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedLabelsRule.create(context)

      const labelNode = { type: 'Identifier', name: 'unused' }
      const statementNode = {
        type: 'LabeledStatement',
        label: labelNode,
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(statementNode)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })
  })
})
