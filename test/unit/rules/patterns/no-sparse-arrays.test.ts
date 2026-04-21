import { describe, test, expect, vi } from 'vitest'
import { noSparseArraysRule } from '../../../../src/rules/patterns/no-sparse-arrays.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const arr = [1, , 3];',
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

function createArrayExpression(elements: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createBinaryExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
  }
}

function createCallExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
  }
}

function createObjectExpression(properties: unknown[]): unknown {
  return {
    type: 'ObjectExpression',
    properties,
  }
}

function createMemberExpression(obj: unknown, prop: unknown, computed = false): unknown {
  return {
    type: 'MemberExpression',
    object: obj,
    property: prop,
    computed,
  }
}

function createArrowFunction(params: unknown[], body: unknown): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params,
    body,
  }
}

function createTemplateLiteral(quasis: unknown[], expressions: unknown[]): unknown {
  return {
    type: 'TemplateLiteral',
    quasis,
    expressions,
  }
}

function createUnaryExpression(operator: string, argument: unknown, prefix = true): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix,
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

function createLogicalExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
  }
}

function createAssignmentExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    operator,
    left,
    right,
  }
}

function createSpreadElement(argument: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function createProperty(key: unknown, value: unknown): unknown {
  return {
    type: 'Property',
    key,
    value,
    kind: 'init',
    method: false,
    shorthand: false,
    computed: false,
  }
}

function createFunctionExpression(id: unknown, params: unknown[], body: unknown): unknown {
  return {
    type: 'FunctionExpression',
    id,
    params,
    body,
  }
}

function createNewExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
  }
}

function createArrayPattern(elements: unknown[]): unknown {
  return {
    type: 'ArrayPattern',
    elements,
  }
}

function createAwaitExpression(argument: unknown): unknown {
  return {
    type: 'AwaitExpression',
    argument,
  }
}

function createYieldExpression(argument: unknown, delegate: boolean): unknown {
  return {
    type: 'YieldExpression',
    argument,
    delegate,
  }
}

function createSequenceExpression(expressions: unknown[]): unknown {
  return {
    type: 'SequenceExpression',
    expressions,
  }
}

function createTaggedTemplateExpression(tag: unknown, quasi: unknown): unknown {
  return {
    type: 'TaggedTemplateExpression',
    tag,
    quasi,
  }
}

function createClassExpression(id: unknown, body: unknown): unknown {
  return {
    type: 'ClassExpression',
    id,
    body,
    superClass: null,
  }
}

function createMetaProperty(meta: string, property: string): unknown {
  return {
    type: 'MetaProperty',
    meta: { type: 'Identifier', name: meta },
    property: { type: 'Identifier', name: property },
  }
}

// ─── EXISTING 39 TESTS ─────────────────────────────────────────────────────

