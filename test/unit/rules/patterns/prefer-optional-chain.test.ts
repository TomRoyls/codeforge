import { describe, test, expect, vi } from 'vitest'
import { preferOptionalChainRule } from '../../../../src/rules/patterns/prefer-optional-chain.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'obj && obj.prop',
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

function createLogicalExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBinaryExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown, computed = false): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed,
  }
}

function createChainExpression(expression: unknown): unknown {
  return {
    type: 'ChainExpression',
    expression,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('prefer-optional-chain rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferOptionalChainRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferOptionalChainRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferOptionalChainRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferOptionalChainRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferOptionalChainRule.meta.schema).toBeDefined()
    })

    test('should be code fixable', () => {
      expect(preferOptionalChainRule.meta.fixable).toBe('code')
    })

    test('should mention optional chaining in description', () => {
      expect(preferOptionalChainRule.meta.docs?.description.toLowerCase()).toContain('optional')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(visitor).toHaveProperty('LogicalExpression')
      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting obj && obj.prop pattern in LogicalExpression', () => {
    test('should report obj && obj.prop pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('optional chaining')
    })

    test('should report data && data.value pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const data = createIdentifier('data')
      const value = createIdentifier('value')
      const member = createMemberExpression(data, value)

      visitor.LogicalExpression(createLogicalExpression('&&', data, member))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('optional chaining')
    })

    test('should not report different identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj1 = createIdentifier('obj1')
      const obj2 = createIdentifier('obj2')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj2, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj1, member))

      expect(reports.length).toBe(0)
    })

    test('should not report non-member expression on right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')

      visitor.LogicalExpression(createLogicalExpression('&&', obj, prop))

      expect(reports.length).toBe(0)
    })

    test('should not report || operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('||', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report when right object already uses optional chaining', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)
      const chain = createChainExpression(member)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, chain))

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj', 10, 5)
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('detecting obj != null && obj.prop pattern in LogicalExpression', () => {
    test('should report obj != null && obj.prop pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('optional chaining')
    })

    test('should report obj !== null && obj.prop pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!==', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report obj !== undefined && obj.prop pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const undefinedLit = { type: 'Literal', raw: 'undefined', value: undefined }
      const nullCheck = createBinaryExpression('!==', obj, undefinedLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should not report different identifiers in null check', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj1 = createIdentifier('obj1')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!==', obj1, nullLit)

      const obj2 = createIdentifier('obj2')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj2, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })

    test('should not report non-null check on left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const value = createIdentifier('value')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', value, member))

      expect(reports.length).toBe(0)
    })

    test('should not report equality check (==)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const check = createBinaryExpression('==', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should not report strict equality check (===)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const check = createBinaryExpression('===', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting obj && obj.prop pattern in BinaryExpression', () => {
    test('should report obj && obj.prop pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', obj, member))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('optional chaining')
    })

    test('should report data && data.value pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const data = createIdentifier('data')
      const value = createIdentifier('value')
      const member = createMemberExpression(data, value)

      visitor.BinaryExpression(createBinaryExpression('&&', data, member))

      expect(reports.length).toBe(1)
    })

    test('should not report different identifiers in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj1 = createIdentifier('obj1')
      const obj2 = createIdentifier('obj2')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj2, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', obj1, member))

      expect(reports.length).toBe(0)
    })

    test('should not report non-&& operators in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('||', obj, member))
      visitor.BinaryExpression(createBinaryExpression('+', obj, member))
      visitor.BinaryExpression(createBinaryExpression('==', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report when right object already uses optional chaining in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)
      const chain = createChainExpression(member)

      visitor.BinaryExpression(createBinaryExpression('&&', obj, chain))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting obj != null && obj.prop pattern in BinaryExpression', () => {
    test('should report obj != null && obj.prop pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report obj !== null && obj.prop pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!==', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report obj !== undefined && obj.prop pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const undefinedLit = { type: 'Literal', raw: 'undefined', value: undefined }
      const nullCheck = createBinaryExpression('!==', obj, undefinedLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should not report different identifiers in null check in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj1 = createIdentifier('obj1')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!==', obj1, nullLit)

      const obj2 = createIdentifier('obj2')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj2, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in LogicalExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.LogicalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in LogicalExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.LogicalExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully in LogicalExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.LogicalExpression('string')).not.toThrow()
      expect(() => visitor.LogicalExpression(123)).not.toThrow()
    })

    test('should handle null node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        right: { type: 'Identifier', name: 'obj' },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without object property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = { type: 'MemberExpression', property: prop }

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const member = { type: 'MemberExpression', object: obj }

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(1)
    })

    test('should handle computed property access (should not report)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop, true)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle null check with non-null literal on right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const value = createIdentifier('value')
      const check = createBinaryExpression('!=', obj, value)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier object in member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const call = { type: 'CallExpression', callee: obj }
      const prop = createIdentifier('prop')
      const member = createMemberExpression(call, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier property in member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createLiteral('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention optional chaining in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message.toLowerCase()).toContain('optional')
    })

    test('should mention chaining in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message.toLowerCase()).toContain('chaining')
    })

    test('should mention ?. in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message).toContain('?.')
    })

    test('should mention && in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message).toContain('&&')
    })
  })

  describe('additional edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {
          start: { line: 1, column: 'not-a-number' as unknown as number },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle null check with non-Literal right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const notNull = createIdentifier('notNull')
      const check = createBinaryExpression('!=', obj, notNull)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should handle null check with Literal that is not null/undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const numLit = createLiteral(42)
      const check = createBinaryExpression('!=', obj, numLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should handle null check with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const check = {
        type: 'BinaryExpression',
        operator: '!=',
        right: nullLit,
      }

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should handle null check with non-Identifier left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const call = { type: 'CallExpression', callee: obj }
      const check = createBinaryExpression('!=', call, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should handle member expression with optional=true on object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = { type: 'Identifier', name: 'obj', optional: true } as unknown
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle nodesMatchIdentifier with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(null, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle nodesMatchIdentifier with null rightObject', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = { type: 'MemberExpression', object: null, property: prop }

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle Identifier with non-string name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = { type: 'Identifier', name: 123 as unknown as string }
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with null left in nullCheck', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = {
        type: 'BinaryExpression',
        operator: '!=',
        right: nullLit,
        left: null,
      }

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression nullCheck with non-Identifier rightObject', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const call = { type: 'CallExpression' }
      const prop = createIdentifier('prop')
      const member = createMemberExpression(call, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression nullCheck with non-string rightIdentifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const rightObj = { type: 'Identifier', name: 123 as unknown as string }
      const prop = createIdentifier('prop')
      const member = createMemberExpression(rightObj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {},
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression visitor with non-BinaryExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('obj'),
        right: createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle LogicalExpression visitor with non-LogicalExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: createIdentifier('obj'),
        right: createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
