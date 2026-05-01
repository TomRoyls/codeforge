import { describe, expect, test, vi } from 'vitest'
import { noUseBeforeDefineRule } from '../../../../src/rules/patterns/no-use-before-define.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'const x = 1;',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
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

function makeIdentifier(name: string, loc?: ReturnType<typeof makeLoc>): unknown {
  return {
    type: 'Identifier',
    name,
    loc: loc ?? makeLoc(1, 0, 1, name.length),
    _parent: {},
  }
}

function makeVarDeclarator(varName: string, loc?: ReturnType<typeof makeLoc>): unknown {
  return {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name: varName, loc: loc ?? makeLoc(1, 4, 1, 4 + varName.length), _parent: {} },
    init: null,
    loc: loc ?? makeLoc(1, 4, 1, 4 + varName.length + 1),
    _parent: {},
  }
}

// ===== META TESTS (8) =====

describe('no-use-before-define rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUseBeforeDefineRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUseBeforeDefineRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUseBeforeDefineRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUseBeforeDefineRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUseBeforeDefineRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning use before define', () => {
      const desc = noUseBeforeDefineRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/before/)
    })

    test('should have correct docs URL', () => {
      expect(noUseBeforeDefineRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-use-before-define',
      )
    })

    test('should have empty schema', () => {
      expect(noUseBeforeDefineRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (4) =====

  describe('structure', () => {
    test('create() returns visitor with VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('create() returns visitor with Identifier', () => {
      const { context } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(visitor).toHaveProperty('Identifier')
      expect(typeof visitor.Identifier).toBe('function')
    })

    test('create() returns visitor with Program:exit', () => {
      const { context } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(visitor).toHaveProperty('Program:exit')
      expect(typeof visitor['Program:exit']).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUseBeforeDefineRule).toBeDefined()
      expect(noUseBeforeDefineRule.meta).toBeDefined()
      expect(noUseBeforeDefineRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS USE BEFORE DEFINE (30) =====

  describe('positive cases — reports use before define', () => {
    test('reports identifier used with no corresponding definition', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports with correct message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('myVar'))
      visitor['Program:exit']()
      expect(reports[0].message).toBe("'myVar' was used before it was defined.")
    })

    test('report message includes the variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('someName'))
      visitor['Program:exit']()
      expect(reports[0].message).toContain('someName')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports[0].node).toBeDefined()
    })

    test('does not report when use is followed by definition before exit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor.VariableDeclarator(makeVarDeclarator('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('reports for variable name "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('reports for variable name "myVar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('myVar'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for variable name "fooBar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('fooBar'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for single-letter names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for underscore-prefixed name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('_private'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for dollar-prefixed name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('$jquery'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for camelCase name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('myCamelCaseVar'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for SCREAMING_SNAKE name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('MAX_SIZE'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports multiple different undefined identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('a'))
      visitor.Identifier(makeIdentifier('b'))
      visitor.Identifier(makeIdentifier('c'))
      visitor['Program:exit']()
      expect(reports.length).toBe(3)
    })

    test('reports when identifier used twice before define', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(2)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports[0].message).toBe("'x' was used before it was defined.")
    })

    test('report node matches the input Identifier node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      const node = makeIdentifier('target')
      visitor.Identifier(node)
      visitor['Program:exit']()
      expect(reports[0].node).toBe(node)
    })

    test('reports for long variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('thisIsAVeryLongVariableNameThatGoesOnAndOn'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('thisIsAVeryLongVariableNameThatGoesOnAndOn')
    })

    test('reports for name with numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('var123'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple Identifier calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('a'))
      visitor.Identifier(makeIdentifier('b'))
      visitor['Program:exit']()
      expect(reports.length).toBe(2)
    })

    test('reports each undefined identifier with its own message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('alpha'))
      visitor.Identifier(makeIdentifier('beta'))
      visitor['Program:exit']()
      expect(reports[0].message).toBe("'alpha' was used before it was defined.")
      expect(reports[1].message).toBe("'beta' was used before it was defined.")
    })

    test('report loc preserved from input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x', makeLoc(5, 10, 5, 11)))
      visitor['Program:exit']()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports when VariableDeclarator has non-Identifier id type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: null,
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports when VariableDeclarator id is ArrayPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('y'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'ArrayPattern', elements: [] },
        init: null,
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports when VariableDeclarator id is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('z'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: null,
        init: null,
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports when VariableDeclarator id has no type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('w'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { name: 'w' },
        init: null,
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports when only Identifier visitor called then Program:exit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('unused'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('all reports for same name have identical messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('dup'))
      visitor.Identifier(makeIdentifier('dup'))
      visitor['Program:exit']()
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report when variable defined before use', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x'))
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for null node to VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node to VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object to VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator({})
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive to VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.VariableDeclarator('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive to VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for null node to Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.Identifier(null)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node to Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.Identifier(undefined)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object to Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier({})
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive to Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.Identifier('not a node')).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive to Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.Identifier(42)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier without name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier({ type: 'Identifier', loc: makeLoc(1, 0, 1, 5), _parent: {} })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier with non-string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 123, loc: makeLoc(1, 0, 1, 5), _parent: {} })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclarator without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        init: null,
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('does not add to definedVars for VariableDeclarator with null id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: null,
        init: null,
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('does not report when same var defined then used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('myVar'))
      visitor.Identifier(makeIdentifier('myVar'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive to VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array to VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.VariableDeclarator([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive to Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.Identifier(true)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for array to Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.Identifier([])).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report when multiple vars defined before their uses', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('a'))
      visitor.VariableDeclarator(makeVarDeclarator('b'))
      visitor.Identifier(makeIdentifier('a'))
      visitor.Identifier(makeIdentifier('b'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report when variable defined after first use then used again', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor.VariableDeclarator(makeVarDeclarator('x'))
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type in VariableDeclarator visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) })
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('does not report for non-object in Identifier visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      expect(() => visitor.Identifier('string')).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclarator with id that is string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: 'notAnObject',
        init: null,
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('does not report when identifier name matches a previously defined var', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('defined'))
      visitor.Identifier(makeIdentifier('defined'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclarator with id name that is number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 123 },
        init: null,
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('does not report when Program:exit called with no prior visitors', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for node type mismatch in Identifier visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2), _parent: {} })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclarator with undefined id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: undefined,
        init: null,
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })
  })

  // ===== EDGE CASES (23) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUseBeforeDefineRule.create(ctx1)
      const visitor2 = noUseBeforeDefineRule.create(ctx2)
      visitor1.Identifier(makeIdentifier('x'))
      visitor2.VariableDeclarator(makeVarDeclarator('x'))
      visitor2.Identifier(makeIdentifier('x'))
      visitor1['Program:exit']()
      visitor2['Program:exit']()
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUseBeforeDefineRule.create(context)
      const visitor2 = noUseBeforeDefineRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUseBeforeDefineRule.meta
      const meta2 = noUseBeforeDefineRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUseBeforeDefineRule).toBeDefined()
      expect(typeof noUseBeforeDefineRule.create).toBe('function')
      expect(typeof noUseBeforeDefineRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1), _parent: { type: 'VariableDeclarator' } })
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('handles Identifier node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 'x', _parent: {} })
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'x',
        loc: makeLoc(1, 0, 1, 1),
        _parent: {},
        range: [0, 1],
        extra: true,
        typeAnnotation: {},
      }
      visitor.Identifier(node)
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('Program:exit reports all pending usages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('a'))
      visitor.Identifier(makeIdentifier('b'))
      visitor.Identifier(makeIdentifier('c'))
      visitor['Program:exit']()
      expect(reports.length).toBe(3)
    })

    test('Program:exit does not report vars defined during traversal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor.VariableDeclarator(makeVarDeclarator('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('mixed defined and undefined vars report correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('defined'))
      visitor.Identifier(makeIdentifier('defined'))
      visitor.Identifier(makeIdentifier('undefined1'))
      visitor.VariableDeclarator(makeVarDeclarator('alsoDefined'))
      visitor.Identifier(makeIdentifier('alsoDefined'))
      visitor.Identifier(makeIdentifier('undefined2'))
      visitor['Program:exit']()
      expect(reports.length).toBe(2)
    })

    test('handles VariableDeclarator with destructuring id (ObjectPattern)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' } }] },
        init: null,
        loc: makeLoc(1, 0, 1, 15),
        _parent: {},
      })
      visitor.Identifier(makeIdentifier('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('handles VariableDeclarator with destructuring id (ArrayPattern)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'ArrayPattern', elements: [{ type: 'Identifier', name: 'first' }] },
        init: null,
        loc: makeLoc(1, 0, 1, 15),
        _parent: {},
      })
      visitor.Identifier(makeIdentifier('first'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('handles Identifier node with no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 'noloc', _parent: {} })
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 'x', loc: {}, _parent: {} })
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 'x', loc: { start: { line: 3, column: 5 } }, _parent: {} })
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same usages report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      const node = makeIdentifier('dup')
      visitor.Identifier(node)
      visitor.Identifier(node)
      visitor.Identifier(node)
      visitor['Program:exit']()
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x', makeLoc(10, 4, 10, 5)))
      visitor['Program:exit']()
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('VariableDeclarator ignored for wrong node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('usageReports filtered at Program:exit for late definitions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('late'))
      visitor.VariableDeclarator(makeVarDeclarator('late'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('handles VariableDeclarator with undefined init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'y', loc: makeLoc(1, 4, 1, 5), _parent: {} },
        init: undefined,
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      visitor.Identifier(makeIdentifier('y'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('handles identifier node with only name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 'minimal' })
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('Program:exit can be called multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      visitor['Program:exit']()
      expect(reports.length).toBe(2)
    })

    test('defines then uses then defines same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseBeforeDefineRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x'))
      visitor.Identifier(makeIdentifier('x'))
      visitor.VariableDeclarator(makeVarDeclarator('x'))
      visitor.Identifier(makeIdentifier('x'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })
  })
})
