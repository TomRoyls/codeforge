import { describe, test, expect, vi } from 'vitest'
import { preferSnapshotHintRule } from '../../../../src/rules/testing/prefer-snapshot-hint.js'
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

describe('prefer-snapshot-hint rule', () => {
  describe('toMatchSnapshot without args — reports', () => {
    test('should report expect(value).toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(result).toMatchSnapshot() with different expect arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

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
      const visitor = preferSnapshotHintRule.create(context)

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

    test('should report expect(getComponent()).toMatchSnapshot() at specific line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 10, 4))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report expect(wrapper).toMatchSnapshot() and include matcher name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot'))

      expect(reports[0].message).toContain('toMatchSnapshot')
    })
  })

  describe('toMatchSnapshot with string hint — no report', () => {
    test('should not report expect(value).toMatchSnapshot("my hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'my hint' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchSnapshot("renders correctly")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'renders correctly' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchSnapshot("empty string hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: '' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchSnapshot("hint", "snapshot name")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'Literal', value: 'snapshot name' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchSnapshot("abc") with short hint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'abc' }]))

      expect(reports.length).toBe(0)
    })
  })

  describe('toMatchSnapshot with object (property matchers) but no hint — reports', () => {
    test('should report expect(value).toMatchSnapshot({ key: expect.any(String) })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{
        type: 'ObjectExpression',
        properties: [{
          type: 'Property',
          key: { type: 'Identifier', name: 'key' },
          value: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'expect' }, property: { type: 'Identifier', name: 'any' } }, arguments: [{ type: 'Identifier', name: 'String' }] },
        }],
      }]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchSnapshot({ id: expect.any(Number) })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchSnapshot({}) with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

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
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('toMatchSnapshot with hint AND property matchers — no report', () => {
    test('should not report expect(value).toMatchSnapshot("hint", { key: expect.any(String) })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'ObjectExpression', properties: [] },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchSnapshot("my snapshot", { id: expect.any(Number) })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'my snapshot' },
        { type: 'ObjectExpression', properties: [] },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchSnapshot("hint", { key: expect.any(String) }, "snapshot")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'ObjectExpression', properties: [] },
        { type: 'Literal', value: 'snapshot' },
      ]))

      expect(reports.length).toBe(0)
    })
  })

  describe('toMatchInlineSnapshot without args — reports', () => {
    test('should report expect(value).toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchInlineSnapshot() at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [], 7, 2))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report expect(value).toMatchInlineSnapshot() and include matcher name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports[0].message).toContain('toMatchInlineSnapshot')
    })
  })

  describe('toMatchInlineSnapshot with string hint — no report', () => {
    test('should not report expect(value).toMatchInlineSnapshot("my hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'Literal', value: 'my hint' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchInlineSnapshot("renders header")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'Literal', value: 'renders header' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).toMatchInlineSnapshot("hint", `snapshot content`)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
      ]))

      expect(reports.length).toBe(0)
    })
  })

  describe('.not.toMatchSnapshot — no report', () => {
    test('should not report expect(value).not.toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).not.toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(0)
    })
  })

  describe('.not.toMatchInlineSnapshot — no report', () => {
    test('should not report expect(value).not.toMatchInlineSnapshot() without args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toMatchInlineSnapshot', 8, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).not.toMatchInlineSnapshot() with args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

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
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [{ type: 'Literal', value: 'test' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('.resolves.toMatchSnapshot without hint — reports', () => {
    test('should report expect(promise).resolves.toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(promise).resolves.toMatchSnapshot() with specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [], 12, 4))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(12)
    })
  })

  describe('.rejects.toMatchInlineSnapshot without hint — reports', () => {
    test('should report expect(promise).rejects.toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(1)
    })

    test('should report expect(promise).rejects.toMatchInlineSnapshot() with specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchInlineSnapshot', [], 15, 2))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(15)
    })
  })

  describe('Other matchers like .toBe — no report', () => {
    test('should not report expect(x).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toBe', [{ type: 'Literal', value: true }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toEqual', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(0)
    })
  })

  describe('Non-expect callee — no report', () => {
    test('should not report something(value).toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

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

    test('should not report myExpect(value).toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

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

    test('should not report verify(value).toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'verify' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('Edge cases: null node, undefined, non-CallExpression — no report', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('Multiple violations in same test — reports all', () => {
    test('should report two toMatchSnapshot() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 1, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 2, 0))

      expect(reports.length).toBe(2)
    })

    test('should report mixed violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 1, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'hint' }], 2, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [], 3, 0))
      visitor.CallExpression(createNotMatchSnapshotCall('toMatchSnapshot', 4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })
  })

  describe('Location reporting', () => {
    test('should report correct location for toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 5, 8))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location for toMatchInlineSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [], 10, 4))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('Exact message text verification', () => {
    test('toMatchSnapshot report message should be "Add a hint string to toMatchSnapshot()"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot'))

      expect(reports[0].message).toBe('Add a hint string to toMatchSnapshot()')
    })

    test('toMatchInlineSnapshot report message should be "Add a hint string to toMatchInlineSnapshot()"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports[0].message).toBe('Add a hint string to toMatchInlineSnapshot()')
    })
  })

  describe('Meta and default export checks', () => {
    test('should have suggestion type and warn severity', () => {
      expect(preferSnapshotHintRule.meta.type).toBe('suggestion')
      expect(preferSnapshotHintRule.meta.severity).toBe('warn')
      expect(preferSnapshotHintRule.meta.docs?.category).toBe('testing')
      expect(preferSnapshotHintRule.meta.fixable).toBeUndefined()
    })

    test('create returns visitor with CallExpression and new visitor each call', () => {
      const { context } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      const v2 = preferSnapshotHintRule.create(context)
      expect(visitor).not.toBe(v2)
    })
  })

  describe('State isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferSnapshotHintRule.create(ctx1)
      const visitor2 = preferSnapshotHintRule.create(ctx2)

      visitor1.CallExpression(createMatchSnapshotCall('toMatchSnapshot'))
      visitor2.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'hint' }]))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 1, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'hint' }], 2, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [], 3, 0))
      visitor.CallExpression(createNotMatchSnapshotCall('toMatchSnapshot', 4, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 5, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('toMatchInlineSnapshot with inline snapshot string but no hint — reports', () => {
    test('should report expect(value).toMatchInlineSnapshot(`snapshot content`) when first arg is template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { cooked: 'snapshot' } }], expressions: [] },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report expect(value).toMatchInlineSnapshot(`<div>hello</div>`) with HTML content', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [{ type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { cooked: '<div>hello</div>' } }], expressions: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('.resolves.toMatchInlineSnapshot without hint', () => {
    test('reports expect(promise).resolves.toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchInlineSnapshot'))
      expect(reports.length).toBe(1)
    })

    test('reports at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchInlineSnapshot', [], 20, 5))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('.rejects.toMatchSnapshot without hint', () => {
    test('reports expect(promise).rejects.toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot'))
      expect(reports.length).toBe(1)
    })

    test('reports at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot', [], 25, 3))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('.resolves with hint — no report', () => {
    test('does not report expect(promise).resolves.toMatchSnapshot("hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'hint' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report expect(promise).resolves.toMatchInlineSnapshot("hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'Literal', value: 'hint' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report expect(promise).resolves.toMatchSnapshot("hint", propertyMatchers)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'ObjectExpression', properties: [] },
      ]))
      expect(reports.length).toBe(0)
    })
  })

  describe('.rejects with hint — no report', () => {
    test('does not report expect(promise).rejects.toMatchSnapshot("hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'hint' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report expect(promise).rejects.toMatchInlineSnapshot("hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'Literal', value: 'hint' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report expect(promise).rejects.toMatchInlineSnapshot("hint", snapshot)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
      ]))
      expect(reports.length).toBe(0)
    })
  })

  describe('toMatchSnapshot with non-string first arg — reports', () => {
    test('reports with numeric literal first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports with null literal first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports with boolean true literal first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports with boolean false literal first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports with identifier first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Identifier', name: 'myHint' }]))
      expect(reports.length).toBe(1)
    })
  })

  describe('toMatchInlineSnapshot with non-string first arg — reports', () => {
    test('reports with numeric literal first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports with null literal first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports with boolean true literal first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports with boolean false literal first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports with identifier first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'Identifier', name: 'myHint' }]))
      expect(reports.length).toBe(1)
    })
  })

  describe('TemplateLiteral first arg — reports', () => {
    test('reports toMatchSnapshot with TemplateLiteral first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { cooked: 'some hint' } }], expressions: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports toMatchInlineSnapshot with object expression first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'ObjectExpression', properties: [] },
      ]))
      expect(reports.length).toBe(1)
    })
  })

  describe('.not with hint — no report', () => {
    test('does not report expect(value).not.toMatchSnapshot("hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
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
      expect(reports.length).toBe(0)
    })

    test('does not report expect(value).not.toMatchInlineSnapshot("hint")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
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
        arguments: [{ type: 'Literal', value: 'my hint' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('Mixed resolves/rejects violations', () => {
    test('reports .resolves violation and passes .resolves with hint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [], 1, 0))
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'hint' }], 2, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('reports .rejects.toMatchInlineSnapshot with correct matcher name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchInlineSnapshot'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toMatchInlineSnapshot')
    })

    test('reports .rejects.toMatchSnapshot with correct matcher name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toMatchSnapshot')
    })

    test('reports three mixed violations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [], 1, 0))
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [], 2, 0))
      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchInlineSnapshot', [], 3, 0))
      expect(reports.length).toBe(3)
    })
  })

  describe('Resolves/rejects message text verification', () => {
    test('.resolves.toMatchSnapshot message contains matcher name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot'))
      expect(reports[0].message).toBe('Add a hint string to toMatchSnapshot()')
    })

    test('.resolves.toMatchInlineSnapshot message contains matcher name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchInlineSnapshot'))
      expect(reports[0].message).toBe('Add a hint string to toMatchInlineSnapshot()')
    })
  })

  describe('Edge cases: callee object not CallExpression', () => {
    test('does not report when callee object is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
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

    test('does not report when node type is not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'toMatchSnapshot' })
      expect(reports.length).toBe(0)
    })

    test('toMatchInlineSnapshot with hint and object arg does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'ObjectExpression', properties: [] },
      ]))
      expect(reports.length).toBe(0)
    })

    test('toMatchSnapshot with ArrayExpression first arg reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'ArrayExpression', elements: [] },
      ]))
      expect(reports.length).toBe(1)
    })
  })

  describe('Resolves/rejects with property matchers', () => {
    test('reports .rejects.toMatchSnapshot with property matchers and no hint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot', [
        { type: 'ObjectExpression', properties: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports .resolves.toMatchInlineSnapshot with property matchers and no hint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'ObjectExpression', properties: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports .rejects.toMatchSnapshot message mentions toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot'))
      expect(reports[0].message).toBe('Add a hint string to toMatchSnapshot()')
    })

    test('reports .resolves.toMatchInlineSnapshot message mentions toMatchInlineSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchInlineSnapshot'))
      expect(reports[0].message).toBe('Add a hint string to toMatchInlineSnapshot()')
    })
  })

  describe('Additional edge cases', () => {
    test('reports toMatchSnapshot with numeric first arg and property matchers second', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 42 },
        { type: 'ObjectExpression', properties: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('does not report expect(value).toMatchInlineSnapshot("renders button", templateLiteral, propertyMatchers)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'Literal', value: 'renders button' },
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
        { type: 'ObjectExpression', properties: [] },
      ]))
      expect(reports.length).toBe(0)
    })

    test('reports expect(value).toMatchSnapshot(undefined) as missing hint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: undefined },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports expect(value).toMatchSnapshot() with null hint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: null },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports expect(value).toMatchInlineSnapshot(`snapshot content`) with TemplateLiteral first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'snapshot content', cooked: 'snapshot content' } }], expressions: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('does not report expect(value).toMatchSnapshot("") with empty string hint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: '' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report expect(value).toMatchSnapshot("my snapshot") with valid hint', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSnapshotHintRule.create(context)
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'my snapshot' },
        { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'content', cooked: 'content' } }], expressions: [] },
      ]))
      expect(reports.length).toBe(0)
    })
  })
})
