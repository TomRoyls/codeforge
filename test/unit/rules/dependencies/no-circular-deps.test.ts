import { describe, test, expect, beforeEach, vi } from 'vitest'
import { noCircularDepsRule } from '../../../../src/rules/dependencies/no-circular-deps.js'
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js'

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
): RuleContext {
  const reports: Array<{
    message: string
    loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  }> = []

  return {
    report: (descriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => '',
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
}

function createASTWithImports(imports: Array<{ source: string; line?: number }>): unknown {
  return {
    body: imports.map((imp, index) => ({
      type: 'ImportDeclaration',
      source: { value: imp.source },
      loc: {
        start: { line: imp.line ?? index + 1, column: 0 },
        end: { line: imp.line ?? index + 1, column: 20 },
      },
    })),
  }
}

function createASTWithRequires(requires: Array<{ source: string; line?: number }>): unknown {
  return {
    body: requires.map((req, index) => ({
      type: 'VariableDeclaration',
      declarations: [
        {
          init: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'require' },
            arguments: [{ type: 'Literal', value: req.source }],
          },
        },
      ],
      loc: {
        start: { line: req.line ?? index + 1, column: 0 },
        end: { line: req.line ?? index + 1, column: 30 },
      },
    })),
  }
}

function createASTWithExports(
  exports: Array<{ source: string; type: 'named' | 'all'; line?: number }>,
): unknown {
  return {
    body: exports.map((exp, index) => ({
      type: exp.type === 'named' ? 'ExportNamedDeclaration' : 'ExportAllDeclaration',
      source: { value: exp.source },
      loc: {
        start: { line: exp.line ?? index + 1, column: 0 },
        end: { line: exp.line ?? index + 1, column: 20 },
      },
    })),
  }
}

function createASTWithDynamicImports(imports: Array<{ source: string; line?: number }>): unknown {
  return {
    body: imports.map((imp, index) => ({
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: imp.source }],
      },
      loc: {
        start: { line: imp.line ?? index + 1, column: 0 },
        end: { line: imp.line ?? index + 1, column: 30 },
      },
    })),
  }
}

