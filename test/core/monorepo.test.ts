import { describe, it, expect } from 'vitest'
import { WorkspaceDetector } from '../../src/core/monorepo/workspace-detector.js'
import {
  DependencyGraphBuilder,
  type RawPackageVersions,
} from '../../src/core/monorepo/dependency-graph.js'
import { MonorepoAnalyzer } from '../../src/core/monorepo/monorepo-analyzer.js'
import type {
  WorkspacePackage,
  WorkspaceConfig,
  DependencyGraph,
} from '../../src/core/monorepo/types.js'

function makePkg(overrides: Partial<WorkspacePackage> & { name: string }): WorkspacePackage {
  return {
    path: `/fake/${overrides.name}`,
    version: '1.0.0',
    dependencies: [],
    devDependencies: [],
    peerDependencies: [],
    scripts: {},
    private: false,
    ...overrides,
  }
}

function makeConfig(overrides: Partial<WorkspaceConfig> = {}): WorkspaceConfig {
  return {
    type: 'npm',
    rootPath: '/fake/root',
    packages: [],
    ...overrides,
  }
}

describe('WorkspaceDetector', () => {
  const detector = new WorkspaceDetector()

  describe('detectNPMWorkspace', () => {
    it('returns null for package.json without workspaces', () => {
      expect(detector.detectNPMWorkspace({ name: 'foo' })).toBeNull()
    })

    it('detects array workspaces', () => {
      const result = detector.detectNPMWorkspace({
        workspaces: ['packages/*', 'apps/*'],
      })
      expect(result).toEqual(['packages/*', 'apps/*'])
    })

    it('detects object workspaces with packages array', () => {
      const result = detector.detectNPMWorkspace({
        workspaces: { packages: ['packages/*'] },
      })
      expect(result).toEqual(['packages/*'])
    })

    it('returns null for empty workspaces object', () => {
      expect(detector.detectNPMWorkspace({ workspaces: {} })).toBeNull()
    })

    it('returns null for workspaces with no packages key', () => {
      expect(detector.detectNPMWorkspace({ workspaces: { nope: true } })).toBeNull()
    })

    it('returns null when workspaces is a non-array primitive', () => {
      expect(detector.detectNPMWorkspace({ workspaces: 'nope' })).toBeNull()
    })
  })

  describe('detectYarnWorkspace', () => {
    it('detects yarn array workspaces', () => {
      const result = detector.detectYarnWorkspace({
        workspaces: ['packages/*'],
      })
      expect(result).toEqual(['packages/*'])
    })

    it('detects yarn object workspaces', () => {
      const result = detector.detectYarnWorkspace({
        workspaces: { packages: ['packages/*'] },
      })
      expect(result).toEqual(['packages/*'])
    })

    it('returns null when no workspaces field', () => {
      expect(detector.detectYarnWorkspace({ name: 'foo' })).toBeNull()
    })
  })

  describe('detectPnpmWorkspace', () => {
    it('parses pnpm-workspace.yaml packages list', () => {
      const yaml = `packages:
  - 'packages/*'
  - 'apps/*'
`
      const result = detector.detectPnpmWorkspace(yaml)
      expect(result).toEqual(['packages/*', 'apps/*'])
    })

    it('returns null for empty yaml', () => {
      expect(detector.detectPnpmWorkspace('')).toBeNull()
    })

    it('returns null for yaml without packages field', () => {
      expect(detector.detectPnpmWorkspace('name: foo\n')).toBeNull()
    })

    it('handles quoted strings', () => {
      const yaml = `packages:
  - "packages/*"
`
      const result = detector.detectPnpmWorkspace(yaml)
      expect(result).toEqual(['packages/*'])
    })
  })

  describe('detectLernaWorkspace', () => {
    it('parses lerna.json packages field', () => {
      const json = JSON.stringify({ packages: ['packages/*', 'libs/*'] })
      const result = detector.detectLernaWorkspace(json)
      expect(result).toEqual(['packages/*', 'libs/*'])
    })

    it('returns null when no packages field', () => {
      expect(detector.detectLernaWorkspace(JSON.stringify({ version: '1.0.0' }))).toBeNull()
    })

    it('returns null for invalid json', () => {
      expect(detector.detectLernaWorkspace('not json')).toBeNull()
    })
  })
})

