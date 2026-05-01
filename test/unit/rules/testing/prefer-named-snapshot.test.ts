import { describe, test, expect, vi } from 'vitest'
import { preferNamedSnapshotRule, default as defaultExport } from '../../../../src/rules/testing/prefer-named-snapshot.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(value).toMatchSnapshot({});',
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

function createNotMatchSnapshotCall(matcherName: string, args: unknown[] = [], line = 1, column = 0): unknown {
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
    arguments: args,
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

describe('prefer-named-snapshot rule', () => {
  describe('meta', () => {
    test('should have type "suggestion"', () => {
      expect(preferNamedSnapshotRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(preferNamedSnapshotRule.meta.severity).toBe('warn')
    })

    test('should have docs.category "testing"', () => {
      expect(preferNamedSnapshotRule.meta.docs?.category).toBe('testing')
    })

    test('should have docs.description about named snapshots', () => {
      expect(preferNamedSnapshotRule.meta.docs?.description).toBe(
        'Enforce using named snapshots with toMatchSnapshot() for better readability and maintainability',
      )
    })

    test('should have docs.recommended false', () => {
      expect(preferNamedSnapshotRule.meta.docs?.recommended).toBe(false)
    })

    test('should have docs.url pointing to rule documentation', () => {
      expect(preferNamedSnapshotRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-named-snapshot',
      )
    })

    test('should have empty schema', () => {
      expect(preferNamedSnapshotRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferNamedSnapshotRule.create(context)
      const visitor2 = preferNamedSnapshotRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('invalid: toMatchSnapshot without string name', () => {
    test('should report toMatchSnapshot with property matchers object as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{
        type: 'ObjectExpression',
        properties: [{
          type: 'Property',
          key: { type: 'Identifier', name: 'key' },
          value: {
            type: 'CallExpression',
            callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'expect' }, property: { type: 'Identifier', name: 'any' } },
            arguments: [{ type: 'Identifier', name: 'String' }],
          },
        }],
      }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with empty object as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with numeric literal as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 42 }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with null literal as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: null }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with boolean true as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: true }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with boolean false as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: false }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with identifier as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Identifier', name: 'myHint' }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with array expression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ArrayExpression', elements: [] }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with TemplateLiteral as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { cooked: 'template' } }], expressions: [] },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with CallExpression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getValue' },
        arguments: [],
      }]))

      expect(reports.length).toBe(1)
    })

    test('should report at specific line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }], 10, 4))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report toMatchSnapshot with numeric first arg and property matchers second', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 42 },
        { type: 'ObjectExpression', properties: [] },
      ]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with regex literal as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: {} }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with MemberExpression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot({ id: expect.any(Number) }) with property matchers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{
        type: 'ObjectExpression',
        properties: [{
          type: 'Property',
          key: { type: 'Identifier', name: 'id' },
          value: {
            type: 'CallExpression',
            callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'expect' }, property: { type: 'Identifier', name: 'any' } },
            arguments: [{ type: 'Identifier', name: 'Number' }],
          },
        }],
      }]))

      expect(reports.length).toBe(1)
    })
  })

  describe('valid: toMatchSnapshot with string name', () => {
    test('should not report toMatchSnapshot("named snapshot")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'named snapshot' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchSnapshot("renders button")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'renders button' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchSnapshot("") with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: '' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchSnapshot("a") with single char', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'a' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchSnapshot("hint", { matchers }) with string and property matchers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'ObjectExpression', properties: [] },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchSnapshot("long descriptive name")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'long descriptive name' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchSnapshot("snapshot name")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'snapshot name' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchSnapshot("with spaces")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'with spaces' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchSnapshot("hint", "snapshot") with two string args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'Literal', value: 'snapshot' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchSnapshot("abc", { obj: true }, "extra") with three args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [
        { type: 'Literal', value: 'abc' },
        { type: 'ObjectExpression', properties: [] },
        { type: 'Literal', value: 'extra' },
      ]))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: toMatchInlineSnapshot never reports', () => {
    test('should not report toMatchInlineSnapshot() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchInlineSnapshot({}) with object first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchInlineSnapshot(42) with number first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'Literal', value: 42 }]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchInlineSnapshot(`content`) with template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { cooked: 'content' } }], expressions: [] },
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchInlineSnapshot("hint", "content") with string args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [
        { type: 'Literal', value: 'hint' },
        { type: 'Literal', value: 'content' },
      ]))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: non-snapshot matchers', () => {
    test('should not report expect(x).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toBe', [{ type: 'Literal', value: true }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toEqual({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toEqual', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toBeTruthy'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toHaveLength(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toHaveLength', [{ type: 'Literal', value: 5 }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toContain("item")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toContain', [{ type: 'Literal', value: 'item' }]))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: non-expect calls', () => {
    test('should not report something(value).toMatchSnapshot({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

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
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report myExpect(value).toMatchSnapshot({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

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
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report verify(value).toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

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

    test('should not report assert(value).toMatchSnapshot("name")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'assert' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [{ type: 'Literal', value: 'name' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report check(value).toMatchSnapshot({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'check' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type (Identifier) gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression({ type: 'Identifier', name: 'toMatchSnapshot' })

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toMatchSnapshot' },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when callee.object is Identifier instead of CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'snapshot' },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchSnapshot() with no args (returns early)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', []))

      expect(reports.length).toBe(0)
    })

    test('should handle arguments not being an array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

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
        arguments: 'not-an-array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle missing arguments field', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

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
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with only type field', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression({ type: 'CallExpression' })

      expect(reports.length).toBe(0)
    })

    test('should report toMatchSnapshot with Literal having undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: undefined }]))

      expect(reports.length).toBe(1)
    })

    test('should handle callee with no property field', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchInlineSnapshot({}) via expect — only toMatchSnapshot reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(0)
    })

    test('should handle callee property as computed property (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'value' }],
          },
          property: { type: 'Literal', value: 'toMatchSnapshot' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when node has type but callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'ObjectExpression', properties: [] }],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('report message content', () => {
    test('should include "named snapshot" in report message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports[0].message).toContain('named snapshot')
    })

    test('should include "toMatchSnapshot" in report message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports[0].message).toContain('toMatchSnapshot')
    })

    test('should have exact expected message text', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports[0].message).toBe(
        "Use toMatchSnapshot('snapshot name') with a descriptive name instead of an unnamed snapshot",
      )
    })
  })

  describe('state isolation', () => {
    test('separate visitors should have separate report state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferNamedSnapshotRule.create(ctx1)
      const visitor2 = preferNamedSnapshotRule.create(ctx2)

      visitor1.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }]))
      visitor2.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'named' }]))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor should accumulate reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }], 1, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'named' }], 2, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 42 }], 3, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'ObjectExpression', properties: [] }], 4, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ArrayExpression', elements: [] }], 5, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('default export', () => {
    test('default export should equal named export', () => {
      expect(defaultExport).toBe(preferNamedSnapshotRule)
    })
  })

  describe('.not chain', () => {
    test('should report expect(value).not.toMatchSnapshot({}) with object arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(1)
    })

    test('should not report expect(value).not.toMatchInlineSnapshot({}) with object arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).not.toMatchSnapshot("name") with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'name' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).not.toMatchInlineSnapshot() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toMatchInlineSnapshot'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(value).not.toMatchSnapshot() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createNotMatchSnapshotCall('toMatchSnapshot'))

      expect(reports.length).toBe(0)
    })
  })

  describe('.resolves chain', () => {
    test('should report expect(promise).resolves.toMatchSnapshot({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(1)
    })

    test('should not report expect(promise).resolves.toMatchSnapshot("name")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'name' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(promise).resolves.toMatchInlineSnapshot({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(0)
    })

    test('should report at specific location for .resolves chain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 42 }], 15, 3))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report expect(promise).resolves.toMatchSnapshot(identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createResolvesMatchSnapshotCall('toMatchSnapshot', [{ type: 'Identifier', name: 'myName' }]))

      expect(reports.length).toBe(1)
    })
  })

  describe('.rejects chain', () => {
    test('should report expect(promise).rejects.toMatchSnapshot({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(1)
    })

    test('should not report expect(promise).rejects.toMatchSnapshot("name")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'name' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report expect(promise).rejects.toMatchInlineSnapshot({})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(0)
    })

    test('should report at specific location for .rejects chain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: false }], 20, 5))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report expect(promise).rejects.toMatchSnapshot(identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createRejectsMatchSnapshotCall('toMatchSnapshot', [{ type: 'Identifier', name: 'dynamicName' }]))

      expect(reports.length).toBe(1)
    })
  })

  describe('location and multi-violation coverage', () => {
    test('should report correct location for object arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }], 5, 8))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report multiple violations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }], 1, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 42 }], 2, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })

    test('should report mixed violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'ObjectExpression', properties: [] }], 1, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: 'named' }], 2, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchInlineSnapshot', [{ type: 'ObjectExpression', properties: [] }], 3, 0))
      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{ type: 'Literal', value: null }], 4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(4)
    })
  })

  describe('additional type coverage', () => {
    test('should report toMatchSnapshot with FunctionExpression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with ArrowFunctionExpression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with UnaryExpression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'value' },
      }]))

      expect(reports.length).toBe(1)
    })

    test('should report toMatchSnapshot with NewExpression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNamedSnapshotRule.create(context)

      visitor.CallExpression(createMatchSnapshotCall('toMatchSnapshot', [{
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
      }]))

      expect(reports.length).toBe(1)
    })
  })

  // SECTION: additional coverage
  describe('additional coverage', () => {
    test('meta severity should be warn', () => {
      expect(preferNamedSnapshotRule.meta.severity).toBe('warn')
    })

    test('meta recommended should be false', () => {
      expect(preferNamedSnapshotRule.meta.docs?.recommended).toBe(false)
    })

    test('meta schema should be empty array', () => {
      expect(preferNamedSnapshotRule.meta.schema).toEqual([])
    })
  })
})
