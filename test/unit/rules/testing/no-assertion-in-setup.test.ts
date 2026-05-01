import { describe, test, expect, vi } from 'vitest'
import { noAssertionInSetupRule } from '../../../../src/rules/testing/no-assertion-in-setup.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'beforeEach(() => { expect(x).toBe(1); });',
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

function createHookCall(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + hookName.length + 4 } },
  }
}

function createMemberHookCall(hookName: string, method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: hookName },
      property: { type: 'Identifier', name: method },
    },
    arguments: [
      { type: 'Literal', value: 'test' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + hookName.length + method.length + 5 } },
  }
}

function createExpectMemberCall(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: method },
    },
    arguments: [{ type: 'Literal', value: 1 }],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createExpectCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'expect' },
    arguments: [{ type: 'Identifier', name: 'x' }],
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createNormalCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + name.length + 2 } },
  }
}

function createTestCall(testFn: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: testFn },
    arguments: [
      { type: 'Literal', value: 'test name' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createDescribeCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

describe('no-assertion-in-setup rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noAssertionInSetupRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noAssertionInSetupRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noAssertionInSetupRule.meta.docs?.recommended).toBe(true)
    })

    test('should have testing category', () => {
      expect(noAssertionInSetupRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning setup', () => {
      expect(noAssertionInSetupRule.meta.docs?.description.toLowerCase()).toContain('setup')
    })

    test('should have correct description mentioning assertion', () => {
      expect(noAssertionInSetupRule.meta.docs?.description.toLowerCase()).toContain('assertion')
    })

    test('should have correct docs URL', () => {
      expect(noAssertionInSetupRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-assertion-in-setup',
      )
    })

    test('should not have fixable field', () => {
      expect(noAssertionInSetupRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor object with CallExpression:exit method', () => {
      const { context } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      expect(visitor).toHaveProperty('CallExpression:exit')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noAssertionInSetupRule.create(context)
      const visitor2 = noAssertionInSetupRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting expect in beforeEach', () => {
    test('should report expect() inside beforeEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report correct location for expect in beforeEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach', 1, 0))
      visitor.CallExpression(createExpectCall(3, 4))
      visitor['CallExpression:exit'](createHookCall('beforeEach', 1, 0))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('detecting expect in afterEach', () => {
    test('should report expect() inside afterEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('afterEach'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('detecting expect in beforeAll', () => {
    test('should report expect() inside beforeAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeAll'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })
  })

  describe('detecting expect in afterAll', () => {
    test('should report expect() inside afterAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('afterAll'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('afterAll'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })
  })

  describe('multiple assertions in one hook', () => {
    test('should report all expect calls in a single beforeEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall(2, 2))
      visitor.CallExpression(createExpectCall(3, 2))
      visitor.CallExpression(createExpectCall(4, 2))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports.length).toBe(3)
    })
  })

  describe('valid cases — no violations', () => {
    test('should not report expect inside it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createTestCall('it'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createTestCall('it'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside test()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createTestCall('test'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createTestCall('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report hook without assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createNormalCall('setup'))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect at top level (no hook)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createExpectCall())

      expect(reports.length).toBe(0)
    })

    test('should not report expect after hook exits', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall())

      expect(reports.length).toBe(0)
    })

    test('should not report non-expect calls inside hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createNormalCall('initialize'))
      visitor.CallExpression(createNormalCall('configure'))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report expect inside describe with no hooks', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(0)
    })

    test('should not report non-hook non-expect calls at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createNormalCall('console.log'))

      expect(reports.length).toBe(0)
    })
  })

  describe('nested hooks', () => {
    test('should report expect in nested hook inside describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(1)
    })

    test('should report expect with correct hook name from outer hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('afterEach'))

      expect(reports[0].message).toContain('afterEach')
    })

    test('should track multiple hooks independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createExpectCall(5, 0))
      visitor['CallExpression:exit'](createHookCall('afterEach'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[1].message).toContain('afterEach')
    })

    test('should report expect inside test function within hook since hook stack is active', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createTestCall('it'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createTestCall('it'))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('error message format', () => {
    test('message starts with "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports[0].message).toMatch(/^Unexpected/)
    })

    test('message contains hook name', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeAll'))

      expect(reports[0].message).toContain("'beforeAll'")
    })

    test('message mentions test functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('afterEach'))

      expect(reports[0].message).toContain('test functions')
    })

    test('message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall(5, 10))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression({ type: 'CallExpression', arguments: [] })
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [],
      }

      visitor.CallExpression(createHookCall('beforeEach'))
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
    })

    test('should handle exit without matching enter gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      expect(() => visitor['CallExpression:exit'](createHookCall('beforeEach'))).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate hook stacks', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = noAssertionInSetupRule.create(ctx1)
      const visitor2 = noAssertionInSetupRule.create(ctx2)

      visitor1.CallExpression(createHookCall('beforeEach'))
      visitor1.CallExpression(createExpectCall())

      visitor2.CallExpression(createExpectCall())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)

      visitor1['CallExpression:exit'](createHookCall('beforeEach'))
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createExpectCall(5, 0))
      visitor['CallExpression:exit'](createHookCall('afterEach'))

      expect(reports.length).toBe(2)
    })

    test('hook stack resets correctly between hooks', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      visitor.CallExpression(createExpectCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('all hook types', () => {
    test('should report in beforeEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report in afterEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('afterEach'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })

    test('should report in beforeAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeAll'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })

    test('should report in afterAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('afterAll'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('afterAll'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })
  })

  describe('meta expanded', () => {
    test('should not have schema property', () => {
      expect(noAssertionInSetupRule.meta.schema).toBeUndefined()
    })

    test('should have description containing setup and teardown', () => {
      const desc = noAssertionInSetupRule.meta.docs?.description ?? ''
      expect(desc.toLowerCase()).toContain('setup')
      expect(desc.toLowerCase()).toContain('teardown')
    })

    test('docs url should be codeforge.dev', () => {
      expect(noAssertionInSetupRule.meta.docs?.url).toContain('codeforge.dev')
    })
  })

  describe('deeply nested hooks', () => {
    test('should report expect in triple-nested hooks', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      visitor['CallExpression:exit'](createDescribeCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      visitor['CallExpression:exit'](createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report expect in each nested hook independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall(2))
      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createExpectCall(3))
      visitor['CallExpression:exit'](createHookCall('afterEach'))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[1].message).toContain('afterEach')
    })
  })

  describe('report message content', () => {
    test('message includes "Unexpected assertion"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports[0].message).toContain('Unexpected assertion')
    })

    test('message includes hook name in single quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeAll'))

      expect(reports[0].message).toContain("'beforeAll'")
    })

    test('message mentions test functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('afterEach'))

      expect(reports[0].message).toContain('test functions')
    })
  })

  describe('expect member expression callee', () => {
    test('should not report expect().toBe() inside hook (expect itself is tracked, not the matcher)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall())
      visitor.CallExpression(createExpectMemberCall('toBe'))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      // The bare expect() is reported; the .toBe() call is a MemberExpression callee, not detected
      expect(reports.length).toBe(1)
    })
  })

  describe('hook member expression callee', () => {
    test('should report expect inside beforeEach.only (member expr hook is tracked)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createMemberHookCall('beforeEach', 'only'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createMemberHookCall('beforeEach', 'only'))

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple violations in same hook', () => {
    test('should report all expect calls with locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall(5, 0))
      visitor.CallExpression(createExpectCall(6, 10))
      visitor.CallExpression(createExpectCall(7, 20))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(6)
      expect(reports[2].loc?.start.line).toBe(7)
    })
  })

  describe('interleaved hooks and tests', () => {
    test('should not report expect in test after hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      visitor.CallExpression(createTestCall('it'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createTestCall('it'))

      expect(reports.length).toBe(0)
    })

    test('should report expect in hook then not report in test', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall(3, 0))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      visitor.CallExpression(createTestCall('it'))
      visitor.CallExpression(createExpectCall(5, 0))
      visitor['CallExpression:exit'](createTestCall('it'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(noAssertionInSetupRule).toBeDefined()
      expect(noAssertionInSetupRule.meta).toBeDefined()
      expect(noAssertionInSetupRule.create).toBeDefined()
    })
  })

  describe('additional meta verification', () => {
    test('should have testing category', () => {
      expect(noAssertionInSetupRule.meta.docs?.category).toBe('testing')
    })

    test('should have suggestion type', () => {
      expect(noAssertionInSetupRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noAssertionInSetupRule.meta.severity).toBe('warn')
    })

    test('should have description mentioning assertion', () => {
      expect(noAssertionInSetupRule.meta.docs?.description).toContain('assertion')
    })

    test('should have correct docs URL', () => {
      expect(noAssertionInSetupRule.meta.docs?.url).toBe('https://codeforge.dev/docs/rules/no-assertion-in-setup')
    })

    test('should have recommended set to true', () => {
      expect(noAssertionInSetupRule.meta.docs?.recommended).toBe(true)
    })

    test('should have create function', () => {
      expect(typeof noAssertionInSetupRule.create).toBe('function')
    })

    test('should have meta defined', () => {
      expect(noAssertionInSetupRule.meta).toBeDefined()
    })
  })

  describe('all hook types', () => {
    test('reports expect in beforeAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['CallExpression:exit'](createHookCall('beforeAll'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })

    test('reports expect in afterAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression(createHookCall('afterAll'))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['CallExpression:exit'](createHookCall('afterAll'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })

    test('reports expect in afterEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['CallExpression:exit'](createHookCall('afterEach'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('deeply nested hooks', () => {
    test('reports expect in nested beforeEach inside describe', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [],
      })
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall(3, 0))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      visitor['CallExpression:exit']({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [],
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple expects in single hook', () => {
    test('reports all expects in a single beforeEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor.CallExpression(createExpectCall(3, 5))
      visitor.CallExpression(createExpectCall(4, 10))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      expect(reports.length).toBe(3)
    })
  })

  describe('function expression hooks', () => {
    test('reports expect in function expression hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{ type: 'FunctionExpression' }],
      })
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['CallExpression:exit']({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{ type: 'FunctionExpression' }],
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('exit handler edge cases', () => {
    test('CallExpression:exit with null node does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      expect(() => visitor['CallExpression:exit'](null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('CallExpression:exit with undefined node does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      expect(() => visitor['CallExpression:exit'](undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('CallExpression:exit with non-hook node does not pop stack', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor['CallExpression:exit'](createNormalCall('someFunction'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      expect(reports.length).toBe(1)
    })
  })

  describe('duplicate hook entries', () => {
    test('entering same hook twice pushes to stack twice', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('popping one level of duplicate hook leaves stack active', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor['CallExpression:exit'](createHookCall('beforeAll'))
      visitor.CallExpression(createExpectCall(5, 0))
      visitor['CallExpression:exit'](createHookCall('beforeAll'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })
  })

  describe('nested hook reports innermost name', () => {
    test('reports afterEach when expect is inside afterEach nested in beforeEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('afterEach'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('afterEach'))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'afterEach'")
      expect(reports[0].message).not.toContain("'beforeEach'")
    })

    test('reports beforeAll when expect is inside beforeAll nested in afterAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression(createHookCall('afterAll'))
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createHookCall('beforeAll'))
      visitor['CallExpression:exit'](createHookCall('afterAll'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'beforeAll'")
    })
  })

  describe('hook callee type variations', () => {
    test('does not track hook with Literal callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Literal', value: 'beforeEach' },
        arguments: [],
      })
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(0)
    })

    test('does not track hook with missing callee type', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { name: 'beforeEach' },
        arguments: [],
      })
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(0)
    })

    test('does not track node without type property as hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression({
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [],
      })
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(0)
    })
  })

  describe('sequential hooks mixed results', () => {
    test('first hook has assertion, second hook has none', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createExpectCall(3, 0))
      visitor['CallExpression:exit'](createHookCall('beforeEach'))
      visitor.CallExpression(createHookCall('afterEach'))
      visitor['CallExpression:exit'](createHookCall('afterEach'))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('two hooks with assertions and a test between them', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)
      visitor.CallExpression(createHookCall('beforeAll'))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['CallExpression:exit'](createHookCall('beforeAll'))
      visitor.CallExpression(createTestCall('it'))
      visitor.CallExpression(createExpectCall(4, 0))
      visitor['CallExpression:exit'](createTestCall('it'))
      visitor.CallExpression(createHookCall('afterAll'))
      visitor.CallExpression(createExpectCall(6, 0))
      visitor['CallExpression:exit'](createHookCall('afterAll'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('beforeAll')
      expect(reports[1].message).toContain('afterAll')
    })
  })

  describe('additional meta checks', () => {
    test('should have valid docs URL containing rule name', () => {
      const url = noAssertionInSetupRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('no-assertion-in-setup')
    })

    test('should have create as a function', () => {
      expect(typeof noAssertionInSetupRule.create).toBe('function')
    })
  })

  describe('afterEach.only member expression hook', () => {
    test('should report expect inside afterEach.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createMemberHookCall('afterEach', 'only'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createMemberHookCall('afterEach', 'only'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('beforeAll.skip member expression hook', () => {
    test('should report expect inside beforeAll.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createMemberHookCall('beforeAll', 'skip'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createMemberHookCall('beforeAll', 'skip'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })
  })

  describe('expect in describe nested inside hook', () => {
    test('should report expect in describe inside beforeEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createHookCall('beforeEach'))
      visitor.CallExpression(createDescribeCall())
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createDescribeCall())
      visitor['CallExpression:exit'](createHookCall('beforeEach'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('afterAll.each member expression hook', () => {
    test('should report expect inside afterAll.each', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createMemberHookCall('afterAll', 'each'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createMemberHookCall('afterAll', 'each'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })
  })

  describe('beforeEach.each member expression hook', () => {
    test('should report expect inside beforeEach.each', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInSetupRule.create(context)

      visitor.CallExpression(createMemberHookCall('beforeEach', 'each'))
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](createMemberHookCall('beforeEach', 'each'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })
})
