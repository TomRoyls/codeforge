import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryStringConcatRule } from '../../../../src/rules/patterns/no-unnecessary-string-concat.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = '"".concat(str);',
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

function createConcatCall(objectName = 'str', args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Literal',
        value: objectName,
        raw: objectName,
      },
      property: {
        type: 'Identifier',
        name: 'concat',
      },
      computed: false,
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 + objectName.length },
    },
    range: [column, column + 10 + objectName.length],
  }
}

function createConcatCallWithIdentifierObject(
  objectName = 'str',
  args: unknown[],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: objectName,
      },
      property: {
        type: 'Identifier',
        name: 'concat',
      },
      computed: false,
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 + objectName.length },
    },
    range: [column, column + 10 + objectName.length],
  }
}

function createLiteral(value: unknown, raw?: string): unknown {
  return {
    type: 'Literal',
    value,
    raw: raw ?? String(value),
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createNonConcatCall(methodName = 'map'): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'arr',
      },
      property: {
        type: 'Identifier',
        name: methodName,
      },
    },
    arguments: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createDirectCall(): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'concat',
    },
    arguments: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-unnecessary-string-concat rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryStringConcatRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryStringConcatRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryStringConcatRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noUnnecessaryStringConcatRule.meta.fixable).toBe('code')
    })

    test('should mention concat in description', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.description.toLowerCase()).toContain('concat')
    })

    test('should mention unnecessary in description', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.description.toLowerCase()).toContain(
        'unnecessary',
      )
    })

    test('should mention empty string in description', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.description.toLowerCase()).toContain(
        'empty string',
      )
    })

    test('should have documentation URL', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.url).toContain('no-unnecessary-string-concat')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting emptyString.concat(str)', () => {
    test('should report "".concat("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('concat')
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('should report "".concat(str)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('str')]))

      expect(reports.length).toBe(1)
    })

    test('should report "".concat(text)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('text')]))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting str.concat("")', () => {
    test('should report str.concat("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('concat')
      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('should report text.concat("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('text', [createLiteral('')]))

      expect(reports.length).toBe(1)
    })

    test('should report message.concat("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('message', [createLiteral('')]))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid concat usage', () => {
    test('should not report "hello".concat("world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('hello', [createLiteral('world')]))

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat("world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('world')]))

      expect(reports.length).toBe(0)
    })

    test('should not report "hello".concat(str)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('hello', [createIdentifier('str')]))

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat(text)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [createIdentifier('text')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat(text1, text2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [
          createIdentifier('text1'),
          createIdentifier('text2'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat("world", "!")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [createLiteral('world'), createLiteral('!')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report "".concat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', []))

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('str', []))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-concat calls', () => {
    test('should not report arr.map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('map'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.filter()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('filter'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.reduce()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('reduce'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.forEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('forEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.push()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('push'))

      expect(reports.length).toBe(0)
    })

    test('should not report direct function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createDirectCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention string concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))

      expect(reports[0].message).toContain('string concatenation')
    })

    test('should mention empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))

      expect(reports[0].message).toContain('empty string')
    })

    test('should mention same as using the string directly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))

      expect(reports[0].message).toContain('same as using the string directly')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
          property: {
            type: 'Identifier',
            name: 'concat',
          },
        },
        arguments: [
          {
            type: 'Identifier',
            name: 'str',
          },
        ],
        range: [0, 9],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
          property: {
            type: 'Identifier',
            name: 'concat',
          },
        },
        arguments: [
          {
            type: 'Identifier',
            name: 'str',
          },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'concat',
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
          property: {
            type: 'Literal',
            value: 'concat',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle computed property access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
          property: {
            type: 'Literal',
            value: 'concat',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty source', () => {
      const { context } = createMockContext({}, '/src/file.ts', '')
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(() =>
        visitor.CallExpression(createConcatCall('', [createLiteral('hello')])),
      ).not.toThrow()
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
          property: {
            type: 'Identifier',
            name: 'concat',
          },
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
        range: [0, 9],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-literal object for empty string check', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [createIdentifier('text')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('')]))
      visitor.CallExpression(
        createConcatCallWithIdentifierObject('text', [createIdentifier('world')]),
      )
      visitor.CallExpression(createConcatCall('hello', [createLiteral('world')]))

      expect(reports.length).toBe(2)
    })
  })

  describe('integration-like scenarios', () => {
    test('should detect common unnecessary concat patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))
      visitor.CallExpression(createConcatCall('', [createIdentifier('str')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('text', [createLiteral('')]))

      expect(reports.length).toBe(4)
    })

    test('should not flag necessary concat patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('hello', [createLiteral('world')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('world')]))
      visitor.CallExpression(createConcatCall('hello', [createIdentifier('str')]))
      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [createIdentifier('text')]),
      )
      visitor.CallExpression(
        createConcatCall('hello', [createLiteral('world'), createLiteral('!')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not flag necessary concat patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConcatRule.create(context)

      // Valid patterns
      visitor.CallExpression(createConcatCall('hello', [createLiteral('world')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('world')]))
      visitor.CallExpression(createConcatCall('hello', [createIdentifier('str')]))
      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [createIdentifier('text')]),
      )
      visitor.CallExpression(
        createConcatCall('hello', [createLiteral('world'), createLiteral('!')]),
      )

      expect(reports.length).toBe(0)
    })
  })
})
