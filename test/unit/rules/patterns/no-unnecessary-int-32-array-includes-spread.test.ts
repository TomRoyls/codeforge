import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryInt32ArrayIncludesSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-int-32-array-includes-spread.js'
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

function makeint32ArrayIncludesCall(
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
      object: { type: 'Identifier', name: 'int32Array' },
      property: { type: 'Identifier', name: 'includes' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

describe('no-unnecessary-int-32-array-includes-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryInt32ArrayIncludesSpreadRule.meta.type).toBe('suggestion')
    })
    test('should have severity "warn"', () => {
      expect(noUnnecessaryInt32ArrayIncludesSpreadRule.meta.severity).toBe('warn')
    })
    test('should have category "patterns"', () => {
      expect(noUnnecessaryInt32ArrayIncludesSpreadRule.meta.docs.category).toBe('patterns')
    })
    test('should not be recommended', () => {
      expect(noUnnecessaryInt32ArrayIncludesSpreadRule.meta.docs.recommended).toBe(false)
    })
    test('should have empty schema', () => {
      expect(noUnnecessaryInt32ArrayIncludesSpreadRule.meta.schema).toEqual([])
    })
    test('should have docs url', () => {
      expect(noUnnecessaryInt32ArrayIncludesSpreadRule.meta.docs.url).toBeDefined()
    })
    test('should have description', () => {
      expect(noUnnecessaryInt32ArrayIncludesSpreadRule.meta.docs.description).toBeDefined()
    })
    test('should have valid docs description type', () => {
      expect(typeof noUnnecessaryInt32ArrayIncludesSpreadRule.meta.docs.description).toBe('string')
    })
  })

  describe('edge cases', () => {
    test('should not report on empty arguments', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([])
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('should not report on two regular arguments', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('should not report with wrong object name', () => {
    test('foo.includes(...items) should not report with object "foo"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('bar.includes(...items) should not report with object "bar"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'bar' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('baz.includes(...items) should not report with object "baz"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'baz' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('qux.includes(...items) should not report with object "qux"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'qux' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('obj.includes(...items) should not report with object "obj"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('arr.includes(...items) should not report with object "arr"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('fn.includes(...items) should not report with object "fn"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'fn' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('cb.includes(...items) should not report with object "cb"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'cb' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('x.includes(...items) should not report with object "x"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('y.includes(...items) should not report with object "y"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'y' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('z.includes(...items) should not report with object "z"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'z' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('a.includes(...items) should not report with object "a"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('b.includes(...items) should not report with object "b"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'b' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('c.includes(...items) should not report with object "c"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'c' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('d.includes(...items) should not report with object "d"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'd' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('e.includes(...items) should not report with object "e"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'e' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('f.includes(...items) should not report with object "f"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'f' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('g.includes(...items) should not report with object "g"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'g' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('h.includes(...items) should not report with object "h"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'h' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('i.includes(...items) should not report with object "i"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'i' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('j.includes(...items) should not report with object "j"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'j' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('k.includes(...items) should not report with object "k"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'k' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('l.includes(...items) should not report with object "l"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'l' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('m.includes(...items) should not report with object "m"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'm' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('n.includes(...items) should not report with object "n"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'n' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('o.includes(...items) should not report with object "o"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'o' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('p.includes(...items) should not report with object "p"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'p' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('q.includes(...items) should not report with object "q"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'q' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('should not report with wrong property name', () => {
    test('int32Array.foo(...items) should not report with property "foo"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.bar(...items) should not report with property "bar"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'bar' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.baz(...items) should not report with property "baz"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'baz' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.qux(...items) should not report with property "qux"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'qux' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.toString(...items) should not report with property "toString"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'toString' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.valueOf(...items) should not report with property "valueOf"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'valueOf' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.hasOwnProperty(...items) should not report with property "hasOwnProperty"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'hasOwnProperty' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.constructor(...items) should not report with property "constructor"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'constructor' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.prototype(...items) should not report with property "prototype"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'prototype' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.__proto__(...items) should not report with property "__proto__"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: '__proto__' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.apply(...items) should not report with property "apply"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'apply' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.bind(...items) should not report with property "bind"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'bind' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.call(...items) should not report with property "call"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'call' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.length(...items) should not report with property "length"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'length' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.name(...items) should not report with property "name"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'name' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.args(...items) should not report with property "args"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'args' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.callee(...items) should not report with property "callee"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'callee' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.caller(...items) should not report with property "caller"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'caller' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.arguments(...items) should not report with property "arguments"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'arguments' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.pop(...items) should not report with property "pop"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'pop' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.push(...items) should not report with property "push"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'push' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.shift(...items) should not report with property "shift"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'shift' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.unshift(...items) should not report with property "unshift"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'unshift' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.slice(...items) should not report with property "slice"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.splice(...items) should not report with property "splice"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.concat(...items) should not report with property "concat"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'concat' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.join(...items) should not report with property "join"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'join' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.indexOf(...items) should not report with property "indexOf"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.lastIndexOf(...items) should not report with property "lastIndexOf"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.forEach(...items) should not report with property "forEach"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'forEach' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.map(...items) should not report with property "map"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'map' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.filter(...items) should not report with property "filter"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'filter' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.reduce(...items) should not report with property "reduce"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'reduce' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.reduceRight(...items) should not report with property "reduceRight"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'reduceRight' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.some(...items) should not report with property "some"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'some' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.every(...items) should not report with property "every"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'every' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.find(...items) should not report with property "find"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'find' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.findIndex(...items) should not report with property "findIndex"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('int32Array.sort(...items) should not report with property "sort"', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'int32Array' },
          property: { type: 'Identifier', name: 'sort' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('should report int32Array.includes(...items) with single spread', () => {
    test('should report int32Array.includes(...items) case 1', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...arr) case 2', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 2, 0, 2, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...args) case 3', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'args' })], 3, 0, 3, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...list) case 4', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'list' })], 4, 0, 4, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...data) case 5', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'data' })], 5, 0, 5, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...values) case 6', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'values' })], 6, 0, 6, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...nums) case 7', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'nums' })], 7, 0, 7, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...rest) case 8', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'rest' })], 8, 0, 8, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...options) case 9', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'options' })], 9, 0, 9, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...params) case 10', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'params' })], 10, 0, 10, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...collection) case 11', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'collection' })], 11, 0, 11, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...elements) case 12', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'elements' })], 12, 0, 12, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...entries) case 13', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'entries' })], 13, 0, 13, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...objs) case 14', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'objs' })], 14, 0, 14, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...source) case 15', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'source' })], 15, 0, 15, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...input) case 16', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'input' })], 16, 0, 16, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...payload) case 17', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'payload' })], 17, 0, 17, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...buffer) case 18', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'buffer' })], 18, 0, 18, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...chunk) case 19', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'chunk' })], 19, 0, 19, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...segment) case 20', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'segment' })], 20, 0, 20, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...portion) case 21', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'portion' })], 21, 0, 21, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...range) case 22', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'range' })], 22, 0, 22, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...tuple) case 23', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'tuple' })], 23, 0, 23, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...seq) case 24', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'seq' })], 24, 0, 24, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...iter) case 25', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'iter' })], 25, 0, 25, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...result) case 26', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'result' })], 26, 0, 26, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...output) case 27', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'output' })], 27, 0, 27, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...response) case 28', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'response' })], 28, 0, 28, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...records) case 29', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'records' })], 29, 0, 29, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...rows) case 30', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'rows' })], 30, 0, 30, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...cols) case 31', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'cols' })], 31, 0, 31, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...cells) case 32', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'cells' })], 32, 0, 32, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...fields) case 33', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'fields' })], 33, 0, 33, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...props) case 34', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'props' })], 34, 0, 34, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...attrs) case 35', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'attrs' })], 35, 0, 35, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...keys) case 36', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'keys' })], 36, 0, 36, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...vals) case 37', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'vals' })], 37, 0, 37, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...pairs) case 38', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'pairs' })], 38, 0, 38, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...nodes) case 39', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'nodes' })], 39, 0, 39, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
    test('should report int32Array.includes(...items2) case 40', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items2' })], 40, 0, 40, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBeDefined()
    })
  })

  describe('location and structure', () => {
    test('should report with correct location line 2', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 2, 5, 2, 30)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(30)
    })
    test('should report with correct location line 3', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 3, 10, 3, 35)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(35)
    })
    test('should report with correct location line 5', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 0, 5, 20)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })
    test('should report with correct location line 10', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 8, 10, 28)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(28)
    })
    test('should report with correct location line 15', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 15, 3, 15, 23)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(15)
      expect(reports[0].loc?.end.column).toBe(23)
    })
    test('should report with correct location line 20', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 20, 0, 20, 15)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(20)
      expect(reports[0].loc?.end.column).toBe(15)
    })
    test('should report with correct location line 25', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 25, 12, 25, 37)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(12)
      expect(reports[0].loc?.end.line).toBe(25)
      expect(reports[0].loc?.end.column).toBe(37)
    })
    test('should report with correct location line 30', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 30, 1, 30, 21)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(30)
      expect(reports[0].loc?.start.column).toBe(1)
      expect(reports[0].loc?.end.line).toBe(30)
      expect(reports[0].loc?.end.column).toBe(21)
    })
    test('should report with correct location line 40', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 40, 5, 40, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(40)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(40)
      expect(reports[0].loc?.end.column).toBe(25)
    })
    test('should report with correct location line 50', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 50, 0, 50, 30)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(50)
      expect(reports[0].loc?.end.column).toBe(30)
    })
    test('should report with correct location line 60', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 60, 7, 60, 27)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(60)
      expect(reports[0].loc?.start.column).toBe(7)
      expect(reports[0].loc?.end.line).toBe(60)
      expect(reports[0].loc?.end.column).toBe(27)
    })
    test('should report with correct location line 70', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 70, 2, 70, 22)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(70)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(70)
      expect(reports[0].loc?.end.column).toBe(22)
    })
    test('should report with correct location line 80', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 80, 0, 80, 20)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(80)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(80)
      expect(reports[0].loc?.end.column).toBe(20)
    })
    test('should report with correct location line 90', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 90, 15, 90, 40)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(90)
      expect(reports[0].loc?.start.column).toBe(15)
      expect(reports[0].loc?.end.line).toBe(90)
      expect(reports[0].loc?.end.column).toBe(40)
    })
    test('should report with correct location line 100', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 100, 0, 100, 25)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(100)
      expect(reports[0].loc?.end.column).toBe(25)
    })
    test('should report with correct location line 150', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 150, 3, 150, 23)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(150)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(150)
      expect(reports[0].loc?.end.column).toBe(23)
    })
    test('should report with correct location line 200', () => {
      const { context, reports } = createMockContext()
      const node = makeint32ArrayIncludesCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 200, 8, 200, 33)
      noUnnecessaryInt32ArrayIncludesSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(200)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(200)
      expect(reports[0].loc?.end.column).toBe(33)
    })
  })
})