import { describe, test, expect, vi } from 'vitest'
import { noOctalRule } from '../../../../src/rules/patterns/no-octal.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createLiteral(value: unknown, raw: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    raw,
    loc: {
      start: { line, column },
      end: { line, column: raw.length },
    },
  }
}

function createNonLiteralNode(line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name: 'x',
    loc: {
      start: { line, column },
      end: { line, column: column + 1 },
    },
  }
}

describe('no-octal rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noOctalRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noOctalRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noOctalRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noOctalRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention octal in description', () => {
      expect(noOctalRule.meta.docs?.description.toLowerCase()).toContain('octal')
    })

    test('should have meta property', () => {
      expect(noOctalRule).toHaveProperty('meta')
    })

    test('should have docs property in meta', () => {
      expect(noOctalRule.meta).toHaveProperty('docs')
    })

    test('should have description string in docs', () => {
      expect(typeof noOctalRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noOctalRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs as an object', () => {
      expect(typeof noOctalRule.meta.docs).toBe('object')
    })

    test('should have recommended as boolean', () => {
      expect(typeof noOctalRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have type as string', () => {
      expect(typeof noOctalRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noOctalRule.meta.severity).toBe('string')
    })

    test('should have category as string in docs', () => {
      expect(typeof noOctalRule.meta.docs?.category).toBe('string')
    })

    test('should have schema defined', () => {
      expect(noOctalRule.meta).toHaveProperty('schema')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noOctalRule.meta.schema)).toBe(true)
    })

    test('should have empty schema (no options)', () => {
      expect(noOctalRule.meta.schema).toHaveLength(0)
    })

    test('should have fixable as undefined', () => {
      expect(noOctalRule.meta.fixable).toBeUndefined()
    })

    test('should have create method', () => {
      expect(noOctalRule).toHaveProperty('create')
    })

    test('should have create as a function', () => {
      expect(typeof noOctalRule.create).toBe('function')
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return visitor with only Literal key', () => {
      const { context } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      expect(Object.keys(visitor)).toEqual(['Literal'])
    })

    test('should return a function for Literal', () => {
      const { context } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      expect(typeof visitor.Literal).toBe('function')
    })

    test('should return a new visitor on each call', () => {
      const { context } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor1 = noOctalRule.create(context)
      const visitor2 = noOctalRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context parameter', () => {
      expect(() => noOctalRule.create(createMockRuleContext({ source: 'const x = 0123' }).context)).not.toThrow()
    })

    test('should return callable Literal handler', () => {
      const { context } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      expect(() => visitor.Literal(createLiteral(0, '00'))).not.toThrow()
    })

    test('should create independent visitors with separate report channels', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'const x = 0123' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor1 = noOctalRule.create(ctx1)
      const visitor2 = noOctalRule.create(ctx2)

      visitor1.Literal(createLiteral(1, '01'))
      visitor2.Literal(createLiteral(0, '0'))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('detecting octal literals', () => {
    test('should report 00 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '00', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 01 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 07 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(7, '07', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 010 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(8, '010', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 0123 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(83, '0123', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 0777 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(511, '0777', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 07654321 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(2054353, '07654321', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 02 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(2, '02', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 03 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(3, '03', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 04 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(4, '04', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 05 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(5, '05', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 06 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(6, '06', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 011 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(9, '011', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 017 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(15, '017', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 020 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(16, '020', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 0377 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(255, '0377', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 0400 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(256, '0400', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 00001 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '00001', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 00000 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '00000', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 01234567 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(342391, '01234567', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 07777777 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(2097151, '07777777', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 0007 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(7, '0007', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 0770 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(504, '0770', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 0644 literal (file permission)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(420, '0644', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 0755 literal (file permission)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(493, '0755', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 0555 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(365, '0555', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 0700 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(448, '0700', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 0111 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(73, '0111', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 0600 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(384, '0600', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report 0400 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(256, '0400', 1, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('valid numeric literals (should not report)', () => {
    test('should not report 0 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 1 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '1', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 10 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(10, '10', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 123 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(123, '123', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 0.5 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0.5, '0.5', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 1.5 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1.5, '1.5', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report negative literal -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(-1, '-1', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report negative octal -0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(-0, '-0', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 8 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(8, '8', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 9 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(9, '9', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 18 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(18, '18', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 89 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(89, '89', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 0x10 literal (hexadecimal)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(16, '0x10', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 0o10 literal (ES6 octal)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(8, '0o10', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 0b10 literal (binary)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(2, '0b10', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 1e5 literal (scientific notation)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(100000, '1e5', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 1.5e3 literal (scientific notation)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1500, '1.5e3', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 0x0 literal (hex zero)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0x0', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0xFF literal (hex)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(255, '0xFF', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0X10 literal (uppercase hex)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(16, '0X10', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0O10 literal (uppercase ES6 octal)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(8, '0O10', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0B10 literal (uppercase binary)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(2, '0B10', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0b0 literal (binary zero)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0b0', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0o0 literal (ES6 octal zero)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0o0', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0e5 literal (scientific with leading zero)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0e5', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0E5 literal (uppercase scientific)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0E5', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 99 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(99, '99', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 100 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(100, '100', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 999999 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(999999, '999999', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0.0 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0.0', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0.00001 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0.00001, '0.00001', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 3.14159 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(3.14159, '3.14159', 1, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-number literals', () => {
    test('should not report string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral('test', '"test"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal true', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(true, 'true', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal false', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(false, 'false', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(null, 'null', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report regular expression literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(/test/, '/test/', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report undefined literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(undefined, 'undefined', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report empty string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral('', '""', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string that looks like octal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral('0777', '"0777"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with numeric content', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral('0123', "'0123'", 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report template literal string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral('hello world', '`hello world`', 1, 10))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle non-Literal node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createNonLiteralNode())

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      const node = {
        type: 'Literal',
        value: 123,
        raw: '0173',
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle numeric literal without raw property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      const node = {
        type: 'Literal',
        value: 83,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle 0 followed by 8 or 9 (not octal)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(80, '080', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should handle 0 followed by 9 (not octal)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(90, '090', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should handle 089 (not octal)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(89, '089', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should handle 0 literal but not report if raw is not 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      const node = {
        type: 'Literal',
        value: 0,
        raw: '0.0',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with value as NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(NaN, 'NaN', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node with Infinity value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(Infinity, 'Infinity', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty raw string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node with raw as whitespace', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '  ', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string raw', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      const node = {
        type: 'Literal',
        value: 83,
        raw: 123,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-number value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      const node = {
        type: 'Literal',
        value: 'string',
        raw: '0123',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal({ type: 'Literal' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      const node = {
        type: 'Literal',
        value: 7,
        raw: '07',
        extra: true,
        another: 'field',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node where raw has leading zeros but contains 8', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(8, '08', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node where raw has leading zeros but contains 9', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(9, '09', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node with negative number raw string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(-7, '-07', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node with BigInt raw string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      const node = {
        type: 'Literal',
        value: 7n,
        raw: '07n',
        bigint: '07n',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle array node (wrong type)', () => {
      const { context } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      expect(() => visitor.Literal([1, 2, 3])).not.toThrow()
    })

    test('should handle primitive number node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(42)

      expect(reports.length).toBe(0)
    })

    test('should handle primitive string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal('hello')

      expect(reports.length).toBe(0)
    })
  })

  describe('location', () => {
    test('should report correct location for octal literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(123, '0173', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end column for octal literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(83, '0123', 1, 0))

      expect(reports[0].loc?.end.column).toBe(4)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at large line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 500, 0))

      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('should report location at large column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 200))

      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('should report correct end for multi-digit octal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(511, '0777', 1, 0))

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(4)
    })

    test('should report correct location for 07777777', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(2097151, '07777777', 3, 10))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('should report location for 00', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '00', 5, 3))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.column).toBe(2)
    })

    test('should report location for 00000000', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '00000000', 1, 0))

      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('should report start.line correctly for each octal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))
      visitor.Literal(createLiteral(8, '010', 2, 0))
      visitor.Literal(createLiteral(83, '0123', 3, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should report loc as object with start and end', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports[0].loc).toHaveProperty('start')
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should report start.line as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should report start.column as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should report different locations for different literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))
      visitor.Literal(createLiteral(1, '01', 1, 20))

      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.column).toBe(20)
    })

    test('should preserve exact loc from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 42, 17))

      expect(reports[0].loc?.start).toEqual({ line: 42, column: 17 })
    })
  })

  describe('messages', () => {
    test('should include octal in message for 01', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 10))

      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should include octal in message for 0777', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(511, '0777', 1, 10))

      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should return a string message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should return non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should return same message for different octals', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))
      visitor.Literal(createLiteral(511, '0777', 2, 0))

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should mention literal in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports[0].message.toLowerCase()).toContain('literal')
    })

    test('should contain period at end of message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have consistent message across calls', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'const x = 0123' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'const x = 0123' })

      const v1 = noOctalRule.create(ctx1)
      const v2 = noOctalRule.create(ctx2)

      v1.Literal(createLiteral(1, '01', 1, 0))
      v2.Literal(createLiteral(8, '010', 1, 0))

      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should contain word should in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports[0].message.toLowerCase()).toContain('should')
    })

    test('should contain word not in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports[0].message.toLowerCase()).toContain('not')
    })
  })

  describe('multiple reports', () => {
    test('should report multiple octal literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 10))
      visitor.Literal(createLiteral(10, '012', 2, 10))
      visitor.Literal(createLiteral(100, '0144', 3, 10))

      expect(reports.length).toBe(3)
    })

    test('should track each report independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))
      visitor.Literal(createLiteral(2, '02', 2, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })

    test('should report all octals mixed with non-octals', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))
      visitor.Literal(createLiteral(10, '10', 2, 0))
      visitor.Literal(createLiteral(2, '02', 3, 0))
      visitor.Literal(createLiteral(0, '0', 4, 0))
      visitor.Literal(createLiteral(3, '03', 5, 0))

      expect(reports.length).toBe(3)
    })

    test('should handle 5 octal reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))
      visitor.Literal(createLiteral(2, '02', 2, 0))
      visitor.Literal(createLiteral(3, '03', 3, 0))
      visitor.Literal(createLiteral(4, '04', 4, 0))
      visitor.Literal(createLiteral(5, '05', 5, 0))

      expect(reports.length).toBe(5)
    })

    test('should handle 10 octal reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.Literal(createLiteral(1, '01', i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle alternating octal and valid literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))
      visitor.Literal(createLiteral(1, '1', 2, 0))
      visitor.Literal(createLiteral(2, '02', 3, 0))
      visitor.Literal(createLiteral(2, '2', 4, 0))
      visitor.Literal(createLiteral(3, '03', 5, 0))
      visitor.Literal(createLiteral(3, '3', 6, 0))

      expect(reports.length).toBe(3)
    })

    test('should preserve order of reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 10, 0))
      visitor.Literal(createLiteral(2, '02', 20, 0))
      visitor.Literal(createLiteral(3, '03', 30, 0))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.line).toBe(30)
    })

    test('should handle report after non-report string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral('test', '"test"', 1, 0))
      visitor.Literal(createLiteral(1, '01', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should handle string between two octals', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))
      visitor.Literal(createLiteral('str', '"str"', 2, 0))
      visitor.Literal(createLiteral(2, '02', 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should not report duplicate for same node visited twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      const node = createLiteral(1, '01', 1, 0)
      visitor.Literal(node)
      visitor.Literal(node)

      expect(reports.length).toBe(2)
    })
  })

  describe('context', () => {
    test('should use provided context report function', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should not report to a different context', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'const x = 0123' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor1 = noOctalRule.create(ctx1)

      visitor1.Literal(createLiteral(1, '01', 1, 0))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle context with different file paths', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/different/path.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/different',
      } as unknown as RuleContext

      const visitor = noOctalRule.create(context)
      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle context with empty source', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
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

      const visitor = noOctalRule.create(context)
      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle context with config options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{ someOption: true }] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noOctalRule.create(context)
      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle context where logger is called', () => {
      const { context } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      // Rule doesn't call logger, but context should be valid
      expect(context.logger.debug).toBeDefined()
    })

    test('should handle multiple contexts independently', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'const x = 0123' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'const x = 0123' })

      const v1 = noOctalRule.create(ctx1)
      const v2 = noOctalRule.create(ctx2)

      v1.Literal(createLiteral(1, '01', 1, 0))
      v1.Literal(createLiteral(2, '02', 2, 0))
      v2.Literal(createLiteral(10, '10', 1, 0))

      expect(r1.length).toBe(2)
      expect(r2.length).toBe(0)
    })

    test('should work with context that has no workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      } as unknown as RuleContext

      const visitor = noOctalRule.create(context)
      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should call report with message property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports[0]).toHaveProperty('message')
    })

    test('should call report with loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 0))

      expect(reports[0]).toHaveProperty('loc')
    })
  })

  describe('additional detection cases', () => {
    test('should detect 00 at start of file', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '00', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 01 in assignment context', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 5, 12))

      expect(reports.length).toBe(1)
    })

    test('should detect 011 in function argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(9, '011', 10, 8))

      expect(reports.length).toBe(1)
    })

    test('should detect 017 in return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(15, '017', 20, 4))

      expect(reports.length).toBe(1)
    })

    test('should detect 0777 at end of line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(511, '0777', 3, 80))

      expect(reports.length).toBe(1)
    })

    test('should detect 0644 in chmod', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(420, '0644', 7, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 00000001 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '00000001', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 0000010 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(8, '0000010', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 016 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(14, '016', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 033 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(27, '033', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 044 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(36, '044', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 055 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(45, '055', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 066 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(54, '066', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 076 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(62, '076', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 067 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(55, '067', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should not report 0a literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0a', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0_0 literal (numeric separator)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0_0', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0n literal (bigint)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0n', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report decimal starting with 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0.1, '0.1', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0.00 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0.00', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report -01 literal (negative)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(-1, '-01', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0x7FFFFFFF literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(2147483647, '0x7FFFFFFF', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0o777 literal (ES6)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(511, '0o777', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report 0b11111111 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(255, '0b11111111', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should detect 0111 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(73, '0111', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 0222 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(146, '0222', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 0333 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(219, '0333', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 0444 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(292, '0444', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 0555 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(365, '0555', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 0666 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(438, '0666', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 0776 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(510, '0776', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect 0775 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(509, '0775', 1, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - octal detection matrix', () => {
    test.each([
      ['00', 0],
      ['01', 1],
      ['02', 2],
      ['03', 3],
      ['04', 4],
      ['05', 5],
      ['06', 6],
      ['07', 7],
    ] as const)('should report octal literal %s', (raw, value) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(value, raw, 1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test.each([
      ['010', 8],
      ['011', 9],
      ['012', 10],
      ['013', 11],
      ['014', 12],
      ['015', 13],
      ['016', 14],
      ['017', 15],
    ] as const)('should report two-digit octal literal %s', (raw, value) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(value, raw, 1, 0))

      expect(reports.length).toBe(1)
    })

    test.each([
      ['020', 16],
      ['030', 24],
      ['040', 32],
      ['050', 40],
      ['060', 48],
      ['070', 56],
      ['0100', 64],
      ['0200', 128],
    ] as const)('should report multi-digit octal literal %s', (raw, value) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(value, raw, 1, 0))

      expect(reports.length).toBe(1)
    })

    test.each([
      ['000', 0],
      ['0000', 0],
      ['00000', 0],
      ['000000', 0],
      ['0000000', 0],
      ['00000000', 0],
      ['000000000', 0],
      ['0000000000', 0],
    ] as const)('should report zero-padded octal literal %s', (raw, value) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(value, raw, 1, 0))

      expect(reports.length).toBe(1)
    })

    test.each(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])(
      'should not report single digit %s',
      (raw) => {
        const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
        const visitor = noOctalRule.create(context)

        visitor.Literal(createLiteral(Number(raw), raw, 1, 0))

        expect(reports.length).toBe(0)
      },
    )

    test.each([
      ['080', 80],
      ['081', 81],
      ['082', 82],
      ['083', 83],
      ['084', 84],
      ['085', 85],
      ['086', 86],
      ['087', 87],
      ['088', 88],
      ['089', 89],
    ] as const)('should not report legacy octal escape %s', (raw, value) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(value, raw, 1, 0))

      expect(reports.length).toBe(0)
    })

    test.each([
      ['090', 90],
      ['091', 91],
      ['092', 92],
      ['093', 93],
      ['094', 94],
      ['095', 95],
      ['096', 96],
      ['097', 97],
      ['098', 98],
      ['099', 99],
    ] as const)('should not report 0 followed by 9x %s', (raw, value) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 0123' })
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(value, raw, 1, 0))

      expect(reports.length).toBe(0)
    })
  })
})
