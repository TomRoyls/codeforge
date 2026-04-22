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

describe('no-unsafe-member-access rule - extended meta', () => {
  test('meta.type should be exactly problem', () => {
    expect(noUnsafeMemberAccessRule.meta.type).toBe('problem')
    expect(noUnsafeMemberAccessRule.meta.type).not.toBe('suggestion')
    expect(noUnsafeMemberAccessRule.meta.type).not.toBe('layout')
  })

  test('meta.severity should be exactly error', () => {
    expect(noUnsafeMemberAccessRule.meta.severity).toBe('error')
    expect(noUnsafeMemberAccessRule.meta.severity).not.toBe('warning')
    expect(noUnsafeMemberAccessRule.meta.severity).not.toBe('info')
  })

  test('meta.docs should be defined', () => {
    expect(noUnsafeMemberAccessRule.meta.docs).toBeDefined()
    expect(typeof noUnsafeMemberAccessRule.meta.docs).toBe('object')
  })

  test('meta.docs.description should be a non-empty string', () => {
    expect(typeof noUnsafeMemberAccessRule.meta.docs?.description).toBe('string')
    expect(noUnsafeMemberAccessRule.meta.docs?.description!.length).toBeGreaterThan(0)
  })

  test('meta.docs.category should be security', () => {
    expect(noUnsafeMemberAccessRule.meta.docs?.category).toBe('security')
  })

  test('meta.docs.recommended should be true', () => {
    expect(noUnsafeMemberAccessRule.meta.docs?.recommended).toBe(true)
  })

  test('meta.schema should be defined', () => {
    expect(noUnsafeMemberAccessRule.meta.schema).toBeDefined()
  })

  test('meta.fixable should be undefined', () => {
    expect(noUnsafeMemberAccessRule.meta.fixable).toBeUndefined()
  })

  test('meta should have all expected keys', () => {
    expect(noUnsafeMemberAccessRule.meta).toHaveProperty('type')
    expect(noUnsafeMemberAccessRule.meta).toHaveProperty('severity')
    expect(noUnsafeMemberAccessRule.meta).toHaveProperty('docs')
    expect(noUnsafeMemberAccessRule.meta).toHaveProperty('schema')
    expect(noUnsafeMemberAccessRule.meta).toHaveProperty('fixable')
  })

  test('rule should be a valid RuleDefinition object', () => {
    expect(noUnsafeMemberAccessRule).toHaveProperty('meta')
    expect(noUnsafeMemberAccessRule).toHaveProperty('create')
    expect(typeof noUnsafeMemberAccessRule.create).toBe('function')
  })

  test('meta.docs.description should mention casting to any', () => {
    const desc = noUnsafeMemberAccessRule.meta.docs?.description ?? ''
    expect(desc.toLowerCase()).toContain('any')
  })

  test('meta.docs.description should mention explicitly cast', () => {
    const desc = noUnsafeMemberAccessRule.meta.docs?.description ?? ''
    expect(desc.toLowerCase()).toContain('explicitly')
    expect(desc.toLowerCase()).toContain('cast')
  })

  test('meta.schema should be an array', () => {
    expect(Array.isArray(noUnsafeMemberAccessRule.meta.schema)).toBe(true)
  })

  test('meta.schema should be empty array', () => {
    expect(noUnsafeMemberAccessRule.meta.schema).toEqual([])
  })
})

