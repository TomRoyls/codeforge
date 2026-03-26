import { describe, test, expect, vi } from 'vitest'
import { noIteratorRule } from '../../../../src/rules/patterns/no-iterator.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'obj.__iterator__',
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

function createMemberExpression(propertyName: string, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'obj',
    },
    property: {
      type: 'Identifier',
      name: propertyName,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createMemberExpressionWithLiteralProperty(
  propertyValue: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'obj',
    },
    property: {
      type: 'Literal',
      value: propertyValue,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createAssignmentExpression(propertyName: string, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    left: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'obj',
      },
      property: {
        type: 'Identifier',
        name: propertyName,
      },
    },
    right: {
      type: 'FunctionExpression',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createAssignmentExpressionWithLiteral(
  propertyValue: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    left: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'obj',
      },
      property: {
        type: 'Literal',
        value: propertyValue,
      },
    },
    right: {
      type: 'FunctionExpression',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

describe('no-iterator rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noIteratorRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noIteratorRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noIteratorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noIteratorRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noIteratorRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noIteratorRule.meta.fixable).toBeUndefined()
    })

    test('should mention iterator in description', () => {
      expect(noIteratorRule.meta.docs?.description.toLowerCase()).toContain('iterator')
    })

    test('should have empty schema array', () => {
      expect(noIteratorRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with MemberExpression method', () => {
      const { context } = createMockContext()
      const visitor = noIteratorRule.create(context)

      expect(visitor).toHaveProperty('MemberExpression')
    })

    test('should return visitor object with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = noIteratorRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
    })
  })

  describe('detecting __iterator__', () => {
    test('should report obj.__iterator__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__iterator__'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__iterator__')
    })

    test('should report obj.__iterator__ assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('__iterator__'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__iterator__')
    })
  })

  describe('detecting __defineIterator__', () => {
    test('should report obj.__defineIterator__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__defineIterator__'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__defineIterator__')
    })

    test('should report obj.__defineIterator__ assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('__defineIterator__'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__defineIterator__')
    })
  })

  describe('detecting __defineSetter__', () => {
    test('should report obj.__defineSetter__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__defineSetter__'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__defineSetter__')
    })

    test('should report obj.__defineSetter__ assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('__defineSetter__'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__defineSetter__')
    })
  })

  describe('detecting custom iterator patterns', () => {
    test('should report __customIterator__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__customIterator__'))

      expect(reports.length).toBe(1)
    })

    test('should report __myIterator__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__myIterator__'))

      expect(reports.length).toBe(1)
    })

    test('should report __ITERATOR__ access (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__ITERATOR__'))

      expect(reports.length).toBe(1)
    })

    test('should report __CustomIterator__ access (mixed case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__CustomIterator__'))

      expect(reports.length).toBe(1)
    })

    test('should report custom iterator assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('__myCustomIterator__'))

      expect(reports.length).toBe(1)
    })
  })

  describe('allowing regular properties', () => {
    test('should not report regular property access', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('name'))
      visitor.MemberExpression(createMemberExpression('value'))
      visitor.MemberExpression(createMemberExpression('toString'))

      expect(reports.length).toBe(0)
    })

    test('should not report regular property assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('name'))
      visitor.AssignmentExpression(createAssignmentExpression('value'))

      expect(reports.length).toBe(0)
    })

    test('should not report properties starting with single underscore', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('_iterator'))
      visitor.MemberExpression(createMemberExpression('_privateIterator'))

      expect(reports.length).toBe(0)
    })

    test('should not report properties without iterator in name', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__private'))
      visitor.MemberExpression(createMemberExpression('__custom'))

      expect(reports.length).toBe(0)
    })
  })

  describe('literal property access', () => {
    test('should report obj["__iterator__"] access', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpressionWithLiteralProperty('__iterator__'))

      expect(reports.length).toBe(1)
    })

    test('should report obj["__defineIterator__"] access', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpressionWithLiteralProperty('__defineIterator__'))

      expect(reports.length).toBe(1)
    })

    test('should report assignment with literal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpressionWithLiteral('__iterator__'))

      expect(reports.length).toBe(1)
    })

    test('should not report regular literal property access', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpressionWithLiteralProperty('name'))
      visitor.MemberExpression(createMemberExpressionWithLiteralProperty('value'))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should include property name in member expression message', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__iterator__'))

      expect(reports[0].message).toContain('__iterator__')
      expect(reports[0].message).toContain('Non-standard')
    })

    test('should mention assignment in assignment expression message', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('__iterator__'))

      expect(reports[0].message).toContain('assignment')
    })

    test('should mention "avoided" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__iterator__'))

      expect(reports[0].message.toLowerCase()).toContain('avoid')
    })
  })

  describe('edge cases', () => {
    test('should handle null MemberExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noIteratorRule.create(context)

      expect(() => visitor.MemberExpression(null)).not.toThrow()
    })

    test('should handle undefined MemberExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noIteratorRule.create(context)

      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
    })

    test('should handle non-object MemberExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noIteratorRule.create(context)

      expect(() => visitor.MemberExpression('string')).not.toThrow()
      expect(() => visitor.MemberExpression(123)).not.toThrow()
    })

    test('should handle null AssignmentExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noIteratorRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined AssignmentExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noIteratorRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle non-object AssignmentExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noIteratorRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(() => visitor.AssignmentExpression(123)).not.toThrow()
    })

    test('should handle MemberExpression without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      const node = { property: { type: 'Identifier', name: '__iterator__' } }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      const node = {
        type: 'CallExpression',
        property: { type: 'Identifier', name: '__iterator__' },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      const node = {
        left: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: '__iterator__' },
        },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      const node = {
        type: 'CallExpression',
        left: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: '__iterator__' },
        },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression without left', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      const node = {
        type: 'AssignmentExpression',
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: null,
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with non-MemberExpression left', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'Identifier',
          name: 'x',
        },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'CallExpression' },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with non-string Identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 123 as unknown as string },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with non-string Literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Literal', value: 123 },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__iterator__', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple iterator property accesses', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__iterator__'))
      visitor.MemberExpression(createMemberExpression('__defineIterator__'))
      visitor.MemberExpression(createMemberExpression('__myIterator__'))

      expect(reports.length).toBe(3)
    })

    test('should report both member and assignment expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noIteratorRule.create(context)

      visitor.MemberExpression(createMemberExpression('__iterator__'))
      visitor.AssignmentExpression(createAssignmentExpression('__iterator__'))

      expect(reports.length).toBe(2)
    })
  })
})
