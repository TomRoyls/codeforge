import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringTrimEmptyRule } from '../../../../src/rules/patterns/index.js'
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

function makeCallNode(
  object: unknown,
  methodName: string,
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
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeStrLit(value: string): unknown {
  return { type: 'StringLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-trim-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringTrimEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringTrimEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringTrimEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringTrimEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringTrimEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning trim', () => {
      const desc = noUnnecessaryStringTrimEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/trim/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringTrimEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-trim-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringTrimEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringTrimEmptyRule).toBeDefined()
      expect(noUnnecessaryStringTrimEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringTrimEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary trim on empty string', () => {
    test('reports for empty string literal "".trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: '_unused' }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string with Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: null }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string with ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string with ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions trim', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      expect(reports[0].message).toMatch(/trim/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      expect(reports[0].message).toBe(
        `''.trim('') with an empty string argument is unnecessary. trim() takes no arguments.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'y' }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'y' }, 'trim', [makeStrLit('')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'trim' },
        },
        arguments: [makeStrLit('')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'trim' },
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'trim' },
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles computed=false member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'trim' },
          computed: false,
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'y' }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'trim' },
        },
        arguments: [makeStrLit('')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'trim' },
        },
        arguments: [makeStrLit('')],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports for empty string with FunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'trim' },
        },
        arguments: [makeStrLit('')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports for empty string with ArrowFunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string with ConditionalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-empty string "hello".trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for single space string " ".trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit(' ')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for multi-space string "  ".trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('  ')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for tab string "\\t".trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('\t')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for newline string "\\n".trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('\n')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for carriage return "\\r".trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('\r')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for mixed whitespace " \\t\\n".trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit(' \t\n')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-StringLiteral argument (Literal type)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name trimStart', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trimStart', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name trimEnd', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trimEnd', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name trimLeft', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trimLeft', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name trimRight', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trimRight', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name toString', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toString', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name toUpperCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toUpperCase', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for function call trim("") — not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'trim' },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for method name toLowerCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toLowerCase', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name padStart', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'padStart', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeStrLit('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Literal', value: 'trim' },
          computed: true,
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Literal', value: 'trim' },
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "Trim" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'Trim', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "TRIM" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'TRIM', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "trimm" (typo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trimm', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty (0 arguments)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when there are 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit(''), { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when there are 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit(''), { type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Identifier (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [{ type: 'Identifier', name: 'str' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringTrimEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringTrimEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('hello')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('hello')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringTrimEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringTrimEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringTrimEmptyRule.meta
      const meta2 = noUnnecessaryStringTrimEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringTrimEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringTrimEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringTrimEmptyRule.meta).toBe('object')
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('hello')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trimStart', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit(' ')]))
      expect(reports.length).toBe(2)
    })

    test('does not report for method name split', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'split', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name replace', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'replace', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name match', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'match', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-empty string with unicode non-breaking space', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('\u00A0')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-empty string with emoji', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('😀')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for single character string "a".trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('a')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with leading/trailing spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit(' hello ')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "trim " (with trailing space)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim ', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "trim" with lowercase "trim" via bracket access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'trim' },
          computed: true,
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for string with only zero-width space character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('\u200B')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-empty string with form feed character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'trim', [makeStrLit('\f')]))
      expect(reports.length).toBe(0)
    })
  })
})
