import { describe, test, expect, vi } from 'vitest'
import { consistentImportsRule } from '../../../../src/rules/dependencies/consistent-imports.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
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

function createNamedImportNode(namedCount: number, source: string): unknown {
  const specifiers: Array<{ type: string; imported?: { name: string } }> = []
  for (let i = 0; i < namedCount; i++) {
    specifiers.push({
      type: 'ImportSpecifier',
      imported: { name: `name${i}` },
    })
  }
  return {
    type: 'ImportDeclaration',
    source: { value: source },
    specifiers,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createDefaultImportNode(source: string): unknown {
  return {
    type: 'ImportDeclaration',
    source: { value: source },
    specifiers: [{ type: 'ImportDefaultSpecifier' }],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createNamespaceImportNode(source: string): unknown {
  return {
    type: 'ImportDeclaration',
    source: { value: source },
    specifiers: [{ type: 'ImportNamespaceSpecifier' }],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
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
  }
}

function createRequireNode(source: string): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'require' },
    arguments: [{ type: 'Literal', value: source }],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
  }
}

function createRequireNodeWithLiteral(source: string): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'require' },
    arguments: [{ type: 'Literal', value: source }],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
  }
}

describe('consistent-imports rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(consistentImportsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(consistentImportsRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(consistentImportsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(consistentImportsRule.meta.docs?.category).toBe('dependencies')
    })

    test('should have schema defined', () => {
      expect(consistentImportsRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(consistentImportsRule.meta.docs?.description).toContain('consistent import style')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)

      expect(visitor).toHaveProperty('ImportDeclaration')
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should handle null node', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)

      expect(() => visitor.ImportDeclaration(null)).not.toThrow()
    })

    test('should handle non-ImportDeclaration node', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)

      expect(() => visitor.ImportDeclaration({ type: 'Other' })).not.toThrow()
    })

    test('should handle ImportDeclaration without source', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)

      expect(() => visitor.ImportDeclaration({ type: 'ImportDeclaration' })).not.toThrow()
    })

    test('should handle named import', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = createNamedImportNode(2, './module')

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle default import', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = createDefaultImportNode('./module')

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle namespace import', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = createNamespaceImportNode('./module')

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle mixed import', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = createMixedImportNode('./module')

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle require call', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = createRequireNode('./module')

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should ignore non-require CallExpression', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle require without string literal argument', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })
  })

  describe('prefer: named (default)', () => {
    test('should report namespace import when prefer is named', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamespaceImportNode('./module')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should report mixed import when prefer is named', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createMixedImportNode('./module')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should not report named import when prefer is named', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamedImportNode(2, './module')

      visitor.ImportDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should report require when prefer is named', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createRequireNode('./module')

      visitor.CallExpression(node)

      expect(report).toHaveBeenCalled()
    })
  })

  describe('prefer: namespace', () => {
    test('should report many named imports when prefer is namespace', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 3 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamedImportNode(5, './module')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should not report few named imports when prefer is namespace', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 5 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamedImportNode(2, './module')

      visitor.ImportDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should use default namespaceThreshold of 5', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamedImportNode(4, './module')

      visitor.ImportDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('prefer: default', () => {
    test('should report namespace import when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamespaceImportNode('./module')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should report multiple named imports when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamedImportNode(3, './module')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should suggest default import for single named import when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamedImportNode(1, './module')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should not report default import when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createDefaultImportNode('./module')

      visitor.ImportDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should report require when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createRequireNode('./module')

      visitor.CallExpression(node)

      expect(report).toHaveBeenCalled()
    })
  })

  describe('exclude option', () => {
    test('should exclude matching sources', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['./external'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamespaceImportNode('./external/module')

      visitor.ImportDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should exclude using regex pattern', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['/\\.test\\./'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamespaceImportNode('./module.test.ts')

      visitor.ImportDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should exclude require calls', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['./external'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createRequireNode('./external/module')

      visitor.CallExpression(node)

      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    test('should handle empty specifiers', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)

      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle undefined specifiers', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)

      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle non-string source', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)

      const node = {
        type: 'ImportDeclaration',
        source: { value: 123 },
        specifiers: [],
      }

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle missing location', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)

      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'foo' } }],
      }

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle empty options', () => {
      const context = createMockContext({})
      const visitor = consistentImportsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should handle undefined options', () => {
      const context = {
        ...createMockContext(),
        config: { options: [] },
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should generate suggestion for namespace import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamedImportNode(3, './module')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          suggest: expect.any(Array),
        }),
      )
    })
  })

  describe('meta expanded', () => {
    test('should have fixable set to code', () => {
      expect(consistentImportsRule.meta.fixable).toBe('code')
    })

    test('should have schema as array', () => {
      expect(Array.isArray(consistentImportsRule.meta.schema)).toBe(true)
    })

    test('should have prefer in schema properties', () => {
      const schema = consistentImportsRule.meta.schema
      const props = (schema as Array<Record<string, unknown>>)[0]
      const properties = props?.properties as Record<string, unknown>
      expect(properties).toHaveProperty('prefer')
    })

    test('should have namespaceThreshold in schema properties', () => {
      const schema = consistentImportsRule.meta.schema
      const props = (schema as Array<Record<string, unknown>>)[0]
      const properties = props?.properties as Record<string, unknown>
      expect(properties).toHaveProperty('namespaceThreshold')
    })

    test('should have exclude in schema properties', () => {
      const schema = consistentImportsRule.meta.schema
      const props = (schema as Array<Record<string, unknown>>)[0]
      const properties = props?.properties as Record<string, unknown>
      expect(properties).toHaveProperty('exclude')
    })

    test('should have docs url defined', () => {
      expect(consistentImportsRule.meta.docs?.url).toBeDefined()
    })

    test('should have description mentioning import style', () => {
      expect(consistentImportsRule.meta.docs?.description).toContain('import')
    })

    test('should have schema with type object', () => {
      const schema = consistentImportsRule.meta.schema
      const first = (schema as Array<Record<string, unknown>>)[0]
      expect(first?.type).toBe('object')
    })

    test('should have schema with additionalProperties false', () => {
      const schema = consistentImportsRule.meta.schema
      const first = (schema as Array<Record<string, unknown>>)[0]
      expect(first?.additionalProperties).toBe(false)
    })

    test('should export rule as default export', () => {
      expect(consistentImportsRule).toBeDefined()
      expect(consistentImportsRule.meta).toBeDefined()
    })
  })

  describe('create function - visitor structure', () => {
    test('ImportDeclaration should be a function', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      expect(typeof visitor.ImportDeclaration).toBe('function')
    })

    test('CallExpression should be a function', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('visitor should only have ImportDeclaration and CallExpression', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toHaveLength(2)
      expect(keys).toContain('ImportDeclaration')
      expect(keys).toContain('CallExpression')
    })

    test('should create a new visitor each time', () => {
      const context = createMockContext()
      const visitor1 = consistentImportsRule.create(context)
      const visitor2 = consistentImportsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('prefer=named - namespace imports flagged', () => {
    test('should flag namespace import from relative path', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./utils'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should flag namespace import from node_modules', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('lodash'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should flag namespace import from scoped package', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('@angular/core'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should flag namespace import from deep path', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('lodash/fp'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should include source in namespace report message', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./my-module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('./my-module'),
        }),
      )
    })

    test('should include loc in namespace report', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.any(Object),
        }),
      )
    })

    test('should flag multiple namespace imports separately', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./a'))
      visitor.ImportDeclaration(createNamespaceImportNode('./b'))
      expect(report).toHaveBeenCalledTimes(2)
    })

    test('should flag namespace import from alias path', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('@/components'))
      expect(report).toHaveBeenCalledTimes(1)
    })
  })

  describe('prefer=named - mixed imports flagged', () => {
    test('should flag mixed default + named import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createMixedImportNode('./module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should flag mixed import with message about separating', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createMixedImportNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Separate'),
        }),
      )
    })

    test('should flag multiple mixed imports separately', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createMixedImportNode('./a'))
      visitor.ImportDeclaration(createMixedImportNode('./b'))
      expect(report).toHaveBeenCalledTimes(2)
    })

    test('should flag mixed import from external package', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)

      const node = {
        type: 'ImportDeclaration',
        source: { value: 'react' },
        specifiers: [
          { type: 'ImportDefaultSpecifier' },
          { type: 'ImportSpecifier', imported: { name: 'useState' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should include location in mixed import report', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createMixedImportNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.objectContaining({
            start: expect.any(Object),
            end: expect.any(Object),
          }),
        }),
      )
    })
  })

  describe('prefer=named - named imports NOT flagged', () => {
    test('should not flag single named import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(1, './module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag two named imports', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(2, './module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag many named imports', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(10, './module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag named import from node_modules', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, 'lodash'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag named import from scoped package', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(2, '@types/node'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag named import with long source path', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(4, './deeply/nested/path/to/module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag named import from parent directory', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(2, '../utils'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('prefer=named - default imports NOT flagged', () => {
    test('should not flag default import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createDefaultImportNode('./module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag default import from external package', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createDefaultImportNode('react'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag default import from scoped package', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createDefaultImportNode('@angular/core'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag default import from relative path', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createDefaultImportNode('../config'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag multiple default imports', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createDefaultImportNode('./a'))
      visitor.ImportDeclaration(createDefaultImportNode('./b'))
      visitor.ImportDeclaration(createDefaultImportNode('./c'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('prefer=default - namespace flagged', () => {
    test('should flag namespace import when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      expect(report).toHaveBeenCalled()
    })

    test('should report message mentioning default for namespace import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('default'),
        }),
      )
    })

    test('should flag namespace import from external module', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('lodash'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should flag namespace import with location info', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.any(Object),
        }),
      )
    })

    test('should flag multiple namespace imports with prefer default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./a'))
      visitor.ImportDeclaration(createNamespaceImportNode('./b'))
      expect(report).toHaveBeenCalledTimes(2)
    })
  })

  describe('prefer=default - multi-named flagged', () => {
    test('should flag two named imports when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(2, './module'))
      expect(report).toHaveBeenCalled()
    })

    test('should flag three named imports when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './module'))
      expect(report).toHaveBeenCalled()
    })

    test('should flag many named imports when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(10, './module'))
      expect(report).toHaveBeenCalled()
    })

    test('should include loc in multi-named report', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(5, './module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.any(Object),
        }),
      )
    })

    test('should report message containing "default" for multi-named', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './utils'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('default'),
        }),
      )
    })
  })

  describe('prefer=default - single named suggested', () => {
    test('should suggest default for single named import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(1, './module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('default'),
        }),
      )
    })

    test('should include source module name in suggestion', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(1, './my-util'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('./my-util'),
        }),
      )
    })

    test('should report location for single named import suggestion', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(1, './module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.any(Object),
        }),
      )
    })

    test('should flag single named from external package', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(1, 'lodash'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should flag single named from scoped package', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(1, '@babel/core'))
      expect(report).toHaveBeenCalledTimes(1)
    })
  })

  describe('prefer=namespace - many named flagged when >= threshold', () => {
    test('should flag when named count equals threshold', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 5 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(5, './module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should flag when named count exceeds threshold', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 3 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(10, './module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should flag exactly at threshold with message containing source', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 3 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './utils'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('./utils'),
        }),
      )
    })

    test('should flag with suggestion to use namespace import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          suggest: expect.arrayContaining([
            expect.objectContaining({
              desc: expect.stringContaining('namespace'),
            }),
          ]),
        }),
      )
    })

    test('should include fix in suggestion', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          suggest: expect.arrayContaining([
            expect.objectContaining({
              fix: expect.any(Object),
            }),
          ]),
        }),
      )
    })

    test('should flag from external module at threshold', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 3 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(4, 'lodash'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should not flag namespace import when prefer is namespace', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 3 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag default import when prefer is namespace', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 3 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createDefaultImportNode('./module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should flag multiple violations separately', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './a'))
      visitor.ImportDeclaration(createNamedImportNode(4, './b'))
      expect(report).toHaveBeenCalledTimes(2)
    })

    test('should flag with loc containing start and end', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.objectContaining({
            start: expect.objectContaining({
              line: expect.any(Number),
              column: expect.any(Number),
            }),
            end: expect.objectContaining({ line: expect.any(Number), column: expect.any(Number) }),
          }),
        }),
      )
    })
  })

  describe('prefer=namespace - few named NOT flagged', () => {
    test('should not flag 1 named import with threshold 5', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 5 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(1, './module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag 4 named imports with threshold 5', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 5 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(4, './module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag 2 named imports with threshold 3', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 3 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(2, './module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag 0 named imports', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 3 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag named import at threshold minus 1', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 10 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(9, './module'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('namespaceThreshold option variations', () => {
    test('should respect threshold of 1', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 1 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(1, './module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should respect threshold of 2', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(1, './module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should respect threshold of 2 and flag at 2', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(2, './module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should respect threshold of 10', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 10 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(8, './module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should respect threshold of 10 and flag at 10', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 10 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(10, './module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should use default threshold of 5 when not specified', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(5, './module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should use default threshold and not flag at 4', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(4, './module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not affect prefer=named regardless of threshold', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', namespaceThreshold: 1 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(10, './module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not affect prefer=default regardless of threshold', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default', namespaceThreshold: 1 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createDefaultImportNode('./module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should handle very high threshold without flagging', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 100 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(50, './module'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('exclude option - exact match', () => {
    test('should exclude exact source match', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['lodash'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('lodash'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not exclude non-matching exact source', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['lodash'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('underscore'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should exclude multiple exact patterns', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['lodash', 'underscore', 'ramda'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('underscore'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should handle empty exclude array', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: [] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      expect(report).toHaveBeenCalledTimes(1)
    })
  })

  describe('exclude option - substring match', () => {
    test('should exclude source containing substring', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['./external'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./external/deep/module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should exclude source starting with substring', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['@types/'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('@types/node'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should exclude source ending with substring', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['.test.'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module.test.ts'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('exclude option - regex patterns', () => {
    test('should exclude using regex for test files', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['/\\.spec\\./'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module.spec.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should exclude using regex for node_modules', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['/^node_modules/'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('node_modules/lodash'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should exclude using regex with wildcard', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['/\\.d\\.ts$/'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./types.d.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not exclude when regex does not match', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['/\\.spec\\./'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module.ts'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should exclude using complex regex pattern', () => {
      const report = vi.fn()
      const pattern = '/^(lodash|underscore)$/'
      const context = {
        ...createMockContext({ prefer: 'named', exclude: [pattern] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('lodash'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('require() detection', () => {
    test('should detect require() with prefer named', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should detect require() with prefer default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should report require message mentioning ES module for named', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('ES module'),
        }),
      )
    })

    test('should report require message mentioning ES module for default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('ES module'),
        }),
      )
    })

    test('should detect require() with Literal type argument', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNodeWithLiteral('./module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should include location in require report', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.any(Object),
        }),
      )
    })

    test('should not report require() from non-Identifier callee', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { name: 'obj' },
          property: { name: 'require' },
        },
        arguments: [{ type: 'Literal', value: './module' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report require() with empty arguments', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report require() with non-string argument value', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 123 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should detect multiple require() calls', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./a'))
      visitor.CallExpression(createRequireNode('./b'))
      visitor.CallExpression(createRequireNode('./c'))
      expect(report).toHaveBeenCalledTimes(3)
    })
  })

  describe('require() NOT flagged when prefer=namespace', () => {
    test('should not report require() when prefer is namespace', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report require() with namespace threshold', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 3 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report require() with Literal type when prefer namespace', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNodeWithLiteral('./module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report require() from external module when prefer namespace', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('lodash'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report require() excluded source when prefer namespace', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', exclude: ['./ext'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./ext'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('violation properties', () => {
    test('should include node in report', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createNamespaceImportNode('./module')
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          node,
        }),
      )
    })

    test('should include message string in report', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        }),
      )
    })

    test('should include location with start and end in report', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      const call = (report as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.loc.start).toBeDefined()
      expect(call.loc.end).toBeDefined()
      expect(call.loc.start.line).toBe(1)
      expect(call.loc.start.column).toBe(0)
    })

    test('should include suggestion array for namespace prefer violation', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          suggest: expect.any(Array),
        }),
      )
    })

    test('should have fix text in suggestion', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './module'))
      const call = (report as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const suggestion = call.suggest[0]
      expect(suggestion.fix.text).toContain('import * as')
    })

    test('should have desc in suggestion', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './module'))
      const call = (report as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const suggestion = call.suggest[0]
      expect(suggestion.desc).toBeDefined()
      expect(typeof suggestion.desc).toBe('string')
    })

    test('should include source in namespace prefer fix text', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './my-module'))
      const call = (report as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const suggestion = call.suggest[0]
      expect(suggestion.fix.text).toContain('./my-module')
    })

    test('should not include suggest for prefer named namespace violation', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      const call = (report as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.suggest).toBeUndefined()
    })

    test('should not include suggest for prefer named mixed violation', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createMixedImportNode('./module'))
      const call = (report as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.suggest).toBeUndefined()
    })

    test('should not include suggest for prefer default violations', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      const call = (report as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.suggest).toBeUndefined()
    })

    test('should include node in require report', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = createRequireNode('./module')
      visitor.CallExpression(node)
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          node,
        }),
      )
    })
  })

  describe('analyzeImport edge cases', () => {
    test('should handle node with null type', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      expect(() => visitor.ImportDeclaration({ type: null })).not.toThrow()
    })

    test('should handle node with empty source value', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: '' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'foo' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle node with boolean source value', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: true },
        specifiers: [],
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle node with null source', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: null,
        specifiers: [],
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle node with undefined source', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: undefined,
        specifiers: [],
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle specifiers with null entries', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [null, { type: 'ImportSpecifier', imported: { name: 'foo' } }, null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle specifiers with unknown type', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [{ type: 'UnknownSpecifier' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle primitive node', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      expect(() => visitor.ImportDeclaration('string')).not.toThrow()
    })

    test('should handle numeric node', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(42)).not.toThrow()
    })

    test('should handle node with missing loc.start.line', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'foo' } }],
        loc: { start: {}, end: {} },
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle node with string loc values', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'foo' } }],
        loc: { start: { line: '1', column: '0' }, end: { line: '1', column: '20' } },
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })
  })

  describe('CallExpression edge cases', () => {
    test('should handle missing properties in CallExpression node', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      expect(() => visitor.CallExpression({ type: 'CallExpression' })).not.toThrow()
    })

    test('should handle CallExpression without callee', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      expect(() => visitor.CallExpression({ type: 'CallExpression' })).not.toThrow()
    })

    test('should handle CallExpression without arguments', () => {
      const context = createMockContext()
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle CallExpression with missing loc', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './module' }],
      }
      visitor.CallExpression(node)
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.any(Object),
        }),
      )
    })

    test('should handle require() with undefined argument value', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: undefined }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should handle require() with null argument value', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('isExcluded edge cases via integration', () => {
    test('should not exclude when exclude is empty array', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: [] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should exclude first pattern match in array', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['lodash', 'react'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('lodash'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should exclude second pattern match in array', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['lodash', 'react'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('react'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should handle exclude with overlapping patterns', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['./utils', './utils/helpers'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./utils/helpers'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should exclude case-sensitive exact match only', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['Lodash'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('lodash'))
      expect(report).toHaveBeenCalledTimes(1)
    })
  })

  describe('multiple violations in sequence', () => {
    test('should flag namespace then mixed then require independently', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./a'))
      visitor.ImportDeclaration(createMixedImportNode('./b'))
      visitor.CallExpression(createRequireNode('./c'))
      expect(report).toHaveBeenCalledTimes(3)
    })

    test('should flag multiple require calls independently', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createRequireNode(`./module${i}`))
      }
      expect(report).toHaveBeenCalledTimes(5)
    })

    test('should only flag violations, not valid imports', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(2, './valid'))
      visitor.ImportDeclaration(createNamespaceImportNode('./invalid'))
      visitor.ImportDeclaration(createDefaultImportNode('./also-valid'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should flag violations across prefer=default modes', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./a'))
      visitor.ImportDeclaration(createNamedImportNode(3, './b'))
      visitor.ImportDeclaration(createNamedImportNode(1, './c'))
      visitor.ImportDeclaration(createDefaultImportNode('./d'))
      expect(report).toHaveBeenCalledTimes(3)
    })

    test('should handle mixed valid and excluded imports', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named', exclude: ['./skip'] }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./skip/module'))
      visitor.ImportDeclaration(createNamespaceImportNode('./flag-this'))
      expect(report).toHaveBeenCalledTimes(1)
    })
  })

  describe('mixed import with multiple named specifiers', () => {
    test('should flag mixed import with 2 named specifiers when prefer named', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [
          { type: 'ImportDefaultSpecifier' },
          { type: 'ImportSpecifier', imported: { name: 'a' } },
          { type: 'ImportSpecifier', imported: { name: 'b' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should not flag mixed import with 0 named specifiers when prefer named', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [{ type: 'ImportDefaultSpecifier' }, { type: 'ImportNamespaceSpecifier' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('location handling in violations', () => {
    test('should use custom line numbers from node', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [{ type: 'ImportNamespaceSpecifier' }],
        loc: { start: { line: 42, column: 10 }, end: { line: 42, column: 50 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.objectContaining({
            start: expect.objectContaining({ line: 42, column: 10 }),
          }),
        }),
      )
    })

    test('should default to line 1 column 0 when loc is missing', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [{ type: 'ImportNamespaceSpecifier' }],
      }
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.objectContaining({
            start: expect.objectContaining({ line: 1, column: 0 }),
          }),
        }),
      )
    })

    test('should handle require node with custom location', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './module' }],
        loc: { start: { line: 10, column: 5 }, end: { line: 10, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.objectContaining({
            start: expect.objectContaining({ line: 10, column: 5 }),
          }),
        }),
      )
    })
  })

  describe('default prefer behavior (no options specified)', () => {
    test('should default to named prefer when no prefer option', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({}),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should not flag named import with no options', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({}),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamedImportNode(3, './module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should flag require() with no options', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({}),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./module'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should not flag default import with no options', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({}),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createDefaultImportNode('./module'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('require message content', () => {
    test('should mention "named" when prefer is named', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('named'),
        }),
      )
    })

    test('should mention "default" when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('default'),
        }),
      )
    })

    test('should mention "require()" in message', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'named' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./module'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('require()'),
        }),
      )
    })
  })

  describe('prefer=default - mixed import handling', () => {
    test('should not flag mixed import when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createMixedImportNode('./module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag mixed with many named when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './module' },
        specifiers: [
          { type: 'ImportDefaultSpecifier' },
          { type: 'ImportSpecifier', imported: { name: 'a' } },
          { type: 'ImportSpecifier', imported: { name: 'b' } },
          { type: 'ImportSpecifier', imported: { name: 'c' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('prefer=namespace - mixed import handling', () => {
    test('should not flag mixed import when prefer is namespace', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 2 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createMixedImportNode('./module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag namespace import itself when prefer is namespace', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag default import when prefer is namespace with threshold', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'namespace', namespaceThreshold: 1 }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createDefaultImportNode('./module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag namespace import when prefer is default', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./utils'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should flag namespace import when prefer is default with message', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ prefer: 'default' }),
        report,
      } as unknown as RuleContext
      const visitor = consistentImportsRule.create(context)
      visitor.ImportDeclaration(createNamespaceImportNode('./utils'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('default'),
        }),
      )
    })
  })
})
