import { describe, test, expect, vi } from 'vitest'
import { preferOptionalChainRule } from '../../../../src/rules/performance/prefer-optional-chain.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  suggest?: readonly {
    desc: string
    message: string
    fix: { range: readonly [number, number]; text: string }
  }[]
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'obj && obj.prop',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        suggest: descriptor.suggest,
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

function createLogicalExpression(
  leftText: string,
  rightText: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'LogicalExpression',
    operator: '&&',
    left: {
      type: 'Identifier',
      name: leftText,
      range: [0, leftText.length],
    },
    right: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: leftText,
        range: [0, leftText.length],
      },
      property: {
        type: 'Identifier',
        name: rightText.replace(`${leftText}.`, ''),
      },
      computed: false,
      range: [leftText.length + 5, leftText.length + 5 + rightText.length],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + leftText.length + 5 + rightText.length },
    },
    range: [0, leftText.length + 5 + rightText.length],
  }
}

function createCallExpression(
  leftText: string,
  methodName: string,
  args: string = '()',
  line = 1,
  column = 0,
): unknown {
  const rightText = `${leftText}.${methodName}${args}`
  return {
    type: 'LogicalExpression',
    operator: '&&',
    left: {
      type: 'Identifier',
      name: leftText,
      range: [0, leftText.length],
    },
    right: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: leftText,
          range: [0, leftText.length],
        },
        property: {
          type: 'Identifier',
          name: methodName,
        },
        computed: false,
      },
      arguments: [],
      range: [leftText.length + 5, leftText.length + 5 + rightText.length],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + leftText.length + 5 + rightText.length },
    },
    range: [0, leftText.length + 5 + rightText.length],
  }
}

function createUnrelatedLogicalExpression(line = 1, column = 0): unknown {
  return {
    type: 'LogicalExpression',
    operator: '&&',
    left: {
      type: 'Identifier',
      name: 'isValid',
      range: [0, 7],
    },
    right: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'processData',
      },
      arguments: [],
      range: [12, 25],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
    range: [0, 25],
  }
}