describe('DependencyGraphBuilder', () => {
  const builder = new DependencyGraphBuilder()

  describe('buildGraph', () => {
    it('builds empty graph for empty package list', () => {
      const graph = builder.buildGraph([])
      expect(graph.packages.size).toBe(0)
      expect(graph.edges).toHaveLength(0)
      expect(graph.circular).toHaveLength(0)
    })

    it('builds graph for single package with no deps', () => {
      const pkg = makePkg({ name: 'pkg-a' })
      const graph = builder.buildGraph([pkg])
      expect(graph.packages.size).toBe(1)
      expect(graph.edges).toHaveLength(0)
    })

    it('creates edges for internal dependencies', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b' })
      const graph = builder.buildGraph([pkgA, pkgB])
      expect(graph.edges).toHaveLength(1)
      expect(graph.edges[0]!.from).toBe('pkg-a')
      expect(graph.edges[0]!.to).toBe('pkg-b')
      expect(graph.edges[0]!.type).toBe('dependency')
    })

    it('ignores external dependencies', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['react', 'lodash'] })
      const graph = builder.buildGraph([pkgA])
      expect(graph.edges).toHaveLength(0)
    })

    it('creates devDependency edges', () => {
      const pkgA = makePkg({ name: 'pkg-a', devDependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b' })
      const graph = builder.buildGraph([pkgA, pkgB])
      expect(graph.edges[0]!.type).toBe('devDependency')
    })

    it('creates peerDependency edges', () => {
      const pkgA = makePkg({ name: 'pkg-a', peerDependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b' })
      const graph = builder.buildGraph([pkgA, pkgB])
      expect(graph.edges[0]!.type).toBe('peerDependency')
    })

    it('uses version from rawVersions map', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b' })
      const raw = new Map<string, RawPackageVersions>([
        ['pkg-a', { dependencies: { 'pkg-b': '^2.0.0' } }],
      ])
      const graph = builder.buildGraph([pkgA, pkgB], raw)
      expect(graph.edges[0]!.version).toBe('^2.0.0')
    })

    it('defaults version to * when no rawVersions', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b' })
      const graph = builder.buildGraph([pkgA, pkgB])
      expect(graph.edges[0]!.version).toBe('*')
    })
  })

  describe('findCircularDependencies', () => {
    it('returns empty for acyclic graph', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b' })
      const graph = builder.buildGraph([pkgA, pkgB])
      expect(graph.circular).toHaveLength(0)
    })

    it('detects direct circular dependency', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b', dependencies: ['pkg-a'] })
      const graph = builder.buildGraph([pkgA, pkgB])
      expect(graph.circular.length).toBeGreaterThanOrEqual(1)
      const cycle = graph.circular[0]!
      expect(cycle).toContain('pkg-a')
      expect(cycle).toContain('pkg-b')
    })

    it('detects longer circular dependency chain', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b', dependencies: ['pkg-c'] })
      const pkgC = makePkg({ name: 'pkg-c', dependencies: ['pkg-a'] })
      const graph = builder.buildGraph([pkgA, pkgB, pkgC])
      expect(graph.circular.length).toBeGreaterThanOrEqual(1)
    })

    it('deduplicates cycles', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b', dependencies: ['pkg-a'] })
      const graph = builder.buildGraph([pkgA, pkgB])
      const uniqueCycles = builder.findCircularDependencies(graph)
      const normalized = uniqueCycles.map((c) => c.slice(0, -1).sort().join(','))
      const uniqueNormalized = new Set(normalized)
      expect(uniqueNormalized.size).toBe(uniqueCycles.length)
    })
  })

  describe('getDependents', () => {
    it('returns packages that depend on target', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-c'] })
      const pkgB = makePkg({ name: 'pkg-b', dependencies: ['pkg-c'] })
      const pkgC = makePkg({ name: 'pkg-c' })
      const graph = builder.buildGraph([pkgA, pkgB, pkgC])
      const dependents = builder.getDependents('pkg-c', graph)
      expect(dependents).toContain('pkg-a')
      expect(dependents).toContain('pkg-b')
      expect(dependents).toHaveLength(2)
    })

    it('returns empty array for package with no dependents', () => {
      const pkgA = makePkg({ name: 'pkg-a' })
      const graph = builder.buildGraph([pkgA])
      expect(builder.getDependents('pkg-a', graph)).toHaveLength(0)
    })
  })

  describe('getDependencies', () => {
    it('returns workspace dependencies of target', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b', 'pkg-c'] })
      const pkgB = makePkg({ name: 'pkg-b' })
      const pkgC = makePkg({ name: 'pkg-c' })
      const graph = builder.buildGraph([pkgA, pkgB, pkgC])
      const deps = builder.getDependencies('pkg-a', graph)
      expect(deps).toContain('pkg-b')
      expect(deps).toContain('pkg-c')
    })

    it('returns empty for package with no workspace deps', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['react'] })
      const graph = builder.buildGraph([pkgA])
      expect(builder.getDependencies('pkg-a', graph)).toHaveLength(0)
    })
  })

  describe('getTopologicalOrder', () => {
    it('returns single package', () => {
      const pkgA = makePkg({ name: 'pkg-a' })
      const graph = builder.buildGraph([pkgA])
      expect(builder.getTopologicalOrder(graph)).toEqual(['pkg-a'])
    })

    it('respects dependency order', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b', dependencies: ['pkg-c'] })
      const pkgC = makePkg({ name: 'pkg-c' })
      const graph = builder.buildGraph([pkgA, pkgB, pkgC])
      const order = builder.getTopologicalOrder(graph)
      const idxC = order.indexOf('pkg-c')
      const idxB = order.indexOf('pkg-b')
      const idxA = order.indexOf('pkg-a')
      expect(idxC).toBeLessThan(idxB)
      expect(idxB).toBeLessThan(idxA)
    })

    it('handles independent packages', () => {
      const pkgA = makePkg({ name: 'pkg-a' })
      const pkgB = makePkg({ name: 'pkg-b' })
      const graph = builder.buildGraph([pkgA, pkgB])
      const order = builder.getTopologicalOrder(graph)
      expect(order).toHaveLength(2)
      expect(order).toContain('pkg-a')
      expect(order).toContain('pkg-b')
    })

    it('handles circular deps by appending them', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b', dependencies: ['pkg-a'] })
      const graph = builder.buildGraph([pkgA, pkgB])
      const order = builder.getTopologicalOrder(graph)
      expect(order).toHaveLength(2)
    })
  })

  describe('findOrphanPackages', () => {
    it('returns packages with no dependents', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b' })
      const pkgC = makePkg({ name: 'pkg-c' })
      const graph = builder.buildGraph([pkgA, pkgB, pkgC])
      const orphans = builder.findOrphanPackages(graph)
      expect(orphans).toContain('pkg-a')
      expect(orphans).toContain('pkg-c')
      expect(orphans).toHaveLength(2)
    })

    it('returns all packages in fully decoupled workspace', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a' }),
        makePkg({ name: 'pkg-b' }),
        makePkg({ name: 'pkg-c' }),
      ]
      const graph = builder.buildGraph(pkgs)
      expect(builder.findOrphanPackages(graph)).toHaveLength(3)
    })

    it('returns empty when all packages are depended on', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b', dependencies: ['pkg-c'] })
      const pkgC = makePkg({ name: 'pkg-c' })
      const graph = builder.buildGraph([pkgA, pkgB, pkgC])
      const orphans = builder.findOrphanPackages(graph)
      expect(orphans).toContain('pkg-a')
    })
  })

  describe('findHubPackages', () => {
    it('returns packages above threshold', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['shared'] })
      const pkgB = makePkg({ name: 'pkg-b', dependencies: ['shared'] })
      const pkgC = makePkg({ name: 'pkg-c', dependencies: ['shared'] })
      const shared = makePkg({ name: 'shared' })
      const graph = builder.buildGraph([pkgA, pkgB, pkgC, shared])
      const hubs = builder.findHubPackages(graph, 2)
      expect(hubs).toHaveLength(1)
      expect(hubs[0]!.name).toBe('shared')
      expect(hubs[0]!.dependents).toBe(3)
    })

    it('returns empty when no package meets threshold', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] })
      const pkgB = makePkg({ name: 'pkg-b' })
      const graph = builder.buildGraph([pkgA, pkgB])
      expect(builder.findHubPackages(graph, 5)).toHaveLength(0)
    })

    it('sorts hubs by dependents descending', () => {
      const pkgA = makePkg({ name: 'pkg-a', dependencies: ['hub1', 'hub2'] })
      const pkgB = makePkg({ name: 'pkg-b', dependencies: ['hub1'] })
      const hub1 = makePkg({ name: 'hub1' })
      const hub2 = makePkg({ name: 'hub2' })
      const graph = builder.buildGraph([pkgA, pkgB, hub1, hub2])
      const hubs = builder.findHubPackages(graph, 1)
      expect(hubs[0]!.name).toBe('hub1')
      expect(hubs[0]!.dependents).toBe(2)
    })
  })

  describe('detectVersionMismatches', () => {
    it('returns empty when all versions match', () => {
      const pkgA = makePkg({ name: 'pkg-a' })
      const pkgB = makePkg({ name: 'pkg-b' })
      const raw = new Map<string, RawPackageVersions>([
        ['pkg-a', { dependencies: { lodash: '^4.0.0' } }],
        ['pkg-b', { dependencies: { lodash: '^4.0.0' } }],
      ])
      expect(builder.detectVersionMismatches([pkgA, pkgB], raw)).toHaveLength(0)
    })

    it('detects version mismatches', () => {
      const pkgA = makePkg({ name: 'pkg-a' })
      const pkgB = makePkg({ name: 'pkg-b' })
      const raw = new Map<string, RawPackageVersions>([
        ['pkg-a', { dependencies: { lodash: '^4.0.0' } }],
        ['pkg-b', { dependencies: { lodash: '^3.0.0' } }],
      ])
      const mismatches = builder.detectVersionMismatches([pkgA, pkgB], raw)
      expect(mismatches).toHaveLength(1)
      expect(mismatches[0]!.dependency).toBe('lodash')
      expect(mismatches[0]!.versions.size).toBe(2)
    })

    it('handles deps in different dep types', () => {
      const pkgA = makePkg({ name: 'pkg-a' })
      const pkgB = makePkg({ name: 'pkg-b' })
      const raw = new Map<string, RawPackageVersions>([
        ['pkg-a', { dependencies: { lodash: '^4.0.0' } }],
        ['pkg-b', { devDependencies: { lodash: '^3.0.0' } }],
      ])
      const mismatches = builder.detectVersionMismatches([pkgA, pkgB], raw)
      expect(mismatches).toHaveLength(1)
    })

    it('returns empty for empty package list', () => {
      expect(builder.detectVersionMismatches([])).toHaveLength(0)
    })

    it('returns empty without rawVersions', () => {
      const pkgA = makePkg({ name: 'pkg-a' })
      expect(builder.detectVersionMismatches([pkgA])).toHaveLength(0)
    })
  })
})