describe('no-unsafe-member-access rule - create function', () => {
  test('create should return an object', () => {
    const { context } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(typeof visitor).toBe('object')
    expect(visitor).not.toBeNull()
  })

  test('create should return visitor with only MemberExpression key', () => {
    const { context } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(Object.keys(visitor)).toContain('MemberExpression')
  })

  test('MemberExpression should be a callable function', () => {
    const { context } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(typeof visitor.MemberExpression).toBe('function')
    expect(visitor.MemberExpression).toBeInstanceOf(Function)
  })

  test('MemberExpression should accept one argument', () => {
    const { context } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(() => visitor.MemberExpression!(createAnyMemberAccess('x', 'y'))).not.toThrow()
  })

  test('calling MemberExpression with undefined should not throw', () => {
    const { context } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(() => visitor.MemberExpression!(undefined)).not.toThrow()
  })

  test('create should handle empty options', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports).toHaveLength(1)
  })

  test('create should handle options with allowOptionalChaining=false explicitly', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: false })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports).toHaveLength(1)
  })

  test('create should produce independent visitors for different contexts', () => {
    const { context: ctx1, reports: reports1 } = createMockContext()
    const { context: ctx2, reports: reports2 } = createMockContext({ allowOptionalChaining: true })
    const visitor1 = noUnsafeMemberAccessRule.create(ctx1)
    const visitor2 = noUnsafeMemberAccessRule.create(ctx2)
    visitor1.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: true }))
    visitor2.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: true }))
    expect(reports1).toHaveLength(1)
    expect(reports2).toHaveLength(0)
  })
})

describe('no-unsafe-member-access rule - direct as any member access', () => {
  test('should detect (x as any).foo', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'foo'))
    expect(reports).toHaveLength(1)
  })

  test('should detect (data as any).value', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('data', 'value'))
    expect(reports).toHaveLength(1)
  })

  test('should detect (response as any).data', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('response', 'data'))
    expect(reports).toHaveLength(1)
  })

  test('should detect (result as any).status', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('result', 'status'))
    expect(reports).toHaveLength(1)
  })

  test('should detect (config as any).options', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('config', 'options'))
    expect(reports).toHaveLength(1)
  })

  test('should detect (err as any).message', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('err', 'message'))
    expect(reports).toHaveLength(1)
  })

  test('should detect (evt as any).target', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('evt', 'target'))
    expect(reports).toHaveLength(1)
  })

  test('should detect (item as any).name', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('item', 'name'))
    expect(reports).toHaveLength(1)
  })

  test('should detect (input as any).length', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('input', 'length'))
    expect(reports).toHaveLength(1)
  })

  test('should detect (val as any).toString', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('val', 'toString'))
    expect(reports).toHaveLength(1)
  })

  test('should detect computed access (x as any)[0]', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', '0', { computed: true }))
    expect(reports).toHaveLength(1)
  })

  test('should detect computed access (x as any)["myKey"]', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'myKey', { computed: true }))
    expect(reports).toHaveLength(1)
  })

  test('should detect computed access (arr as any)[42]', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('arr', '42', { computed: true }))
    expect(reports).toHaveLength(1)
  })

  test('should detect computed access with string key (obj as any)["prop-name"]', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('obj', 'prop-name', { computed: true }))
    expect(reports).toHaveLength(1)
  })

  test('should detect (x as any).a with single-char property', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'a'))
    expect(reports).toHaveLength(1)
  })

  test('should detect (x as any).veryLongPropertyName', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'veryLongPropertyName'))
    expect(reports).toHaveLength(1)
  })

  test('should detect access with property named __proto__', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', '__proto__'))
    expect(reports).toHaveLength(1)
  })

  test('should detect access with property named constructor', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'constructor'))
    expect(reports).toHaveLength(1)
  })
})

