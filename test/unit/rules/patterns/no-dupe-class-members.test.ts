import { describe, test, expect } from 'vitest'
import { noDupeClassMembersRule } from '../../../../src/rules/patterns/no-dupe-class-members.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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

function createClassBodyWithNDuplicates(n: number, name = 'dup'): unknown {
  const body: unknown[] = []
  for (let i = 0; i < n; i++) {
    body.push({
      type: 'MethodDefinition',
      key: { type: 'Identifier', name },
      kind: 'method',
      static: false,
      loc: { start: { line: 1, column: i * 5 }, end: { line: 1, column: i * 5 + 4 } },
      value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
    })
  }
  return {
    type: 'ClassBody',
    body,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: n * 5 } },
  }
}

function createClassBodyWithMixedDuplicates(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'alpha' },
        kind: 'method',
        static: false,
        loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 8 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'alpha' },
        kind: 'method',
        static: false,
        loc: { start: { line: 5, column: 4 }, end: { line: 5, column: 8 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'beta' },
        kind: 'method',
        static: false,
        loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 8 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'beta' },
        kind: 'method',
        static: false,
        loc: { start: { line: 7, column: 4 }, end: { line: 7, column: 8 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'gamma' },
        kind: 'field',
        static: false,
        loc: { start: { line: 4, column: 4 }, end: { line: 4, column: 8 } },
        value: { type: 'Literal', value: 1 },
      },
      {
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'gamma' },
        kind: 'field',
        static: false,
        loc: { start: { line: 9, column: 4 }, end: { line: 9, column: 8 } },
        value: { type: 'Literal', value: 2 },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 10, column: 1 } },
  }
}

function createClassBodyWithComputedKey(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'iterator' },
          computed: false,
        },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'iterator' },
          computed: false,
        },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithStaticGetterAndInstanceMethod(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'size' },
        kind: 'get',
        static: true,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'size' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithStaticSetterAndInstanceMethod(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'size' },
        kind: 'set',
        static: true,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'size' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithDuplicateStaticGetters(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'instance' },
        kind: 'get',
        static: true,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'instance' },
        kind: 'get',
        static: true,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithDuplicateStaticSetters(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'config' },
        kind: 'set',
        static: true,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'config' },
        kind: 'set',
        static: true,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithDuplicateStaticProperties(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'count' },
        kind: 'field',
        static: true,
        value: { type: 'Literal', value: 0 },
      },
      {
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'count' },
        kind: 'field',
        static: true,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
        value: { type: 'Literal', value: 1 },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithMethodKindUndefined(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'test' },
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'test' },
        static: false,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithStaticGetterAndSetterSameName(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'value' },
        kind: 'get',
        static: true,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'value' },
        kind: 'set',
        static: true,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithPartialLoc(): unknown {
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
        loc: { start: { line: 3 }, end: { line: 3, column: 10 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
  }
}

function createClassBodyWithNonStandardLoc(): unknown {
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
        loc: { start: { line: '2' as unknown as number, column: 0 }, end: { line: 2, column: 5 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
  }
}

function createClassBodyWithBooleanKey(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: true },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: true },
        kind: 'method',
        static: false,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithNullKey(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: null,
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: null,
        kind: 'method',
        static: false,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithEmptyBodyArray(): unknown {
  return {
    type: 'ClassBody',
    body: [],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
  }
}

function createClassBodyWithSingleMethod(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'only' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
  }
}

function createClassBodyWithMethodAndFieldSameName(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'prop' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: 'prop' },
        kind: 'field',
        static: false,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
        value: { type: 'Literal', value: 42 },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithBodyNotArray(): unknown {
  return {
    type: 'ClassBody',
    body: 'not an array',
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
  }
}

function createClassBodyWithUndefinedBody(): unknown {
  return {
    type: 'ClassBody',
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
  }
}

function createClassBodyWithDifferentNumericKeys(): unknown {
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
        key: { type: 'Literal', value: 2 },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithZeroKey(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: 0 },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: 0 },
        kind: 'method',
        static: false,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithNegativeNumericKey(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: -1 },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: -1 },
        kind: 'method',
        static: false,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithDuplicateConstructors(): unknown {
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
        key: { type: 'Identifier', name: 'constructor' },
        kind: 'constructor',
        static: false,
        loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 8 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
  }
}

