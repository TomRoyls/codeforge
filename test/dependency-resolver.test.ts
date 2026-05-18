import { describe, it, expect, beforeEach } from 'vitest'
import { DependencyResolver } from '../src/core/dependency-resolver/dependency-resolver.js'
import type { DependencyNode, ResolverConfig, ResolverError, ResolutionOrder } from '../src/core/dependency-resolver/types.js'

// ─── Constructor ──────────────────────────────────────
describe('DependencyResolver constructor', () => {
  it('creates instance with default config', () => {
    const resolver = new DependencyResolver()
    expect(resolver).toBeInstanceOf(DependencyResolver)
  })

  it('accepts partial config', () => {
    const resolver = new DependencyResolver({ allowCycles: true })
    expect(resolver).toBeInstanceOf(DependencyResolver)
  })

  it('accepts full config', () => {
    const resolver = new DependencyResolver({ allowCycles: true, maxDepth: 50, onCycle: 'warn' })
    expect(resolver).toBeInstanceOf(DependencyResolver)
  })

  it('accepts empty config object', () => {
    const resolver = new DependencyResolver({})
    expect(resolver).toBeInstanceOf(DependencyResolver)
  })
})

// ─── addNode ──────────────────────────────────────────
describe('DependencyResolver.addNode', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('adds a node and returns true', () => {
    const result = resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    expect(result).toBe(true)
  })

  it('adds node with dependencies', () => {
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    const result = resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    expect(result).toBe(true)
  })

  it('adds node with metadata', () => {
    const result = resolver.addNode({ id: 'a', dependencies: [], metadata: { version: '1.0.0', scope: 'prod' } })
    expect(result).toBe(true)
  })

  it('returns false for duplicate id', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    const result = resolver.addNode({ id: 'a', dependencies: ['b'], metadata: { different: true } })
    expect(result).toBe(false)
  })

  it('stores defensive copy of dependencies', () => {
    const deps = ['b', 'c']
    resolver.addNode({ id: 'a', dependencies: deps, metadata: {} })
    deps.push('d')
    const node = resolver.getNode('a')
    expect(node!.dependencies).toEqual(['b', 'c'])
  })

  it('stores defensive copy of metadata', () => {
    const meta = { version: '1.0.0' }
    resolver.addNode({ id: 'a', dependencies: [], metadata: meta })
    meta.version = '2.0.0'
    const node = resolver.getNode('a')
    expect(node!.metadata).toEqual({ version: '1.0.0' })
  })

  it('can add multiple different nodes', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: [], metadata: {} })
    expect(resolver.getNodes()).toHaveLength(3)
  })
})

// ─── removeNode ───────────────────────────────────────
describe('DependencyResolver.removeNode', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('removes existing node and returns true', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    const result = resolver.removeNode('a')
    expect(result).toBe(true)
    expect(resolver.getNode('a')).toBeUndefined()
  })

  it('returns false for non-existing node', () => {
    const result = resolver.removeNode('nonexistent')
    expect(result).toBe(false)
  })

  it('can remove and re-add a node', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: { v: 1 } })
    resolver.removeNode('a')
    const result = resolver.addNode({ id: 'a', dependencies: [], metadata: { v: 2 } })
    expect(result).toBe(true)
    expect(resolver.getNode('a')!.metadata).toEqual({ v: 2 })
  })
})

// ─── getNode ──────────────────────────────────────────
describe('DependencyResolver.getNode', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns node for existing id', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: { x: 1 } })
    const node = resolver.getNode('a')
    expect(node).toEqual({ id: 'a', dependencies: ['b'], metadata: { x: 1 } })
  })

  it('returns undefined for non-existing id', () => {
    expect(resolver.getNode('nonexistent')).toBeUndefined()
  })

  it('returns defensive copy (mutations do not affect internal)', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: { x: 1 } })
    const node = resolver.getNode('a')!
    node.dependencies.push('c')
    node.metadata.x = 99
    const internal = resolver.getNode('a')
    expect(internal!.dependencies).toEqual(['b'])
    expect(internal!.metadata).toEqual({ x: 1 })
  })
})

