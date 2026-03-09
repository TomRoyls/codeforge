import { describe, test, expect, vi } from 'vitest';
import { consistentImportsRule } from '../../../../src/rules/dependencies/consistent-imports.js';
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

function createNamedImportNode(namedCount: number, source: string): unknown {
  const specifiers: Array<{ type: string; imported?: { name: string } }> = [];
  for (let i = 0; i < namedCount; i++) {
    specifiers.push({
      type: 'ImportSpecifier',
      imported: { name: `name${i}` },
    });
  }
  return {
    type: 'ImportDeclaration',
    source: { value: source },
    specifiers,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  };
}

function createDefaultImportNode(source: string): unknown {
  return {
    type: 'ImportDeclaration',
    source: { value: source },
    specifiers: [{ type: 'ImportDefaultSpecifier' }],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  };
}

function createNamespaceImportNode(source: string): unknown {
  return {
    type: 'ImportDeclaration',
    source: { value: source },
    specifiers: [{ type: 'ImportNamespaceSpecifier' }],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  };
}

function createMixedImportNode(source: string): unknown {
  return {
    type: 'ImportDeclaration',
    source: { value: source },
    specifiers: [
      { type: 'ImportDefaultSpecifier' },
      { type: 'ImportSpecifier', imported: { name: 'named' } },
    ],
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

describe('consistent-imports rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(consistentImportsRule.meta.type).toBe('suggestion');
    });

    test('should have warn severity', () => {
      expect(consistentImportsRule.meta.severity).toBe('warn');
    });

    test('should not be recommended', () => {
      expect(consistentImportsRule.meta.docs?.recommended).toBe(false);
    });

    test('should have correct category', () => {
      expect(consistentImportsRule.meta.docs?.category).toBe('dependencies');
    });

    test('should have schema defined', () => {
      expect(consistentImportsRule.meta.schema).toBeDefined();
    });

    test('should have correct description', () => {
      expect(consistentImportsRule.meta.docs?.description).toContain('consistent import style');
    });
  });

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      
      expect(visitor).toHaveProperty('ImportDeclaration');
      expect(visitor).toHaveProperty('CallExpression');
    });

    test('should handle null node', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      
      expect(() => visitor.ImportDeclaration(null)).not.toThrow();
    });

    test('should handle non-ImportDeclaration node', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      
      expect(() => visitor.ImportDeclaration({ type: 'Other' })).not.toThrow();
    });

    test('should handle ImportDeclaration without source', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      
      expect(() => visitor.ImportDeclaration({ type: 'ImportDeclaration' })).not.toThrow();
    });

    test('should handle named import', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      const node = createNamedImportNode(2, './module');
      
      expect(() => visitor.ImportDeclaration(node)).not.toThrow();
    });

    test('should handle default import', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      const node = createDefaultImportNode('./module');
      
      expect(() => visitor.ImportDeclaration(node)).not.toThrow();
    });

    test('should handle namespace import', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      const node = createNamespaceImportNode('./module');
      
      expect(() => visitor.ImportDeclaration(node)).not.toThrow();
    });

    test('should handle mixed import', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      const node = createMixedImportNode('./module');
      
      expect(() => visitor.ImportDeclaration(node)).not.toThrow();
    });

    test('should handle require call', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      const node = createRequireNode('./module');
      
      expect(() => visitor.CallExpression(node)).not.toThrow();
    });

    test('should ignore non-require CallExpression', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [],
      };
      
      expect(() => visitor.CallExpression(node)).not.toThrow();
    });

    test('should handle require without string literal argument', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      };
      
      expect(() => visitor.CallExpression(node)).not.toThrow();
    });
  });

  describe('prefer: named (default)', () => {
    test('should report namespace import when prefer is named', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createNamespaceImportNode('./module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should report mixed import when prefer is named', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createMixedImportNode('./module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should not report named import when prefer is named', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createNamedImportNode(2, './module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });

    test('should report require when prefer is named', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createRequireNode('./module');
      
      visitor.CallExpression(node);
      
      expect(report).toHaveBeenCalled();
    });
  });

  describe('prefer: namespace', () => {
    test('should report many named imports when prefer is namespace', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 3 }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createNamedImportNode(5, './module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should not report few named imports when prefer is namespace', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 5 }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createNamedImportNode(2, './module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });

    test('should use default namespaceThreshold of 5', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'namespace' }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createNamedImportNode(4, './module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });
  });

  describe('prefer: default', () => {
    test('should report namespace import when prefer is default', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createNamespaceImportNode('./module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should report multiple named imports when prefer is default', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createNamedImportNode(3, './module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should suggest default import for single named import when prefer is default', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createNamedImportNode(1, './module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalled();
    });

    test('should not report default import when prefer is default', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createDefaultImportNode('./module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });

    test('should report require when prefer is default', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createRequireNode('./module');
      
      visitor.CallExpression(node);
      
      expect(report).toHaveBeenCalled();
    });
  });

  describe('exclude option', () => {
    test('should exclude matching sources', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['./external'] }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createNamespaceImportNode('./external/module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });

    test('should exclude using regex pattern', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['/\\.test\\./'] }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createNamespaceImportNode('./module.test.ts');
      
      visitor.ImportDeclaration(node);
      
      expect(report).not.toHaveBeenCalled();
    });

    test('should exclude require calls', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['./external'] }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createRequireNode('./external/module');
      
      visitor.CallExpression(node);
      
      expect(report).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    test('should handle empty specifiers', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };
      
      expect(() => visitor.ImportDeclaration(node)).not.toThrow();
    });

    test('should handle undefined specifiers', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };
      
      expect(() => visitor.ImportDeclaration(node)).not.toThrow();
    });

    test('should handle non-string source', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      
      const node = {
        type: 'ImportDeclaration',
        source: { value: 123 },
        specifiers: [],
      };
      
      expect(() => visitor.ImportDeclaration(node)).not.toThrow();
    });

    test('should handle missing location', () => {
      const context = createMockContext();
      const visitor = consistentImportsRule.create(context);
      
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'foo' } }],
      };
      
      expect(() => visitor.ImportDeclaration(node)).not.toThrow();
    });

    test('should handle empty options', () => {
      const context = createMockContext({});
      const visitor = consistentImportsRule.create(context);
      expect(visitor).toBeDefined();
    });

    test('should handle undefined options', () => {
      const context = {
        ...createMockContext(),
        config: { options: [] },
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      expect(visitor).toBeDefined();
    });

    test('should generate suggestion for namespace import', () => {
      const report = vi.fn();
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext;
      const visitor = consistentImportsRule.create(context);
      const node = createNamedImportNode(3, './module');
      
      visitor.ImportDeclaration(node);
      
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          suggest: expect.any(Array),
        })
      );
    });
  });
});
