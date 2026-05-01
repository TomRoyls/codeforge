import { describe, test, expect, vi } from 'vitest'
import { preferMockPromiseShorthandRule } from '../../../../src/rules/testing/prefer-mock-promise-shorthand.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'myMock.mockImplementation(() => Promise.resolve(42));',
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

function createPromiseCall(method: 'resolve' | 'reject', argType: string = 'Literal', argValue: unknown = 42): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Promise' },
      property: { type: 'Identifier', name: method },
    },
    arguments: [{ type: argType, value: argValue }],
  }
}

function createMockImplementationCall(
  mockMethod: string,
  promiseMethod: 'resolve' | 'reject',
  objectName = 'myMock',
  bodyType: 'expression' | 'block' = 'expression',
  fnType: 'arrow' | 'function' = 'arrow',
  argType: string = 'Literal',
  argValue: unknown = 42,
  line = 1,
  column = 0,
): unknown {
  const promiseCall = createPromiseCall(promiseMethod, argType, argValue)
  let fnBody: unknown
  if (bodyType === 'expression') {
    fnBody = promiseCall
  } else {
    fnBody = {
      type: 'BlockStatement',
      body: [{ type: 'ReturnStatement', argument: promiseCall }],
    }
  }

  let fn: unknown
  if (fnType === 'arrow') {
    fn = { type: 'ArrowFunctionExpression', params: [], body: fnBody }
  } else {
    fn = { type: 'FunctionExpression', params: [], body: fnBody }
  }

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: mockMethod },
    },
    arguments: [fn],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createMockImplementationOnMember(
  mockMethod: string,
  promiseMethod: 'resolve' | 'reject',
  objectPath: string[],
  line = 1,
  column = 0,
): unknown {
  const promiseCall = createPromiseCall(promiseMethod)

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
      { type: 'ArrowFunctionExpression', params: [], body: promiseCall },
    ],
    loc: { start: { line, column }, end: { line, column: column + 60 } },
  }
}