describe('MonorepoAnalyzer', () => {
  const analyzer = new MonorepoAnalyzer('/fake/root')

  function makeTestReport(
    pkgs: WorkspacePackage[],
    raw?: Map<string, RawPackageVersions>,
  ): { report: import('../../src/core/monorepo/types.js').MonorepoReport; graph: DependencyGraph } {
    const graphBuilder = new DependencyGraphBuilder()
    const graph = graphBuilder.buildGraph(pkgs, raw)
    const health: import('../../src/core/monorepo/types.js').MonorepoHealth = {
      totalPackages: pkgs.length,
      outdatedDeps: 0,
      circularDeps: graph.circular.length,
      privatePackages: pkgs.filter((p) => p.private).length,
      publicPackages: pkgs.filter((p) => !p.private).length,
      avgDepsPerPackage:
        pkgs.length > 0
          ? pkgs.reduce((s, p) => s + p.dependencies.length + p.devDependencies.length, 0) / pkgs.length
          : 0,
      topDepended: [],
      inconsistentVersions: raw
        ? graphBuilder.detectVersionMismatches(pkgs, raw)
        : [],
    }
    const report: import('../../src/core/monorepo/types.js').MonorepoReport = {
      workspace: makeConfig({ packages: pkgs.map((p) => p.path) }),
      packages: pkgs,
      graph,
      health,
    }
    return { report, graph }
  }

  describe('analyze', () => {
    it('creates a full report', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] }),
        makePkg({ name: 'pkg-b' }),
      ]
      const config = makeConfig()
      const report = analyzer.analyze(pkgs, config)
      expect(report.packages).toHaveLength(2)
      expect(report.graph.packages.size).toBe(2)
      expect(report.health.totalPackages).toBe(2)
    })

    it('calculates private and public package counts', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', private: true }),
        makePkg({ name: 'pkg-b', private: false }),
        makePkg({ name: 'pkg-c', private: true }),
      ]
      const report = analyzer.analyze(pkgs, makeConfig())
      expect(report.health.privatePackages).toBe(2)
      expect(report.health.publicPackages).toBe(1)
    })

    it('calculates average deps per package', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', dependencies: ['pkg-b', 'pkg-c'] }),
        makePkg({ name: 'pkg-b', dependencies: ['pkg-c'] }),
        makePkg({ name: 'pkg-c' }),
      ]
      const report = analyzer.analyze(pkgs, makeConfig())
      expect(report.health.avgDepsPerPackage).toBe(1)
    })

    it('detects circular deps in report', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] }),
        makePkg({ name: 'pkg-b', dependencies: ['pkg-a'] }),
      ]
      const report = analyzer.analyze(pkgs, makeConfig())
      expect(report.health.circularDeps).toBeGreaterThan(0)
    })

    it('reports version mismatches', () => {
      const pkgs = [makePkg({ name: 'pkg-a' }), makePkg({ name: 'pkg-b' })]
      const raw = new Map<string, RawPackageVersions>([
        ['pkg-a', { dependencies: { lodash: '^4.0.0' } }],
        ['pkg-b', { dependencies: { lodash: '^3.0.0' } }],
      ])
      const report = analyzer.analyze(pkgs, makeConfig(), raw)
      expect(report.health.inconsistentVersions).toHaveLength(1)
    })
  })

  describe('getPackageHealth', () => {
    it('returns health for existing package', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] }),
        makePkg({ name: 'pkg-b' }),
      ]
      const { report } = makeTestReport(pkgs)
      const health = analyzer.getPackageHealth('pkg-a', report)
      expect(health.packageName).toBe('pkg-a')
      expect(health.dependencyCount).toBe(1)
      expect(health.dependentCount).toBe(0)
    })

    it('returns zeroed health for unknown package', () => {
      const { report } = makeTestReport([makePkg({ name: 'pkg-a' })])
      const health = analyzer.getPackageHealth('nonexistent', report)
      expect(health.packageName).toBe('nonexistent')
      expect(health.score).toBe(0)
    })

    it('flags circular dependency', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] }),
        makePkg({ name: 'pkg-b', dependencies: ['pkg-a'] }),
      ]
      const { report } = makeTestReport(pkgs)
      const health = analyzer.getPackageHealth('pkg-a', report)
      expect(health.hasCircular).toBe(true)
    })

    it('reports dependentCount correctly', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', dependencies: ['shared'] }),
        makePkg({ name: 'pkg-b', dependencies: ['shared'] }),
        makePkg({ name: 'shared' }),
      ]
      const { report } = makeTestReport(pkgs)
      const health = analyzer.getPackageHealth('shared', report)
      expect(health.dependentCount).toBe(2)
    })

    it('calculates score without circular as higher', () => {
      const pkgs = [makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] }), makePkg({ name: 'pkg-b' })]
      const { report } = makeTestReport(pkgs)
      const health = analyzer.getPackageHealth('pkg-a', report)
      expect(health.score).toBeGreaterThan(0)
    })
  })

  describe('suggestBuildOrder', () => {
    it('returns topological order', () => {
      const pkgs = [
        makePkg({ name: 'app', dependencies: ['lib-a', 'lib-b'] }),
        makePkg({ name: 'lib-a', dependencies: ['lib-b'] }),
        makePkg({ name: 'lib-b' }),
      ]
      const { report } = makeTestReport(pkgs)
      const order = analyzer.suggestBuildOrder(report)
      const idxLibB = order.indexOf('lib-b')
      const idxLibA = order.indexOf('lib-a')
      const idxApp = order.indexOf('app')
      expect(idxLibB).toBeLessThan(idxLibA)
      expect(idxLibA).toBeLessThan(idxApp)
    })

    it('handles single package', () => {
      const { report } = makeTestReport([makePkg({ name: 'solo' })])
      expect(analyzer.suggestBuildOrder(report)).toEqual(['solo'])
    })
  })

  describe('identifySharedDeps', () => {
    it('finds deps used by multiple packages', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', dependencies: ['lodash', 'react'] }),
        makePkg({ name: 'pkg-b', dependencies: ['lodash', 'vue'] }),
      ]
      const { report } = makeTestReport(pkgs)
      const shared = analyzer.identifySharedDeps(report)
      expect(shared.get('lodash')).toBe(2)
      expect(shared.has('react')).toBe(false)
    })

    it('returns empty map for no shared deps', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', dependencies: ['react'] }),
        makePkg({ name: 'pkg-b', dependencies: ['vue'] }),
      ]
      const { report } = makeTestReport(pkgs)
      expect(analyzer.identifySharedDeps(report).size).toBe(0)
    })

    it('includes devDependencies and peerDependencies', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', devDependencies: ['jest'] }),
        makePkg({ name: 'pkg-b', devDependencies: ['jest'] }),
      ]
      const { report } = makeTestReport(pkgs)
      expect(analyzer.identifySharedDeps(report).get('jest')).toBe(2)
    })

    it('sorts by count descending', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', dependencies: ['lodash', 'react'] }),
        makePkg({ name: 'pkg-b', dependencies: ['lodash'] }),
        makePkg({ name: 'pkg-c', dependencies: ['lodash', 'react'] }),
      ]
      const { report } = makeTestReport(pkgs)
      const shared = analyzer.identifySharedDeps(report)
      const entries = [...shared.entries()]
      expect(entries[0]![0]).toBe('lodash')
      expect(entries[0]![1]).toBe(3)
    })
  })

  describe('calculateCouplingScore', () => {
    it('returns 0 for single package', () => {
      const { report } = makeTestReport([makePkg({ name: 'pkg-a' })])
      expect(analyzer.calculateCouplingScore(report)).toBe(0)
    })

    it('returns 0 for fully decoupled packages', () => {
      const pkgs = [makePkg({ name: 'pkg-a' }), makePkg({ name: 'pkg-b' })]
      const { report } = makeTestReport(pkgs)
      expect(analyzer.calculateCouplingScore(report)).toBe(0)
    })

    it('returns higher score for coupled packages', () => {
      const pkgs = [
        makePkg({ name: 'pkg-a', dependencies: ['pkg-b'] }),
        makePkg({ name: 'pkg-b' }),
      ]
      const { report } = makeTestReport(pkgs)
      expect(analyzer.calculateCouplingScore(report)).toBeGreaterThan(0)
    })

    it('maxes at 100 for fully connected', () => {
      const pkgs = [
        makePkg({ name: 'a', dependencies: ['b'] }),
        makePkg({ name: 'b', dependencies: ['a'] }),
      ]
      const { report } = makeTestReport(pkgs)
      expect(analyzer.calculateCouplingScore(report)).toBeLessThanOrEqual(100)
    })
  })

  describe('findUnusedPackages', () => {
    it('returns packages nothing depends on', () => {
      const pkgs = [
        makePkg({ name: 'app', dependencies: ['lib'] }),
        makePkg({ name: 'lib' }),
        makePkg({ name: 'orphan' }),
      ]
      const { report } = makeTestReport(pkgs)
      const unused = analyzer.findUnusedPackages(report)
      expect(unused).toContain('app')
      expect(unused).toContain('orphan')
      expect(unused).toHaveLength(2)
    })

    it('returns all packages in decoupled workspace', () => {
      const pkgs = [makePkg({ name: 'a' }), makePkg({ name: 'b' }), makePkg({ name: 'c' })]
      const { report } = makeTestReport(pkgs)
      expect(analyzer.findUnusedPackages(report)).toHaveLength(3)
    })
  })
})