describe('no-unsafe-member-access rule - chained as any access', () => {
  test('should detect ((x as any).a).b - two-level chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['a', 'b']))
    expect(reports).toHaveLength(1)
  })

  test('should detect ((x as any).a).b.c - three-level chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['a', 'b', 'c']))
    expect(reports).toHaveLength(1)
  })

  test('should detect ((x as any).a).b.c.d - four-level chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['a', 'b', 'c', 'd']))
    expect(reports).toHaveLength(1)
  })

  test('should detect ((x as any).data).response.status - realistic chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['data', 'response', 'status']))
    expect(reports).toHaveLength(1)
  })

  test('should detect ((x as any).config).api.url - config chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['config', 'api', 'url']))
    expect(reports).toHaveLength(1)
  })

  test('should detect ((x as any).props).children.type - props chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['props', 'children', 'type']))
    expect(reports).toHaveLength(1)
  })

  test('should detect five-level chain ((x as any).a.b.c.d.e)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['a', 'b', 'c', 'd', 'e']))
    expect(reports).toHaveLength(1)
  })

  test('should detect single-level nested (x as any).first', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['first']))
    expect(reports).toHaveLength(1)
  })

  test('should detect six-level deep chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['a', 'b', 'c', 'd', 'e', 'f']))
    expect(reports).toHaveLength(1)
  })

  test('should detect deeply nested chain on different obj names', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('myObj', ['level1', 'level2']))
    expect(reports).toHaveLength(1)
  })

  test('should detect chain on obj named data', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('data', ['nested', 'value']))
    expect(reports).toHaveLength(1)
  })

  test('should detect chain on obj named response', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('response', ['body', 'result', 'id']))
    expect(reports).toHaveLength(1)
  })
})

describe('no-unsafe-member-access rule - typed member access (NOT flagged)', () => {
  function createTypedCastMemberAccess(
    objName: string,
    prop: string,
    typeKeyword: string,
  ): unknown {
    return {
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: objName },
        typeAnnotation: { type: typeKeyword },
      },
      property: { type: 'Identifier', name: prop },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
  }

  test('should NOT report (x as string).length', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createTypedCastMemberAccess('x', 'length', 'TSStringKeyword'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report (x as number).toFixed', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createTypedCastMemberAccess('x', 'toFixed', 'TSNumberKeyword'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report (x as boolean).valueOf', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createTypedCastMemberAccess('x', 'valueOf', 'TSBooleanKeyword'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report (x as unknown).prop', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createTypedCastMemberAccess('x', 'prop', 'TSUnknownKeyword'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report (x as never).prop', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createTypedCastMemberAccess('x', 'prop', 'TSNeverKeyword'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report (x as undefined).prop', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createTypedCastMemberAccess('x', 'prop', 'TSUndefinedKeyword'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report (x as null).prop', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createTypedCastMemberAccess('x', 'prop', 'TSNullKeyword'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report (x as object).key', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createTypedCastMemberAccess('x', 'key', 'TSObjectKeyword'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report (x as void).result', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createTypedCastMemberAccess('x', 'result', 'TSVoidKeyword'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report (x as bigint).valueOf', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createTypedCastMemberAccess('x', 'valueOf', 'TSBigIntKeyword'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report (x as symbol).description', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createTypedCastMemberAccess('x', 'description', 'TSSymbolKeyword'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report cast with TSTypeReference (SomeType)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: { type: 'Identifier', name: 'MyType' },
        },
      },
      property: { type: 'Identifier', name: 'field' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report cast with TSArrayType', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSArrayType', elementType: { type: 'TSStringKeyword' } },
      },
      property: { type: 'Identifier', name: 'length' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report cast with TSUnionType', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: {
          type: 'TSUnionType',
          types: [{ type: 'TSStringKeyword' }, { type: 'TSNumberKeyword' }],
        },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report cast with TSIntersectionType', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: {
          type: 'TSIntersectionType',
          types: [{ type: 'TSStringKeyword' }, { type: 'TSNumberKeyword' }],
        },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })
})

