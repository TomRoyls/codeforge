import { describe, expect, it, vi } from 'vitest'

import type { ReportDescriptor, RuleContext, RuleVisitor } from '../../src/plugins/types.js'

import { consistentImportsRule } from '../../src/rules/dependencies/consistent-imports.js'
import { noBarrelImportsRule } from '../../src/rules/dependencies/no-barrel-imports.js'
import { noCjsImportsRule } from '../../src/rules/dependencies/no-cjs-imports.js'
import { noCircularDepsRule } from '../../src/rules/dependencies/no-circular-deps.js'
import { noUnusedExportsRule } from '../../src/rules/dependencies/no-unused-exports.js'

// ─── Mock context factory ───

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = 'test.ts',
  ast: unknown = null,
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options },
    getAST: () => ast,
    getComments: () => [],
    getFilePath: () => filePath,
    getSource: () => '',
    getTokens: () => [],
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    report(descriptor: ReportDescriptor) {
      reports.push(descriptor)
    },
    workspaceRoot: '/test',
  }

  return { context, reports }
}

// ─── Synthetic node helpers ───

function withLoc(node: Record<string, unknown>, line = 1, column = 0) {
  return {
    ...node,
    loc: {
      end: { column: column + 1, line },
      start: { column, line },
    },
  }
}

function requireCall(source: string, line = 1, column = 0) {
  return withLoc(
    {
      arguments: [{ type: 'Literal', value: source }],
      callee: { name: 'require', type: 'Identifier' },
      type: 'CallExpression',
    },
    line,
    column,
  )
}

function safeCall(calleeName: string) {
  return withLoc({
    arguments: [{ type: 'Literal', value: 'arg' }],
    callee: { name: calleeName, type: 'Identifier' },
    type: 'CallExpression',
  })
}

function importDeclaration(source: string, specifiers: unknown[] = [], importKind?: string) {
  return withLoc({
    source: { type: 'Literal', value: source },
    specifiers,
    type: 'ImportDeclaration',
    ...(importKind ? { importKind } : {}),
  })
}

function exportAllDeclaration(source: string, exportKind?: string) {
  return withLoc({
    source: { type: 'Literal', value: source },
    type: 'ExportAllDeclaration',
    ...(exportKind ? { exportKind } : {}),
  })
}

function exportNamedDeclaration(source: string) {
  return withLoc({
    source: { type: 'Literal', value: source },
    specifiers: [],
    type: 'ExportNamedDeclaration',
  })
}

function namedImportNode(source: string, names: string[]) {
  return withLoc({
    source: { type: 'Literal', value: source },
    specifiers: names.map((name) => ({
      imported: { name, type: 'Identifier' },
      local: { name, type: 'Identifier' },
      type: 'ImportSpecifier',
    })),
    type: 'ImportDeclaration',
  })
}

function defaultImportNode(source: string, localName = 'mod') {
  return withLoc({
    source: { type: 'Literal', value: source },
    specifiers: [{ local: { name: localName, type: 'Identifier' }, type: 'ImportDefaultSpecifier' }],
    type: 'ImportDeclaration',
  })
}

function namespaceImportNode(source: string, localName = 'mod') {
  return withLoc({
    source: { type: 'Literal', value: source },
    specifiers: [{ local: { name: localName, type: 'Identifier' }, type: 'ImportNamespaceSpecifier' }],
    type: 'ImportDeclaration',
  })
}

function mixedImportNode(source: string, localName: string, namedNames: string[]) {
  return withLoc({
    source: { type: 'Literal', value: source },
    specifiers: [
      { local: { name: localName, type: 'Identifier' }, type: 'ImportDefaultSpecifier' },
      ...namedNames.map((name) => ({
        imported: { name, type: 'Identifier' },
        local: { name, type: 'Identifier' },
        type: 'ImportSpecifier',
      })),
    ],
    type: 'ImportDeclaration',
  })
}

function programWithImports(imports: Array<{ source: string }>) {
  return withLoc({
    body: imports.map((imp) =>
      withLoc({
        source: { type: 'Literal', value: imp.source },
        specifiers: [],
        type: 'ImportDeclaration',
      }),
    ),
    type: 'Program',
  })
}

function programWithExports(exports: unknown[]) {
  return withLoc({
    body: exports,
    type: 'Program',
  })
}

