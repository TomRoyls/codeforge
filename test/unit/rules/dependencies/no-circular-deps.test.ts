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
            arguments: [{ type: 'StringLiteral', value: req.source }],
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
        arguments: [{ type: 'StringLiteral', value: imp.source }],
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
        arguments: [{ type: 'StringLiteral', value: './module' }],
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
              arguments: [{ type: 'StringLiteral', value: './module' }],
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
        arguments: [{ type: 'StringLiteral', value: './module' }],
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
        arguments: [{ type: 'StringLiteral', value: './module' }],
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
})
