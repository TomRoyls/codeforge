/// <reference types="vitest" />

import { ModuleAnalyzer } from '../src/core/bundle-analyzer/module-analyzer.js'
import { BundleAnalyzer } from '../src/core/bundle-analyzer/bundle-analyzer.js'
import { DEFAULT_ANALYZE_CONFIG } from '../src/core/bundle-analyzer/types.js'
import type { ModuleInfo, BundleReport, AnalyzeConfig } from '../src/core/bundle-analyzer/types.js'

// ─── ModuleAnalyzer: analyzeModule ──────────────────────────────────────────

describe('ModuleAnalyzer', () => {
  describe('analyzeModule', () => {
    it('extracts named imports as dependencies', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', "import { foo } from 'bar'")
      expect(info.dependencies).toContain('bar')
    })

    it('extracts default imports as dependencies', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', "import react from 'react'")
      expect(info.dependencies).toContain('react')
    })

    it('extracts namespace imports as dependencies', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', "import * as utils from './utils'")
      expect(info.dependencies).toContain('./utils')
    })

    it('extracts type imports as dependencies', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', "import type { Config } from './types'")
      expect(info.dependencies).toContain('./types')
    })

    it('extracts re-exports as dependencies', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', "export { foo } from 'bar'")
      expect(info.dependencies).toContain('bar')
    })

    it('extracts wildcard re-exports as dependencies', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', "export * from 'lodash'")
      expect(info.dependencies).toContain('lodash')
    })

    it('extracts multiple imports from different sources', () => {
      const analyzer = new ModuleAnalyzer()
      const content = `
        import { foo } from 'bar'
        import { baz } from 'qux'
        export * from 'reexport'
      `
      const info = analyzer.analyzeModule('test', content)
      expect(info.dependencies).toContain('bar')
      expect(info.dependencies).toContain('qux')
      expect(info.dependencies).toContain('reexport')
      expect(info.dependencies.length).toBe(3)
    })

    it('deduplicates imports from the same source', () => {
      const analyzer = new ModuleAnalyzer()
      const content = `
        import { foo } from 'shared'
        import { bar } from 'shared'
      `
      const info = analyzer.analyzeModule('test', content)
      const sharedCount = info.dependencies.filter((d) => d === 'shared').length
      expect(sharedCount).toBe(1)
    })

    it('extracts const exports', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', 'export const foo = 1')
      expect(info.exports).toContain('foo')
    })

    it('extracts let exports', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', 'export let count = 0')
      expect(info.exports).toContain('count')
    })

    it('extracts var exports', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', 'export var legacy = true')
      expect(info.exports).toContain('legacy')
    })

    it('extracts function exports', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', 'export function hello() {}')
      expect(info.exports).toContain('hello')
    })

    it('extracts class exports', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', 'export class Foo {}')
      expect(info.exports).toContain('Foo')
    })

    it('extracts interface exports', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', 'export interface Config {}')
      expect(info.exports).toContain('Config')
    })

    it('extracts type exports', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', 'export type Result = string | number')
      expect(info.exports).toContain('Result')
    })

    it('extracts enum exports', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', 'export enum Color { Red, Green }')
      expect(info.exports).toContain('Color')
    })

    it('extracts named re-exports', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', "export { foo, bar } from 'mod'")
      expect(info.exports).toContain('foo')
      expect(info.exports).toContain('bar')
    })

    it('extracts named re-exports with alias (uses original name)', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', "export { foo as bar } from 'mod'")
      expect(info.exports).toContain('foo')
    })

    it('extracts export default function with name', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', 'export default function main() {}')
      expect(info.exports).toContain('main')
    })

    it('extracts export default class with name', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', 'export default class App {}')
      expect(info.exports).toContain('App')
    })

    it('calculates size as UTF-8 byte length', () => {
      const analyzer = new ModuleAnalyzer()
      const content = 'hello world'
      const info = analyzer.analyzeModule('test', content)
      expect(info.size).toBe(Buffer.byteLength(content, 'utf-8'))
    })

    it('calculates size correctly for multi-byte characters', () => {
      const analyzer = new ModuleAnalyzer()
      const content = '你好世界'
      const info = analyzer.analyzeModule('test', content)
      expect(info.size).toBe(Buffer.byteLength(content, 'utf-8'))
    })

    it('returns zero size for empty content', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', '')
      expect(info.size).toBe(0)
    })

    it('sets path to the provided name', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('my-module', '')
      expect(info.path).toBe('my-module')
    })

    it('initializes usedExports as empty', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('test', 'export const x = 1')
      expect(info.usedExports).toEqual([])
    })
  })

  // ─── ModuleAnalyzer: detectExternal ──────────────────────────────────────────

  describe('detectExternal (via analyzeModule)', () => {
    it('marks bare package names as external', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('lodash', '')
      expect(info.isExternal).toBe(true)
    })

    it('marks scoped packages as external', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('@types/node', '')
      expect(info.isExternal).toBe(true)
    })

    it('marks relative paths starting with ./ as internal', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('./utils', '')
      expect(info.isExternal).toBe(false)
    })

    it('marks relative paths starting with ../ as internal', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('../parent', '')
      expect(info.isExternal).toBe(false)
    })

    it('marks absolute paths starting with / as internal', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('/abs/path', '')
      expect(info.isExternal).toBe(false)
    })

    it('marks non-scoped paths with slashes as internal', () => {
      const analyzer = new ModuleAnalyzer()
      const info = analyzer.analyzeModule('some/path', '')
      expect(info.isExternal).toBe(false)
    })
  })

  // ─── ModuleAnalyzer: findUnusedExports ────────────────────────────────────────

  describe('findUnusedExports', () => {
    it('returns empty for modules where all exports are used', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'mod', path: 'mod', size: 100, dependencies: [], exports: ['a', 'b'], usedExports: ['a', 'b'], isExternal: false },
      ]
      expect(analyzer.findUnusedExports(modules)).toEqual([])
    })

    it('identifies unused exports', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'mod', path: 'mod', size: 100, dependencies: [], exports: ['a', 'b', 'c'], usedExports: ['a'], isExternal: false },
      ]
      const opportunities = analyzer.findUnusedExports(modules)
      expect(opportunities.length).toBe(1)
      expect(opportunities[0]!.unusedExports).toEqual(['b', 'c'])
      expect(opportunities[0]!.module).toBe('mod')
    })

    it('calculates potential savings proportionally', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'mod', path: 'mod', size: 1000, dependencies: [], exports: ['a', 'b', 'c', 'd'], usedExports: ['a'], isExternal: false },
      ]
      const opportunities = analyzer.findUnusedExports(modules)
      // 1000 / 4 = 250 per export, 3 unused = 750
      expect(opportunities[0]!.potentialSavings).toBe(750)
    })

    it('handles modules with no exports', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'mod', path: 'mod', size: 50, dependencies: [], exports: [], usedExports: [], isExternal: false },
      ]
      expect(analyzer.findUnusedExports(modules)).toEqual([])
    })

    it('handles modules with no used exports at all', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'mod', path: 'mod', size: 200, dependencies: [], exports: ['x', 'y'], usedExports: [], isExternal: false },
      ]
      const opportunities = analyzer.findUnusedExports(modules)
      expect(opportunities.length).toBe(1)
      expect(opportunities[0]!.unusedExports).toEqual(['x', 'y'])
    })

    it('handles empty module list', () => {
      const analyzer = new ModuleAnalyzer()
      expect(analyzer.findUnusedExports([])).toEqual([])
    })

    it('reports opportunities for multiple modules', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'a', path: 'a', size: 100, dependencies: [], exports: ['x'], usedExports: [], isExternal: false },
        { name: 'b', path: 'b', size: 200, dependencies: [], exports: ['y'], usedExports: [], isExternal: false },
      ]
      const opportunities = analyzer.findUnusedExports(modules)
      expect(opportunities.length).toBe(2)
    })

    it('does not report for modules with no unused exports', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'a', path: 'a', size: 100, dependencies: [], exports: ['x'], usedExports: ['x'], isExternal: false },
        { name: 'b', path: 'b', size: 200, dependencies: [], exports: ['y'], usedExports: [], isExternal: false },
      ]
      const opportunities = analyzer.findUnusedExports(modules)
      expect(opportunities.length).toBe(1)
      expect(opportunities[0]!.module).toBe('b')
    })
  })

  // ─── ModuleAnalyzer: findDuplicates ──────────────────────────────────────────

  describe('findDuplicates', () => {
    it('returns empty for modules with unique names', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'a', path: 'a', size: 10, dependencies: [], exports: [], usedExports: [], isExternal: false },
        { name: 'b', path: 'b', size: 20, dependencies: [], exports: [], usedExports: [], isExternal: false },
      ]
      expect(analyzer.findDuplicates(modules)).toEqual([])
    })

    it('finds duplicate module names', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'utils', path: 'src/utils.ts', size: 10, dependencies: [], exports: [], usedExports: [], isExternal: false },
        { name: 'utils', path: 'lib/utils.ts', size: 20, dependencies: [], exports: [], usedExports: [], isExternal: false },
      ]
      const dupes = analyzer.findDuplicates(modules)
      expect(dupes.length).toBe(1)
      expect(dupes[0]).toEqual(['src/utils.ts', 'lib/utils.ts'])
    })

    it('finds multiple groups of duplicates', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'a', path: 'a1', size: 10, dependencies: [], exports: [], usedExports: [], isExternal: false },
        { name: 'a', path: 'a2', size: 10, dependencies: [], exports: [], usedExports: [], isExternal: false },
        { name: 'b', path: 'b1', size: 10, dependencies: [], exports: [], usedExports: [], isExternal: false },
        { name: 'b', path: 'b2', size: 10, dependencies: [], exports: [], usedExports: [], isExternal: false },
      ]
      const dupes = analyzer.findDuplicates(modules)
      expect(dupes.length).toBe(2)
    })

    it('handles empty module list', () => {
      const analyzer = new ModuleAnalyzer()
      expect(analyzer.findDuplicates([])).toEqual([])
    })

    it('handles single module', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'only', path: 'only', size: 10, dependencies: [], exports: [], usedExports: [], isExternal: false },
      ]
      expect(analyzer.findDuplicates(modules)).toEqual([])
    })

    it('finds triple duplicates', () => {
      const analyzer = new ModuleAnalyzer()
      const modules: ModuleInfo[] = [
        { name: 'dup', path: 'd1', size: 10, dependencies: [], exports: [], usedExports: [], isExternal: false },
        { name: 'dup', path: 'd2', size: 10, dependencies: [], exports: [], usedExports: [], isExternal: false },
        { name: 'dup', path: 'd3', size: 10, dependencies: [], exports: [], usedExports: [], isExternal: false },
      ]
      const dupes = analyzer.findDuplicates(modules)
      expect(dupes.length).toBe(1)
      expect(dupes[0]!.length).toBe(3)
    })
  })

  // ─── ModuleAnalyzer: estimateGzipSize ─────────────────────────────────────────

  describe('estimateGzipSize', () => {
    it('estimates gzip as 30% of original size', () => {
      const analyzer = new ModuleAnalyzer()
      expect(analyzer.estimateGzipSize(1000)).toBe(300)
    })

    it('returns 0 for zero size', () => {
      const analyzer = new ModuleAnalyzer()
      expect(analyzer.estimateGzipSize(0)).toBe(0)
    })

    it('rounds the result', () => {
      const analyzer = new ModuleAnalyzer()
      const result = analyzer.estimateGzipSize(333)
      expect(result).toBe(Math.round(333 * 0.3))
    })

    it('handles large sizes', () => {
      const analyzer = new ModuleAnalyzer()
      expect(analyzer.estimateGzipSize(1_000_000)).toBe(300_000)
    })
  })
})

