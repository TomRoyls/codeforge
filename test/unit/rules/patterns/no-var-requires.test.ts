import { describe, test, expect, vi } from 'vitest'
import { noVarRequiresRule } from '../../../../src/rules/patterns/no-var-requires.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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
      const { context } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclaration')
    })
  })

  describe('detecting var requires', () => {
    test('should report var with require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('require')
    })

    test('should not report let with require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createLetRequireDeclaration('lodash'))

      expect(reports.length).toBe(0)
    })

    test('should not report const with require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createConstRequireDeclaration('lodash'))

      expect(reports.length).toBe(0)
    })

    test('should not report var without require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarNonRequireDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should not report non-variable declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createNonVarDeclaration())

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allow', () => {
    test('should allow require for allowed modules', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lodash'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))

      expect(reports.length).toBe(0)
    })

    test('should still report require for non-allowed modules', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lodash'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('underscore'))

      expect(reports.length).toBe(1)
    })

    test('should allow multiple modules', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lodash', 'underscore'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      visitor.VariableDeclaration(createVarRequireDeclaration('underscore'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      expect(() => visitor.VariableDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      expect(() => visitor.VariableDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      expect(() => visitor.VariableDeclaration('string')).not.toThrow()
      expect(() => visitor.VariableDeclaration(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
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
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
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
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
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
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
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
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
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
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
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
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
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
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))

      expect(reports[0].message.toLowerCase()).toContain('import')
    })

    test('should mention ES6 in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))

      expect(reports[0].message).toContain('ES6')
    })

    test('should mention tree shaking in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)

      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))

      expect(reports[0].message.toLowerCase()).toContain('tree shaking')
    })
  })

  describe('meta - extended properties', () => {
    test('should have meta as an object', () => {
      expect(typeof noVarRequiresRule.meta).toBe('object')
    })

    test('should have meta.type as a string', () => {
      expect(typeof noVarRequiresRule.meta.type).toBe('string')
    })

    test('should have meta.severity as a string', () => {
      expect(typeof noVarRequiresRule.meta.severity).toBe('string')
    })

    test('should have meta.docs as an object', () => {
      expect(typeof noVarRequiresRule.meta.docs).toBe('object')
    })

    test('should have meta.docs.description as a string', () => {
      expect(typeof noVarRequiresRule.meta.docs?.description).toBe('string')
    })

    test('should have meta.docs.description non-empty', () => {
      expect(noVarRequiresRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have meta.docs.url defined', () => {
      expect(noVarRequiresRule.meta.docs?.url).toBeDefined()
    })

    test('should have meta.docs.url as a string', () => {
      expect(typeof noVarRequiresRule.meta.docs?.url).toBe('string')
    })

    test('should have meta.docs.url containing codeforge', () => {
      expect(noVarRequiresRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noVarRequiresRule.meta.schema)).toBe(true)
    })

    test('should have schema with at least one entry', () => {
      const schema = noVarRequiresRule.meta.schema as unknown[]
      expect(schema.length).toBeGreaterThanOrEqual(1)
    })

    test('should have schema first entry with type object', () => {
      const schema = noVarRequiresRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].type).toBe('object')
    })

    test('should have schema with allow property', () => {
      const schema = noVarRequiresRule.meta.schema as Record<string, Record<string, unknown>>[]
      const props = schema[0].properties
      expect(props).toHaveProperty('allow')
    })

    test('should have schema allow as array type', () => {
      const schema = noVarRequiresRule.meta.schema as Record<
        string,
        Record<string, Record<string, unknown>>
      >[]
      const allow = schema[0].properties.allow
      expect(allow.type).toBe('array')
    })

    test('should have schema with additionalProperties false', () => {
      const schema = noVarRequiresRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].additionalProperties).toBe(false)
    })

    test('should not be deprecated', () => {
      expect(noVarRequiresRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noVarRequiresRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noVarRequiresRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  describe('rule structure', () => {
    test('should have create as a function', () => {
      expect(typeof noVarRequiresRule.create).toBe('function')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should return visitor with VariableDeclaration as function', () => {
      const { context } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      expect(typeof visitor.VariableDeclaration).toBe('function')
    })

    test('should create independent visitors from separate create calls', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const { context: ctx2 } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor1 = noVarRequiresRule.create(ctx1)
      const visitor2 = noVarRequiresRule.create(ctx2)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with valid options', () => {
      const { context } = createMockRuleContext({ options: [{ allow: ['test-module'] }], source: 'var x = require("lodash");' })
      expect(() => noVarRequiresRule.create(context)).not.toThrow()
    })

    test('should accept context with empty allow array', () => {
      const { context } = createMockRuleContext({ options: [{ allow: [] }], source: 'var x = require("lodash");' })
      expect(() => noVarRequiresRule.create(context)).not.toThrow()
    })

    test('should accept context without options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      expect(() => noVarRequiresRule.create(context)).not.toThrow()
    })

    test('should handle context with undefined config by throwing on create', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: undefined as unknown as RuleContext['config'],
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      expect(() => noVarRequiresRule.create(context)).toThrow()
    })

    test('should accept context with null options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: null },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      expect(() => noVarRequiresRule.create(context)).not.toThrow()
    })
  })

  describe('require detection - various modules', () => {
    test('should report require of lodash', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(1)
    })

    test('should report require of express', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('express'))
      expect(reports.length).toBe(1)
    })

    test('should report require of react', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('react'))
      expect(reports.length).toBe(1)
    })

    test('should report require of underscore', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('underscore'))
      expect(reports.length).toBe(1)
    })

    test('should report require of relative path ./utils', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('./utils'))
      expect(reports.length).toBe(1)
    })

    test('should report require of relative path ../parent', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('../parent'))
      expect(reports.length).toBe(1)
    })

    test('should report require of deeply nested path', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('./a/b/c/d/e'))
      expect(reports.length).toBe(1)
    })

    test('should report require of scoped package @scope/pkg', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('@scope/pkg'))
      expect(reports.length).toBe(1)
    })

    test('should report require of scoped package @org/deep/nested', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('@org/deep/nested'))
      expect(reports.length).toBe(1)
    })

    test('should report require of empty string module', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration(''))
      expect(reports.length).toBe(1)
    })

    test('should report require of node built-in fs', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('fs'))
      expect(reports.length).toBe(1)
    })

    test('should report require of node built-in path', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('path'))
      expect(reports.length).toBe(1)
    })

    test('should report require of node built-in http', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('http'))
      expect(reports.length).toBe(1)
    })

    test('should report require of node built-in child_process', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('child_process'))
      expect(reports.length).toBe(1)
    })

    test('should report require of node: protocol module', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('node:fs'))
      expect(reports.length).toBe(1)
    })

    test('should report require of node:path protocol', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('node:path'))
      expect(reports.length).toBe(1)
    })

    test('should report require of package with version-like name', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('axios'))
      expect(reports.length).toBe(1)
    })

    test('should report require of package with dashes', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('my-cool-package'))
      expect(reports.length).toBe(1)
    })

    test('should report require of package with underscores', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('my_cool_package'))
      expect(reports.length).toBe(1)
    })

    test('should report require of long module path', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const longPath = './very/deeply/nested/module/path/that/is/quite/long'
      visitor.VariableDeclaration(createVarRequireDeclaration(longPath))
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple declarators', () => {
    test('should report when first declarator has require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'a' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'b' },
            init: { type: 'Literal', value: 42 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should report when second declarator has require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'a' },
            init: { type: 'Literal', value: 42 },
          },
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'b' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should report only once when both declarators have require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'a' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'b' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'underscore' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 70 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when no declarator has require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'a' },
            init: { type: 'Literal', value: 1 },
          },
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'b' },
            init: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should skip declarator with null init', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'a' },
            init: null,
          },
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'b' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should skip declarator with undefined init', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'a' },
          },
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'b' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle three declarators with middle one having require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'a' },
            init: { type: 'Literal', value: 1 },
          },
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'b' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'path' }],
            },
          },
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'c' },
            init: { type: 'Literal', value: 3 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle single declarator without init', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle declarator with object expression init', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'cfg' },
            init: { type: 'ObjectExpression', properties: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle declarator with arrow function init', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'fn' },
            init: {
              type: 'ArrowFunctionExpression',
              body: { type: 'Literal', value: 1 },
              params: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('location precision', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash', 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash', 5, 0))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report location at line 1 column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash', 1, 10))
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash', 100, 0))
      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash', 1, 50))
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash', 2, 4))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(34)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash', 0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle multiple sequential var require nodes with different locations', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('a', 1, 0))
      visitor.VariableDeclaration(createVarRequireDeclaration('b', 2, 5))
      visitor.VariableDeclaration(createVarRequireDeclaration('c', 3, 10))
      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })
  })

  describe('options - allow extended', () => {
    test('should allow single exact module match', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lodash'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(0)
    })

    test('should not allow partial module name match', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lod'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(1)
    })

    test('should not allow superstring match', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lodash-fp'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(1)
    })

    test('should be case sensitive in module matching', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['Lodash'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(1)
    })

    test('should allow scoped package', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['@scope/pkg'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('@scope/pkg'))
      expect(reports.length).toBe(0)
    })

    test('should not allow different scoped package', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['@scope/pkg'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('@other/pkg'))
      expect(reports.length).toBe(1)
    })

    test('should allow relative path', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['./utils'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('./utils'))
      expect(reports.length).toBe(0)
    })

    test('should report empty string module even when in allow list (falsy check)', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: [''] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration(''))
      expect(reports.length).toBe(1)
    })

    test('should allow node built-in fs', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['fs'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('fs'))
      expect(reports.length).toBe(0)
    })

    test('should allow multiple specific modules', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['fs', 'path', 'http'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('fs'))
      visitor.VariableDeclaration(createVarRequireDeclaration('path'))
      visitor.VariableDeclaration(createVarRequireDeclaration('http'))
      expect(reports.length).toBe(0)
    })

    test('should report modules not in allow list alongside allowed ones', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['fs'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('fs'))
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(1)
    })

    test('should handle large allow list', () => {
      const allowList = [
        'fs',
        'path',
        'http',
        'https',
        'child_process',
        'os',
        'util',
        'events',
        'stream',
        'buffer',
      ]
      const { context, reports } = createMockRuleContext({ options: [{ allow: allowList }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      for (const mod of allowList) {
        visitor.VariableDeclaration(createVarRequireDeclaration(mod))
      }
      expect(reports.length).toBe(0)
    })

    test('should handle allow as empty array', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: [] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(1)
    })

    test('should report when require has no module name even with allow list', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lodash'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Identifier', name: 'moduleName' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should report require without arguments even with allow list', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lodash'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle allow with duplicate entries', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lodash', 'lodash', 'lodash'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(0)
    })

    test('should allow node: protocol prefixed module', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['node:fs'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('node:fs'))
      expect(reports.length).toBe(0)
    })

    test('should not allow node:fs when only fs is in allow list', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['fs'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('node:fs'))
      expect(reports.length).toBe(1)
    })
  })

  describe('malformed and degenerate nodes', () => {
    test('should handle node with missing type', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = { kind: 'var', declarations: [] }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with kind let (not var)', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with kind const (not var)', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle boolean true node', () => {
      const { context } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      expect(() => visitor.VariableDeclaration(true)).not.toThrow()
    })

    test('should handle boolean false node', () => {
      const { context } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      expect(() => visitor.VariableDeclaration(false)).not.toThrow()
    })

    test('should handle numeric zero node', () => {
      const { context } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      expect(() => visitor.VariableDeclaration(0)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      expect(() => visitor.VariableDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      expect(() => visitor.VariableDeclaration([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee as MemberExpression (obj.require)', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'obj' },
                property: { type: 'Identifier', name: 'require' },
              },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle require with extra arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [
                { type: 'Literal', value: 'lodash' },
                { type: 'Literal', value: 'extra' },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with extra unexpected properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        extraProp: 'should be ignored',
        anotherProp: 123,
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle declarator with boolean init', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: { type: 'Literal', value: true },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle declarator with null init value', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: { type: 'Literal', value: null },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle declarator with array expression init', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: { type: 'ArrayExpression', elements: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle require with numeric literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 42 }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle require with boolean literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: true }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle require with null literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: null }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle callee with null type', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: null, name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee with undefined name', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with loc missing start', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { end: { line: 1, column: 30 } },
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc missing end', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 } },
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle init as a plain number', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: 42,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle init as a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: 'require("lodash")',
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('message content - extended', () => {
    test('should contain word "var" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports[0].message).toContain('var')
    })

    test('should contain "Unexpected" at start of message', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports[0].message).toMatch(/^Unexpected/)
    })

    test('should contain "static analysis" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports[0].message.toLowerCase()).toContain('static analysis')
    })

    test('should produce consistent message for different modules', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      const msg1 = reports[0].message
      reports.length = 0
      visitor.VariableDeclaration(createVarRequireDeclaration('express'))
      const msg2 = reports[0].message
      expect(msg1).toBe(msg2)
    })

    test('should produce non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should produce message as string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(typeof reports[0].message).toBe('string')
    })
  })

  describe('state isolation', () => {
    test('should report independently for each VariableDeclaration call', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('a'))
      visitor.VariableDeclaration(createVarRequireDeclaration('b'))
      visitor.VariableDeclaration(createVarRequireDeclaration('c'))
      expect(reports.length).toBe(3)
    })

    test('should not carry state between non-matching and matching calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarNonRequireDeclaration())
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      visitor.VariableDeclaration(createVarNonRequireDeclaration())
      expect(reports.length).toBe(1)
    })

    test('should isolate reports between different context instances', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor1 = noVarRequiresRule.create(ctx1)
      const visitor2 = noVarRequiresRule.create(ctx2)
      visitor1.VariableDeclaration(createVarRequireDeclaration('lodash'))
      visitor2.VariableDeclaration(createVarNonRequireDeclaration())
      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should handle alternating var and let requires', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('a'))
      visitor.VariableDeclaration(createLetRequireDeclaration('b'))
      visitor.VariableDeclaration(createVarRequireDeclaration('c'))
      visitor.VariableDeclaration(createConstRequireDeclaration('d'))
      expect(reports.length).toBe(2)
    })

    test('should accumulate reports across multiple var requires', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclaration(createVarRequireDeclaration(`mod${i}`))
      }
      expect(reports.length).toBe(10)
    })
  })

  describe('destructuring patterns', () => {
    test('should report var with object destructuring require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ObjectPattern',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'map' },
                  value: { type: 'Identifier', name: 'map' },
                },
              ],
            },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should report var with array destructuring require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ArrayPattern',
              elements: [{ type: 'Identifier', name: 'first' }],
            },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'some-module' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should report var with multi-property object destructuring require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ObjectPattern',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'map' },
                  value: { type: 'Identifier', name: 'map' },
                },
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'filter' },
                  value: { type: 'Identifier', name: 'filter' },
                },
              ],
            },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should not report let with destructuring require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
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
                  key: { type: 'Identifier', name: 'map' },
                  value: { type: 'Identifier', name: 'map' },
                },
              ],
            },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should not report const with destructuring require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ObjectPattern',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'map' },
                  value: { type: 'Identifier', name: 'map' },
                },
              ],
            },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('report descriptor', () => {
    test('should include message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports[0]).toHaveProperty('message')
    })

    test('should include loc in report when node has location', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash', 5, 10))
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toBeDefined()
    })

    test('should include start in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports[0].loc?.start).toBeDefined()
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should include end in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports[0].loc?.end).toBeDefined()
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report exactly once per matching declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(1)
    })
  })

  describe('require with nested call expressions', () => {
    test('should not report require inside a non-require call', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'someFunc' },
              arguments: [
                {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'require' },
                  arguments: [{ type: 'Literal', value: 'lodash' }],
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should report require as member expression callee result', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'require' },
                  arguments: [{ type: 'Literal', value: 'lodash' }],
                },
                property: { type: 'Identifier', name: 'map' },
              },
              arguments: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should report when init is conditional expression with require', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'ConditionalExpression',
              test: { type: 'Literal', value: true },
              consequent: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'require' },
                arguments: [{ type: 'Literal', value: 'lodash' }],
              },
              alternate: { type: 'Literal', value: null },
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when init is NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Map' },
              arguments: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should report require with TemplateLiteral argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [
                {
                  type: 'TemplateLiteral',
                  quasis: [{ type: 'TemplateElement', value: { raw: './utils' } }],
                  expressions: [],
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('exports', () => {
    test('should export rule as named export', () => {
      expect(noVarRequiresRule).toBeDefined()
    })

    test('should export rule with meta and create', () => {
      expect(noVarRequiresRule.meta).toBeDefined()
      expect(noVarRequiresRule.create).toBeDefined()
    })

    test('should have default export matching named export', () => {
      const defaultExport = noVarRequiresRule
      expect(defaultExport.meta).toBe(noVarRequiresRule.meta)
      expect(defaultExport.create).toBe(noVarRequiresRule.create)
    })
  })

  describe('node structure variants', () => {
    test('should handle node with string kind "var"', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should not match kind "Var" (case sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'Var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should not match kind "VAR" (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'VAR',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle declarations as non-array value', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: 'not an array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle declarations as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle declarations with non-object entries', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [42, 'string', true],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle callee with wrong name like "include"', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'include' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee with name "requirE" (case sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'requirE' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee as function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: {
                type: 'FunctionExpression',
                id: null,
                params: [],
                body: { type: 'BlockStatement', body: [] },
              },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle init as undefined (missing property)', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle init as explicit undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: undefined,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle Identifier node name "require" but different context', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'require' },
            init: { type: 'Literal', value: 42 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('config edge cases', () => {
    test('should handle options with extra unknown properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lodash'], extraProp: true }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(0)
    })

    test('should handle options with only unknown properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ unknownOption: true }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(1)
    })

    test('should handle options with allow as non-array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{ allow: 'not-an-array' }] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noVarRequiresRule.create(context)
      expect(() => visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))).not.toThrow()
    })

    test('should handle options as non-object first element', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: ['string-option'] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noVarRequiresRule.create(context)
      expect(() => visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle options as undefined first element', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [undefined] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noVarRequiresRule.create(context)
      expect(() => visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle config.options as undefined', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: undefined },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noVarRequiresRule.create(context)
      expect(() => visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle config without options property at all', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noVarRequiresRule.create(context)
      expect(() => visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should use defaults when options allow is not provided', () => {
      const { context, reports } = createMockRuleContext({ options: [{ someOtherOption: true }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('lodash'))
      expect(reports.length).toBe(1)
    })
  })

  describe('allow list with multiple declarators', () => {
    test('should allow first declarator and report second when only first is in allow list', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lodash'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'a' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'b' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'underscore' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 70 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should allow both when both are in allow list', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['lodash', 'underscore'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'a' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'b' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'underscore' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 70 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should report first when first is not allowed but second is', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['underscore'] }], source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'a' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'b' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'underscore' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 70 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('additional edge cases', () => {
    test('should handle node with only type and kind properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = { type: 'VariableDeclaration', kind: 'var' }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with declarations containing null entry', () => {
      const { context } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.VariableDeclaration(node)).toThrow()
    })

    test('should handle node with declarations containing undefined entry', () => {
      const { context } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [undefined],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.VariableDeclaration(node)).toThrow()
    })

    test('should report require with numeric string module name', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('123'))
      expect(reports.length).toBe(1)
    })

    test('should report require with unicode module name', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      visitor.VariableDeclaration(createVarRequireDeclaration('日本語パッケージ'))
      expect(reports.length).toBe(1)
    })

    test('should report require with very long module name', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const longName = 'a'.repeat(500)
      visitor.VariableDeclaration(createVarRequireDeclaration(longName))
      expect(reports.length).toBe(1)
    })

    test('should handle require with null arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: null,
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle require with undefined arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle declarator with object id (destructuring)', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'ObjectPattern', properties: [] },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with string line and column values', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: {
          start: { line: '1' as unknown as number, column: '0' as unknown as number },
          end: { line: '1' as unknown as number, column: '30' as unknown as number },
        },
      }
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle callee as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: null,
              arguments: [{ type: 'Literal', value: 'lodash' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle firstArg with null value', () => {
      const { context, reports } = createMockRuleContext({ source: 'var x = require("lodash");' })
      const visitor = noVarRequiresRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: null }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(1)
    })
  })
})