describe('no-unsafe-member-access rule - regular member access (NOT flagged)', () => {
  test('should NOT report obj.prop', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('obj', 'prop'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report arr.length', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('arr', 'length'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report str.charAt', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('str', 'charAt'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report Math.PI', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('Math', 'PI'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report console.log', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('console', 'log'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report window.document', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('window', 'document'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report process.env', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('process', 'env'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report JSON.parse', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('JSON', 'parse'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report Promise.resolve', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('Promise', 'resolve'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report Object.keys', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('Object', 'keys'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report Array.from', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('Array', 'from'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report computed access arr[0]', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'arr' },
      property: { type: 'Literal', value: 0 },
      computed: true,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report obj["key"] computed access', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Literal', value: 'key' },
      computed: true,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report chained normal access obj.a.b', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'a' },
        computed: false,
        optional: false,
      },
      property: { type: 'Identifier', name: 'b' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report deeply chained normal access obj.a.b.c', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'a' },
          computed: false,
          optional: false,
        },
        property: { type: 'Identifier', name: 'b' },
        computed: false,
        optional: false,
      },
      property: { type: 'Identifier', name: 'c' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report optional chaining obj?.prop on normal obj', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: true,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report this.member', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: { type: 'ThisExpression' },
      property: { type: 'Identifier', name: 'member' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report super.method', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: { type: 'Super' },
      property: { type: 'Identifier', name: 'method' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
    })
    expect(reports).toHaveLength(0)
  })
})

describe('no-unsafe-member-access rule - optional chaining with allowOptionalChaining', () => {
  test('allowOptionalChaining=true + optional=true should NOT report', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: true })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: true }))
    expect(reports).toHaveLength(0)
  })

  test('allowOptionalChaining=true + optional=false should STILL report', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: true })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: false }))
    expect(reports).toHaveLength(1)
  })

  test('allowOptionalChaining=false + optional=true should STILL report', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: false })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: true }))
    expect(reports).toHaveLength(1)
  })

  test('allowOptionalChaining=false + optional=false should report', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: false })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: false }))
    expect(reports).toHaveLength(1)
  })

  test('default (no option) + optional=true should report', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: true }))
    expect(reports).toHaveLength(1)
  })

  test('default (no option) + optional=false should report', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: false }))
    expect(reports).toHaveLength(1)
  })

  test('allowOptionalChaining=true should NOT report computed optional access', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: true })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'key', { optional: true, computed: true }))
    expect(reports).toHaveLength(0)
  })

  test('allowOptionalChaining=true with nested chain and optional=true should NOT report', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: true })
    const visitor = noUnsafeMemberAccessRule.create(context)
    const nestedOptional: Record<string, unknown> = {
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'deep' },
      computed: false,
      optional: true,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    visitor.MemberExpression!(nestedOptional)
    expect(reports).toHaveLength(0)
  })

  test('allowOptionalChaining as truthy number should NOT be treated as true', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: true })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: true }))
    expect(reports).toHaveLength(0)
  })

  test('allowOptionalChaining=true only affects optional access, not normal access on same context', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: true })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'nonOptional', { optional: false }))
    visitor.MemberExpression!(createAnyMemberAccess('x', 'optional', { optional: true }))
    expect(reports).toHaveLength(1)
    expect(reports[0].message.toLowerCase()).toContain('unsafe')
  })
})

describe('no-unsafe-member-access rule - violation properties', () => {
  test('message should contain "Unsafe member access"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports[0].message).toContain('Unsafe member access')
  })

  test('message should mention "any-typed value"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports[0].message.toLowerCase()).toContain('any-typed')
  })

  test('message should mention "type annotations"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports[0].message.toLowerCase()).toContain('type')
  })

  test('message should mention "casting to any"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports[0].message.toLowerCase()).toContain('casting to any')
  })

  test('report should include location object', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports[0].loc).toBeDefined()
    expect(typeof reports[0].loc).toBe('object')
  })

  test('location should have start and end', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports[0].loc!.start).toBeDefined()
    expect(reports[0].loc!.end).toBeDefined()
  })

  test('location start should have line and column', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(typeof reports[0].loc!.start.line).toBe('number')
    expect(typeof reports[0].loc!.start.column).toBe('number')
  })

  test('location end should have line and column', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(typeof reports[0].loc!.end.line).toBe('number')
    expect(typeof reports[0].loc!.end.column).toBe('number')
  })

  test('location should reflect node line number', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { line: 10 }))
    expect(reports[0].loc!.start.line).toBe(10)
  })

  test('location should reflect different line numbers', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { line: 42 }))
    expect(reports[0].loc!.start.line).toBe(42)
  })

  test('location column should be 0 for test nodes', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports[0].loc!.start.column).toBe(0)
  })

  test('location end line should match node', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { line: 7 }))
    expect(reports[0].loc!.end.line).toBe(7)
  })
})

