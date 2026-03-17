import { describe, test, expect, vi } from 'vitest'
import { noGlobalAssignRule } from '../../../../src/rules/patterns/no-global-assign.js'
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
    getSource: () => 'Object = {};',
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

function createAssignmentExpression(leftName: string, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'Identifier',
      name: leftName,
    },
    right: {
      type: 'Literal',
      value: 1,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMemberAssignment(line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Object',
      },
      property: {
        type: 'Identifier',
        name: 'prop',
      },
      computed: false,
    },
    right: {
      type: 'Literal',
      value: 1,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-global-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noGlobalAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noGlobalAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noGlobalAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noGlobalAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema array', () => {
      expect(noGlobalAssignRule.meta.schema).toEqual([])
    })

    test('should have undefined fixable', () => {
      expect(noGlobalAssignRule.meta.fixable).toBeUndefined()
    })

    test('should mention global in description', () => {
      expect(noGlobalAssignRule.meta.docs?.description.toLowerCase()).toContain('global')
    })

    test('should mention read-only in description', () => {
      expect(noGlobalAssignRule.meta.docs?.description.toLowerCase()).toContain('read-only')
    })
  })

  describe('create', () => {
    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })
  })

  describe('reporting read-only global assignments', () => {
    test('should report assignment to undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('undefined'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
      expect(reports[0].message).toContain('Read-only global')
    })

    test('should report assignment to NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('NaN'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('NaN')
    })

    test('should report assignment to Infinity', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Infinity'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Infinity')
    })

    test('should report assignment to Object', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object')
    })

    test('should report assignment to Function', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Function'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Function')
    })

    test('should report assignment to Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Array'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Array')
    })

    test('should report assignment to String', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('String'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('String')
    })

    test('should report assignment to Number', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Number'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Number')
    })

    test('should report assignment to Boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Boolean'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Boolean')
    })

    test('should report assignment to Math', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Math'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math')
    })

    test('should report assignment to Date', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Date'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Date')
    })

    test('should report assignment to RegExp', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('RegExp'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('RegExp')
    })

    test('should report assignment to JSON', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('JSON'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('JSON')
    })

    test('should report assignment to Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Promise'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Promise')
    })

    test('should report assignment to Map', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Map'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Map')
    })

    test('should report assignment to Set', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Set'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Set')
    })

    test('should report assignment to globalThis', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('globalThis'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('globalThis')
    })

    test('should report assignment to console', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('console'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console')
    })

    test('should report assignment to window', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('window'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('window')
    })

    test('should report correct location for global assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report appropriate error message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Array'))

      expect(reports[0].message).toBe("Read-only global 'Array' should not be modified.")
    })
  })

  describe('not reporting non-global assignments', () => {
    test('should not report assignment to local variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('myLocalVar'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to custom variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('customObject'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to property of global', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createMemberAssignment())

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to variable with underscore prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('_myVar'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to variable with dollar sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('$myVar'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to camelCase variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('myCustomObject'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to PascalCase variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('MyCustomClass'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      expect(() => visitor.AssignmentExpression('invalid')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment without left property', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment with null left side', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: null,
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'Object' },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle left side that is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: null,
        operator: '=',
        left: { type: 'Identifier', name: 'Object' },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle identifier without name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier' },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: '' },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report multiple global assignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))
      visitor.AssignmentExpression(createAssignmentExpression('Array'))
      visitor.AssignmentExpression(createAssignmentExpression('String'))

      expect(reports.length).toBe(3)
    })
  })

  describe('additional global objects', () => {
    test('should report assignment to Symbol', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Symbol'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Symbol')
    })

    test('should report assignment to BigInt', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('BigInt'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('BigInt')
    })

    test('should report assignment to Reflect', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Reflect'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Reflect')
    })

    test('should report assignment to Proxy', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Proxy'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Proxy')
    })

    test('should report assignment to Error', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Error'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Error')
    })

    test('should report assignment to document', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('document'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('document')
    })

    test('should report assignment to navigator', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('navigator'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('navigator')
    })

    test('should report assignment to Intl', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Intl'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Intl')
    })
  })

  describe('message quality', () => {
    test('should include Read-only global in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))

      expect(reports[0].message).toContain('Read-only global')
    })

    test('should include global name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Math'))

      expect(reports[0].message).toContain('Math')
    })

    test('should include should not be modified in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Date'))

      expect(reports[0].message).toContain('should not be modified')
    })
  })
})
