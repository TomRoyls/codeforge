import { describe, test, expect, vi } from 'vitest'
import { noArrayDestructuringRule } from '../../../../src/rules/patterns/no-array-destructuring.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createArrayExpression(elements: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createSpreadElement(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'SpreadElement',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
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

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
    },
  }
}

function createCallExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
  }
}

function createBinaryExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
  }
}

function createObjectExpression(properties: unknown[]): unknown {
  return {
    type: 'ObjectExpression',
    properties,
  }
}

function createArrowFunction(params: unknown[], body: unknown): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params,
    body,
  }
}

function createConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
  }
}

function createTemplateLiteral(quasis: unknown[], expressions: unknown[]): unknown {
  return {
    type: 'TemplateLiteral',
    quasis,
    expressions,
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
  }
}

// ============================================================
// META PROPERTIES (24 tests)
// ============================================================
describe('meta properties', () => {
  test('should have suggestion type', () => {
    expect(noArrayDestructuringRule.meta.type).toBe('suggestion')
  })

  test('should have warn severity', () => {
    expect(noArrayDestructuringRule.meta.severity).toBe('warn')
  })

  test('should not be recommended', () => {
    expect(noArrayDestructuringRule.meta.docs?.recommended).toBe(false)
  })

  test('should have performance category', () => {
    expect(noArrayDestructuringRule.meta.docs?.category).toBe('performance')
  })

  test('should have schema defined', () => {
    expect(noArrayDestructuringRule.meta.schema).toBeDefined()
  })

  test('should not be fixable', () => {
    expect(noArrayDestructuringRule.meta.fixable).toBeUndefined()
  })

  test('should mention spread operator in description', () => {
    expect(noArrayDestructuringRule.meta.docs?.description.toLowerCase()).toContain('spread')
  })

  test('should mention performance in description', () => {
    expect(noArrayDestructuringRule.meta.docs?.description.toLowerCase()).toContain('performance')
  })

  test('should have meta property on rule', () => {
    expect(noArrayDestructuringRule).toHaveProperty('meta')
  })

  test('should have create property on rule', () => {
    expect(noArrayDestructuringRule).toHaveProperty('create')
  })

  test('should have docs property in meta', () => {
    expect(noArrayDestructuringRule.meta).toHaveProperty('docs')
  })

  test('should have docs description as string', () => {
    expect(typeof noArrayDestructuringRule.meta.docs?.description).toBe('string')
  })

  test('should have non-empty description', () => {
    expect(noArrayDestructuringRule.meta.docs?.description.length).toBeGreaterThan(0)
  })

  test('should have type as valid RuleType', () => {
    expect(['problem', 'suggestion', 'layout']).toContain(noArrayDestructuringRule.meta.type)
  })

  test('should have severity as valid Severity', () => {
    expect(['off', 'warn', 'error']).toContain(noArrayDestructuringRule.meta.severity)
  })

  test('should have docs url defined', () => {
    expect(noArrayDestructuringRule.meta.docs?.url).toBeDefined()
  })

  test('should have docs url as string', () => {
    expect(typeof noArrayDestructuringRule.meta.docs?.url).toBe('string')
  })

  test('should mention concat in description', () => {
    expect(noArrayDestructuringRule.meta.docs?.description.toLowerCase()).toContain('concat')
  })

  test('should mention slice in description', () => {
    expect(noArrayDestructuringRule.meta.docs?.description.toLowerCase()).toContain('slice')
  })

  test('should mention arrays in description', () => {
    expect(noArrayDestructuringRule.meta.docs?.description.toLowerCase()).toContain('arrays')
  })

  test('should have meta as object', () => {
    expect(typeof noArrayDestructuringRule.meta).toBe('object')
  })

  test('should have create as function', () => {
    expect(typeof noArrayDestructuringRule.create).toBe('function')
  })

  test('should have recommended as boolean false', () => {
    expect(noArrayDestructuringRule.meta.docs?.recommended).toBe(false)
  })

  test('should have schema as empty array', () => {
    expect(noArrayDestructuringRule.meta.schema).toEqual([])
  })
})