function exportNamedVar(name: string) {
  return withLoc({
    declaration: {
      declarations: [{ id: { name, type: 'Identifier' }, type: 'VariableDeclarator' }],
      kind: 'const',
      type: 'VariableDeclaration',
    },
    type: 'ExportNamedDeclaration',
  })
}

// ─── no-cjs-imports ───

describe('no-cjs-imports rule', () => {
  it('reports require() with a single string literal argument', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCjsImportsRule.create(context)

    visitor.CallExpression!(requireCall('fs'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unexpected CommonJS `require()`')
    expect(reports[0]!.message).toContain('fs')
  })

  it('reports require() with relative path', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCjsImportsRule.create(context)

    visitor.CallExpression!(requireCall('./utils'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('./utils')
  })

  it('does not report require() with no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCjsImportsRule.create(context)

    visitor.CallExpression!(
      withLoc({
        arguments: [],
        callee: { name: 'require', type: 'Identifier' },
        type: 'CallExpression',
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report require() with multiple arguments', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCjsImportsRule.create(context)

    visitor.CallExpression!(
      withLoc({
        arguments: [{ type: 'Literal', value: 'fs' }, { type: 'Literal', value: 'extra' }],
        callee: { name: 'require', type: 'Identifier' },
        type: 'CallExpression',
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report require() with non-string literal', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCjsImportsRule.create(context)

    visitor.CallExpression!(
      withLoc({
        arguments: [{ type: 'Literal', value: 42 }],
        callee: { name: 'require', type: 'Identifier' },
        type: 'CallExpression',
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report require() with non-Literal argument', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCjsImportsRule.create(context)

    visitor.CallExpression!(
      withLoc({
        arguments: [{ name: 'moduleName', type: 'Identifier' }],
        callee: { name: 'require', type: 'Identifier' },
        type: 'CallExpression',
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report non-require CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCjsImportsRule.create(context)

    visitor.CallExpression!(safeCall('myFunc'))

    expect(reports).toHaveLength(0)
  })

  it('does not report MemberExpression callee (obj.require())', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCjsImportsRule.create(context)

    visitor.CallExpression!(
      withLoc({
        arguments: [{ type: 'Literal', value: 'fs' }],
        callee: {
          object: { name: 'obj', type: 'Identifier' },
          property: { name: 'require', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('captures location information in reports', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCjsImportsRule.create(context)

    visitor.CallExpression!(requireCall('fs', 5, 10))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 11, line: 5 },
      start: { column: 10, line: 5 },
    })
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noCjsImportsRule.meta.docs?.category).toBe('dependencies')
    expect(noCjsImportsRule.meta.severity).toBe('warn')
    expect(noCjsImportsRule.meta.type).toBe('suggestion')
  })
})

// ─── no-barrel-imports ───

describe('no-barrel-imports rule', () => {
  it('reports ImportDeclaration from ./index.ts', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.ImportDeclaration!(importDeclaration('./index.ts'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("barrel file './index.ts'")
  })

  it('reports ImportDeclaration from nested barrel ./foo/index.js', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.ImportDeclaration!(importDeclaration('./foo/index.js'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("barrel file './foo/index.js'")
  })

  it('reports require() from barrel file', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.CallExpression!(requireCall('./utils/index.ts'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("barrel file './utils/index.ts'")
  })

  it('reports ExportAllDeclaration from barrel', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.ExportAllDeclaration!(exportAllDeclaration('./index.ts'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Re-export all from barrel')
  })

  it('reports ExportNamedDeclaration re-export from barrel', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.ExportNamedDeclaration!(exportNamedDeclaration('./index.ts'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Re-export from barrel')
  })

  it('does not report ImportDeclaration from non-barrel path', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.ImportDeclaration!(importDeclaration('./utils'))

    expect(reports).toHaveLength(0)
  })

  it('does not report require() from non-barrel path', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.CallExpression!(requireCall('./utils'))

    expect(reports).toHaveLength(0)
  })

  it('does not report type-only import when allowTypeOnly is true', () => {
    const { context, reports } = createMockContext([{ allowTypeOnly: true }])
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.ImportDeclaration!(importDeclaration('./index.ts', [], 'type'))

    expect(reports).toHaveLength(0)
  })

  it('reports type-only import when allowTypeOnly is false (default)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.ImportDeclaration!(importDeclaration('./index.ts', [], 'type'))

    expect(reports).toHaveLength(1)
  })

  it('does not report excluded source', () => {
    const { context, reports } = createMockContext([{ exclude: ['./index.ts'] }])
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.ImportDeclaration!(importDeclaration('./index.ts'))

    expect(reports).toHaveLength(0)
  })

  it('includes suggestion in ImportDeclaration report', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.ImportDeclaration!(
      importDeclaration('./index.ts', [
        {
          imported: { name: 'foo', type: 'Identifier' },
          local: { name: 'foo', type: 'Identifier' },
          type: 'ImportSpecifier',
        },
      ]),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.suggest).toBeDefined()
    expect(reports[0]!.suggest!.length).toBeGreaterThan(0)
    expect(reports[0]!.suggest![0]!.message).toContain('Import directly')
  })

  it('reports with custom barrelPatterns', () => {
    const { context, reports } = createMockContext([{ barrelPatterns: ['/mod.ts'] }])
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.ImportDeclaration!(importDeclaration('./mod.ts'))

    expect(reports).toHaveLength(1)
  })

  it('does not report ExportNamedDeclaration without source', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noBarrelImportsRule.create(context)

    visitor.ExportNamedDeclaration!(
      withLoc({
        type: 'ExportNamedDeclaration',
      }),
    )

    expect(reports).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noBarrelImportsRule.meta.docs?.category).toBe('dependencies')
    expect(noBarrelImportsRule.meta.severity).toBe('warn')
    expect(noBarrelImportsRule.meta.type).toBe('suggestion')
    expect(noBarrelImportsRule.meta.fixable).toBe('code')
  })
})

// ─── consistent-imports ───

describe('consistent-imports rule', () => {
  // ─── prefer: named ───

  it('with prefer=named: reports namespace import', () => {
    const { context, reports } = createMockContext([{ prefer: 'named' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(namespaceImportNode('lodash'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Use named imports instead of namespace')
  })

  it('with prefer=named: reports mixed import (default + named)', () => {
    const { context, reports } = createMockContext([{ prefer: 'named' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(mixedImportNode('react', 'React', ['useState']))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Separate default and named imports')
  })

  it('with prefer=named: does not report pure named imports', () => {
    const { context, reports } = createMockContext([{ prefer: 'named' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(namedImportNode('lodash', ['debounce', 'throttle']))

    expect(reports).toHaveLength(0)
  })

  it('with prefer=named: does not report pure default import', () => {
    const { context, reports } = createMockContext([{ prefer: 'named' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(defaultImportNode('express'))

    expect(reports).toHaveLength(0)
  })

  it('with prefer=named: reports require() call', () => {
    const { context, reports } = createMockContext([{ prefer: 'named' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.CallExpression!(requireCall('./utils'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Use ES module named imports instead of require()')
  })

  // ─── prefer: default ───

  it('with prefer=default: reports namespace import', () => {
    const { context, reports } = createMockContext([{ prefer: 'default' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(namespaceImportNode('lodash'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Prefer default imports over namespace')
  })

  it('with prefer=default: reports named import with more than one specifier', () => {
    const { context, reports } = createMockContext([{ prefer: 'default' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(namedImportNode('lodash', ['debounce', 'throttle']))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Prefer default imports over named')
  })

  it('with prefer=default: reports single named import with suggestion', () => {
    const { context, reports } = createMockContext([{ prefer: 'default' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(namedImportNode('lodash', ['debounce']))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Consider using default import')
  })

  it('with prefer=default: does not report default import', () => {
    const { context, reports } = createMockContext([{ prefer: 'default' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(defaultImportNode('express'))

    expect(reports).toHaveLength(0)
  })

  // ─── prefer: namespace ───

  it('with prefer=namespace: reports named imports at or above threshold', () => {
    const { context, reports } = createMockContext([{ namespaceThreshold: 3, prefer: 'namespace' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(namedImportNode('lodash', ['a', 'b', 'c']))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Use namespace import instead of multiple named')
  })

  it('with prefer=namespace: does not report named imports below threshold', () => {
    const { context, reports } = createMockContext([{ namespaceThreshold: 5, prefer: 'namespace' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(namedImportNode('lodash', ['a', 'b']))

    expect(reports).toHaveLength(0)
  })

  it('with prefer=namespace: includes suggestion with fix', () => {
    const { context, reports } = createMockContext([{ namespaceThreshold: 2, prefer: 'namespace' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(namedImportNode('lodash', ['a', 'b']))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.suggest).toBeDefined()
    expect(reports[0]!.suggest![0]!.fix.text).toContain('import * as namespace')
  })

  it('does not report excluded sources', () => {
    const { context, reports } = createMockContext([{ exclude: ['lodash'], prefer: 'named' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.ImportDeclaration!(namespaceImportNode('lodash'))

    expect(reports).toHaveLength(0)
  })

  it('does not report require() when prefer is namespace', () => {
    const { context, reports } = createMockContext([{ prefer: 'namespace' }])
    const visitor: RuleVisitor = consistentImportsRule.create(context)

    visitor.CallExpression!(requireCall('./utils'))

    expect(reports).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(consistentImportsRule.meta.docs?.category).toBe('dependencies')
    expect(consistentImportsRule.meta.severity).toBe('warn')
    expect(consistentImportsRule.meta.type).toBe('suggestion')
    expect(consistentImportsRule.meta.fixable).toBe('code')
  })
})

// ─── no-circular-deps ───

describe('no-circular-deps rule', () => {
  it('ImportDeclaration handler processes import source without error', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCircularDepsRule.create(context)

    visitor.ImportDeclaration!(
      withLoc({
        source: { type: 'Literal', value: './utils' },
        specifiers: [],
        type: 'ImportDeclaration',
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('CallExpression handler processes require() without error', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCircularDepsRule.create(context)

    visitor.CallExpression!(requireCall('./utils'))

    expect(reports).toHaveLength(0)
  })

  it('does not report non-require CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCircularDepsRule.create(context)

    visitor.CallExpression!(safeCall('myFunc'))

    expect(reports).toHaveLength(0)
  })

  it('Program handler extracts imports from AST', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCircularDepsRule.create(context)

    const ast = programWithImports([{ source: './a' }, { source: './b' }])
    visitor.Program!(ast)

    expect(reports).toHaveLength(0)
  })

  it('Program:exit reports self-referencing import as cycle', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCircularDepsRule.create(context)

    const ast = programWithImports([{ source: 'test.ts' }])
    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Circular dependency detected')
    expect(reports[0]!.message).toContain('test.ts')
  })

  it('Program:exit reports no cycles for non-circular imports', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCircularDepsRule.create(context)

    const ast = programWithImports([{ source: './a' }, { source: './b' }])
    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(0)
  })

  it('ImportDeclaration with no source does not report', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCircularDepsRule.create(context)

    visitor.ImportDeclaration!(
      withLoc({
        type: 'ImportDeclaration',
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('multiple require() calls accumulate imports', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noCircularDepsRule.create(context)

    visitor.CallExpression!(requireCall('./a'))
    visitor.CallExpression!(requireCall('./b'))

    expect(reports).toHaveLength(0)
  })

  it('respects maxDepth option', () => {
    const { context, reports } = createMockContext([{ maxDepth: 1 }])
    const visitor: RuleVisitor = noCircularDepsRule.create(context)

    const ast = programWithImports([{ source: 'test.ts' }])
    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(1)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noCircularDepsRule.meta.docs?.category).toBe('dependencies')
    expect(noCircularDepsRule.meta.docs?.recommended).toBe(true)
    expect(noCircularDepsRule.meta.severity).toBe('error')
    expect(noCircularDepsRule.meta.type).toBe('problem')
    expect(noCircularDepsRule.meta.fixable).toBe('code')
  })
})

// ─── no-unused-exports ───

describe('no-unused-exports rule', () => {
  it('reports unused named export (ExportNamedDeclaration with variable)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnusedExportsRule.create(context)

    const ast = programWithExports([exportNamedVar('unusedVar')])

    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Export 'unusedVar' is never used")
  })

  it('reports unused default export', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnusedExportsRule.create(context)

    const ast = programWithExports([
      withLoc({
        declaration: { name: 'something', type: 'Identifier' },
        type: 'ExportDefaultDeclaration',
      }),
    ])

    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Export 'default' is never used")
  })

  it('reports unused namespace export (ExportAllDeclaration)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnusedExportsRule.create(context)

    const ast = programWithExports([
      withLoc({
        source: { type: 'Literal', value: './other' },
        type: 'ExportAllDeclaration',
      }),
    ])

    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Export '*' is never used")
  })

  it('does not report when export is used by another file', () => {
    const { context: ctxExporter, reports } = createMockContext([], 'test.ts')
    const visitorExporter = noUnusedExportsRule.create(ctxExporter)

    const exporterAST = programWithExports([exportNamedVar('usedVar')])
    visitorExporter.Program!(exporterAST)

    const { context: ctxImporter } = createMockContext([], 'importer.ts')
    const visitorImporter = noUnusedExportsRule.create(ctxImporter)

    const importerAST = withLoc({
      body: [
        withLoc({
          source: { type: 'Literal', value: 'test.ts' },
          specifiers: [
            {
              imported: { name: 'usedVar', type: 'Identifier' },
              local: { name: 'usedVar', type: 'Identifier' },
              type: 'ImportSpecifier',
            },
          ],
          type: 'ImportDeclaration',
        }),
      ],
      type: 'Program',
    })
    visitorImporter.Program!(importerAST)

    visitorExporter['Program:exit']!()

    expect(reports).toHaveLength(0)
  })

  it('does not report exports from entry file (index.ts) by default', () => {
    const { context, reports } = createMockContext([], 'src/index.ts')
    const visitor: RuleVisitor = noUnusedExportsRule.create(context)

    const ast = programWithExports([exportNamedVar('mainExport')])

    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(0)
  })

  it('does not report exports from main.ts entry file', () => {
    const { context, reports } = createMockContext([], 'src/main.ts')
    const visitor: RuleVisitor = noUnusedExportsRule.create(context)

    const ast = programWithExports([exportNamedVar('app')])

    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(0)
  })

  it('reports exports from non-entry file', () => {
    const { context, reports } = createMockContext([], 'src/utils.ts')
    const visitor: RuleVisitor = noUnusedExportsRule.create(context)

    const ast = programWithExports([exportNamedVar('helper')])

    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Export 'helper' is never used")
  })

  it('respects ignorePatterns to skip specific exports', () => {
    const { context, reports } = createMockContext([{ ignorePatterns: ['ignoredExport'] }])
    const visitor: RuleVisitor = noUnusedExportsRule.create(context)

    const ast = programWithExports([exportNamedVar('ignoredExport')])

    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(0)
  })

  it('respects ignoreTypeOnly for type exports', () => {
    const { context, reports } = createMockContext([{ ignoreTypeOnly: true }])
    const visitor: RuleVisitor = noUnusedExportsRule.create(context)

    const ast = programWithExports([
      withLoc({
        declaration: {
          id: { name: 'MyType', type: 'Identifier' },
          type: 'TSTypeAliasDeclaration',
        },
        exportKind: 'type',
        type: 'ExportNamedDeclaration',
      }),
    ])

    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(0)
  })

  it('reports type exports when ignoreTypeOnly is false', () => {
    const { context, reports } = createMockContext([{ ignoreTypeOnly: false }])
    const visitor: RuleVisitor = noUnusedExportsRule.create(context)

    const ast = programWithExports([
      withLoc({
        declaration: {
          id: { name: 'MyType', type: 'Identifier' },
          type: 'TSTypeAliasDeclaration',
        },
        type: 'ExportNamedDeclaration',
      }),
    ])

    visitor.Program!(ast)
    visitor['Program:exit']!()

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Export 'MyType' is never used")
  })

  it('does not report when namespace import covers the export', () => {
    const { context: ctxExporter, reports } = createMockContext([], 'lib.ts')
    const visitorExporter = noUnusedExportsRule.create(ctxExporter)

    const exporterAST = programWithExports([exportNamedVar('foo')])
    visitorExporter.Program!(exporterAST)

    const { context: ctxImporter } = createMockContext([], 'consumer.ts')
    const visitorImporter = noUnusedExportsRule.create(ctxImporter)

    const importerAST = withLoc({
      body: [
        withLoc({
          source: { type: 'Literal', value: 'lib.ts' },
          specifiers: [
            { local: { name: 'lib', type: 'Identifier' }, type: 'ImportNamespaceSpecifier' },
          ],
          type: 'ImportDeclaration',
        }),
      ],
      type: 'Program',
    })
    visitorImporter.Program!(importerAST)

    visitorExporter['Program:exit']!()

    expect(reports).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noUnusedExportsRule.meta.docs?.category).toBe('dependencies')
    expect(noUnusedExportsRule.meta.docs?.recommended).toBe(true)
    expect(noUnusedExportsRule.meta.severity).toBe('warn')
    expect(noUnusedExportsRule.meta.type).toBe('problem')
    expect(noUnusedExportsRule.meta.fixable).toBe('code')
  })
})
