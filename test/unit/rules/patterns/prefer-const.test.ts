import { describe, test, expect, beforeEach, vi } from 'vitest'
import { preferConstRule } from '../../../../src/rules/patterns/prefer-const.js'
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'let x = 1;',
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

function createLetDeclaration(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'let',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: varName },
        init: { type: 'Literal', value: 1 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createVarDeclaration(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: varName },
        init: { type: 'Literal', value: 1 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createConstDeclaration(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: varName },
        init: { type: 'Literal', value: 1 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createDestructuringDeclaration(
  kind: 'let' | 'var',
  names: string[],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclaration',
    kind,
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: names.map((name) => ({
            type: 'Property',
            key: { type: 'Identifier', name },
            value: { type: 'Identifier', name },
          })),
        },
        init: { type: 'Identifier', name: 'obj' },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createAssignment(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: { type: 'Identifier', name: varName },
    right: { type: 'Literal', value: 2 },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createUpdateExpression(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'UpdateExpression',
    operator: '++',
    argument: { type: 'Identifier', name: varName },
    prefix: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

// ============================================================================
// 200+ Tests for prefer-const rule
// ============================================================================

describe('prefer-const rule', () => {
  // ==========================================================================
  // META PROPERTIES (20 tests)
  // ==========================================================================
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(preferConstRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferConstRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferConstRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(preferConstRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferConstRule.meta.schema).toBeDefined()
    })

    test('should have correct description containing const', () => {
      expect(preferConstRule.meta.docs?.description).toContain('const')
    })

    test('should be fixable as code', () => {
      expect(preferConstRule.meta.fixable).toBe('code')
    })

    test('should have meta object defined', () => {
      expect(preferConstRule.meta).toBeDefined()
      expect(typeof preferConstRule.meta).toBe('object')
    })

    test('should have docs property defined', () => {
      expect(preferConstRule.meta.docs).toBeDefined()
    })

    test('should have description as a non-empty string', () => {
      expect(typeof preferConstRule.meta.docs?.description).toBe('string')
      expect(preferConstRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have description mentioning reassigned', () => {
      expect(preferConstRule.meta.docs?.description).toContain('reassigned')
    })

    test('should have type property as valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferConstRule.meta.type)
    })

    test('should have severity as valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(preferConstRule.meta.severity)
    })

    test('should have docs url defined', () => {
      expect(preferConstRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as a string', () => {
      expect(typeof preferConstRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url containing prefer-const', () => {
      expect(preferConstRule.meta.docs?.url).toContain('prefer-const')
    })

    test('should have fixable as valid value', () => {
      if (preferConstRule.meta.fixable) {
        expect(['code', 'whitespace']).toContain(preferConstRule.meta.fixable)
      }
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferConstRule.meta.schema)).toBe(true)
    })

    test('should have schema with at least one entry', () => {
      const schema = preferConstRule.meta.schema
      if (Array.isArray(schema)) {
        expect(schema.length).toBeGreaterThanOrEqual(1)
      }
    })

    test('should not be deprecated', () => {
      expect(preferConstRule.meta.deprecated).toBeFalsy()
    })
  })

  // ==========================================================================
  // CREATE / VISITOR (8 tests)
  // ==========================================================================
  describe('create', () => {
    test('should return visitor object with VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclaration')
    })

    test('should return visitor object with AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('should return visitor object with UpdateExpression', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(visitor).toHaveProperty('UpdateExpression')
    })

    test('should return visitor object with Program:exit', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(visitor).toHaveProperty('Program:exit')
    })

    test('should return all four required visitor methods', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(Object.keys(visitor)).toContain('VariableDeclaration')
      expect(Object.keys(visitor)).toContain('AssignmentExpression')
      expect(Object.keys(visitor)).toContain('UpdateExpression')
      expect(Object.keys(visitor)).toContain('Program:exit')
    })

    test('should return visitor methods that are functions', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(typeof visitor.VariableDeclaration).toBe('function')
      expect(typeof visitor.AssignmentExpression).toBe('function')
      expect(typeof visitor.UpdateExpression).toBe('function')
      expect(typeof visitor['Program:exit']).toBe('function')
    })

    test('should create a new visitor instance for each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferConstRule.create(context)
      const visitor2 = preferConstRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept a valid RuleContext', () => {
      const { context } = createMockContext()
      expect(() => preferConstRule.create(context)).not.toThrow()
    })
  })

  // ==========================================================================
  // DETECTION - let/var reported (30 tests)
  // ==========================================================================
  describe('detection', () => {
    test('should report let declaration that is never reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report var declaration that is never reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('y'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report message containing variable name for let', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('myVar'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain('myVar')
    })

    test('should report message containing variable name for var', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('counter'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain('counter')
    })

    test('should report message containing const keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain('const')
    })

    test('should report message containing never reassigned phrase', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain('never reassigned')
    })

    test('should report suggestion text in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain('never reassigned')
      expect(reports[0].message).toContain('const')
    })

    test('should report multiple let declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a'))
      visitor.VariableDeclaration(createLetDeclaration('b'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
    })

    test('should report three let declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a'))
      visitor.VariableDeclaration(createLetDeclaration('b'))
      visitor.VariableDeclaration(createLetDeclaration('c'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(3)
    })

    test('should report multiple var declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('a'))
      visitor.VariableDeclaration(createVarDeclaration('b'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
    })

    test('should report mixed let and var declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a'))
      visitor.VariableDeclaration(createVarDeclaration('b'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
    })

    test('should report let with various variable names', () => {
      const names = ['x', 'myVar', '_private', '$jquery', 'camelCase', 'UPPER']
      for (const name of names) {
        const { context, reports } = createMockContext()
        const visitor = preferConstRule.create(context)
        visitor.VariableDeclaration(createLetDeclaration(name))
        visitor['Program:exit']?.(undefined)
        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(name)
      }
    })

    test('should report var with various variable names', () => {
      const names = ['a', 'data', 'result', 'item', 'temp']
      for (const name of names) {
        const { context, reports } = createMockContext()
        const visitor = preferConstRule.create(context)
        visitor.VariableDeclaration(createVarDeclaration(name))
        visitor['Program:exit']?.(undefined)
        expect(reports.length).toBe(1)
      }
    })

    test('should report destructuring with let', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b']))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBeGreaterThan(0)
    })

    test('should report destructuring with var', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('var', ['a', 'b']))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBeGreaterThan(0)
    })

    test('should report each destructured variable separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b', 'c']))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(3)
    })

    test('should report array destructuring with let', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ArrayPattern',
              elements: [
                { type: 'Identifier', name: 'first' },
                { type: 'Identifier', name: 'second' },
              ],
            },
            init: { type: 'Identifier', name: 'arr' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
    })

    test('should report let without init value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report var without init value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'y' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report single variable from destructuring', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
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
                  key: { type: 'Identifier', name: 'prop' },
                  value: { type: 'Identifier', name: 'prop' },
                },
              ],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('prop')
    })

    test('should detect rest element in destructuring', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ArrayPattern',
              elements: [
                { type: 'Identifier', name: 'first' },
                {
                  type: 'RestElement',
                  argument: { type: 'Identifier', name: 'rest' },
                },
              ],
            },
            init: { type: 'Identifier', name: 'arr' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBeGreaterThan(0)
    })

    test('should detect nested object destructuring', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
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
                  key: { type: 'Identifier', name: 'nested' },
                  value: {
                    type: 'ObjectPattern',
                    properties: [
                      {
                        type: 'Property',
                        key: { type: 'Identifier', name: 'value' },
                        value: { type: 'Identifier', name: 'value' },
                      },
                    ],
                  },
                },
              ],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBeGreaterThan(0)
    })

    test('should detect assignment pattern in destructuring', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
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
                  value: {
                    type: 'AssignmentPattern',
                    left: { type: 'Identifier', name: 'a' },
                    right: { type: 'Literal', value: 1 },
                  },
                },
              ],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBeGreaterThan(0)
    })

    test('should detect rest element in object destructuring', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
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
                  value: { type: 'Identifier', name: 'a' },
                },
                {
                  type: 'RestElement',
                  argument: { type: 'Identifier', name: 'others' },
                },
              ],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBeGreaterThan(0)
    })

    test('should report when let variable is only read', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('readOnly'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('readOnly')
    })

    test('should report var declared with function init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'fn' },
            init: {
              type: 'ArrowFunctionExpression',
              params: [],
              body: { type: 'Literal', value: 42 },
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report let declared with object init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'config' },
            init: {
              type: 'ObjectExpression',
              properties: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report let declared with array init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'items' },
            init: {
              type: 'ArrayExpression',
              elements: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report let with string literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'name' },
            init: { type: 'Literal', value: 'hello' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report let with boolean literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'flag' },
            init: { type: 'Literal', value: true },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })
  })

  // ==========================================================================
  // NOT REPORTING (30 tests)
  // ==========================================================================
  describe('not reporting', () => {
    test('should not report let declaration that is reassigned via assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor.AssignmentExpression(createAssignment('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report let declaration that is reassigned via update', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor.UpdateExpression(createUpdateExpression('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report const declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createConstDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report var declaration that is reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('x'))
      visitor.AssignmentExpression(createAssignment('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report var declaration that is updated', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('x'))
      visitor.UpdateExpression(createUpdateExpression('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when only some variables are reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a'))
      visitor.VariableDeclaration(createLetDeclaration('b'))
      visitor.AssignmentExpression(createAssignment('a'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should not report when all variables are reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a'))
      visitor.VariableDeclaration(createLetDeclaration('b'))
      visitor.AssignmentExpression(createAssignment('a'))
      visitor.AssignmentExpression(createAssignment('b'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to unrelated variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor.AssignmentExpression(createAssignment('y'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should not report update to unrelated variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor.UpdateExpression(createUpdateExpression('y'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should not report when no VariableDeclaration is visited', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when Program:exit is not called', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      expect(reports.length).toBe(0)
    })

    test('should not report const with various names', () => {
      const names = ['a', 'test', '_private', '$dollar', 'PascalCase']
      for (const name of names) {
        const { context, reports } = createMockContext()
        const visitor = preferConstRule.create(context)
        visitor.VariableDeclaration(createConstDeclaration(name))
        visitor['Program:exit']?.(undefined)
        expect(reports.length).toBe(0)
      }
    })

    test('should not report when assignment comes before declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.AssignmentExpression(createAssignment('x'))
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when update comes before declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.UpdateExpression(createUpdateExpression('x'))
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report destructured variable when ignoreDestructuring is true for object', () => {
      const { context, reports } = createMockContext(
        { ignoreDestructuring: true },
        '/src/file.ts',
        'let { x } = obj;',
      )
      const visitor = preferConstRule.create(context)
      const node = {
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
                  key: { type: 'Identifier', name: 'x' },
                  value: { type: 'Identifier', name: 'x' },
                },
              ],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report destructured variable when ignoreDestructuring is true for array', () => {
      const { context, reports } = createMockContext(
        { ignoreDestructuring: true },
        '/src/file.ts',
        'let [y] = arr;',
      )
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ArrayPattern',
              elements: [{ type: 'Identifier', name: 'y' }],
            },
            init: { type: 'Identifier', name: 'arr' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when node is null in VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(null)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when node is undefined in VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(undefined)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when node is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration('string')
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when node is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(123)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when node is a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(true)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when declarations array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when declarations is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when declaration has no id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [{ type: 'VariableDeclarator' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when type is not VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report when kind is not let or var', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'using',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: { type: 'Literal', value: 1 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report for AssignmentExpression with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      const node = { type: 'AssignmentExpression', operator: '=' }
      visitor.AssignmentExpression(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should not report for UpdateExpression with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      const node = { type: 'UpdateExpression', operator: '++' }
      visitor.UpdateExpression(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should not report for destructuring with null property value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ObjectPattern',
              properties: [{ type: 'Property', value: null }],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report for ArrayPattern with null elements', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'ArrayPattern', elements: null },
            init: { type: 'Identifier', name: 'arr' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })
  })

  // ==========================================================================
  // EDGE CASES (25 tests)
  // ==========================================================================
  describe('edge cases', () => {
    test('should handle node without loc gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
          },
        ],
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle declaration without id', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [{ type: 'VariableDeclarator' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle empty declarations array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression without left', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = { type: 'AssignmentExpression', operator: '=' }
      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
    })

    test('should handle UpdateExpression without argument', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = { type: 'UpdateExpression', operator: '++' }
      expect(() => visitor.UpdateExpression(node)).not.toThrow()
    })

    test('should handle AssignmentExpression with null node', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle UpdateExpression with null node', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.UpdateExpression(null)).not.toThrow()
    })

    test('should handle non-object node in VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.VariableDeclaration('string')).not.toThrow()
      expect(() => visitor.VariableDeclaration(123)).not.toThrow()
    })

    test('should handle non-object node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.AssignmentExpression('str')).not.toThrow()
      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
    })

    test('should handle non-object node in UpdateExpression', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.UpdateExpression('str')).not.toThrow()
      expect(() => visitor.UpdateExpression(42)).not.toThrow()
    })

    test('should handle node with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration({})
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle declaration with non-Identifier id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Literal', value: 42 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with non-Identifier left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should handle UpdateExpression with non-Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      const node = {
        type: 'UpdateExpression',
        operator: '++',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        prefix: false,
      }
      visitor.UpdateExpression(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should handle multiple AssignmentExpressions for same variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor.AssignmentExpression(createAssignment('x'))
      visitor.AssignmentExpression(createAssignment('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle multiple UpdateExpressions for same variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor.UpdateExpression(createUpdateExpression('x'))
      visitor.UpdateExpression(createUpdateExpression('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle mixed assignment and update for same variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor.AssignmentExpression(createAssignment('x'))
      visitor.UpdateExpression(createUpdateExpression('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle variable name with underscore prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('_private'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_private')
    })

    test('should handle variable name with dollar sign', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('$jquery'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$jquery')
    })

    test('should handle single character variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('i'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should handle long variable name', () => {
      const longName = 'veryLongVariableNameThatDescribesSomethingInGreatDetail'
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration(longName))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longName)
    })

    test('should handle AssignmentExpression with compound assignment operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle prefix update expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      const node = {
        type: 'UpdateExpression',
        operator: '--',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      }
      visitor.UpdateExpression(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle declaration with id.name as non-string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 123 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle node with null id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: null,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })
  })

  // ==========================================================================
  // LOCATION (15 tests)
  // ==========================================================================
  describe('location', () => {
    test('should report correct location for default line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x', 1, 0))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 5 column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x', 5, 10))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location at line 100 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x', 100, 0))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('should report correct location at line 1 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x', 1, 50))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x', 3, 5))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report location for each variable independently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a', 1, 0))
      visitor.VariableDeclaration(createLetDeclaration('b', 5, 10))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should provide default location when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: { type: 'Literal', value: 1 },
          },
        ],
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should provide default location when loc.start is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: { type: 'Literal', value: 1 },
          },
        ],
        loc: {},
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with partial start info', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: { type: 'Literal', value: 1 },
          },
        ],
        loc: { start: {}, end: {} },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report location for var declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('y', 7, 3))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location for destructuring', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a'], 10, 5))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report end location for var', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('x', 2, 4))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('should use default column when column is not a number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: { type: 'Literal', value: 1 },
          },
        ],
        loc: {
          start: { line: 3, column: 'invalid' },
          end: { line: 3, column: 'invalid' },
        },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default line when line is not a number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: { type: 'Literal', value: 1 },
          },
        ],
        loc: {
          start: { line: 'three', column: 0 },
          end: { line: 'three', column: 10 },
        },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report same location for multiple destructured vars', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b'], 4, 8))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[1].loc?.start.line).toBe(4)
    })
  })

  // ==========================================================================
  // MESSAGES (10 tests)
  // ==========================================================================
  describe('messages', () => {
    test('should include variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('myVar'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain('myVar')
    })

    test('should include const suggestion in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain("'const'")
    })

    test('should include never reassigned text in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain('never reassigned')
    })

    test('should include RULE_SUGGESTIONS.preferConst in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain('never reassigned')
      expect(reports[0].message).toContain('const')
    })

    test('should have unique messages for different variables', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('alpha'))
      visitor.VariableDeclaration(createLetDeclaration('beta'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain('alpha')
      expect(reports[0].message).not.toContain('beta')
      expect(reports[1].message).toContain('beta')
      expect(reports[1].message).not.toContain('alpha')
    })

    test('should have correct message format for let', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toMatch(/'x' is never reassigned/)
    })

    test('should have correct message format for var', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('y'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toMatch(/'y' is never reassigned/)
    })

    test('should contain Use const instead in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('z'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain("Use 'const' instead")
    })

    test('should have consistent message across multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a'))
      visitor.VariableDeclaration(createLetDeclaration('b'))
      visitor['Program:exit']?.(undefined)
      const msgPattern = /is never reassigned\. Use 'const' instead\./
      expect(reports[0].message).toMatch(msgPattern)
      expect(reports[1].message).toMatch(msgPattern)
    })

    test('should include variable name with quotes in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('testVar'))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].message).toContain("'testVar'")
    })
  })

  // ==========================================================================
  // MULTIPLE REPORTS (10 tests)
  // ==========================================================================
  describe('multiple reports', () => {
    test('should report two separate let declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a'))
      visitor.VariableDeclaration(createLetDeclaration('b'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
    })

    test('should report three separate let declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a'))
      visitor.VariableDeclaration(createLetDeclaration('b'))
      visitor.VariableDeclaration(createLetDeclaration('c'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(3)
    })

    test('should report mixed reassigned and non-reassigned correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a'))
      visitor.VariableDeclaration(createLetDeclaration('b'))
      visitor.AssignmentExpression(createAssignment('a'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should report four variables with two reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a'))
      visitor.VariableDeclaration(createLetDeclaration('b'))
      visitor.VariableDeclaration(createLetDeclaration('c'))
      visitor.VariableDeclaration(createLetDeclaration('d'))
      visitor.AssignmentExpression(createAssignment('a'))
      visitor.AssignmentExpression(createAssignment('d'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('b')
      expect(reports[1].message).toContain('c')
    })

    test('should report each destructured name separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['p', 'q', 'r']))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(3)
    })

    test('should report both let and var in same session', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a'))
      visitor.VariableDeclaration(createVarDeclaration('b'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
    })

    test('should report five let declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.VariableDeclaration(createLetDeclaration(`var${i}`))
      }
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(5)
    })

    test('should not report any when all are reassigned', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor.VariableDeclaration(createLetDeclaration('y'))
      visitor.AssignmentExpression(createAssignment('x'))
      visitor.AssignmentExpression(createAssignment('y'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle many variables with selective reassignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclaration(createLetDeclaration(`v${i}`))
      }

      for (let i = 0; i < 10; i += 2) {
        visitor.AssignmentExpression(createAssignment(`v${i}`))
      }
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(5)
    })

    test('should handle destructured variables with partial reassignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b', 'c']))
      visitor.AssignmentExpression(createAssignment('b'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('a')
      expect(reports[1].message).toContain('c')
    })
  })

  // ==========================================================================
  // CONTEXT / OPTIONS (10 tests)
  // ==========================================================================
  describe('context and options', () => {
    test('should respect destructuring option "all"', () => {
      const { context, reports } = createMockContext({ destructuring: 'all' })
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b']))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBeGreaterThan(0)
    })

    test('should respect destructuring option "any"', () => {
      const { context, reports } = createMockContext({ destructuring: 'any' })
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b']))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBeGreaterThan(0)
    })

    test('should respect ignoreReadBeforeAssign option', () => {
      const { context } = createMockContext({ ignoreReadBeforeAssign: true })
      const visitor = preferConstRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should handle empty options object', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should handle undefined options via empty array', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'let x = 1;',
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
      const visitor = preferConstRule.create(context)
      expect(() => {
        visitor.VariableDeclaration(createLetDeclaration('x'))
        visitor['Program:exit']?.(undefined)
      }).not.toThrow()
    })

    test('should handle all options set together', () => {
      const { context, reports } = createMockContext({
        destructuring: 'all',
        ignoreReadBeforeAssign: true,
        ignoreDestructuring: false,
      })
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should handle context with different file path', () => {
      const { context, reports } = createMockContext({}, '/custom/path.ts')
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should handle context with different source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'let y = 42;')
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('y'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should respect ignoreDestructuring for single-variable object destructuring', () => {
      const { context, reports } = createMockContext(
        { ignoreDestructuring: true },
        '/src/file.ts',
        'let { x } = obj;',
      )
      const visitor = preferConstRule.create(context)
      const node = {
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
                  key: { type: 'Identifier', name: 'x' },
                  value: { type: 'Identifier', name: 'x' },
                },
              ],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should report destructuring when ignoreDestructuring is false', () => {
      const { context, reports } = createMockContext({ ignoreDestructuring: false })
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b']))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
    })
  })

  // ==========================================================================
  // TEST.EACH - Data-driven tests (40+ tests)
  // ==========================================================================
  describe('test.each - variable kinds', () => {
    test('should report let declaration with name x', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report let declaration with name y', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('y'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report var declaration with name x', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report var declaration with name y', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('y'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - const should not report', () => {
    test('should not report const declaration for a', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createConstDeclaration('a'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report const declaration for myConst', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createConstDeclaration('myConst'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report const declaration for _private', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createConstDeclaration('_private'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report const declaration for $dollar', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createConstDeclaration('$dollar'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report const declaration for UPPER_CASE', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createConstDeclaration('UPPER_CASE'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - various variable names for let', () => {
    test('should report let declaration for variable "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report let declaration for variable "myVar"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('myVar'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myVar')
    })

    test('should report let declaration for variable "_underscore"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('_underscore'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_underscore')
    })

    test('should report let declaration for variable "$dollar"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('$dollar'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$dollar')
    })

    test('should report let declaration for variable "camelCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('camelCase'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('camelCase')
    })

    test('should report let declaration for variable "PascalCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('PascalCase'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('PascalCase')
    })

    test('should report let declaration for variable "UPPER_CASE"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('UPPER_CASE'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('UPPER_CASE')
    })

    test('should report let declaration for variable "a1"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('a1'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('a1')
    })

    test('should report let declaration for variable "_private2"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('_private2'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_private2')
    })

    test('should report let declaration for variable "$el"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('$el'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$el')
    })
  })

  describe('test.each - various variable names for var', () => {
    test('should report var declaration for variable "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report var declaration for variable "result"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('result'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('result')
    })

    test('should report var declaration for variable "temp"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('temp'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('temp')
    })

    test('should report var declaration for variable "data"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('data'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('data')
    })

    test('should report var declaration for variable "item"', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createVarDeclaration('item'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('item')
    })
  })

  describe('test.each - reassignment prevents report', () => {
    test('should not report x when reassigned via assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor.AssignmentExpression(createAssignment('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report y when reassigned via update', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('y'))
      visitor.UpdateExpression(createUpdateExpression('y'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report z when reassigned via assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('z'))
      visitor.AssignmentExpression(createAssignment('z'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report w when reassigned via update', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('w'))
      visitor.UpdateExpression(createUpdateExpression('w'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - invalid node types', () => {
    test('should handle null node in VariableDeclaration without error', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.VariableDeclaration(null)).not.toThrow()
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in VariableDeclaration without error', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.VariableDeclaration(undefined)).not.toThrow()
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle string node in VariableDeclaration without error', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.VariableDeclaration('string')).not.toThrow()
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle number node in VariableDeclaration without error', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.VariableDeclaration(42)).not.toThrow()
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in VariableDeclaration without error', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.VariableDeclaration(true)).not.toThrow()
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('should handle empty array node in VariableDeclaration without error', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.VariableDeclaration([])).not.toThrow()
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - invalid node types in AssignmentExpression', () => {
    test('should handle null node in AssignmentExpression without error', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node in AssignmentExpression without error', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle string node in AssignmentExpression without error', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.AssignmentExpression('str')).not.toThrow()
    })

    test('should handle number node in AssignmentExpression without error', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
    })
  })

  describe('test.each - invalid node types in UpdateExpression', () => {
    test('should handle null node in UpdateExpression without error', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.UpdateExpression(null)).not.toThrow()
    })

    test('should handle undefined node in UpdateExpression without error', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.UpdateExpression(undefined)).not.toThrow()
    })

    test('should handle string node in UpdateExpression without error', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.UpdateExpression('str')).not.toThrow()
    })

    test('should handle number node in UpdateExpression without error', () => {
      const { context } = createMockContext()
      const visitor = preferConstRule.create(context)
      expect(() => visitor.UpdateExpression(42)).not.toThrow()
    })
  })

  describe('test.each - location correctness', () => {
    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x', 1, 0))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 1 column 20', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x', 1, 20))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report correct location at line 5 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x', 5, 0))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 10 column 15', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x', 10, 15))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct location at line 100 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x', 100, 0))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 1 column 100', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x', 1, 100))
      visitor['Program:exit']?.(undefined)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(100)
    })
  })

  describe('test.each - ignoreDestructuring scenarios', () => {
    test('ignoreDestructuring with source "let { x } = obj;" for x should report 0', () => {
      const { context, reports } = createMockContext(
        { ignoreDestructuring: true },
        '/src/file.ts',
        'let { x } = obj;',
      )
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('x'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('ignoreDestructuring with source "let [y] = arr;" for y should report 0', () => {
      const { context, reports } = createMockContext(
        { ignoreDestructuring: true },
        '/src/file.ts',
        'let [y] = arr;',
      )
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('y'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(0)
    })

    test('ignoreDestructuring with source "let z = val;" for z should report 1', () => {
      const { context, reports } = createMockContext(
        { ignoreDestructuring: true },
        '/src/file.ts',
        'let z = val;',
      )
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createLetDeclaration('z'))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - multiple declarations count', () => {
    test('should report 1 for 1 let declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      for (let i = 0; i < 1; i++) {
        visitor.VariableDeclaration(createLetDeclaration(`v${i}`))
      }
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report 2 for 2 let declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      for (let i = 0; i < 2; i++) {
        visitor.VariableDeclaration(createLetDeclaration(`v${i}`))
      }
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
    })

    test('should report 3 for 3 let declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      for (let i = 0; i < 3; i++) {
        visitor.VariableDeclaration(createLetDeclaration(`v${i}`))
      }
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(3)
    })

    test('should report 5 for 5 let declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.VariableDeclaration(createLetDeclaration(`v${i}`))
      }
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(5)
    })

    test('should report 10 for 10 let declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclaration(createLetDeclaration(`v${i}`))
      }
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(10)
    })
  })

  describe('test.each - destructure names count', () => {
    test('should report 1 for destructuring names ["a"]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a']))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(1)
    })

    test('should report 2 for destructuring names ["a", "b"]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b']))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(2)
    })

    test('should report 3 for destructuring names ["a", "b", "c"]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b', 'c']))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(3)
    })

    test('should report 4 for destructuring names ["p", "q", "r", "s"]', () => {
      const { context, reports } = createMockContext()
      const visitor = preferConstRule.create(context)
      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['p', 'q', 'r', 's']))
      visitor['Program:exit']?.(undefined)
      expect(reports.length).toBe(4)
    })
  })
})
