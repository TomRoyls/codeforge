import { describe, it, expect } from 'vitest'
import {
  createEmptyModuleInfo,
  createEmptyImportGraph,
  ImportGraphBuilder,
  CrossFileAnalyzer,
} from '../../src/core/cross-file/index.js'
import type {
  ModuleInfo,
  ImportGraph,
  CrossFileAnalysisResult,
} from '../../src/core/cross-file/index.js'

describe('cross-file types', () => {
  describe('createEmptyModuleInfo', () => {
    it('creates ModuleInfo with correct defaults', () => {
      const info = createEmptyModuleInfo('src/test.ts')
      expect(info.filePath).toBe('src/test.ts')
      expect(info.imports).toEqual([])
      expect(info.exports).toEqual([])
      expect(info.isBarrel).toBe(false)
      expect(info.isEntryPoint).toBe(false)
      expect(info.dependencies).toBeInstanceOf(Set)
      expect(info.dependencies.size).toBe(0)
      expect(info.dependents).toBeInstanceOf(Set)
      expect(info.dependents.size).toBe(0)
      expect(info.depth).toBe(0)
    })

    it('creates independent instances', () => {
      const a = createEmptyModuleInfo('a.ts')
      const b = createEmptyModuleInfo('b.ts')
      a.dependencies.add('something')
      expect(b.dependencies.size).toBe(0)
    })
  })

  describe('createEmptyImportGraph', () => {
    it('creates ImportGraph with empty Map and edges', () => {
      const graph = createEmptyImportGraph()
      expect(graph.modules).toBeInstanceOf(Map)
      expect(graph.modules.size).toBe(0)
      expect(graph.edges).toEqual([])
    })

    it('creates independent instances', () => {
      const a = createEmptyImportGraph()
      const b = createEmptyImportGraph()
      a.modules.set('x', createEmptyModuleInfo('x'))
      expect(b.modules.size).toBe(0)
    })
  })
})

