import { describe, test, expect, vi } from 'vitest'
import { noConfusingDoubleEqualRule } from '../../../../src/rules/testing/no-confusing-double-equal.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(a == b);',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
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

function createIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function createLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

function createBinaryExpr(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 16 } },
  }
}

function createLogicalExpr(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
  }
}

function createExpectCall(arg: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'expect' },
    arguments: [arg],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createExpectWithChain(arg: unknown, chain: string[]): unknown {
  let calleeObject: unknown = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'expect' },
    arguments: [arg],
  }

  for (const prop of chain) {
    calleeObject = {
      type: 'MemberExpression',
      object: calleeObject,
      property: { type: 'Identifier', name: prop },
    }
  }

  return {
    type: 'CallExpression',
    callee: calleeObject,
    arguments: [],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
  }
}

function createCallExpr(name: string, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: args,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createMemberExpr(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: { type: 'Identifier', name: property },
  }
}

describe('no-confusing-double-equal rule', () => {

  // === Meta tests (2 tests) ===
  test('has correct meta properties', () => {
    expect(noConfusingDoubleEqualRule.meta.docs.category).toBe('testing')
    expect(noConfusingDoubleEqualRule.meta.docs.description).toBe(
      'Disallow loose equality (== and !=) in expect() arguments',
    )
    expect(noConfusingDoubleEqualRule.meta.severity).toBe('warn')
    expect(noConfusingDoubleEqualRule.meta.type).toBe('suggestion')
    expect(noConfusingDoubleEqualRule.meta.docs.recommended).toBe(false)
  })

  test('has correct docs url', () => {
    expect(noConfusingDoubleEqualRule.meta.docs.url).toBe(
      'https://codeforge.dev/docs/rules/no-confusing-double-equal',
    )
  })

  // === expect(a == b) → reports (5 tests) ===
  test('reports == in expect(a == b)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain("Use strict equality ('===')")
  })

  test('reports == with literal values', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('x'), '==', createLiteral(null))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  test('reports == with number literals', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createLiteral(0), '==', createLiteral(false))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  test('reports == with member expressions', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(
      createMemberExpr(createIdentifier('obj'), 'value'),
      '==',
      createLiteral(42),
    )
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  test('reports == with string literals', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createLiteral('hello'), '==', createLiteral('world'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  // === expect(a === b) → no report (3 tests) ===
  test('does not report === in expect(a === b)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '===', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report === with literals', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('x'), '===', createLiteral(null))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report === with member expressions', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(
      createMemberExpr(createIdentifier('obj'), 'val'),
      '===',
      createLiteral(42),
    )
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  // === expect(a != b) → reports (3 tests) ===
  test('reports != in expect(a != b)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '!=', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain("Use strict equality ('!==')")
  })

  test('reports != with null literal', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('x'), '!=', createLiteral(null))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  test('reports != with undefined', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('y'), '!=', createIdentifier('undefined'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  // === expect(a !== b) → no report (3 tests) ===
  test('does not report !== in expect(a !== b)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '!==', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report !== with literals', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('x'), '!==', createLiteral(null))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report !== with member expressions', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(
      createMemberExpr(createIdentifier('obj'), 'val'),
      '!==',
      createLiteral(0),
    )
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  // === expect(a == b).toBe(true) → reports the == inside expect arg (2 tests) ===
  test('reports == inside expect when followed by .toBe(true)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const node = createExpectWithChain(binaryExpr, ['toBe'])
    visitor.CallExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports == inside expect when followed by .toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('x'), '==', createLiteral(1))
    const node = createExpectWithChain(binaryExpr, ['toEqual'])
    visitor.CallExpression(node)
    expect(reports.length).toBe(1)
  })

  // === expect(a == b).not.toBe(true) → still reports == (2 tests) ===
  test('reports == inside expect().not chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const node = createExpectWithChain(binaryExpr, ['not', 'toBe'])
    visitor.CallExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports != inside expect().not.toBeFalsy()', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('x'), '!=', createLiteral(null))
    const node = createExpectWithChain(binaryExpr, ['not', 'toBeFalsy'])
    visitor.CallExpression(node)
    expect(reports.length).toBe(1)
  })

  // === expect(a == b && c != d) → reports BOTH operators (2 tests) ===
  test('reports both == and != in logical AND expression', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const left = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const right = createBinaryExpr(createIdentifier('c'), '!=', createIdentifier('d'))
    const logicalExpr = createLogicalExpr(left, '&&', right)
    visitor.CallExpression(createExpectCall(logicalExpr))
    expect(reports.length).toBe(2)
  })

  test('reports both == operators in logical AND', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const left = createBinaryExpr(createIdentifier('x'), '==', createLiteral(1))
    const right = createBinaryExpr(createIdentifier('y'), '==', createLiteral(2))
    const logicalExpr = createLogicalExpr(left, '&&', right)
    visitor.CallExpression(createExpectCall(logicalExpr))
    expect(reports.length).toBe(2)
  })

  // === expect(fn()) where fn returns a comparison → no report (2 tests) ===
  test('does not report when argument is a function call', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const fnCall = createCallExpr('getResult', [])
    visitor.CallExpression(createExpectCall(fnCall))
    expect(reports.length).toBe(0)
  })

  test('does not report when argument is a method call', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const methodCall = {
      type: 'CallExpression',
      callee: createMemberExpr(createIdentifier('obj'), 'method'),
      arguments: [],
    }
    visitor.CallExpression(createExpectCall(methodCall))
    expect(reports.length).toBe(0)
  })

  // === Non-expect call with == → no report (3 tests) ===
  test('does not report == in non-expect call', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    visitor.CallExpression(createCallExpr('assert', [binaryExpr]))
    expect(reports.length).toBe(0)
  })

  test('does not report == in console.log call', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('x'), '==', createLiteral(1))
    visitor.CallExpression(createCallExpr('log', [binaryExpr]))
    expect(reports.length).toBe(0)
  })

  test('does not report == in foo() call', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    visitor.CallExpression(createCallExpr('foo', [binaryExpr]))
    expect(reports.length).toBe(0)
  })

  // === Edge cases: null node, undefined, non-CallExpression → no report (3 tests) ===
  test('does not report for null node', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    visitor.CallExpression(null)
    expect(reports.length).toBe(0)
  })

  test('does not report for undefined node', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    visitor.CallExpression(undefined)
    expect(reports.length).toBe(0)
  })

  test('does not report for non-object node', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    visitor.CallExpression('string')
    expect(reports.length).toBe(0)
  })

  // === expect(x) with non-binary arguments → no report (3 tests) ===
  test('does not report for identifier argument', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    visitor.CallExpression(createExpectCall(createIdentifier('x')))
    expect(reports.length).toBe(0)
  })

  test('does not report for literal argument', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    visitor.CallExpression(createExpectCall(createLiteral(42)))
    expect(reports.length).toBe(0)
  })

  test('does not report for function call argument', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const fnCall = createCallExpr('getValue', [])
    visitor.CallExpression(createExpectCall(fnCall))
    expect(reports.length).toBe(0)
  })

  // === expect(a + b) → no report (not == or !=) (2 tests) ===
  test('does not report for + operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '+', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report for < operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '<', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  // === Nested BinaryExpression: expect(a == b || c == d) → reports both (2 tests) ===
  test('reports both == in logical OR expression', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const left = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const right = createBinaryExpr(createIdentifier('c'), '==', createIdentifier('d'))
    const logicalExpr = createLogicalExpr(left, '||', right)
    visitor.CallExpression(createExpectCall(logicalExpr))
    expect(reports.length).toBe(2)
  })

  test('reports == and != in nested logical OR', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const left = createBinaryExpr(createIdentifier('x'), '==', createLiteral(1))
    const right = createBinaryExpr(createIdentifier('y'), '!=', createLiteral(null))
    const logicalExpr = createLogicalExpr(left, '||', right)
    visitor.CallExpression(createExpectCall(logicalExpr))
    expect(reports.length).toBe(2)
  })

  // === Location reporting (2 tests) ===
  test('reports location for == expression', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports[0].loc).toBeDefined()
    expect(reports[0].loc.start.line).toBe(1)
    expect(reports[0].loc.start.column).toBe(7)
  })

  test('reports location with custom line', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = {
      type: 'BinaryExpression',
      operator: '==',
      left: createIdentifier('a'),
      right: createIdentifier('b'),
      loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 20 } },
    }
    visitor.CallExpression(createExpectCall(binaryExpr, 5, 2))
    expect(reports[0].loc).toBeDefined()
    expect(reports[0].loc.start.line).toBe(5)
    expect(reports[0].loc.start.column).toBe(10)
  })

  // === Exact message text verification (2 tests) ===
  test('reports correct message for ==', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports[0].message).toBe("Use strict equality ('===') instead of loose equality ('==').")
  })

  test('reports correct message for !=', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '!=', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports[0].message).toBe("Use strict equality ('!==') instead of loose equality ('!=').")
  })

  // === Meta/default export checks (2 tests) ===
  test('exports rule as default export', () => {
    const defaultExport = (noConfusingDoubleEqualRule as unknown as { default: unknown }).default
    expect(defaultExport).toBeUndefined()
  })

  test('create returns a visitor with CallExpression handler', () => {
    const { context } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    expect(typeof visitor.CallExpression).toBe('function')
  })

  // === State isolation (2 tests) ===
  test('separate contexts do not share reports', () => {
    const ctx1 = createMockContext()
    const ctx2 = createMockContext()
    const visitor1 = noConfusingDoubleEqualRule.create(ctx1.context)
    const visitor2 = noConfusingDoubleEqualRule.create(ctx2.context)

    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    visitor1.CallExpression(createExpectCall(binaryExpr))

    visitor2.CallExpression(createExpectCall(createIdentifier('x')))

    expect(ctx1.reports.length).toBe(1)
    expect(ctx2.reports.length).toBe(0)
  })

  test('multiple calls to same visitor accumulate reports independently', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)

    const binaryExpr1 = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const binaryExpr2 = createBinaryExpr(createIdentifier('c'), '!=', createIdentifier('d'))

    visitor.CallExpression(createExpectCall(binaryExpr1))
    visitor.CallExpression(createExpectCall(binaryExpr2))

    expect(reports.length).toBe(2)
  })

  // === Multiple expect calls in same visitor (2 tests) ===
  test('reports in multiple independent expect calls', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)

    const binaryExpr1 = createBinaryExpr(createIdentifier('x'), '==', createLiteral(1))
    const binaryExpr2 = createBinaryExpr(createIdentifier('y'), '==', createLiteral(2))

    visitor.CallExpression(createExpectCall(binaryExpr1))
    visitor.CallExpression(createExpectCall(binaryExpr2))

    expect(reports.length).toBe(2)
  })

  test('reports only the expect call with ==, not the one without', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)

    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))

    visitor.CallExpression(createExpectCall(binaryExpr))
    visitor.CallExpression(createExpectCall(createIdentifier('x')))

    expect(reports.length).toBe(1)
  })

  // === expect.resolves/rejects chains (2 tests) ===
  test('reports == inside expect.resolves chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const node = createExpectWithChain(binaryExpr, ['resolves', 'toBe'])
    visitor.CallExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports != inside expect.rejects chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '!=', createIdentifier('b'))
    const node = createExpectWithChain(binaryExpr, ['rejects', 'toBe'])
    visitor.CallExpression(node)
    expect(reports.length).toBe(1)
  })

  // === expect with complex member expression arguments → no report (3 tests) ===
  test('does not report for member expression argument', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const memberExpr = createMemberExpr(createIdentifier('obj'), 'prop')
    visitor.CallExpression(createExpectCall(memberExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report for nested member expression argument', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const innerMember = createMemberExpr(createIdentifier('obj'), 'nested')
    const outerMember = createMemberExpr(innerMember, 'value')
    visitor.CallExpression(createExpectCall(outerMember))
    expect(reports.length).toBe(0)
  })

  test('does not report for array access member expression', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const computedMember = {
      type: 'MemberExpression',
      object: createIdentifier('arr'),
      property: createLiteral(0),
      computed: true,
    }
    visitor.CallExpression(createExpectCall(computedMember))
    expect(reports.length).toBe(0)
  })

  // === Deep nesting and mixed expressions ===
  test('reports == in three-level logical nesting', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const left = createLogicalExpr(
      createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b')),
      '&&',
      createBinaryExpr(createIdentifier('c'), '==', createIdentifier('d')),
    )
    const right = createBinaryExpr(createIdentifier('e'), '!=', createIdentifier('f'))
    const logicalExpr = createLogicalExpr(left, '||', right)
    visitor.CallExpression(createExpectCall(logicalExpr))
    expect(reports.length).toBe(3)
  })

  test('reports only == in mixed strict/loose expression', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const left = createBinaryExpr(createIdentifier('a'), '===', createIdentifier('b'))
    const right = createBinaryExpr(createIdentifier('c'), '==', createIdentifier('d'))
    const logicalExpr = createLogicalExpr(left, '&&', right)
    visitor.CallExpression(createExpectCall(logicalExpr))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain("'==='")
  })

  test('does not report for ternary as expect argument', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const conditional = {
      type: 'ConditionalExpression',
      test: createBinaryExpr(createIdentifier('a'), '===', createIdentifier('b')),
      consequent: createLiteral(1),
      alternate: createLiteral(2),
    }
    visitor.CallExpression(createExpectCall(conditional))
    expect(reports.length).toBe(0)
  })

  test('does not report == inside ternary test expression (not walked by rule)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const conditional = {
      type: 'ConditionalExpression',
      test: createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b')),
      consequent: createLiteral(1),
      alternate: createLiteral(2),
    }
    visitor.CallExpression(createExpectCall(conditional))
    expect(reports.length).toBe(0)
  })

  test('does not report for template literal as expect argument', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const templateLiteral = {
      type: 'TemplateLiteral',
      quasis: [{ type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' } }],
      expressions: [createIdentifier('name')],
    }
    visitor.CallExpression(createExpectCall(templateLiteral))
    expect(reports.length).toBe(0)
  })

  test('does not report when expect has no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'expect' },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
    }
    visitor.CallExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when expect argument is null', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    visitor.CallExpression(createExpectCall(null))
    expect(reports.length).toBe(0)
  })

  test('reports == in typeof comparison', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const typeofExpr = {
      type: 'UnaryExpression',
      operator: 'typeof',
      prefix: true,
      argument: createIdentifier('a'),
    }
    const binaryExpr = createBinaryExpr(typeofExpr, '==', createLiteral('string'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  // === Various chain patterns ===
  test('reports == in expect.resolves.not.toBe chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const node = createExpectWithChain(binaryExpr, ['resolves', 'not', 'toBe'])
    visitor.CallExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports != in expect.rejects.not.toEqual chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('x'), '!=', createLiteral(null))
    const node = createExpectWithChain(binaryExpr, ['rejects', 'not', 'toEqual'])
    visitor.CallExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports == inside expect().toStrictEqual(true) chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const node = createExpectWithChain(binaryExpr, ['toStrictEqual'])
    visitor.CallExpression(node)
    expect(reports.length).toBe(1)
  })

  // === Various safe operators → no report ===
  test('does not report for > operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '>', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report for >= operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '>=', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report for <= operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '<=', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report for * operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '*', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report for / operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '/', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report for % operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '%', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report for ** operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '**', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report for in operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), 'in', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  test('does not report for instanceof operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), 'instanceof', createIdentifier('b'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(0)
  })

  // === Specific type coercion cases ===
  test('reports == with null == undefined comparison', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createLiteral(null), '==', createIdentifier('undefined'))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  test('reports != with empty string and zero', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createLiteral(''), '!=', createLiteral(0))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  test('reports == with boolean and number', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createLiteral(true), '==', createLiteral(1))
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  // === Both sides as member expressions ===
  test('reports == with member expressions on both sides', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(
      createMemberExpr(createIdentifier('obj'), 'a'),
      '==',
      createMemberExpr(createIdentifier('obj'), 'b'),
    )
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  test('reports != with nested member expressions on both sides', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const left = createMemberExpr(createMemberExpr(createIdentifier('obj'), 'nested'), 'a')
    const right = createMemberExpr(createMemberExpr(createIdentifier('obj'), 'nested'), 'b')
    const binaryExpr = createBinaryExpr(left, '!=', right)
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
  })

  // === Nested binary expressions ===
  test('reports == in deeply nested arithmetic expression', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const addExpr = createBinaryExpr(createIdentifier('a'), '+', createIdentifier('b'))
    const eqExpr = createBinaryExpr(addExpr, '==', createLiteral(5))
    visitor.CallExpression(createExpectCall(eqExpr))
    expect(reports.length).toBe(1)
  })

  test('reports only the == operator, not the +', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const addExpr = createBinaryExpr(createIdentifier('a'), '+', createIdentifier('b'))
    const eqExpr = createBinaryExpr(addExpr, '==', createLiteral(5))
    visitor.CallExpression(createExpectCall(eqExpr))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain("'=='")
  })

  test('reports != inside nested binary comparison', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const mulExpr = createBinaryExpr(createIdentifier('x'), '*', createIdentifier('y'))
    const neqExpr = createBinaryExpr(mulExpr, '!=', createLiteral(0))
    visitor.CallExpression(createExpectCall(neqExpr))
    expect(reports.length).toBe(1)
  })

  // === Edge cases with callee types ===
  test('does not report for expect-like call with different callee type', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const node = {
      type: 'CallExpression',
      callee: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      arguments: [binaryExpr],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    visitor.CallExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report for empty object node', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    visitor.CallExpression({})
    expect(reports.length).toBe(0)
  })

  test('does not report for node with type but no callee', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    visitor.CallExpression({ type: 'CallExpression' })
    expect(reports.length).toBe(0)
  })

  // === Multiple violations with different operators ===
  test('reports 3 violations in complex logical expression', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const left = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const mid = createBinaryExpr(createIdentifier('c'), '!=', createIdentifier('d'))
    const right = createBinaryExpr(createIdentifier('e'), '==', createLiteral(0))
    const logicalAnd = createLogicalExpr(left, '&&', mid)
    const logicalOr = createLogicalExpr(logicalAnd, '||', right)
    visitor.CallExpression(createExpectCall(logicalOr))
    expect(reports.length).toBe(3)
  })

  test('reports correct messages for mixed == and != violations', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const left = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const right = createBinaryExpr(createIdentifier('c'), '!=', createIdentifier('d'))
    const logicalExpr = createLogicalExpr(left, '&&', right)
    visitor.CallExpression(createExpectCall(logicalExpr))
    expect(reports.length).toBe(2)
    const messages = reports.map(r => r.message)
    expect(messages.some(m => m.includes("'==='"))).toBe(true)
    expect(messages.some(m => m.includes("'!=='"))).toBe(true)
  })

  // === More non-expect callee tests ===
  test('does not report == in assert.equal call', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    visitor.CallExpression(createCallExpr('equal', [binaryExpr]))
    expect(reports.length).toBe(0)
  })

  test('does not report == in require() call', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    visitor.CallExpression(createCallExpr('require', [binaryExpr]))
    expect(reports.length).toBe(0)
  })

  // === Additional resolved/rejects patterns ===
  test('reports == in expect().resolves.toEqual chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    const node = createExpectWithChain(binaryExpr, ['resolves', 'toEqual'])
    visitor.CallExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports != in expect().rejects.toThrow chain', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('x'), '!=', createLiteral(null))
    const node = createExpectWithChain(binaryExpr, ['rejects', 'toThrow'])
    visitor.CallExpression(node)
    expect(reports.length).toBe(1)
  })

  test('does not report for ArrayExpression as expect argument', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const arrayExpr = {
      type: 'ArrayExpression',
      elements: [createLiteral(1), createLiteral(2)],
    }
    visitor.CallExpression(createExpectCall(arrayExpr))
    expect(reports.length).toBe(0)
  })

  test('reports == inside nested LogicalExpression (||)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const left = createBinaryExpr(createIdentifier('a'), '==', createLiteral(1))
    const right = createBinaryExpr(createIdentifier('b'), '==', createLiteral(2))
    const logical = { type: 'LogicalExpression', operator: '||', left, right }
    visitor.CallExpression(createExpectCall(logical))
    expect(reports.length).toBe(2)
  })

  test('reports != inside nested LogicalExpression (&&)', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const left = createBinaryExpr(createIdentifier('x'), '!=', createLiteral(0))
    const right = createBinaryExpr(createIdentifier('y'), '!=', createLiteral(null))
    const logical = { type: 'LogicalExpression', operator: '&&', left, right }
    visitor.CallExpression(createExpectCall(logical))
    expect(reports.length).toBe(2)
  })

  test('report message mentions strict equality alternative for ==', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '==', createIdentifier('b'))
    binaryExpr.loc = { start: { line: 1, column: 7 }, end: { line: 1, column: 14 } }
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
    expect(reports[0]!.message).toContain('===')
  })

  test('report message mentions strict inequality alternative for !=', () => {
    const { context, reports } = createMockContext()
    const visitor = noConfusingDoubleEqualRule.create(context)
    const binaryExpr = createBinaryExpr(createIdentifier('a'), '!=', createIdentifier('b'))
    binaryExpr.loc = { start: { line: 1, column: 7 }, end: { line: 1, column: 14 } }
    visitor.CallExpression(createExpectCall(binaryExpr))
    expect(reports.length).toBe(1)
    expect(reports[0]!.message).toContain('!==')
  })

  test('meta has correct properties', () => {
    expect(noConfusingDoubleEqualRule.meta.type).toBe('suggestion')
    expect(noConfusingDoubleEqualRule.meta.severity).toBe('warn')
    expect(noConfusingDoubleEqualRule.meta.docs?.category).toBe('testing')
    expect(noConfusingDoubleEqualRule.meta.fixable).toBeUndefined()
  })
})
