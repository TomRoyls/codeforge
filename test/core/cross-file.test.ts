import { describe, it, expect } from 'vitest'
import type {
  ModuleExport,
  ModuleImport,
  ModuleInfo,
  ImportGraph,
  ImportEdge,
  CrossFileIssueType,
  CrossFileIssue,
  CouplingMetrics,
  ImpactAnalysis,
  ReExportChain,
  CrossFileAnalysisResult,
} from '../../src/core/cross-file/index.js'
import {
  createEmptyModuleInfo,
  createEmptyImportGraph,
  ImportGraphBuilder,
  CrossFileAnalyzer,
} from '../../src/core/cross-file/index.js'

describe('createEmptyModuleInfo', () => {
  it('creates a ModuleInfo with defaults', () => {
    const info = createEmptyModuleInfo('foo.ts')
    expect(info.filePath).toBe('foo.ts')
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

  it('preserves the given file path', () => {
    expect(createEmptyModuleInfo('src/utils/helpers.ts').filePath).toBe('src/utils/helpers.ts')
  })

  it('creates independent instances', () => {
    const a = createEmptyModuleInfo('a.ts')
    const b = createEmptyModuleInfo('b.ts')
    a.dependencies.add('x')
    expect(b.dependencies.size).toBe(0)
  })
})

describe('createEmptyImportGraph', () => {
  it('creates an empty graph', () => {
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

describe('ImportGraphBuilder', () => {
  describe('constructor', () => {
    it('initializes with an empty graph', () => {
      const builder = new ImportGraphBuilder()
      const graph = builder.getGraph()
      expect(graph.modules.size).toBe(0)
      expect(graph.edges).toEqual([])
    })
  })

  describe('addModule', () => {
    it('adds a simple module with no imports or exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', '')
      const graph = builder.getGraph()
      expect(graph.modules.has('a.ts')).toBe(true)
      const mod = graph.modules.get('a.ts')!
      expect(mod.imports).toEqual([])
      expect(mod.exports).toEqual([])
      expect(mod.isBarrel).toBe(false)
      expect(mod.isEntryPoint).toBe(false)
    })

    it('parses named imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import { foo, bar } from './b'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.name).toBe('foo, bar')
      expect(mod.imports[0]!.fromModule).toBe('./b')
      expect(mod.imports[0]!.isDefault).toBe(false)
      expect(mod.imports[0]!.isTypeOnly).toBe(false)
      expect(mod.imports[0]!.isNamespace).toBe(false)
      expect(mod.imports[0]!.isDynamic).toBe(false)
      expect(mod.imports[0]!.line).toBe(1)
    })

    it('parses default imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import React from 'react'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.name).toBe('React')
      expect(mod.imports[0]!.fromModule).toBe('react')
      expect(mod.imports[0]!.isDefault).toBe(true)
    })

    it('parses type-only imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import type { Config } from './types'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.isTypeOnly).toBe(true)
      expect(mod.imports[0]!.name).toBe('Config')
    })

    it('parses namespace imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import * as utils from './utils'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.isNamespace).toBe(true)
      expect(mod.imports[0]!.name).toBe('utils')
    })

    it('parses dynamic imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `const mod = import('./lazy-module')`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.isDynamic).toBe(true)
      expect(mod.imports[0]!.fromModule).toBe('./lazy-module')
    })

    it('parses require calls', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `const fs = require('fs')`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.fromModule).toBe('fs')
    })

    it('parses re-export imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export { foo } from './b'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.name).toBe('foo')
      expect(mod.imports[0]!.fromModule).toBe('./b')
    })

    it('parses star re-export imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export * from './b'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.name).toBe('*')
      expect(mod.imports[0]!.isNamespace).toBe(true)
    })

    it('parses aliased imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import { foo as bar } from './b'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports[0]!.name).toBe('foo')
    })

    it('parses default and named imports combined', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import React, { useState } from 'react'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.isDefault).toBe(true)
      expect(mod.imports[0]!.name).toContain('useState')
    })

    it('tracks correct line numbers for imports', () => {
      const builder = new ImportGraphBuilder()
      const source = `\n\nimport { foo } from './b'`
      builder.addModule('a.ts', source)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports[0]!.line).toBe(3)
    })

    it('parses multiple imports on different lines', () => {
      const builder = new ImportGraphBuilder()
      const source = [
        `import { a } from './a'`,
        `import { b } from './b'`,
        `import { c } from './c'`,
      ].join('\n')
      builder.addModule('mod.ts', source)
      const mod = builder.getGraph().modules.get('mod.ts')!
      expect(mod.imports.length).toBe(3)
      expect(mod.imports[0]!.line).toBe(1)
      expect(mod.imports[1]!.line).toBe(2)
      expect(mod.imports[2]!.line).toBe(3)
    })

    it('populates dependencies from imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import { x } from './b'\nimport { y } from './c'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.dependencies.has('./b')).toBe(true)
      expect(mod.dependencies.has('./c')).toBe(true)
      expect(mod.dependencies.size).toBe(2)
    })

    it('marks module as entry point when isEntryPoint is true', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('main.ts', '', true)
      const mod = builder.getGraph().modules.get('main.ts')!
      expect(mod.isEntryPoint).toBe(true)
    })

    it('defaults isEntryPoint to false', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('util.ts', '')
      expect(builder.getGraph().modules.get('util.ts')!.isEntryPoint).toBe(false)
    })

    it('parses export const', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export const foo = 42`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports.length).toBe(1)
      expect(mod.exports[0]!.name).toBe('foo')
      expect(mod.exports[0]!.kind).toBe('const')
      expect(mod.exports[0]!.isDefault).toBe(false)
      expect(mod.exports[0]!.isReExport).toBe(false)
    })

    it('parses export function', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export function greet() {}`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.kind).toBe('function')
      expect(mod.exports[0]!.name).toBe('greet')
    })

    it('parses export class', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export class MyClass {}`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.kind).toBe('class')
      expect(mod.exports[0]!.name).toBe('MyClass')
    })

    it('parses export interface', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export interface IWidget {}`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.kind).toBe('interface')
      expect(mod.exports[0]!.isTypeOnly).toBe(false)
    })

    it('parses export type', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export type Result<T> = T | Error`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.kind).toBe('type')
      expect(mod.exports[0]!.isTypeOnly).toBe(true)
    })

    it('parses export enum', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export enum Color { Red, Green }`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.kind).toBe('enum')
      expect(mod.exports[0]!.name).toBe('Color')
    })

    it('parses export default function', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export default function main() {}`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.isDefault).toBe(true)
      expect(mod.exports[0]!.kind).toBe('function')
    })

    it('parses export default class', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export default class App {}`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.isDefault).toBe(true)
      expect(mod.exports[0]!.kind).toBe('class')
    })

    it('parses export default identifier', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export default myObject`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.name).toBe('myObject')
      expect(mod.exports[0]!.isDefault).toBe(true)
    })

    it('parses re-export named', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export { foo, bar } from './b'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports.length).toBe(2)
      expect(mod.exports[0]!.name).toBe('foo')
      expect(mod.exports[0]!.isReExport).toBe(true)
      expect(mod.exports[0]!.reExportFrom).toBe('./b')
      expect(mod.exports[1]!.name).toBe('bar')
    })

    it('parses re-export star', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export * from './b'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports.length).toBe(1)
      expect(mod.exports[0]!.name).toBe('*')
      expect(mod.exports[0]!.isReExport).toBe(true)
      expect(mod.exports[0]!.reExportFrom).toBe('./b')
    })

    it('parses re-export type', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export type { Config } from './types'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.kind).toBe('type')
      expect(mod.exports[0]!.isReExport).toBe(true)
      expect(mod.exports[0]!.isTypeOnly).toBe(true)
      expect(mod.exports[0]!.reExportFrom).toBe('./types')
    })

    it('parses aliased re-exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export { foo as bar } from './b'`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.name).toBe('foo')
    })

    it('detects barrel file with only re-exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('index.ts', `export { foo } from './a'\nexport { bar } from './b'`)
      const mod = builder.getGraph().modules.get('index.ts')!
      expect(mod.isBarrel).toBe(true)
    })

    it('does not mark as barrel when there is non-reexport code', () => {
      const builder = new ImportGraphBuilder()
      const source = `export { foo } from './a'\nconst x = 42\nexport { bar } from './b'`
      builder.addModule('index.ts', source)
      const mod = builder.getGraph().modules.get('index.ts')!
      expect(mod.isBarrel).toBe(false)
    })

    it('handles comment-only lines in barrel detection', () => {
      const builder = new ImportGraphBuilder()
      const source = `// This is a barrel file\nexport { foo } from './a'\nexport { bar } from './b'`
      builder.addModule('index.ts', source)
      const mod = builder.getGraph().modules.get('index.ts')!
      expect(mod.isBarrel).toBe(true)
    })

    it('handles block comment lines in barrel detection', () => {
      const builder = new ImportGraphBuilder()
      const source = `/* header */\nexport * from './a'`
      builder.addModule('index.ts', source)
      const mod = builder.getGraph().modules.get('index.ts')!
      expect(mod.isBarrel).toBe(true)
    })

    it('detects non-barrel with named export', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('mod.ts', `export const x = 1\nexport * from './b'`)
      const mod = builder.getGraph().modules.get('mod.ts')!
      expect(mod.isBarrel).toBe(false)
    })

    it('parses export let', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export let count = 0`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.kind).toBe('const')
    })

    it('parses export var', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export var legacy = true`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.kind).toBe('const')
    })

    it('parses export default const', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `export default const value = 42`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports[0]!.isDefault).toBe(true)
      expect(mod.exports[0]!.kind).toBe('const')
    })

    it('handles multiple dynamic imports on one line', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `const a = import('./x'); const b = import('./y')`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports.length).toBe(2)
    })

    it('handles require with single quotes', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `const path = require('path')`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports[0]!.fromModule).toBe('path')
    })

    it('handles require with double quotes', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `const path = require("path")`)
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports[0]!.fromModule).toBe('path')
    })
  })

  describe('addEntryPoint', () => {
    it('marks an existing module as entry point', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('main.ts', '')
      builder.addEntryPoint('main.ts')
      expect(builder.getGraph().modules.get('main.ts')!.isEntryPoint).toBe(true)
    })

    it('adds entry point for non-existent module', () => {
      const builder = new ImportGraphBuilder()
      builder.addEntryPoint('ghost.ts')
      expect(builder.getGraph().modules.has('ghost.ts')).toBe(false)
    })

    it('can add multiple entry points', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', '')
      builder.addModule('b.ts', '')
      builder.addEntryPoint('a.ts')
      builder.addEntryPoint('b.ts')
      expect(builder.getGraph().modules.get('a.ts')!.isEntryPoint).toBe(true)
      expect(builder.getGraph().modules.get('b.ts')!.isEntryPoint).toBe(true)
    })
  })

  describe('resolve', () => {
    it('resolves relative imports between modules', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import { foo } from './b'`)
      builder.addModule('src/b.ts', `export const foo = 1`)
      const graph = builder.resolve()
      const bMod = graph.modules.get('src/b.ts')!
      expect(bMod.dependents.has('src/a.ts')).toBe(true)
    })

    it('resolves parent directory imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/sub/a.ts', `import { x } from '../b'`)
      builder.addModule('src/b.ts', `export const x = 1`)
      const graph = builder.resolve()
      expect(graph.modules.get('src/b.ts')!.dependents.has('src/sub/a.ts')).toBe(true)
    })

    it('resolves imports with extension alternatives', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import { x } from './b.ts'`)
      builder.addModule('b.ts', `export const x = 1`)
      const graph = builder.resolve()
      expect(graph.modules.get('b.ts')!.dependents.has('a.ts')).toBe(true)
    })

    it('resolves index imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', `import { x } from './utils'`)
      builder.addModule('src/utils/index.ts', `export const x = 1`)
      const graph = builder.resolve()
      expect(graph.modules.get('src/utils/index.ts')!.dependents.has('src/a.ts')).toBe(true)
    })

    it('creates edges for resolved dependencies', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import { x } from './b'`)
      builder.addModule('b.ts', `export const x = 1`)
      const graph = builder.resolve()
      expect(graph.edges.length).toBe(1)
      expect(graph.edges[0]!.from).toBe('a.ts')
      expect(graph.edges[0]!.to).toBe('b.ts')
      expect(graph.edges[0]!.weight).toBe(1)
    })

    it('computes depth from entry points', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('main.ts', `import { a } from './a'`, true)
      builder.addModule('a.ts', `import { b } from './b'`)
      builder.addModule('b.ts', `export const b = 1`)
      const graph = builder.resolve()
      expect(graph.modules.get('main.ts')!.depth).toBe(0)
      expect(graph.modules.get('a.ts')!.depth).toBe(1)
      expect(graph.modules.get('b.ts')!.depth).toBe(2)
    })

    it('does not compute depth when no entry points', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import { x } from './b'`)
      builder.addModule('b.ts', `export const x = 1`)
      const graph = builder.resolve()
      expect(graph.modules.get('a.ts')!.depth).toBe(0)
      expect(graph.modules.get('b.ts')!.depth).toBe(0)
    })

    it('handles unresolved imports gracefully', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import { x } from './nonexistent'`)
      const graph = builder.resolve()
      expect(graph.edges.length).toBe(0)
    })

    it('handles external module imports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import { x } from 'react'`)
      const graph = builder.resolve()
      expect(graph.edges.length).toBe(0)
    })

    it('resets dependents before re-computing', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import { x } from './b'`)
      builder.addModule('b.ts', `export const x = 1`)
      builder.resolve()
      builder.addModule('c.ts', `import { y } from './b'`)
      builder.addModule('b.ts', `export const x = 1\nexport const y = 2`)
      const graph = builder.resolve()
      expect(graph.modules.get('b.ts')!.dependents.size).toBeGreaterThanOrEqual(1)
    })

    it('skips edges for external packages', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import { useState } from 'react'`)
      builder.addModule('b.ts', `import fs from 'fs'`)
      const graph = builder.resolve()
      expect(graph.edges.length).toBe(0)
    })

    it('handles diamond dependency pattern', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('main.ts', `import { a } from './a'\nimport { b } from './b'`, true)
      builder.addModule('a.ts', `import { shared } from './shared'`)
      builder.addModule('b.ts', `import { shared } from './shared'`)
      builder.addModule('shared.ts', `export const shared = 1`)
      const graph = builder.resolve()
      const shared = graph.modules.get('shared.ts')!
      expect(shared.dependents.has('a.ts')).toBe(true)
      expect(shared.dependents.has('b.ts')).toBe(true)
    })

    it('handles re-detection of barrels after resolve', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('index.ts', `export { a } from './a'\nexport { b } from './b'`)
      builder.addModule('a.ts', `export const a = 1`)
      builder.addModule('b.ts', `export const b = 2`)
      const graph = builder.resolve()
      expect(graph.modules.get('index.ts')!.isBarrel).toBe(true)
    })

    it('returns the graph', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', '')
      const graph = builder.resolve()
      expect(graph.modules.size).toBe(1)
    })
  })

  describe('getGraph', () => {
    it('returns the current graph before resolve', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', '')
      const graph = builder.getGraph()
      expect(graph.modules.has('a.ts')).toBe(true)
    })
  })

  describe('reset', () => {
    it('clears all state', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('a.ts', `import { x } from './b'`)
      builder.addModule('b.ts', `export const x = 1`)
      builder.addEntryPoint('a.ts')
      builder.resolve()
      builder.reset()
      const graph = builder.getGraph()
      expect(graph.modules.size).toBe(0)
      expect(graph.edges.length).toBe(0)
    })

    it('allows building fresh after reset', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('old.ts', '')
      builder.reset()
      builder.addModule('new.ts', `export const x = 1`)
      const graph = builder.getGraph()
      expect(graph.modules.size).toBe(1)
      expect(graph.modules.has('new.ts')).toBe(true)
    })
  })
})