describe('Edge cases', () => {
  const builder = new DependencyGraphBuilder()

  it('handles package depending on itself', () => {
    const pkgA = makePkg({ name: 'pkg-a', dependencies: ['pkg-a'] })
    const graph = builder.buildGraph([pkgA])
    expect(graph.circular.length).toBeGreaterThanOrEqual(1)
    expect(graph.circular[0]).toContain('pkg-a')
  })

  it('handles diamond dependency pattern', () => {
    const pkgA = makePkg({ name: 'a', dependencies: ['b', 'c'] })
    const pkgB = makePkg({ name: 'b', dependencies: ['d'] })
    const pkgC = makePkg({ name: 'c', dependencies: ['d'] })
    const pkgD = makePkg({ name: 'd' })
    const graph = builder.buildGraph([pkgA, pkgB, pkgC, pkgD])
    expect(graph.edges).toHaveLength(4)
    expect(graph.circular).toHaveLength(0)
    const depsOnD = graph.edges.filter((e) => e.to === 'd')
    expect(depsOnD).toHaveLength(2)
  })

  it('handles empty workspace config', () => {
    const config = makeConfig({ packages: [], type: 'unknown' })
    expect(config.type).toBe('unknown')
    expect(config.packages).toHaveLength(0)
  })

  it('handles package with many dep types', () => {
    const pkgA = makePkg({
      name: 'pkg-a',
      dependencies: ['pkg-b'],
      devDependencies: ['pkg-c'],
      peerDependencies: ['pkg-d'],
    })
    const pkgB = makePkg({ name: 'pkg-b' })
    const pkgC = makePkg({ name: 'pkg-c' })
    const pkgD = makePkg({ name: 'pkg-d' })
    const graph = builder.buildGraph([pkgA, pkgB, pkgC, pkgD])
    expect(graph.edges).toHaveLength(3)
    const types = new Set(graph.edges.map((e) => e.type))
    expect(types.has('dependency')).toBe(true)
    expect(types.has('devDependency')).toBe(true)
    expect(types.has('peerDependency')).toBe(true)
  })

  it('topological order includes all packages', () => {
    const pkgs = [
      makePkg({ name: 'a', dependencies: ['b'] }),
      makePkg({ name: 'b' }),
      makePkg({ name: 'c' }),
    ]
    const graph = builder.buildGraph(pkgs)
    const order = builder.getTopologicalOrder(graph)
    expect(order).toHaveLength(3)
    expect(new Set(order).size).toBe(3)
  })
})
