import { describe, test, expect, vi } from 'vitest'
import { noUnsafeMemberAccessRule } from '../../../../src/rules/security/no-unsafe-member-access.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(options?: Record<string, unknown>): {
  context: RuleContext
  reports: ReportDescriptor[]
} {
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
    config: { options: options ? [options] : [] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

function createAnyMemberAccess(
  objName: string,
  prop: string,
  options: { optional?: boolean; computed?: boolean; line?: number } = {},
): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: objName },
      typeAnnotation: { type: 'TSAnyKeyword' },
    },
    property: options.computed
      ? { type: 'Literal', value: prop }
      : { type: 'Identifier', name: prop },
    computed: options.computed ?? false,
    optional: options.optional ?? false,
    loc: {
      start: { line: options.line ?? 1, column: 0 },
      end: { line: options.line ?? 1, column: 20 },
    },
  }
}

function createNestedAnyMemberAccess(objName: string, props: string[], line = 1): unknown {
  let current: Record<string, unknown> = {
    type: 'TSAsExpression',
    expression: { type: 'Identifier', name: objName },
    typeAnnotation: { type: 'TSAnyKeyword' },
  }

  for (const prop of props) {
    current = {
      type: 'MemberExpression',
      object: { ...current },
      property: { type: 'Identifier', name: prop },
      computed: false,
      optional: false,
    }
  }

  return {
    ...current,
    loc: { start: { line, column: 0 }, end: { line, column: 25 } },
  }
}

function createNormalMemberAccess(objName: string, prop: string): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: objName },
    property: { type: 'Identifier', name: prop },
    computed: false,
    optional: false,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
  }
}

function createNonAnyCastMemberAccess(objName: string, prop: string): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: objName },
      typeAnnotation: { type: 'TSStringKeyword' },
    },
    property: { type: 'Identifier', name: prop },
    computed: false,
    optional: false,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createNonMemberExpression(): unknown {
  return {
    type: 'Identifier',
    name: 'x',
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
  }
}

describe('no-unsafe-member-access rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeMemberAccessRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeMemberAccessRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeMemberAccessRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noUnsafeMemberAccessRule.meta.docs?.category).toBe('security')
    })

    test('should mention unsafe and member in description', () => {
      const desc = noUnsafeMemberAccessRule.meta.docs?.description ?? ''
      expect(desc.toLowerCase()).toContain('unsafe')
      expect(desc.toLowerCase()).toContain('member')
    })
  })

  describe('create', () => {
    test('should return visitor with MemberExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      expect(typeof visitor.MemberExpression).toBe('function')
    })
  })

  describe('detection', () => {
    test('should detect (x as any).property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createAnyMemberAccess('x', 'property'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (obj as any).method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createAnyMemberAccess('obj', 'method'))
      expect(reports).toHaveLength(1)
    })

    test('should detect (x as any).nested.deep via nested chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['nested', 'deep']))
      expect(reports).toHaveLength(1)
    })

    test('should detect (x as any)["key"] computed access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createAnyMemberAccess('x', 'key', { computed: true }))
      expect(reports).toHaveLength(1)
    })
  })

  describe('negative cases', () => {
    test('should NOT report obj.property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createNormalMemberAccess('obj', 'property'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT report window.location (normal chain)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createNormalMemberAccess('window', 'location'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT report (x as string).length - non-any cast', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createNonAnyCastMemberAccess('x', 'length'))
      expect(reports).toHaveLength(0)
    })

    test('should NOT report null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(null)
      expect(reports).toHaveLength(0)
    })

    test('should NOT report non-MemberExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createNonMemberExpression())
      expect(reports).toHaveLength(0)
    })
  })

  describe('allowOptionalChaining option', () => {
    test('with allowOptionalChaining=true should NOT report (x as any)?.prop', () => {
      const { context, reports } = createMockContext({ allowOptionalChaining: true })
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: true }))
      expect(reports).toHaveLength(0)
    })

    test('with allowOptionalChaining=false (default) should report (x as any)?.prop', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: true }))
      expect(reports).toHaveLength(1)
    })
  })

  describe('message and location', () => {
    test('message should mention unsafe and any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createAnyMemberAccess('x', 'property'))
      expect(reports[0].message.toLowerCase()).toContain('unsafe')
      expect(reports[0].message.toLowerCase()).toContain('any')
    })

    test('should report location with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createAnyMemberAccess('x', 'property', { line: 5 }))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc!.start.line).toBe(5)
    })
  })

  describe('multiple violations', () => {
    test('should report each violation independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeMemberAccessRule.create(context)
      visitor.MemberExpression!(createAnyMemberAccess('x', 'a', { line: 1 }))
      visitor.MemberExpression!(createAnyMemberAccess('y', 'b', { line: 2 }))
      visitor.MemberExpression!(createAnyMemberAccess('z', 'c', { line: 3 }))
      expect(reports).toHaveLength(3)
    })
  })
})
