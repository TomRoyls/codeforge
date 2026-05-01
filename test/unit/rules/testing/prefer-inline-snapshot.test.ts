import { describe, test, expect, vi } from 'vitest'
import { preferInlineSnapshotRule } from '../../../../src/rules/testing/prefer-inline-snapshot.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(value).toMatchSnapshot();',
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

function createMatchSnapshotCall(matcherName: string, args: unknown[] = [], line = 1, column = 0): unknown {
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
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createNotMatchSnapshotCall(matcherName: string, line = 1, column = 0): unknown {
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
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createResolvesMatchSnapshotCall(matcherName: string, args: unknown[] = [], line = 1, column = 0): unknown {
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
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'promise' }],
          },
          property: { type: 'Identifier', name: 'resolves' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createRejectsMatchSnapshotCall(matcherName: string, args: unknown[] = [], line = 1, column = 0): unknown {
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
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'promise' }],
          },
          property: { type: 'Identifier', name: 'rejects' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: args,
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createResolvesNotMatchSnapshotCall(matcherName: string, line = 1, column = 0): unknown {
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
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

describe('prefer-inline-snapshot rule', () => {
  describe('Valid cases — should NOT report', () => {
    test('should not report expect(value).toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchInlineSnapshot("snapshot")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'Literal', value: 'snapshot' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchInlineSnapshot("hint", "snapshot")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'Literal', value: 'snapshot' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toBe', [{ type: 'Literal', value: true }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toEqual', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toBeNull'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toBeDefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toBeDefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toBeTruthy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toBeFalsy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toContain("item")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toContain', [{ type: 'Literal', value: 'item' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toThrow'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).not.toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).not.toBe(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toBe'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).resolves.toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).rejects.toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report something.toMatchSnapshot() — non-expect callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'something' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report myExpect(value).toMatchSnapshot() — non-expect callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'myExpect' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report someFunction() — non-member callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value) — no matcher call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'value' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchInlineSnapshot("renders header", `<div></div>`)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'Literal', value: 'renders header' },
        { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { cooked: '<div></div>' } }], expressions: [] },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).not.toMatchInlineSnapshot("snapshot content")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
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
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [{ type: 'Literal', value: 'snapshot content' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).resolves.toMatchInlineSnapshot("data")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'Literal', value: 'data' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).rejects.toMatchInlineSnapshot("error snapshot")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'Literal', value: 'error snapshot' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toHaveProperty("name")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toHaveProperty', [{ type: 'Literal', value: 'name' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toHaveBeenCalledWith("arg")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toHaveBeenCalledWith', [{ type: 'Literal', value: 'arg' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).resolves.toBe("ok")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toBe'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toHaveLength(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toHaveLength', [{ type: 'Literal', value: 5 }]))

      expect(reports.length).toBe(0)
    })

    test('should not report verify(value).toMatchSnapshot() — non-expect function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'verify' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchInlineSnapshot({}) with object arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'ObjectExpression', properties: [] },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatch(/pattern/)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatch', [{ type: 'Literal', value: '/pattern/' }]))

      expect(reports.length).toBe(0)
    })
  })

  describe('Invalid cases — SHOULD report', () => {
    test('should report expect(value).toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchSnapshot("hint string")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint string' },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchSnapshot("renders correctly")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'renders correctly' },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchSnapshot({ key: expect.any(String) })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{
        type: 'ObjectExpression',
        properties: [],
      }]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).not.toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).resolves.toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).rejects.toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).resolves.toMatchSnapshot("hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint' },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).rejects.toMatchSnapshot("error hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'error hint' },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(result).toMatchSnapshot() with different expect arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'result' }],
          },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report expect(container.render()).toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'container' }, property: { type: 'Identifier', name: 'render' } },
              arguments: [],
            }],
          },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 }, end: { line: 3, column: 40 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report expect(getComponent()).toMatchSnapshot("component")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'component' },
      ], 10, 4))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report at specific line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 15, 8))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report with correct message text', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot'))

      expect(reports[0].message).toBe("Use 'toMatchInlineSnapshot()' instead of 'toMatchSnapshot()' for better readability and easier code review.")
    })

    test('should report expect(value).toMatchSnapshot("hint", propertyMatchers)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'ObjectExpression', properties: [] },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).not.toMatchSnapshot("hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
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
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [{ type: 'Literal', value: 'my hint' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report expect(promise).resolves.toMatchSnapshot() at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [], 12, 4))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report expect(promise).rejects.toMatchSnapshot() at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot', [], 20, 6))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report two toMatchSnapshot() calls in same file', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 1, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 2, 0))

      expect(reports.length).toBe(2)
    })

    test('should report three toMatchSnapshot() calls in same file', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 1, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 5, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 10, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 1, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [], 2, 0))
      visitor.CallExpression(createMatchSnapshotCall('toBe', [{ type: 'Literal', value: true }], 3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report expect(value).toMatchSnapshot("empty hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: '' },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchSnapshot("abc") with short hint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'abc' },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchSnapshot("hint", "snapshot name")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'Literal', value: 'snapshot name' },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchSnapshot with ArrayExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'ArrayExpression', elements: [] },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchSnapshot with numeric arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 42 },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchSnapshot with identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Identifier', name: 'mySnapshot' },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(promise).resolves.toMatchSnapshot("hint") with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint' },
      ], 8, 2))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(8)
    })

    test('should report expect(promise).rejects.toMatchSnapshot("error hint") with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'error hint' },
      ], 14, 4))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(14)
    })

    test('should report expect(value).not.toMatchSnapshot() with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toMatchSnapshot', 7, 3))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report mixed resolves/rejects violations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 1, 0))
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [], 2, 0))
      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot', [], 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report expect(value).toMatchSnapshot("hint") and include toMatchSnapshot in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint' },
      ]))

      expect(reports[0].message).toContain('toMatchSnapshot')
    })

    test('should report expect(value).resolves.not.toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesNotMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).resolves.not.toMatchSnapshot() at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesNotMatchSnapshotCall('toMatchSnapshot', 22, 6))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(22)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report snapshot with TemplateLiteral arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { cooked: 'template' } }], expressions: [] },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report when expect arg is a function call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'getResult' },
              arguments: [],
            }],
          },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report multiple violations accumulating across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 1, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [], 2, 0))
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [], 3, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', ['hint'], 4, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 5, 0))

      expect(reports.length).toBe(4)
    })
  })

  describe('Edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type Identifier gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({ type: 'Identifier', name: 'toMatchSnapshot' })

      expect(reports.length).toBe(0)
    })

    test('should not report when callee object is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'snapshot' },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toMatchSnapshot' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferInlineSnapshotRule.create(ctx1)
      const visitor2 = preferInlineSnapshotRule.create(ctx2)

      visitor1.CallExpression(createMatchSnapshotCall('toMatchSnapshot'))
      visitor2.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns visitor with CallExpression and new visitor each call', () => {
      const { context } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      const v2 = preferInlineSnapshotRule.create(context)
      expect(visitor).not.toBe(v2)
    })

    test('should have suggestion type and warn severity', () => {
      expect(preferInlineSnapshotRule.meta.type).toBe('suggestion')
      expect(preferInlineSnapshotRule.meta.severity).toBe('warn')
      expect(preferInlineSnapshotRule.meta.docs?.category).toBe('testing')
      expect(preferInlineSnapshotRule.meta.fixable).toBeUndefined()
    })

    test('should not report for toThrowSnapshot (not a snapshot matcher)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'fn' }],
          },
          property: { type: 'Identifier', name: 'toThrowSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for arbitrary matcher names', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Identifier', name: 'toBeTrue' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report toMatchSnapshot with numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 1 }]))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('toMatchInlineSnapshot')
    })

    test('should report toMatchSnapshot with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with hint string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'my snapshot hint' }]))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('toMatchInlineSnapshot')
    })

    test('should not report for toMatchInlineSnapshot with hint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'Literal', value: 'inline snapshot content' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report for toMatchInlineSnapshot without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should report rejects.toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('toMatchInlineSnapshot')
    })

    test('should report resolves.not.toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesNotMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(1)
    })

    test('should not report rejects.toMatchInlineSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should report multiple toMatchSnapshot in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot'))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot'))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(3)
    })

    test('should handle node with missing callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Node callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: 'not-a-node',
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('meta description mentions inline snapshots', () => {
      expect(preferInlineSnapshotRule.meta.docs?.description).toContain('inline snapshot')
      expect(preferInlineSnapshotRule.meta.docs?.url).toContain('prefer-inline-snapshot')
    })

    test('should handle node with arguments as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: 'not-an-array' as unknown as unknown[],
      })

      expect(reports.length).toBe(1)
    })

    test('should not report when callee object is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'snapshot' },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for toThrow matching', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toThrow'))

      expect(reports.length).toBe(0)
    })

    test('should report resolves.toMatchSnapshot with no hint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('toMatchInlineSnapshot')
    })

    test('should handle deeply nested modifiers correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferInlineSnapshotRule.create(context)

      visitor.CallExpression(createResolvesNotMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(1)
    })
  })
})
