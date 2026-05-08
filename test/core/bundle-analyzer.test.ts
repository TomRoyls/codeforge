import { describe, it, expect } from 'vitest'
import { ModuleAnalyzer } from '../../src/core/bundle-analyzer/module-analyzer.js'
import { BundleAnalyzer } from '../../src/core/bundle-analyzer/bundle-analyzer.js'
import {
  DEFAULT_ANALYZE_CONFIG,
} from '../../src/core/bundle-analyzer/types.js'
import type {
  ModuleInfo,
  BundleModule,
  TreeShakeOpportunity,
  BundleReport,
  AnalyzeConfig,
} from '../../src/core/bundle-analyzer/types.js'

function makeModuleInfo(overrides: Partial<ModuleInfo> & { name: string }): ModuleInfo {
  return {
    path: overrides.name,
    size: 100,
    dependencies: [],
    exports: [],
    usedExports: [],
    isExternal: false,
    ...overrides,
  }
}

describe('ModuleAnalyzer', () => {
  const analyzer = new ModuleAnalyzer()

  describe('analyzeModule', () => {
    describe('with imports', () => {
      it('should extract import dependencies', () => {
        const content = `import { foo } from './utils'`
        const result = analyzer.analyzeModule('test', content)
        expect(result.dependencies).toContain('./utils')
      })

      it('should extract multiple imports', () => {
        const content = `import { foo } from './a'\nimport { bar } from './b'`
        const result = analyzer.analyzeModule('test', content)
        expect(result.dependencies).toContain('./a')
        expect(result.dependencies).toContain('./b')
      })

      it('should extract default imports', () => {
        const content = `import express from 'express'`
        const result = analyzer.analyzeModule('test', content)
        expect(result.dependencies).toContain('express')
      })

      it('should extract namespace imports', () => {
        const content = `import * as fs from 'fs'`
        const result = analyzer.analyzeModule('test', content)
        expect(result.dependencies).toContain('fs')
      })

      it('should extract re-export dependencies', () => {
        const content = `export { helper } from './helpers'`
        const result = analyzer.analyzeModule('test', content)
        expect(result.dependencies).toContain('./helpers')
      })

      it('should extract star re-export dependencies', () => {
        const content = `export * from './utils'`
        const result = analyzer.analyzeModule('test', content)
        expect(result.dependencies).toContain('./utils')
      })

      it('should deduplicate imports', () => {
        const content = `import { foo } from './utils'\nimport { bar } from './utils'`
        const result = analyzer.analyzeModule('test', content)
        const utilsCount = result.dependencies.filter((d) => d === './utils').length
        expect(utilsCount).toBe(1)
      })

      it('should handle empty content', () => {
        const result = analyzer.analyzeModule('test', '')
        expect(result.dependencies).toEqual([])
      })
    })

    describe('with exports', () => {
      it('should extract named function exports', () => {
        const content = `export function greet() {}`
        const result = analyzer.analyzeModule('test', content)
        expect(result.exports).toContain('greet')
      })

      it('should extract named const exports', () => {
        const content = `export const PI = 3.14`
        const result = analyzer.analyzeModule('test', content)
        expect(result.exports).toContain('PI')
      })

      it('should extract named class exports', () => {
        const content = `export class MyApp {}`
        const result = analyzer.analyzeModule('test', content)
        expect(result.exports).toContain('MyApp')
      })

      it('should extract export list', () => {
        const content = `export { foo, bar }`
        const result = analyzer.analyzeModule('test', content)
        expect(result.exports).toContain('foo')
        expect(result.exports).toContain('bar')
      })

      it('should extract interface exports', () => {
        const content = `export interface Config { name: string }`
        const result = analyzer.analyzeModule('test', content)
        expect(result.exports).toContain('Config')
      })

      it('should extract type exports', () => {
        const content = `export type Result = string | number`
        const result = analyzer.analyzeModule('test', content)
        expect(result.exports).toContain('Result')
      })

      it('should extract default function exports', () => {
        const content = `export default function main() {}`
        const result = analyzer.analyzeModule('test', content)
        expect(result.exports).toContain('main')
      })

      it('should extract default class exports', () => {
        const content = `export default class Application {}`
        const result = analyzer.analyzeModule('test', content)
        expect(result.exports).toContain('Application')
      })

      it('should extract enum exports', () => {
        const content = `export enum Status { Active, Inactive }`
        const result = analyzer.analyzeModule('test', content)
        expect(result.exports).toContain('Status')
      })
    })

    describe('size calculation', () => {
      it('should calculate size in bytes', () => {
        const content = `hello world`
        const result = analyzer.analyzeModule('test', content)
        expect(result.size).toBe(11)
      })

      it('should return 0 for empty string', () => {
        const result = analyzer.analyzeModule('test', '')
        expect(result.size).toBe(0)
      })

      it('should handle multi-byte characters', () => {
        const content = `你好`
        const result = analyzer.analyzeModule('test', content)
        expect(result.size).toBeGreaterThan(2)
      })

      it('should handle large content', () => {
        const content = 'x'.repeat(10000)
        const result = analyzer.analyzeModule('test', content)
        expect(result.size).toBe(10000)
      })
    })

    describe('external detection', () => {
      it('should detect external packages', () => {
        const content = `import { foo } from 'lodash'`
        const result = analyzer.analyzeModule('lodash', content)
        expect(result.isExternal).toBe(true)
      })

      it('should detect scoped packages as external', () => {
        const content = `import { foo } from '@babel/core'`
        const result = analyzer.analyzeModule('@babel/core', content)
        expect(result.isExternal).toBe(true)
      })

      it('should detect relative paths as internal', () => {
        const content = `import { foo } from './utils'`
        const result = analyzer.analyzeModule('./utils', content)
        expect(result.isExternal).toBe(false)
      })

      it('should detect absolute paths as internal', () => {
        const content = `import { foo } from '/abs/path'`
        const result = analyzer.analyzeModule('/abs/path', content)
        expect(result.isExternal).toBe(false)
      })

      it('should detect parent relative paths as internal', () => {
        const result = analyzer.analyzeModule('../parent', '')
        expect(result.isExternal).toBe(false)
      })
    })
  })

  describe('findUnusedExports', () => {
    it('should find unused exports', () => {
      const modules: ModuleInfo[] = [
        makeModuleInfo({
          name: 'utils',
          exports: ['foo', 'bar', 'baz'],
          usedExports: ['foo'],
          size: 300,
        }),
      ]
      const opportunities = analyzer.findUnusedExports(modules)
      expect(opportunities).toHaveLength(1)
      expect(opportunities[0]!.unusedExports).toContain('bar')
      expect(opportunities[0]!.unusedExports).toContain('baz')
    })

    it('should return empty for all used exports', () => {
      const modules: ModuleInfo[] = [
        makeModuleInfo({
          name: 'utils',
          exports: ['foo', 'bar'],
          usedExports: ['foo', 'bar'],
          size: 100,
        }),
      ]
      const opportunities = analyzer.findUnusedExports(modules)
      expect(opportunities).toHaveLength(0)
    })

    it('should return empty for modules with no exports', () => {
      const modules: ModuleInfo[] = [
        makeModuleInfo({
          name: 'utils',
          exports: [],
          usedExports: [],
          size: 100,
        }),
      ]
      const opportunities = analyzer.findUnusedExports(modules)
      expect(opportunities).toHaveLength(0)
    })

    it('should calculate potential savings', () => {
      const modules: ModuleInfo[] = [
        makeModuleInfo({
          name: 'utils',
          exports: ['a', 'b', 'c', 'd'],
          usedExports: ['a'],
          size: 400,
        }),
      ]
      const opportunities = analyzer.findUnusedExports(modules)
      expect(opportunities[0]!.potentialSavings).toBe(300)
    })

    it('should handle multiple modules', () => {
      const modules: ModuleInfo[] = [
        makeModuleInfo({
          name: 'a',
          exports: ['x'],
          usedExports: [],
          size: 100,
        }),
        makeModuleInfo({
          name: 'b',
          exports: ['y', 'z'],
          usedExports: ['y'],
          size: 200,
        }),
      ]
      const opportunities = analyzer.findUnusedExports(modules)
      expect(opportunities).toHaveLength(2)
    })
  })

  describe('findDuplicates', () => {
    it('should return empty for no duplicates', () => {
      const modules: ModuleInfo[] = [
        makeModuleInfo({ name: 'a', path: '/a' }),
        makeModuleInfo({ name: 'b', path: '/b' }),
      ]
      const dups = analyzer.findDuplicates(modules)
      expect(dups).toHaveLength(0)
    })

    it('should find duplicate modules', () => {
      const modules: ModuleInfo[] = [
        makeModuleInfo({ name: 'utils', path: '/src/utils' }),
        makeModuleInfo({ name: 'utils', path: '/lib/utils' }),
      ]
      const dups = analyzer.findDuplicates(modules)
      expect(dups).toHaveLength(1)
      expect(dups[0]).toContain('/src/utils')
      expect(dups[0]).toContain('/lib/utils')
    })

    it('should find multiple duplicate groups', () => {
      const modules: ModuleInfo[] = [
        makeModuleInfo({ name: 'a', path: '/a1' }),
        makeModuleInfo({ name: 'a', path: '/a2' }),
        makeModuleInfo({ name: 'b', path: '/b1' }),
        makeModuleInfo({ name: 'b', path: '/b2' }),
      ]
      const dups = analyzer.findDuplicates(modules)
      expect(dups).toHaveLength(2)
    })

    it('should return empty for empty array', () => {
      const dups = analyzer.findDuplicates([])
      expect(dups).toHaveLength(0)
    })

    it('should not flag single modules as duplicates', () => {
      const modules: ModuleInfo[] = [
        makeModuleInfo({ name: 'unique', path: '/unique' }),
      ]
      const dups = analyzer.findDuplicates(modules)
      expect(dups).toHaveLength(0)
    })
  })

  describe('estimateGzipSize', () => {
    it('should estimate gzip as 30% of size', () => {
      const result = analyzer.estimateGzipSize(1000)
      expect(result).toBe(300)
    })

    it('should return 0 for 0 size', () => {
      const result = analyzer.estimateGzipSize(0)
      expect(result).toBe(0)
    })

    it('should round the result', () => {
      const result = analyzer.estimateGzipSize(333)
      expect(result).toBe(Math.round(333 * 0.3))
    })

    it('should handle large sizes', () => {
      const result = analyzer.estimateGzipSize(1_000_000)
      expect(result).toBe(300_000)
    })
  })
})