// ─── getNodes ─────────────────────────────────────────
describe('DependencyResolver.getNodes', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns empty array when no nodes', () => {
    expect(resolver.getNodes()).toEqual([])
  })

  it('returns all added nodes', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['a'], metadata: {} })
    const nodes = resolver.getNodes()
    expect(nodes).toHaveLength(2)
    const ids = nodes.map((n) => n.id)
    expect(ids).toContain('a')
    expect(ids).toContain('b')
  })

  it('returns defensive copies', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: { x: 1 } })
    const nodes = resolver.getNodes()
    nodes[0]!.dependencies.push('c')
    const fresh = resolver.getNodes()
    expect(fresh[0]!.dependencies).toEqual(['b'])
  })
})

// ─── resolve ──────────────────────────────────────────
describe('DependencyResolver.resolve', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns empty result for non-existing root', () => {
    const result = resolver.resolve('nonexistent')
    expect(result).toEqual({ nodes: [], cycles: [] })
  })

  it('resolves single node with no dependencies', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    const result = resolver.resolve('a')
    expect(result.nodes).toEqual(['a'])
    expect(result.cycles).toEqual([])
  })

  it('resolves linear dependency chain', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: [], metadata: {} })
    const result = resolver.resolve('a')
    expect(result.nodes).toEqual(['c', 'b', 'a'])
  })

  it('resolves diamond dependency', () => {
    resolver.addNode({ id: 'a', dependencies: ['b', 'c'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['d'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: ['d'], metadata: {} })
    resolver.addNode({ id: 'd', dependencies: [], metadata: {} })
    const result = resolver.resolve('a')
    expect(result.nodes).toEqual(['d', 'b', 'c', 'a'])
  })

  it('detects simple cycle', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['a'], metadata: {} })
    const result = resolver.resolve('a')
    expect(result.cycles.length).toBeGreaterThan(0)
    expect(result.cycles[0]).toContain('a')
    expect(result.cycles[0]).toContain('b')
  })

  it('detects self-cycle', () => {
    resolver.addNode({ id: 'a', dependencies: ['a'], metadata: {} })
    const result = resolver.resolve('a')
    expect(result.cycles.length).toBeGreaterThan(0)
    expect(result.cycles[0]).toEqual(['a', 'a'])
  })

  it('handles 3-node cycle', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: ['a'], metadata: {} })
    const result = resolver.resolve('a')
    expect(result.cycles.length).toBeGreaterThan(0)
  })

  it('skips dependencies not in graph', () => {
    resolver.addNode({ id: 'a', dependencies: ['b', 'nonexistent'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    const result = resolver.resolve('a')
    expect(result.nodes).toEqual(['b', 'a'])
  })

  it('respects maxDepth config', () => {
    const deepResolver = new DependencyResolver({ maxDepth: 3 })
    deepResolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    deepResolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    deepResolver.addNode({ id: 'c', dependencies: ['d'], metadata: {} })
    deepResolver.addNode({ id: 'd', dependencies: ['e'], metadata: {} })
    deepResolver.addNode({ id: 'e', dependencies: [], metadata: {} })
    const result = deepResolver.resolve('a')
    // At depth 3, dfs won't visit 'e' (a=0,b=1,c=2,d=3 — d is > maxDepth check so stops there)
    expect(result.nodes.length).toBeLessThan(5)
  })

  it('handles complex graph with multiple branches', () => {
    resolver.addNode({ id: 'root', dependencies: ['a', 'b'], metadata: {} })
    resolver.addNode({ id: 'a', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c', 'd'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: [], metadata: {} })
    resolver.addNode({ id: 'd', dependencies: [], metadata: {} })
    const result = resolver.resolve('root')
    expect(result.nodes).toContain('root')
    expect(result.nodes).toContain('a')
    expect(result.nodes).toContain('b')
    expect(result.nodes).toContain('c')
    expect(result.nodes).toContain('d')
    // root must come last
    expect(result.nodes.indexOf('root')).toBe(result.nodes.length - 1)
  })
})

// ─── resolveAll ───────────────────────────────────────
describe('DependencyResolver.resolveAll', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns empty for empty graph', () => {
    const result = resolver.resolveAll()
    expect(result.nodes).toEqual([])
    expect(result.cycles).toEqual([])
  })

  it('resolves single node', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    const result = resolver.resolveAll()
    expect(result.nodes).toEqual(['a'])
  })

  it('resolves linear chain with Kahn algorithm', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: [], metadata: {} })
    const result = resolver.resolveAll()
    expect(result.nodes).toHaveLength(3)
    expect(result.nodes).toContain('a')
    expect(result.nodes).toContain('b')
    expect(result.nodes).toContain('c')
  })

  it('resolves diamond', () => {
    resolver.addNode({ id: 'a', dependencies: ['b', 'c'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['d'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: ['d'], metadata: {} })
    resolver.addNode({ id: 'd', dependencies: [], metadata: {} })
    const result = resolver.resolveAll()
    expect(result.nodes).toHaveLength(4)
    expect(result.nodes).toContain('a')
    expect(result.nodes).toContain('b')
    expect(result.nodes).toContain('c')
    expect(result.nodes).toContain('d')
  })

  it('includes all nodes even with cycle', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['a'], metadata: {} })
    const result = resolver.resolveAll()
    expect(result.nodes).toHaveLength(2)
    expect(result.cycles.length).toBeGreaterThan(0)
  })

  it('handles disconnected components', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: [], metadata: {} })
    const result = resolver.resolveAll()
    expect(result.nodes).toHaveLength(3)
  })
})

