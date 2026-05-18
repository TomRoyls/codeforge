import { describe, expect, it, vi } from 'vitest'

import type { ReportDescriptor, RuleContext, RuleVisitor } from '../../src/plugins/types.js'

import { consistentTestItRule } from '../../src/rules/testing/consistent-test-it.js'
import { expectExpectRule } from '../../src/rules/testing/expect-expect.js'
import { maxExpectsRule } from '../../src/rules/testing/max-expects.js'
import { maxNestedDescribeRule } from '../../src/rules/testing/max-nested-describe.js'
import { noAliasMethodsRule } from '../../src/rules/testing/no-alias-methods.js'

// ─── Mock context factory ───

function createMockContext(
  options: Record<string, unknown> = {},
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options: [options] },
    getAST: () => null,
    getComments: () => [],
    getFilePath: () => 'test.ts',
    getSource: () => '',
    getTokens: () => [],
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    report(descriptor: ReportDescriptor) {
      reports.push(descriptor)
    },
    workspaceRoot: '/test',
  }

  return { context, reports }
}

// ─── Synthetic node helpers ───

function withLoc(node: Record<string, unknown>, line = 1, column = 0) {
  return {
    ...node,
    loc: {
      end: { column: column + 1, line },
      start: { column, line },
    },
  }
}

function callExpr(callee: Record<string, unknown>, args: unknown[] = [], line = 1, column = 0) {
  return withLoc({ arguments: args, callee, type: 'CallExpression' }, line, column)
}

function ident(name: string): Record<string, unknown> {
  return { name, type: 'Identifier' }
}

function memberExpr(obj: Record<string, unknown>, prop: string): Record<string, unknown> {
  return {
    computed: false,
    object: obj,
    property: { name: prop, type: 'Identifier' },
    type: 'MemberExpression',
  }
}

// ─── Section: consistent-test-it ───

describe('consistent-test-it', () => {
  it('reports test() when default preference is it', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = consistentTestItRule.create(context)

    visitor.CallExpression!(callExpr(ident('test')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'it()'")
    expect(reports[0]!.message).toContain("'test()'")
  })

  it('does not report it() when default preference is it', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = consistentTestItRule.create(context)

    visitor.CallExpression!(callExpr(ident('it')))

    expect(reports).toHaveLength(0)
  })

  it('reports it() when preference is test', () => {
    const { context, reports } = createMockContext({ fn: 'test' })
    const visitor: RuleVisitor = consistentTestItRule.create(context)

    visitor.CallExpression!(callExpr(ident('it')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'test()'")
    expect(reports[0]!.message).toContain("'it()'")
  })

  it('does not report test() when preference is test', () => {
    const { context, reports } = createMockContext({ fn: 'test' })
    const visitor: RuleVisitor = consistentTestItRule.create(context)

    visitor.CallExpression!(callExpr(ident('test')))

    expect(reports).toHaveLength(0)
  })

  it('does not report non-test calls', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = consistentTestItRule.create(context)

    visitor.CallExpression!(callExpr(ident('describe')))
    visitor.CallExpression!(callExpr(ident('expect')))

    expect(reports).toHaveLength(0)
  })

  it('reports test() via member expression callee', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = consistentTestItRule.create(context)

    visitor.CallExpression!(callExpr(memberExpr(ident('test'), 'skip')))

    expect(reports).toHaveLength(1)
  })

  it('does not report unrelated member expression calls', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = consistentTestItRule.create(context)

    visitor.CallExpression!(callExpr(memberExpr(ident('console'), 'log')))

    expect(reports).toHaveLength(0)
  })

  it('captures location in reports', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = consistentTestItRule.create(context)

    visitor.CallExpression!(callExpr(ident('test'), [], 5, 10))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 11, line: 5 },
      start: { column: 10, line: 5 },
    })
  })

  it('has correct meta properties', () => {
    expect(consistentTestItRule.meta.docs?.category).toBe('testing')
    expect(consistentTestItRule.meta.docs?.recommended).toBe(true)
    expect(consistentTestItRule.meta.severity).toBe('warn')
    expect(consistentTestItRule.meta.type).toBe('suggestion')
  })

  it('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = consistentTestItRule.create(context)

    visitor.CallExpression!(callExpr(ident('test'), [], 1, 0))
    visitor.CallExpression!(callExpr(ident('test'), [], 3, 0))
    visitor.CallExpression!(callExpr(ident('it'), [], 5, 0))

    expect(reports).toHaveLength(2)
  })
})

