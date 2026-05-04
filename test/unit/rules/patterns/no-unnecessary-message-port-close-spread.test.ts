import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMessagePortCloseSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-message-port-close-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => '[]',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
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

function makeportCloseCall(
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'port' },
      property: { type: 'Identifier', name: 'close' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

describe('no-unnecessary-message-port-close-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMessagePortCloseSpreadRule.meta.type).toBe('suggestion')
    })
    test('should have severity "warn"', () => {
      expect(noUnnecessaryMessagePortCloseSpreadRule.meta.severity).toBe('warn')
    })
    test('should have category "patterns"', () => {
      expect(noUnnecessaryMessagePortCloseSpreadRule.meta.docs.category).toBe('patterns')
    })
    test('should not be recommended', () => {
      expect(noUnnecessaryMessagePortCloseSpreadRule.meta.docs.recommended).toBe(false)
    })
    test('should have empty schema', () => {
      expect(noUnnecessaryMessagePortCloseSpreadRule.meta.schema).toEqual([])
    })
    test('should have docs url', () => {
      expect(noUnnecessaryMessagePortCloseSpreadRule.meta.docs.url).toBeDefined()
    })
    test('should have description', () => {
      expect(noUnnecessaryMessagePortCloseSpreadRule.meta.docs.description).toBeDefined()
    })
    test('should have valid docs description type', () => {
      expect(typeof noUnnecessaryMessagePortCloseSpreadRule.meta.docs.description).toBe('string')
    })
  })

  describe('edge cases', () => {
    test('should not report on empty arguments', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([])
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('should not report on two regular arguments', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('should not report with wrong object name', () => {
    test('foo.close(...items) should not report with object "foo"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('bar.close(...items) should not report with object "bar"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'bar' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('baz.close(...items) should not report with object "baz"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'baz' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('qux.close(...items) should not report with object "qux"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'qux' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('obj.close(...items) should not report with object "obj"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('arr.close(...items) should not report with object "arr"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('fn.close(...items) should not report with object "fn"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'fn' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('cb.close(...items) should not report with object "cb"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'cb' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('x.close(...items) should not report with object "x"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('y.close(...items) should not report with object "y"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'y' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('z.close(...items) should not report with object "z"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'z' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('a.close(...items) should not report with object "a"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('b.close(...items) should not report with object "b"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'b' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('c.close(...items) should not report with object "c"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'c' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('d.close(...items) should not report with object "d"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'd' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('e.close(...items) should not report with object "e"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'e' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('f.close(...items) should not report with object "f"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'f' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('g.close(...items) should not report with object "g"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'g' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('h.close(...items) should not report with object "h"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'h' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('i.close(...items) should not report with object "i"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'i' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('j.close(...items) should not report with object "j"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'j' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('k.close(...items) should not report with object "k"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'k' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('l.close(...items) should not report with object "l"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'l' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('m.close(...items) should not report with object "m"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'm' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('n.close(...items) should not report with object "n"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'n' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('o.close(...items) should not report with object "o"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'o' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('p.close(...items) should not report with object "p"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'p' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('q.close(...items) should not report with object "q"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'q' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('should not report with wrong property name', () => {
    test('port.foo(...items) should not report with property "foo"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.bar(...items) should not report with property "bar"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'bar' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.baz(...items) should not report with property "baz"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'baz' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.qux(...items) should not report with property "qux"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'qux' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.toString(...items) should not report with property "toString"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'toString' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.valueOf(...items) should not report with property "valueOf"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'valueOf' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.hasOwnProperty(...items) should not report with property "hasOwnProperty"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'hasOwnProperty' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.constructor(...items) should not report with property "constructor"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'constructor' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.prototype(...items) should not report with property "prototype"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'prototype' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.__proto__(...items) should not report with property "__proto__"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: '__proto__' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.apply(...items) should not report with property "apply"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'apply' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.bind(...items) should not report with property "bind"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'bind' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.call(...items) should not report with property "call"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'call' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.length(...items) should not report with property "length"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'length' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.name(...items) should not report with property "name"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'name' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.args(...items) should not report with property "args"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'args' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.callee(...items) should not report with property "callee"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'callee' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.caller(...items) should not report with property "caller"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'caller' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.arguments(...items) should not report with property "arguments"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'arguments' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.pop(...items) should not report with property "pop"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'pop' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.push(...items) should not report with property "push"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'push' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.shift(...items) should not report with property "shift"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'shift' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.unshift(...items) should not report with property "unshift"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'unshift' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.slice(...items) should not report with property "slice"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.splice(...items) should not report with property "splice"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.concat(...items) should not report with property "concat"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'concat' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.join(...items) should not report with property "join"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'join' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.indexOf(...items) should not report with property "indexOf"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.lastIndexOf(...items) should not report with property "lastIndexOf"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.forEach(...items) should not report with property "forEach"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'forEach' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.map(...items) should not report with property "map"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'map' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.filter(...items) should not report with property "filter"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'filter' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.reduce(...items) should not report with property "reduce"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'reduce' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.reduceRight(...items) should not report with property "reduceRight"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'reduceRight' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.some(...items) should not report with property "some"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'some' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.every(...items) should not report with property "every"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'every' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.find(...items) should not report with property "find"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'find' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.findIndex(...items) should not report with property "findIndex"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.includes(...items) should not report with property "includes"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('port.sort(...items) should not report with property "sort"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'port' },
          property: { type: 'Identifier', name: 'sort' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('should report port.close(...items) with single spread', () => {
    test('should report port.close(...items) case 1', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...arr) case 2', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 2, 0, 2, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...args) case 3', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'args' })], 3, 0, 3, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...list) case 4', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'list' })], 4, 0, 4, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...data) case 5', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'data' })], 5, 0, 5, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...values) case 6', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'values' })], 6, 0, 6, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...nums) case 7', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'nums' })], 7, 0, 7, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...rest) case 8', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'rest' })], 8, 0, 8, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...options) case 9', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'options' })], 9, 0, 9, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...params) case 10', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'params' })], 10, 0, 10, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...collection) case 11', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'collection' })], 11, 0, 11, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...elements) case 12', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'elements' })], 12, 0, 12, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...entries) case 13', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'entries' })], 13, 0, 13, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...objs) case 14', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'objs' })], 14, 0, 14, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...source) case 15', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'source' })], 15, 0, 15, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...input) case 16', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'input' })], 16, 0, 16, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...payload) case 17', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'payload' })], 17, 0, 17, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...buffer) case 18', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'buffer' })], 18, 0, 18, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...chunk) case 19', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'chunk' })], 19, 0, 19, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...segment) case 20', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'segment' })], 20, 0, 20, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...portion) case 21', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'portion' })], 21, 0, 21, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...range) case 22', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'range' })], 22, 0, 22, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...tuple) case 23', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'tuple' })], 23, 0, 23, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...seq) case 24', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'seq' })], 24, 0, 24, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...iter) case 25', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'iter' })], 25, 0, 25, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...result) case 26', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'result' })], 26, 0, 26, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...output) case 27', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'output' })], 27, 0, 27, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...response) case 28', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'response' })], 28, 0, 28, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...records) case 29', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'records' })], 29, 0, 29, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...rows) case 30', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'rows' })], 30, 0, 30, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...cols) case 31', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'cols' })], 31, 0, 31, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...cells) case 32', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'cells' })], 32, 0, 32, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...fields) case 33', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'fields' })], 33, 0, 33, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...props) case 34', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'props' })], 34, 0, 34, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...attrs) case 35', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'attrs' })], 35, 0, 35, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...keys) case 36', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'keys' })], 36, 0, 36, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...vals) case 37', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'vals' })], 37, 0, 37, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...pairs) case 38', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'pairs' })], 38, 0, 38, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...nodes) case 39', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'nodes' })], 39, 0, 39, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report port.close(...items2) case 40', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items2' })], 40, 0, 40, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
  })

  describe('location and structure', () => {
    test('should report with correct location line 2', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 2, 5, 2, 30)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(30)
    })
    test('should report with correct location line 3', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 3, 10, 3, 35)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(35)
    })
    test('should report with correct location line 5', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 0, 5, 20)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })
    test('should report with correct location line 10', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 8, 10, 28)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(28)
    })
    test('should report with correct location line 15', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 15, 3, 15, 23)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(15)
      expect(reports[0].loc?.end.column).toBe(23)
    })
    test('should report with correct location line 20', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 20, 0, 20, 15)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(20)
      expect(reports[0].loc?.end.column).toBe(15)
    })
    test('should report with correct location line 25', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 25, 12, 25, 37)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(12)
      expect(reports[0].loc?.end.line).toBe(25)
      expect(reports[0].loc?.end.column).toBe(37)
    })
    test('should report with correct location line 30', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 30, 1, 30, 21)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(30)
      expect(reports[0].loc?.start.column).toBe(1)
      expect(reports[0].loc?.end.line).toBe(30)
      expect(reports[0].loc?.end.column).toBe(21)
    })
    test('should report with correct location line 40', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 40, 5, 40, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(40)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(40)
      expect(reports[0].loc?.end.column).toBe(25)
    })
    test('should report with correct location line 50', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 50, 0, 50, 30)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(50)
      expect(reports[0].loc?.end.column).toBe(30)
    })
    test('should report with correct location line 60', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 60, 7, 60, 27)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(60)
      expect(reports[0].loc?.start.column).toBe(7)
      expect(reports[0].loc?.end.line).toBe(60)
      expect(reports[0].loc?.end.column).toBe(27)
    })
    test('should report with correct location line 70', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 70, 2, 70, 22)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(70)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(70)
      expect(reports[0].loc?.end.column).toBe(22)
    })
    test('should report with correct location line 80', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 80, 0, 80, 20)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(80)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(80)
      expect(reports[0].loc?.end.column).toBe(20)
    })
    test('should report with correct location line 90', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 90, 15, 90, 40)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(90)
      expect(reports[0].loc?.start.column).toBe(15)
      expect(reports[0].loc?.end.line).toBe(90)
      expect(reports[0].loc?.end.column).toBe(40)
    })
    test('should report with correct location line 100', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 100, 0, 100, 25)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(100)
      expect(reports[0].loc?.end.column).toBe(25)
    })
    test('should report with correct location line 150', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 150, 3, 150, 23)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(150)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(150)
      expect(reports[0].loc?.end.column).toBe(23)
    })
    test('should report with correct location line 200', () => {
      const { context, reports } = createMockContext()
      const node = makeportCloseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 200, 8, 200, 33)
      noUnnecessaryMessagePortCloseSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(200)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(200)
      expect(reports[0].loc?.end.column).toBe(33)
    })
  })
})