describe('prefer-mock-promise-shorthand rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferMockPromiseShorthandRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferMockPromiseShorthandRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferMockPromiseShorthandRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferMockPromiseShorthandRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning mock resolved/rejected value shorthands', () => {
      expect(preferMockPromiseShorthandRule.meta.docs?.description).toContain('mock resolved/rejected value shorthands')
    })

    test('should have correct description mentioning mockImplementation', () => {
      expect(preferMockPromiseShorthandRule.meta.docs?.description).toContain('mockImplementation')
    })

    test('should have correct docs URL', () => {
      expect(preferMockPromiseShorthandRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-mock-promise-shorthand',
      )
    })

    test('should not have fixable field in meta', () => {
      expect('fixable' in preferMockPromiseShorthandRule.meta).toBe(false)
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferMockPromiseShorthandRule.create(context)
      const visitor2 = preferMockPromiseShorthandRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting mockImplementation with Promise.resolve', () => {
    test('should report myMock.mockImplementation(() => Promise.resolve(42))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve'))

      expect(reports.length).toBe(1)
    })

    test('should suggest mockResolvedValue for resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve'))

      expect(reports[0].message).toContain('mockResolvedValue')
    })

    test('should report with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'myMock', 'expression', 'arrow', 'Literal', 'hello'))

      expect(reports.length).toBe(1)
    })

    test('should report with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'myMock', 'expression', 'arrow', 'Literal', true))

      expect(reports.length).toBe(1)
    })

    test('should report with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'myMock', 'expression', 'arrow', 'Literal', null))

      expect(reports.length).toBe(1)
    })

    test('should report with object value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'myMock', 'expression', 'arrow', 'ObjectExpression', { key: 'val' }))

      expect(reports.length).toBe(1)
    })

    test('should report with array value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'myMock', 'expression', 'arrow', 'ArrayExpression', [1, 2]))

      expect(reports.length).toBe(1)
    })

    test('should report with undefined value (no arguments to Promise.resolve)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
              arguments: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting mockImplementation with Promise.reject', () => {
    test('should report myMock.mockImplementation(() => Promise.reject(error))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'reject'))

      expect(reports.length).toBe(1)
    })

    test('should suggest mockRejectedValue for reject', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'reject'))

      expect(reports[0].message).toContain('mockRejectedValue')
    })

    test('should report Promise.reject with string error', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'reject', 'myMock', 'expression', 'arrow', 'Literal', 'error'))

      expect(reports.length).toBe(1)
    })

    test('should report Promise.reject with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
              arguments: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting mockImplementationOnce with Promise.resolve', () => {
    test('should report myMock.mockImplementationOnce(() => Promise.resolve(42))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'resolve'))

      expect(reports.length).toBe(1)
    })

    test('should suggest mockResolvedValueOnce', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'resolve'))

      expect(reports[0].message).toContain('mockResolvedValueOnce')
    })
  })

  describe('detecting mockImplementationOnce with Promise.reject', () => {
    test('should report myMock.mockImplementationOnce(() => Promise.reject(error))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'reject'))

      expect(reports.length).toBe(1)
    })

    test('should suggest mockRejectedValueOnce', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'reject'))

      expect(reports[0].message).toContain('mockRejectedValueOnce')
    })
  })

  describe('arrow function with block body', () => {
    test('should report mockImplementation(() => { return Promise.resolve(value) })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'myMock', 'block'))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementation(() => { return Promise.reject(err) })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'reject', 'myMock', 'block'))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementationOnce(() => { return Promise.resolve(val) })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'resolve', 'myMock', 'block'))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementationOnce(() => { return Promise.reject(err) })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'reject', 'myMock', 'block'))

      expect(reports.length).toBe(1)
    })
  })

  describe('function expression instead of arrow', () => {
    test('should report mockImplementation(function() { return Promise.resolve(value) })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'myMock', 'block', 'function'))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementation(function() { return Promise.reject(err) })', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'reject', 'myMock', 'block', 'function'))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementationOnce with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'resolve', 'myMock', 'block', 'function'))

      expect(reports.length).toBe(1)
    })
  })

  describe('chained on various objects', () => {
    test('should report on simple variable myMock', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'myMock'))

      expect(reports.length).toBe(1)
    })

    test('should report on obj.method', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationOnMember('mockImplementation', 'resolve', ['obj', 'method']))

      expect(reports.length).toBe(1)
    })

    test('should report on a.b.c nested member', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationOnMember('mockImplementation', 'resolve', ['a', 'b', 'c']))

      expect(reports.length).toBe(1)
    })

    test('should report on api.fetch.mockImplementation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationOnMember('mockImplementation', 'resolve', ['api', 'fetch']))

      expect(reports.length).toBe(1)
    })

    test('should report on service.getData.mockImplementationOnce', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationOnMember('mockImplementationOnce', 'resolve', ['service', 'getData']))

      expect(reports.length).toBe(1)
    })
  })

  describe('report message content', () => {
    test('message contains the suggested shorthand method', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve'))

      expect(reports[0].message).toContain('mockResolvedValue')
    })

    test('message contains the original mockImplementation method', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve'))

      expect(reports[0].message).toContain('mockImplementation')
    })

    test('message contains Promise.resolve for resolve case', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve'))

      expect(reports[0].message).toContain('Promise.resolve')
    })

    test('message contains Promise.reject for reject case', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'reject'))

      expect(reports[0].message).toContain('Promise.reject')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve'))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'myMock', 'expression', 'arrow', 'Literal', 42, 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('report location accuracy', () => {
    test('should report correct start location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'myMock', 'expression', 'arrow', 'Literal', 42, 12, 5))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'myMock', 'expression', 'arrow', 'Literal', 42, 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('multiple violations', () => {
    test('should report multiple violations in same file', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'a', 'expression', 'arrow', 'Literal', 1, 1, 0))
      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'reject', 'b', 'expression', 'arrow', 'Literal', 'err', 2, 0))
      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'resolve', 'c', 'expression', 'arrow', 'Literal', true, 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations and pass valid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'a', 'expression', 'arrow', 'Literal', 1, 1, 0))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'b' },
          property: { type: 'Identifier', name: 'mockResolvedValue' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })
      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'reject', 'c', 'expression', 'arrow', 'Literal', 'err', 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should report separate locations for three sequential violations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'a', 'expression', 'arrow', 'Literal', 1, 1, 0))
      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'b', 'expression', 'arrow', 'Literal', 2, 20, 4))
      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'c', 'expression', 'arrow', 'Literal', 3, 30, 8))

      expect(reports).toHaveLength(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.line).toBe(30)
    })
  })

  describe('should not report — already using shorthand', () => {
    test('should not report mockResolvedValue(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockResolvedValue' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report mockRejectedValue(error)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockRejectedValue' },
        },
        arguments: [{ type: 'Literal', value: 'error' }],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report mockResolvedValueOnce(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockResolvedValueOnce' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report mockRejectedValueOnce(error)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockRejectedValueOnce' },
        },
        arguments: [{ type: 'Literal', value: 'error' }],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — not Promise.resolve/reject', () => {
    test('should not report mockImplementation(() => someOtherFunction())', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
              callee: { type: 'Identifier', name: 'someOtherFunction' },
              arguments: [],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report mockImplementation(() => Promise.all([]))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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

    test('should not report mockImplementation(() => Promise.allSettled([]))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
                property: { type: 'Identifier', name: 'allSettled' },
              },
              arguments: [{ type: 'ArrayExpression', elements: [] }],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — not mockImplementation/mockImplementationOnce', () => {
    test('should not report someOtherMethod(() => Promise.resolve(1))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
            body: createPromiseCall('resolve'),
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report mockReturnValue(() => Promise.resolve(1))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockReturnValue' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: createPromiseCall('resolve'),
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — passing variable not inline arrow', () => {
    test('should not report mockImplementation(fn) where fn is a variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
      const visitor = preferMockPromiseShorthandRule.create(context)

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

  describe('should not report — empty function body', () => {
    test('should not report mockImplementation(() => {})', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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

  describe('should not report — multiple statements in block body', () => {
    test('should not report when block body has console.log before return', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
                {
                  type: 'ReturnStatement',
                  argument: createPromiseCall('resolve'),
                },
              ],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — non-member-expression callee', () => {
    test('should not report when callee is a simple identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'mockImplementation' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: createPromiseCall('resolve'),
          },
        ],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('should not report — Promise.resolve not inside mockImplementation', () => {
    test('should not report standalone Promise.resolve() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({ type: 'CallExpression', arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
      const visitor = preferMockPromiseShorthandRule.create(context)

      const node = createMockImplementationCall('mockImplementation', 'resolve')
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle mockImplementation with more than 1 argument (still check first)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
            body: createPromiseCall('resolve'),
          },
          { type: 'Literal', value: 'extra-arg' },
        ],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle Promise.resolve with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
              arguments: [{ type: 'Literal', value: 42 }, { type: 'Literal', value: 'extra' }],
            },
          },
        ],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle block body with no return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
                { type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } },
              ],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle block body with return but no argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
              body: [{ type: 'ReturnStatement' }],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested mockImplementation chains', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      const innerCall = {
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
            body: createPromiseCall('resolve'),
          },
        ],
      }

      visitor.CallExpression(innerCall)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: innerCall,
          property: { type: 'Identifier', name: 'mockResolvedValue' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle callee property that is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Literal', value: 'mockImplementation' },
          computed: true,
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: createPromiseCall('resolve'),
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle callee object that is MemberExpression (not simple Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: createPromiseCall('resolve'),
          },
        ],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle Promise callee object that is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
                object: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'SomePromise' },
                  property: { type: 'Identifier', name: 'static' },
                },
                property: { type: 'Identifier', name: 'resolve' },
              },
              arguments: [{ type: 'Literal', value: 42 }],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle Promise callee object name that is not Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
                object: { type: 'Identifier', name: 'Bluebird' },
                property: { type: 'Identifier', name: 'resolve' },
              },
              arguments: [{ type: 'Literal', value: 42 }],
            },
          },
        ],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle null arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle first argument that is neither arrow nor function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferMockPromiseShorthandRule.create(ctx1)
      const visitor2 = preferMockPromiseShorthandRule.create(ctx2)

      visitor1.CallExpression(createMockImplementationCall('mockImplementation', 'resolve'))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMock' },
          property: { type: 'Identifier', name: 'mockResolvedValue' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'resolve', 'a', 'expression', 'arrow', 'Literal', 1, 1, 0))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'b' },
          property: { type: 'Identifier', name: 'mockResolvedValue' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })
      visitor.CallExpression(createMockImplementationCall('mockImplementation', 'reject', 'c', 'expression', 'arrow', 'Literal', 'err', 3, 0))
      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'resolve', 'd', 'expression', 'arrow', 'Literal', true, 4, 0))
      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'reject', 'e', 'expression', 'arrow', 'Literal', 'err', 5, 0))

      expect(reports.length).toBe(4)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(preferMockPromiseShorthandRule).toBeDefined()
      expect(preferMockPromiseShorthandRule.meta).toBeDefined()
      expect(preferMockPromiseShorthandRule.create).toBeDefined()
    })
  })

  describe('arrow function with parameters', () => {
    test('should report mockImplementation((x) => Promise.resolve(x))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
            body: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'Promise' },
                property: { type: 'Identifier', name: 'resolve' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            },
          },
        ],
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('non-matching AST structures', () => {
    test('should handle AssignmentExpression node type gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle first argument being null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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

  describe('Promise.resolve/reject with various argument types', () => {
    test('should report mockImplementation(() => Promise.resolve({ data: [] }))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
              arguments: [
                {
                  type: 'ObjectExpression',
                  properties: [
                    {
                      type: 'Property',
                      key: { type: 'Identifier', name: 'data' },
                      value: { type: 'ArrayExpression', elements: [] },
                    },
                  ],
                },
              ],
            },
          },
        ],
      })

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementation(() => Promise.reject(new Error()))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

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
              arguments: [
                {
                  type: 'NewExpression',
                  callee: { type: 'Identifier', name: 'Error' },
                  arguments: [{ type: 'Literal', value: 'fail' }],
                },
              ],
            },
          },
        ],
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('mockImplementationOnce variants with various bodies', () => {
    test('should report mockImplementationOnce with block body + resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'resolve', 'myMock', 'block'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('mockResolvedValueOnce')
    })

    test('should report mockImplementationOnce with block body + reject', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'reject', 'myMock', 'block'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('mockRejectedValueOnce')
    })

    test('should report mockImplementationOnce with function expression + resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'resolve', 'myMock', 'block', 'function'))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementationOnce with function expression + reject', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationCall('mockImplementationOnce', 'reject', 'myMock', 'block', 'function'))

      expect(reports.length).toBe(1)
    })

    test('should report mockImplementationOnce on nested member', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMockPromiseShorthandRule.create(context)

      visitor.CallExpression(createMockImplementationOnMember('mockImplementationOnce', 'reject', ['obj', 'method']))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('mockRejectedValueOnce')
    })
  })
})
