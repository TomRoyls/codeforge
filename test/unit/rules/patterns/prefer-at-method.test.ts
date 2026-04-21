import { describe, test, expect, vi } from 'vitest'
import { preferAtMethodRule } from '../../../../src/rules/patterns/prefer-at-method.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const arr = [1, 2, 3]; const last = arr[arr.length - 1];',
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

function createNegativeIndexMemberExpression(
  arrayName = 'arr',
  index = 1,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: arrayName,
    },
    property: {
      type: 'BinaryExpression',
      operator: '-',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: arrayName,
        },
        property: {
          type: 'Identifier',
          name: 'length',
        },
        computed: false,
      },
      right: {
        type: 'Literal',
        value: index,
      },
    },
    computed: true,
    loc: {
      start: { line, column },
      end: { line, column: 30 + String(arrayName).length * 2 + String(index).length },
    },
    range: [column, column + 30 + String(arrayName).length * 2 + String(index).length],
  }
}

function createPositiveIndexMemberExpression(
  arrayName = 'arr',
  index = 0,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: arrayName,
    },
    property: {
      type: 'Literal',
      value: index,
    },
    computed: true,
    loc: {
      start: { line, column },
      end: { line, column: 10 + String(arrayName).length + String(index).length },
    },
    range: [column, column + 10 + String(arrayName).length + String(index).length],
  }
}

function createNonComputedMemberExpression(
  arrayName = 'arr',
  property = 'length',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: arrayName,
    },
    property: {
      type: 'Identifier',
      name: property,
    },
    computed: false,
    loc: {
      start: { line, column },
      end: { line, column: 5 + String(arrayName).length + String(property).length },
    },
    range: [column, column + 5 + String(arrayName).length + String(property).length],
  }
}

function createBinaryExpressionWithWrongOperator(
  arrayName = 'arr',
  index = 1,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: arrayName,
    },
    property: {
      type: 'BinaryExpression',
      operator: '+',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: arrayName,
        },
        property: {
          type: 'Identifier',
          name: 'length',
        },
        computed: false,
      },
      right: {
        type: 'Literal',
        value: index,
      },
    },
    computed: true,
    loc: {
      start: { line, column },
      end: { line, column: 30 },
    },
    range: [column, column + 30],
  }
}

function createBinaryExpressionWithNonLiteralRight(
  arrayName = 'arr',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: arrayName,
    },
    property: {
      type: 'BinaryExpression',
      operator: '-',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: arrayName,
        },
        property: {
          type: 'Identifier',
          name: 'length',
        },
        computed: false,
      },
      right: {
        type: 'Identifier',
        name: 'n',
      },
    },
    computed: true,
    loc: {
      start: { line, column },
      end: { line, column: 30 },
    },
    range: [column, column + 30],
  }
}

function createBinaryExpressionWithDifferentArrayLeft(
  arrayName = 'arr',
  otherArrayName = 'list',
  index = 1,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: arrayName,
    },
    property: {
      type: 'BinaryExpression',
      operator: '-',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: otherArrayName,
        },
        property: {
          type: 'Identifier',
          name: 'length',
        },
        computed: false,
      },
      right: {
        type: 'Literal',
        value: index,
      },
    },
    computed: true,
    loc: {
      start: { line, column },
      end: { line, column: 40 },
    },
    range: [column, column + 40],
  }
}

function createBinaryExpressionWithZeroOrNegativeIndex(
  arrayName = 'arr',
  index = 0,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: arrayName,
    },
    property: {
      type: 'BinaryExpression',
      operator: '-',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: arrayName,
        },
        property: {
          type: 'Identifier',
          name: 'length',
        },
        computed: false,
      },
      right: {
        type: 'Literal',
        value: index,
      },
    },
    computed: true,
    loc: {
      start: { line, column },
      end: { line, column: 30 },
    },
    range: [column, column + 30],
  }
}

function createBinaryExpressionWithNonIntegerIndex(
  arrayName = 'arr',
  index = 1.5,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: arrayName,
    },
    property: {
      type: 'BinaryExpression',
      operator: '-',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: arrayName,
        },
        property: {
          type: 'Identifier',
          name: 'length',
        },
        computed: false,
      },
      right: {
        type: 'Literal',
        value: index,
      },
    },
    computed: true,
    loc: {
      start: { line, column },
      end: { line, column: 30 },
    },
    range: [column, column + 30],
  }
}

