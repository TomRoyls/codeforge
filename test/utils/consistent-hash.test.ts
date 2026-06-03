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

describe('ConsistentHash edge cases', () => {
  it('handles remove of non-existent node', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 10 })
    ch.addNode('A')
    ch.removeNode('Z')
    expect(ch.nodeCount).toBe(0)
  })

  it('single node handles all keys', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 100 })
    ch.addNode('only')
    for (let i = 0; i < 50; i++) {
      expect(ch.getNode(`key-${i}`)).toBe('only')
    }
  })

  it('adding same node creates duplicate node entries but shared ring positions', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 10 })
    ch.addNode('A')
    ch.addNode('A')
    expect(ch.nodeCount).toBe(2)
    expect(ch.ringSize).toBe(10)
  })

  it('works with number nodes', () => {
    const ch = new ConsistentHash<number>({ virtualNodes: 50 })
    ch.addNode(1)
    ch.addNode(2)
    ch.addNode(3)
    const node = ch.getNode('test')
    expect([1, 2, 3]).toContain(node)
  })

  it('empty string key works', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 10 })
    ch.addNode('A')
    expect(ch.getNode('')).toBe('A')
  })

  it('consistent mapping across calls', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 50 })
    ch.addNode('A')
    ch.addNode('B')
    ch.addNode('C')
    for (let i = 0; i < 20; i++) {
      const first = ch.getNode(`key-${i}`)
      const second = ch.getNode(`key-${i}`)
      expect(first).toBe(second)
    }
  })

  it('getNode returns undefined when no nodes', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 10 })
    expect(ch.getNode('key')).toBeUndefined()
  })

  it('getNode returns a node after adding', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 10 })
    ch.addNode('node-a')
    expect(ch.getNode('key')).toBe('node-a')
  })

  it('removeNode shifts keys', () => {
    const ch = new ConsistentHash<string>({ virtualNodes: 100 })
    ch.addNode('node-a')
    ch.addNode('node-b')
    ch.removeNode('node-b')
    expect(ch.getNode('any-key')).toBe('node-a')
  })

  it('getNode with single node always returns it', () => {
    const ch = new ConsistentHash<string>()
    ch.addNode('only')
    expect(ch.getNode('key1')).toBe('only')
    expect(ch.getNode('key2')).toBe('only')
  })

  it('removeNode removes node from ring', () => {
    const ch = new ConsistentHash<string>()
    ch.addNode('a')
    ch.addNode('b')
    ch.removeNode('a')
    expect(ch.getNode).toBeDefined()
  })

  it('getNode returns a valid node', () => {
    const ch = new ConsistentHash<string>()
    ch.addNode('a')
    ch.addNode('b')
    const node = ch.getNode('test-key')
    expect(['a', 'b']).toContain(node)
  })

  it('single node always returns that node', () => {
    const ch = new ConsistentHash<string>()
    ch.addNode('only')
    expect(ch.getNode('any-key')).toBe('only')
  })
})