// ─── Section: expect-expect ───

describe('expect-expect', () => {
  it('reports it() with no assertions', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = expectExpectRule.create(context)

    visitor.CallExpression!(callExpr(ident('it'), [
      { type: 'Literal', value: 'should work' },
      { body: [], type: 'ArrowFunctionExpression' },
    ]))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('no assertions')
  })

  it('reports test() with no assertions', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = expectExpectRule.create(context)

    visitor.CallExpression!(callExpr(ident('test'), [
      { type: 'Literal', value: 'should pass' },
      { body: [], type: 'ArrowFunctionExpression' },
    ]))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('no assertions')
  })

  it('does not report it() with expect() inside callback body', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = expectExpectRule.create(context)

    const expectCall = callExpr(ident('expect'), [{ type: 'Identifier', name: 'result' }])
    const fnBody = {
      body: [{ expression: expectCall, type: 'ExpressionStatement' }],
      type: 'BlockStatement',
    }

    visitor.CallExpression!(callExpr(ident('it'), [
      { type: 'Literal', value: 'has assertion' },
      { body: fnBody, params: [], type: 'ArrowFunctionExpression' },
    ]))

    expect(reports).toHaveLength(0)
  })

  it('does not report non-test function calls', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = expectExpectRule.create(context)

    visitor.CallExpression!(callExpr(ident('describe'), [
      { type: 'Literal', value: 'suite' },
    ]))

    expect(reports).toHaveLength(0)
  })

  it('recognizes custom assert function names', () => {
    const { context, reports } = createMockContext({ assertFunctionNames: ['assert'] })
    const visitor: RuleVisitor = expectExpectRule.create(context)

    const assertCall = callExpr(ident('assert'), [{ type: 'Identifier', name: 'result' }])
    const fnBody = {
      body: [{ expression: assertCall, type: 'ExpressionStatement' }],
      type: 'BlockStatement',
    }

    visitor.CallExpression!(callExpr(ident('it'), [
      { type: 'Literal', value: 'custom assert' },
      { body: fnBody, params: [], type: 'ArrowFunctionExpression' },
    ]))

    expect(reports).toHaveLength(0)
  })

  it('reports it() when only non-matching assertion present', () => {
    const { context, reports } = createMockContext({ assertFunctionNames: ['assert'] })
    const visitor: RuleVisitor = expectExpectRule.create(context)

    const expectCall = callExpr(ident('expect'), [{ type: 'Identifier', name: 'result' }])
    const fnBody = {
      body: [{ expression: expectCall, type: 'ExpressionStatement' }],
      type: 'BlockStatement',
    }

    visitor.CallExpression!(callExpr(ident('it'), [
      { type: 'Literal', value: 'wrong assert' },
      { body: fnBody, params: [], type: 'ArrowFunctionExpression' },
    ]))

    expect(reports).toHaveLength(1)
  })

  it('detects expect in member expression chains like expect(x).toBe(y)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = expectExpectRule.create(context)

    const expectCall = callExpr(
      memberExpr(
        { name: 'expect', type: 'Identifier' },
        'toBe',
      ),
      [{ type: 'Identifier', name: 'result' }],
    )
    const fnBody = {
      body: [{ expression: expectCall, type: 'ExpressionStatement' }],
      type: 'BlockStatement',
    }

    visitor.CallExpression!(callExpr(ident('it'), [
      { type: 'Literal', value: 'chained' },
      { body: fnBody, params: [], type: 'ArrowFunctionExpression' },
    ]))

    expect(reports).toHaveLength(0)
  })

  it('reports test() via member expression like it.skip()', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = expectExpectRule.create(context)

    visitor.CallExpression!(callExpr(memberExpr(ident('it'), 'skip'), [
      { type: 'Literal', value: 'skipped test' },
      { body: [], type: 'ArrowFunctionExpression' },
    ]))

    expect(reports).toHaveLength(1)
  })

  it('has correct meta properties', () => {
    expect(expectExpectRule.meta.docs?.category).toBe('testing')
    expect(expectExpectRule.meta.docs?.recommended).toBe(true)
    expect(expectExpectRule.meta.severity).toBe('warn')
    expect(expectExpectRule.meta.type).toBe('problem')
  })
})

// ─── Section: max-expects ───