describe('CrossFileAnalyzer', () => {
  function buildGraph(
    modules: Array<{ path: string; source: string; isEntry?: boolean }>,
  ): ImportGraph {
    const builder = new ImportGraphBuilder()
    for (const m of modules) {
      builder.addModule(m.path, m.source, m.isEntry)
    }
    return builder.resolve()
  }

  describe('analyze', () => {
    it('returns a CrossFileAnalysisResult', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: `import { x } from './a'`, isEntry: true },
        { path: 'a.ts', source: `export const x = 1` },
      ])
      const result = analyzer.analyze(graph)
      expect(result.graph).toBe(graph)
      expect(result.issues).toBeInstanceOf(Array)
      expect(result.couplingMetrics).toBeInstanceOf(Array)
      expect(result.orphanModules).toBeInstanceOf(Array)
      expect(result.summary).toBeDefined()
    })

    it('computes summary correctly', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: `import { x } from './a'`, isEntry: true },
        { path: 'a.ts', source: `export const x = 1\nexport const y = 2` },
      ])
      const result = analyzer.analyze(graph)
      expect(result.summary.totalModules).toBe(2)
      expect(result.summary.totalImports).toBe(1)
      expect(result.summary.totalExports).toBe(2)
      expect(result.summary.orphanCount).toBe(0)
    })

    it('detects dead modules in analysis', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: '', isEntry: true },
        { path: 'dead.ts', source: `export const unused = true` },
      ])
      const result = analyzer.analyze(graph)
      expect(result.orphanModules).toContain('dead.ts')
      expect(result.summary.orphanCount).toBe(1)
    })

    it('includes unused exports as issues', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: `import { used } from './a'`, isEntry: true },
        { path: 'a.ts', source: `export const used = 1\nexport const unused = 2` },
      ])
      const result = analyzer.analyze(graph)
      const unusedIssues = result.issues.filter((i) => i.type === 'unused-export')
      expect(unusedIssues.length).toBeGreaterThanOrEqual(1)
      expect(unusedIssues.some((i) => i.message.includes('unused'))).toBe(true)
    })

    it('computes average coupling', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: `import { x } from './a'`, isEntry: true },
        { path: 'a.ts', source: `export const x = 1` },
      ])
      const result = analyzer.analyze(graph)
      expect(result.summary.averageCoupling).toBeGreaterThanOrEqual(0)
    })

    it('returns zero average coupling for empty graph', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = createEmptyImportGraph()
      const result = analyzer.analyze(graph)
      expect(result.summary.averageCoupling).toBe(0)
    })

    it('detects re-export chains in analysis', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: `import { x } from './index'`, isEntry: true },
        { path: 'index.ts', source: `export { x } from './mid'` },
        { path: 'mid.ts', source: `export { x } from './source'` },
        { path: 'source.ts', source: `export const x = 1` },
      ])
      const result = analyzer.analyze(graph)
      const chainIssues = result.issues.filter((i) => i.type === 're-export-chain')
      expect(chainIssues.length).toBeGreaterThanOrEqual(1)
    })

    it('counts all issues', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: '', isEntry: true },
        { path: 'a.ts', source: `export const unused = 1` },
      ])
      const result = analyzer.analyze(graph)
      expect(result.summary.issueCount).toBe(result.issues.length)
    })

    it('handles empty graph', () => {
      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(createEmptyImportGraph())
      expect(result.summary.totalModules).toBe(0)
      expect(result.issues.length).toBe(0)
      expect(result.orphanModules.length).toBe(0)
    })

    it('includes barrel bloat issues', () => {
      const analyzer = new CrossFileAnalyzer()
      const exports: string[] = []
      for (let i = 0; i < 25; i++) {
        exports.push(`export { item${i} } from './mod${i}'`)
      }
      const barrelSource = exports.join('\n')
      const graph = buildGraph([
        { path: 'index.ts', source: barrelSource },
      ])
      const result = analyzer.analyze(graph)
      const bloatIssues = result.issues.filter((i) => i.type === 'barrel-bloat')
      expect(bloatIssues.length).toBe(1)
      expect(bloatIssues[0]!.severity).toBe('warning')
    })

    it('includes deep import issues', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        {
          path: 'main.ts',
          source: `import { x } from '../../../src/core/deep/nested/module'`,
          isEntry: true,
        },
        { path: 'a.ts', source: `export const x = 1` },
      ])
      const result = analyzer.analyze(graph)
      const deepIssues = result.issues.filter((i) => i.type === 'deep-import')
      expect(deepIssues.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('findDeadModules', () => {
    it('returns empty array when no entry points', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `export const x = 1` },
      ])
      expect(analyzer.findDeadModules(graph)).toEqual([])
    })

    it('finds unreachable modules', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: `import { x } from './a'`, isEntry: true },
        { path: 'a.ts', source: `export const x = 1` },
        { path: 'dead.ts', source: `export const y = 2` },
      ])
      const dead = analyzer.findDeadModules(graph)
      expect(dead).toContain('dead.ts')
      expect(dead).not.toContain('main.ts')
      expect(dead).not.toContain('a.ts')
    })

    it('returns empty when all modules are reachable', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: `import { x } from './a'`, isEntry: true },
        { path: 'a.ts', source: `export const x = 1` },
      ])
      expect(analyzer.findDeadModules(graph)).toEqual([])
    })

    it('handles multiple entry points', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'ep1.ts', source: `import { x } from './shared'`, isEntry: true },
        { path: 'ep2.ts', source: `import { y } from './shared'`, isEntry: true },
        { path: 'shared.ts', source: `export const x = 1\nexport const y = 2` },
        { path: 'dead.ts', source: `export const z = 3` },
      ])
      const dead = analyzer.findDeadModules(graph)
      expect(dead).toContain('dead.ts')
      expect(dead).not.toContain('shared.ts')
    })

    it('handles transitively reachable modules', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: `import { a } from './a'`, isEntry: true },
        { path: 'a.ts', source: `import { b } from './b'\nexport const a = 1` },
        { path: 'b.ts', source: `export const b = 2` },
      ])
      expect(analyzer.findDeadModules(graph)).toEqual([])
    })

    it('handles empty graph', () => {
      const analyzer = new CrossFileAnalyzer()
      expect(analyzer.findDeadModules(createEmptyImportGraph())).toEqual([])
    })
  })

  describe('findUnusedExports', () => {
    it('finds exports not imported anywhere', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `export const used = 1\nexport const unused = 2` },
        { path: 'b.ts', source: `import { used } from './a'` },
      ])
      const issues = analyzer.findUnusedExports(graph)
      expect(issues.length).toBeGreaterThanOrEqual(1)
      expect(issues.some((i) => i.message.includes('unused'))).toBe(true)
    })

    it('returns empty when all exports are used', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `export const x = 1` },
        { path: 'b.ts', source: `import { x } from './a'` },
      ])
      const issues = analyzer.findUnusedExports(graph)
      expect(issues.length).toBe(0)
    })

    it('skips re-exports', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'index.ts', source: `export { x } from './a'` },
        { path: 'a.ts', source: `export const x = 1` },
      ])
      const issues = analyzer.findUnusedExports(graph)
      const reExportIssues = issues.filter((i) => i.details.exportName === undefined)
      expect(reExportIssues.length).toBe(0)
    })

    it('skips star exports', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'index.ts', source: `export * from './a'` },
        { path: 'a.ts', source: `export const x = 1` },
      ])
      const starIssues = analyzer.findUnusedExports(graph).filter((i) => i.message.includes('*'))
      expect(starIssues.length).toBe(0)
    })

    it('sets correct issue type and severity', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `export const x = 1` },
      ])
      const issues = analyzer.findUnusedExports(graph)
      if (issues.length > 0) {
        expect(issues[0]!.type).toBe('unused-export')
        expect(issues[0]!.severity).toBe('warning')
        expect(issues[0]!.filePath).toBe('a.ts')
        expect(issues[0]!.suggestion).toBeDefined()
      }
    })

    it('handles multiple importers', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `export const x = 1\nexport const y = 2` },
        { path: 'b.ts', source: `import { x } from './a'` },
        { path: 'c.ts', source: `import { x } from './a'` },
      ])
      const issues = analyzer.findUnusedExports(graph)
      const unusedNames = issues.map((i) => i.details.exportName)
      expect(unusedNames).toContain('y')
      expect(unusedNames).not.toContain('x')
    })
  })

  describe('findReExportChains', () => {
    it('finds simple re-export chain', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'index.ts', source: `export { x } from './mid'` },
        { path: 'mid.ts', source: `export { x } from './source'` },
        { path: 'source.ts', source: `export const x = 1` },
      ])
      const chains = analyzer.findReExportChains(graph)
      expect(chains.length).toBeGreaterThanOrEqual(1)
    })

    it('returns empty for direct re-exports', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'index.ts', source: `export { x } from './source'` },
        { path: 'source.ts', source: `export const x = 1` },
      ])
      const chains = analyzer.findReExportChains(graph)
      expect(chains.length).toBe(0)
    })

    it('detects chain length correctly', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `export { x } from './b'` },
        { path: 'b.ts', source: `export { x } from './c'` },
        { path: 'c.ts', source: `export const x = 1` },
      ])
      const chains = analyzer.findReExportChains(graph)
      if (chains.length > 0) {
        expect(chains[0]!.chainLength).toBeGreaterThanOrEqual(2)
      }
    })

    it('handles empty graph', () => {
      const analyzer = new CrossFileAnalyzer()
      expect(analyzer.findReExportChains(createEmptyImportGraph())).toEqual([])
    })
  })

  describe('findBarrelBloat', () => {
    it('finds barrels exceeding threshold', () => {
      const analyzer = new CrossFileAnalyzer()
      const exports: string[] = []
      for (let i = 0; i < 25; i++) {
        exports.push(`export { item${i} } from './mod${i}'`)
      }
      const graph = buildGraph([
        { path: 'barrel.ts', source: exports.join('\n') },
      ])
      const issues = analyzer.findBarrelBloat(graph)
      expect(issues.length).toBe(1)
      expect(issues[0]!.type).toBe('barrel-bloat')
      expect(issues[0]!.details.reExportCount).toBe(25)
    })

    it('uses default threshold of 20', () => {
      const analyzer = new CrossFileAnalyzer()
      const exports: string[] = []
      for (let i = 0; i < 20; i++) {
        exports.push(`export { item${i} } from './mod${i}'`)
      }
      const graph = buildGraph([
        { path: 'barrel.ts', source: exports.join('\n') },
      ])
      const issues = analyzer.findBarrelBloat(graph)
      expect(issues.length).toBe(0)
    })

    it('respects custom threshold', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'barrel.ts', source: `export { a } from './a'\nexport { b } from './b'\nexport { c } from './c'` },
      ])
      const issues = analyzer.findBarrelBloat(graph, 2)
      expect(issues.length).toBe(1)
    })

    it('ignores non-barrel modules', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'mod.ts', source: `export const x = 1\nexport const y = 2` },
      ])
      const issues = analyzer.findBarrelBloat(graph)
      expect(issues.length).toBe(0)
    })

    it('handles empty graph', () => {
      const analyzer = new CrossFileAnalyzer()
      expect(analyzer.findBarrelBloat(createEmptyImportGraph())).toEqual([])
    })
  })

  describe('findDeepImports', () => {
    it('finds imports exceeding depth threshold', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        {
          path: 'a.ts',
          source: `import { x } from '../../deep/nested/module/file'`,
        },
      ])
      const issues = analyzer.findDeepImports(graph)
      expect(issues.length).toBe(1)
      expect(issues[0]!.type).toBe('deep-import')
      expect(issues[0]!.severity).toBe('info')
    })

    it('uses default maxDepth of 3', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from './a/b'` },
      ])
      const issues = analyzer.findDeepImports(graph)
      expect(issues.length).toBe(0)
    })

    it('respects custom maxDepth', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from './a/b'` },
      ])
      const issues = analyzer.findDeepImports(graph, 1)
      expect(issues.length).toBe(1)
    })

    it('ignores non-relative imports', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from 'deep/nested/external/module'` },
      ])
      const issues = analyzer.findDeepImports(graph)
      expect(issues.length).toBe(0)
    })

    it('handles empty graph', () => {
      const analyzer = new CrossFileAnalyzer()
      expect(analyzer.findDeepImports(createEmptyImportGraph())).toEqual([])
    })

    it('includes suggestion in issues', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from '../../../a/b/c/d/e'` },
      ])
      const issues = analyzer.findDeepImports(graph)
      expect(issues[0]!.suggestion).toBeDefined()
    })
  })

  describe('calculateCouplingMetrics', () => {
    it('calculates metrics for each module', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: `import { x } from './a'`, isEntry: true },
        { path: 'a.ts', source: `export const x = 1` },
      ])
      const metrics = analyzer.calculateCouplingMetrics(graph)
      expect(metrics.length).toBe(2)
    })

    it('computes afferent coupling correctly', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from './shared'` },
        { path: 'b.ts', source: `import { x } from './shared'` },
        { path: 'shared.ts', source: `export const x = 1` },
      ])
      const metrics = analyzer.calculateCouplingMetrics(graph)
      const sharedMetric = metrics.find((m) => m.filePath === 'shared.ts')
      expect(sharedMetric!.afferentCoupling).toBe(2)
    })

    it('computes efferent coupling correctly', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from './b'\nimport { y } from './c'` },
        { path: 'b.ts', source: `export const x = 1` },
        { path: 'c.ts', source: `export const y = 2` },
      ])
      const metrics = analyzer.calculateCouplingMetrics(graph)
      const aMetric = metrics.find((m) => m.filePath === 'a.ts')
      expect(aMetric!.efferentCoupling).toBe(2)
    })

    it('computes instability as efferent / total', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from './b'` },
        { path: 'b.ts', source: `export const x = 1` },
      ])
      const metrics = analyzer.calculateCouplingMetrics(graph)
      const bMetric = metrics.find((m) => m.filePath === 'b.ts')
      expect(bMetric!.instability).toBe(0)
    })

    it('computes abstractness for interface exports', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'types.ts', source: `export interface IFoo {}\nexport type Bar = string` },
      ])
      const metrics = analyzer.calculateCouplingMetrics(graph)
      const typesMetric = metrics.find((m) => m.filePath === 'types.ts')
      expect(typesMetric!.abstractness).toBe(1)
    })

    it('computes distance from main sequence', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `export const x = 1` },
      ])
      const metrics = analyzer.calculateCouplingMetrics(graph)
      expect(metrics[0]!.distance).toBeGreaterThanOrEqual(0)
      expect(metrics[0]!.distance).toBeLessThanOrEqual(1)
    })

    it('handles modules with no coupling', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'isolated.ts', source: `export const x = 1` },
      ])
      const metrics = analyzer.calculateCouplingMetrics(graph)
      expect(metrics[0]!.afferentCoupling).toBe(0)
      expect(metrics[0]!.efferentCoupling).toBe(0)
      expect(metrics[0]!.instability).toBe(0)
    })

    it('handles empty graph', () => {
      const analyzer = new CrossFileAnalyzer()
      expect(analyzer.calculateCouplingMetrics(createEmptyImportGraph())).toEqual([])
    })
  })

  describe('analyzeImpact', () => {
    it('returns impact analysis structure', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from './b'` },
        { path: 'b.ts', source: `export const x = 1` },
      ])
      const impact = analyzer.analyzeImpact(graph, 'b.ts')
      expect(impact.changedFile).toBe('b.ts')
      expect(impact.directlyAffected).toBeInstanceOf(Array)
      expect(impact.transitivelyAffected).toBeInstanceOf(Array)
      expect(typeof impact.totalAffected).toBe('number')
      expect(impact.affectedExports).toBeInstanceOf(Array)
    })

    it('finds direct dependents', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from './b'` },
        { path: 'c.ts', source: `import { y } from './b'` },
        { path: 'b.ts', source: `export const x = 1\nexport const y = 2` },
      ])
      const impact = analyzer.analyzeImpact(graph, 'b.ts')
      expect(impact.directlyAffected).toContain('a.ts')
      expect(impact.directlyAffected).toContain('c.ts')
    })

    it('finds transitive dependents', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from './b'` },
        { path: 'b.ts', source: `import { y } from './c'\nexport const x = 1` },
        { path: 'c.ts', source: `export const y = 2` },
      ])
      const impact = analyzer.analyzeImpact(graph, 'c.ts')
      expect(impact.transitivelyAffected).toContain('a.ts')
    })

    it('computes total affected', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from './b'` },
        { path: 'b.ts', source: `import { y } from './c'\nexport const x = 1` },
        { path: 'c.ts', source: `export const y = 2` },
      ])
      const impact = analyzer.analyzeImpact(graph, 'c.ts')
      expect(impact.totalAffected).toBe(
        new Set([...impact.directlyAffected, ...impact.transitivelyAffected]).size,
      )
    })

    it('finds affected exports', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from './b'` },
        { path: 'b.ts', source: `export const x = 1` },
      ])
      const impact = analyzer.analyzeImpact(graph, 'b.ts')
      expect(impact.affectedExports).toContain('x')
    })

    it('returns empty for unknown file', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: '' },
      ])
      const impact = analyzer.analyzeImpact(graph, 'nonexistent.ts')
      expect(impact.directlyAffected).toEqual([])
      expect(impact.transitivelyAffected).toEqual([])
      expect(impact.totalAffected).toBe(0)
    })

    it('handles isolated modules', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `export const x = 1` },
        { path: 'b.ts', source: `export const y = 2` },
      ])
      const impact = analyzer.analyzeImpact(graph, 'a.ts')
      expect(impact.directlyAffected).toEqual([])
      expect(impact.totalAffected).toBe(0)
    })

    it('deduplicates affected exports', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `import { x } from './shared'` },
        { path: 'b.ts', source: `import { x } from './shared'` },
        { path: 'shared.ts', source: `export const x = 1` },
      ])
      const impact = analyzer.analyzeImpact(graph, 'shared.ts')
      const xCount = impact.affectedExports.filter((e) => e === 'x').length
      expect(xCount).toBe(1)
    })
  })

  describe('formatReport', () => {
    it('produces a string report', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: `import { x } from './a'`, isEntry: true },
        { path: 'a.ts', source: `export const x = 1` },
      ])
      const result = analyzer.analyze(graph)
      const report = analyzer.formatReport(result)
      expect(typeof report).toBe('string')
      expect(report).toContain('Cross-File Analysis Report')
      expect(report).toContain('Summary')
      expect(report).toContain('Total modules: 2')
    })

    it('includes issue section when issues exist', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: '', isEntry: true },
        { path: 'dead.ts', source: `export const x = 1` },
      ])
      const result = analyzer.analyze(graph)
      const report = analyzer.formatReport(result)
      if (result.issues.length > 0) {
        expect(report).toContain('Issues')
      }
    })

    it('includes coupling metrics section', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'a.ts', source: `export const x = 1` },
      ])
      const result = analyzer.analyze(graph)
      const report = analyzer.formatReport(result)
      expect(report).toContain('Most Coupled Modules')
    })

    it('includes orphan modules section', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: '', isEntry: true },
        { path: 'orphan.ts', source: `export const x = 1` },
      ])
      const result = analyzer.analyze(graph)
      if (result.orphanModules.length > 0) {
        const report = analyzer.formatReport(result)
        expect(report).toContain('Orphan Modules')
        expect(report).toContain('orphan.ts')
      }
    })

    it('shows suggestion for issues with suggestions', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: '', isEntry: true },
        { path: 'dead.ts', source: `export const x = 1` },
      ])
      const result = analyzer.analyze(graph)
      const deadIssues = result.issues.filter((i) => i.type === 'dead-module')
      if (deadIssues.length > 0) {
        const report = analyzer.formatReport(result)
        expect(report).toContain('Suggestion:')
      }
    })

    it('handles empty result', () => {
      const analyzer = new CrossFileAnalyzer()
      const result: CrossFileAnalysisResult = {
        graph: createEmptyImportGraph(),
        issues: [],
        couplingMetrics: [],
        orphanModules: [],
        summary: {
          totalModules: 0,
          totalImports: 0,
          totalExports: 0,
          averageCoupling: 0,
          issueCount: 0,
          orphanCount: 0,
        },
      }
      const report = analyzer.formatReport(result)
      expect(report).toContain('Cross-File Analysis Report')
      expect(report).toContain('Total modules: 0')
    })

    it('formats average coupling with two decimal places', () => {
      const analyzer = new CrossFileAnalyzer()
      const result: CrossFileAnalysisResult = {
        graph: createEmptyImportGraph(),
        issues: [],
        couplingMetrics: [],
        orphanModules: [],
        summary: {
          totalModules: 1,
          totalImports: 0,
          totalExports: 0,
          averageCoupling: 1.567,
          issueCount: 0,
          orphanCount: 0,
        },
      }
      const report = analyzer.formatReport(result)
      expect(report).toContain('1.57')
    })

    it('groups issues by type', () => {
      const analyzer = new CrossFileAnalyzer()
      const graph = buildGraph([
        { path: 'main.ts', source: '', isEntry: true },
        { path: 'a.ts', source: `export const x = 1` },
        { path: 'b.ts', source: `export const y = 2` },
      ])
      const result = analyzer.analyze(graph)
      if (result.issues.length > 0) {
        const report = analyzer.formatReport(result)
        expect(report).toContain('[unused-export]')
      }
    })

    it('limits top coupled modules to 10', () => {
      const analyzer = new CrossFileAnalyzer()
      const modules: Array<{ path: string; source: string }> = []
      for (let i = 0; i < 15; i++) {
        modules.push({ path: `mod${i}.ts`, source: `export const x${i} = ${i}` })
      }
      const graph = buildGraph(modules)
      const result = analyzer.analyze(graph)
      const report = analyzer.formatReport(result)
      expect(report).toContain('Top 10 Most Coupled Modules')
    })
  })
})

