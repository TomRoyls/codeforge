import { beforeEach, describe, expect, it } from 'vitest'

import { ConsistentHash } from '../src/utils/consistent-hash.js'

// ─── Constructor ──────────────────────────────────────
describe('ConsistentHash constructor', () => {
  it('uses default virtualNodes of 150', () => {
    const ch = new ConsistentHash<string>()
    ch.addNode('a')
    expect(ch.ringSize).toBe(150)
  })

  it('accepts custom virtualNodes', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 10 })
    ch.addNode('a')
    expect(ch.ringSize).toBe(10)
  })

  it('starts with zero nodes and zero ring size', () => {
    const ch = new ConsistentHash<string>()
    expect(ch.nodeCount).toBe(0)
    expect(ch.ringSize).toBe(0)
  })
})

// ─── addNode ──────────────────────────────────────────
describe('addNode', () => {
  let ch: ConsistentHash<string>

  beforeEach(() => {
    ch = new ConsistentHash<string>({ virtualNodes: 20 })
  })

  it('increments nodeCount', () => {
    expect(ch.nodeCount).toBe(0)
    ch.addNode('a')
    expect(ch.nodeCount).toBe(1)
    ch.addNode('b')
    expect(ch.nodeCount).toBe(2)
  })

  it('increases ringSize by virtualNodes count per node', () => {
    ch.addNode('a')
    expect(ch.ringSize).toBe(20)
    ch.addNode('b')
    expect(ch.ringSize).toBe(40)
  })

  it('works with number nodes', () => {
    const numCh = new ConsistentHash<number>({ virtualNodes: 5 })
    numCh.addNode(1)
    numCh.addNode(42)
    expect(numCh.nodeCount).toBe(2)
    expect(numCh.ringSize).toBe(10)
    expect(numCh.getNode('key')).toBeDefined()
  })
})

// ─── removeNode ───────────────────────────────────────
describe('removeNode', () => {
  let ch: ConsistentHash<string>

  beforeEach(() => {
    ch = new ConsistentHash<string>({ virtualNodes: 20 })
  })

  it('decrements nodeCount', () => {
    ch.addNode('a')
    ch.addNode('b')
    expect(ch.nodeCount).toBe(2)
    ch.removeNode('a')
    expect(ch.nodeCount).toBe(1)
  })

  it('reduces ringSize', () => {
    ch.addNode('a')
    ch.addNode('b')
    expect(ch.ringSize).toBe(40)
    ch.removeNode('a')
    expect(ch.ringSize).toBe(20)
  })

  it('decrements nodeCount even if node was never added', () => {
    expect(ch.nodeCount).toBe(0)
    ch.removeNode('nonexistent')
    expect(ch.nodeCount).toBe(-1)
  })

  it('allows re-adding a node after removal', () => {
    ch.addNode('a')
    ch.removeNode('a')
    expect(ch.nodeCount).toBe(0)
    expect(ch.ringSize).toBe(0)
    ch.addNode('a')
    expect(ch.nodeCount).toBe(1)
    expect(ch.ringSize).toBe(20)
  })
})

// ─── getNode ──────────────────────────────────────────
describe('getNode', () => {
  let ch: ConsistentHash<string>

  beforeEach(() => {
    ch = new ConsistentHash<string>({ virtualNodes: 50 })
  })

  it('returns undefined on empty ring', () => {
    expect(ch.getNode('any-key')).toBeUndefined()
  })

  it('returns a valid node for any key', () => {
    ch.addNode('a')
    ch.addNode('b')
    const node = ch.getNode('some-key')
    expect(node === 'a' || node === 'b').toBe(true)
  })

  it('is deterministic (same key always maps to same node)', () => {
    ch.addNode('a')
    ch.addNode('b')
    ch.addNode('c')
    for (let i = 0; i < 20; i++) {
      expect(ch.getNode(`key-${i}`)).toBe(ch.getNode(`key-${i}`))
    }
  })

  it('returns different nodes for different keys (usually)', () => {
    ch.addNode('a')
    ch.addNode('b')
    ch.addNode('c')
    const results = new Set<string>()
    for (let i = 0; i < 100; i++) {
      const node = ch.getNode(`key-${i}`)
      if (node !== undefined) results.add(node)
    }
    expect(results.size).toBeGreaterThan(1)
  })
})

// ─── Distribution ─────────────────────────────────────
describe('distribution', () => {
  it('spreads keys roughly across all nodes', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 150 })
    ch.addNode('node-a')
    ch.addNode('node-b')
    ch.addNode('node-c')

    const counts: Record<string, number> = { 'node-a': 0, 'node-b': 0, 'node-c': 0 }
    for (let i = 0; i < 300; i++) {
      const node = ch.getNode(`key-${i}`)
      if (node !== undefined) counts[node]++
    }

    expect(counts['node-a']).toBeGreaterThan(0)
    expect(counts['node-b']).toBeGreaterThan(0)
    expect(counts['node-c']).toBeGreaterThan(0)
  })
})

// ─── Minimal Remapping ────────────────────────────────
describe('minimal remapping on node removal', () => {
  it('remaps only a minority of keys when a node is removed', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 150 })
    ch.addNode('node-a')
    ch.addNode('node-b')
    ch.addNode('node-c')

    const keys = Array.from({ length: 500 }, (_, i) => `key-${i}`)
    const before = keys.map((k) => ch.getNode(k))

    ch.removeNode('node-b')

    const after = keys.map((k) => ch.getNode(k))

    let unchanged = 0
    for (let i = 0; i < keys.length; i++) {
      if (before[i] === after[i]) unchanged++
    }

    expect(unchanged).toBeGreaterThan(keys.length * 0.5)
  })
})

// ─── Edge Cases ───────────────────────────────────────
describe('edge cases', () => {
  it('single node receives all keys', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 50 })
    ch.addNode('only')
    for (let i = 0; i < 50; i++) {
      expect(ch.getNode(`key-${i}`)).toBe('only')
    }
  })

  it('returns undefined after all nodes removed', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 5 })
    ch.addNode('a')
    ch.removeNode('a')
    expect(ch.getNode('any')).toBeUndefined()
    expect(ch.ringSize).toBe(0)
  })
})
