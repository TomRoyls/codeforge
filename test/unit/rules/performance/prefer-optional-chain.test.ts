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
})
