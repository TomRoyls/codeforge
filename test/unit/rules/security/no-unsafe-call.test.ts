import { describe, test, expect, vi } from 'vitest'
import { noUnsafeCallRule } from '../../../../src/rules/security/no-unsafe-call.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({ message: descriptor.message, loc: descriptor.loc })
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
  return { context, reports }
}

function createAsAnyCall(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: varName },
      typeAnnotation: { type: 'TSAnyKeyword' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createMemberCallOnAny(objName: string, method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: objName },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: method },
      computed: false,
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createNormalCall(funcName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: funcName },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + funcName.length + 2 } },
  }
}

function createNonAnyCastCall(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: varName },
      typeAnnotation: { type: 'TSStringKeyword' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createNewAsAny(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: varName },
      typeAnnotation: { type: 'TSAnyKeyword' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 19 } },
  }
}

function createNonCallExpression(): unknown {
  return {
    type: 'Identifier',
    name: 'x',
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
  }
}

describe('no-unsafe-call rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeCallRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeCallRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeCallRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noUnsafeCallRule.meta.docs?.category).toBe('security')
    })

    test('should mention unsafe and call in description', () => {
      const desc = noUnsafeCallRule.meta.docs?.description ?? ''
      expect(desc.toLowerCase()).toContain('unsafe')
      expect(desc.toLowerCase()).toContain('call')
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detection', () => {
    test('should detect (x as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (obj as any)()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('obj'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (x as any).method()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('x', 'method'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (data as any).fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createMemberCallOnAny('data', 'fn'))
      expect(reports).toHaveLength(1)
    })

    test('should detect new (x as any)() via NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.NewExpression!(createNewAsAny('x'))
      expect(reports).toHaveLength(1)
    })
  })

  describe('negative cases', () => {
    test('should NOT report regularFunction()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNormalCall('regularFunction'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT report (x as string)() - non-any cast', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNonAnyCastCall('x'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT report null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(null)
      expect(reports).toHaveLength(0)
    })

    test('should NOT report non-CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createNonCallExpression())
      expect(reports).toHaveLength(0)
    })
  })

  describe('message and location', () => {
    test('message should mention unsafe and any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x'))
      expect(reports[0].message.toLowerCase()).toContain('unsafe')
      expect(reports[0].message.toLowerCase()).toContain('any')
    })

    test('should report location with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x', 5, 10))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc!.start.line).toBe(5)
      expect(reports[0].loc!.start.column).toBe(10)
    })
  })

  describe('multiple violations', () => {
    test('should report each violation independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeCallRule.create(context)
      visitor.CallExpression!(createAsAnyCall('x', 1))
      visitor.CallExpression!(createAsAnyCall('y', 2))
      visitor.CallExpression!(createAsAnyCall('z', 3))
      expect(reports).toHaveLength(3)
    })
  })
})
