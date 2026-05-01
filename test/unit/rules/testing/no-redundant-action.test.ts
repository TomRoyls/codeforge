import { describe, test, expect, vi } from 'vitest'
import { noRedundantActionRule } from '../../../../src/rules/testing/no-redundant-action.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "await expect(Promise.resolve(1)).resolves.toBe(1);",
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
    ruleId: 'no-redundant-action',
    workspaceRoot: '/src',
  }
  return { context, reports }
}

function createAwaitExpectResolves(
  matcher: string = 'toBe',
  matcherArg: unknown = { type: 'Literal', value: 1 },
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'AwaitExpression',
    argument: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
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
                  arguments: [{ type: 'Identifier', name: 'promise' }],
                },
                property: { type: 'Identifier', name: 'resolves' },
              },
              arguments: [],
            },
            property: { type: 'Identifier', name: matcher },
          },
          arguments: [matcherArg],
        },
      },
    },
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
  }
}

function createAwaitExpectRejects(
  matcher: string = 'toBe',
  matcherArg: unknown = { type: 'Literal', value: 1 },
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'AwaitExpression',
    argument: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
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
                  arguments: [{ type: 'Identifier', name: 'promise' }],
                },
                property: { type: 'Identifier', name: 'rejects' },
              },
              arguments: [],
            },
            property: { type: 'Identifier', name: matcher },
          },
          arguments: [matcherArg],
        },
      },
    },
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
  }
}

function createExpectResolvesNoAwait(
  matcher: string = 'toBe',
  matcherArg: unknown = { type: 'Literal', value: 1 },
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
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
                arguments: [{ type: 'Identifier', name: 'promise' }],
              },
              property: { type: 'Identifier', name: 'resolves' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: matcher },
        },
        arguments: [matcherArg],
      },
    },
    arguments: [],
  }
}

function createAwaitExpectNoResolves(
  matcher: string = 'toBe',
  matcherArg: unknown = { type: 'Literal', value: 1 },
): unknown {
  return {
    type: 'AwaitExpression',
    argument: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }],
        },
        property: { type: 'Identifier', name: matcher },
      },
      arguments: [matcherArg],
    },
  }
}

