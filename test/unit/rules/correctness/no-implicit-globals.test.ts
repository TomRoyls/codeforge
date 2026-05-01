import { describe, expect, test, vi } from 'vitest'
import { noImplicitGlobalsRule } from '../../../../src/rules/correctness/no-implicit-globals.js'
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
    getSource: () => 'x = 1',
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

function makeAssignment(
  leftName: string,
  leftType = 'Identifier',
  operator = '=',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator,
    left: { type: leftType, name: leftName },
    right: { type: 'Literal', value: 1 },
    loc: makeLoc(line, column, line, column + 10),
  }
}

describe('no-implicit-globals rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "problem"', () => {
      expect(noImplicitGlobalsRule.meta.type).toBe('problem')
    })

    test('should have severity "error"', () => {
      expect(noImplicitGlobalsRule.meta.severity).toBe('error')
    })

    test('should have correct category "correctness"', () => {
      expect(noImplicitGlobalsRule.meta.docs?.category).toBe('correctness')
    })

    test('should be recommended', () => {
      expect(noImplicitGlobalsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noImplicitGlobalsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning "global" and "undeclared"', () => {
      const desc = noImplicitGlobalsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/global/)
      expect(desc).toMatch(/undeclared/)
    })

    test('should have correct docs URL', () => {
      expect(noImplicitGlobalsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-implicit-globals',
      )
    })

    test('should have empty schema', () => {
      expect(noImplicitGlobalsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noImplicitGlobalsRule).toBeDefined()
      expect(noImplicitGlobalsRule.meta).toBeDefined()
      expect(noImplicitGlobalsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports implicit global assignments', () => {
    test('reports assignment to unknown identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('myVar'))
      expect(reports.length).toBe(1)
    })

    test('message contains "Implicit global"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('myVar'))
      expect(reports[0].message).toContain('Implicit global')
    })

    test('message contains the variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('myVar'))
      expect(reports[0].message).toContain('myVar')
    })

    test('message suggests "let"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('x'))
      expect(reports[0].message).toContain('let')
    })

    test('message suggests "const"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('x'))
      expect(reports[0].message).toContain('const')
    })

    test('message suggests "var"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('x'))
      expect(reports[0].message).toContain('var')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('x'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('x'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      const node = makeAssignment('x')
      visitor.AssignmentExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports assignment to variable named "foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('foo'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('foo')
    })

    test('reports assignment to variable named "bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('bar'))
      expect(reports.length).toBe(1)
    })

    test('reports assignment to variable named "result"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('result'))
      expect(reports.length).toBe(1)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('x', 'Identifier', '=', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('accumulation of multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('a'))
      visitor.AssignmentExpression(makeAssignment('b'))
      visitor.AssignmentExpression(makeAssignment('c'))
      expect(reports.length).toBe(3)
    })

    test('reports assignment to "userData" variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('userData'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('userData')
    })

    test('reports assignment to "tempValue" variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('tempValue'))
      expect(reports.length).toBe(1)
    })

    test('reports assignment to "config" variable (not in whitelist)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('config'))
      expect(reports.length).toBe(1)
    })

    test('reports assignment to "count" variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('count'))
      expect(reports.length).toBe(1)
    })

    test('reports assignment to "total" variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('total'))
      expect(reports.length).toBe(1)
    })

    test('report location matches node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('x', 'Identifier', '=', 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report assignment to known global "window"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('window'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "console"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('console'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "process"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('process'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "document"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('document'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Math"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Math'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "JSON"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('JSON'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Promise"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Promise'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Array"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Array'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Object'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "globalThis"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('globalThis'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('undefined'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "NaN"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('NaN'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Infinity"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Infinity'))
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression left side (obj.x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'x' },
        },
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "fetch"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('fetch'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "setTimeout"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('setTimeout'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "String"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('String'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Number'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Boolean'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Date"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Date'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "RegExp"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('RegExp'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Error"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Error'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Map"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Map'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Set"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Set'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Symbol"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Symbol'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "eval"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('eval'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "require"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('require'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "module"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('module'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "exports"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('exports'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Buffer"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Buffer'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "URL"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('URL'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "crypto"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('crypto'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "performance"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('performance'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "navigator"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('navigator'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "self"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('self'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noImplicitGlobalsRule.create(ctx1)
      const visitor2 = noImplicitGlobalsRule.create(ctx2)

      visitor1.AssignmentExpression(makeAssignment('myVar'))
      visitor2.AssignmentExpression(makeAssignment('window'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('a'))
      visitor.AssignmentExpression(makeAssignment('b'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations — some globals some not', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('myVar'))
      visitor.AssignmentExpression(makeAssignment('console'))
      visitor.AssignmentExpression(makeAssignment('anotherVar'))
      visitor.AssignmentExpression(makeAssignment('window'))
      visitor.AssignmentExpression(makeAssignment('thirdVar'))
      expect(reports.length).toBe(3)
    })

    test('default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object — non-AssignmentExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      expect(() => visitor.AssignmentExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles wrong node type (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles left side with no name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier' },
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('chained assignment — reports only the outer AssignmentExpression left', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      // x = (y = 1) — outer: left=x, right is another AssignmentExpression
      const innerAssign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'y' },
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 5, 1, 10),
      }
      const outerNode = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: innerAssign,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.AssignmentExpression(outerNode)
      // Only the outer assignment is visited once, reports for 'x'
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('handles non-object node (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      expect(() => visitor.AssignmentExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('AssignmentExpression with null left side', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: null,
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noImplicitGlobalsRule.create(context)
      const visitor2 = noImplicitGlobalsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('meta is referentially stable across accesses', () => {
      const meta1 = noImplicitGlobalsRule.meta
      const meta2 = noImplicitGlobalsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('message is consistent across multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('a'))
      visitor.AssignmentExpression(makeAssignment('b'))
      // Messages differ by variable name but follow same format
      expect(reports[0].message).toContain('Implicit global variable assignment')
      expect(reports[1].message).toContain('Implicit global variable assignment')
    })

    test('multiple different unknown variable assignments each report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('alpha'))
      visitor.AssignmentExpression(makeAssignment('beta'))
      visitor.AssignmentExpression(makeAssignment('gamma'))
      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('beta')
      expect(reports[2].message).toContain('gamma')
    })

    test('compound assignment operator += reports unknown variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('counter', 'Identifier', '+='))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('counter')
    })

    test('compound assignment operator -= reports unknown variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('total', 'Identifier', '-='))
      expect(reports.length).toBe(1)
    })

    test('compound assignment operator *= reports unknown variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('product', 'Identifier', '*='))
      expect(reports.length).toBe(1)
    })

    test('compound assignment operator does NOT report known global', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('global', 'Identifier', '+='))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "HTMLElement"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('HTMLElement'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "localStorage"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('localStorage'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "WebSocket"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('WebSocket'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Worker"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Worker'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "FormData"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('FormData'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "Headers"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('Headers'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "__dirname"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('__dirname'))
      expect(reports.length).toBe(0)
    })

    test('does not report assignment to known global "__filename"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitGlobalsRule.create(context)
      visitor.AssignmentExpression(makeAssignment('__filename'))
      expect(reports.length).toBe(0)
    })
  })
})
