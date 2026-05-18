import { describe, expect, it } from 'vitest'
import { ConsistentHash } from '../../src/utils/consistent-hash.js'

// ─── Construction ───

describe('ConsistentHash construction', () => {
  it('creates with default options', () => {
    const ch = new ConsistentHash<string>()
    expect(ch.nodeCount).toBe(0)
    expect(ch.ringSize).toBe(0)
  })

  it('creates with custom virtual nodes', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 10 })
    expect(ch.ringSize).toBe(0)
  })
})

// ─── Add Node ───

describe('ConsistentHash addNode', () => {
  it('adds a node', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 10 })
    ch.addNode('node-A')
    expect(ch.nodeCount).toBe(1)
    expect(ch.ringSize).toBe(10)
  })

  it('adds multiple nodes', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 10 })
    ch.addNode('A')
    ch.addNode('B')
    ch.addNode('C')
    expect(ch.nodeCount).toBe(3)
    expect(ch.ringSize).toBe(30)
  })
})

// ─── Get Node ───

describe('ConsistentHash getNode', () => {
  it('returns undefined for empty ring', () => {
    const ch = new ConsistentHash<string>()
    expect(ch.getNode('any-key')).toBeUndefined()
  })

  it('returns a node for a key', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 100 })
    ch.addNode('A')
    ch.addNode('B')
    ch.addNode('C')
    const node = ch.getNode('my-key')
    expect(node).toBeDefined()
    expect(['A', 'B', 'C']).toContain(node)
  })

  it('consistently maps same key to same node', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 100 })
    ch.addNode('A')
    ch.addNode('B')
    const node1 = ch.getNode('test-key')
    const node2 = ch.getNode('test-key')
    expect(node1).toBe(node2)
  })

  it('distributes keys across nodes', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 150 })
    ch.addNode('A')
    ch.addNode('B')
    ch.addNode('C')
    const counts = new Map<string, number>()
    for (let i = 0; i < 100; i++) {
      const node = ch.getNode(`key-${i}`)!
      counts.set(node, (counts.get(node) ?? 0) + 1)
    }
    expect(counts.size).toBeGreaterThanOrEqual(2)
  })
})

// ─── Remove Node ───

describe('ConsistentHash removeNode', () => {
  it('removes a node', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 10 })
    ch.addNode('A')
    ch.addNode('B')
    ch.removeNode('A')
    expect(ch.nodeCount).toBe(1)
    expect(ch.ringSize).toBe(10)
  })

  it('keys remap after removal', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 100 })
    ch.addNode('A')
    ch.addNode('B')
    ch.addNode('C')
    ch.removeNode('B')
    const node = ch.getNode('some-key')
    expect(['A', 'C']).toContain(node)
  })

  it('all keys map to remaining node', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 50 })
    ch.addNode('A')
    ch.addNode('B')
    ch.removeNode('A')
    for (let i = 0; i < 10; i++) {
      expect(ch.getNode(`key-${i}`)).toBe('B')
    }
  })
})
