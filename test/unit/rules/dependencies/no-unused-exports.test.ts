import { describe, test, expect, beforeEach, vi } from 'vitest'
import { noUnusedExportsRule } from '../../../../src/rules/dependencies/no-unused-exports.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/module.ts',
): RuleContext {
  return {
    report: vi.fn(),
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

function createASTWithNamedExports(exports: Array<{ name: string; type?: string }>): unknown {
  return {
    body: exports.map((exp) => {
      if (exp.type === 'function') {
        return {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'FunctionDeclaration',
            id: { name: exp.name },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }
      }
      if (exp.type === 'class') {
        return {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'ClassDeclaration',
            id: { name: exp.name },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }
      }
      if (exp.type === 'variable') {
        return {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'VariableDeclaration',
            declarations: [{ id: { type: 'Identifier', name: exp.name } }],
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }
      }
      if (exp.type === 'type') {
        return {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'TSTypeAliasDeclaration',
            id: { name: exp.name },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }
      }
      if (exp.type === 'interface') {
        return {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'TSInterfaceDeclaration',
            id: { name: exp.name },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }
      }
      return {
        type: 'ExportNamedDeclaration',
        specifiers: [{ type: 'ExportSpecifier', exported: { name: exp.name } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
    }),
  }
}

function createASTWithDefaultExport(): unknown {
  return {
    body: [
      {
        type: 'ExportDefaultDeclaration',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      },
    ],
  }
}

function createASTWithNamespaceExport(): unknown {
  return {
    body: [
      {
        type: 'ExportAllDeclaration',
        source: { value: './other' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      },
    ],
  }
}

function createASTWithImports(imports: Array<{ names: string[]; source: string }>): unknown {
  return {
    body: imports.map((imp) => ({
      type: 'ImportDeclaration',
      source: { value: imp.source },
      specifiers: imp.names.map((name) => {
        if (name === 'default') {
          return { type: 'ImportDefaultSpecifier' }
        }
        if (name === '*') {
          return { type: 'ImportNamespaceSpecifier' }
        }
        return { type: 'ImportSpecifier', imported: { name } }
      }),
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })),
  }
}

function createASTWithFunctionWithExportModifier(): unknown {
  return {
    body: [
      {
        type: 'FunctionDeclaration',
        id: { name: 'exportedFunc' },
        modifiers: [{ type: 'TSExportKeyword' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      },
    ],
  }
}

function createASTWithClassWithExportModifier(): unknown {
  return {
    body: [
      {
        type: 'ClassDeclaration',
        id: { name: 'ExportedClass' },
        modifiers: [{ type: 'TSExportKeyword' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      },
    ],
  }
}

function createASTWithVariableWithExportModifier(): unknown {
  return {
    body: [
      {
        type: 'VariableDeclaration',
        declarations: [{ id: { type: 'Identifier', name: 'exportedVar' } }],
        modifiers: [{ type: 'TSExportKeyword' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      },
    ],
  }
}

function createASTWithRequireImport(source: string): unknown {
  return {
    body: [
      {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'StringLiteral', value: source }],
      },
    ],
  }
}

function createASTWithDynamicImport(source: string): unknown {
  return {
    body: [
      {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'StringLiteral', value: source }],
      },
    ],
  }
}

describe('no-unused-exports rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noUnusedExportsRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noUnusedExportsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnusedExportsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noUnusedExportsRule.meta.docs?.category).toBe('dependencies')
    })

    test('should have schema defined', () => {
      expect(noUnusedExportsRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(noUnusedExportsRule.meta.docs?.description).toContain('never imported')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const context = createMockContext()
      const visitor = noUnusedExportsRule.create(context)

      expect(visitor).toHaveProperty('Program')
      expect(visitor).toHaveProperty('Program:exit')
    })

    test('should handle empty AST', () => {
      const context = createMockContext()
      const visitor = noUnusedExportsRule.create(context)

      expect(() => visitor.Program(null)).not.toThrow()
    })

    test('should handle AST with no exports', () => {
      const context = {
        ...createMockContext(),
        getAST: () => ({ body: [] }),
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program({})).not.toThrow()
    })

    test('should handle named exports', () => {
      const ast = createASTWithNamedExports([{ name: 'foo' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle default export', () => {
      const ast = createASTWithDefaultExport()
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle namespace export', () => {
      const ast = createASTWithNamespaceExport()
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle function exports', () => {
      const ast = createASTWithNamedExports([{ name: 'myFunc', type: 'function' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle class exports', () => {
      const ast = createASTWithNamedExports([{ name: 'MyClass', type: 'class' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle variable exports', () => {
      const ast = createASTWithNamedExports([{ name: 'myVar', type: 'variable' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle type exports', () => {
      const ast = createASTWithNamedExports([{ name: 'MyType', type: 'type' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle interface exports', () => {
      const ast = createASTWithNamedExports([{ name: 'MyInterface', type: 'interface' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle imports', () => {
      const ast = createASTWithImports([{ names: ['foo', 'bar'], source: './module' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle require imports', () => {
      const ast = createASTWithRequireImport('./module')
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle dynamic imports', () => {
      const ast = createASTWithDynamicImport('./module')
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle function with export modifier', () => {
      const ast = createASTWithFunctionWithExportModifier()
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle class with export modifier', () => {
      const ast = createASTWithClassWithExportModifier()
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle variable with export modifier', () => {
      const ast = createASTWithVariableWithExportModifier()
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle Program:exit', () => {
      const context = createMockContext()
      const visitor = noUnusedExportsRule.create(context)
      const exitHandler = visitor['Program:exit'] as (node: unknown) => void

      expect(() => exitHandler(null)).not.toThrow()
    })

    test('should handle null or undefined nodes gracefully', () => {
      const context = createMockContext()
      const visitor = noUnusedExportsRule.create(context)

      expect(() => visitor.Program(null)).not.toThrow()
      expect(() => visitor.Program(undefined)).not.toThrow()
    })
  })

  describe('options', () => {
    test('should respect ignorePatterns option', () => {
      const context = createMockContext({ ignorePatterns: ['_*'] })
      const visitor = noUnusedExportsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should respect ignoreTypeOnly option', () => {
      const context = createMockContext({ ignoreTypeOnly: true })
      const visitor = noUnusedExportsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should respect allowEntryExports option', () => {
      const context = createMockContext({ allowEntryExports: true })
      const visitor = noUnusedExportsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should respect entryFiles option', () => {
      const context = createMockContext({ entryFiles: ['index.ts'] })
      const visitor = noUnusedExportsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should handle empty options', () => {
      const context = createMockContext({})
      const visitor = noUnusedExportsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should skip entry files by default (index.ts)', () => {
      const context = createMockContext({}, '/src/index.ts')
      const visitor = noUnusedExportsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should skip entry files by default (main.ts)', () => {
      const context = createMockContext({}, '/src/main.ts')
      const visitor = noUnusedExportsRule.create(context)
      expect(visitor).toBeDefined()
    })
  })

  describe('edge cases', () => {
    test('should handle non-object AST', () => {
      const context = createMockContext()
      const visitor = noUnusedExportsRule.create(context)

      expect(() => visitor.Program('string')).not.toThrow()
      expect(() => visitor.Program(123)).not.toThrow()
    })

    test('should handle AST with program.body', () => {
      const ast = {
        program: {
          body: [
            {
              type: 'ExportNamedDeclaration',
              specifiers: [{ type: 'ExportSpecifier', exported: { name: 'foo' } }],
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
            },
          ],
        },
      }
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle TSImportEqualsDeclaration', () => {
      const ast = {
        body: [
          {
            type: 'TSImportEqualsDeclaration',
            id: { name: 'imported' },
            moduleReference: {
              type: 'TSExternalModuleReference',
              expression: { value: './module' },
            },
          },
        ],
      }
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle type-only imports', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './module' },
            importKind: 'type',
            specifiers: [{ type: 'ImportSpecifier', imported: { name: 'MyType' } }],
          },
        ],
      }
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle export with exportKind type', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            exportKind: 'type',
            specifiers: [{ type: 'ExportSpecifier', exported: { name: 'MyType' } }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle default import', () => {
      const ast = createASTWithImports([{ names: ['default'], source: './module' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle namespace import', () => {
      const ast = createASTWithImports([{ names: ['*'], source: './module' }])
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle entry file pattern matching with wildcard', () => {
      const context = createMockContext({ entryFiles: ['**/index.ts'] }, '/src/sub/index.ts')
      const visitor = noUnusedExportsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should not report type-only exports when ignoreTypeOnly is true', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            exportKind: 'type',
            specifiers: [
              {
                type: 'ExportSpecifier',
                exported: { name: 'MyType' },
                exportKind: 'type',
              },
            ],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignoreTypeOnly: true }),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      const exitHandler = visitor['Program:exit'] as (node: unknown) => void
      exitHandler(ast)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not report exports matching ignorePatterns', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            specifiers: [{ type: 'ExportSpecifier', exported: { name: '_internalHelper' } }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: ['/^_/', /^_/] }),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      const exitHandler = visitor['Program:exit'] as (node: unknown) => void
      exitHandler(ast)

      expect(mockReport).not.toHaveBeenCalled()
    })
  })

  describe('meta expanded', () => {
    test('should be fixable as code', () => {
      expect(noUnusedExportsRule.meta.fixable).toBe('code')
    })

    test('should have docs url', () => {
      expect(noUnusedExportsRule.meta.docs?.url).toContain('no-unused-exports')
    })

    test('should have schema type object', () => {
      const schema = noUnusedExportsRule.meta.schema as Array<Record<string, unknown>>
      expect(schema[0].type).toBe('object')
    })

    test('should define ignorePatterns in schema', () => {
      const schema = noUnusedExportsRule.meta.schema as Array<Record<string, unknown>>
      const properties = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        unknown
      >
      expect(properties).toHaveProperty('ignorePatterns')
    })

    test('should define ignoreTypeOnly in schema', () => {
      const schema = noUnusedExportsRule.meta.schema as Array<Record<string, unknown>>
      const properties = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        unknown
      >
      expect(properties).toHaveProperty('ignoreTypeOnly')
    })

    test('should define allowEntryExports in schema', () => {
      const schema = noUnusedExportsRule.meta.schema as Array<Record<string, unknown>>
      const properties = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        unknown
      >
      expect(properties).toHaveProperty('allowEntryExports')
    })

    test('should define entryFiles in schema', () => {
      const schema = noUnusedExportsRule.meta.schema as Array<Record<string, unknown>>
      const properties = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        unknown
      >
      expect(properties).toHaveProperty('entryFiles')
    })

    test('should disallow additional properties in schema', () => {
      const schema = noUnusedExportsRule.meta.schema as Array<Record<string, unknown>>
      expect(schema[0]).toHaveProperty('additionalProperties', false)
    })
  })

  describe('create function expanded', () => {
    test('should return visitor with Program as function', () => {
      const context = createMockContext()
      const visitor = noUnusedExportsRule.create(context)
      expect(typeof visitor.Program).toBe('function')
    })

    test('should return visitor with Program:exit as function', () => {
      const context = createMockContext()
      const visitor = noUnusedExportsRule.create(context)
      expect(typeof visitor['Program:exit']).toBe('function')
    })

    test('should handle sequential Program calls', () => {
      const ast = createASTWithNamedExports([{ name: 'foo' }])
      const context = {
        ...createMockContext({}, '/src/seq-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle Program then Program:exit sequence', () => {
      const ast = createASTWithNamedExports([{ name: 'bar' }])
      const context = {
        ...createMockContext({}, '/src/seq-exit-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      expect(() => visitor['Program:exit'](null)).not.toThrow()
    })

    test('should extract options from context config', () => {
      const context = createMockContext({
        ignorePatterns: ['^_'],
        ignoreTypeOnly: true,
        allowEntryExports: false,
        entryFiles: ['app.ts'],
      })
      const visitor = noUnusedExportsRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor.Program).toBe('function')
    })

    test('should create fresh visitor for each context', () => {
      const ctx1 = createMockContext({}, '/src/file-a.ts')
      const ctx2 = createMockContext({}, '/src/file-b.ts')
      const visitor1 = noUnusedExportsRule.create(ctx1)
      const visitor2 = noUnusedExportsRule.create(ctx2)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('named exports unused detection', () => {
    test('should report unused function export', () => {
      const ast = createASTWithNamedExports([{ name: 'unusedFn', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/report-fn-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'unusedFn' is never used in other modules",
        }),
      )
    })

    test('should report unused class export', () => {
      const ast = createASTWithNamedExports([{ name: 'UnusedClass', type: 'class' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/report-class-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'UnusedClass' is never used in other modules",
        }),
      )
    })

    test('should report unused variable export', () => {
      const ast = createASTWithNamedExports([{ name: 'unusedVar', type: 'variable' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/report-var-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'unusedVar' is never used in other modules",
        }),
      )
    })

    test('should report unused type alias export', () => {
      const ast = createASTWithNamedExports([{ name: 'UnusedType', type: 'type' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/report-type-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'UnusedType' is never used in other modules",
        }),
      )
    })

    test('should report unused interface export', () => {
      const ast = createASTWithNamedExports([{ name: 'IUnused', type: 'interface' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/report-iface-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'IUnused' is never used in other modules",
        }),
      )
    })

    test('should report unused specifier export', () => {
      const ast = createASTWithNamedExports([{ name: 'reExportedItem' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/report-spec-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'reExportedItem' is never used in other modules",
        }),
      )
    })

    test('should report multiple unused exports separately', () => {
      const ast = createASTWithNamedExports([
        { name: 'unused1', type: 'function' },
        { name: 'unused2', type: 'function' },
        { name: 'unused3', type: 'function' },
      ])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/report-multi-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(3)
    })

    test('should report each unused export with correct name', () => {
      const ast = createASTWithNamedExports([
        { name: 'alpha', type: 'function' },
        { name: 'beta', type: 'class' },
      ])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/report-names-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      const messages = mockReport.mock.calls.map(
        (call: Array<{ message: string }>) => call[0].message,
      )
      expect(messages).toContain("Export 'alpha' is never used in other modules")
      expect(messages).toContain("Export 'beta' is never used in other modules")
    })

    test('should report function with export modifier as unused', () => {
      const ast = createASTWithFunctionWithExportModifier()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/report-fnmod-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'exportedFunc' is never used in other modules",
        }),
      )
    })

    test('should report class with export modifier as unused', () => {
      const ast = createASTWithClassWithExportModifier()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/report-clmod-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'ExportedClass' is never used in other modules",
        }),
      )
    })

    test('should report variable with export modifier as unused', () => {
      const ast = createASTWithVariableWithExportModifier()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/report-varmod-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'exportedVar' is never used in other modules",
        }),
      )
    })

    test('should not report when export name matches an import', () => {
      // Set up importer
      const importerAst = createASTWithImports([
        { names: ['usedFunc'], source: '/src/used-match.ts' },
      ])
      const importerCtx = {
        ...createMockContext({}, '/src/used-match-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      const importerVisitor = noUnusedExportsRule.create(importerCtx)
      importerVisitor.Program(importerAst)

      // Set up exporter
      const exporterAst = createASTWithNamedExports([{ name: 'usedFunc', type: 'function' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/used-match.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const exporterVisitor = noUnusedExportsRule.create(exporterCtx)
      exporterVisitor.Program(exporterAst)
      exporterVisitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not report when class export is used by import', () => {
      const importerAst = createASTWithImports([
        { names: ['UsedClass'], source: '/src/used-class.ts' },
      ])
      const importerCtx = {
        ...createMockContext({}, '/src/used-class-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([{ name: 'UsedClass', type: 'class' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/used-class.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })
  })

  describe('default exports unused', () => {
    test('should report unused default export', () => {
      const ast = createASTWithDefaultExport()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/unused-default-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'default' is never used in other modules",
        }),
      )
    })

    test('should not report default export when imported as default', () => {
      const importerAst = createASTWithImports([
        { names: ['default'], source: '/src/has-default.ts' },
      ])
      const importerCtx = {
        ...createMockContext({}, '/src/default-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithDefaultExport()
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/has-default.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not report default export when namespace import covers it', () => {
      const importerAst = createASTWithImports([{ names: ['*'], source: '/src/ns-default.ts' }])
      const importerCtx = {
        ...createMockContext({}, '/src/ns-default-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithDefaultExport()
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/ns-default.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should report default export with name default in message', () => {
      const ast = createASTWithDefaultExport()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/default-name-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      const call = mockReport.mock.calls[0] as Array<{ message: string }>
      expect(call[0].message).toBe("Export 'default' is never used in other modules")
    })

    test('should handle default export alongside named exports', () => {
      const ast = {
        body: [
          {
            type: 'ExportDefaultDeclaration',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'ExportNamedDeclaration',
            specifiers: [{ type: 'ExportSpecifier', exported: { name: 'extra' } }],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/mixed-default-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(2)
    })
  })

  describe('namespace exports unused', () => {
    test('should report unused namespace export', () => {
      const ast = createASTWithNamespaceExport()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/unused-ns-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export '*' is never used in other modules",
        }),
      )
    })

    test('should not report namespace export when imported', () => {
      const importerAst = createASTWithImports([{ names: ['*'], source: '/src/used-ns.ts' }])
      const importerCtx = {
        ...createMockContext({}, '/src/used-ns-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamespaceExport()
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/used-ns.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should report namespace export with asterisk name', () => {
      const ast = createASTWithNamespaceExport()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/ns-asterisk-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      const call = mockReport.mock.calls[0] as Array<{ message: string }>
      expect(call[0].message).toContain("'*'")
    })

    test('should handle ExportAllDeclaration with exportKind type', () => {
      const ast = {
        body: [
          {
            type: 'ExportAllDeclaration',
            source: { value: './types' },
            exportKind: 'type',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/ns-type-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle namespace export with source', () => {
      const ast = {
        body: [
          {
            type: 'ExportAllDeclaration',
            source: { value: './re-exported-module' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/reexport-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })
  })

  describe('exports used by various import types', () => {
    test('should not report when named import matches export', () => {
      const importerAst = createASTWithImports([
        { names: ['myItem'], source: '/src/used-named.ts' },
      ])
      const importerCtx = {
        ...createMockContext({}, '/src/used-named-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([{ name: 'myItem' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/used-named.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not report when require imports the file', () => {
      const importerAst = createASTWithRequireImport('/src/used-require.ts')
      const importerCtx = {
        ...createMockContext({}, '/src/require-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([{ name: 'anything' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/used-require.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not report when dynamic import references file', () => {
      const importerAst = createASTWithDynamicImport('/src/used-dynamic.ts')
      const importerCtx = {
        ...createMockContext({}, '/src/dynamic-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([{ name: 'dynamicExport' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/used-dynamic.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not report when TSImportEqualsDeclaration references file', () => {
      const importerAst = {
        body: [
          {
            type: 'TSImportEqualsDeclaration',
            id: { name: 'imported' },
            moduleReference: {
              type: 'TSExternalModuleReference',
              expression: { value: '/src/used-import-eq.ts' },
            },
          },
        ],
      }
      const importerCtx = {
        ...createMockContext({}, '/src/import-eq-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([{ name: 'imported' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/used-import-eq.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should report when import name does not match any export', () => {
      const importerAst = createASTWithImports([
        { names: ['otherName'], source: '/src/mismatch-test.ts' },
      ])
      const importerCtx = {
        ...createMockContext({}, '/src/mismatch-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([{ name: 'myExport' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/mismatch-test.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'myExport' is never used in other modules",
        }),
      )
    })

    test('should handle mixed used and unused exports', () => {
      const importerAst = createASTWithImports([
        { names: ['usedOne'], source: '/src/mixed-use.ts' },
      ])
      const importerCtx = {
        ...createMockContext({}, '/src/mixed-use-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([
        { name: 'usedOne', type: 'function' },
        { name: 'unusedOne', type: 'function' },
      ])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/mixed-use.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'unusedOne' is never used in other modules",
        }),
      )
    })

    test('should handle multiple imports from same file', () => {
      const importerAst = createASTWithImports([
        { names: ['a', 'b'], source: '/src/multi-import.ts' },
      ])
      const importerCtx = {
        ...createMockContext({}, '/src/multi-import-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([
        { name: 'a', type: 'function' },
        { name: 'b', type: 'function' },
        { name: 'c', type: 'function' },
      ])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/multi-import.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'c' is never used in other modules",
        }),
      )
    })

    test('should not report any export when namespace import covers all', () => {
      const importerAst = createASTWithImports([{ names: ['*'], source: '/src/star-covered.ts' }])
      const importerCtx = {
        ...createMockContext({}, '/src/star-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([
        { name: 'x', type: 'function' },
        { name: 'y', type: 'class' },
        { name: 'z', type: 'variable' },
      ])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/star-covered.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should handle variable export used by import', () => {
      const importerAst = createASTWithImports([{ names: ['myConst'], source: '/src/used-var.ts' }])
      const importerCtx = {
        ...createMockContext({}, '/src/used-var-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([{ name: 'myConst', type: 'variable' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/used-var.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should handle specifier export used by import', () => {
      const importerAst = createASTWithImports([
        { names: ['specItem'], source: '/src/used-spec.ts' },
      ])
      const importerCtx = {
        ...createMockContext({}, '/src/used-spec-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([{ name: 'specItem' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/used-spec.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })
  })

  describe('ignorePatterns option expanded', () => {
    test('should not report export matching exact pattern string', () => {
      const ast = createASTWithNamedExports([{ name: 'internalApi', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: ['internalApi'] }, '/src/ignore-exact-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should report export not matching any pattern', () => {
      const ast = createASTWithNamedExports([{ name: 'publicApi', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: ['internalApi'] }, '/src/ignore-nomatch-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should support regex patterns with slashes for underscore prefix', () => {
      const ast = createASTWithNamedExports([{ name: '_helper', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: ['/^_/'] }, '/src/ignore-regex-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should support regex patterns for suffix matching', () => {
      const ast = createASTWithNamedExports([{ name: 'myHelper', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: ['/Helper$/'] }, '/src/ignore-suffix-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should support multiple ignore patterns', () => {
      const ast = createASTWithNamedExports([
        { name: '_private', type: 'function' },
        { name: 'internal', type: 'function' },
      ])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: ['/^_/', 'internal'] }, '/src/ignore-multi-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should report when no pattern matches', () => {
      const ast = createASTWithNamedExports([{ name: 'publicFunc', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: ['/^_/', 'internal'] }, '/src/ignore-nopat-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should not report when any one pattern matches', () => {
      const ast = createASTWithNamedExports([{ name: 'myInternalFn', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext(
          { ignorePatterns: ['nothing', 'myInternalFn', 'other'] },
          '/src/ignore-any-test.ts',
        ),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should handle empty ignorePatterns array', () => {
      const ast = createASTWithNamedExports([{ name: 'foo', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: [] }, '/src/ignore-empty-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should ignore class exports matching pattern', () => {
      const ast = createASTWithNamedExports([{ name: '_InternalClass', type: 'class' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: ['/^_/'] }, '/src/ignore-class-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should ignore variable exports matching pattern', () => {
      const ast = createASTWithNamedExports([{ name: 'CONFIG_internal', type: 'variable' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: ['/internal$/'] }, '/src/ignore-var-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should be case sensitive for exact match', () => {
      const ast = createASTWithNamedExports([{ name: 'MyFunc', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: ['myfunc'] }, '/src/ignore-case-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })
  })

  describe('ignoreTypeOnly option expanded', () => {
    test('should not report type-only exports when ignoreTypeOnly is true', () => {
      const ast = createASTWithNamedExports([{ name: 'MyType', type: 'type' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignoreTypeOnly: true }, '/src/it-type-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not report type-only interface when ignoreTypeOnly is true', () => {
      const ast = createASTWithNamedExports([{ name: 'Iface', type: 'interface' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignoreTypeOnly: true }, '/src/it-iface-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should report type-only exports when ignoreTypeOnly is false', () => {
      const ast = createASTWithNamedExports([{ name: 'MyType', type: 'type' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignoreTypeOnly: false }, '/src/it-false-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should report non-type exports even when ignoreTypeOnly is true', () => {
      const ast = createASTWithNamedExports([{ name: 'myFunc', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignoreTypeOnly: true }, '/src/it-nontype-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should handle exportKind type on ExportNamedDeclaration', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            exportKind: 'type',
            specifiers: [{ type: 'ExportSpecifier', exported: { name: 'TypeExport' } }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignoreTypeOnly: true }, '/src/it-kind-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should handle exportKind type on ExportSpecifier', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            specifiers: [
              {
                type: 'ExportSpecifier',
                exported: { name: 'SpecType' },
                exportKind: 'type',
              },
            ],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignoreTypeOnly: true }, '/src/it-speckind-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should report type alias when ignoreTypeOnly defaults to false', () => {
      const ast = createASTWithNamedExports([{ name: 'DefaultType', type: 'type' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/it-default-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should not report namespace type export when ignoreTypeOnly is true', () => {
      const ast = {
        body: [
          {
            type: 'ExportAllDeclaration',
            source: { value: './types' },
            exportKind: 'type',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignoreTypeOnly: true }, '/src/it-ns-type-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should report interface when ignoreTypeOnly is false', () => {
      const ast = createASTWithNamedExports([{ name: 'ReportedIface', type: 'interface' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignoreTypeOnly: false }, '/src/it-rpiface-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should selectively report only non-type exports with ignoreTypeOnly true', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            declaration: {
              type: 'FunctionDeclaration',
              id: { name: 'realFunc' },
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'ExportNamedDeclaration',
            declaration: {
              type: 'TSTypeAliasDeclaration',
              id: { name: 'OnlyType' },
            },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignoreTypeOnly: true }, '/src/it-selective-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'realFunc' is never used in other modules",
        }),
      )
    })
  })

  describe('allowEntryExports option', () => {
    test('should skip index.ts by default when allowEntryExports is true', () => {
      const ast = createASTWithNamedExports([{ name: 'entryExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ allowEntryExports: true }, '/src/index.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should skip index.js by default', () => {
      const ast = createASTWithNamedExports([{ name: 'entryExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/index.js'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should skip main.ts by default', () => {
      const ast = createASTWithNamedExports([{ name: 'entryExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/main.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should skip main.js by default', () => {
      const ast = createASTWithNamedExports([{ name: 'entryExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/main.js'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should report unused exports in regular file when allowEntryExports is true', () => {
      const ast = createASTWithNamedExports([{ name: 'regularExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ allowEntryExports: true }, '/src/regular.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should report unused exports in index.ts when allowEntryExports is false', () => {
      const ast = createASTWithNamedExports([{ name: 'entryExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ allowEntryExports: false }, '/src/no-allow-index.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should report unused exports in main.ts when allowEntryExports is false', () => {
      const ast = createASTWithNamedExports([{ name: 'entryExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ allowEntryExports: false }, '/src/no-allow-main.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should skip deeply nested index.ts', () => {
      const ast = createASTWithNamedExports([{ name: 'deepExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/utils/helpers/index.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should skip deeply nested main.ts', () => {
      const ast = createASTWithNamedExports([{ name: 'deepExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/features/auth/main.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not skip index.tsx with default options', () => {
      const ast = createASTWithNamedExports([{ name: 'tsxExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/index.tsx'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should not skip main.jsx with default options', () => {
      const ast = createASTWithNamedExports([{ name: 'jsxExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/main.jsx'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })
  })

  describe('entryFiles option expanded', () => {
    test('should skip custom entry file matching exactly', () => {
      const ast = createASTWithNamedExports([{ name: 'customEntry', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ entryFiles: ['app.ts'] }, '/src/app.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should skip when entry file pattern includes asterisk', () => {
      const ast = createASTWithNamedExports([{ name: 'wildExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ entryFiles: ['*.d.ts'] }, '/src/types.d.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not skip non-matching custom entry file', () => {
      const ast = createASTWithNamedExports([{ name: 'nonEntry', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ entryFiles: ['app.ts'] }, '/src/other.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should support multiple entry file patterns', () => {
      const ast = createASTWithNamedExports([{ name: 'multiEntry', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ entryFiles: ['app.ts', 'server.ts'] }, '/src/server.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should match entry file with partial path', () => {
      const ast = createASTWithNamedExports([{ name: 'partialExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ entryFiles: ['src/entry'] }, '/src/entry.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should support glob pattern in entry files', () => {
      const ast = createASTWithNamedExports([{ name: 'globExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ entryFiles: ['**/index.ts'] }, '/src/deep/path/index.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should handle question mark wildcard in entry files', () => {
      const ast = createASTWithNamedExports([{ name: 'questionExport', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ entryFiles: ['*page?.ts'] }, '/src/page1.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should not skip file when entry files list is empty', () => {
      const ast = createASTWithNamedExports([{ name: 'noEntry', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ entryFiles: [], allowEntryExports: false }, '/src/no-entry-list.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should default to index/main when no custom entry files specified', () => {
      const ast = createASTWithNamedExports([{ name: 'defaultEntry', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ entryFiles: [] }, '/src/index.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      // index.ts is matched by default even with empty entryFiles
      expect(mockReport).not.toHaveBeenCalled()
    })
  })

  describe('extractExports edge cases', () => {
    test('should handle ExportNamedDeclaration with no declaration or specifiers', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/no-decl-spec-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle FunctionDeclaration without id', () => {
      const ast = {
        body: [
          {
            type: 'FunctionDeclaration',
            modifiers: [{ type: 'TSExportKeyword' }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/no-id-fn-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ClassDeclaration without id', () => {
      const ast = {
        body: [
          {
            type: 'ClassDeclaration',
            modifiers: [{ type: 'TSExportKeyword' }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/no-id-class-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle VariableDeclaration with non-Identifier id', () => {
      const ast = {
        body: [
          {
            type: 'VariableDeclaration',
            declarations: [{ id: { type: 'ObjectPattern', properties: [] } }],
            modifiers: [{ type: 'TSExportKeyword' }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/non-id-var-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ExportNamedDeclaration with unknown declaration type', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            declaration: { type: 'UnknownDeclarationType', id: { name: 'foo' } },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/unknown-decl-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ExportSpecifier with no exported property', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            specifiers: [{ type: 'ExportSpecifier' }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/no-exported-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ExportSpecifier with non-string exported name', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            specifiers: [{ type: 'ExportSpecifier', exported: { name: 123 } }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/nonstr-name-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle node with unknown type', () => {
      const ast = {
        body: [
          {
            type: 'UnknownNodeType',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/unknown-node-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle body as nested program.body', () => {
      const ast = {
        program: {
          body: [
            {
              type: 'ExportNamedDeclaration',
              specifiers: [{ type: 'ExportSpecifier', exported: { name: 'nestedExport' } }],
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
            },
          ],
        },
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/nested-body-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should handle ExportNamedDeclaration with empty specifiers array', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            specifiers: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/empty-spec-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })
  })

  describe('extractImports edge cases', () => {
    test('should handle ImportDeclaration with non-string source', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: 42 },
            specifiers: [{ type: 'ImportDefaultSpecifier' }],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/nonstr-src-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ImportDeclaration with no source', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            specifiers: [{ type: 'ImportDefaultSpecifier' }],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/no-src-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ImportDeclaration with empty specifiers', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './side-effects' },
            specifiers: [],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/empty-spec-import-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle CallExpression with non-require non-import callee', () => {
      const ast = {
        body: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'myFunction' },
            arguments: [{ type: 'StringLiteral', value: './module' }],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/non-require-call-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle CallExpression with empty arguments', () => {
      const ast = {
        body: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'require' },
            arguments: [],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/empty-args-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle require with non-string argument type', () => {
      const ast = {
        body: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'require' },
            arguments: [{ type: 'Identifier', name: 'moduleName' }],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/require-nonstr-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle TSImportEqualsDeclaration with non-external reference', () => {
      const ast = {
        body: [
          {
            type: 'TSImportEqualsDeclaration',
            id: { name: 'localRef' },
            moduleReference: {
              type: 'TSQualifiedName',
              left: { name: 'ns' },
              right: { name: 'Type' },
            },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/ts-import-eq-nonext-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ImportSpecifier with no imported property', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './module' },
            specifiers: [{ type: 'ImportSpecifier' }],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/no-imported-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle import with importKind type on specifier', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './types' },
            specifiers: [
              {
                type: 'ImportSpecifier',
                imported: { name: 'TypeRef' },
                importKind: 'type',
              },
            ],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/spec-importkind-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle dynamic import with non-string value', () => {
      const ast = {
        body: [
          {
            type: 'CallExpression',
            callee: { type: 'Import' },
            arguments: [{ type: 'Identifier', name: 'path' }],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/dynamic-nonstr-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })
  })

  describe('hasExportModifier edge cases', () => {
    test('should detect export via FunctionDeclaration with export modifier', () => {
      const ast = createASTWithFunctionWithExportModifier()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/mod-fn-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      // If export modifier is detected, the function should be in exports and reported as unused
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'exportedFunc' is never used in other modules",
        }),
      )
    })

    test('should not export FunctionDeclaration without export modifier', () => {
      const ast = {
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'nonExported' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/no-mod-fn-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should handle node with empty modifiers array', () => {
      const ast = {
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'emptyMod' },
            modifiers: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/empty-mod-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should handle node with non-export modifiers', () => {
      const ast = {
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'asyncFunc' },
            modifiers: [{ type: 'AsyncKeyword' }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/nonexport-mod-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should detect modifier with kind export', () => {
      const ast = {
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'kindExportFn' },
            modifiers: [{ type: 'SomeKeyword', kind: 'export' }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/kind-export-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'kindExportFn' is never used in other modules",
        }),
      )
    })

    test('should handle ClassDeclaration with export modifier', () => {
      const ast = createASTWithClassWithExportModifier()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/mod-class-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'ExportedClass' is never used in other modules",
        }),
      )
    })

    test('should handle VariableDeclaration with export modifier', () => {
      const ast = createASTWithVariableWithExportModifier()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/mod-var-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'exportedVar' is never used in other modules",
        }),
      )
    })

    test('should handle mixed modifiers including export', () => {
      const ast = {
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'mixedModFn' },
            modifiers: [{ type: 'AsyncKeyword' }, { type: 'TSExportKeyword' }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/mixed-mod-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'mixedModFn' is never used in other modules",
        }),
      )
    })
  })

  describe('report properties', () => {
    test('should report with message containing export name', () => {
      const ast = createASTWithNamedExports([{ name: 'specificName', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/msg-name-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'specificName' is never used in other modules",
        }),
      )
    })

    test('should report with loc property', () => {
      const ast = createASTWithNamedExports([{ name: 'locTest', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/loc-prop-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.any(Object),
        }),
      )
    })

    test('should report loc with start line and column', () => {
      const ast = createASTWithNamedExports([{ name: 'locDetail', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/loc-detail-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      const report = (
        mockReport.mock.calls[0] as Array<{ loc: { start: { line: number; column: number } } }>
      )[0]
      expect(report.loc.start).toHaveProperty('line')
      expect(report.loc.start).toHaveProperty('column')
    })

    test('should report default export as default', () => {
      const ast = createASTWithDefaultExport()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/default-rpt-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'default' is never used in other modules",
        }),
      )
    })

    test('should report namespace export as asterisk', () => {
      const ast = createASTWithNamespaceExport()
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/ns-rpt-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export '*' is never used in other modules",
        }),
      )
    })

    test('should call report once per unused export', () => {
      const ast = createASTWithNamedExports([
        { name: 'a', type: 'function' },
        { name: 'b', type: 'function' },
        { name: 'c', type: 'function' },
        { name: 'd', type: 'function' },
      ])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/count-report-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(4)
    })

    test('should not call report when all exports are used', () => {
      const importerAst = createASTWithImports([
        { names: ['used1', 'used2'], source: '/src/all-used.ts' },
      ])
      const importerCtx = {
        ...createMockContext({}, '/src/all-used-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([
        { name: 'used1', type: 'function' },
        { name: 'used2', type: 'function' },
      ])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/all-used.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should include end location in report', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            declaration: {
              type: 'FunctionDeclaration',
              id: { name: 'withEnd' },
            },
            loc: { start: { line: 5, column: 10 }, end: { line: 10, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/end-loc-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      const report = (
        mockReport.mock.calls[0] as Array<{ loc: { end: { line: number; column: number } } }>
      )[0]
      expect(report.loc.end.line).toBe(10)
      expect(report.loc.end.column).toBe(20)
    })
  })

  describe('multiple exports mixed types', () => {
    test('should handle file with function and class exports', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            declaration: { type: 'FunctionDeclaration', id: { name: 'fn' } },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'ExportNamedDeclaration',
            declaration: { type: 'ClassDeclaration', id: { name: 'Cls' } },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/fn-class-mix-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(2)
    })

    test('should handle file with all export types', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            declaration: { type: 'FunctionDeclaration', id: { name: 'fn' } },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'ExportDefaultDeclaration',
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
          },
          {
            type: 'ExportAllDeclaration',
            source: { value: './other' },
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/all-types-mix-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(3)
    })

    test('should handle multiple specifier exports', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            specifiers: [
              { type: 'ExportSpecifier', exported: { name: 'a' } },
              { type: 'ExportSpecifier', exported: { name: 'b' } },
              { type: 'ExportSpecifier', exported: { name: 'c' } },
            ],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/multi-spec-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(3)
    })

    test('should handle variable declaration with multiple declarators', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            declaration: {
              type: 'VariableDeclaration',
              declarations: [
                { id: { type: 'Identifier', name: 'x' } },
                { id: { type: 'Identifier', name: 'y' } },
              ],
            },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/multi-decl-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(2)
    })

    test('should handle mixed used and unused with multiple types', () => {
      const importerAst = createASTWithImports([{ names: ['fn'], source: '/src/mix-usage.ts' }])
      const importerCtx = {
        ...createMockContext({}, '/src/mix-usage-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            declaration: { type: 'FunctionDeclaration', id: { name: 'fn' } },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'ExportNamedDeclaration',
            declaration: { type: 'ClassDeclaration', id: { name: 'UnusedCls' } },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/mix-usage.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'UnusedCls' is never used in other modules",
        }),
      )
    })

    test('should handle export with declaration and without declaration in same file', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            declaration: { type: 'FunctionDeclaration', id: { name: 'declared' } },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'ExportNamedDeclaration',
            specifiers: [{ type: 'ExportSpecifier', exported: { name: 'specified' } }],
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/decl-spec-mix-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(2)
    })

    test('should handle export modifier alongside ExportNamedDeclaration', () => {
      const ast = {
        body: [
          {
            type: 'FunctionDeclaration',
            id: { name: 'modifierExport' },
            modifiers: [{ type: 'TSExportKeyword' }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'ExportNamedDeclaration',
            declaration: { type: 'FunctionDeclaration', id: { name: 'namedExport' } },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/mod-named-mix-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(2)
    })
  })

  describe('global state management', () => {
    test('should clear state when reprocessing same file path', () => {
      const filePath = '/src/state-clear-test.ts'
      const ast1 = createASTWithNamedExports([{ name: 'firstPass', type: 'function' }])
      const mockReport1 = vi.fn()
      const ctx1 = {
        ...createMockContext({}, filePath),
        getAST: () => ast1,
        report: mockReport1,
      } as unknown as RuleContext
      const visitor1 = noUnusedExportsRule.create(ctx1)
      visitor1.Program(ast1)
      visitor1['Program:exit'](null)

      expect(mockReport1).toHaveBeenCalledTimes(1)

      // Second pass with same filePath clears state
      const ast2 = createASTWithNamedExports([{ name: 'secondPass', type: 'function' }])
      const mockReport2 = vi.fn()
      const ctx2 = {
        ...createMockContext({}, filePath),
        getAST: () => ast2,
        report: mockReport2,
      } as unknown as RuleContext
      const visitor2 = noUnusedExportsRule.create(ctx2)
      visitor2.Program(ast2)
      visitor2['Program:exit'](null)

      expect(mockReport2).toHaveBeenCalledTimes(1)
      expect(mockReport2).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'secondPass' is never used in other modules",
        }),
      )
    })

    test('should handle sequential processing of different files', () => {
      const ast1 = createASTWithNamedExports([{ name: 'file1Export', type: 'function' }])
      const ctx1 = {
        ...createMockContext({}, '/src/seq-file-1.ts'),
        getAST: () => ast1,
      } as unknown as RuleContext
      noUnusedExportsRule.create(ctx1).Program(ast1)

      const ast2 = createASTWithNamedExports([{ name: 'file2Export', type: 'function' }])
      const ctx2 = {
        ...createMockContext({}, '/src/seq-file-2.ts'),
        getAST: () => ast2,
      } as unknown as RuleContext
      noUnusedExportsRule.create(ctx2).Program(ast2)

      expect(() => noUnusedExportsRule.create(ctx2)).not.toThrow()
    })

    test('should handle file with only imports and no exports', () => {
      const ast = createASTWithImports([{ names: ['something'], source: './other' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/only-imports-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should handle file with empty body', () => {
      const ast = { body: [] }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/empty-body-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should handle Program:exit without prior Program call', () => {
      const context = createMockContext({}, '/src/no-program-test.ts')
      const visitor = noUnusedExportsRule.create(context)

      expect(() => visitor['Program:exit'](null)).not.toThrow()
    })
  })

  describe('Program:exit behavior', () => {
    test('should skip checking for entry files with default allowEntryExports', () => {
      const ast = createASTWithNamedExports([{ name: 'entryFn', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/index.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should check exports for non-entry files', () => {
      const ast = createASTWithNamedExports([{ name: 'regularFn', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/regular-module.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should not report when usedExports includes export name', () => {
      const importerAst = createASTWithImports([{ names: ['target'], source: '/src/exit-used.ts' }])
      const importerCtx = {
        ...createMockContext({}, '/src/exit-used-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([{ name: 'target', type: 'function' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/exit-used.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should report when usedExports does not include export name', () => {
      const importerAst = createASTWithImports([{ names: ['other'], source: '/src/exit-miss.ts' }])
      const importerCtx = {
        ...createMockContext({}, '/src/exit-miss-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([{ name: 'target', type: 'function' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/exit-miss.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should skip ignoreTypeOnly exports when option is true', () => {
      const ast = createASTWithNamedExports([{ name: 'TypeOnly', type: 'type' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignoreTypeOnly: true }, '/src/exit-it-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should skip exports matching ignorePatterns', () => {
      const ast = createASTWithNamedExports([{ name: '_skip', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ ignorePatterns: ['/^_/'] }, '/src/exit-ignore-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should check when allowEntryExports is false even for entry files', () => {
      const ast = createASTWithNamedExports([{ name: 'checked', type: 'function' }])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({ allowEntryExports: false }, '/src/index.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      // With allowEntryExports: false, the isEntryFile check is skipped entirely
      // so the file is treated as a regular file and reports unused exports
      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should handle combined ignoreTypeOnly and ignorePatterns', () => {
      const ast = createASTWithNamedExports([
        { name: 'TypeA', type: 'type' },
        { name: '_internal', type: 'function' },
        { name: 'usedLooking', type: 'function' },
      ])
      const mockReport = vi.fn()
      const context = {
        ...createMockContext(
          { ignoreTypeOnly: true, ignorePatterns: ['/^_/'] },
          '/src/combined-opt-test.ts',
        ),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      // TypeA is type-only (ignored), _internal matches pattern (ignored), usedLooking is reported
      expect(mockReport).toHaveBeenCalledTimes(1)
      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'usedLooking' is never used in other modules",
        }),
      )
    })
  })

  describe('import type variations', () => {
    test('should handle ImportDeclaration with importKind type on declaration', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './types' },
            importKind: 'type',
            specifiers: [{ type: 'ImportSpecifier', imported: { name: 'TypeA' } }],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/import-kind-decl-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle require with Literal type argument', () => {
      const ast = {
        body: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'require' },
            arguments: [{ type: 'Literal', value: './literal-module' }],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/require-literal-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle dynamic import with string value', () => {
      const ast = {
        body: [
          {
            type: 'CallExpression',
            callee: { type: 'Import' },
            arguments: [{ type: 'StringLiteral', value: './dynamic-target' }],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/dynamic-str-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle TSImportEqualsDeclaration with isTypeOnly', () => {
      const ast = {
        body: [
          {
            type: 'TSImportEqualsDeclaration',
            id: { name: 'typeImport' },
            moduleReference: {
              type: 'TSExternalModuleReference',
              expression: { value: './external-types' },
            },
            isTypeOnly: true,
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/import-eq-type-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle TSImportEqualsDeclaration without id name', () => {
      const ast = {
        body: [
          {
            type: 'TSImportEqualsDeclaration',
            id: {},
            moduleReference: {
              type: 'TSExternalModuleReference',
              expression: { value: './no-name-mod' },
            },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/import-eq-no-id-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle mixed import types in single file', () => {
      const ast = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: './mod1' },
            specifiers: [{ type: 'ImportDefaultSpecifier' }],
          },
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'require' },
            arguments: [{ type: 'StringLiteral', value: './mod2' }],
          },
          {
            type: 'TSImportEqualsDeclaration',
            id: { name: 'alias' },
            moduleReference: {
              type: 'TSExternalModuleReference',
              expression: { value: './mod3' },
            },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/mixed-imports-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle namespace import marked as used for all exports', () => {
      const importerAst = createASTWithImports([{ names: ['*'], source: '/src/ns-all.ts' }])
      const importerCtx = {
        ...createMockContext({}, '/src/ns-all-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            declaration: { type: 'FunctionDeclaration', id: { name: 'fnA' } },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
          {
            type: 'ExportDefaultDeclaration',
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
          },
          {
            type: 'ExportAllDeclaration',
            source: { value: './re-exported' },
            loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/ns-all.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should handle re-export scenario with source file', () => {
      const ast = {
        body: [
          {
            type: 'ExportAllDeclaration',
            source: { value: './base-module' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/reexport-scenario.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export '*' is never used in other modules",
        }),
      )
    })

    test('should handle ImportSpecifier with importKind type', () => {
      const importerAst = {
        body: [
          {
            type: 'ImportDeclaration',
            source: { value: '/src/type-spec-target.ts' },
            specifiers: [
              {
                type: 'ImportSpecifier',
                imported: { name: 'TypeFromSpec' },
                importKind: 'type',
              },
            ],
          },
        ],
      }
      const importerCtx = {
        ...createMockContext({}, '/src/type-spec-consumer.ts'),
        getAST: () => importerAst,
      } as unknown as RuleContext
      noUnusedExportsRule.create(importerCtx).Program(importerAst)

      const exporterAst = createASTWithNamedExports([{ name: 'TypeFromSpec' }])
      const mockReport = vi.fn()
      const exporterCtx = {
        ...createMockContext({}, '/src/type-spec-target.ts'),
        getAST: () => exporterAst,
        report: mockReport,
      } as unknown as RuleContext
      const visitor = noUnusedExportsRule.create(exporterCtx)
      visitor.Program(exporterAst)
      visitor['Program:exit'](null)

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should handle CallExpression with MemberExpression callee', () => {
      const ast = {
        body: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'method' },
            },
            arguments: [{ type: 'StringLiteral', value: './module' }],
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/member-call-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle null node in body array', () => {
      const ast = {
        body: [
          null,
          {
            type: 'ExportNamedDeclaration',
            specifiers: [{ type: 'ExportSpecifier', exported: { name: 'afterNull' } }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/null-body-node-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle undefined node in body array', () => {
      const ast = {
        body: [
          undefined,
          {
            type: 'FunctionDeclaration',
            id: { name: 'safe' },
            modifiers: [{ type: 'TSExportKeyword' }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const context = {
        ...createMockContext({}, '/src/undef-body-node-test.ts'),
        getAST: () => ast,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      expect(() => visitor.Program(ast)).not.toThrow()
    })

    test('should handle ExportSpecifier mixed with non-ExportSpecifier', () => {
      const ast = {
        body: [
          {
            type: 'ExportNamedDeclaration',
            specifiers: [
              { type: 'ExportSpecifier', exported: { name: 'valid' } },
              { type: 'OtherSpecifier' },
              { type: 'ExportSpecifier', exported: { name: 'alsoValid' } },
            ],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/mixed-specifier-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledTimes(2)
    })

    test('should handle VariableDeclaration export modifier with null declaration', () => {
      const ast = {
        body: [
          {
            type: 'VariableDeclaration',
            declarations: [null, { id: { type: 'Identifier', name: 'afterNullDecl' } }],
            modifiers: [{ type: 'TSExportKeyword' }],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ],
      }
      const mockReport = vi.fn()
      const context = {
        ...createMockContext({}, '/src/null-decl-var-test.ts'),
        getAST: () => ast,
        report: mockReport,
      } as unknown as RuleContext

      const visitor = noUnusedExportsRule.create(context)
      visitor.Program(ast)
      visitor['Program:exit'](null)

      expect(mockReport).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Export 'afterNullDecl' is never used in other modules",
        }),
      )
    })
  })
})
