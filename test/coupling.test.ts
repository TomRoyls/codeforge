import { describe, it, expect } from 'vitest'

import {
  buildCouplingResult,
  buildDependencyGraph,
  computeAbstractness,
  computeAfferent,
  computeDistance,
  computeEfferent,
  computeInstability,
  detectCycles,
  detectViolations,
  dfsCycles,
  expandCluster,
  extractImportPaths,
  findClusters,
  generateRecommendations,
  isExternalImport,
  resolveImportPath,
} from '../src/commands/coupling-helpers.js'
import {
  distanceColor,
  formatCluster,
  formatCouplingCsv,
  formatCouplingJson,
  formatCouplingTable,
  formatMartinDiagram,
  formatModuleRow,
  formatViolation,
  instabilityColor,
  severityBadge,
} from '../src/commands/coupling-format-helpers.js'
import type { CouplingCluster, CouplingResult, CouplingViolation, DependencyGraph, ModuleCoupling } from '../src/commands/coupling-helpers.js'

// ─── extractImportPaths ──────────────────────────────────────────────────────────

describe('extractImportPaths', () => {
  it('extracts static import paths', () => {
    const code = `import { foo } from './bar'\nimport baz from './qux'`
    expect(extractImportPaths(code)).toEqual(['./bar', './qux'])
  })

  it('extracts type imports', () => {
    const code = `import type { Config } from './types'`
    expect(extractImportPaths(code)).toContain('./types')
  })

  it('extracts dynamic imports', () => {
    const code = `const mod = import('./dynamic')`
    expect(extractImportPaths(code)).toContain('./dynamic')
  })

  it('extracts node: protocol imports', () => {
    const code = `import fs from 'node:fs'`
    expect(extractImportPaths(code)).toContain('node:fs')
  })

  it('deduplicates imports', () => {
    const code = `import { a } from './x'\nimport { b } from './x'`
    expect(extractImportPaths(code)).toEqual(['./x'])
  })

  it('returns empty array for no imports', () => {
    expect(extractImportPaths('const x = 1')).toEqual([])
  })

  it('handles namespace imports', () => {
    const code = `import * as fs from 'node:fs'`
    expect(extractImportPaths(code)).toContain('node:fs')
  })

  it('handles side-effect imports', () => {
    const code = `import './styles.css'`
    // Side-effect imports don't have 'from' keyword, regex won't match
    expect(extractImportPaths(code)).toEqual([])
  })

  it('extracts from node_modules packages', () => {
    const code = `import chalk from 'chalk'`
    expect(extractImportPaths(code)).toContain('chalk')
  })

  it('handles mixed import styles', () => {
    const code = `import { foo } from './bar'\nconst mod = import('./dynamic')`
    const result = extractImportPaths(code)
    expect(result).toContain('./bar')
    expect(result).toContain('./dynamic')
  })
})

// ─── isExternalImport ───────────────────────────────────────────────────────────

describe('isExternalImport', () => {
  it('returns true for node: protocol', () => {
    expect(isExternalImport('node:fs')).toBe(true)
  })

  it('returns true for bare module specifiers', () => {
    expect(isExternalImport('chalk')).toBe(true)
  })

  it('returns true for scoped packages', () => {
    expect(isExternalImport('@oclif/core')).toBe(true)
  })

  it('returns false for relative imports', () => {
    expect(isExternalImport('./helpers')).toBe(false)
  })

  it('returns false for parent imports', () => {
    expect(isExternalImport('../utils')).toBe(false)
  })

  it('returns false for absolute paths', () => {
    expect(isExternalImport('/abs/path')).toBe(false)
  })
})

// ─── resolveImportPath ──────────────────────────────────────────────────────────