// ============================================================
// CREATE / VISITOR (10 tests)
// ============================================================
describe('create / visitor', () => {
  test('should return visitor object with ArrayExpression method', () => {
    const { context } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    expect(visitor).toHaveProperty('ArrayExpression')
  })

  test('should return visitor where ArrayExpression is a function', () => {
    const { context } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    expect(typeof visitor.ArrayExpression).toBe('function')
  })

  test('should return visitor object', () => {
    const { context } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    expect(typeof visitor).toBe('object')
  })

  test('should not return null visitor', () => {
    const { context } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    expect(visitor).not.toBeNull()
  })

  test('should create a new visitor each time create is called', () => {
    const { context } = createMockRuleContext()
    const visitor1 = noArrayDestructuringRule.create(context)
    const visitor2 = noArrayDestructuringRule.create(context)
    expect(visitor1).not.toBe(visitor2)
  })

  test('should accept context with empty options', () => {
    const { context } = createMockRuleContext()
    expect(() => noArrayDestructuringRule.create(context)).not.toThrow()
  })

  test('should accept context with populated options', () => {
    const { context } = createMockRuleContext({ options: [{ checkNested: true }] })
    expect(() => noArrayDestructuringRule.create(context)).not.toThrow()
  })

  test('should have exactly one visitor method', () => {
    const { context } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    expect(Object.keys(visitor)).toEqual(['ArrayExpression'])
  })

  test('should allow ArrayExpression to be called multiple times', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)

    visitor.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('a'))]))
    visitor.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('b'))]))

    expect(reports.length).toBe(2)
  })

  test('should work with different file paths', () => {
    const { context, reports } = createMockRuleContext({ filePath: '/project/src/utils.ts' })
    const visitor = noArrayDestructuringRule.create(context)

    visitor.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('items'))]))

    expect(reports.length).toBe(1)
  })
})

