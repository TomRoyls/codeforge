import { describe, test, expect, vi } from 'vitest'
import { noUnsafeOptionalChainingRule } from '../../../../src/rules/patterns/no-unsafe-optional-chaining.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'new obj?.method()',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [] },
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

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: name.length },
    },
  }
}

function createChainExpression(expression: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ChainExpression',
    expression,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createNewExpression(callee: unknown, args: unknown[] = [], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
    optional: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-unsafe-optional-chaining rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeOptionalChainingRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeOptionalChainingRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention optional chaining in description', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs?.description.toLowerCase()).toContain(
        'optional',
      )
    })
  })

  describe('create', () => {
    test('should return visitor with NewExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })

    test('NewExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(typeof visitor.NewExpression).toBe('function')
    })
  })

  describe('valid cases', () => {
    test('should not report regular NewExpression with identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = createNewExpression(createIdentifier('MyClass'))
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = createNewExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('Class')),
      )
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with identifier and arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = createNewExpression(createIdentifier('MyClass'), [
        { type: 'Literal', value: 'arg' },
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with member expression and arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = createNewExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('Class')),
        [{ type: 'Literal', value: 42 }],
      )
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with nested member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const nestedMember = createMemberExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('module')),
        createIdentifier('Class'),
      )
      const node = createNewExpression(nestedMember)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const computedMember = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: { type: 'Literal', value: 'Class' },
        computed: true,
      }
      const node = createNewExpression(computedMember)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression without optional chaining', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const memberExpression = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('Class'),
        optional: false,
        computed: false,
      }
      const node = createNewExpression(memberExpression)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with different node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('MyClass'),
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report NewExpression with ChainExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/optional chaining/i)
    })

    test('should report NewExpression with ChainExpression on member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('Class'))
      const chainNode = createChainExpression(memberExpr)
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/optional chaining/i)
    })

    test('should report NewExpression with ChainExpression and arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode, [{ type: 'Literal', value: 'arg' }])
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/optional chaining/i)
    })

    test('should report correct location for violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), 10, 5)
      const node = createNewExpression(chainNode, [], 10, 5)
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report message about optional chaining in new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].message).toContain('new expression')
    })

    test('should report each violation separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier('A'))))
      visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier('B'))))
      visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier('C'))))

      expect(reports.length).toBe(3)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      delete (node as Record<string, unknown>).loc

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle callee without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { name: 'MyClass' },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-ChainExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyClass' },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object that is not a valid AST node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = { type: 'NewExpression' }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee that is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'NewExpression',
        callee: chainNode,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
