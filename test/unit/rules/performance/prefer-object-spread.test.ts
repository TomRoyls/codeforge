import { describe, test, expect, vi } from 'vitest'
import { preferObjectSpreadRule } from '../../../../src/rules/performance/prefer-object-spread.js'
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
  source = 'Object.assign({}, obj)',
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

function createObjectAssignCall(args: string[], line = 1, column = 0): unknown {
  const argsText = args.join(', ')
  const fullText = `Object.assign(${argsText})`
  let offset = 'Object.assign('.length

  const argNodes = args.map((arg) => {
    const start = offset
    const end = offset + arg.length
    offset = end + 2

    if (arg === '{}') {
      return {
        type: 'ObjectExpression',
        properties: [],
        range: [start, end],
      }
    }
    return {
      type: 'Identifier',
      name: arg,
      range: [start, end],
    }
  })

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Object',
        range: [0, 6],
      },
      property: {
        type: 'Identifier',
        name: 'assign',
      },
      computed: false,
    },
    arguments: argNodes,
    loc: {
      start: { line, column },
      end: { line, column: column + fullText.length },
    },
    range: [0, fullText.length],
  }
}

function createObjectAssignMutationCall(
  target: string,
  source: string,
  line = 1,
  column = 0,
): unknown {
  const fullText = `Object.assign(${target}, ${source})`

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Object',
        range: [0, 6],
      },
      property: {
        type: 'Identifier',
        name: 'assign',
      },
      computed: false,
    },
    arguments: [
      {
        type: 'Identifier',
        name: target,
        range: [13, 13 + target.length],
      },
      {
        type: 'Identifier',
        name: source,
        range: [16 + target.length, 16 + target.length + source.length],
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + fullText.length },
    },
    range: [0, fullText.length],
  }
}

function createNonObjectAssignCall(line = 1, column = 0): unknown {
  const fullText = 'foo.bar({}, obj)'

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'foo',
        range: [0, 3],
      },
      property: {
        type: 'Identifier',
        name: 'bar',
      },
      computed: false,
    },
    arguments: [
      {
        type: 'ObjectExpression',
        properties: [],
        range: [8, 10],
      },
      {
        type: 'Identifier',
        name: 'obj',
        range: [12, 15],
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + fullText.length },
    },
    range: [0, fullText.length],
  }
}

describe('prefer-object-spread rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(preferObjectSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferObjectSpreadRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferObjectSpreadRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(preferObjectSpreadRule.meta.docs?.category).toBe('performance')
    })

    test('should have schema defined', () => {
      expect(preferObjectSpreadRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(preferObjectSpreadRule.meta.docs?.description).toContain('spread')
    })

    test('should be fixable', () => {
      expect(preferObjectSpreadRule.meta.fixable).toBe('code')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should detect Object.assign({}, obj)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread')
      expect(reports[0].message).toContain('...obj')
    })

    test('should detect Object.assign({}, a, b)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, a, b)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('...a')
      expect(reports[0].message).toContain('...b')
    })

    test('should not report violation for Object.assign(target, source)', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign(target, source)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignMutationCall('target', 'source'))

      expect(reports.length).toBe(0)
    })

    test('should suggest correct spread syntax for single source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj']))

      expect(reports.length).toBe(1)
      expect(reports[0].suggest).toBeDefined()
      expect(reports[0].suggest?.[0]?.desc).toContain('{ ...obj }')
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...obj }')
    })

    test('should suggest correct spread syntax for multiple sources', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, a, b)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'a', 'b']))

      expect(reports.length).toBe(1)
      expect(reports[0].suggest).toBeDefined()
      expect(reports[0].suggest?.[0]?.desc).toContain('{ ...a, ...b }')
      expect(reports[0].suggest?.[0]?.fix?.text).toBe('{ ...a, ...b }')
    })

    test('should not report for non-Object.assign calls', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'foo.bar({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createNonObjectAssignCall())

      expect(reports.length).toBe(0)
    })

    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferObjectSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      visitor.CallExpression(createObjectAssignCall(['{}', 'obj'], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle node without loc', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Object',
            range: [0, 6],
          },
          property: {
            type: 'Identifier',
            name: 'assign',
          },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [],
            range: [13, 15],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [17, 20],
          },
        ],
        range: [0, 21],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should not report when first arg is non-empty object', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'Object.assign({ a: 1 }, obj)',
      )
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Object',
            range: [0, 6],
          },
          property: {
            type: 'Identifier',
            name: 'assign',
          },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' } }],
            range: [13, 20],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [22, 25],
          },
        ],
        range: [0, 26],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for Object.assign with single argument', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({})')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Object',
          },
          property: {
            type: 'Identifier',
            name: 'assign',
          },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [],
          },
        ],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle Object.assign with no arguments', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign()')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Object',
          },
          property: {
            type: 'Identifier',
            name: 'assign',
          },
          computed: false,
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for CallExpression with non-MemberExpression callee', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'assign',
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [],
            range: [7, 9],
          },
          {
            type: 'Identifier',
            name: 'obj',
            range: [11, 14],
          },
        ],
        range: [0, 15],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when spread arguments have no extractable text', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'Object.assign({}, obj)')
      const visitor = preferObjectSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Object',
          },
          property: {
            type: 'Identifier',
            name: 'assign',
          },
          computed: false,
        },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [],
          },
          {
            type: 'Identifier',
            name: 'obj',
          },
        ],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
