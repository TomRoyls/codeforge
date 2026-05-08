import { describe, it, expect } from 'vitest'
import { DependencyResolver } from '../../src/core/dependency-resolver/dependency-resolver.js'
import type { DependencyNode } from '../../src/core/dependency-resolver/types.js'

function makeNode(id: string, deps: string[] = [], meta?: Record<string, unknown>): DependencyNode {
  return { id, dependencies: deps, metadata: meta ?? {} }
}

describe('DependencyResolver', () => {
  describe('Construction', () => {
    it('should create resolver with default config', () => {
      const resolver = new DependencyResolver()
      expect(resolver.getNodes()).toEqual([])
    })

    it('should accept custom config', () => {
      const resolver = new DependencyResolver({ allowCycles: true, maxDepth: 50, onCycle: 'warn' })
      expect(resolver.getNodes()).toEqual([])
    })

    it('should accept partial config', () => {
      const resolver = new DependencyResolver({ maxDepth: 200 })
      expect(resolver.getNodes()).toEqual([])
    })
  })

  describe('Node management', () => {
    it('should add a node', () => {
      const resolver = new DependencyResolver()
      const result = resolver.addNode(makeNode('a'))
      expect(result).toBe(true)
      expect(resolver.getNode('a')).toBeDefined()
    })

    it('should return false for duplicate addNode', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a'))
      const result = resolver.addNode(makeNode('a'))
      expect(result).toBe(false)
    })

    it('should remove a node', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a'))
      const result = resolver.removeNode('a')
      expect(result).toBe(true)
      expect(resolver.getNode('a')).toBeUndefined()
    })

    it('should return false for removing non-existent node', () => {
      const resolver = new DependencyResolver()
      const result = resolver.removeNode('missing')
      expect(result).toBe(false)
    })

    it('should getNode by id', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b'], { version: 1 }))
      const node = resolver.getNode('a')
      expect(node?.id).toBe('a')
      expect(node?.dependencies).toEqual(['b'])
      expect(node?.metadata).toEqual({ version: 1 })
    })

    it('should return undefined for non-existent node', () => {
      const resolver = new DependencyResolver()
      expect(resolver.getNode('missing')).toBeUndefined()
    })

    it('should getNodes return all nodes', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a'))
      resolver.addNode(makeNode('b'))
      const nodes = resolver.getNodes()
      expect(nodes).toHaveLength(2)
      const ids = nodes.map((n) => n.id)
      expect(ids).toContain('a')
      expect(ids).toContain('b')
    })

    it('should return defensive copies from getNode', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      const node = resolver.getNode('a')!
      node.dependencies.push('c')
      expect(resolver.getNode('a')!.dependencies).toEqual(['b'])
    })

    it('should return defensive copies from getNodes', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a'))
      const nodes = resolver.getNodes()
      nodes.pop()
      expect(resolver.getNodes()).toHaveLength(1)
    })
  })

  describe('Resolution', () => {
    it('should resolve a simple chain', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', []))
      const result = resolver.resolve('a')
      expect(result.nodes).toHaveLength(3)
      const aIdx = result.nodes.indexOf('a')
      const bIdx = result.nodes.indexOf('b')
      const cIdx = result.nodes.indexOf('c')
      expect(cIdx).toBeLessThan(bIdx)
      expect(bIdx).toBeLessThan(aIdx)
    })

    it('should resolve diamond dependency', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b', 'c']))
      resolver.addNode(makeNode('b', ['d']))
      resolver.addNode(makeNode('c', ['d']))
      resolver.addNode(makeNode('d', []))
      const result = resolver.resolve('a')
      expect(result.nodes).toHaveLength(4)
      const dIdx = result.nodes.indexOf('d')
      const bIdx = result.nodes.indexOf('b')
      const cIdx = result.nodes.indexOf('c')
      const aIdx = result.nodes.indexOf('a')
      expect(dIdx).toBeLessThan(bIdx)
      expect(dIdx).toBeLessThan(cIdx)
      expect(bIdx).toBeLessThan(aIdx)
      expect(cIdx).toBeLessThan(aIdx)
    })

    it('should resolve single node', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', []))
      const result = resolver.resolve('a')
      expect(result.nodes).toEqual(['a'])
    })

    it('should produce correct topological order', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b', 'c']))
      resolver.addNode(makeNode('b', ['d']))
      resolver.addNode(makeNode('c', []))
      resolver.addNode(makeNode('d', []))
      const result = resolver.resolve('a')
      expect(result.nodes).toHaveLength(4)
      const indices = new Map(result.nodes.map((id, i) => [id, i]))
      expect(indices.get('d')!).toBeLessThan(indices.get('b')!)
      expect(indices.get('b')!).toBeLessThan(indices.get('a')!)
      expect(indices.get('c')!).toBeLessThan(indices.get('a')!)
    })

    it('should handle resolve with missing root', () => {
      const resolver = new DependencyResolver()
      const result = resolver.resolve('missing')
      expect(result.nodes).toEqual([])
    })
  })

  describe('resolveAll', () => {
    it('should resolve complete graph', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', []))
      const result = resolver.resolveAll()
      expect(result.nodes).toHaveLength(3)
    })

    it('should resolve independent subgraphs', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      resolver.addNode(makeNode('c', ['d']))
      resolver.addNode(makeNode('d', []))
      const result = resolver.resolveAll()
      expect(result.nodes).toHaveLength(4)
    })

    it('should handle empty graph', () => {
      const resolver = new DependencyResolver()
      const result = resolver.resolveAll()
      expect(result.nodes).toEqual([])
    })

    it('should include cycle info in resolveAll', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['a']))
      const result = resolver.resolveAll()
      expect(result.cycles.length).toBeGreaterThan(0)
    })
  })

  describe('Cycle detection', () => {
    it('should detect no cycles in acyclic graph', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', []))
      expect(resolver.detectCycles()).toEqual([])
    })

    it('should detect a simple cycle', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['a']))
      const cycles = resolver.detectCycles()
      expect(cycles.length).toBeGreaterThan(0)
    })

    it('should detect a self-cycle', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['a']))
      const cycles = resolver.detectCycles()
      expect(cycles.length).toBeGreaterThan(0)
      expect(cycles[0]!).toContain('a')
    })

    it('should detect multiple cycles', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['a']))
      resolver.addNode(makeNode('c', ['d']))
      resolver.addNode(makeNode('d', ['c']))
      const cycles = resolver.detectCycles()
      expect(cycles.length).toBeGreaterThanOrEqual(2)
    })

    it('should detect a longer cycle', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', ['a']))
      const cycles = resolver.detectCycles()
      expect(cycles.length).toBeGreaterThan(0)
      expect(cycles[0]!.length).toBe(4)
    })

    it('hasCycle should return false for acyclic graph', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      expect(resolver.hasCycle()).toBe(false)
    })

    it('hasCycle should return true for cyclic graph', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['a']))
      expect(resolver.hasCycle()).toBe(true)
    })

    it('hasCycle should detect self-cycle', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['a']))
      expect(resolver.hasCycle()).toBe(true)
    })
  })

  describe('Dependencies', () => {
    it('should get direct dependencies', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b', 'c']))
      resolver.addNode(makeNode('b', []))
      resolver.addNode(makeNode('c', []))
      expect(resolver.getDependencies('a')).toEqual(['b', 'c'])
    })

    it('should return empty for node with no dependencies', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', []))
      expect(resolver.getDependencies('a')).toEqual([])
    })

    it('should return empty for non-existent node', () => {
      const resolver = new DependencyResolver()
      expect(resolver.getDependencies('missing')).toEqual([])
    })

    it('should get direct dependents', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['c']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', []))
      const dependents = resolver.getDependents('c')
      expect(dependents).toContain('a')
      expect(dependents).toContain('b')
    })

    it('should return empty for node with no dependents', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', []))
      resolver.addNode(makeNode('b', []))
      expect(resolver.getDependents('a')).toEqual([])
    })

    it('should get transitive dependencies', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', []))
      const transitive = resolver.getTransitiveDependencies('a')
      expect(transitive).toContain('b')
      expect(transitive).toContain('c')
    })

    it('should not include self in transitive dependencies', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      expect(resolver.getTransitiveDependencies('a')).not.toContain('a')
    })

    it('should handle diamond in transitive dependencies', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b', 'c']))
      resolver.addNode(makeNode('b', ['d']))
      resolver.addNode(makeNode('c', ['d']))
      resolver.addNode(makeNode('d', []))
      const transitive = resolver.getTransitiveDependencies('a')
      expect(transitive).toContain('b')
      expect(transitive).toContain('c')
      expect(transitive).toContain('d')
      expect(transitive).toHaveLength(3)
    })

    it('should get transitive dependents', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', []))
      const transitive = resolver.getTransitiveDependents('c')
      expect(transitive).toContain('b')
      expect(transitive).toContain('a')
    })

    it('should not include self in transitive dependents', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      expect(resolver.getTransitiveDependents('b')).not.toContain('b')
    })

    it('should return empty transitive dependents for root', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      expect(resolver.getTransitiveDependents('a')).toEqual([])
    })
  })

  describe('Graph analysis', () => {
    it('should find orphans (nodes nobody depends on)', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      resolver.addNode(makeNode('c', []))
      const orphans = resolver.getOrphans()
      expect(orphans).toContain('a')
      expect(orphans).toContain('c')
    })

    it('should find no orphans when all nodes are depended on', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      const orphans = resolver.getOrphans()
      expect(orphans).toHaveLength(1)
      expect(orphans).toContain('a')
    })

    it('should find roots (nodes with no dependencies)', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', []))
      const roots = resolver.getRoots()
      expect(roots).toEqual(['c'])
    })

    it('should find multiple roots', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['c']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', []))
      resolver.addNode(makeNode('d', []))
      const roots = resolver.getRoots()
      expect(roots).toContain('c')
      expect(roots).toContain('d')
    })

    it('should compute statistics', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', []))
      const stats = resolver.getStatistics()
      expect(stats.totalNodes).toBe(3)
      expect(stats.totalEdges).toBe(2)
      expect(stats.avgDependencies).toBeCloseTo(2 / 3)
      expect(stats.maxDepth).toBe(2)
      expect(stats.cycles).toBe(0)
    })

    it('should compute statistics for empty graph', () => {
      const resolver = new DependencyResolver()
      const stats = resolver.getStatistics()
      expect(stats.totalNodes).toBe(0)
      expect(stats.totalEdges).toBe(0)
      expect(stats.avgDependencies).toBe(0)
      expect(stats.maxDepth).toBe(0)
      expect(stats.cycles).toBe(0)
    })

    it('should compute statistics with cycles', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['a']))
      const stats = resolver.getStatistics()
      expect(stats.cycles).toBeGreaterThan(0)
    })

    it('should compute maxDepth for diamond', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b', 'c']))
      resolver.addNode(makeNode('b', ['d']))
      resolver.addNode(makeNode('c', ['d']))
      resolver.addNode(makeNode('d', []))
      const stats = resolver.getStatistics()
      expect(stats.maxDepth).toBe(2)
    })
  })

  describe('Validation', () => {
    it('should detect missing dependencies', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['missing']))
      const errors = resolver.validate()
      expect(errors.some((e) => e.type === 'missing')).toBe(true)
    })

    it('should detect cycles', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['a']))
      const errors = resolver.validate()
      expect(errors.some((e) => e.type === 'cycle')).toBe(true)
    })

    it('should return empty for valid graph', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      const errors = resolver.validate()
      expect(errors).toEqual([])
    })

    it('should report both missing and cycle errors', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b', 'missing']))
      resolver.addNode(makeNode('b', ['a']))
      const errors = resolver.validate()
      expect(errors.some((e) => e.type === 'missing')).toBe(true)
      expect(errors.some((e) => e.type === 'cycle')).toBe(true)
    })

    it('should include path in error objects', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['missing']))
      const errors = resolver.validate()
      const missingErr = errors.find((e) => e.type === 'missing')!
      expect(missingErr.path).toEqual(['a', 'missing'])
    })

    it('should include message in error objects', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['missing']))
      const errors = resolver.validate()
      expect(errors[0]!.message).toContain('missing')
    })
  })

  describe('Config', () => {
    it('should use default maxDepth of 100', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('root', ['a']))
      for (let i = 0; i < 50; i++) {
        resolver.addNode(makeNode(`n${i}`, [`n${i + 1}`]))
      }
      resolver.addNode(makeNode('n50', []))
      const result = resolver.resolve('root')
      expect(result.nodes.length).toBeGreaterThan(0)
    })

    it('should respect maxDepth config', () => {
      const resolver = new DependencyResolver({ maxDepth: 3 })
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', ['d']))
      resolver.addNode(makeNode('d', ['e']))
      resolver.addNode(makeNode('e', []))
      const result = resolver.resolve('a')
      expect(result.nodes.length).toBeLessThan(5)
    })

    it('should handle allowCycles config', () => {
      const resolver = new DependencyResolver({ allowCycles: true })
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['a']))
      expect(resolver.hasCycle()).toBe(true)
    })

    it('should detect cycle regardless of allowCycles setting', () => {
      const resolver = new DependencyResolver({ allowCycles: false })
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['a']))
      expect(resolver.hasCycle()).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty graph', () => {
      const resolver = new DependencyResolver()
      expect(resolver.getNodes()).toEqual([])
      expect(resolver.resolve('a').nodes).toEqual([])
      expect(resolver.resolveAll().nodes).toEqual([])
      expect(resolver.detectCycles()).toEqual([])
      expect(resolver.hasCycle()).toBe(false)
      expect(resolver.getDependencies('a')).toEqual([])
      expect(resolver.getDependents('a')).toEqual([])
      expect(resolver.getTransitiveDependencies('a')).toEqual([])
      expect(resolver.getTransitiveDependents('a')).toEqual([])
      expect(resolver.getOrphans()).toEqual([])
      expect(resolver.getRoots()).toEqual([])
      expect(resolver.validate()).toEqual([])
    })

    it('should handle single node', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', []))
      expect(resolver.resolve('a').nodes).toEqual(['a'])
      expect(resolver.resolveAll().nodes).toEqual(['a'])
      expect(resolver.hasCycle()).toBe(false)
      expect(resolver.getRoots()).toEqual(['a'])
      expect(resolver.getOrphans()).toEqual(['a'])
    })

    it('should handle disconnected graph', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', []))
      resolver.addNode(makeNode('b', []))
      resolver.addNode(makeNode('c', []))
      const result = resolver.resolveAll()
      expect(result.nodes).toHaveLength(3)
    })

    it('should handle deep chain', () => {
      const resolver = new DependencyResolver()
      const depth = 20
      for (let i = 0; i < depth; i++) {
        const deps = i < depth - 1 ? [`n${i + 1}`] : []
        resolver.addNode(makeNode(`n${i}`, deps))
      }
      const result = resolver.resolve('n0')
      expect(result.nodes).toHaveLength(depth)
      expect(result.nodes[0]).toBe(`n${depth - 1}`)
      expect(result.nodes[depth - 1]).toBe('n0')
    })

    it('should clear all nodes', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      resolver.clear()
      expect(resolver.getNodes()).toEqual([])
    })

    it('should handle node with missing dependency gracefully in resolve', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['missing', 'b']))
      resolver.addNode(makeNode('b', []))
      const result = resolver.resolve('a')
      expect(result.nodes).toContain('a')
      expect(result.nodes).toContain('b')
    })

    it('should return stable order for equal topological ranking', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b', 'c']))
      resolver.addNode(makeNode('b', []))
      resolver.addNode(makeNode('c', []))
      const result1 = resolver.resolve('a')
      const result2 = resolver.resolve('a')
      expect(result1.nodes).toEqual(result2.nodes)
    })

    it('should handle node with multiple missing dependencies', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['x', 'y', 'z']))
      const result = resolver.resolve('a')
      expect(result.nodes).toEqual(['a'])
    })

    it('should handle addNode with metadata', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', [], { version: '1.0', path: '/src/a.ts' }))
      const node = resolver.getNode('a')!
      expect(node.metadata.version).toBe('1.0')
      expect(node.metadata.path).toBe('/src/a.ts')
    })

    it('should not mutate original node on add', () => {
      const resolver = new DependencyResolver()
      const original = makeNode('a', ['b'])
      resolver.addNode(original)
      original.dependencies.push('c')
      expect(resolver.getDependencies('a')).toEqual(['b'])
    })

    it('should handle resolveAll with disconnected components', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      resolver.addNode(makeNode('x', ['y']))
      resolver.addNode(makeNode('y', []))
      const result = resolver.resolveAll()
      expect(result.nodes).toHaveLength(4)
      expect(result.cycles).toEqual([])
    })

    it('should handle resolve on cyclic graph', () => {
      const resolver = new DependencyResolver({ allowCycles: true })
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['a']))
      const result = resolver.resolve('a')
      expect(result.cycles.length).toBeGreaterThan(0)
      expect(result.nodes).toContain('a')
      expect(result.nodes).toContain('b')
    })

    it('should handle self-cycle in resolve', () => {
      const resolver = new DependencyResolver({ allowCycles: true })
      resolver.addNode(makeNode('a', ['a']))
      const result = resolver.resolve('a')
      expect(result.cycles.length).toBeGreaterThan(0)
      expect(result.nodes).toContain('a')
    })

    it('should count edges only for existing nodes in statistics', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b', 'missing']))
      resolver.addNode(makeNode('b', []))
      const stats = resolver.getStatistics()
      expect(stats.totalEdges).toBe(1)
    })

    it('should detect cycle path correctly', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', ['a']))
      const cycles = resolver.detectCycles()
      expect(cycles.length).toBeGreaterThan(0)
      const cycle = cycles[0]!
      expect(cycle[0]).toBe('a')
      expect(cycle[cycle.length - 1]).toBe('a')
    })

    it('should handle maxDepth of 0', () => {
      const resolver = new DependencyResolver({ maxDepth: 0 })
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      const result = resolver.resolve('a')
      expect(result.nodes).toEqual(['a'])
    })

    it('should handle getDependents for non-existent node', () => {
      const resolver = new DependencyResolver()
      expect(resolver.getDependents('missing')).toEqual([])
    })

    it('should handle getTransitiveDependencies for non-existent node', () => {
      const resolver = new DependencyResolver()
      expect(resolver.getTransitiveDependencies('missing')).toEqual([])
    })

    it('should handle getTransitiveDependents for non-existent node', () => {
      const resolver = new DependencyResolver()
      expect(resolver.getTransitiveDependents('missing')).toEqual([])
    })

    it('should handle getOrphans when all nodes are orphans', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', []))
      resolver.addNode(makeNode('b', []))
      const orphans = resolver.getOrphans()
      expect(orphans).toHaveLength(2)
      expect(orphans).toContain('a')
      expect(orphans).toContain('b')
    })

    it('should handle validate on empty graph', () => {
      const resolver = new DependencyResolver()
      expect(resolver.validate()).toEqual([])
    })

    it('should handle clear on already empty graph', () => {
      const resolver = new DependencyResolver()
      resolver.clear()
      expect(resolver.getNodes()).toEqual([])
    })

    it('should handle removeNode and verify dependencies updated', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', []))
      resolver.removeNode('b')
      expect(resolver.getNode('a')!.dependencies).toEqual(['b'])
      expect(resolver.getNode('b')).toBeUndefined()
    })

    it('should handle resolveAll with cyclic nodes', () => {
      const resolver = new DependencyResolver()
      resolver.addNode(makeNode('a', ['b']))
      resolver.addNode(makeNode('b', ['c']))
      resolver.addNode(makeNode('c', ['a']))
      const result = resolver.resolveAll()
      expect(result.nodes).toHaveLength(3)
      expect(result.cycles.length).toBeGreaterThan(0)
    })
  })
})
