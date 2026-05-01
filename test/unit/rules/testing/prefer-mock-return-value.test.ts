import { describe, test, expect, vi } from 'vitest'
import { preferMockReturnValueRule } from '../../../../src/rules/testing/prefer-mock-return-value.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'myMock.mockImplementation(() => 42);',
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

function createReturnValueCall(
  mockMethod: string,
  bodyType: string = 'Literal',
  bodyValue: unknown = 42,
  objectName = 'myMock',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: mockMethod },
    },
    arguments: [
      { type: 'ArrowFunctionExpression', params: [], body: { type: bodyType, value: bodyValue } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createReturnValueOnMember(
  mockMethod: string,
  objectPath: string[],
  bodyType: string = 'Literal',
  bodyValue: unknown = 42,
  line = 1,
  column = 0,
): unknown {
  let object: unknown
  if (objectPath.length === 1) {
    object = { type: 'Identifier', name: objectPath[0] }
  } else {
    object = { type: 'Identifier', name: objectPath[0] }
    for (let i = 1; i < objectPath.length; i++) {
      object = {
        type: 'MemberExpression',
        object,
        property: { type: 'Identifier', name: objectPath[i] },
      }
    }
  }

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: mockMethod },
    },
    arguments: [
      { type: 'ArrowFunctionExpression', params: [], body: { type: bodyType, value: bodyValue } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 60 } },
  }
}