// ============================================================
// DETECTION (35 tests)
// ============================================================
describe('detection', () => {
  test('should report spread operator on array', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 1, 5)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread operator with different names', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('myArray'), 2, 10)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('myArray')
  })

  test('should report spread operator with other elements', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createLiteral(1),
      createSpreadElement(createIdentifier('items'), 3, 2),
      createLiteral(2),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report multiple spread operators', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('items1'), 1, 0),
      createSpreadElement(createIdentifier('items2'), 1, 10),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(2)
  })

  test('should report spread with single identifier element', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createIdentifier('x'),
      createSpreadElement(createIdentifier('arr')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread at the beginning of array', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('first')),
      createLiteral(1),
      createLiteral(2),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('first')
  })

  test('should report spread at the end of array', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createLiteral(1),
      createLiteral(2),
      createSpreadElement(createIdentifier('last')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('last')
  })

  test('should report spread in the middle of array', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createLiteral(1),
      createSpreadElement(createIdentifier('middle')),
      createLiteral(2),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('middle')
  })

  test('should report three spread operators', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('a')),
      createSpreadElement(createIdentifier('b')),
      createSpreadElement(createIdentifier('c')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(3)
  })

  test('should report spread with call expression argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const callExpr = createCallExpression(createIdentifier('getItems'), [])
    const node = createArrayExpression([createSpreadElement(callExpr)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread with member expression argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const memberExpr = createMemberExpression(createIdentifier('obj'), 'items')
    const node = createArrayExpression([createSpreadElement(memberExpr)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('array')
  })

  test('should report spread with chained member expression', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const inner = createMemberExpression(createIdentifier('obj'), 'data')
    const outer = createMemberExpression(inner, 'items')
    const node = createArrayExpression([createSpreadElement(outer)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread with binary expression argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const binExpr = createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b'))
    const node = createArrayExpression([createSpreadElement(binExpr)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread with conditional expression argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const condExpr = createConditionalExpression(
      createIdentifier('flag'),
      createIdentifier('a'),
      createIdentifier('b'),
    )
    const node = createArrayExpression([createSpreadElement(condExpr)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread with arrow function argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const arrowFn = createArrowFunction([], createIdentifier('items'))
    const node = createArrayExpression([createSpreadElement(arrowFn)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread with unary expression argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const unaryExpr = createUnaryExpression('!', createIdentifier('items'))
    const node = createArrayExpression([createSpreadElement(unaryExpr)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should detect spread with template literal argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const tpl = createTemplateLiteral([], [])
    const node = createArrayExpression([createSpreadElement(tpl)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread with object expression argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const objExpr = createObjectExpression([])
    const node = createArrayExpression([createSpreadElement(objExpr)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread with array expression argument (nested spread)', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const innerArray = createArrayExpression([createLiteral(1)])
    const node = createArrayExpression([createSpreadElement(innerArray)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread with variable named data', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('data'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('data')
  })

  test('should report spread with variable named results', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('results'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('results')
  })

  test('should report spread with variable named list', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('list'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('list')
  })

  test('should report spread with variable named collection', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('collection'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('collection')
  })

  test('should report spread with single character variable name', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('x'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('x')
  })

  test('should report spread with underscore variable name', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('_items'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('_items')
  })

  test('should report spread with dollar sign variable name', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('$items'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('$items')
  })

  test('should report spread with camelCase variable name', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('myLongArrayName'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('myLongArrayName')
  })

  test('should report spread with UPPER_CASE variable name', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('MY_ARRAY'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('MY_ARRAY')
  })

  test('should report spread with numeric identifier-like name', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('arr123'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('arr123')
  })

  test('should report multiple spreads interleaved with identifiers', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('a')),
      createIdentifier('x'),
      createSpreadElement(createIdentifier('b')),
      createIdentifier('y'),
      createSpreadElement(createIdentifier('c')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(3)
  })

  test('should report spread among many literal elements', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createLiteral(1),
      createLiteral(2),
      createLiteral(3),
      createLiteral(4),
      createLiteral(5),
      createSpreadElement(createIdentifier('rest')),
      createLiteral(6),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('rest')
  })

  test('should report spread with member expression argument using fallback', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const memberExpr = createMemberExpression(createIdentifier('props'), 'data')
    const node = createArrayExpression([createSpreadElement(memberExpr)])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('array')
  })

  test('should report spread with this.items member expression', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const thisExpr = { type: 'ThisExpression' }
    const memberExpr = createMemberExpression(thisExpr, 'items')
    const node = createArrayExpression([createSpreadElement(memberExpr)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread with arguments member expression', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const argsId = createIdentifier('arguments')
    const memberExpr = createMemberExpression(argsId, '0')
    const node = createArrayExpression([createSpreadElement(memberExpr)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should detect common pattern: copy array [...arr]', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('arr'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('arr')
  })
})

// ============================================================
// NOT REPORTING (35 tests)
// ============================================================
describe('not reporting', () => {
  test('should not report array without spread', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createLiteral(1), createLiteral(2), createLiteral(3)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report empty array', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report array with only literals', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createLiteral('a'), createLiteral('b'), createLiteral('c')])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report array with only identifiers (non-spread)', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createIdentifier('a'),
      createIdentifier('b'),
      createIdentifier('c'),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report array with member expressions only', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createMemberExpression(createIdentifier('obj'), 'a'),
      createMemberExpression(createIdentifier('obj'), 'b'),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report array with call expressions only', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createCallExpression(createIdentifier('fn'), []),
      createCallExpression(createIdentifier('fn2'), []),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report array with binary expressions only', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report array with object expressions only', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createObjectExpression([])])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report single element array with identifier', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createIdentifier('x')])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report single element array with literal', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createLiteral(42)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report array with null literal', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createLiteral(null)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report array with boolean literals', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createLiteral(true), createLiteral(false)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report array with string literals', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createLiteral('hello'), createLiteral('world')])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report array with numeric literals', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createLiteral(0), createLiteral(1), createLiteral(2)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report array with nested arrays (no spread)', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const innerArray = createArrayExpression([createLiteral(1)])
    const node = createArrayExpression([innerArray, createLiteral(2)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report spread inside nested array when outer has no spread', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const innerArray = createArrayExpression([
      createSpreadElement(createIdentifier('innerItems'), 2, 10),
    ])
    const node = createArrayExpression([createLiteral(1), innerArray, createLiteral(2)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report non-ArrayExpression type nodes', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = {
      type: 'ObjectExpression',
      properties: [createSpreadElement(createIdentifier('items'))],
    }
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report null node', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    visitor.ArrayExpression(null)
    expect(reports.length).toBe(0)
  })

  test('should not report undefined node', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    visitor.ArrayExpression(undefined)
    expect(reports.length).toBe(0)
  })

  test('should not report string node', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    visitor.ArrayExpression('string')
    expect(reports.length).toBe(0)
  })

  test('should not report number node', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    visitor.ArrayExpression(123)
    expect(reports.length).toBe(0)
  })

  test('should not report boolean node', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    visitor.ArrayExpression(true)
    expect(reports.length).toBe(0)
  })

  test('should not report node with empty type string', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    visitor.ArrayExpression({ type: '' })
    expect(reports.length).toBe(0)
  })

  test('should not report when spread element has null argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(null)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report when spread element has undefined argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadElement = { type: 'SpreadElement', argument: undefined }
    const node = createArrayExpression([spreadElement])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report when spread element has falsy argument (0)', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadElement = { type: 'SpreadElement', argument: 0 }
    const node = createArrayExpression([spreadElement])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report when spread element has falsy argument (empty string)', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadElement = { type: 'SpreadElement', argument: '' }
    const node = createArrayExpression([spreadElement])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report when spread element has falsy argument (false)', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadElement = { type: 'SpreadElement', argument: false }
    const node = createArrayExpression([spreadElement])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report node without elements property', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = {
      type: 'ArrayExpression',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report when elements is undefined', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = { type: 'ArrayExpression', elements: undefined }
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report when elements is null', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = { type: 'ArrayExpression', elements: null }
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report when elements is empty array', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = { type: 'ArrayExpression', elements: [] }
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report for non-spread element types mixed with identifiers', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createLiteral(1),
      createIdentifier('x'),
      createMemberExpression(createIdentifier('obj'), 'prop'),
      createCallExpression(createIdentifier('fn'), []),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report for array with arrow function elements', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createArrowFunction([], createLiteral(1)),
      createArrowFunction([], createLiteral(2)),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report for array with template literal elements', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createTemplateLiteral([], [])])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report for array with conditional expression elements', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const cond = createConditionalExpression(
      createIdentifier('x'),
      createLiteral(1),
      createLiteral(2),
    )
    const node = createArrayExpression([cond])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })
})

// ============================================================
// EDGE CASES (30 tests)
// ============================================================
describe('edge cases', () => {
  test('should handle null node gracefully', () => {
    const { context } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    expect(() => visitor.ArrayExpression(null)).not.toThrow()
  })

  test('should handle undefined node gracefully', () => {
    const { context } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    expect(() => visitor.ArrayExpression(undefined)).not.toThrow()
  })

  test('should handle non-object node gracefully (string)', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    expect(() => visitor.ArrayExpression('string')).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle non-object node gracefully (number)', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    expect(() => visitor.ArrayExpression(123)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle non-object node gracefully (boolean)', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    expect(() => visitor.ArrayExpression(true)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle node without elements property', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = {
      type: 'ArrayExpression',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    expect(() => visitor.ArrayExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle elements as undefined', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = { type: 'ArrayExpression', elements: undefined }
    expect(() => visitor.ArrayExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle node without loc', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    delete (node as Record<string, unknown>).loc
    expect(() => visitor.ArrayExpression(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle spread element with null argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(null)])
    expect(() => visitor.ArrayExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle spread element with undefined argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadElement = { type: 'SpreadElement', argument: undefined }
    const node = createArrayExpression([spreadElement])
    expect(() => visitor.ArrayExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle node with type as number', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    visitor.ArrayExpression({ type: 42 })
    expect(reports.length).toBe(0)
  })

  test('should handle node with type as boolean', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    visitor.ArrayExpression({ type: true })
    expect(reports.length).toBe(0)
  })

  test('should handle node with type as object', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    visitor.ArrayExpression({ type: {} })
    expect(reports.length).toBe(0)
  })

  test('should handle elements array with null values', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([null, createSpreadElement(createIdentifier('items')), null])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle elements array with undefined values', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      undefined,
      createSpreadElement(createIdentifier('items')),
      undefined,
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle elements with all null values', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([null, null, null])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should handle spread with non-identifier argument (MemberExpression)', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createMemberExpression(createIdentifier('obj'), 'arr')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('array')
  })

  test('should handle spread element with numeric argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadElement = { type: 'SpreadElement', argument: 42 }
    const node = createArrayExpression([spreadElement])
    expect(() => visitor.ArrayExpression(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle spread element with string argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadElement = { type: 'SpreadElement', argument: 'hello' }
    const node = createArrayExpression([spreadElement])
    expect(() => visitor.ArrayExpression(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle spread element with boolean argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadElement = { type: 'SpreadElement', argument: true }
    const node = createArrayExpression([spreadElement])
    expect(() => visitor.ArrayExpression(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle spread element with array argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadElement = { type: 'SpreadElement', argument: [1, 2, 3] }
    const node = createArrayExpression([spreadElement])
    expect(() => visitor.ArrayExpression(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle node with extra properties', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = {
      type: 'ArrayExpression',
      elements: [createSpreadElement(createIdentifier('items'))],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      extra: 'some extra data',
      range: [0, 10],
    }
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle identifier without name property', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const noNameId = { type: 'Identifier' }
    const node = createArrayExpression([createSpreadElement(noNameId)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle identifier with numeric name', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const numericNameId = { type: 'Identifier', name: 42 }
    const node = createArrayExpression([createSpreadElement(numericNameId)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle very large elements array', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const elements = Array.from({ length: 1000 }, (_, i) => createLiteral(i))
    elements.push(createSpreadElement(createIdentifier('rest')))
    const node = createArrayExpression(elements)
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle elements with object nodes (non-spread)', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([{ type: 'SomeOtherNode' }, { type: 'YetAnotherNode' }])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should handle spread element with empty object argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement({})])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle elements containing spread among many nulls', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      null,
      null,
      null,
      createSpreadElement(createIdentifier('x')),
      null,
      null,
      null,
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle loc with missing end property', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = {
      type: 'ArrayExpression',
      elements: [createSpreadElement(createIdentifier('items'))],
      loc: { start: { line: 1, column: 0 } },
    }
    expect(() => visitor.ArrayExpression(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle loc with missing start property', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = {
      type: 'ArrayExpression',
      elements: [createSpreadElement(createIdentifier('items'))],
      loc: { end: { line: 1, column: 10 } },
    }
    expect(() => visitor.ArrayExpression(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })
})

// ============================================================
// LOCATION (15 tests)
// ============================================================
describe('location', () => {
  test('should report correct location for spread element', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 10, 5)])
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.start.line).toBe(10)
    expect(reports[0].loc?.start.column).toBe(5)
  })

  test('should report correct location for spread at line 1 column 0', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 1, 0)])
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report correct location for spread at line 100 column 50', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 100, 50)])
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.start.line).toBe(100)
    expect(reports[0].loc?.start.column).toBe(50)
  })

  test('should report correct end location', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 5, 3)])
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.end.line).toBe(5)
    expect(reports[0].loc?.end.column).toBe(23)
  })

  test('should report correct location for each of multiple spread elements', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('a'), 1, 0),
      createSpreadElement(createIdentifier('b'), 2, 5),
      createSpreadElement(createIdentifier('c'), 3, 10),
    ])
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
    expect(reports[1].loc?.start).toEqual({ line: 2, column: 5 })
    expect(reports[2].loc?.start).toEqual({ line: 3, column: 10 })
  })

  test('should provide default location when node has no loc', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    delete (node as Record<string, unknown>).loc
    visitor.ArrayExpression(node)
    expect(reports[0].loc).toBeDefined()
    expect(reports[0].loc?.start.line).toBe(1)
  })

  test('should report location at line 10 column 15', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 10, 15)])
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.start.line).toBe(10)
    expect(reports[0].loc?.start.column).toBe(15)
  })

  test('should include both start and end in location', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 7, 3)])
    visitor.ArrayExpression(node)
    expect(reports[0].loc).toHaveProperty('start')
    expect(reports[0].loc).toHaveProperty('end')
  })

  test('should use spread element location not array location', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadEl = createSpreadElement(createIdentifier('items'), 20, 15)
    const node = createArrayExpression([createLiteral(1), spreadEl], 1, 0)
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.start.line).toBe(20)
    expect(reports[0].loc?.start.column).toBe(15)
  })

  test('should report location for spread with loc on different lines', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('a'), 1, 0),
      createSpreadElement(createIdentifier('b'), 5, 10),
    ])
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.start.line).not.toBe(reports[1].loc?.start.line)
  })

  test('should handle loc with string line/column gracefully', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = {
      type: 'ArrayExpression',
      elements: [
        {
          type: 'SpreadElement',
          argument: createIdentifier('items'),
          loc: { start: { line: '1', column: '0' }, end: { line: '1', column: '5' } },
        },
      ],
    }
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle spread element with only start loc', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadEl = {
      type: 'SpreadElement',
      argument: createIdentifier('items'),
      loc: { start: { line: 3, column: 5 } },
    }
    const node = createArrayExpression([spreadEl])
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.start.line).toBe(3)
  })

  test('should handle spread element with column 0', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 5, 0)])
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should handle spread element at line 1 only', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 1, 20)])
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(20)
  })

  test('should report location even with non-identifier spread argument', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const memberExpr = createMemberExpression(createIdentifier('obj'), 'arr')
    const node = createArrayExpression([createSpreadElement(memberExpr, 8, 4)])
    visitor.ArrayExpression(node)
    expect(reports[0].loc?.start.line).toBe(8)
    expect(reports[0].loc?.start.column).toBe(4)
  })
})

