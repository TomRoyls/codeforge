import { describe, test, expect, vi } from 'vitest'
import { validTitleRule } from '../../../../src/rules/testing/valid-title.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => '',
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

function createTestCallWithTitle(calleeName: string, title: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [
      { type: 'Literal', value: title },
      { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createMemberTestCall(objectName: string, method: string, title: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: method },
    },
    arguments: [
      { type: 'Literal', value: title },
      { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createCallNoStringTitle(calleeName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [
      { type: 'Identifier', name: 'someVariable' },
      { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createCallNoArgs(calleeName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

describe('valid-title rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(validTitleRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(validTitleRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(validTitleRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(validTitleRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema defined', () => {
      expect(validTitleRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning title', () => {
      expect(validTitleRule.meta.docs?.description.toLowerCase()).toContain('title')
    })

    test('should have docs.url property', () => {
      expect(validTitleRule.meta.docs?.url).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = validTitleRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = validTitleRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('valid titles (no reports)', () => {
    test('should not report it() with proper title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'Works correctly'))

      expect(reports.length).toBe(0)
    })

    test('should not report test() with proper title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('test', 'Returns the right value'))

      expect(reports.length).toBe(0)
    })

    test('should not report describe() with proper title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('describe', 'My module'))

      expect(reports.length).toBe(0)
    })

    test('should not report context() with proper title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('context', 'When the user is logged in'))

      expect(reports.length).toBe(0)
    })

    test('should not report suite() with proper title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('suite', 'Authentication flow'))

      expect(reports.length).toBe(0)
    })

    test('should not report title starting with number', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', '404 is returned'))

      expect(reports.length).toBe(0)
    })

    test('should not report title starting with special character', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', '#hashtag works'))

      expect(reports.length).toBe(0)
    })

    test('should not report single uppercase character title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'A'))

      expect(reports.length).toBe(0)
    })
  })

  describe('empty titles', () => {
    test('should report it() with empty title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', ''))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Test title must not be empty')
    })

    test('should report test() with empty title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('test', ''))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Test title must not be empty')
    })

    test('should report describe() with empty title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('describe', ''))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Test title must not be empty')
    })

    test('should report context() with empty title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('context', ''))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Test title must not be empty')
    })
  })

  describe('lowercase start', () => {
    test('should report it() with lowercase start', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'should work correctly'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should start with an uppercase letter')
      expect(reports[0].message).toContain('should work correctly')
    })

    test('should report test() with lowercase start', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('test', 'has the right value'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should start with an uppercase letter')
      expect(reports[0].message).toContain('has the right value')
    })

    test('should report describe() with lowercase start', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('describe', 'when the module loads'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should start with an uppercase letter')
    })

    test('should report context() with lowercase start', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('context', 'with valid credentials'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should start with an uppercase letter')
    })
  })

  describe('trailing period', () => {
    test('should report it() with trailing period', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'Does something.'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should not end with a period')
      expect(reports[0].message).toContain('Does something.')
    })

    test('should report test() with trailing period', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('test', 'Works as expected.'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should not end with a period')
    })

    test('should report describe() with trailing period', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('describe', 'Module tests.'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should not end with a period')
    })

    test('should report context() with trailing period', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('context', 'When logged in.'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should not end with a period')
    })
  })

  describe('member expression calls', () => {
    test('should report it.only() with lowercase title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createMemberTestCall('it', 'only', 'should focus this'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should start with an uppercase letter')
    })

    test('should report test.skip() with trailing period', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createMemberTestCall('test', 'skip', 'Skipped test.'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should not end with a period')
    })

    test('should not report describe.each() with valid title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createMemberTestCall('describe', 'each', 'Runs with each value'))

      expect(reports.length).toBe(0)
    })

    test('should report it.concurrent() with empty title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createMemberTestCall('it', 'concurrent', ''))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Test title must not be empty')
    })

    test('should report describe.only() with empty title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createMemberTestCall('describe', 'only', ''))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Test title must not be empty')
    })

    test('should not report context.skip() with valid title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createMemberTestCall('context', 'skip', 'Skipped context'))

      expect(reports.length).toBe(0)
    })
  })

  describe('skipped cases (no report)', () => {
    test('should not report when title is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createCallNoStringTitle('it'))

      expect(reports.length).toBe(0)
    })

    test('should not report when there are no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createCallNoArgs('it'))

      expect(reports.length).toBe(0)
    })

    test('should not report unrelated function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('console', 'log'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-test function names', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('myHelper', 'does something'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = validTitleRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = validTitleRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = validTitleRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty title only reporting once (not both empty and lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', ''))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Test title must not be empty')
    })

    test('should report lowercase and trailing period separately for lowercase period title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'lowercase with period.'))

      // The rule checks in order: empty -> period -> lowercase
      // A lowercase title ending with period hits the period check first
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should not end with a period')
    })

    test('should handle node with null literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: null },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 42 },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for invalid title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'lowercase', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct end location for invalid title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'lowercase', 3, 8))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(33)
    })
  })

  describe('multiple violations in one file', () => {
    test('should report each invalid title independently', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'lowercase one'))
      visitor.CallExpression(createTestCallWithTitle('it', 'lowercase two'))
      visitor.CallExpression(createTestCallWithTitle('it', 'Valid title'))

      expect(reports.length).toBe(2)
    })

    test('should report correct messages for mixed violation types', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', ''))
      visitor.CallExpression(createTestCallWithTitle('it', 'lowercase'))
      visitor.CallExpression(createTestCallWithTitle('it', 'Trailing period.'))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toBe('Test title must not be empty')
      expect(reports[1].message).toContain('should start with an uppercase letter')
      expect(reports[2].message).toContain('should not end with a period')
    })
  })

  describe('independent visitor instances', () => {
    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = validTitleRule.create(ctx1)
      const visitor2 = validTitleRule.create(ctx2)

      visitor1.CallExpression(createTestCallWithTitle('it', 'lowercase'))
      visitor2.CallExpression(createTestCallWithTitle('it', 'Valid title'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })
  })

  describe('rule meta expanded', () => {
    test('should have schema as an array', () => {
      expect(Array.isArray(validTitleRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(validTitleRule.meta.schema).toHaveLength(0)
    })

    test('should have meta as a plain object', () => {
      expect(typeof validTitleRule.meta).toBe('object')
      expect(validTitleRule.meta).not.toBeNull()
      expect(Array.isArray(validTitleRule.meta)).toBe(false)
    })
  })

  describe('suite() title validation', () => {
    test('should report suite() with empty title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('suite', ''))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Test title must not be empty')
    })

    test('should report suite() with lowercase start', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('suite', 'runs all tests'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should start with an uppercase letter')
    })

    test('should report suite() with trailing period', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('suite', 'Full test suite.'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should not end with a period')
    })
  })

  describe('additional member expression calls', () => {
    test('should report test.each() with lowercase title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createMemberTestCall('test', 'each', 'runs with each value'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should start with an uppercase letter')
    })

    test('should not report it.skip() with valid title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createMemberTestCall('it', 'skip', 'Skipped for now'))

      expect(reports.length).toBe(0)
    })

    test('should report describe.skip() with lowercase title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createMemberTestCall('describe', 'skip', 'skipped module'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should start with an uppercase letter')
    })

    test('should not report member expression with non-test object name', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createMemberTestCall('foo', 'only', 'lowercase'))

      expect(reports.length).toBe(0)
    })

    test('should report title issue even when member expression property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Literal', value: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'lowercase title' },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should start with an uppercase letter')
    })
  })

  describe('non-string first arguments', () => {
    test('should not report when first argument is a TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'TemplateLiteral', quasis: [], expressions: [] },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report when first argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'getTitle' }, arguments: [] },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report when first argument is a boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: true },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report when first argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Identifier', name: 'undefined' },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('title content edge cases', () => {
    test('should not report whitespace-only title (single space)', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', ' '))

      expect(reports.length).toBe(0)
    })

    test('should report title that is just a period', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', '.'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should not end with a period')
    })

    test('should not report title with period in the middle', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'Handles e.g. edge cases'))

      expect(reports.length).toBe(0)
    })

    test('should not report title with multiple internal periods', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'Tests file.txt parsing'))

      expect(reports.length).toBe(0)
    })

    test('should not report very long valid title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const longTitle = 'A'.repeat(500)
      visitor.CallExpression(createTestCallWithTitle('it', longTitle))

      expect(reports.length).toBe(0)
    })

    test('should not report title with newlines', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'Line one\nLine two'))

      expect(reports.length).toBe(0)
    })

    test('should not report title starting with Unicode uppercase character', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'Ünicode test'))

      expect(reports.length).toBe(0)
    })

    test('should not report title starting with non-ASCII Unicode character', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'éxotic accented'))

      expect(reports.length).toBe(0)
    })

    test('should report title with multiple trailing periods', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'Trailing dots...'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should not end with a period')
    })

    test('should not report title starting with underscore', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', '_private test'))

      expect(reports.length).toBe(0)
    })

    test('should not report title starting with dollar sign', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', '$money test'))

      expect(reports.length).toBe(0)
    })

    test('should not report title starting with emoji', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', '🚀 Fast test'))

      expect(reports.length).toBe(0)
    })
  })

  describe('node structure edge cases', () => {
    test('should handle node with undefined arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee that is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [
          { type: 'Literal', value: 'lowercase' },
          { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('single character titles', () => {
    test('should report single lowercase character title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression(createTestCallWithTitle('it', 'a'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should start with an uppercase letter')
    })

    test('should not report single digit title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)
      visitor.CallExpression(createTestCallWithTitle('it', '5'))
      expect(reports).toHaveLength(0)
    })

    test('should report suite.only with lowercase title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)
      visitor.CallExpression(createMemberTestCall('suite', 'only', 'lowercase title'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('uppercase')
    })

    test('should report suite.skip with trailing period', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)
      visitor.CallExpression(createMemberTestCall('suite', 'skip', 'Has period.'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('period')
    })

    test('should not report describe.each with valid title via member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)
      visitor.CallExpression(createMemberTestCall('describe', 'each', 'Valid title'))
      expect(reports).toHaveLength(0)
    })

    test('should accumulate reports for sequential invalid titles', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)
      visitor.CallExpression(createTestCallWithTitle('it', 'lowercase', 1, 0))
      visitor.CallExpression(createTestCallWithTitle('test', 'Valid title', 2, 0))
      visitor.CallExpression(createTestCallWithTitle('it', 'Ends.', 3, 0))
      expect(reports).toHaveLength(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })

    test('should not report it.concurrent with valid title', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)
      visitor.CallExpression(createMemberTestCall('it', 'concurrent', 'Valid concurrent test'))
      expect(reports).toHaveLength(0)
    })
  })

  describe('type safety', () => {
    test('should have meta as a plain object', () => {
      expect(typeof validTitleRule.meta).toBe('object')
      expect(validTitleRule.meta).not.toBeNull()
      expect(Array.isArray(validTitleRule.meta)).toBe(false)
    })
  })

  describe('suite() function support', () => {
    test('should report empty title for suite()', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'suite' },
        arguments: [{ type: 'Literal', value: '' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should not report valid title for suite()', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'suite' },
        arguments: [{ type: 'Literal', value: 'Valid suite title' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  // SECTION: additional coverage
  describe('additional coverage', () => {
    test('should report lowercase title for it.each()', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [{ type: 'Literal', value: 'lowercase title' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('lowercase')
    })

    test('should report title ending with period for test.only', () => {
      const { context, reports } = createMockContext()
      const visitor = validTitleRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [{ type: 'Literal', value: 'Has trailing period.' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('period')
    })

    test('meta schema should be empty array', () => {
      expect(validTitleRule.meta.schema).toEqual([])
    })
  })
})
