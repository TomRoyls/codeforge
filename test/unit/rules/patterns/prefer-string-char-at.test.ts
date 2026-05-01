import { describe, expect, test, vi } from 'vitest'
import { preferStringCharAtRule } from '../../../../src/rules/patterns/prefer-string-char-at.js'
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
    getSource: () => 'str.charAt(0)',
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

function makeCharAtCall(
  objName = 'str',
  indexType = 'Literal' as string,
  indexValue: unknown = 0,
  indexName = 'i',
  line = 1,
  column = 0,
): unknown {
  const indexArg =
    indexType === 'Literal'
      ? { type: 'Literal', value: indexValue }
      : indexType === 'Identifier'
        ? { type: 'Identifier', name: indexName }
        : { type: indexType }

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: objName },
      property: { type: 'Identifier', name: 'charAt' },
    },
    arguments: [indexArg],
    loc: makeLoc(line, column, line, column + 15),
  }
}

describe('prefer-string-char-at rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(preferStringCharAtRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(preferStringCharAtRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(preferStringCharAtRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(preferStringCharAtRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(preferStringCharAtRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning bracket notation and charAt', () => {
      const desc = preferStringCharAtRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/bracket/)
      expect(desc).toMatch(/charat/)
    })

    test('should have correct docs URL', () => {
      expect(preferStringCharAtRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-string-char-at',
      )
    })

    test('should have empty schema', () => {
      expect(preferStringCharAtRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(preferStringCharAtRule).toBeDefined()
      expect(preferStringCharAtRule.meta).toBeDefined()
      expect(preferStringCharAtRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports str.charAt(i)', () => {
    test('reports str.charAt(0) — literal index', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 0))
      expect(reports.length).toBe(1)
    })

    test('reports str.charAt(5) — different literal index', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 5))
      expect(reports.length).toBe(1)
    })

    test('reports str.charAt(n) — identifier index', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Identifier', undefined, 'n'))
      expect(reports.length).toBe(1)
    })

    test('message mentions "charAt()"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall())
      expect(reports[0].message).toContain('charAt()')
    })

    test('message contains suggestion for literal index', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 3))
      expect(reports[0].message).toContain('str[3]')
    })

    test('message contains suggestion for identifier index', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Identifier', undefined, 'idx'))
      expect(reports[0].message).toContain('str[idx]')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the original node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = makeCharAtCall()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report has correct location values', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 0, 'i', 7, 3))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('suggestion for literal index includes "Use"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 0))
      expect(reports[0].message).toContain('Use `str[0]`')
    })

    test('suggestion for identifier index includes "Use"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Identifier', undefined, 'n'))
      expect(reports[0].message).toContain('Use `str[n]`')
    })

    test('suggestion for other index type uses generic message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = makeCharAtCall('str', 'BinaryExpression')
      visitor.CallExpression(node)
      expect(reports[0].message.toLowerCase()).toContain('bracket notation')
    })

    test('reports text.charAt(0) — different object name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('text', 'Literal', 0))
      expect(reports.length).toBe(1)
    })

    test('reports name.charAt(index) — identifier index named index', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('name', 'Identifier', undefined, 'index'))
      expect(reports.length).toBe(1)
    })

    test('reports with MemberExpression object — obj.prop.charAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall())
      expect(reports.length).toBe(1)
    })

    test('reports multiple violations accumulating', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('s1', 'Literal', 0))
      visitor.CallExpression(makeCharAtCall('s2', 'Literal', 1))
      visitor.CallExpression(makeCharAtCall('s3', 'Literal', 2))
      expect(reports.length).toBe(3)
    })

    test('suggestion for other index type mentions concise', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = makeCharAtCall('str', 'BinaryExpression')
      visitor.CallExpression(node)
      expect(reports[0].message.toLowerCase()).toContain('concise')
    })

    test('reports str.charAt(0) with literal index 0 in suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 0))
      expect(reports[0].message).toContain('str[0]')
      expect(reports[0].message).toContain('str.charAt(0)')
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report str[0] — bracket notation, not charAt', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'str' },
        property: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report str.charAt() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report str.charAt(a, b) — too many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report computed member call — str["charAt"](0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier — str.["charAt"](0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'charAt' },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — no type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report Literal alone — not a call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 42 })
      expect(reports.length).toBe(0)
    })

    test('does not report arr.push(1) — wrong property name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report str.slice(0) — wrong property name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report str.substring(0) — wrong property name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'substring' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a Literal (not Identifier/MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression (not Identifier/MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getString' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "index" instead of "charAt"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'index' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "charCodeAt"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report str.charAt(undefined arg) — null index arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report str.toString() — wrong property, no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report str.charAt with string literal index — non-number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 'not a number' }],
        loc: makeLoc(1, 0, 1, 22),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('bracket notation')
    })

    test('does not report when object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report str.indexOf("a") — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        arguments: [{ type: 'Literal', value: 'a' }],
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has length 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has length 3', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [
          { type: 'Literal', value: 0 },
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
        ],
        loc: makeLoc(1, 0, 1, 22),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report str.trim() — wrong method, no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trim' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report str.toUpperCase() — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toUpperCase' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = preferStringCharAtRule.create(ctx1)
      const visitor2 = preferStringCharAtRule.create(ctx2)

      visitor1.CallExpression(makeCharAtCall())
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 13),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('s1', 'Literal', 0))
      visitor.CallExpression(makeCharAtCall('s2', 'Literal', 1))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = makeCharAtCall()
      delete (node as Record<string, unknown>).loc
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('s1', 'Literal', 0))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(2, 0, 2, 13),
      })
      visitor.CallExpression(makeCharAtCall('s3', 'Literal', 2))
      expect(reports.length).toBe(2)
    })

    test('reports when object is MemberExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'nested' },
          },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 22),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report when object is ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 0, 'i', 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferStringCharAtRule.create(context)
      const visitor2 = preferStringCharAtRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('reports correctly for deeply nested MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'a' },
              property: { type: 'Identifier', name: 'b' },
            },
            property: { type: 'Identifier', name: 'c' },
          },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall())
      visitor.CallExpression(makeCharAtCall())
      visitor.CallExpression(makeCharAtCall())
      expect(reports.length).toBe(3)
    })

    test('does not report when object type is ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'flag' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with missing callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with missing property on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = makeCharAtCall()
      delete (node as Record<string, unknown>).loc
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports with MemberExpression object — this.data.charAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'this' },
            property: { type: 'Identifier', name: 'data' },
          },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 22),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('message for BinaryExpression index is generic bracket notation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = makeCharAtCall('str', 'BinaryExpression')
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('bracket notation')
    })

    test('message for UnaryExpression index is generic bracket notation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = makeCharAtCall('str', 'UnaryExpression')
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('bracket notation')
    })

    test('message for CallExpression index is generic bracket notation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = makeCharAtCall('str', 'CallExpression')
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('bracket notation')
    })

    test('meta is deeply equal across multiple accesses', () => {
      const meta1 = preferStringCharAtRule.meta
      const meta2 = preferStringCharAtRule.meta
      expect(meta1).toBe(meta2)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('s1', 'Literal', 0))
      visitor.CallExpression(makeCharAtCall('s2', 'Literal', 1))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('charAt()')
      expect(reports[1].message).toContain('charAt()')
    })

    test('chained calls: str.charAt(0).toString() does not report toString', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const toStringNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'str' },
              property: { type: 'Identifier', name: 'charAt' },
            },
            arguments: [{ type: 'Literal', value: 0 }],
          },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 24),
      }
      visitor.CallExpression(toStringNode)
      expect(reports.length).toBe(0)
    })

    test('reports chained charAt calls correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 0))
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 1))
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 2))
      expect(reports.length).toBe(3)
    })

    test('all violation messages contain "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('a', 'Literal', 0))
      visitor.CallExpression(makeCharAtCall('b', 'Identifier', undefined, 'i'))
      visitor.CallExpression(makeCharAtCall('c', 'BinaryExpression'))
      const messages = reports.map(r => r.message)
      expect(messages.every(m => m.includes('Unexpected'))).toBe(true)
    })

    test('nested member expression object reports with correct suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Identifier', name: 'idx' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('str[idx]')
    })

    test('reports with large literal index value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 999))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('str[999]')
    })

    test('does not report when index arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('reports with negative literal index', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Literal', -1))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('str[-1]')
    })

    test('reports with float literal index', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('str', 'Literal', 1.5))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('str[1.5]')
    })

    test('suggestion for string literal index uses generic message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: '0' }],
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('bracket notation')
    })

    test('reports with zero literal index in suggestion message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      visitor.CallExpression(makeCharAtCall('text', 'Literal', 0))
      expect(reports[0].message).toContain('str[0]')
      expect(reports[0].message).toContain('str.charAt(0)')
    })

    test('reports correctly for MemberExpression object with literal index', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringCharAtRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'data' },
            property: { type: 'Identifier', name: 'items' },
          },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'Literal', value: 3 }],
        loc: makeLoc(5, 2, 5, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('str[3]')
      expect(reports[0].loc?.start.line).toBe(5)
    })
  })
})