// ============================================================
// MESSAGES (12 tests)
// ============================================================
describe('messages', () => {
  test('should include array name in message when argument is identifier', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('myArray'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('myArray')
  })

  test('should use fallback name when argument is not identifier', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadArg = createMemberExpression(createIdentifier('obj'), 'items')
    const node = createArrayExpression([createSpreadElement(spreadArg)])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('array')
  })

  test('should mention concat in message', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('concat')
  })

  test('should mention slice in message', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('slice')
  })

  test('should mention performance in message', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message.toLowerCase()).toContain('performance')
  })

  test('should mention large in message', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('large')
  })

  test('should mention avoid in message', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message.toLowerCase()).toContain('avoid')
  })

  test('should mention spread in message', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message.toLowerCase()).toContain('spread')
  })

  test('should include RULE_SUGGESTIONS suffix in message', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('concat()')
    expect(reports[0].message).toContain('slice()')
  })

  test('should generate different messages for different identifiers', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('arr1')),
      createSpreadElement(createIdentifier('arr2')),
    ])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('arr1')
    expect(reports[1].message).toContain('arr2')
    expect(reports[0].message).not.toBe(reports[1].message)
  })

  test('should generate same fallback message for different non-identifier arguments', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createMemberExpression(createIdentifier('a'), 'x')),
      createSpreadElement(createMemberExpression(createIdentifier('b'), 'y')),
    ])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('array')
    expect(reports[1].message).toContain('array')
  })

  test('should produce non-empty message', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('test'))])
    visitor.ArrayExpression(node)
    expect(reports[0].message.length).toBeGreaterThan(0)
  })
})