// ─── detectCycles ─────────────────────────────────────
describe('DependencyResolver.detectCycles', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns empty for empty graph', () => {
    expect(resolver.detectCycles()).toEqual([])
  })

  it('returns empty for acyclic graph', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: [], metadata: {} })
    expect(resolver.detectCycles()).toEqual([])
  })

  it('detects self-loop', () => {
    resolver.addNode({ id: 'a', dependencies: ['a'], metadata: {} })
    const cycles = resolver.detectCycles()
    expect(cycles).toHaveLength(1)
    expect(cycles[0]).toEqual(['a', 'a'])
  })

  it('detects two-node cycle', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['a'], metadata: {} })
    const cycles = resolver.detectCycles()
    expect(cycles.length).toBeGreaterThan(0)
  })

  it('detects three-node cycle', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: ['a'], metadata: {} })
    const cycles = resolver.detectCycles()
    expect(cycles.length).toBeGreaterThan(0)
  })

  it('does not report false positive for diamond', () => {
    resolver.addNode({ id: 'a', dependencies: ['b', 'c'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['d'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: ['d'], metadata: {} })
    resolver.addNode({ id: 'd', dependencies: [], metadata: {} })
    expect(resolver.detectCycles()).toEqual([])
  })
})

// ─── hasCycle ─────────────────────────────────────────
describe('DependencyResolver.hasCycle', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns false for empty graph', () => {
    expect(resolver.hasCycle()).toBe(false)
  })

  it('returns false for acyclic graph', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    expect(resolver.hasCycle()).toBe(false)
  })

  it('returns true for self-loop', () => {
    resolver.addNode({ id: 'a', dependencies: ['a'], metadata: {} })
    expect(resolver.hasCycle()).toBe(true)
  })

  it('returns true for two-node cycle', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['a'], metadata: {} })
    expect(resolver.hasCycle()).toBe(true)
  })

  it('returns true for three-node cycle', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: ['a'], metadata: {} })
    expect(resolver.hasCycle()).toBe(true)
  })

  it('returns false for disconnected acyclic nodes', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    expect(resolver.hasCycle()).toBe(false)
  })
})

