import { describe, test, expect, vi } from 'vitest'
import { noUnusedLabelsRule } from '../../../../src/rules/patterns/no-unused-labels.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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

    test('should have empty schema array', () => {
      expect(noUnusedLabelsRule.meta.schema).toEqual([])
    })

    test('should have fixable as undefined', () => {
      expect(noUnusedLabelsRule.meta.fixable).toBeUndefined()
    })

    test('should have docs property', () => {
      expect(noUnusedLabelsRule.meta.docs).toBeDefined()
    })

    test('should have description as string', () => {
      expect(typeof noUnusedLabelsRule.meta.docs?.description).toBe('string')
    })

    test('should have category as string', () => {
      expect(typeof noUnusedLabelsRule.meta.docs?.category).toBe('string')
    })

    test('should have type as string', () => {
      expect(typeof noUnusedLabelsRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noUnusedLabelsRule.meta.severity).toBe('string')
    })

    test('description should mention labels', () => {
      expect(noUnusedLabelsRule.meta.docs?.description.toLowerCase()).toContain('label')
    })

    test('description should be non-empty', () => {
      expect(noUnusedLabelsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have create method', () => {
      expect(typeof noUnusedLabelsRule.create).toBe('function')
    })

    test('should have meta property', () => {
      expect(noUnusedLabelsRule.meta).toBeDefined()
    })

    test('recommended should be boolean', () => {
      expect(typeof noUnusedLabelsRule.meta.docs?.recommended).toBe('boolean')
    })

    test('schema should be an array', () => {
      expect(Array.isArray(noUnusedLabelsRule.meta.schema)).toBe(true)
    })

    test('description should end with period', () => {
      expect(noUnusedLabelsRule.meta.docs?.description.endsWith('.')).toBe(true)
    })

    test('should be exported as default', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = noUnusedLabelsRule
      expect(mod).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor with LabeledStatement method', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(visitor).toHaveProperty('LabeledStatement')
    })

    test('should return visitor with BreakStatement method', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(visitor).toHaveProperty('BreakStatement')
    })

    test('should return visitor with ContinueStatement method', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(visitor).toHaveProperty('ContinueStatement')
    })

    test('should return visitor with Program:exit method', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(visitor).toHaveProperty('Program:exit')
    })

    test('LabeledStatement should be a function', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(typeof visitor.LabeledStatement).toBe('function')
    })

    test('BreakStatement should be a function', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(typeof visitor.BreakStatement).toBe('function')
    })

    test('ContinueStatement should be a function', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(typeof visitor.ContinueStatement).toBe('function')
    })

    test('Program:exit should be a function', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(typeof visitor['Program:exit']).toBe('function')
    })

    test('should return exactly 4 visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const keys = Object.keys(visitor)
      expect(keys).toHaveLength(4)
    })

    test('visitor keys should include all expected methods', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const keys = Object.keys(visitor)
      expect(keys).toContain('LabeledStatement')
      expect(keys).toContain('BreakStatement')
      expect(keys).toContain('ContinueStatement')
      expect(keys).toContain('Program:exit')
    })

    test('create should return a new visitor each time', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor1 = noUnusedLabelsRule.create(context)
      const visitor2 = noUnusedLabelsRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('two visitors should maintain independent state', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'label: { break label; }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'label: { break label; }' })
      const v1 = noUnusedLabelsRule.create(ctx1)
      const v2 = noUnusedLabelsRule.create(ctx2)

      v1.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      v2.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      v1.BreakStatement(createBreakStatement(createIdentifier('a')))
      v1['Program:exit'](createProgram())
      v2['Program:exit'](createProgram())

      expect(r1.length).toBe(0)
      expect(r2.length).toBe(1)
      expect(r2[0].message).toContain('b')
    })

    test('LabeledStatement and BreakStatement should be different functions', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(visitor.LabeledStatement).not.toBe(visitor.BreakStatement)
    })

    test('ContinueStatement and Program:exit should be different functions', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(visitor.ContinueStatement).not.toBe(visitor['Program:exit'])
    })

    test('LabeledStatement should not throw when called', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() =>
        visitor.LabeledStatement(createLabeledStatement(createIdentifier('x'))),
      ).not.toThrow()
    })

    test('BreakStatement should not throw when called', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() =>
        visitor.BreakStatement(createBreakStatement(createIdentifier('x'))),
      ).not.toThrow()
    })

    test('ContinueStatement should not throw when called', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() =>
        visitor.ContinueStatement(createContinueStatement(createIdentifier('x'))),
      ).not.toThrow()
    })

    test('Program:exit should not throw when called', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor['Program:exit'](createProgram())).not.toThrow()
    })

    test('visitor should not have unexpected methods', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(visitor).not.toHaveProperty('ExpressionStatement')
      expect(visitor).not.toHaveProperty('IfStatement')
      expect(visitor).not.toHaveProperty('WhileStatement')
    })
  })

  describe('valid cases', () => {
    test('should not report label used by break statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('loop')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label used by continue statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('loop')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report multiple labels each used once', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('outer')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('inner')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('outer')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('inner')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label used multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('loop')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('loop')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report break without label when no labels exist', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.BreakStatement(createBreakStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report continue without label when no labels exist', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.ContinueStatement(createContinueStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should report label when matching break appears after Program:exit', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      visitor['Program:exit'](createProgram())
      visitor.BreakStatement(createBreakStatement(createIdentifier('loop')))

      expect(reports.length).toBe(1)
    })

    test('should not report label used by both break and continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('loop')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('loop')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report single-character label used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('x')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label with underscore used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('_private')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('_private')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label with numbers in name used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loop2')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('loop2')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label with camelCase used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('myCustomLabel')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('myCustomLabel')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label with UPPER_CASE used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('MY_LABEL')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('MY_LABEL')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report long label name used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const longName = 'veryLongLabelNameThatGoesOnAndOn'
      visitor.LabeledStatement(createLabeledStatement(createIdentifier(longName)))
      visitor.BreakStatement(createBreakStatement(createIdentifier(longName)))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label used by continue only', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('skip')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('skip')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label used by multiple break statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('target')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('target')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('target')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('target')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label used by multiple continue statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('repeat')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('repeat')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('repeat')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report two labels each used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('a')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('b')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report two labels each used by continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('y')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('x')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('y')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should report when break comes before label declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.BreakStatement(createBreakStatement(createIdentifier('label')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should report when continue comes before label declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.ContinueStatement(createContinueStatement(createIdentifier('label')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should not report break without label when labels exist', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('used')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('used')))
      visitor.BreakStatement(createBreakStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report continue without label when labels exist', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('used')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('used')))
      visitor.ContinueStatement(createContinueStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when both break and continue are unlabeled', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.BreakStatement(createBreakStatement(null))
      visitor.ContinueStatement(createContinueStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report three labels all used', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('c')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('a')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('b')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('c')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report four labels all used', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('w')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('y')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('z')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('w')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('x')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('y')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('z')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report five labels all used by breaks', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      for (const name of ['a', 'b', 'c', 'd', 'e']) {
        visitor.LabeledStatement(createLabeledStatement(createIdentifier(name)))
      }
      for (const name of ['a', 'b', 'c', 'd', 'e']) {
        visitor.BreakStatement(createBreakStatement(createIdentifier(name)))
      }
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when label is used by break followed by continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('l')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('l')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('l')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when label is used by continue followed by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('l')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('l')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('l')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label with dollar sign used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('$label')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('$label')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when Program:exit is called with no labels and no statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when only breaks exist with no labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.BreakStatement(createBreakStatement(null))
      visitor.BreakStatement(createBreakStatement(null))
      visitor.BreakStatement(createBreakStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when only continues exist with no labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.ContinueStatement(createContinueStatement(null))
      visitor.ContinueStatement(createContinueStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label used by break at different line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('target', 1, 0)))
      visitor.BreakStatement(createBreakStatement(createIdentifier('target', 10, 5)))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label used by continue at different line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('target', 2, 4)))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('target', 50, 0)))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report single label used by single break with interleaved other labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('outer')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('inner')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('outer')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('inner')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when label name is used as break target after being declared', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('foo')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('foo')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label when break and continue both reference it', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('combined')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('combined')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('combined')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('combined')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when break references existing label that was declared late', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.BreakStatement(createBreakStatement(createIdentifier('lateLabel')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('lateLabel')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('lateLabel')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should not report label with unicode-like name used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('labelName')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('labelName')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report many labels used in alternating pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const names = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8']
      for (const name of names) {
        visitor.LabeledStatement(createLabeledStatement(createIdentifier(name)))
      }
      for (const name of names) {
        visitor.BreakStatement(createBreakStatement(createIdentifier(name)))
      }
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label used by continue among many unused labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('used')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('used')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('used')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when no handlers are called at all', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      noUnusedLabelsRule.create(context)

      expect(reports.length).toBe(0)
    })

    test('should not report label with trailing underscore used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label_')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('label_')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label with leading underscore and numbers used by continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('_loop123')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('_loop123')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report ten labels all used by various statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const names = ['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9']
      for (const name of names) {
        visitor.LabeledStatement(createLabeledStatement(createIdentifier(name)))
      }
      for (const [i, name] of names.entries()) {
        if (i % 2 === 0) {
          visitor.BreakStatement(createBreakStatement(createIdentifier(name)))
        } else {
          visitor.ContinueStatement(createContinueStatement(createIdentifier(name)))
        }
      }
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report label declared twice with same name used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('dup')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('dup')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('dup')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when break references a label that has not been declared yet', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.BreakStatement(createBreakStatement(createIdentifier('nonexistent')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when continue references a label that has not been declared', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.ContinueStatement(createContinueStatement(createIdentifier('nonexistent')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report unused label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('unused')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unused')
      expect(reports[0].message).toContain('unused')
    })

    test('should report multiple unused labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label1')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label2')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label3')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(3)
    })

    test('should report partially unused labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('used')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('unused')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('used')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unused')
    })

    test('should report correct location for unused label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('unused'), 10, 5))
      visitor['Program:exit'](createProgram())

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report message with label name', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('myLabel')))
      visitor['Program:exit'](createProgram())

      expect(reports[0].message).toContain('myLabel')
    })

    test('should report only unused labels, not used ones', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
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
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('blockLabel')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('differentLabel')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('blockLabel')
    })

    test('should report single-character unused label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report unused label with underscore prefix', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('_unused')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_unused')
    })

    test('should report unused label with numbers in name', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label42')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('label42')
    })

    test('should report unused camelCase label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('myUnusedLabel')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myUnusedLabel')
    })

    test('should report unused UPPER_CASE label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('UNUSED')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('UNUSED')
    })

    test('should report two unused labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(2)
    })

    test('should report five unused labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      for (const name of ['a', 'b', 'c', 'd', 'e']) {
        visitor.LabeledStatement(createLabeledStatement(createIdentifier(name)))
      }
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(5)
    })

    test('should report ten unused labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.LabeledStatement(createLabeledStatement(createIdentifier(`label${i}`)))
      }
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(10)
    })

    test('should report unused label with correct message format', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('testLabel')))
      visitor['Program:exit'](createProgram())

      expect(reports[0].message).toBe("Unused label 'testLabel'.")
    })

    test('should report unused label message starting with Unused', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('foo')))
      visitor['Program:exit'](createProgram())

      expect(reports[0].message.startsWith('Unused')).toBe(true)
    })

    test('should report label name in single quotes', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('bar')))
      visitor['Program:exit'](createProgram())

      expect(reports[0].message).toContain("'bar'")
    })

    test('should report label when break references different label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('first')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('second')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('first')
    })

    test('should report label when continue references different label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('target')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('other')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('target')
    })

    test('should report two labels when break references third non-existent one', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('c')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(2)
    })

    test('should report label as unused when only unlabeled break exists', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('alone')))
      visitor.BreakStatement(createBreakStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('alone')
    })

    test('should report label as unused when only unlabeled continue exists', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('alone')))
      visitor.ContinueStatement(createContinueStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should report all labels when none are referenced', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('alpha')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('beta')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('gamma')))
      visitor.BreakStatement(createBreakStatement(null))
      visitor.ContinueStatement(createContinueStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(3)
    })

    test('should report unused label at specific line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('here'), 1, 0))
      visitor['Program:exit'](createProgram())

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report unused label at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('deep'), 500, 20))
      visitor['Program:exit'](createProgram())

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report each unused label with its own correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a'), 2, 0))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b'), 4, 8))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(4)
      expect(reports[1].loc?.start.column).toBe(8)
    })

    test('should report label when case-sensitive name does not match break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Loop')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('loop')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Loop')
    })

    test('should report label when case-sensitive name does not match continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('LOOP')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('loop')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should report first of two labels when only second is used', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('firstUnused')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('secondUsed')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('secondUsed')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('firstUnused')
    })

    test('should report second of two labels when only first is used', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('firstUsed')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('secondUnused')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('firstUsed')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('secondUnused')
    })

    test('should report middle label unused when first and last are used', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('first')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('middle')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('last')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('first')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('last')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('middle')
    })

    test('should report label when break targets completely unrelated name', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('abc')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('xyz')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should report unused label with dollar sign', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('$unused')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$unused')
    })

    test('should report unused label with trailing underscore', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label_')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should report when break uses wrong label among multiple labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('c')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('a')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(2)
    })

    test('should report when continue uses wrong label among multiple labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('y')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('x')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('y')
    })

    test('should report when label has very long name', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const longName = 'thisIsAVeryVeryVeryLongLabelNameThatGoesOnAndOnAndOn'
      visitor.LabeledStatement(createLabeledStatement(createIdentifier(longName)))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longName)
    })

    test('should report when label is declared but break targets non-existent label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('existing')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('nonexistent')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('existing')
    })

    test('should report when label is declared but continue targets non-existent label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('existing')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('nonexistent')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should report unused label with message ending in period', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('lbl')))
      visitor['Program:exit'](createProgram())

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should report location object with start property', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('loc'), 5, 10))
      visitor['Program:exit'](createProgram())

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report all labels when multiple are declared with same name and none used', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('dup'), 1, 0))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('dup'), 2, 0))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should report when only Program:exit is called with one label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('lonely')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should not report when label name matches but differs in case for break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('Label')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('label')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should report when break references label not in scope', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('scopeA')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('scopeB')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should report all three labels when break uses fourth non-existent one', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('l1')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('l2')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('l3')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('l4')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(3)
    })
  })

  describe('edge cases', () => {
    test('should handle null LabeledStatement node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.LabeledStatement(null)).not.toThrow()
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle undefined LabeledStatement node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.LabeledStatement(undefined)).not.toThrow()
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle null BreakStatement node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.BreakStatement(null)).not.toThrow()
    })

    test('should handle undefined BreakStatement node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.BreakStatement(undefined)).not.toThrow()
    })

    test('should handle null ContinueStatement node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.ContinueStatement(null)).not.toThrow()
    })

    test('should handle undefined ContinueStatement node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.ContinueStatement(undefined)).not.toThrow()
    })

    test('should handle LabeledStatement without label property', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
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
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'BreakStatement',
      }
      visitor.BreakStatement(node)
    })

    test('should handle ContinueStatement without label property', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'ContinueStatement',
      }
      visitor.ContinueStatement(node)
    })

    test('should handle LabeledStatement with non-Identifier label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
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
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'BreakStatement',
        label: { type: 'Literal', value: 'label' },
      }
      visitor.BreakStatement(node)
    })

    test('should handle ContinueStatement with non-Identifier label', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'ContinueStatement',
        label: { type: 'Literal', value: 'label' },
      }
      visitor.ContinueStatement(node)
    })

    test('should handle multiple Program:exit calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('unused')))
      visitor['Program:exit'](createProgram())
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(2)
    })

    test('should handle label without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
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

    test('should handle empty string label name', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("''")
    })

    test('should handle LabeledStatement with empty body', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('empty'),
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle LabeledStatement with ExpressionStatement body', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('expr'),
        body: { type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle LabeledStatement with WhileStatement body', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('whileLabel'),
        body: { type: 'WhileStatement', test: { type: 'Literal', value: true } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle LabeledStatement with ForStatement body', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('forLabel'),
        body: { type: 'ForStatement' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.LabeledStatement(node)
      visitor.BreakStatement(createBreakStatement(createIdentifier('forLabel')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle string node as LabeledStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.LabeledStatement('not a node')).not.toThrow()
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle number node as LabeledStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.LabeledStatement(42)).not.toThrow()
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node as LabeledStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.LabeledStatement(true)).not.toThrow()
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle string node as BreakStatement', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.BreakStatement('not a node')).not.toThrow()
    })

    test('should handle number node as BreakStatement', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.BreakStatement(123)).not.toThrow()
    })

    test('should handle string node as ContinueStatement', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.ContinueStatement('not a node')).not.toThrow()
    })

    test('should handle number node as ContinueStatement', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.ContinueStatement(456)).not.toThrow()
    })

    test('should handle LabeledStatement with label as string instead of Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: 'notAnObject',
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle BreakStatement with label as string instead of Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('test')))
      const node = {
        type: 'BreakStatement',
        label: 'notAnObject',
      }
      visitor.BreakStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle ContinueStatement with label as string instead of Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('test')))
      const node = {
        type: 'ContinueStatement',
        label: 'notAnObject',
      }
      visitor.ContinueStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle LabeledStatement with null label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: null,
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle LabeledStatement with undefined label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: undefined,
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle LabeledStatement with Identifier label missing name', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: { type: 'Identifier' },
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle BreakStatement with Identifier label missing name', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('test')))
      const node = {
        type: 'BreakStatement',
        label: { type: 'Identifier' },
      }
      visitor.BreakStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle Program:exit with null argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(() => visitor['Program:exit'](null)).not.toThrow()

      expect(reports.length).toBe(1)
    })

    test('should handle Program:exit with undefined argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('x')))
      expect(() => visitor['Program:exit'](undefined)).not.toThrow()

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('extra'),
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10],
        extra: true,
        comments: [],
      }
      visitor.LabeledStatement(node)
      visitor.BreakStatement(createBreakStatement(createIdentifier('extra')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string for LabeledStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'WrongType',
        label: createIdentifier('wrong'),
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string for BreakStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('test')))
      const node = {
        type: 'WrongType',
        label: createIdentifier('test'),
      }
      visitor.BreakStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle node with wrong type string for ContinueStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('test')))
      const node = {
        type: 'WrongType',
        label: createIdentifier('test'),
      }
      visitor.ContinueStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle empty object as LabeledStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement({})
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle empty object as BreakStatement node', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.BreakStatement({})).not.toThrow()
    })

    test('should handle empty object as ContinueStatement node', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.ContinueStatement({})).not.toThrow()
    })

    test('should handle array as LabeledStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.LabeledStatement([])).not.toThrow()
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle array as BreakStatement node', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => visitor.BreakStatement([])).not.toThrow()
    })

    test('should handle LabeledStatement with numeric label name', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('label123')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('label123')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle calling create with different context objects', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'label: { break label; }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'label: { break label; }' })

      const v1 = noUnusedLabelsRule.create(ctx1)
      const v2 = noUnusedLabelsRule.create(ctx2)

      v1.LabeledStatement(createLabeledStatement(createIdentifier('only1')))
      v2.LabeledStatement(createLabeledStatement(createIdentifier('only2')))
      v2.BreakStatement(createBreakStatement(createIdentifier('only2')))
      v1['Program:exit'](createProgram())
      v2['Program:exit'](createProgram())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle Program:exit called before any other handlers', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor['Program:exit'](createProgram())
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('late')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('late')))

      expect(reports.length).toBe(0)
    })

    test('should handle many Program:exit calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      for (let i = 0; i < 10; i++) {
        visitor['Program:exit'](createProgram())
      }

      expect(reports.length).toBe(10)
    })

    test('should handle label without name property on identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const labelNode = { type: 'Identifier' }
      const node = {
        type: 'LabeledStatement',
        label: labelNode,
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
    })

    test('should handle identifier label with numeric name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const labelNode = { type: 'Identifier', name: 42 }
      const node = {
        type: 'LabeledStatement',
        label: labelNode,
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle LabeledStatement with deeply nested body', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('deep'),
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'BlockStatement',
              body: [
                {
                  type: 'BlockStatement',
                  body: [],
                },
              ],
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle BreakStatement with false as label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('test')))
      const node = {
        type: 'BreakStatement',
        label: false,
      }
      visitor.BreakStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle BreakStatement with 0 as label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('test')))
      const node = {
        type: 'BreakStatement',
        label: 0,
      }
      visitor.BreakStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle ContinueStatement with empty string as label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('')))
      const node = {
        type: 'ContinueStatement',
        label: createIdentifier(''),
      }
      visitor.ContinueStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle duplicate label name where second overwrites first', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('dup'), 1, 0))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('dup'), 5, 0))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should handle mixed malformed nodes with valid ones', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('valid')))
      visitor.LabeledStatement(null)
      visitor.LabeledStatement({})
      visitor.BreakStatement(createBreakStatement(createIdentifier('valid')))
      visitor.BreakStatement(null)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle identifier label with object as name', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const labelNode = { type: 'Identifier', name: { toString: () => 'objName' } }
      const node = {
        type: 'LabeledStatement',
        label: labelNode,
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle context.report being called with correct descriptor shape', () => {
      let capturedDescriptor: ReportDescriptor | undefined
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          capturedDescriptor = descriptor
          reports.push(descriptor)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnusedLabelsRule.create(context)
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('check'), 3, 7))
      visitor['Program:exit'](createProgram())

      expect(capturedDescriptor).toBeDefined()
      expect(capturedDescriptor?.message).toBe("Unused label 'check'.")
      expect(capturedDescriptor?.loc).toBeDefined()
      expect(capturedDescriptor?.loc?.start.line).toBe(3)
      expect(capturedDescriptor?.loc?.start.column).toBe(7)
    })

    test('should handle calling LabeledStatement handler with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => {
        visitor.LabeledStatement()
      }).not.toThrow()
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle calling BreakStatement handler with no arguments', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => {
        visitor.BreakStatement()
      }).not.toThrow()
    })

    test('should handle calling ContinueStatement handler with no arguments', () => {
      const { context } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      expect(() => {
        visitor.ContinueStatement()
      }).not.toThrow()
    })

    test('should handle LabeledStatement with FunctionDeclaration body', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('funcLabel'),
        body: { type: 'FunctionDeclaration', id: createIdentifier('fn') },
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      visitor.LabeledStatement(node)
      visitor.BreakStatement(createBreakStatement(createIdentifier('funcLabel')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle LabeledStatement with SwitchStatement body used by break', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('switchLabel'),
        body: { type: 'SwitchStatement' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.LabeledStatement(node)
      visitor.BreakStatement(createBreakStatement(createIdentifier('switchLabel')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not crash when context.report throws', () => {
      const context = {
        report: () => {
          throw new Error('report failed')
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnusedLabelsRule.create(context)
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('crash')))

      expect(() => visitor['Program:exit'](createProgram())).toThrow('report failed')
    })

    test('should handle label name that is a JavaScript keyword', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('function')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('function')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle label name that is a reserved word unused', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('class')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('class')
    })

    test('should handle label with name containing only underscores', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('___')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('___')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle label with name containing only underscores unused', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('___')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle label with name containing dollar signs', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('$')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('$')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle Program:exit being the only call ever', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle very high line and column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('far'), 99999, 99998))
      visitor['Program:exit'](createProgram())

      expect(reports[0].loc?.start.line).toBe(99999)
      expect(reports[0].loc?.start.column).toBe(99998)
    })

    test('should handle zero line and column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('zero'), 0, 0))
      visitor['Program:exit'](createProgram())

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle break that references label before label is registered', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.BreakStatement(createBreakStatement(createIdentifier('future')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('future')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle continue that references label before label is registered', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.ContinueStatement(createContinueStatement(createIdentifier('future')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('future')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle many rapid create/destroy cycles without interference', () => {
      for (let i = 0; i < 5; i++) {
        const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
        const visitor = noUnusedLabelsRule.create(context)

        visitor.LabeledStatement(createLabeledStatement(createIdentifier(`label${i}`)))
        visitor['Program:exit'](createProgram())

        expect(reports.length).toBe(1)
      }
    })

    test('should handle LabeledStatement with body as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('nullBody'),
        body: null,
      }
      visitor.LabeledStatement(node)
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })
  })

  describe('scenarios', () => {
    test('should handle nested loop pattern with outer label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('outerLoop')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('outerLoop')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle switch-case with label break pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('switchCase')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('switchCase')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle for-loop with continue label pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('forLoop')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('forLoop')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('forLoop')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle multiple nested labels all used', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('level1')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('level2')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('level3')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('level1')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('level2')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('level3')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle multiple nested labels with some unused', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('level1')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('level2')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('level3')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('level1')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(2)
      const names = reports.map((r) => {
        const match = r.message.match(/'([^']+)'/)
        return match ? match[1] : ''
      })
      expect(names).toContain('level2')
      expect(names).toContain('level3')
    })

    test('should handle single label in entire file', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('onlyOne')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("Unused label 'onlyOne'.")
    })

    test('should handle no labels no breaks no continues', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle only breaks no labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.BreakStatement(createBreakStatement(null))
      visitor.BreakStatement(createBreakStatement(null))
      visitor.BreakStatement(createBreakStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle only continues no labels', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.ContinueStatement(createContinueStatement(null))
      visitor.ContinueStatement(createContinueStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle labels with break targeting wrong case', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('myLabel')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('mylabel')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
    })

    test('should handle interleaved labels and breaks correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('b')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('c')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('c')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle interleaved with one unused', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('c')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('c')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should handle label followed by many unrelated breaks', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('target')))
      for (const wrong of ['a', 'b', 'c', 'd', 'e']) {
        visitor.BreakStatement(createBreakStatement(createIdentifier(wrong)))
      }
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('target')
    })

    test('should handle continue then break for same label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('lbl')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('lbl')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('lbl')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle break then continue for same label', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('lbl')))
      visitor.BreakStatement(createBreakStatement(createIdentifier('lbl')))
      visitor.ContinueStatement(createContinueStatement(createIdentifier('lbl')))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle all labels unused with many break/continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      visitor.LabeledStatement(createLabeledStatement(createIdentifier('a')))
      visitor.LabeledStatement(createLabeledStatement(createIdentifier('b')))
      visitor.BreakStatement(createBreakStatement(null))
      visitor.ContinueStatement(createContinueStatement(null))
      visitor.BreakStatement(createBreakStatement(null))
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(2)
    })

    test('should handle 20 labels all used', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.LabeledStatement(createLabeledStatement(createIdentifier(`label${i}`)))
      }
      for (let i = 0; i < 20; i++) {
        visitor.BreakStatement(createBreakStatement(createIdentifier(`label${i}`)))
      }
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(0)
    })

    test('should handle 20 labels none used', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.LabeledStatement(createLabeledStatement(createIdentifier(`label${i}`)))
      }
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(20)
    })

    test('should handle 15 labels with 5 unused', () => {
      const { context, reports } = createMockRuleContext({ source: 'label: { break label; }' })
      const visitor = noUnusedLabelsRule.create(context)

      for (let i = 0; i < 15; i++) {
        visitor.LabeledStatement(createLabeledStatement(createIdentifier(`l${i}`)))
      }
      for (let i = 0; i < 10; i++) {
        visitor.BreakStatement(createBreakStatement(createIdentifier(`l${i}`)))
      }
      visitor['Program:exit'](createProgram())

      expect(reports.length).toBe(5)
    })
  })
})
