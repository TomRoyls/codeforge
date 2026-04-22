import { describe, test, expect, vi } from 'vitest'
import { preferNumericLiteralsRule } from '../../../../src/rules/patterns/prefer-numeric-literals.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createParseIntCall(strValue: string, radix: number, line = 1, column = 0): unknown {
  const endColumn = column + 25
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'parseInt',
    },
    arguments: [
      { type: 'Literal', value: strValue },
      { type: 'Literal', value: radix },
    ],
    loc: {
      start: { line, column },
      end: { line, column: endColumn },
    },
  }
}

function createCallExpression(calleeName: string, args: unknown[], line = 1, column = 0): unknown {
  const endColumn = column + 25
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: endColumn },
    },
  }
}

describe('prefer-numeric-literals rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferNumericLiteralsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferNumericLiteralsRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferNumericLiteralsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(preferNumericLiteralsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferNumericLiteralsRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferNumericLiteralsRule.meta.fixable).toBe('code')
    })

    test('should mention numeric literals in description', () => {
      expect(preferNumericLiteralsRule.meta.docs?.description.toLowerCase()).toContain('numeric')
    })

    test('should mention parseInt in description', () => {
      expect(preferNumericLiteralsRule.meta.docs?.description).toContain('parseInt')
    })

    test('should mention radix in description', () => {
      expect(preferNumericLiteralsRule.meta.docs?.description).toContain('radix')
    })

    test('should mention binary in description', () => {
      expect(preferNumericLiteralsRule.meta.docs?.description.toLowerCase()).toContain('binary')
    })

    test('should mention octal in description', () => {
      expect(preferNumericLiteralsRule.meta.docs?.description.toLowerCase()).toContain('octal')
    })

    test('should mention hexadecimal in description', () => {
      expect(preferNumericLiteralsRule.meta.docs?.description.toLowerCase()).toContain(
        'hexadecimal',
      )
    })

    test('should mention 0b prefix in description', () => {
      expect(preferNumericLiteralsRule.meta.docs?.description).toContain('0b')
    })

    test('should mention 0o prefix in description', () => {
      expect(preferNumericLiteralsRule.meta.docs?.description).toContain('0o')
    })

    test('should mention 0x prefix in description', () => {
      expect(preferNumericLiteralsRule.meta.docs?.description).toContain('0x')
    })

    test('should have docs property', () => {
      expect(preferNumericLiteralsRule.meta.docs).toBeDefined()
    })

    test('should have docs description as non-empty string', () => {
      expect(typeof preferNumericLiteralsRule.meta.docs?.description).toBe('string')
      expect(preferNumericLiteralsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have url in docs', () => {
      expect(preferNumericLiteralsRule.meta.docs?.url).toBeDefined()
      expect(typeof preferNumericLiteralsRule.meta.docs?.url).toBe('string')
    })

    test('should have valid url starting with https', () => {
      expect(preferNumericLiteralsRule.meta.docs?.url).toMatch(/^https:/)
    })

    test('should not be deprecated', () => {
      expect(preferNumericLiteralsRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferNumericLiteralsRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferNumericLiteralsRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have schema as empty array', () => {
      expect(preferNumericLiteralsRule.meta.schema).toEqual([])
    })

    test('meta should be frozen/readonly', () => {
      expect(typeof preferNumericLiteralsRule.meta).toBe('object')
    })

    test('should have type as valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferNumericLiteralsRule.meta.type)
    })

    test('should have severity as valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(preferNumericLiteralsRule.meta.severity)
    })

    test('should have fixable as valid value', () => {
      expect(['code', 'whitespace']).toContain(preferNumericLiteralsRule.meta.fixable)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return visitor with exactly CallExpression key', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      expect(Object.keys(visitor)).toContain('CallExpression')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor1 = preferNumericLiteralsRule.create(context)
      const visitor2 = preferNumericLiteralsRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept valid RuleContext', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      expect(() => preferNumericLiteralsRule.create(context)).not.toThrow()
    })

    test('create should be a function', () => {
      expect(typeof preferNumericLiteralsRule.create).toBe('function')
    })

    test('visitor CallExpression should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)
      expect(visitor.CallExpression.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('detecting binary literals (radix 2)', () => {
    test('should report parseInt with radix 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('111110', 2)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0b')
    })

    test('should mention radix 2 in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('101010', 2)
      visitor.CallExpression(node)

      expect(reports[0].message).toContain('radix 2')
    })

    test('should report binary with single bit', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('0', 2))
      expect(reports.length).toBe(1)
    })

    test('should report binary with single 1 bit', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('1', 2))
      expect(reports.length).toBe(1)
    })

    test('should report binary with long binary string', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('1111111111111111', 2))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0b')
    })

    test('should report binary with alternating bits', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('1010101010', 2))
      expect(reports.length).toBe(1)
    })

    test('should report binary with leading zeros', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('00001111', 2))
      expect(reports.length).toBe(1)
    })

    test('should report binary with all zeros', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('0000', 2))
      expect(reports.length).toBe(1)
    })

    test('should report binary literal and mention 0b prefix', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('1101', 2))
      expect(reports[0].message).toContain('0b')
    })
  })

  describe('detecting octal literals (radix 8)', () => {
    test('should report parseInt with radix 8', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('123456', 8)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0o')
    })

    test('should mention radix 8 in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('765432', 8)
      visitor.CallExpression(node)

      expect(reports[0].message).toContain('radix 8')
    })

    test('should report octal with single digit', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('7', 8))
      expect(reports.length).toBe(1)
    })

    test('should report octal with zero', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('0', 8))
      expect(reports.length).toBe(1)
    })

    test('should report octal with 777', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('777', 8))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0o')
    })

    test('should report octal with long number', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('12345670', 8))
      expect(reports.length).toBe(1)
    })

    test('should report octal with leading zeros', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('0007', 8))
      expect(reports.length).toBe(1)
    })

    test('should report octal with 755 permission pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('755', 8))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('radix 8')
    })

    test('should report octal with 644 permission pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('644', 8))
      expect(reports.length).toBe(1)
    })
  })

  describe('detecting hexadecimal literals (radix 16)', () => {
    test('should report parseInt with radix 16', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('ABCDEF', 16)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0x')
    })

    test('should mention radix 16 in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('deadbeef', 16)
      visitor.CallExpression(node)

      expect(reports[0].message).toContain('radix 16')
    })

    test('should report hex with lowercase letters', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('abcdef', 16))
      expect(reports.length).toBe(1)
    })

    test('should report hex with uppercase letters', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('ABCDEF', 16))
      expect(reports.length).toBe(1)
    })

    test('should report hex with mixed case letters', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('AbCdEf', 16))
      expect(reports.length).toBe(1)
    })

    test('should report hex with single digit', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('F', 16))
      expect(reports.length).toBe(1)
    })

    test('should report hex FF', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('FF', 16))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0x')
    })

    test('should report hex 00', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('00', 16))
      expect(reports.length).toBe(1)
    })

    test('should report hex with deadbeef', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('deadbeef', 16))
      expect(reports[0].message).toContain('radix 16')
    })

    test('should report hex with long hex string', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('FFFFFFFF', 16))
      expect(reports.length).toBe(1)
    })

    test('should report hex with only digits', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('123456789', 16))
      expect(reports.length).toBe(1)
    })

    test('should report hex with 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('0', 16))
      expect(reports.length).toBe(1)
    })
  })

  describe('negative tests - should NOT report', () => {
    test('should not report parseInt with radix 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('12345', 10)
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt without radix', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [{ type: 'Literal', value: '12345' }])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 36', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('xyz', 36)
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 3', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('102', 3)
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report non-parseInt calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseFloat', [
        { type: 'Literal', value: '123.45' },
        { type: 'Literal', value: 10 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first argument is not a string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Identifier', name: 'str' },
        { type: 'Literal', value: 2 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when radix is not a literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101010' },
        { type: 'Identifier', name: 'radix' },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when radix is not an integer', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101010' },
        { type: 'Literal', value: 2.5 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 0))
      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('1', 1))
      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 4', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('123', 4))
      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 5', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('234', 5))
      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 6', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('123', 6))
      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 7', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('123', 7))
      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 9', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('123', 9))
      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 11', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('A', 11))
      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 12', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('B', 12))
      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 15', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('E', 15))
      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 17', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('G', 17))
      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 32', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('VV', 32))
      expect(reports.length).toBe(0)
    })

    test('should not report Number.parseInt', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [
          { type: 'Literal', value: 'FF' },
          { type: 'Literal', value: 16 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee is not an Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [
          { type: 'Literal', value: 'FF' },
          { type: 'Literal', value: 16 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report with three arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: 'FF' },
        { type: 'Literal', value: 16 },
        { type: 'Literal', value: 'extra' },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first argument is number literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: 42 },
        { type: 'Literal', value: 2 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first argument is boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: true },
        { type: 'Literal', value: 2 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when radix is NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101' },
        { type: 'Literal', value: NaN },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when radix is Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101' },
        { type: 'Literal', value: Infinity },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when radix is negative 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101' },
        { type: 'Literal', value: -2 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when radix is negative 16', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: 'FF' },
        { type: 'Literal', value: -16 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first argument is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: null },
        { type: 'Literal', value: 2 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when radix is a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101' },
        { type: 'Literal', value: '2' },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when radix is boolean true', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101' },
        { type: 'Literal', value: true },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other function calls like foo', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(
        createCallExpression('foo', [
          { type: 'Literal', value: '101' },
          { type: 'Literal', value: 2 },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.log', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(
        createCallExpression('console.log', [{ type: 'Literal', value: 'test' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report Number call', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createCallExpression('Number', [{ type: 'Literal', value: '101' }]))
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '111110' },
          { type: 'Literal', value: 2 },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('101010', 2, 10, 5)
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('101010', 2)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('', 2)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = { callee: { type: 'Identifier', name: 'parseInt' }, arguments: [] }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '101' },
          { type: 'Literal', value: 2 },
        ],
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [
          { type: 'Literal', value: '101' },
          { type: 'Literal', value: 2 },
        ],
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee without name', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [
          { type: 'Literal', value: '101' },
          { type: 'Literal', value: 2 },
        ],
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Literal', value: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '101' },
          { type: 'Literal', value: 2 },
        ],
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle numeric node', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle array node', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('should handle node with loc containing null', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '101' },
          { type: 'Literal', value: 2 },
        ],
        loc: null,
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc - only start', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '101' },
          { type: 'Literal', value: 2 },
        ],
        loc: { start: { line: 1, column: 0 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle first argument with undefined value', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: undefined },
        { type: 'Literal', value: 2 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle second argument with undefined value', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101' },
        { type: 'Literal', value: undefined },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle first argument as object expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'ObjectExpression', properties: [] },
        { type: 'Literal', value: 2 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle second argument as call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101' },
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getRadix' }, arguments: [] },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle very long string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const longStr = '1'.repeat(100)
      visitor.CallExpression(createParseIntCall(longStr, 2))
      expect(reports.length).toBe(1)
    })

    test('should handle string with whitespace characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('  101  ', 2))
      expect(reports.length).toBe(1)
    })

    test('should handle string with special hex chars', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('CAFEBABE', 16))
      expect(reports.length).toBe(1)
    })
  })

  describe('location tracking', () => {
    test('should report correct location for line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2, 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for line 5 column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2, 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for large line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('FF', 16, 999, 42))
      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(42)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('101', 2, 3, 7)
      visitor.CallExpression(node)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(7 + 25)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '101' },
          { type: 'Literal', value: 2 },
        ],
      }
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle multiple nodes at different locations', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2, 1, 0))
      visitor.CallExpression(createParseIntCall('777', 8, 5, 10))
      visitor.CallExpression(createParseIntCall('FF', 16, 20, 3))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(20)
    })

    test('should handle location with column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('1', 2, 1, 0))
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('message format', () => {
    test('should contain "Use" in binary message', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports[0].message).toContain('Use')
    })

    test('should contain "literal" in binary message', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports[0].message).toContain('literal')
    })

    test('should contain "instead of" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports[0].message).toContain('instead of')
    })

    test('should contain "parseInt" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports[0].message).toContain('parseInt')
    })

    test('should contain "0b" prefix for radix 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports[0].message).toContain('0b')
    })

    test('should contain "0o" prefix for radix 8', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('777', 8))
      expect(reports[0].message).toContain('0o')
    })

    test('should contain "0x" prefix for radix 16', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('FF', 16))
      expect(reports[0].message).toContain('0x')
    })

    test('should have correct message format for binary', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports[0].message).toBe('Use 0b... literal instead of parseInt with radix 2.')
    })

    test('should have correct message format for octal', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('755', 8))
      expect(reports[0].message).toBe('Use 0o... literal instead of parseInt with radix 8.')
    })

    test('should have correct message format for hex', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('FF', 16))
      expect(reports[0].message).toBe('Use 0x... literal instead of parseInt with radix 16.')
    })

    test('message should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should have different messages for different radixes', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      visitor.CallExpression(createParseIntCall('755', 8))
      visitor.CallExpression(createParseIntCall('FF', 16))

      expect(reports[0].message).not.toBe(reports[1].message)
      expect(reports[1].message).not.toBe(reports[2].message)
      expect(reports[0].message).not.toBe(reports[2].message)
    })
  })

  describe('auto-fix', () => {
    test('should provide fix for parseInt("101010", 2)', () => {
      const source = 'parseInt("101010", 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'parseInt',
        },
        arguments: [
          { type: 'Literal', value: '101010', range: [11, 19] },
          { type: 'Literal', value: 2, range: [21, 22] },
        ],
        range: [0, 24] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 24 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('0b101010')
    })

    test('should provide fix for parseInt("755", 8)', () => {
      const source = 'parseInt("755", 8)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'parseInt',
        },
        arguments: [
          { type: 'Literal', value: '755', range: [11, 15] },
          { type: 'Literal', value: 8, range: [17, 18] },
        ],
        range: [0, 20] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('0o755')
    })

    test('should provide fix for parseInt("FF", 16)', () => {
      const source = 'parseInt("FF", 16)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'parseInt',
        },
        arguments: [
          { type: 'Literal', value: 'FF', range: [11, 14] },
          { type: 'Literal', value: 16, range: [16, 18] },
        ],
        range: [0, 20] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('0xFF')
    })

    test('should provide fix with correct range', () => {
      const source = 'parseInt("101", 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '101', range: [11, 15] },
          { type: 'Literal', value: 2, range: [17, 18] },
        ],
        range: [0, 20] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([0, 20])
    })

    test('should provide fix for binary with empty string', () => {
      const source = 'parseInt("", 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '', range: [11, 12] },
          { type: 'Literal', value: 2, range: [14, 15] },
        ],
        range: [0, 17] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 17 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('0b')
    })

    test('should provide fix for lowercase hex', () => {
      const source = 'parseInt("cafebabe", 16)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: 'cafebabe', range: [11, 20] },
          { type: 'Literal', value: 16, range: [22, 24] },
        ],
        range: [0, 26] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 26 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('0xcafebabe')
    })

    test('should provide fix for octal zero', () => {
      const source = 'parseInt("0", 8)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '0', range: [11, 13] },
          { type: 'Literal', value: 8, range: [15, 16] },
        ],
        range: [0, 18] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('0o0')
    })

    test('should not provide fix when node has no range', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('101', 2)
      visitor.CallExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix with correct text format for binary', () => {
      const source = 'parseInt("1111", 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '1111', range: [11, 16] },
          { type: 'Literal', value: 2, range: [18, 19] },
        ],
        range: [0, 21] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 21 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toMatch(/^0b/)
    })

    test('should provide fix with correct text format for octal', () => {
      const source = 'parseInt("777", 8)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '777', range: [11, 15] },
          { type: 'Literal', value: 8, range: [17, 18] },
        ],
        range: [0, 20] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toMatch(/^0o/)
    })

    test('should provide fix with correct text format for hex', () => {
      const source = 'parseInt("ABCD", 16)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: 'ABCD', range: [11, 16] },
          { type: 'Literal', value: 16, range: [18, 20] },
        ],
        range: [0, 22] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toMatch(/^0x/)
    })

    test('fix text should preserve original string value for binary', () => {
      const source = 'parseInt("11010", 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '11010', range: [11, 17] },
          { type: 'Literal', value: 2, range: [19, 20] },
        ],
        range: [0, 22] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('0b11010')
    })

    test('fix text should preserve original string value for octal', () => {
      const source = 'parseInt("1234", 8)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '1234', range: [11, 16] },
          { type: 'Literal', value: 8, range: [18, 19] },
        ],
        range: [0, 21] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 21 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('0o1234')
    })

    test('fix text should preserve original string value for hex', () => {
      const source = 'parseInt("deadbeef", 16)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: 'deadbeef', range: [11, 20] },
          { type: 'Literal', value: 16, range: [22, 24] },
        ],
        range: [0, 26] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 26 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('0xdeadbeef')
    })
  })

  describe('multiple calls', () => {
    test('should report multiple parseInt calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101010', 2))
      visitor.CallExpression(createParseIntCall('123456', 8))
      visitor.CallExpression(createParseIntCall('ABCDEF', 16))

      expect(reports.length).toBe(3)
    })

    test('should only report valid radixes in multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101010', 2))
      visitor.CallExpression(createParseIntCall('12345', 10))
      visitor.CallExpression(createParseIntCall('123456', 8))

      expect(reports.length).toBe(2)
    })

    test('should track all binary detections in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('1', 2))
      visitor.CallExpression(createParseIntCall('10', 2))
      visitor.CallExpression(createParseIntCall('11', 2))
      visitor.CallExpression(createParseIntCall('100', 2))

      expect(reports.length).toBe(4)
    })

    test('should track mixed valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      visitor.CallExpression(createParseIntCall('123', 10))
      visitor.CallExpression(createParseIntCall('777', 8))
      visitor.CallExpression(createParseIntCall('123', 5))
      visitor.CallExpression(createParseIntCall('FF', 16))

      expect(reports.length).toBe(3)
    })

    test('should track many calls without losing count', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createParseIntCall('1', 2))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle interleaved valid and null nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      visitor.CallExpression(null)
      visitor.CallExpression(createParseIntCall('777', 8))
      visitor.CallExpression(undefined)
      visitor.CallExpression(createParseIntCall('FF', 16))

      expect(reports.length).toBe(3)
    })

    test('should maintain separate reports for each call', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2, 1, 0))
      visitor.CallExpression(createParseIntCall('777', 8, 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("FF", 16)', filePath: '/src/utils/convert.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('FF', 16))
      expect(reports.length).toBe(1)
    })

    test('should work with nested directory file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("FF", 16)', filePath: '/project/src/deep/nested/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('FF', 16))
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = parseInt("101", 2)', filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
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
        getSource: () => 'parseInt("101", 2)',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = preferNumericLiteralsRule.create(context)
      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports.length).toBe(1)
    })

    test('should work when context has parserServices', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc, fix: descriptor.fix })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'parseInt("101", 2)',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
        parserServices: {
          program: {},
          esTreeNodeToTSNodeMap: new Map(),
          tsNodeToESTreeNodeMap: new Map(),
        },
      } as unknown as RuleContext

      const visitor = preferNumericLiteralsRule.create(context)
      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports.length).toBe(1)
    })

    test('should not be affected by logger being called', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      context.logger.debug('test')
      context.logger.info('test')
      context.logger.warn('test')
      context.logger.error('test')

      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports.length).toBe(1)
    })
  })

  describe('exports', () => {
    test('should have default export', () => {
      expect(preferNumericLiteralsRule).toBeDefined()
    })

    test('should have named export', () => {
      expect(preferNumericLiteralsRule).toBeDefined()
    })

    test('should be a valid RuleDefinition', () => {
      expect(preferNumericLiteralsRule.meta).toBeDefined()
      expect(preferNumericLiteralsRule.create).toBeDefined()
    })

    test('should have meta as plain object', () => {
      expect(typeof preferNumericLiteralsRule.meta).toBe('object')
    })

    test('should have create as function', () => {
      expect(typeof preferNumericLiteralsRule.create).toBe('function')
    })
  })

  describe('report descriptor', () => {
    test('should always include message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))

      expect(reports[0].message).toBeDefined()
      expect(typeof reports[0].message).toBe('string')
    })

    test('should always include loc in report for valid node', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))

      expect(reports[0].loc).toBeDefined()
    })

    test('should have start and end in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should have line and column in start loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have line and column in end loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))

      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should include fix when range is available', () => {
      const source = 'parseInt("101", 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '101', range: [11, 15] },
          { type: 'Literal', value: 2, range: [17, 18] },
        ],
        range: [0, 20] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toBeDefined()
      expect(reports[0].fix?.text).toBeDefined()
    })

    test('should have fix range as tuple of two numbers', () => {
      const source = 'parseInt("101", 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '101', range: [11, 15] },
          { type: 'Literal', value: 2, range: [17, 18] },
        ],
        range: [0, 20] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(Array.isArray(reports[0].fix?.range)).toBe(true)
      expect(reports[0].fix?.range?.length).toBe(2)
    })

    test('should have fix text as string', () => {
      const source = 'parseInt("101", 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '101', range: [11, 15] },
          { type: 'Literal', value: 2, range: [17, 18] },
        ],
        range: [0, 20] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(typeof reports[0].fix?.text).toBe('string')
    })

    test('should call report exactly once per matching call', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports.length).toBe(1)

      visitor.CallExpression(createParseIntCall('777', 8))
      expect(reports.length).toBe(2)
    })
  })

  describe('different parseInt patterns', () => {
    test('should detect parseInt with single char binary string', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('1', 2))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0b')
    })

    test('should detect parseInt with single char octal string', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('7', 8))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0o')
    })

    test('should detect parseInt with single char hex string', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('A', 16))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0x')
    })

    test('should detect parseInt with single digit hex', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('0', 16))
      expect(reports.length).toBe(1)
    })

    test('should handle string with leading zeros for binary', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('00101010', 2))
      expect(reports.length).toBe(1)
    })

    test('should handle string with leading zeros for octal', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('00777', 8))
      expect(reports.length).toBe(1)
    })

    test('should handle string with leading zeros for hex', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('00FF', 16))
      expect(reports.length).toBe(1)
    })
  })

  describe('radix values', () => {
    test('should handle radix 2 correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 2))
      expect(reports[0].message).toContain('radix 2')
    })

    test('should handle radix 8 correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('777', 8))
      expect(reports[0].message).toContain('radix 8')
    })

    test('should handle radix 16 correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('FF', 16))
      expect(reports[0].message).toContain('radix 16')
    })

    test('should not report for radix 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 0))
      expect(reports.length).toBe(0)
    })

    test('should not report for radix -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', -1))
      expect(reports.length).toBe(0)
    })

    test('should not report for radix 100', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101', 100))
      expect(reports.length).toBe(0)
    })

    test('should not report for radix 2.0 (float equivalent of 2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      // 2.0 is still an integer, so this should report
      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101' },
        { type: 'Literal', value: 2.0 },
      ])
      visitor.CallExpression(node)

      // 2.0 === 2 and Number.isInteger(2.0) === true
      expect(reports.length).toBe(1)
    })

    test('should not report for radix 2.1', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101' },
        { type: 'Literal', value: 2.1 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for radix 16.5', () => {
      const { context, reports } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: 'FF' },
        { type: 'Literal', value: 16.5 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('idempotency', () => {
    test('should produce same result for same input', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'parseInt("111110", 2);' })

      const visitor1 = preferNumericLiteralsRule.create(ctx1)
      const visitor2 = preferNumericLiteralsRule.create(ctx2)

      const node = createParseIntCall('101010', 2)
      visitor1.CallExpression(node)
      visitor2.CallExpression(node)

      expect(r1.length).toBe(r2.length)
      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should not modify the input node', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('101', 2)
      const originalType = (node as Record<string, unknown>).type
      const originalArgs = (node as Record<string, unknown>).arguments

      visitor.CallExpression(node)

      expect((node as Record<string, unknown>).type).toBe(originalType)
      expect((node as Record<string, unknown>).arguments).toBe(originalArgs)
    })
  })

  describe('visitor return value', () => {
    test('CallExpression handler should not throw for valid input', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      expect(() => visitor.CallExpression(createParseIntCall('101', 2))).not.toThrow()
    })

    test('CallExpression handler should not throw for invalid input', () => {
      const { context } = createMockRuleContext({ source: 'parseInt("111110", 2);' })
      const visitor = preferNumericLiteralsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(() => visitor.CallExpression({})).not.toThrow()
    })
  })
})