// ============================================================
// MULTIPLE REPORTS (12 tests)
// ============================================================
describe('multiple reports', () => {
  test('should report two spread elements', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('a')),
      createSpreadElement(createIdentifier('b')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(2)
  })

  test('should report three spread elements', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('a')),
      createSpreadElement(createIdentifier('b')),
      createSpreadElement(createIdentifier('c')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(3)
  })

  test('should report four spread elements', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('a')),
      createSpreadElement(createIdentifier('b')),
      createSpreadElement(createIdentifier('c')),
      createSpreadElement(createIdentifier('d')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(4)
  })

  test('should report five spread elements', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('a')),
      createSpreadElement(createIdentifier('b')),
      createSpreadElement(createIdentifier('c')),
      createSpreadElement(createIdentifier('d')),
      createSpreadElement(createIdentifier('e')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(5)
  })

  test('should report only spread elements skipping nulls', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      null,
      createSpreadElement(createIdentifier('a')),
      null,
      createSpreadElement(createIdentifier('b')),
      null,
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(2)
  })

  test('should report only spread elements skipping undefined', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      undefined,
      createSpreadElement(createIdentifier('a')),
      undefined,
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report only spread elements skipping literals', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createLiteral(1),
      createSpreadElement(createIdentifier('a')),
      createLiteral(2),
      createSpreadElement(createIdentifier('b')),
      createLiteral(3),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(2)
  })

  test('should report only spread elements skipping identifiers', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createIdentifier('x'),
      createSpreadElement(createIdentifier('a')),
      createIdentifier('y'),
      createSpreadElement(createIdentifier('b')),
      createIdentifier('z'),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(2)
  })

  test('should maintain report order matching element order', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('first')),
      createLiteral(1),
      createSpreadElement(createIdentifier('second')),
      createLiteral(2),
      createSpreadElement(createIdentifier('third')),
    ])
    visitor.ArrayExpression(node)
    expect(reports[0].message).toContain('first')
    expect(reports[1].message).toContain('second')
    expect(reports[2].message).toContain('third')
  })

  test('should report each call to visitor independently', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)

    visitor.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('a'))]))
    visitor.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('b'))]))
    visitor.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('c'))]))

    expect(reports.length).toBe(3)
  })

  test('should report correct count for mix of spreads and non-spreads', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createLiteral(1),
      createSpreadElement(createIdentifier('a')),
      createIdentifier('x'),
      createSpreadElement(createIdentifier('b')),
      createMemberExpression(createIdentifier('obj'), 'y'),
      createSpreadElement(createIdentifier('c')),
      createLiteral(2),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(3)
  })

  test('should report spread elements with null arguments not counting as reports', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const spreadWithNull = createSpreadElement(null)
    const spreadWithId = createSpreadElement(createIdentifier('items'))
    const node = createArrayExpression([spreadWithNull, spreadWithId])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })
})

