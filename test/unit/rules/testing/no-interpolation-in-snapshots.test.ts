import { describe, test, expect, vi } from 'vitest'
import { noInterpolationInSnapshotsRule } from '../../../../src/rules/testing/no-interpolation-in-snapshots.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(value).toMatchInlineSnapshot();',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => { reports.push({ message: descriptor.message, loc: descriptor.loc }) },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

function createMatchInlineSnapshotCallWithLiteral(
  snapshotContent: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'result' }],
      },
      property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
    },
    arguments: [
      { type: 'Literal', value: snapshotContent },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createMatchInlineSnapshotCallWithTemplateLiteral(
  snapshotContent: string,
  expressions: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  const quasis = snapshotContent.split('\x00')
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'result' }],
      },
      property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
    },
    arguments: [
      {
        type: 'TemplateLiteral',
        quasis: quasis.map((q) => ({ type: 'TemplateElement', value: { cooked: q, raw: q } })),
        expressions,
        loc: { start: { line, column }, end: { line, column: column + 50 } },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 80 } },
  }
}

function createRegularMatcherCall(matcherName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

describe('no-interpolation-in-snapshots rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noInterpolationInSnapshotsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noInterpolationInSnapshotsRule.meta.severity).toBe('warn')
    })

    test('should have testing category', () => {
      expect(noInterpolationInSnapshotsRule.meta.docs?.category).toBe('testing')
    })

    test('should have description containing interpolation', () => {
      const desc = noInterpolationInSnapshotsRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('interpolation')
    })

    test('should not include fixable field', () => {
      expect(noInterpolationInSnapshotsRule.meta.fixable).toBeUndefined()
    })

    test('should have a docs.url property', () => {
      expect(noInterpolationInSnapshotsRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url containing codeforge', () => {
      expect(noInterpolationInSnapshotsRule.meta.docs?.url).toContain('codeforge')
    })

    test('should not be recommended', () => {
      expect(noInterpolationInSnapshotsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have meta as a plain object', () => {
      expect(typeof noInterpolationInSnapshotsRule.meta).toBe('object')
      expect(noInterpolationInSnapshotsRule.meta).not.toBeNull()
      expect(Array.isArray(noInterpolationInSnapshotsRule.meta)).toBe(false)
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should have create as a function', () => {
      expect(typeof noInterpolationInSnapshotsRule.create).toBe('function')
    })
  })

  describe('interpolation detected', () => {
    test('should report template literal with single variable interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'hello \x00 world',
          [{ type: 'Identifier', name: 'value' }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with multiple interpolations', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00b\x00c',
          [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with expression at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          '\x00suffix',
          [{ type: 'Identifier', name: 'prefix' }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with expression at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'prefix\x00',
          [{ type: 'Identifier', name: 'suffix' }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with call expression interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'result: \x00',
          [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with member expression interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'value: \x00',
          [{
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with numeric interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'count: \x00',
          [{ type: 'Identifier', name: 'count' }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with ternary interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          '\x00',
          [{
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'flag' },
            consequent: { type: 'Literal', value: 'yes' },
            alternate: { type: 'Literal', value: 'no' },
          }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with binary expression interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'sum: \x00',
          [{
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with arrow function interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'fn: \x00',
          [{
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'Literal', value: 42 },
          }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with array expression interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'items: \x00',
          [{ type: 'ArrayExpression', elements: [] }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with object expression interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'obj: \x00',
          [{ type: 'ObjectExpression', properties: [] }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with typeof interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'type: \x00',
          [{ type: 'UnaryExpression', operator: 'typeof', argument: { type: 'Identifier', name: 'x' } }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with Date.now() interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'time: \x00',
          [{
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'Date' },
              property: { type: 'Identifier', name: 'now' },
            },
            arguments: [],
          }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report template literal with Math.random() interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'random: \x00',
          [{
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'Math' },
              property: { type: 'Identifier', name: 'random' },
            },
            arguments: [],
          }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report multiple interpolated snapshots independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }], 1, 0,
        ),
      )
      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'b\x00', [{ type: 'Identifier', name: 'y' }], 5, 0,
        ),
      )

      expect(reports.length).toBe(2)
    })
  })

  describe('static snapshots OK', () => {
    test('should not report string literal snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCallWithLiteral('static content'))

      expect(reports.length).toBe(0)
    })

    test('should not report empty string literal snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCallWithLiteral(''))

      expect(reports.length).toBe(0)
    })

    test('should not report multi-line string literal snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCallWithLiteral('line1\nline2\nline3'))

      expect(reports.length).toBe(0)
    })

    test('should not report template literal without expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral('static template', []),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with empty expressions array', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral('no interpolation', []),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report multi-line template literal without expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          '<div>\n  <span>hello</span>\n</div>', [],
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report very long static string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCallWithLiteral('a'.repeat(1000)))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with special characters as literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithLiteral('{"key": "value", "num": 42}'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with unicode as literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCallWithLiteral('Hello 世界 🌍'))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with HTML content as literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithLiteral('<div class="test"><p>Hello</p></div>'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with JSON content as literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithLiteral('{"name": "test", "value": 123}'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with whitespace only as literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCallWithLiteral('   \n  \n  '))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with regex-like content as literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCallWithLiteral('${not interpolation}'))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with dollar sign brace as literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithLiteral('template: ${variable}'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report static template literal with multiline content', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const multilineContent = [
        '<Object>',
        '  id: 1',
        '  name: "test"',
        '</Object>',
      ].join('\n')

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(multilineContent, []),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('non-snapshot matchers', () => {
    test('should not report toBe matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toBe'))

      expect(reports.length).toBe(0)
    })

    test('should not report toEqual matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report toContain matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toContain'))

      expect(reports.length).toBe(0)
    })

    test('should not report toBeTruthy matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toBeTruthy'))

      expect(reports.length).toBe(0)
    })

    test('should not report toBeFalsy matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })

    test('should not report toBeNull matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toBeNull'))

      expect(reports.length).toBe(0)
    })

    test('should not report toBeUndefined matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toBeUndefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report toHaveLength matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toHaveLength'))

      expect(reports.length).toBe(0)
    })

    test('should not report toThrow matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toThrow'))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatch matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toMatch'))

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchObject matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toMatchObject'))

      expect(reports.length).toBe(0)
    })

    test('should not report toHaveProperty matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toHaveProperty'))

      expect(reports.length).toBe(0)
    })

    test('should not report resolves matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('resolves'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'Literal', value: 42 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc on snapshot arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { cooked: 'a', raw: 'a' } },
              { type: 'TemplateElement', value: { cooked: 'b', raw: 'b' } },
            ],
            expressions: [{ type: 'Identifier', name: 'x' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle callee with computed property (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Literal', value: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'Literal', value: 'static' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee as Identifier instead of MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        arguments: [
          { type: 'Literal', value: 'static' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested expect chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

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
                arguments: [{ type: 'Identifier', name: 'result' }],
              },
              property: { type: 'Identifier', name: 'not' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { cooked: 'val: ', raw: 'val: ' } },
              { type: 'TemplateElement', value: { cooked: '', raw: '' } },
            ],
            expressions: [{ type: 'Identifier', name: 'dynamic' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle boolean literal argument (non-string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'Literal', value: true },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'Literal', value: null },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object expression argument before string', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'result' }],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          { type: 'Literal', value: 'static' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle template literal with undefined expressions field', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { cooked: 'static', raw: 'static' } },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('property matchers argument', () => {
    test('should report interpolation when property matchers precede snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'result' }],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { cooked: 'a', raw: 'a' } },
              { type: 'TemplateElement', value: { cooked: 'b', raw: 'b' } },
            ],
            expressions: [{ type: 'Identifier', name: 'x' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report static literal with property matchers', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'result' }],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          { type: 'Literal', value: 'static snapshot' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static template literal with property matchers', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'result' }],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { cooked: 'static', raw: 'static' } },
            ],
            expressions: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when property matchers is an identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'result' }],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'Identifier', name: 'matchers' },
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { cooked: 'val: ', raw: 'val: ' } },
              { type: 'TemplateElement', value: { cooked: '', raw: '' } },
            ],
            expressions: [{ type: 'Identifier', name: 'num' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should skip to snapshot string when first arg is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'result' }],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'Identifier', name: 'props' },
          { type: 'Literal', value: 'ok' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report location of interpolated snapshot argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00b', [{ type: 'Identifier', name: 'x' }], 5, 10,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report default location when snapshot arg has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { cooked: 'a', raw: 'a' } },
              { type: 'TemplateElement', value: { cooked: '', raw: '' } },
            ],
            expressions: [{ type: 'Identifier', name: 'x' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report different locations for multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }], 3, 5,
        ),
      )
      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'b\x00', [{ type: 'Identifier', name: 'y' }], 12, 2,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.line).toBe(12)
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }], 2, 4,
        ),
      )

      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(54)
    })

    test('should report location with property matchers present', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'result' }],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { cooked: 'a', raw: 'a' } },
              { type: 'TemplateElement', value: { cooked: '', raw: '' } },
            ],
            expressions: [{ type: 'Identifier', name: 'x' }],
            loc: { start: { line: 15, column: 10 }, end: { line: 15, column: 30 } },
          },
        ],
        loc: { start: { line: 15, column: 0 }, end: { line: 15, column: 80 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('various file paths', () => {
    test('should work with .test.ts files', () => {
      const { context, reports } = createMockContext({}, '/src/utils/helpers.test.ts')
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with .spec.ts files', () => {
      const { context, reports } = createMockContext({}, '/src/components/Button.spec.ts')
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with .test.js files', () => {
      const { context, reports } = createMockContext({}, '/src/api/auth.test.js')
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested test files', () => {
      const { context, reports } = createMockContext({}, '/src/modules/user/services/auth.test.ts')
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with test files in root', () => {
      const { context, reports } = createMockContext({}, '/test/integration/api.test.ts')
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('message format', () => {
    test('should include "interpolation" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('interpolation')
    })

    test('should include "snapshot" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('snapshot')
    })

    test('should include "template literal" or "static" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )

      const msg = reports[0].message.toLowerCase()
      expect(msg.includes('template literal') || msg.includes('static')).toBe(true)
    })

    test('should include "flaky" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('flaky')
    })

    test('should produce same message for all interpolation types', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }], 1, 0,
        ),
      )
      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'b\x00', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }], 2, 0,
        ),
      )

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('default export', () => {
    test('default export should be defined', async () => {
      const mod = await import('../../../../src/rules/testing/no-interpolation-in-snapshots.js')
      expect(mod.default).toBeDefined()
      expect(mod.default).toBe(noInterpolationInSnapshotsRule)
    })
  })

  describe('independent visitor instances', () => {
    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noInterpolationInSnapshotsRule.create(ctx1)
      const visitor2 = noInterpolationInSnapshotsRule.create(ctx2)

      visitor1.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('should have separate report arrays per visitor', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noInterpolationInSnapshotsRule.create(ctx1)
      const visitor2 = noInterpolationInSnapshotsRule.create(ctx2)

      visitor1.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )
      visitor2.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'b\x00', [{ type: 'Identifier', name: 'y' }],
        ),
      )

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })
  })

  describe('toMatchInlineSnapshot vs toMatchSnapshot', () => {
    test('should check toMatchInlineSnapshot for interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should NOT check toMatchSnapshot for interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const node = {
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
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { cooked: 'a', raw: 'a' } },
              { type: 'TemplateElement', value: { cooked: '', raw: '' } },
            ],
            expressions: [{ type: 'Identifier', name: 'x' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report inline but not external snapshot in same pass', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      visitor.CallExpression(
        createMatchInlineSnapshotCallWithTemplateLiteral(
          'a\x00', [{ type: 'Identifier', name: 'x' }],
        ),
      )
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should not match near-miss matcher names', () => {
      const { context, reports } = createMockContext()
      const visitor = noInterpolationInSnapshotsRule.create(context)

      const nearMatch = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshotData' },
        },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { cooked: 'a', raw: 'a' } },
              { type: 'TemplateElement', value: { cooked: '', raw: '' } },
            ],
            expressions: [{ type: 'Identifier', name: 'x' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(nearMatch)

      expect(reports.length).toBe(0)
    })
  })
})
