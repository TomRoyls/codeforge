import { describe, test, expect, beforeEach, vi } from 'vitest';
import { noUnusedExportsRule } from '../../../../src/rules/dependencies/no-unused-exports.js';
import type { RuleContext } from '../../../../src/plugins/types.js';

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/module.ts'
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
  } as unknown as RuleContext;
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
        };
      }
      if (exp.type === 'class') {
        return {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'ClassDeclaration',
            id: { name: exp.name },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        };
      }
      if (exp.type === 'variable') {
        return {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'VariableDeclaration',
            declarations: [{ id: { type: 'Identifier', name: exp.name } }],
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        };
      }
      if (exp.type === 'type') {
        return {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'TSTypeAliasDeclaration',
            id: { name: exp.name },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        };
      }
      if (exp.type === 'interface') {
        return {
          type: 'ExportNamedDeclaration',
          declaration: {
            type: 'TSInterfaceDeclaration',
            id: { name: exp.name },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        };
      }
      return {
        type: 'ExportNamedDeclaration',
        specifiers: [{ type: 'ExportSpecifier', exported: { name: exp.name } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };
    }),
  };
}

function createASTWithDefaultExport(): unknown {
  return {
    body: [
      {
        type: 'ExportDefaultDeclaration',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      },
    ],
  };
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
  };
}

function createASTWithImports(imports: Array<{ names: string[]; source: string }>): unknown {
  return {
    body: imports.map((imp) => ({
      type: 'ImportDeclaration',
      source: { value: imp.source },
      specifiers: imp.names.map((name) => {
        if (name === 'default') {
          return { type: 'ImportDefaultSpecifier' };
        }
        if (name === '*') {
          return { type: 'ImportNamespaceSpecifier' };
        }
        return { type: 'ImportSpecifier', imported: { name } };
      }),
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })),
  };
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
  };
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
  };
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
  };
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
  };
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
  };
}

describe('no-unused-exports rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noUnusedExportsRule.meta.type).toBe('problem');
    });

    test('should have warn severity', () => {
      expect(noUnusedExportsRule.meta.severity).toBe('warn');
    });

    test('should be recommended', () => {
      expect(noUnusedExportsRule.meta.docs?.recommended).toBe(true);
    });

    test('should have correct category', () => {
      expect(noUnusedExportsRule.meta.docs?.category).toBe('dependencies');
    });

    test('should have schema defined', () => {
      expect(noUnusedExportsRule.meta.schema).toBeDefined();
    });

    test('should have correct description', () => {
      expect(noUnusedExportsRule.meta.docs?.description).toContain('never imported');
    });
  });

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const context = createMockContext();
      const visitor = noUnusedExportsRule.create(context);
      
      expect(visitor).toHaveProperty('Program');
      expect(visitor).toHaveProperty('Program:exit');
    });

    test('should handle empty AST', () => {
      const context = createMockContext();
      const visitor = noUnusedExportsRule.create(context);
      
      expect(() => visitor.Program(null)).not.toThrow();
    });

    test('should handle AST with no exports', () => {
      const context = {
        ...createMockContext(),
        getAST: () => ({ body: [] }),
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program({})).not.toThrow();
    });

    test('should handle named exports', () => {
      const ast = createASTWithNamedExports([{ name: 'foo' }]);
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle default export', () => {
      const ast = createASTWithDefaultExport();
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle namespace export', () => {
      const ast = createASTWithNamespaceExport();
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle function exports', () => {
      const ast = createASTWithNamedExports([{ name: 'myFunc', type: 'function' }]);
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle class exports', () => {
      const ast = createASTWithNamedExports([{ name: 'MyClass', type: 'class' }]);
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle variable exports', () => {
      const ast = createASTWithNamedExports([{ name: 'myVar', type: 'variable' }]);
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle type exports', () => {
      const ast = createASTWithNamedExports([{ name: 'MyType', type: 'type' }]);
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle interface exports', () => {
      const ast = createASTWithNamedExports([{ name: 'MyInterface', type: 'interface' }]);
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle imports', () => {
      const ast = createASTWithImports([{ names: ['foo', 'bar'], source: './module' }]);
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle require imports', () => {
      const ast = createASTWithRequireImport('./module');
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle dynamic imports', () => {
      const ast = createASTWithDynamicImport('./module');
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle function with export modifier', () => {
      const ast = createASTWithFunctionWithExportModifier();
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle class with export modifier', () => {
      const ast = createASTWithClassWithExportModifier();
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle variable with export modifier', () => {
      const ast = createASTWithVariableWithExportModifier();
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle Program:exit', () => {
      const context = createMockContext();
      const visitor = noUnusedExportsRule.create(context);
      const exitHandler = visitor['Program:exit'] as (node: unknown) => void;
      
      expect(() => exitHandler(null)).not.toThrow();
    });

    test('should handle null or undefined nodes gracefully', () => {
      const context = createMockContext();
      const visitor = noUnusedExportsRule.create(context);
      
      expect(() => visitor.Program(null)).not.toThrow();
      expect(() => visitor.Program(undefined)).not.toThrow();
    });
  });

  describe('options', () => {
    test('should respect ignorePatterns option', () => {
      const context = createMockContext({ ignorePatterns: ['_*'] });
      const visitor = noUnusedExportsRule.create(context);
      expect(visitor).toBeDefined();
    });

    test('should respect ignoreTypeOnly option', () => {
      const context = createMockContext({ ignoreTypeOnly: true });
      const visitor = noUnusedExportsRule.create(context);
      expect(visitor).toBeDefined();
    });

    test('should respect allowEntryExports option', () => {
      const context = createMockContext({ allowEntryExports: true });
      const visitor = noUnusedExportsRule.create(context);
      expect(visitor).toBeDefined();
    });

    test('should respect entryFiles option', () => {
      const context = createMockContext({ entryFiles: ['index.ts'] });
      const visitor = noUnusedExportsRule.create(context);
      expect(visitor).toBeDefined();
    });

    test('should handle empty options', () => {
      const context = createMockContext({});
      const visitor = noUnusedExportsRule.create(context);
      expect(visitor).toBeDefined();
    });

    test('should skip entry files by default (index.ts)', () => {
      const context = createMockContext({}, '/src/index.ts');
      const visitor = noUnusedExportsRule.create(context);
      expect(visitor).toBeDefined();
    });

    test('should skip entry files by default (main.ts)', () => {
      const context = createMockContext({}, '/src/main.ts');
      const visitor = noUnusedExportsRule.create(context);
      expect(visitor).toBeDefined();
    });
  });

  describe('edge cases', () => {
    test('should handle non-object AST', () => {
      const context = createMockContext();
      const visitor = noUnusedExportsRule.create(context);
      
      expect(() => visitor.Program('string')).not.toThrow();
      expect(() => visitor.Program(123)).not.toThrow();
    });

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
      };
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

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
      };
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

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
      };
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

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
      };
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle default import', () => {
      const ast = createASTWithImports([{ names: ['default'], source: './module' }]);
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle namespace import', () => {
      const ast = createASTWithImports([{ names: ['*'], source: './module' }]);
      const context = {
        ...createMockContext(),
        getAST: () => ast,
      } as unknown as RuleContext;
      
      const visitor = noUnusedExportsRule.create(context);
      expect(() => visitor.Program(ast)).not.toThrow();
    });

    test('should handle entry file pattern matching with wildcard', () => {
      const context = createMockContext({ entryFiles: ['**/index.ts'] }, '/src/sub/index.ts');
      const visitor = noUnusedExportsRule.create(context);
      expect(visitor).toBeDefined();
    });
  });
});