describe('max-expects', () => {
  function makeTestCase(testName: string, expectCount: number) {
    const expectCalls = Array.from({ length: expectCount }, (_, i) =>
      callExpr(ident('expect'), [{ type: 'Literal', value: i }])
    )
    const fnBody = {
      body: expectCalls.map((ec) => ({ expression: ec, type: 'ExpressionStatement' })),
      type: 'BlockStatement',
    }

    return callExpr(ident('it'), [
      { type: 'Literal', value: testName },
      { body: fnBody, params: [], type: 'ArrowFunctionExpression' },
    ])
  }

  it('does not report when expect count is at default max (5)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = maxExpectsRule.create(context)

    const testNode = makeTestCase('five expects', 5)
    visitor.CallExpression!(testNode)
    for (let i = 0; i < 5; i++) {
      visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: i }]))
    }
    visitor['CallExpression:exit']!(testNode)

    expect(reports).toHaveLength(0)
  })

  it('reports when expect count exceeds default max (5)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = maxExpectsRule.create(context)

    const testNode = makeTestCase('six expects', 6)
    visitor.CallExpression!(testNode)
    for (let i = 0; i < 6; i++) {
      visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: i }]))
    }
    visitor['CallExpression:exit']!(testNode)

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Too many assertion calls (6)')
  })

  it('respects custom max option', () => {
    const { context, reports } = createMockContext({ max: 2 })
    const visitor: RuleVisitor = maxExpectsRule.create(context)

    const testNode = makeTestCase('three expects', 3)
    visitor.CallExpression!(testNode)
    for (let i = 0; i < 3; i++) {
      visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: i }]))
    }
    visitor['CallExpression:exit']!(testNode)

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Maximum allowed is 2')
  })

  it('does not report expect calls outside test cases', () => {
    const { context, reports } = createMockContext({ max: 1 })
    const visitor: RuleVisitor = maxExpectsRule.create(context)

    visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: 1 }]))
    visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: 2 }]))

    expect(reports).toHaveLength(0)
  })

  it('resets count between separate test cases', () => {
    const { context, reports } = createMockContext({ max: 2 })
    const visitor: RuleVisitor = maxExpectsRule.create(context)

    const test1 = makeTestCase('test 1', 0)
    visitor.CallExpression!(test1)
    visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: 1 }]))
    visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: 2 }]))
    visitor['CallExpression:exit']!(test1)

    const test2 = makeTestCase('test 2', 0)
    visitor.CallExpression!(test2)
    visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: 1 }]))
    visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: 2 }]))
    visitor['CallExpression:exit']!(test2)

    expect(reports).toHaveLength(0)
  })

  it('recognizes custom assert function names', () => {
    const { context, reports } = createMockContext({ assertFunctionNames: ['assert'], max: 1 })
    const visitor: RuleVisitor = maxExpectsRule.create(context)

    const testNode = callExpr(ident('it'), [
      { type: 'Literal', value: 'custom assert' },
      { body: [], params: [], type: 'ArrowFunctionExpression' },
    ])
    visitor.CallExpression!(testNode)
    visitor.CallExpression!(callExpr(ident('assert'), [{ type: 'Literal', value: 1 }]))
    visitor.CallExpression!(callExpr(ident('assert'), [{ type: 'Literal', value: 2 }]))
    visitor['CallExpression:exit']!(testNode)

    expect(reports).toHaveLength(1)
  })

  it('ignores non-assert expect-like calls when using custom assertFunctionNames', () => {
    const { context, reports } = createMockContext({ assertFunctionNames: ['assert'], max: 1 })
    const visitor: RuleVisitor = maxExpectsRule.create(context)

    const testNode = callExpr(ident('it'), [
      { type: 'Literal', value: 'mixed' },
      { body: [], params: [], type: 'ArrowFunctionExpression' },
    ])
    visitor.CallExpression!(testNode)
    visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: 1 }]))
    visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: 2 }]))
    visitor['CallExpression:exit']!(testNode)

    expect(reports).toHaveLength(0)
  })

  it('reports multiple violations when count far exceeds max', () => {
    const { context, reports } = createMockContext({ max: 1 })
    const visitor: RuleVisitor = maxExpectsRule.create(context)

    const testNode = makeTestCase('many expects', 4)
    visitor.CallExpression!(testNode)
    for (let i = 0; i < 4; i++) {
      visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: i }]))
    }
    visitor['CallExpression:exit']!(testNode)

    expect(reports).toHaveLength(3)
  })

  it('handles test() as test case entry (not just it())', () => {
    const { context, reports } = createMockContext({ max: 1 })
    const visitor: RuleVisitor = maxExpectsRule.create(context)

    const testNode = callExpr(ident('test'), [
      { type: 'Literal', value: 'using test fn' },
      { body: [], params: [], type: 'ArrowFunctionExpression' },
    ])
    visitor.CallExpression!(testNode)
    visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: 1 }]))
    visitor.CallExpression!(callExpr(ident('expect'), [{ type: 'Literal', value: 2 }]))
    visitor['CallExpression:exit']!(testNode)

    expect(reports).toHaveLength(1)
  })

  it('has correct meta properties', () => {
    expect(maxExpectsRule.meta.docs?.category).toBe('testing')
    expect(maxExpectsRule.meta.docs?.recommended).toBe(true)
    expect(maxExpectsRule.meta.severity).toBe('warn')
    expect(maxExpectsRule.meta.type).toBe('suggestion')
  })
})

