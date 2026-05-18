import { describe, it, expect } from 'vitest'
import { BundleAnalyzer } from '../../../src/core/bundle-analyzer/bundle-analyzer.js'
import { DEFAULT_ANALYZE_CONFIG } from '../../../src/core/bundle-analyzer/types.js'
import type { BundleReport } from '../../../src/core/bundle-analyzer/types.js'

// ─── Helpers ───

function makeModules(entries: [string, string][]): Map<string, string> {
  return new Map(entries)
}

function simpleModule(path: string, content: string): Map<string, string> {
  return makeModules([[path, content]])
}

// ─── Constructor ───

describe('BundleAnalyzer', () => {
  describe('constructor', () => {
    it('creates analyzer with default config', () => {
      const analyzer = new BundleAnalyzer()
      const config = analyzer.getConfig()
      expect(config).toEqual(DEFAULT_ANALYZE_CONFIG)
    })

    it('merges partial config with defaults', () => {
      const analyzer = new BundleAnalyzer({ entryPoint: 'src/index.ts', maxDepth: 3 })
      const config = analyzer.getConfig()
      expect(config.entryPoint).toBe('src/index.ts')
      expect(config.maxDepth).toBe(3)
      expect(config.excludeExternals).toBe(DEFAULT_ANALYZE_CONFIG.excludeExternals)
      expect(config.gzipEstimate).toBe(DEFAULT_ANALYZE_CONFIG.gzipEstimate)
    })

    it('does not mutate the default config', () => {
      const analyzer = new BundleAnalyzer({ maxDepth: 99 })
      const another = new BundleAnalyzer()
      expect(another.getConfig().maxDepth).toBe(DEFAULT_ANALYZE_CONFIG.maxDepth)
    })

    it('returns a copy of config from getConfig', () => {
      const analyzer = new BundleAnalyzer()
      const cfg1 = analyzer.getConfig()
      const cfg2 = analyzer.getConfig()
      expect(cfg1).toEqual(cfg2)
      expect(cfg1).not.toBe(cfg2)
    })
  })

  // ─── analyze() ───

  describe('analyze', () => {
    it('returns a report for a single module', () => {
      const analyzer = new BundleAnalyzer({ gzipEstimate: false })
      const modules = simpleModule('src/utils.ts', 'export const foo = 1')
      const report = analyzer.analyze(modules)
      expect(report.moduleCount).toBe(1)
      expect(report.totalSize).toBeGreaterThan(0)
    })

    it('returns zero counts for empty module map', () => {
      const analyzer = new BundleAnalyzer()
      const report = analyzer.analyze(new Map())
      expect(report.moduleCount).toBe(0)
      expect(report.totalSize).toBe(0)
      expect(report.externalCount).toBe(0)
      expect(report.modules).toEqual([])
      expect(report.treeShakeOpportunities).toEqual([])
      expect(report.duplicateDependencies).toEqual([])
      expect(report.largestModules).toEqual([])
      expect(report.estimatedGzipSize).toBe(0)
    })

    it('counts totalSize as sum of module sizes', () => {
      const analyzer = new BundleAnalyzer({ gzipEstimate: false })
      const modules = makeModules([
        ['a.ts', 'export const a = 1'],
        ['b.ts', 'export const b = 2; export const c = 3'],
      ])
      const report = analyzer.analyze(modules)
      const sumSizes = report.modules.reduce((s, m) => s + m.size, 0)
      expect(report.totalSize).toBe(sumSizes)
    })

    it('counts modules correctly', () => {
      const analyzer = new BundleAnalyzer()
      const modules = makeModules([
        ['a.ts', 'export const a = 1'],
        ['b.ts', 'export const b = 2'],
        ['c.ts', 'export const c = 3'],
      ])
      const report = analyzer.analyze(modules)
      expect(report.moduleCount).toBe(3)
    })

    it('marks modules as external when name is not path-like', () => {
      const analyzer = new BundleAnalyzer()
      const modules = makeModules([
        ['lodash', 'module.exports = {}'],
        ['react', 'module.exports = React'],
      ])
      const report = analyzer.analyze(modules)
      expect(report.externalCount).toBe(2)
      expect(report.modules.every((m) => m.isExternal)).toBe(true)
    })

    it('excludeExternals filters all external-flagged modules', () => {
      const analyzer = new BundleAnalyzer({ excludeExternals: true })
      const modules = makeModules([
        ['lodash', 'module.exports = {}'],
        ['./src/app', 'export const app = 1'],
      ])
      const report = analyzer.analyze(modules)
      expect(report.modules.every((m) => !m.isExternal)).toBe(true)
      expect(report.moduleCount).toBeLessThanOrEqual(2)
    })

    it('estimates gzip size when gzipEstimate is true', () => {
      const analyzer = new BundleAnalyzer({ gzipEstimate: true, excludeExternals: false })
      const modules = simpleModule('app.ts', 'export const x = 12345')
      const report = analyzer.analyze(modules)
      expect(report.estimatedGzipSize).toBeGreaterThan(0)
      expect(report.estimatedGzipSize).toBe(Math.round(report.totalSize * 0.3))
    })

    it('returns zero gzip size when gzipEstimate is false', () => {
      const analyzer = new BundleAnalyzer({ gzipEstimate: false })
      const modules = simpleModule('app.ts', 'export const x = 12345')
      const report = analyzer.analyze(modules)
      expect(report.estimatedGzipSize).toBe(0)
    })

    it('populates largestModules', () => {
      const analyzer = new BundleAnalyzer()
      const modules = makeModules([
        ['small.ts', 'a'],
        ['large.ts', 'export const x = "a very long string that makes this module larger than the other one"'],
      ])
      const report = analyzer.analyze(modules)
      expect(report.largestModules.length).toBeGreaterThan(0)
      expect(report.largestModules[0]!.size).toBeGreaterThanOrEqual(
        report.largestModules[report.largestModules.length - 1]!.size,
      )
    })

    it('extracts exports from module content', () => {
      const analyzer = new BundleAnalyzer()
      const modules = simpleModule('mod.ts', 'export const foo = 1\nexport function bar() {}')
      const report = analyzer.analyze(modules)
      expect(report.modules[0]!.exports).toContain('foo')
      expect(report.modules[0]!.exports).toContain('bar')
    })

    it('computes depth from entry point', () => {
      const analyzer = new BundleAnalyzer({ entryPoint: 'main.ts' })
      const modules = makeModules([
        ['main.ts', "import { foo } from './utils'"],
        ['utils.ts', 'export const foo = 1'],
      ])
      const report = analyzer.analyze(modules)
      const main = report.modules.find((m) => m.path === 'main.ts')
      const utils = report.modules.find((m) => m.path === 'utils.ts')
      expect(main).toBeDefined()
      expect(utils).toBeDefined()
      expect(main!.depth).toBe(0)
      expect(utils!.depth).toBe(1)
    })

    it('marks imported modules correctly from entry point', () => {
      const analyzer = new BundleAnalyzer({ entryPoint: 'main.ts' })
      const modules = makeModules([
        ['main.ts', "import { foo } from './utils'"],
        ['utils.ts', 'export const foo = 1'],
        ['orphan.ts', 'export const orphan = true'],
      ])
      const report = analyzer.analyze(modules)
      const main = report.modules.find((m) => m.path === 'main.ts')!
      const utils = report.modules.find((m) => m.path === 'utils.ts')!
      const orphan = report.modules.find((m) => m.path === 'orphan.ts')!
      expect(main.imported).toBe(true)
      expect(utils.imported).toBe(true)
      expect(orphan.imported).toBe(false)
    })

    it('marks all modules as imported when entryPoint is empty', () => {
      const analyzer = new BundleAnalyzer({ entryPoint: '' })
      const modules = makeModules([
        ['a.ts', 'export const a = 1'],
        ['b.ts', 'export const b = 2'],
      ])
      const report = analyzer.analyze(modules)
      expect(report.modules.every((m) => m.imported)).toBe(true)
    })

    it('sets depth to maxDepth for unreachable modules', () => {
      const analyzer = new BundleAnalyzer({ entryPoint: 'main.ts', maxDepth: 5 })
      const modules = makeModules([
        ['main.ts', 'export const main = 1'],
        ['orphan.ts', 'export const orphan = 1'],
      ])
      const report = analyzer.analyze(modules)
      const orphan = report.modules.find((m) => m.path === 'orphan.ts')!
      expect(orphan.depth).toBe(5)
    })

    it('computes cost based on size and depth', () => {
      const analyzer = new BundleAnalyzer({ entryPoint: 'main.ts' })
      const modules = makeModules([
        ['main.ts', "import { foo } from './dep'"],
        ['dep.ts', 'export const foo = 12345'],
      ])
      const report = analyzer.analyze(modules)
      const main = report.modules.find((m) => m.path === 'main.ts')!
      const dep = report.modules.find((m) => m.path === 'dep.ts')!
      expect(main.cost).toBe(main.size)
      expect(dep.cost).toBe(Math.round(dep.size / dep.depth))
    })
  })

  // ─── getLargestModules() ───

  describe('getLargestModules', () => {
    it('returns modules sorted by size descending', () => {
      const analyzer = new BundleAnalyzer()
      const modules = makeModules([
        ['small.ts', 'a'],
        ['medium.ts', 'export const m = "medium size"'],
        ['large.ts', 'export const l = "a very large module content here"'],
      ])
      const report = analyzer.analyze(modules)
      const largest = analyzer.getLargestModules(report)
      for (let i = 1; i < largest.length; i++) {
        expect(largest[i - 1]!.size).toBeGreaterThanOrEqual(largest[i]!.size)
      }
    })

    it('respects the count parameter', () => {
      const analyzer = new BundleAnalyzer()
      const modules = makeModules([
        ['a.ts', 'aaaa'],
        ['b.ts', 'bbbb'],
        ['c.ts', 'cccc'],
        ['d.ts', 'dddd'],
      ])
      const report = analyzer.analyze(modules)
      const largest = analyzer.getLargestModules(report, 2)
      expect(largest.length).toBe(2)
    })

    it('returns all modules if count exceeds total', () => {
      const analyzer = new BundleAnalyzer()
      const report = analyzer.analyze(makeModules([['a.ts', 'a']]))
      const largest = analyzer.getLargestModules(report, 10)
      expect(largest.length).toBe(1)
    })

    it('returns empty array for empty report', () => {
      const analyzer = new BundleAnalyzer()
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
      expect(analyzer.getLargestModules(report)).toEqual([])
    })
  })

  // ─── getTreeShakeReport() ───

  describe('getTreeShakeReport', () => {
    it('returns opportunities sorted by potentialSavings descending', () => {
      const analyzer = new BundleAnalyzer()
      const modules = makeModules([
        ['a.ts', 'export const a1 = 1; export const a2 = 2; export const a3 = 3'],
        ['b.ts', 'export const b1 = 1; export const b2 = 2'],
      ])
      const report = analyzer.analyze(modules)
      if (report.treeShakeOpportunities.length > 1) {
        const sorted = analyzer.getTreeShakeReport(report)
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i - 1]!.potentialSavings).toBeGreaterThanOrEqual(sorted[i]!.potentialSavings)
        }
      }
    })

    it('returns empty array when no opportunities', () => {
      const analyzer = new BundleAnalyzer()
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
      expect(analyzer.getTreeShakeReport(report)).toEqual([])
    })
  })

  // ─── getDependencyChains() ───

  describe('getDependencyChains', () => {
    it('returns chain for each module', () => {
      const analyzer = new BundleAnalyzer({ entryPoint: '' })
      const modules = makeModules([
        ['main.ts', "import { foo } from './dep'"],
        ['dep.ts', 'export const foo = 1'],
      ])
      const report = analyzer.analyze(modules)
      const chains = analyzer.getDependencyChains(report)
      expect(chains.size).toBe(report.modules.length)
    })

    it('resolves dependency chains through transitive deps', () => {
      const analyzer = new BundleAnalyzer({ entryPoint: 'a.ts' })
      const modules = makeModules([
        ['a.ts', "import { b } from './b'"],
        ['b.ts', "import { c } from './c'"],
        ['c.ts', 'export const c = 1'],
      ])
      const report = analyzer.analyze(modules)
      const chains = analyzer.getDependencyChains(report)
      const chainA = chains.get('a.ts')
      expect(chainA).toBeDefined()
      expect(chainA).toContain('a.ts')
    })

    it('handles circular dependencies without infinite loop', () => {
      const analyzer = new BundleAnalyzer({ entryPoint: 'a.ts' })
      const modules = makeModules([
        ['a.ts', "import { b } from './b'"],
        ['b.ts', "import { a } from './a'"],
      ])
      const report = analyzer.analyze(modules)
      const chains = analyzer.getDependencyChains(report)
      expect(chains.size).toBe(2)
      expect(chains.get('a.ts')).toBeDefined()
      expect(chains.get('b.ts')).toBeDefined()
    })

    it('returns empty chain for modules with no dependencies', () => {
      const analyzer = new BundleAnalyzer({ entryPoint: '' })
      const modules = simpleModule('solo.ts', 'export const solo = 1')
      const report = analyzer.analyze(modules)
      const chains = analyzer.getDependencyChains(report)
      const chain = chains.get('solo.ts')
      expect(chain).toEqual(['solo.ts'])
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles module with empty content', () => {
      const analyzer = new BundleAnalyzer()
      const modules = simpleModule('empty.ts', '')
      const report = analyzer.analyze(modules)
      expect(report.moduleCount).toBe(1)
      expect(report.totalSize).toBe(0)
    })

    it('handles deeply nested path in module key', () => {
      const analyzer = new BundleAnalyzer()
      const modules = simpleModule('src/core/deep/nested/module.ts', 'export const deep = 1')
      const report = analyzer.analyze(modules)
      expect(report.modules[0]!.name).toBe('module')
    })

    it('handles module with many exports but no imports', () => {
      const analyzer = new BundleAnalyzer()
      const content = [
        'export const a = 1',
        'export const b = 2',
        'export const c = 3',
        'export function d() {}',
        'export class E {}',
      ].join('\n')
      const modules = simpleModule('big.ts', content)
      const report = analyzer.analyze(modules)
      expect(report.modules[0]!.exports.length).toBe(5)
    })

    it('processes a large number of modules', () => {
      const analyzer = new BundleAnalyzer()
      const entries: [string, string][] = []
      for (let i = 0; i < 50; i++) {
        entries.push([`mod${i}.ts`, `export const m${i} = ${i}`])
      }
      const report = analyzer.analyze(makeModules(entries))
      expect(report.moduleCount).toBe(50)
    })

    it('handles modules with relative path dependencies', () => {
      const analyzer = new BundleAnalyzer({ entryPoint: 'src/main.ts' })
      const modules = makeModules([
        ['src/main.ts', "import { helper } from './utils/helper'"],
        ['src/utils/helper.ts', 'export const helper = true'],
      ])
      const report = analyzer.analyze(modules)
      const helper = report.modules.find((m) => m.path === 'src/utils/helper.ts')
      expect(helper).toBeDefined()
      expect(helper!.imported).toBe(true)
    })
  })
})
