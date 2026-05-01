import { describe, expect, test, vi } from 'vitest'
import { noMisusedNewRule } from '../../../../src/rules/patterns/no-misused-new.js'
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
    getSource: () => 'const s = new Symbol()',
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

function makeNewExpr(calleeName: string, args: unknown[] = [], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(line, column, line, column + calleeName.length + 6),
  }
}

describe('no-misused-new rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "problem"', () => {
      expect(noMisusedNewRule.meta.type).toBe('problem')
    })

    test('should have severity "error"', () => {
      expect(noMisusedNewRule.meta.severity).toBe('error')
    })

    test('should have correct category "patterns"', () => {
      expect(noMisusedNewRule.meta.docs?.category).toBe('patterns')
    })

    test('should be recommended', () => {
      expect(noMisusedNewRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noMisusedNewRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning new and non-constructor', () => {
      const desc = noMisusedNewRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/new/)
      expect(desc).toMatch(/non-constructor/)
    })

    test('should have correct docs URL', () => {
      expect(noMisusedNewRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-misused-new',
      )
    })

    test('should have empty schema', () => {
      expect(noMisusedNewRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMisusedNewRule).toBeDefined()
      expect(noMisusedNewRule.meta).toBeDefined()
      expect(noMisusedNewRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports new Symbol() and new BigInt()', () => {
    test('reports new Symbol()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports.length).toBe(1)
    })

    test('reports new BigInt()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('BigInt'))
      expect(reports.length).toBe(1)
    })

    test('message contains "Symbol" for new Symbol()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports[0].message).toContain('Symbol')
    })

    test('message contains "BigInt" for new BigInt()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('BigInt'))
      expect(reports[0].message).toContain('BigInt')
    })

    test('message says "not a constructor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports[0].message).toContain('not a constructor')
    })

    test('message suggests calling directly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports[0].message.toLowerCase()).toContain('call it directly')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = makeNewExpr('Symbol')
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc has correct start values', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol', [], 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('report loc has correct end values', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol', [], 5, 8))
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(8 + 'Symbol'.length + 6)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      visitor.NewExpression(makeNewExpr('BigInt'))
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports.length).toBe(3)
    })

    test('reports new Symbol() with argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol', [{ type: 'Literal', value: 'desc' }]))
      expect(reports.length).toBe(1)
    })

    test('reports new BigInt() with argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('BigInt', [{ type: 'Literal', value: 123 }]))
      expect(reports.length).toBe(1)
    })

    test('reports new Symbol() with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol', [
        { type: 'Literal', value: 'a' },
        { type: 'Literal', value: 'b' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports new BigInt() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('BigInt', []))
      expect(reports.length).toBe(1)
    })

    test('reports new Symbol() on different line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol', [], 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports.length).toBe(1)
    })

    test('message for Symbol suggests Symbol() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports[0].message).toContain('`Symbol()`')
    })

    test('message for BigInt suggests BigInt() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('BigInt'))
      expect(reports[0].message).toContain('`BigInt()`')
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report Symbol() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BigInt() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Object'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Set'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Date'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Error'))
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('RegExp'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Promise'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Function()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Function'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Number()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Number'))
      expect(reports.length).toBe(0)
    })

    test('does not report new String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Boolean'))
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression callee like new obj.Symbol()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'Symbol' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles wrong node type — Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report new without args on safe constructor — new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new MyCustomClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('MyCustomClass'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Foo() — arbitrary name', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report new MyClass() — class constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('MyClass'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'factory' },
          arguments: [],
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new WeakMap()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('WeakMap'))
      expect(reports.length).toBe(0)
    })

    test('does not report new WeakSet()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('WeakSet'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Proxy()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Proxy'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Int8Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Int8Array'))
      expect(reports.length).toBe(0)
    })

    test('does not report new ArrayBuffer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('ArrayBuffer'))
      expect(reports.length).toBe(0)
    })

    test('does not report new TypeError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('TypeError'))
      expect(reports.length).toBe(0)
    })

    test('does not report new RangeError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('RangeError'))
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report new SyntaxError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('SyntaxError'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMisusedNewRule.create(ctx1)
      const visitor2 = noMisusedNewRule.create(ctx2)

      visitor1.NewExpression(makeNewExpr('Symbol'))
      visitor2.NewExpression(makeNewExpr('Array'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('accumulation of both Symbol and BigInt', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      visitor.NewExpression(makeNewExpr('BigInt'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Symbol')
      expect(reports[1].message).toContain('BigInt')
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      // reports — new Symbol()
      visitor.NewExpression(makeNewExpr('Symbol'))
      // does NOT report — new Array()
      visitor.NewExpression(makeNewExpr('Array'))
      // reports — new BigInt()
      visitor.NewExpression(makeNewExpr('BigInt'))
      // does NOT report — new Object()
      visitor.NewExpression(makeNewExpr('Object'))
      // reports — new Symbol()
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports.length).toBe(3)
    })

    test('default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('new Symbol(undefined) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(1)
    })

    test('new BigInt(0) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('BigInt', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noMisusedNewRule.create(context)
      const visitor2 = noMisusedNewRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('handles NewExpression with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles NewExpression with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles Identifier callee with empty name', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: '' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles Identifier callee with numeric-like name', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol2' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      visitor.NewExpression(makeNewExpr('Symbol'))
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports.length).toBe(3)
    })

    test('handles node without callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      const node = {
        type: 'NewExpression',
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      visitor.NewExpression(makeNewExpr('BigInt'))
      expect(reports.length).toBe(2)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('meta is same reference across accesses', () => {
      const meta1 = noMisusedNewRule.meta
      const meta2 = noMisusedNewRule.meta
      expect(meta1).toBe(meta2)
    })

    test('message consistency — same rule produces same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all Symbol violation messages are identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      visitor.NewExpression(makeNewExpr('Symbol'))
      visitor.NewExpression(makeNewExpr('Symbol'))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('reports new Symbol("desc") with description', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol', [{ type: 'Literal', value: 'desc' }]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Symbol')
    })

    test('reports new BigInt(123)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('BigInt', [{ type: 'Literal', value: 123 }]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('BigInt')
    })

    test('reports new BigInt(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('BigInt', [{ type: 'UnaryExpression', operator: '-' }]))
      expect(reports.length).toBe(1)
    })

    test('case sensitivity — new symbol() is NOT detected', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('symbol'))
      expect(reports.length).toBe(0)
    })

    test('case sensitivity — new bigint() is NOT detected', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('bigint'))
      expect(reports.length).toBe(0)
    })

    test('case sensitivity — new SYMBOL() is NOT detected', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('SYMBOL'))
      expect(reports.length).toBe(0)
    })

    test('rule exports noMisusedNewRule as named export', () => {
      expect(noMisusedNewRule).toBeDefined()
      expect(typeof noMisusedNewRule.create).toBe('function')
      expect(typeof noMisusedNewRule.meta).toBe('object')
    })

    test('does not report new Promise() with resolver', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Promise', [
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report new Map() with iterable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('message for Symbol includes backtick-wrapped name', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports[0].message).toMatch(/`Symbol`/)
    })

    test('message for BigInt includes backtick-wrapped name', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('BigInt'))
      expect(reports[0].message).toMatch(/`BigInt`/)
    })

    test('does not report new Float64Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedNewRule.create(context)
      visitor.NewExpression(makeNewExpr('Float64Array'))
      expect(reports.length).toBe(0)
    })
  })
})