describe('ImportGraphBuilder', () => {
  describe('basic module building', () => {
    it('builds graph from simple module with imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/main.ts', `import { foo } from './utils.js'`)
      const graph = builder.getGraph()

      expect(graph.modules.size).toBe(1)
      const mod = graph.modules.get('src/main.ts')!
      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.fromModule).toBe('./utils.js')
      expect(mod.imports[0]!.name).toBe('foo')
      expect(mod.imports[0]!.isTypeOnly).toBe(false)
      expect(mod.imports[0]!.isDynamic).toBe(false)
      expect(mod.dependencies.has('./utils.js')).toBe(true)
    })

    it('builds graph with multiple modules', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/main.ts', `import { foo } from './utils.js'`)
      builder.addModule('src/utils.ts', `export function foo() {}`)
      const graph = builder.getGraph()

      expect(graph.modules.size).toBe(2)
      expect(graph.modules.get('src/main.ts')!.imports.length).toBe(1)
      expect(graph.modules.get('src/utils.ts')!.exports.length).toBe(1)
    })

    it('handles modules with no imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/standalone.ts', `export const x = 1`)
      const mod = builder.getGraph().modules.get('src/standalone.ts')!

      expect(mod.imports).toEqual([])
      expect(mod.dependencies.size).toBe(0)
      expect(mod.exports.length).toBe(1)
    })

    it('handles modules with no exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/consumer.ts', `import { foo } from './utils.js'`)
      const mod = builder.getGraph().modules.get('src/consumer.ts')!

      expect(mod.exports).toEqual([])
      expect(mod.imports.length).toBe(1)
    })

    it('handles empty source code', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/empty.ts', '')
      const mod = builder.getGraph().modules.get('src/empty.ts')!

      expect(mod.imports).toEqual([])
      expect(mod.exports).toEqual([])
      expect(mod.dependencies.size).toBe(0)
    })
  })

  describe('import parsing', () => {
    it('parses named imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import { foo, bar } from './b.js'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.name).toBe('foo, bar')
      expect(mod.imports[0]!.isDefault).toBe(false)
    })

    it('parses default imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import React from 'react'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.isDefault).toBe(true)
      expect(mod.imports[0]!.name).toBe('React')
    })

    it('parses namespace imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import * as utils from './utils.js'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.isNamespace).toBe(true)
      expect(mod.imports[0]!.name).toBe('utils')
    })

    it('parses type-only imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import type { Config } from './types.js'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.isTypeOnly).toBe(true)
    })

    it('parses dynamic imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `const mod = import('./lazy.js')`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.isDynamic).toBe(true)
      expect(mod.imports[0]!.fromModule).toBe('./lazy.js')
    })

    it('parses require calls', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `const mod = require('./common.js')`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.fromModule).toBe('./common.js')
    })

    it('parses side-effect imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import './polyfill.js'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.fromModule).toBe('./polyfill.js')
      expect(mod.imports[0]!.name).toBe('')
    })

    it('parses default + named imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import React, { useState } from 'react'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.isDefault).toBe(true)
    })

    it('parses imports with aliased names', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import { foo as bar } from './b.js'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.name).toBe('foo')
    })

    it('reports correct line numbers', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `\nimport { foo } from './b.js'\nimport { bar } from './c.js'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.imports[0]!.line).toBe(2)
      expect(mod.imports[1]!.line).toBe(3)
    })
  })

  describe('export parsing', () => {
    it('parses named function exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `export function greet() {}`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.exports.length).toBe(1)
      expect(mod.exports[0]!.name).toBe('greet')
      expect(mod.exports[0]!.kind).toBe('function')
      expect(mod.exports[0]!.isDefault).toBe(false)
      expect(mod.exports[0]!.isReExport).toBe(false)
    })

    it('parses named const exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `export const VERSION = '1.0.0'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.exports[0]!.name).toBe('VERSION')
      expect(mod.exports[0]!.kind).toBe('const')
    })

    it('parses class exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `export class App {}`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.exports[0]!.name).toBe('App')
      expect(mod.exports[0]!.kind).toBe('class')
    })

    it('parses interface exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `export interface Config { name: string }`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.exports[0]!.name).toBe('Config')
      expect(mod.exports[0]!.kind).toBe('interface')
    })

    it('parses type exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `export type Result = string | number`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.exports[0]!.name).toBe('Result')
      expect(mod.exports[0]!.kind).toBe('type')
      expect(mod.exports[0]!.isTypeOnly).toBe(true)
    })

    it('parses enum exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `export enum Color { Red, Green }`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.exports[0]!.name).toBe('Color')
      expect(mod.exports[0]!.kind).toBe('enum')
    })

    it('parses default exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `export default myModule`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.exports[0]!.name).toBe('myModule')
      expect(mod.exports[0]!.isDefault).toBe(true)
    })

    it('parses re-exports with named exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `export { foo, bar } from './b.js'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.exports.length).toBe(2)
      expect(mod.exports[0]!.isReExport).toBe(true)
      expect(mod.exports[0]!.reExportFrom).toBe('./b.js')
      expect(mod.exports[1]!.isReExport).toBe(true)
      expect(mod.exports[1]!.name).toBe('bar')
    })

    it('parses star re-exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `export * from './b.js'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.exports.length).toBe(1)
      expect(mod.exports[0]!.name).toBe('*')
      expect(mod.exports[0]!.isReExport).toBe(true)
      expect(mod.exports[0]!.reExportFrom).toBe('./b.js')
    })

    it('parses type re-exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `export type { Config } from './types.js'`)
      const mod = builder.getGraph().modules.get('src/a.ts')!

      expect(mod.exports.length).toBe(1)
      expect(mod.exports[0]!.isReExport).toBe(true)
      expect(mod.exports[0]!.isTypeOnly).toBe(true)
      expect(mod.exports[0]!.reExportFrom).toBe('./types.js')
    })
  })

  describe('re-exports and barrel detection', () => {
    it('builds graph with re-exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/index.ts', `export { foo } from './foo.js'\nexport * from './bar.js'`)
      builder.addModule('src/foo.ts', `export function foo() {}`)
      builder.addModule('src/bar.ts', `export const bar = 1`)

      const graph = builder.resolve()
      const index = graph.modules.get('src/index.ts')!

      expect(index.exports.length).toBe(2)
      expect(index.imports.length).toBe(2)
    })

    it('detects barrel files after resolve', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/index.ts', `export { foo } from './foo.js'\nexport * from './bar.js'`)
      builder.addModule('src/foo.ts', `export function foo() {}`)

      const graph = builder.resolve()
      const index = graph.modules.get('src/index.ts')!
      expect(index.isBarrel).toBe(true)
    })

    it('does not mark non-barrel files as barrel', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/foo.ts', `export function foo() {}\nconst x = 1`)

      const graph = builder.resolve()
      const mod = graph.modules.get('src/foo.ts')!
      expect(mod.isBarrel).toBe(false)
    })
  })

  describe('addEntryPoint', () => {
    it('marks entry point correctly', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/main.ts', `import { foo } from './utils.js'`)
      builder.addEntryPoint('src/main.ts')

      const graph = builder.resolve()
      const mod = graph.modules.get('src/main.ts')!
      expect(mod.isEntryPoint).toBe(true)
    })

    it('marks entry point via addModule option', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/main.ts', `import { foo } from './utils.js'`, true)

      const graph = builder.resolve()
      const mod = graph.modules.get('src/main.ts')!
      expect(mod.isEntryPoint).toBe(true)
    })

    it('allows multiple entry points', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/main.ts', `import { foo } from './utils.js'`, true)
      builder.addModule('src/cli.ts', `import { bar } from './utils.js'`, true)
      builder.addModule('src/utils.ts', `export function foo() {}`)

      const graph = builder.resolve()
      expect(graph.modules.get('src/main.ts')!.isEntryPoint).toBe(true)
      expect(graph.modules.get('src/cli.ts')!.isEntryPoint).toBe(true)
      expect(graph.modules.get('src/utils.ts')!.isEntryPoint).toBe(false)
    })
  })

  describe('resolve', () => {
    it('computes dependents correctly', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/main.ts', `import { foo } from './utils.js'`)
      builder.addModule('src/utils.ts', `export function foo() {}`)

      const graph = builder.resolve()
      const utils = graph.modules.get('src/utils.ts')!

      expect(utils.dependents.has('src/main.ts')).toBe(true)
    })

    it('computes depth via BFS from entry points', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/main.ts', `import { foo } from './utils.js'`, true)
      builder.addModule('src/utils.ts', `import { helper } from './helper.js'\nexport function foo() {}`)
      builder.addModule('src/helper.ts', `export function helper() {}`)

      const graph = builder.resolve()
      expect(graph.modules.get('src/main.ts')!.depth).toBe(0)
      expect(graph.modules.get('src/utils.ts')!.depth).toBe(1)
      expect(graph.modules.get('src/helper.ts')!.depth).toBe(2)
    })

    it('builds ImportEdge array', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/main.ts', `import { foo } from './utils.js'`)
      builder.addModule('src/utils.ts', `export function foo() {}`)

      const graph = builder.resolve()
      expect(graph.edges.length).toBe(1)
      expect(graph.edges[0]!.from).toBe('src/main.ts')
      expect(graph.edges[0]!.to).toBe('src/utils.ts')
    })

    it('handles circular imports without crashing', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import { b } from './b.js'\nexport function a() {}`)
      builder.addModule('src/b.ts', `import { a } from './a.js'\nexport function b() {}`)

      expect(() => builder.resolve()).not.toThrow()
    })

    it('sets depth to 0 for unreachable modules when no entry points', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import { b } from './b.js'`)
      builder.addModule('src/b.ts', `export const b = 1`)

      const graph = builder.resolve()
      expect(graph.modules.get('src/a.ts')!.depth).toBe(0)
      expect(graph.modules.get('src/b.ts')!.depth).toBe(0)
    })
  })

  describe('reset', () => {
    it('clears the builder', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import { b } from './b.js'`)
      builder.addEntryPoint('src/a.ts')

      builder.reset()

      const graph = builder.getGraph()
      expect(graph.modules.size).toBe(0)
      expect(graph.edges).toEqual([])
    })

    it('allows building fresh graph after reset', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import { b } from './b.js'`)
      builder.reset()
      builder.addModule('src/x.ts', `export const x = 1`)

      const graph = builder.resolve()
      expect(graph.modules.size).toBe(1)
      expect(graph.modules.has('src/x.ts')).toBe(true)
    })
  })
})