function createClassBodyWithDuplicateStringKeys(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: 'my-method' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: 'my-method' },
        kind: 'method',
        static: false,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 15 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithEmptyStringKey(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: '' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: '' },
        kind: 'method',
        static: false,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createClassBodyWithIdentifierAndLiteralSameValue(): unknown {
  return {
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'test' },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
      {
        type: 'MethodDefinition',
        key: { type: 'Literal', value: 'test' },
        kind: 'method',
        static: false,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
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

    test('should have meta as an object', () => {
      expect(typeof noDupeClassMembersRule.meta).toBe('object')
      expect(noDupeClassMembersRule.meta).not.toBeNull()
    })

    test('should have docs property', () => {
      expect(noDupeClassMembersRule.meta.docs).toBeDefined()
      expect(typeof noDupeClassMembersRule.meta.docs).toBe('object')
    })

    test('should have docs.description as string', () => {
      expect(typeof noDupeClassMembersRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty docs.description', () => {
      expect(noDupeClassMembersRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should not be deprecated', () => {
      expect(noDupeClassMembersRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noDupeClassMembersRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noDupeClassMembersRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have type that is a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noDupeClassMembersRule.meta.type)
    })

    test('should have severity that is a valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noDupeClassMembersRule.meta.severity)
    })

    test('should have exact description text', () => {
      expect(noDupeClassMembersRule.meta.docs?.description).toBe(
        'Disallow duplicate class members.',
      )
    })
  })

  describe('create', () => {
    test('should return visitor with ClassBody method', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(visitor).toHaveProperty('ClassBody')
      expect(typeof visitor.ClassBody).toBe('function')
    })

    test('should return object from create', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should create new visitor on each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noDupeClassMembersRule.create(context)
      const visitor2 = noDupeClassMembersRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should have create as a function', () => {
      expect(typeof noDupeClassMembersRule.create).toBe('function')
    })

    test('should return visitor with only ClassBody key', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(Object.keys(visitor)).toEqual(['ClassBody'])
    })

    test('should accept context parameter without error', () => {
      const { context } = createMockRuleContext()
      expect(() => noDupeClassMembersRule.create(context)).not.toThrow()
    })
  })

  describe('detecting duplicate methods', () => {
    test('should report duplicate instance methods with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Duplicate class member')
      expect(reports[0].message).toContain("'foo'")
    })

    test('should not report unique instance methods', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithUniqueMethods())

      expect(reports.length).toBe(0)
    })

    test('should report duplicate static methods with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateStaticMethods())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'bar'")
    })

    test('should report duplicate getters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateGetters())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'value'")
    })

    test('should report duplicate setters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateSetters())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'value'")
    })

    test('should report duplicate properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateProperties())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'x'")
    })

    test('should report duplicate methods with literal string key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithLiteralKeyDuplicate())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('methodName')
    })

    test('should report duplicate methods with numeric key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithNumericKeyDuplicate())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('1')
    })

    test('should report duplicate constructors', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateConstructors())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('constructor')
    })

    test('should report duplicate methods with string literal key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateStringKeys())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('my-method')
    })

    test('should not report duplicate methods with empty string key (falsy key is skipped)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithEmptyStringKey())

      expect(reports.length).toBe(0)
    })

    test('should report duplicate static getters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateStaticGetters())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('instance')
    })

    test('should report duplicate static setters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateStaticSetters())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('config')
    })

    test('should report duplicate static properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateStaticProperties())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('count')
    })

    test('should report duplicate when kind is undefined (defaults to method)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithMethodKindUndefined())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test')
    })

    test('should report duplicate methods with zero numeric key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithZeroKey())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0')
    })

    test('should report duplicate methods with negative numeric key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithNegativeNumericKey())

      expect(reports.length).toBe(1)
    })

    test('should report when identifier and literal have same string value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithIdentifierAndLiteralSameValue())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test')
    })

    test('should not report method and field with same name (different kind signatures)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithMethodAndFieldSameName())

      expect(reports.length).toBe(0)
    })
  })

  describe('static vs instance members', () => {
    test('should not report static and instance with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithStaticAndInstanceSameName())

      expect(reports.length).toBe(0)
    })

    test('should not report getter and setter with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithGetterAndSetterSameName())

      expect(reports.length).toBe(0)
    })

    test('should not report static getter and instance method with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithStaticGetterAndInstanceMethod())

      expect(reports.length).toBe(0)
    })

    test('should not report static setter and instance method with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithStaticSetterAndInstanceMethod())

      expect(reports.length).toBe(0)
    })

    test('should not report static getter and setter with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithStaticGetterAndSetterSameName())

      expect(reports.length).toBe(0)
    })

    test('should not report constructor and method with same name (if allowed)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithMethodAndConstructor())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(undefined)).not.toThrow()
    })

    test('should handle non-ClassBody gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(createNonClassBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty class body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createEmptyClassBody())

      expect(reports.length).toBe(0)
    })

    test('should handle class body without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(createClassBodyWithoutLoc())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle class body with non-method members', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithNonMethodMembers())

      expect(reports.length).toBe(0)
    })

    test('should handle class body with body not an array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(createClassBodyWithBodyNotArray())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle class body with undefined body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(createClassBodyWithUndefinedBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle class body with single method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithSingleMethod())

      expect(reports.length).toBe(0)
    })

    test('should handle class body with computed key (MemberExpression)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithComputedKey())

      expect(reports.length).toBe(0)
    })

    test('should handle class body with boolean key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(createClassBodyWithBooleanKey())).not.toThrow()
    })

    test('should handle class body with null key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(createClassBodyWithNullKey())).not.toThrow()
    })

    test('should handle string node instead of object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody('not an object')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node instead of object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node instead of object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty body array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithEmptyBodyArray())

      expect(reports.length).toBe(0)
    })

    test('should handle different numeric keys without reporting', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDifferentNumericKeys())

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for duplicate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report end location for duplicate', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods(3, 5))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should use default location when loc is missing on node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithoutLoc())

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at high line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods(999, 0))

      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should handle location at high column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods(1, 80))

      expect(reports[0].loc?.start.column).toBe(80)
    })

    test('should handle partial loc (missing column in start)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithPartialLoc())

      expect(reports[0].loc).toBeDefined()
    })

    test('should handle non-standard loc (string instead of number)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithNonStandardLoc())

      expect(reports[0].loc).toBeDefined()
    })

    test('should report location of duplicate node not first occurrence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods(7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('message content', () => {
    test('should contain Duplicate class member in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports[0].message).toContain('Duplicate class member')
    })

    test('should contain member name in single quotes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports[0].message).toContain("'foo'")
    })

    test('should end with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should have consistent message for getter duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateGetters())

      expect(reports[0].message).toContain('Duplicate class member')
      expect(reports[0].message).toContain("'value'")
    })

    test('should have consistent message for setter duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateSetters())

      expect(reports[0].message).toContain('Duplicate class member')
      expect(reports[0].message).toContain("'value'")
    })

    test('should have consistent message for property duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateProperties())

      expect(reports[0].message).toContain('Duplicate class member')
      expect(reports[0].message).toContain("'x'")
    })

    test('should have consistent message for static method duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateStaticMethods())

      expect(reports[0].message).toContain('Duplicate class member')
      expect(reports[0].message).toContain("'bar'")
    })

    test('should have exact message format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports[0].message).toBe("Duplicate class member 'foo'.")
    })
  })

  describe('multiple reports', () => {
    test('should report multiple duplicates (three duplicates)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithThreeDuplicates())

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('dup')
      expect(reports[1].message).toContain('dup')
    })

    test('should report 4 duplicates from 5 same-named methods', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithNDuplicates(5))

      expect(reports.length).toBe(4)
    })

    test('should report 9 duplicates from 10 same-named methods', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithNDuplicates(10))

      expect(reports.length).toBe(9)
    })

    test('should report 49 duplicates from 50 same-named methods', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithNDuplicates(50))

      expect(reports.length).toBe(49)
    })

    test('should report all duplicates with correct name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithNDuplicates(5))

      for (const report of reports) {
        expect(report.message).toContain('dup')
      }
    })

    test('should report mixed duplicate pairs independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithMixedDuplicates())

      expect(reports.length).toBe(3)
    })

    test('should report each duplicate in mixed scenario with correct name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithMixedDuplicates())

      const messages = reports.map((r) => r.message)
      const alphaCount = messages.filter((m) => m.includes('alpha')).length
      const betaCount = messages.filter((m) => m.includes('beta')).length
      const gammaCount = messages.filter((m) => m.includes('gamma')).length
      expect(alphaCount).toBe(1)
      expect(betaCount).toBe(1)
      expect(gammaCount).toBe(1)
    })

    test('should not report when only 1 occurrence exists for multiple names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'b' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'c' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ClassBody(classBody)

      expect(reports.length).toBe(0)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/other/project/src/utils.ts',
      })
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockRuleContext({
        source: 'class B { bar() {} bar() {} }',
      })
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports.length).toBe(1)
    })

    test('should work with custom options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowSameStatic: true }] })
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports.length).toBe(1)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockRuleContext({ options: [] })
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports.length).toBe(1)
    })

    test('should work with windows-style file path', () => {
      const { context, reports } = createMockRuleContext({
        filePath: 'C:\\Users\\dev\\project\\src\\file.ts',
      })
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports.length).toBe(1)
    })

    test('should work with nested directory file path', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/deep/nested/dir/structure/file.ts',
      })
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())

      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should export rule as named export', () => {
      expect(noDupeClassMembersRule).toBeDefined()
      expect(typeof noDupeClassMembersRule).toBe('object')
    })

    test('should have meta property on export', () => {
      expect(noDupeClassMembersRule.meta).toBeDefined()
    })

    test('should have create method on export', () => {
      expect(noDupeClassMembersRule.create).toBeDefined()
      expect(typeof noDupeClassMembersRule.create).toBe('function')
    })

    test('should export valid RuleDefinition shape', () => {
      expect(noDupeClassMembersRule).toHaveProperty('meta')
      expect(noDupeClassMembersRule).toHaveProperty('create')
      expect(Object.keys(noDupeClassMembersRule).sort()).toEqual(['create', 'meta'])
    })
  })

  describe('visitor independence', () => {
    test('separate visitors should not share reports', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = noDupeClassMembersRule.create(ctx1.context)
      const visitor2 = noDupeClassMembersRule.create(ctx2.context)

      visitor1.ClassBody(createClassBodyWithDuplicateMethods())
      visitor2.ClassBody(createClassBodyWithUniqueMethods())

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(0)
    })

    test('separate visitors with same data should each report independently', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = noDupeClassMembersRule.create(ctx1.context)
      const visitor2 = noDupeClassMembersRule.create(ctx2.context)

      visitor1.ClassBody(createClassBodyWithDuplicateMethods())
      visitor2.ClassBody(createClassBodyWithDuplicateMethods())

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(1)
    })

    test('calling ClassBody multiple times on same visitor resets state', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())
      expect(reports.length).toBe(1)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())
      expect(reports.length).toBe(2)
    })

    test('calling ClassBody on different class bodies with same visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithUniqueMethods())
      expect(reports.length).toBe(0)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())
      expect(reports.length).toBe(1)
    })

    test('visitor does not accumulate seen state across calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithUniqueMethods())
      expect(reports.length).toBe(0)

      visitor.ClassBody(createClassBodyWithDuplicateMethods())
      expect(reports.length).toBe(1)
    })
  })

  describe('various node shapes and structures', () => {
    test('should handle member with missing static field', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'test' },
            kind: 'method',
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'test' },
            kind: 'method',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle member with missing kind field', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'noKind' },
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'noKind' },
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle member with missing key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle member with empty object key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: {},
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: {},
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle body with null members', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [null, null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ClassBody(classBody)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body with undefined members', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [undefined, undefined],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ClassBody(classBody)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member with string key type (not Identifier/Literal)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'JSXIdentifier', name: 'render' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'JSXIdentifier', name: 'render' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle member with TemplateLiteral key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'TemplateLiteral', quasis: [], expressions: [] },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'TemplateLiteral', quasis: [], expressions: [] },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle PropertyDefinition type as valid member', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateProperties())

      expect(reports.length).toBe(1)
    })

    test('should handle member with static as truthy non-boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'foo' },
            kind: 'method',
            static: 1,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'foo' },
            kind: 'method',
            static: 1,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle member with static as string "true"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'foo' },
            kind: 'method',
            static: 'true',
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'foo' },
            kind: 'method',
            static: 'true',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })
  })

  describe('safe cases - test.each non-matching', () => {
    test.each([
      {
        name: 'empty class body',
        node: {
          type: 'ClassBody',
          body: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        },
      },
      {
        name: 'single method',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              key: { type: 'Identifier', name: 'only' },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      },
      {
        name: 'unique methods foo and bar',
        node: {
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
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'static and instance same name',
        node: {
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
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'getter and setter same name',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              key: { type: 'Identifier', name: 'v' },
              kind: 'get',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
            {
              type: 'MethodDefinition',
              key: { type: 'Identifier', name: 'v' },
              kind: 'set',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'non-ClassBody type',
        node: {
          type: 'FunctionDeclaration',
          body: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        },
      },
      {
        name: 'body not array',
        node: {
          type: 'ClassBody',
          body: 'string',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        },
      },
      { name: 'null node', node: null },
      { name: 'undefined node', node: undefined },
      { name: 'string node', node: 'string' },
      { name: 'number node', node: 42 },
      { name: 'boolean node', node: true },
      { name: 'empty object', node: {} },
      { name: 'array node', node: [] },
    ])('should not report for $name', ({ node }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('detection cases - test.each matching', () => {
    test.each([
      {
        name: 'duplicate methods named foo',
        key: { type: 'Identifier', name: 'foo' },
        kind: 'method',
        static: false,
        expected: 'foo',
      },
      {
        name: 'duplicate methods named bar',
        key: { type: 'Identifier', name: 'bar' },
        kind: 'method',
        static: false,
        expected: 'bar',
      },
      {
        name: 'duplicate methods named baz',
        key: { type: 'Identifier', name: 'baz' },
        kind: 'method',
        static: false,
        expected: 'baz',
      },
      {
        name: 'duplicate methods named render',
        key: { type: 'Identifier', name: 'render' },
        kind: 'method',
        static: false,
        expected: 'render',
      },
      {
        name: 'duplicate methods named handleClick',
        key: { type: 'Identifier', name: 'handleClick' },
        kind: 'method',
        static: false,
        expected: 'handleClick',
      },
      {
        name: 'duplicate getters named value',
        key: { type: 'Identifier', name: 'value' },
        kind: 'get',
        static: false,
        expected: 'value',
      },
      {
        name: 'duplicate getters named name',
        key: { type: 'Identifier', name: 'name' },
        kind: 'get',
        static: false,
        expected: 'name',
      },
      {
        name: 'duplicate setters named value',
        key: { type: 'Identifier', name: 'value' },
        kind: 'set',
        static: false,
        expected: 'value',
      },
      {
        name: 'duplicate setters named name',
        key: { type: 'Identifier', name: 'name' },
        kind: 'set',
        static: false,
        expected: 'name',
      },
      {
        name: 'duplicate static methods named create',
        key: { type: 'Identifier', name: 'create' },
        kind: 'method',
        static: true,
        expected: 'create',
      },
      {
        name: 'duplicate static methods named from',
        key: { type: 'Identifier', name: 'from' },
        kind: 'method',
        static: true,
        expected: 'from',
      },
      {
        name: 'duplicate methods with literal key',
        key: { type: 'Literal', value: 'litKey' },
        kind: 'method',
        static: false,
        expected: 'litKey',
      },
      {
        name: 'duplicate methods with numeric key 42',
        key: { type: 'Literal', value: 42 },
        kind: 'method',
        static: false,
        expected: '42',
      },
      {
        name: 'duplicate methods with numeric key 100',
        key: { type: 'Literal', value: 100 },
        kind: 'method',
        static: false,
        expected: '100',
      },
      {
        name: 'duplicate properties named prop',
        key: { type: 'Identifier', name: 'prop' },
        kind: 'field',
        static: false,
        expected: 'prop',
      },
      {
        name: 'duplicate properties named data',
        key: { type: 'Identifier', name: 'data' },
        kind: 'field',
        static: false,
        expected: 'data',
      },
      {
        name: 'duplicate methods named init',
        key: { type: 'Identifier', name: 'init' },
        kind: 'method',
        static: false,
        expected: 'init',
      },
      {
        name: 'duplicate methods named destroy',
        key: { type: 'Identifier', name: 'destroy' },
        kind: 'method',
        static: false,
        expected: 'destroy',
      },
      {
        name: 'duplicate methods named toString',
        key: { type: 'Identifier', name: 'toString' },
        kind: 'method',
        static: false,
        expected: 'toString',
      },
      {
        name: 'duplicate methods named valueOf',
        key: { type: 'Identifier', name: 'valueOf' },
        kind: 'method',
        static: false,
        expected: 'valueOf',
      },
    ])('should report for $name', ({ key, kind, static: isStatic, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key,
            kind,
            static: isStatic,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key,
            kind,
            static: isStatic,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(expected)
    })
  })

  describe('signature generation', () => {
    test('should distinguish getter from method with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'size' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'size' },
            kind: 'get',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should distinguish setter from method with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'size' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'size' },
            kind: 'set',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should distinguish constructor from method with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'foo' },
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
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should distinguish static getter from instance getter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'val' },
            kind: 'get',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'val' },
            kind: 'get',
            static: true,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should distinguish static setter from instance setter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'val' },
            kind: 'set',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'val' },
            kind: 'set',
            static: true,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should distinguish field from method with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'x' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'x' },
            kind: 'field',
            static: false,
            value: { type: 'Literal', value: 1 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })
  })

  describe('location edge cases', () => {
    test('should handle loc with missing end property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            loc: { start: { line: 2, column: 0 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle loc with missing start property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            loc: { end: { line: 2, column: 5 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            loc: { start: null, end: { line: 2, column: 5 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with zero values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'zero' },
            kind: 'method',
            static: false,
            loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'zero' },
            kind: 'method',
            static: false,
            loc: { start: { line: 0, column: 1 }, end: { line: 0, column: 5 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 10 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(1)
    })
  })

  describe('complex class body structures', () => {
    test('should handle class with many unique methods and one duplicate pair', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const uniqueMethods = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((name) => ({
        type: 'MethodDefinition',
        key: { type: 'Identifier', name },
        kind: 'method' as const,
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      }))

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          ...uniqueMethods,
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'dupMethod' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'dupMethod' },
            kind: 'method',
            static: false,
            loc: { start: { line: 15, column: 4 }, end: { line: 15, column: 8 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 20, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('dupMethod')
    })

    test('should handle class with multiple duplicate pairs of different names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const makeMethod = (name: string) => ({
        type: 'MethodDefinition',
        key: { type: 'Identifier', name },
        kind: 'method' as const,
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      })

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          makeMethod('dup1'),
          makeMethod('dup1'),
          makeMethod('unique1'),
          makeMethod('dup2'),
          makeMethod('dup2'),
          makeMethod('unique2'),
          makeMethod('dup3'),
          makeMethod('dup3'),
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 10, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(3)
    })

    test('should correctly handle interleaved duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const makeMethod = (name: string, line: number) => ({
        type: 'MethodDefinition',
        key: { type: 'Identifier', name },
        kind: 'method' as const,
        static: false,
        loc: { start: { line, column: 4 }, end: { line, column: 8 } },
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      })

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          makeMethod('alpha', 2),
          makeMethod('beta', 3),
          makeMethod('alpha', 4),
          makeMethod('gamma', 5),
          makeMethod('beta', 6),
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 7, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(2)
    })

    test('should handle class with PropertyDefinition and MethodDefinition of same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'x' },
            static: false,
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'x' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle large number of unique members without issue', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const body = Array.from({ length: 100 }, (_, i) => ({
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: `method${i}` },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      }))

      const classBody: unknown = {
        type: 'ClassBody',
        body,
        loc: { start: { line: 1, column: 0 }, end: { line: 100, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle mixed PropertyDefinition and MethodDefinition unique', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'propA' },
            kind: 'field',
            static: false,
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'methodA' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })
  })

  describe('additional node shape variations', () => {
    test('should handle node with numeric key as float', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 1.5 },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 1.5 },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should not report when key value is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: null },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: null },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should not report when key value is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle node with string numeric key "1"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '1' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 1 },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle Identifier key with numeric-like name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'method1' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'method1' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle long method names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const longName = 'a'.repeat(100)
      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: longName },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: longName },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longName)
    })

    test('should handle method name with underscore', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: '_private' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: '_private' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_private')
    })

    test('should handle method name with dollar sign', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: '$jquery' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: '$jquery' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$jquery')
    })

    test('should handle method name with unicode', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'méthode' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'méthode' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('méthode')
    })

    test('should handle method name with emoji in string key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '🚀' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '🚀' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('🚀')
    })

    test('should handle member with extra unknown properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'extra' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            extraProp: true,
            anotherProp: 'value',
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'extra' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            extraProp: false,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle member with computed: true on key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'computed' },
            kind: 'method',
            static: false,
            computed: true,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'computed' },
            kind: 'method',
            static: false,
            computed: true,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle node type that is neither MethodDefinition nor PropertyDefinition', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          { type: 'StaticBlock', body: [] },
          {
            type: 'TSAbstractMethodDefinition',
            key: { type: 'Identifier', name: 'abs' },
            kind: 'method',
            static: false,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle literal key with large number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 999999 },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 999999 },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('999999')
    })

    test('should handle literal key with space in string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 'has space' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 'has space' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('has space')
    })

    test('should handle literal key with special regex characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '.*+?^${}()|[]\\' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '.*+?^${}()|[]\\' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should not report when body contains only PropertyDefinition with unique names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
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
            key: { type: 'Identifier', name: 'y' },
            kind: 'field',
            static: false,
            value: { type: 'Literal', value: 2 },
          },
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'z' },
            kind: 'field',
            static: false,
            value: { type: 'Literal', value: 3 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should report duplicate PropertyDefinition with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'z' },
            kind: 'field',
            static: false,
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'z' },
            kind: 'field',
            static: false,
            loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 8 } },
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('z')
    })

    test('should handle static field and instance field with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'count' },
            kind: 'field',
            static: false,
            value: { type: 'Literal', value: 0 },
          },
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'count' },
            kind: 'field',
            static: true,
            value: { type: 'Literal', value: 0 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle PropertyDefinition without kind field', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'noKind' },
            static: false,
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'noKind' },
            static: false,
            loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 8 } },
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle MethodDefinition with accessor getter kind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'acc' },
            kind: 'get',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'acc' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle MethodDefinition with accessor setter kind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'acc' },
            kind: 'set',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'acc' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should report tripled methods reporting 2 issues', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'triple' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'triple' },
            kind: 'method',
            static: false,
            loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 8 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'triple' },
            kind: 'method',
            static: false,
            loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 8 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 4, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(2)
    })

    test('should handle location with very large line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods(99999, 0))

      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle location with very large column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithDuplicateMethods(1, 99999))

      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should return default loc end column 0 when end column is missing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            loc: { start: { line: 2, column: 4 }, end: { line: 2 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle member where static is explicitly false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 's' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 's' },
            kind: 'method',
            static: false,
            loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 8 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle mixed: duplicate + getter/setter pair on different names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
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
            loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 8 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'gs' },
            kind: 'get',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'gs' },
            kind: 'set',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('dup')
    })

    test('should handle five different duplicate pairs', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const names = ['a', 'b', 'c', 'd', 'e']
      const body: unknown[] = []
      for (const name of names) {
        body.push({
          type: 'MethodDefinition',
          key: { type: 'Identifier', name },
          kind: 'method',
          static: false,
          value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        })
        body.push({
          type: 'MethodDefinition',
          key: { type: 'Identifier', name },
          kind: 'method',
          static: false,
          loc: {
            start: { line: 1, column: body.length * 5 },
            end: { line: 1, column: body.length * 5 + 4 },
          },
          value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        })
      }

      const classBody: unknown = {
        type: 'ClassBody',
        body,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(5)
    })

    test('should handle member with key being array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: ['not', 'valid'],
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: ['not', 'valid'],
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle member with key being number primitive', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: 42,
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: 42,
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle class body with only non-array iterable body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle class body type as non-string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 42,
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle create being called many times without error', () => {
      const { context } = createMockRuleContext()
      for (let i = 0; i < 100; i++) {
        const visitor = noDupeClassMembersRule.create(context)
        expect(visitor).toHaveProperty('ClassBody')
      }
    })

    test('should handle loc with NaN values gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'nan' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'nan' },
            kind: 'method',
            static: false,
            loc: { start: { line: NaN, column: NaN }, end: { line: NaN, column: NaN } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      expect(() => visitor.ClassBody(classBody)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with Infinity values gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'inf' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'inf' },
            kind: 'method',
            static: false,
            loc: { start: { line: Infinity, column: 0 }, end: { line: Infinity, column: 5 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      expect(() => visitor.ClassBody(classBody)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(Infinity)
    })
  })

  // ============================================================
  // ADDITIONAL KEY TYPE VARIATIONS
  // ============================================================
  describe('additional key type variations', () => {
    test('should report duplicate methods with string key containing newline', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 'line\nbreak' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 'line\nbreak' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should report duplicate methods with string key containing tab', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 'tab\there' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 'tab\there' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should report duplicate methods with numeric key NaN', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: NaN },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: NaN },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should report duplicate methods with numeric key Infinity', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: Infinity },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: Infinity },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should report when string key and number key resolve to same value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '42' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 42 },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle identifier name that is reserved word', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'class' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'class' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle identifier name that is a keyword', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'function' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'function' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle single character method name duplicates', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'x' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'x' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'x'")
    })

    test('should handle string key with only whitespace', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '   ' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '   ' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle boolean literal key false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: false },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: false },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should report when numeric string key matches number key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '2' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 2 },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // SCALABILITY AND PERFORMANCE TESTS
  // ============================================================
  describe('scalability and performance', () => {
    test('should handle class with 200 unique methods', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const body = Array.from({ length: 200 }, (_, i) => ({
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: `method${i}` },
        kind: 'method',
        static: false,
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
      }))

      const classBody: unknown = {
        type: 'ClassBody',
        body,
        loc: { start: { line: 1, column: 0 }, end: { line: 200, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle class with 200 unique properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const body = Array.from({ length: 200 }, (_, i) => ({
        type: 'PropertyDefinition',
        key: { type: 'Identifier', name: `prop${i}` },
        kind: 'field',
        static: false,
        value: { type: 'Literal', value: i },
      }))

      const classBody: unknown = {
        type: 'ClassBody',
        body,
        loc: { start: { line: 1, column: 0 }, end: { line: 200, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle 20 duplicates in one class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      visitor.ClassBody(createClassBodyWithNDuplicates(20, 'massDup'))

      expect(reports.length).toBe(19)
      for (const report of reports) {
        expect(report.message).toContain('massDup')
      }
    })

    test('should handle class with mixed unique and duplicate at scale', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const body: unknown[] = []
      for (let i = 0; i < 50; i++) {
        body.push({
          type: 'MethodDefinition',
          key: { type: 'Identifier', name: `unique${i}` },
          kind: 'method',
          static: false,
          value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        })
      }
      for (let i = 0; i < 5; i++) {
        body.push({
          type: 'MethodDefinition',
          key: { type: 'Identifier', name: 'repeated' },
          kind: 'method',
          static: false,
          loc: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 4 } },
          value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        })
      }

      const classBody: unknown = {
        type: 'ClassBody',
        body,
        loc: { start: { line: 1, column: 0 }, end: { line: 55, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(4)
    })

    test('should handle create + ClassBody called 100 times', () => {
      const { context } = createMockRuleContext()
      for (let i = 0; i < 100; i++) {
        const visitor = noDupeClassMembersRule.create(context)
        visitor.ClassBody(createClassBodyWithDuplicateMethods())
      }
    })
  })

  // ============================================================
  // SAFE CASES - BATCH 2
  // ============================================================
  describe('safe cases - test.each batch 2 non-matching', () => {
    test.each([
      {
        name: 'two different literal string keys',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: 'a' },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: 'b' },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'static and instance getter same name',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              key: { type: 'Identifier', name: 'v' },
              kind: 'get',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
            {
              type: 'MethodDefinition',
              key: { type: 'Identifier', name: 'v' },
              kind: 'get',
              static: true,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'static and instance setter same name',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              key: { type: 'Identifier', name: 'v' },
              kind: 'set',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
            {
              type: 'MethodDefinition',
              key: { type: 'Identifier', name: 'v' },
              kind: 'set',
              static: true,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'constructor and method constructor',
        node: {
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
              key: { type: 'Identifier', name: 'constructor' },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'field and method same name',
        node: {
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
              type: 'MethodDefinition',
              key: { type: 'Identifier', name: 'x' },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'single field only',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'PropertyDefinition',
              key: { type: 'Identifier', name: 'only' },
              kind: 'field',
              static: false,
              value: { type: 'Literal', value: 1 },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      },
      {
        name: 'method then static field same name',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              key: { type: 'Identifier', name: 'y' },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
            {
              type: 'PropertyDefinition',
              key: { type: 'Identifier', name: 'y' },
              kind: 'field',
              static: true,
              value: { type: 'Literal', value: 1 },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'literal boolean key - not detected',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: true },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: true },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'empty string key - not detected',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: '' },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: '' },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'null body',
        node: {
          type: 'ClassBody',
          body: null,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
        },
      },
      {
        name: 'numeric key 3 and numeric key 4',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: 3 },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: 4 },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'StaticBlock body member',
        node: {
          type: 'ClassBody',
          body: [{ type: 'StaticBlock', body: [] }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'TSAbstractMethodDefinition member',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'TSAbstractMethodDefinition',
              key: { type: 'Identifier', name: 'abs' },
              kind: 'method',
              static: false,
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'float numeric keys different values',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: 1.1 },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: 2.2 },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
      {
        name: 'string key with regex chars different values',
        node: {
          type: 'ClassBody',
          body: [
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: '^a$' },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
            {
              type: 'MethodDefinition',
              key: { type: 'Literal', value: '^b$' },
              kind: 'method',
              static: false,
              value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      },
    ])('should not report for $name', ({ node }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      expect(() => visitor.ClassBody(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // DETECTION CASES - BATCH 2
  // ============================================================
  describe('detection cases - test.each batch 2 matching', () => {
    test.each([
      {
        name: 'duplicate methods named apply',
        key: { type: 'Identifier', name: 'apply' },
        kind: 'method',
        static: false,
        expected: 'apply',
      },
      {
        name: 'duplicate methods named bind',
        key: { type: 'Identifier', name: 'bind' },
        kind: 'method',
        static: false,
        expected: 'bind',
      },
      {
        name: 'duplicate methods named call',
        key: { type: 'Identifier', name: 'call' },
        kind: 'method',
        static: false,
        expected: 'call',
      },
      {
        name: 'duplicate static methods named create',
        key: { type: 'Identifier', name: 'create' },
        kind: 'method',
        static: true,
        expected: 'create',
      },
      {
        name: 'duplicate static methods named from',
        key: { type: 'Identifier', name: 'from' },
        kind: 'method',
        static: true,
        expected: 'from',
      },
      {
        name: 'duplicate static getters named default',
        key: { type: 'Identifier', name: 'default' },
        kind: 'get',
        static: true,
        expected: 'default',
      },
      {
        name: 'duplicate instance getters named length',
        key: { type: 'Identifier', name: 'length' },
        kind: 'get',
        static: false,
        expected: 'length',
      },
      {
        name: 'duplicate instance setters named size',
        key: { type: 'Identifier', name: 'size' },
        kind: 'set',
        static: false,
        expected: 'size',
      },
      {
        name: 'duplicate static setters named config',
        key: { type: 'Identifier', name: 'config' },
        kind: 'set',
        static: true,
        expected: 'config',
      },
      {
        name: 'duplicate properties named _id',
        key: { type: 'Identifier', name: '_id' },
        kind: 'field',
        static: false,
        expected: '_id',
      },
      {
        name: 'duplicate properties named $scope',
        key: { type: 'Identifier', name: '$scope' },
        kind: 'field',
        static: false,
        expected: '$scope',
      },
      {
        name: 'duplicate methods with literal key having special chars',
        key: { type: 'Literal', value: 'special-key_123' },
        kind: 'method',
        static: false,
        expected: 'special-key_123',
      },
      {
        name: 'duplicate methods with numeric key 7',
        key: { type: 'Literal', value: 7 },
        kind: 'method',
        static: false,
        expected: '7',
      },
      {
        name: 'duplicate methods with numeric key -99',
        key: { type: 'Literal', value: -99 },
        kind: 'method',
        static: false,
        expected: '-99',
      },
      {
        name: 'duplicate methods with numeric key 0.5',
        key: { type: 'Literal', value: 0.5 },
        kind: 'method',
        static: false,
        expected: '0.5',
      },
    ])('should report for $name', ({ key, kind, static: isStatic, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key,
            kind,
            static: isStatic,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key,
            kind,
            static: isStatic,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(expected)
    })
  })

  // ============================================================
  // EXTRACT LOCATION INTEGRATION
  // ============================================================
  describe('extract location integration', () => {
    test('should use default location when member has no loc at all', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should extract loc from second occurrence not first', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'm' },
            kind: 'method',
            static: false,
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'm' },
            kind: 'method',
            static: false,
            loc: { start: { line: 10, column: 4 }, end: { line: 10, column: 8 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 11, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should return default loc end column 0 when end column missing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'a' },
            kind: 'method',
            static: false,
            loc: { start: { line: 2, column: 4 }, end: { line: 2 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports[0].loc?.end.column).toBe(0)
    })
  })

  // ============================================================
  // MEMBER WITH EXTRA PROPERTIES
  // ============================================================
  describe('member with extra properties', () => {
    test('should handle member with extra unknown properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'extra' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            extraProp: true,
            anotherProp: 'value',
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'extra' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
            extraProp: false,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle member with computed: true on key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'computed' },
            kind: 'method',
            static: false,
            computed: true,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'computed' },
            kind: 'method',
            static: false,
            computed: true,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle node type that is neither MethodDefinition nor PropertyDefinition', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          { type: 'StaticBlock', body: [] },
          {
            type: 'TSAbstractMethodDefinition',
            key: { type: 'Identifier', name: 'abs' },
            kind: 'method',
            static: false,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle literal key with large number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 999999 },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 999999 },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('999999')
    })

    test('should handle literal key with space in string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 'has space' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: 'has space' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('has space')
    })

    test('should handle literal key with special regex characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '.*+?^${}()|[]\\' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '.*+?^${}()|[]\\' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle long method names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const longName = 'a'.repeat(100)
      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: longName },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: longName },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longName)
    })

    test('should handle method name with underscore', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: '_private' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: '_private' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_private')
    })

    test('should handle method name with dollar sign', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: '$jquery' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: '$jquery' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$jquery')
    })

    test('should handle method name with unicode', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'méthode' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'méthode' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('méthode')
    })

    test('should handle method name with emoji in string key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '🚀' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Literal', value: '🚀' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('🚀')
    })

    test('should handle PropertyDefinition without kind field', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'noKind' },
            static: false,
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'noKind' },
            static: false,
            loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 8 } },
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle static field and instance field with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'count' },
            kind: 'field',
            static: false,
            value: { type: 'Literal', value: 0 },
          },
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'count' },
            kind: 'field',
            static: true,
            value: { type: 'Literal', value: 0 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle Identifier key with numeric-like name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'method1' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 'method1' },
            kind: 'method',
            static: false,
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 10 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should handle class body with only non-array iterable body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should handle member where static is explicitly false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 's' },
            kind: 'method',
            static: false,
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
          {
            type: 'MethodDefinition',
            key: { type: 'Identifier', name: 's' },
            kind: 'method',
            static: false,
            loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 8 } },
            value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
    })

    test('should not report when body contains only unique PropertyDefinitions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
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
            key: { type: 'Identifier', name: 'y' },
            kind: 'field',
            static: false,
            value: { type: 'Literal', value: 2 },
          },
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'z' },
            kind: 'field',
            static: false,
            value: { type: 'Literal', value: 3 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(0)
    })

    test('should report duplicate PropertyDefinition with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noDupeClassMembersRule.create(context)

      const classBody: unknown = {
        type: 'ClassBody',
        body: [
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'z' },
            kind: 'field',
            static: false,
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'PropertyDefinition',
            key: { type: 'Identifier', name: 'z' },
            kind: 'field',
            static: false,
            loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 8 } },
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.ClassBody(classBody)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('z')
    })
  })
})
