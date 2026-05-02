import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringLocaleCompareSameRule } from '../../../../src/rules/patterns/no-unnecessary-string-locale-compare-same.js'
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

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-locale-compare-same rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringLocaleCompareSameRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringLocaleCompareSameRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringLocaleCompareSameRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringLocaleCompareSameRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringLocaleCompareSameRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning localeCompare', () => {
      const desc = noUnnecessaryStringLocaleCompareSameRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/localecompare/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringLocaleCompareSameRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-locale-compare-same.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringLocaleCompareSameRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringLocaleCompareSameRule).toBeDefined()
      expect(noUnnecessaryStringLocaleCompareSameRule.meta).toBeDefined()
      expect(noUnnecessaryStringLocaleCompareSameRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (27) =====

  describe('positive cases — reports unnecessary localeCompare same', () => {
    test('reports for str.localeCompare(str)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')]))
      expect(reports.length).toBe(1)
    })

    test('reports for a.localeCompare(a)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('a'), 'localeCompare', [makeIdentifier('a')]))
      expect(reports.length).toBe(1)
    })

    test('reports for myVar.localeCompare(myVar)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('myVar'), 'localeCompare', [makeIdentifier('myVar')]))
      expect(reports.length).toBe(1)
    })

    test('reports for foo.localeCompare(foo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('foo'), 'localeCompare', [makeIdentifier('foo')]))
      expect(reports.length).toBe(1)
    })

    test('reports for name.localeCompare(name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('name'), 'localeCompare', [makeIdentifier('name')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions localeCompare', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')]))
      expect(reports[0].message).toMatch(/localeCompare/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')]))
      expect(reports[0].message).toBe(
        'str.localeCompare(str) always returns 0. Use direct comparison (str === str) if needed.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      const node = makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('x'), 'localeCompare', [makeIdentifier('x')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('a'), 'localeCompare', [makeIdentifier('a')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('a'), 'localeCompare', [makeIdentifier('a')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for single-character identifier a.localeCompare(a)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('a'), 'localeCompare', [makeIdentifier('a')]))
      expect(reports.length).toBe(1)
    })

    test('reports for long identifier veryLongVariableName.localeCompare(veryLongVariableName)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('veryLongVariableName'), 'localeCompare', [makeIdentifier('veryLongVariableName')]))
      expect(reports.length).toBe(1)
    })

    test('reports for underscore identifier _str.localeCompare(_str)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('_str'), 'localeCompare', [makeIdentifier('_str')]))
      expect(reports.length).toBe(1)
    })

    test('reports for dollar identifier $str.localeCompare($str)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('$str'), 'localeCompare', [makeIdentifier('$str')]))
      expect(reports.length).toBe(1)
    })

    test('reports for result.localeCompare(result)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('result'), 'localeCompare', [makeIdentifier('result')]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('s'), 'localeCompare', [makeIdentifier('s')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for input.localeCompare(input)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('input'), 'localeCompare', [makeIdentifier('input')]))
      expect(reports.length).toBe(1)
    })

    test('reports for text.localeCompare(text)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('text'), 'localeCompare', [makeIdentifier('text')]))
      expect(reports.length).toBe(1)
    })

    test('reports for value.localeCompare(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('value'), 'localeCompare', [makeIdentifier('value')]))
      expect(reports.length).toBe(1)
    })

    test('reports for label.localeCompare(label)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('label'), 'localeCompare', [makeIdentifier('label')]))
      expect(reports.length).toBe(1)
    })

    test('reports for key.localeCompare(key)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('key'), 'localeCompare', [makeIdentifier('key')]))
      expect(reports.length).toBe(1)
    })

    test('reports for item.localeCompare(item)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('item'), 'localeCompare', [makeIdentifier('item')]))
      expect(reports.length).toBe(1)
    })

    test('reports for title.localeCompare(title)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('title'), 'localeCompare', [makeIdentifier('title')]))
      expect(reports.length).toBe(1)
    })

    test('reports for desc.localeCompare(desc)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('desc'), 'localeCompare', [makeIdentifier('desc')]))
      expect(reports.length).toBe(1)
    })

    test('reports for word.localeCompare(word)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('word'), 'localeCompare', [makeIdentifier('word')]))
      expect(reports.length).toBe(1)
    })


  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for a.localeCompare(b) — different variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('a'), 'localeCompare', [makeIdentifier('b')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare(other) — different variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('other')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare(str, "en") — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str'), { type: 'Literal', value: 'en' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare(str, "en", { sensitivity: "base" }) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str'), { type: 'Literal', value: 'en' }, { type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.compareTo(str) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'compareTo', [makeIdentifier('str')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localecompare(str) — lowercase method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localecompare', [makeIdentifier('str')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".localeCompare(str) — receiver is literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'localeCompare', [makeIdentifier('str')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare("hello") — arg is string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare("str") — arg is string literal not identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [{ type: 'Literal', value: 'str' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare(123) — arg is number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [{ type: 'Literal', value: 123 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare(null) — arg is null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeIdentifier('str')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeIdentifier('str')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeIdentifier('str')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Literal', value: 'localeCompare' },
        },
        arguments: [makeIdentifier('str')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "indexOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'indexOf', [makeIdentifier('str')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "compare"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'compare', [makeIdentifier('str')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'localeCompare', [makeIdentifier('str')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'localeCompare', [makeIdentifier('str')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeIdentifier('str')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeIdentifier('str')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
        },
        arguments: [makeIdentifier('str')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: null,
        },
        arguments: [makeIdentifier('str')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.str.localeCompare(obj.str) — object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      const memberExpr = { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }
      visitor.CallExpression(makeCallNode(memberExpr, 'localeCompare', [memberExpr]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringLocaleCompareSameRule.create(ctx1)
      const visitor2 = noUnnecessaryStringLocaleCompareSameRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')]))
      visitor2.CallExpression(makeCallNode(makeIdentifier('a'), 'localeCompare', [makeIdentifier('b')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('a'), 'localeCompare', [makeIdentifier('b')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('x'), 'localeCompare', [makeIdentifier('x')]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeIdentifier('str')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeIdentifier('str')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('a'), 'localeCompare', [makeIdentifier('b')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'localeCompare', [makeIdentifier('str')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('x'), 'localeCompare', [makeIdentifier('x')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('foo'), 'localeCompare', [makeIdentifier('bar')]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringLocaleCompareSameRule.create(context)
      const visitor2 = noUnnecessaryStringLocaleCompareSameRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringLocaleCompareSameRule.meta
      const meta2 = noUnnecessaryStringLocaleCompareSameRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeIdentifier('str')],
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
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('s'),
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeIdentifier('s')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('s'),
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeIdentifier('s')],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      const node = makeCallNode(makeIdentifier('str'), 'localeCompare', [makeIdentifier('str')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringLocaleCompareSameRule).toBeDefined()
      expect(typeof noUnnecessaryStringLocaleCompareSameRule.create).toBe('function')
      expect(typeof noUnnecessaryStringLocaleCompareSameRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('s'),
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeIdentifier('s')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('s'), 'localeCompare', [makeIdentifier('s')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Literal', value: 'localeCompare' },
          computed: true,
        },
        arguments: [makeIdentifier('str')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
