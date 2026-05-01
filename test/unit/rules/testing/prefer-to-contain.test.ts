import { describe, test, expect, vi } from 'vitest'
import { preferToContainRule } from '../../../../src/rules/testing/prefer-to-contain.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "expect(arr.includes(x)).toBe(true);",
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

function createIncludesToBeCall(matcherValue: boolean, argName = 'x', line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'includes' },
          },
          arguments: [{ type: 'Identifier', name: argName }],
        }],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: matcherValue }],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createIncludesToEqualCall(matcherValue: boolean, argName = 'x', line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'includes' },
          },
          arguments: [{ type: 'Identifier', name: argName }],
        }],
      },
      property: { type: 'Identifier', name: 'toEqual' },
    },
    arguments: [{ type: 'Literal', value: matcherValue }],
    loc: { start: { line, column }, end: { line, column: column + 38 } },
  }
}

function createNotIncludesToBeCall(matcherValue: boolean, argName = 'x', line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: argName }],
            }],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: matcherValue }],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createIndexOfComparisonCall(
  operator: string,
  compareValue: number,
  argName = 'x',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{
          type: 'BinaryExpression',
          left: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'indexOf' },
            },
            arguments: [{ type: 'Identifier', name: argName }],
          },
          operator,
          right: { type: 'Literal', value: compareValue },
        }],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: true }],
    loc: { start: { line, column }, end: { line, column: column + 45 } },
  }
}

function createToContainCall(argName = 'x', line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'arr' }],
      },
      property: { type: 'Identifier', name: 'toContain' },
    },
    arguments: [{ type: 'Identifier', name: argName }],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createStandaloneIncludesCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'arr' },
      property: { type: 'Identifier', name: 'includes' },
    },
    arguments: [{ type: 'Identifier', name: 'x' }],
    loc: { start: { line, column }, end: { line, column: column + 16 } },
  }
}

function createLengthCheckCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'length' },
        }],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: 3 }],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createStringIncludesToBeCall(matcherValue: boolean, argName = 'x', line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'str' },
            property: { type: 'Identifier', name: 'includes' },
          },
          arguments: [{ type: 'Identifier', name: argName }],
        }],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: matcherValue }],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createStringIndexOfToBeCall(
  operator: string,
  compareValue: number,
  argName = 'x',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{
          type: 'BinaryExpression',
          left: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'str' },
              property: { type: 'Identifier', name: 'indexOf' },
            },
            arguments: [{ type: 'Identifier', name: argName }],
          },
          operator,
          right: { type: 'Literal', value: compareValue },
        }],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: true }],
    loc: { start: { line, column }, end: { line, column: column + 45 } },
  }
}