// ─── BundleAnalyzer: Constructor ─────────────────────────────────────────────

describe('BundleAnalyzer', () => {
  describe('constructor', () => {
    it('creates an instance with default config', () => {
      const ba = new BundleAnalyzer()
      const config = ba.getConfig()
      expect(config).toEqual(DEFAULT_ANALYZE_CONFIG)
    })

    it('creates an instance with partial custom config', () => {
      const ba = new BundleAnalyzer({ maxDepth: 5, excludeExternals: true })
      const config = ba.getConfig()
      expect(config.maxDepth).toBe(5)
      expect(config.excludeExternals).toBe(true)
      expect(config.entryPoint).toBe(DEFAULT_ANALYZE_CONFIG.entryPoint)
      expect(config.gzipEstimate).toBe(DEFAULT_ANALYZE_CONFIG.gzipEstimate)
    })

    it('creates an instance with fully custom config', () => {
      const custom: AnalyzeConfig = {
        entryPoint: 'src/index.ts',
        excludeExternals: true,
        maxDepth: 3,
        gzipEstimate: false,
      }
      const ba = new BundleAnalyzer(custom)
      expect(ba.getConfig()).toEqual(custom)
    })

    it('returns a copy of the config (not the same reference)', () => {
      const ba = new BundleAnalyzer()
      const config1 = ba.getConfig()
      const config2 = ba.getConfig()
      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2)
    })

    it('does not mutate the defaults when partial config is provided', () => {
      const ba = new BundleAnalyzer({ maxDepth: 99 })
      const config = ba.getConfig()
      expect(config.maxDepth).toBe(99)
      expect(DEFAULT_ANALYZE_CONFIG.maxDepth).toBe(10)
    })
  })

  // ─── BundleAnalyzer: analyze (basic) ──────────────────────────────────────────

  describe('analyze', () => {
    it('returns a valid report for an empty module map', () => {
      const ba = new BundleAnalyzer()
      const report = ba.analyze(new Map())
      expect(report.totalSize).toBe(0)
      expect(report.moduleCount).toBe(0)
      expect(report.externalCount).toBe(0)
      expect(report.modules).toEqual([])
      expect(report.treeShakeOpportunities).toEqual([])
      expect(report.duplicateDependencies).toEqual([])
      expect(report.largestModules).toEqual([])
      expect(report.estimatedGzipSize).toBe(0)
    })

    it('analyzes a single module with no imports or exports', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/main.ts', 'console.log("hello")'],
      ])
      const report = ba.analyze(modules)
      expect(report.moduleCount).toBe(1)
      expect(report.totalSize).toBe(Buffer.byteLength('console.log("hello")', 'utf-8'))
    })

    it('sets correct name from path', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/utils/helper.ts', 'export const x = 1'],
      ])
      const report = ba.analyze(modules)
      expect(report.modules[0]!.name).toBe('helper')
    })

    it('sets path from the map key', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/utils/helper.ts', 'export const x = 1'],
      ])
      const report = ba.analyze(modules)
      expect(report.modules[0]!.path).toBe('src/utils/helper.ts')
    })

    it('computes gzip estimate when gzipEstimate is true', () => {
      const ba = new BundleAnalyzer({ gzipEstimate: true })
      const modules = new Map<string, string>([
        ['src/a.ts', 'export const x = 1'],
      ])
      const report = ba.analyze(modules)
      expect(report.estimatedGzipSize).toBe(Math.round(report.totalSize * 0.3))
    })

    it('returns zero gzip when gzipEstimate is false', () => {
      const ba = new BundleAnalyzer({ gzipEstimate: false })
      const modules = new Map<string, string>([
        ['src/a.ts', 'export const x = 1'],
      ])
      const report = ba.analyze(modules)
      expect(report.estimatedGzipSize).toBe(0)
    })

    it('counts external modules correctly', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['lodash', 'export const _ = {}'],
        ['react', 'export const React = {}'],
        ['./app.ts', 'export const app = {}'],
      ])
      const report = ba.analyze(modules)
      expect(report.externalCount).toBe(3)
    })

    it('counts all modules when excludeExternals is false', () => {
      const ba = new BundleAnalyzer({ excludeExternals: false })
      const modules = new Map<string, string>([
        ['lodash', 'export const _ = {}'],
        ['src/app.ts', 'export const app = {}'],
      ])
      const report = ba.analyze(modules)
      expect(report.moduleCount).toBe(2)
    })

    it('excludes externals from moduleCount when excludeExternals is true', () => {
      const ba = new BundleAnalyzer({ excludeExternals: true })
      const modules = new Map<string, string>([
        ['lodash', 'export const _ = {}'],
        ['react', 'export const React = {}'],
        ['./app.ts', 'export const app = {}'],
      ])
      const report = ba.analyze(modules)
      expect(report.moduleCount).toBe(0)
    })

    it('excludes externals from totalSize when excludeExternals is true', () => {
      const ba = new BundleAnalyzer({ excludeExternals: true })
      const externalContent = 'x'.repeat(1000)
      const internalContent = 'y'.repeat(50)
      const modules = new Map<string, string>([
        ['lodash', externalContent],
        ['./app.ts', internalContent],
      ])
      const report = ba.analyze(modules)
      expect(report.totalSize).toBe(0)
      expect(report.externalCount).toBe(2)
    })

    it('still counts externalCount even when excludeExternals is true', () => {
      const ba = new BundleAnalyzer({ excludeExternals: true })
      const modules = new Map<string, string>([
        ['lodash', 'export const _ = {}'],
        ['./app.ts', 'export const app = {}'],
      ])
      const report = ba.analyze(modules)
      expect(report.externalCount).toBe(2)
    })
  })

  // ─── BundleAnalyzer: analyze (depth and imported) ─────────────────────────────

  describe('analyze (depth computation)', () => {
    it('assigns depth 0 to all modules when no entry point', () => {
      const ba = new BundleAnalyzer({ entryPoint: '' })
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from 'src/b.ts'"],
        ['src/b.ts', 'export const b = 1'],
      ])
      const report = ba.analyze(modules)
      for (const mod of report.modules) {
        expect(mod.depth).toBe(0)
      }
    })

    it('assigns depth 0 to the entry point module', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts' })
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from 'src/b.ts'"],
        ['src/b.ts', 'export const b = 1'],
      ])
      const report = ba.analyze(modules)
      const entryMod = report.modules.find((m) => m.path === 'src/a.ts')
      expect(entryMod!.depth).toBe(0)
    })

    it('assigns increasing depth to dependency chain', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts' })
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from './b'"],
        ['src/b.ts', "import { c } from './c'"],
        ['src/c.ts', 'export const c = 1'],
      ])
      const report = ba.analyze(modules)
      const bMod = report.modules.find((m) => m.path === 'src/b.ts')
      const cMod = report.modules.find((m) => m.path === 'src/c.ts')
      expect(bMod!.depth).toBe(1)
      expect(cMod!.depth).toBe(2)
    })

    it('assigns maxDepth to unreachable modules', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts', maxDepth: 10 })
      const modules = new Map<string, string>([
        ['src/a.ts', 'export const a = 1'],
        ['src/orphan.ts', 'export const orphan = 1'],
      ])
      const report = ba.analyze(modules)
      const orphanMod = report.modules.find((m) => m.path === 'src/orphan.ts')
      expect(orphanMod!.depth).toBe(10)
    })

    it('clamps depth to maxDepth', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts', maxDepth: 1 })
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from './b'"],
        ['src/b.ts', "import { c } from './c'"],
        ['src/c.ts', 'export const c = 1'],
      ])
      const report = ba.analyze(modules)
      const cMod = report.modules.find((m) => m.path === 'src/c.ts')
      expect(cMod!.depth).toBe(1)
    })

    it('resolves relative imports correctly', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/index.ts' })
      const modules = new Map<string, string>([
        ['src/index.ts', "import { foo } from './utils'"],
        ['src/utils.ts', 'export const foo = 1'],
      ])
      const report = ba.analyze(modules)
      const utilsMod = report.modules.find((m) => m.path === 'src/utils.ts')
      expect(utilsMod!.depth).toBe(1)
    })

    it('resolves parent directory relative imports', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/sub/index.ts' })
      const modules = new Map<string, string>([
        ['src/sub/index.ts', "import { foo } from '../utils'"],
        ['src/utils.ts', 'export const foo = 1'],
      ])
      const report = ba.analyze(modules)
      const utilsMod = report.modules.find((m) => m.path === 'src/utils.ts')
      expect(utilsMod!.depth).toBe(1)
    })
  })

  // ─── BundleAnalyzer: analyze (imported tracking) ──────────────────────────────

  describe('analyze (imported tracking)', () => {
    it('marks all modules as imported when no entry point', () => {
      const ba = new BundleAnalyzer({ entryPoint: '' })
      const modules = new Map<string, string>([
        ['src/a.ts', 'export const a = 1'],
        ['src/b.ts', 'export const b = 1'],
      ])
      const report = ba.analyze(modules)
      for (const mod of report.modules) {
        expect(mod.imported).toBe(true)
      }
    })

    it('marks entry point as imported', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts' })
      const modules = new Map<string, string>([
        ['src/a.ts', 'export const a = 1'],
        ['src/b.ts', 'export const b = 1'],
      ])
      const report = ba.analyze(modules)
      const aMod = report.modules.find((m) => m.path === 'src/a.ts')
      expect(aMod!.imported).toBe(true)
    })

    it('marks transitive dependencies as imported', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts' })
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from './b'"],
        ['src/b.ts', "import { c } from './c'"],
        ['src/c.ts', 'export const c = 1'],
      ])
      const report = ba.analyze(modules)
      for (const mod of report.modules) {
        expect(mod.imported).toBe(true)
      }
    })

    it('marks orphan modules as not imported', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts' })
      const modules = new Map<string, string>([
        ['src/a.ts', 'export const a = 1'],
        ['src/orphan.ts', 'export const orphan = 1'],
      ])
      const report = ba.analyze(modules)
      const orphan = report.modules.find((m) => m.path === 'src/orphan.ts')
      expect(orphan!.imported).toBe(false)
    })

    it('handles entry point that does not exist in map', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'nonexistent.ts' })
      const modules = new Map<string, string>([
        ['src/a.ts', 'export const a = 1'],
      ])
      const report = ba.analyze(modules)
      expect(report.moduleCount).toBe(1)
    })
  })

  // ─── BundleAnalyzer: analyze (cost computation) ──────────────────────────────

  describe('analyze (cost computation)', () => {
    it('cost equals size for depth 0', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts' })
      const content = 'x'.repeat(100)
      const modules = new Map<string, string>([
        ['src/a.ts', content],
      ])
      const report = ba.analyze(modules)
      const aMod = report.modules.find((m) => m.path === 'src/a.ts')
      expect(aMod!.cost).toBe(aMod!.size)
    })

    it('cost is size divided by depth for depth > 0', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts' })
      const aContent = "import { b } from './b'"
      const bContent = 'x'.repeat(200)
      const modules = new Map<string, string>([
        ['src/a.ts', aContent],
        ['src/b.ts', bContent],
      ])
      const report = ba.analyze(modules)
      const bMod = report.modules.find((m) => m.path === 'src/b.ts')
      expect(bMod!.depth).toBe(1)
      expect(bMod!.cost).toBe(Math.round(bMod!.size / 1))
    })

    it('cost is rounded', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts', maxDepth: 3 })
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from './b'"],
        ['src/b.ts', "import { c } from './c'"],
        ['src/c.ts', 'x'.repeat(100)],
      ])
      const report = ba.analyze(modules)
      const cMod = report.modules.find((m) => m.path === 'src/c.ts')
      expect(cMod!.depth).toBe(2)
      expect(cMod!.cost).toBe(Math.round(cMod!.size / 2))
    })
  })

  // ─── BundleAnalyzer: analyze (used exports propagation) ───────────────────────

  describe('analyze (used exports propagation)', () => {
    it('extracts used exports from import statements', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', "import { foo } from 'lodash'"],
      ])
      const report = ba.analyze(modules)
      expect(report.modules[0]!.usedExports).toContain('foo')
    })

    it('extracts aliased imports using original name', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', "import { foo as bar } from 'lodash'"],
      ])
      const report = ba.analyze(modules)
      expect(report.modules[0]!.usedExports).toContain('foo')
    })

    it('extracts multiple names from a single import', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', "import { foo, bar, baz } from 'mod'"],
      ])
      const report = ba.analyze(modules)
      expect(report.modules[0]!.usedExports).toContain('foo')
      expect(report.modules[0]!.usedExports).toContain('bar')
      expect(report.modules[0]!.usedExports).toContain('baz')
    })

    it('propagates used exports from dependencies to dep module', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['./a.ts', "import { foo } from 'b'"],
        ['b', 'export const foo = 1\nexport const bar = 2'],
      ])
      const report = ba.analyze(modules)
      const bMod = report.modules.find((m) => m.path === 'b')
      expect(bMod!.usedExports).toContain('foo')
      expect(bMod!.usedExports).toContain('bar')
    })
  })

  // ─── BundleAnalyzer: analyze (tree shaking) ──────────────────────────────────

  describe('analyze (tree shake opportunities)', () => {
    it('reports tree shake opportunities for unused exports', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/lib.ts', 'export const used = 1\nexport const unused = 2'],
      ])
      const report = ba.analyze(modules)
      expect(report.treeShakeOpportunities.length).toBeGreaterThan(0)
    })

    it('reports no tree shake opportunities when all exports are used', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['./a.ts', "import { foo } from 'b'"],
        ['b', 'export const foo = 1'],
      ])
      const report = ba.analyze(modules)
      const bOpportunity = report.treeShakeOpportunities.find((t) => t.module === 'b')
      expect(bOpportunity).toBeUndefined()
    })
  })

  // ─── BundleAnalyzer: analyze (duplicate detection) ───────────────────────────

  describe('analyze (duplicate detection)', () => {
    it('reports no duplicates for unique module names', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', 'export const a = 1'],
        ['src/b.ts', 'export const b = 1'],
      ])
      const report = ba.analyze(modules)
      expect(report.duplicateDependencies).toEqual([])
    })

    it('reports duplicates when module names collide', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/utils.ts', 'export const a = 1'],
        ['lib/utils.ts', 'export const b = 1'],
      ])
      const report = ba.analyze(modules)
      expect(report.duplicateDependencies.length).toBe(1)
      expect(report.duplicateDependencies[0]).toContain('src/utils.ts')
      expect(report.duplicateDependencies[0]).toContain('lib/utils.ts')
    })
  })

  // ─── BundleAnalyzer: analyze (largest modules) ───────────────────────────────

  describe('analyze (largest modules in report)', () => {
    it('includes largestModules in report', () => {
      const ba = new BundleAnalyzer()
      const big = 'x'.repeat(500)
      const small = 'y'.repeat(50)
      const modules = new Map<string, string>([
        ['src/big.ts', big],
        ['src/small.ts', small],
      ])
      const report = ba.analyze(modules)
      expect(report.largestModules.length).toBeGreaterThan(0)
      expect(report.largestModules[0]!.size).toBeGreaterThanOrEqual(report.largestModules[1]!.size)
    })
  })

  // ─── BundleAnalyzer: getLargestModules ────────────────────────────────────────

  describe('getLargestModules', () => {
    it('returns top N modules by size', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', 'x'.repeat(100)],
        ['src/b.ts', 'x'.repeat(300)],
        ['src/c.ts', 'x'.repeat(200)],
      ])
      const report = ba.analyze(modules)
      const largest = ba.getLargestModules(report, 2)
      expect(largest.length).toBe(2)
      expect(largest[0]!.size).toBeGreaterThanOrEqual(largest[1]!.size)
    })

    it('defaults to top 5', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>()
      for (let i = 0; i < 10; i++) {
        modules.set(`src/mod${i}.ts`, 'x'.repeat(i * 100))
      }
      const report = ba.analyze(modules)
      const largest = ba.getLargestModules(report)
      expect(largest.length).toBe(5)
    })

    it('returns fewer modules if count exceeds available', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', 'x'.repeat(100)],
      ])
      const report = ba.analyze(modules)
      const largest = ba.getLargestModules(report, 10)
      expect(largest.length).toBe(1)
    })

    it('returns empty for empty report', () => {
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
      const largest = ba.getLargestModules(report)
      expect(largest).toEqual([])
    })

    it('does not mutate the original modules array', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', 'x'.repeat(100)],
        ['src/b.ts', 'x'.repeat(200)],
      ])
      const report = ba.analyze(modules)
      const originalOrder = report.modules.map((m) => m.path)
      ba.getLargestModules(report)
      const afterOrder = report.modules.map((m) => m.path)
      expect(originalOrder).toEqual(afterOrder)
    })
  })

  // ─── BundleAnalyzer: getTreeShakeReport ───────────────────────────────────────

  describe('getTreeShakeReport', () => {
    it('returns tree shake opportunities sorted by potential savings descending', () => {
      const ba = new BundleAnalyzer()
      const report: BundleReport = {
        totalSize: 0,
        moduleCount: 0,
        externalCount: 0,
        modules: [],
        treeShakeOpportunities: [
          { module: 'a', unusedExports: ['x'], potentialSavings: 100 },
          { module: 'b', unusedExports: ['y'], potentialSavings: 500 },
          { module: 'c', unusedExports: ['z'], potentialSavings: 300 },
        ],
        duplicateDependencies: [],
        largestModules: [],
        estimatedGzipSize: 0,
      }
      const result = ba.getTreeShakeReport(report)
      expect(result[0]!.potentialSavings).toBe(500)
      expect(result[1]!.potentialSavings).toBe(300)
      expect(result[2]!.potentialSavings).toBe(100)
    })

    it('returns empty for no opportunities', () => {
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
      expect(ba.getTreeShakeReport(report)).toEqual([])
    })

    it('does not mutate the original report', () => {
      const ba = new BundleAnalyzer()
      const report: BundleReport = {
        totalSize: 0,
        moduleCount: 0,
        externalCount: 0,
        modules: [],
        treeShakeOpportunities: [
          { module: 'a', unusedExports: ['x'], potentialSavings: 100 },
          { module: 'b', unusedExports: ['y'], potentialSavings: 500 },
        ],
        duplicateDependencies: [],
        largestModules: [],
        estimatedGzipSize: 0,
      }
      const originalOrder = report.treeShakeOpportunities.map((t) => t.module)
      ba.getTreeShakeReport(report)
      const afterOrder = report.treeShakeOpportunities.map((t) => t.module)
      expect(originalOrder).toEqual(afterOrder)
    })
  })

  // ─── BundleAnalyzer: getDependencyChains ──────────────────────────────────────

  describe('getDependencyChains', () => {
    it('returns a chain map for all modules', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from './b'"],
        ['src/b.ts', 'export const b = 1'],
      ])
      const report = ba.analyze(modules)
      const chains = ba.getDependencyChains(report)
      expect(chains.size).toBe(2)
      expect(chains.has('src/a.ts')).toBe(true)
      expect(chains.has('src/b.ts')).toBe(true)
    })

    it('resolves linear dependency chain', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from './b'"],
        ['src/b.ts', "import { c } from './c'"],
        ['src/c.ts', 'export const c = 1'],
      ])
      const report = ba.analyze(modules)
      const chains = ba.getDependencyChains(report)
      const aChain = chains.get('src/a.ts')
      expect(aChain).toBeDefined()
      expect(aChain![0]).toBe('src/a.ts')
    })

    it('handles circular dependencies without infinite loop', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from './b'"],
        ['src/b.ts', "import { a } from './a'"],
      ])
      const report = ba.analyze(modules)
      // Should not hang - the Set<string> visited prevents infinite recursion
      const chains = ba.getDependencyChains(report)
      expect(chains.size).toBe(2)
    })

    it('handles modules with no dependencies', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/leaf.ts', 'export const x = 1'],
      ])
      const report = ba.analyze(modules)
      const chains = ba.getDependencyChains(report)
      const leafChain = chains.get('src/leaf.ts')
      expect(leafChain).toEqual(['src/leaf.ts'])
    })

    it('resolves dependencies by name when path does not match', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', "import { something } from 'b'"],
        ['b', 'export const something = 1'],
      ])
      const report = ba.analyze(modules)
      const chains = ba.getDependencyChains(report)
      expect(chains.size).toBe(2)
    })

    it('handles modules with dependencies that do not exist', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/a.ts', "import { ghost } from 'nonexistent'"],
      ])
      const report = ba.analyze(modules)
      const chains = ba.getDependencyChains(report)
      const aChain = chains.get('src/a.ts')
      expect(aChain).toEqual(['src/a.ts'])
    })
  })

  // ─── BundleAnalyzer: getConfig ────────────────────────────────────────────────

  describe('getConfig', () => {
    it('returns the current config', () => {
      const ba = new BundleAnalyzer({ maxDepth: 7 })
      expect(ba.getConfig().maxDepth).toBe(7)
    })

    it('returns a shallow copy', () => {
      const ba = new BundleAnalyzer()
      const config = ba.getConfig()
      config.maxDepth = 999
      expect(ba.getConfig().maxDepth).toBe(DEFAULT_ANALYZE_CONFIG.maxDepth)
    })
  })

  // ─── BundleAnalyzer: edge cases ──────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles module with only whitespace content', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/empty.ts', '   \n\t  \n  '],
      ])
      const report = ba.analyze(modules)
      expect(report.moduleCount).toBe(1)
      expect(report.modules[0]!.exports).toEqual([])
      expect(report.modules[0]!.dependencies).toEqual([])
    })

    it('handles module with complex import patterns', () => {
      const ba = new BundleAnalyzer()
      const content = `
        import React, { useState, useEffect } from 'react'
        import type { FC } from 'react'
        import * as _ from 'lodash'
        import { map, filter } from 'lodash'
      `
      const modules = new Map<string, string>([
        ['src/app.tsx', content],
      ])
      const report = ba.analyze(modules)
      expect(report.modules[0]!.dependencies).toContain('react')
      expect(report.modules[0]!.dependencies).toContain('lodash')
    })

    it('handles module with mixed export types', () => {
      const ba = new BundleAnalyzer()
      const content = `
        export const foo = 1
        export function bar() {}
        export class Baz {}
        export interface Qux {}
        export type Alias = string
        export enum Color { Red }
        export { reexported }
        export default function main() {}
      `
      const modules = new Map<string, string>([
        ['src/mod.ts', content],
      ])
      const report = ba.analyze(modules)
      const mod = report.modules[0]!
      expect(mod.exports).toContain('foo')
      expect(mod.exports).toContain('bar')
      expect(mod.exports).toContain('Baz')
      expect(mod.exports).toContain('Qux')
      expect(mod.exports).toContain('Alias')
      expect(mod.exports).toContain('Color')
      expect(mod.exports).toContain('reexported')
      expect(mod.exports).toContain('main')
    })

    it('handles deeply nested dependency graph', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/level0.ts', maxDepth: 20 })
      const modules = new Map<string, string>()
      for (let i = 0; i < 15; i++) {
        const next = i < 14 ? `import { x } from './level${i + 1}'` : ''
        modules.set(`src/level${i}.ts`, next)
      }
      const report = ba.analyze(modules)
      const l14 = report.modules.find((m) => m.path === 'src/level14.ts')
      expect(l14!.depth).toBe(14)
      expect(l14!.imported).toBe(true)
    })

    it('handles diamond dependency pattern', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts' })
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from './b'\nimport { c } from './c'"],
        ['src/b.ts', "import { d } from './d'"],
        ['src/c.ts', "import { d } from './d'"],
        ['src/d.ts', 'export const d = 1'],
      ])
      const report = ba.analyze(modules)
      const dMod = report.modules.find((m) => m.path === 'src/d.ts')
      expect(dMod!.imported).toBe(true)
      expect(dMod!.depth).toBe(2)
    })

    it('handles entry point not in module map', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'missing.ts' })
      const modules = new Map<string, string>([
        ['src/a.ts', 'export const a = 1'],
      ])
      const report = ba.analyze(modules)
      expect(report.moduleCount).toBe(1)
      expect(report.modules[0]!.depth).toBe(DEFAULT_ANALYZE_CONFIG.maxDepth)
    })

    it('handles single module as both entry and only module', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/solo.ts' })
      const modules = new Map<string, string>([
        ['src/solo.ts', 'export const solo = true'],
      ])
      const report = ba.analyze(modules)
      expect(report.modules[0]!.imported).toBe(true)
      expect(report.modules[0]!.depth).toBe(0)
    })

    it('handles modules with string containing import-like patterns in comments', () => {
      const ba = new BundleAnalyzer()
      const content = `
        // import { fake } from 'not-real'
        export const real = 1
      `
      const modules = new Map<string, string>([
        ['src/a.ts', content],
      ])
      const report = ba.analyze(modules)
      expect(report.modules[0]!.exports).toContain('real')
    })

    it('handles type-only import with alias', () => {
      const ba = new BundleAnalyzer()
      const content = "import type { Config as C } from './config'"
      const modules = new Map<string, string>([
        ['src/a.ts', content],
      ])
      const report = ba.analyze(modules)
      expect(report.modules[0]!.dependencies).toContain('./config')
      expect(report.modules[0]!.usedExports).toContain('Config')
    })

    it('handles multiple named re-exports with aliases', () => {
      const ba = new ModuleAnalyzer()
      const info = ba.analyzeModule('test', "export { a as x, b as y, c } from 'mod'")
      expect(info.exports).toContain('a')
      expect(info.exports).toContain('b')
      expect(info.exports).toContain('c')
    })

    it('handles export default class with name', () => {
      const ba = new ModuleAnalyzer()
      const info = ba.analyzeModule('test', 'export default class MyComponent {}')
      expect(info.exports).toContain('MyComponent')
    })

    it('handles zero maxDepth', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts', maxDepth: 0 })
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from './b'"],
        ['src/b.ts', 'export const b = 1'],
      ])
      const report = ba.analyze(modules)
      for (const mod of report.modules) {
        expect(mod.depth).toBe(0)
      }
    })

    it('computes totalSize correctly across multiple modules', () => {
      const ba = new BundleAnalyzer()
      const content1 = 'a'.repeat(50)
      const content2 = 'b'.repeat(150)
      const modules = new Map<string, string>([
        ['src/a.ts', content1],
        ['src/b.ts', content2],
      ])
      const report = ba.analyze(modules)
      const expectedSize = Buffer.byteLength(content1, 'utf-8') + Buffer.byteLength(content2, 'utf-8')
      expect(report.totalSize).toBe(expectedSize)
    })

    it('handles module content with only imports and no exports', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/bootstrap.ts', "import { init } from './init'\ninit()"],
      ])
      const report = ba.analyze(modules)
      expect(report.modules[0]!.exports).toEqual([])
      expect(report.modules[0]!.dependencies.length).toBeGreaterThan(0)
    })

    it('handles the normalize path logic through relative imports', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a/index.ts' })
      const modules = new Map<string, string>([
        ['src/a/index.ts', "import { foo } from '../b'"],
        ['src/b.ts', 'export const foo = 1'],
      ])
      const report = ba.analyze(modules)
      const bMod = report.modules.find((m) => m.path === 'src/b.ts')
      expect(bMod).toBeDefined()
      expect(bMod!.imported).toBe(true)
    })

    it('handles the normalize path with double-dot traversal', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a/b/c.ts' })
      const modules = new Map<string, string>([
        ['src/a/b/c.ts', "import { x } from '../../d'"],
        ['src/d.ts', 'export const x = 1'],
      ])
      const report = ba.analyze(modules)
      const dMod = report.modules.find((m) => m.path === 'src/d.ts')
      expect(dMod).toBeDefined()
      expect(dMod!.depth).toBe(1)
    })
  })

  // ─── BundleAnalyzer: integration scenarios ────────────────────────────────────

  describe('integration scenarios', () => {
    it('full analysis of a small project', () => {
      const ba = new BundleAnalyzer({
        entryPoint: 'src/index.ts',
        excludeExternals: false,
        maxDepth: 10,
        gzipEstimate: true,
      })
      const modules = new Map<string, string>([
        ['src/index.ts', "import { foo } from './utils'\nimport React from 'react'"],
        ['src/utils.ts', "export const foo = 1\nexport const bar = 2"],
        ['react', 'export default function React() {}'],
      ])
      const report = ba.analyze(modules)

      expect(report.moduleCount).toBe(3)
      expect(report.externalCount).toBe(3)
      expect(report.totalSize).toBeGreaterThan(0)
      expect(report.estimatedGzipSize).toBe(Math.round(report.totalSize * 0.3))

      const indexMod = report.modules.find((m) => m.path === 'src/index.ts')
      expect(indexMod!.depth).toBe(0)
      expect(indexMod!.imported).toBe(true)

      const utilsMod = report.modules.find((m) => m.path === 'src/utils.ts')
      expect(utilsMod!.depth).toBe(1)
      expect(utilsMod!.imported).toBe(true)

      const reactMod = report.modules.find((m) => m.path === 'react')
      expect(reactMod!.isExternal).toBe(true)

      expect(report.largestModules.length).toBeGreaterThan(0)
      expect(report.largestModules[0]!.size).toBeGreaterThanOrEqual(
        report.largestModules[report.largestModules.length - 1]!.size,
      )
    })

    it('getDependencyChains with full project', () => {
      const ba = new BundleAnalyzer({ entryPoint: 'src/a.ts' })
      const modules = new Map<string, string>([
        ['src/a.ts', "import { b } from './b'"],
        ['src/b.ts', "import { c } from './c'"],
        ['src/c.ts', 'export const c = 1'],
      ])
      const report = ba.analyze(modules)
      const chains = ba.getDependencyChains(report)
      const aChain = chains.get('src/a.ts')
      expect(aChain).toBeDefined()
      expect(aChain!.length).toBeGreaterThanOrEqual(1)
      expect(aChain![0]).toBe('src/a.ts')
    })

    it('getTreeShakeReport with unused exports', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/lib.ts', 'export const used = 1\nexport const unused1 = 2\nexport const unused2 = 3'],
      ])
      const report = ba.analyze(modules)
      const tsReport = ba.getTreeShakeReport(report)
      expect(tsReport.length).toBeGreaterThan(0)
      const libOpp = tsReport.find((t) => t.module === 'lib')
      expect(libOpp).toBeDefined()
    })

    it('getLargestModules from a realistic project', () => {
      const ba = new BundleAnalyzer()
      const modules = new Map<string, string>([
        ['src/tiny.ts', 'x'],
        ['src/medium.ts', 'x'.repeat(500)],
        ['src/large.ts', 'x'.repeat(2000)],
        ['src/huge.ts', 'x'.repeat(5000)],
      ])
      const report = ba.analyze(modules)
      const largest = ba.getLargestModules(report, 3)
      expect(largest.length).toBe(3)
      expect(largest[0]!.name).toBe('huge')
      expect(largest[1]!.name).toBe('large')
      expect(largest[2]!.name).toBe('medium')
    })

    it('excludes externals from modules list but still processes them', () => {
      const ba = new BundleAnalyzer({ excludeExternals: true })
      const modules = new Map<string, string>([
        ['lodash', 'export const _ = {}'],
        ['react', 'export const React = {}'],
        ['./app.ts', "import _ from 'lodash'"],
      ])
      const report = ba.analyze(modules)
      expect(report.modules.length).toBe(0)
      expect(report.externalCount).toBe(3)
      expect(report.totalSize).toBe(0)
    })
  })
})