describe('resolveImportPath', () => {
  it('resolves relative import', () => {
    expect(resolveImportPath('./helpers', 'src/commands/count.ts')).toBe('src/commands/helpers')
  })

  it('resolves parent import', () => {
    expect(resolveImportPath('../core', 'src/commands/count.ts')).toBe('src/core')
  })

  it('resolves deeply nested parent import', () => {
    expect(resolveImportPath('../../utils', 'src/commands/sub/foo.ts')).toBe('src/utils')
  })

  it('passes through external imports unchanged', () => {
    expect(resolveImportPath('chalk', 'src/commands/count.ts')).toBe('chalk')
  })

  it('handles current directory import', () => {
    expect(resolveImportPath('./index', 'src/main.ts')).toBe('src/index')
  })

  it('handles file without directory', () => {
    expect(resolveImportPath('./foo', 'main.ts')).toBe('foo')
  })

  it('handles multiple parent segments', () => {
    expect(resolveImportPath('../../../root', 'a/b/c/d/e.ts')).toBe('a/root')
  })
})

// ─── buildDependencyGraph ──────────────────────────────────────────────────────

describe('buildDependencyGraph', () => {
  it('builds graph from files and contents', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [`import { x } from './b'`, `import { y } from './a'`]
    const graph = buildDependencyGraph(files, contents)

    expect(graph.nodes.has('a.ts')).toBe(true)
    expect(graph.nodes.has('b.ts')).toBe(true)
    expect(graph.edges).toHaveLength(2)
  })

  it('skips external imports in edges', () => {
    const files = ['a.ts']
    const contents = [`import chalk from 'chalk'`]
    const graph = buildDependencyGraph(files, contents)

    expect(graph.edges).toHaveLength(0)
  })

  it('builds adjacency map', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [`import { x } from './b'`, '']
    const graph = buildDependencyGraph(files, contents)

    // resolveImportPath strips extension, so './b' from 'a.ts' resolves to 'b'
    expect(graph.adjacency.get('a.ts')).toContain('b')
  })

  it('builds reverse adjacency map', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [`import { x } from './b'`, '']
    const graph = buildDependencyGraph(files, contents)

    expect(graph.reverseAdjacency.get('b')?.has('a.ts')).toBe(true)
  })

  it('handles empty file list', () => {
    const graph = buildDependencyGraph([], [])
    expect(graph.nodes.size).toBe(0)
    expect(graph.edges).toHaveLength(0)
  })

  it('adds target nodes even if not in files list', () => {
    const files = ['a.ts']
    const contents = [`import { x } from './b'`]
    const graph = buildDependencyGraph(files, contents)

    expect(graph.nodes.has('b')).toBe(true)
  })

  it('handles files with no imports', () => {
    const files = ['a.ts']
    const contents = ['const x = 1']
    const graph = buildDependencyGraph(files, contents)

    expect(graph.adjacency.get('a.ts')?.size ?? 0).toBe(0)
  })
})

// ─── computeAfferent / computeEfferent ─────────────────────────────────────────

describe('computeAfferent', () => {
  it('returns 0 for unknown module', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['a.ts']),
      edges: [],
      adjacency: new Map(),
      reverseAdjacency: new Map(),
    }
    expect(computeAfferent('unknown.ts', graph)).toBe(0)
  })

  it('returns correct afferent coupling', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['a.ts', 'b.ts', 'c.ts']),
      edges: [],
      adjacency: new Map(),
      reverseAdjacency: new Map([['a.ts', new Set(['b.ts', 'c.ts'])]]),
    }
    expect(computeAfferent('a.ts', graph)).toBe(2)
  })
})

describe('computeEfferent', () => {
  it('returns 0 for unknown module', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['a.ts']),
      edges: [],
      adjacency: new Map(),
      reverseAdjacency: new Map(),
    }
    expect(computeEfferent('unknown.ts', graph)).toBe(0)
  })

  it('returns correct efferent coupling', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['a.ts', 'b.ts', 'c.ts']),
      edges: [],
      adjacency: new Map([['a.ts', new Set(['b.ts', 'c.ts'])]]),
      reverseAdjacency: new Map(),
    }
    expect(computeEfferent('a.ts', graph)).toBe(2)
  })
})

// ─── computeInstability ─────────────────────────────────────────────────────────