// ─── getDependencies ──────────────────────────────────
describe('DependencyResolver.getDependencies', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns empty for non-existing node', () => {
    expect(resolver.getDependencies('nonexistent')).toEqual([])
  })

  it('returns dependencies for existing node', () => {
    resolver.addNode({ id: 'a', dependencies: ['b', 'c'], metadata: {} })
    expect(resolver.getDependencies('a')).toEqual(['b', 'c'])
  })

  it('returns empty for node with no dependencies', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    expect(resolver.getDependencies('a')).toEqual([])
  })

  it('returns defensive copy', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    const deps = resolver.getDependencies('a')
    deps.push('c')
    expect(resolver.getDependencies('a')).toEqual(['b'])
  })
})

// ─── getDependents ────────────────────────────────────
describe('DependencyResolver.getDependents', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns empty when no one depends on the node', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    expect(resolver.getDependents('a')).toEqual([])
  })

  it('returns direct dependents', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    expect(resolver.getDependents('b')).toEqual(['a'])
  })

  it('returns multiple dependents', () => {
    resolver.addNode({ id: 'a', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: [], metadata: {} })
    const dependents = resolver.getDependents('c')
    expect(dependents).toContain('a')
    expect(dependents).toContain('b')
    expect(dependents).toHaveLength(2)
  })

  it('returns empty for non-existing node', () => {
    expect(resolver.getDependents('nonexistent')).toEqual([])
  })
})

// ─── getTransitiveDependencies ────────────────────────
describe('DependencyResolver.getTransitiveDependencies', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns empty for non-existing node', () => {
    expect(resolver.getTransitiveDependencies('nonexistent')).toEqual([])
  })

  it('returns empty for node with no dependencies', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    expect(resolver.getTransitiveDependencies('a')).toEqual([])
  })

  it('returns direct dependencies', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    expect(resolver.getTransitiveDependencies('a')).toEqual(['b'])
  })

  it('returns transitive dependencies', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: [], metadata: {} })
    const transitive = resolver.getTransitiveDependencies('a')
    expect(transitive).toContain('b')
    expect(transitive).toContain('c')
  })

  it('does not include the node itself', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    expect(resolver.getTransitiveDependencies('a')).not.toContain('a')
  })

  it('handles diamond without duplicates', () => {
    resolver.addNode({ id: 'a', dependencies: ['b', 'c'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['d'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: ['d'], metadata: {} })
    resolver.addNode({ id: 'd', dependencies: [], metadata: {} })
    const transitive = resolver.getTransitiveDependencies('a')
    expect(transitive.filter((id) => id === 'd')).toHaveLength(1)
    expect(transitive).toHaveLength(3)
  })
})

// ─── getTransitiveDependents ──────────────────────────
describe('DependencyResolver.getTransitiveDependents', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns empty when no one depends on node', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    expect(resolver.getTransitiveDependents('a')).toEqual([])
  })

  it('returns direct dependents', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    expect(resolver.getTransitiveDependents('b')).toEqual(['a'])
  })

  it('returns transitive dependents', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: [], metadata: {} })
    const transitive = resolver.getTransitiveDependents('c')
    expect(transitive).toContain('b')
    expect(transitive).toContain('a')
  })

  it('does not include the node itself', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    expect(resolver.getTransitiveDependents('b')).not.toContain('b')
  })
})

// ─── getOrphans ───────────────────────────────────────
describe('DependencyResolver.getOrphans', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns all nodes when graph is disconnected', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    const orphans = resolver.getOrphans()
    expect(orphans).toHaveLength(2)
    expect(orphans).toContain('a')
    expect(orphans).toContain('b')
  })

  it('returns only nodes with no dependents', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    // 'a' has no dependents, 'b' is depended on by 'a'
    const orphans = resolver.getOrphans()
    expect(orphans).toContain('a')
    expect(orphans).not.toContain('b')
  })

  it('returns empty for empty graph', () => {
    expect(resolver.getOrphans()).toEqual([])
  })
})