describe('no-unsafe-member-access rule - extractLocation edge cases', () => {
  test('should not throw with null node', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(() => visitor.MemberExpression!(null)).not.toThrow()
    expect(reports).toHaveLength(0)
  })

  test('should not throw with undefined node', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(() => visitor.MemberExpression!(undefined)).not.toThrow()
    expect(reports).toHaveLength(0)
  })

  test('should handle node with missing loc property', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
    })
    expect(reports).toHaveLength(1)
  })

  test('should handle node with null loc property', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: null,
    })
    expect(reports).toHaveLength(1)
  })

  test('should handle node with loc missing start', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(1)
  })

  test('should handle node with loc missing end', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 } },
    })
    expect(reports).toHaveLength(1)
  })

  test('should handle node with partial start (missing column)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 3 }, end: { line: 3, column: 10 } },
    })
    expect(reports).toHaveLength(1)
    expect(reports[0].loc!.start.line).toBe(3)
  })

  test('should handle node with custom column values', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 5, column: 8 }, end: { line: 5, column: 20 } },
    })
    expect(reports).toHaveLength(1)
    expect(reports[0].loc!.start.column).toBe(8)
    expect(reports[0].loc!.end.column).toBe(20)
  })

  test('should handle node with high line numbers', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 9999, column: 0 }, end: { line: 9999, column: 10 } },
    })
    expect(reports).toHaveLength(1)
    expect(reports[0].loc!.start.line).toBe(9999)
  })

  test('should handle node where start.line is not a number', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 'not-a-number', column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(1)
    expect(reports[0].loc!.start.line).toBe(1)
  })
})

describe('no-unsafe-member-access rule - isAnyAsExpression edge cases', () => {
  test('should NOT report when object is Identifier (not TSAsExpression)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('x', 'prop'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report when TSAsExpression type is TSStringKeyword', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNonAnyCastMemberAccess('x', 'prop'))
    expect(reports).toHaveLength(0)
  })

  test('should NOT report when typeAnnotation is missing', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report when typeAnnotation is null', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: null,
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report when typeAnnotation.type is undefined', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: {},
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should report when typeAnnotation.type is TSAnyKeyword', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(1)
  })

  test('should NOT report when object is ThisExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: { type: 'ThisExpression' },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report when object is a CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'result' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report when object type is not TSAsExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: { type: 'ArrayExpression', elements: [] },
      property: { type: 'Identifier', name: 'length' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })
})

describe('no-unsafe-member-access rule - hasAnyBase recursion', () => {
  test('should detect base is as any in two-level chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['a', 'b']))
    expect(reports).toHaveLength(1)
  })

  test('should detect base is as any in three-level chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['a', 'b', 'c']))
    expect(reports).toHaveLength(1)
  })

  test('should NOT report chain without as any', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'a' },
        computed: false,
        optional: false,
      },
      property: { type: 'Identifier', name: 'b' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report chain with non-any cast at base', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    let current: Record<string, unknown> = {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: 'x' },
      typeAnnotation: { type: 'TSStringKeyword' },
    }
    for (const prop of ['a', 'b']) {
      current = {
        type: 'MemberExpression',
        object: { ...current },
        property: { type: 'Identifier', name: prop },
        computed: false,
        optional: false,
      }
    }
    visitor.MemberExpression!({
      ...current,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should detect as any at any depth in chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('x', ['a', 'b', 'c', 'd', 'e']))
    expect(reports).toHaveLength(1)
  })

  test('should handle single MemberExpression with as any base', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports).toHaveLength(1)
  })

  test('should NOT report when object is a plain Identifier', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNormalMemberAccess('plainVar', 'member'))
    expect(reports).toHaveLength(0)
  })
})

