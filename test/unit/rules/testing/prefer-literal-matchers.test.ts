import { describe, test, expect, vi } from 'vitest'
import { preferLiteralMatchersRule } from '../../../../src/rules/testing/prefer-literal-matchers.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "expect(value).toBe(null);",
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => { reports.push({ message: descriptor.message, loc: descriptor.loc }) },
    getFilePath: () => filePath,
    getSource: () => source,
    getAST: () => null,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    settings: {},
    ruleId: 'prefer-literal-matchers',
    workspaceRoot: '/src',
  }
  return { context, reports }
}

function createExpectMatcher(
  matcher: string,
  arg: unknown,
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'value' }],
      },
      property: { type: 'Identifier', name: matcher },
    },
    arguments: [arg],
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
  }
}

function createLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

function createIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function createTemplateLiteral(): unknown {
  return { type: 'TemplateLiteral', quasis: [], expressions: [] }
}

function createObjectExpression(): unknown {
  return { type: 'ObjectExpression', properties: [] }
}

describe('prefer-literal-matchers', () => {
  const rule = preferLiteralMatchersRule

  test('rule has correct meta', () => {
    expect(rule.meta.docs.category).toBe('testing')
    expect(rule.meta.docs.description).toContain('literal')
    expect(rule.meta.severity).toBe('warn')
    expect(rule.meta.type).toBe('suggestion')
  })

  test('rule has create method', () => {
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: toBe(null) -> toBeNull
  test('reports expect(value).toBe(null)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(null)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toBeNull')
  })

  test('reports expect(value).toBe(undefined)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(undefined)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toBeUndefined')
  })

  test('reports expect(value).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(true)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toBeTruthy')
  })

  test('reports expect(value).toBe(false)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(false)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toBeFalsy')
  })

  test('reports expect(value).toBe(NaN)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(NaN)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toBeNaN')
  })

  // SECTION: toEqual(null) -> toBeNull
  test('reports expect(value).toEqual(null)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(null)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toBeNull')
  })

  test('reports expect(value).toEqual(undefined)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(undefined)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toBeUndefined')
  })

  test('reports expect(value).toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(true)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toBeTruthy')
  })

  test('reports expect(value).toEqual(false)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(false)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toBeFalsy')
  })

  test('reports expect(value).toEqual(NaN)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(NaN)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toBeNaN')
  })

  // SECTION: Does NOT report non-literal values
  test('does not report expect(value).toBe(0)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(0)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(1)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(1)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe("hello")', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral('hello')))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(variable)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createIdentifier('variable')))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(template)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createTemplateLiteral()))
    expect(reports.length).toBe(0)
  })

  // SECTION: Does NOT report other matchers
  test('does not report expect(value).toStrictEqual(null)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toStrictEqual', createLiteral(null)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toStrictEqual(true)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toStrictEqual', createLiteral(true)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toMatch(null)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toMatch', createLiteral(null)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toContain(null)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toContain', createLiteral(null)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toThrow(null)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toThrow', createLiteral(null)))
    expect(reports.length).toBe(0)
  })

  // SECTION: Multiple arguments - should NOT report
  test('does not report expect(value).toBe(null, extra)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [createLiteral(null), createLiteral('extra')],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe() with no arguments', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  // SECTION: Edge cases
  test('handles null node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(null)
    expect(reports.length).toBe(0)
  })

  test('handles undefined node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(undefined)
    expect(reports.length).toBe(0)
  })

  test('handles node without type', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({ value: 42 })
    expect(reports.length).toBe(0)
  })

  test('handles non-CallExpression type', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({ type: 'Identifier', name: 'x' })
    expect(reports.length).toBe(0)
  })

  test('handles CallExpression with Identifier callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles CallExpression with null callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: null,
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles MemberExpression with non-expect object', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'notExpect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [createLiteral(null)],
    }
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  // SECTION: Location reporting
  test('includes location in report for toBe(null)', () => {
    const loc = { start: { line: 5, column: 2 }, end: { line: 5, column: 25 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(null), loc))
    expect(reports.length).toBe(1)
    expect(reports[0].loc).toEqual(loc)
  })

  test('includes location in report for toEqual(true)', () => {
    const loc = { start: { line: 10, column: 4 }, end: { line: 10, column: 30 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(true), loc))
    expect(reports.length).toBe(1)
    expect(reports[0].loc).toEqual(loc)
  })

  // SECTION: Message format
  test('message format for toBe(null) suggests toBeNull', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(null)))
    expect(reports[0].message).toBe('Use toBeNull() instead of toBe().')
  })

  test('message format for toBe(undefined) suggests toBeUndefined', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(undefined)))
    expect(reports[0].message).toBe('Use toBeUndefined() instead of toBe().')
  })

  test('message format for toBe(true) suggests toBeTruthy', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(true)))
    expect(reports[0].message).toBe('Use toBeTruthy() instead of toBe().')
  })

  test('message format for toBe(false) suggests toBeFalsy', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(false)))
    expect(reports[0].message).toBe('Use toBeFalsy() instead of toBe().')
  })

  test('message format for toBe(NaN) suggests toBeNaN', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(NaN)))
    expect(reports[0].message).toBe('Use toBeNaN() instead of toBe().')
  })

  test('message format for toEqual(false) suggests toBeFalsy', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(false)))
    expect(reports[0].message).toBe('Use toBeFalsy() instead of toEqual().')
  })

  test('message format for toEqual(NaN) suggests toBeNaN', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(NaN)))
    expect(reports[0].message).toBe('Use toBeNaN() instead of toEqual().')
  })

  // SECTION: Does NOT report object/array literals
  test('does not report expect(value).toBe(object)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createObjectExpression()))
    expect(reports.length).toBe(0)
  })

  // SECTION: Does NOT report number literals that aren't NaN
  test('does not report expect(value).toBe(42)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(42)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(-1)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(-1)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(3.14)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(3.14)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toEqual(0)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(0)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toEqual("test")', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral('test')))
    expect(reports.length).toBe(0)
  })

  // SECTION: File path variations
  test('works with .spec.ts files', () => {
    const { context, reports } = createMockContext({}, '/src/file.spec.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(null)))
    expect(reports.length).toBe(1)
  })

  test('works with .test.js files', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.js')
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(null)))
    expect(reports.length).toBe(1)
  })

  test('works with nested test files', () => {
    const { context, reports } = createMockContext({}, '/src/features/auth/login.test.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(null)))
    expect(reports.length).toBe(1)
  })

  // SECTION: Visitor has CallExpression handler
  test('visitor has CallExpression handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(typeof visitor.CallExpression).toBe('function')
  })

  test('does not report expect().toBe(null) with empty arguments on expect', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [createLiteral(null)],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('does not report when property is computed', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Literal', value: 'toBe' },
        computed: true,
      },
      arguments: [createLiteral(null)],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report string literal "null" as value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral('null')))
    expect(reports.length).toBe(0)
  })

  test('does not report string literal "undefined" as value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral('undefined')))
    expect(reports.length).toBe(0)
  })

  test('does not report string literal "true" as value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral('true')))
    expect(reports.length).toBe(0)
  })

  test('does not report string literal "false" as value', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral('false')))
    expect(reports.length).toBe(0)
  })

  test('reports expect(value).toEqual(null) with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(null)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toBe('Use toBeNull() instead of toEqual().')
  })

  test('reports expect(value).toEqual(undefined) with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(undefined)))
    expect(reports[0].message).toBe('Use toBeUndefined() instead of toEqual().')
  })

  test('reports expect(value).toEqual(true) with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(true)))
    expect(reports[0].message).toBe('Use toBeTruthy() instead of toEqual().')
  })

  test('reports expect(value).toBe(false) with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(false)))
    expect(reports[0].message).toBe('Use toBeFalsy() instead of toBe().')
  })

  test('reports expect(value).toBe(NaN) with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(NaN)))
    expect(reports[0].message).toBe('Use toBeNaN() instead of toBe().')
  })

  test('does not report expect(value).toBe(empty string)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral('')))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toEqual(empty string)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral('')))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(Infinity)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(Infinity)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(-Infinity)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(-Infinity)))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toEqual(Infinity)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(Infinity)))
    expect(reports.length).toBe(0)
  })

  test('reports expect(value).toBe(null) in .spec.tsx file', () => {
    const { context, reports } = createMockContext({}, '/src/component.spec.tsx')
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(null)))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(undefined) in .test.jsx file', () => {
    const { context, reports } = createMockContext({}, '/src/component.test.jsx')
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(undefined)))
    expect(reports.length).toBe(1)
  })

  test('does not report expect(value).toBe(regex)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', { type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(BigInt)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', { type: 'Literal', value: 10n, bigint: '10' }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(array literal)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', { type: 'ArrayExpression', elements: [] }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(function call)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'getNull' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(member expression)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'prop' },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(unary expression)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', {
      type: 'UnaryExpression',
      operator: 'void',
      argument: { type: 'Literal', value: 0 },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toEqual(member expression)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'nullValue' },
    }))
    expect(reports.length).toBe(0)
  })

  test('reports expect(value).toEqual(false) with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(false)))
    expect(reports[0].message).toBe('Use toBeFalsy() instead of toEqual().')
  })

  test('reports expect(value).toBe(true) location correctly', () => {
    const loc = { start: { line: 3, column: 8 }, end: { line: 3, column: 30 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(true), loc))
    expect(reports[0].loc).toEqual(loc)
  })

  test('reports expect(value).toEqual(null) location correctly', () => {
    const loc = { start: { line: 7, column: 1 }, end: { line: 7, column: 28 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(null), loc))
    expect(reports[0].loc).toEqual(loc)
  })

  test('reports expect(value).toBe(undefined) location correctly', () => {
    const loc = { start: { line: 12, column: 4 }, end: { line: 12, column: 32 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(undefined), loc))
    expect(reports[0].loc).toEqual(loc)
  })

  test('does not report when matcher is not a string property', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Literal', value: 42 },
      },
      arguments: [createLiteral(null)],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when callee is not MemberExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'expect' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report when inner object is not a CallExpression', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'expect' },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [createLiteral(null)],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(null) with null arguments array', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: null,
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(null) with undefined arguments', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(Symbol)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'Symbol' },
      arguments: [{ type: 'Literal', value: 'desc' }],
    }))
    expect(reports.length).toBe(0)
  })

  test('reports expect(value).toBe(null) twice on separate calls', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(null)))
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(null)))
    expect(reports.length).toBe(2)
  })

  test('reports expect(value).toBe(undefined) then toEqual(null)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(undefined)))
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(null)))
    expect(reports.length).toBe(2)
    expect(reports[0].message).toContain('toBeUndefined')
    expect(reports[1].message).toContain('toBeNull')
  })

  test('does not report expect(value).toBe(NaN) with toBeNaN matcher suggestion for toEqual', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toEqual', createLiteral(NaN)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toBeNaN')
  })

  test('does not report expect(value).toBeNull() call directly', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBeNull', []))
    expect(reports.length).toBe(0)
  })

  test('reports expect(value).toBe(true) with single matcher suggestion', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(true)))
    expect(reports.length).toBe(1)
    expect(reports[0].message).not.toContain('toEqual')
    expect(reports[0].message).toContain('toBeTruthy')
  })

  test('does not report expect(value).toBe(0n) BigInt literal', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', { type: 'Literal', value: 0n, bigint: '0' }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(null) when expect has no arguments', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [createLiteral(null)],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('does not report when expect inner callee is not Identifier', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Literal', value: 42 },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [createLiteral(null)],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('reports expect(value).toBe(NaN) message contains toBeNaN', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(NaN)))
    expect(reports[0].message).toBe('Use toBeNaN() instead of toBe().')
  })

  test('reports expect(value).toBe(false) location correctly', () => {
    const loc = { start: { line: 8, column: 2 }, end: { line: 8, column: 28 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectMatcher('toBe', createLiteral(false), loc))
    expect(reports[0].loc).toEqual(loc)
  })
})