// ============================================================
// CONTEXT (10 tests)
// ============================================================
describe('context', () => {
  test('should work with empty options', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should work with custom file path', () => {
    const { context, reports } = createMockRuleContext({ filePath: '/custom/path/file.ts' })
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should work with custom source code', () => {
    const { context, reports } = createMockRuleContext({ source: 'const a = [...b];' })
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('b'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should work with different workspace roots', () => {
    const reports: ReportDescriptor[] = []
    const context: RuleContext = {
      report: (descriptor: ReportDescriptor) => {
        reports.push({ message: descriptor.message, loc: descriptor.loc })
      },
      getFilePath: () => '/home/user/project/file.ts',
      getAST: () => null,
      getSource: () => 'const arr = [...items];',
      getTokens: () => [],
      getComments: () => [],
      config: { options: [{}] },
      logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      workspaceRoot: '/home/user/project',
    } as unknown as RuleContext
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should work when config has extra options', () => {
    const { context, reports } = createMockRuleContext({
      options: [{ extraOption: true, anotherOption: 42 }],
    })
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should pass correct report descriptor to context.report', () => {
    const reports: ReportDescriptor[] = []
    const context: RuleContext = {
      report: (descriptor: ReportDescriptor) => {
        reports.push({ message: descriptor.message, loc: descriptor.loc })
      },
      getFilePath: () => '/src/file.ts',
      getAST: () => null,
      getSource: () => 'const arr = [...items];',
      getTokens: () => [],
      getComments: () => [],
      config: { options: [{}] },
      logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      workspaceRoot: '/src',
    } as unknown as RuleContext
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('testVar'), 5, 10)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('testVar')
    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[0].loc?.start.column).toBe(10)
  })

  test('should work when called from different contexts', () => {
    const { context: ctx1, reports: rep1 } = createMockRuleContext()
    const { context: ctx2, reports: rep2 } = createMockRuleContext()

    const visitor1 = noArrayDestructuringRule.create(ctx1)
    const visitor2 = noArrayDestructuringRule.create(ctx2)

    visitor1.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('a'))]))
    visitor2.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('b'))]))

    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(1)
    expect(rep1[0].message).toContain('a')
    expect(rep2[0].message).toContain('b')
  })

  test('should not share state between contexts', () => {
    const { context: ctx1, reports: rep1 } = createMockRuleContext()
    const { context: ctx2, reports: rep2 } = createMockRuleContext()

    const visitor1 = noArrayDestructuringRule.create(ctx1)
    visitor1.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('a'))]))

    const visitor2 = noArrayDestructuringRule.create(ctx2)
    visitor2.ArrayExpression(createArrayExpression([createLiteral(1)]))

    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(0)
  })

  test('should work with TypeScript file extension', () => {
    const { context, reports } = createMockRuleContext({ filePath: '/project/src/module.ts' })
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should work with JavaScript file extension', () => {
    const { context, reports } = createMockRuleContext({ filePath: '/project/src/module.js' })
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })
})