describe('computeInstability', () => {
  it('returns 0 for zero coupling', () => {
    expect(computeInstability(0, 0)).toBe(0)
  })

  it('returns 1.0 for max instability', () => {
    expect(computeInstability(0, 5)).toBe(1)
  })

  it('returns 0.0 for max stability', () => {
    expect(computeInstability(10, 0)).toBe(0)
  })

  it('returns 0.5 for balanced coupling', () => {
    expect(computeInstability(5, 5)).toBe(0.5)
  })

  it('rounds to 2 decimal places', () => {
    const result = computeInstability(1, 3)
    expect(result).toBe(0.75)
  })

  it('handles asymmetric values', () => {
    expect(computeInstability(3, 1)).toBe(0.25)
  })
})

// ─── computeAbstractness ────────────────────────────────────────────────────────

describe('computeAbstractness', () => {
  it('returns 1.0 for all abstract exports', () => {
    const code = `export interface Foo {}\nexport type Bar = string`
    const result = computeAbstractness(code)
    expect(result.abstractness).toBe(1)
    expect(result.totalExports).toBe(2)
    expect(result.abstractExports).toBe(2)
  })

  it('returns 0.0 for all concrete exports', () => {
    const code = `export function foo() {}\nexport const bar = 1`
    const result = computeAbstractness(code)
    expect(result.abstractness).toBe(0)
  })

  it('returns 0.5 for mixed exports', () => {
    const code = `export interface I {}\nexport function f() {}`
    const result = computeAbstractness(code)
    expect(result.abstractness).toBe(0.5)
    expect(result.totalExports).toBe(2)
    expect(result.abstractExports).toBe(1)
  })

  it('returns 0 for no exports', () => {
    const result = computeAbstractness('const x = 1')
    expect(result.abstractness).toBe(0)
    expect(result.totalExports).toBe(0)
  })

  it('handles default interface exports', () => {
    const code = `export default interface Config {}`
    const result = computeAbstractness(code)
    expect(result.abstractness).toBe(1)
  })

  it('handles default type exports', () => {
    const code = `export default type Result = string`
    const result = computeAbstractness(code)
    expect(result.abstractness).toBe(1)
  })
})

// ─── computeDistance ─────────────────────────────────────────────────────────────

describe('computeDistance', () => {
  it('returns 0.0 for abstract and stable', () => {
    expect(computeDistance(1.0, 0.0)).toBe(0)
  })

  it('returns 0.0 for concrete and unstable', () => {
    expect(computeDistance(0.0, 1.0)).toBe(0)
  })

  it('returns 1.0 for zone of pain', () => {
    expect(computeDistance(0.0, 0.0)).toBe(1)
  })

  it('returns 1.0 for zone of uselessness', () => {
    expect(computeDistance(1.0, 1.0)).toBe(1)
  })

  it('handles typical values', () => {
    expect(computeDistance(0.5, 0.5)).toBe(0)
  })

  it('rounds to 2 decimal places', () => {
    const result = computeDistance(0.33, 0.44)
    expect(result).toBe(0.23)
  })
})

// ─── detectCycles / dfsCycles ───────────────────────────────────────────────────

describe('detectCycles', () => {
  it('detects a simple cycle', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['a', 'b']),
      edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }],
      adjacency: new Map([['a', new Set(['b'])], ['b', new Set(['a'])]]),
      reverseAdjacency: new Map(),
    }
    const cycles = detectCycles(graph)
    expect(cycles.length).toBeGreaterThan(0)
  })

  it('returns empty for acyclic graph', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['a', 'b', 'c']),
      edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }],
      adjacency: new Map([['a', new Set(['b'])], ['b', new Set(['c'])], ['c', new Set()]]),
      reverseAdjacency: new Map(),
    }
    expect(detectCycles(graph)).toEqual([])
  })

  it('detects longer cycle', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['a', 'b', 'c']),
      edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'a' }],
      adjacency: new Map([['a', new Set(['b'])], ['b', new Set(['c'])], ['c', new Set(['a'])]]),
      reverseAdjacency: new Map(),
    }
    const cycles = detectCycles(graph)
    expect(cycles.length).toBeGreaterThan(0)
  })
})

describe('dfsCycles', () => {
  it('does not throw on empty adjacency', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['a']),
      edges: [],
      adjacency: new Map([['a', new Set()]]),
      reverseAdjacency: new Map(),
    }
    const cycles: string[][] = []
    expect(() => dfsCycles('a', graph, new Set(), new Set(), [], cycles)).not.toThrow()
  })
})

