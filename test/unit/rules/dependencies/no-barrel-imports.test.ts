import { describe, test, expect, vi } from 'vitest'
import { noBarrelImportsRule } from '../../../../src/rules/dependencies/no-barrel-imports.js'
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

function createImportNode(source: string, specifiers?: string[]): unknown {
  const specs = (specifiers ?? ['foo']).map((name) => {
    if (name === 'default') {
      return { type: 'ImportDefaultSpecifier' }
    }
    if (name === '*') {
      return { type: 'ImportNamespaceSpecifier' }
    }
    return { type: 'ImportSpecifier', imported: { name } }
  })

  return {
    type: 'ImportDeclaration',
    source: { value: source },
    specifiers: specs,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createExportNamedNode(source: string): unknown {
  return {
    type: 'ExportNamedDeclaration',
    source: { value: source },
    specifiers: [],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createExportAllNode(source: string): unknown {
  return {
    type: 'ExportAllDeclaration',
    source: { value: source },
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createRequireNode(source: string): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'require' },
    arguments: [{ type: 'StringLiteral', value: source }],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
  }
}

describe('no-barrel-imports rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noBarrelImportsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noBarrelImportsRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noBarrelImportsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(noBarrelImportsRule.meta.docs?.category).toBe('dependencies')
    })

    test('should have schema defined', () => {
      expect(noBarrelImportsRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(noBarrelImportsRule.meta.docs?.description).toContain('barrel file')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)

      expect(visitor).toHaveProperty('ImportDeclaration')
      expect(visitor).toHaveProperty('ExportNamedDeclaration')
      expect(visitor).toHaveProperty('ExportAllDeclaration')
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should handle null node', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)

      expect(() => visitor.ImportDeclaration(null)).not.toThrow()
    })

    test('should handle non-object node', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)

      expect(() => visitor.ImportDeclaration('string')).not.toThrow()
    })
  })

  describe('barrel detection', () => {
    test('should detect /index.ts barrel import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./utils/index.ts')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should detect /index.js barrel import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./utils/index.js')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should detect /index.tsx barrel import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./components/index.tsx')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should detect /index.jsx barrel import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./components/index.jsx')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should detect /index.mjs barrel import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./module/index.mjs')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should detect /index.cjs barrel import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./module/index.cjs')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should not detect non-barrel import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./utils/helper.ts')

      visitor.ImportDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should detect barrel in Windows-style paths (normalized to forward slashes)', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('.\\utils\\index.ts')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })
  })

  describe('export barrel detection', () => {
    test('should detect export from barrel file', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createExportNamedNode('./utils/index.ts')

      visitor.ExportNamedDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should detect export all from barrel file', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createExportAllNode('./utils/index.ts')

      visitor.ExportAllDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should not detect export from non-barrel', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createExportNamedNode('./utils/helper.ts')

      visitor.ExportNamedDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('require detection', () => {
    test('should detect require from barrel file', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createRequireNode('./utils/index.ts')

      visitor.CallExpression(node)

      expect(report).toHaveBeenCalled()
    })

    test('should not detect require from non-barrel', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createRequireNode('./utils/helper.ts')

      visitor.CallExpression(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should ignore non-require CallExpression', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('options', () => {
    test('should respect custom barrelPatterns', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['/main.ts'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)

      const customNode = createImportNode('./utils/main.ts')
      visitor.ImportDeclaration(customNode)
      expect(report).toHaveBeenCalledTimes(1)

      report.mockClear()
      const defaultNode = createImportNode('./utils/index.ts')
      visitor.ImportDeclaration(defaultNode)
      expect(report).not.toHaveBeenCalled()
    })

    test('should respect exclude option', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./external'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./external/index.ts')

      visitor.ImportDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should respect exclude with regex', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['/test-module/'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./test-module/index.ts')

      visitor.ImportDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should respect allowTypeOnly option', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ allowTypeOnly: true }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)

      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        importKind: 'type',
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'Type' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ImportDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should allow type-only export', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ allowTypeOnly: true }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)

      const node = {
        type: 'ExportAllDeclaration',
        source: { value: './utils/index.ts' },
        exportKind: 'type',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ExportAllDeclaration(node)

      expect(report).not.toHaveBeenCalled()
    })

    test('should handle empty options', () => {
      const context = createMockContext({})
      const visitor = noBarrelImportsRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should handle undefined options', () => {
      const context = {
        ...createMockContext(),
        config: { options: [] },
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      expect(visitor).toBeDefined()
    })
  })

  describe('suggestions', () => {
    test('should provide suggestion for barrel import', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./utils/index.ts', ['foo', 'bar'])

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          suggest: expect.any(Array),
        }),
      )
    })

    test('should handle empty specifiers in suggestion', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./utils/index.ts', [])

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          suggest: expect.any(Array),
        }),
      )
    })
  })

  describe('edge cases', () => {
    test('should handle ImportDeclaration without source', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)

      expect(() => visitor.ImportDeclaration({ type: 'ImportDeclaration' })).not.toThrow()
    })

    test('should handle ExportNamedDeclaration with specifiers', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)

      const node = {
        type: 'ExportNamedDeclaration',
        source: { value: './utils/index.ts' },
        specifiers: [{ type: 'ExportSpecifier' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ExportNamedDeclaration(node)).not.toThrow()
    })

    test('should handle ExportAllDeclaration without source', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)

      expect(() => visitor.ExportAllDeclaration({ type: 'ExportAllDeclaration' })).not.toThrow()
    })

    test('should handle wildcard barrel pattern', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['*/index.ts'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./utils/index.ts')

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should handle default import specifiers', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./utils/index.ts', ['default'])

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should handle namespace import specifiers', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext(),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./utils/index.ts', ['*'])

      visitor.ImportDeclaration(node)

      expect(report).toHaveBeenCalled()
    })

    test('should handle missing location in node', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)

      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'foo' } }],
      }

      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle require without string literal', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })
  })

  describe('meta expanded', () => {
    test('should have fixable set to code', () => {
      expect(noBarrelImportsRule.meta.fixable).toBe('code')
    })

    test('should have docs URL', () => {
      expect(noBarrelImportsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-barrel-imports',
      )
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noBarrelImportsRule.meta.schema)).toBe(true)
    })

    test('should have schema with single element', () => {
      expect(noBarrelImportsRule.meta.schema).toHaveLength(1)
    })

    test('should have barrelPatterns in schema properties', () => {
      const schema = noBarrelImportsRule.meta.schema[0] as Record<string, unknown>
      const props = schema.properties as Record<string, unknown>
      expect(props).toHaveProperty('barrelPatterns')
    })

    test('should have exclude in schema properties', () => {
      const schema = noBarrelImportsRule.meta.schema[0] as Record<string, unknown>
      const props = schema.properties as Record<string, unknown>
      expect(props).toHaveProperty('exclude')
    })

    test('should have allowTypeOnly in schema properties', () => {
      const schema = noBarrelImportsRule.meta.schema[0] as Record<string, unknown>
      const props = schema.properties as Record<string, unknown>
      expect(props).toHaveProperty('allowTypeOnly')
    })

    test('should have additionalProperties set to false in schema', () => {
      const schema = noBarrelImportsRule.meta.schema[0] as Record<string, unknown>
      expect(schema.additionalProperties).toBe(false)
    })
  })

  describe('create function expanded', () => {
    test('should return visitor object from create', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('ImportDeclaration should be a function', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      expect(typeof visitor.ImportDeclaration).toBe('function')
    })

    test('ExportNamedDeclaration should be a function', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      expect(typeof visitor.ExportNamedDeclaration).toBe('function')
    })

    test('ExportAllDeclaration should be a function', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      expect(typeof visitor.ExportAllDeclaration).toBe('function')
    })

    test('CallExpression should be a function', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should create new visitor per call', () => {
      const context = createMockContext()
      const visitor1 = noBarrelImportsRule.create(context)
      const visitor2 = noBarrelImportsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('default barrel patterns - all extensions', () => {
    test('should detect ./utils/index.ts', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect ./utils/index.js', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.js'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect ./components/index.tsx', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./components/index.tsx'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect ./components/index.jsx', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./components/index.jsx'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect ./module/index.mjs', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./module/index.mjs'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect ./module/index.cjs', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./module/index.cjs'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect ../utils/index.ts (parent directory)', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('../utils/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect ../../deep/nested/index.ts (deep relative)', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('../../deep/nested/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect @scope/package/index.ts (scoped package)', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('@scope/package/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should not detect plain index.ts without leading slash', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not detect file named _index.ts', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/_index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not detect path containing index.ts as directory name', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./index.ts/utils/helper.ts'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('custom barrelPatterns', () => {
    test('should detect custom pattern /main.ts', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['/main.ts'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/main.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect custom pattern /mod.ts', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['/mod.ts'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./features/mod.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect multiple custom patterns', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['/main.ts', '/mod.ts'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/main.ts'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should detect second pattern in multiple custom patterns', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['/main.ts', '/mod.ts'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./features/mod.ts'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should replace default patterns with custom patterns', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['/main.ts'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      // Default pattern should not match
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should support wildcard pattern *.ts', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['*.ts'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/anything.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should support wildcard pattern */index.*', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['*/index.*'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should not match with empty barrelPatterns array', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: [] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should support custom pattern /entry.js', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['/entry.js'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./app/entry.js'))
      expect(report).toHaveBeenCalled()
    })

    test('should not match custom pattern partially', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['/main.ts'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/main.ts.bak'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('exclude option expanded', () => {
    test('should exclude by exact string match', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./utils/index.ts'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should exclude by substring match', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./external'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./external/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should exclude by regex pattern', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['/vendor/'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./vendor/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not exclude non-matching source with regex', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['/vendor/'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should support multiple exclude patterns', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./external', './vendor'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./vendor/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should match first exclude pattern in array', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./external', './vendor'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./external/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not exclude when no patterns match', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./external', './vendor'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./internal/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should exclude using regex with dot matching', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['/third.party/'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./third.party/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should work with empty exclude array', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: [] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should apply exclude to ExportNamedDeclaration', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./utils'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode('./utils/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should apply exclude to ExportAllDeclaration', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./utils'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration(createExportAllNode('./utils/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should apply exclude to require() calls', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./utils'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./utils/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('allowTypeOnly expanded', () => {
    test('should not report type-only import when allowTypeOnly is true', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ allowTypeOnly: true }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        importKind: 'type',
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'MyType' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should report type-only import when allowTypeOnly is false', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ allowTypeOnly: false }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        importKind: 'type',
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'MyType' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalled()
    })

    test('should report regular import when allowTypeOnly is true', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ allowTypeOnly: true }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should report regular import when allowTypeOnly is false', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ allowTypeOnly: false }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should not report type-only export all when allowTypeOnly is true', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ allowTypeOnly: true }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ExportAllDeclaration',
        source: { value: './utils/index.ts' },
        exportKind: 'type',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExportAllDeclaration(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should report type-only export all when allowTypeOnly is false', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ allowTypeOnly: false }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ExportAllDeclaration',
        source: { value: './utils/index.ts' },
        exportKind: 'type',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExportAllDeclaration(node)
      expect(report).toHaveBeenCalled()
    })

    test('should not report type-only ExportNamedDeclaration when allowTypeOnly is true', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ allowTypeOnly: true }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ExportNamedDeclaration',
        source: { value: './types/index.ts' },
        exportKind: 'type',
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExportNamedDeclaration(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should report type-only ExportNamedDeclaration when allowTypeOnly is false', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ allowTypeOnly: false }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ExportNamedDeclaration',
        source: { value: './types/index.ts' },
        exportKind: 'type',
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExportNamedDeclaration(node)
      expect(report).toHaveBeenCalled()
    })

    test('should default allowTypeOnly to false', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        importKind: 'type',
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'MyType' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalled()
    })

    test('should report importKind value even when allowTypeOnly is true', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ allowTypeOnly: true }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        importKind: 'value',
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'foo' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalled()
    })
  })

  describe('ExportNamedDeclaration expanded', () => {
    test('should report export from barrel index.ts', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode('./lib/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should report export from barrel index.js', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode('./lib/index.js'))
      expect(report).toHaveBeenCalled()
    })

    test('should not report export from non-barrel module', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode('./lib/helper.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report export without source', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration({ type: 'ExportNamedDeclaration' })
      expect(report).not.toHaveBeenCalled()
    })

    test('should report export from barrel with tsx extension', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode('./components/index.tsx'))
      expect(report).toHaveBeenCalled()
    })

    test('should report export from barrel with mjs extension', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode('./esm/index.mjs'))
      expect(report).toHaveBeenCalled()
    })

    test('should report export from barrel with cjs extension', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode('./cjs/index.cjs'))
      expect(report).toHaveBeenCalled()
    })

    test('should handle ExportNamedDeclaration with null node', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(null)).not.toThrow()
    })

    test('should not report export from non-barrel deep path', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode('../../lib/feature.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should report export from deep barrel path', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode('../../lib/index.ts'))
      expect(report).toHaveBeenCalled()
    })
  })

  describe('ExportAllDeclaration expanded', () => {
    test('should report export all from barrel index.ts', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration(createExportAllNode('./lib/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should report export all from barrel index.js', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration(createExportAllNode('./lib/index.js'))
      expect(report).toHaveBeenCalled()
    })

    test('should report export all from barrel index.tsx', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration(createExportAllNode('./ui/index.tsx'))
      expect(report).toHaveBeenCalled()
    })

    test('should not report export all from non-barrel', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration(createExportAllNode('./lib/helpers.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report export all without source', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration({ type: 'ExportAllDeclaration' })
      expect(report).not.toHaveBeenCalled()
    })

    test('should handle ExportAllDeclaration with null node', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      expect(() => visitor.ExportAllDeclaration(null)).not.toThrow()
    })

    test('should report export all from barrel with mjs extension', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration(createExportAllNode('./esm/index.mjs'))
      expect(report).toHaveBeenCalled()
    })

    test('should report export all from barrel with cjs extension', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration(createExportAllNode('./cjs/index.cjs'))
      expect(report).toHaveBeenCalled()
    })

    test('should report export all from barrel with jsx extension', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration(createExportAllNode('./ui/index.jsx'))
      expect(report).toHaveBeenCalled()
    })

    test('should report export all from deep barrel path', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration(createExportAllNode('../../../packages/lib/index.ts'))
      expect(report).toHaveBeenCalled()
    })
  })

  describe('require() detection expanded', () => {
    test('should detect require with StringLiteral from barrel', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./utils/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect require with Literal type from barrel', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: './utils/index.ts' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(report).toHaveBeenCalled()
    })

    test('should not report require from non-barrel path', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./utils/helper.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report require with non-string argument', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Identifier', name: 'moduleName' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report require with numeric argument', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report CallExpression with member expression callee', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'mod' } },
        arguments: [{ type: 'StringLiteral', value: './utils/index.ts' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should not report CallExpression with empty arguments', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should detect require from barrel with all extensions', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)

      const extensions = ['ts', 'js', 'tsx', 'jsx', 'mjs', 'cjs']
      for (const ext of extensions) {
        visitor.CallExpression(createRequireNode(`./utils/index.${ext}`))
      }
      expect(report).toHaveBeenCalledTimes(6)
    })

    test('should apply exclude to require calls', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./vendor'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./vendor/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should handle require with null arguments', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle CallExpression with undefined callee', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle CallExpression with no arguments property', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
    })
  })

  describe('NOT flagged: non-barrel imports', () => {
    test('should not flag direct module import', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/helper.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag package import without path', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('lodash'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag scoped package import', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('@angular/core'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag relative import without extension', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag import from deeply nested non-barrel file', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./a/b/c/d/service.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag import from file named indexx.ts', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/indexx.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag import from file containing index in name', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/reindex.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag import with index.ts as directory segment', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./index.ts/actual-module.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag CSS import', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./styles/index.css'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag JSON import', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./data/package.json'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag Node.js built-in import', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('fs'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag path import', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('path'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag URL import', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('https://example.com/module'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag data URI import', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('data:text/javascript,export{}'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not flag empty string import', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode(''))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('violation report properties', () => {
    test('should include message in import report', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Import from barrel file './utils/index.ts'"),
        }),
      )
    })

    test('should include node in import report', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./utils/index.ts')
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          node,
        }),
      )
    })

    test('should include loc in import report', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.any(Object),
        }),
      )
    })

    test('should include suggest array in import report', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          suggest: expect.arrayContaining([
            expect.objectContaining({
              desc: 'Import directly from source module',
            }),
          ]),
        }),
      )
    })

    test('should include fix in suggestion', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts', ['foo']))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          suggest: expect.arrayContaining([
            expect.objectContaining({
              fix: expect.objectContaining({
                text: expect.stringContaining('./utils/<module>'),
              }),
            }),
          ]),
        }),
      )
    })

    test('should include re-export message for ExportNamedDeclaration', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode('./utils/index.ts'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Re-export from barrel file'),
        }),
      )
    })

    test('should include re-export all message for ExportAllDeclaration', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration(createExportAllNode('./utils/index.ts'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Re-export all from barrel file'),
        }),
      )
    })

    test('should include require message for require() calls', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./utils/index.ts'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("require() from barrel file './utils/index.ts'"),
        }),
      )
    })

    test('should include loc in require report', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./utils/index.ts'))
      expect(report).toHaveBeenCalledWith(
        expect.objectContaining({
          loc: expect.any(Object),
        }),
      )
    })

    test('should suggest module import with specifiers', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts', ['foo', 'bar']))
      const call = report.mock.calls[0][0] as Record<string, unknown>
      const suggestions = call.suggest as Array<Record<string, unknown>>
      const fix = suggestions[0].fix as Record<string, unknown>
      expect(fix.text).toBe("import { foo, bar } from './utils/<module>';")
    })
  })

  describe('isBarrelImport edge cases via visitors', () => {
    test('should normalize backslashes in import path', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('.\\utils\\index.ts')
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalled()
    })

    test('should normalize mixed slashes in import path', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('./a\\b/index.ts')
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalled()
    })

    test('should detect barrel with query string-like suffix in source', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts?raw'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should detect barrel import at root level', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect barrel import with absolute-like path', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('/src/lib/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should detect barrel with uppercase path segments', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./Utils/Index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should detect barrel with lowercase index.ts', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should not match barrel pattern mid-filename', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/myindex.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should detect via wildcard custom pattern matching any file', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['./src/*'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./src/anything.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should not match wildcard pattern incorrectly', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['./src/*'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./other/anything.ts'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('isExcluded edge cases via visitors', () => {
    test('should match first of multiple exclude patterns', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./a', './b', './c'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./a/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should match middle of multiple exclude patterns', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./a', './b', './c'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./b/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should match last of multiple exclude patterns', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./a', './b', './c'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./c/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should exclude by substring match within path', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['generated'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./path/to/generated/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should use regex exclude with complex pattern', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['/^\\.\\/vendor\\//'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./vendor/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not exclude non-matching regex', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['/^\\.\\/vendor\\//'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./src/vendor/index.ts'))
      expect(report).toHaveBeenCalled()
    })

    test('should exclude with regex matching partial path', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['/node_modules/'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./node_modules/pkg/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })

    test('should not exclude when pattern only partially matches string', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./util'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('extractImportDetails edge cases via visitors', () => {
    test('should handle node with null source value', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: null },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle node with numeric source value', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: 42 },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle node with undefined source', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: undefined,
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle ImportDeclaration with no specifiers', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        specifiers: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalled()
    })

    test('should handle ImportDeclaration with null specifier in array', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        specifiers: [null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle ImportDeclaration with mixed specifier types', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts', ['default', 'foo', '*']))
      expect(report).toHaveBeenCalled()
      const call = report.mock.calls[0][0] as Record<string, unknown>
      const suggestions = call.suggest as Array<Record<string, unknown>>
      const fix = suggestions[0].fix as Record<string, unknown>
      expect(fix.text).toBe("import { default, foo, * } from './utils/<module>';")
    })

    test('should handle ExportNamedDeclaration with source as empty string', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode(''))
      expect(report).not.toHaveBeenCalled()
    })

    test('should handle ExportAllDeclaration with source as empty string', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportAllDeclaration(createExportAllNode(''))
      expect(report).not.toHaveBeenCalled()
    })

    test('should handle ImportDeclaration with empty specifiers array', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts', []))
      expect(report).toHaveBeenCalled()
    })

    test('should handle ImportSpecifier without imported name', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        specifiers: [{ type: 'ImportSpecifier' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalled()
    })
  })

  describe('multiple violations', () => {
    test('should report multiple import violations', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      visitor.ImportDeclaration(createImportNode('./lib/index.js'))
      expect(report).toHaveBeenCalledTimes(2)
    })

    test('should report mix of import and export violations', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      visitor.ExportAllDeclaration(createExportAllNode('./lib/index.ts'))
      expect(report).toHaveBeenCalledTimes(2)
    })

    test('should report mix of import and require violations', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      visitor.CallExpression(createRequireNode('./lib/index.js'))
      expect(report).toHaveBeenCalledTimes(2)
    })

    test('should report export named and export all violations', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedNode('./a/index.ts'))
      visitor.ExportAllDeclaration(createExportAllNode('./b/index.ts'))
      expect(report).toHaveBeenCalledTimes(2)
    })

    test('should report all four violation types together', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./a/index.ts'))
      visitor.ExportNamedDeclaration(createExportNamedNode('./b/index.ts'))
      visitor.ExportAllDeclaration(createExportAllNode('./c/index.ts'))
      visitor.CallExpression(createRequireNode('./d/index.ts'))
      expect(report).toHaveBeenCalledTimes(4)
    })

    test('should report violations interleaved with non-violations', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      visitor.ImportDeclaration(createImportNode('./utils/helper.ts'))
      visitor.ImportDeclaration(createImportNode('./lib/index.js'))
      expect(report).toHaveBeenCalledTimes(2)
    })
  })

  describe('suggestion generation', () => {
    test('should suggest import with single specifier', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts', ['foo']))
      const call = report.mock.calls[0][0] as Record<string, unknown>
      const suggestions = call.suggest as Array<Record<string, unknown>>
      const fix = suggestions[0].fix as Record<string, unknown>
      expect(fix.text).toBe("import { foo } from './utils/<module>';")
    })

    test('should suggest import with multiple specifiers', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts', ['a', 'b', 'c']))
      const call = report.mock.calls[0][0] as Record<string, unknown>
      const suggestions = call.suggest as Array<Record<string, unknown>>
      const fix = suggestions[0].fix as Record<string, unknown>
      expect(fix.text).toBe("import { a, b, c } from './utils/<module>';")
    })

    test('should suggest import with default specifier', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts', ['default']))
      const call = report.mock.calls[0][0] as Record<string, unknown>
      const suggestions = call.suggest as Array<Record<string, unknown>>
      const fix = suggestions[0].fix as Record<string, unknown>
      expect(fix.text).toBe("import { default } from './utils/<module>';")
    })

    test('should suggest import with namespace specifier', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts', ['*']))
      const call = report.mock.calls[0][0] as Record<string, unknown>
      const suggestions = call.suggest as Array<Record<string, unknown>>
      const fix = suggestions[0].fix as Record<string, unknown>
      expect(fix.text).toBe("import { * } from './utils/<module>';")
    })

    test('should suggest import with empty specifiers', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./utils/index.ts', []))
      const call = report.mock.calls[0][0] as Record<string, unknown>
      const suggestions = call.suggest as Array<Record<string, unknown>>
      const fix = suggestions[0].fix as Record<string, unknown>
      expect(fix.text).toBe("import from './utils/<module>';")
    })

    test('should extract directory from deep barrel path', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.ImportDeclaration(createImportNode('./a/b/c/index.ts', ['foo']))
      const call = report.mock.calls[0][0] as Record<string, unknown>
      const suggestions = call.suggest as Array<Record<string, unknown>>
      const fix = suggestions[0].fix as Record<string, unknown>
      expect(fix.text).toBe("import { foo } from './a/b/c/<module>';")
    })
  })

  describe('edge cases expanded', () => {
    test('should handle boolean node', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(42)).not.toThrow()
    })

    test('should handle array node', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      expect(() => visitor.ImportDeclaration([])).not.toThrow()
    })

    test('should handle CallExpression with no type on callee', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { name: 'require' },
        arguments: [{ type: 'StringLiteral', value: './utils/index.ts' }],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node with extra properties', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'foo' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        extra: 'property',
        range: [0, 30],
      }
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalled()
    })

    test('should handle ExportNamedDeclaration with non-empty specifiers', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ExportNamedDeclaration',
        source: { value: './utils/index.ts' },
        specifiers: [{ type: 'ExportSpecifier', exported: { name: 'foo' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.ExportNamedDeclaration(node)).not.toThrow()
    })

    test('should handle CallExpression with null callee', () => {
      const context = createMockContext()
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'StringLiteral', value: './utils/index.ts' }],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle CallExpression with function expression callee', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'FunctionExpression' },
        arguments: [{ type: 'StringLiteral', value: './utils/index.ts' }],
      }
      visitor.CallExpression(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should handle config with null options', () => {
      const context = {
        ...createMockContext(),
        config: { options: [null] },
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor.ImportDeclaration).toBe('function')
    })

    test('should handle config with undefined first option', () => {
      const context = {
        ...createMockContext(),
        config: { options: [undefined] },
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor.ImportDeclaration).toBe('function')
    })

    test('should handle ImportDeclaration with empty source object', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: {},
        specifiers: [],
      }
      visitor.ImportDeclaration(node)
      expect(report).not.toHaveBeenCalled()
    })

    test('should detect barrel import with Windows-style backslashes', () => {
      const report = vi.fn()
      const context = { ...createMockContext(), report } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      const node = createImportNode('..\\shared\\index.ts')
      visitor.ImportDeclaration(node)
      expect(report).toHaveBeenCalled()
    })
  })

  describe('combined options', () => {
    test('should apply both exclude and allowTypeOnly', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ exclude: ['./vendor'], allowTypeOnly: true }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)

      visitor.ImportDeclaration(createImportNode('./vendor/index.ts'))
      expect(report).not.toHaveBeenCalled()

      const typeNode = {
        type: 'ImportDeclaration',
        source: { value: './utils/index.ts' },
        importKind: 'type',
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'T' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(typeNode)
      expect(report).not.toHaveBeenCalled()

      visitor.ImportDeclaration(createImportNode('./utils/index.ts'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should apply custom barrelPatterns with exclude', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['/main.ts'], exclude: ['./app'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)

      visitor.ImportDeclaration(createImportNode('./app/main.ts'))
      expect(report).not.toHaveBeenCalled()

      visitor.ImportDeclaration(createImportNode('./lib/main.ts'))
      expect(report).toHaveBeenCalledTimes(1)
    })

    test('should apply all three options together', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({
          barrelPatterns: ['/main.ts', '/mod.ts'],
          exclude: ['./generated'],
          allowTypeOnly: true,
        }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)

      visitor.ImportDeclaration(createImportNode('./lib/main.ts'))
      expect(report).toHaveBeenCalledTimes(1)

      visitor.ImportDeclaration(createImportNode('./generated/main.ts'))
      expect(report).toHaveBeenCalledTimes(1)

      const typeNode = {
        type: 'ImportDeclaration',
        source: { value: './lib/mod.ts' },
        importKind: 'type',
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'T' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ImportDeclaration(typeNode)
      expect(report).toHaveBeenCalledTimes(1)

      visitor.ImportDeclaration(createImportNode('./lib/mod.ts'))
      expect(report).toHaveBeenCalledTimes(2)
    })

    test('should handle require with custom barrelPatterns', () => {
      const report = vi.fn()
      const context = {
        ...createMockContext({ barrelPatterns: ['/entry.ts'] }),
        report,
      } as unknown as RuleContext
      const visitor = noBarrelImportsRule.create(context)
      visitor.CallExpression(createRequireNode('./app/entry.ts'))
      expect(report).toHaveBeenCalled()
    })
  })
})