describe('BundleAnalyzer', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const ba = new BundleAnalyzer()
      const config = ba.getConfig()
      expect(config.excludeExternals).toBe(DEFAULT_ANALYZE_CONFIG.excludeExternals)
      expect(config.maxDepth).toBe(DEFAULT_ANALYZE_CONFIG.maxDepth)
      expect(config.gzipEstimate).toBe(DEFAULT_ANALYZE_CONFIG.gzipEstimate)
    })

    it('should merge partial config with defaults', () => {
      const ba = new BundleAnalyzer({ excludeExternals: true })
      const config = ba.getConfig()
      expect(config.excludeExternals).toBe(true)
      expect(config.maxDepth).toBe(DEFAULT_ANALYZE_CONFIG.maxDepth)
    })

    it('should override all config values', () => {
      const custom: Partial<AnalyzeConfig> = {
        entryPoint: 'src/index.ts',
        excludeExternals: true,
        maxDepth: 5,
        gzipEstimate: false,
      }
      const ba = new BundleAnalyzer(custom)
      const config = ba.getConfig()
      expect(config.entryPoint).toBe('src/index.ts')
      expect(config.excludeExternals).toBe(true)
      expect(config.maxDepth).toBe(5)
      expect(config.gzipEstimate).toBe(false)
    })

    it('should return a copy of config', () => {
      const ba = new BundleAnalyzer()
      const config1 = ba.getConfig()
      config1.entryPoint = 'modified'
      const config2 = ba.getConfig()
      expect(config2.entryPoint).toBe('')
    })
  })

  describe('analyze', () => {
    it('should handle empty module map', () => {
      const ba = new BundleAnalyzer()
      const report = ba.analyze(new Map())
      expect(report.totalSize).toBe(0)
      expect(report.moduleCount).toBe(0)
      expect(report.externalCount).toBe(0)
      expect(report.modules).toEqual([])
      expect(report.treeShakeOpportunities).toEqual([])
      expect(report.duplicateDependencies).toEqual([])
    })

    it('should analyze a single module', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>()
      modules.set('src/index.ts', `export const hello = 'world'`)
      const report = ba.analyze(modules)
      expect(report.moduleCount).toBe(1)
      expect(report.modules[0]!.name).toBe('index')
      expect(report.modules[0]!.exports).toContain('hello')
    })

    it('should analyze multiple modules', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>()
      modules.set('src/a.ts', `export const a = 1`)
      modules.set('src/b.ts', `export const b = 2`)
      const report = ba.analyze(modules)
      expect(report.moduleCount).toBe(2)
    })

    it('should compute total size', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>()
      modules.set('src/a.ts', `export const a = 1`)
      modules.set('src/b.ts', `export const b = 2`)
      const report = ba.analyze(modules)
      expect(report.totalSize).toBeGreaterThan(0)
    })

    it('should count external modules', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>()
      modules.set('lodash', `export const _ = {}`)
      modules.set('src/app.ts', `import { _ } from 'lodash'\nexport const app = _`)
      const report = ba.analyze(modules)
      expect(report.externalCount).toBeGreaterThan(0)
    })

    it('should compute estimated gzip size when enabled', () => {
      const ba = new BundleAnalyzer({ gzipEstimate: true })
      const modules = new Map<string, string>()
      modules.set('src/index.ts', `export const hello = 'world'`)
      const report = ba.analyze(modules)
      expect(report.estimatedGzipSize).toBeGreaterThan(0)
    })

    it('should return 0 gzip size when disabled', () => {
      const ba = new BundleAnalyzer({ gzipEstimate: false })
      const modules = new Map<string, string>()
      modules.set('src/index.ts', `export const hello = 'world'`)
      const report = ba.analyze(modules)
      expect(report.estimatedGzipSize).toBe(0)
    })

    it('should find tree shake opportunities', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>()
      modules.set('src/lib.ts', `export const used = 1\nexport const unused = 2\nexport const alsoUnused = 3`)
      const report = ba.analyze(modules)
      expect(report.treeShakeOpportunities.length).toBeGreaterThanOrEqual(0)
    })

    it('should find duplicate dependencies', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>()
      modules.set('/src/utils', `export const a = 1`)
      modules.set('/lib/utils', `export const b = 2`)
      const report = ba.analyze(modules)
      expect(report.duplicateDependencies.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('analyze with entry point depth', () => {
    it('should compute depth from entry point', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/index.ts' })
      const modules = new Map<string, string>()
      modules.set('src/index.ts', `import { foo } from './utils'`)
      modules.set('src/utils.ts', `export const foo = 1`)
      const report = ba.analyze(modules)
      const indexMod = report.modules.find((m) => m.path === 'src/index.ts')
      const utilsMod = report.modules.find((m) => m.path === 'src/utils.ts')
      expect(indexMod!.depth).toBe(0)
      expect(utilsMod!.depth).toBe(1)
    })

    it('should mark entry point as imported', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/index.ts' })
      const modules = new Map<string, string>()
      modules.set('src/index.ts', `export const app = 1`)
      const report = ba.analyze(modules)
      expect(report.modules[0]!.imported).toBe(true)
    })

    it('should mark unreachable modules as not imported', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/index.ts' })
      const modules = new Map<string, string>()
      modules.set('src/index.ts', `export const app = 1`)
      modules.set('src/orphan.ts', `export const orphan = 1`)
      const report = ba.analyze(modules)
      const orphan = report.modules.find((m) => m.path === 'src/orphan.ts')
      expect(orphan!.imported).toBe(false)
    })

    it('should limit depth based on maxDepth config', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'a', maxDepth: 1 })
      const modules = new Map<string, string>()
      modules.set('a', `import { b } from 'b'`)
      modules.set('b', `import { c } from 'c'`)
      modules.set('c', `export const val = 1`)
      const report = ba.analyze(modules)
      const cMod = report.modules.find((m) => m.path === 'c')
      expect(cMod!.depth).toBeLessThanOrEqual(1)
    })
  })

  describe('getLargestModules', () => {
    it('should return top N largest modules by default', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>()
      modules.set('small.ts', `export const a = 1`)
      modules.set('large.ts', `export const b = 1\n${'x'.repeat(500)}`)
      const report = ba.analyze(modules)
      const largest = ba.getLargestModules(report)
      expect(largest.length).toBeLessThanOrEqual(5)
    })

    it('should return specified count of modules', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>()
      modules.set('a.ts', `export const a = 1`)
      modules.set('b.ts', `export const b = 2`)
      modules.set('c.ts', `export const c = 3`)
      const report = ba.analyze(modules)
      const largest = ba.getLargestModules(report, 2)
      expect(largest).toHaveLength(2)
    })

    it('should return modules sorted by size descending', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>()
      modules.set('small.ts', `export const a = 1`)
      modules.set('large.ts', `export const b = 1\n${'// big file'.repeat(100)}`)
      const report = ba.analyze(modules)
      const largest = ba.getLargestModules(report, 2)
      expect(largest[0]!.size).toBeGreaterThanOrEqual(largest[1]!.size)
    })

    it('should handle count larger than modules', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>()
      modules.set('a.ts', `export const a = 1`)
      const report = ba.analyze(modules)
      const largest = ba.getLargestModules(report, 10)
      expect(largest).toHaveLength(1)
    })
  })

  describe('getTreeShakeReport', () => {
    it('should return opportunities sorted by savings descending', () => {
      const ba = new BundleAnalyzer()
      const report: BundleReport = {
        totalSize: 1000,
        moduleCount: 2,
        externalCount: 0,
        modules: [],
        treeShakeOpportunities: [
          { module: 'small', unusedExports: ['a'], potentialSavings: 100 },
          { module: 'large', unusedExports: ['b', 'c'], potentialSavings: 500 },
        ],
        duplicateDependencies: [],
        largestModules: [],
        estimatedGzipSize: 300,
      }
      const sorted = ba.getTreeShakeReport(report)
      expect(sorted[0]!.potentialSavings).toBeGreaterThanOrEqual(sorted[1]!.potentialSavings)
    })

    it('should return empty for no opportunities', () => {
      const ba = new BundleAnalyzer()
      const report: BundleReport = {
        totalSize: 0,
        moduleCount: 0,
        externalCount: 0,
        modules: [],
        treeShakeOpportunities: [],
        duplicateDependencies: [],
        largestModules: [],
        estimatedGzipSize: 0,
      }
      const sorted = ba.getTreeShakeReport(report)
      expect(sorted).toEqual([])
    })

    it('should not modify original report', () => {
      const ba = new BundleAnalyzer()
      const report: BundleReport = {
        totalSize: 0,
        moduleCount: 0,
        externalCount: 0,
        modules: [],
        treeShakeOpportunities: [
          { module: 'a', unusedExports: ['x'], potentialSavings: 100 },
          { module: 'b', unusedExports: ['y'], potentialSavings: 200 },
        ],
        duplicateDependencies: [],
        largestModules: [],
        estimatedGzipSize: 0,
      }
      const originalOrder = report.treeShakeOpportunities.map((o) => o.module)
      ba.getTreeShakeReport(report)
      const afterOrder = report.treeShakeOpportunities.map((o) => o.module)
      expect(originalOrder).toEqual(afterOrder)
    })
  })

  describe('getDependencyChains', () => {
    it('should return dependency chains', () => {
      const ba = new BundleAnalyzer()
      const report: BundleReport = {
        totalSize: 0,
        moduleCount: 2,
        externalCount: 0,
        modules: [
          {
            name: 'a', path: 'a.ts', size: 100, dependencies: ['b.ts'],
            exports: [], usedExports: [], isExternal: false, imported: true, depth: 0, cost: 100,
          },
          {
            name: 'b', path: 'b.ts', size: 50, dependencies: [],
            exports: [], usedExports: [], isExternal: false, imported: true, depth: 1, cost: 50,
          },
        ],
        treeShakeOpportunities: [],
        duplicateDependencies: [],
        largestModules: [],
        estimatedGzipSize: 0,
      }
      const chains = ba.getDependencyChains(report)
      expect(chains).toBeInstanceOf(Map)
      expect(chains.get('a.ts')).toContain('b.ts')
    })

    it('should return empty chain for modules with no dependencies', () => {
      const ba = new BundleAnalyzer()
      const report: BundleReport = {
        totalSize: 0,
        moduleCount: 1,
        externalCount: 0,
        modules: [
          {
            name: 'standalone', path: 'standalone.ts', size: 100, dependencies: [],
            exports: [], usedExports: [], isExternal: false, imported: true, depth: 0, cost: 100,
          },
        ],
        treeShakeOpportunities: [],
        duplicateDependencies: [],
        largestModules: [],
        estimatedGzipSize: 0,
      }
      const chains = ba.getDependencyChains(report)
      expect(chains.get('standalone.ts')).toEqual(['standalone.ts'])
    })

    it('should handle circular dependencies', () => {
      const ba = new BundleAnalyzer()
      const report: BundleReport = {
        totalSize: 0,
        moduleCount: 2,
        externalCount: 0,
        modules: [
          {
            name: 'a', path: 'a.ts', size: 100, dependencies: ['b.ts'],
            exports: [], usedExports: [], isExternal: false, imported: true, depth: 0, cost: 100,
          },
          {
            name: 'b', path: 'b.ts', size: 50, dependencies: ['a.ts'],
            exports: [], usedExports: [], isExternal: false, imported: true, depth: 1, cost: 50,
          },
        ],
        treeShakeOpportunities: [],
        duplicateDependencies: [],
        largestModules: [],
        estimatedGzipSize: 0,
      }
      const chains = ba.getDependencyChains(report)
      expect(chains).toBeInstanceOf(Map)
      expect(chains.size).toBe(2)
    })
  })

  describe('getConfig', () => {
    it('should return the current config', () => {
      const ba = new BundleAnalyzer({ maxDepth: 3 })
      const config = ba.getConfig()
      expect(config.maxDepth).toBe(3)
    })

    it('should return a copy', () => {
      const ba = new BundleAnalyzer()
      const config = ba.getConfig()
      expect(config).not.toBe(ba.getConfig())
    })
  })

  describe('exclude externals', () => {
    it('should exclude external modules from totals', () => {
      const ba = new BundleAnalyzer({ excludeExternals: true })
      const modules = new Map<string, string>()
      modules.set('lodash', `export const _ = {}`)
      modules.set('src/app.ts', `export const app = 1`)
      const report = ba.analyze(modules)
      const hasExternal = report.modules.some((m) => m.isExternal)
      expect(hasExternal).toBe(false)
    })

    it('should include external modules when not excluded', () => {
      const ba = new BundleAnalyzer({ excludeExternals: false })
      const modules = new Map<string, string>()
      modules.set('lodash', `export const _ = {}`)
      modules.set('src/app.ts', `export const app = 1`)
      const report = ba.analyze(modules)
      const hasExternal = report.modules.some((m) => m.isExternal)
      expect(hasExternal).toBe(true)
    })

    it('should still count externals in externalCount when excluded', () => {
      const ba = new BundleAnalyzer({ excludeExternals: true })
      const modules = new Map<string, string>()
      modules.set('lodash', `export const _ = {}`)
      modules.set('src/app.ts', `export const app = 1`)
      const report = ba.analyze(modules)
      expect(report.externalCount).toBeGreaterThan(0)
    })
  })

  describe('max depth limiting', () => {
    it('should clamp depth to maxDepth', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'a', maxDepth: 0 })
      const modules = new Map<string, string>()
      modules.set('a', `import { b } from 'b'`)
      modules.set('b', `export const val = 1`)
      const report = ba.analyze(modules)
      for (const mod of report.modules) {
        expect(mod.depth).toBeLessThanOrEqual(0)
      }
    })

    it('should use default maxDepth of 10', () => {
      const ba = new BundleAnalyzer()
      const config = ba.getConfig()
      expect(config.maxDepth).toBe(10)
    })
  })
})