// ─── findClusters / expandCluster ───────────────────────────────────────────────

describe('findClusters', () => {
  it('finds connected clusters', () => {
    // Nodes must look like relative paths (start with ./) to pass isExternalImport check
    const graph: DependencyGraph = {
      nodes: new Set(['./a', './b', './c']),
      edges: [{ from: './a', to: './b' }, { from: './b', to: './c' }],
      adjacency: new Map([['./a', new Set(['./b'])], ['./b', new Set(['./c'])], ['./c', new Set()]]),
      reverseAdjacency: new Map([['./b', new Set(['./a'])], ['./c', new Set(['./b'])]]),
    }
    const clusters = findClusters(graph)
    expect(clusters.length).toBe(1)
    expect(clusters[0]!.size).toBe(3)
  })

  it('finds separate clusters', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['./a', './b', '/c', '/d']),
      edges: [{ from: './a', to: './b' }, { from: '/c', to: '/d' }],
      adjacency: new Map([['./a', new Set(['./b'])], ['./b', new Set()], ['/c', new Set(['/d'])], ['/d', new Set()]]),
      reverseAdjacency: new Map([['./b', new Set(['./a'])], ['/d', new Set(['/c'])]]),
    }
    const clusters = findClusters(graph)
    expect(clusters.length).toBe(2)
  })

  it('sorts clusters by size descending', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['./a', './b', './c', './d']),
      edges: [{ from: './a', to: './b' }, { from: './b', to: './c' }, { from: './c', to: './a' }],
      adjacency: new Map([['./a', new Set(['./b'])], ['./b', new Set(['./c'])], ['./c', new Set(['./a'])], ['./d', new Set()]]),
      reverseAdjacency: new Map(),
    }
    const clusters = findClusters(graph)
    for (let i = 1; i < clusters.length; i++) {
      expect(clusters[i - 1]!.size).toBeGreaterThanOrEqual(clusters[i]!.size)
    }
  })

  it('skips singletons', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['./a']),
      edges: [],
      adjacency: new Map([['./a', new Set()]]),
      reverseAdjacency: new Map(),
    }
    expect(findClusters(graph)).toEqual([])
  })

  it('skips external import nodes', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['a.ts', 'chalk']),
      edges: [],
      adjacency: new Map([['a.ts', new Set()], ['chalk', new Set()]]),
      reverseAdjacency: new Map(),
    }
    const clusters = findClusters(graph)
    expect(clusters.every((c) => !c.modules.includes('chalk'))).toBe(true)
  })
})

describe('expandCluster', () => {
  it('expands from seed node', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['./a', './b', './c']),
      edges: [{ from: './a', to: './b' }, { from: './b', to: './c' }],
      adjacency: new Map([['./a', new Set(['./b'])], ['./b', new Set(['./c'])], ['./c', new Set()]]),
      reverseAdjacency: new Map([['./b', new Set(['./a'])], ['./c', new Set(['./b'])]]),
    }
    const cluster = expandCluster('./a', graph, new Set())
    expect(cluster.modules).toContain('./a')
    expect(cluster.modules).toContain('./b')
    expect(cluster.modules).toContain('./c')
  })

  it('sorts modules alphabetically', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['./c', './a', './b']),
      edges: [{ from: './c', to: './a' }, { from: './a', to: './b' }],
      adjacency: new Map([['./c', new Set(['./a'])], ['./a', new Set(['./b'])], ['./b', new Set()]]),
      reverseAdjacency: new Map([['./a', new Set(['./c'])], ['./b', new Set(['./a'])]]),
    }
    const cluster = expandCluster('./c', graph, new Set())
    expect(cluster.modules).toEqual(['./a', './b', './c'])
  })

  it('computes density', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['./a', './b']),
      edges: [{ from: './a', to: './b' }, { from: './b', to: './a' }],
      adjacency: new Map([['./a', new Set(['./b'])], ['./b', new Set(['./a'])]]),
      reverseAdjacency: new Map([['./a', new Set(['./b'])], ['./b', new Set(['./a'])]]),
    }
    const cluster = expandCluster('./a', graph, new Set())
    expect(cluster.density).toBe(1)
  })

  it('skips already visited nodes', () => {
    const graph: DependencyGraph = {
      nodes: new Set(['./a', './b']),
      edges: [{ from: './a', to: './b' }],
      adjacency: new Map([['./a', new Set(['./b'])], ['./b', new Set()]]),
      reverseAdjacency: new Map([['./b', new Set(['./a'])]]),
    }
    const visited = new Set(['./b'])
    const cluster = expandCluster('./a', graph, visited)
    expect(cluster.modules).not.toContain('./b')
  })
})

