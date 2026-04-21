import { describe, test, expect } from 'vitest'
import { noCaseDeclarationsRule } from '../../../../src/rules/patterns/no-case-declarations.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createSwitchCase(consequent: unknown[], line = 1): unknown {
  return {
    type: 'SwitchCase',
    test: { type: 'Literal', value: 1 },
    consequent,
    loc: {
      start: { line, column: 0 },
      end: { line, column: 30 },
    },
  }
}

function createLetDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'let',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'a' },
        init: { type: 'Literal', value: 1 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createConstDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'b' },
        init: { type: 'Literal', value: 2 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 12 },
    },
  }
}

function createVarDeclaration(): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'c' },
        init: { type: 'Literal', value: 3 },
      },
    ],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createFunctionDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBreakStatement(): unknown {
  return {
    type: 'BreakStatement',
    label: null,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
  }
}

function createExpressionStatement(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'doSomething' },
      arguments: [],
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 15 },
    },
  }
}

function createNonSwitchCase(): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Literal', value: true },
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

describe('no-case-declarations rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noCaseDeclarationsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noCaseDeclarationsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noCaseDeclarationsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noCaseDeclarationsRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention lexical or declaration in description', () => {
      const desc = noCaseDeclarationsRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/lexical|declaration/)
    })
  })

  describe('create', () => {
    test('should return visitor with SwitchCase method', () => {
      const { context } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      expect(visitor).toHaveProperty('SwitchCase')
    })
  })

  describe('detecting lexical declarations', () => {
    test('should report let declaration in case clause', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createLetDeclaration(), createBreakStatement()]))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('lexical')
    })

    test('should report const declaration in case clause', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createConstDeclaration(), createBreakStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should report function declaration in case clause', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createFunctionDeclaration(), createBreakStatement()]))

      expect(reports.length).toBe(1)
    })

    test('should not report var declaration in case clause', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createVarDeclaration(), createBreakStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report regular statements in case clause', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createBreakStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report non-SwitchCase nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createNonSwitchCase())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      expect(() => visitor.SwitchCase(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      expect(() => visitor.SwitchCase(undefined)).not.toThrow()
    })

    test('should handle empty consequent', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([]))

      expect(reports.length).toBe(0)
    })

    test('should handle node without consequent', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.SwitchCase(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('meta - exhaustive properties', () => {
    test('should have meta property on rule', () => {
      expect(noCaseDeclarationsRule).toHaveProperty('meta')
    })

    test('should have create property on rule', () => {
      expect(noCaseDeclarationsRule).toHaveProperty('create')
    })

    test('meta type should be a string', () => {
      expect(typeof noCaseDeclarationsRule.meta.type).toBe('string')
    })

    test('meta severity should be a string', () => {
      expect(typeof noCaseDeclarationsRule.meta.severity).toBe('string')
    })

    test('meta docs should be an object', () => {
      expect(typeof noCaseDeclarationsRule.meta.docs).toBe('object')
    })

    test('meta docs description should be a string', () => {
      expect(typeof noCaseDeclarationsRule.meta.docs?.description).toBe('string')
    })

    test('meta schema should be an array', () => {
      expect(Array.isArray(noCaseDeclarationsRule.meta.schema)).toBe(true)
    })

    test('meta schema should be empty', () => {
      expect(noCaseDeclarationsRule.meta.schema).toEqual([])
    })

    test('meta fixable should be undefined', () => {
      expect(noCaseDeclarationsRule.meta.fixable).toBeUndefined()
    })

    test('meta docs should have description property', () => {
      expect(noCaseDeclarationsRule.meta.docs).toHaveProperty('description')
    })

    test('meta docs should have category property', () => {
      expect(noCaseDeclarationsRule.meta.docs).toHaveProperty('category')
    })

    test('meta docs should have recommended property', () => {
      expect(noCaseDeclarationsRule.meta.docs).toHaveProperty('recommended')
    })

    test('meta type should be exactly problem', () => {
      expect(noCaseDeclarationsRule.meta.type).toStrictEqual('problem')
    })

    test('meta severity should be exactly error', () => {
      expect(noCaseDeclarationsRule.meta.severity).toStrictEqual('error')
    })

    test('meta docs category should be exactly patterns', () => {
      expect(noCaseDeclarationsRule.meta.docs?.category).toStrictEqual('patterns')
    })

    test('meta docs recommended should be exactly true', () => {
      expect(noCaseDeclarationsRule.meta.docs?.recommended).toStrictEqual(true)
    })

    test('meta docs description should not be empty', () => {
      expect(noCaseDeclarationsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta docs description should mention switch', () => {
      expect(noCaseDeclarationsRule.meta.docs?.description.toLowerCase()).toContain('switch')
    })

    test('meta docs description should mention case', () => {
      expect(noCaseDeclarationsRule.meta.docs?.description.toLowerCase()).toContain('case')
    })

    test('meta should not have deprecated flag', () => {
      expect(noCaseDeclarationsRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy', () => {
      expect(noCaseDeclarationsRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not have requiresTypeChecking', () => {
      expect(noCaseDeclarationsRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('meta docs should not have url by default', () => {
      expect(noCaseDeclarationsRule.meta.docs?.url).toBeUndefined()
    })
  })

  describe('create - visitor structure', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('visitor should be non-null', () => {
      const { context } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      expect(visitor).not.toBeNull()
    })

    test('SwitchCase should be a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      expect(typeof visitor.SwitchCase).toBe('function')
    })

    test('calling create multiple times should return new visitors', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noCaseDeclarationsRule.create(context)
      const visitor2 = noCaseDeclarationsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('each create call should have its own SwitchCase', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noCaseDeclarationsRule.create(context)
      const visitor2 = noCaseDeclarationsRule.create(context)
      expect(visitor1.SwitchCase).not.toBe(visitor2.SwitchCase)
    })

    test('SwitchCase should accept one argument', () => {
      const { context } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      expect(visitor.SwitchCase.length).toBe(1)
    })

    test('create should be a function', () => {
      expect(typeof noCaseDeclarationsRule.create).toBe('function')
    })

    test('create should accept one argument', () => {
      expect(noCaseDeclarationsRule.create.length).toBe(1)
    })

    test('visitor should only have SwitchCase key', () => {
      const { context } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      expect(Object.keys(visitor)).toEqual(['SwitchCase'])
    })
  })

  describe('detection - let declarations', () => {
    test('should report single let declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      expect(reports.length).toBe(1)
    })

    test('should report let with kind property exactly let', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const letNode = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 14 } },
      }
      visitor.SwitchCase(createSwitchCase([letNode]))
      expect(reports.length).toBe(1)
    })

    test('should not report if kind is Let (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'Let',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report if kind is LET (uppercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'LET',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report if type is not VariableDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SomeOtherDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should report let without declarations array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(1)
    })

    test('should report let with empty declarations array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(1)
    })

    test('should report let declaration at line 5', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration(5, 8)], 5))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report let declaration at column 20', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration(1, 20)]))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(20)
    })
  })

  describe('detection - const declarations', () => {
    test('should report single const declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createConstDeclaration()]))
      expect(reports.length).toBe(1)
    })

    test('should report const with kind property exactly const', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [],
        loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 12 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(1)
    })

    test('should not report if kind is Const (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'Const',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report if kind is CONST (uppercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'CONST',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should report const without declarations array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(1)
    })

    test('should report const with empty declarations array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(1)
    })

    test('should report const declaration at line 10', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createConstDeclaration(10, 4)], 10))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report const declaration at column 15', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createConstDeclaration(1, 15)]))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(15)
    })
  })

  describe('detection - var declarations (should NOT report)', () => {
    test('should not report var declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createVarDeclaration()]))
      expect(reports.length).toBe(0)
    })

    test('should not report var with kind property exactly var', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report if kind is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report if kind is empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: '',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report if kind is using', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'using',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })
  })

  describe('detection - function declarations', () => {
    test('should report function declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createFunctionDeclaration()]))
      expect(reports.length).toBe(1)
    })

    test('should report function declaration with body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const fn = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'myFunc' },
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.SwitchCase(createSwitchCase([fn]))
      expect(reports.length).toBe(1)
    })

    test('should report function declaration without id', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const fn = {
        type: 'FunctionDeclaration',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([fn]))
      expect(reports.length).toBe(1)
    })

    test('should report function declaration with async', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const fn = {
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'asyncFn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.SwitchCase(createSwitchCase([fn]))
      expect(reports.length).toBe(1)
    })

    test('should report function declaration with generator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const fn = {
        type: 'FunctionDeclaration',
        generator: true,
        id: { type: 'Identifier', name: 'genFn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.SwitchCase(createSwitchCase([fn]))
      expect(reports.length).toBe(1)
    })

    test('should not report FunctionExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const fn = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'expr' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.SwitchCase(createSwitchCase([fn]))
      expect(reports.length).toBe(0)
    })

    test('should not report ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const fn = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.SwitchCase(createSwitchCase([fn]))
      expect(reports.length).toBe(0)
    })

    test('should report function declaration at line 7', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createFunctionDeclaration(7, 3)], 7))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
    })
  })

  describe('detection - non-declaration statement types (should NOT report)', () => {
    test('should not report ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report BreakStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createBreakStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report ReturnStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Literal', value: true },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report ForStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report WhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'WhileStatement',
        test: { type: 'Literal', value: true },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report BlockStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report ThrowStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'ThrowStatement',
        argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report ContinueStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'ContinueStatement',
        label: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report SwitchStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report TryStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report ClassDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MyClass' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })
  })

  describe('multiple declarations in single case', () => {
    test('should report two let declarations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration(), createLetDeclaration(1, 15)]))
      expect(reports.length).toBe(2)
    })

    test('should report two const declarations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([createConstDeclaration(), createConstDeclaration(1, 15)]),
      )
      expect(reports.length).toBe(2)
    })

    test('should report let and const declarations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration(), createConstDeclaration()]))
      expect(reports.length).toBe(2)
    })

    test('should report let and function declarations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration(), createFunctionDeclaration()]))
      expect(reports.length).toBe(2)
    })

    test('should report const and function declarations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createConstDeclaration(), createFunctionDeclaration()]))
      expect(reports.length).toBe(2)
    })

    test('should report all three types together', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createLetDeclaration(),
          createConstDeclaration(),
          createFunctionDeclaration(),
        ]),
      )
      expect(reports.length).toBe(3)
    })

    test('should report only lexical among mixed statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createLetDeclaration(),
          createBreakStatement(),
          createConstDeclaration(),
          createExpressionStatement(),
        ]),
      )
      expect(reports.length).toBe(2)
    })

    test('should not report when only var and regular statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createVarDeclaration(),
          createExpressionStatement(),
          createBreakStatement(),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report 5 let declarations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const lets = Array.from({ length: 5 }, (_, i) => createLetDeclaration(1, i * 10))
      visitor.SwitchCase(createSwitchCase(lets))
      expect(reports.length).toBe(5)
    })

    test('should report interleaved declarations and statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createLetDeclaration(),
          createBreakStatement(),
          createConstDeclaration(),
          createExpressionStatement(),
          createFunctionDeclaration(),
        ]),
      )
      expect(reports.length).toBe(3)
    })

    test('each report should correspond to the correct declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const letAt2 = createLetDeclaration(2, 0)
      const constAt3 = createConstDeclaration(3, 0)
      visitor.SwitchCase(createSwitchCase([letAt2, constAt3]))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(3)
    })
  })

  describe('location reporting', () => {
    test('should report location from let declaration node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration(4, 8)]))
      expect(reports[0].loc).toEqual({
        start: { line: 4, column: 8 },
        end: { line: 4, column: 18 },
      })
    })

    test('should report location from const declaration node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createConstDeclaration(6, 2)]))
      expect(reports[0].loc).toEqual({
        start: { line: 6, column: 2 },
        end: { line: 6, column: 14 },
      })
    })

    test('should report location from function declaration node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createFunctionDeclaration(8, 4)]))
      expect(reports[0].loc).toEqual({
        start: { line: 8, column: 4 },
        end: { line: 8, column: 24 },
      })
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = { type: 'VariableDeclaration', kind: 'let', declarations: [] }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('should use default location when node loc is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = { type: 'VariableDeclaration', kind: 'let', declarations: [], loc: null }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('should use default location when node loc is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = { type: 'VariableDeclaration', kind: 'let', declarations: [], loc: undefined }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('should use default location when loc has missing start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { end: { line: 1, column: 5 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default location when loc has missing end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 3, column: 2 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should use partial loc when start.line is non-number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 'two', column: 0 }, end: { line: 3, column: 5 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use partial loc when start.column is non-number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 3, column: 'zero' }, end: { line: 3, column: 5 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default when loc is a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: 'invalid',
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
      expect(reports[0].loc?.end).toEqual({ line: 1, column: 0 })
    })

    test('should use default when loc is a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: 42,
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
      expect(reports[0].loc?.end).toEqual({ line: 1, column: 0 })
    })

    test('should handle loc with line 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 5 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle loc with large line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 9999, column: 0 }, end: { line: 9999, column: 5 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle loc with large column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 1, column: 500 }, end: { line: 1, column: 510 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle multiline loc span', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 5, column: 2 }, end: { line: 10, column: 3 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(10)
    })
  })

  describe('message content', () => {
    test('report message should contain "Unexpected"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      expect(reports[0].message).toContain('Unexpected')
    })

    test('report message should contain "lexical"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      expect(reports[0].message).toContain('lexical')
    })

    test('report message should contain "declaration"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      expect(reports[0].message).toContain('declaration')
    })

    test('report message should contain "case clause"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      expect(reports[0].message).toContain('case clause')
    })

    test('report message should contain "block"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      expect(reports[0].message.toLowerCase()).toContain('block')
    })

    test('report message should include suggestion text', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      expect(reports[0].message).toContain('Move the declaration to an outer block')
    })

    test('report message should be the same for let and const', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const visitor1 = noCaseDeclarationsRule.create(ctx1)
      visitor1.SwitchCase(createSwitchCase([createLetDeclaration()]))

      const { context: ctx2, reports: reports2 } = createMockRuleContext()
      const visitor2 = noCaseDeclarationsRule.create(ctx2)
      visitor2.SwitchCase(createSwitchCase([createConstDeclaration()]))

      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('report message should be the same for function declaration', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const visitor1 = noCaseDeclarationsRule.create(ctx1)
      visitor1.SwitchCase(createSwitchCase([createLetDeclaration()]))

      const { context: ctx2, reports: reports2 } = createMockRuleContext()
      const visitor2 = noCaseDeclarationsRule.create(ctx2)
      visitor2.SwitchCase(createSwitchCase([createFunctionDeclaration()]))

      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  describe('node type validation - isSwitchCase', () => {
    test('should process SwitchCase type node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      expect(reports.length).toBe(1)
    })

    test('should skip IfStatement type node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createNonSwitchCase())
      expect(reports.length).toBe(0)
    })

    test('should skip node with type switchcase (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'switchcase',
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(0)
    })

    test('should skip node with type SWITCHCASE (uppercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SWITCHCASE',
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(0)
    })

    test('should skip node without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(0)
    })

    test('should skip node with numeric type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 42,
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(0)
    })

    test('should skip node with null type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: null,
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(0)
    })

    test('should skip node with empty string type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: '',
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(0)
    })

    test('should skip node with boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      expect(() => visitor.SwitchCase(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should skip node with string node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      expect(() => visitor.SwitchCase('SwitchCase')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should skip node with number node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      expect(() => visitor.SwitchCase(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should skip node with array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      expect(() => visitor.SwitchCase([createLetDeclaration()])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('consequent edge cases', () => {
    test('should handle consequent as undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: null,
        consequent: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle consequent as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: null,
        consequent: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle consequent as empty array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent with only null elements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([null, null, null]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent with only undefined elements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([undefined, undefined]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent with null between valid items', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([null, createLetDeclaration(), null]))
      expect(reports.length).toBe(1)
    })

    test('should handle consequent with undefined between valid items', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([undefined, createLetDeclaration(), undefined]))
      expect(reports.length).toBe(1)
    })

    test('should handle consequent with primitive elements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([42, 'hello', true]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent as a non-array object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: null,
        consequent: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchCase(node)).toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle consequent as a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: null,
        consequent: 'not an array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
    })

    test('should handle consequent as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: null,
        consequent: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchCase(node)).toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('mixed consequent items', () => {
    test('should report only let among expressions and var', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createVarDeclaration(),
          createLetDeclaration(),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report const first then skip var then report function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createConstDeclaration(),
          createVarDeclaration(),
          createFunctionDeclaration(),
        ]),
      )
      expect(reports.length).toBe(2)
    })

    test('should report nothing when all are var declarations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([createVarDeclaration(), createVarDeclaration(), createVarDeclaration()]),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle single break statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createBreakStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should handle single expression statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports.length).toBe(0)
    })
  })

  describe('default case (test: null)', () => {
    test('should report let in default case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const defaultCase = {
        type: 'SwitchCase',
        test: null,
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(defaultCase)
      expect(reports.length).toBe(1)
    })

    test('should report const in default case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const defaultCase = {
        type: 'SwitchCase',
        test: null,
        consequent: [createConstDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(defaultCase)
      expect(reports.length).toBe(1)
    })

    test('should report function in default case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const defaultCase = {
        type: 'SwitchCase',
        test: null,
        consequent: [createFunctionDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(defaultCase)
      expect(reports.length).toBe(1)
    })

    test('should not report var in default case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const defaultCase = {
        type: 'SwitchCase',
        test: null,
        consequent: [createVarDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(defaultCase)
      expect(reports.length).toBe(0)
    })

    test('should not report expressions in default case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const defaultCase = {
        type: 'SwitchCase',
        test: null,
        consequent: [createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(defaultCase)
      expect(reports.length).toBe(0)
    })
  })

  describe('different test values', () => {
    test('should report with Literal test value 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 0 },
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
    })

    test('should report with string test value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 'hello' },
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
    })

    test('should report with Identifier test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Identifier', name: 'x' },
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
    })

    test('should report with MemberExpression test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' } },
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
    })

    test('should report with boolean test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: true },
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('rule isolation between calls', () => {
    test('should not carry reports between separate visitor calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      expect(reports.length).toBe(1)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports.length).toBe(1)
    })

    test('should accumulate reports within same context', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      visitor.SwitchCase(createSwitchCase([createConstDeclaration()]))
      expect(reports.length).toBe(2)
    })

    test('should not share reports between different contexts', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noCaseDeclarationsRule.create(ctx1)
      const visitor2 = noCaseDeclarationsRule.create(ctx2)

      visitor1.SwitchCase(createSwitchCase([createLetDeclaration()]))
      visitor2.SwitchCase(createSwitchCase([createLetDeclaration()]))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })

    test('separate contexts should track independent reports', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noCaseDeclarationsRule.create(ctx1)
      const visitor2 = noCaseDeclarationsRule.create(ctx2)

      visitor1.SwitchCase(createSwitchCase([createLetDeclaration(), createConstDeclaration()]))
      visitor2.SwitchCase(createSwitchCase([createExpressionStatement()]))

      expect(reports1.length).toBe(2)
      expect(reports2.length).toBe(0)
    })
  })

  describe('export verification', () => {
    test('should export the rule as named export', () => {
      expect(noCaseDeclarationsRule).toBeDefined()
    })

    test('should have meta property on exported rule', () => {
      expect(noCaseDeclarationsRule.meta).toBeDefined()
    })

    test('should have create method on exported rule', () => {
      expect(typeof noCaseDeclarationsRule.create).toBe('function')
    })

    test('exported rule should be an object', () => {
      expect(typeof noCaseDeclarationsRule).toBe('object')
    })

    test('exported rule should not be null', () => {
      expect(noCaseDeclarationsRule).not.toBeNull()
    })

    test('meta should be a plain object', () => {
      expect(typeof noCaseDeclarationsRule.meta).toBe('object')
    })

    test('meta should not be null', () => {
      expect(noCaseDeclarationsRule.meta).not.toBeNull()
    })
  })

  describe('context integration', () => {
    test('should call report with correct descriptor shape', () => {
      let capturedDescriptor: ReportDescriptor | undefined
      const context = {
        report: (descriptor: ReportDescriptor) => {
          capturedDescriptor = descriptor
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext

      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))

      expect(capturedDescriptor).toBeDefined()
      expect(capturedDescriptor).toHaveProperty('message')
      expect(capturedDescriptor).toHaveProperty('loc')
    })

    test('should not call report for valid case clause', () => {
      let reportCalled = false
      const context = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext

      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createBreakStatement()]))

      expect(reportCalled).toBe(false)
    })

    test('should call report exactly once for single declaration', () => {
      let reportCount = 0
      const context = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext

      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))

      expect(reportCount).toBe(1)
    })

    test('should call report exactly three times for three declarations', () => {
      let reportCount = 0
      const context = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/test',
      } as unknown as RuleContext

      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createLetDeclaration(),
          createConstDeclaration(),
          createFunctionDeclaration(),
        ]),
      )

      expect(reportCount).toBe(3)
    })
  })

  describe('visitor called with various node shapes', () => {
    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        range: [0, 30],
        leadingComments: [],
        trailingComments: [],
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node without test property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        consequent: [createLetDeclaration()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node without loc on SwitchCase itself', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: [createLetDeclaration()],
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase({})
      expect(reports.length).toBe(0)
    })

    test('should handle node with Symbol properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const sym = Symbol('test')
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: [createLetDeclaration()],
        [sym]: 'extra',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
    })

    test('should handle consequent items that are empty objects', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      visitor.SwitchCase(createSwitchCase([{}, {}, {}]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent with deeply nested structure', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const nestedLet = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ObjectPattern',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'a' },
                  value: { type: 'Identifier', name: 'b' },
                },
              ],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.SwitchCase(createSwitchCase([nestedLet]))
      expect(reports.length).toBe(1)
    })
  })

  describe('SwitchCase with no loc on the case itself', () => {
    test('should still report let without SwitchCase loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: [createLetDeclaration(3, 5)],
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should still report const without SwitchCase loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: [createConstDeclaration(7, 2)],
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should still report function without SwitchCase loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: null,
        consequent: [createFunctionDeclaration(11, 0)],
      }
      visitor.SwitchCase(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(11)
    })
  })

  describe('consequent with mixed declaration and non-declaration VariableDeclaration', () => {
    test('should not report VariableDeclaration without kind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report VariableDeclaration with numeric kind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 42,
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })

    test('should not report VariableDeclaration with object kind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: { name: 'let' },
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports.length).toBe(0)
    })
  })

  describe('loc edge cases for end properties', () => {
    test('should use default end column when end.column is non-number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 'five' } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should use default end line when end.line is non-number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 'three', column: 5 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with only start partially defined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 5 }, end: { column: 3 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(3)
    })

    test('should handle loc where start and end are the same', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 3, column: 7 }, end: { line: 3, column: 7 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start).toEqual({ line: 3, column: 7 })
      expect(reports[0].loc?.end).toEqual({ line: 3, column: 7 })
    })

    test('should handle negative line numbers gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: -1, column: 0 }, end: { line: -1, column: 5 } },
      }
      visitor.SwitchCase(createSwitchCase([node]))
      expect(reports[0].loc?.start.line).toBe(-1)
    })
  })

  describe('multiple SwitchCase invocations', () => {
    test('should track reports across multiple calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.SwitchCase(createSwitchCase([createLetDeclaration(i + 1, 0)], i + 1))
      }
      expect(reports.length).toBe(10)
    })

    test('should track reports for mixed calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
      visitor.SwitchCase(createSwitchCase([createBreakStatement()]))
      visitor.SwitchCase(createSwitchCase([createConstDeclaration()]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      visitor.SwitchCase(createSwitchCase([createFunctionDeclaration()]))

      expect(reports.length).toBe(3)
    })

    test('should handle alternating valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCaseDeclarationsRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          visitor.SwitchCase(createSwitchCase([createLetDeclaration()]))
        } else {
          visitor.SwitchCase(createSwitchCase([createBreakStatement()]))
        }
      }
      expect(reports.length).toBe(10)
    })

    test('should handle rapid successive calls without cross-contamination', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const visitor1 = noCaseDeclarationsRule.create(ctx1)

      visitor1.SwitchCase(createSwitchCase([createLetDeclaration()]))
      visitor1.SwitchCase(createSwitchCase([createLetDeclaration()]))

      expect(reports1.length).toBe(2)
    })
  })
})
