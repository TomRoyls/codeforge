import { describe, test, expect, vi } from 'vitest'
import { noAlertRule } from '../../../../src/rules/patterns/no-alert.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({ message: descriptor.message, loc: descriptor.loc })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => '',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

function createCallExpression(calleeName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [{ type: 'Literal', value: 'test' }],
    loc: { start: { line, column }, end: { line, column: column + calleeName.length + 2 } },
  }
}

function createWindowCallExpression(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'window' },
      property: { type: 'Identifier', name: method },
      computed: false,
    },
    arguments: [{ type: 'Literal', value: 'test' }],
    loc: { start: { line, column }, end: { line, column: column + method.length + 9 } },
  }
}

function createGlobalThisCallExpression(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'globalThis' },
      property: { type: 'Identifier', name: method },
      computed: false,
    },
    arguments: [{ type: 'Literal', value: 'test' }],
    loc: { start: { line, column }, end: { line, column: column + method.length + 14 } },
  }
}

function createNonCallExpression(): unknown {
  return {
    type: 'Identifier',
    name: 'x',
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
  }
}

describe('no-alert rule', () => {
  describe('meta', () => {
    test('meta type is suggestion', () => {
      expect(noAlertRule.meta.type).toBe('suggestion')
    })

    test('meta severity is warn', () => {
      expect(noAlertRule.meta.severity).toBe('warn')
    })

    test('meta recommended is true', () => {
      expect(noAlertRule.meta.docs?.recommended).toBe(true)
    })

    test('meta category is patterns', () => {
      expect(noAlertRule.meta.docs?.category).toBe('patterns')
    })

    test('description mentions alert', () => {
      expect(noAlertRule.meta.docs?.description.toLowerCase()).toContain('alert')
    })
  })

  describe('create', () => {
    test('create returns object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noAlertRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting dialog functions', () => {
    test("Detects alert('hello')", () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))

      expect(reports.length).toBe(1)
    })

    test("Detects confirm('sure?')", () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('confirm'))

      expect(reports.length).toBe(1)
    })

    test("Detects prompt('enter:')", () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('prompt'))

      expect(reports.length).toBe(1)
    })

    test("Detects window.alert('hi')", () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('alert'))

      expect(reports.length).toBe(1)
    })

    test("Detects window.confirm('ok')", () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('confirm'))

      expect(reports.length).toBe(1)
    })

    test("Detects window.prompt('val')", () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('prompt'))

      expect(reports.length).toBe(1)
    })

    test("Detects globalThis.alert('test')", () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createGlobalThisCallExpression('alert'))

      expect(reports.length).toBe(1)
    })

    test("Does NOT report console.log('safe')", () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('console', 1, 0))

      expect(reports.length).toBe(0)
    })

    test("Does NOT report myAlert('custom')", () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('myAlert', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report obj.alert() where obj is not window/globalThis', () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 'test' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('Does NOT report null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report non-CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createNonCallExpression())

      expect(reports.length).toBe(0)
    })

    test('Report message contains function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))

      expect(reports[0].message).toContain('alert')
    })

    test('Report includes location info', () => {
      const { context, reports } = createMockContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })
})