// ─── getRoots ─────────────────────────────────────────
describe('DependencyResolver.getRoots', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns all nodes when all have no dependencies', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    const roots = resolver.getRoots()
    expect(roots).toHaveLength(2)
  })

  it('returns only nodes with empty dependency list', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    const roots = resolver.getRoots()
    expect(roots).toEqual(['b'])
  })

  it('returns empty for empty graph', () => {
    expect(resolver.getRoots()).toEqual([])
  })

  it('distinguishes between empty deps and deps to missing nodes', () => {
    // 'a' has ['missing'] but that's still not empty
    resolver.addNode({ id: 'a', dependencies: ['missing'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    const roots = resolver.getRoots()
    // Only 'b' has empty dependencies array
    expect(roots).toEqual(['b'])
  })
})

// ─── getStatistics ────────────────────────────────────
describe('DependencyResolver.getStatistics', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns zeros for empty graph', () => {
    const stats = resolver.getStatistics()
    expect(stats).toEqual({
      totalNodes: 0,
      totalEdges: 0,
      avgDependencies: 0,
      maxDepth: 0,
      cycles: 0,
    })
  })

  it('counts total nodes correctly', () => {
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    expect(resolver.getStatistics().totalNodes).toBe(2)
  })

  it('counts edges only for existing dependencies', () => {
    resolver.addNode({ id: 'a', dependencies: ['b', 'nonexistent'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    // Only 1 valid edge: a -> b
    expect(resolver.getStatistics().totalEdges).toBe(1)
  })

  it('computes average dependencies', () => {
    resolver.addNode({ id: 'a', dependencies: ['b', 'c'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: [], metadata: {} })
    // a: 2 edges, b: 1 edge, c: 0 edges = 3/3 = 1
    const stats = resolver.getStatistics()
    expect(stats.avgDependencies).toBe(1)
  })

  it('computes maxDepth for linear chain', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['c'], metadata: {} })
    resolver.addNode({ id: 'c', dependencies: [], metadata: {} })
    const stats = resolver.getStatistics()
    expect(stats.maxDepth).toBe(2)
  })

  it('counts cycles', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['a'], metadata: {} })
    expect(resolver.getStatistics().cycles).toBeGreaterThan(0)
  })

  it('reports 0 cycles for acyclic graph', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    expect(resolver.getStatistics().cycles).toBe(0)
  })
})

// ─── validate ─────────────────────────────────────────
describe('DependencyResolver.validate', () => {
  let resolver: DependencyResolver

  beforeEach(() => {
    resolver = new DependencyResolver()
  })

  it('returns empty for valid graph', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    expect(resolver.validate()).toEqual([])
  })

  it('returns empty for empty graph', () => {
    expect(resolver.validate()).toEqual([])
  })

  it('detects missing dependencies', () => {
    resolver.addNode({ id: 'a', dependencies: ['missing'], metadata: {} })
    const errors = resolver.validate()
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]!.type).toBe('missing')
    expect(errors[0]!.path).toEqual(['a', 'missing'])
  })

  it('detects cycles', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['a'], metadata: {} })
    const errors = resolver.validate()
    const cycleErrors = errors.filter((e) => e.type === 'cycle')
    expect(cycleErrors.length).toBeGreaterThan(0)
  })

  it('reports both missing and cycle errors', () => {
    resolver.addNode({ id: 'a', dependencies: ['b', 'missing'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['a'], metadata: {} })
    const errors = resolver.validate()
    expect(errors.some((e) => e.type === 'missing')).toBe(true)
    expect(errors.some((e) => e.type === 'cycle')).toBe(true)
  })

  it('error message includes path for cycle', () => {
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: ['a'], metadata: {} })
    const errors = resolver.validate()
    const cycleError = errors.find((e) => e.type === 'cycle')
    expect(cycleError!.message).toContain('Cycle detected')
  })

  it('error message includes node id for missing', () => {
    resolver.addNode({ id: 'a', dependencies: ['ghost'], metadata: {} })
    const errors = resolver.validate()
    const missingError = errors.find((e) => e.type === 'missing')
    expect(missingError!.message).toContain('ghost')
    expect(missingError!.message).toContain('a')
  })
})

