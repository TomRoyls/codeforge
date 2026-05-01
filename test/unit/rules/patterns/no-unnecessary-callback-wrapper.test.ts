import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryCallbackWrapperRule } from '../../../../src/rules/patterns/no-unnecessary-callback-wrapper.js'
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
    getSource: () => '',
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

function makeCallbackWrapperNode(
  innerName: string,
  paramName: string,
  outerArgName: string,
  calleeType: 'ArrowFunctionExpression' | 'FunctionExpression' = 'ArrowFunctionExpression',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: calleeType,
      params: [{ type: 'Identifier', name: paramName }],
      body: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: innerName },
        arguments: [{ type: 'Identifier', name: paramName }],
      },
    },
    arguments: [{ type: 'Identifier', name: outerArgName }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-callback-wrapper rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryCallbackWrapperRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryCallbackWrapperRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryCallbackWrapperRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryCallbackWrapperRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryCallbackWrapperRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning callback', () => {
      const desc = noUnnecessaryCallbackWrapperRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/callback/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryCallbackWrapperRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-callback-wrapper',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryCallbackWrapperRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryCallbackWrapperRule).toBeDefined()
      expect(noUnnecessaryCallbackWrapperRule.meta).toBeDefined()
      expect(noUnnecessaryCallbackWrapperRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY WRAPPER (25) =====

  describe('positive cases — reports unnecessary callback wrapper', () => {
    test('reports arrow wrapper around callback with single arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('callback', 'x', 'data'))
      expect(reports.length).toBe(1)
    })

    test('reports function expression wrapper around callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn', 'x', 'data', 'FunctionExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "process" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('process', 'item', 'list'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "handleClick" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('handleClick', 'e', 'event'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "log" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('log', 'msg', 'message'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "transform" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('transform', 'val', 'value'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "validate" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('validate', 'input', 'data'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "parse" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('parse', 'str', 'text'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "format" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('format', 'n', 'number'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "save" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('save', 'doc', 'document'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "filter" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('filter', 'item', 'array'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "map" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('map', 'x', 'items'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "sort" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('sort', 'a', 'list'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "fetch" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fetch', 'url', 'endpoint'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "dispatch" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('dispatch', 'action', 'store'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "send" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('send', 'msg', 'payload'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "render" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('render', 'comp', 'props'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "emit" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('emit', 'evt', 'event'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "notify" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('notify', 'msg', 'alert'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "resolve" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('resolve', 'val', 'promise'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "reject" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('reject', 'err', 'error'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "execute" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('execute', 'cmd', 'command'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "run" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('run', 'task', 'job'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "compute" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('compute', 'x', 'input'))
      expect(reports.length).toBe(1)
    })

    test('reports arrow wrapper with "update" as inner name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('update', 'obj', 'state'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Unnecessary callback wrapper"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('callback', 'x', 'data'))
      expect(reports[0].message).toContain('Unnecessary callback wrapper')
    })

    test('report message contains the inner function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('myFunc', 'x', 'data'))
      expect(reports[0].message).toContain('myFunc')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('callback', 'x', 'data'))
      expect(reports[0].message).toBe("Unnecessary callback wrapper around 'callback'.")
    })

    test('report message includes single quotes around function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('process', 'item', 'list'))
      expect(reports[0].message).toBe("Unnecessary callback wrapper around 'process'.")
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn', 'x', 'data'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn', 'x', 'data'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      const node = makeCallbackWrapperNode('fn', 'x', 'data')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc preserves node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn', 'x', 'data', 'ArrowFunctionExpression', 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc preserves end location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn', 'x', 'data', 'ArrowFunctionExpression', 2, 5, 8, 20))
      expect(reports[0].loc?.end.line).toBe(8)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report message reflects different inner function names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('onClick', 'e', 'event'))
      expect(reports[0].message).toBe("Unnecessary callback wrapper around 'onClick'.")
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn1', 'x', 'data'))
      visitor.CallExpression(makeCallbackWrapperNode('fn2', 'y', 'items'))
      expect(reports.length).toBe(2)
    })

    test('each accumulated report has correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn1', 'x', 'data'))
      visitor.CallExpression(makeCallbackWrapperNode('fn2', 'y', 'items'))
      expect(reports[0].message).toBe("Unnecessary callback wrapper around 'fn1'.")
      expect(reports[1].message).toBe("Unnecessary callback wrapper around 'fn2'.")
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn', 'x', 'data'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report node preserves the outer CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn', 'x', 'data'))
      expect((reports[0].node as Record<string, unknown>)?.type).toBe('CallExpression')
    })

    test('report message changes based on inner callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('handler', 'arg', 'value'))
      expect(reports[0].message).toContain('handler')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: { type: 'Identifier', name: 'result' },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer has more than one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }, { type: 'Identifier', name: 'extra' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer has zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when param name differs from inner arg name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'y' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow has more than one param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner call has more than one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'extra' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer argument is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when param is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'args' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee body is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: null,
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee name is not string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 42 },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when params is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner arg is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Literal', value: 42 }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryCallbackWrapperRule.create(ctx1)
      const visitor2 = noUnnecessaryCallbackWrapperRule.create(ctx2)
      visitor1.CallExpression(makeCallbackWrapperNode('fn', 'x', 'data'))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn1', 'x', 'data'))
      visitor.CallExpression({ type: 'Identifier', name: 'foo' })
      visitor.CallExpression(makeCallbackWrapperNode('fn2', 'y', 'items'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryCallbackWrapperRule.create(context)
      const visitor2 = noUnnecessaryCallbackWrapperRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryCallbackWrapperRule.meta
      const meta2 = noUnnecessaryCallbackWrapperRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          extra: true,
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      const node = makeCallbackWrapperNode('fn', 'x', 'data')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryCallbackWrapperRule).toBeDefined()
      expect(typeof noUnnecessaryCallbackWrapperRule.create).toBe('function')
      expect(typeof noUnnecessaryCallbackWrapperRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn1', 'x', 'data'))
      visitor.CallExpression({ type: 'Identifier', name: 'foo' })
      visitor.CallExpression(makeCallbackWrapperNode('fn2', 'y', 'items'))
      visitor.CallExpression({ type: 'Literal', value: 42 })
      visitor.CallExpression(makeCallbackWrapperNode('fn3', 'z', 'values'))
      expect(reports.length).toBe(3)
    })

    test('handles FunctionExpression callee with single param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('callback', 'x', 'data', 'FunctionExpression'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("Unnecessary callback wrapper around 'callback'.")
    })

    test('FunctionExpression and ArrowFunction produce same message', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const v1 = noUnnecessaryCallbackWrapperRule.create(ctx1)
      const v2 = noUnnecessaryCallbackWrapperRule.create(ctx2)
      v1.CallExpression(makeCallbackWrapperNode('fn', 'x', 'data', 'ArrowFunctionExpression'))
      v2.CallExpression(makeCallbackWrapperNode('fn', 'x', 'data', 'FunctionExpression'))
      expect(rep1[0].message).toBe(rep2[0].message)
    })

    test('does not report when callee type is neither arrow nor function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression(makeCallbackWrapperNode('fn', 'x', 'data', 'ArrowFunctionExpression', 10, 4, 15, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(15)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('does not report when callee body callee is missing name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when params is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: 'not-array',
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCallbackWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: 'not-array',
          },
        },
        arguments: [{ type: 'Identifier', name: 'data' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })
})
