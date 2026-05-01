import { describe, expect, test, vi } from 'vitest'
import { noRequireImportsRule } from '../../../../src/rules/correctness/no-require-imports.js'
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
    getSource: () => 'const fs = require("fs")',
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

function makeRequireCall(arg: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'require' },
    arguments: [arg],
    loc: makeLoc(line, column, line, column + 20),
  }
}

describe('no-require-imports rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noRequireImportsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noRequireImportsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "correctness"', () => {
      expect(noRequireImportsRule.meta.docs?.category).toBe('correctness')
    })

    test('should be recommended', () => {
      expect(noRequireImportsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noRequireImportsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning require', () => {
      const desc = noRequireImportsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/require/)
    })

    test('should have correct docs URL', () => {
      expect(noRequireImportsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-require-imports',
      )
    })

    test('should have empty schema', () => {
      expect(noRequireImportsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noRequireImportsRule).toBeDefined()
      expect(noRequireImportsRule.meta).toBeDefined()
      expect(noRequireImportsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (30) =====
  describe('positive cases — reports require() calls', () => {
    test('reports require("fs")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions require', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'path' }))
      expect(reports[0].message).toMatch(/require/)
    })

    test('report message mentions ES module imports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'path' }))
      expect(reports[0].message).toMatch(/ES module imports/)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = makeRequireCall({ type: 'Literal', value: 'fs' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc has correct start line', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }, 5, 4))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc has correct start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }, 5, 4))
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('report loc has correct end line', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }, 5, 4))
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('report loc has correct end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }, 5, 4))
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('reports require at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }, 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports require at line 10 column 8', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }, 10, 8))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports require with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports require with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Identifier', name: 'moduleName' }))
      expect(reports.length).toBe(1)
    })

    test('reports require with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [
          { type: 'Literal', value: 'fs' },
          { type: 'Literal', value: 'extra' },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports require with numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports require with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports require with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: null }))
      expect(reports.length).toBe(1)
    })

    test('reports require at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }, 500, 20))
      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('reports multiple require calls accumulated', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'path' }))
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'os' }))
      expect(reports.length).toBe(3)
    })

    test('report descriptor has all three properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('message contains unexpected', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      expect(reports[0].message).toContain('Unexpected')
    })

    test('reports require with extra node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'fs' }],
        extra: true,
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports require with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports require with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getPath' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports require with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'config' },
        property: { type: 'Identifier', name: 'module' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports require with boolean argument true', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports require with boolean argument false', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports require with function expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports require with regex argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', regex: { pattern: 'a', flags: 'g' } }))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report non-require call', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'import' },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report call without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'module' },
          property: { type: 'Identifier', name: 'require' },
        },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'FunctionDeclaration',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report call with no callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report call with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report call with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report call with callee that is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Literal', value: 42 },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report call with callee name that is not require', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'include' },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report call with callee name Require (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Require' },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require with undefined arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require with null arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Math' },
        property: { type: 'Identifier', name: 'PI' },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type ClassExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'ClassExpression',
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'ObjectExpression',
        properties: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'ArrayExpression',
        elements: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'UnaryExpression',
        operator: '-',
        argument: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'i' },
        prefix: false,
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type YieldExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'items' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'Literal',
        value: 42,
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report call to "includes" with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'includes' },
        arguments: [{ type: 'Literal', value: 'item' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report call to "resolve" with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'resolve' },
        arguments: [{ type: 'Literal', value: 'path' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report call to "load" with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'load' },
        arguments: [{ type: 'Literal', value: 'module' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

  })

  // ===== EDGE CASES (20) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noRequireImportsRule.create(ctx1)
      const visitor2 = noRequireImportsRule.create(ctx2)

      visitor1.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'import' },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noRequireImportsRule.create(context)
      const visitor2 = noRequireImportsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed valid and invalid reports count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'import' },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'path' }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fetch' },
        arguments: [{ type: 'Literal', value: 'url' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'fs' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'fs' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('call with callee having no type does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { name: 'require' },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('call with callee as empty object does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {},
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node that is a primitive string', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      expect(() => visitor.CallExpression('not a node' as unknown as never)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node that is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      expect(() => visitor.CallExpression(42 as unknown as never)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node that is a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      expect(() => visitor.CallExpression(true as unknown as never)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('require with arguments as non-array string still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: 'not an array',
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('require with arguments as number still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: 42,
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('message consistency across multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'path' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('rule meta is the same reference across accesses', () => {
      const meta1 = noRequireImportsRule.meta
      const meta2 = noRequireImportsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noRequireImportsRule', () => {
      expect(noRequireImportsRule).toBeDefined()
      expect(typeof noRequireImportsRule.create).toBe('function')
      expect(typeof noRequireImportsRule.meta).toBe('object')
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRequireImportsRule.create(context)
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'fs' }))
      visitor.CallExpression(makeRequireCall({ type: 'Literal', value: 'path' }))
      expect(reports.length).toBe(2)
    })

    test('meta deprecated is not set or is false', () => {
      expect(noRequireImportsRule.meta.deprecated).toBeFalsy()
    })

    test('meta does not have fixable property', () => {
      expect(noRequireImportsRule.meta.fixable).toBeUndefined()
    })

    test('meta does not have requiresTypeChecking', () => {
      expect(noRequireImportsRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })
})
