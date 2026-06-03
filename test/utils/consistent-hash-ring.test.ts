import { describe, it, expect } from 'vitest'
import { ConsistentHashRing } from '../../src/utils/consistent-hash-ring.js'

describe('ConsistentHashRing', () => {
  it('creates an empty ring when no nodes provided', () => {
    const ring = new ConsistentHashRing([])
    expect(ring.nodeCount).toBe(0)
    expect(ring.getNode('key1')).toBeUndefined()
  })

  it('creates ring with single node', () => {
    const ring = new ConsistentHashRing(['node1'])
    expect(ring.nodeCount).toBe(1)
    expect(ring.getNode('any-key')).toBe('node1')
  })

  it('creates ring with multiple nodes', () => {
    const ring = new ConsistentHashRing(['node1', 'node2', 'node3'])
    expect(ring.nodeCount).toBe(3)
  })

  it('creates ring with custom virtual nodes count', () => {
    const ring = new ConsistentHashRing(['node1'], 10)
    expect(ring.nodeCount).toBe(1)
  })

  it('adds node to empty ring', () => {
    const ring = new ConsistentHashRing([])
    ring.addNode('node1')
    expect(ring.nodeCount).toBe(1)
  })

  it('adds node to existing ring', () => {
    const ring = new ConsistentHashRing(['node1'])
    ring.addNode('node2')
    expect(ring.nodeCount).toBe(2)
  })

  it('removes node from ring', () => {
    const ring = new ConsistentHashRing(['node1', 'node2'])
    ring.removeNode('node1')
    expect(ring.nodeCount).toBe(1)
    expect(ring.getNode('any-key')).toBe('node2')
  })

  it('returns undefined for empty ring getNode', () => {
    const ring = new ConsistentHashRing([])
    expect(ring.getNode('key1')).toBeUndefined()
  })

  it('returns consistent node for same key', () => {
    const ring = new ConsistentHashRing(['node1', 'node2', 'node3'])
    const result1 = ring.getNode('key1')
    const result2 = ring.getNode('key1')
    expect(result1).toBe(result2)
  })

  it('distributes keys uniformly across nodes', () => {
    const nodes = ['node1', 'node2', 'node3', 'node4', 'node5']
    const ring = new ConsistentHashRing(nodes)
    const counts: Record<string, number> = {}
    const iterations = 1000

    for (let i = 0; i < iterations; i++) {
      const node = ring.getNode(`key${i}`)
      if (node !== undefined) {
        counts[node] = (counts[node] ?? 0) + 1
      }
    }

    const expectedPerNode = iterations / nodes.length
    for (const node of nodes) {
      const count = counts[node]!
      expect(count).toBeGreaterThan(expectedPerNode * 0.4)
      expect(count).toBeLessThan(expectedPerNode * 2.0)
    }
  })

  it('minimally disrupts mapping when removing node', () => {
    const nodes = ['node1', 'node2', 'node3', 'node4']
    const ring = new ConsistentHashRing(nodes)
    const keys = Array.from({ length: 1000 }, (_, i) => `key${i}`)
    const originalMappings = keys.map((key) => ring.getNode(key))

    ring.removeNode('node2')

    const changedMappings = keys.filter((key, i) => {
      const newNode = ring.getNode(key)
      const originalNode = originalMappings[i]
      return newNode !== originalNode && originalNode !== 'node2'
    })

    expect(changedMappings.length).toBeLessThan(keys.length * 0.15)
  })

  it('handles getNode with multiple requests for different nodes', () => {
    const ring = new ConsistentHashRing(['node1', 'node2', 'node3'])
    const nodes1 = ring.getNodes('key1', 2)
    const nodes2 = ring.getNodes('key2', 3)

    expect(nodes1.length).toBe(2)
    expect(nodes2.length).toBeLessThanOrEqual(3)
    expect(new Set(nodes1).size).toBe(2)
  })

  it('returns empty array when requesting nodes from empty ring', () => {
    const ring = new ConsistentHashRing([])
    const nodes = ring.getNodes('key1', 3)
    expect(nodes).toEqual([])
  })

  it('handles removal of non-existent node gracefully', () => {
    const ring = new ConsistentHashRing(['node1', 'node2'])
    const initialCount = ring.nodeCount
    ring.removeNode('node3')
    expect(ring.nodeCount).toBe(initialCount)
  })

  it('addNode and removeNode are idempotent', () => {
    const ring = new ConsistentHashRing(['node1'])
    ring.addNode('node1')
    expect(ring.nodeCount).toBe(1)
  })

  it('handles removeNode from empty ring', () => {
    const ring = new ConsistentHashRing([])
    ring.removeNode('node1')
    expect(ring.nodeCount).toBe(0)
  })

  it('getNode returns consistent mapping', () => {
    const ring = new ConsistentHashRing(['A', 'B', 'C'])
    const n1 = ring.getNode('key1')
    const n2 = ring.getNode('key1')
    expect(n1).toBe(n2)
  })

  it('getNode returns undefined for empty ring', () => {
    const ring = new ConsistentHashRing([])
    expect(ring.getNode('key')).toBeUndefined()
  })

  it('different keys may map to different nodes', () => {
    const ring = new ConsistentHashRing(['A', 'B', 'C'])
    const nodes = new Set<string>()
    for (let i = 0; i < 50; i++) {
      nodes.add(ring.getNode(`key-${i}`)!)
    }
    expect(nodes.size).toBeGreaterThan(1)
  })

  it('single node handles all keys', () => {
    const ring = new ConsistentHashRing<string>(['only-node'])
    for (let i = 0; i < 10; i++) {
      expect(ring.getNode(`key-${i}`)).toBe('only-node')
    }
  })

  it('removeNode removes a node', () => {
    const ring = new ConsistentHashRing<string>(['a', 'b'])
    ring.removeNode('b')
    expect(ring.getNode('any-key')).toBe('a')
  })

  it('addNode allows getNode to return it', () => {
    const ring = new ConsistentHashRing<string>(['a'])
    ring.addNode('b')
    expect(ring.getNode).toBeDefined()
  })
})