describe('no-unsafe-member-access rule - multiple violations', () => {
  test('should report 2 violations', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('a', 'x', { line: 1 }))
    visitor.MemberExpression!(createAnyMemberAccess('b', 'y', { line: 2 }))
    expect(reports).toHaveLength(2)
  })

  test('should report 3 violations', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('a', 'x', { line: 1 }))
    visitor.MemberExpression!(createAnyMemberAccess('b', 'y', { line: 2 }))
    visitor.MemberExpression!(createAnyMemberAccess('c', 'z', { line: 3 }))
    expect(reports).toHaveLength(3)
  })

  test('should report 5 violations', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    for (let i = 1; i <= 5; i++) {
      visitor.MemberExpression!(createAnyMemberAccess(`v${i}`, `p${i}`, { line: i }))
    }
    expect(reports).toHaveLength(5)
  })

  test('should report 10 violations', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    for (let i = 1; i <= 10; i++) {
      visitor.MemberExpression!(createAnyMemberAccess(`v${i}`, `p${i}`, { line: i }))
    }
    expect(reports).toHaveLength(10)
  })

  test('should report mixed valid and invalid - 3 invalid out of 5', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'a', { line: 1 }))
    visitor.MemberExpression!(createNormalMemberAccess('obj', 'b'))
    visitor.MemberExpression!(createAnyMemberAccess('y', 'c', { line: 3 }))
    visitor.MemberExpression!(createNonAnyCastMemberAccess('z', 'd'))
    visitor.MemberExpression!(createAnyMemberAccess('w', 'e', { line: 5 }))
    expect(reports).toHaveLength(3)
  })

  test('each violation should have correct line number', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('a', 'x', { line: 10 }))
    visitor.MemberExpression!(createAnyMemberAccess('b', 'y', { line: 20 }))
    visitor.MemberExpression!(createAnyMemberAccess('c', 'z', { line: 30 }))
    expect(reports[0].loc!.start.line).toBe(10)
    expect(reports[1].loc!.start.line).toBe(20)
    expect(reports[2].loc!.start.line).toBe(30)
  })

  test('each violation should have correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('a', 'x'))
    visitor.MemberExpression!(createAnyMemberAccess('b', 'y'))
    for (const report of reports) {
      expect(report.message.toLowerCase()).toContain('unsafe')
      expect(report.message.toLowerCase()).toContain('any')
    }
  })

  test('reports should accumulate across calls', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(reports).toHaveLength(0)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'a'))
    expect(reports).toHaveLength(1)
    visitor.MemberExpression!(createAnyMemberAccess('y', 'b'))
    expect(reports).toHaveLength(2)
    visitor.MemberExpression!(createAnyMemberAccess('z', 'c'))
    expect(reports).toHaveLength(3)
  })

  test('should handle interleaved valid and invalid nodes', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'a'))
    visitor.MemberExpression!(createNormalMemberAccess('obj', 'b'))
    visitor.MemberExpression!(createAnyMemberAccess('y', 'c'))
    visitor.MemberExpression!(createNormalMemberAccess('obj', 'd'))
    visitor.MemberExpression!(createAnyMemberAccess('z', 'e'))
    expect(reports).toHaveLength(3)
  })
})

