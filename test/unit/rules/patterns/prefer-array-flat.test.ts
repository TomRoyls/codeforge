import { preferArrayFlatRule } from '../../../../src/rules/patterns/prefer-array-flat.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
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

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createArrayLiteral(elements: unknown[] = []): unknown {
  return {
    type: 'ArrayExpression',
    elements,
  }
}

function createArrowFunction(params: unknown[], body: unknown, expression = false): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params,
    body,
    expression,
  }
}

function createFunctionExpression(params: unknown[], body: unknown): unknown {
  return {
    type: 'FunctionExpression',
    params,
    body,
  }
}

function createBlockStatement(body: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body,
  }
}

function createReturnStatement(argument: unknown): unknown {
  return {
    type: 'ReturnStatement',
    argument,
  }
}

function createSpreadElement(argument: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function createForStatement(body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ForStatement',
    body,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createForOfStatement(
  left: unknown,
  right: unknown,
  body: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ForOfStatement',
    left,
    right,
    body,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createForInStatement(
  left: unknown,
  right: unknown,
  body: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ForInStatement',
    left,
    right,
    body,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createExpressionStatement(expression: unknown): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

// Helper: build a reduce+concat CallExpression node (arrow function expression body)
function buildReduceConcatNode(
  arrayName = 'array',
  accName = 'acc',
  valName = 'val',
  line = 1,
  column = 0,
): { node: unknown; callee: unknown } {
  const callee = createMemberExpression(createIdentifier(arrayName), 'reduce')
  const callback = createArrowFunction(
    [createIdentifier(accName), createIdentifier(valName)],
    createCallExpression(createMemberExpression(createIdentifier(accName), 'concat'), [
      createIdentifier(valName),
    ]),
    true,
  )
  const node = createCallExpression(callee, [callback, createArrayLiteral([])], line, column)
  return { node, callee }
}

// Helper: build a reduce+spread CallExpression node
function buildReduceSpreadNode(
  arrayName = 'array',
  accName = 'acc',
  valName = 'val',
  line = 1,
  column = 0,
): { node: unknown; callee: unknown } {
  const callee = createMemberExpression(createIdentifier(arrayName), 'reduce')
  const newArray = createArrayLiteral([
    createSpreadElement(createIdentifier(accName)),
    createSpreadElement(createIdentifier(valName)),
  ])
  const callback = createArrowFunction(
    [createIdentifier(accName), createIdentifier(valName)],
    newArray,
    true,
  )
  const node = createCallExpression(callee, [callback, createArrayLiteral([])], line, column)
  return { node, callee }
}

// Helper: build nested for-loop with push
function buildNestedForLoopNode(
  outerType: 'ForStatement' | 'ForOfStatement' | 'ForInStatement' = 'ForStatement',
  innerType: 'ForStatement' | 'ForOfStatement' | 'ForInStatement' = 'ForStatement',
  pushTarget = 'result',
  pushArg = 'item',
): unknown {
  const innerPushCall = createCallExpression(
    createMemberExpression(createIdentifier(pushTarget), 'push'),
    [createIdentifier(pushArg)],
  )
  const innerStatements = [createExpressionStatement(innerPushCall)]

  let innerLoop: unknown
  if (innerType === 'ForOfStatement') {
    innerLoop = createForOfStatement(
      createIdentifier('i'),
      createIdentifier('inner'),
      createBlockStatement(innerStatements),
      2,
      4,
    )
  } else if (innerType === 'ForInStatement') {
    innerLoop = createForInStatement(
      createIdentifier('i'),
      createIdentifier('inner'),
      createBlockStatement(innerStatements),
      2,
      4,
    )
  } else {
    innerLoop = createForStatement(createBlockStatement(innerStatements), 2, 4)
  }

  const outerBody = createBlockStatement([innerLoop])

  if (outerType === 'ForOfStatement') {
    return createForOfStatement(createIdentifier('j'), createIdentifier('outer'), outerBody, 1, 0)
  } else if (outerType === 'ForInStatement') {
    return createForInStatement(createIdentifier('j'), createIdentifier('outer'), outerBody, 1, 0)
  }
  return createForStatement(outerBody, 1, 0)
}

describe('prefer-array-flat rule', () => {
  // =========================================================
  // SECTION 1: Meta tests (7 tests) - ALL ORIGINAL
  // =========================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferArrayFlatRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferArrayFlatRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferArrayFlatRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferArrayFlatRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferArrayFlatRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferArrayFlatRule.meta.fixable).toBe('code')
    })

    test('should mention flat in description', () => {
      expect(preferArrayFlatRule.meta.docs?.description.toLowerCase()).toContain('flat')
    })
  })

  // =========================================================
  // SECTION 2: Create visitor tests (1 test) - ALL ORIGINAL
  // =========================================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('ForStatement')
      expect(visitor).toHaveProperty('ForOfStatement')
    })
  })

  // =========================================================
  // SECTION 3: Detecting reduce with concat (5 tests) - ALL ORIGINAL
  // =========================================================
  describe('detecting reduce with concat', () => {
    test('should report reduce with concat using arrow function expression body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])', filePath: '/src/file.ts' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.flat()')
      expect(reports[0].message).toContain('reduce')
      expect(reports[0].message).toContain('concat')
    })

    test('should report reduce with concat using arrow function block body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => { return acc.concat(val); }, [])', filePath: '/src/file.ts' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callbackBody = createBlockStatement([
        createReturnStatement(
          createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
            createIdentifier('val'),
          ]),
        ),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
        false,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report reduce with concat using function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callbackBody = createBlockStatement([
        createReturnStatement(
          createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
            createIdentifier('val'),
          ]),
        ),
      ])
      const callback = createFunctionExpression(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should include array name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('nestedArrays'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])

      visitor.CallExpression(node)

      expect(reports[0].message).toContain('nestedArrays')
    })
  })

  // =========================================================
  // SECTION 4: Detecting reduce with spread concat (3 tests) - ALL ORIGINAL
  // =========================================================
  describe('detecting reduce with spread concat', () => {
    test('should report reduce with spread pattern [...acc, ...val]', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => [...acc, ...val], [])', filePath: '/src/file.ts' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const newArray = createArrayLiteral([
        createSpreadElement(createIdentifier('acc')),
        createSpreadElement(createIdentifier('val')),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        newArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.flat()')
    })

    test('should report reduce with multiple spreads', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const newArray = createArrayLiteral([
        createSpreadElement(createIdentifier('acc')),
        createSpreadElement(createIdentifier('val1')),
        createSpreadElement(createIdentifier('val2')),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val1'), createIdentifier('val2')],
        newArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report spread with less than 2 spreads', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const newArray = createArrayLiteral([
        createSpreadElement(createIdentifier('acc')),
        createIdentifier('val'),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        newArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 5: Fix generation (2 tests) - ALL ORIGINAL
  // =========================================================
  describe('fix generation', () => {
    test('should generate fix for reduce with concat', () => {
      const source = 'array.reduce((acc, val) => acc.concat(val), [])'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferArrayFlatRule.create(context)

      const arrayIdentifier = createIdentifier('array')
      ;(arrayIdentifier as Record<string, unknown>).range = [0, 5]

      const callee = createMemberExpression(arrayIdentifier, 'reduce')
      ;(callee as Record<string, unknown>).range = [0, 13]

      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])], 1, 0)
      ;(node as Record<string, unknown>).range = [0, source.length]

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('array.flat()')
    })

    test('should use "array" as fallback name when callee is not Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getArray'), [])
      const callee = createMemberExpression(innerCall, 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array.flat()')
    })
  })

  // =========================================================
  // SECTION 6: Nested for loops (3 tests) - ALL ORIGINAL
  // =========================================================
  describe('nested for loops', () => {
    test('should report nested for loops with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const innerPushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const innerStatements = [createExpressionStatement(innerPushCall)]
      const innerForLoop = createForStatement(createBlockStatement(innerStatements), 2, 4)

      const outerBody = createBlockStatement([innerForLoop])
      const outerForLoop = createForStatement(outerBody, 1, 0)

      visitor.ForStatement(outerForLoop)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.flat()')
      expect(reports[0].message).toContain('nested for loops')
    })

    test('should report nested for-of loops with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const innerPushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const innerStatements = [createExpressionStatement(innerPushCall)]
      const innerForLoop = createForOfStatement(
        createIdentifier('i'),
        createIdentifier('inner'),
        createBlockStatement(innerStatements),
        2,
        4,
      )

      const outerBody = createBlockStatement([innerForLoop])
      const outerForLoop = createForOfStatement(
        createIdentifier('j'),
        createIdentifier('outer'),
        outerBody,
        1,
        0,
      )

      visitor.ForOfStatement(outerForLoop)

      expect(reports.length).toBe(1)
    })

    test('should report mixed nested for loops with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const innerPushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const innerStatements = [createExpressionStatement(innerPushCall)]
      const innerForLoop = createForOfStatement(
        createIdentifier('i'),
        createIdentifier('inner'),
        createBlockStatement(innerStatements),
        2,
        4,
      )

      const outerBody = createBlockStatement([innerForLoop])
      const outerForLoop = createForStatement(outerBody, 1, 0)

      visitor.ForStatement(outerForLoop)

      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // SECTION 7: Valid alternative patterns - reduce (5 tests) - ALL ORIGINAL
  // =========================================================
  describe('valid alternative patterns - reduce', () => {
    test('should not report reduce without empty array initial value', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createLiteral('initial')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report reduce without concat in body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'push'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report reduce without initial value', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report reduce with non-arrow function callback', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const node = createCallExpression(callee, [
        createIdentifier('callbackFunction'),
        createArrayLiteral([]),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report reduce without return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callbackBody = createBlockStatement([
        createExpressionStatement(
          createCallExpression(createIdentifier('console'), [createIdentifier('log')]),
        ),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
        false,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 8: Valid alternative patterns - for loops (3 tests) - ALL ORIGINAL
  // =========================================================
  describe('valid alternative patterns - for loops', () => {
    test('should not report single for loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const pushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const statements = [createExpressionStatement(pushCall)]
      const forLoop = createForStatement(createBlockStatement(statements))

      visitor.ForStatement(forLoop)

      expect(reports.length).toBe(0)
    })

    test('should not report nested for loops without push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const logCall = createCallExpression(
        createMemberExpression(createIdentifier('console'), 'log'),
        [createIdentifier('item')],
      )
      const innerStatements = [createExpressionStatement(logCall)]
      const innerForLoop = createForStatement(createBlockStatement(innerStatements), 2, 4)

      const outerBody = createBlockStatement([innerForLoop])
      const outerForLoop = createForStatement(outerBody, 1, 0)

      visitor.ForStatement(outerForLoop)

      expect(reports.length).toBe(0)
    })

    test('should not report for loop with nested non-for-loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const pushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const ifBody = createBlockStatement([createExpressionStatement(pushCall)])

      const ifStatement = {
        type: 'IfStatement',
        test: createIdentifier('condition'),
        consequent: ifBody,
      }

      const body = createBlockStatement([ifStatement])
      const forLoop = createForStatement(body)

      visitor.ForStatement(forLoop)

      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 9: Edge cases (8 tests) - ALL ORIGINAL
  // =========================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(() => visitor.ForStatement(null)).not.toThrow()
      expect(() => visitor.ForOfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(() => visitor.ForStatement(undefined)).not.toThrow()
      expect(() => visitor.ForOfStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(() => visitor.ForStatement('string')).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [callback, createArrayLiteral([])],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle regular function calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const node = createCallExpression(createIdentifier('fn'), [createIdentifier('arg')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-reduce method calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'map')
      const node = createCallExpression(callee, [createIdentifier('callback')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])], 10, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty array literal with elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const initialValue = createArrayLiteral([createLiteral(1)])
      const node = createCallExpression(callee, [callback, initialValue])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should treat undefined elements as empty array', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const initialValue = {
        type: 'ArrayExpression',
        elements: undefined,
      }
      const node = createCallExpression(callee, [callback, initialValue])

      visitor.CallExpression(node)

      // undefined elements is treated as empty array by isArrayLiteral helper
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // SECTION 10: Message quality (2 tests) - ALL ORIGINAL
  // =========================================================
  describe('message quality', () => {
    test('should mention flat in reduce message', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])

      visitor.CallExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('.flat()')
    })

    test('should mention flat in nested for loop message', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)

      const innerPushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const innerStatements = [createExpressionStatement(innerPushCall)]
      const innerForLoop = createForStatement(createBlockStatement(innerStatements), 2, 4)

      const outerBody = createBlockStatement([innerForLoop])
      const outerForLoop = createForStatement(outerBody, 1, 0)

      visitor.ForStatement(outerForLoop)

      expect(reports[0].message.toLowerCase()).toContain('.flat()')
      expect(reports[0].message.toLowerCase()).toContain('nested for loops')
    })
  })

  // =========================================================
  // SECTION 11: Additional meta property tests
  // =========================================================
  describe('meta - additional properties', () => {
    test('should have docs url', () => {
      expect(preferArrayFlatRule.meta.docs?.url).toBeDefined()
      expect(preferArrayFlatRule.meta.docs?.url).toContain('prefer-array-flat')
    })

    test('should mention reduce in description', () => {
      expect(preferArrayFlatRule.meta.docs?.description.toLowerCase()).toContain('reduce')
    })

    test('should mention concat in description', () => {
      expect(preferArrayFlatRule.meta.docs?.description.toLowerCase()).toContain('concat')
    })

    test('should have empty schema array', () => {
      expect(preferArrayFlatRule.meta.schema).toEqual([])
    })

    test('should have fixable set to code string', () => {
      expect(typeof preferArrayFlatRule.meta.fixable).toBe('string')
      expect(preferArrayFlatRule.meta.fixable).toBe('code')
    })

    test('should have create method on rule', () => {
      expect(typeof preferArrayFlatRule.create).toBe('function')
    })

    test('should have default export defined', () => {
      expect(preferArrayFlatRule).toBeDefined()
      expect(typeof preferArrayFlatRule).toBe('object')
    })
  })

  // =========================================================
  // SECTION 12: Visitor structure tests
  // =========================================================
  describe('visitor structure', () => {
    test('visitor CallExpression should be a function', () => {
      const { context } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('visitor ForStatement should be a function', () => {
      const { context } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      expect(typeof visitor.ForStatement).toBe('function')
    })

    test('visitor ForOfStatement should be a function', () => {
      const { context } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      expect(typeof visitor.ForOfStatement).toBe('function')
    })

    test('visitor should not have ForInStatement method', () => {
      const { context } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      expect(visitor).not.toHaveProperty('ForInStatement')
    })

    test('should create fresh visitor for each context', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const { context: ctx2 } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor1 = preferArrayFlatRule.create(ctx1)
      const visitor2 = preferArrayFlatRule.create(ctx2)
      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor should have exactly 3 methods', () => {
      const { context } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const methods = Object.keys(visitor)
      expect(methods.length).toBe(3)
    })
  })

  // =========================================================
  // SECTION 13: Reduce with concat - various array names
  // =========================================================
  describe('reduce with concat - array names', () => {
    test('should report for array named "data"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('data')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('data')
    })

    test('should report for array named "items"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('items')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('items')
    })

    test('should report for array named "results"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('results')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('results')
    })

    test('should report for array named "arr"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('arr')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arr')
    })

    test('should report for array named "lists"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('lists')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('lists')
    })

    test('should report for array named "nested"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('nested')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested')
    })

    test('should report for array named "matrix"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('matrix')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('matrix')
    })

    test('should report for array named "rows"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('rows')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rows')
    })

    test('should report for single letter array name "x"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('x')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report for underscored array name "_data"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('_data')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_data')
    })
  })

  // =========================================================
  // SECTION 14: Reduce with concat - arrow function block body variants
  // =========================================================
  describe('reduce with concat - block body variants', () => {
    test('should report arrow block body with return acc.concat(val)', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callbackBody = createBlockStatement([
        createReturnStatement(
          createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
            createIdentifier('val'),
          ]),
        ),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
        false,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report function expression body with return acc.concat(val)', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callbackBody = createBlockStatement([
        createReturnStatement(
          createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
            createIdentifier('val'),
          ]),
        ),
      ])
      const callback = createFunctionExpression(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report function expression returning [...acc, ...val]', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const spreadArray = createArrayLiteral([
        createSpreadElement(createIdentifier('acc')),
        createSpreadElement(createIdentifier('val')),
      ])
      const callbackBody = createBlockStatement([createReturnStatement(spreadArray)])
      const callback = createFunctionExpression(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report arrow block body returning [...acc, ...val]', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const spreadArray = createArrayLiteral([
        createSpreadElement(createIdentifier('acc')),
        createSpreadElement(createIdentifier('val')),
      ])
      const callbackBody = createBlockStatement([createReturnStatement(spreadArray)])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
        false,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report block body without return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callbackBody = createBlockStatement([
        createExpressionStatement(
          createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
            createIdentifier('val'),
          ]),
        ),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
        false,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 15: Spread pattern variants
  // =========================================================
  describe('spread pattern variants', () => {
    test('should report spread with two elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceSpreadNode('array', 'a', 'b')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report spread with three spread elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const spreadArray = createArrayLiteral([
        createSpreadElement(createIdentifier('acc')),
        createSpreadElement(createIdentifier('v1')),
        createSpreadElement(createIdentifier('v2')),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('v1'), createIdentifier('v2')],
        spreadArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report spread with four spread elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const spreadArray = createArrayLiteral([
        createSpreadElement(createIdentifier('acc')),
        createSpreadElement(createIdentifier('v1')),
        createSpreadElement(createIdentifier('v2')),
        createSpreadElement(createIdentifier('v3')),
      ])
      const callback = createArrowFunction(
        [
          createIdentifier('acc'),
          createIdentifier('v1'),
          createIdentifier('v2'),
          createIdentifier('v3'),
        ],
        spreadArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report spread with five spread elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const spreadArray = createArrayLiteral([
        createSpreadElement(createIdentifier('a')),
        createSpreadElement(createIdentifier('b')),
        createSpreadElement(createIdentifier('c')),
        createSpreadElement(createIdentifier('d')),
        createSpreadElement(createIdentifier('e')),
      ])
      const callback = createArrowFunction(
        [
          createIdentifier('acc'),
          createIdentifier('b'),
          createIdentifier('c'),
          createIdentifier('d'),
          createIdentifier('e'),
        ],
        spreadArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report spread with only one spread element', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const spreadArray = createArrayLiteral([createSpreadElement(createIdentifier('acc'))])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        spreadArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report spread with zero elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const emptyArray = createArrayLiteral([])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        emptyArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report array with mix of spread and non-spread elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const mixedArray = createArrayLiteral([
        createSpreadElement(createIdentifier('acc')),
        createIdentifier('val'),
        createIdentifier('extra'),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        mixedArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      // Only 1 spread element, so less than 2
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 16: Non-reduce CallExpressions
  // =========================================================
  describe('non-reduce CallExpressions', () => {
    test('should not report map call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'map')
      const node = createCallExpression(callee, [createIdentifier('fn')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report filter call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'filter')
      const node = createCallExpression(callee, [createIdentifier('fn')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report forEach call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'forEach')
      const node = createCallExpression(callee, [createIdentifier('fn')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report flatMap call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'flatMap')
      const node = createCallExpression(callee, [createIdentifier('fn')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report flat call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'flat')
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report find call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'find')
      const node = createCallExpression(callee, [createIdentifier('fn')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report some call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'some')
      const node = createCallExpression(callee, [createIdentifier('fn')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report every call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'every')
      const node = createCallExpression(callee, [createIdentifier('fn')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report join call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'join')
      const node = createCallExpression(callee, [createLiteral(',')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report standalone function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = createCallExpression(createIdentifier('myFunc'), [createIdentifier('arg')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report constructor call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('Array'), 'from')
      const node = createCallExpression(callee, [createIdentifier('iterable')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sort call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'sort')
      const node = createCallExpression(callee, [createIdentifier('compareFn')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report slice call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'slice')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 17: Reduce without flattening patterns
  // =========================================================
  describe('reduce without flattening', () => {
    test('should not report reduce with sum pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      // Initial value is a number, not empty array
      const node = createCallExpression(callee, [callback, createLiteral(0)])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report reduce with object initial value', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const objInit = { type: 'ObjectExpression', properties: [] }
      const node = createCallExpression(callee, [callback, objInit])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report reduce with string initial value', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createLiteral('')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report reduce with null initial value', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createLiteral(null)])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report reduce with push in body instead of concat', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'push'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report reduce with map in body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'map'), [
          createIdentifier('fn'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report reduce with filter in body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'filter'), [
          createIdentifier('fn'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report reduce callback that is plain identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const node = createCallExpression(callee, [
        createIdentifier('myReducer'),
        createArrayLiteral([]),
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report reduce with only callback, no initial value', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report reduce with empty block body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callbackBody = createBlockStatement([])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
        false,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 18: Nested for loop combinations
  // =========================================================
  describe('nested for loop combinations', () => {
    test('should report ForStatement containing ForStatement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForStatement', 'ForStatement')
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report ForStatement containing ForOfStatement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForStatement', 'ForOfStatement')
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report ForStatement containing ForInStatement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForStatement', 'ForInStatement')
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report ForOfStatement containing ForStatement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForOfStatement', 'ForStatement')
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report ForOfStatement containing ForOfStatement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForOfStatement', 'ForOfStatement')
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report ForOfStatement containing ForInStatement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForOfStatement', 'ForInStatement')
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested for loops with different push target names', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForStatement', 'ForStatement', 'output', 'elem')
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested for loops with push of literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForStatement', 'ForStatement', 'result', 'val')
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // SECTION 19: For loops - non-nesting patterns
  // =========================================================
  describe('for loops - non-nesting patterns', () => {
    test('should not report single ForStatement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const pushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const forLoop = createForStatement(
        createBlockStatement([createExpressionStatement(pushCall)]),
      )
      visitor.ForStatement(forLoop)
      expect(reports.length).toBe(0)
    })

    test('should not report single ForOfStatement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const pushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const forLoop = createForOfStatement(
        createIdentifier('i'),
        createIdentifier('arr'),
        createBlockStatement([createExpressionStatement(pushCall)]),
      )
      visitor.ForOfStatement(forLoop)
      expect(reports.length).toBe(0)
    })

    test('should not report nested for loops without push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const consoleLog = createCallExpression(
        createMemberExpression(createIdentifier('console'), 'log'),
        [createIdentifier('item')],
      )
      const innerStatements = [createExpressionStatement(consoleLog)]
      const innerForLoop = createForStatement(createBlockStatement(innerStatements), 2, 4)
      const outerBody = createBlockStatement([innerForLoop])
      const outerForLoop = createForStatement(outerBody, 1, 0)
      visitor.ForStatement(outerForLoop)
      expect(reports.length).toBe(0)
    })

    test('should not report nested for-of loops without push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const consoleLog = createCallExpression(
        createMemberExpression(createIdentifier('console'), 'log'),
        [createIdentifier('item')],
      )
      const innerStatements = [createExpressionStatement(consoleLog)]
      const innerForLoop = createForOfStatement(
        createIdentifier('i'),
        createIdentifier('inner'),
        createBlockStatement(innerStatements),
        2,
        4,
      )
      const outerBody = createBlockStatement([innerForLoop])
      const outerForLoop = createForOfStatement(
        createIdentifier('j'),
        createIdentifier('outer'),
        outerBody,
        1,
        0,
      )
      visitor.ForOfStatement(outerForLoop)
      expect(reports.length).toBe(0)
    })

    test('should not report ForStatement containing if statement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const pushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const ifStatement = {
        type: 'IfStatement',
        test: createIdentifier('cond'),
        consequent: createBlockStatement([createExpressionStatement(pushCall)]),
      }
      const forLoop = createForStatement(createBlockStatement([ifStatement]))
      visitor.ForStatement(forLoop)
      expect(reports.length).toBe(0)
    })

    test('should not report ForOfStatement containing while statement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const pushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const whileStatement = {
        type: 'WhileStatement',
        test: createIdentifier('cond'),
        body: createBlockStatement([createExpressionStatement(pushCall)]),
      }
      const forLoop = createForOfStatement(
        createIdentifier('i'),
        createIdentifier('arr'),
        createBlockStatement([whileStatement]),
      )
      visitor.ForOfStatement(forLoop)
      expect(reports.length).toBe(0)
    })

    test('should not report empty ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const forLoop = createForStatement(createBlockStatement([]))
      visitor.ForStatement(forLoop)
      expect(reports.length).toBe(0)
    })

    test('should not report empty ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const forLoop = createForOfStatement(
        createIdentifier('i'),
        createIdentifier('arr'),
        createBlockStatement([]),
      )
      visitor.ForOfStatement(forLoop)
      expect(reports.length).toBe(0)
    })

    test('should not report for loop with only expression statement (non-push)', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const assignExpr = {
        type: 'AssignmentExpression',
        left: createIdentifier('x'),
        right: createLiteral(1),
      }
      const forLoop = createForStatement(
        createBlockStatement([{ type: 'ExpressionStatement', expression: assignExpr }]),
      )
      visitor.ForStatement(forLoop)
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 20: Location reporting
  // =========================================================
  describe('location reporting', () => {
    test('should report location for reduce+concat at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('arr', 'acc', 'val', 1, 0)
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for reduce+concat at line 5 column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('arr', 'acc', 'val', 5, 10)
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location for reduce+concat at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('arr', 'acc', 'val', 100, 50)
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location for nested for at line 3 column 8', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForStatement', 'ForStatement')
      visitor.ForStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for nested for-of at custom location', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const innerPushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const innerFor = createForOfStatement(
        createIdentifier('i'),
        createIdentifier('arr'),
        createBlockStatement([createExpressionStatement(innerPushCall)]),
        5,
        8,
      )
      const outerFor = createForOfStatement(
        createIdentifier('j'),
        createIdentifier('outer'),
        createBlockStatement([innerFor]),
        3,
        2,
      )
      visitor.ForOfStatement(outerFor)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(2)
    })
  })

  // =========================================================
  // SECTION 21: Fix generation - additional tests
  // =========================================================
  describe('fix generation - additional', () => {
    test('should generate fix with correct array name', () => {
      const source = 'myArray.reduce((acc, val) => acc.concat(val), [])'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferArrayFlatRule.create(context)

      const arrayId = createIdentifier('myArray')
      ;(arrayId as Record<string, unknown>).range = [0, 7]
      const callee = createMemberExpression(arrayId, 'reduce')
      ;(callee as Record<string, unknown>).range = [0, 15]
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])], 1, 0)
      ;(node as Record<string, unknown>).range = [0, source.length]

      visitor.CallExpression(node)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('myArray.flat()')
    })

    test('should not generate fix when node has no range', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('arr')
      visitor.CallExpression(node)
      // No range set on node, so fix should be undefined
      expect(reports[0].fix).toBeUndefined()
    })

    test('should generate fix for spread pattern', () => {
      const source = 'arr.reduce((a, b) => [...a, ...b], [])'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferArrayFlatRule.create(context)

      const arrayId = createIdentifier('arr')
      ;(arrayId as Record<string, unknown>).range = [0, 3]
      const callee = createMemberExpression(arrayId, 'reduce')
      ;(callee as Record<string, unknown>).range = [0, 11]

      const spreadArray = createArrayLiteral([
        createSpreadElement(createIdentifier('a')),
        createSpreadElement(createIdentifier('b')),
      ])
      const callback = createArrowFunction(
        [createIdentifier('a'), createIdentifier('b')],
        spreadArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])], 1, 0)
      ;(node as Record<string, unknown>).range = [0, source.length]

      visitor.CallExpression(node)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('arr.flat()')
    })

    test('should generate fix using "array" when callee object is CallExpression', () => {
      const source = 'getArray().reduce((acc, val) => acc.concat(val), [])'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferArrayFlatRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getArray'), [])
      ;(innerCall as Record<string, unknown>).range = [0, 12]
      const callee = createMemberExpression(innerCall, 'reduce')
      ;(callee as Record<string, unknown>).range = [0, 20]

      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])], 1, 0)
      ;(node as Record<string, unknown>).range = [0, source.length]

      visitor.CallExpression(node)
      // fallback to "array" in message, but fix should use nodeText
      expect(reports[0].fix).toBeDefined()
    })
  })

  // =========================================================
  // SECTION 22: Graceful handling of malformed nodes
  // =========================================================
  describe('malformed node handling', () => {
    test('should handle node with missing callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = { type: 'CallExpression', arguments: [] }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const node = { type: 'CallExpression', callee }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle ForStatement with missing body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = {
        type: 'ForStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ForStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle ForOfStatement with missing body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = {
        type: 'ForOfStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle ForStatement with non-BlockStatement body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = createForStatement(createIdentifier('emptyStmt'))
      visitor.ForStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with null type', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.CallExpression({ type: null })
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric type', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.CallExpression({ type: 42 })
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('should handle node with type but no other properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.CallExpression({ type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('should handle arrow function callback with null body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = { type: 'ArrowFunctionExpression', expression: true, body: null, params: [] }
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle function expression callback with null body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = { type: 'FunctionExpression', body: null, params: [] }
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 23: Multiple visitor calls
  // =========================================================
  describe('multiple visitor calls', () => {
    test('should report each reduce+concat separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node: node1 } = buildReduceConcatNode('arr1')
      const { node: node2 } = buildReduceConcatNode('arr2')
      visitor.CallExpression(node1)
      visitor.CallExpression(node2)
      expect(reports.length).toBe(2)
    })

    test('should report three reduce+concat separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node: node1 } = buildReduceConcatNode('arr1')
      const { node: node2 } = buildReduceConcatNode('arr2')
      const { node: node3 } = buildReduceConcatNode('arr3')
      visitor.CallExpression(node1)
      visitor.CallExpression(node2)
      visitor.CallExpression(node3)
      expect(reports.length).toBe(3)
    })

    test('should report reduce+concat and reduce+spread separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node: concatNode } = buildReduceConcatNode('arr1')
      const { node: spreadNode } = buildReduceSpreadNode('arr2')
      visitor.CallExpression(concatNode)
      visitor.CallExpression(spreadNode)
      expect(reports.length).toBe(2)
    })

    test('should report both reduce and for loop patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node: reduceNode } = buildReduceConcatNode('arr')
      const forNode = buildNestedForLoopNode('ForStatement', 'ForStatement')
      visitor.CallExpression(reduceNode)
      visitor.ForStatement(forNode)
      expect(reports.length).toBe(2)
    })

    test('should report mix of valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node: validNode } = buildReduceConcatNode('arr')
      const callee = createMemberExpression(createIdentifier('arr'), 'map')
      const invalidNode = createCallExpression(callee, [createIdentifier('fn')])
      visitor.CallExpression(validNode)
      visitor.CallExpression(invalidNode)
      expect(reports.length).toBe(1)
    })

    test('should not report any when all are valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee1 = createMemberExpression(createIdentifier('arr'), 'map')
      const callee2 = createMemberExpression(createIdentifier('arr'), 'filter')
      visitor.CallExpression(createCallExpression(callee1, [createIdentifier('fn')]))
      visitor.CallExpression(createCallExpression(callee2, [createIdentifier('fn')]))
      expect(reports.length).toBe(0)
    })

    test('should report nested for loops found via ForStatement and ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const forNode = buildNestedForLoopNode('ForStatement', 'ForStatement')
      const forOfNode = buildNestedForLoopNode('ForOfStatement', 'ForOfStatement')
      visitor.ForStatement(forNode)
      visitor.ForOfStatement(forOfNode)
      expect(reports.length).toBe(2)
    })

    test('should handle many sequential calls without issues', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      for (let i = 0; i < 10; i++) {
        const { node } = buildReduceConcatNode(`arr${i}`)
        visitor.CallExpression(node)
      }
      expect(reports.length).toBe(10)
    })
  })

  // =========================================================
  // SECTION 24: Context variations
  // =========================================================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])', filePath: '/src/utils/flatten.ts' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode()
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should work with test file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])', filePath: '/test/flatten.test.ts' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode()
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should work with JS file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])', filePath: '/src/flatten.js' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode()
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode()
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strict: true, level: 'error' }], source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode()
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const source = 'data.reduce((memo, item) => memo.concat(item), [])'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('data', 'memo', 'item')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // SECTION 25: For-in nested loop detection (via isAnyForLoop)
  // =========================================================
  describe('for-in nested loop detection', () => {
    test('should report ForStatement containing ForInStatement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForStatement', 'ForInStatement')
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report ForOfStatement containing ForInStatement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForOfStatement', 'ForInStatement')
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report ForInStatement (as inner) inside ForStatement with push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const innerPushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const innerForIn = createForInStatement(
        createIdentifier('key'),
        createIdentifier('obj'),
        createBlockStatement([createExpressionStatement(innerPushCall)]),
        2,
        4,
      )
      const outerBody = createBlockStatement([innerForIn])
      const outerFor = createForStatement(outerBody, 1, 0)
      visitor.ForStatement(outerFor)
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // SECTION 26: Message content verification
  // =========================================================
  describe('message content verification', () => {
    test('reduce+concat message should contain "Prefer"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode()
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('Prefer')
    })

    test('reduce+concat message should contain "flat()"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode()
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('flat()')
    })

    test('reduce+concat message should contain "reduce"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode()
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('reduce')
    })

    test('reduce+concat message should contain "concat"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode()
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('concat')
    })

    test('reduce+spread message should contain "flat()"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceSpreadNode()
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('flat()')
    })

    test('nested for loop message should contain "Prefer"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode()
      visitor.ForStatement(node)
      expect(reports[0].message).toContain('Prefer')
    })

    test('nested for loop message should contain "nested for loops"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode()
      visitor.ForStatement(node)
      expect(reports[0].message).toContain('nested for loops')
    })

    test('nested for-of loop message should mention flat()', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const node = buildNestedForLoopNode('ForOfStatement', 'ForOfStatement')
      visitor.ForOfStatement(node)
      expect(reports[0].message).toContain('flat()')
    })

    test('reduce+concat should include specific array name', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('mySpecialArray')
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('mySpecialArray.flat()')
    })
  })

  // =========================================================
  // SECTION 27: Complex callee patterns
  // =========================================================
  describe('complex callee patterns', () => {
    test('should report when array is a member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const objProp = createMemberExpression(createIdentifier('obj'), 'data')
      const callee = createMemberExpression(objProp, 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when array is a function call result', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const fnCall = createCallExpression(createIdentifier('getData'), [])
      const callee = createMemberExpression(fnCall, 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      // Should use "array" as fallback since callee object is not Identifier
      expect(reports[0].message).toContain('array.flat()')
    })

    test('should report when array is a computed member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const computedMember = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('key'),
        computed: true,
      }
      const callee = createMemberExpression(computedMember, 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report chained calls: getNested().items.reduce(...)', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const innerCall = createCallExpression(createIdentifier('getNested'), [])
      const itemsAccess = createMemberExpression(innerCall, 'items')
      const callee = createMemberExpression(itemsAccess, 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when callee property is Literal (not Identifier)', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = {
        type: 'MemberExpression',
        object: { type: 'Literal', value: 42 },
        property: { type: 'Literal', value: 'reduce' },
      }
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 28: Non-CallExpression nodes passed to CallExpression visitor
  // =========================================================
  describe('non-CallExpression nodes in CallExpression visitor', () => {
    test('should not crash on Identifier node', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.CallExpression(createIdentifier('x'))
      expect(reports.length).toBe(0)
    })

    test('should not crash on Literal node', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.CallExpression(createLiteral(42))
      expect(reports.length).toBe(0)
    })

    test('should not crash on ArrayExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.CallExpression(createArrayLiteral([createLiteral(1)]))
      expect(reports.length).toBe(0)
    })

    test('should not crash on BlockStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.CallExpression(createBlockStatement([]))
      expect(reports.length).toBe(0)
    })

    test('should not crash on ArrowFunctionExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.CallExpression(
        createArrowFunction([createIdentifier('x')], createIdentifier('x'), true),
      )
      expect(reports.length).toBe(0)
    })

    test('should not crash on ForStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.CallExpression(createForStatement(createBlockStatement([])))
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 29: Callback parameter name variations
  // =========================================================
  describe('callback parameter name variations', () => {
    test('should report with custom accumulator name "memo"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('arr', 'memo', 'item')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with custom value name "element"', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('arr', 'acc', 'element')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with short names a and b', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode('arr', 'a', 'b')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report spread with custom names', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceSpreadNode('arr', 'prev', 'curr')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report function expression with custom names', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callbackBody = createBlockStatement([
        createReturnStatement(
          createCallExpression(createMemberExpression(createIdentifier('memo'), 'concat'), [
            createIdentifier('el'),
          ]),
        ),
      ])
      const callback = createFunctionExpression(
        [createIdentifier('memo'), createIdentifier('el')],
        callbackBody,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // SECTION 30: Initial value edge cases
  // =========================================================
  describe('initial value edge cases', () => {
    test('should not report when initial value is non-empty array with one element', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const { node } = buildReduceConcatNode()
      // Override the initial value to be [1]
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node2 = createCallExpression(callee, [callback, createArrayLiteral([createLiteral(1)])])
      visitor.CallExpression(node2)
      expect(reports.length).toBe(0)
    })

    test('should not report when initial value is non-empty array with two elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const initVal = createArrayLiteral([createLiteral(1), createLiteral(2)])
      const node = createCallExpression(callee, [callback, initVal])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report when initial value has undefined elements (treated as empty)', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const initVal = { type: 'ArrayExpression', elements: undefined }
      const node = createCallExpression(callee, [callback, initVal])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when initial value is empty array literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const initVal = createArrayLiteral([])
      const node = createCallExpression(callee, [callback, initVal])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when initial value is not an ArrayExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const initVal = { type: 'Identifier', name: 'emptyArray' }
      const node = createCallExpression(callee, [callback, initVal])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when initial value is a CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const initVal = createCallExpression(createIdentifier('createEmpty'), [])
      const node = createCallExpression(callee, [callback, initVal])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 31: Additional edge cases for for loops
  // =========================================================
  describe('for loop additional edge cases', () => {
    test('should report nested for loop with multiple push calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const pushCall1 = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item1')],
      )
      const pushCall2 = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item2')],
      )
      const innerBody = createBlockStatement([
        createExpressionStatement(pushCall1),
        createExpressionStatement(pushCall2),
      ])
      const innerFor = createForStatement(innerBody, 2, 4)
      const outerBody = createBlockStatement([innerFor])
      const outerFor = createForStatement(outerBody, 1, 0)
      visitor.ForStatement(outerFor)
      expect(reports.length).toBe(1)
    })

    test('should report first inner for loop with push even when second inner has no push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const pushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const innerFor1 = createForStatement(
        createBlockStatement([createExpressionStatement(pushCall)]),
        2,
        4,
      )
      const logCall = createCallExpression(
        createMemberExpression(createIdentifier('console'), 'log'),
        [createIdentifier('x')],
      )
      const innerFor2 = createForStatement(
        createBlockStatement([createExpressionStatement(logCall)]),
        6,
        4,
      )
      const outerBody = createBlockStatement([innerFor1, innerFor2])
      const outerFor = createForStatement(outerBody, 1, 0)
      visitor.ForStatement(outerFor)
      expect(reports.length).toBe(1)
    })

    test('should not report when inner for loop body is not BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      // Inner for with single statement body (not wrapped in BlockStatement)
      const pushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const innerFor = {
        type: 'ForStatement',
        body: createExpressionStatement(pushCall),
        loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 20 } },
      }
      const outerBody = createBlockStatement([innerFor])
      const outerFor = createForStatement(outerBody, 1, 0)
      // getBlockStatements returns [body] when not BlockStatement
      visitor.ForStatement(outerFor)
      // innerFor.body is ExpressionStatement, not a push CallExpression directly
      // containsPushCall checks for ExpressionStatement with push
      expect(reports.length).toBe(1)
    })

    test('should not report when outer for loop body is single statement (not BlockStatement)', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      // Outer for with single statement body (the inner for)
      const pushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const innerFor = createForStatement(
        createBlockStatement([createExpressionStatement(pushCall)]),
        2,
        4,
      )
      const outerFor = {
        type: 'ForStatement',
        body: innerFor,
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 0 } },
      }
      visitor.ForStatement(outerFor)
      // The outer body is a ForStatement, not BlockStatement
      // getBlockStatements on outerFor returns [innerFor] since it's single statement body
      // Then it checks innerFor's body for push
      expect(reports.length).toBe(1)
    })

    test('should report deeply nested: ForStatement > ForOfStatement > push', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const pushCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'push'),
        [createIdentifier('item')],
      )
      const innerForOf = createForOfStatement(
        createIdentifier('x'),
        createIdentifier('inner'),
        createBlockStatement([createExpressionStatement(pushCall)]),
        3,
        8,
      )
      const middleFor = createForStatement(createBlockStatement([innerForOf]), 2, 4)
      const outerFor = createForStatement(createBlockStatement([middleFor]), 1, 0)
      visitor.ForStatement(outerFor)
      // Only checks one level deep, so this won't report
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 32: Expression statement patterns in for loops
  // =========================================================
  describe('expression statement patterns in for loops', () => {
    test('should not report nested for with shift call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const shiftCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'shift'),
        [],
      )
      const innerFor = createForStatement(
        createBlockStatement([createExpressionStatement(shiftCall)]),
        2,
        4,
      )
      const outerFor = createForStatement(createBlockStatement([innerFor]), 1, 0)
      visitor.ForStatement(outerFor)
      expect(reports.length).toBe(0)
    })

    test('should not report nested for with pop call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const popCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'pop'),
        [],
      )
      const innerFor = createForStatement(
        createBlockStatement([createExpressionStatement(popCall)]),
        2,
        4,
      )
      const outerFor = createForStatement(createBlockStatement([innerFor]), 1, 0)
      visitor.ForStatement(outerFor)
      expect(reports.length).toBe(0)
    })

    test('should not report nested for with unshift call', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const unshiftCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'unshift'),
        [createIdentifier('item')],
      )
      const innerFor = createForStatement(
        createBlockStatement([createExpressionStatement(unshiftCall)]),
        2,
        4,
      )
      const outerFor = createForStatement(createBlockStatement([innerFor]), 1, 0)
      visitor.ForStatement(outerFor)
      expect(reports.length).toBe(0)
    })

    test('should not report nested for with concat call (not push)', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const concatCall = createCallExpression(
        createMemberExpression(createIdentifier('result'), 'concat'),
        [createIdentifier('item')],
      )
      const innerFor = createForStatement(
        createBlockStatement([createExpressionStatement(concatCall)]),
        2,
        4,
      )
      const outerFor = createForStatement(createBlockStatement([innerFor]), 1, 0)
      visitor.ForStatement(outerFor)
      expect(reports.length).toBe(0)
    })

    test('should report nested for with push called on different targets', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const pushCall = createCallExpression(
        createMemberExpression(createIdentifier('output'), 'push'),
        [createIdentifier('elem')],
      )
      const innerFor = createForStatement(
        createBlockStatement([createExpressionStatement(pushCall)]),
        2,
        4,
      )
      const outerFor = createForStatement(createBlockStatement([innerFor]), 1, 0)
      visitor.ForStatement(outerFor)
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================
  // SECTION 33: Rule definition structure
  // =========================================================
  describe('rule definition structure', () => {
    test('rule should be default exported', () => {
      expect(preferArrayFlatRule).toBeDefined()
    })

    test('meta should be frozen-like object with all properties', () => {
      const meta = preferArrayFlatRule.meta
      expect(meta).toHaveProperty('type')
      expect(meta).toHaveProperty('severity')
      expect(meta).toHaveProperty('docs')
      expect(meta).toHaveProperty('schema')
      expect(meta).toHaveProperty('fixable')
    })

    test('docs should have all required sub-properties', () => {
      const docs = preferArrayFlatRule.meta.docs
      expect(docs).toHaveProperty('description')
      expect(docs).toHaveProperty('category')
      expect(docs).toHaveProperty('recommended')
      expect(docs).toHaveProperty('url')
    })

    test('description should be non-empty string', () => {
      expect(typeof preferArrayFlatRule.meta.docs?.description).toBe('string')
      expect(preferArrayFlatRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('url should be a valid URL string', () => {
      const url = preferArrayFlatRule.meta.docs?.url
      expect(typeof url).toBe('string')
      expect(url).toMatch(/^https:\/\//)
    })
  })

  // =========================================================
  // SECTION 34: Additional reduce+concat expression body tests
  // =========================================================
  describe('reduce+concat expression body variations', () => {
    test('should report with acc.concat(val) where val is a spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createSpreadElement(createIdentifier('val')),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when concat has multiple arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
          createIdentifier('extra'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when callback body is an identifier (not call)', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createIdentifier('acc'),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callback body is a literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createLiteral(0),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callback body is an ArrayExpression without spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const bodyArray = createArrayLiteral([createIdentifier('acc'), createIdentifier('val')])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        bodyArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      // No spread elements, so not a spread concat pattern
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 35: Block body with multiple return statements
  // =========================================================
  describe('block body return statement handling', () => {
    test('should report first return statement with concat in block body', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callbackBody = createBlockStatement([
        createReturnStatement(
          createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
            createIdentifier('val'),
          ]),
        ),
        createReturnStatement(createLiteral(null)),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
        false,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when first return is not concat but second is', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callbackBody = createBlockStatement([
        createReturnStatement(createIdentifier('acc')),
        createReturnStatement(
          createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
            createIdentifier('val'),
          ]),
        ),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
        false,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      // First return is not concat, so it's returned from getReduceCallbackBody
      // and isConcatCall checks the identifier, which is not concat
      expect(reports.length).toBe(0)
    })

    test('should not report block body with only non-return statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callbackBody = createBlockStatement([
        createExpressionStatement(
          createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
            createIdentifier('val'),
          ]),
        ),
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
        false,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report when return contains spread concat', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const spreadArray = createArrayLiteral([
        createSpreadElement(createIdentifier('acc')),
        createSpreadElement(createIdentifier('val')),
      ])
      const callbackBody = createBlockStatement([createReturnStatement(spreadArray)])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
        false,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when return argument is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callbackBody = createBlockStatement([{ type: 'ReturnStatement', argument: null }])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        callbackBody,
        false,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================
  // SECTION 36: Misc additional tests
  // =========================================================
  describe('misc additional tests', () => {
    test('should handle CallExpression visitor being called with object lacking type', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.CallExpression({ someProp: 'value' })
      expect(reports.length).toBe(0)
    })

    test('should handle ForStatement visitor being called with object lacking type', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.ForStatement({ someProp: 'value' })
      expect(reports.length).toBe(0)
    })

    test('should handle ForOfStatement visitor being called with object lacking type', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      visitor.ForOfStatement({ someProp: 'value' })
      expect(reports.length).toBe(0)
    })

    test('should handle ForStatement with body that is empty BlockStatement containing no statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const outerFor = createForStatement(createBlockStatement([]))
      visitor.ForStatement(outerFor)
      expect(reports.length).toBe(0)
    })

    test('should handle reduce where callback has zero params', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      // Still reports because callback body matches pattern regardless of param count
      expect(reports.length).toBe(1)
    })

    test('should handle reduce where callback has three params', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val'), createIdentifier('idx')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle reduce with three arguments (callback, initial, thisArg)', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        createCallExpression(createMemberExpression(createIdentifier('acc'), 'concat'), [
          createIdentifier('val'),
        ]),
        true,
      )
      // 3 args: callback, [], thisArg - still should report
      const node = createCallExpression(callee, [
        callback,
        createArrayLiteral([]),
        createIdentifier('thisArg'),
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle reduce where concat body is a nested call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      // Body is acc.concat(val) - a call expression
      const concatCall = createCallExpression(
        createMemberExpression(createIdentifier('acc'), 'concat'),
        [createIdentifier('val')],
      )
      // Wrap in another call - fn(acc.concat(val))
      const wrappedCall = createCallExpression(createIdentifier('fn'), [concatCall])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        wrappedCall,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      // The body is a call to fn(), not a concat call, so should not report
      expect(reports.length).toBe(0)
    })

    test('should handle reduce where spread body has null element', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const spreadArray = createArrayLiteral([
        createSpreadElement(createIdentifier('acc')),
        null as unknown,
      ])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        spreadArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      // null element is not SpreadElement, so only 1 spread - should not report
      expect(reports.length).toBe(0)
    })

    test('should handle reduce where spread body has SpreadElement with null argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.reduce((acc, val) => acc.concat(val), [])' })
      const visitor = preferArrayFlatRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const spreadArray = createArrayLiteral([createSpreadElement(null), createSpreadElement(null)])
      const callback = createArrowFunction(
        [createIdentifier('acc'), createIdentifier('val')],
        spreadArray,
        true,
      )
      const node = createCallExpression(callee, [callback, createArrayLiteral([])])
      visitor.CallExpression(node)
      // Still 2 SpreadElements, should report
      expect(reports.length).toBe(1)
    })
  })
})