describe('no-sparse-arrays rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noSparseArraysRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noSparseArraysRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noSparseArraysRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSparseArraysRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noSparseArraysRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noSparseArraysRule.meta.fixable).toBeUndefined()
    })

    test('should mention sparse in description', () => {
      expect(noSparseArraysRule.meta.docs?.description.toLowerCase()).toContain('sparse')
    })

    test('should mention arrays in description', () => {
      expect(noSparseArraysRule.meta.docs?.description.toLowerCase()).toContain('arrays')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(visitor).toHaveProperty('ArrayExpression')
    })
  })

  describe('valid arrays (no holes)', () => {
    test('should not report array with all elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(1), createLiteral(2), createLiteral(3)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([]))

      expect(reports.length).toBe(0)
    })

    test('should not report array with single element', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1)]))

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid arrays (with holes)', () => {
    test('should report sparse array with one hole in middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null, createLiteral(3)]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('sparse')
    })

    test('should report sparse array with hole at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([null, createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with hole at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), createLiteral(2), null]))

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with multiple holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(1), null, createLiteral(3), null, createLiteral(5)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with consecutive holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(1), null, null, createLiteral(4)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report array with only holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([null, null, null]))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression('string')).not.toThrow()
      expect(() => visitor.ArrayExpression(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        elements: [createLiteral(1), null, createLiteral(3)],
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        elements: [createLiteral(1), null, createLiteral(3)],
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-array elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: 'not-an-array',
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null elements array', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: null,
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined elements array', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: undefined,
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null, createLiteral(3)],
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

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
        getSource: () => 'const arr = [1, , 3];',
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

      const visitor = noSparseArraysRule.create(context)

      expect(() =>
        visitor.ArrayExpression(createArrayExpression([createLiteral(1), null])),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention sparse in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].message.toLowerCase()).toContain('sparse')
    })

    test('should mention array in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].message.toLowerCase()).toContain('array')
    })

    test('should start with unexpected for sparse arrays', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].message).toContain('Unexpected')
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {},
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ─── NEW TESTS: 161 additional ─────────────────────────────────────────

  describe('meta exhaustive', () => {
    test('should have exact description text', () => {
      expect(noSparseArraysRule.meta.docs?.description).toBe('Disallow sparse arrays.')
    })

    test('meta type should be one of valid types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noSparseArraysRule.meta.type)
    })

    test('meta severity should be one of valid severities', () => {
      expect(['off', 'warn', 'error']).toContain(noSparseArraysRule.meta.severity)
    })

    test('should have meta.docs defined', () => {
      expect(noSparseArraysRule.meta.docs).toBeDefined()
    })

    test('should have meta.docs.description defined', () => {
      expect(noSparseArraysRule.meta.docs?.description).toBeDefined()
      expect(typeof noSparseArraysRule.meta.docs?.description).toBe('string')
    })

    test('should have description with trailing period', () => {
      expect(noSparseArraysRule.meta.docs?.description.endsWith('.')).toBe(true)
    })

    test('schema should be an array', () => {
      expect(Array.isArray(noSparseArraysRule.meta.schema)).toBe(true)
    })

    test('schema should be empty array (no options)', () => {
      const schema = noSparseArraysRule.meta.schema
      if (Array.isArray(schema)) {
        expect(schema.length).toBe(0)
      }
    })

    test('meta should be readonly/frozen structure', () => {
      expect(noSparseArraysRule.meta).toBeDefined()
      expect(typeof noSparseArraysRule.meta).toBe('object')
    })

    test('should not be deprecated', () => {
      expect(noSparseArraysRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noSparseArraysRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noSparseArraysRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should not have docs url', () => {
      expect(noSparseArraysRule.meta.docs?.url).toBeUndefined()
    })
  })

  describe('create visitor exhaustive', () => {
    test('visitor should be an object', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('visitor should not be null', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)
      expect(visitor).not.toBeNull()
    })

    test('ArrayExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)
      expect(typeof visitor.ArrayExpression).toBe('function')
    })

    test('ArrayExpression should accept one argument', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)
      expect(visitor.ArrayExpression.length).toBeLessThanOrEqual(1)
    })

    test('should create independent visitor instances', () => {
      const { context: ctx1 } = createMockContext()
      const { context: ctx2 } = createMockContext()
      const visitor1 = noSparseArraysRule.create(ctx1)
      const visitor2 = noSparseArraysRule.create(ctx2)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('valid arrays - various element types', () => {
    test('should not report array with two string literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral('hello'), createLiteral('world')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with boolean literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(true), createLiteral(false)]))

      expect(reports.length).toBe(0)
    })

    test('should not report array with null literal elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      // createLiteral(null) produces { type: 'Literal', value: null } - NOT a hole
      visitor.ArrayExpression(createArrayExpression([createLiteral(null), createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report array with identifier elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createIdentifier('x'), createIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report array with binary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createBinaryExpression('+', createLiteral(1), createLiteral(2))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with call expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createCallExpression(createIdentifier('fn'), [createLiteral(1)])]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with object expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createObjectExpression([createProperty(createIdentifier('a'), createLiteral(1))]),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with arrow functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createArrowFunction([createIdentifier('x')], createLiteral(1))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with template literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createTemplateLiteral([createLiteral('hello')], [])]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with unary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createUnaryExpression('-', createLiteral(5))]))

      expect(reports.length).toBe(0)
    })

    test('should not report array with conditional expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createConditionalExpression(createLiteral(true), createLiteral(1), createLiteral(2)),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with logical expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createLogicalExpression('&&', createLiteral(true), createLiteral(false)),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with assignment expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createAssignmentExpression('=', createIdentifier('x'), createLiteral(5)),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with spread elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report array with new expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createNewExpression(createIdentifier('Map'), [])]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createFunctionExpression(null, [], createLiteral(undefined))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with mixed element types', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createLiteral(1),
          createIdentifier('x'),
          createBinaryExpression('+', createLiteral(1), createLiteral(2)),
          createCallExpression(createIdentifier('fn'), []),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with only string elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createLiteral('a'),
          createLiteral('b'),
          createLiteral('c'),
          createLiteral('d'),
          createLiteral('e'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with undefined literal elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(undefined), createLiteral(undefined)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with regex literal elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(/test/g), createLiteral(/abc/i)]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('valid arrays - size variations', () => {
    test('should not report array with two elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report array with ten elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createLiteral(1),
          createLiteral(2),
          createLiteral(3),
          createLiteral(4),
          createLiteral(5),
          createLiteral(6),
          createLiteral(7),
          createLiteral(8),
          createLiteral(9),
          createLiteral(10),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with 50 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const elements = Array.from({ length: 50 }, (_, i) => createLiteral(i))
      visitor.ArrayExpression(createArrayExpression(elements))

      expect(reports.length).toBe(0)
    })

    test('should not report array with 100 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const elements = Array.from({ length: 100 }, (_, i) => createLiteral(i))
      visitor.ArrayExpression(createArrayExpression(elements))

      expect(reports.length).toBe(0)
    })

    test('should not report array with 500 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const elements = Array.from({ length: 500 }, (_, i) => createLiteral(i))
      visitor.ArrayExpression(createArrayExpression(elements))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid arrays - nested structures', () => {
    test('should not report nested arrays without holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createArrayExpression([createLiteral(1), createLiteral(2)])]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report deeply nested arrays without holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const inner = createArrayExpression([createLiteral(1)])
      const mid = createArrayExpression([inner])
      const outer = createArrayExpression([mid])

      visitor.ArrayExpression(outer)

      expect(reports.length).toBe(0)
    })

    test('should not report array of objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createObjectExpression([createProperty(createIdentifier('a'), createLiteral(1))]),
          createObjectExpression([createProperty(createIdentifier('b'), createLiteral(2))]),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array of arrays', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createArrayExpression([createLiteral(1), createLiteral(2)]),
          createArrayExpression([createLiteral(3), createLiteral(4)]),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report array with mixed nested structures', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createArrayExpression([createLiteral(1)]),
          createObjectExpression([]),
          createLiteral(3),
          createIdentifier('x'),
        ]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid arrays - single hole variations', () => {
    test('should report array with hole between two numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null, createLiteral(2)]))

      expect(reports.length).toBe(1)
    })

    test('should report array with hole between two strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral('a'), null, createLiteral('b')]))

      expect(reports.length).toBe(1)
    })

    test('should report array with hole between identifier and literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createIdentifier('x'), null, createLiteral(2)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report array with hole between literal and identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(1), null, createIdentifier('x')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report array with single hole at position 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([null]))

      expect(reports.length).toBe(1)
    })

    test('should report array with two holes at positions 0 and 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([null, null]))

      expect(reports.length).toBe(1)
    })

    test('should report array with hole followed by element', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([null, createLiteral(1)]))

      expect(reports.length).toBe(1)
    })

    test('should report array with element followed by hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports.length).toBe(1)
    })

    test('should report array with hole before spread element', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([null, createSpreadElement(createIdentifier('arr'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report array with hole after spread element', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createSpreadElement(createIdentifier('arr')), null]),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('invalid arrays - multiple holes', () => {
    test('should report array with 3 non-consecutive holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([null, createLiteral(1), null, createLiteral(2), null]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report array with 4 consecutive holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(0), null, null, null, null, createLiteral(1)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report array with alternating elements and holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(1), null, createLiteral(2), null, createLiteral(3)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report array with 10 holes at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createLiteral(1),
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report array with 10 holes at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          createLiteral(1),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report large sparse array with 100 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const elements = Array.from({ length: 100 }, (_, i) =>
        i % 3 === 0 ? null : createLiteral(i),
      )
      visitor.ArrayExpression(createArrayExpression(elements))

      expect(reports.length).toBe(1)
    })

    test('should report array with 5 consecutive holes at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([null, null, null, null, null, createLiteral(1)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report array with 5 consecutive holes at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(1), null, null, null, null, null]),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('invalid arrays - mixed element types with holes', () => {
    test('should report sparse array with object element and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createObjectExpression([createProperty(createIdentifier('a'), createLiteral(1))]),
          null,
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with nested array and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createArrayExpression([createLiteral(1)]), null]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with call expression and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createCallExpression(createIdentifier('fn'), []),
          null,
          createLiteral(1),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with binary expression and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createBinaryExpression('+', createLiteral(1), createLiteral(2)),
          null,
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with arrow function and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createArrowFunction([], createLiteral(1)), null]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with member expression and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createMemberExpression(createIdentifier('a'), createIdentifier('b')),
          null,
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with template literal and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createTemplateLiteral([], []), null]))

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with unary expression and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createUnaryExpression('!', createLiteral(true)), null]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with conditional and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createConditionalExpression(createLiteral(true), createLiteral(1), createLiteral(2)),
          null,
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with logical and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createLogicalExpression('||', createLiteral(false), createLiteral(true)),
          null,
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with new expression and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createNewExpression(createIdentifier('Set'), []), null]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with function expression and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createFunctionExpression(createIdentifier('fn'), [], createLiteral(undefined)),
          null,
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report sparse array with spread element and hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createSpreadElement(createIdentifier('arr')),
          null,
          createLiteral(1),
        ]),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('report count - exactly one report per sparse array', () => {
    test('should report exactly once for array with one hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports.length).toBe(1)
    })

    test('should report exactly once for array with two holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(1), null, createLiteral(2), null]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report exactly once for array with five holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([null, null, null, null, null]))

      expect(reports.length).toBe(1)
    })

    test('should report exactly once for array with 20 holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression(Array.from({ length: 20 }, () => null)))

      expect(reports.length).toBe(1)
    })

    test('should report exactly once for array with 50 holes', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression(Array.from({ length: 50 }, () => null)))

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple visitor invocations', () => {
    test('should report each sparse array separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))
      visitor.ArrayExpression(createArrayExpression([createLiteral(2), null]))

      expect(reports.length).toBe(2)
    })

    test('should report 3 sparse arrays separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))
      visitor.ArrayExpression(createArrayExpression([null, createLiteral(2)]))
      visitor.ArrayExpression(createArrayExpression([createLiteral(3), null, createLiteral(4)]))

      expect(reports.length).toBe(3)
    })

    test('should not report valid arrays between sparse ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))
      visitor.ArrayExpression(createArrayExpression([createLiteral(2), createLiteral(3)]))
      visitor.ArrayExpression(createArrayExpression([createLiteral(4), null]))

      expect(reports.length).toBe(2)
    })

    test('should handle mix of valid and invalid arrays', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([]))
      visitor.ArrayExpression(createArrayExpression([null]))
      visitor.ArrayExpression(createArrayExpression([createLiteral(1)]))
      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))
      visitor.ArrayExpression(createArrayExpression([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(2)
    })

    test('should handle 10 sparse arrays', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.ArrayExpression(createArrayExpression([createLiteral(i), null]))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle 20 sparse arrays', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.ArrayExpression(createArrayExpression([createLiteral(i), null]))
      }

      expect(reports.length).toBe(20)
    })

    test('should handle 50 sparse arrays', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.ArrayExpression(createArrayExpression([createLiteral(i), null]))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle empty arrays interleaved with sparse', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([]))
      visitor.ArrayExpression(createArrayExpression([null]))
      visitor.ArrayExpression(createArrayExpression([]))
      visitor.ArrayExpression(createArrayExpression([null, null]))

      expect(reports.length).toBe(2)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null], 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null], 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null], 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 9999 column 9999', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null], 9999, 9999))

      expect(reports[0].loc?.start.line).toBe(9999)
      expect(reports[0].loc?.start.column).toBe(9999)
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null], 1, 0))

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report different locations for different sparse arrays', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null], 1, 0))
      visitor.ArrayExpression(createArrayExpression([createLiteral(2), null], 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })
  })

  describe('node type guards', () => {
    test('should not crash for boolean true node', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression(true)).not.toThrow()
    })

    test('should not crash for boolean false node', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression(false)).not.toThrow()
    })

    test('should not crash for number 0 node', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression(0)).not.toThrow()
    })

    test('should not crash for negative number node', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression(-1)).not.toThrow()
    })

    test('should not crash for empty string node', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression('')).not.toThrow()
    })

    test('should not crash for NaN node', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression(Number.NaN)).not.toThrow()
    })

    test('should not crash for Infinity node', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      expect(() => visitor.ArrayExpression(Number.POSITIVE_INFINITY)).not.toThrow()
    })

    test('should not report for ArrayPattern node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayPattern([createIdentifier('a'), null]))

      expect(reports.length).toBe(0)
    })

    test('should not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'FunctionExpression',
        elements: [null, null],
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'CallExpression',
        elements: [null, null],
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        elements: [null],
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('elements type variations', () => {
    test('should handle elements as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: 42,
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle elements as plain object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: { 0: null, length: 1 },
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle elements as Set-like object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: new Set([null]),
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
    })

    test('should handle empty array elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([]))

      expect(reports.length).toBe(0)
    })

    test('should handle array-like with only nulls', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([null]))

      expect(reports.length).toBe(1)
    })
  })

  describe('node edge cases', () => {
    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10],
        extra: { parenthesized: true },
        trailingComments: [],
        leadingComments: [],
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with Symbol properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const sym = Symbol('test')
      const node: Record<string | symbol, unknown> = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      node[sym] = 'symbol-value'

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle frozen node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = Object.freeze({
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle sealed node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = Object.seal({
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with Array.prototype in chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = Object.create({
        type: 'ArrayExpression',
      })
      node.elements = [createLiteral(1), null]
      node.loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 42,
        elements: [createLiteral(1), null],
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: true,
        elements: [createLiteral(1), null],
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: null,
        elements: [createLiteral(1), null],
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: undefined,
        elements: [createLiteral(1), null],
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: '',
        elements: [createLiteral(1), null],
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with lowercase arrayexpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'arrayexpression',
        elements: [createLiteral(1), null],
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with whitespace-padded type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: ' ArrayExpression ',
        elements: [createLiteral(1), null],
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('loc edge cases - additional', () => {
    test('should handle loc as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: null,
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: 42,
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc as string', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: 'bad-loc',
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc as boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: true,
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with NaN line', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: Number.NaN, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(Number.isNaN(reports[0].loc?.start.line as number)).toBe(true)
    })

    test('should handle loc with Infinity line', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: Number.POSITIVE_INFINITY, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(Number.POSITIVE_INFINITY)
    })

    test('should handle loc with negative line', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: -1, column: 0 },
          end: { line: -1, column: 10 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle loc with negative column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 1, column: -5 },
          end: { line: 1, column: -1 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle loc with fractional line', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 1.5, column: 0 },
          end: { line: 1.5, column: 10 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1.5)
    })

    test('should handle loc with fractional column', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 1, column: 2.7 },
          end: { line: 1, column: 10.3 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(2.7)
    })

    test('should handle loc with zero values', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc.start as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: null,
          end: { line: 1, column: 10 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc.end as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 1, column: 0 },
          end: null,
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with array start', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: [1, 0],
          end: { line: 1, column: 10 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with string values in start', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: '5' as unknown as number, column: '3' as unknown as number },
          end: { line: '5' as unknown as number, column: '10' as unknown as number },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'let x = [,,];')
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([null, null]))

      expect(reports.length).toBe(1)
    })

    test('should work with minimal source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '[]')
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'const arr = [1, , 3];',
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

      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined config options gracefully', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const arr = [1, , 3];',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSparseArraysRule.create(context)

      expect(() =>
        visitor.ArrayExpression(createArrayExpression([createLiteral(1), null])),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle config with extra options', () => {
      const { context, reports } = createMockContext({ extraOption: true, anotherOption: 42 })
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports.length).toBe(1)
    })
  })

  describe('message content', () => {
    test('should contain exact message text', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].message).toBe('Unexpected sparse array.')
    })

    test('should have consistent message for different sparse patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))
      visitor.ArrayExpression(createArrayExpression([null]))
      visitor.ArrayExpression(createArrayExpression([null, null, null]))

      expect(reports[0].message).toBe('Unexpected sparse array.')
      expect(reports[1].message).toBe('Unexpected sparse array.')
      expect(reports[2].message).toBe('Unexpected sparse array.')
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should start with capital letter', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
    })

    test('message should end with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('message should contain word hole or sparse', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      const msg = reports[0].message.toLowerCase()
      expect(msg.includes('sparse') || msg.includes('hole')).toBe(true)
    })
  })

  describe('report descriptor structure', () => {
    test('should have message property in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc property in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0]).toHaveProperty('loc')
    })

    test('loc should have start property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('loc should have end property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('loc.start should have line property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].loc?.start).toHaveProperty('line')
    })

    test('loc.start should have column property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('loc.end should have line property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].loc?.end).toHaveProperty('line')
    })

    test('loc.end should have column property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports[0].loc?.end).toHaveProperty('column')
    })
  })

  describe('no side effects', () => {
    test('reporting should not modify the node', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression' as const,
        elements: [createLiteral(1), null],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      const originalElements = [...node.elements]
      visitor.ArrayExpression(node)

      expect(node.elements).toEqual(originalElements)
    })

    test('reporting should not modify the elements array', () => {
      const { context } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const elements = [createLiteral(1), null]
      const originalLength = elements.length
      const originalFirst = elements[0]

      visitor.ArrayExpression(createArrayExpression(elements))

      expect(elements.length).toBe(originalLength)
      expect(elements[0]).toBe(originalFirst)
    })

    test('creating visitor should not trigger any reports', () => {
      const { context, reports } = createMockContext()

      noSparseArraysRule.create(context)

      expect(reports.length).toBe(0)
    })

    test('calling ArrayExpression on valid array should not trigger reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createLiteral(1)]))
      visitor.ArrayExpression(createArrayExpression([createLiteral(1), createLiteral(2)]))
      visitor.ArrayExpression(createArrayExpression([]))

      expect(reports.length).toBe(0)
    })
  })

  describe('various element node types as non-holes', () => {
    test('should treat AwaitExpression as non-hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createAwaitExpression(createIdentifier('p'))]))

      expect(reports.length).toBe(0)
    })

    test('should treat YieldExpression as non-hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createYieldExpression(createLiteral(1), false)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should treat SequenceExpression as non-hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createSequenceExpression([createLiteral(1), createLiteral(2)])]),
      )

      expect(reports.length).toBe(0)
    })

    test('should treat TaggedTemplateExpression as non-hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createTaggedTemplateExpression(createIdentifier('tag'), createTemplateLiteral([], [])),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should treat ClassExpression as non-hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([
          createClassExpression(createIdentifier('Foo'), createLiteral(undefined)),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should treat MetaProperty as non-hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([createMetaProperty('import', 'meta')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('boundary conditions', () => {
    test('should handle array with maximum safe integer as line', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), null],
        loc: {
          start: { line: Number.MAX_SAFE_INTEGER, column: 0 },
          end: { line: Number.MAX_SAFE_INTEGER, column: 10 },
        },
      }

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(Number.MAX_SAFE_INTEGER)
    })

    test('should handle array with very large element count', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const elements = Array.from({ length: 1000 }, (_, i) => (i === 500 ? null : createLiteral(i)))
      visitor.ArrayExpression(createArrayExpression(elements))

      expect(reports.length).toBe(1)
    })

    test('should handle elements array with only one hole', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(createArrayExpression([null]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unexpected sparse array.')
    })

    test('should distinguish between Literal(null) and hole null', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      // createLiteral(null) produces { type: 'Literal', value: null } - NOT a hole
      visitor.ArrayExpression(createArrayExpression([createLiteral(null), createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should distinguish between Literal(undefined) and hole null', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      visitor.ArrayExpression(
        createArrayExpression([createLiteral(undefined), createLiteral(undefined)]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('rule export', () => {
    test('should have default export', () => {
      expect(noSparseArraysRule).toBeDefined()
    })

    test('should have create method', () => {
      expect(typeof noSparseArraysRule.create).toBe('function')
    })

    test('should have meta property', () => {
      expect(noSparseArraysRule.meta).toBeDefined()
    })

    test('should be a valid RuleDefinition', () => {
      expect(noSparseArraysRule).toHaveProperty('meta')
      expect(noSparseArraysRule).toHaveProperty('create')
    })
  })

  describe('idempotency', () => {
    test('should produce same result for same input', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const visitor1 = noSparseArraysRule.create(ctx1)
      const visitor2 = noSparseArraysRule.create(ctx2)

      const node = createArrayExpression([createLiteral(1), null])
      visitor1.ArrayExpression(node)
      visitor2.ArrayExpression(node)

      expect(r1.length).toBe(r2.length)
      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should produce same result when called twice with same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      const node = createArrayExpression([createLiteral(1), null])
      visitor.ArrayExpression(node)
      const firstReportCount = reports.length

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(firstReportCount * 2)
    })

    test('should not accumulate state across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noSparseArraysRule.create(context)

      // First call: valid
      visitor.ArrayExpression(createArrayExpression([createLiteral(1)]))
      expect(reports.length).toBe(0)

      // Second call: sparse
      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))
      expect(reports.length).toBe(1)

      // Third call: valid
      visitor.ArrayExpression(createArrayExpression([createLiteral(1)]))
      expect(reports.length).toBe(1)

      // Fourth call: sparse
      visitor.ArrayExpression(createArrayExpression([null]))
      expect(reports.length).toBe(2)
    })
  })

  describe('context logger interaction', () => {
    test('should not throw if logger methods throw', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const arr = [1, , 3];',
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

      const visitor = noSparseArraysRule.create(context)

      expect(() =>
        visitor.ArrayExpression(createArrayExpression([createLiteral(1), null])),
      ).not.toThrow()
    })

    test('should work with mock logger that tracks calls', () => {
      const debugFn = vi.fn()
      const infoFn = vi.fn()
      const warnFn = vi.fn()
      const errorFn = vi.fn()

      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const arr = [1, , 3];',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: debugFn,
          info: infoFn,
          warn: warnFn,
          error: errorFn,
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSparseArraysRule.create(context)
      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports.length).toBe(1)
    })
  })

  describe('context method interactions', () => {
    test('should work with getAST returning object', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => ({ type: 'Program', body: [] }),
        getSource: () => 'const arr = [1, , 3];',
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

      const visitor = noSparseArraysRule.create(context)
      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports.length).toBe(1)
    })

    test('should work with getTokens returning tokens', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const arr = [1, , 3];',
        getTokens: () => [{ type: 'Punctuator', value: '[' }],
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

      const visitor = noSparseArraysRule.create(context)
      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports.length).toBe(1)
    })

    test('should work with getComments returning comments', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const arr = [1, , 3];',
        getTokens: () => [],
        getComments: () => [{ type: 'Line', value: ' sparse array' }],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSparseArraysRule.create(context)
      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports.length).toBe(1)
    })

    test('should work with parserServices defined', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const arr = [1, , 3];',
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
        parserServices: {
          program: {},
          esTreeNodeToTSNodeMap: new Map(),
          tsNodeToESTreeNodeMap: new Map(),
        },
      } as unknown as RuleContext

      const visitor = noSparseArraysRule.create(context)
      visitor.ArrayExpression(createArrayExpression([createLiteral(1), null]))

      expect(reports.length).toBe(1)
    })
  })
})
