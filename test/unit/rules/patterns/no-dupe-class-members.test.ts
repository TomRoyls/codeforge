import { describe, test, expect, vi } from 'vitest'
import { noDupeClassMembersRule } from '../../../../src/rules/patterns/no-dupe-class-members.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'class A { foo() {} foo() {} }',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [] },
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

function createClassBodyWithDuplicateMethods(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'foo' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'foo' },
        kind: 'method',
        static: false,
        loc: { start: { line, column }, end: { line, column: column + 5 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassBodyWithUniqueMethods(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'foo' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'bar' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassBodyWithDuplicateGetters(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'value' },
        kind: 'get',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'value' },
        kind: 'get',
        static: false,
        loc: { start: { line, column }, end: { line, column: column + 5 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassBodyWithDuplicateSetters(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'value' },
        kind: 'set',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'value' },
        kind: 'set',
        static: false,
        loc: { start: { line, column }, end: { line, column: column + 5 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassBodyWithStaticAndInstanceSameName(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'foo' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'foo' },
        kind: 'method',
        static: true,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassBodyWithDuplicateStaticMethods(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'bar' },
        kind: 'method',
        static: true,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'bar' },
        kind: 'method',
        static: true,
        loc: { start: { line, column }, end: { line, column: column + 5 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassBodyWithDuplicateProperties(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'x' },
        kind: 'field',
        static: false,
        value: { type: 'Literal', value: 1 },
      },
      {
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'x' },
        kind: 'field',
        static: false,
        loc: { start: { line, column }, end: { line, column: column + 5 } },
        value: { type: 'Literal', value: 2 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassBodyWithGetterAndSetterSameName(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'value' },
        kind: 'get',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'value' },
        kind: 'set',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassBodyWithLiteralKeyDuplicate(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: 'methodName' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: 'methodName' },
        kind: 'method',
        static: false,
        loc: { start: { line, column }, end: { line, column: column + 5 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassBodyWithNumericKeyDuplicate(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: 1 },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: 1 },
        kind: 'method',
        static: false,
        loc: { start: { line, column }, end: { line, column: column + 5 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createEmptyClassBody(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

function createClassBodyWithNonMethodMembers(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'ClassProperty',
        key: { type: 'Identifier', name: 'x' },
        value: { type: 'Literal', value: 1 },
      },
      {
        type: 'ClassPrivateMethod',
        key: { type: 'PrivateIdentifier', name: '#privateMethod' },
        kind: 'method',
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createNonClassBody(): unknown {
  return {
    type: 'BlockStatement',
    body: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 2 },
    },
  }
}

function createClassBodyWithMethodAndConstructor(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'constructor' },
        kind: 'constructor',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'foo' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassBodyWithThreeDuplicates(line = 1, column = 0): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'dup' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'dup' },
        kind: 'method',
        static: false,
        loc: { start: { line, column }, end: { line, column: column + 5 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'dup' },
        kind: 'method',
        static: false,
        loc: { start: { line, column: column + 10 }, end: { line, column: column + 15 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassBodyWithoutLoc(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'foo' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'foo' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
  }
}

describe('no-dupe-class-members rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDupeClassMembersRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDupeClassMembersRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDupeClassMembersRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDupeClassMembersRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention duplicate class members in description', () => {
      expect(noDupeClassMembersRule.meta.docs?.description.toLowerCase()).toContain('duplicate')
      expect(noDupeClassMembersRule.meta.docs?.description.toLowerCase()).toContain('class')
    })

    test('should have empty schema array', () => {
      expect(noDupeClassMembersRule.meta.schema).toEqual([])
    })

    test('should have undefined fixable', () => {
      expect(noDupeClassMembersRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with ClassBody method', () => {
      const { context } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(visitor).toHaveProperty('ClassBody')
      expect(typeof visitor.ClassBody).toBe('function')
    })
  })

  describe('detecting duplicate methods', () => {
    test('should report duplicate instance methods with same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Duplicate class member')
      expect(reports[0].message).toContain("'foo'")
    })

    test('should not report unique instance methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithUniqueMethods())

      expect(reports.length).toBe(0)
    })

    test('should report duplicate static methods with same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateStaticMethods())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'bar'")
    })

    test('should report duplicate getters', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateGetters())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'value'")
    })

    test('should report duplicate setters', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateSetters())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'value'")
    })

    test('should report duplicate properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateProperties())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'x'")
    })

    test('should report duplicate methods with literal string key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithLiteralKeyDuplicate())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('methodName')
    })

    test('should report duplicate methods with numeric key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithNumericKeyDuplicate())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('1')
    })
  })

  describe('static vs instance members', () => {
    test('should not report static and instance with same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithStaticAndInstanceSameName())

      expect(reports.length).toBe(0)
    })

    test('should not report getter and setter with same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithGetterAndSetterSameName())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(undefined)).not.toThrow()
    })

    test('should handle non-ClassBody gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(createNonClassBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty class body', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createEmptyClassBody())

      expect(reports.length).toBe(0)
    })

    test('should handle class body without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(createClassBodyWithoutLoc())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle class body with non-method members', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithNonMethodMembers())

      expect(reports.length).toBe(0)
    })

    test('should report correct location for duplicate', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report multiple duplicates (three duplicates)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithThreeDuplicates())

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('dup')
      expect(reports[1].message).toContain('dup')
    })

    test('should not report constructor and method with same name (if allowed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithMethodAndConstructor())

      expect(reports.length).toBe(0)
    })
  })
})
