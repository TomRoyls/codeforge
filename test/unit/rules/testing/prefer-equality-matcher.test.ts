import { describe, test, expect, vi } from 'vitest'
import { preferEqualityMatcherRule } from '../../../../src/rules/testing/prefer-equality-matcher.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(a === b).toBe(true);',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
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

function createEqualityExpectCall(
  left: unknown,
  operator: string,
  right: unknown,
  matcherName: string,
  matcherArg: unknown,
  hasNot = false,
  line = 1,
  column = 0,
): unknown {
  const expectArg = {
    type: 'BinaryExpression',
    operator,
    left,
    right,
  }

  const expectCall = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'expect' },
    arguments: [expectArg],
  }

  let calleeObject: unknown = expectCall

  if (hasNot) {
    calleeObject = {
      type: 'MemberExpression',
      object: expectCall,
      property: { type: 'Identifier', name: 'not' },
    }
  }

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: calleeObject,
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [matcherArg],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function createLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

describe('prefer-equality-matcher rule', () => {
  // === Meta tests ===
  test('has correct meta properties', () => {
    expect(preferEqualityMatcherRule.meta.docs.category).toBe('testing')
    expect(preferEqualityMatcherRule.meta.docs.description).toBe(
      'Enforce using equality matchers instead of comparing boolean expressions',
    )
    expect(preferEqualityMatcherRule.meta.docs.recommended).toBe(true)
    expect(preferEqualityMatcherRule.meta.docs.url).toBe(
      'https://codeforge.dev/docs/rules/prefer-equality-matcher',
    )
    expect(preferEqualityMatcherRule.meta.severity).toBe('warn')
    expect(preferEqualityMatcherRule.meta.type).toBe('suggestion')
  })

  test('has create function', () => {
    expect(typeof preferEqualityMatcherRule.create).toBe('function')
  })

  // === Strict equality with toBe(true) ===
  test('reports expect(a === b).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '===',
      createIdentifier('b'),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a === b).toBe(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '===',
      createIdentifier('b'),
      'toBe',
      createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a !== b).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '!==',
      createIdentifier('b'),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a !== b).toBe(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '!==',
      createIdentifier('b'),
      'toBe',
      createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  // === Loose equality ===
  test('reports expect(a == b).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '==',
      createIdentifier('b'),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a != b).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '!=',
      createIdentifier('b'),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  // === with toEqual matcher ===
  test('reports expect(a === b).toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '===',
      createIdentifier('b'),
      'toEqual',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a === b).toStrictEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '===',
      createIdentifier('b'),
      'toStrictEqual',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  // === with .not chain ===
  test('reports expect(a === b).not.toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '===',
      createIdentifier('b'),
      'toBe',
      createLiteral(true),
      true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a === b).not.toBe(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '===',
      createIdentifier('b'),
      'toBe',
      createLiteral(false),
      true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a !== b).not.toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '!==',
      createIdentifier('b'),
      'toBe',
      createLiteral(true),
      true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a !== b).not.toBe(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '!==',
      createIdentifier('b'),
      'toBe',
      createLiteral(false),
      true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  // === Literal values in comparison ===
  test('reports expect(x === null).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('x'),
      '===',
      createLiteral(null),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(x).toBe(null)')
  })

  test('reports expect(x === 0).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('x'),
      '===',
      createLiteral(0),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(x).toBe(0)')
  })

  test('reports expect(x === "hello").toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('x'),
      '===',
      createLiteral('hello'),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("expect(x).toBe('hello')")
  })

  // === Does NOT report ===
  test('does not report expect(a === b).toBeTruthy()', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '===',
      createIdentifier('b'),
      'toBeTruthy',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'a' }],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: true }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a === b).toBe(someVar)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '===',
      createIdentifier('b'),
      'toBe',
      createIdentifier('someVar'),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a + b).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const expectArg = {
      type: 'BinaryExpression',
      operator: '+',
      left: createIdentifier('a'),
      right: createIdentifier('b'),
    }
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [expectArg],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: true }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a > b).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '>',
      createIdentifier('b'),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report when expect arg is not a BinaryExpression', () => {
    const { context, reports } = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'a' }],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: true }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a === b).toBe() with no arguments', () => {
    const { context, reports } = createMockContext()
    const expectArg = {
      type: 'BinaryExpression',
      operator: '===',
      left: createIdentifier('a'),
      right: createIdentifier('b'),
    }
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [expectArg],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a === b).toBe(true, extra)', () => {
    const { context, reports } = createMockContext()
    const expectArg = {
      type: 'BinaryExpression',
      operator: '===',
      left: createIdentifier('a'),
      right: createIdentifier('b'),
    }
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [expectArg],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: true }, { type: 'Literal', value: 42 }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  // === Non-matcher call expressions ===
  test('does not report for non-MemberExpression callee', () => {
    const { context, reports } = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'someFunction' },
      arguments: [{ type: 'Literal', value: true }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  // === Location extraction ===
  test('includes location in report', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '===',
      createIdentifier('b'),
      'toBe',
      createLiteral(true),
      false,
      5,
      10,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].loc).toBeDefined()
    expect(reports[0].loc!.start.line).toBe(5)
    expect(reports[0].loc!.start.column).toBe(10)
  })

  // === Member expression operands ===
  test('reports expect(obj.a === obj.b).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const left = {
      type: 'MemberExpression',
      object: createIdentifier('obj'),
      property: createIdentifier('a'),
    }
    const right = {
      type: 'MemberExpression',
      object: createIdentifier('obj'),
      property: createIdentifier('b'),
    }
    const node = createEqualityExpectCall(
      left,
      '===',
      right,
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(obj.a).toBe(obj.b)')
  })

  // === Multiple expect arguments not reported ===
  test('does not report expect with multiple arguments in binary check', () => {
    const { context, reports } = createMockContext()
    const expectArg = {
      type: 'BinaryExpression',
      operator: '===',
      left: createIdentifier('a'),
      right: createIdentifier('b'),
    }
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [expectArg, createIdentifier('extra')],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: true }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  // === No expect arguments ===
  test('does not report expect().toBe(true)', () => {
    const { context, reports } = createMockContext()
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
      arguments: [{ type: 'Literal', value: true }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  // === Node with null/undefined input ===
  test('handles null node gracefully', () => {
    const { context, reports } = createMockContext()
    preferEqualityMatcherRule.create(context).CallExpression!(null)
    expect(reports).toHaveLength(0)
  })

  test('handles undefined node gracefully', () => {
    const { context, reports } = createMockContext()
    preferEqualityMatcherRule.create(context).CallExpression!(undefined)
    expect(reports).toHaveLength(0)
  })

  // === Edge cases for operators ===
  test('does not report for instanceof operator', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      'instanceof',
      createIdentifier('Foo'),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report for in operator', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      'in',
      createIdentifier('obj'),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  // === Combination: expect(a != b).toBe(false) ===
  test('reports expect(a != b).toBe(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '!=',
      createIdentifier('b'),
      'toBe',
      createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  // === Combination: expect(a == b).toBe(false) ===
  test('reports expect(a == b).toBe(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '==',
      createIdentifier('b'),
      'toBe',
      createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  // === Combination: expect(a != b).toEqual(true) ===
  test('reports expect(a != b).toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '!=',
      createIdentifier('b'),
      'toEqual',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  // === Combination: expect(a == b).not.toBe(true) ===
  test('reports expect(a == b).not.toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '==',
      createIdentifier('b'),
      'toBe',
      createLiteral(true),
      true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  // === Combination: expect(a == b).not.toBe(false) ===
  test('reports expect(a == b).not.toBe(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '==',
      createIdentifier('b'),
      'toBe',
      createLiteral(false),
      true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  // === Combination: expect(a != b).not.toBe(true) ===
  test('reports expect(a != b).not.toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '!=',
      createIdentifier('b'),
      'toBe',
      createLiteral(true),
      true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  // === Combination: expect(a != b).not.toBe(false) ===
  test('reports expect(a != b).not.toBe(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '!=',
      createIdentifier('b'),
      'toBe',
      createLiteral(false),
      true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  // === Combination: expect(a !== b).toEqual(false) ===
  test('reports expect(a !== b).toEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '!==',
      createIdentifier('b'),
      'toEqual',
      createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  // === Combination: expect(a === b).toStrictEqual(false) ===
  test('reports expect(a === b).toStrictEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '===',
      createIdentifier('b'),
      'toStrictEqual',
      createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  // === Numeric literal operands ===
  test('reports expect(count === 5).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('count'),
      '===',
      createLiteral(5),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(count).toBe(5)')
  })

  test('reports expect(result === false).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('result'),
      '===',
      createLiteral(false),
      'toBe',
      createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(result).toBe(false)')
  })

  // === Extra meta verification ===
  test('rule meta has correct docs url format', () => {
    const url = preferEqualityMatcherRule.meta.docs.url!
    expect(url).toMatch(/^https:\/\/codeforge\.dev\/docs\/rules\//)
  })

  test('rule has valid severity type', () => {
    expect(['error', 'warn', 'off']).toContain(preferEqualityMatcherRule.meta.severity)
  })

  test('rule has valid type value', () => {
    expect(['problem', 'suggestion', 'layout']).toContain(preferEqualityMatcherRule.meta.type)
  })

  // === Double negation cases ===
  test('expect(a !== b).not.toBe(false) resolves to expect(a).not.toBe(b)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '!==',
      createIdentifier('b'),
      'toBe',
      createLiteral(false),
      true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('expect(a === b).not.toBe(false) resolves to expect(a).toBe(b)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'),
      '===',
      createIdentifier('b'),
      'toBe',
      createLiteral(false),
      true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a == b).toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '==', createIdentifier('b'), 'toEqual', createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a == b).toEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '==', createIdentifier('b'), 'toEqual', createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a === b).toEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '===', createIdentifier('b'), 'toEqual', createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a !== b).toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!==', createIdentifier('b'), 'toEqual', createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a != b).toEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!=', createIdentifier('b'), 'toEqual', createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a == b).toStrictEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '==', createIdentifier('b'), 'toStrictEqual', createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a == b).toStrictEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '==', createIdentifier('b'), 'toStrictEqual', createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a !== b).toStrictEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!==', createIdentifier('b'), 'toStrictEqual', createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a != b).toStrictEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!=', createIdentifier('b'), 'toStrictEqual', createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a != b).toStrictEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!=', createIdentifier('b'), 'toStrictEqual', createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a === b).not.toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '===', createIdentifier('b'), 'toEqual', createLiteral(true), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a === b).not.toEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '===', createIdentifier('b'), 'toEqual', createLiteral(false), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a !== b).not.toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!==', createIdentifier('b'), 'toEqual', createLiteral(true), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a !== b).not.toEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!==', createIdentifier('b'), 'toEqual', createLiteral(false), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a == b).not.toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '==', createIdentifier('b'), 'toEqual', createLiteral(true), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a == b).not.toEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '==', createIdentifier('b'), 'toEqual', createLiteral(false), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a != b).not.toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!=', createIdentifier('b'), 'toEqual', createLiteral(true), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a != b).not.toEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!=', createIdentifier('b'), 'toEqual', createLiteral(false), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a === b).not.toStrictEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '===', createIdentifier('b'), 'toStrictEqual', createLiteral(true), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a === b).not.toStrictEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '===', createIdentifier('b'), 'toStrictEqual', createLiteral(false), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a !== b).not.toStrictEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!==', createIdentifier('b'), 'toStrictEqual', createLiteral(true), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a !== b).not.toStrictEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!==', createIdentifier('b'), 'toStrictEqual', createLiteral(false), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a == b).not.toStrictEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '==', createIdentifier('b'), 'toStrictEqual', createLiteral(true), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a == b).not.toStrictEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '==', createIdentifier('b'), 'toStrictEqual', createLiteral(false), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a != b).not.toStrictEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!=', createIdentifier('b'), 'toStrictEqual', createLiteral(true), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a != b).not.toStrictEqual(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!=', createIdentifier('b'), 'toStrictEqual', createLiteral(false), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(fn() === b).toBe(true) with CallExpression left', () => {
    const { context, reports } = createMockContext()
    const callExpr = { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }
    const node = createEqualityExpectCall(callExpr, '===', createIdentifier('b'), 'toBe', createLiteral(true))
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(fn()).toBe(b)')
  })

  test('reports expect(a === fn()).toBe(true) with CallExpression right', () => {
    const { context, reports } = createMockContext()
    const callExpr = { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }
    const node = createEqualityExpectCall(createIdentifier('a'), '===', callExpr, 'toBe', createLiteral(true))
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(fn())')
  })

  test('reports expect(a.b.c === d.e.f).toBe(true) with deep member access', () => {
    const { context, reports } = createMockContext()
    const deepLeft = {
      type: 'MemberExpression',
      object: { type: 'MemberExpression', object: createIdentifier('a'), property: createIdentifier('b') },
      property: createIdentifier('c'),
    }
    const deepRight = {
      type: 'MemberExpression',
      object: { type: 'MemberExpression', object: createIdentifier('d'), property: createIdentifier('e') },
      property: createIdentifier('f'),
    }
    const node = createEqualityExpectCall(deepLeft, '===', deepRight, 'toBe', createLiteral(true))
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a.b.c).toBe(d.e.f)')
  })

  test('reports expect((a === b) === true).toBe(true) with nested binary left', () => {
    const { context, reports } = createMockContext()
    const nestedBinary = { type: 'BinaryExpression', operator: '===', left: createIdentifier('a'), right: createIdentifier('b') }
    const node = createEqualityExpectCall(nestedBinary, '===', createLiteral(true), 'toBe', createLiteral(true))
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a === b).toBe(true)')
  })

  test('reports expect(a === (b === c)).toBe(true) with nested binary right', () => {
    const { context, reports } = createMockContext()
    const nestedBinary = { type: 'BinaryExpression', operator: '===', left: createIdentifier('b'), right: createIdentifier('c') }
    const node = createEqualityExpectCall(createIdentifier('a'), '===', nestedBinary, 'toBe', createLiteral(true))
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b === c)')
  })

  test('reports with default text for unknown node type operand', () => {
    const { context, reports } = createMockContext()
    const unknownNode = { type: 'ArrayExpression', elements: [] }
    const node = createEqualityExpectCall(unknownNode, '===', createIdentifier('b'), 'toBe', createLiteral(true))
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(value).toBe(b)')
  })

  test('does not report expect(a === b).toBe(1)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '===', createIdentifier('b'), 'toBe', createLiteral(1),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a === b).toBe("string")', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '===', createIdentifier('b'), 'toBe', createLiteral('string'),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a === b).toBe(null)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '===', createIdentifier('b'), 'toBe', createLiteral(null),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report when matcher object is MemberExpression with resolves', () => {
    const { context, reports } = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'BinaryExpression', operator: '===', left: createIdentifier('a'), right: createIdentifier('b') }],
          },
          property: { type: 'Identifier', name: 'resolves' },
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [createLiteral(true)],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a < b).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '<', createIdentifier('b'), 'toBe', createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a <= b).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '<=', createIdentifier('b'), 'toBe', createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a >= b).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '>=', createIdentifier('b'), 'toBe', createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('does not report expect(a ** b).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '**', createIdentifier('b'), 'toBe', createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(0)
  })

  test('reports expect(a === b).toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '===', createIdentifier('b'), 'toEqual', createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a !== b).toEqual(true)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!==', createIdentifier('b'), 'toEqual', createLiteral(true),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a == b).toBe(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '==', createIdentifier('b'), 'toBe', createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).not.toBe(b)')
  })

  test('reports expect(a != b).toBe(false)', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('a'), '!=', createIdentifier('b'), 'toBe', createLiteral(false),
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(a).toBe(b)')
  })

  test('reports expect(a === b).not.toEqual(true) with correct suggestion', () => {
    const { context, reports } = createMockContext()
    const node = createEqualityExpectCall(
      createIdentifier('x'), '===', createIdentifier('y'), 'toEqual', createLiteral(true), true,
    )
    preferEqualityMatcherRule.create(context).CallExpression!(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('expect(x).not.toBe(y)')
  })
})
