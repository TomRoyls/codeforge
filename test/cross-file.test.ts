import { describe, it, expect, beforeEach } from 'vitest'
import { ImportGraphBuilder, CrossFileAnalyzer, createEmptyModuleInfo, createEmptyImportGraph } from '../src/core/cross-file/index.js'

// ─── Helper Functions ───

describe('createEmptyModuleInfo', () => {
  it('should create a module info with empty collections', () => {
    const info = createEmptyModuleInfo('test.ts')
    expect(info.filePath).toBe('test.ts')
    expect(info.imports).toEqual([])
    expect(info.exports).toEqual([])
    expect(info.isBarrel).toBe(false)
    expect(info.isEntryPoint).toBe(false)
    expect(info.dependencies.size).toBe(0)
    expect(info.dependents.size).toBe(0)
    expect(info.depth).toBe(0)
  })
})

describe('createEmptyImportGraph', () => {
  it('should create an empty graph', () => {
    const graph = createEmptyImportGraph()
    expect(graph.modules.size).toBe(0)
    expect(graph.edges).toEqual([])
  })
})

// ─── ImportGraphBuilder ───

describe('ImportGraphBuilder', () => {
  let builder: ImportGraphBuilder

  beforeEach(() => {
    builder = new ImportGraphBuilder()
  })

  describe('addModule', () => {
    it('should add a module with imports', () => {
      builder.addModule('src/app.ts', "import { foo } from './foo.js'")
      const graph = builder.getGraph()
      expect(graph.modules.has('src/app.ts')).toBe(true)
      const mod = graph.modules.get('src/app.ts')!
      expect(mod.imports.length).toBe(1)
      expect(mod.imports[0]!.fromModule).toBe('./foo.js')
    })

    it('should parse named imports', () => {
      builder.addModule('a.ts', "import { foo, bar } from './b.js'")
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports[0]!.name).toContain('foo')
      expect(mod.imports[0]!.name).toContain('bar')
    })

    it('should parse default imports', () => {
      builder.addModule('a.ts', "import React from 'react'")
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports[0]!.isDefault).toBe(true)
      expect(mod.imports[0]!.name).toBe('React')
    })

    it('should parse type-only imports', () => {
      builder.addModule('a.ts', "import type { Config } from './types.js'")
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports[0]!.isTypeOnly).toBe(true)
    })

    it('should parse namespace imports', () => {
      builder.addModule('a.ts', "import * as utils from './utils.js'")
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports[0]!.isNamespace).toBe(true)
    })

    it('should parse dynamic imports', () => {
      builder.addModule('a.ts', "const mod = import('./heavy.js')")
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.imports.some((i) => i.isDynamic && i.fromModule === './heavy.js')).toBe(true)
    })

    it('should parse re-exports', () => {
      builder.addModule('index.ts', "export { foo } from './foo.js'")
      const mod = builder.getGraph().modules.get('index.ts')!
      expect(mod.exports.length).toBe(1)
      expect(mod.exports[0]!.isReExport).toBe(true)
      expect(mod.exports[0]!.name).toBe('foo')
    })

    it('should parse star re-exports', () => {
      builder.addModule('index.ts', "export * from './mod.js'")
      const mod = builder.getGraph().modules.get('index.ts')!
      expect(mod.exports[0]!.isReExport).toBe(true)
      expect(mod.exports[0]!.name).toBe('*')
    })

    it('should parse named exports', () => {
      builder.addModule('a.ts', 'export function hello() {}')
      const mod = builder.getGraph().modules.get('a.ts')!
      expect(mod.exports.some((e) => e.name === 'hello' && e.kind === 'function')).toBe(true)
    })

    it('should detect barrel files', () => {
      builder.addModule('index.ts', "export { foo } from './foo.js'\nexport { bar } from './bar.js'")
      const mod = builder.getGraph().modules.get('index.ts')!
      expect(mod.isBarrel).toBe(true)
    })

    it('should not flag non-barrel files', () => {
      builder.addModule('app.ts', "import { foo } from './foo.js'\nexport function main() {}")
      const mod = builder.getGraph().modules.get('app.ts')!
      expect(mod.isBarrel).toBe(false)
    })
  })

  describe('addEntryPoint', () => {
    it('should mark a module as entry point', () => {
      builder.addModule('main.ts', "import { app } from './app.js'", true)
      const graph = builder.resolve()
      const mod = graph.modules.get('main.ts')!
      expect(mod.isEntryPoint).toBe(true)
    })
  })

  describe('resolve', () => {
    it('should resolve import paths and build edges', () => {
      builder.addModule('src/main.ts', "import { foo } from './utils.js'", true)
      builder.addModule('src/utils.ts', 'export function foo() {}')
      const graph = builder.resolve()
      const utilsMod = graph.modules.get('src/utils.ts')!
      expect(utilsMod.dependents.has('src/main.ts')).toBe(true)
      expect(graph.edges.length).toBeGreaterThan(0)
    })

    it('should compute depth from entry points', () => {
      builder.addModule('main.ts', "import { a } from './a.js'", true)
      builder.addModule('a.ts', "import { b } from './b.js'")
      builder.addModule('b.ts', 'export const b = 1')
      const graph = builder.resolve()
      expect(graph.modules.get('main.ts')!.depth).toBe(0)
      expect(graph.modules.get('a.ts')!.depth).toBe(1)
      expect(graph.modules.get('b.ts')!.depth).toBe(2)
    })

    it('should return empty edges for empty graph', () => {
      const graph = builder.resolve()
      expect(graph.edges).toEqual([])
    })
  })

  describe('reset', () => {
    it('should clear the graph', () => {
      builder.addModule('a.ts', '')
      builder.reset()
      expect(builder.getGraph().modules.size).toBe(0)
    })
  })
})

