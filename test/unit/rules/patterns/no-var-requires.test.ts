import { describe, test, expect, vi } from 'vitest'
import { noVarRequiresRule } from '../../../../src/rules/patterns/no-var-requires.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'var x = require("lodash");',
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

function createVarRequireDeclaration(moduleName: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
        },
        init: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'require',
          },
          arguments: [
            {
              type: 'Literal',
              value: moduleName,
            },
          ],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createLetRequireDeclaration(moduleName: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'let',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
        },
        init: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'require',
          },
          arguments: [
            {
              type: 'Literal',
              value: moduleName,
            },
          ],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createConstRequireDeclaration(moduleName: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
        },
        init: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'require',
          },
          arguments: [
            {
              type: 'Literal',
              value: moduleName,
            },
          ],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createVarNonRequireDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
        },
        init: {
          type: 'Literal',
          value: 42,
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createNonVarDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name: 'test',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('no-var-requires rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noVarRequiresRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noVarRequiresRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noVarRequiresRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noVarRequiresRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noVarRequiresRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noVarRequiresRule.meta.fixable).toBeUndefined()
    })

    test('should mention require in description', () => {
      expect(noVarRequiresRule.meta.docs?.description.toLowerCase()).toContain('require')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclaration')
    })
  })

  describe('detecting var requires', () => {
    test('should report var with require', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('require')
    })

    test('should not report let with require', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createLetRequireDeclaration('lodash'))

      expect(reports.length).toBe(0)
    })

    test('should not report const with require', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createConstRequireDeclaration('lodash'))

      expect(reports.length).toBe(0)
    })

    test('should not report var without require', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarNonRequireDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should not report non-variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createNonVarDeclaration())

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allow', () => {
    test('should allow require for allowed modules', () => {
      const { context, reports } = createMockContext({ allow: ['lodash'] })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))

      expect(reports.length).toBe(0)
    })

    test('should still report require for non-allowed modules', () => {
      const { context, reports } = createMockContext({ allow: ['lodash'] })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('underscore'))

      expect(reports.length).toBe(1)
    })

    test('should allow multiple modules', () => {
      const { context, reports } = createMockContext({ allow: ['lodash', 'underscore'] })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      visitor.VariableDeclaration(createVarRequireDeclaration('underscore'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      expect(() => visitor.VariableDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      expect(() => visitor.VariableDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      expect(() => visitor.VariableDeclaration('string')).not.toThrow()
      expect(() => visitor.VariableDeclaration(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: 'x',
            },
            init: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'require',
              },
              arguments: [
                {
                  type: 'Literal',
                  value: 'lodash',
                },
              ],
            },
          },
        ],
      }

      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
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
        getSource: () => 'var x = require("lodash");',
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

      const visitor = noVarRequiresRule.create(context)

      expect(() => visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle require without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: 'x',
            },
            init: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'require',
              },
              arguments: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle require with non-string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: 'x',
            },
            init: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'require',
              },
              arguments: [
                {
                  type: 'Identifier',
                  name: 'moduleName',
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-require function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: 'x',
            },
            init: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'someOtherFunction',
              },
              arguments: [
                {
                  type: 'Literal',
                  value: 'lodash',
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention import in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))

      expect(reports[0].message.toLowerCase()).toContain('import')
    })

    test('should mention ES6 in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))

      expect(reports[0].message).toContain('ES6')
    })

    test('should mention tree shaking in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))

      expect(reports[0].message.toLowerCase()).toContain('tree shaking')
    })
  })
})