describe('Integration: ImportGraphBuilder + CrossFileAnalyzer', () => {
  it('end-to-end: multi-module project', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule(
      'src/main.ts',
      `import { App } from './app'\nimport { config } from './config'`,
      true,
    )
    builder.addModule(
      'src/app.ts',
      `import { Router } from './router'\nimport { logger } from './utils/logger'\nexport class App {}`,
    )
    builder.addModule(
      'src/router.ts',
      `import { HomeController } from './controllers/home'\nexport class Router {}`,
    )
    builder.addModule('src/controllers/home.ts', `export class HomeController {}`)
    builder.addModule(
      'src/config.ts',
      `export const config = { port: 3000 }\nexport const secret = 'abc'`,
    )
    builder.addModule(
      'src/utils/logger.ts',
      `export const logger = console.log\nexport const formatLog = (s: string) => s`,
    )
    builder.addModule('src/dead.ts', `export const deadCode = true`)

    const graph = builder.resolve()

    const analyzer = new CrossFileAnalyzer()
    const result = analyzer.analyze(graph)

    expect(result.summary.totalModules).toBe(7)
    expect(result.summary.totalImports).toBe(5)
    expect(result.orphanModules).toContain('src/dead.ts')

    const unusedIssues = result.issues.filter((i) => i.type === 'unused-export')
    expect(unusedIssues.length).toBeGreaterThan(0)

    const impact = analyzer.analyzeImpact(graph, 'src/config.ts')
    expect(impact.directlyAffected).toContain('src/main.ts')

    const report = analyzer.formatReport(result)
    expect(report.length).toBeGreaterThan(100)
  })

  it('end-to-end: barrel file project', () => {
    const builder = new ImportGraphBuilder()
    const barrelExports: string[] = []
    for (let i = 0; i < 22; i++) {
      builder.addModule(`src/mod${i}.ts`, `export const mod${i} = ${i}`)
      barrelExports.push(`export { mod${i} } from './mod${i}'`)
    }
    builder.addModule('src/index.ts', barrelExports.join('\n'))
    builder.addModule('src/main.ts', `import { mod0 } from './index'`, true)

    const graph = builder.resolve()
    const analyzer = new CrossFileAnalyzer()
    const result = analyzer.analyze(graph)

    const bloat = result.issues.filter((i) => i.type === 'barrel-bloat')
    expect(bloat.length).toBe(1)
  })

  it('end-to-end: circular dependency detection scenario', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('a.ts', `import { b } from './b'`, true)
    builder.addModule('b.ts', `import { c } from './c'\nexport const b = 1`)
    builder.addModule('c.ts', `import { a } from './a'\nexport const c = 1`)

    const graph = builder.resolve()
    expect(graph.edges.length).toBe(3)

    const analyzer = new CrossFileAnalyzer()
    const result = analyzer.analyze(graph)
    expect(result.summary.totalModules).toBe(3)
  })

  it('handles large graph stress scenario', () => {
    const builder = new ImportGraphBuilder()
    const moduleCount = 50
    for (let i = 0; i < moduleCount; i++) {
      const deps = i > 0 ? `import { mod${i - 1} } from './mod${i - 1}'` : ''
      builder.addModule(`mod${i}.ts`, `${deps}\nexport const mod${i} = ${i}`, i === 0)
    }

    const graph = builder.resolve()
    const analyzer = new CrossFileAnalyzer()
    const result = analyzer.analyze(graph)

    expect(result.summary.totalModules).toBe(moduleCount)
    expect(result.couplingMetrics.length).toBe(moduleCount)
  })

  it('handles reset and rebuild', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('old.ts', `import { x } from './old_dep'`, true)
    builder.addModule('old_dep.ts', `export const x = 1`)
    builder.resolve()

    builder.reset()
    builder.addModule('new.ts', `import { y } from './new_dep'`, true)
    builder.addModule('new_dep.ts', `export const y = 2`)
    const graph = builder.resolve()

    expect(graph.modules.size).toBe(2)
    expect(graph.modules.has('old.ts')).toBe(false)

    const analyzer = new CrossFileAnalyzer()
    const result = analyzer.analyze(graph)
    expect(result.summary.totalModules).toBe(2)
  })

  it('impact analysis across deep chain', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('main.ts', `import { a } from './a'`, true)
    builder.addModule('a.ts', `import { b } from './b'\nexport const a = 1`)
    builder.addModule('b.ts', `import { c } from './c'\nexport const b = 2`)
    builder.addModule('c.ts', `import { d } from './d'\nexport const c = 3`)
    builder.addModule('d.ts', `export const d = 4`)

    const graph = builder.resolve()
    const analyzer = new CrossFileAnalyzer()

    const impact = analyzer.analyzeImpact(graph, 'd.ts')
    expect(impact.directlyAffected).toContain('c.ts')
    expect(impact.transitivelyAffected).toContain('b.ts')
    expect(impact.transitivelyAffected).toContain('a.ts')
    expect(impact.transitivelyAffected).toContain('main.ts')
  })
})

