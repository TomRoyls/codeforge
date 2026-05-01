import { describe, test, expect, vi } from 'vitest'
import { preferSpyOnRule } from '../../../../src/rules/testing/prefer-spy-on.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'obj.method = jest.fn();',
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

function createMemberJestFnAssignment(
  objectName = 'obj',
  propertyName = 'method',
  line = 1,
  column = 0,
  withImplementation = false,
): unknown {
  const args = withImplementation
    ? [{ type: 'ArrowFunctionExpression', body: { type: 'Literal', value: 42 } }]
    : []

  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    right: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'jest' },
        property: { type: 'Identifier', name: 'fn' },
      },
      arguments: args,
    },
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createThisJestFnAssignment(
  propertyName = 'method',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: { type: 'ThisExpression' },
      property: { type: 'Identifier', name: propertyName },
    },
    right: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'jest' },
        property: { type: 'Identifier', name: 'fn' },
      },
      arguments: [],
    },
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createIdentifierJestFnAssignment(
  variableName = 'mock',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: { type: 'Identifier', name: variableName },
    right: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'jest' },
        property: { type: 'Identifier', name: 'fn' },
      },
      arguments: [],
    },
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createMemberOtherFnAssignment(
  objectName = 'obj',
  propertyName = 'method',
  fnName = 'someOtherFn',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    right: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: fnName },
      arguments: [],
    },
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createSpyOnCall(
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'jest' },
      property: { type: 'Identifier', name: 'spyOn' },
    },
    arguments: [
      { type: 'Identifier', name: 'obj' },
      { type: 'Literal', value: 'method' },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createNestedMemberJestFnAssignment(
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'nested' },
      },
      property: { type: 'Identifier', name: 'method' },
    },
    right: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'jest' },
        property: { type: 'Identifier', name: 'fn' },
      },
      arguments: [],
    },
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createJestFnWithImplAssignment(
  objectName = 'obj',
  propertyName = 'method',
  implType: 'arrow' | 'function' | 'jest-fn-chain' = 'arrow',
  line = 1,
  column = 0,
): unknown {
  let impl: unknown
  switch (implType) {
    case 'arrow':
      impl = { type: 'ArrowFunctionExpression', body: { type: 'Literal', value: 42 } }
      break
    case 'function':
      impl = { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } }
      break
    case 'jest-fn-chain':
      impl = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'jest' },
        property: { type: 'Identifier', name: 'fn' },
      }
      break
  }

  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    right: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'jest' },
        property: { type: 'Identifier', name: 'fn' },
      },
      arguments: [impl],
    },
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createNonJestMemberCallAssignment(
  objectName = 'jest',
  methodName = 'mock',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: 'prop' },
    },
    right: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: objectName },
        property: { type: 'Identifier', name: methodName },
      },
      arguments: [],
    },
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createCompoundAssignment(
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '+=',
    left: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'method' },
    },
    right: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'jest' },
        property: { type: 'Identifier', name: 'fn' },
      },
      arguments: [],
    },
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

