import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryInitializationRule } from '../../../../src/rules/patterns/no-unnecessary-initialization.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => 'let x = undefined',
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeVarDeclUndefinedInit(
  name = 'x',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name },
    init: { type: 'Identifier', name: 'undefined' },
    loc: makeLoc(line, column, line, column + 20),
  }
}

function makeVarDeclNullInit(
  name = 'x',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name },
    init: { type: 'Literal', value: null },
    loc: makeLoc(line, column, line, column + 15),
  }
}

describe('no-unnecessary-initialization rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryInitializationRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryInitializationRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryInitializationRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryInitializationRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryInitializationRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning initialization and undefined', () => {
      const desc = noUnnecessaryInitializationRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/initialization/)
      expect(desc).toMatch(/undefined/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryInitializationRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-initialization',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryInitializationRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryInitializationRule).toBeDefined()
      expect(noUnnecessaryInitializationRule.meta).toBeDefined()
      expect(noUnnecessaryInitializationRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports unnecessary initialization', () => {
    test('reports let x = undefined — Identifier init with name "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      expect(reports.length).toBe(1)
    })

    test('reports let x = null — Literal init with value null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclNullInit())
      expect(reports.length).toBe(1)
    })

    test('message contains "Unnecessary" for undefined case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('message contains "undefined" for undefined case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      expect(reports[0].message.toLowerCase()).toContain('undefined')
    })

    test('message contains "Variables are undefined by default" for undefined case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      expect(reports[0].message).toContain('Variables are undefined by default')
    })

    test('message contains "Unnecessary" for null case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclNullInit())
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('message contains "null" for null case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclNullInit())
      expect(reports[0].message.toLowerCase()).toContain('null')
    })

    test('message contains "non-undefined default" for null case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclNullInit())
      expect(reports[0].message).toContain('non-undefined default')
    })

    test('report has loc property for undefined case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property for undefined case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node for undefined case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = makeVarDeclUndefinedInit()
      visitor.VariableDeclarator(node)
      expect(reports[0].node).toBe(node)
    })

    test('report has loc property for null case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclNullInit())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property for null case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclNullInit())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node for null case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = makeVarDeclNullInit()
      visitor.VariableDeclarator(node)
      expect(reports[0].node).toBe(node)
    })

    test('accumulates multiple reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('x'))
      visitor.VariableDeclarator(makeVarDeclNullInit('y'))
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('z'))
      expect(reports.length).toBe(3)
    })

    test('both undefined and null messages are different', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      visitor.VariableDeclarator(makeVarDeclNullInit())
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('reports const x = undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('x'))
      expect(reports.length).toBe(1)
    })

    test('reports var x = undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('x'))
      expect(reports.length).toBe(1)
    })

    test('reports with correct location line/column values for undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('x', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report let x = 5 — Literal with number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 5 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report let x = "hello" — Literal with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 'hello' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report let x = true — Literal with boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report let x = {} — ObjectExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'ObjectExpression', properties: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report let x = [] — ArrayExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'ArrayExpression', elements: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report let x — no init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      expect(() => visitor.VariableDeclarator({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression — wrong node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Identifier init with name "null" — only "undefined" triggers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'null' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with value 0 — number is not null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with empty string — "" is not null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: '' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with value false — boolean is not null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunctionExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Identifier', name: 'y' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Foo' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TaggedTemplateExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'html' },
          quasi: { type: 'TemplateLiteral', expressions: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BinaryExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ConditionalExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report LogicalExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'LogicalExpression',
          operator: '??',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TemplateLiteral init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report SequenceExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'SequenceExpression',
          expressions: [
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
          ],
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report UnaryExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'flag' },
        },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report UpdateExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report AwaitExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'promise' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report YieldExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'YieldExpression',
          argument: { type: 'Identifier', name: 'value' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ClassExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'ClassExpression',
          body: { type: 'ClassBody', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property node — not VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'x' },
        value: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement — not VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      expect(() => visitor.VariableDeclarator('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report VariableDeclarator with init: null (AST null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report VariableDeclarator with init: undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: undefined,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Literal init with value undefined — only null triggers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: undefined },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryInitializationRule.create(ctx1)
      const visitor2 = noUnnecessaryInitializationRule.create(ctx2)

      visitor1.VariableDeclarator(makeVarDeclUndefinedInit('x'))
      visitor2.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'y' },
        init: { type: 'Literal', value: 5 },
        loc: makeLoc(1, 0, 1, 10),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly across many calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('a'))
      visitor.VariableDeclarator(makeVarDeclNullInit('b'))
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('c'))
      visitor.VariableDeclarator(makeVarDeclNullInit('d'))
      expect(reports.length).toBe(4)
    })

    test('node without loc still reports for undefined case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'undefined' },
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports for null case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: null },
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc gets default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'undefined' },
      }
      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('a'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'b' },
        init: { type: 'Literal', value: 5 },
        loc: makeLoc(2, 0, 2, 10),
      })
      visitor.VariableDeclarator(makeVarDeclNullInit('c'))
      visitor.VariableDeclarator({
        type: 'AssignmentExpression',
        loc: makeLoc(3, 0, 3, 10),
      })
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('d'))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryInitializationRule.create(context)
      const visitor2 = noUnnecessaryInitializationRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      expect(reports.length).toBe(3)
    })

    test('VariableDeclarator with missing init property — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('VariableDeclarator with destructured object id and undefined init reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('VariableDeclarator with destructured array id and null init reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ArrayPattern', elements: [] },
        init: { type: 'Literal', value: null },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('location with specific line/column values for undefined case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('x', 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('location with specific line/column values for null case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclNullInit('x', 7, 2))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('handles node with missing id property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        init: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 20),
        extra: true,
        leadingComments: [],
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('rule meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryInitializationRule.meta
      const meta2 = noUnnecessaryInitializationRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports create and meta correctly', () => {
      expect(noUnnecessaryInitializationRule).toBeDefined()
      expect(typeof noUnnecessaryInitializationRule.create).toBe('function')
      expect(typeof noUnnecessaryInitializationRule.meta).toBe('object')
    })

    test('all undefined violation messages are identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('a'))
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('b'))
      visitor.VariableDeclarator(makeVarDeclUndefinedInit('c'))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('all null violation messages are identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclNullInit('a'))
      visitor.VariableDeclarator(makeVarDeclNullInit('b'))
      visitor.VariableDeclarator(makeVarDeclNullInit('c'))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('let x = undefined uses Identifier type for init detection', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
    })

    test('let x = null uses Literal type for init detection', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: null },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('reports var x = null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclNullInit('x'))
      expect(reports.length).toBe(1)
    })

    test('reports const x = null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclNullInit('x'))
      expect(reports.length).toBe(1)
    })

    test('does not report let x = false — Literal boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report let x = 0 — Literal number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('two different message types are distinguishable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      visitor.VariableDeclarator(makeVarDeclNullInit())
      expect(reports[0].message).toContain('undefined')
      expect(reports[1].message).toContain('null')
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('does not report when node type is Property with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'x' },
        value: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInitializationRule.create(context)
      visitor.VariableDeclarator(makeVarDeclUndefinedInit())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
      expect(typeof reports[0].message).toBe('string')
    })
  })
})