// =============================================================================
// META TESTS (20)
// =============================================================================
describe('prefer-at-method rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferAtMethodRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferAtMethodRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferAtMethodRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferAtMethodRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferAtMethodRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferAtMethodRule.meta.fixable).toBe('code')
    })

    test('should mention .at() method in description', () => {
      expect(preferAtMethodRule.meta.docs?.description).toContain('.at()')
    })

    test('should mention negative indexing in description', () => {
      expect(preferAtMethodRule.meta.docs?.description.toLowerCase()).toContain('negative')
    })

    test('should have docs URL', () => {
      expect(preferAtMethodRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-at-method',
      )
    })

    test('should have meta property', () => {
      expect(preferAtMethodRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(preferAtMethodRule).toHaveProperty('create')
    })

    test('should not be deprecated', () => {
      expect(preferAtMethodRule.meta.deprecated).toBeFalsy()
    })

    test('should not require type checking', () => {
      expect(preferAtMethodRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have docs object defined', () => {
      expect(preferAtMethodRule.meta.docs).toBeDefined()
    })

    test('should have a non-empty description', () => {
      expect(preferAtMethodRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferAtMethodRule.meta.schema)).toBe(true)
    })

    test('should have empty schema (no options)', () => {
      expect(preferAtMethodRule.meta.schema).toHaveLength(0)
    })

    test('should have fixable set to code not whitespace', () => {
      expect(preferAtMethodRule.meta.fixable).not.toBe('whitespace')
    })

    test('should have type as one of valid rule types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferAtMethodRule.meta.type)
    })

    test('should have severity as one of valid severities', () => {
      expect(['off', 'warn', 'error']).toContain(preferAtMethodRule.meta.severity)
    })
  })

  // ===========================================================================
  // CREATE / VISITOR TESTS (8)
  // ===========================================================================
  describe('create', () => {
    test('should return visitor object with MemberExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      expect(visitor).toHaveProperty('MemberExpression')
      expect(typeof visitor.MemberExpression).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = preferAtMethodRule.create(context)
      expect(visitor).not.toBeNull()
    })

    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = preferAtMethodRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should return same visitor structure on multiple calls', () => {
      const { context } = createMockContext()
      const visitor1 = preferAtMethodRule.create(context)
      const visitor2 = preferAtMethodRule.create(context)
      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('should only have MemberExpression as a key', () => {
      const { context } = createMockContext()
      const visitor = preferAtMethodRule.create(context)
      expect(Object.keys(visitor)).toContain('MemberExpression')
    })

    test('should accept context with empty options', () => {
      const { context } = createMockContext({})
      expect(() => preferAtMethodRule.create(context)).not.toThrow()
    })

    test('should accept context with different file paths', () => {
      const { context } = createMockContext({}, '/project/src/app.ts')
      expect(() => preferAtMethodRule.create(context)).not.toThrow()
    })

    test('should accept context with different source code', () => {
      const { context } = createMockContext({}, '/src/test.ts', 'const x = items[items.length - 3]')
      expect(() => preferAtMethodRule.create(context)).not.toThrow()
    })
  })

  // ===========================================================================
  // DETECTION TESTS (30)
  // ===========================================================================
  describe('detecting arr[arr.length - n] patterns', () => {
    test('should report arr[arr.length - 1]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-1)')
      expect(reports[0].message).toContain('.length - ')
    })

    test('should report arr[arr.length - 2]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 2))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-2)')
      expect(reports[0].message).toContain('.length - ')
    })

    test('should report arr[arr.length - 10]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-10)')
      expect(reports[0].message).toContain('.length - ')
    })

    test('should report for different array names', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('list', 1))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-1)')
      expect(reports[0].message).toContain('.length - ')
    })

    test('should report for array names with underscores', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('my_array', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-3)')
      expect(reports[0].message).toContain('.length - ')
    })

    test('should report items[items.length - 1]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('items', 1))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-1)')
    })

    test('should report data[data.length - 3]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('data', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-3)')
    })

    test('should report for single letter array name x[x.length - 1]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('x', 1))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-1)')
    })

    test('should report for long array name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('veryLongArrayName', 1))

      expect(reports.length).toBe(1)
    })

    test('should report result[result.length - 4]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('result', 4))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-4)')
    })

    test('should report for arr[arr.length - 5]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 5))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-5)')
    })

    test('should report for arr[arr.length - 20]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 20))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-20)')
    })

    test('should report for arr[arr.length - 100]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 100))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-100)')
    })

    test('should report for camelCase array names', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('myListOfItems', 2))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-2)')
    })

    test('should report for PascalCase array names', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('MyItems', 1))

      expect(reports.length).toBe(1)
    })

    test('should report for UPPER_CASE array names', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('ITEMS', 1))

      expect(reports.length).toBe(1)
    })

    test('should report for array name with numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr2', 1))

      expect(reports.length).toBe(1)
    })

    test('should report for dollar sign array name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('$data', 1))

      expect(reports.length).toBe(1)
    })

    test('should report with correct message for arr[arr.length - 7]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 7))

      expect(reports[0].message).toContain('.at(-7)')
    })

    test('should report for arr[arr.length - 999]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 999))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-999)')
    })

    test('should detect nested array[idx] with length - 1', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('nested', 1))

      expect(reports.length).toBe(1)
    })

    test('should report buffer[buffer.length - 1]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('buffer', 1))

      expect(reports.length).toBe(1)
    })

    test('should report nodes[nodes.length - 3]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('nodes', 3))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-3)')
    })

    test('should report str[str.length - 1]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('str', 1))

      expect(reports.length).toBe(1)
    })

    test('should report values[values.length - 6]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('values', 6))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.at(-6)')
    })

    test('should report queue[queue.length - 1]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('queue', 1))

      expect(reports.length).toBe(1)
    })

    test('should report stack[stack.length - 2]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('stack', 2))

      expect(reports.length).toBe(1)
    })

    test('should report entries[entries.length - 1]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('entries', 1))

      expect(reports.length).toBe(1)
    })

    test('should report paths[paths.length - 1]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('paths', 1))

      expect(reports.length).toBe(1)
    })

    test('should report arr[arr.length - 1] with source containing the pattern', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const arr = [1, 2, 3]; const last = arr[arr.length - 1];',
      )
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
    })
  })

  // ===========================================================================
  // NOT REPORTING VALID PATTERNS (30)
  // ===========================================================================
  describe('not reporting valid patterns', () => {
    test('should not report positive index access arr[0]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createPositiveIndexMemberExpression('arr', 0))

      expect(reports.length).toBe(0)
    })

    test('should not report positive index access arr[5]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createPositiveIndexMemberExpression('arr', 5))

      expect(reports.length).toBe(0)
    })

    test('should not report non-computed access arr.length', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNonComputedMemberExpression('arr', 'length'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length + n] (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createBinaryExpressionWithWrongOperator('arr', 1))

      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length - n] where n is not a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createBinaryExpressionWithNonLiteralRight('arr'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr[list.length - n] (different arrays)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createBinaryExpressionWithDifferentArrayLeft('arr', 'list', 1))

      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length - 0] (zero index)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createBinaryExpressionWithZeroOrNegativeIndex('arr', 0))

      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length - (-1)] (negative index)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createBinaryExpressionWithZeroOrNegativeIndex('arr', -1))

      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length - 1.5] (non-integer)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createBinaryExpressionWithNonIntegerIndex('arr', 1.5))

      expect(reports.length).toBe(0)
    })

    test('should not report arr[0] with index 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createPositiveIndexMemberExpression('arr', 0))
      expect(reports.length).toBe(0)
    })

    test('should not report arr[100] with large positive index', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createPositiveIndexMemberExpression('arr', 100))
      expect(reports.length).toBe(0)
    })

    test('should not report non-computed arr.push', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNonComputedMemberExpression('arr', 'push'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-computed arr.pop', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNonComputedMemberExpression('arr', 'pop'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-computed arr.forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNonComputedMemberExpression('arr', 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length * 2] (multiplication)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '*',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
          right: { type: 'Literal', value: 2 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length / 2] (division)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '/',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
          right: { type: 'Literal', value: 2 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report arr[variable] where property is an identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'i' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length - 0.1] (fractional)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createBinaryExpressionWithNonIntegerIndex('arr', 0.1))
      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length - 0.999] (fractional)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createBinaryExpressionWithNonIntegerIndex('arr', 0.999))
      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length - NaN] (NaN literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
          right: { type: 'Literal', value: NaN },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length - Infinity] (Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
          right: { type: 'Literal', value: Infinity },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length - (-5)] (negative right value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createBinaryExpressionWithZeroOrNegativeIndex('arr', -5))
      expect(reports.length).toBe(0)
    })

    test('should not report data[list.length - 1] (cross-array mismatch)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createBinaryExpressionWithDifferentArrayLeft('data', 'list', 1))
      expect(reports.length).toBe(0)
    })

    test('should not report arr[other.length - 1] (cross-array mismatch reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createBinaryExpressionWithDifferentArrayLeft('arr', 'other', 1))
      expect(reports.length).toBe(0)
    })

    test('should not report non-computed access arr.map', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNonComputedMemberExpression('arr', 'map'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-computed access arr.filter', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNonComputedMemberExpression('arr', 'filter'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-computed access arr.reduce', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNonComputedMemberExpression('arr', 'reduce'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-computed access arr.at', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNonComputedMemberExpression('arr', 'at'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr[arr.length % 2] (modulo operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '%',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
          right: { type: 'Literal', value: 2 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report arr[string.length - 1] where left property is not length', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'size' },
            computed: false,
          },
          right: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===========================================================================
  // EDGE CASES (25)
  // ===========================================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      expect(() => visitor.MemberExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      expect(() => visitor.MemberExpression('string')).not.toThrow()
      expect(() => visitor.MemberExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without computed property gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'arr',
        },
        property: {
          type: 'Identifier',
          name: 'length',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without object property gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'arr',
            },
            property: {
              type: 'Identifier',
              name: 'length',
            },
            computed: false,
          },
          right: {
            type: 'Literal',
            value: 1,
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: {
          type: 'Identifier',
          name: 'arr',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: {
          type: 'Identifier',
          name: 'arr',
        },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'arr',
            },
            property: {
              type: 'Identifier',
              name: 'length',
            },
            computed: false,
          },
          right: {
            type: 'Literal',
            value: 1,
          },
        },
        range: [0, 20] as [number, number],
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without range gracefully (fix should use default)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: {
          type: 'Identifier',
          name: 'arr',
        },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'arr',
            },
            property: {
              type: 'Identifier',
              name: 'length',
            },
            computed: false,
          },
          right: {
            type: 'Literal',
            value: 1,
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should handle non-Identifier object gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'getArray',
          },
          arguments: [],
        },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'arr',
            },
            property: {
              type: 'Identifier',
              name: 'length',
            },
            computed: false,
          },
          right: {
            type: 'Literal',
            value: 1,
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-BinaryExpression property gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: {
          type: 'Identifier',
          name: 'arr',
        },
        property: {
          type: 'Literal',
          value: 1,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      expect(() => visitor.MemberExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      expect(() => visitor.MemberExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      expect(() => visitor.MemberExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      expect(() => visitor.MemberExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'CallExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
          right: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      // Should not match because type is not MemberExpression for the outer node
      // Actually the type guard checks the type field so this should not report
    })

    test('should handle deeply nested malformed node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Literal', value: 123 },
            computed: false,
          },
          right: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      // left.property is Literal, not Identifier named 'length' => should not report
      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where binary left is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: { type: 'Literal', value: 10 },
          right: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where right value is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
          right: { type: 'Literal', value: '1' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where right is a Literal with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
          right: { type: 'Literal', value: null },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where left.object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'fn' },
              arguments: [],
            },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
          right: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      // left.object is CallExpression not Identifier => isArrayLengthAccess returns false
      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing binary left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          right: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing binary right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where binary left has computed: true for inner member', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      // arr[arr["length"] - 1] — inner member expression with computed: true
      const node = {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'arr' },
        property: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: true,
          },
          right: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      // computed: true on inner member should still match since isArrayLengthAccess doesn't check computed
      expect(() => visitor.MemberExpression(node)).not.toThrow()
      // This should report because computed is not checked on inner member
      expect(reports.length).toBe(1)
    })
  })

  // ===========================================================================
  // LOCATION REPORTING (15)
  // ===========================================================================
  describe('location reporting', () => {
    test('should report correct location for arr[arr.length - 1]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = createNegativeIndexMemberExpression('arr', 1, 10, 5)
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for arr[arr.length - 5]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = createNegativeIndexMemberExpression('arr', 5, 25, 10)
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = createNegativeIndexMemberExpression('arr', 1, 3, 8)
      visitor.MemberExpression(node)

      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1, 500, 20))

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location at line 1 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1, 1, 50))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location for items[items.length - 2] at line 42', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('items', 2, 42, 0))

      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 3, 5, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location with correct column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = createNegativeIndexMemberExpression('arr', 1, 1, 10)
      visitor.MemberExpression(node)

      expect(reports[0].loc?.end.column).toBeGreaterThan(10)
    })

    test('should report loc as object with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start).toBe('object')
      expect(typeof reports[0].loc?.end).toBe('object')
    })

    test('should report start location with line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should report end location with line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should preserve exact location for nested expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('list', 4, 7, 15))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report location at line 100 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1, 100, 0))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 1 column 100', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1, 1, 100))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(100)
    })
  })

  // ===========================================================================
  // MESSAGE QUALITY (10)
  // ===========================================================================
  describe('message quality', () => {
    test('should mention .at() method in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports[0].message).toContain('.at(')
    })

    test('should mention negative index value in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 5))

      expect(reports[0].message).toContain('-5')
    })

    test('should mention original pattern in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports[0].message).toContain('.length - ')
    })

    test('should mention readability in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports[0].message.toLowerCase()).toContain('readable')
    })

    test('should mention negative indexing in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports[0].message.toLowerCase()).toContain('negative')
    })

    test('should suggest .at() method as preferred approach', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports[0].message).toContain('Prefer')
    })

    test('should include the correct negative index for -3', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 3))

      expect(reports[0].message).toContain('.at(-3)')
    })

    test('should include the correct negative index for -10', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 10))

      expect(reports[0].message).toContain('.at(-10)')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should contain closing parenthesis in .at() suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports[0].message).toContain('.at(-1)')
    })
  })

  // ===========================================================================
  // FIX SUGGESTIONS (10)
  // ===========================================================================
  describe('fix suggestions', () => {
    test('should provide fix that replaces arr[arr.length - 1] with .at(-1)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const arr = [1, 2, 3]; const last = arr[arr.length - 1];',
      )
      const visitor = preferAtMethodRule.create(context)

      const node = createNegativeIndexMemberExpression('arr', 1) as {
        range: [number, number]
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toContain('.at(-1)')
    })

    test('should provide fix that replaces arr[arr.length - 5] with .at(-5)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const arr = [1, 2, 3, 4, 5]; const last = arr[arr.length - 5];',
      )
      const visitor = preferAtMethodRule.create(context)

      const node = createNegativeIndexMemberExpression('arr', 5) as {
        range: [number, number]
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toContain('.at(-5)')
    })

    test('should provide fix that includes .at() method', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const list = [1, 2, 3]; const last = list[list.length - 1];',
      )
      const visitor = preferAtMethodRule.create(context)

      const node = createNegativeIndexMemberExpression('list', 1) as {
        range: [number, number]
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toContain('.at(-1)')
    })

    test('should include range in fix', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      const node = createNegativeIndexMemberExpression('arr', 1) as {
        range: [number, number]
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.range).toBeDefined()
      expect(Array.isArray(reports[0].fix?.range)).toBe(true)
      expect(reports[0].fix?.range).toHaveLength(2)
    })

    test('should provide fix text for arr[arr.length - 2]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 2))

      expect(reports[0].fix?.text).toContain('.at(-2)')
    })

    test('should provide fix text for arr[arr.length - 3]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 3))

      expect(reports[0].fix?.text).toContain('.at(-3)')
    })

    test('should provide fix text for arr[arr.length - 10]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 10))

      expect(reports[0].fix?.text).toContain('.at(-10)')
    })

    test('should provide fix with range start before end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      const range = reports[0].fix?.range
      expect(range).toBeDefined()
      expect(range![0]).toBeLessThanOrEqual(range![1])
    })

    test('should provide fix that is a string replacement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(typeof reports[0].fix?.text).toBe('string')
    })

    test('should provide fix text without original bracket notation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      const fixText = reports[0].fix?.text
      expect(fixText).toBeDefined()
      expect(fixText).not.toContain('[arr.length')
    })
  })

  // ===========================================================================
  // MULTIPLE REPORTS (10)
  // ===========================================================================
  describe('multiple reports', () => {
    test('should report multiple violations when called multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))
      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 2))

      expect(reports.length).toBe(2)
    })

    test('should report three violations independently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))
      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 2))
      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 3))

      expect(reports.length).toBe(3)
    })

    test('should preserve different messages for different indices', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))
      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 5))

      expect(reports[0].message).toContain('.at(-1)')
      expect(reports[1].message).toContain('.at(-5)')
    })

    test('should preserve different locations for different nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1, 5, 0))
      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1, 10, 5))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('should report for different arrays in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))
      visitor.MemberExpression(createNegativeIndexMemberExpression('list', 1))
      visitor.MemberExpression(createNegativeIndexMemberExpression('items', 1))

      expect(reports.length).toBe(3)
    })

    test('should only report matching patterns among mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))
      visitor.MemberExpression(createPositiveIndexMemberExpression('arr', 0))
      visitor.MemberExpression(createNegativeIndexMemberExpression('list', 2))

      expect(reports.length).toBe(2)
    })

    test('should handle 5 sequential reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      for (let i = 1; i <= 5; i++) {
        visitor.MemberExpression(createNegativeIndexMemberExpression('arr', i))
      }

      expect(reports.length).toBe(5)
    })

    test('should handle 10 sequential reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      for (let i = 1; i <= 10; i++) {
        visitor.MemberExpression(createNegativeIndexMemberExpression('arr', i))
      }

      expect(reports.length).toBe(10)
    })

    test('should not count non-matching calls as reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(null)
      visitor.MemberExpression(undefined)
      visitor.MemberExpression({})
      visitor.MemberExpression(createPositiveIndexMemberExpression('arr', 0))
      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
    })

    test('should maintain fix data for each report independently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))
      visitor.MemberExpression(createNegativeIndexMemberExpression('list', 3))

      expect(reports[0].fix?.text).toContain('.at(-1)')
      expect(reports[1].fix?.text).toContain('.at(-3)')
    })
  })

  // ===========================================================================
  // CONTEXT VARIATIONS (10)
  // ===========================================================================
  describe('context variations', () => {
    test('should work with empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
    })

    test('should work with undefined options', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
    })

    test('should work with extra options', () => {
      const { context, reports } = createMockContext({ extra: true, count: 5 })
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
    })

    test('should work with deep file paths', () => {
      const { context, reports } = createMockContext({}, '/a/b/c/d/e/f.ts')
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/test.ts',
        'const items = [1, 2]; items[items.length - 1]',
      )
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('items', 1))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/empty.ts', '')
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
    })

    test('should work with multi-line source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/multi.ts',
        'const arr = [1, 2, 3];\nconst last = arr[arr.length - 1];',
      )
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/app.js',
        'const x = arr[arr.length - 1]',
      )
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/Component.tsx',
        'const x = arr[arr.length - 1]',
      )
      const visitor = preferAtMethodRule.create(context)

      visitor.MemberExpression(createNegativeIndexMemberExpression('arr', 1))

      expect(reports.length).toBe(1)
    })
  })

  // ===========================================================================
  // TEST.EACH PARAMETERIZED (40+)
  // ===========================================================================
  describe('parameterized detection tests', () => {
    test.each([
      { arrayName: 'arr', index: 1, expected: '.at(-1)' },
      { arrayName: 'arr', index: 2, expected: '.at(-2)' },
      { arrayName: 'arr', index: 3, expected: '.at(-3)' },
      { arrayName: 'arr', index: 5, expected: '.at(-5)' },
      { arrayName: 'arr', index: 10, expected: '.at(-10)' },
      { arrayName: 'arr', index: 20, expected: '.at(-20)' },
      { arrayName: 'arr', index: 50, expected: '.at(-50)' },
      { arrayName: 'arr', index: 100, expected: '.at(-100)' },
    ] satisfies Array<{ arrayName: string; index: number; expected: string }>)(
      'should report $arrayName[$arrayName.length - $index] with suggestion $expected',
      ({ arrayName, index, expected }) => {
        const { context, reports } = createMockContext()
        const visitor = preferAtMethodRule.create(context)

        visitor.MemberExpression(createNegativeIndexMemberExpression(arrayName, index))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(expected)
      },
    )
  })

  describe('parameterized array name tests', () => {
    test.each([
      { arrayName: 'arr' },
      { arrayName: 'list' },
      { arrayName: 'items' },
      { arrayName: 'data' },
      { arrayName: 'result' },
      { arrayName: 'values' },
      { arrayName: 'nodes' },
      { arrayName: 'buffer' },
      { arrayName: 'stack' },
      { arrayName: 'queue' },
      { arrayName: 'entries' },
      { arrayName: 'paths' },
      { arrayName: 'x' },
      { arrayName: 'my_array' },
      { arrayName: 'myListOfItems' },
    ] satisfies Array<{ arrayName: string }>)(
      'should detect pattern for array named "$arrayName"',
      ({ arrayName }) => {
        const { context, reports } = createMockContext()
        const visitor = preferAtMethodRule.create(context)

        visitor.MemberExpression(createNegativeIndexMemberExpression(arrayName, 1))

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('parameterized non-reporting tests', () => {
    test.each([
      { index: 0, reason: 'zero index' },
      { index: -1, reason: 'negative index' },
      { index: -5, reason: 'negative index' },
      { index: -100, reason: 'negative index' },
    ] satisfies Array<{ index: number; reason: string }>)(
      'should not report arr[arr.length - $index] ($reason)',
      ({ index }) => {
        const { context, reports } = createMockContext()
        const visitor = preferAtMethodRule.create(context)

        visitor.MemberExpression(createBinaryExpressionWithZeroOrNegativeIndex('arr', index))

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized edge case index tests', () => {
    test.each([
      { index: 1.5, reason: '1.5 is not integer' },
      { index: 0.5, reason: '0.5 is not integer' },
      { index: 2.7, reason: '2.7 is not integer' },
      { index: 0.001, reason: '0.001 is not integer' },
      { index: 99.99, reason: '99.99 is not integer' },
    ] satisfies Array<{ index: number; reason: string }>)(
      'should not report arr[arr.length - $index] ($reason)',
      ({ index }) => {
        const { context, reports } = createMockContext()
        const visitor = preferAtMethodRule.create(context)

        visitor.MemberExpression(createBinaryExpressionWithNonIntegerIndex('arr', index))

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized cross-array tests', () => {
    test.each([
      { outerArray: 'arr', innerArray: 'list' },
      { outerArray: 'data', innerArray: 'items' },
      { outerArray: 'x', innerArray: 'y' },
      { outerArray: 'first', innerArray: 'second' },
      { outerArray: 'a', innerArray: 'b' },
    ] satisfies Array<{ outerArray: string; innerArray: string }>)(
      'should not report $outerArray[$innerArray.length - 1] (different arrays)',
      ({ outerArray, innerArray }) => {
        const { context, reports } = createMockContext()
        const visitor = preferAtMethodRule.create(context)

        visitor.MemberExpression(
          createBinaryExpressionWithDifferentArrayLeft(outerArray, innerArray, 1),
        )

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized positive index tests', () => {
    test.each([
      { index: 0 },
      { index: 1 },
      { index: 5 },
      { index: 10 },
      { index: 50 },
      { index: 100 },
      { index: 999 },
    ] satisfies Array<{ index: number }>)(
      'should not report arr[$index] (positive index)',
      ({ index }) => {
        const { context, reports } = createMockContext()
        const visitor = preferAtMethodRule.create(context)

        visitor.MemberExpression(createPositiveIndexMemberExpression('arr', index))

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized non-computed property tests', () => {
    test.each([
      { property: 'length' },
      { property: 'push' },
      { property: 'pop' },
      { property: 'map' },
      { property: 'filter' },
      { property: 'reduce' },
      { property: 'forEach' },
      { property: 'at' },
      { property: 'constructor' },
      { property: 'prototype' },
    ] satisfies Array<{ property: string }>)(
      'should not report arr.$property (non-computed)',
      ({ property }) => {
        const { context, reports } = createMockContext()
        const visitor = preferAtMethodRule.create(context)

        visitor.MemberExpression(createNonComputedMemberExpression('arr', property))

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized fix text tests', () => {
    test.each([
      { index: 1, expectedFix: '.at(-1)' },
      { index: 2, expectedFix: '.at(-2)' },
      { index: 3, expectedFix: '.at(-3)' },
      { index: 4, expectedFix: '.at(-4)' },
      { index: 5, expectedFix: '.at(-5)' },
      { index: 6, expectedFix: '.at(-6)' },
      { index: 7, expectedFix: '.at(-7)' },
      { index: 8, expectedFix: '.at(-8)' },
      { index: 9, expectedFix: '.at(-9)' },
      { index: 10, expectedFix: '.at(-10)' },
    ] satisfies Array<{ index: number; expectedFix: string }>)(
      'should produce fix text containing $expectedFix for arr[arr.length - $index]',
      ({ index, expectedFix }) => {
        const { context, reports } = createMockContext()
        const visitor = preferAtMethodRule.create(context)

        visitor.MemberExpression(createNegativeIndexMemberExpression('arr', index))

        expect(reports[0].fix?.text).toContain(expectedFix)
      },
    )
  })
})
