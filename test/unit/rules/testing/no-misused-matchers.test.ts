import { describe, test, expect, vi } from 'vitest'
import { noMisusedMatchersRule } from '../../../../src/rules/testing/no-misused-matchers.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "expect(value).toBe(expect.any(Number));",
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
    ruleId: 'no-misused-matchers',
    workspaceRoot: '/src',
  }
  return { context, reports }
}

function createAsymmetricMatcher(matcherName: string, ...args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'expect' },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: args,
  }
}

function createExpectToBe(arg: unknown, loc?: { start: { line: number; column: number }; end: { line: number; column: number } }): unknown {
  return {
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
    arguments: [arg],
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
  }
}

function createExpectToEqual(arg: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'value' }],
      },
      property: { type: 'Identifier', name: 'toEqual' },
    },
    arguments: [arg],
  }
}

describe('no-misused-matchers', () => {
  const rule = noMisusedMatchersRule

  test('rule has correct meta', () => {
    expect(rule.meta.docs.category).toBe('testing')
    expect(rule.meta.docs.description).toContain('asymmetric')
    expect(rule.meta.severity).toBe('error')
    expect(rule.meta.type).toBe('problem')
  })

  test('rule has create method', () => {
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: Reports toBe with asymmetric matchers
  test('reports expect(value).toBe(expect.any(Number))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' })))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('toEqual')
  })

  test('reports expect(value).toBe(expect.anything())', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('anything')))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.arrayContaining([1, 2]))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('arrayContaining', { type: 'ArrayExpression', elements: [] })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.objectContaining({ a: 1 }))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('objectContaining', { type: 'ObjectExpression', properties: [] })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.stringContaining("foo"))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('stringContaining', { type: 'Literal', value: 'foo' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.stringMatching(/foo/))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('stringMatching', { type: 'Literal', value: '/foo/' })))
    expect(reports.length).toBe(1)
  })

  // SECTION: Does NOT report toEqual with asymmetric matchers (correct usage)
  test('does not report expect(value).toEqual(expect.any(Number))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToEqual(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' })))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toEqual(expect.anything())', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToEqual(createAsymmetricMatcher('anything')))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toEqual(expect.objectContaining({}))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToEqual(createAsymmetricMatcher('objectContaining', { type: 'ObjectExpression', properties: [] })))
    expect(reports.length).toBe(0)
  })

  // SECTION: Does NOT report toBe with non-asymmetric args
  test('does not report expect(value).toBe(1)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: 1 }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(null)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: null }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(undefined)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: undefined }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe("hello")', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: 'hello' }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: true }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(false)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: false }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(variable)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Identifier', name: 'variable' }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Does NOT report other matchers with asymmetric args
  test('does not report expect(value).toStrictEqual(expect.any(Number))', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toStrictEqual' },
      },
      arguments: [createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' })],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toMatchObject(expect.objectContaining({}))', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toMatchObject' },
      },
      arguments: [createAsymmetricMatcher('objectContaining', { type: 'ObjectExpression', properties: [] })],
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

  test('handles expect().toBe() with no arguments', () => {
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

  test('handles expect().toBe() with null arguments', () => {
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

  // SECTION: Location reporting
  test('includes location in report', () => {
    const loc = { start: { line: 5, column: 2 }, end: { line: 5, column: 40 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' }), loc))
    expect(reports.length).toBe(1)
    expect(reports[0].loc).toEqual(loc)
  })

  // SECTION: File path variations
  test('works with .spec.ts files', () => {
    const { context, reports } = createMockContext({}, '/src/file.spec.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'String' })))
    expect(reports.length).toBe(1)
  })

  test('works with .test.js files', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.js')
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('anything')))
    expect(reports.length).toBe(1)
  })

  // SECTION: Visitor handler
  test('visitor has CallExpression handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(typeof visitor.CallExpression).toBe('function')
  })

  // SECTION: Multiple asymmetric matchers in toBe args
  test('reports toBe with asymmetric matcher as first of multiple args', () => {
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
      arguments: [createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' }), { type: 'Literal', value: 1 }],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('reports only once for multiple asymmetric matchers in args', () => {
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
      arguments: [createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' }), createAsymmetricMatcher('anything')],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  // SECTION: Non-expect object with same method names
  test('does not report non-expect any() call', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'something' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' })],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  // SECTION: Computed property as matcher name
  test('handles computed property matcher name', () => {
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
      arguments: [createAsymmetricMatcher('anything')],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  // SECTION: Various asymmetric matcher types with toBe
  test('reports expect(value).toBe(expect.any(String))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'String' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Number)) with location', () => {
    const loc = { start: { line: 10, column: 4 }, end: { line: 10, column: 50 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' }), loc))
    expect(reports[0].loc).toEqual(loc)
  })

  test('reports expect(value).toBe(expect.arrayContaining([])) with correct message', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('arrayContaining', { type: 'ArrayExpression', elements: [] })))
    expect(reports[0].message).toContain('toBe')
    expect(reports[0].message).toContain('toEqual')
  })

  // SECTION: Non-CallExpression asymmetric matcher arg (should not report)
  test('does not report when arg is MemberExpression not CallExpression', () => {
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
      arguments: [{
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'expect' },
        property: { type: 'Identifier', name: 'any' },
      }],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  // SECTION: Asymmetric matcher with non-expect object
  test('does not report when asymmetric arg has non-expect object', () => {
    const arg = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'notExpect' },
        property: { type: 'Identifier', name: 'any' },
      },
      arguments: [{ type: 'Identifier', name: 'Number' }],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(arg))
    expect(reports.length).toBe(0)
  })

  test('does not report when asymmetric arg has non-Identifier object', () => {
    const arg = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Literal', value: 42 },
        property: { type: 'Identifier', name: 'any' },
      },
      arguments: [{ type: 'Identifier', name: 'Number' }],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(arg))
    expect(reports.length).toBe(0)
  })

  test('does not report when asymmetric arg has non-MemberExpression callee', () => {
    const arg = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'any' },
      arguments: [{ type: 'Identifier', name: 'Number' }],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(arg))
    expect(reports.length).toBe(0)
  })

  test('reports expect(value).toBe(expect.any(Function))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Function' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Object))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Object' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Boolean))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Boolean' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Array))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Array' })))
    expect(reports.length).toBe(1)
  })

  test('does not report expect(value).toBe(42) with number', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: 42 }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(NaN)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: NaN }))
    expect(reports.length).toBe(0)
  })

  test('handles empty object node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({})
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(objectArg)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'ObjectExpression', properties: [] }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(arrayArg)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'ArrayExpression', elements: [] }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(functionCall)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'getValue' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(memberExpression)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'prop' },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report when callee object is not expect CallExpression', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'value' },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [createAsymmetricMatcher('anything')],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('reports expect(value).toBe(expect.any(RegExp))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'RegExp' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Date))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Date' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Map))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Map' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Set))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Set' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Promise))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Promise' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Error))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Error' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Symbol))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Symbol' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Int8Array))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Int8Array' })))
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).toBe(expect.any(Uint8Array))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Uint8Array' })))
    expect(reports.length).toBe(1)
  })

  test('does not report expect(value).toBe(expect.unknownMethod())', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('unknownMethod')))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(expect.extend())', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('extend', { type: 'ObjectExpression', properties: [] })))
    expect(reports.length).toBe(0)
  })

  test('reports toBe with stringContaining in nested test file', () => {
    const { context, reports } = createMockContext({}, '/src/features/auth/login.test.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('stringContaining', { type: 'Literal', value: 'token' })))
    expect(reports.length).toBe(1)
  })

  test('reports toBe with stringMatching in .spec.tsx file', () => {
    const { context, reports } = createMockContext({}, '/src/component.spec.tsx')
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('stringMatching', { type: 'Literal', value: '/pattern/' })))
    expect(reports.length).toBe(1)
  })

  test('does not report toEqual with arrayContaining', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToEqual(createAsymmetricMatcher('arrayContaining', { type: 'ArrayExpression', elements: [] })))
    expect(reports.length).toBe(0)
  })

  test('does not report toEqual with stringContaining', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToEqual(createAsymmetricMatcher('stringContaining', { type: 'Literal', value: 'test' })))
    expect(reports.length).toBe(0)
  })

  test('does not report toEqual with stringMatching', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToEqual(createAsymmetricMatcher('stringMatching', { type: 'Literal', value: '/test/' })))
    expect(reports.length).toBe(0)
  })

  test('reports only once per toBe call even if arg has nested asymmetric matcher', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' })))
    expect(reports.length).toBe(1)
  })

  test('does not report when inner callee is not MemberExpression', () => {
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
      arguments: [{
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFn' },
        arguments: [],
      }],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when inner MemberExpression object has non-identifier type', () => {
    const arg = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Literal', value: 42 },
        property: { type: 'Identifier', name: 'any' },
      },
      arguments: [{ type: 'Identifier', name: 'Number' }],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(arg))
    expect(reports.length).toBe(0)
  })

  test('handles number node passed to CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(42 as any)
    expect(reports.length).toBe(0)
  })

  test('handles string node passed to CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!('expect(value).toBe(1)' as any)
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(templateLiteral)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(unaryExpression)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({
      type: 'UnaryExpression',
      operator: '-',
      argument: { type: 'Literal', value: 1 },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(updateExpression)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({
      type: 'UpdateExpression',
      operator: '++',
      argument: { type: 'Identifier', name: 'x' },
      prefix: false,
    }))
    expect(reports.length).toBe(0)
  })

  test('reports with error severity in meta', () => {
    expect(rule.meta.severity).toBe('error')
    expect(rule.meta.type).toBe('problem')
  })

  test('meta docs have correct URL format', () => {
    const url = rule.meta.docs.url
    expect(url).toMatch(/^https?:\/\/.+/)
    expect(url).toContain('no-misused-matchers')
  })

  test('reports multiple separate violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' })))
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('anything')))
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: 1 }))
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('stringContaining', { type: 'Literal', value: 'a' })))
    expect(reports.length).toBe(3)
  })

  test('does not report expect(value).toBe(0)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: 0 }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(-1)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({
      type: 'UnaryExpression',
      operator: '-',
      argument: { type: 'Literal', value: 1 },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(3.14)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: 3.14 }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe("")', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: '' }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(Infinity)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: Infinity }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(-Infinity)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: -Infinity }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(regex)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe({ type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } }))
    expect(reports.length).toBe(0)
  })

  test('reports expect(value).toBe(expect.any(Float32Array))', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Float32Array' })))
    expect(reports.length).toBe(1)
  })

  // SECTION: Multiple args to toBe
  test('reports toBe with asymmetric matcher as first of multiple args', () => {
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
      arguments: [createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' }), { type: 'Literal', value: 5 }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('reports toBe with asymmetric matcher as second of multiple args', () => {
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
      arguments: [{ type: 'Literal', value: 5 }, createAsymmetricMatcher('objectContaining', { type: 'ObjectExpression', properties: [] })],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 55 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  // SECTION: Modifier chains
  test('reports expect(value).not.toBe(expect.any(Number))', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'value' }],
            },
            property: { type: 'Identifier', name: 'not' },
          },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' })],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  // SECTION: Visitor isolation
  test('separate visitors have separate report accumulators', () => {
    const { context: ctx1, reports: rep1 } = createMockContext()
    const { context: ctx2, reports: rep2 } = createMockContext()
    const visitor1 = rule.create(ctx1)
    const visitor2 = rule.create(ctx2)
    visitor1.CallExpression!(createExpectToBe(createAsymmetricMatcher('any', { type: 'Identifier', name: 'Number' })))
    visitor2.CallExpression!(createExpectToBe({ type: 'Literal', value: 5 }))
    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(0)
  })

  test('does not report expect(value).toBe(expect.arrayContaining) when using toStrictEqual', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toStrictEqual' },
      },
      arguments: [createAsymmetricMatcher('arrayContaining', { type: 'ArrayExpression', elements: [] })],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })
})
