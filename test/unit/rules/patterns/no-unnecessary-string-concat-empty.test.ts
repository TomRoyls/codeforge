import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringConcatEmptyRule } from '../../../../src/rules/patterns/no-unnecessary-string-concat-empty.js'
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

function makeEmptyStringLiteral(): unknown {
  return { type: 'StringLiteral', value: '' }
}

function makeStringLiteral(value: string): unknown {
  return { type: 'StringLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-concat-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringConcatEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringConcatEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringConcatEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringConcatEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringConcatEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning concat', () => {
      const desc = noUnnecessaryStringConcatEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/concat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringConcatEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-concat-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringConcatEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringConcatEmptyRule).toBeDefined()
      expect(noUnnecessaryStringConcatEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringConcatEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary concat', () => {
    test('reports for \'\'.concat(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(1)
    })

    test('reports for single quotes empty concat', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: '' }, 'concat', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary concat', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports[0].message).toMatch(/concat/)
    })

    test('report message mentions empty strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports[0].message).toMatch(/empty/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports[0].message).toBe(
        `''.concat('') concatenates two empty strings. This is unnecessary.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      const node = makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports when arg is StringLiteral with empty string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: '' }, 'concat', [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports even with whitespace-only empty string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(1)
    })

    test('report end loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()], 2, 5, 2, 22))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('reports when called multiple times in sequence correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      }
      expect(reports.length).toBe(5)
    })

    test('report message is a non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report message starts with empty string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports[0].message).toMatch(/^''/)
    })

    test('report message mentions unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports[0].message).toMatch(/unnecessary/i)
    })

    test('report message mentions concatenates', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports[0].message).toMatch(/concatenates/)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (43) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-empty receiver \'hello\'.concat(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty receiver with non-empty arg \'\'.concat(\'a\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeStringLiteral('a')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable receiver str.concat(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.concat() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.concat(\'a\', \'b\') — 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeStringLiteral('a'), makeStringLiteral('b')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.concat(\'a\', \'b\', \'c\') — 3 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeStringLiteral('a'), makeStringLiteral('b'), makeStringLiteral('c')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.includes(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'includes', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.indexOf(\'\')', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'indexOf', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'slice', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeEmptyStringLiteral()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeEmptyStringLiteral()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeEmptyStringLiteral()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Literal', value: 'concat' },
        },
        arguments: [makeEmptyStringLiteral()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Concat" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'Concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "concat" with computed access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'concat' },
          computed: true,
        },
        arguments: [makeEmptyStringLiteral()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeEmptyStringLiteral()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeEmptyStringLiteral()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
        },
        arguments: [makeEmptyStringLiteral()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: null,
        },
        arguments: [makeEmptyStringLiteral()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is Identifier instead of StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [{ type: 'Identifier', name: 'emptyStr' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getEmpty' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is a NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is a TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is missing (undefined arguments)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: undefined as any,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when receiver is Literal instead of StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "abc".concat("def") — both non-empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('abc'), 'concat', [makeStringLiteral('def')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for " ".concat(\'\') — space is not empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(' '), 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is empty string but non-StringLiteral type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringConcatEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringConcatEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      visitor2.CallExpression(makeCallNode(makeStringLiteral('hello'), 'concat', [makeEmptyStringLiteral()]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'concat', [makeEmptyStringLiteral()]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeEmptyStringLiteral()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeEmptyStringLiteral()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'concat', [makeEmptyStringLiteral()]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'concat', [makeEmptyStringLiteral()]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeStringLiteral('a')]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringConcatEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringConcatEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringConcatEmptyRule.meta
      const meta2 = noUnnecessaryStringConcatEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeEmptyStringLiteral()],
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
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeEmptyStringLiteral()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeEmptyStringLiteral()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      const node = makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringConcatEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringConcatEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringConcatEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [makeEmptyStringLiteral()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Literal', value: 'concat' },
          computed: true,
        },
        arguments: [makeEmptyStringLiteral()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles non-computed member expression correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'concat' },
          computed: false,
        },
        arguments: [makeEmptyStringLiteral()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments array has zero length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when receiver is NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NumericLiteral', value: 0 }, 'concat', [makeEmptyStringLiteral()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg value is a single space', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'concat', [makeStringLiteral(' ')]))
      expect(reports.length).toBe(0)
    })
  })
})