// ─── Section: max-nested-describe ───

describe('max-nested-describe', () => {
  it('does not report single describe block (depth 1)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = maxNestedDescribeRule.create(context)

    const outer = callExpr(ident('describe'))
    visitor.CallExpression!(outer)
    visitor['CallExpression:exit']!(outer)

    expect(reports).toHaveLength(0)
  })

  it('does not report nesting at default max (5)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = maxNestedDescribeRule.create(context)

    const nodes = Array.from({ length: 5 }, () => callExpr(ident('describe')))
    for (const n of nodes) visitor.CallExpression!(n)
    for (const n of nodes.reverse()) visitor['CallExpression:exit']!(n)

    expect(reports).toHaveLength(0)
  })

  it('reports when nesting exceeds default max (5)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = maxNestedDescribeRule.create(context)

    const nodes = Array.from({ length: 6 }, () => callExpr(ident('describe')))
    for (const n of nodes) visitor.CallExpression!(n)

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Too many nested describe blocks (6)')
    expect(reports[0]!.message).toContain('Maximum allowed is 5')
  })

  it('respects custom max option', () => {
    const { context, reports } = createMockContext({ max: 2 })
    const visitor: RuleVisitor = maxNestedDescribeRule.create(context)

    const n1 = callExpr(ident('describe'))
    const n2 = callExpr(ident('describe'))
    const n3 = callExpr(ident('describe'))

    visitor.CallExpression!(n1)
    visitor.CallExpression!(n2)
    visitor.CallExpression!(n3)

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Maximum allowed is 2')
  })

  it('does not report non-describe calls', () => {
    const { context, reports } = createMockContext({ max: 1 })
    const visitor: RuleVisitor = maxNestedDescribeRule.create(context)

    visitor.CallExpression!(callExpr(ident('it')))
    visitor.CallExpression!(callExpr(ident('test')))
    visitor.CallExpression!(callExpr(ident('expect')))

    expect(reports).toHaveLength(0)
  })

  it('tracks depth correctly after exiting', () => {
    const { context, reports } = createMockContext({ max: 2 })
    const visitor: RuleVisitor = maxNestedDescribeRule.create(context)

    const outer = callExpr(ident('describe'))
    const inner = callExpr(ident('describe'))

    visitor.CallExpression!(outer)
    visitor.CallExpression!(inner)
    visitor['CallExpression:exit']!(inner)
    visitor['CallExpression:exit']!(outer)

    expect(reports).toHaveLength(0)

    const a = callExpr(ident('describe'))
    const b = callExpr(ident('describe'))
    visitor.CallExpression!(a)
    visitor.CallExpression!(b)
    visitor['CallExpression:exit']!(b)
    visitor['CallExpression:exit']!(a)

    expect(reports).toHaveLength(0)
  })

  it('recognizes context() as a describe-like call', () => {
    const { context, reports } = createMockContext({ max: 1 })
    const visitor: RuleVisitor = maxNestedDescribeRule.create(context)

    const n1 = callExpr(ident('context'))
    const n2 = callExpr(ident('context'))

    visitor.CallExpression!(n1)
    visitor.CallExpression!(n2)

    expect(reports).toHaveLength(1)
  })

  it('recognizes suite() as a describe-like call', () => {
    const { context, reports } = createMockContext({ max: 1 })
    const visitor: RuleVisitor = maxNestedDescribeRule.create(context)

    const n1 = callExpr(ident('suite'))
    const n2 = callExpr(ident('suite'))

    visitor.CallExpression!(n1)
    visitor.CallExpression!(n2)

    expect(reports).toHaveLength(1)
  })

  it('recognizes describe.only() as a describe call via member expression', () => {
    const { context, reports } = createMockContext({ max: 1 })
    const visitor: RuleVisitor = maxNestedDescribeRule.create(context)

    const n1 = callExpr(ident('describe'))
    const n2 = callExpr(memberExpr(ident('describe'), 'only'))

    visitor.CallExpression!(n1)
    visitor.CallExpression!(n2)

    expect(reports).toHaveLength(1)
  })

  it('reports multiple violations for deep nesting', () => {
    const { context, reports } = createMockContext({ max: 2 })
    const visitor: RuleVisitor = maxNestedDescribeRule.create(context)

    const nodes = Array.from({ length: 5 }, () => callExpr(ident('describe')))
    for (const n of nodes) visitor.CallExpression!(n)

    expect(reports).toHaveLength(3)
  })

  it('has correct meta properties', () => {
    expect(maxNestedDescribeRule.meta.docs?.category).toBe('testing')
    expect(maxNestedDescribeRule.meta.docs?.recommended).toBe(true)
    expect(maxNestedDescribeRule.meta.severity).toBe('warn')
    expect(maxNestedDescribeRule.meta.type).toBe('suggestion')
  })
})

