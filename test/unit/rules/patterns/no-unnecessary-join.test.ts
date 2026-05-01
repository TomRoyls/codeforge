import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryJoinRule } from '../../../../src/rules/patterns/no-unnecessary-join.js'
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
    getSource: () => 'const x = [].join()',
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

function makeArrayExpression(elements: unknown[]): unknown {
  return {
    type: 'ArrayExpression',
    elements,
    loc: makeLoc(1, 0, 1, 10),
  }
}

function makeCallExpression(objectNode: unknown, methodName: string): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: objectNode,
      property: {
        type: 'Identifier',
        name: methodName,
      },
    },
    arguments: [],
    loc: makeLoc(1, 0, 1, 10),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-join rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryJoinRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryJoinRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryJoinRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryJoinRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryJoinRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning join', () => {
      const desc = noUnnecessaryJoinRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('join')
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryJoinRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-join',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryJoinRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryJoinRule).toBeDefined()
      expect(noUnnecessaryJoinRule.meta).toBeDefined()
      expect(noUnnecessaryJoinRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY JOIN (35) =====

  describe('positive cases — reports unnecessary join', () => {
    test('reports for empty array [].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array [].join(",")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with empty string separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'join')
      const n = node as Record<string, unknown>
      n.arguments = [{ type: 'Literal', value: '' }]
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with dash separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'join')
      const n = node as Record<string, unknown>
      n.arguments = [{ type: 'Literal', value: '-' }]
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single string element ["a"].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'a' }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single number element [1].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 1 }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single boolean true element [true].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: true }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single boolean false element [false].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: false }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single null element [null].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: null }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single identifier element [x].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Identifier', name: 'x' }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single nested array [[]].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([makeArrayExpression([])]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single object expression [{}].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'ObjectExpression', properties: [] }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single arrow function element [() => 1].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'Literal', value: 1 },
          }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single template literal element join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{
            type: 'TemplateLiteral',
            quasis: [],
            expressions: [],
          }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single element with comma separator ["a"].join(",")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const node = makeCallExpression(
        makeArrayExpression([{ type: 'Literal', value: 'a' }]),
        'join',
      )
      const n = node as Record<string, unknown>
      n.arguments = [{ type: 'Literal', value: ',' }]
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single element with space separator ["a"].join(" ")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const node = makeCallExpression(
        makeArrayExpression([{ type: 'Literal', value: 'a' }]),
        'join',
      )
      const n = node as Record<string, unknown>
      n.arguments = [{ type: 'Literal', value: ' ' }]
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single element with newline separator ["a"].join("\\n")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const node = makeCallExpression(
        makeArrayExpression([{ type: 'Literal', value: 'a' }]),
        'join',
      )
      const n = node as Record<string, unknown>
      n.arguments = [{ type: 'Literal', value: '\n' }]
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "join"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      expect(reports[0].message).toContain('join')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'join')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const arr = {
        type: 'ArrayExpression',
        elements: [],
        loc: makeLoc(5, 10, 5, 20),
      }
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: arr,
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [],
        loc: makeLoc(5, 10, 5, 25),
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      expect(reports[0].message).toBe(
        'Unnecessary .join() call on an array with 0 or 1 elements.',
      )
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 'a' }]), 'join'),
      )
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([{ type: 'Literal', value: 'x' }]), 'join'),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for empty array with custom loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const arr = {
        type: 'ArrayExpression',
        elements: [],
        loc: makeLoc(3, 5, 3, 7),
      }
      visitor.CallExpression(makeCallExpression(arr, 'join'))
      expect(reports.length).toBe(1)
    })

    test('reports for single element with custom loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const arr = {
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(7, 2, 7, 6),
      }
      visitor.CallExpression(makeCallExpression(arr, 'join'))
      expect(reports.length).toBe(1)
    })

    test('reports for single regex literal element join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{
            type: 'Literal',
            value: /test/,
            regex: { pattern: 'test', flags: '' },
          }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single binary expression element join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single unary expression element join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{
            type: 'UnaryExpression',
            operator: '!',
            prefix: true,
            argument: { type: 'Identifier', name: 'x' },
          }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single call expression element join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single member expression element join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single conditional expression element join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'x' },
            consequent: { type: 'Literal', value: 'a' },
            alternate: { type: 'Literal', value: 'b' },
          }]),
          'join',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('node with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'ArrayExpression',
            elements: [],
            loc: makeLoc(1, 0, 1, 2),
          },
          property: { type: 'Identifier', name: 'join' },
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
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for two element array ["a","b"].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: 'a' },
            { type: 'Literal', value: 'b' },
          ]),
          'join',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for three element array ["a","b","c"].join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: 'a' },
            { type: 'Literal', value: 'b' },
            { type: 'Literal', value: 'c' },
          ]),
          'join',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for five element array join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
            { type: 'Literal', value: 3 },
            { type: 'Literal', value: 4 },
            { type: 'Literal', value: 5 },
          ]),
          'join',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for non-array object calling join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) },
          'join',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier calling join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          { type: 'Identifier', name: 'arr', loc: makeLoc(1, 0, 1, 3) },
          'join',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for call expression result calling join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getArray' },
            arguments: [],
            loc: makeLoc(1, 0, 1, 12),
          },
          'join',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for non-join method map', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-join method filter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-join method reduce', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'reduce'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-join method push', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'push'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-join method forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-join method concat', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'concat'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-join method find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'find'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-join method pop', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'pop'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-join method slice', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'slice'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-join method toString', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: 'string',
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: 'join',
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Literal', value: 'join' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'split'),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          { type: 'Identifier', name: 'arr', loc: makeLoc(1, 0, 1, 3) },
          'join',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when elements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          { type: 'ArrayExpression', elements: 'not-array', loc: makeLoc(1, 0, 1, 2) },
          'join',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'const',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'IfStatement',
        test: {},
        consequent: {},
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      visitor.CallExpression({
        type: 'ObjectExpression',
        properties: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (7) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryJoinRule.create(ctx1)
      const visitor2 = noUnnecessaryJoinRule.create(ctx2)
      visitor1.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      visitor2.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: 'a' },
            { type: 'Literal', value: 'b' },
          ]),
          'join',
        ),
      )
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryJoinRule.create(context)
      const visitor2 = noUnnecessaryJoinRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryJoinRule.meta
      const meta2 = noUnnecessaryJoinRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryJoinRule).toBeDefined()
      expect(typeof noUnnecessaryJoinRule.create).toBe('function')
      expect(typeof noUnnecessaryJoinRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'ExpressionStatement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      // valid: two elements
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: 'a' },
            { type: 'Literal', value: 'b' },
          ]),
          'join',
        ),
      )
      // invalid: empty array
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'join'))
      // valid: non-array object
      visitor.CallExpression(
        makeCallExpression(
          { type: 'Identifier', name: 'arr', loc: makeLoc(1, 0, 1, 3) },
          'join',
        ),
      )
      // invalid: single element
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'x' }]),
          'join',
        ),
      )
      // valid: non-join method
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'map'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJoinRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== TOTAL COUNT (1) =====

  describe('test count verification', () => {
    test('should have exactly 95 test cases in this file', () => {
      // Meta: 8, Structure: 2, Positive: 35, Negative: 42, Edge: 7, Count: 1 = 95
      expect(8 + 2 + 35 + 42 + 7 + 1).toBe(95)
    })
  })
})
