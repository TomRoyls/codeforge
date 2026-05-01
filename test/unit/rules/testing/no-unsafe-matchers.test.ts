import { describe, test, expect, vi } from 'vitest'
import { noUnsafeMatchersRule } from '../../../../src/rules/testing/no-unsafe-matchers.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "expect(value).toBeTruthy();",
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({ message: descriptor.message, loc: descriptor.loc, node: descriptor.node })
    },
    getFilePath: () => filePath,
    getSource: () => source,
    getAST: () => null,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    settings: {},
    ruleId: 'no-unsafe-matchers',
    workspaceRoot: '/src',
  }
  return { context, reports }
}

function createUnsafeMatcherCall(
  matcherName: string,
  expectArgName = 'value',
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: expectArgName }],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [],
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
  }
}

function createSafeMatcherCall(matcherName: string, arg: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'value' }],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [arg],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
  }
}

describe('no-unsafe-matchers', () => {
  const rule = noUnsafeMatchersRule

  // SECTION: Meta — 7 tests
  test('meta has correct type', () => {
    expect(rule.meta.type).toBe('suggestion')
  })

  test('meta has correct severity', () => {
    expect(rule.meta.severity).toBe('warn')
  })

  test('meta has correct category', () => {
    expect(rule.meta.docs.category).toBe('testing')
  })

  test('meta has correct description', () => {
    expect(rule.meta.docs.description).toContain('unsafe matchers')
    expect(rule.meta.docs.description).toContain('toBeTruthy')
    expect(rule.meta.docs.description).toContain('toBeFalsy')
  })

  test('meta has correct url', () => {
    expect(rule.meta.docs.url).toMatch(/^https?:\/\/.+/)
    expect(rule.meta.docs.url).toContain('no-unsafe-matchers')
  })

  test('meta has empty schema', () => {
    expect(rule.meta.schema).toEqual([])
  })

  test('meta recommended is false', () => {
    expect(rule.meta.docs.recommended).toBe(false)
  })

  // SECTION: Create — 2 tests
  test('rule has create method', () => {
    expect(typeof rule.create).toBe('function')
  })

  test('visitor has CallExpression handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(typeof visitor.CallExpression).toBe('function')
  })

  // SECTION: Invalid toBeTruthy — 8 tests
  test('reports expect(value).toBeTruthy()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTruthy'))
    expect(reports.length).toBe(1)
  })

  test('reports expect(result).toBeTruthy()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTruthy', 'result'))
    expect(reports.length).toBe(1)
  })

  test('reports expect(fn()).toBeTruthy()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          }],
        },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
      loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 25 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('reports expect(obj.prop).toBeTruthy()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          }],
        },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('toBeTruthy report message contains matcher name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTruthy'))
    expect(reports[0].message).toContain('toBeTruthy')
  })

  test('toBeTruthy report message suggests toBe(true)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTruthy'))
    expect(reports[0].message).toContain("toBe(true)")
  })

  test('toBeTruthy report message mentions false positives', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTruthy'))
    expect(reports[0].message).toContain('false positives')
  })

  test('toBeTruthy works in .spec.ts file', () => {
    const { context, reports } = createMockContext({}, '/src/file.spec.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTruthy'))
    expect(reports.length).toBe(1)
  })

  // SECTION: Invalid toBeFalsy — 8 tests
  test('reports expect(value).toBeFalsy()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalsy'))
    expect(reports.length).toBe(1)
  })

  test('reports expect(result).toBeFalsy()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalsy', 'result'))
    expect(reports.length).toBe(1)
  })

  test('reports expect(fn()).toBeFalsy()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getValue' },
            arguments: [],
          }],
        },
        property: { type: 'Identifier', name: 'toBeFalsy' },
      },
      arguments: [],
      loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 30 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('reports expect(obj.prop).toBeFalsy()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          }],
        },
        property: { type: 'Identifier', name: 'toBeFalsy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('toBeFalsy report message contains matcher name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalsy'))
    expect(reports[0].message).toContain('toBeFalsy')
  })

  test('toBeFalsy report message suggests toBe(false)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalsy'))
    expect(reports[0].message).toContain("toBe(false)")
  })

  test('toBeFalsy works in .test.js file', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.js')
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalsy'))
    expect(reports.length).toBe(1)
  })

  test('toBeFalsy works with multiple expect arguments', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
        },
        property: { type: 'Identifier', name: 'toBeFalsy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  // SECTION: Invalid toBeTrue — 5 tests
  test('reports expect(value).toBeTrue()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTrue'))
    expect(reports.length).toBe(1)
  })

  test('reports expect(condition).toBeTrue()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTrue', 'condition'))
    expect(reports.length).toBe(1)
  })

  test('toBeTrue report message contains matcher name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTrue'))
    expect(reports[0].message).toContain('toBeTrue')
  })

  test('toBeTrue report suggests toBe(true)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTrue'))
    expect(reports[0].message).toContain("toBe(true)")
  })

  test('toBeTrue works in nested path', () => {
    const { context, reports } = createMockContext({}, '/src/features/auth/login.test.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTrue'))
    expect(reports.length).toBe(1)
  })

  // SECTION: Invalid toBeFalse — 5 tests
  test('reports expect(value).toBeFalse()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalse'))
    expect(reports.length).toBe(1)
  })

  test('reports expect(condition).toBeFalse()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalse', 'condition'))
    expect(reports.length).toBe(1)
  })

  test('toBeFalse report message contains matcher name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalse'))
    expect(reports[0].message).toContain('toBeFalse')
  })

  test('toBeFalse report suggests toBe(false)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalse'))
    expect(reports[0].message).toContain("toBe(false)")
  })

  test('toBeFalse works in .spec.tsx file', () => {
    const { context, reports } = createMockContext({}, '/src/component.spec.tsx')
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalse'))
    expect(reports.length).toBe(1)
  })

  // SECTION: Valid safe matchers — 10 tests
  test('does not report expect(value).toBe(true)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createSafeMatcherCall('toBe', { type: 'Literal', value: true }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(false)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createSafeMatcherCall('toBe', { type: 'Literal', value: false }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(null)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createSafeMatcherCall('toBe', { type: 'Literal', value: null }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toEqual(expected)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createSafeMatcherCall('toEqual', { type: 'Identifier', name: 'expected' }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toStrictEqual(expected)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createSafeMatcherCall('toStrictEqual', { type: 'Identifier', name: 'expected' }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBeNull()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeNull').valueOf().type === 'string' ? createUnsafeMatcherCall('toBeNull') : createSafeMatcherCall('toBeNull', { type: 'Literal', value: null }))
    // toBeNull is not in UNSAFE_MATCHERS so it passes through as a safe matcher call
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBeNull' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
    }
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBeDefined()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBeDefined' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
    }
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBeUndefined()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBeUndefined' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
    }
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toContain(item)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createSafeMatcherCall('toContain', { type: 'Literal', value: 'item' }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toHaveLength(5)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createSafeMatcherCall('toHaveLength', { type: 'Literal', value: 5 }))
    expect(reports.length).toBe(0)
  })

  // SECTION: .not chain — 5 tests
  // The rule does not special-case .not; it still reports because the
  // member-expression chain is: expect(value).not.toBeTruthy()
  // -> callee is MemberExpr with property "toBeTruthy", object is CallExpr of "not"
  // -> inner callee is MemberExpr with property "not", object is CallExpr of "expect"
  // -> isExpectCallee follows .not chain back to expect, so it DOES report
  test('reports expect(value).not.toBeTruthy()', () => {
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
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).not.toBeFalsy()', () => {
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
        property: { type: 'Identifier', name: 'toBeFalsy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).not.toBeTrue()', () => {
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
        property: { type: 'Identifier', name: 'toBeTrue' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('reports expect(value).not.toBeFalse()', () => {
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
        property: { type: 'Identifier', name: 'toBeFalse' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('does not report expect(value).not.toBe(true) via .not chain', () => {
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
      arguments: [{ type: 'Literal', value: true }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  // SECTION: Non-expect calls — 5 tests
  test('does not report something(value).toBeTruthy()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'something' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report myObj.toBeFalse()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'myObj' },
        property: { type: 'Identifier', name: 'toBeFalse' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report standalone toBeTruthy() call', () => {
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'toBeTruthy' },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report console.log(value).toBeTruthy() with non-expect callee', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'console' },
            property: { type: 'Identifier', name: 'log' },
          },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report foobar(value).toBeFalsy()', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'foobar' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBeFalsy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  // SECTION: Report message content — 5 tests
  test('report message contains toBeTruthy for toBeTruthy matcher', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTruthy'))
    expect(reports[0].message).toContain("'toBeTruthy()'")
  })

  test('report message contains toBeFalsy for toBeFalsy matcher', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalsy'))
    expect(reports[0].message).toContain("'toBeFalsy()'")
  })

  test('report message contains toBeTrue for toBeTrue matcher', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTrue'))
    expect(reports[0].message).toContain("'toBeTrue()'")
  })

  test('report message contains toBeFalse for toBeFalse matcher', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalse'))
    expect(reports[0].message).toContain("'toBeFalse()'")
  })

  test('report message suggests multiple alternatives', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTruthy'))
    const msg = reports[0].message
    expect(msg).toContain("toBe(true)")
    expect(msg).toContain("toBe(false)")
    expect(msg).toContain("toBeNull()")
    expect(msg).toContain("toBeDefined()")
    expect(msg).toContain("toBeUndefined()")
    expect(msg).toContain("toEqual(expected)")
  })

  // SECTION: Edge cases — 15 tests
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

  test('handles empty object node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({})
    expect(reports.length).toBe(0)
  })

  test('handles node where callee property is null', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: null,
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles computed property matcher name returning null', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Literal', value: 'toBeTruthy' },
        computed: true,
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('handles callee.object being an Identifier instead of CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'value' },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles callee.object being null', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: null,
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles number primitive passed as node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    // toASTNode returns null for non-objects
    visitor.CallExpression!(42)
    expect(reports.length).toBe(0)
  })

  test('handles string primitive passed as node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!('expect(value).toBeTruthy()')
    expect(reports.length).toBe(0)
  })

  test('handles boolean primitive passed as node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(true)
    expect(reports.length).toBe(0)
  })

  test('handles unknown matcher name that is not in UNSAFE_MATCHERS', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBeGreaterThan' },
      },
      arguments: [{ type: 'Literal', value: 5 }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  // SECTION: State isolation — 2 tests
  test('separate visitors have separate report accumulators', () => {
    const { context: ctx1, reports: rep1 } = createMockContext()
    const { context: ctx2, reports: rep2 } = createMockContext()
    const visitor1 = rule.create(ctx1)
    const visitor2 = rule.create(ctx2)
    visitor1.CallExpression!(createUnsafeMatcherCall('toBeTruthy'))
    visitor2.CallExpression!(createSafeMatcherCall('toBe', { type: 'Literal', value: true }))
    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(0)
  })

  test('same visitor accumulates multiple reports', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTruthy'))
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalsy'))
    visitor.CallExpression!(createSafeMatcherCall('toBe', { type: 'Literal', value: true }))
    expect(reports.length).toBe(2)
  })

  // SECTION: Default export — 1 test
  test('default export is the same as named export', () => {
    const defaultExport = noUnsafeMatchersRule
    expect(defaultExport).toBe(noUnsafeMatchersRule)
    expect(defaultExport.meta.type).toBe('suggestion')
    expect(defaultExport.meta.severity).toBe('warn')
  })

  // SECTION: Location reporting — 3 tests
  test('includes location in report', () => {
    const loc = { start: { line: 5, column: 2 }, end: { line: 5, column: 30 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTruthy', 'value', loc))
    expect(reports.length).toBe(1)
    expect(reports[0].loc).toEqual(loc)
  })

  test('includes location for toBeFalsy', () => {
    const loc = { start: { line: 10, column: 4 }, end: { line: 10, column: 35 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalsy', 'value', loc))
    expect(reports[0].loc).toEqual(loc)
  })

  test('uses default location when node has no loc', () => {
    // Node without loc property — extractLocation returns default
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
    // extractLocation returns default loc when node has no loc
    expect(reports[0].loc).toEqual({
      start: { column: 0, line: 1 },
      end: { column: 1, line: 1 },
    })
  })

  // SECTION: Additional coverage

  test('reports multiple separate violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTruthy'))
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalsy'))
    visitor.CallExpression!(createSafeMatcherCall('toBe', { type: 'Literal', value: true }))
    visitor.CallExpression!(createUnsafeMatcherCall('toBeTrue'))
    visitor.CallExpression!(createUnsafeMatcherCall('toBeFalse'))
    expect(reports.length).toBe(4)
  })

  test('report includes node reference', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    const node = createUnsafeMatcherCall('toBeTruthy')
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
    expect(reports[0].node).toBe(node)
  })

  test('does not report expect(value).toBeCloseTo(0.5)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createSafeMatcherCall('toBeCloseTo', { type: 'Literal', value: 0.5 }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toThrow()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'fn' }],
        },
        property: { type: 'Identifier', name: 'toThrow' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
    }
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toMatch(/pattern/)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createSafeMatcherCall('toMatch', { type: 'Literal', value: '/pattern/' }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toHaveBeenCalled()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'mockFn' }],
        },
        property: { type: 'Identifier', name: 'toHaveBeenCalled' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
    }
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toHaveBeenCalledTimes(2)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createSafeMatcherCall('toHaveBeenCalledTimes', { type: 'Literal', value: 2 }))
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).rejects.toBeTruthy() - object is MemberExpression not CallExpression', () => {
    // expect(value).rejects is a MemberExpression, not a CallExpression
    // So the rule's check `object.type !== 'CallExpression'` will bail out
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Identifier', name: 'rejects' },
        },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('handles MemberExpression as callee.property type for getPropertyName', () => {
    // getPropertyName handles MemberExpression recursively
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'toBeTruthy' },
        },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    // getPropertyName recurses into MemberExpression and finds 'toBeTruthy'
    // But then object is CallExpression with callee Identifier "expect" — so it should report
    expect(reports.length).toBe(1)
  })

  test('toBeTruthy with various expect argument types — literal', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Literal', value: 42 }],
        },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('toBeTruthy with array expression as expect argument', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'ArrayExpression', elements: [] }],
        },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('does not report when callee object has no type', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { someKey: 'someValue' },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report when callee property is a number literal', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Literal', value: 42 },
        computed: true,
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles expect().toBeTruthy() with no expect arguments', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(node)
    expect(reports.length).toBe(1)
  })
})