// ─── clear ────────────────────────────────────────────
describe('DependencyResolver.clear', () => {
  it('removes all nodes', () => {
    const resolver = new DependencyResolver()
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    resolver.clear()
    expect(resolver.getNodes()).toEqual([])
  })

  it('allows adding nodes after clear', () => {
    const resolver = new DependencyResolver()
    resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    resolver.clear()
    const result = resolver.addNode({ id: 'a', dependencies: [], metadata: {} })
    expect(result).toBe(true)
  })

  it('clear on empty graph is no-op', () => {
    const resolver = new DependencyResolver()
    expect(() => resolver.clear()).not.toThrow()
  })
})

// ─── Edge Cases ───────────────────────────────────────
describe('DependencyResolver edge cases', () => {
  it('handles node with dependencies pointing to non-existent nodes in resolve', () => {
    const resolver = new DependencyResolver()
    resolver.addNode({ id: 'a', dependencies: ['ghost'], metadata: {} })
    const result = resolver.resolve('a')
    expect(result.nodes).toEqual(['a'])
    expect(result.cycles).toEqual([])
  })

  it('handles large acyclic graph', () => {
    const resolver = new DependencyResolver()
    for (let i = 0; i < 100; i++) {
      const deps = i === 0 ? [] : [`node-${i - 1}`]
      resolver.addNode({ id: `node-${i}`, dependencies: deps, metadata: {} })
    }
    const result = resolver.resolve('node-99')
    expect(result.nodes).toHaveLength(100)
    expect(result.nodes[0]).toBe('node-0')
    expect(result.nodes[99]).toBe('node-99')
    expect(result.cycles).toEqual([])
  })

  it('handles multiple disconnected subgraphs in resolveAll', () => {
    const resolver = new DependencyResolver()
    // Subgraph 1: a -> b
    resolver.addNode({ id: 'a', dependencies: ['b'], metadata: {} })
    resolver.addNode({ id: 'b', dependencies: [], metadata: {} })
    // Subgraph 2: c -> d
    resolver.addNode({ id: 'c', dependencies: ['d'], metadata: {} })
    resolver.addNode({ id: 'd', dependencies: [], metadata: {} })
    const result = resolver.resolveAll()
    expect(result.nodes).toHaveLength(4)
    expect(result.nodes).toContain('a')
    expect(result.nodes).toContain('b')
    expect(result.nodes).toContain('c')
    expect(result.nodes).toContain('d')
  })

  it('validate returns correct error shape', () => {
    const resolver = new DependencyResolver()
    resolver.addNode({ id: 'a', dependencies: ['missing'], metadata: {} })
    const errors = resolver.validate()
    const err = errors[0]!
    expect(err).toHaveProperty('type')
    expect(err).toHaveProperty('message')
    expect(err).toHaveProperty('path')
    expect(typeof err.type).toBe('string')
    expect(typeof err.message).toBe('string')
    expect(Array.isArray(err.path)).toBe(true)
  })

  it('getStatistics handles single node with self-loop', () => {
    const resolver = new DependencyResolver()
    resolver.addNode({ id: 'a', dependencies: ['a'], metadata: {} })
    const stats = resolver.getStatistics()
    expect(stats.totalNodes).toBe(1)
    expect(stats.totalEdges).toBe(1)
    expect(stats.cycles).toBeGreaterThan(0)
  })
})