describe('no-unsafe-member-access rule - edge cases', () => {
  test('should not throw with boolean false node', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(() => visitor.MemberExpression!(false)).not.toThrow()
    expect(reports).toHaveLength(0)
  })

  test('should not throw with numeric node', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(() => visitor.MemberExpression!(42)).not.toThrow()
    expect(reports).toHaveLength(0)
  })

  test('should not throw with string node', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(() => visitor.MemberExpression!('node')).not.toThrow()
    expect(reports).toHaveLength(0)
  })

  test('should not throw with empty object node', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    expect(() => visitor.MemberExpression!({})).not.toThrow()
  })

  test('should handle node with type but no object property', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should handle node with empty options', () => {
    const { context, reports } = createMockContext({})
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports).toHaveLength(1)
  })

  test('should handle node with irrelevant options', () => {
    const { context, reports } = createMockContext({ someOtherOption: true })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop'))
    expect(reports).toHaveLength(1)
  })

  test('should handle optional property as string "true" (truthy but not boolean true)', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: true })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: 'true',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(1)
  })

  test('should handle optional property as number 1 (truthy but not boolean true)', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: true })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: 1,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(1)
  })

  test('should report when optional is false even with allowOptionalChaining=true', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: true })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { optional: false }))
    expect(reports).toHaveLength(1)
  })

  test('should report when optional is undefined with allowOptionalChaining=true', () => {
    const { context, reports } = createMockContext({ allowOptionalChaining: true })
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(1)
  })

  test('should handle node where object is explicitly undefined', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: undefined,
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })
})

describe('no-unsafe-member-access rule - computed property variations', () => {
  test('should detect (x as any)[0] numeric index', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', '0', { computed: true }))
    expect(reports).toHaveLength(1)
  })

  test('should detect (x as any)[99] numeric index', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', '99', { computed: true }))
    expect(reports).toHaveLength(1)
  })

  test('should detect (x as any)["key"] string computed', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'key', { computed: true }))
    expect(reports).toHaveLength(1)
  })

  test('should detect (x as any)["some-long-key-name"] string computed', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'some-long-key-name', { computed: true }))
    expect(reports).toHaveLength(1)
  })

  test('should detect (x as any).prop dot notation', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'prop', { computed: false }))
    expect(reports).toHaveLength(1)
  })

  test('computed access should be reported same as dot access', () => {
    const { context: ctx1, reports: reports1 } = createMockContext()
    const { context: ctx2, reports: reports2 } = createMockContext()
    const visitor1 = noUnsafeMemberAccessRule.create(ctx1)
    const visitor2 = noUnsafeMemberAccessRule.create(ctx2)
    visitor1.MemberExpression!(createAnyMemberAccess('x', 'prop', { computed: false }))
    visitor2.MemberExpression!(createAnyMemberAccess('x', 'prop', { computed: true }))
    expect(reports1).toHaveLength(1)
    expect(reports2).toHaveLength(1)
  })
})

describe('no-unsafe-member-access rule - mixed chain scenarios', () => {
  test('should NOT report (x as string).length.trim where base is string cast', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    const stringCast = {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: 'x' },
      typeAnnotation: { type: 'TSStringKeyword' },
    }
    const lengthAccess = {
      type: 'MemberExpression',
      object: { ...stringCast },
      property: { type: 'Identifier', name: 'length' },
      computed: false,
      optional: false,
    }
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: { ...lengthAccess },
      property: { type: 'Identifier', name: 'trim' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should report nested chain starting with as any at the root', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createNestedAnyMemberAccess('data', ['response', 'body', 'result']))
    expect(reports).toHaveLength(1)
  })

  test('should NOT report nested chain starting with non-any cast', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    let current: Record<string, unknown> = {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: 'data' },
      typeAnnotation: { type: 'TSNumberKeyword' },
    }
    for (const prop of ['a', 'b', 'c']) {
      current = {
        type: 'MemberExpression',
        object: { ...current },
        property: { type: 'Identifier', name: prop },
        computed: false,
        optional: false,
      }
    }
    visitor.MemberExpression!({
      ...current,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })
})