// ─── Section: no-alias-methods ───

describe('no-alias-methods', () => {
  it('reports xit usage', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('xit')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'xit'")
    expect(reports[0]!.message).toContain("'it.skip'")
  })

  it('reports xtest usage', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('xtest')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'xtest'")
    expect(reports[0]!.message).toContain("'test.skip'")
  })

  it('reports xdescribe usage', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('xdescribe')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'xdescribe'")
    expect(reports[0]!.message).toContain("'describe.skip'")
  })

  it('reports xcontext usage', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('xcontext')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'xcontext'")
    expect(reports[0]!.message).toContain("'context.skip'")
  })

  it('reports fit usage', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('fit')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'fit'")
    expect(reports[0]!.message).toContain("'it.only'")
  })

  it('reports ftest usage', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('ftest')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'ftest'")
    expect(reports[0]!.message).toContain("'test.only'")
  })

  it('reports fdescribe usage', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('fdescribe')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'fdescribe'")
    expect(reports[0]!.message).toContain("'describe.only'")
  })

  it('reports fcontext usage', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('fcontext')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'fcontext'")
    expect(reports[0]!.message).toContain("'context.only'")
  })

  it('does not report regular it() call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('it')))

    expect(reports).toHaveLength(0)
  })

  it('does not report regular describe() call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('describe')))

    expect(reports).toHaveLength(0)
  })

  it('does not report it.skip() member expression call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(memberExpr(ident('it'), 'skip')))

    expect(reports).toHaveLength(0)
  })

  it('does not report unrelated function calls', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('console')))
    visitor.CallExpression!(callExpr(ident('expect')))
    visitor.CallExpression!(callExpr(ident('test')))

    expect(reports).toHaveLength(0)
  })

  it('does not report member expression calls like obj.fit()', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(memberExpr(ident('someObj'), 'fit')))

    expect(reports).toHaveLength(0)
  })

  it('reports multiple alias violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('xit'), [], 2, 0))
    visitor.CallExpression!(callExpr(ident('fdescribe'), [], 4, 0))

    expect(reports).toHaveLength(2)
    expect(reports[0]!.message).toContain("'xit'")
    expect(reports[1]!.message).toContain("'fdescribe'")
  })

  it('captures location in reports', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAliasMethodsRule.create(context)

    visitor.CallExpression!(callExpr(ident('xit'), [], 10, 4))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 5, line: 10 },
      start: { column: 4, line: 10 },
    })
  })

  it('has correct meta properties', () => {
    expect(noAliasMethodsRule.meta.docs?.category).toBe('testing')
    expect(noAliasMethodsRule.meta.docs?.recommended).toBe(false)
    expect(noAliasMethodsRule.meta.severity).toBe('warn')
    expect(noAliasMethodsRule.meta.type).toBe('suggestion')
  })
})