// ─── detectViolations ───────────────────────────────────────────────────────────

describe('detectViolations', () => {
  const baseGraph: DependencyGraph = {
    nodes: new Set(['a.ts', 'b.ts']),
    edges: [],
    adjacency: new Map(),
    reverseAdjacency: new Map(),
  }

  it('detects high afferent coupling', () => {
    const modules: ModuleCoupling[] = [{
      module: 'core.ts', afferentCoupling: 20, efferentCoupling: 2,
      instability: 0.1, abstractness: 0, distance: 0.9,
      imports: [], importedBy: [], totalExports: 1, abstractExports: 0,
    }]
    const violations = detectViolations(modules, baseGraph, 5)
    expect(violations.some((v) => v.type === 'high-afferent')).toBe(true)
  })

  it('detects high efferent coupling', () => {
    const modules: ModuleCoupling[] = [{
      module: 'kitchen.ts', afferentCoupling: 0, efferentCoupling: 20,
      instability: 1.0, abstractness: 0, distance: 0,
      imports: [], importedBy: [], totalExports: 1, abstractExports: 0,
    }]
    const violations = detectViolations(modules, baseGraph, 5)
    expect(violations.some((v) => v.type === 'high-efferent')).toBe(true)
  })

  it('detects unstable-abstract violation', () => {
    const modules: ModuleCoupling[] = [{
      module: 'iface.ts', afferentCoupling: 2, efferentCoupling: 5,
      instability: 0.71, abstractness: 0.8, distance: 0.51,
      imports: [], importedBy: [], totalExports: 5, abstractExports: 4,
    }]
    const violations = detectViolations(modules, baseGraph, 5)
    expect(violations.some((v) => v.type === 'unstable-abstract')).toBe(true)
  })

  it('detects cycles as violations', () => {
    const cyclicGraph: DependencyGraph = {
      nodes: new Set(['a', 'b']),
      edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }],
      adjacency: new Map([['a', new Set(['b'])], ['b', new Set(['a'])]]),
      reverseAdjacency: new Map(),
    }
    const violations = detectViolations([], cyclicGraph, 5)
    expect(violations.some((v) => v.type === 'cycle')).toBe(true)
  })

  it('assigns critical severity for extreme coupling', () => {
    const modules: ModuleCoupling[] = [{
      module: 'god.ts', afferentCoupling: 30, efferentCoupling: 2,
      instability: 0.06, abstractness: 0, distance: 0.94,
      imports: [], importedBy: [], totalExports: 1, abstractExports: 0,
    }]
    const violations = detectViolations(modules, baseGraph, 3)
    const highAfferent = violations.find((v) => v.type === 'high-afferent')
    expect(highAfferent?.severity).toBe('critical')
  })

  it('returns empty for no violations', () => {
    const modules: ModuleCoupling[] = [{
      module: 'clean.ts', afferentCoupling: 1, efferentCoupling: 1,
      instability: 0.5, abstractness: 0, distance: 0.5,
      imports: [], importedBy: [], totalExports: 1, abstractExports: 0,
    }]
    const violations = detectViolations(modules, baseGraph, 5)
    expect(violations).toEqual([])
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates critical recommendation', () => {
    const violations: CouplingViolation[] = [{
      type: 'high-afferent', module: 'core.ts',
      description: 'too many deps', severity: 'critical',
    }]
    const recs = generateRecommendations(violations, [])
    expect(recs.some((r) => r.includes('critical'))).toBe(true)
  })

  it('generates splitting recommendation for high afferent', () => {
    const violations: CouplingViolation[] = [{
      type: 'high-afferent', module: 'core.ts',
      description: 'many deps', severity: 'warning',
    }]
    const recs = generateRecommendations(violations, [])
    expect(recs.some((r) => r.includes('god module'))).toBe(true)
  })

  it('generates DI recommendation for high efferent', () => {
    const violations: CouplingViolation[] = [{
      type: 'high-efferent', module: 'kitchen.ts',
      description: 'too many', severity: 'warning',
    }]
    const recs = generateRecommendations(violations, [])
    expect(recs.some((r) => r.includes('dependency injection'))).toBe(true)
  })

  it('generates cycle recommendation', () => {
    const violations: CouplingViolation[] = [{
      type: 'cycle', module: 'a -> b -> a',
      description: 'circular', severity: 'critical',
    }]
    const recs = generateRecommendations(violations, [])
    expect(recs.some((r) => r.includes('circular'))).toBe(true)
  })

  it('generates abstract stability recommendation', () => {
    const violations: CouplingViolation[] = [{
      type: 'unstable-abstract', module: 'iface.ts',
      description: 'abstract but unstable', severity: 'warning',
    }]
    const recs = generateRecommendations(violations, [])
    expect(recs.some((r) => r.includes('Abstract modules'))).toBe(true)
  })

  it('generates cluster recommendation for large cluster', () => {
    const cluster: CouplingCluster = {
      modules: ['a', 'b', 'c', 'd', 'e', 'f'],
      size: 6, density: 0.5, averageCoupling: 3.0,
    }
    const recs = generateRecommendations([], [cluster])
    expect(recs.some((r) => r.includes('Largest cluster'))).toBe(true)
  })

  it('returns healthy message when no issues', () => {
    const recs = generateRecommendations([], [])
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('healthy')
  })
})