// ─── CrossFileAnalyzer ───

describe('CrossFileAnalyzer', () => {
  const analyzer = new CrossFileAnalyzer()

  describe('findDeadModules', () => {
    it('should find unreachable modules', () => {
      const graph = createEmptyImportGraph()
      graph.modules.set('main.ts', { ...createEmptyModuleInfo('main.ts'), isEntryPoint: true, dependencies: new Set(['./a.js']) })
      graph.modules.set('a.ts', createEmptyModuleInfo('a.ts'))
      graph.modules.set('orphan.ts', createEmptyModuleInfo('orphan.ts'))
      graph.edges.push({ from: 'main.ts', to: 'a.ts', imports: [], weight: 1 })
      const dead = analyzer.findDeadModules(graph)
      expect(dead).toContain('orphan.ts')
      expect(dead).not.toContain('main.ts')
    })

    it('should return empty when no entry points', () => {
      const graph = createEmptyImportGraph()
      graph.modules.set('a.ts', createEmptyModuleInfo('a.ts'))
      expect(analyzer.findDeadModules(graph)).toEqual([])
    })
  })

  describe('findUnusedExports', () => {
    it('should find exports that are never imported', () => {
      const graph = createEmptyImportGraph()
      graph.modules.set('a.ts', { ...createEmptyModuleInfo('a.ts'), exports: [{ name: 'unused', kind: 'function', isDefault: false, isReExport: false, isTypeOnly: false }] })
      const issues = analyzer.findUnusedExports(graph)
      expect(issues.length).toBe(1)
      expect(issues[0]!.type).toBe('unused-export')
    })

    it('should not flag re-exports or star exports', () => {
      const graph = createEmptyImportGraph()
      graph.modules.set('a.ts', { ...createEmptyModuleInfo('a.ts'), exports: [
        { name: '*', kind: 'value', isDefault: false, isReExport: true, isTypeOnly: false },
      ] })
      expect(analyzer.findUnusedExports(graph)).toEqual([])
    })
  })

  describe('findBarrelBloat', () => {
    it('should detect barrel files exceeding threshold', () => {
      const graph = createEmptyImportGraph()
      const exports = Array.from({ length: 25 }, (_, i) => ({ name: `mod${i}`, kind: 'value' as const, isDefault: false, isReExport: true, isTypeOnly: false }))
      graph.modules.set('index.ts', { ...createEmptyModuleInfo('index.ts'), isBarrel: true, exports })
      const issues = analyzer.findBarrelBloat(graph, 20)
      expect(issues.length).toBe(1)
      expect(issues[0]!.type).toBe('barrel-bloat')
    })

    it('should not flag barrels under threshold', () => {
      const graph = createEmptyImportGraph()
      const exports = Array.from({ length: 5 }, (_, i) => ({ name: `mod${i}`, kind: 'value' as const, isDefault: false, isReExport: true, isTypeOnly: false }))
      graph.modules.set('index.ts', { ...createEmptyModuleInfo('index.ts'), isBarrel: true, exports })
      expect(analyzer.findBarrelBloat(graph, 20)).toEqual([])
    })
  })

  describe('findDeepImports', () => {
    it('should detect deep imports', () => {
      const graph = createEmptyImportGraph()
      graph.modules.set('a.ts', {
        ...createEmptyModuleInfo('a.ts'),
        imports: [{ name: 'x', fromModule: '../../../deep/nested/module/file', isDefault: false, isTypeOnly: false, isNamespace: false, isDynamic: false, line: 1 }],
      })
      const issues = analyzer.findDeepImports(graph, 3)
      expect(issues.length).toBe(1)
      expect(issues[0]!.type).toBe('deep-import')
    })
  })

  describe('calculateCouplingMetrics', () => {
    it('should calculate afferent and efferent coupling', () => {
      const graph = createEmptyImportGraph()
      graph.modules.set('a.ts', { ...createEmptyModuleInfo('a.ts'), dependencies: new Set(['b.ts']), dependents: new Set(['c.ts', 'd.ts']) })
      const metrics = analyzer.calculateCouplingMetrics(graph)
      expect(metrics[0]!.afferentCoupling).toBe(2)
      expect(metrics[0]!.efferentCoupling).toBe(1)
    })
  })

  describe('analyzeImpact', () => {
    it('should find directly and transitively affected files', () => {
      const graph = createEmptyImportGraph()
      graph.modules.set('a.ts', { ...createEmptyModuleInfo('a.ts'), exports: [{ name: 'foo', kind: 'function', isDefault: false, isReExport: false, isTypeOnly: false }], dependents: new Set(['b.ts']) })
      graph.modules.set('b.ts', { ...createEmptyModuleInfo('b.ts'), imports: [{ name: 'foo', fromModule: 'a.ts', isDefault: false, isTypeOnly: false, isNamespace: false, isDynamic: false, line: 1 }], dependents: new Set(['c.ts']) })
      graph.modules.set('c.ts', { ...createEmptyModuleInfo('c.ts'), imports: [{ name: 'bar', fromModule: 'b.ts', isDefault: false, isTypeOnly: false, isNamespace: false, isDynamic: false, line: 1 }], dependents: new Set() })
      const impact = analyzer.analyzeImpact(graph, 'a.ts')
      expect(impact.directlyAffected).toContain('b.ts')
      expect(impact.transitivelyAffected).toContain('c.ts')
    })
  })

  describe('analyze', () => {
    it('should return full analysis result', () => {
      const graph = createEmptyImportGraph()
      graph.modules.set('a.ts', { ...createEmptyModuleInfo('a.ts'), isEntryPoint: true, dependencies: new Set(), dependents: new Set(), exports: [{ name: 'foo', kind: 'function', isDefault: false, isReExport: false, isTypeOnly: false }] })
      const result = analyzer.analyze(graph)
      expect(result.graph).toBe(graph)
      expect(result.summary.totalModules).toBe(1)
      expect(result.couplingMetrics.length).toBe(1)
    })
  })

  describe('formatReport', () => {
    it('should format a report string', () => {
      const graph = createEmptyImportGraph()
      graph.modules.set('a.ts', createEmptyModuleInfo('a.ts'))
      const result = analyzer.analyze(graph)
      const report = analyzer.formatReport(result)
      expect(report).toContain('Cross-File Analysis Report')
      expect(report).toContain('Total modules: 1')
    })
  })
})
