import { describe, test, expect, vi } from 'vitest'
import { preferArrayFlatRule } from '../../../../src/rules/patterns/prefer-array-flat.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'array.reduce((acc, val) => acc.concat(val), [])',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

describe('prefer-array-flat rule', () => {
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

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferArrayFlatRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('ForStatement')
      expect(visitor).toHaveProperty('ForOfStatement')
    })
  })

  describe('detecting reduce with concat', () => {
    test('should report reduce with concat using arrow function expression body', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'array.reduce((acc, val) => acc.concat(val), [])',
      )
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
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'array.reduce((acc, val) => { return acc.concat(val); }, [])',
      )
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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

  describe('detecting reduce with spread concat', () => {
    test('should report reduce with spread pattern [...acc, ...val]', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'array.reduce((acc, val) => [...acc, ...val], [])',
      )
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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

  describe('fix generation', () => {
    test('should generate fix for reduce with concat', () => {
      const source = 'array.reduce((acc, val) => acc.concat(val), [])'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
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
      const { context, reports } = createMockContext()
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

  describe('nested for loops', () => {
    test('should report nested for loops with push', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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

  describe('valid alternative patterns - reduce', () => {
    test('should not report reduce without empty array initial value', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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

  describe('valid alternative patterns - for loops', () => {
    test('should not report single for loop', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferArrayFlatRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(() => visitor.ForStatement(null)).not.toThrow()
      expect(() => visitor.ForOfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferArrayFlatRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(() => visitor.ForStatement(undefined)).not.toThrow()
      expect(() => visitor.ForOfStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferArrayFlatRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(() => visitor.ForStatement('string')).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = preferArrayFlatRule.create(context)

      const node = createCallExpression(createIdentifier('fn'), [createIdentifier('arg')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-reduce method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferArrayFlatRule.create(context)

      const callee = createMemberExpression(createIdentifier('array'), 'map')
      const node = createCallExpression(callee, [createIdentifier('callback')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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

  describe('message quality', () => {
    test('should mention flat in reduce message', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
})

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}