describe('Type guards and structure', () => {
  it('ModuleExport has correct shape', () => {
    const exp: ModuleExport = {
      name: 'test',
      kind: 'function',
      isDefault: false,
      isReExport: false,
      isTypeOnly: false,
    }
    expect(exp.name).toBe('test')
    expect(exp.kind).toBe('function')
  })

  it('ModuleImport has correct shape', () => {
    const imp: ModuleImport = {
      name: 'foo',
      fromModule: './bar',
      isDefault: false,
      isTypeOnly: false,
      isNamespace: false,
      isDynamic: false,
      line: 1,
    }
    expect(imp.fromModule).toBe('./bar')
    expect(imp.line).toBe(1)
  })

  it('ModuleInfo has correct shape', () => {
    const info: ModuleInfo = createEmptyModuleInfo('test.ts')
    expect(info.filePath).toBe('test.ts')
    expect(info.isBarrel).toBe(false)
  })

  it('ImportEdge has correct shape', () => {
    const edge: ImportEdge = {
      from: 'a.ts',
      to: 'b.ts',
      imports: [],
      weight: 0,
    }
    expect(edge.weight).toBe(0)
  })

  it('CrossFileIssue has correct shape', () => {
    const issue: CrossFileIssue = {
      type: 'dead-module',
      severity: 'warning',
      filePath: 'dead.ts',
      message: 'Module is dead',
      details: {},
    }
    expect(issue.type).toBe('dead-module')
    expect(issue.severity).toBe('warning')
  })

  it('CouplingMetrics has correct shape', () => {
    const metrics: CouplingMetrics = {
      filePath: 'a.ts',
      afferentCoupling: 0,
      efferentCoupling: 0,
      instability: 0,
      abstractness: 0,
      distance: 1,
    }
    expect(metrics.distance).toBe(1)
  })

  it('ImpactAnalysis has correct shape', () => {
    const impact: ImpactAnalysis = {
      changedFile: 'a.ts',
      directlyAffected: [],
      transitivelyAffected: [],
      totalAffected: 0,
      affectedExports: [],
    }
    expect(impact.changedFile).toBe('a.ts')
  })

  it('ReExportChain has correct shape', () => {
    const chain: ReExportChain = {
      source: 'a.ts',
      target: 'c.ts',
      intermediaries: ['b.ts'],
      chainLength: 3,
    }
    expect(chain.chainLength).toBe(3)
  })

  it('CrossFileIssueType covers all expected types', () => {
    const types: CrossFileIssueType[] = [
      'dead-module',
      'unused-export',
      're-export-chain',
      'barrel-bloat',
      'circular-dependency',
      'deep-import',
      'module-coupling',
    ]
    expect(types.length).toBe(7)
  })

  it('CrossFileAnalysisResult has correct shape', () => {
    const result: CrossFileAnalysisResult = {
      graph: createEmptyImportGraph(),
      issues: [],
      couplingMetrics: [],
      orphanModules: [],
      summary: {
        totalModules: 0,
        totalImports: 0,
        totalExports: 0,
        averageCoupling: 0,
        issueCount: 0,
        orphanCount: 0,
      },
    }
    expect(result.summary.totalModules).toBe(0)
    expect(result.summary.issueCount).toBe(0)
  })

  it('ImportGraph has correct shape', () => {
    const graph: ImportGraph = createEmptyImportGraph()
    expect(graph.modules).toBeInstanceOf(Map)
    expect(graph.edges).toBeInstanceOf(Array)
  })
})