describe('CrossFileAnalyzer', () => {
  function buildGraph(
    modules: Array<{ path: string; source: string; isEntryPoint?: boolean }>,
  ): ImportGraph {
    const builder = new ImportGraphBuilder()
    for (const m of modules) {
      builder.addModule(m.path, m.source, m.isEntryPoint)
    }
    return builder.resolve()
  }

  describe('findDeadModules', () => {
    it('returns modules not reachable from entry points', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './foo.js'`, isEntryPoint: true },
        { path: 'src/foo.ts', source: `export function foo() {}` },
        { path: 'src/orphan.ts', source: `export const unused = 1` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const dead = analyzer.findDeadModules(graph)
      expect(dead).toContain('src/orphan.ts')
      expect(dead).not.toContain('src/main.ts')
      expect(dead).not.toContain('src/foo.ts')
    })

    it('returns empty when no entry points', () => {
      const graph = buildGraph([
        { path: 'src/a.ts', source: `import { b } from './b.js'` },
        { path: 'src/b.ts', source: `export const b = 1` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const dead = analyzer.findDeadModules(graph)
      expect(dead).toEqual([])
    })

    it('returns empty when all modules are reachable', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { a } from './a.js'\nimport { b } from './b.js'`, isEntryPoint: true },
        { path: 'src/a.ts', source: `export const a = 1` },
        { path: 'src/b.ts', source: `export const b = 2` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const dead = analyzer.findDeadModules(graph)
      expect(dead).toEqual([])
    })

    it('handles transitive reachability', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { a } from './a.js'`, isEntryPoint: true },
        { path: 'src/a.ts', source: `import { b } from './b.js'\nexport const a = 1` },
        { path: 'src/b.ts', source: `export const b = 2` },
        { path: 'src/dead.ts', source: `export const dead = 3` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const dead = analyzer.findDeadModules(graph)
      expect(dead).toEqual(['src/dead.ts'])
    })
  })

  describe('findUnusedExports', () => {
    it('detects exported but never imported names', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { used } from './utils.js'` },
        { path: 'src/utils.ts', source: `export function used() {}\nexport function unused() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const issues = analyzer.findUnusedExports(graph)
      expect(issues.length).toBe(1)
      expect(issues[0]!.type).toBe('unused-export')
      expect(issues[0]!.details.exportName).toBe('unused')
    })

    it('returns empty when all exports are used', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './utils.js'` },
        { path: 'src/utils.ts', source: `export function foo() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const issues = analyzer.findUnusedExports(graph)
      expect(issues).toEqual([])
    })

    it('skips re-exports when checking usage', () => {
      const graph = buildGraph([
        { path: 'src/index.ts', source: `export { foo } from './foo.js'` },
        { path: 'src/foo.ts', source: `export function foo() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const issues = analyzer.findUnusedExports(graph)
      const reExportIssues = issues.filter((i) => i.filePath === 'src/index.ts')
      expect(reExportIssues.length).toBe(0)
    })

    it('skips star re-exports', () => {
      const graph = buildGraph([
        { path: 'src/index.ts', source: `export * from './foo.js'` },
        { path: 'src/foo.ts', source: `export function foo() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const issues = analyzer.findUnusedExports(graph)
      const starIssues = issues.filter((i) => i.details.exportName === '*')
      expect(starIssues.length).toBe(0)
    })
  })

  describe('findReExportChains', () => {
    it('detects chains of length 2+', () => {
      const graph = buildGraph([
        { path: 'src/index.ts', source: `export { foo } from './middle.js'` },
        { path: 'src/middle.ts', source: `export { foo } from './source.js'` },
        { path: 'src/source.ts', source: `export function foo() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const chains = analyzer.findReExportChains(graph)
      expect(chains.length).toBeGreaterThanOrEqual(1)
      const mainChain = chains.find((c) => c.source === 'src/source.ts')
      expect(mainChain).toBeDefined()
      expect(mainChain!.intermediaries.length).toBeGreaterThanOrEqual(1)
    })

    it('returns empty for no re-exports', () => {
      const graph = buildGraph([
        { path: 'src/a.ts', source: `export function foo() {}` },
        { path: 'src/b.ts', source: `import { foo } from './a.js'` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const chains = analyzer.findReExportChains(graph)
      expect(chains).toEqual([])
    })

    it('returns empty for single-level re-exports', () => {
      const graph = buildGraph([
        { path: 'src/index.ts', source: `export { foo } from './source.js'` },
        { path: 'src/source.ts', source: `export function foo() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const chains = analyzer.findReExportChains(graph)
      expect(chains).toEqual([])
    })
  })

  describe('findBarrelBloat', () => {
    it('detects barrel files over threshold', () => {
      const reExports = Array.from({ length: 25 }, (_, i) => `export { mod${i} } from './mod${i}.js'`).join('\n')

      const builder = new ImportGraphBuilder()
      builder.addModule('src/index.ts', reExports)
      const graph = builder.resolve()
      const index = graph.modules.get('src/index.ts')!
      index.isBarrel = true

      const analyzer = new CrossFileAnalyzer()
      const issues = analyzer.findBarrelBloat(graph, 20)
      expect(issues.length).toBe(1)
      expect(issues[0]!.type).toBe('barrel-bloat')
    })

    it('returns empty when all below threshold', () => {
      const reExports = Array.from({ length: 10 }, (_, i) => `export { mod${i} } from './mod${i}.js'`).join('\n')

      const builder = new ImportGraphBuilder()
      builder.addModule('src/index.ts', reExports)
      const graph = builder.resolve()
      const index = graph.modules.get('src/index.ts')!
      index.isBarrel = true

      const analyzer = new CrossFileAnalyzer()
      const issues = analyzer.findBarrelBloat(graph, 20)
      expect(issues).toEqual([])
    })

    it('does not flag non-barrel files', () => {
      const graph = buildGraph([
        { path: 'src/utils.ts', source: `export function foo() {}\nexport function bar() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const issues = analyzer.findBarrelBloat(graph, 1)
      expect(issues).toEqual([])
    })
  })

  describe('findDeepImports', () => {
    it('detects deep imports with many path segments', () => {
      const graph = buildGraph([
        {
          path: 'src/main.ts',
          source: `import { foo } from './a/b/c/d/e/f.js'`,
        },
      ])

      const analyzer = new CrossFileAnalyzer()
      const issues = analyzer.findDeepImports(graph, 3)
      expect(issues.length).toBe(1)
      expect(issues[0]!.type).toBe('deep-import')
    })

    it('returns empty for shallow imports', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './utils.js'` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const issues = analyzer.findDeepImports(graph, 3)
      expect(issues).toEqual([])
    })

    it('ignores non-relative imports', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import React from 'react/sub/module/deep/path'` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const issues = analyzer.findDeepImports(graph, 3)
      expect(issues).toEqual([])
    })

    it('uses default maxDepth of 3', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './a/b/c/d.js'` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const issues = analyzer.findDeepImports(graph)
      expect(issues.length).toBe(1)
    })
  })

  describe('calculateCouplingMetrics', () => {
    it('calculates correct afferent/efferent coupling', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './utils.js'\nimport { bar } from './helpers.js'` },
        { path: 'src/utils.ts', source: `export function foo() {}` },
        { path: 'src/helpers.ts', source: `import { baz } from './lib.js'\nexport function bar() {}` },
        { path: 'src/lib.ts', source: `export function baz() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const metrics = analyzer.calculateCouplingMetrics(graph)

      const utilsMetrics = metrics.find((m) => m.filePath === 'src/utils.ts')!
      expect(utilsMetrics.afferentCoupling).toBe(1)
      expect(utilsMetrics.efferentCoupling).toBe(0)

      const mainMetrics = metrics.find((m) => m.filePath === 'src/main.ts')!
      expect(mainMetrics.afferentCoupling).toBe(0)
      expect(mainMetrics.efferentCoupling).toBe(2)
    })

    it('calculates instability correctly', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './utils.js'` },
        { path: 'src/utils.ts', source: `export function foo() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const metrics = analyzer.calculateCouplingMetrics(graph)

      const mainMetrics = metrics.find((m) => m.filePath === 'src/main.ts')!
      expect(mainMetrics.instability).toBe(1)

      const utilsMetrics = metrics.find((m) => m.filePath === 'src/utils.ts')!
      expect(utilsMetrics.instability).toBe(0)
    })

    it('calculates abstractness correctly', () => {
      const graph = buildGraph([
        {
          path: 'src/types.ts',
          source: `export interface IWidget { name: string }\nexport type WidgetType = 'a' | 'b'\nexport function create() {}`,
        },
      ])

      const analyzer = new CrossFileAnalyzer()
      const metrics = analyzer.calculateCouplingMetrics(graph)

      const typesMetrics = metrics.find((m) => m.filePath === 'src/types.ts')!
      expect(typesMetrics.abstractness).toBeCloseTo(2 / 3)
    })

    it('calculates distance correctly', () => {
      const graph = buildGraph([
        { path: 'src/a.ts', source: `export function foo() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const metrics = analyzer.calculateCouplingMetrics(graph)

      const aMetrics = metrics.find((m) => m.filePath === 'src/a.ts')!
      expect(aMetrics.distance).toBe(Math.abs(0 + 0 - 1))
    })

    it('handles modules with no dependencies', () => {
      const graph = buildGraph([
        { path: 'src/standalone.ts', source: `export const x = 1` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const metrics = analyzer.calculateCouplingMetrics(graph)
      const m = metrics[0]!

      expect(m.afferentCoupling).toBe(0)
      expect(m.efferentCoupling).toBe(0)
      expect(m.instability).toBe(0)
    })

    it('handles modules with no exports', () => {
      const graph = buildGraph([
        { path: 'src/consumer.ts', source: `import { foo } from './utils.js'` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const metrics = analyzer.calculateCouplingMetrics(graph)
      const m = metrics.find((m2) => m2.filePath === 'src/consumer.ts')!

      expect(m.abstractness).toBe(0)
    })
  })

  describe('analyzeImpact', () => {
    it('correctly identifies direct dependents', () => {
      const graph = buildGraph([
        { path: 'src/utils.ts', source: `export function foo() {}` },
        { path: 'src/a.ts', source: `import { foo } from './utils.js'` },
        { path: 'src/b.ts', source: `import { foo } from './utils.js'` },
        { path: 'src/unrelated.ts', source: `export const x = 1` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const impact = analyzer.analyzeImpact(graph, 'src/utils.ts')

      expect(impact.directlyAffected).toContain('src/a.ts')
      expect(impact.directlyAffected).toContain('src/b.ts')
      expect(impact.directlyAffected).not.toContain('src/unrelated.ts')
    })

    it('correctly identifies transitive dependents', () => {
      const graph = buildGraph([
        { path: 'src/lib.ts', source: `export function foo() {}` },
        { path: 'src/utils.ts', source: `import { foo } from './lib.js'\nexport function bar() {}` },
        { path: 'src/main.ts', source: `import { bar } from './utils.js'` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const impact = analyzer.analyzeImpact(graph, 'src/lib.ts')

      expect(impact.directlyAffected).toContain('src/utils.ts')
      expect(impact.transitivelyAffected).toContain('src/main.ts')
    })

    it('correctly identifies affected exports', () => {
      const graph = buildGraph([
        { path: 'src/utils.ts', source: `export function foo() {}\nexport function bar() {}` },
        { path: 'src/main.ts', source: `import { foo } from './utils.js'` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const impact = analyzer.analyzeImpact(graph, 'src/utils.ts')

      expect(impact.affectedExports).toContain('foo')
    })

    it('reports totalAffected count', () => {
      const graph = buildGraph([
        { path: 'src/lib.ts', source: `export function foo() {}` },
        { path: 'src/a.ts', source: `import { foo } from './lib.js'` },
        { path: 'src/b.ts', source: `import { foo } from './lib.js'` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const impact = analyzer.analyzeImpact(graph, 'src/lib.ts')

      expect(impact.totalAffected).toBe(2)
    })

    it('handles file with no dependents', () => {
      const graph = buildGraph([
        { path: 'src/standalone.ts', source: `export const x = 1` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const impact = analyzer.analyzeImpact(graph, 'src/standalone.ts')

      expect(impact.directlyAffected).toEqual([])
      expect(impact.transitivelyAffected).toEqual([])
      expect(impact.totalAffected).toBe(0)
    })
  })

  describe('analyze', () => {
    it('combines all analyses into result', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './utils.js'`, isEntryPoint: true },
        { path: 'src/utils.ts', source: `export function foo() {}\nexport function unused() {}` },
        { path: 'src/orphan.ts', source: `export const x = 1` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)

      expect(result.graph).toBe(graph)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.couplingMetrics.length).toBe(3)
      expect(result.orphanModules).toContain('src/orphan.ts')
      expect(result.summary.totalModules).toBe(3)
      expect(result.summary.issueCount).toBe(result.issues.length)
      expect(result.summary.orphanCount).toBe(1)
    })

    it('counts total imports and exports', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './a.js'\nimport { bar } from './b.js'` },
        { path: 'src/a.ts', source: `export function foo() {}` },
        { path: 'src/b.ts', source: `export function bar() {}\nexport function baz() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)

      expect(result.summary.totalImports).toBe(2)
      expect(result.summary.totalExports).toBe(3)
    })

    it('calculates average coupling', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './utils.js'` },
        { path: 'src/utils.ts', source: `export function foo() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)

      expect(result.summary.averageCoupling).toBeGreaterThanOrEqual(0)
    })

    it('handles graph with single module', () => {
      const graph = buildGraph([
        { path: 'src/standalone.ts', source: `export const x = 1` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)

      expect(result.summary.totalModules).toBe(1)
      expect(result.summary.totalImports).toBe(0)
      expect(result.summary.totalExports).toBe(1)
    })

    it('handles graph with no modules', () => {
      const graph = buildGraph([])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)

      expect(result.summary.totalModules).toBe(0)
      expect(result.summary.totalImports).toBe(0)
      expect(result.summary.totalExports).toBe(0)
      expect(result.issues).toEqual([])
      expect(result.couplingMetrics).toEqual([])
      expect(result.orphanModules).toEqual([])
    })
  })

  describe('formatReport', () => {
    it('produces readable string output', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './utils.js'`, isEntryPoint: true },
        { path: 'src/utils.ts', source: `export function foo() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)
      const report = analyzer.formatReport(result)

      expect(report).toContain('Cross-File Analysis Report')
      expect(report).toContain('Summary')
      expect(report).toContain('Total modules: 2')
      expect(report).toContain('Total imports: 1')
    })

    it('includes issues section when issues exist', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './utils.js'` },
        { path: 'src/utils.ts', source: `export function foo() {}\nexport function unused() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)
      const report = analyzer.formatReport(result)

      expect(report).toContain('Issues')
    })

    it('includes coupling section', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './utils.js'` },
        { path: 'src/utils.ts', source: `export function foo() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)
      const report = analyzer.formatReport(result)

      expect(report).toContain('Most Coupled Modules')
    })

    it('includes orphan modules section when orphans exist', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { foo } from './utils.js'`, isEntryPoint: true },
        { path: 'src/utils.ts', source: `export function foo() {}` },
        { path: 'src/orphan.ts', source: `export const x = 1` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)
      const report = analyzer.formatReport(result)

      expect(report).toContain('Orphan Modules')
      expect(report).toContain('src/orphan.ts')
    })

    it('handles empty graph', () => {
      const graph = buildGraph([])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)
      const report = analyzer.formatReport(result)

      expect(report).toContain('Total modules: 0')
      expect(report).toContain('Issues found: 0')
    })
  })

  describe('edge cases', () => {
    it('handles graph with single module', () => {
      const graph = buildGraph([
        { path: 'src/alone.ts', source: `export const x = 1` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)

      expect(result.summary.totalModules).toBe(1)
      expect(result.orphanModules).toEqual([])
      expect(result.couplingMetrics.length).toBe(1)
    })

    it('handles graph with no modules', () => {
      const graph = createEmptyImportGraph()
      const analyzer = new CrossFileAnalyzer()

      const dead = analyzer.findDeadModules(graph)
      expect(dead).toEqual([])

      const unused = analyzer.findUnusedExports(graph)
      expect(unused).toEqual([])

      const chains = analyzer.findReExportChains(graph)
      expect(chains).toEqual([])

      const bloat = analyzer.findBarrelBloat(graph)
      expect(bloat).toEqual([])

      const deep = analyzer.findDeepImports(graph)
      expect(deep).toEqual([])

      const metrics = analyzer.calculateCouplingMetrics(graph)
      expect(metrics).toEqual([])
    })

    it('handles analyzeImpact for unknown file', () => {
      const graph = buildGraph([
        { path: 'src/a.ts', source: `export const a = 1` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const impact = analyzer.analyzeImpact(graph, 'src/nonexistent.ts')

      expect(impact.changedFile).toBe('src/nonexistent.ts')
      expect(impact.directlyAffected).toEqual([])
      expect(impact.totalAffected).toBe(0)
    })

    it('handles self-referencing module', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import { foo } from './a.js'\nexport function foo() {}`)

      expect(() => builder.resolve()).not.toThrow()
    })

    it('handles module with many imports from same source', () => {
      const graph = buildGraph([
        { path: 'src/main.ts', source: `import { a } from './utils.js'\nimport { b } from './utils.js'` },
        { path: 'src/utils.ts', source: `export function a() {}\nexport function b() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)

      expect(result.summary.totalImports).toBe(2)
    })

    it('handles deeply nested transitive dependencies', () => {
      const graph = buildGraph([
        { path: 'src/a.ts', source: `import { b } from './b.js'`, isEntryPoint: true },
        { path: 'src/b.ts', source: `import { c } from './c.js'\nexport function b() {}` },
        { path: 'src/c.ts', source: `import { d } from './d.js'\nexport function c() {}` },
        { path: 'src/d.ts', source: `export function d() {}` },
      ])

      const analyzer = new CrossFileAnalyzer()
      const impact = analyzer.analyzeImpact(graph, 'src/d.ts')

      expect(impact.directlyAffected).toContain('src/c.ts')
      expect(impact.transitivelyAffected).toContain('src/b.ts')
      expect(impact.transitivelyAffected).toContain('src/a.ts')
    })
  })
})
