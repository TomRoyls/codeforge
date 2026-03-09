import { describe, test, expect, vi } from 'vitest';
import { noBarrelImportsRule } from '../../../../src/rules/dependencies/no-barrel-imports.js';
import type { RuleContext } from '../../../../src/plugins/types.js';

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts'
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

function createImportNode(source: string, specifiers?: string[]): unknown {
  const specs = (specifiers ?? ['foo']).map((name) => {
    if (name === 'default') {
      return { type: 'ImportDefaultSpecifier' };
    }
    if (name === '*') {
      return { type: 'ImportNamespaceSpecifier' };
    }
    return { type: 'ImportSpecifier', imported: { name } };
  });

  return {
    type: 'ImportDeclaration',
    source: { value: source },
    specifiers: specs,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  };
}

function createExportNamedNode(source: string): unknown {
  return {
    type: 'ExportNamedDeclaration',
    source: { value: source },
    specifiers: [],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  };
}

function createExportAllNode(source: string): unknown {
  return {
    type: 'ExportAllDeclaration',
    source: { value: source },
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  };
}

function createRequireNode(source: string): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'require' },
    arguments: [{ type: 'StringLiteral', value: source }],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
  };
}

describe('no-barrel-imports rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noBarrelImportsRule.meta.type).toBe('suggestion');
    });

    test('should have warn severity', () => {
      expect(noBarrelImportsRule.meta.severity).toBe('warn');
    });

    test('should not be recommended', () => {
      expect(noBarrelImportsRule.meta.docs?.recommended).toBe(false);
    });

    test('should have correct category', () => {
      expect(noBarrelImportsRule.meta.docs?.category).toBe('dependencies');
    });

    test('should have schema defined', () => {
      expect(noBarrelImportsRule.meta.schema).toBeDefined();
    });

    test('should have correct description', () => {
      expect(noBarrelImportsRule.meta.docs?.description).toContain('barrel file');
    });
  });

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const context = createMockContext();
      const visitor = noBarrelImportsRule.create(context);
      
      expect(visitor).toHaveProperty('ImportDeclaration');
      expect(visitor).toHaveProperty('ExportNamedDeclaration');
      expect(visitor).toHaveProperty('ExportAllDeclaration');
      expect(visitor).toHaveProperty('CallExpression');
    });

    test('should handle null node', () => {
      const context = createMockContext();
      const visitor = noBarrelImportsRule.create(context);
      
      expect(() => visitor.ImportDeclaration(null)).not.toThrow();
    });

    test('should handle non-object node', () => {
      const context = createMockContext();
      const visitor = noBarrelImportsRule.create(context);
      
      expect(() => visitor.ImportDeclaration('string')).not.toThrow();
    });
  });

  describe('barrel detection', () => {
    test('should detect /index.ts barrel import', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./utils/index.ts');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should detect /index.js barrel import', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./utils/index.js');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should detect /index.tsx barrel import', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./components/index.tsx');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should detect /index.jsx barrel import', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./components/index.jsx');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should detect /index.mjs barrel import', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./module/index.mjs');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should detect /index.cjs barrel import', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./module/index.cjs');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should not detect non-barrel import', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./utils/helper.ts');
      
      visitor.ImportDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });

    test('should detect barrel in Windows-style paths (normalized to forward slashes)', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('.\\utils\\index.ts');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });
  });

  describe('export barrel detection', () => {
    test('should detect export from barrel file', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createExportNamedNode('./utils/index.ts');
      
      visitor.ExportNamedDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should detect export all from barrel file', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createExportAllNode('./utils/index.ts');
      
      visitor.ExportAllDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should not detect export from non-barrel', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createExportNamedNode('./utils/helper.ts');
      
      visitor.ExportNamedDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });
  });

  describe('require detection', () => {
    test('should detect require from barrel file', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createRequireNode('./utils/index.ts');
      
      visitor.CallExpression(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should not detect require from non-barrel', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createRequireNode('./utils/helper.ts');
      
      visitor.CallExpression(node);
      
      expect(report).not.toHaveBeenCalled();
    });

    test('should ignore non-require CallExpression', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [],
      };
      
      visitor.CallExpression(node);
      
      expect(report).not.toHaveBeenCalled();
    });
  });

  describe('options', () => {
    test('should respect custom barrelPatterns', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ barrelPatterns: ['/main.ts'] }),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      
      // Custom pattern
      const customNode = createImportNode('./utils/main.ts');
      visitor.ImportDeclaration(customNode);
      expect(report).toHaveBeenCalledTimes(1);
      
      // Default pattern should not match
      report.mockClear();
      const defaultNode = createImportNode('./utils/index.ts');
      visitor.ImportDeclaration(defaultNode);
      expect(report).not.toHaveBeenCalled();
    });

    test('should respect exclude option', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ exclude: ['./external'] }),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./external/index.ts');
      
      visitor.ImportDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });

    test('should respect exclude with regex', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ exclude: ['/test-module/'] }),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./test-module/index.ts');
      
      visitor.ImportDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });

    test('should respect allowTypeOnly option', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ allowTypeOnly: true }),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      
      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        importKind: 'type',
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'Type' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };
      
      visitor.ImportDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });

    test('should allow type-only export', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ allowTypeOnly: true }),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      
      const node = {
        type: 'ExportAllDeclaration',
        source: { value: './utils/index.ts' },
        exportKind: 'type',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };
      
      visitor.ExportAllDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });

    test('should handle empty options', () => {
      const context = createMockContext({});
      const visitor = noBarrelImportsRule.create(context);
      expect(visitor).toBeDefined();
    });

    test('should handle undefined options', () => {
      const context = {
        ...createMockContext(),
        config: { options: [] },
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      expect(visitor).toBeDefined();
    });
  });

  describe('suggestions', () => {
    test('should provide suggestion for barrel import', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./utils/index.ts', ['foo', 'bar']);
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          suggest: expect.any(Array),
        })
      );
    });

    test('should handle empty specifiers in suggestion', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./utils/index.ts', []);
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          suggest: expect.any(Array),
        })
      );
    });
  });

  describe('edge cases', () => {
    test('should handle ImportDeclaration without source', () => {
      const context = createMockContext();
      const visitor = noBarrelImportsRule.create(context);
      
      expect(() => visitor.ImportDeclaration({ type: 'ImportDeclaration' })).not.toThrow();
    });

    test('should handle ExportNamedDeclaration with specifiers', () => {
      const context = createMockContext();
      const visitor = noBarrelImportsRule.create(context);
      
      const node = {
        type: 'ExportNamedDeclaration',
        source: { value: './utils/index.ts' },
        specifiers: [{ type: 'ExportSpecifier' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };
      
      expect(() => visitor.ExportNamedDeclaration(node)).not.toThrow();
    });

    test('should handle ExportAllDeclaration without source', () => {
      const context = createMockContext();
      const visitor = noBarrelImportsRule.create(context);
      
      expect(() => visitor.ExportAllDeclaration({ type: 'ExportAllDeclaration' })).not.toThrow();
    });

    test('should handle wildcard barrel pattern', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ barrelPatterns: ['*/index.ts'] }),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./utils/index.ts');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should handle default import specifiers', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./utils/index.ts', ['default']);
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should handle namespace import specifiers', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext;
      const visitor = noBarrelImportsRule.create(context);
      const node = createImportNode('./utils/index.ts', ['*']);
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should handle missing location in node', () => {
      const context = createMockContext();
      const visitor = noBarrelImportsRule.create(context);
      
      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'foo' } }],
      };
      
      expect(() => visitor.ImportDeclaration(node)).not.toThrow();
    });

    test('should handle require without string literal', () => {
      const context = createMockContext();
      const visitor = noBarrelImportsRule.create(context);
      
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      };
      
      expect(() => visitor.CallExpression(node)).not.toThrow();
    });
  });
});