describe('prefer-mock-return-value rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferMockReturnValueRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferMockReturnValueRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferMockReturnValueRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferMockReturnValueRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning mockReturnValue', () => {
      expect(preferMockReturnValueRule.meta.docs?.description).toContain('mockReturnValue')
    })

    test('should have correct description mentioning mockReturnValueOnce', () => {
      expect(preferMockReturnValueRule.meta.docs?.description).toContain('mockReturnValueOnce')
    })

    test('should have correct description mentioning mockImplementation', () => {
      expect(preferMockReturnValueRule.meta.docs?.description).toContain('mockImplementation')
    })

    test('should have correct docs URL', () => {
      expect(preferMockReturnValueRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-mock-return-value',
      )
    })

    test('should not have fixable field in meta', () => {
      expect('fixable' in preferMockReturnValueRule.meta).toBe(false)
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferMockReturnValueRule.create(context)
      const visitor2 = preferMockReturnValueRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting mockImplementation with simple return values', () => {
    test('should report mockImplementation(() => 42)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 42))

      expect(reports.length).toBe(1)
    })

    test('should suggest mockReturnValue', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation'))

      expect(reports[0].message).toContain('mockReturnValue')
    })

    test('should report mockImplementation(() => "hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 'hello'))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementation(() => true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', true))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementation(() => false)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', false))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementation(() => null)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', null))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementation(() => undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Identifier', undefined, undefined))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementation(() => someVar) with identifier body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'Identifier', name: 'someVar' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting mockImplementationOnce with simple return values', () => {
    test('should report mockImplementationOnce(() => 42)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementationOnce', 'Literal', 42))

      expect(reports.length).toBe(1)
    })

    test('should suggest mockReturnValueOnce', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementationOnce'))

      expect(reports[0].message).toContain('mockReturnValueOnce')
    })

    test('should report mockImplementationOnce(() => "hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementationOnce', 'Literal', 'hello'))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementationOnce(() => true)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementationOnce', 'Literal', true))

      expect(reports.length).toBe(1)
    })
  })

  describe('chained on various objects', () => {
    test('should report on simple variable myMock', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 42, 'myMock'))

      expect(reports.length).toBe(1)
    })

    test('should report on obj.method', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueOnMember('mockImplementation', ['obj', 'method']))

      expect(reports.length).toBe(1)
    })

    test('should report on a.b.c nested member', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueOnMember('mockImplementation', ['a', 'b', 'c']))

      expect(reports.length).toBe(1)
    })

    test('should report on api.fetch.mockImplementation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueOnMember('mockImplementation', ['api', 'fetch']))

      expect(reports.length).toBe(1)
    })

    test('should report on service.getData.mockImplementationOnce', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueOnMember('mockImplementationOnce', ['service', 'getData']))

      expect(reports.length).toBe(1)
    })
  })

  describe('various body types that should report', () => {
    test('should report returns object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'ObjectExpression', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'key' }, value: { type: 'Literal', value: 'val' } }] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report returns array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report returns template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'hello' } }], expressions: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report returns member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'MemberExpression', object: { type: 'Identifier', name: 'config' }, property: { type: 'Identifier', name: 'value' } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report returns binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report returns unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'UnaryExpression', operator: '-', argument: { type: 'Identifier', name: 'x' } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report returns conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report returns logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('report message content', () => {
    test('message contains mockReturnValue for mockImplementation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation'))

      expect(reports[0].message).toContain('mockReturnValue')
      expect(reports[0].message).not.toContain('mockReturnValueOnce')
    })

    test('message contains mockReturnValueOnce for mockImplementationOnce', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementationOnce'))

      expect(reports[0].message).toContain('mockReturnValueOnce')
    })

    test('message contains the original mockImplementation method name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation'))

      expect(reports[0].message).toContain('mockImplementation')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation'))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('message mentions simple value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation'))

      expect(reports[0].message).toContain('simple value')
    })
  })

  describe('report location accuracy', () => {
    test('should report correct start location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 42, 'myMock', 12, 5))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 42, 'myMock', 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 42, 'myMock', 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple violations in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 1, 'a', 1, 0))
      visitor.CallExpression(createReturnValueCall('mockImplementationOnce', 'Literal', 2, 'b', 2, 0))
      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 3, 'c', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 1, 'a', 1, 0))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'b' },
          property: { type: 'Identifier', name: 'mockReturnValue' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })
      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 3, 'c', 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should report separate locations for three sequential violations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 1, 'a', 1, 0))
      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 2, 'b', 20, 4))
      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 3, 'c', 30, 8))

      expect(reports).toHaveLength(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.line).toBe(30)
    })
  })

  describe('should not report — call expressions', () => {
    test('should not report mockImplementation(() => Promise.resolve(1))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'Promise' },
                property: { type: 'Identifier', name: 'resolve' },
              },
              arguments: [{ type: 'Literal', value: 1 }],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report mockImplementation(() => someFn())', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'someFn' },
              arguments: [],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report mockImplementation(() => Promise.reject("err"))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'Promise' },
                property: { type: 'Identifier', name: 'reject' },
              },
              arguments: [{ type: 'Literal', value: 'err' }],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — block body', () => {
    test('should not report mockImplementation(() => { return 1 })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report mockImplementation(() => {})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — arrow function with parameters', () => {
    test('should not report mockImplementation((x) => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: { type: 'Identifier', name: 'x' },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report mockImplementation((arg) => arg + 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'arg' }],
            body: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'arg' }, right: { type: 'Literal', value: 1 } },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — passing variable', () => {
    test('should not report mockImplementation(fn) where fn is a variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — no arguments', () => {
    test('should not report mockImplementation() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — already using shorthand', () => {
    test('should not report mockReturnValue(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockReturnValue' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report mockReturnValueOnce(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockReturnValueOnce' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — wrong method name', () => {
    test('should not report someOtherMethod(() => 42)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'someOtherMethod' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'Literal', value: 42 },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — non-member-expression callee', () => {
    test('should not report when callee is a simple identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'mockImplementation' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'Literal', value: 42 },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — FunctionExpression instead of ArrowFunction', () => {
    test('should not report mockImplementation(function() { return 1 })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [],
            body: { type: 'Literal', value: 1 },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — nested functions', () => {
    test('should not report arrow function returning arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: 1 } },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function returning FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'FunctionExpression', params: [], body: { type: 'Literal', value: 1 } },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      const node = createReturnValueCall('mockImplementation')
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle mockImplementation with more than 1 argument (still check first)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: 42 } },
          { type: 'Literal', value: 'extra-arg' },
        ],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle null arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: null,
      })

      expect(reports.length).toBe(0)
    })

    test('should handle non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle callee property that is Literal (computed property)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Literal', value: 'mockImplementation' },
          computed: true,
        },
        arguments: [
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: 42 } },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle first argument that is neither arrow nor function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested member expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueOnMember('mockImplementation', ['a', 'b', 'c', 'd']))

      expect(reports.length).toBe(1)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferMockReturnValueRule.create(ctx1)
      const visitor2 = preferMockReturnValueRule.create(ctx2)

      visitor1.CallExpression(createReturnValueCall('mockImplementation'))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockReturnValue' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 1, 'a', 1, 0))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'b' },
          property: { type: 'Identifier', name: 'mockReturnValue' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })
      visitor.CallExpression(createReturnValueCall('mockImplementationOnce', 'Literal', 3, 'c', 3, 0))
      visitor.CallExpression(createReturnValueCall('mockImplementation', 'Literal', 4, 'd', 4, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('should not report — multiple statements in block body', () => {
    test('should not report when block body has console.log before return', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: { type: 'Identifier', name: 'console' },
                      property: { type: 'Identifier', name: 'log' },
                    },
                    arguments: [{ type: 'Literal', value: 'x' }],
                  },
                },
                { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
              ],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — callee object that is MemberExpression', () => {
    test('should still report on nested member callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'nested' },
          },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: 42 } },
        ],
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('should not report — first argument null', () => {
    test('should handle first argument being null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [null],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — mockImplementation with no Promise body', () => {
    test('should not report mockImplementation(() => Promise.all([]))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'Promise' },
                property: { type: 'Identifier', name: 'all' },
              },
              arguments: [{ type: 'ArrayExpression', elements: [] }],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — non-matching AST structure', () => {
    test('should handle AssignmentExpression node type gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(preferMockReturnValueRule).toBeDefined()
      expect(preferMockReturnValueRule.meta).toBeDefined()
      expect(preferMockReturnValueRule.create).toBeTypeOf('function')
    })
  })

  describe('additional positive cases', () => {
    test('should report mockImplementation returning member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'config' },
            property: { type: 'Identifier', name: 'value' },
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('mockReturnValue')
    })

    test('should report mockImplementation returning template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'hello ' } }],
            expressions: [{ type: 'Identifier', name: 'name' }],
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementation returning unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'UnaryExpression',
            operator: '!',
            argument: { type: 'Identifier', name: 'flag' },
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementationOnce returning object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementationOnce' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'ObjectExpression',
            properties: [
              { type: 'Property', key: { type: 'Identifier', name: 'a' }, value: { type: 'Literal', value: 1 } },
            ],
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('mockReturnValueOnce')
    })
  })

  describe('additional negative cases', () => {
    test('should not report when callee property name is other method', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'fn' },
          property: { type: 'Identifier', name: 'mockResolvedValue' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Literal', value: 42 },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when arrow body is function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when arrow body is arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockReturnValueRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockImplementation' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'Literal', value: 1 },
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('meta verification', () => {
    test('should have valid docs URL', () => {
      const url = preferMockReturnValueRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('prefer-mock-return-value')
    })

    test('should have testing category', () => {
      expect(preferMockReturnValueRule.meta.docs?.category).toBe('testing')
    })

    test('meta severity should be warn', () => {
      expect(preferMockReturnValueRule.meta.severity).toBe('warn')
    })
  })
})