// ============================================================
// TEST.EACH - PARAMETERIZED TESTS (45+ tests)
// ============================================================
describe('test.each - parameterized spread detection', () => {
  test.each([
    { name: 'items', expected: 'items' },
    { name: 'data', expected: 'data' },
    { name: 'results', expected: 'results' },
    { name: 'list', expected: 'list' },
    { name: 'arr', expected: 'arr' },
    { name: 'collection', expected: 'collection' },
    { name: 'x', expected: 'x' },
    { name: '_items', expected: '_items' },
    { name: '$data', expected: '$data' },
    { name: 'myLongVariableName', expected: 'myLongVariableName' },
    { name: 'UPPER_CASE', expected: 'UPPER_CASE' },
    { name: 'arr123', expected: 'arr123' },
    { name: 'foo', expected: 'foo' },
    { name: 'bar', expected: 'bar' },
    { name: 'baz', expected: 'baz' },
  ] as Array<{ name: string; expected: string }>)(
    'should report spread with identifier "$name"',
    ({ name, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayDestructuringRule.create(context)
      const node = createArrayExpression([createSpreadElement(createIdentifier(name))])
      visitor.ArrayExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(expected)
    },
  )
})

describe('test.each - parameterized location tests', () => {
  test.each([
    { line: 1, column: 0 },
    { line: 1, column: 5 },
    { line: 5, column: 0 },
    { line: 10, column: 15 },
    { line: 100, column: 50 },
    { line: 1, column: 1 },
    { line: 42, column: 7 },
    { line: 999, column: 0 },
  ] as Array<{ line: number; column: number }>)(
    'should report correct location at line $line, column $column',
    ({ line, column }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayDestructuringRule.create(context)
      const node = createArrayExpression([
        createSpreadElement(createIdentifier('items'), line, column),
      ])
      visitor.ArrayExpression(node)
      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    },
  )
})

describe('test.each - parameterized non-reporting cases', () => {
  test.each([
    { description: 'empty array', elements: [] },
    { description: 'single literal', elements: [createLiteral(1)] },
    { description: 'single string literal', elements: [createLiteral('hello')] },
    { description: 'single boolean literal', elements: [createLiteral(true)] },
    { description: 'single null literal', elements: [createLiteral(null)] },
    { description: 'two literals', elements: [createLiteral(1), createLiteral(2)] },
    {
      description: 'three literals',
      elements: [createLiteral(1), createLiteral(2), createLiteral(3)],
    },
    { description: 'single identifier', elements: [createIdentifier('x')] },
    {
      description: 'multiple identifiers',
      elements: [createIdentifier('a'), createIdentifier('b'), createIdentifier('c')],
    },
    {
      description: 'mixed literals and identifiers',
      elements: [createLiteral(1), createIdentifier('x'), createLiteral('hello')],
    },
  ] as Array<{ description: string; elements: unknown[] }>)(
    'should not report for $description',
    ({ elements }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayDestructuringRule.create(context)
      const node = createArrayExpression(elements)
      visitor.ArrayExpression(node)
      expect(reports.length).toBe(0)
    },
  )
})

describe('test.each - parameterized edge cases for node types', () => {
  test.each([
    { input: null, description: 'null' },
    { input: undefined, description: 'undefined' },
    { input: 'string', description: 'string' },
    { input: 42, description: 'number' },
    { input: true, description: 'boolean' },
    { input: {}, description: 'empty object without type' },
    { input: { type: 'OtherExpression' }, description: 'wrong type' },
    { input: { type: '' }, description: 'empty type string' },
  ] as Array<{ input: unknown; description: string }>)(
    'should not throw for $description input',
    ({ input }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayDestructuringRule.create(context)
      expect(() => visitor.ArrayExpression(input)).not.toThrow()
      expect(reports.length).toBe(0)
    },
  )
})

describe('test.each - spread argument types', () => {
  test.each([
    { type: 'MemberExpression', description: 'member expression' },
    { type: 'CallExpression', description: 'call expression' },
    { type: 'BinaryExpression', description: 'binary expression' },
    { type: 'ObjectExpression', description: 'object expression' },
    { type: 'ArrowFunctionExpression', description: 'arrow function' },
    { type: 'ConditionalExpression', description: 'conditional expression' },
    { type: 'TemplateLiteral', description: 'template literal' },
    { type: 'UnaryExpression', description: 'unary expression' },
  ] as Array<{ type: string; description: string }>)(
    'should report spread with $description argument and use fallback name',
    ({ type }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayDestructuringRule.create(context)
      const node = createArrayExpression([createSpreadElement({ type })])
      visitor.ArrayExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    },
  )
})

// ============================================================
// INTEGRATION-LIKE SCENARIOS (10 tests)
// ============================================================
describe('integration-like scenarios', () => {
  test('should report common pattern: [...array]', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([createSpreadElement(createIdentifier('array'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report common pattern: [1, 2, ...array]', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createLiteral(1),
      createLiteral(2),
      createSpreadElement(createIdentifier('array')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report common pattern: [...array, 3, 4]', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('array')),
      createLiteral(3),
      createLiteral(4),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report common pattern: [a, ...array, b]', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createIdentifier('a'),
      createSpreadElement(createIdentifier('array')),
      createIdentifier('b'),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report common pattern: [...arr1, ...arr2]', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('arr1')),
      createSpreadElement(createIdentifier('arr2')),
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(2)
  })

  test('should report pattern: [...obj.items]', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const memberExpr = createMemberExpression(createIdentifier('obj'), 'items')
    const node = createArrayExpression([createSpreadElement(memberExpr)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report pattern: [...getItems()]', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const callExpr = createCallExpression(createIdentifier('getItems'), [])
    const node = createArrayExpression([createSpreadElement(callExpr)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle multiple sequential ArrayExpression visits', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)

    visitor.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('a'))]))
    visitor.ArrayExpression(createArrayExpression([createLiteral(1)]))
    visitor.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('b'))]))

    expect(reports.length).toBe(2)
  })

  test('should handle pattern with many elements and one spread', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const elements = [
      createLiteral(1),
      createLiteral(2),
      createLiteral(3),
      createLiteral(4),
      createLiteral(5),
      createLiteral(6),
      createLiteral(7),
      createLiteral(8),
      createLiteral(9),
      createSpreadElement(createIdentifier('rest')),
    ]
    const node = createArrayExpression(elements)
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('rest')
  })

  test('should handle visitor being reused across different source files', () => {
    const { context: ctx1, reports: rep1 } = createMockRuleContext({
      filePath: '/project/a.ts',
      source: 'const a = [...items];',
    })
    const { context: ctx2, reports: rep2 } = createMockRuleContext({
      filePath: '/project/b.ts',
      source: '[...data];',
    })

    const visitor1 = noArrayDestructuringRule.create(ctx1)
    const visitor2 = noArrayDestructuringRule.create(ctx2)

    visitor1.ArrayExpression(
      createArrayExpression([createSpreadElement(createIdentifier('items'))]),
    )
    visitor2.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('data'))]))

    expect(rep1[0].message).toContain('items')
    expect(rep2[0].message).toContain('data')
  })
})