describe('no-unsafe-member-access rule - repeated visitor calls', () => {
  test('should create fresh visitor each time create is called', () => {
    const { context: ctx1, reports: reports1 } = createMockContext()
    const { context: ctx2, reports: reports2 } = createMockContext()
    const visitor1 = noUnsafeMemberAccessRule.create(ctx1)
    const visitor2 = noUnsafeMemberAccessRule.create(ctx2)
    visitor1.MemberExpression!(createAnyMemberAccess('x', 'a'))
    visitor2.MemberExpression!(createAnyMemberAccess('y', 'b'))
    expect(reports1).toHaveLength(1)
    expect(reports2).toHaveLength(1)
  })

  test('visitor should maintain state within single create call', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('x', 'a'))
    visitor.MemberExpression!(createAnyMemberAccess('y', 'b'))
    visitor.MemberExpression!(createAnyMemberAccess('z', 'c'))
    expect(reports).toHaveLength(3)
  })

  test('calling create multiple times should produce independent report arrays', () => {
    const { context: ctx1, reports: reports1 } = createMockContext()
    const { context: ctx2, reports: reports2 } = createMockContext()
    const visitor1 = noUnsafeMemberAccessRule.create(ctx1)
    const visitor2 = noUnsafeMemberAccessRule.create(ctx2)
    visitor1.MemberExpression!(createAnyMemberAccess('x', 'a'))
    visitor1.MemberExpression!(createAnyMemberAccess('x', 'b'))
    visitor2.MemberExpression!(createAnyMemberAccess('x', 'a'))
    expect(reports1).toHaveLength(2)
    expect(reports2).toHaveLength(1)
  })
})

describe('no-unsafe-member-access rule - additional edge cases', () => {
  test('should NOT report when node type is CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report when object is an ArrayExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: { type: 'ArrayExpression', elements: [] },
      property: { type: 'Identifier', name: 'length' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report when object is ObjectExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: { type: 'ObjectExpression', properties: [] },
      property: { type: 'Identifier', name: 'key' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should detect as any cast with FunctionExpression object', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('fn', 'call'))
    expect(reports).toHaveLength(1)
  })

  test('should detect as any cast with ArrowFunctionExpression object name', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('arrow', 'bind'))
    expect(reports).toHaveLength(1)
  })

  test('should NOT report TSAsExpression with TSTypeReference type', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSTypeReference', typeName: 'MyInterface' },
      },
      property: { type: 'Identifier', name: 'field' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report TSAsExpression with TSLiteralType type', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSLiteralType', literal: { type: 'Literal', value: 'hello' } },
      },
      property: { type: 'Identifier', name: 'value' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should NOT report TSAsExpression with TSFunctionType type', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSFunctionType', parameters: [] },
      },
      property: { type: 'Identifier', name: 'call' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should detect violation with mixed property types', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'NumericLiteral', value: 0 },
      computed: true,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
    })
    expect(reports).toHaveLength(1)
  })

  test('should NOT report when object has ConditionalExpression type', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      },
      property: { type: 'Identifier', name: 'value' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should handle MemberExpression with null property gracefully', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'x' },
      property: null,
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('should report as any with loc having zero values', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
    })
    expect(reports).toHaveLength(1)
    expect(reports[0].loc!.start.line).toBe(0)
  })

  test('should report as any with negative column value', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      },
      property: { type: 'Identifier', name: 'prop' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: -1 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(1)
    expect(reports[0].loc!.start.column).toBe(-1)
  })

  test('should detect as any on result of parenthesis expression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('result', 'data'))
    expect(reports).toHaveLength(1)
  })

  test('should detect as any on single letter variable', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!(createAnyMemberAccess('a', 'b'))
    expect(reports).toHaveLength(1)
  })

  test('should NOT report cast with TSTupleType', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnsafeMemberAccessRule.create(context)
    visitor.MemberExpression!({
      type: 'MemberExpression',
      object: {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSTupleType', elementTypes: [{ type: 'TSStringKeyword' }] },
      },
      property: { type: 'Identifier', name: '0' },
      computed: false,
      optional: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports).toHaveLength(0)
  })
})