describe('prefer-optional-chain rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(preferOptionalChainRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferOptionalChainRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferOptionalChainRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(preferOptionalChainRule.meta.docs?.category).toBe('performance')
    })

    test('should have schema defined', () => {
      expect(preferOptionalChainRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(preferOptionalChainRule.meta.docs?.description).toContain('optional chain')
    })

    test('should be fixable', () => {
      expect(preferOptionalChainRule.meta.fixable).toBe('code')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(visitor).toHaveProperty('LogicalExpression')
      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should detect obj && obj.prop pattern', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('obj')
      expect(reports[0].message).toContain('?.')
    })

    test('should detect obj && obj.method() pattern', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.method()')
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createCallExpression('obj', 'method', '()'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('obj')
      expect(reports[0].message).toContain('?.method()')
    })

    test('should not report violation for unrelated && checks', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'isValid && processData()')
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createUnrelatedLogicalExpression())

      expect(reports.length).toBe(0)
    })

    test('should suggest correct optional chain syntax for property access', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))

      expect(reports.length).toBe(1)
      expect(reports[0].suggest).toBeDefined()
      expect(reports[0].suggest?.[0]?.desc).toContain('obj?.prop')
    })

    test('should suggest correct optional chain syntax for method call', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.method()')
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createCallExpression('obj', 'method', '()'))

      expect(reports.length).toBe(1)
      expect(reports[0].suggest).toBeDefined()
      expect(reports[0].suggest?.[0]?.desc).toContain('obj?.method()')
    })

    test('should handle null node gracefully in LogicalExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.LogicalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in LogicalExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.LogicalExpression(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.LogicalExpression('string')).not.toThrow()
      expect(() => visitor.LogicalExpression(123)).not.toThrow()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle node without loc', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'obj',
          range: [0, 3],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj',
            range: [0, 3],
          },
          property: {
            type: 'Identifier',
            name: 'prop',
          },
          computed: false,
          range: [8, 16],
        },
        range: [0, 16],
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should not report for || operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Identifier', name: 'fallback' },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left and right do not match', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj1 && obj2.prop')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'obj1',
          range: [0, 4],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj2',
            range: [9, 13],
          },
          property: {
            type: 'Identifier',
            name: 'prop',
          },
          computed: false,
          range: [9, 18],
        },
        range: [0, 18],
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle computed property access (should not report)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'obj',
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj',
          },
          property: {
            type: 'Literal',
            value: 'prop',
          },
          computed: true,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle nested property access', () => {
      const { context } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj',
          },
          property: {
            type: 'Identifier',
            name: 'nested',
          },
          computed: false,
          range: [0, 11],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'obj',
            },
            property: {
              type: 'Identifier',
              name: 'nested',
            },
            computed: false,
            range: [0, 11],
          },
          property: {
            type: 'Identifier',
            name: 'prop',
          },
          computed: false,
          range: [16, 26],
        },
        range: [0, 26],
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
    })

    test('should include concrete replacement in suggestion', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))

      expect(reports.length).toBe(1)
      expect(reports[0].suggest).toBeDefined()
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('obj?.prop')
    })
  })

  describe('BinaryExpression visitor', () => {
    test('should detect obj && obj.prop pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'obj',
          range: [0, 3],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj',
            range: [0, 3],
          },
          property: {
            type: 'Identifier',
            name: 'prop',
          },
          computed: false,
          range: [8, 16],
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 16 },
        },
        range: [0, 16],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('obj')
      expect(reports[0].message).toContain('?.')
    })

    test('should detect obj && obj.method() pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.method()')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'obj',
          range: [0, 3],
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'obj',
              range: [0, 3],
            },
            property: {
              type: 'Identifier',
              name: 'method',
            },
            computed: false,
          },
          arguments: [],
          range: [8, 20],
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
        range: [0, 20],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('obj')
      expect(reports[0].message).toContain('?.method()')
    })

    test('should suggest correct optional chain syntax for BinaryExpression', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'obj',
          range: [0, 3],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj',
            range: [0, 3],
          },
          property: {
            type: 'Identifier',
            name: 'prop',
          },
          computed: false,
          range: [8, 16],
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 16 },
        },
        range: [0, 16],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].suggest).toBeDefined()
      expect(reports[0].suggest?.[0]?.desc).toContain('obj?.prop')
    })

    test('should not report for BinaryExpression with unrelated && checks', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'isValid && processData()')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'isValid',
          range: [0, 7],
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'processData',
          },
          arguments: [],
          range: [12, 25],
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
        range: [0, 25],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with mismatched objects', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj1 && obj2.prop')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'obj1',
          range: [0, 4],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj2',
            range: [9, 13],
          },
          property: {
            type: 'Identifier',
            name: 'prop',
          },
          computed: false,
          range: [9, 18],
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 18 },
        },
        range: [0, 18],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('missing left/right edge cases', () => {
    test('should handle LogicalExpression with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: null,
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle LogicalExpression with undefined right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: undefined,
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle LogicalExpression with both null left and right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: null,
        right: null,
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: null,
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with undefined right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: undefined,
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases for node types', () => {
    test('should not report for non-LogicalExpression/BinaryExpression node types', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle nodes with missing type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with non-&& operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Identifier', name: 'fallback' },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with + operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('computed member expressions', () => {
    test('should not report for BinaryExpression with computed property access', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'prop' },
          computed: true,
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for LogicalExpression with computed property access', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'prop' },
          computed: true,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('nested property access patterns', () => {
    test('should handle nested MemberExpression in LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'parent' },
          property: { type: 'Identifier', name: 'child' },
          computed: false,
          range: [0, 11],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'parent' },
            property: { type: 'Identifier', name: 'child' },
            computed: false,
            range: [0, 11],
          },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [16, 26],
        },
        range: [0, 26],
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle nested MemberExpression in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'parent' },
          property: { type: 'Identifier', name: 'child' },
          computed: false,
          range: [0, 11],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'parent' },
            property: { type: 'Identifier', name: 'child' },
            computed: false,
            range: [0, 11],
          },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [16, 26],
        },
        range: [0, 26],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('CallExpression edge cases', () => {
    test('should not report for CallExpression with non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'isValid' },
        right: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'processData' },
          arguments: [],
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with CallExpression non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'isValid' },
        right: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'processData' },
          arguments: [],
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('MemberExpression edge cases', () => {
    test('should not report for MemberExpression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with MemberExpression non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'prop' },
          computed: false,
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('nodesMatch function edge cases', () => {
    test('should handle nodes with mismatched types', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'obj1',
          range: [0, 4],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj2',
            range: [9, 13],
          },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [9, 18],
        },
        range: [0, 18],
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle nodes with same type but different names', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'obj1',
          range: [0, 4],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj1',
            range: [0, 4],
          },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [9, 18],
        },
        range: [0, 18],
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('nodes without range or loc', () => {
    test('should handle LogicalExpression without range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression without range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('getNodeText with start/end properties', () => {
    test('should handle node with start and end instead of range', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', start: 0, end: 3 },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases for getNodeText', () => {
    test('should handle node without range or start/end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty range array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [] },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('extractLocation edge cases', () => {
    test('should handle node with partial loc structure', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'obj',
          loc: {
            start: { line: 1, column: 0 },
          },
        },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with malformed loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'Identifier',
          name: 'obj',
          loc: {
            start: {},
            end: {},
          },
        },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('additional utility function edge cases', () => {
    test('should handle node with range but incorrect length', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0] },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-numeric start/end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', start: '0' as any, end: '3' as any },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'CallExpression',
          arguments: [],
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('nodesMatch with different node types', () => {
    test('should return false for unmatched MemberExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Literal', value: 42, range: [0, 2] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 42, range: [0, 2] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('isPropertyAccessExpression edge cases', () => {
    test('should return false for CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getObj' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should return false for ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'arr' },
        right: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'length' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('isCallExpression edge cases', () => {
    test('should handle non-CallExpression right node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Identifier', name: 'method' },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('nodesMatch edge cases with same text', () => {
    test('should handle nodes with same text but different internal structure', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: 'obj',
            range: [8, 11],
          },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
        range: [0, 16],
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('additional utility function tests', () => {
    test('should handle getPropertyAccessObject with non-MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'process',
          },
          arguments: [],
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle getCallExpressionCallee with non-CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle isCallExpression with non-object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: null,
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle getPropertyName with property name as number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 123 as any },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('nodesMatch null/undefined handling', () => {
    test('should handle null left node in nested MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null right node in nested MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null property in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: null,
          computed: false,
        },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('nodesMatch fallback to type comparison', () => {
    test('should match MemberExpressions by recursive comparison without text', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'nested' },
          computed: false,
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'nested' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not match when nested MemberExpression objects differ', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj1' },
          property: { type: 'Identifier', name: 'nested' },
          computed: false,
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj2' },
            property: { type: 'Identifier', name: 'nested' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should return false for non-Identifier non-MemberExpression types', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('various identifier names - property access', () => {
    const cases = [
      { name: 'foo', prop: 'bar', source: 'foo && foo.bar' },
      { name: 'config', prop: 'value', source: 'config && config.value' },
      { name: 'data', prop: 'items', source: 'data && data.items' },
      { name: 'response', prop: 'status', source: 'response && response.status' },
      { name: 'user', prop: 'name', source: 'user && user.name' },
      { name: 'item', prop: 'id', source: 'item && item.id' },
      { name: 'result', prop: 'data', source: 'result && result.data' },
      { name: 'state', prop: 'loading', source: 'state && state.loading' },
      { name: 'props', prop: 'children', source: 'props && props.children' },
      { name: 'node', prop: 'value', source: 'node && node.value' },
      { name: 'arr', prop: 'length', source: 'arr && arr.length' },
      { name: 'obj', prop: 'foo', source: 'obj && obj.foo' },
      { name: 'options', prop: 'enabled', source: 'options && options.enabled' },
      { name: 'event', prop: 'target', source: 'event && event.target' },
      { name: 'error', prop: 'message', source: 'error && error.message' },
      { name: 'doc', prop: 'title', source: 'doc && doc.title' },
      { name: 'ctx', prop: 'req', source: 'ctx && ctx.req' },
      { name: 'el', prop: 'style', source: 'el && el.style' },
      { name: 'ref', prop: 'current', source: 'ref && ref.current' },
      { name: 'cache', prop: 'size', source: 'cache && cache.size' },
    ]

    for (const { name, prop, source } of cases) {
      test(`should detect ${source} pattern via LogicalExpression`, () => {
        const { context, reports } = createMockContext({}, '/src/file.ts', source)
        const visitor = preferOptionalChainRule.create(context)
        visitor.LogicalExpression(createLogicalExpression(name, `${name}.${prop}`))
        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(name)
        expect(reports[0].message).toContain('?.')
      })
    }
  })

  describe('various identifier names - method calls', () => {
    const cases = [
      { name: 'obj', method: 'toString', source: 'obj && obj.toString()' },
      { name: 'arr', method: 'forEach', source: 'arr && arr.forEach()' },
      { name: 'map', method: 'get', source: 'map && map.get()' },
      { name: 'set', method: 'has', source: 'set && set.has()' },
      { name: 'promise', method: 'then', source: 'promise && promise.then()' },
      { name: 'stream', method: 'pipe', source: 'stream && stream.pipe()' },
      { name: 'emitter', method: 'on', source: 'emitter && emitter.on()' },
      { name: 'client', method: 'send', source: 'client && client.send()' },
      { name: 'server', method: 'listen', source: 'server && server.listen()' },
      { name: 'socket', method: 'connect', source: 'socket && socket.connect()' },
      { name: 'parser', method: 'parse', source: 'parser && parser.parse()' },
      { name: 'builder', method: 'build', source: 'builder && builder.build()' },
      { name: 'handler', method: 'handle', source: 'handler && handler.handle()' },
      { name: 'validator', method: 'validate', source: 'validator && validator.validate()' },
      { name: 'formatter', method: 'format', source: 'formatter && formatter.format()' },
      { name: 'loader', method: 'load', source: 'loader && loader.load()' },
      { name: 'store', method: 'dispatch', source: 'store && store.dispatch()' },
      { name: 'router', method: 'navigate', source: 'router && router.navigate()' },
      { name: 'service', method: 'fetch', source: 'service && service.fetch()' },
      { name: 'repo', method: 'find', source: 'repo && repo.find()' },
    ]

    for (const { name, method, source } of cases) {
      test(`should detect ${source} pattern via LogicalExpression`, () => {
        const { context, reports } = createMockContext({}, '/src/file.ts', source)
        const visitor = preferOptionalChainRule.create(context)
        visitor.LogicalExpression(createCallExpression(name, method, '()'))
        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(name)
        expect(reports[0].suggest?.[0]?.fix?.text).toContain(`?.${method}`)
      })
    }
  })

  describe('various identifier names - BinaryExpression', () => {
    const names = ['foo', 'bar', 'baz', 'qux', 'quux', 'corge', 'grault', 'garply', 'waldo', 'fred']
    for (const name of names) {
      test(`should detect ${name} && ${name}.prop via BinaryExpression`, () => {
        const source = `${name} && ${name}.prop`
        const { context, reports } = createMockContext({}, '/src/file.ts', source)
        const visitor = preferOptionalChainRule.create(context)

        const node = {
          type: 'BinaryExpression',
          operator: '&&',
          left: { type: 'Identifier', name, range: [0, name.length] },
          right: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name, range: [0, name.length] },
            property: { type: 'Identifier', name: 'prop' },
            computed: false,
            range: [name.length + 5, name.length + 5 + `${name}.prop`.length],
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: source.length } },
          range: [0, source.length],
        }

        visitor.BinaryExpression(node)
        expect(reports.length).toBe(1)
      })
    }
  })

  describe('suggestion fix text accuracy', () => {
    test('should suggest foo?.bar for foo && foo.bar', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'foo && foo.bar')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('foo', 'foo.bar'))
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('foo?.bar')
    })

    test('should suggest data?.items for data && data.items', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'data && data.items')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('data', 'data.items'))
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('data?.items')
    })

    test('should suggest user?.getName() for user && user.getName()', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'user && user.getName()')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createCallExpression('user', 'getName', '()'))
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('user?.getName()')
    })

    test('should suggest config?.getValue() for config && config.getValue()', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'config && config.getValue()',
      )
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createCallExpression('config', 'getValue', '()'))
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('config?.getValue()')
    })

    test('should suggest suggestion desc contains optional chain', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'x && x.y')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('x', 'x.y'))
      expect(reports[0].suggest?.[0]?.desc).toBe('Use optional chaining: x?.y')
    })

    test('should suggest suggestion message is correct', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'a && a.b')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('a', 'a.b'))
      expect(reports[0].suggest?.[0]?.message).toBe('Use optional chaining operator')
    })

    test('should provide fix range covering full source', () => {
      const source = 'obj && obj.prop'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      expect(reports[0].suggest?.[0]?.fix?.range).toEqual([0, source.length])
    })
  })

  describe('report message content verification', () => {
    test('should include optional chain suggestion in message', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      expect(reports[0].message).toContain('Prefer optional chaining')
    })

    test('should include original expression parts in message', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      expect(reports[0].message).toContain('obj?.prop')
      expect(reports[0].message).toContain('obj')
      expect(reports[0].message).toContain('?.')
    })

    test('should include RULE_SUGGESTIONS.preferOptionalChain in message', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      expect(reports[0].message).toContain('Use optional chaining (?.)')
    })

    test('should include method suggestion in message', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.method()')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createCallExpression('obj', 'method', '()'))
      expect(reports[0].message).toContain('obj?.method()')
    })
  })

  describe('location reporting', () => {
    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop', 1, 0))
      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
    })

    test('should report correct location at line 3 column 5', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop', 3, 5))
      expect(reports[0].loc?.start).toEqual({ line: 3, column: 5 })
    })

    test('should report correct location at line 10 column 20', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop', 10, 20))
      expect(reports[0].loc?.start).toEqual({ line: 10, column: 20 })
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop', 1, 0))
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for method call', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.method()')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createCallExpression('obj', 'method', '()', 7, 15))
      expect(reports[0].loc?.start).toEqual({ line: 7, column: 15 })
    })

    test('should report location for BinaryExpression', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj', range: [0, 3] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [8, 16],
        },
        loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 20 } },
        range: [0, 16],
      }

      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start).toEqual({ line: 2, column: 4 })
    })
  })

  describe('idempotency - multiple calls', () => {
    test('should report on each call to LogicalExpression', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))

      expect(reports.length).toBe(2)
    })

    test('should report on each call to BinaryExpression', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj', range: [0, 3] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [8, 16],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
        range: [0, 16],
      }

      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should report independently for LogicalExpression and BinaryExpression', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))

      const binNode = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj', range: [0, 3] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [8, 16],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
        range: [0, 16],
      }
      visitor.BinaryExpression(binNode)

      expect(reports.length).toBe(2)
    })

    test('should not report when called with non-matching after matching', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'obj && obj.prop')
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      visitor.LogicalExpression(createUnrelatedLogicalExpression())

      expect(reports.length).toBe(1)
    })
  })

  describe('operator variations', () => {
    test('should not report for ?? operator in LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '??',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj', range: [0, 3] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with == operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '==',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with === operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Identifier', name: 'null' },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with !== operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '!==',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Identifier', name: 'null' },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with < operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '<',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with > operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '>',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with <= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '<=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with >= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '>=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with - operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '-',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with * operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '*',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with / operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression with % operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '%',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('different right-hand side types', () => {
    test('should not report when right is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when right is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Literal', value: true },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when right is ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'Identifier', name: 'y' },
          alternate: { type: 'Identifier', name: 'z' },
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when right is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Identifier', name: 'x' },
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when right is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'ObjectExpression', properties: [] },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when right is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'ArrayExpression', elements: [] },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when right is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when right is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when right is NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Date' },
          arguments: [],
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when right is UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'flag' },
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('different left-hand side types', () => {
    test('should not report when left is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Literal', value: true },
        right: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: true },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when left is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        right: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when left is UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'flag' },
        },
        right: { type: 'Identifier', name: 'x' },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when left is AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        right: { type: 'Identifier', name: 'z' },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when left is UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        right: { type: 'Identifier', name: 'x' },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('create function returns consistent visitors', () => {
    test('should return a new visitor on each create call', () => {
      const { context } = createMockContext()
      const visitor1 = preferOptionalChainRule.create(context)
      const visitor2 = preferOptionalChainRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('each visitor should report independently', () => {
      const { context: ctx1, reports: reports1 } = createMockContext(
        {},
        '/src/file1.ts',
        'obj && obj.prop',
      )
      const { context: ctx2, reports: reports2 } = createMockContext(
        {},
        '/src/file2.ts',
        'obj && obj.prop',
      )

      const visitor1 = preferOptionalChainRule.create(ctx1)
      const visitor2 = preferOptionalChainRule.create(ctx2)

      visitor1.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      visitor2.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })
  })

  describe('meta exhaustive checks', () => {
    test('meta should be frozen or sealed', () => {
      expect(typeof preferOptionalChainRule.meta).toBe('object')
    })

    test('should have docs property', () => {
      expect(preferOptionalChainRule.meta.docs).toBeDefined()
    })

    test('should have url in docs', () => {
      expect(preferOptionalChainRule.meta.docs?.url).toBeDefined()
    })

    test('schema should be an array', () => {
      expect(Array.isArray(preferOptionalChainRule.meta.schema)).toBe(true)
    })

    test('should have create method', () => {
      expect(typeof preferOptionalChainRule.create).toBe('function')
    })

    test('description should mention optional chain', () => {
      const desc = preferOptionalChainRule.meta.docs?.description ?? ''
      expect(desc.toLowerCase()).toContain('optional')
      expect(desc).toContain('?.')
    })

    test('should have severity warn', () => {
      expect(preferOptionalChainRule.meta.severity).toBe('warn')
    })

    test('should be type suggestion', () => {
      expect(preferOptionalChainRule.meta.type).toBe('suggestion')
    })
  })

  describe('CallExpression with various callee structures', () => {
    test('should not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'method' },
          arguments: [],
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should detect when callee is MemberExpression with matching object', () => {
      const source = 'obj && obj.method()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj', range: [0, 3] },
            property: { type: 'Identifier', name: 'method' },
            computed: false,
          },
          arguments: [],
          range: [8, 20],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('obj?.method()')
    })

    test('should not report when callee object does not match left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj1', range: [0, 4] },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj2', range: [9, 13] },
            property: { type: 'Identifier', name: 'method' },
            computed: false,
          },
          arguments: [],
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee MemberExpression is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Literal', value: 'method' },
            computed: true,
          },
          arguments: [],
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Literal', value: 'method' },
            computed: false,
          },
          arguments: [],
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('nodesMatch text-based comparison', () => {
    test('should match when source text of both nodes is identical', () => {
      const source = 'x && x.y'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createLogicalExpression('x', 'x.y'))
      expect(reports.length).toBe(1)
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('x?.y')
    })

    test('should not match when source text differs', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'alpha', range: [0, 5] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'beta', range: [10, 15] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [10, 20],
        },
        range: [0, 20],
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('nodesMatch recursive MemberExpression comparison', () => {
    test('should not report for nested MemberExpression with matching structure but no range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const memberObj = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'a' },
        property: { type: 'Identifier', name: 'b' },
        computed: false,
      }

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: memberObj,
        right: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'c' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('checkOptionalChainPattern guards', () => {
    test('should not crash for node that is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)
      expect(() => visitor.LogicalExpression('some string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash for node that is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)
      expect(() => visitor.LogicalExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash for node that is a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)
      expect(() => visitor.LogicalExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash for node that is an empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)
      expect(() => visitor.LogicalExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash for BinaryExpression with string node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)
      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash for BinaryExpression with number node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash for BinaryExpression with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('getNodeText edge cases via rule', () => {
    test('should handle node with valid range extracting correct text', () => {
      const source = 'foo && foo.bar'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('foo', 'foo.bar'))
      expect(reports.length).toBe(1)
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('foo?.bar')
    })

    test('should not report when left range extracts different text than right object', () => {
      const source = 'differentSource'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'other', range: [5, 10] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [5, 15],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
        range: [0, 15],
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when left range is out of source bounds', () => {
      const source = 'x'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      expect(reports.length).toBe(0)
    })
  })

  describe('extractLocation via rule', () => {
    test('should use default location when node has no loc', () => {
      const source = 'obj && obj.prop'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj', range: [0, 3] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [8, 16],
        },
        range: [0, 16],
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use node loc when provided', () => {
      const source = 'obj && obj.prop'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj', range: [0, 3] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [8, 16],
        },
        loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 26 } },
        range: [0, 16],
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('BinaryExpression exhaustive visitor tests', () => {
    test('should detect foo && foo.bar via BinaryExpression', () => {
      const source = 'foo && foo.bar'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'foo', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo', range: [0, 3] },
          property: { type: 'Identifier', name: 'bar' },
          computed: false,
          range: [8, 15],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
        range: [0, 15],
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('foo?.bar')
    })

    test('should detect bar && foo.bar via BinaryExpression should not report', () => {
      const source = 'bar && foo.bar'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'bar', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo', range: [8, 11] },
          property: { type: 'Identifier', name: 'bar' },
          computed: false,
          range: [8, 15],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
        range: [0, 15],
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle BinaryExpression with undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })
  })

  describe('property access with various property names', () => {
    const props = [
      'name',
      'length',
      'value',
      'type',
      'id',
      'key',
      'index',
      'size',
      'count',
      'data',
      'result',
      'error',
      'status',
      'message',
      'code',
    ]

    for (const prop of props) {
      test(`should detect obj && obj.${prop} pattern`, () => {
        const source = `obj && obj.${prop}`
        const { context, reports } = createMockContext({}, '/src/file.ts', source)
        const visitor = preferOptionalChainRule.create(context)
        visitor.LogicalExpression(createLogicalExpression('obj', `obj.${prop}`))
        expect(reports.length).toBe(1)
        expect(reports[0].suggest?.[0]?.fix?.text).toBe(`obj?.${prop}`)
      })
    }
  })

  describe('method calls with various method names', () => {
    const methods = [
      'push',
      'pop',
      'shift',
      'unshift',
      'slice',
      'splice',
      'map',
      'filter',
      'reduce',
      'find',
      'includes',
      'indexOf',
      'join',
      'split',
      'trim',
    ]

    for (const method of methods) {
      test(`should detect obj && obj.${method}() pattern`, () => {
        const source = `obj && obj.${method}()`
        const { context, reports } = createMockContext({}, '/src/file.ts', source)
        const visitor = preferOptionalChainRule.create(context)
        visitor.LogicalExpression(createCallExpression('obj', method, '()'))
        expect(reports.length).toBe(1)
        expect(reports[0].suggest?.[0]?.fix?.text).toBe(`obj?.${method}()`)
      })
    }
  })

  describe('mixed visitor calls on same context', () => {
    test('should handle mixed LogicalExpression and BinaryExpression calls', () => {
      const source = 'obj && obj.prop'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))

      const binNode = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj', range: [0, 3] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [8, 16],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
        range: [0, 16],
      }
      visitor.BinaryExpression(binNode)

      visitor.LogicalExpression(createUnrelatedLogicalExpression())

      expect(reports.length).toBe(2)
    })

    test('should handle only non-matching calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createUnrelatedLogicalExpression())
      visitor.LogicalExpression({
        type: 'LogicalExpression',
        operator: '||',
        left: null,
        right: null,
      })
      visitor.BinaryExpression(null)

      expect(reports.length).toBe(0)
    })
  })

  describe('context getSource variations', () => {
    test('should handle empty source string', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      expect(reports.length).toBe(0)
    })

    test('should handle source with only spaces', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '   ')
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      expect(reports.length).toBe(0)
    })

    test('should not report when ranges extract non-matching text from short source', () => {
      const source = 'ab'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 2] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'other', range: [1, 2] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [1, 2],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        range: [0, 2],
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should match pattern when source exactly matches node ranges', () => {
      const source = 'x && x.y'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('x', 'x.y'))
      expect(reports.length).toBe(1)
    })
  })

  describe('deeply malformed nodes', () => {
    test('should handle node where left.name is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 123 as unknown as string },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node where right.object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node where right is a primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: 42,
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node where operator is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node where type is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 42,
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node where left is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: [{ type: 'Identifier', name: 'obj' }],
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node where right is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: [{ type: 'Identifier', name: 'prop' }],
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression where callee is null inside CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'CallExpression',
          callee: null,
          arguments: [],
        },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression where callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: null,
            property: { type: 'Identifier', name: 'method' },
            computed: false,
          },
          arguments: [],
        },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle LogicalExpression where left has range as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: '0-3' as unknown as [number, number] },
        right: { type: 'Identifier', name: 'prop' },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('single character and short identifier names', () => {
    const shortNames = ['a', 'b', 'c', 'x', 'y', 'z', 'i', 'j', 'k', '_']
    for (const name of shortNames) {
      test(`should detect ${name} && ${name}.prop pattern`, () => {
        const source = `${name} && ${name}.prop`
        const { context, reports } = createMockContext({}, '/src/file.ts', source)
        const visitor = preferOptionalChainRule.create(context)
        visitor.LogicalExpression(createLogicalExpression(name, `${name}.prop`))
        expect(reports.length).toBe(1)
        expect(reports[0].suggest?.[0]?.fix?.text).toBe(`${name}?.prop`)
      })
    }
  })

  describe('long identifier names', () => {
    const longNames = [
      'thisIsAVeryLongVariableName',
      'configurationManagerInterface',
      'dataTransferObjectBuilder',
      'abstractFactoryMethodProvider',
      'serviceLocatorPatternImplementation',
    ]

    for (const name of longNames) {
      test(`should detect ${name} && ${name}.prop pattern`, () => {
        const source = `${name} && ${name}.prop`
        const { context, reports } = createMockContext({}, '/src/file.ts', source)
        const visitor = preferOptionalChainRule.create(context)
        visitor.LogicalExpression(createLogicalExpression(name, `${name}.prop`))
        expect(reports.length).toBe(1)
        expect(reports[0].suggest?.[0]?.fix?.text).toBe(`${name}?.prop`)
      })
    }
  })

  describe('consecutive matching and non-matching calls', () => {
    test('matching, then non-matching, then matching again', () => {
      const source = 'obj && obj.prop'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      visitor.LogicalExpression(createUnrelatedLogicalExpression())
      visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))

      expect(reports.length).toBe(2)
    })

    test('all non-matching calls produce zero reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.LogicalExpression(createUnrelatedLogicalExpression())
      }

      expect(reports.length).toBe(0)
    })

    test('all matching calls produce correct number of reports', () => {
      const source = 'obj && obj.prop'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.LogicalExpression(createLogicalExpression('obj', 'obj.prop'))
      }

      expect(reports.length).toBe(10)
    })
  })

  describe('BinaryExpression method call detection', () => {
    test('should detect obj && obj.call() via BinaryExpression', () => {
      const source = 'obj && obj.call()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj', range: [0, 3] },
            property: { type: 'Identifier', name: 'call' },
            computed: false,
          },
          arguments: [],
          range: [8, 19],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 19 } },
        range: [0, 19],
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('obj?.call()')
    })

    test('should detect data && data.fetch() via BinaryExpression', () => {
      const source = 'data && data.fetch()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'data', range: [0, 4] },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'data', range: [0, 4] },
            property: { type: 'Identifier', name: 'fetch' },
            computed: false,
          },
          arguments: [],
          range: [9, 20],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report for BinaryExpression with computed callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Literal', value: 'method' },
            computed: true,
          },
          arguments: [],
        },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression when callee property is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Literal', value: 'method' },
            computed: false,
          },
          arguments: [],
        },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('rule default export', () => {
    test('default export should be the same as named export', async () => {
      const mod = await import('../../../../src/rules/performance/prefer-optional-chain.js')
      expect(mod.default).toBeDefined()
      expect(mod.default).toBe(preferOptionalChainRule)
    })
  })

  describe('getPropertyName edge cases', () => {
    test('should handle property with numeric name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 0 as unknown as string },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle property with undefined name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: undefined as unknown as string },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle property that is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: null,
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle property that is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('getPropertyAccessObject edge cases', () => {
    test('should handle MemberExpression with object as null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with object as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with object as string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
        right: {
          type: 'MemberExpression',
          object: 'notAnObject',
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('nodesMatch with identical text from different nodes', () => {
    test('should match nodes when extracted text is identical even with different structure', () => {
      const source = 'foo && foo.bar'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)
      visitor.LogicalExpression(createLogicalExpression('foo', 'foo.bar'))
      expect(reports.length).toBe(1)
    })
  })

  describe('checkOptionalChainPattern with left/right having same range', () => {
    test('should not report when left and right have overlapping ranges', () => {
      const source = 'obj && obj.prop'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj', range: [0, 3] },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj', range: [0, 3] },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
          range: [0, 16],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
        range: [0, 16],
      }

      visitor.LogicalExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('obj?.prop')
    })
  })

  describe('additional meta checks', () => {
    test('docs url should be a string', () => {
      expect(typeof preferOptionalChainRule.meta.docs?.url).toBe('string')
    })

    test('docs description should be a non-empty string', () => {
      expect(typeof preferOptionalChainRule.meta.docs?.description).toBe('string')
      expect(preferOptionalChainRule.meta.docs?.description?.length).toBeGreaterThan(0)
    })

    test('fixable should be code', () => {
      expect(preferOptionalChainRule.meta.fixable).toBe('code')
    })

    test('meta should have all required properties', () => {
      expect(preferOptionalChainRule.meta).toHaveProperty('type')
      expect(preferOptionalChainRule.meta).toHaveProperty('severity')
      expect(preferOptionalChainRule.meta).toHaveProperty('docs')
      expect(preferOptionalChainRule.meta).toHaveProperty('schema')
      expect(preferOptionalChainRule.meta).toHaveProperty('fixable')
    })

    test('docs category should be performance', () => {
      expect(preferOptionalChainRule.meta.docs?.category).toBe('performance')
    })
  })
})