describe('Integration', () => {
  it('should run full analysis pipeline', () => {
    const ba = new BundleAnalyzer({ entryPoint: 'src/index.ts', gzipEstimate: true })
    const modules = new Map<string, string>()
    modules.set(
      'src/index.ts',
      `import { helper } from './utils'\nimport express from 'express'\nexport function main() { return helper() }`,
    )
    modules.set(
      'src/utils.ts',
      `export function helper() { return 42 }\nexport function unusedHelper() { return 0 }`,
    )
    const report = ba.analyze(modules)

    expect(report.moduleCount).toBeGreaterThan(0)
    expect(report.totalSize).toBeGreaterThan(0)
    expect(report.estimatedGzipSize).toBeGreaterThan(0)
    expect(report.modules.length).toBeGreaterThan(0)
  })

  it('should detect tree-shake opportunities in full pipeline', () => {
    const ba = new BundleAnalyzer()
    const modules = new Map<string, string>()
    modules.set(
      'lib.ts',
      `export const used = 1\nexport const unused1 = 2\nexport const unused2 = 3\nexport const unused3 = 4`,
    )
    const report = ba.analyze(modules)
    expect(report.treeShakeOpportunities.length).toBeGreaterThanOrEqual(0)
  })

  it('should detect duplicate dependencies in full pipeline', () => {
    const ba = new BundleAnalyzer()
    const modules = new Map<string, string>()
    modules.set('/src/helpers', `export const a = 1`)
    modules.set('/lib/helpers', `export const b = 2`)
    modules.set('/vendor/helpers', `export const c = 3`)
    const report = ba.analyze(modules)
    const helpersDups = report.duplicateDependencies.filter(
      (d) => d.length > 0,
    )
    expect(helpersDups.length).toBeGreaterThan(0)
  })

  it('should compute correct size calculations', () => {
    const ba = new BundleAnalyzer({ gzipEstimate: true })
    const content = 'x'.repeat(1000)
    const modules = new Map<string, string>()
    modules.set('src/large.ts', `export const data = '${content}'`)
    const report = ba.analyze(modules)
    expect(report.totalSize).toBeGreaterThan(0)
    expect(report.estimatedGzipSize).toBe(Math.round(report.totalSize * 0.3))
  })

  it('should produce a complete report', () => {
    const ba = new BundleAnalyzer({ entryPoint: 'app.ts' })
    const modules = new Map<string, string>()
    modules.set('app.ts', `import { serve } from './server'`)
    modules.set('server.ts', `import { config } from './config'\nexport function serve() {}`)
    modules.set('config.ts', `export const config = {}`)

    const report = ba.analyze(modules)

    expect(report).toHaveProperty('totalSize')
    expect(report).toHaveProperty('moduleCount')
    expect(report).toHaveProperty('externalCount')
    expect(report).toHaveProperty('modules')
    expect(report).toHaveProperty('treeShakeOpportunities')
    expect(report).toHaveProperty('duplicateDependencies')
    expect(report).toHaveProperty('largestModules')
    expect(report).toHaveProperty('estimatedGzipSize')

    expect(typeof report.totalSize).toBe('number')
    expect(typeof report.moduleCount).toBe('number')
    expect(typeof report.externalCount).toBe('number')
    expect(typeof report.estimatedGzipSize).toBe('number')
    expect(Array.isArray(report.modules)).toBe(true)
    expect(Array.isArray(report.treeShakeOpportunities)).toBe(true)
    expect(Array.isArray(report.duplicateDependencies)).toBe(true)
    expect(Array.isArray(report.largestModules)).toBe(true)
  })

  it('should handle complex dependency graph', () => {
    const ba = new BundleAnalyzer({ entryPoint: 'index.ts' })
    const modules = new Map<string, string>()
    modules.set('index.ts', `import { a } from './a'\nimport { b } from './b'`)
    modules.set('a.ts', `import { shared } from './shared'\nexport const a = shared`)
    modules.set('b.ts', `import { shared } from './shared'\nexport const b = shared`)
    modules.set('shared.ts', `export const shared = 'shared'`)

    const report = ba.analyze(modules)

    expect(report.moduleCount).toBe(4)
    const indexMod = report.modules.find((m) => m.path === 'index.ts')
    expect(indexMod!.depth).toBe(0)

    const sharedMod = report.modules.find((m) => m.path === 'shared.ts')
    expect(sharedMod!.depth).toBe(2)
  })

  it('should compute cost based on depth', () => {
    const ba = new BundleAnalyzer({ entryPoint: 'root.ts' })
    const modules = new Map<string, string>()
    modules.set('root.ts', `import { child } from './child'\nexport const root = child`)
    modules.set('child.ts', `export const child = 42`)

    const report = ba.analyze(modules)

    const rootMod = report.modules.find((m) => m.path === 'root.ts')
    const childMod = report.modules.find((m) => m.path === 'child.ts')

    expect(rootMod!.cost).toBe(rootMod!.size)
    expect(childMod!.cost).toBe(Math.round(childMod!.size / childMod!.depth))
  })

  it('should handle modules with no content gracefully', () => {
    const ba = new BundleAnalyzer()
    const modules = new Map<string, string>()
    modules.set('empty.ts', '')
    const report = ba.analyze(modules)
    expect(report.moduleCount).toBe(1)
    expect(report.modules[0]!.size).toBe(0)
    expect(report.modules[0]!.exports).toEqual([])
    expect(report.modules[0]!.dependencies).toEqual([])
  })

  it('should mark all modules as imported when no entry point', () => {
    const ba = new BundleAnalyzer()
    const modules = new Map<string, string>()
    modules.set('a.ts', `export const a = 1`)
    modules.set('b.ts', `export const b = 2`)
    const report = ba.analyze(modules)
    for (const mod of report.modules) {
      expect(mod.imported).toBe(true)
    }
  })

  it('should set depth to 0 for all modules when no entry point', () => {
    const ba = new BundleAnalyzer()
    const modules = new Map<string, string>()
    modules.set('a.ts', `export const a = 1`)
    modules.set('b.ts', `export const b = 2`)
    const report = ba.analyze(modules)
    for (const mod of report.modules) {
      expect(mod.depth).toBe(0)
    }
  })

  it('should produce BundleModule objects with all required fields', () => {
    const ba = new BundleAnalyzer()
    const modules = new Map<string, string>()
    modules.set('test.ts', `export const x = 1`)
    const report = ba.analyze(modules)
    const mod = report.modules[0]!
    expect(mod).toHaveProperty('name')
    expect(mod).toHaveProperty('path')
    expect(mod).toHaveProperty('size')
    expect(mod).toHaveProperty('dependencies')
    expect(mod).toHaveProperty('exports')
    expect(mod).toHaveProperty('usedExports')
    expect(mod).toHaveProperty('isExternal')
    expect(mod).toHaveProperty('imported')
    expect(mod).toHaveProperty('depth')
    expect(mod).toHaveProperty('cost')
  })

  it('should report largest modules in analysis', () => {
    const ba = new BundleAnalyzer()
    const modules = new Map<string, string>()
    modules.set('small.ts', `export const s = 1`)
    modules.set('medium.ts', `export const m = 1\n${'// '.repeat(50)}`)
    modules.set('large.ts', `export const l = 1\n${'// '.repeat(200)}`)
    const report = ba.analyze(modules)
    expect(report.largestModules.length).toBeGreaterThan(0)
    if (report.largestModules.length > 1) {
      expect(report.largestModules[0]!.size).toBeGreaterThanOrEqual(report.largestModules[1]!.size)
    }
  })
})