// ============================================================
// NESTED STRUCTURES (10 tests)
// ============================================================
describe('nested structures', () => {
  test('should report spread in outer array', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const innerArray = createArrayExpression([
      createSpreadElement(createIdentifier('innerItems'), 2, 5),
    ])
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('outerItems'), 1, 0),
      innerArray,
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('outerItems')
  })

  test('should not report spread inside nested array when outer has no spread', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const innerArray = createArrayExpression([
      createSpreadElement(createIdentifier('innerItems'), 2, 10),
    ])
    const node = createArrayExpression([createLiteral(1), innerArray, createLiteral(2)])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should handle deeply nested arrays without spread', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const deep = createArrayExpression([createArrayExpression([createLiteral(1)])])
    const node = createArrayExpression([deep])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should report spread at top level of nested structure', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const innerArray = createArrayExpression([createLiteral(1)])
    const node = createArrayExpression([
      createSpreadElement(createIdentifier('items'), 1, 5),
      innerArray,
    ])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should report spread with nested object expression element', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const obj = createObjectExpression([])
    const node = createArrayExpression([createSpreadElement(createIdentifier('items')), obj])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle array with nested call expression and spread', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const callExpr = createCallExpression(createIdentifier('fn'), [createLiteral(1)])
    const node = createArrayExpression([callExpr, createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle array with nested arrow function and spread', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const arrowFn = createArrowFunction([createIdentifier('x')], createIdentifier('x'))
    const node = createArrayExpression([arrowFn, createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle array with nested conditional and spread', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const cond = createConditionalExpression(
      createIdentifier('x'),
      createLiteral(1),
      createLiteral(2),
    )
    const node = createArrayExpression([cond, createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle array with nested binary and spread', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const bin = createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b'))
    const node = createArrayExpression([bin, createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle array with nested unary and spread', () => {
    const { context, reports } = createMockRuleContext()
    const visitor = noArrayDestructuringRule.create(context)
    const unary = createUnaryExpression('-', createIdentifier('x'))
    const node = createArrayExpression([unary, createSpreadElement(createIdentifier('items'))])
    visitor.ArrayExpression(node)
    expect(reports.length).toBe(1)
  })
})
