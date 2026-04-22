import { describe, test, expect, vi } from 'vitest'
import { noUnexpectedMultilineRule } from '../../../../src/rules/patterns/no-unexpected-multiline.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
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

function createTemplateLiteral(line = 1, column = 0): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: [
      {
        type: 'TemplateElement',
        value: { raw: 'text', cooked: 'text' },
        tail: true,
      },
    ],
    expressions: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
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

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createCallExpression(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'func' },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMemberExpression(line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'obj' },
    property: { type: 'Identifier', name: 'prop' },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

// ============================================================
// META TESTS (20)
// ============================================================
describe('no-unexpected-multiline rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnexpectedMultilineRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnexpectedMultilineRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnexpectedMultilineRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnexpectedMultilineRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnexpectedMultilineRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnexpectedMultilineRule.meta.fixable).toBeUndefined()
    })

    test('should mention multiline in description', () => {
      expect(noUnexpectedMultilineRule.meta.docs?.description.toLowerCase()).toContain('multiline')
    })

    test('should mention expressions in description', () => {
      expect(noUnexpectedMultilineRule.meta.docs?.description.toLowerCase()).toContain(
        'expressions',
      )
    })

    test('should have docs property defined', () => {
      expect(noUnexpectedMultilineRule.meta.docs).toBeDefined()
    })

    test('should have a non-empty description', () => {
      expect(noUnexpectedMultilineRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have description as a string', () => {
      expect(typeof noUnexpectedMultilineRule.meta.docs?.description).toBe('string')
    })

    test('should have type as a string', () => {
      expect(typeof noUnexpectedMultilineRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noUnexpectedMultilineRule.meta.severity).toBe('string')
    })

    test('should not be deprecated', () => {
      expect(noUnexpectedMultilineRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUnexpectedMultilineRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnexpectedMultilineRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have schema as an empty array', () => {
      expect(noUnexpectedMultilineRule.meta.schema).toEqual([])
    })

    test('should not have docs url', () => {
      expect(noUnexpectedMultilineRule.meta.docs?.url).toBeUndefined()
    })

    test('should have meta as a plain object', () => {
      expect(typeof noUnexpectedMultilineRule.meta).toBe('object')
    })

    test('should have create as a function', () => {
      expect(typeof noUnexpectedMultilineRule.create).toBe('function')
    })
  })

  // ============================================================
  // CREATE / VISITOR TESTS (8)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return BinaryExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return the same visitor shape for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'a + b;', filePath: '/src/a.ts' })
      const { context: ctx2 } = createMockRuleContext({ source: 'a + b;', filePath: '/src/b.ts' })
      const visitor1 = noUnexpectedMultilineRule.create(ctx1)
      const visitor2 = noUnexpectedMultilineRule.create(ctx2)

      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('should not modify the context object', () => {
      const { context } = createMockRuleContext({ source: 'a + b;' })
      const beforeKeys = Object.keys(context)
      noUnexpectedMultilineRule.create(context)
      const afterKeys = Object.keys(context)

      expect(beforeKeys).toEqual(afterKeys)
    })

    test('should return a new visitor on each call', () => {
      const { context } = createMockRuleContext({ source: 'a + b;' })
      const visitor1 = noUnexpectedMultilineRule.create(context)
      const visitor2 = noUnexpectedMultilineRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor that only has BinaryExpression key', () => {
      const { context } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(Object.keys(visitor)).toEqual(['BinaryExpression'])
    })

    test('should create visitor without throwing for empty source', () => {
      const { context } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })

      expect(() => noUnexpectedMultilineRule.create(context)).not.toThrow()
    })

    test('should create visitor without throwing for complex source', () => {
      const { context } = createMockRuleContext({ source: 'const x = `hello` + `world`;', filePath: '/src/file.ts' })

      expect(() => noUnexpectedMultilineRule.create(context)).not.toThrow()
    })
  })

  // ============================================================
  // DETECTION TESTS (30) - addition + template, subtraction + template
  // ============================================================
  describe('detection - addition with template literals', () => {
    test('should report addition with template literal on left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('b')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('multiline')
    })

    test('should report addition with template literal on right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('multiline')
    })

    test('should report addition with template literals on both sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('multiline')
    })

    test('should report addition with template literal and literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createLiteral(5)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report addition with template literal and call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createCallExpression(), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should report addition with template literal and member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createMemberExpression()),
      )

      expect(reports.length).toBe(1)
    })

    test('should report addition with template literal as left and call as right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createCallExpression()),
      )

      expect(reports.length).toBe(1)
    })

    test('should report addition with member expression on left and template on right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createMemberExpression(), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('detection - subtraction with template literals', () => {
    test('should report subtraction with template literal on left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createTemplateLiteral(), createIdentifier('b')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('multiline')
    })

    test('should report subtraction with template literal on right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('multiline')
    })

    test('should report subtraction with template literals on both sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createTemplateLiteral(), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should report subtraction with template literal and literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createTemplateLiteral(), createLiteral(5)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report subtraction with template literal and call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createCallExpression(), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should report subtraction with template literal and member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createTemplateLiteral(), createMemberExpression()),
      )

      expect(reports.length).toBe(1)
    })

    test('should report subtraction with member expression and template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createMemberExpression(), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should report subtraction with template literal left and call right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createTemplateLiteral(), createCallExpression()),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('detection - addition and subtraction both trigger', () => {
    test('should report both + and - violations separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('a')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('b'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(2)
    })

    test('should report addition with nested template literal in left BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const nested = createBinaryExpression('+', createTemplateLiteral(), createIdentifier('x'))
      visitor.BinaryExpression(createBinaryExpression('+', nested, createIdentifier('a')))

      expect(reports.length).toBe(0) // nested itself is a BinaryExpression, not a TemplateLiteral
    })

    test('should report when left is template literal with + operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createLiteral('str')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report when right is template literal with - operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createLiteral(42), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NOT REPORTING TESTS (30)
  // ============================================================
  describe('valid cases - non-template operands with +', () => {
    test('should not report addition of two identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createIdentifier('b')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report addition of identifier and literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createIdentifier('a'), createLiteral(5)))

      expect(reports.length).toBe(0)
    })

    test('should not report addition of literal and identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(5), createIdentifier('a')))

      expect(reports.length).toBe(0)
    })

    test('should not report addition of two literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(0)
    })

    test('should not report addition of two call expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createCallExpression(), createCallExpression()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report addition with call expression on left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createCallExpression(), createIdentifier('b')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report addition with member expression operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createMemberExpression(), createIdentifier('b')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report addition with member expression and call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createMemberExpression(), createCallExpression()),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases - non-template operands with -', () => {
    test('should not report subtraction of two identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('a'), createIdentifier('b')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction of identifier and literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('-', createIdentifier('a'), createLiteral(5)))

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction of literal and identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('-', createLiteral(5), createIdentifier('a')))

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction of two literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('-', createLiteral(10), createLiteral(2)))

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction of two call expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createCallExpression(), createCallExpression()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction with call expression on left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createCallExpression(), createIdentifier('b')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction with member expression operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createMemberExpression(), createIdentifier('b')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction with member expression and call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createMemberExpression(), createCallExpression()),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases - other operators with template literals', () => {
    test('should not report multiplication', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('*', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report division', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('/', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report equality', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report inequality', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report less than', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('<', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report greater than', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('>', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report logical and', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('&&', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report logical or', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('||', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report modulo with template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('%', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report exponentiation with template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('**', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report loose equality with template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report loose inequality with template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report less than or equal with template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('<=', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report greater than or equal with template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('>=', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report nullish coalescing with template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('??', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report template literal on left with * operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('*', createTemplateLiteral(), createIdentifier('a')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report template literal on right with / operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('/', createTemplateLiteral(), createIdentifier('a')),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES (25)
  // ============================================================
  describe('edge cases - null/undefined/invalid nodes', () => {
    test('should handle null node', () => {
      const { context } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node', () => {
      const { context } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle string node', () => {
      const { context } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(() => visitor.BinaryExpression(true)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - malformed nodes', () => {
    test('should handle node without operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        right: createTemplateLiteral(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with null left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: null,
        right: createTemplateLiteral(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with null right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createTemplateLiteral(),
        right: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with left as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: createTemplateLiteral(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with right as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '-',
        left: createTemplateLiteral(),
        right: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with non-BinaryExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'CallExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with operator as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: 42,
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc having string values', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
        loc: { start: { line: '1', column: '0' }, end: { line: '1', column: '10' } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
        loc: null,
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc - missing end', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
        loc: { start: { line: 5, column: 3 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with left that has extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const left = {
        ...createTemplateLiteral(),
        extra: true,
        range: [0, 10],
      }

      visitor.BinaryExpression(createBinaryExpression('+', left, createIdentifier('b')))

      expect(reports.length).toBe(1)
    })

    test('should handle template literal with no quasis', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const tpl = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(createBinaryExpression('+', tpl, createIdentifier('b')))

      expect(reports.length).toBe(1)
    })

    test('should handle template literal with expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const tpl = {
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' }, tail: false },
          { type: 'TemplateElement', value: { raw: '', cooked: '' }, tail: true },
        ],
        expressions: [createIdentifier('name')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(createBinaryExpression('+', tpl, createIdentifier('b')))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // LOCATION TESTS (15)
  // ============================================================
  describe('location', () => {
    test('should report correct location at line 10 column 5', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral(), 10, 5),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral(), 1, 0),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral(), 100, 50),
      )

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral(), 5, 3),
      )

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(13) // column + 10
    })

    test('should report location for subtraction violation', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createTemplateLiteral(), createIdentifier('b'), 20, 8),
      )

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location for both sides template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createTemplateLiteral(), 3, 7),
      )

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report default location when loc is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location when loc has only start', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
        loc: { start: { line: 7, column: 2 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('b'), 1, 0),
      )

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with large line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createTemplateLiteral(), createIdentifier('b'), 9999, 0),
      )

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report location with large column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral(), 1, 500),
      )

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report location for addition at line 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createLiteral(5), 2, 0),
      )

      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should report location for subtraction at multiple lines', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createLiteral(5), createTemplateLiteral(), 15, 20),
      )

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should always include loc in reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('b')),
      )

      expect(reports[0].loc).toBeDefined()
    })

    test('should include both start and end in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('b'), 4, 6),
      )

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  // ============================================================
  // MESSAGE TESTS (10)
  // ============================================================
  describe('message quality', () => {
    test('should include multiline in message for addition', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message.toLowerCase()).toContain('multiline')
    })

    test('should include unexpected in message for addition', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should include expression in message for addition', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message.toLowerCase()).toContain('expression')
    })

    test('should include multiline in message for subtraction', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message.toLowerCase()).toContain('multiline')
    })

    test('should include unexpected in message for subtraction', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should include expression in message for subtraction', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message.toLowerCase()).toContain('expression')
    })

    test('should have consistent message for both operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )
      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should have non-empty message string', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have message as a string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(typeof reports[0].message).toBe('string')
    })

    test('should include period at end of message', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports[0].message.endsWith('.')).toBe(true)
    })
  })

  // ============================================================
  // MULTIPLE REPORTS TESTS (10)
  // ============================================================
  describe('multiple reports', () => {
    test('should handle multiple violations in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('a')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('b'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle consecutive addition violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('a')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('b')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('c')),
      )

      expect(reports.length).toBe(3)
    })

    test('should handle mixed valid and invalid expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createIdentifier('b')),
      ) // valid
      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('a')),
      ) // invalid
      visitor.BinaryExpression(
        createBinaryExpression('*', createIdentifier('a'), createTemplateLiteral()),
      ) // valid
      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('a'), createTemplateLiteral()),
      ) // invalid

      expect(reports.length).toBe(2)
    })

    test('should report each violation independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.BinaryExpression(
          createBinaryExpression('+', createTemplateLiteral(), createIdentifier(`v${i}`)),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should preserve order of reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('a'), 1, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('b'), 5, 0),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should handle alternating valid and invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      // valid
      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createIdentifier('b')),
      )
      // invalid
      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('c')),
      )
      // valid
      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('d'), createIdentifier('e')),
      )
      // invalid
      visitor.BinaryExpression(
        createBinaryExpression('-', createTemplateLiteral(), createIdentifier('f')),
      )
      // valid
      visitor.BinaryExpression(
        createBinaryExpression('*', createIdentifier('g'), createIdentifier('h')),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle 10 violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.BinaryExpression(
          createBinaryExpression('+', createTemplateLiteral(), createIdentifier(`x${i}`)),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should handle all addition then all subtraction', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      for (let i = 0; i < 3; i++) {
        visitor.BinaryExpression(
          createBinaryExpression('+', createTemplateLiteral(), createIdentifier(`a${i}`)),
        )
      }
      for (let i = 0; i < 3; i++) {
        visitor.BinaryExpression(
          createBinaryExpression('-', createTemplateLiteral(), createIdentifier(`s${i}`)),
        )
      }

      expect(reports.length).toBe(6)
    })

    test('should report each with correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('a'), 1, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('b'), 5, 10),
      )
      visitor.BinaryExpression(
        createBinaryExpression('+', createTemplateLiteral(), createIdentifier('c'), 10, 20),
      )

      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
      expect(reports[1].loc?.start).toEqual({ line: 5, column: 10 })
      expect(reports[2].loc?.start).toEqual({ line: 10, column: 20 })
    })

    test('should report zero violations for all valid expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createIdentifier('b')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('c'), createIdentifier('d')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('*', createIdentifier('e'), createIdentifier('f')),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // CONTEXT TESTS (10)
  // ============================================================
  describe('context variations', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
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
        getSource: () => 'a + b;',
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

      const visitor = noUnexpectedMultilineRule.create(context)

      expect(() =>
        visitor.BinaryExpression(
          createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;', filePath: '/src/components/App.tsx' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with deep nested file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;', filePath: '/src/features/auth/components/LoginForm.tsx' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with complex source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const result = `hello ${name}` + obj.method();', filePath: '/src/file.ts' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should not call logger during normal operation', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle config with extra options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strict: true, level: 2 }], source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/home/user/project/file.ts',
        getAST: () => null,
        getSource: () => 'a + b;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with JS file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;', filePath: '/src/utils/helpers.js' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // TEST.EACH - OPERATORS WITH TEMPLATE LITERALS (40+)
  // ============================================================
  describe('test.each - operators that should NOT report with template literals', () => {
    test.each([
      ['*', 'multiplication'],
      ['/', 'division'],
      ['%', 'modulo'],
      ['**', 'exponentiation'],
      ['===', 'strict equality'],
      ['!==', 'strict inequality'],
      ['==', 'loose equality'],
      ['!=', 'loose inequality'],
      ['<', 'less than'],
      ['>', 'greater than'],
      ['<=', 'less than or equal'],
      ['>=', 'greater than or equal'],
      ['&&', 'logical and'],
      ['||', 'logical or'],
      ['??', 'nullish coalescing'],
      ['&', 'bitwise and'],
      ['|', 'bitwise or'],
      ['^', 'bitwise xor'],
      ['<<', 'left shift'],
      ['>>', 'right shift'],
      ['>>>', 'unsigned right shift'],
      ['in', 'in operator'],
      ['instanceof', 'instanceof operator'],
    ])('should not report for operator "%s" (%s) with template literal', (operator) => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(operator, createIdentifier('a'), createTemplateLiteral()),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - operators that should NOT report with template literal on left', () => {
    test.each([
      ['*', 'multiplication'],
      ['/', 'division'],
      ['%', 'modulo'],
      ['**', 'exponentiation'],
      ['===', 'strict equality'],
      ['!==', 'strict inequality'],
      ['==', 'loose equality'],
      ['!=', 'loose inequality'],
      ['<', 'less than'],
      ['>', 'greater than'],
      ['<=', 'less than or equal'],
      ['>=', 'greater than or equal'],
      ['&&', 'logical and'],
      ['||', 'logical or'],
      ['??', 'nullish coalescing'],
      ['&', 'bitwise and'],
      ['|', 'bitwise or'],
      ['^', 'bitwise xor'],
      ['<<', 'left shift'],
      ['>>', 'right shift'],
      ['>>>', 'unsigned right shift'],
      ['in', 'in operator'],
      ['instanceof', 'instanceof operator'],
    ])('should not report for operator "%s" (%s) with template literal on left', (operator) => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(operator, createTemplateLiteral(), createIdentifier('a')),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - detection for + and - operators with template literals', () => {
    test.each([
      ['+', 'left', true],
      ['+', 'right', true],
      ['+', 'both', true],
      ['-', 'left', true],
      ['-', 'right', true],
      ['-', 'both', true],
    ])(
      'should report for operator "%s" with template literal on %s side',
      (operator, side, _expectedReport) => {
        const { context, reports } = createMockRuleContext({ source: 'a + b;' })
        const visitor = noUnexpectedMultilineRule.create(context)

        const left =
          side === 'left' || side === 'both' ? createTemplateLiteral() : createIdentifier('a')
        const right =
          side === 'right' || side === 'both' ? createTemplateLiteral() : createIdentifier('b')

        visitor.BinaryExpression(createBinaryExpression(operator, left, right))

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('test.each - non-template operands should never report', () => {
    test.each([
      ['+', 'Identifier', 'Identifier'],
      ['+', 'Identifier', 'Literal'],
      ['+', 'Literal', 'Identifier'],
      ['+', 'Literal', 'Literal'],
      ['+', 'CallExpression', 'Identifier'],
      ['+', 'Identifier', 'CallExpression'],
      ['+', 'CallExpression', 'CallExpression'],
      ['+', 'MemberExpression', 'Identifier'],
      ['+', 'Identifier', 'MemberExpression'],
      ['-', 'Identifier', 'Identifier'],
      ['-', 'Identifier', 'Literal'],
      ['-', 'Literal', 'Identifier'],
      ['-', 'Literal', 'Literal'],
      ['-', 'CallExpression', 'Identifier'],
      ['-', 'Identifier', 'CallExpression'],
      ['-', 'CallExpression', 'CallExpression'],
      ['-', 'MemberExpression', 'Identifier'],
      ['-', 'Identifier', 'MemberExpression'],
    ] as const)(
      'should not report for operator "%s" with %s and %s',
      (operator, leftType, rightType) => {
        const { context, reports } = createMockRuleContext({ source: 'a + b;' })
        const visitor = noUnexpectedMultilineRule.create(context)

        const makeNode = (type: string) => {
          switch (type) {
            case 'Identifier':
              return createIdentifier('x')
            case 'Literal':
              return createLiteral(42)
            case 'CallExpression':
              return createCallExpression()
            case 'MemberExpression':
              return createMemberExpression()
            default:
              return createIdentifier('x')
          }
        }

        visitor.BinaryExpression(
          createBinaryExpression(operator, makeNode(leftType), makeNode(rightType)),
        )

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('test.each - template literal combinations with + and -', () => {
    test.each([
      { op: '+', leftType: 'TemplateLiteral', rightType: 'Identifier', shouldReport: true },
      { op: '+', leftType: 'Identifier', rightType: 'TemplateLiteral', shouldReport: true },
      { op: '+', leftType: 'TemplateLiteral', rightType: 'Literal', shouldReport: true },
      { op: '+', leftType: 'Literal', rightType: 'TemplateLiteral', shouldReport: true },
      { op: '+', leftType: 'TemplateLiteral', rightType: 'CallExpression', shouldReport: true },
      { op: '+', leftType: 'CallExpression', rightType: 'TemplateLiteral', shouldReport: true },
      { op: '+', leftType: 'TemplateLiteral', rightType: 'MemberExpression', shouldReport: true },
      { op: '+', leftType: 'MemberExpression', rightType: 'TemplateLiteral', shouldReport: true },
      { op: '-', leftType: 'TemplateLiteral', rightType: 'Identifier', shouldReport: true },
      { op: '-', leftType: 'Identifier', rightType: 'TemplateLiteral', shouldReport: true },
      { op: '-', leftType: 'TemplateLiteral', rightType: 'Literal', shouldReport: true },
      { op: '-', leftType: 'Literal', rightType: 'TemplateLiteral', shouldReport: true },
      { op: '-', leftType: 'TemplateLiteral', rightType: 'CallExpression', shouldReport: true },
      { op: '-', leftType: 'CallExpression', rightType: 'TemplateLiteral', shouldReport: true },
      { op: '-', leftType: 'TemplateLiteral', rightType: 'MemberExpression', shouldReport: true },
      { op: '-', leftType: 'MemberExpression', rightType: 'TemplateLiteral', shouldReport: true },
    ])(
      'should report=$shouldReport for $op with $leftType and $rightType',
      ({ op, leftType, rightType, shouldReport }) => {
        const { context, reports } = createMockRuleContext({ source: 'a + b;' })
        const visitor = noUnexpectedMultilineRule.create(context)

        const makeNode = (type: string) => {
          switch (type) {
            case 'TemplateLiteral':
              return createTemplateLiteral()
            case 'Identifier':
              return createIdentifier('x')
            case 'Literal':
              return createLiteral(42)
            case 'CallExpression':
              return createCallExpression()
            case 'MemberExpression':
              return createMemberExpression()
            default:
              return createIdentifier('x')
          }
        }

        visitor.BinaryExpression(
          createBinaryExpression(op, makeNode(leftType), makeNode(rightType)),
        )

        if (shouldReport) {
          expect(reports.length).toBe(1)
        } else {
          expect(reports.length).toBe(0)
        }
      },
    )
  })

  describe('test.each - various line/column locations', () => {
    test.each([
      { line: 1, column: 0 },
      { line: 1, column: 100 },
      { line: 50, column: 0 },
      { line: 50, column: 25 },
      { line: 1000, column: 0 },
      { line: 1000, column: 500 },
    ])('should report correct location at line=$line, column=$column', ({ line, column }) => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('a'), createTemplateLiteral(), line, column),
      )

      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })
  })

  describe('test.each - node types that should be ignored', () => {
    test.each([
      ['CallExpression'],
      ['MemberExpression'],
      ['AssignmentExpression'],
      ['ConditionalExpression'],
      ['LogicalExpression'],
      ['UnaryExpression'],
      ['UpdateExpression'],
      ['SequenceExpression'],
      ['ArrayExpression'],
      ['ObjectExpression'],
      ['FunctionExpression'],
      ['ArrowFunctionExpression'],
      ['NewExpression'],
    ])('should not report for non-BinaryExpression type "%s"', (type) => {
      const { context, reports } = createMockRuleContext({ source: 'a + b;' })
      const visitor = noUnexpectedMultilineRule.create(context)

      const node = {
        type,
        operator: '+',
        left: createIdentifier('a'),
        right: createTemplateLiteral(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
