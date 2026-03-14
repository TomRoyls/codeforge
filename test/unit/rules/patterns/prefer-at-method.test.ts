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
  })

  describe('create', () => {
    test('should return visitor object with MemberExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferAtMethodRule.create(context)

      expect(visitor).toHaveProperty('MemberExpression')
      expect(typeof visitor.MemberExpression).toBe('function')
    })
  })

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
  })

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
  })

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
  })

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
  })

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
  })

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
  })
})