describe('prefer-spy-on rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferSpyOnRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferSpyOnRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferSpyOnRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferSpyOnRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description mentioning jest.spyOn', () => {
      expect(preferSpyOnRule.meta.docs?.description).toContain('jest.spyOn')
    })

    test('should have correct description mentioning jest.fn', () => {
      expect(preferSpyOnRule.meta.docs?.description).toContain('jest.fn')
    })

    test('should have correct docs URL', () => {
      expect(preferSpyOnRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-spy-on',
      )
    })

    test('should not have fixable field in meta', () => {
      expect('fixable' in preferSpyOnRule.meta).toBe(false)
    })
  })

  describe('create', () => {
    test('should return visitor object with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferSpyOnRule.create(context)
      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferSpyOnRule.create(context)
      const visitor2 = preferSpyOnRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting obj.method = jest.fn() violations', () => {
    test('should report obj.method = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment())

      expect(reports.length).toBe(1)
    })

    test('should report obj.handleClick = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'handleClick'))

      expect(reports.length).toBe(1)
    })

    test('should report service.fetch = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('service', 'fetch'))

      expect(reports.length).toBe(1)
    })

    test('should report api.getUser = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('api', 'getUser'))

      expect(reports.length).toBe(1)
    })

    test('should report obj.prop = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'prop'))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for obj.method = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'method', 5, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report obj.method = jest.fn(() => value)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'method', 1, 0, true))

      expect(reports.length).toBe(1)
    })

    test('should report with arrow function implementation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createJestFnWithImplAssignment('obj', 'method', 'arrow'))

      expect(reports.length).toBe(1)
    })

    test('should report with regular function implementation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createJestFnWithImplAssignment('obj', 'method', 'function'))

      expect(reports.length).toBe(1)
    })

    test('should report nested member expression obj.nested.method = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createNestedMemberJestFnAssignment())

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting this.method = jest.fn() violations', () => {
    test('should report this.method = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createThisJestFnAssignment())

      expect(reports.length).toBe(1)
    })

    test('should report this.handleClick = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createThisJestFnAssignment('handleClick'))

      expect(reports.length).toBe(1)
    })

    test('should report this.onSubmit = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createThisJestFnAssignment('onSubmit'))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for this.method = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createThisJestFnAssignment('method', 10, 4))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('jest.spyOn() — no reports', () => {
    test('should not report jest.spyOn(obj, "method")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createSpyOnCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('const mock = jest.fn() — no reports', () => {
    test('should not report const mock = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createIdentifierJestFnAssignment())

      expect(reports.length).toBe(0)
    })

    test('should not report let callback = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createIdentifierJestFnAssignment('callback'))

      expect(reports.length).toBe(0)
    })

    test('should not report variable = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createIdentifierJestFnAssignment('myMock'))

      expect(reports.length).toBe(0)
    })
  })

  describe('obj.method = someOtherFn() — no reports', () => {
    test('should not report obj.method = someOtherFn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberOtherFnAssignment())

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method = vi.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberOtherFnAssignment('obj', 'method', 'vi.fn'))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method = sinon.stub()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'sinon' },
            property: { type: 'Identifier', name: 'stub' },
          },
          arguments: [],
        },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('non-jest member calls — no reports', () => {
    test('should not report obj.prop = jest.mock()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createNonJestMemberCallAssignment('jest', 'mock'))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.prop = jest.genMockFromModule()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createNonJestMemberCallAssignment('jest', 'genMockFromModule'))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.prop = jest.createMockFromModule()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createNonJestMemberCallAssignment('jest', 'createMockFromModule'))

      expect(reports.length).toBe(0)
    })
  })

  describe('compound assignment operators — no reports', () => {
    test('should not report obj.method += jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createCompoundAssignment())

      expect(reports.length).toBe(0)
    })
  })

  describe('report message content', () => {
    test('message mentions jest.spyOn', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment())

      expect(reports[0].message).toContain('jest.spyOn')
    })

    test('message mentions jest.fn', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment())

      expect(reports[0].message).toContain('jest.fn')
    })

    test('message mentions member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment())

      expect(reports[0].message).toContain('member expression')
    })

    test('message does not use ESLint placeholder format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment())

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'method', 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple obj.method = jest.fn() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'a', 1, 0))
      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'b', 2, 0))
      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'c', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations and pass valid assignments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'a', 1, 0))
      visitor.AssignmentExpression(createIdentifierJestFnAssignment('mock', 2, 0))
      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'b', 3, 0))
      visitor.AssignmentExpression(createMemberOtherFnAssignment('obj', 'c', 4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })

    test('should report mix of this and obj assignments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'method', 1, 0))
      visitor.AssignmentExpression(createThisJestFnAssignment('method', 2, 0))

      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(() => visitor.AssignmentExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({ type: 'AssignmentExpression', right: { type: 'CallExpression', callee: { type: 'Identifier', name: 'jest' }, arguments: [] } })

      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({ type: 'AssignmentExpression', left: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } } })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      expect(() => visitor.AssignmentExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with non-MemberExpression left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'ObjectPattern' },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with ArrayPattern left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'ArrayPattern' },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when right side callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'jest' },
          arguments: [],
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when callee object is not jest', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'notJest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when callee property is not fn', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'mock' },
          },
          arguments: [],
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where right is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: { type: 'Identifier', name: 'jestFn' },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where left is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: null,
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: null,
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for different node types', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'test' }, arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested member on left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createNestedMemberJestFnAssignment(1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle right side with multiple arguments to jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [
            { type: 'ArrowFunctionExpression', body: { type: 'Literal', value: 42 } },
            { type: 'ObjectExpression', properties: [] },
          ],
        },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('state isolation between visitors', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = preferSpyOnRule.create(ctx1)
      const visitor2 = preferSpyOnRule.create(ctx2)

      visitor1.AssignmentExpression(createMemberJestFnAssignment())
      visitor2.AssignmentExpression(createIdentifierJestFnAssignment())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'a', 1, 0))
      visitor.AssignmentExpression(createIdentifierJestFnAssignment('mock', 2, 0))
      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'b', 3, 0))
      visitor.AssignmentExpression(createMemberOtherFnAssignment('obj', 'c', 4, 0))
      visitor.AssignmentExpression(createThisJestFnAssignment('d', 5, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('additional valid patterns — no reports', () => {
    test('should not report obj.method = jest.fn reference (not a call)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'jest' },
          property: { type: 'Identifier', name: 'fn' },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method = someVar where someVar holds jest.fn', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: { type: 'Identifier', name: 'mockFn' },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method = 42 (literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: { type: 'Literal', value: 42 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method = null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: { type: 'Literal', value: null },
      })

      expect(reports.length).toBe(0)
    })

    test('should report window.fetch = jest.fn() — window is still a member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('window', 'fetch'))

      expect(reports.length).toBe(1)
    })

    test('should handle callee object that is a MemberExpression (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'jest' },
            },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(preferSpyOnRule).toBeDefined()
      expect(preferSpyOnRule.meta).toBeDefined()
      expect(preferSpyOnRule.create).toBeDefined()
    })
  })

  describe('deeply nested member expressions on left', () => {
    test('should report obj.a.b.c = jest.fn() with 4-level nesting', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'a' },
            },
            property: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'c' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report MyClass.prototype.method = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'MyClass' },
            property: { type: 'Identifier', name: 'prototype' },
          },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
        loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 40 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report computed member obj["method"] = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'method' },
          computed: true,
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
        loc: { start: { line: 7, column: 4 }, end: { line: 7, column: 32 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report console.log = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('console', 'log'))

      expect(reports.length).toBe(1)
    })

    test('should report document.getElementById = jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('document', 'getElementById'))

      expect(reports.length).toBe(1)
    })
  })

  describe('jest.fn with various arguments', () => {
    test('should report obj.method = jest.fn() with async function implementation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [
            { type: 'ArrowFunctionExpression', async: true, body: { type: 'Literal', value: 42 } },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should not report obj.method = jest.fn().mockReturnValue(true) — chained call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'jest' },
                property: { type: 'Identifier', name: 'fn' },
              },
              arguments: [],
            },
            property: { type: 'Identifier', name: 'mockReturnValue' },
          },
          arguments: [{ type: 'Literal', value: true }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('other compound operators — no reports', () => {
    test('should not report obj.method -= jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '-=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method *= jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '*=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method /= jest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '/=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('non-jest object names — no reports', () => {
    test('should not report obj.method = asyncJest.fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'asyncJest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('non-AssignmentExpression node types — no reports', () => {
    test('should not report for CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'jest' },
          property: { type: 'Identifier', name: 'fn' },
        },
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for MemberExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'method' },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('report location accuracy', () => {
    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'method', 12, 5))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report separate locations for three sequential violations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)
      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'a', 1, 0))
      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'b', 20, 4))
      visitor.AssignmentExpression(createMemberJestFnAssignment('obj', 'c', 30, 8))
      expect(reports).toHaveLength(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[1].loc?.start.column).toBe(4)
      expect(reports[2].loc?.start.line).toBe(30)
      expect(reports[2].loc?.start.column).toBe(8)
    })
  })

  describe('additional coverage', () => {
    test('should report obj.method = jest.fn() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } },
        right: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'jest' }, property: { type: 'Identifier', name: 'fn' } }, arguments: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('should not report obj.method = jest.fn (not a call)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } },
        right: { type: 'MemberExpression', object: { type: 'Identifier', name: 'jest' }, property: { type: 'Identifier', name: 'fn' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should report when operator is non-string number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: 42,
        left: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } },
        right: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'jest' }, property: { type: 'Identifier', name: 'fn' } }, arguments: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('should report when operator is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: null,
        left: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } },
        right: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'jest' }, property: { type: 'Identifier', name: 'fn' } }, arguments: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports).toHaveLength(1)
    })
  })

  describe('additional verification', () => {
    test('should have create as a function', () => {
      expect(typeof preferSpyOnRule.create).toBe('function')
    })
  })

  describe('callee edge cases — no reports', () => {
    test('should not report obj.method = jest["fn"]() — computed member access', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Literal', value: 'fn' },
            computed: true,
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method = Jest.fn() — case-sensitive object name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method = this.fn() — ThisExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report obj[dynamicKey] = jest.fn() — computed member on left with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'dynamicKey' },
          computed: true,
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should not report obj.method = jest.fn() with empty string operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpyOnRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'jest' },
            property: { type: 'Identifier', name: 'fn' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })
  })
})