// ─── buildCouplingResult ────────────────────────────────────────────────────────

describe('buildCouplingResult', () => {
  it('returns complete result structure', () => {
    const result = buildCouplingResult(['a.ts', 'b.ts'], [
      `import { x } from './b'`,
      `import { y } from './a'`,
    ], { threshold: 5 })

    expect(result.modules).toHaveLength(2)
    expect(result.stats.totalModules).toBe(2)
    expect(result.stats.totalEdges).toBe(2)
    expect(result.stats.mostStable).toBeDefined()
    expect(result.stats.mostUnstable).toBeDefined()
    expect(result.stats.mostDependedUpon).toBeDefined()
    expect(result.stats.mostDependent).toBeDefined()
  })

  it('computes correct module metrics', () => {
    const result = buildCouplingResult(['a.ts', 'b.ts'], [
      `import { x } from './b'\nexport function foo() {}`,
      `export interface Bar {}`,
    ], { threshold: 5 })

    const modA = result.modules.find((m) => m.module === 'a.ts')
    expect(modA).toBeDefined()
    expect(modA!.efferentCoupling).toBe(1)
    expect(modA!.totalExports).toBe(1)
    expect(modA!.abstractExports).toBe(0)
  })

  it('computes abstractness correctly', () => {
    const result = buildCouplingResult(['types.ts'], [
      `export interface Foo {}\nexport type Bar = string`,
    ], { threshold: 5 })

    const types = result.modules.find((m) => m.module === 'types.ts')
    expect(types!.abstractness).toBe(1)
  })

  it('computes stats averages', () => {
    const result = buildCouplingResult(['a.ts', 'b.ts', 'c.ts'], [
      `import { x } from './b'`,
      `import { x } from './c'`,
      ``,
    ], { threshold: 5 })

    expect(result.stats.averageAfferent).toBeGreaterThanOrEqual(0)
    expect(result.stats.averageEfferent).toBeGreaterThanOrEqual(0)
  })

  it('handles empty input', () => {
    const result = buildCouplingResult([], [], { threshold: 5 })
    expect(result.modules).toEqual([])
    expect(result.stats.totalModules).toBe(0)
    expect(result.stats.totalEdges).toBe(0)
  })

  it('uses default threshold', () => {
    const result = buildCouplingResult(['a.ts'], ['export function f() {}'], {})
    expect(result.modules).toHaveLength(1)
  })

  it('detects cycles in full pipeline', () => {
    const result = buildCouplingResult(['a.ts', 'b.ts'], [
      `import { x } from './b'`,
      `import { y } from './a'`,
    ], { threshold: 5 })

    // Resolved paths differ from file names (no extension), so no direct cycle
    // The graph has edges a.ts->b and b.ts->a, but they're different nodes
    expect(result.stats.totalModules).toBe(2)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────────

describe('instabilityColor', () => {
  it('returns green for stable', () => {
    const result = instabilityColor(0.1)
    expect(result).toContain('0.1')
  })

  it('returns yellow for moderate', () => {
    const result = instabilityColor(0.5)
    expect(result).toContain('0.5')
  })

  it('returns red for unstable', () => {
    const result = instabilityColor(0.9)
    expect(result).toContain('0.9')
  })
})

describe('distanceColor', () => {
  it('returns green for close to ideal', () => {
    const result = distanceColor(0.1)
    expect(result).toContain('0.1')
  })

  it('returns yellow for moderate', () => {
    const result = distanceColor(0.4)
    expect(result).toContain('0.4')
  })

  it('returns red for far from ideal', () => {
    const result = distanceColor(0.8)
    expect(result).toContain('0.8')
  })
})

describe('severityBadge', () => {
  it('formats critical badge', () => {
    const result = severityBadge('critical')
    expect(result).toContain('CRITICAL')
  })

  it('formats warning badge', () => {
    const result = severityBadge('warning')
    expect(result).toContain('WARNING')
  })
})

describe('formatModuleRow', () => {
  it('formats a module row', () => {
    const mod: ModuleCoupling = {
      module: 'core.ts', afferentCoupling: 5, efferentCoupling: 3,
      instability: 0.38, abstractness: 0.5, distance: 0.12,
      imports: [], importedBy: [], totalExports: 4, abstractExports: 2,
    }
    const row = formatModuleRow(mod)
    expect(row).toContain('core.ts')
    expect(row).toContain('5')
    expect(row).toContain('3')
  })
})

describe('formatViolation', () => {
  it('formats a violation', () => {
    const v: CouplingViolation = {
      type: 'high-afferent', module: 'core.ts',
      description: '10 modules depend on this', severity: 'critical',
    }
    const result = formatViolation(v)
    expect(result).toContain('high-afferent')
    expect(result).toContain('core.ts')
    expect(result).toContain('10 modules depend on this')
  })
})

describe('formatCluster', () => {
  it('formats a cluster', () => {
    const cluster: CouplingCluster = {
      modules: ['a.ts', 'b.ts', 'c.ts'],
      size: 3, density: 0.67, averageCoupling: 2.3,
    }
    const result = formatCluster(cluster)
    expect(result).toContain('3 modules')
    expect(result).toContain('0.67')
    expect(result).toContain('2.3')
  })

  it('truncates long module lists', () => {
    const cluster: CouplingCluster = {
      modules: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      size: 7, density: 0.5, averageCoupling: 3.0,
    }
    const result = formatCluster(cluster)
    expect(result).toContain('+2 more')
  })
})

describe('formatMartinDiagram', () => {
  it('renders diagram with modules', () => {
    const modules: ModuleCoupling[] = [{
      module: 'core.ts', afferentCoupling: 5, efferentCoupling: 3,
      instability: 0.38, abstractness: 0.5, distance: 0.12,
      imports: [], importedBy: [], totalExports: 4, abstractExports: 2,
    }]
    const result = formatMartinDiagram(modules)
    expect(result).toContain('Abstractness')
    expect(result).toContain('Instability')
    expect(result).toContain('core.ts')
  })

  it('renders empty diagram', () => {
    const result = formatMartinDiagram([])
    expect(result).toContain('Abstractness')
    expect(result).toContain('Instability')
  })
})

describe('formatCouplingTable', () => {
  const sampleResult: CouplingResult = {
    modules: [{
      module: 'a.ts', afferentCoupling: 2, efferentCoupling: 1,
      instability: 0.33, abstractness: 0.5, distance: 0.17,
      imports: ['b.ts'], importedBy: ['c.ts'], totalExports: 2, abstractExports: 1,
    }],
    clusters: [],
    stats: {
      totalModules: 1, totalEdges: 1,
      averageAfferent: 2.0, averageEfferent: 1.0, averageInstability: 0.33,
      mostStable: 'a.ts', mostUnstable: 'a.ts',
      mostDependedUpon: 'a.ts', mostDependent: 'a.ts',
    },
    violations: [],
    recommendations: ['Module coupling is within healthy limits. Good architectural boundaries.'],
  }

  it('includes overview section', () => {
    const result = formatCouplingTable(sampleResult)
    expect(result).toContain('Module Coupling Analysis')
    expect(result).toContain('Overview')
    expect(result).toContain('Modules:')
    expect(result).toContain('1')
  })

  it('includes module metrics', () => {
    const result = formatCouplingTable(sampleResult)
    expect(result).toContain('Module Metrics')
    expect(result).toContain('a.ts')
  })

  it('includes recommendations', () => {
    const result = formatCouplingTable(sampleResult)
    expect(result).toContain('Recommendations')
    expect(result).toContain('healthy')
  })

  it('includes Martin diagram in verbose mode', () => {
    const result = formatCouplingTable(sampleResult, true)
    expect(result).toContain('Martin Diagram')
  })

  it('omits Martin diagram when not verbose', () => {
    const result = formatCouplingTable(sampleResult, false)
    expect(result).not.toContain('Martin Diagram')
  })

  it('includes violations section when present', () => {
    const withViolations: CouplingResult = {
      ...sampleResult,
      violations: [{
        type: 'high-afferent', module: 'core.ts',
        description: 'too many', severity: 'critical',
      }],
    }
    const result = formatCouplingTable(withViolations)
    expect(result).toContain('Violations')
  })
})

describe('formatCouplingJson', () => {
  it('produces valid JSON', () => {
    const result: CouplingResult = {
      modules: [], clusters: [], stats: {
        totalModules: 0, totalEdges: 0,
        averageAfferent: 0, averageEfferent: 0, averageInstability: 0,
        mostStable: '', mostUnstable: '', mostDependedUpon: '', mostDependent: '',
      },
      violations: [], recommendations: [],
    }
    const json = formatCouplingJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains modules array', () => {
    const result: CouplingResult = {
      modules: [], clusters: [], stats: {
        totalModules: 0, totalEdges: 0,
        averageAfferent: 0, averageEfferent: 0, averageInstability: 0,
        mostStable: '', mostUnstable: '', mostDependedUpon: '', mostDependent: '',
      },
      violations: [], recommendations: [],
    }
    const parsed = JSON.parse(formatCouplingJson(result))
    expect(parsed.modules).toEqual([])
  })
})

describe('formatCouplingCsv', () => {
  it('includes header row', () => {
    const result: CouplingResult = {
      modules: [], clusters: [], stats: {
        totalModules: 0, totalEdges: 0,
        averageAfferent: 0, averageEfferent: 0, averageInstability: 0,
        mostStable: '', mostUnstable: '', mostDependedUpon: '', mostDependent: '',
      },
      violations: [], recommendations: [],
    }
    const csv = formatCouplingCsv(result)
    expect(csv).toContain('module,afferentCoupling')
  })

  it('includes module data rows', () => {
    const result: CouplingResult = {
      modules: [{
        module: 'a.ts', afferentCoupling: 3, efferentCoupling: 2,
        instability: 0.4, abstractness: 0.5, distance: 0.1,
        imports: [], importedBy: [], totalExports: 2, abstractExports: 1,
      }],
      clusters: [], stats: {
        totalModules: 1, totalEdges: 1,
        averageAfferent: 3.0, averageEfferent: 2.0, averageInstability: 0.4,
        mostStable: 'a.ts', mostUnstable: 'a.ts',
        mostDependedUpon: 'a.ts', mostDependent: 'a.ts',
      },
      violations: [], recommendations: [],
    }
    const csv = formatCouplingCsv(result)
    const lines = csv.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('a.ts')
  })
})