function createNonExpectAwait(): unknown {
  return {
    type: 'AwaitExpression',
    argument: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fetchData' },
      arguments: [],
    },
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createSimpleAwait(): unknown {
  return {
    type: 'AwaitExpression',
    argument: { type: 'Identifier', name: 'promise' },
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
  }
}

describe('no-redundant-action', () => {
  const rule = noRedundantActionRule

  test('rule has correct meta', () => {
    expect(rule.meta.docs.category).toBe('testing')
    expect(rule.meta.docs.description).toContain('redundant')
    expect(rule.meta.severity).toBe('warn')
    expect(rule.meta.type).toBe('suggestion')
  })

  test('rule has create method', () => {
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: Reports redundant await + resolves
  test('reports await expect().resolves.toBe()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBe'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('await')
  })

  test('reports await expect().resolves.toEqual()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toEqual'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toStrictEqual()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toStrictEqual'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toBeTruthy()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBeTruthy'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toBeFalsy()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBeFalsy'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toBeNull()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBeNull'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toBeUndefined()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBeUndefined'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toBeDefined()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBeDefined'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toContain()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toContain'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveLength()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveLength'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toThrow()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toThrow'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toMatch()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toMatch'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toMatchObject()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toMatchObject'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveProperty()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveProperty'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toContainEqual()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toContainEqual'))
    expect(reports.length).toBe(1)
  })

  // SECTION: Reports redundant await + rejects
  test('reports await expect().rejects.toBe()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toBe'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toEqual()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toEqual'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toThrow()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toThrow'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toStrictEqual()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toStrictEqual'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toBeTruthy()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toBeTruthy'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toBeNull()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toBeNull'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toBeDefined()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toBeDefined'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toContain()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toContain'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toHaveLength()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toHaveLength'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toMatch()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toMatch'))
    expect(reports.length).toBe(1)
  })

  // SECTION: Does NOT report valid patterns
  test('does not report expect().resolves without await', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createExpectResolvesNoAwait())
    expect(reports.length).toBe(0)
  })

  test('does not report await on non-expect call', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createNonExpectAwait())
    expect(reports.length).toBe(0)
  })

  test('does not report simple await expression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createSimpleAwait())
    expect(reports.length).toBe(0)
  })

  test('does not report await expect() without resolves/rejects', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectNoResolves())
    expect(reports.length).toBe(0)
  })

  // SECTION: Edge cases - null/undefined/invalid
  test('handles null node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(null)
    expect(reports.length).toBe(0)
  })

  test('handles undefined node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(undefined)
    expect(reports.length).toBe(0)
  })

  test('handles node without type', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({ value: 42 })
    expect(reports.length).toBe(0)
  })

  test('handles AwaitExpression with non-object argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({ type: 'AwaitExpression', argument: 'string' })
    expect(reports.length).toBe(0)
  })

  test('handles AwaitExpression with null argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({ type: 'AwaitExpression', argument: null })
    expect(reports.length).toBe(0)
  })

  test('handles AwaitExpression with missing argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({ type: 'AwaitExpression' })
    expect(reports.length).toBe(0)
  })

  // SECTION: Location reporting
  test('includes location in report', () => {
    const loc = { start: { line: 5, column: 2 }, end: { line: 5, column: 30 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBe', { type: 'Literal', value: 1 }, loc))
    expect(reports.length).toBe(1)
    expect(reports[0].loc).toEqual(loc)
  })

  test('includes location for rejects pattern', () => {
    const loc = { start: { line: 10, column: 4 }, end: { line: 10, column: 35 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toThrow', { type: 'Literal', value: 'Error' }, loc))
    expect(reports.length).toBe(1)
    expect(reports[0].loc).toEqual(loc)
  })

  // SECTION: .not chain variants
  test('reports await expect().resolves.not.toBe()', () => {
    const node = {
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
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
                        arguments: [{ type: 'Identifier', name: 'promise' }],
                      },
                      property: { type: 'Identifier', name: 'resolves' },
                    },
                    arguments: [],
                  },
                  property: { type: 'Identifier', name: 'not' },
                },
                arguments: [],
              },
              property: { type: 'Identifier', name: 'toBe' },
            },
            arguments: [{ type: 'Literal', value: 1 }],
          },
        },
        arguments: [],
      },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(node)
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.not.toThrow()', () => {
    const node = {
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
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
                        arguments: [{ type: 'Identifier', name: 'promise' }],
                      },
                      property: { type: 'Identifier', name: 'rejects' },
                    },
                    arguments: [],
                  },
                  property: { type: 'Identifier', name: 'not' },
                },
                arguments: [],
              },
              property: { type: 'Identifier', name: 'toThrow' },
            },
            arguments: [],
          },
        },
        arguments: [],
      },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(node)
    expect(reports.length).toBe(1)
  })

  // SECTION: Multiple matchers with resolves
  test('reports await expect().resolves.toBeGreaterThan()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBeGreaterThan'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toBeLessThan()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBeLessThan'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toBeGreaterThanOrEqual()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBeGreaterThanOrEqual'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toBeLessThanOrEqual()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBeLessThanOrEqual'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toBeCloseTo()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBeCloseTo'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toBeInstanceOf()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBeInstanceOf'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toContainEqual()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toContainEqual'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveBeenCalled()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveBeenCalled'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveBeenCalledTimes()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveBeenCalledTimes'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveBeenCalledWith()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveBeenCalledWith'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveLastCalledWith()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveLastCalledWith'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveNthCalledWith()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveNthCalledWith'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveReturned()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveReturned'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveReturnedTimes()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveReturnedTimes'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveReturnedWith()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveReturnedWith'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveLastReturnedWith()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveLastReturnedWith'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toHaveNthReturnedWith()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toHaveNthReturnedWith'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toMatchSnapshot()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toMatchSnapshot'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toMatchInlineSnapshot()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toMatchInlineSnapshot'))
    expect(reports.length).toBe(1)
  })

  // SECTION: Rejects with more matchers
  test('reports await expect().rejects.toBeFalsy()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toBeFalsy'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toBeUndefined()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toBeUndefined'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toMatchObject()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toMatchObject'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toHaveProperty()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toHaveProperty'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toContainEqual()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toContainEqual'))
    expect(reports.length).toBe(1)
  })

  // SECTION: Deeply nested non-expect patterns
  test('does not report await on regular function call', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someAsyncFn' },
        arguments: [],
      },
    })
    expect(reports.length).toBe(0)
  })

  test('does not report await on member expression function call', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [],
      },
    })
    expect(reports.length).toBe(0)
  })

  test('does not report await on chained non-expect call', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'something' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
      },
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: File path variations
  test('works with .spec.ts files', () => {
    const { context, reports } = createMockContext({}, '/src/file.spec.ts')
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBe'))
    expect(reports.length).toBe(1)
  })

  test('works with .test.js files', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.js')
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBe'))
    expect(reports.length).toBe(1)
  })

  test('works with nested test files', () => {
    const { context, reports } = createMockContext({}, '/src/features/auth/login.test.ts')
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBe'))
    expect(reports.length).toBe(1)
  })

  // SECTION: Additional matcher variations
  test('reports await expect().resolves with string matcher arg', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toBe', { type: 'Literal', value: 'hello' }))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves with object matcher arg', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toEqual', { type: 'ObjectExpression', properties: [] }))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves with array matcher arg', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toEqual', { type: 'ArrayExpression', elements: [] }))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects with regex matcher arg', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toThrow', { type: 'Literal', value: /error/ }))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects with string matcher arg', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toThrow', { type: 'Literal', value: 'error message' }))
    expect(reports.length).toBe(1)
  })

  // SECTION: expect without resolves/rejects but with await inside
  test('does not report await expect(await value).toBe()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectNoResolves())
    expect(reports.length).toBe(0)
  })

  // SECTION: Visitor returns AwaitExpression handler
  test('visitor has AwaitExpression handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(typeof visitor.AwaitExpression).toBe('function')
  })

  test('does not report non-CallExpression argument in await', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({
      type: 'AwaitExpression',
      argument: { type: 'Identifier', name: 'x' },
    })
    expect(reports.length).toBe(0)
  })

  test('does not report when callee is not MemberExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [],
      },
    })
    expect(reports.length).toBe(0)
  })

  test('does not report when CallExpression has no callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
      },
    })
    expect(reports.length).toBe(0)
  })

  test('does not report empty object as AwaitExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({})
    expect(reports.length).toBe(0)
  })

  test('does not report number as AwaitExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(42 as any)
    expect(reports.length).toBe(0)
  })

  test('reports await expect().rejects.toBeGreaterThan()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toBeGreaterThan'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toBeLessThan()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toBeLessThan'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toBeInstanceOf()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toBeInstanceOf'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toBeCloseTo()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toBeCloseTo'))
    expect(reports.length).toBe(1)
  })

  test('does not report when resolves is a property name but not in expect chain', () => {
    const node = {
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'someFunction' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'resolves' },
        },
        arguments: [],
      },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when rejects is a property name but not in expect chain', () => {
    const node = {
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'anotherFunction' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'rejects' },
        },
        arguments: [],
      },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('does not report expect().not.toBe() without resolves/rejects', () => {
    const node = {
      type: 'AwaitExpression',
      argument: {
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
                arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'val' } }],
              },
              property: { type: 'Identifier', name: 'not' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
      },
    }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(node)
    expect(reports.length).toBe(0)
  })

  test('reports await expect().resolves.toThrowErrorMatchingSnapshot()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toThrowErrorMatchingSnapshot'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().resolves.toThrowErrorMatchingInlineSnapshot()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectResolves('toThrowErrorMatchingInlineSnapshot'))
    expect(reports.length).toBe(1)
  })

  test('reports await expect().rejects.toThrowErrorMatchingSnapshot()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!(createAwaitExpectRejects('toThrowErrorMatchingSnapshot'))
    expect(reports.length).toBe(1)
  })

  test('does not report when await argument is not an object', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({
      type: 'AwaitExpression',
      argument: 'string',
    })
    expect(reports.length).toBe(0)
  })

  test('does not report when expect root returns null for empty node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.AwaitExpression!({
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Literal', value: 42 },
              property: { type: 'Identifier', name: 'resolves' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
      },
    })
    expect(reports.length).toBe(0)
  })
})
