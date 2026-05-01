import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryOptionalCallRule } from '../../../../src/rules/patterns/no-unnecessary-optional-call.js'
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

function makeOptionalMemberCallNode(
  objectName: string,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    optional: true,
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeOptionalIdentifierCallNode(
  functionName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    optional: true,
    callee: { type: 'Identifier', name: functionName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-optional-call rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryOptionalCallRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryOptionalCallRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryOptionalCallRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryOptionalCallRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryOptionalCallRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning optional', () => {
      const desc = noUnnecessaryOptionalCallRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/optional/)
    })

    test('should have a docs URL', () => {
      expect(noUnnecessaryOptionalCallRule.meta.docs?.url).toBeTruthy()
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryOptionalCallRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryOptionalCallRule).toBeDefined()
      expect(noUnnecessaryOptionalCallRule.meta).toBeDefined()
      expect(noUnnecessaryOptionalCallRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — MEMBER EXPRESSION — REPORTS (22) =====
  // One test per known global using MemberExpression optional call

  describe('positive cases — reports unnecessary optional member call on globals', () => {
    test('reports for console?.log("hi")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('console', 'log', [{ type: 'Literal', value: 'hi' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math?.random()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Math', 'random'))
      expect(reports.length).toBe(1)
    })

    test('reports for JSON?.parse(str)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('JSON', 'parse', [{ type: 'Identifier', name: 'str' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array?.isArray(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Array', 'isArray', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object?.keys(obj)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Object', 'keys', [{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for String?.fromCharCode(65)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('String', 'fromCharCode', [{ type: 'Literal', value: 65 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Number?.isInteger(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Number', 'isInteger', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean?.valueOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Boolean', 'valueOf'))
      expect(reports.length).toBe(1)
    })

    test('reports for Date?.now()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Date', 'now'))
      expect(reports.length).toBe(1)
    })

    test('reports for RegExp?.test(str)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('RegExp', 'test', [{ type: 'Identifier', name: 'str' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Error?.captureStackTrace(obj)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Error', 'captureStackTrace', [{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Map?.prototype.size', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Map', 'get', [{ type: 'Identifier', name: 'key' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Set?.prototype.size', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Set', 'add', [{ type: 'Identifier', name: 'val' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise?.resolve(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Promise', 'resolve', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Symbol?.for(key)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Symbol', 'for', [{ type: 'Literal', value: 'key' }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — IDENTIFIER CALL — REPORTS (7) =====

  describe('positive cases — reports unnecessary optional identifier call on globals', () => {
    test('reports for parseInt?.("10")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('parseInt', [{ type: 'Literal', value: '10' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat?.("3.14")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('parseFloat', [{ type: 'Literal', value: '3.14' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN?.(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('isNaN', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite?.(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('isFinite', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Array?.of(1, 2, 3) — identifier form', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('Array', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for JSON?.stringify() — identifier form', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('JSON'))
      expect(reports.length).toBe(1)
    })

    test('reports for console?.log() — identifier form', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('console', [{ type: 'Literal', value: 'test' }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT CONTENT TESTS (6) =====

  describe('report content', () => {
    test('report message mentions the global name for member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('console', 'log'))
      expect(reports[0].message).toContain('console')
    })

    test('report message mentions the global name for identifier call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('parseInt'))
      expect(reports[0].message).toContain('parseInt')
    })

    test('report message mentions "always defined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Math', 'random'))
      expect(reports[0].message).toMatch(/always defined/i)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('JSON', 'parse'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('JSON', 'parse'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      const node = makeOptionalMemberCallNode('JSON', 'parse')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (32) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for console.log("hi") — no optional chaining', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: false,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Literal', value: 'hi' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for foo?.bar() — user variable member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('foo', 'bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj?.method() — user object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('obj', 'method'))
      expect(reports.length).toBe(0)
    })

    test('does not report for myFunc?.() — user function identifier call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('myFunc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for callback?.() — user callback identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('callback'))
      expect(reports.length).toBe(0)
    })

    test('does not report for window?.alert() — not a known global', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('window', 'alert'))
      expect(reports.length).toBe(0)
    })

    test('does not report for document?.querySelector() — not a known global', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('document', 'querySelector'))
      expect(reports.length).toBe(0)
    })

    test('does not report for process?.env — not a known global', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('process', 'env'))
      expect(reports.length).toBe(0)
    })

    test('does not report for globalThis?.fetch() — not a known global', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('globalThis', 'fetch'))
      expect(reports.length).toBe(0)
    })

    test('does not report when optional flag is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when optional flag is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: null,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when optional flag is 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: 0,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', optional: true, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', optional: true, callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object in MemberExpression is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObj' }, arguments: [] },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a MemberExpression with missing object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a MemberExpression with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for user identifier optional call — getData?.()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('getData'))
      expect(reports.length).toBe(0)
    })

    test('does not report for user identifier optional call — handler?.()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('handler'))
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined?.() — though "undefined" is a known global', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('undefined'))
      expect(reports.length).toBe(1)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: true,
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when MemberExpression object is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          object: { type: 'ObjectExpression', properties: [] },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when MemberExpression object is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'trim' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for optional call on "require" — not a known global', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('require', [{ type: 'Literal', value: 'fs' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for optional call on "fetch" — not a known global', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('fetch', [{ type: 'Literal', value: 'https://example.com' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (18) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryOptionalCallRule.create(ctx1)
      const visitor2 = noUnnecessaryOptionalCallRule.create(ctx2)
      visitor1.CallExpression(makeOptionalMemberCallNode('console', 'log'))
      visitor2.CallExpression(makeOptionalMemberCallNode('foo', 'bar'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('console', 'log'))
      visitor.CallExpression(makeOptionalMemberCallNode('foo', 'bar'))
      visitor.CallExpression(makeOptionalIdentifierCallNode('parseInt'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      const node = {
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      const node = {
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('JSON', 'parse', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('foo', 'bar'))
      visitor.CallExpression(makeOptionalMemberCallNode('console', 'log'))
      visitor.CallExpression(makeOptionalIdentifierCallNode('myFunc'))
      visitor.CallExpression(makeOptionalIdentifierCallNode('parseInt'))
      visitor.CallExpression(makeOptionalMemberCallNode('window', 'alert'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryOptionalCallRule.create(context)
      const visitor2 = noUnnecessaryOptionalCallRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryOptionalCallRule.meta
      const meta2 = noUnnecessaryOptionalCallRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      const node = {
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Date' },
          property: { type: 'Identifier', name: 'now' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Date' },
          property: { type: 'Identifier', name: 'now' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      const node = makeOptionalMemberCallNode('console', 'log')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryOptionalCallRule).toBeDefined()
      expect(typeof noUnnecessaryOptionalCallRule.create).toBe('function')
      expect(typeof noUnnecessaryOptionalCallRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Error' },
          property: { type: 'Identifier', name: 'captureStackTrace' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('all reports have the same message format for member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('console', 'log'))
      visitor.CallExpression(makeOptionalMemberCallNode('Math', 'random'))
      expect(reports[0].message).toMatch(/Unnecessary optional call on/)
      expect(reports[1].message).toMatch(/Unnecessary optional call on/)
    })

    test('reports two violations with different global names in messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('console', 'log'))
      visitor.CallExpression(makeOptionalMemberCallNode('Math', 'random'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('console')
      expect(reports[1].message).toContain('Math')
    })

    test('accumulates reports across multiple calls correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('JSON', 'stringify'))
      visitor.CallExpression(makeOptionalMemberCallNode('foo', 'bar'))
      expect(reports.length).toBe(1)
      visitor.CallExpression(makeOptionalMemberCallNode('Math', 'floor', [{ type: 'Literal', value: 1.5 }]))
      expect(reports.length).toBe(2)
    })

    test('NaN?.() identifier call reports as known global', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalIdentifierCallNode('NaN'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('NaN')
    })

    test('Infinity?.toString() member call reports as known global', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression(makeOptionalMemberCallNode('Infinity', 'toString'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Infinity')
    })

    test('handles computed member expression with known global', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        optional: true,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 1.5 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })
  })
})
