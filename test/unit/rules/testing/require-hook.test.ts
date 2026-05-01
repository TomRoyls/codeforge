import { describe, test, expect, vi } from 'vitest'
import { requireHookRule } from '../../../../src/rules/testing/require-hook.js'
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
    report: (descriptor) => { reports.push({ message: descriptor.message, loc: descriptor.loc }) },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => '',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
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

function createHookCall(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createIfStatement(line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Literal', value: true },
    consequent: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createForStatement(line = 1, column = 0): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: null,
    update: null,
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createForInStatement(line = 1, column = 0): unknown {
  return {
    type: 'ForInStatement',
    left: { type: 'Identifier', name: 'key' },
    right: { type: 'Identifier', name: 'obj' },
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createForOfStatement(line = 1, column = 0): unknown {
  return {
    type: 'ForOfStatement',
    left: { type: 'Identifier', name: 'item' },
    right: { type: 'Identifier', name: 'arr' },
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createWhileStatement(line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test: { type: 'Literal', value: true },
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createDoWhileStatement(line = 1, column = 0): unknown {
  return {
    type: 'DoWhileStatement',
    test: { type: 'Literal', value: true },
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createSwitchStatement(line = 1, column = 0): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'x' },
    cases: [],
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createTryStatement(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: { type: 'BlockStatement', body: [] },
    handler: null,
    finalizer: null,
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createContextCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'context' },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createSuiteCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'suite' },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createDescribeOnlyCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'describe' },
      property: { type: 'Identifier', name: 'only' },
    },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createContextOnlyCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'context' },
      property: { type: 'Identifier', name: 'only' },
    },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createContextSkipCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'context' },
      property: { type: 'Identifier', name: 'skip' },
    },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createSuiteOnlyCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'suite' },
      property: { type: 'Identifier', name: 'only' },
    },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createSuiteSkipCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'suite' },
      property: { type: 'Identifier', name: 'skip' },
    },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createDescribeEachCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'describe' },
      property: { type: 'Identifier', name: 'each' },
    },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createMemberExprHookCall(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'jest' },
      property: { type: 'Identifier', name: hookName },
    },
    arguments: [
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createDescribeSkipCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'describe' },
      property: { type: 'Identifier', name: 'skip' },
    },
    arguments: [
      { type: 'Literal', value: 'suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

describe('require-hook rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(requireHookRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(requireHookRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(requireHookRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(requireHookRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema defined', () => {
      expect(requireHookRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning hooks', () => {
      expect(requireHookRule.meta.docs?.description.toLowerCase()).toContain('hook')
    })

    test('should have correct description mentioning describe', () => {
      const desc = requireHookRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('describe') || desc.includes('top level')).toBe(true)
    })

    test('should have a docs.url property', () => {
      expect(requireHookRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url containing github', () => {
      expect(requireHookRule.meta.docs?.url).toContain('github.com')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(requireHookRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(requireHookRule.meta.schema).toHaveLength(0)
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = requireHookRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = requireHookRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should have CallExpression:exit visitor', () => {
      const { context } = createMockContext()
      const visitor = requireHookRule.create(context)
      expect(visitor).toHaveProperty('CallExpression:exit')
      expect(typeof visitor['CallExpression:exit']).toBe('function')
    })

    test('should have all blocking statement visitors', () => {
      const { context } = createMockContext()
      const visitor = requireHookRule.create(context)
      expect(visitor).toHaveProperty('IfStatement')
      expect(visitor).toHaveProperty('IfStatement:exit')
      expect(visitor).toHaveProperty('ForStatement')
      expect(visitor).toHaveProperty('ForStatement:exit')
      expect(visitor).toHaveProperty('ForInStatement')
      expect(visitor).toHaveProperty('ForInStatement:exit')
      expect(visitor).toHaveProperty('ForOfStatement')
      expect(visitor).toHaveProperty('ForOfStatement:exit')
      expect(visitor).toHaveProperty('WhileStatement')
      expect(visitor).toHaveProperty('WhileStatement:exit')
      expect(visitor).toHaveProperty('DoWhileStatement')
      expect(visitor).toHaveProperty('DoWhileStatement:exit')
      expect(visitor).toHaveProperty('SwitchStatement')
      expect(visitor).toHaveProperty('SwitchStatement:exit')
      expect(visitor).toHaveProperty('TryStatement')
      expect(visitor).toHaveProperty('TryStatement:exit')
    })
  })

  describe('valid hooks (no reports)', () => {
    test('should not report beforeEach at top level of describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })

    test('should not report afterEach at top level of describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.CallExpression!(createHookCall('afterEach'))
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })

    test('should not report beforeAll at top level of describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.CallExpression!(createHookCall('beforeAll'))
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })

    test('should not report afterAll at top level of describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.CallExpression!(createHookCall('afterAll'))
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })

    test('should not report multiple hooks at top level of describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor.CallExpression!(createHookCall('afterEach'))
      visitor.CallExpression!(createHookCall('beforeAll'))
      visitor.CallExpression!(createHookCall('afterAll'))
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })

    test('should not report hook that was in blocking scope but blocking exited', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor['IfStatement:exit']!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('hooks inside if', () => {
    test('should report beforeEach inside if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[0].message).toContain('conditional or nested structure')
    })

    test('should report afterEach inside if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('afterEach'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })

    test('should report beforeAll inside if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeAll'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })

    test('should report afterAll inside if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('afterAll'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })
  })

  describe('hooks inside loops', () => {
    test('should report hook inside for statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.ForStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['ForStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report hook inside for-in statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.ForInStatement!()
      visitor.CallExpression!(createHookCall('afterEach'))
      visitor['ForInStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })

    test('should report hook inside for-of statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.ForOfStatement!()
      visitor.CallExpression!(createHookCall('beforeAll'))
      visitor['ForOfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })

    test('should report hook inside while statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.WhileStatement!()
      visitor.CallExpression!(createHookCall('afterAll'))
      visitor['WhileStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })
  })

  describe('hooks inside other blocking', () => {
    test('should report hook inside do-while statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.DoWhileStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['DoWhileStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should report hook inside switch statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.SwitchStatement!()
      visitor.CallExpression!(createHookCall('afterEach'))
      visitor['SwitchStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })

    test('should report hook inside try statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.TryStatement!()
      visitor.CallExpression!(createHookCall('beforeAll'))
      visitor['TryStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })
  })

  describe('nested describe scopes', () => {
    test('should report hook in outer describe when inside blocking in outer scope', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
    })

    test('should not report hook in inner describe at top level of inner', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.CallExpression!(createDescribeCall(2, 2))
      visitor.CallExpression!(createHookCall('beforeEach', 3, 4))
      visitor['CallExpression:exit']!(createDescribeCall(2, 2))
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should report hook in inner describe when inside blocking in inner scope', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.CallExpression!(createDescribeCall(2, 2))
      visitor.ForStatement!()
      visitor.CallExpression!(createHookCall('afterEach', 3, 4))
      visitor['ForStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(2, 2))
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('no describe scope', () => {
    test('should not report hook outside any describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createHookCall('beforeEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report hook outside describe even if inside blocking statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['IfStatement:exit']!()

      expect(reports.length).toBe(0)
    })
  })

  describe('describe.only and describe.skip', () => {
    test('should track describe.only as a describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeOnlyCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeOnlyCall())

      expect(reports.length).toBe(1)
    })

    test('should track describe.skip as a describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeSkipCall())
      visitor.WhileStatement!()
      visitor.CallExpression!(createHookCall('afterEach'))
      visitor['WhileStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeSkipCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('context and suite aliases', () => {
    test('should track context() as a describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createContextCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createContextCall())

      expect(reports.length).toBe(1)
    })

    test('should track suite() as a describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createSuiteCall())
      visitor.SwitchStatement!()
      visitor.CallExpression!(createHookCall('afterAll'))
      visitor['SwitchStatement:exit']!()
      visitor['CallExpression:exit']!(createSuiteCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should not report non-hook calls inside blocking statements', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })

    test('should handle null node in CallExpression gracefully', () => {
      const { context } = createMockContext()
      const visitor = requireHookRule.create(context)

      expect(() => visitor.CallExpression!(null)).not.toThrow()
    })

    test('should handle undefined node in CallExpression gracefully', () => {
      const { context } = createMockContext()
      const visitor = requireHookRule.create(context)

      expect(() => visitor.CallExpression!(undefined)).not.toThrow()
    })

    test('should report multiple hooks inside single blocking statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach', 3, 0))
      visitor.CallExpression!(createHookCall('afterEach', 4, 0))
      visitor.CallExpression!(createHookCall('beforeAll', 5, 0))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(3)
    })

    test('should track nested blocking depth correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.ForStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['ForStatement:exit']!()
      visitor['IfStatement:exit']!()
      visitor.CallExpression!(createHookCall('afterEach'))
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
        ],
      })
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
    })

    test('should handle non-CallExpression type node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      expect(() => visitor.CallExpression!({ type: 'Literal', value: 42 })).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for hook inside blocking', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach', 10, 5))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end location for hook inside blocking', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('afterEach', 7, 3))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(23)
    })
  })

  describe('independent visitors', () => {
    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = requireHookRule.create(ctx1)
      const visitor2 = requireHookRule.create(ctx2)

      visitor1.CallExpression!(createDescribeCall())
      visitor1.IfStatement!()
      visitor1.CallExpression!(createHookCall('beforeEach'))
      visitor1['IfStatement:exit']!()
      visitor1['CallExpression:exit']!(createDescribeCall())

      visitor2.CallExpression!(createDescribeCall())
      visitor2.CallExpression!(createHookCall('afterEach'))
      visitor2['CallExpression:exit']!(createDescribeCall())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })
  })

  describe('meta expanded', () => {
    test('should not have fixable field', () => {
      expect(requireHookRule.meta.fixable).toBeUndefined()
    })

    test('should have description mentioning hooks and conditionals', () => {
      const desc = requireHookRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('hook')
    })
  })

  describe('report message content', () => {
    test('should include hook name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeAll'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports[0].message).toContain('beforeAll')
    })

    test('should include blocking statement reference in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('afterEach'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports[0].message).toBeTruthy()
    })
  })

  describe('nested blocking statements', () => {
    test('should report hook in double-nested blocking (if inside for)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.ForStatement!()
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['IfStatement:exit']!()
      visitor['ForStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
    })

    test('should report hook in switch inside try', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.TryStatement!()
      visitor.SwitchStatement!()
      visitor.CallExpression!(createHookCall('afterAll'))
      visitor['SwitchStatement:exit']!()
      visitor['TryStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('all blocking statement types', () => {
    const blockingTypes = [
      { enter: 'IfStatement', exit: 'IfStatement:exit' },
      { enter: 'ForStatement', exit: 'ForStatement:exit' },
      { enter: 'ForInStatement', exit: 'ForInStatement:exit' },
      { enter: 'ForOfStatement', exit: 'ForOfStatement:exit' },
      { enter: 'WhileStatement', exit: 'WhileStatement:exit' },
      { enter: 'DoWhileStatement', exit: 'DoWhileStatement:exit' },
      { enter: 'SwitchStatement', exit: 'SwitchStatement:exit' },
      { enter: 'TryStatement', exit: 'TryStatement:exit' },
    ]

    test.each(blockingTypes)('should report hook inside $enter', ({ enter, exit }) => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor[enter]!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor[exit]!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('context.only and context.skip', () => {
    test('should track context.only as a describe scope with blocking', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createContextOnlyCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createContextOnlyCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })

    test('should track context.skip as a describe scope with blocking', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createContextSkipCall())
      visitor.WhileStatement!()
      visitor.CallExpression!(createHookCall('afterEach'))
      visitor['WhileStatement:exit']!()
      visitor['CallExpression:exit']!(createContextSkipCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('suite.only and suite.skip', () => {
    test('should track suite.only as a describe scope with blocking', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createSuiteOnlyCall())
      visitor.ForStatement!()
      visitor.CallExpression!(createHookCall('beforeAll'))
      visitor['ForStatement:exit']!()
      visitor['CallExpression:exit']!(createSuiteOnlyCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll')
    })

    test('should track suite.skip as a describe scope with blocking', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createSuiteSkipCall())
      visitor.TryStatement!()
      visitor.CallExpression!(createHookCall('afterAll'))
      visitor['TryStatement:exit']!()
      visitor['CallExpression:exit']!(createSuiteSkipCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })
  })

  describe('describe.each', () => {
    test('should track describe.each as a describe scope', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeEachCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeEachCall())

      expect(reports.length).toBe(1)
    })

    test('should not report hook at top level of describe.each', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeEachCall())
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['CallExpression:exit']!(createDescribeEachCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('hook with MemberExpression callee', () => {
    test('should not report jest.beforeEach inside blocking as a hook', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createMemberExprHookCall('beforeEach'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })

    test('should not report jest.afterEach inside blocking as a hook', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.ForStatement!()
      visitor.CallExpression!(createMemberExprHookCall('afterEach'))
      visitor['ForStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('describe nested inside blocking statement', () => {
    test('should not report hook at top level of inner describe inside blocking', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.IfStatement!()
      visitor.CallExpression!(createDescribeCall(3, 4))
      visitor.CallExpression!(createHookCall('beforeEach', 4, 6))
      visitor['CallExpression:exit']!(createDescribeCall(3, 4))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should report hook in blocking of inner describe inside outer blocking', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.IfStatement!()
      visitor.CallExpression!(createDescribeCall(3, 4))
      visitor.WhileStatement!()
      visitor.CallExpression!(createHookCall('afterEach', 5, 8))
      visitor['WhileStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(3, 4))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('three-level nested describes', () => {
    test('should not report hook at top level of deeply nested describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.CallExpression!(createDescribeCall(2, 2))
      visitor.CallExpression!(createDescribeCall(3, 4))
      visitor.CallExpression!(createHookCall('beforeAll', 4, 6))
      visitor['CallExpression:exit']!(createDescribeCall(3, 4))
      visitor['CallExpression:exit']!(createDescribeCall(2, 2))
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should report hook in blocking at deepest nesting level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.CallExpression!(createDescribeCall(2, 2))
      visitor.CallExpression!(createDescribeCall(3, 4))
      visitor.SwitchStatement!()
      visitor.CallExpression!(createHookCall('beforeEach', 5, 8))
      visitor['SwitchStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(3, 4))
      visitor['CallExpression:exit']!(createDescribeCall(2, 2))
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('sequential blocking statements', () => {
    test('should report hooks in each sequential blocking statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach', 3, 0))
      visitor['IfStatement:exit']!()
      visitor.ForStatement!()
      visitor.CallExpression!(createHookCall('afterEach', 5, 0))
      visitor['ForStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('beforeEach')
      expect(reports[1].message).toContain('afterEach')
    })

    test('should not report hook between two sequential blocking scopes', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor['IfStatement:exit']!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor.ForStatement!()
      visitor['ForStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('non-describe exit does not pop scope', () => {
    test('should not pop scope when exiting non-describe call', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor['CallExpression:exit']!(createHookCall('someFn'))
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('blocking visitors outside describe', () => {
    test('should not affect hook detection when blocking visitors called outside describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.IfStatement!()
      visitor['IfStatement:exit']!()
      visitor.CallExpression!(createDescribeCall())
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })

    test('should not crash when blocking exit called without matching enter', () => {
      const { context } = createMockContext()
      const visitor = requireHookRule.create(context)

      expect(() => visitor['IfStatement:exit']!()).not.toThrow()
    })
  })

  describe('sequential independent describe blocks', () => {
    test('should maintain independent scope state across sequential describes', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      // First describe with blocking + hook → report
      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach', 2, 0))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      // Second describe with hook at top level → no report
      visitor.CallExpression!(createDescribeCall(5, 0))
      visitor.CallExpression!(createHookCall('afterEach', 6, 0))
      visitor['CallExpression:exit']!(createDescribeCall(5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('additional coverage - hooks after describe exit', () => {
    test('should not report hook called after describe scope has exited', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor['CallExpression:exit']!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach'))
      visitor['IfStatement:exit']!()

      expect(reports.length).toBe(0)
    })
  })

  describe('additional coverage - member expression hook at top level', () => {
    test('should not report jest.beforeEach at top level of describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.CallExpression!(createMemberExprHookCall('beforeEach'))
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('additional coverage - empty describe', () => {
    test('should not report anything in empty describe with no hooks', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('additional coverage - hook inside for-in in nested describe', () => {
    test('should report hook inside for-in within nested describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.CallExpression!(createDescribeCall(2, 2))
      visitor.ForInStatement!()
      visitor.CallExpression!(createHookCall('afterEach', 4, 6))
      visitor['ForInStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(2, 2))
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('additional coverage - mixed hooks in and out of blocking', () => {
    test('should only report hooks inside blocking, not those at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.CallExpression!(createHookCall('beforeAll', 2, 0))
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach', 4, 2))
      visitor['IfStatement:exit']!()
      visitor.CallExpression!(createHookCall('afterAll', 6, 0))
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('additional coverage - blocking depth resets after inner describe', () => {
    test('should not carry blocking depth from outer scope into inner describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.IfStatement!()
      visitor.CallExpression!(createDescribeCall(3, 4))
      visitor.CallExpression!(createHookCall('afterEach', 4, 6))
      visitor['CallExpression:exit']!(createDescribeCall(3, 4))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('additional coverage - CallExpression:exit with null node', () => {
    test('should handle null node in CallExpression:exit gracefully', () => {
      const { context } = createMockContext()
      const visitor = requireHookRule.create(context)

      expect(() => visitor['CallExpression:exit']!(null)).not.toThrow()
    })
  })

  describe('additional coverage - full message format', () => {
    test('should report full expected message format', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.TryStatement!()
      visitor.CallExpression!(createHookCall('beforeAll'))
      visitor['TryStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports[0].message).toBe(
        "Unexpected 'beforeAll' hook inside conditional or nested structure. Hooks should be at the top level of a describe block.",
      )
    })
  })

  describe('additional coverage - callee with non-string name', () => {
    test('should not report hook when callee name is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 123 },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('additional coverage - describe.only with nested describe in blocking', () => {
    test('should report hook in blocking within nested describe inside describe.only', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeOnlyCall())
      visitor.CallExpression!(createDescribeCall(3, 4))
      visitor.ForOfStatement!()
      visitor.CallExpression!(createHookCall('afterAll', 5, 8))
      visitor['ForOfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(3, 4))
      visitor['CallExpression:exit']!(createDescribeOnlyCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })
  })

  describe('additional coverage - hook inside while in nested describe', () => {
    test('should report hook inside while within nested describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.CallExpression!(createDescribeCall(2, 2))
      visitor.WhileStatement!()
      visitor.CallExpression!(createHookCall('beforeEach', 4, 6))
      visitor['WhileStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(2, 2))
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach')
    })
  })

  describe('additional coverage - all four hook types in single blocking', () => {
    test('should report all four hook types inside single try statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.TryStatement!()
      visitor.CallExpression!(createHookCall('beforeAll', 3, 0))
      visitor.CallExpression!(createHookCall('beforeEach', 4, 0))
      visitor.CallExpression!(createHookCall('afterEach', 5, 0))
      visitor.CallExpression!(createHookCall('afterAll', 6, 0))
      visitor['TryStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(4)
      expect(reports[0].message).toContain('beforeAll')
      expect(reports[1].message).toContain('beforeEach')
      expect(reports[2].message).toContain('afterEach')
      expect(reports[3].message).toContain('afterAll')
    })
  })

  describe('additional coverage - describe.each with nested describe', () => {
    test('should not report hook at top level of nested describe inside describe.each', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeEachCall())
      visitor.CallExpression!(createDescribeCall(2, 2))
      visitor.CallExpression!(createHookCall('beforeEach', 3, 4))
      visitor['CallExpression:exit']!(createDescribeCall(2, 2))
      visitor['CallExpression:exit']!(createDescribeEachCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('additional coverage - CallExpression:exit with undefined node', () => {
    test('should handle undefined node in CallExpression:exit gracefully', () => {
      const { context } = createMockContext()
      const visitor = requireHookRule.create(context)

      expect(() => visitor['CallExpression:exit']!(undefined)).not.toThrow()
    })
  })

  describe('additional coverage - node with empty callee', () => {
    test('should handle node with null callee gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('additional coverage - hook inside do-while in nested describe', () => {
    test('should report hook inside do-while within nested describe', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.CallExpression!(createDescribeCall(2, 2))
      visitor.DoWhileStatement!()
      visitor.CallExpression!(createHookCall('afterAll', 4, 6))
      visitor['DoWhileStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(2, 2))
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll')
    })
  })

  describe('additional coverage - three sequential describe blocks', () => {
    test('should track scope correctly across three sequential describe blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      // First: hook at top level → no report
      visitor.CallExpression!(createDescribeCall(1, 0))
      visitor.CallExpression!(createHookCall('beforeEach', 2, 0))
      visitor['CallExpression:exit']!(createDescribeCall(1, 0))

      // Second: hook inside if → report
      visitor.CallExpression!(createDescribeCall(4, 0))
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('afterEach', 6, 0))
      visitor['IfStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall(4, 0))

      // Third: hook at top level → no report
      visitor.CallExpression!(createDescribeCall(9, 0))
      visitor.CallExpression!(createHookCall('beforeAll', 10, 0))
      visitor['CallExpression:exit']!(createDescribeCall(9, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach')
    })
  })

  describe('additional coverage - blocking statement exit without matching enter', () => {
    test('should handle ForStatement:exit without matching ForStatement', () => {
      const { context } = createMockContext()
      const visitor = requireHookRule.create(context)

      expect(() => visitor['ForStatement:exit']!()).not.toThrow()
    })

    test('should handle WhileStatement:exit without matching WhileStatement', () => {
      const { context } = createMockContext()
      const visitor = requireHookRule.create(context)

      expect(() => visitor['WhileStatement:exit']!()).not.toThrow()
    })
  })

  describe('additional coverage - location on multiple reports', () => {
    test('should report correct locations for multiple hooks in different blocking statements', () => {
      const { context, reports } = createMockContext()
      const visitor = requireHookRule.create(context)

      visitor.CallExpression!(createDescribeCall())
      visitor.IfStatement!()
      visitor.CallExpression!(createHookCall('beforeEach', 5, 2))
      visitor['IfStatement:exit']!()
      visitor.ForStatement!()
      visitor.CallExpression!(createHookCall('afterEach', 10, 8))
      visitor['ForStatement:exit']!()
      visitor['CallExpression:exit']!(createDescribeCall())

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(8)
    })
  })
})