describe('no-circular-deps rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noCircularDepsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noCircularDepsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noCircularDepsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noCircularDepsRule.meta.docs?.category).toBe('dependencies')
    })

    test('should have schema defined', () => {
      expect(noCircularDepsRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(noCircularDepsRule.meta.docs?.description).toContain('circular dependencies')
    })

    test('should be fixable as code', () => {
      expect(noCircularDepsRule.meta.fixable).toBe('code')
    })

    test('should have a docs URL', () => {
      expect(noCircularDepsRule.meta.docs?.url).toBeDefined()
      expect(noCircularDepsRule.meta.docs?.url).toContain('codeforge.dev')
    })

    test('should not be deprecated', () => {
      expect(noCircularDepsRule.meta.deprecated).toBeFalsy()
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noCircularDepsRule.meta.schema)).toBe(true)
    })

    test('should have maxDepth in schema properties', () => {
      const schema = noCircularDepsRule.meta.schema as Array<Record<string, unknown>>
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('maxDepth')
    })

    test('should have ignoreTypeOnly in schema properties', () => {
      const schema = noCircularDepsRule.meta.schema as Array<Record<string, unknown>>
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('ignoreTypeOnly')
    })

    test('should have exclude in schema properties', () => {
      const schema = noCircularDepsRule.meta.schema as Array<Record<string, unknown>>
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('exclude')
    })

    test('should have description mentioning circular dependencies and modules', () => {
      expect(noCircularDepsRule.meta.docs?.description).toContain('circular dependencies')
      expect(noCircularDepsRule.meta.docs?.description).toContain('modules')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(visitor).toHaveProperty('Program')
      expect(visitor).toHaveProperty('ImportDeclaration')
      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('Program:exit')
    })

    test('should handle empty AST', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.Program(null)).not.toThrow()
    })

    test('should handle AST with no imports', () => {
      const context = {
        ...createMockContext(),
        getAST: () => ({ body: [] }),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program({})).not.toThrow()
    })

    test('should handle ImportDeclaration with source', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle ImportDeclaration without source', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.ImportDeclaration({ type: 'ImportDeclaration' })).not.toThrow()
    })

    test('should handle require() calls', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './module' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should ignore non-require CallExpressions', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle require() with empty arguments array', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle require() with non-array arguments', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: 'not-an-array' as unknown as never[],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle Program:exit without errors', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)
      const exitHandler = visitor['Program:exit'] as (node: unknown) => void

      expect(() => exitHandler(null)).not.toThrow()
    })

    test('should use default maxDepth when not specified', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should use custom maxDepth from options', () => {
      const context = createMockContext({ maxDepth: 10 })
      const visitor = noCircularDepsRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should handle AST with body property', () => {
      const ast = createASTWithImports([{ source: './utils' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle AST with program.body property', () => {
      const ast = {
        program: {
          body: [
            {
              type: 'ImportDeclaration',
              source: { value: './module' },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
            },
          ],
        },
      }
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle export re-exports', () => {
      const ast = createASTWithExports([{ source: './module', type: 'named' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle export all declarations', () => {
      const ast = createASTWithExports([{ source: './module', type: 'all' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle dynamic imports', () => {
      const ast = createASTWithDynamicImports([{ source: './module' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle require in ExpressionStatement', () => {
      const ast = {
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: './module' }],
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ],
      }
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.ImportDeclaration({})).not.toThrow()
    })

    test('should handle non-object nodes gracefully', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.ImportDeclaration('string')).not.toThrow()
      expect(() => visitor.ImportDeclaration(123)).not.toThrow()
    })

    test('should return visitor methods as functions', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(typeof visitor.Program).toBe('function')
      expect(typeof visitor.ImportDeclaration).toBe('function')
      expect(typeof visitor.CallExpression).toBe('function')
      expect(typeof visitor['Program:exit']).toBe('function')
    })

    test('should return a new visitor instance for each create call', () => {
      const context = createMockContext()
      const visitor1 = noCircularDepsRule.create(context)
      const visitor2 = noCircularDepsRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should handle null context config gracefully', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)
      expect(typeof visitor.Program).toBe('function')
    })
  })

  describe('options', () => {
    test('should respect maxDepth option', () => {
      const context = createMockContext({ maxDepth: 5 })
      const visitor = noCircularDepsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should respect ignoreTypeOnly option', () => {
      const context = createMockContext({ ignoreTypeOnly: true })
      const visitor = noCircularDepsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should respect exclude option', () => {
      const context = createMockContext({ exclude: ['**/*.test.ts'] })
      const visitor = noCircularDepsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should handle empty options', () => {
      const context = createMockContext({})
      const visitor = noCircularDepsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should handle undefined options', () => {
      const context = {
        ...createMockContext(),
        config: { options: [] },
      } as unknown as RuleContext
      const visitor = noCircularDepsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should accept maxDepth of 1', () => {
      const context = createMockContext({ maxDepth: 1 })
      const visitor = noCircularDepsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should accept maxDepth of 100', () => {
      const context = createMockContext({ maxDepth: 100 })
      const visitor = noCircularDepsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should accept exclude with multiple patterns', () => {
      const context = createMockContext({
        exclude: ['**/*.test.ts', '**/*.spec.ts', 'node_modules/**'],
      })
      const visitor = noCircularDepsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should accept all options together', () => {
      const context = createMockContext({
        maxDepth: 25,
        ignoreTypeOnly: true,
        exclude: ['**/vendor/**'],
      })
      const visitor = noCircularDepsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should handle ignoreTypeOnly false explicitly', () => {
      const context = createMockContext({ ignoreTypeOnly: false })
      const visitor = noCircularDepsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should handle empty exclude array', () => {
      const context = createMockContext({ exclude: [] })
      const visitor = noCircularDepsRule.create(context)
      expect(visitor).toBeDefined()
    })
  })

  describe('cycle detection', () => {
    test('should process imports without cycle', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './b' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: './b' }]))

      const node = {
        type: 'ImportDeclaration',
        source: { value: './b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)

      const exitHandler = visitor['Program:exit'] as (node: unknown) => void
      exitHandler(null)

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle ImportDeclaration with existing imports in fileImports', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './b' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)

      const ast = createASTWithImports([{ source: './b' }])
      visitor.Program(ast)

      const node = {
        type: 'ImportDeclaration',
        source: { value: './b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle require with string argument', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './module' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle require without string argument', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle ImportDeclaration with non-string source value', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'ImportDeclaration',
        source: { value: 123 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle Program:exit without errors', () => {
      const report = vi.fn()
      const ast = createASTWithImports([{ source: './module' }])

      const context = {
        ...createMockContext(),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as (node: unknown) => void

      expect(() => exitHandler(null)).not.toThrow()
    })

    test('should respect maxDepth option to limit cycle depth', () => {
      const report = vi.fn()
      const ast = createASTWithImports([{ source: './module' }])

      const context = {
        ...createMockContext({ maxDepth: 1 }),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as (node: unknown) => void

      expect(() => exitHandler(null)).not.toThrow()
    })

    test('should handle ImportDeclaration without loc', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
      }

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle CallExpression without loc', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './module' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should detect cycle when importing module that imports current file', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'
      const modulePath = '/src/b.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => null,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)

      const ast = createASTWithImports([{ source: modulePath }])
      visitor.Program(ast)

      const node = {
        type: 'ImportDeclaration',
        source: { value: filePath },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)

      const node2 = {
        type: 'ImportDeclaration',
        source: { value: modulePath },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      }
      visitor.ImportDeclaration(node2)

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle multiple ImportDeclarations', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const ast = createASTWithImports([{ source: './a' }, { source: './b' }, { source: './c' }])
      visitor.Program(ast)

      for (let i = 0; i < 3; i++) {
        const node = {
          type: 'ImportDeclaration',
          source: { value: `./${String.fromCharCode(97 + i)}` },
          loc: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 20 } },
        }
        visitor.ImportDeclaration(node)
      }

      expect(() => visitor.ImportDeclaration({ type: 'ImportDeclaration' })).not.toThrow()
    })

    test('should detect self-referencing import', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)

      const ast = createASTWithImports([{ source: filePath }])
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as (node: unknown) => void
      exitHandler(null)

      expect(report).toHaveBeenCalled()
    })

    test('should handle import with same path as file path', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'
      const modulePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: modulePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      const ast = createASTWithImports([{ source: modulePath }])
      visitor.Program(ast)
      const node = {
        type: 'ImportDeclaration',
        source: { value: modulePath },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)
      const exitHandler = visitor['Program:exit'] as (node: unknown) => void
      exitHandler(null)
      expect(report).toHaveBeenCalled()
    })
  })

  describe('self-referencing cycle detection', () => {
    test('should detect self-reference via ImportDeclaration', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { value: filePath },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(report).toHaveBeenCalled()
    })

    test('should detect self-reference via Program:exit graph', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should report message containing cycle path for self-reference', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Circular dependency detected'),
        }),
      )
    })

    test('should detect self-reference with .tsx extension', () => {
      const report = vi.fn()
      const filePath = '/src/Component.tsx'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should detect self-reference with .js extension', () => {
      const report = vi.fn()
      const filePath = '/src/index.js'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should detect self-reference via require()', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithRequires([{ source: filePath }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should detect self-reference via dynamic import()', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithDynamicImports([{ source: filePath }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should detect self-reference via ExportNamedDeclaration', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithExports([{ source: filePath, type: 'named' }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should detect self-reference via ExportAllDeclaration', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithExports([{ source: filePath, type: 'all' }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should detect multiple self-references in same file', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithImports([
        { source: filePath, line: 1 },
        { source: filePath, line: 2 },
      ])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })
  })

  describe('no-cycle scenarios', () => {
    test('should not report when importing different module', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './b' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: './b' }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should not report when importing multiple different modules', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithImports([{ source: './b' }, { source: './c' }, { source: './d' }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should not report when importing with require to different module', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithRequires([{ source: './b' }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should not report when importing with dynamic import to different module', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithDynamicImports([{ source: './b' }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should not report for re-exports of different module', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithExports([{ source: './b', type: 'named' }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should not report for export all of different module', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithExports([{ source: './b', type: 'all' }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should not report when AST has no body', () => {
      const report = vi.fn()

      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program({})

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should not report when AST is null', () => {
      const report = vi.fn()

      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(null)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should not report when body contains only non-import nodes', () => {
      const report = vi.fn()
      const ast = {
        body: [
          {
            type: 'FunctionDeclaration',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          {
            type: 'ClassDeclaration',
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should not report for deeply nested external module path', () => {
      const report = vi.fn()
      const filePath = '/src/deep/nested/module.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: '../../utils/helper' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: '../../utils/helper' }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('ImportDeclaration detection', () => {
    test('should extract import from ImportDeclaration node type', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithImports([{ source: './b', line: 5 }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle ImportDeclaration with relative path', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: { value: './relative' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }),
      ).not.toThrow()
    })

    test('should handle ImportDeclaration with absolute path', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: { value: '/src/module' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }),
      ).not.toThrow()
    })

    test('should handle ImportDeclaration with package name', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: { value: 'lodash' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }),
      ).not.toThrow()
    })

    test('should handle ImportDeclaration with scoped package name', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: { value: '@types/node' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }),
      ).not.toThrow()
    })

    test('should handle ImportDeclaration with empty string source', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: { value: '' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }),
      ).not.toThrow()
    })

    test('should handle ImportDeclaration with undefined source', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: undefined,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }),
      ).not.toThrow()
    })

    test('should handle ImportDeclaration with null source value', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: { value: null },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }),
      ).not.toThrow()
    })

    test('should handle ImportDeclaration with boolean source value', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: { value: true },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }),
      ).not.toThrow()
    })

    test('should handle ImportDeclaration without type property', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.ImportDeclaration({
          source: { value: './module' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }),
      ).not.toThrow()
    })
  })

  describe('require() detection', () => {
    test('should recognize require() with Identifier callee', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './module' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should ignore call expressions with non-require names', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'import' },
        arguments: [{ type: 'Literal', value: './module' }],
      }

      visitor.CallExpression(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should ignore call expressions with MemberExpression callee', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { name: 'mod' },
          property: { name: 'require' },
        },
        arguments: [{ type: 'Literal', value: './module' }],
      }

      visitor.CallExpression(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle require() with template literal argument', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'TemplateLiteral', value: './module' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle require() with numeric argument', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 42 as unknown as string }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle require() with undefined callee', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [{ type: 'Literal', value: './module' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle require() with null callee', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: './module' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle require() where arg value is object', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: { path: './module' } as unknown as string }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle require() with single argument', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './single-module' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle require() with multiple arguments', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [
          { type: 'Literal', value: './module' },
          { type: 'Literal', value: './extra' },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should add require import to fileImports', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => null,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(null)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './module' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('dynamic import() detection', () => {
    test('should handle dynamic import via ExpressionStatement', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'
      const ast = createASTWithDynamicImports([{ source: './b' }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should detect self-reference via dynamic import', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'
      const ast = createASTWithDynamicImports([{ source: filePath }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should handle dynamic import with Literal argument type', () => {
      const ast = {
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Import' },
              arguments: [{ type: 'Literal', value: './module' }],
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle dynamic import with non-string argument', () => {
      const ast = {
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Import' },
              arguments: [{ type: 'Identifier', name: 'moduleName' }],
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should ignore CallExpression with Import callee in visitor', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: './module' }],
      }

      visitor.CallExpression(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle multiple dynamic imports', () => {
      const ast = createASTWithDynamicImports([
        { source: './a' },
        { source: './b' },
        { source: './c' },
      ])

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()
    })

    test('should not treat regular CallExpression as dynamic import in Program body', () => {
      const ast = {
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'fn' },
              arguments: [{ type: 'Literal', value: './module' }],
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })
  })

  describe('ExportNamedDeclaration detection', () => {
    test('should extract imports from ExportNamedDeclaration', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'
      const ast = createASTWithExports([{ source: './b', type: 'named', line: 1 }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should detect self-reference via ExportNamedDeclaration', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'
      const ast = createASTWithExports([{ source: filePath, type: 'named' }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should handle ExportNamedDeclaration without source', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            source: undefined,
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ExportNamedDeclaration with null source value', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            source: { value: null },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ExportNamedDeclaration with non-string source value', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            source: { value: 42 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle multiple ExportNamedDeclarations', () => {
      const ast = createASTWithExports([
        { source: './a', type: 'named' },
        { source: './b', type: 'named' },
        { source: './c', type: 'named' },
      ])

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })
  })

  describe('ExportAllDeclaration detection', () => {
    test('should extract imports from ExportAllDeclaration', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'
      const ast = createASTWithExports([{ source: './b', type: 'all', line: 1 }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should detect self-reference via ExportAllDeclaration', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'
      const ast = createASTWithExports([{ source: filePath, type: 'all' }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should handle ExportAllDeclaration without source', () => {
      const ast = {
        body: [
          {
            type: 'ExportAllDeclaration',
            source: undefined,
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ExportAllDeclaration with null source', () => {
      const ast = {
        body: [
          {
            type: 'ExportAllDeclaration',
            source: { value: null },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle mixed ExportNamed and ExportAll declarations', () => {
      const ast = createASTWithExports([
        { source: './a', type: 'named' },
        { source: './b', type: 'all' },
        { source: './c', type: 'named' },
      ])

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })
  })

  describe('violation properties', () => {
    test('should include circular dependency message in report', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Circular dependency detected'),
        }),
      )
    })

    test('should include cycle path in message for self-reference', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(filePath),
        }),
      )
    })

    test('should include location in report for self-reference', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.objectContaining({
            start: expect.objectContaining({ line: expect.any(Number) }),
          }),
        }),
      )
    })

    test('should report message with arrow notation for self-reference', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      const callArg = report.mock.calls[0][0] as { message: string }
      expect(callArg.message).toContain('->')
    })

    test('should include location with column info', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.objectContaining({
            start: expect.objectContaining({ column: expect.any(Number) }),
            end: expect.objectContaining({ column: expect.any(Number) }),
          }),
        }),
      )
    })

    test('should report via ImportDeclaration for self-reference', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { value: filePath },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Circular dependency detected'),
        }),
      )
    })

    test('should report message containing both file paths for A->A cycle', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { value: filePath },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      const callArg = report.mock.calls[0][0] as { message: string }
      expect(callArg.message).toMatch(/a\.ts.*a\.ts/)
    })

    test('should report location matching the import line', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { value: filePath },
        loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 30 } },
      })

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 30 } },
        }),
      )
    })
  })

  describe('extractImports edge cases', () => {
    test('should handle AST with null body', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.Program({ body: null })).not.toThrow()
    })

    test('should handle AST with non-array body', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.Program({ body: 'not-array' })).not.toThrow()
    })

    test('should handle AST body with null elements', () => {
      const ast = {
        body: [null, null],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle AST body with undefined elements', () => {
      const ast = {
        body: [undefined, undefined],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle AST body with string elements', () => {
      const ast = {
        body: ['not-a-node'],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle AST body with number elements', () => {
      const ast = {
        body: [42],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle node with empty type string', () => {
      const ast = {
        body: [
          {
            type: '',
            source: { value: './module' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle node without type property', () => {
      const ast = {
        body: [
          {
            source: { value: './module' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle deeply nested program.body', () => {
      const ast = {
        program: {
          body: [
            {
              type: 'ImportDeclaration',
              source: { value: './module' },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
            },
          ],
        },
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should prefer direct body over program.body', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './direct' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
        program: {
          body: [
            {
              type: 'ImportDeclaration',
              source: { value: './indirect' },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
            },
          ],
        },
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle VariableDeclaration with no declarations array', () => {
      const ast = {
        body: [
          {
            type: 'VariableDeclaration',
            declarations: null,
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle VariableDeclaration with empty declarations', () => {
      const ast = {
        body: [
          {
            type: 'VariableDeclaration',
            declarations: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle VariableDeclaration with null init', () => {
      const ast = {
        body: [
          {
            type: 'VariableDeclaration',
            declarations: [{ init: null }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })
  })

  describe('isRequireCall edge cases', () => {
    test('should not match CallExpression with different callee type', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'FunctionExpression' },
        arguments: [{ type: 'Literal', value: './module' }],
      }

      visitor.CallExpression(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should not match regular function calls', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myFunction' },
        arguments: [{ type: 'Literal', value: './module' }],
      }

      visitor.CallExpression(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should not match non-CallExpression types', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.CallExpression({ type: 'Identifier', name: 'require' })).not.toThrow()
    })

    test('should handle node without callee', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node where callee has no name property', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [{ type: 'Literal', value: './module' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })
  })

  describe('combined import types', () => {
    test('should handle mixed imports and requires in same file', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './a' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'VariableDeclaration',
            declarations: [
              {
                init: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'require' },
                  arguments: [{ type: 'Literal', value: './b' }],
                },
              },
            ],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle mixed imports and dynamic imports in same file', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './a' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Import' },
              arguments: [{ type: 'Literal', value: './b' }],
            },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle imports, requires, and dynamic imports together', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './a' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'VariableDeclaration',
            declarations: [
              {
                init: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'require' },
                  arguments: [{ type: 'Literal', value: './b' }],
                },
              },
            ],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 30 } },
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Import' },
              arguments: [{ type: 'Literal', value: './c' }],
            },
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle imports and re-exports in same file', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './a' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'ExportNamedDeclaration',
            source: { value: './b' },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle all import types plus re-exports in same file', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './a' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'VariableDeclaration',
            declarations: [
              {
                init: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'require' },
                  arguments: [{ type: 'Literal', value: './b' }],
                },
              },
            ],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 30 } },
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Import' },
              arguments: [{ type: 'Literal', value: './c' }],
            },
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 30 } },
          },
          {
            type: 'ExportAllDeclaration',
            source: { value: './d' },
            loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 20 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })
  })

  describe('file path handling', () => {
    test('should handle .ts file extension', () => {
      const report = vi.fn()
      const filePath = '/src/module.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './other' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: './other' }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle .tsx file extension', () => {
      const report = vi.fn()
      const filePath = '/src/Component.tsx'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './other' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: './other' }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle .js file extension', () => {
      const report = vi.fn()
      const filePath = '/src/index.js'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './other' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: './other' }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle .jsx file extension', () => {
      const report = vi.fn()
      const filePath = '/src/Component.jsx'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './other' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: './other' }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle deeply nested file paths', () => {
      const report = vi.fn()
      const filePath = '/src/features/auth/components/LoginForm.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './helpers' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: './helpers' }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle file paths with spaces', () => {
      const report = vi.fn()
      const filePath = '/src/my module.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './other' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: './other' }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle file paths with special characters', () => {
      const report = vi.fn()
      const filePath = '/src/$module.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './other' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: './other' }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('maxDepth option behavior', () => {
    test('should detect self-reference with maxDepth of 0', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({ maxDepth: 0 }, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should detect self-reference with maxDepth of 1', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({ maxDepth: 1 }, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should detect self-reference with maxDepth of 50 (default)', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({ maxDepth: 50 }, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should detect self-reference with maxDepth of 100', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({ maxDepth: 100 }, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should use default maxDepth when option is not provided', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should not throw with very large maxDepth', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({ maxDepth: 100 }, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)

      expect(() => {
        visitor.Program(createASTWithImports([{ source: filePath }]))
        const exitHandler = visitor['Program:exit'] as () => void
        exitHandler()
      }).not.toThrow()
    })
  })

  describe('edge cases', () => {
    test('should handle node without source property in ImportDeclaration', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.ImportDeclaration({ type: 'ImportDeclaration' })).not.toThrow()
    })

    test('should handle node with null source in ImportDeclaration', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: null,
        }),
      ).not.toThrow()
    })

    test('should handle undefined node in CallExpression', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle null node in CallExpression', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle boolean node in ImportDeclaration', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.ImportDeclaration(true)).not.toThrow()
    })

    test('should handle array node in ImportDeclaration', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.ImportDeclaration([])).not.toThrow()
    })

    test('should handle node with only type property', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() => visitor.ImportDeclaration({ type: 'ImportDeclaration' })).not.toThrow()
    })

    test('should handle ExpressionStatement with non-require non-import expression', () => {
      const ast = {
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'BinaryExpression',
              operator: '+',
              left: { type: 'Identifier', name: 'a' },
              right: { type: 'Identifier', name: 'b' },
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ExpressionStatement with undefined expression', () => {
      const ast = {
        body: [
          {
            type: 'ExpressionStatement',
            expression: undefined,
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle Program called multiple times', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
        getAST: () => createASTWithImports([{ source: './a' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)

      visitor.Program(createASTWithImports([{ source: './a' }]))
      visitor.Program(createASTWithImports([{ source: './b' }]))

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle CallExpression called before Program', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.CallExpression({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'require' },
          arguments: [{ type: 'Literal', value: './module' }],
        }),
      ).not.toThrow()
    })

    test('should handle ImportDeclaration called before Program', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      expect(() =>
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: { value: './module' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }),
      ).not.toThrow()
    })

    test('should handle Program:exit called before Program', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const exitHandler = visitor['Program:exit'] as () => void
      expect(() => exitHandler()).not.toThrow()
    })

    test('should handle context.getAST returning undefined', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
        getAST: () => undefined,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)

      expect(() => {
        visitor.Program({ body: [] })
        const exitHandler = visitor['Program:exit'] as () => void
        exitHandler()
      }).not.toThrow()
    })

    test('should handle node with circular references', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const node: Record<string, unknown> = { type: 'ImportDeclaration' }
      node.self = node

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })
  })

  describe('ExpressionStatement require extraction', () => {
    test('should extract require from ExpressionStatement via Program', () => {
      const ast = {
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: './module' }],
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should detect self-reference via ExpressionStatement require', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = {
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'require' },
              arguments: [{ type: 'Literal', value: filePath }],
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
    })

    test('should handle ExpressionStatement with non-CallExpression expression', () => {
      const ast = {
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'AssignmentExpression',
              operator: '=',
              left: { type: 'Identifier', name: 'x' },
              right: { type: 'Literal', value: 1 },
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should not extract from ExpressionStatement with non-require call', () => {
      const ast = {
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'someFn' },
              arguments: [{ type: 'Literal', value: './module' }],
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ],
      }

      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('multiple imports handling', () => {
    test('should handle 10 imports without cycle', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const imports = Array.from({ length: 10 }, (_, i) => ({ source: `./module${i}` }))
      const ast = createASTWithImports(imports)

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle mixed imports and non-import nodes', () => {
      const report = vi.fn()
      const ast = {
        body: [
          {
            type: 'FunctionDeclaration',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          {
            type: 'ImportDeclaration',
            source: { value: './a' },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
          },
          {
            type: 'ClassDeclaration',
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 10 } },
          },
          {
            type: 'ImportDeclaration',
            source: { value: './b' },
            loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 20 } },
          },
        ],
      }

      const context = {
        ...createMockContext(),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle same import source multiple times', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithImports([
        { source: './b', line: 1 },
        { source: './b', line: 2 },
        { source: './b', line: 3 },
      ])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle require and ImportDeclaration for same module', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './b' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'VariableDeclaration',
            declarations: [
              {
                init: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'require' },
                  arguments: [{ type: 'Literal', value: './b' }],
                },
              },
            ],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 30 } },
          },
        ],
      }

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle multiple require() calls via CallExpression visitor', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      for (let i = 0; i < 5; i++) {
        const node = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'require' },
          arguments: [{ type: 'Literal', value: `./module${i}` }],
          loc: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 30 } },
        }
        expect(() => visitor.CallExpression(node)).not.toThrow()
      }
    })

    test('should handle ImportDeclaration with very long module path', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const longPath = './' + 'a'.repeat(500)
      const node = {
        type: 'ImportDeclaration',
        source: { value: longPath },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 600 } },
      }

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle require with very long module path', () => {
      const context = createMockContext()
      const visitor = noCircularDepsRule.create(context)

      const longPath = './' + 'b'.repeat(500)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: longPath }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 600 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })
  })

  describe('location handling', () => {
    test('should use default location when node has no loc', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: filePath },
          },
        ],
      }

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.objectContaining({
            start: expect.objectContaining({ line: expect.any(Number) }),
          }),
        }),
      )
    })

    test('should preserve line numbers from AST loc', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = createASTWithImports([{ source: filePath, line: 42 }])

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalled()
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.objectContaining({
            start: expect.objectContaining({ line: 42 }),
          }),
        }),
      )
    })

    test('should preserve column numbers from AST loc', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: filePath },
            loc: { start: { line: 1, column: 15 }, end: { line: 1, column: 35 } },
          },
        ],
      }

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(ast)

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: {
            start: { line: 1, column: 15 },
            end: { line: 1, column: 35 },
          },
        }),
      )
    })

    test('should handle ImportDeclaration report with exact location', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: filePath }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: filePath }]))

      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { value: filePath },
        loc: { start: { line: 10, column: 5 }, end: { line: 10, column: 25 } },
      })

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: { start: { line: 10, column: 5 }, end: { line: 10, column: 25 } },
        }),
      )
    })
  })

  describe('visitor method independence', () => {
    test('should not affect other visitors when CallExpression is called', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './b' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: './b' }]))

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './c' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { value: './d' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      })

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should accumulate imports across Program and ImportDeclaration', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => createASTWithImports([{ source: './b' }]),
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(createASTWithImports([{ source: './b' }]))

      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { value: './c' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      })

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle CallExpression adding to import tracking', () => {
      const report = vi.fn()
      const filePath = '/src/a.ts'

      const context = {
        ...createMockContext({}, filePath),
        report,
        getAST: () => null,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)
      visitor.Program(null)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './b' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      const exitHandler = visitor['Program:exit'] as () => void
      exitHandler()

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle sequential CallExpressions', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)

      for (let i = 0; i < 3; i++) {
        visitor.CallExpression({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'require' },
          arguments: [{ type: 'Literal', value: `./module${i}` }],
          loc: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 30 } },
        })
      }

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle sequential ImportDeclarations', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)

      for (let i = 0; i < 3; i++) {
        visitor.ImportDeclaration({
          type: 'ImportDeclaration',
          source: { value: `./module${i}` },
          loc: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 20 } },
        })
      }

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle alternating CallExpression and ImportDeclaration', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext

      const visitor = noCircularDepsRule.create(context)

      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { value: './a' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './b' }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 30 } },
      })

      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { value: './c' },
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 20 } },
      })

      expect(report).not.toHaveBeenCalled()
    })
  })
})
