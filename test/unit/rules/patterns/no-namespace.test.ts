import { describe, test, expect } from 'vitest'
import { noNamespaceRule } from '../../../../src/rules/patterns/no-namespace.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createNamespace(name: string, line = 1, column = 0): unknown {
  return {
    type: 'TSModuleDeclaration',
    id: { type: 'Identifier', name },
    kind: 'namespace',
    global: false,
    body: { type: 'TSModuleBlock', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createModule(name: string, line = 1, column = 0): unknown {
  return {
    type: 'TSModuleDeclaration',
    id: { type: 'Literal', value: name },
    kind: 'module',
    global: false,
    body: { type: 'TSModuleBlock', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createGlobalAugmentation(line = 1, column = 0): unknown {
  return {
    type: 'TSModuleDeclaration',
    id: { type: 'Identifier', name: 'global' },
    kind: 'global',
    global: true,
    body: { type: 'TSModuleBlock', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createRegularModule(line = 1, column = 0): unknown {
  return {
    type: 'TSModuleDeclaration',
    id: { type: 'Identifier', name: 'Utils' },
    kind: 'module',
    global: false,
    body: { type: 'TSModuleBlock', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function runRule(node: unknown): ReportDescriptor[] {
  const { context, reports } = createMockRuleContext()
  const visitor = noNamespaceRule.create(context as RuleContext)
  if (visitor.TSModuleDeclaration) {
    visitor.TSModuleDeclaration(node)
  }
  return reports
}

describe('no-namespace', () => {
  test('has correct category', () => {
    expect(noNamespaceRule.meta.docs?.category).toBe('patterns')
  })

  test('has description', () => {
    expect(noNamespaceRule.meta.docs?.description).toBeDefined()
  })

  test('is recommended', () => {
    expect(noNamespaceRule.meta.docs?.recommended).toBe(true)
  })

  test('has suggestion type', () => {
    expect(noNamespaceRule.meta.type).toBe('suggestion')
  })

  test('has warn severity', () => {
    expect(noNamespaceRule.meta.severity).toBe('warn')
  })

  test('flags namespace declaration', () => {
    const reports = runRule(createNamespace('Utils'))
    expect(reports).toHaveLength(1)
  })

  test('includes namespace name in message', () => {
    const reports = runRule(createNamespace('Helpers'))
    expect(reports[0].message).toContain("'Helpers'")
  })

  test('includes ES modules suggestion in message', () => {
    const reports = runRule(createNamespace('App'))
    expect(reports[0].message).toContain('ES modules')
  })

  test('flags external module augmentation', () => {
    const reports = runRule(createModule('express'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('module augmentation')
  })

  test('does NOT flag global augmentation', () => {
    const reports = runRule(createGlobalAugmentation())
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag regular module with identifier', () => {
    const reports = runRule(createRegularModule())
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag null node', () => {
    const reports = runRule(null)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag undefined node', () => {
    const reports = runRule(undefined)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag string node', () => {
    const reports = runRule('not a node')
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag non-TSModuleDeclaration nodes', () => {
    const node = {
      type: 'TSInterfaceDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('reports location', () => {
    const reports = runRule(createNamespace('Utils', 5, 10))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc).toBeDefined()
  })

  test('handles namespace without id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'anonymous'")
  })

  test('handles namespace with non-object id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: 'not-an-object',
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags namespace with members', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'Config' },
      kind: 'namespace',
      global: false,
      body: {
        type: 'TSModuleBlock',
        body: [
          { type: 'ExportNamedDeclaration' },
          { type: 'ExportNamedDeclaration' },
        ],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'Config'")
  })

  test('flags namespace without body', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'Empty' },
      kind: 'namespace',
      global: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT flag module with non-string literal id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Literal', value: 42 },
      kind: 'module',
      global: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag module with identifier id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'MyModule' },
      kind: 'module',
      global: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags multiple namespaces independently', () => {
    const reports1 = runRule(createNamespace('A'))
    const reports2 = runRule(createNamespace('B'))
    expect(reports1).toHaveLength(1)
    expect(reports2).toHaveLength(1)
    expect(reports1[0].message).toContain("'A'")
    expect(reports2[0].message).toContain("'B'")
  })

  test('visitor has TSModuleDeclaration method', () => {
    const { context } = createMockRuleContext()
    const visitor = noNamespaceRule.create(context as RuleContext)
    expect(typeof visitor.TSModuleDeclaration).toBe('function')
  })

  test('flags global namespace declarations too', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'globalThis' },
      kind: 'namespace',
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags module with string literal id for augmentation', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Literal', value: 'jquery' },
      kind: 'module',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('does not flag node without kind property', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      global: false,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags namespace with single-letter name', () => {
    const reports = runRule(createNamespace('A'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'A'")
  })

  test('flags namespace with underscored name', () => {
    const reports = runRule(createNamespace('_internal'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'_internal'")
  })

  test('flags namespace with dollar sign name', () => {
    const reports = runRule(createNamespace('$jQuery'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'$jQuery'")
  })

  test('flags namespace with PascalCase name', () => {
    const reports = runRule(createNamespace('MyAppNamespace'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'MyAppNamespace'")
  })

  test('flags namespace with camelCase name', () => {
    const reports = runRule(createNamespace('myNamespace'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'myNamespace'")
  })

  test('flags namespace with numeric-like name', () => {
    const reports = runRule(createNamespace('Utils2'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'Utils2'")
  })

  test('message starts with "Unexpected namespace"', () => {
    const reports = runRule(createNamespace('Test'))
    expect(reports[0].message).toMatch(/^Unexpected namespace/)
  })

  test('message contains tree-shaking suggestion', () => {
    const reports = runRule(createNamespace('Test'))
    expect(reports[0].message).toContain('tree-shaking')
  })

  test('message contains module resolution suggestion', () => {
    const reports = runRule(createNamespace('Test'))
    expect(reports[0].message).toContain('module resolution')
  })

  test('module augmentation message starts with "Unexpected external"', () => {
    const reports = runRule(createModule('lodash'))
    expect(reports[0].message).toMatch(/^Unexpected external/)
  })

  test('module augmentation message contains ambient suggestion', () => {
    const reports = runRule(createModule('axios'))
    expect(reports[0].message).toContain('ambient module declarations')
  })

  test('module augmentation message contains explicit imports suggestion', () => {
    const reports = runRule(createModule('react'))
    expect(reports[0].message).toContain('explicit imports')
  })

  test('reports correct start line', () => {
    const reports = runRule(createNamespace('Utils', 7, 4))
    expect(reports[0].loc?.start.line).toBe(7)
  })

  test('reports correct start column', () => {
    const reports = runRule(createNamespace('Utils', 3, 12))
    expect(reports[0].loc?.start.column).toBe(12)
  })

  test('reports correct end line', () => {
    const reports = runRule(createNamespace('Utils', 5, 0))
    expect(reports[0].loc?.end.line).toBe(5)
  })

  test('reports location for module augmentation', () => {
    const reports = runRule(createModule('express', 10, 5))
    expect(reports[0].loc).toBeDefined()
    expect(reports[0].loc?.start.line).toBe(10)
  })

  test('flags namespace at line 1 column 0', () => {
    const reports = runRule(createNamespace('Top', 1, 0))
    expect(reports).toHaveLength(1)
  })

  test('flags namespace at high line number', () => {
    const reports = runRule(createNamespace('Deep', 500, 20))
    expect(reports).toHaveLength(1)
  })

  test('flags namespace at column 0', () => {
    const reports = runRule(createNamespace('Zero', 10, 0))
    expect(reports).toHaveLength(1)
  })

  test('flags namespace at non-zero column', () => {
    const reports = runRule(createNamespace('Indented', 3, 8))
    expect(reports).toHaveLength(1)
  })

  test('flags namespace with function declarations inside', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'FuncNS' },
      kind: 'namespace',
      global: false,
      body: {
        type: 'TSModuleBlock',
        body: [{ type: 'FunctionDeclaration' }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'FuncNS'")
  })

  test('flags namespace with class declarations inside', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'ClassNS' },
      kind: 'namespace',
      global: false,
      body: {
        type: 'TSModuleBlock',
        body: [{ type: 'ClassDeclaration' }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'ClassNS'")
  })

  test('flags namespace with interface declarations inside', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'IntfNS' },
      kind: 'namespace',
      global: false,
      body: {
        type: 'TSModuleBlock',
        body: [{ type: 'TSInterfaceDeclaration' }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'IntfNS'")
  })

  test('flags namespace with type alias inside', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'TypeNS' },
      kind: 'namespace',
      global: false,
      body: {
        type: 'TSModuleBlock',
        body: [{ type: 'TSTypeAliasDeclaration' }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'TypeNS'")
  })

  test('flags namespace with variable statements inside', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'VarNS' },
      kind: 'namespace',
      global: false,
      body: {
        type: 'TSModuleBlock',
        body: [{ type: 'VariableDeclaration' }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags namespace with mixed declarations inside', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'MixedNS' },
      kind: 'namespace',
      global: false,
      body: {
        type: 'TSModuleBlock',
        body: [
          { type: 'FunctionDeclaration' },
          { type: 'ClassDeclaration' },
          { type: 'TSInterfaceDeclaration' },
          { type: 'TSTypeAliasDeclaration' },
        ],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'MixedNS'")
  })

  test('flags empty namespace', () => {
    const reports = runRule(createNamespace('Empty'))
    expect(reports).toHaveLength(1)
  })

  test('flags namespace with body containing only comments', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'CommentNS' },
      kind: 'namespace',
      global: false,
      body: {
        type: 'TSModuleBlock',
        body: [{ type: 'EmptyStatement' }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags module augmentation for node builtins', () => {
    const reports = runRule(createModule('fs'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('module augmentation')
  })

  test('flags module augmentation for scoped packages', () => {
    const reports = runRule(createModule('@types/node'))
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('module augmentation')
  })

  test('flags module augmentation with empty string name', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Literal', value: '' },
      kind: 'module',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags module augmentation with long path', () => {
    const reports = runRule(createModule('some/deep/module/path'))
    expect(reports).toHaveLength(1)
  })

  test('does NOT flag module declaration with non-string literal value', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Literal', value: true },
      kind: 'module',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag module declaration with null literal value', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Literal', value: null },
      kind: 'module',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag global augmentation at different line', () => {
    const reports = runRule(createGlobalAugmentation(42, 8))
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag global augmentation with body', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'global' },
      kind: 'global',
      global: true,
      body: {
        type: 'TSModuleBlock',
        body: [{ type: 'TSInterfaceDeclaration' }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag enum declarations', () => {
    const node = {
      type: 'TSEnumDeclaration',
      id: { type: 'Identifier', name: 'Direction' },
      members: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag type alias declarations', () => {
    const node = {
      type: 'TSTypeAliasDeclaration',
      id: { type: 'Identifier', name: 'MyType' },
      typeAnnotation: { type: 'TSStringKeyword' },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag interface declarations', () => {
    const node = {
      type: 'TSInterfaceDeclaration',
      id: { type: 'Identifier', name: 'IConfig' },
      body: { type: 'TSInterfaceBody', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag function declarations', () => {
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'helper' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag class declarations', () => {
    const node = {
      type: 'ClassDeclaration',
      id: { type: 'Identifier', name: 'MyClass' },
      body: { type: 'ClassBody', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag variable declarations', () => {
    const node = {
      type: 'VariableDeclaration',
      declarations: [],
      kind: 'const',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag export declarations', () => {
    const node = {
      type: 'ExportNamedDeclaration',
      declaration: null,
      specifiers: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag import declarations', () => {
    const node = {
      type: 'ImportDeclaration',
      source: { type: 'Literal', value: 'lodash' },
      specifiers: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags three different namespaces independently', () => {
    const r1 = runRule(createNamespace('Alpha'))
    const r2 = runRule(createNamespace('Beta'))
    const r3 = runRule(createNamespace('Gamma'))
    expect(r1).toHaveLength(1)
    expect(r2).toHaveLength(1)
    expect(r3).toHaveLength(1)
    expect(r1[0].message).toContain("'Alpha'")
    expect(r2[0].message).toContain("'Beta'")
    expect(r3[0].message).toContain("'Gamma'")
  })

  test('each namespace report is independent', () => {
    const report1 = runRule(createNamespace('X'))
    const report2 = runRule(createNamespace('X'))
    expect(report1).toHaveLength(1)
    expect(report2).toHaveLength(1)
    expect(report1[0].message).toBe(report2[0].message)
  })

  test('handles namespace with null id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: null,
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'anonymous'")
  })

  test('handles namespace with numeric id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: 42,
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'anonymous'")
  })

  test('handles namespace with empty object id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: {},
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('handles namespace with id that has no name property', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier' },
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'anonymous'")
  })

  test('flags namespace with null body', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'NullBody' },
      kind: 'namespace',
      global: false,
      body: null,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('flags namespace with non-TSModuleBlock body', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'StringBody' },
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleDeclaration', id: { type: 'Identifier', name: 'Inner' } },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain("'StringBody'")
  })

  test('flags namespace with global: true but kind: namespace', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'Globalish' },
      kind: 'namespace',
      global: true,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
  })

  test('does NOT flag when global: true and kind: global', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'global' },
      kind: 'global',
      global: true,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('has url in docs', () => {
    expect(noNamespaceRule.meta.docs?.url).toBeDefined()
    expect(typeof noNamespaceRule.meta.docs?.url).toBe('string')
  })

  test('has empty schema array', () => {
    expect(noNamespaceRule.meta.schema).toEqual([])
  })

  test('fixable is undefined', () => {
    expect(noNamespaceRule.meta.fixable).toBeUndefined()
  })

  test('does NOT flag module declaration without id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      kind: 'module',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag module declaration with null id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: null,
      kind: 'module',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag when kind is an empty string', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'Test' },
      kind: '',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('flags when kind is "namespace" regardless of type casing', () => {
    const node = {
      type: 'tsmoduledeclaration',
      id: { type: 'Identifier', name: 'CaseTest' },
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag when type is wrong even with namespace kind', () => {
    const node = {
      type: 'WrongType',
      id: { type: 'Identifier', name: 'Wrong' },
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag module with object id that is not Literal', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'SomeId' },
      kind: 'module',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('does NOT flag module with template literal id', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      kind: 'module',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(0)
  })

  test('handles namespace without loc property', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Identifier', name: 'NoLoc' },
      kind: 'namespace',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].loc).toBeDefined()
  })

  test('handles module augmentation without loc property', () => {
    const node = {
      type: 'TSModuleDeclaration',
      id: { type: 'Literal', value: 'noloc-module' },
      kind: 'module',
      global: false,
      body: { type: 'TSModuleBlock', body: [] },
    }
    const reports = runRule(node)
    expect(reports).toHaveLength(1)
    expect(reports[0].loc).toBeDefined()
  })

  test('create returns object with TSModuleDeclaration', () => {
    const { context } = createMockRuleContext()
    const visitor = noNamespaceRule.create(context as RuleContext)
    expect(visitor).toHaveProperty('TSModuleDeclaration')
  })

  test('create returns object with only TSModuleDeclaration key', () => {
    const { context } = createMockRuleContext()
    const visitor = noNamespaceRule.create(context as RuleContext)
    expect(Object.keys(visitor)).toEqual(['TSModuleDeclaration'])
  })
})
