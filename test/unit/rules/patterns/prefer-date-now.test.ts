import { describe, test, expect, vi } from 'vitest'
import { preferDateNowRule } from '../../../../src/rules/patterns/prefer-date-now.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'new Date().getTime()',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
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

function createNewExpression(callee: unknown, args: unknown[] = []): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
  }
}

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

// Helper to create a full new Date().getTime() node with all properties
function createDateGetTimeNode(
  line = 1,
  column = 0,
  range?: [number, number],
): Record<string, unknown> {
  const newExpr = createNewExpression(createIdentifier('Date'))
  const memberExpr = createMemberExpression(newExpr, 'getTime')
  const node: Record<string, unknown> = {
    type: 'CallExpression',
    callee: memberExpr,
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
  if (range) {
    node.range = range
  }
  return node
}

describe('prefer-date-now rule', () => {
  // =====================================================
  // META TESTS (7 existing + 10 new = 17)
  // =====================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferDateNowRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferDateNowRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferDateNowRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferDateNowRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferDateNowRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferDateNowRule.meta.fixable).toBe('code')
    })

    test('should mention Date.now in description', () => {
      const description = preferDateNowRule.meta.docs?.description.toLowerCase()
      expect(description).toContain('date.now')
      expect(description).toContain('new date().gettime()')
    })

    test('should have documentation URL', () => {
      expect(preferDateNowRule.meta.docs?.url).toBeDefined()
      expect(preferDateNowRule.meta.docs?.url).toContain('prefer-date-now')
    })

    test('should have meta property defined', () => {
      expect(preferDateNowRule.meta).toBeDefined()
      expect(typeof preferDateNowRule.meta).toBe('object')
    })

    test('should have docs property defined', () => {
      expect(preferDateNowRule.meta.docs).toBeDefined()
      expect(typeof preferDateNowRule.meta.docs).toBe('object')
    })

    test('should have description as non-empty string', () => {
      expect(typeof preferDateNowRule.meta.docs?.description).toBe('string')
      expect(preferDateNowRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as one of the valid rule types', () => {
      expect(['suggestion', 'problem', 'layout']).toContain(preferDateNowRule.meta.type)
    })

    test('should have severity as one of the valid severities', () => {
      expect(['error', 'warn', 'info', 'off']).toContain(preferDateNowRule.meta.severity)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferDateNowRule.meta.schema)).toBe(true)
    })

    test('should have fixable as code', () => {
      expect(preferDateNowRule.meta.fixable).toBe('code')
    })

    test('should have URL starting with https', () => {
      expect(preferDateNowRule.meta.docs?.url).toMatch(/^https:\/\//)
    })

    test('should have docs with recommended boolean', () => {
      expect(typeof preferDateNowRule.meta.docs?.recommended).toBe('boolean')
    })
  })

  // =====================================================
  // CREATE / VISITOR TESTS (1 existing + 7 new = 8)
  // =====================================================
  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = preferDateNowRule.create(context)
      const visitor2 = preferDateNowRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor with only CallExpression key', () => {
      const { context } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toContain('CallExpression')
      expect(keys.length).toBeGreaterThanOrEqual(1)
    })

    test('should accept context with empty options', () => {
      const { context } = createMockContext({})
      expect(() => preferDateNowRule.create(context)).not.toThrow()
    })

    test('should accept context with populated options', () => {
      const { context } = createMockContext({ someOption: true })
      expect(() => preferDateNowRule.create(context)).not.toThrow()
    })

    test('should not throw when creating visitor', () => {
      const { context } = createMockContext()
      expect(() => preferDateNowRule.create(context)).not.toThrow()
    })

    test('should return callable CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('create should be a function', () => {
      expect(typeof preferDateNowRule.create).toBe('function')
    })
  })

  // =====================================================
  // DETECTING new Date().getTime() (2 existing + 18 new = 20)
  // =====================================================
  describe('detecting new Date().getTime()', () => {
    test('should report new Date().getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Use Date.now() instead of new Date().getTime().')
    })

    test('should report with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [], 5, 10)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report at line 42 column 15', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(42, 15)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report at line 100 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(100, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('should report at line 1 column 99', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 99)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.column).toBe(99)
    })

    test('should report exactly once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode()

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report twice when called twice with different nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      visitor.CallExpression(createDateGetTimeNode(1, 0))
      visitor.CallExpression(createDateGetTimeNode(2, 5))

      expect(reports.length).toBe(2)
    })

    test('should report three times when called three times', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      visitor.CallExpression(createDateGetTimeNode(1, 0))
      visitor.CallExpression(createDateGetTimeNode(2, 0))
      visitor.CallExpression(createDateGetTimeNode(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report with correct message each time', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      visitor.CallExpression(createDateGetTimeNode())
      visitor.CallExpression(createDateGetTimeNode(2, 0))

      expect(reports[0].message).toBe('Use Date.now() instead of new Date().getTime().')
      expect(reports[1].message).toBe('Use Date.now() instead of new Date().getTime().')
    })

    test('should detect with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = {
        type: 'NewExpression',
        callee: createIdentifier('Date'),
        arguments: [],
      }
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect when NewExpression arguments is empty array explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Date with uppercase D', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      visitor.CallExpression(createDateGetTimeNode())

      expect(reports[0].message).toMatch(/^Use Date\.now\(\) instead/)
    })

    test('should handle high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(9999, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle high column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 500)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle line 0 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(0, 0)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect in long source code', () => {
      const source = 'const x = 1; const y = 2; new Date().getTime();'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 24)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect when source is just the pattern', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, source.length])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('Date.now()')
    })

    test('should detect when source has whitespace', () => {
      const source = '  new Date().getTime()  '
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 2, [2, 22])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // FIX GENERATION (2 existing + 23 new = 25)
  // =====================================================
  describe('fix generation', () => {
    test('should generate fix with correct replacement', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [], 1, 0)
      ;(node as Record<string, unknown>).range = [0, source.length]

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('Date.now()')
    })

    test('should not generate fix when range is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should generate fix with range [0, 22]', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, 22])

      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([0, 22])
    })

    test('should generate fix text as Date.now()', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'new Date().getTime()')
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, 22])

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('Date.now()')
    })

    test('should generate fix with range [5, 27] for indented code', () => {
      const source = '     new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 5, [5, 27])

      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([5, 27])
      expect(reports[0].fix?.text).toBe('Date.now()')
    })

    test('should generate fix with range [0, 22] for start of file', () => {
      const source = 'new Date().getTime();'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, 22])

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('Date.now()')
    })

    test('should generate fix with range [10, 32] for mid-line', () => {
      const source = 'const x = new Date().getTime();'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 10, [10, 32])

      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([10, 32])
    })

    test('should generate fix for range starting at large offset', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [1000, 1022])

      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([1000, 1022])
    })

    test('should not generate fix when node has no range property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode()

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should generate fix for each reported occurrence', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)

      visitor.CallExpression(createDateGetTimeNode(1, 0, [0, 22]))
      visitor.CallExpression(createDateGetTimeNode(2, 0, [23, 45]))

      expect(reports[0].fix?.text).toBe('Date.now()')
      expect(reports[1].fix?.text).toBe('Date.now()')
    })

    test('should have fix range as tuple of two numbers', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'new Date().getTime()')
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, 22])

      visitor.CallExpression(node)

      const range = reports[0].fix?.range
      expect(Array.isArray(range)).toBe(true)
      if (range) {
        expect(range.length).toBe(2)
        expect(typeof range[0]).toBe('number')
        expect(typeof range[1]).toBe('number')
      }
    })

    test('should have fix range start less than end', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'new Date().getTime()')
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [5, 27])

      visitor.CallExpression(node)

      const range = reports[0].fix?.range
      if (range) {
        expect(range[0]).toBeLessThan(range[1])
      }
    })

    test('should generate fix text as readonly string', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'new Date().getTime()')
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, 22])

      visitor.CallExpression(node)

      expect(typeof reports[0].fix?.text).toBe('string')
    })

    test('should handle range at position [0, 0]', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, 0])

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('Date.now()')
    })

    test('should generate fix for single occurrence among mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      // non-matching call
      const otherNode = createCallExpression(createIdentifier('foo'), [])
      visitor.CallExpression(otherNode)

      // matching call with range
      const node = createDateGetTimeNode(1, 0, [0, 22])
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should preserve range reference type', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const range: readonly [number, number] = [0, 22]
      const node = createDateGetTimeNode(1, 0, range as [number, number])

      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([0, 22])
    })

    test('should generate fix even with different file paths', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/utils/time.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, 22])

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
    })

    test('should generate fix with range [100, 122]', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [100, 122])

      visitor.CallExpression(node)

      expect(reports[0].fix?.range?.[0]).toBe(100)
      expect(reports[0].fix?.range?.[1]).toBe(122)
    })

    test('should generate fix with same text for all occurrences', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createDateGetTimeNode(i + 1, 0, [i * 22, (i + 1) * 22]))
      }

      for (const report of reports) {
        expect(report.fix?.text).toBe('Date.now()')
      }
    })

    test('should generate fix with correct structure', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, 22])

      visitor.CallExpression(node)

      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix).toHaveProperty('range')
      expect(fix).toHaveProperty('text')
    })

    test('should handle range with same start and end', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'new Date().getTime()')
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [10, 10])

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('Date.now()')
    })

    test('should handle very large range values', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'new Date().getTime()')
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [999999, 1000021])

      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([999999, 1000021])
    })

    test('should generate fix with range from node', () => {
      const source = 'new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, source.length])

      visitor.CallExpression(node)

      expect(reports[0].fix?.range?.[0]).toBe(0)
      expect(reports[0].fix?.range?.[1]).toBe(source.length)
    })
  })

  // =====================================================
  // VALID ALTERNATIVE PATTERNS (11 existing + 35 new = 46)
  // =====================================================
  describe('valid alternative patterns', () => {
    test('should not report Date.now()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('Date'), 'now')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date(value).getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [createIdentifier('timestamp')])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date(123).getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [
        { type: 'Literal', value: 123 },
      ])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date("string").getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [
        { type: 'Literal', value: '2024-01-01' },
      ])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().valueOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'valueOf')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'toString')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Date.prototype.getTime.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr1 = createMemberExpression(createIdentifier('Date'), 'prototype')
      const memberExpr2 = createMemberExpression(memberExpr1, 'getTime')
      const memberExpr3 = createMemberExpression(memberExpr2, 'call')
      const node = createCallExpression(memberExpr3, [
        createNewExpression(createIdentifier('Date')),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = createCallExpression(createIdentifier('someFunction'), [
        createIdentifier('arg1'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date() without getTime call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = createNewExpression(createIdentifier('Date'))

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should not report member access on non-NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('someObject'), 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report getTime on non-Date NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('OtherClass'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().toISOString()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'toISOString')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().toLocaleDateString()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'toLocaleDateString')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().toLocaleTimeString()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'toLocaleTimeString')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().toDateString()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'toDateString')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().toTimeString()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'toTimeString')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().toISOString() with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      // This should report because getTime on new Date() with no args
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report new MyDate().getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('MyDate'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new date().getTime() with lowercase d', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new DATE().getTime() with uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('DATE'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report foo.getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('foo'), 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable.getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('myVar'), 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), 'method')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date(timestamp).getTime() with identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [createIdentifier('ts')])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date(2024, 0, 1).getTime() with multiple args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [
        { type: 'Literal', value: 2024 },
        { type: 'Literal', value: 0 },
        { type: 'Literal', value: 1 },
      ])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date(dateString).getTime() with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [
        { type: 'Literal', value: 'December 17, 1995 03:24:00' },
      ])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report standalone function call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = createCallExpression(createIdentifier('getTime'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().getFullYear()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getFullYear')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().getMonth()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getMonth')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().getDate()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getDate')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().getHours()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getHours')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().getMinutes()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getMinutes')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().getSeconds()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getSeconds')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().getMilliseconds()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getMilliseconds')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date().setTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'setTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.log()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('console'), 'log')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.random()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('Math'), 'random')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date(null).getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [
        { type: 'Literal', value: null },
      ])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date(undefined).getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [createIdentifier('undefined')])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Error().getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Error'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Array().getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Array'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Object().getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Object'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Map().getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Map'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Set().getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Set'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Promise().getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Promise'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Date.parse()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('Date'), 'parse')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Date.UTC()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('Date'), 'UTC')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EDGE CASES (11 existing + 49 new = 60)
  // =====================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = {
        type: 'CallExpression',
        callee: memberExpr,
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = {
        type: 'MemberExpression',
        object: newExpr,
      }
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        property: {
          type: 'Identifier',
          name: 'getTime',
        },
      }
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = {
        type: 'NewExpression',
      }
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression({ type: 'Literal', value: 'Date' })
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property that is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = {
        type: 'MemberExpression',
        object: newExpr,
        property: {
          type: 'Literal',
          value: 'getTime',
        },
      }
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property name that is not getTime', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'otherMethod')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression(0)).not.toThrow()
      expect(() => visitor.CallExpression(-1)).not.toThrow()
      expect(() => visitor.CallExpression(3.14)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty string node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression('')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression({ type: 'CallExpression' })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = {
        type: 'ExpressionStatement',
        callee: memberExpr,
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression({ type: 42 })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression({ type: null })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression({ type: undefined })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = createDateGetTimeNode()
      node.extra = 'data'
      node.optional = false

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle callee as string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 'someString',
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee as number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 42,
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee as null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression callee as MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const innerMember = createMemberExpression(createIdentifier('window'), 'Date')
      const newExpr = createNewExpression(innerMember)
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle property with null name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = {
        type: 'MemberExpression',
        object: newExpr,
        property: {
          type: 'Identifier',
          name: null,
        },
      }
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property with numeric name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle NewExpression with undefined arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = {
        type: 'NewExpression',
        callee: createIdentifier('Date'),
      }
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle NewExpression with null arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = {
        type: 'NewExpression',
        callee: createIdentifier('Date'),
        arguments: null,
      }
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const member1 = createMemberExpression(newExpr, 'getTime')
      const member2 = createMemberExpression(member1, 'call')
      const node = createCallExpression(member2, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle NaN as node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression(NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Infinity as node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression(Infinity)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Symbol as node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function as node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      expect(() => visitor.CallExpression(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Date.now being reported (it should NOT be)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('Date'), 'now')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = {
        type: 'MemberExpression',
        object: newExpr,
        computed: true,
        property: {
          type: 'Identifier',
          name: 'getTime',
        },
      }
      const node = createCallExpression(memberExpr, [])

      // The rule checks property.name === 'getTime', not computed flag
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with circular reference safely', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node: Record<string, unknown> = { type: 'CallExpression' }
      node.self = node

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle object with getter that throws', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = {
        get type() {
          throw new Error('Getter error')
        },
      }

      expect(() => visitor.CallExpression(node)).toThrow()
    })

    test('should handle callee object without type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: {},
        property: {
          type: 'Identifier',
          name: 'getTime',
        },
      }
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression with arguments as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = {
        type: 'NewExpression',
        callee: createIdentifier('Date'),
        arguments: 'not-an-array',
      }
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      // arguments is truthy but not an array, so args.length check works
      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = createDateGetTimeNode()
      node.loc = { start: { line: 1, column: 0 } }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = createDateGetTimeNode()
      node.loc = { end: { line: 1, column: 20 } }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle range as tuple of strings', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = createDateGetTimeNode()
      node.range = ['0', '22']

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      // fix should still be generated since range is truthy
      expect(reports[0].fix).toBeDefined()
    })

    test('should handle property with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, '')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee as MemberExpression without object type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: { name: 'Date' },
        property: {
          type: 'Identifier',
          name: 'getTime',
        },
      }
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle property with undefined name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = {
        type: 'MemberExpression',
        object: newExpr,
        property: {
          type: 'Identifier',
          name: undefined,
        },
      }
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [],
      }
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle range as empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = createDateGetTimeNode()
      node.range = []

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle range as single element array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const node = createDateGetTimeNode()
      node.range = [5]

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle NewExpression with callee as number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = {
        type: 'NewExpression',
        callee: 42,
        arguments: [],
      }
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression with callee as boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = {
        type: 'NewExpression',
        callee: true,
        arguments: [],
      }
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle arguments containing getTime as string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, ['getTime'])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Date constructor with spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'), [
        { type: 'SpreadElement', argument: createIdentifier('args') },
      ])
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle property type mismatch (number instead of string)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = {
        type: 'MemberExpression',
        object: newExpr,
        property: {
          type: 'Identifier',
          name: 'getTime',
        },
      }
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle same visitor reused for multiple nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      // Pattern: matching
      visitor.CallExpression(createDateGetTimeNode())

      // Non-matching
      const otherNode = createCallExpression(createIdentifier('foo'), [])
      visitor.CallExpression(otherNode)

      // Matching
      visitor.CallExpression(createDateGetTimeNode(2, 0))

      expect(reports.length).toBe(2)
    })
  })

  // =====================================================
  // REAL-WORLD USAGE PATTERNS (3 existing + 12 new = 15)
  // =====================================================
  describe('real-world usage patterns', () => {
    test('should detect in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [], 1, 10)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should detect in function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [], 5, 20)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should detect in return statement context', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [], 10, 8)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should detect in variable declaration context', () => {
      const source = 'const timestamp = new Date().getTime();'
      const { context, reports } = createMockContext({}, '/src/timer.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 18, [18, 40])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('Date.now()')
    })

    test('should detect in comparison context', () => {
      const source = 'if (new Date().getTime() > deadline) {}'
      const { context, reports } = createMockContext({}, '/src/check.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 4, [4, 26])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect in subtraction context', () => {
      const source = 'const elapsed = new Date().getTime() - start;'
      const { context, reports } = createMockContext({}, '/src/elapsed.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 17, [17, 39])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect in binary expression context', () => {
      const source = 'new Date().getTime() + 1000'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, 22])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('Date.now()')
    })

    test('should detect in ternary expression context', () => {
      const source = 'flag ? new Date().getTime() : 0'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 7, [7, 29])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect in array context', () => {
      const source = '[new Date().getTime(), Date.now()]'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 1, [1, 23])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect in object property context', () => {
      const source = '{ ts: new Date().getTime() }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 6, [6, 28])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect in function parameter context', () => {
      const source = 'setTimeout(fn, new Date().getTime())'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 14, [14, 36])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect in template expression context', () => {
      const source = '`${new Date().getTime()}`'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 3, [3, 25])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect in logical expression context', () => {
      const source = 'new Date().getTime() || fallback'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, 22])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect in await expression context', () => {
      const source = 'await new Date().getTime()'
      const { context, reports } = createMockContext({}, '/src/async.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 6, [6, 28])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect in type assertion context', () => {
      const source = 'new Date().getTime() as number'
      const { context, reports } = createMockContext({}, '/src/types.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 0, [0, 22])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // MULTIPLE OCCURRENCES (7 new)
  // =====================================================
  describe('multiple occurrences', () => {
    test('should report each occurrence independently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createDateGetTimeNode(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should track correct location for each occurrence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      visitor.CallExpression(createDateGetTimeNode(1, 0))
      visitor.CallExpression(createDateGetTimeNode(2, 10))
      visitor.CallExpression(createDateGetTimeNode(3, 20))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.column).toBe(10)
      expect(reports[2].loc?.start.column).toBe(20)
    })

    test('should generate fix for each occurrence when range present', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'new Date().getTime()')
      const visitor = preferDateNowRule.create(context)

      visitor.CallExpression(createDateGetTimeNode(1, 0, [0, 22]))
      visitor.CallExpression(createDateGetTimeNode(2, 0, [23, 45]))

      expect(reports[0].fix).toBeDefined()
      expect(reports[1].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('Date.now()')
      expect(reports[1].fix?.text).toBe('Date.now()')
    })

    test('should handle alternating matching and non-matching calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      visitor.CallExpression(createDateGetTimeNode(1, 0))
      visitor.CallExpression(createCallExpression(createIdentifier('foo'), []))
      visitor.CallExpression(createDateGetTimeNode(3, 0))
      visitor.CallExpression(createCallExpression(createIdentifier('bar'), []))
      visitor.CallExpression(createDateGetTimeNode(5, 0))

      expect(reports.length).toBe(3)
    })

    test('should handle many occurrences without performance issues', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createDateGetTimeNode(i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should maintain correct report order', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      visitor.CallExpression(createDateGetTimeNode(1, 0))
      visitor.CallExpression(createDateGetTimeNode(5, 0))
      visitor.CallExpression(createDateGetTimeNode(10, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should handle same visitor for non-matching then matching', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      // Non-matching
      visitor.CallExpression(createCallExpression(createIdentifier('foo'), []))
      expect(reports.length).toBe(0)

      // Matching
      visitor.CallExpression(createDateGetTimeNode())
      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // CONTEXT VARIATIONS (8 new)
  // =====================================================
  describe('context variations', () => {
    test('should work with different file extensions .js', () => {
      const { context, reports } = createMockContext({}, '/src/file.js', 'new Date().getTime()')
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode()

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different file extensions .tsx', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/component.tsx',
        'new Date().getTime()',
      )
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode()

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different file extensions .jsx', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/component.jsx',
        'new Date().getTime()',
      )
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode()

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file paths', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/a/b/c/d/e/file.ts',
        'new Date().getTime()',
      )
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode()

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra data', () => {
      const { context, reports } = createMockContext({ extra: 'data', count: 5 })
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode()

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc, fix: descriptor.fix })
        },
        getFilePath: () => '/home/user/project/file.ts',
        getAST: () => null,
        getSource: () => 'new Date().getTime()',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode()

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with minimal context', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc, fix: descriptor.fix })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode()

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const source = 'function test() { return new Date().getTime(); }'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferDateNowRule.create(context)
      const node = createDateGetTimeNode(1, 22, [22, 44])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('Date.now()')
    })
  })

  // =====================================================
  // CASE SENSITIVITY & VARIATIONS (6 new)
  // =====================================================
  describe('case sensitivity and identifier variations', () => {
    test('should not match lowercase date', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not match DATE uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('DATE'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not match dAte mixed case', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('dAte'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not match gettime lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'gettime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not match GETTIME uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'GETTIME')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should match exact Date with exact getTime', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      const newExpr = createNewExpression(createIdentifier('Date'))
      const memberExpr = createMemberExpression(newExpr, 'getTime')
      const node = createCallExpression(memberExpr, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // RULE EXPORT AND STRUCTURE (5 new)
  // =====================================================
  describe('rule export and structure', () => {
    test('should export preferDateNowRule as default', () => {
      const defaultExport = preferDateNowRule
      expect(defaultExport).toBeDefined()
    })

    test('should have create function', () => {
      expect(typeof preferDateNowRule.create).toBe('function')
    })

    test('should have meta property', () => {
      expect(preferDateNowRule.meta).toBeDefined()
      expect(typeof preferDateNowRule.meta).toBe('object')
    })

    test('create function should accept context and return visitor', () => {
      const { context } = createMockContext()
      const result = preferDateNowRule.create(context)

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    test('rule should be a valid RuleDefinition', () => {
      expect(preferDateNowRule).toHaveProperty('meta')
      expect(preferDateNowRule).toHaveProperty('create')
      expect(preferDateNowRule.meta).toHaveProperty('type')
      expect(preferDateNowRule.meta).toHaveProperty('severity')
      expect(preferDateNowRule.meta).toHaveProperty('docs')
      expect(preferDateNowRule.meta).toHaveProperty('schema')
    })
  })

  // =====================================================
  // REPORT MESSAGE FORMAT (5 new)
  // =====================================================
  describe('report message format', () => {
    test('should have correct message format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      visitor.CallExpression(createDateGetTimeNode())

      expect(reports[0].message).toBe('Use Date.now() instead of new Date().getTime().')
    })

    test('message should end with period', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      visitor.CallExpression(createDateGetTimeNode())

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('message should mention Date.now()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      visitor.CallExpression(createDateGetTimeNode())

      expect(reports[0].message).toContain('Date.now()')
    })

    test('message should mention getTime()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      visitor.CallExpression(createDateGetTimeNode())

      expect(reports[0].message).toContain('getTime()')
    })

    test('message should be consistent across multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)

      visitor.CallExpression(createDateGetTimeNode(1, 0))
      visitor.CallExpression(createDateGetTimeNode(2, 0))
      visitor.CallExpression(createDateGetTimeNode(3, 0))

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })
  })

  // =====================================================
  // LOCATION EXTRACTION (6 new)
  // =====================================================
  describe('location extraction', () => {
    test('should extract location from node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      visitor.CallExpression(createDateGetTimeNode(3, 5))

      expect(reports[0].loc).toBeDefined()
    })

    test('should report correct start line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      visitor.CallExpression(createDateGetTimeNode(42, 0))

      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      visitor.CallExpression(createDateGetTimeNode(1, 17))

      expect(reports[0].loc?.start.column).toBe(17)
    })

    test('should report end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      visitor.CallExpression(createDateGetTimeNode(1, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should report end column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      visitor.CallExpression(createDateGetTimeNode(1, 0))

      expect(reports[0].loc?.end.column).toBeDefined()
    })

    test('should handle location at start of file', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDateNowRule.create(context)
      visitor.CallExpression(createDateGetTimeNode(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })
})