describe('prefer-to-contain rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferToContainRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferToContainRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferToContainRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferToContainRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning toContain', () => {
      expect(preferToContainRule.meta.docs?.description).toContain('toContain')
    })

    test('should have correct docs URL', () => {
      expect(preferToContainRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-to-contain',
      )
    })

    test('description mentions indexOf', () => {
      expect(preferToContainRule.meta.docs?.description).toContain('indexOf')
    })

    test('description mentions toContain', () => {
      expect(preferToContainRule.meta.docs?.description).toContain('toContain')
    })

    test('description mentions includes', () => {
      expect(preferToContainRule.meta.docs?.description).toContain('includes')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferToContainRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferToContainRule.create(context)
      const visitor2 = preferToContainRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('arr.includes(x).toBe(true) — reports', () => {
    test('should report expect(arr.includes(x)).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true))

      expect(reports.length).toBe(1)
    })

    test('should report expect(arr.includes(x)).toBe(true) with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true, 'x', 5, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('message mentions toContain for .toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true))

      expect(reports[0].message).toContain('toContain')
    })

    test('message mentions includes for .toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true))

      expect(reports[0].message).toContain('includes')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })
  })

  describe('arr.includes(x).toBe(false) — reports with not.toContain', () => {
    test('should report expect(arr.includes(x)).toBe(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(false))

      expect(reports.length).toBe(1)
    })

    test('message mentions not.toContain for .toBe(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(false))

      expect(reports[0].message).toContain('not.toContain')
    })
  })

  describe('arr.includes(x).toEqual(true) — reports', () => {
    test('should report expect(arr.includes(x)).toEqual(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToEqualCall(true))

      expect(reports.length).toBe(1)
    })

    test('should report expect(arr.includes(x)).toEqual(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToEqualCall(false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('not.toContain')
    })
  })

  describe('arr.includes(x).not.toBe(true) — reports with not.toContain', () => {
    test('should report expect(arr.includes(x)).not.toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createNotIncludesToBeCall(true))

      expect(reports.length).toBe(1)
    })

    test('message mentions not.toContain for .not.toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createNotIncludesToBeCall(true))

      expect(reports[0].message).toContain('not.toContain')
    })
  })

  describe('arr.includes(x).not.toBe(false) — reports with toContain', () => {
    test('should report expect(arr.includes(x)).not.toBe(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createNotIncludesToBeCall(false))

      expect(reports.length).toBe(1)
    })

    test('message mentions toContain without not for .not.toBe(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createNotIncludesToBeCall(false))

      expect(reports[0].message).toContain('toContain')
      expect(reports[0].message).not.toContain('not.toContain')
    })
  })

  describe('str.includes(x).toBe(true) — reports', () => {
    test('should report expect(str.includes(x)).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createStringIncludesToBeCall(true))

      expect(reports.length).toBe(1)
    })

    test('should report expect(str.includes(x)).toBe(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createStringIncludesToBeCall(false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('not.toContain')
    })
  })

  describe('str.indexOf(x) > -1 patterns — reports', () => {
    test('should report expect(str.indexOf(x) > -1).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createStringIndexOfToBeCall('>', -1))

      expect(reports.length).toBe(1)
    })
  })

  describe('str.indexOf(x) >= 0 patterns — reports', () => {
    test('should report expect(str.indexOf(x) >= 0).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createStringIndexOfToBeCall('>=', 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('arr.indexOf(x) > -1 patterns — reports', () => {
    test('should report expect(arr.indexOf(x) > -1).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIndexOfComparisonCall('>', -1))

      expect(reports.length).toBe(1)
    })
  })

  describe('arr.indexOf(x) >= 0 patterns — reports', () => {
    test('should report expect(arr.indexOf(x) >= 0).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIndexOfComparisonCall('>=', 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('arr.indexOf(x) !== -1 patterns — reports', () => {
    test('should report expect(arr.indexOf(x) !== -1).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIndexOfComparisonCall('!==', -1))

      expect(reports.length).toBe(1)
    })
  })

  describe('arr.indexOf(x) === -1 patterns — reports with not.toContain', () => {
    test('should report expect(arr.indexOf(x) === -1).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIndexOfComparisonCall('===', -1))

      expect(reports.length).toBe(1)
    })

    test('message mentions toContain for indexOf === -1', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIndexOfComparisonCall('===', -1))

      expect(reports[0].message).toContain('toContain')
      expect(reports[0].message).toContain('indexOf')
    })
  })

  describe('indexOf message mentions indexOf', () => {
    test('message mentions indexOf for > -1 pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIndexOfComparisonCall('>', -1))

      expect(reports[0].message).toContain('indexOf')
    })
  })

  describe('no violations — toContain() directly', () => {
    test('should not report expect(arr).toContain(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createToContainCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('no violations — standalone includes()', () => {
    test('should not report arr.includes(x) standalone', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createStandaloneIncludesCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('no violations — length checks', () => {
    test('should not report expect(arr.length).toBe(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createLengthCheckCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('no violations — non-boolean toBe argument', () => {
    test('should not report expect(arr.includes(x)).toBe(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('no violations — non-includes/non-indexOf expect arg', () => {
    test('should not report expect(arr.filter(fn)).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'filter' },
              },
              arguments: [{ type: 'Identifier', name: 'fn' }],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('no violations — non-expect callee', () => {
    test('should not report something(arr.includes(x)).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'something' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple violations in one file', () => {
    test('should report multiple includes().toBe(true) calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true, 'x', 1, 0))
      visitor.CallExpression(createIncludesToBeCall(true, 'y', 2, 0))
      visitor.CallExpression(createIncludesToBeCall(true, 'z', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true, 'x', 1, 0))
      visitor.CallExpression(createToContainCall('y', 2, 0))
      visitor.CallExpression(createIncludesToBeCall(false, 'z', 3, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })
  })

  describe('report message content', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true, 'x', 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('message includes argument name for includes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true, 'myVar'))

      expect(reports[0].message).toContain('myVar')
    })

    test('message includes argument name for indexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIndexOfComparisonCall('>', -1, 'searchItem'))

      expect(reports[0].message).toContain('searchItem')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toContain' },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      const node = createIncludesToBeCall(true)
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle includes with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle matcher with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when matcher name is not toBe/toEqual/toStrictEqual', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toBeTruthy' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle indexOf with unsupported operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIndexOfComparisonCall('<', 10))

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression where left is not indexOf call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: { type: 'Identifier', name: 'x' },
              operator: '>',
              right: { type: 'Literal', value: -1 },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle toStrictEqual with includes pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toStrictEqual' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle expect().resolves.toContain() chain - no violation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'promise' }],
              },
              property: { type: 'Identifier', name: 'resolves' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toContain' },
        },
        arguments: [{ type: 'Literal', value: 'item' }],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle expect().rejects.toContain() chain - no violation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'promise' }],
              },
              property: { type: 'Identifier', name: 'rejects' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toContain' },
        },
        arguments: [{ type: 'Literal', value: 'error' }],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle expect().not.toContain() chain - no violation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'arr' }],
              },
              property: { type: 'Identifier', name: 'not' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toContain' },
        },
        arguments: [{ type: 'Literal', value: 'item' }],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle different argument types in expect (literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'Literal',
              value: 'test-string'.includes('test'),
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle multiple arguments in toBe/toEqual - ignores first', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [
          { type: 'Literal', value: true },
          { type: 'Literal', value: 'extra' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle non-Literal matcher argument (identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Identifier', name: 'boolVar' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle non-Literal matcher argument (expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: 'a' },
          operator: '===',
          right: { type: 'Identifier', name: 'b' },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferToContainRule.create(ctx1)
      const visitor2 = preferToContainRule.create(ctx2)

      visitor1.CallExpression(createIncludesToBeCall(true))
      visitor2.CallExpression(createToContainCall())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true, 'x', 1, 0))
      visitor.CallExpression(createIncludesToBeCall(true, 'y', 2, 0))
      visitor.CallExpression(createToContainCall('z', 3, 0))
      visitor.CallExpression(createIncludesToBeCall(false, 'w', 4, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(preferToContainRule).toBeDefined()
      expect(preferToContainRule.meta).toBeDefined()
      expect(preferToContainRule.create).toBeDefined()
    })
  })

  describe('nested / chained patterns', () => {
    test('should handle deeply nested expect with includes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true, 'x', 2, 4))
      visitor.CallExpression(createLengthCheckCall(1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle indexOf with string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'str' },
                  property: { type: 'Identifier', name: 'indexOf' },
                },
                arguments: [{ type: 'Literal', value: 'hello' }],
              },
              operator: '>',
              right: { type: 'Literal', value: -1 },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'hello'")
    })

    test('should handle indexOf with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'arr' },
                  property: { type: 'Identifier', name: 'indexOf' },
                },
                arguments: [{
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'getKey' },
                  arguments: [],
                }],
              },
              operator: '>',
              right: { type: 'Literal', value: -1 },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('getKey(...)')
    })

    test('should report expect(arr.includes(x)).toStrictEqual(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toStrictEqual' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toContain')
    })

    test('should report expect(arr.includes(x)).toStrictEqual(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toStrictEqual' },
        },
        arguments: [{ type: 'Literal', value: false }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('not.toContain')
    })

    test('should report expect(obj.items.includes(x)).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'obj' },
                  property: { type: 'Identifier', name: 'items' },
                },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report expect(arr.indexOf(x) >= 0).toBe(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'arr' },
                  property: { type: 'Identifier', name: 'indexOf' },
                },
                arguments: [{ type: 'Identifier', name: 'x' }],
              },
              operator: '>=',
              right: { type: 'Literal', value: 0 },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: false }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toContain')
    })

    test('should report expect(arr.indexOf(x) > -1).toBe(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'arr' },
                  property: { type: 'Identifier', name: 'indexOf' },
                },
                arguments: [{ type: 'Identifier', name: 'x' }],
              },
              operator: '>',
              right: { type: 'Literal', value: -1 },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: false }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toContain')
    })

    test('should not report expect(arr.indexOf(x) > 0).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'arr' },
                  property: { type: 'Identifier', name: 'indexOf' },
                },
                arguments: [{ type: 'Identifier', name: 'x' }],
              },
              operator: '>',
              right: { type: 'Literal', value: 0 },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report expect(arr.indexOf(x) < 0).toBe(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'arr' },
                  property: { type: 'Identifier', name: 'indexOf' },
                },
                arguments: [{ type: 'Identifier', name: 'x' }],
              },
              operator: '<',
              right: { type: 'Literal', value: 0 },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report expect(arr.includes(x)).toEqual(true) with numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Literal', value: 42 }],
            }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('42')
    })

    test('should not report expect(fn.includes(x)).toBe(true) when fn is not on an object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'fn' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report two indexOf violations in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      const call1 = createIndexOfComparisonCall('>', -1, 'x', 1, 0)
      const call2 = createIndexOfComparisonCall('>=', 0, 'y', 2, 0)

      visitor.CallExpression(call1)
      visitor.CallExpression(call2)

      expect(reports.length).toBe(2)
    })

    test('should report includes followed by indexOf violation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression(createIncludesToBeCall(true, 'x', 1, 0))
      visitor.CallExpression(createIndexOfComparisonCall('>', -1, 'y', 2, 0))

      expect(reports.length).toBe(2)
    })

    test('should handle includes with multiple arguments in the array method', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [
                { type: 'Identifier', name: 'x' },
                { type: 'Literal', value: 0 },
              ],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should not report when indexOf is on the right side of comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: { type: 'Literal', value: -1 },
              right: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'arr' },
                  property: { type: 'Identifier', name: 'indexOf' },
                },
                arguments: [{ type: 'Identifier', name: 'x' }],
              },
              operator: '!==',
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report expect(arr.indexOf(x) !== -1).toEqual(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'arr' },
                  property: { type: 'Identifier', name: 'indexOf' },
                },
                arguments: [{ type: 'Identifier', name: 'x' }],
              },
              operator: '!==',
              right: { type: 'Literal', value: -1 },
            }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toContain')
    })

    test('should report expect(arr.indexOf(x) === -1).toEqual(true) with not.toContain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'arr' },
                  property: { type: 'Identifier', name: 'indexOf' },
                },
                arguments: [{ type: 'Identifier', name: 'x' }],
              },
              operator: '===',
              right: { type: 'Literal', value: -1 },
            }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toContain')
    })
  })

  describe('indexOf with toEqual matcher', () => {
    test('should report indexOf(x) > -1 with toEqual(true)', () => {
      const { context, reports } = createMockContext()

      const visitor = preferToContainRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'arr' },
                  property: { type: 'Identifier', name: 'indexOf' },
                },
                arguments: [{ type: 'Identifier', name: 'item' }],
              },
              operator: '>',
              right: { type: 'Literal', value: -1 },
            }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('toContain')
    })
  })

  describe('null and undefined edge cases', () => {
    test('should not report when matcher argument is null', () => {
      const { context, reports } = createMockContext()

      const visitor = preferToContainRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when matcher argument is a number', () => {
      const { context, reports } = createMockContext()

      const visitor = preferToContainRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('additional verification', () => {
    test('should have create function returning visitor', () => {
      const { context } = createMockContext()
      const visitor = preferToContainRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
    })
  })

  describe('includes with .not chain', () => {
    test('should report expect(arr.includes(x)).not.toBe(true) as not.toContain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{
                  type: 'CallExpression',
                  callee: {
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: 'arr' },
                    property: { type: 'Identifier', name: 'includes' },
                  },
                  arguments: [{ type: 'Identifier', name: 'x' }],
                }],
              },
              property: { type: 'Identifier', name: 'not' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toContain')
    })

    test('should report expect(arr.includes(x)).not.toBe(false) as toContain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{
                  type: 'CallExpression',
                  callee: {
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: 'arr' },
                    property: { type: 'Identifier', name: 'includes' },
                  },
                  arguments: [{ type: 'Identifier', name: 'x' }],
                }],
              },
              property: { type: 'Identifier', name: 'not' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: false }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toContain')
      expect(reports[0].message).not.toContain('not.toContain')
    })
  })

  describe('indexOf double negation', () => {
    test('should report indexOf(x) === -1 with toBe(false) as not.toContain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'BinaryExpression',
              left: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'arr' },
                  property: { type: 'Identifier', name: 'indexOf' },
                },
                arguments: [{ type: 'Identifier', name: 'x' }],
              },
              operator: '===',
              right: { type: 'Literal', value: -1 },
            }],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: false }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toContain')
    })
  })

  describe('includes with toEqual(false)', () => {
    test('should report expect(arr.includes(x)).toEqual(false) as not.toContain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'arr' },
                property: { type: 'Identifier', name: 'includes' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [{ type: 'Literal', value: false }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toContain')
    })
  })

  describe('null node handling', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToContainRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports).toHaveLength(0)
    })
  })
})
