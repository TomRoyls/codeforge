import { describe, expect, test, vi } from 'vitest'

import type { RuleContext } from '../../../../src/plugins/types.js'

import { noUnnecessarySliceRule } from '../../../../src/rules/patterns/no-unnecessary-slice.js'

interface ReportDescriptor {
  fix?: { range: [number, number]; text: string }
  loc?: { end: { column: number; line: number; }; start: { column: number; line: number; }; }
  message: string
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'arr.slice();',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options: [options] },
    getAST: () => null,
    getComments: () => [],
    getFilePath: () => filePath,
    getSource: () => source,
    getTokens: () => [],
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    report(descriptor: ReportDescriptor) {
      reports.push({
        fix: descriptor.fix,
        loc: descriptor.loc,
        message: descriptor.message,
      })
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createSliceCall(objectName = 'arr', args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + objectName.length
  const callEnd = objectEnd + '.slice'.length + args.length * 2 + 2

  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: objectName,
        range: [column, objectEnd],
        type: 'Identifier',
      },
      property: {
        name: 'slice',
        type: 'Identifier',
      },
      range: [column, objectEnd + '.slice'.length],
      type: 'MemberExpression',
    },
    loc: {
      end: { callEnd, line },
      start: { column, line },
    },
    range: [column, callEnd],
    type: 'CallExpression',
  }
}

function createLiteral(value: unknown, raw?: string): unknown {
  return {
    raw: raw ?? String(value),
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    name,
    type: 'Identifier',
  }
}

function createNonSliceCall(methodName = 'map'): unknown {
  return {
    arguments: [],
    callee: {
      object: {
        name: 'arr',
        type: 'Identifier',
      },
      property: {
        name: methodName,
        type: 'Identifier',
      },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: 10, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

function createDirectCall(): unknown {
  return {
    arguments: [],
    callee: {
      name: 'slice',
      type: 'Identifier',
    },
    loc: {
      end: { column: 10, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

describe('no-unnecessary-slice rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessarySliceRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessarySliceRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessarySliceRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessarySliceRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessarySliceRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noUnnecessarySliceRule.meta.fixable).toBe('code')
    })

    test('should mention slice in description', () => {
      expect(noUnnecessarySliceRule.meta.docs?.description.toLowerCase()).toContain('slice')
    })

    test('should mention unnecessary in description', () => {
      expect(noUnnecessarySliceRule.meta.docs?.description.toLowerCase()).toContain('unnecessary')
    })

    test('should mention shallow copy in description', () => {
      expect(noUnnecessarySliceRule.meta.docs?.description.toLowerCase()).toContain('shallow copy')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting slice() with no arguments', () => {
    test('should report arr.slice()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/unnecessary/i)
      expect(reports[0].message).toContain('slice')
    })

    test('should report array.slice()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('array', []))

      expect(reports.length).toBe(1)
    })

    test('should report items.slice()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('items', []))

      expect(reports.length).toBe(1)
    })

    test('should provide fix for slice()', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'arr')
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('arr')
    })
  })

  describe('detecting slice(0) with zero argument', () => {
    test('should report arr.slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('slice(0)')
      expect(reports[0].message).toMatch(/unnecessary/i)
    })

    test('should report array.slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('array', [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should provide fix for slice(0)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'arr')
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('arr')
    })
  })

  describe('detecting slice(undefined) with undefined argument', () => {
    test('should report arr.slice(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('slice(undefined)')
      expect(reports[0].message).toMatch(/unnecessary/i)
    })

    test('should report items.slice(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('items', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(1)
    })

    test('should provide fix for slice(undefined)', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'arr')
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('arr')
    })
  })

  describe('not reporting valid slice usage', () => {
    test('should not report arr.slice(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(1, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(1), createLiteral(5)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(-5, -1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(-5), createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(start)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createIdentifier('start')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(start, end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(
        createSliceCall('arr', [createIdentifier('start'), createIdentifier('end')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0), createLiteral(5)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0), createIdentifier('length')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-slice calls', () => {
    test('should not report arr.map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('map'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.filter()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('filter'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.reduce()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('reduce'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.forEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('forEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.push()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createNonSliceCall('push'))

      expect(reports.length).toBe(0)
    })

    test('should not report direct function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createDirectCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention shallow copy for slice()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0].message).toContain('shallow copy')
    })

    test('should mention entire array for slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))

      expect(reports[0].message).toContain('entire array')
    })

    test('should mention entire array for slice(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(undefined, 'undefined')]))

      expect(reports[0].message).toContain('entire array')
    })

    test('should mention remove the call for slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))

      expect(reports[0].message).toContain('Remove the call')
    })

    test('should mention spread syntax for slice()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports[0].message).toContain('spread syntax')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        range: [0, 9],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 10, line: 1 },
          start: { column: 0, line: 1 },
        },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          name: 'slice',
          type: 'Identifier',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            type: 'Literal',
            value: 'slice',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle computed property access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          computed: true,
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            type: 'Literal',
            value: 'slice',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(() => visitor.CallExpression(createSliceCall('arr', []))).not.toThrow()
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 10, line: 1 },
          start: { column: 0, line: 1 },
        },
        range: [0, 9],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-literal argument for slice(0) check', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [createIdentifier('zero')]))

      expect(reports.length).toBe(0)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))
      visitor.CallExpression(createSliceCall('arr', [createLiteral(0)]))
      visitor.CallExpression(createSliceCall('arr', [createIdentifier('start')]))
      visitor.CallExpression(createSliceCall('items', [createLiteral(0)]))

      expect(reports.length).toBe(3)
    })
  })

  describe('fix behavior', () => {
    test('should not provide fix when range is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 10, line: 1 },
          start: { column: 0, line: 1 },
        },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix when object has range', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', []))

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should not provide fix when object cannot be extracted', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      const node = {
        arguments: [],
        callee: {
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'slice',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        range: [0, 9],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide correct fix range', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('arr', [], 1, 0))

      expect(reports[0].fix?.range).toBeDefined()
      expect(reports[0].fix?.range.length).toBe(2)
    })
  })

  describe('integration-like scenarios', () => {
    test('should detect common unnecessary slice patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('array', []))
      visitor.CallExpression(createSliceCall('items', [createLiteral(0)]))
      visitor.CallExpression(createSliceCall('data', [createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(3)
    })

    test('should not flag necessary slicing patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySliceRule.create(context)

      visitor.CallExpression(createSliceCall('array', [createLiteral(1)]))
      visitor.CallExpression(createSliceCall('items', [createLiteral(2), createLiteral(5)]))
      visitor.CallExpression(createSliceCall('data', [createLiteral(-3)]))
      visitor.CallExpression(createSliceCall('arr', [createIdentifier('start')]))

      expect(reports.length).toBe(0)
    })
  })
})
