import { describe, test, expect } from 'vitest'
import { validTypeofRule } from '../../../../src/rules/patterns/valid-typeof.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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
      end: { line, column: column + 10 },
    },
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('valid-typeof rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(validTypeofRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(validTypeofRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(validTypeofRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(validTypeofRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention typeof in description', () => {
      expect(validTypeofRule.meta.docs?.description.toLowerCase()).toContain('typeof')
    })
  })

  describe('create', () => {
    test('should return visitor with BinaryExpression method', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return a function for BinaryExpression', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return a visitor object from create', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })
  })

  describe('detecting invalid typeof comparisons', () => {
    test('should report typeof x === "invalid"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('invalid'),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('invalid')
    })

    test('should report "invalid" === typeof x', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createLiteral('invalid'),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x !== "invalid"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('invalid'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report typeof x === "string"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('string'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "number"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('number'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "boolean"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('boolean'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "undefined"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('undefined'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "object"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('object'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "function"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('function'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "symbol"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('symbol'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "bigint"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bigint'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report non-typeof comparisons', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral('string')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report non-string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(123),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('invalid'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('meta properties - comprehensive', () => {
    test('meta should be defined', () => {
      expect(validTypeofRule.meta).toBeDefined()
    })

    test('meta type should be a string', () => {
      expect(typeof validTypeofRule.meta.type).toBe('string')
    })

    test('meta severity should be a string', () => {
      expect(typeof validTypeofRule.meta.severity).toBe('string')
    })

    test('meta docs should be defined', () => {
      expect(validTypeofRule.meta.docs).toBeDefined()
    })

    test('meta docs description should be a non-empty string', () => {
      expect(typeof validTypeofRule.meta.docs?.description).toBe('string')
      expect(validTypeofRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta docs category should be a string', () => {
      expect(typeof validTypeofRule.meta.docs?.category).toBe('string')
    })

    test('meta docs recommended should be a boolean', () => {
      expect(typeof validTypeofRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta schema should be an array', () => {
      expect(Array.isArray(validTypeofRule.meta.schema)).toBe(true)
    })

    test('meta schema should be empty', () => {
      expect(validTypeofRule.meta.schema).toEqual([])
    })

    test('meta fixable should be undefined', () => {
      expect(validTypeofRule.meta.fixable).toBeUndefined()
    })

    test('meta deprecated should be undefined or false', () => {
      expect(validTypeofRule.meta.deprecated).toBeFalsy()
    })

    test('meta type should not be suggestion', () => {
      expect(validTypeofRule.meta.type).not.toBe('suggestion')
    })

    test('meta type should not be layout', () => {
      expect(validTypeofRule.meta.type).not.toBe('layout')
    })

    test('meta severity should not be off', () => {
      expect(validTypeofRule.meta.severity).not.toBe('off')
    })

    test('meta severity should not be warn', () => {
      expect(validTypeofRule.meta.severity).not.toBe('warn')
    })

    test('description should mention valid', () => {
      expect(validTypeofRule.meta.docs?.description.toLowerCase()).toContain('valid')
    })

    test('description should mention comparison', () => {
      expect(validTypeofRule.meta.docs?.description.toLowerCase()).toContain('compar')
    })

    test('description should contain typeof and valid', () => {
      const desc = validTypeofRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('typeof')
      expect(desc).toContain('valid')
    })
  })

  describe('create visitor - comprehensive', () => {
    test('create should be a function', () => {
      expect(typeof validTypeofRule.create).toBe('function')
    })

    test('create should return only BinaryExpression key', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toContain('BinaryExpression')
    })

    test('BinaryExpression should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(visitor.BinaryExpression.length).toBe(1)
    })

    test('calling create multiple times returns independent visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'typeof x === "string"' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor1 = validTypeofRule.create(ctx1)
      const visitor2 = validTypeofRule.create(ctx2)

      visitor1.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad'),
        ),
      )

      visitor2.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('y')),
          createLiteral('string'),
        ),
      )

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('calling BinaryExpression multiple times on same visitor reports each', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('foo'),
        ),
      )
      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('y')),
          createLiteral('bar'),
        ),
      )

      expect(reports.length).toBe(2)
    })
  })

  describe('invalid typeof string values', () => {
    const invalidValues = [
      'invalid',
      'array',
      'Array',
      'null',
      'Null',
      'NULL',
      'int',
      'Integer',
      'float',
      'Float',
      'double',
      'Double',
      'real',
      'Real',
      'char',
      'Char',
      'list',
      'List',
      'map',
      'Map',
      'set',
      'Set',
      'tuple',
      'Tuple',
      'date',
      'Date',
      'regex',
      'RegExp',
      'promise',
      'Promise',
      'object ',
      ' object',
      'OBJECT',
      'STRING',
      'NUMBER',
      'BOOLEAN',
      'FUNCTION',
      'SYMBOL',
      'BIGINT',
      'undefiend',
      'undefinded',
      'undfined',
      'funtion',
      'fucntion',
      'fucntoin',
      'bool',
      'Bool',
      'num',
      'Num',
      'str',
      'Str',
      'obj',
      'Obj',
      'sym',
      'Sym',
      'class',
      'Class',
      'constructor',
      'prototype',
      'NaN',
      'Infinity',
      '-Infinity',
    ]

    test.each(invalidValues)('should report typeof x === "%s"', (val) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(val),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(val)
    })
  })

  describe('valid typeof string values - comprehensive', () => {
    const validValues = [
      'string',
      'number',
      'boolean',
      'undefined',
      'object',
      'function',
      'symbol',
      'bigint',
    ]

    test.each(validValues)('should not report typeof x === "%s"', (val) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(val),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test.each(validValues)('should not report typeof x !== "%s"', (val) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(val),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test.each(validValues)('should not report "%s" === typeof x', (val) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createLiteral(val),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test.each(validValues)('should not report "%s" !== typeof x', (val) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createLiteral(val),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('reversed operand order (literal on left, typeof on right)', () => {
    test('should report "bad" === typeof x', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createLiteral('bad'),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report "bad" !== typeof x', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createLiteral('bad'),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report "unknown" === typeof foo', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createLiteral('unknown'),
          createUnaryExpression('typeof', createIdentifier('foo')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report "void" !== typeof result', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createLiteral('void'),
          createUnaryExpression('typeof', createIdentifier('result')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should include the invalid value in message for reversed order', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createLiteral('mytype'),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports[0].message).toContain('mytype')
    })
  })

  describe('operators that should not trigger reports', () => {
    const ignoredOperators = [
      '==',
      '!=',
      '<',
      '>',
      '<=',
      '>=',
      '+',
      '-',
      '*',
      '/',
      '%',
      '**',
      '&',
      '|',
      '^',
      '<<',
      '>>',
      '>>>',
      '&&',
      '||',
      '??',
      'in',
      'instanceof',
    ]

    test.each(ignoredOperators)('should not report typeof x %s "invalid"', (op) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          op,
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('invalid'),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('message content', () => {
    test('report message should contain the invalid value', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('mytype'),
        ),
      )

      expect(reports[0].message).toContain('mytype')
    })

    test('report message should contain "Invalid typeof comparison"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('badvalue'),
        ),
      )

      expect(reports[0].message).toContain('Invalid typeof comparison')
    })

    test('report message should include single quotes around value', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('foo'),
        ),
      )

      expect(reports[0].message).toContain("'foo'")
    })

    test('report message should end with a period', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('wrong'),
        ),
      )

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('report message should contain the word typeof', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('wrong'),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('typeof')
    })

    test('report message should contain the word comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('wrong'),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('comparison')
    })

    test('different invalid values produce different messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('alpha'),
        ),
      )
      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('y')),
          createLiteral('beta'),
        ),
      )

      expect(reports[0].message).not.toBe(reports[1].message)
      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('beta')
    })
  })

  describe('location reporting', () => {
    test('should include location in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad'),
          5,
          10,
        ),
      )

      expect(reports[0].loc).toBeDefined()
    })

    test('should report correct start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad'),
          3,
          0,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad'),
          1,
          8,
        ),
      )

      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad'),
          7,
          2,
        ),
      )

      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad'),
          1,
          5,
        ),
      )

      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad'),
        ),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('nodes without loc', () => {
    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('invalid'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should default to line 1 column 0 when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('bad'),
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('bad'),
        loc: null,
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('bad'),
        loc: undefined,
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with empty loc object', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('bad'),
        loc: {},
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('non-string literal values', () => {
    test('should not report typeof x === 42', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(42),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === true', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(true),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === false', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(false),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === null', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(null),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(undefined),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === 3.14', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(3.14),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(-1),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('non-typeof unary operators', () => {
    const nonTypeofOps = ['!', '-', '+', '~', 'delete', 'void', 'typeof_extra']

    test.each(nonTypeofOps)('should not report %s x === "invalid"', (op) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression(op, createIdentifier('x')),
          createLiteral('invalid'),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('non-literal right operand', () => {
    test('should not report typeof x === y (identifier on right)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createIdentifier('y'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === typeof y', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createUnaryExpression('typeof', createIdentifier('y')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when right is a call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          callExpr,
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when right is a member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('prop'),
      }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          memberExpr,
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when left is an identifier (no typeof)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral('invalid')),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('malformed nodes', () => {
    test('should handle node with missing left property', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        right: createLiteral('invalid'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing right property', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null left', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: null,
        right: createLiteral('invalid'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null right', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(() => visitor.BinaryExpression({})).not.toThrow()
    })

    test('should handle node that is a string', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
    })

    test('should handle node that is a number', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(() => visitor.BinaryExpression(42)).not.toThrow()
    })

    test('should handle node that is a boolean', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(() => visitor.BinaryExpression(true)).not.toThrow()
    })

    test('should handle node that is an array', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(() => visitor.BinaryExpression([1, 2, 3])).not.toThrow()
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'Literal',
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('invalid'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric type', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 42,
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('invalid'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle typeof without operator property on argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const unaryNoOp = {
        type: 'UnaryExpression',
        argument: createIdentifier('x'),
        prefix: true,
      }

      visitor.BinaryExpression(createBinaryExpression('===', unaryNoOp, createLiteral('invalid')))

      expect(reports.length).toBe(0)
    })

    test('should handle literal without value property', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const literalNoValue = { type: 'Literal' }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          literalNoValue,
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple reports', () => {
    test('should report each invalid comparison separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(
            '===',
            createUnaryExpression('typeof', createIdentifier(`x${i}`)),
            createLiteral(`invalid${i}`),
          ),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should report mixed valid and invalid comparisons correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('string'),
        ),
      )
      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('y')),
          createLiteral('bogus'),
        ),
      )
      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('z')),
          createLiteral('number'),
        ),
      )
      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('w')),
          createLiteral('notreal'),
        ),
      )

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('bogus')
      expect(reports[1].message).toContain('notreal')
    })

    test('should track reports correctly per context', () => {
      const ctx1 = createMockRuleContext({ source: 'typeof x === "string"' })
      const ctx2 = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor1 = validTypeofRule.create(ctx1.context)
      const visitor2 = validTypeofRule.create(ctx2.context)

      visitor1.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad1'),
        ),
      )
      visitor1.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('y')),
          createLiteral('bad2'),
        ),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('z')),
          createLiteral('bad3'),
        ),
      )

      expect(ctx1.reports.length).toBe(2)
      expect(ctx2.reports.length).toBe(1)
    })
  })

  describe('!== operator', () => {
    test('should report typeof x !== "badtype"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('badtype'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report "badtype" !== typeof x', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createLiteral('badtype'),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof foo !== "unknown"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createUnaryExpression('typeof', createIdentifier('foo')),
          createLiteral('unknown'),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unknown')
    })
  })

  describe('empty string and whitespace', () => {
    test('should report typeof x === ""', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(''),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === " "', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(' '),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === " string"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(' string'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "string "', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('string '),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "\\tstring"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('\tstring'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "String"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('String'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "Number"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('Number'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "Boolean"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('Boolean'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "Object"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('Object'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "Function"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('Function'),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should export validTypeofRule as named export', () => {
      expect(validTypeofRule).toBeDefined()
    })

    test('should have create method on exported rule', () => {
      expect(typeof validTypeofRule.create).toBe('function')
    })

    test('should have meta property on exported rule', () => {
      expect(validTypeofRule.meta).toBeDefined()
    })

    test('exported rule should be an object', () => {
      expect(typeof validTypeofRule).toBe('object')
    })

    test('exported rule should have exactly meta and create properties', () => {
      expect(Object.keys(validTypeofRule)).toContain('meta')
      expect(Object.keys(validTypeofRule)).toContain('create')
    })
  })

  describe('typeof argument types', () => {
    test('should work with typeof identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('myVar')),
          createLiteral('bad'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with typeof member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('prop'),
      }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', memberExpr),
          createLiteral('bad'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with typeof call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', callExpr),
          createLiteral('bad'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with typeof of typeof', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createUnaryExpression('typeof', createIdentifier('x'))),
          createLiteral('bad'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with typeof of a literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createLiteral(42)),
          createLiteral('bad'),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('case sensitivity', () => {
    test('should report "String" (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('String'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report "STRING" (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('STRING'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report "NUMBER" (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('NUMBER'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report "Undefined" (mixed case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('Undefined'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report "OBJECT" (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('OBJECT'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report "FUNCTION" (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('FUNCTION'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report "Symbol" (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('Symbol'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report "Bigint" (mixed case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('Bigint'),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('special string values', () => {
    test('should report typeof x === "null"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('null'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "NaN"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('NaN'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "array"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('array'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "date"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('date'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "regexp"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('regexp'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "int"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('int'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "float"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('float'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "class"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('class'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "constructor"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('constructor'),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('long invalid strings', () => {
    test('should report a long invalid string', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('a very long invalid type name that does not exist'),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('a very long invalid type name that does not exist')
    })

    test('should report unicode invalid string', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('类型'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report emoji invalid string', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('🔥'),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('reversed operand with !== - exhaustive', () => {
    const invalidReversed = ['array', 'null', 'int', 'float', 'bool', 'class', 'void', 'unknown']

    test.each(invalidReversed)('should report "%s" !== typeof x', (val) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createLiteral(val),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(val)
    })

    test.each(invalidReversed)('should report "%s" === typeof x', (val) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createLiteral(val),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('valid types with different identifier names', () => {
    const identifiers = ['foo', '_private', '$jquery', 'myVar', 'CamelCase', 'a', 'Z']

    test.each(identifiers)('should not report typeof %s === "string"', (name) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier(name)),
          createLiteral('string'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test.each(identifiers)('should report typeof %s === "badtype"', (name) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier(name)),
          createLiteral('badtype'),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('valid types with !== operator', () => {
    const validValues = [
      'string',
      'number',
      'boolean',
      'undefined',
      'object',
      'function',
      'symbol',
      'bigint',
    ]

    test.each(validValues)('should not report typeof x !== "%s" (reversed)', (val) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createLiteral(val),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('loc with various line/column combinations', () => {
    test('should report loc at line 10 column 20', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad'),
          10,
          20,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should report loc at line 100 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad'),
          100,
          0,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report loc at line 1 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad'),
          1,
          50,
        ),
      )

      expect(reports[0].loc?.start.column).toBe(50)
      expect(reports[0].loc?.end.column).toBe(60)
    })

    test('should report loc at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad'),
          0,
          0,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(0)
    })
  })

  describe('mixed valid and invalid in sequence', () => {
    test('should report only truly invalid in a 6-element sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const values = ['string', 'bad1', 'number', 'bad2', 'boolean', 'bad3']
      for (const val of values) {
        visitor.BinaryExpression(
          createBinaryExpression(
            '===',
            createUnaryExpression('typeof', createIdentifier('x')),
            createLiteral(val),
          ),
        )
      }

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('bad1')
      expect(reports[1].message).toContain('bad2')
      expect(reports[2].message).toContain('bad3')
    })

    test('should report all when all are invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const values = ['foo', 'bar', 'baz', 'qux', 'quux']
      for (const val of values) {
        visitor.BinaryExpression(
          createBinaryExpression(
            '===',
            createUnaryExpression('typeof', createIdentifier('x')),
            createLiteral(val),
          ),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should report none when all are valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const values = [
        'string',
        'number',
        'boolean',
        'undefined',
        'object',
        'function',
        'symbol',
        'bigint',
      ]
      for (const val of values) {
        visitor.BinaryExpression(
          createBinaryExpression(
            '===',
            createUnaryExpression('typeof', createIdentifier('x')),
            createLiteral(val),
          ),
        )
      }

      expect(reports.length).toBe(0)
    })
  })

  describe('visitor object structure', () => {
    test('visitor should have exactly one key', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(Object.keys(visitor).length).toBe(1)
    })

    test('visitor key should be BinaryExpression', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(Object.keys(visitor)).toEqual(['BinaryExpression'])
    })

    test('create with different context objects produces valid visitors', () => {
      const ctx1 = createMockRuleContext({ source: 'typeof x === "string"' })
      const ctx2 = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor1 = validTypeofRule.create(ctx1.context)
      const visitor2 = validTypeofRule.create(ctx2.context)

      expect(typeof visitor1.BinaryExpression).toBe('function')
      expect(typeof visitor2.BinaryExpression).toBe('function')
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('default export', () => {
    test('default export should exist', async () => {
      const mod = await import('../../../../src/rules/patterns/valid-typeof.js')
      expect(mod.default).toBeDefined()
    })

    test('default export should equal named export', async () => {
      const mod = await import('../../../../src/rules/patterns/valid-typeof.js')
      expect(mod.default).toBe(mod.validTypeofRule)
    })
  })

  describe('more malformed node variations', () => {
    test('should handle node with left as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: 42,
        right: createLiteral('bad'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with right as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: 'bad',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: undefined,
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('bad'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle typeof with non-object argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const unaryWithNullArg = {
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: null,
        prefix: true,
      }

      visitor.BinaryExpression(
        createBinaryExpression('===', unaryWithNullArg, createLiteral('invalid')),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle typeof with undefined argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const unaryWithUndefArg = {
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: undefined,
        prefix: true,
      }

      visitor.BinaryExpression(
        createBinaryExpression('===', unaryWithUndefArg, createLiteral('invalid')),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle literal with string raw property', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const literalWithRaw = { type: 'Literal', value: 'bad', raw: '"bad"' }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          literalWithRaw,
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('non-literal on left in reversed order', () => {
    test('should not report when left is identifier and right is typeof (reversed no literal)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createIdentifier('str'),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when left is a call expression and right is typeof', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          callExpr,
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when left is member expression and right is typeof', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('type'),
      }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          memberExpr,
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('single character invalid strings', () => {
    const singleChars = ['a', 'z', 'x', 'b', 'n', 'o', 'f', 's', 'u']

    test.each(singleChars)('should report typeof x === "%s"', (ch) => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(ch),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('typeof with prefix false', () => {
    test('should still report when typeof has prefix: false (rule does not check prefix)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const postfixTypeof = {
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: createIdentifier('x'),
        prefix: false,
      }

      visitor.BinaryExpression(
        createBinaryExpression('===', postfixTypeof, createLiteral('invalid')),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('context isolation between create calls', () => {
    test('three independent visitors do not share state', () => {
      const ctx1 = createMockRuleContext({ source: 'typeof x === "string"' })
      const ctx2 = createMockRuleContext({ source: 'typeof x === "string"' })
      const ctx3 = createMockRuleContext({ source: 'typeof x === "string"' })
      const v1 = validTypeofRule.create(ctx1.context)
      const v2 = validTypeofRule.create(ctx2.context)
      const v3 = validTypeofRule.create(ctx3.context)

      v1.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad1'),
        ),
      )
      v2.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('string'),
        ),
      )
      v3.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bad3'),
        ),
      )

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(0)
      expect(ctx3.reports.length).toBe(1)
    })

    test('calling same visitor 20 times produces 20 reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(
            '===',
            createUnaryExpression('typeof', createIdentifier('x')),
            createLiteral(`bad${i}`),
          ),
        )
      }

      expect(reports.length).toBe(20)
    })
  })

  describe('whitespace-only invalid strings', () => {
    test('should report typeof x === "\\n"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('\n'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "\\r\\n"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('\r\n'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "\\t"', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('\t'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x === "  "', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('  '),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('meta immutability', () => {
    test('meta should have frozen-like consistency across reads', () => {
      const meta1 = validTypeofRule.meta
      const meta2 = validTypeofRule.meta

      expect(meta1).toBe(meta2)
      expect(meta1.type).toBe(meta2.type)
      expect(meta1.severity).toBe(meta2.severity)
    })

    test('meta docs description should be consistent', () => {
      const desc = validTypeofRule.meta.docs?.description
      expect(desc).toBeTruthy()
      expect(desc!.length).toBeGreaterThan(10)
    })
  })

  describe('typeof argument - nested expressions', () => {
    test('should work with typeof of array expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const arrayExpr = { type: 'ArrayExpression', elements: [] }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', arrayExpr),
          createLiteral('bogus'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with typeof of object expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const objExpr = { type: 'ObjectExpression', properties: [] }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', objExpr),
          createLiteral('fake'),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('meta - additional deep checks', () => {
    test('meta docs description should not contain double spaces', () => {
      const desc = validTypeofRule.meta.docs?.description
      expect(desc).not.toContain('  ')
    })

    test('meta docs category should be lowercase', () => {
      expect(validTypeofRule.meta.docs?.category).toBe(
        validTypeofRule.meta.docs?.category.toLowerCase(),
      )
    })

    test('meta type should be exactly problem', () => {
      expect(validTypeofRule.meta.type).toBe('problem')
    })

    test('meta severity should be exactly error', () => {
      expect(validTypeofRule.meta.severity).toBe('error')
    })
  })

  describe('message format edge cases', () => {
    test('message for empty string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(''),
        ),
      )

      expect(reports[0].message).toContain("''")
    })

    test('message for value with single quotes inside', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral("it's"),
        ),
      )

      expect(reports[0].message).toContain("it's")
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('xyz'),
        ),
      )

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message for value with special regex chars', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('$notype'),
        ),
      )

      expect(reports[0].message).toContain('$notype')
    })
  })

  describe('create visitor - method properties', () => {
    test('BinaryExpression should be a named function', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      expect(visitor.BinaryExpression.name).toBe('BinaryExpression')
    })

    test('create should accept context without throwing', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      expect(() => validTypeofRule.create(context)).not.toThrow()
    })

    test('create should not return undefined', () => {
      const { context } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)
      expect(visitor).not.toBeUndefined()
    })
  })

  describe('typeof with template literal-like nodes', () => {
    test('should not report when right is TemplateLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const templateLiteral = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          templateLiteral,
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when left is TemplateLiteral and right is typeof', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const templateLiteral = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          templateLiteral,
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('valid types with === operator reversed', () => {
    test('should not report "string" === typeof x (reversed valid)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createLiteral('string'),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report "number" !== typeof x (reversed valid)', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createLiteral('number'),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('location with malformed loc sub-properties', () => {
    test('should handle node with loc.start missing column', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('bad'),
        loc: { start: { line: 1 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc as array', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('bad'),
        loc: [1, 0, 1, 10],
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('concurrent report ordering', () => {
    test('reports maintain call order', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const values = ['first', 'second', 'third']
      for (const val of values) {
        visitor.BinaryExpression(
          createBinaryExpression(
            '===',
            createUnaryExpression('typeof', createIdentifier('x')),
            createLiteral(val),
          ),
        )
      }

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('first')
      expect(reports[1].message).toContain('second')
      expect(reports[2].message).toContain('third')
    })

    test('interleaved valid and invalid maintain order', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('string'),
        ),
      )
      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('alpha'),
        ),
      )
      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('number'),
        ),
      )
      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('beta'),
        ),
      )

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('beta')
    })
  })

  describe('export completeness', () => {
    test('should have exactly 2 own properties on rule object', () => {
      const keys = Object.keys(validTypeofRule)
      expect(keys.length).toBe(2)
    })

    test('rule should not have hasOwnProperty override', () => {
      expect(validTypeofRule.hasOwnProperty).toBe(Object.prototype.hasOwnProperty)
    })
  })

  describe('typeof with prefix property variations', () => {
    test('should report when typeof has prefix: undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const typeofNode = {
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: createIdentifier('x'),
        prefix: undefined,
      }

      visitor.BinaryExpression(createBinaryExpression('===', typeofNode, createLiteral('invalid')))

      expect(reports.length).toBe(1)
    })

    test('should report when typeof has no prefix property', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof x === "string"' })
      const visitor = validTypeofRule.create(context)

      const typeofNode = {
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: createIdentifier('x'),
      }

      visitor.BinaryExpression(createBinaryExpression('===', typeofNode, createLiteral('wrong')))

      expect(reports.length).toBe(1)
    })
  })
})