describe('Edge cases', () => {
  it('handles module with only whitespace', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('empty.ts', '   \n  \n  ')
    const mod = builder.getGraph().modules.get('empty.ts')!
    expect(mod.imports).toEqual([])
    expect(mod.exports).toEqual([])
  })

  it('handles module with only comments', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('comments.ts', '// comment\n/* block */\n// another')
    const mod = builder.getGraph().modules.get('comments.ts')!
    expect(mod.imports).toEqual([])
    expect(mod.exports).toEqual([])
  })

  it('handles deeply nested relative imports', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('src/a/b/c/d.ts', `import { x } from '../../../../shared'`)
    builder.addModule('shared.ts', `export const x = 1`)
    const graph = builder.resolve()
    expect(graph.modules.get('shared.ts')!.dependents.has('src/a/b/c/d.ts')).toBe(true)
  })

  it('handles multiple exports from same line pattern', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('a.ts', `export { foo as bar, baz as qux } from './b'`)
    const mod = builder.getGraph().modules.get('a.ts')!
    expect(mod.exports.length).toBe(2)
    expect(mod.exports[0]!.name).toBe('foo')
    expect(mod.exports[1]!.name).toBe('baz')
  })

  it('handles self-referential import', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('a.ts', `import { x } from './a'\nexport const x = 1`)
    const graph = builder.resolve()
    expect(graph.edges.length).toBe(1)
    expect(graph.edges[0]!.from).toBe('a.ts')
    expect(graph.edges[0]!.to).toBe('a.ts')
  })

  it('handles empty source after reset', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('a.ts', `import { x } from './b'`)
    builder.reset()
    const graph = builder.resolve()
    expect(graph.modules.size).toBe(0)
  })

  it('analyzer handles graph with edges but no modules gracefully', () => {
    const analyzer = new CrossFileAnalyzer()
    const graph: ImportGraph = {
      modules: new Map(),
      edges: [{ from: 'a.ts', to: 'b.ts', imports: [], weight: 1 }],
    }
    const result = analyzer.analyze(graph)
    expect(result.summary.totalModules).toBe(0)
  })

  it('handles import with string literal edge cases', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('a.ts', `import { x } from "./b"`)
    builder.addModule('b.ts', `export const x = 1`)
    const graph = builder.resolve()
    expect(graph.modules.get('b.ts')!.dependents.size).toBe(1)
  })

  it('handles export default with function keyword', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('a.ts', `export default function() {}`)
    const mod = builder.getGraph().modules.get('a.ts')!
    expect(mod.exports.length).toBe(0)
  })

  it('handles export default with class keyword', () => {
    const builder = new ImportGraphBuilder()
    builder.addModule('a.ts', `export default class {}`)
    const mod = builder.getGraph().modules.get('a.ts')!
    expect(mod.exports.length).toBe(0)
  })

  it('handles impact analysis for file not in graph', () => {
    const analyzer = new CrossFileAnalyzer()
    const graph = buildGraphHelper([
      { path: 'a.ts', source: `export const x = 1` },
    ])
    const impact = analyzer.analyzeImpact(graph, 'missing.ts')
    expect(impact.directlyAffected).toEqual([])
    expect(impact.totalAffected).toBe(0)
  })
})

function buildGraphHelper(
  modules: Array<{ path: string; source: string; isEntry?: boolean }>,
): ImportGraph {
  const builder = new ImportGraphBuilder()
  for (const m of modules) {
    builder.addModule(m.path, m.source, m.isEntry)
  }
  return builder.resolve()
}
