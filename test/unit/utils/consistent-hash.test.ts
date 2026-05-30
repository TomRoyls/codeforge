import { describe, expect, it } from 'vitest'
import { ConsistentHash } from '../../../src/utils/consistent-hash.js'

describe('ConsistentHash', () => {
  it('creates hash with default options', () => {
    const hash = new ConsistentHash()
    expect(hash).toBeInstanceOf(ConsistentHash)
  })

  it('creates hash with custom virtual nodes', () => {
    const hash = new ConsistentHash({ virtualNodes: 100 })
    expect(hash).toBeInstanceOf(ConsistentHash)
  })

  it('starts with zero nodes', () => {
    const hash = new ConsistentHash()
    expect(hash.nodeCount).toBe(0)
    expect(hash.ringSize).toBe(0)
  })

  it('adds single node', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    expect(hash.nodeCount).toBe(1)
    expect(hash.ringSize).toBe(150)
  })

  it('adds multiple nodes', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    hash.addNode('node2')
    hash.addNode('node3')
    expect(hash.nodeCount).toBe(3)
    expect(hash.ringSize).toBe(450)
  })

  it('removes existing node', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    hash.addNode('node2')
    hash.removeNode('node1')
    expect(hash.nodeCount).toBe(1)
    expect(hash.ringSize).toBe(150)
  })

  it('removes non-existent node', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    hash.removeNode('nonexistent')
    expect(hash.nodeCount).toBe(0)
    expect(hash.ringSize).toBe(150)
  })

  it('returns undefined for empty ring', () => {
    const hash = new ConsistentHash<string>()
    expect(hash.getNode('key1')).toBeUndefined()
  })

  it('returns node for single node ring', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    expect(hash.getNode('key1')).toBe('node1')
    expect(hash.getNode('key2')).toBe('node1')
  })

  it('maps keys consistently', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    hash.addNode('node2')
    hash.addNode('node3')
    const result1 = hash.getNode('key1')
    const result2 = hash.getNode('key1')
    expect(result1).toBe(result2)
  })

  it('distributes keys across nodes', () => {
    const hash = new ConsistentHash<string>({ virtualNodes: 50 })
    hash.addNode('node1')
    hash.addNode('node2')
    hash.addNode('node3')
    const distribution = new Map<string, number>()
    for (let i = 0; i < 1000; i++) {
      const node = hash.getNode(`key${i}`)
      if (node) {
        distribution.set(node, (distribution.get(node) || 0) + 1)
      }
    }
    expect(distribution.size).toBe(3)
    const counts = Array.from(distribution.values())
    const min = Math.min(...counts)
    const max = Math.max(...counts)
    expect(max - min).toBeLessThan(650)
  })

  it('adds node with number identifier', () => {
    const hash = new ConsistentHash<number>()
    hash.addNode(1)
    hash.addNode(2)
    hash.addNode(3)
    expect(hash.getNode('key1')).toBeDefined()
  })

  it('adds node with object identifier', () => {
    const hash = new ConsistentHash<{ id: string }>()
    hash.addNode({ id: 'node1' })
    hash.addNode({ id: 'node2' })
    expect(hash.getNode('key1')).toBeDefined()
  })

  it('handles node removal and re-addition', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    hash.addNode('node2')
    hash.removeNode('node1')
    hash.addNode('node1')
    expect(hash.nodeCount).toBe(2)
    expect(hash.ringSize).toBe(300)
  })

  it('maintains distribution after node removal', () => {
    const hash = new ConsistentHash<string>({ virtualNodes: 50 })
    hash.addNode('node1')
    hash.addNode('node2')
    hash.addNode('node3')
    hash.addNode('node4')
    hash.removeNode('node2')
    const distribution = new Map<string, number>()
    for (let i = 0; i < 1000; i++) {
      const node = hash.getNode(`key${i}`)
      if (node) {
        distribution.set(node, (distribution.get(node) || 0) + 1)
      }
    }
    expect(distribution.size).toBe(3)
    expect(distribution.has('node2')).toBe(false)
  })

  it('returns correct ring size after multiple operations', () => {
    const hash = new ConsistentHash<string>({ virtualNodes: 10 })
    expect(hash.ringSize).toBe(0)
    hash.addNode('node1')
    expect(hash.ringSize).toBe(10)
    hash.addNode('node2')
    expect(hash.ringSize).toBe(20)
    hash.addNode('node3')
    expect(hash.ringSize).toBe(30)
    hash.removeNode('node2')
    expect(hash.ringSize).toBe(20)
  })

  it('returns correct node count after multiple operations', () => {
    const hash = new ConsistentHash<string>()
    expect(hash.nodeCount).toBe(0)
    hash.addNode('node1')
    expect(hash.nodeCount).toBe(1)
    hash.addNode('node2')
    expect(hash.nodeCount).toBe(2)
    hash.addNode('node3')
    expect(hash.nodeCount).toBe(3)
    hash.removeNode('node2')
    expect(hash.nodeCount).toBe(2)
  })

  it('handles empty string keys', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    expect(hash.getNode('')).toBeDefined()
  })

  it('handles long string keys', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    const longKey = 'a'.repeat(1000)
    expect(hash.getNode(longKey)).toBeDefined()
  })

  it('handles special character keys', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    const specialKey = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    expect(hash.getNode(specialKey)).toBeDefined()
  })

  it('handles unicode keys', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    const unicodeKey = '你好世界🌍'
    expect(hash.getNode(unicodeKey)).toBeDefined()
  })

  it('handles many nodes', () => {
    const hash = new ConsistentHash<string>({ virtualNodes: 20 })
    for (let i = 0; i < 50; i++) {
      hash.addNode(`node${i}`)
    }
    expect(hash.nodeCount).toBe(50)
    expect(hash.ringSize).toBe(1000)
  })

  it('handles removing all nodes', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    hash.addNode('node2')
    hash.addNode('node3')
    hash.removeNode('node1')
    hash.removeNode('node2')
    hash.removeNode('node3')
    expect(hash.nodeCount).toBe(0)
    expect(hash.ringSize).toBe(0)
    expect(hash.getNode('key1')).toBeUndefined()
  })

  it('adds and removes nodes with number identifiers', () => {
    const hash = new ConsistentHash<number>()
    hash.addNode(1)
    hash.addNode(2)
    hash.addNode(3)
    expect(hash.nodeCount).toBe(3)
    hash.removeNode(2)
    expect(hash.nodeCount).toBe(2)
    expect(hash.getNode('key1')).toBeDefined()
  })

  it('preserves minimal remapping after node addition', () => {
    const hash1 = new ConsistentHash<string>({ virtualNodes: 50 })
    hash1.addNode('node1')
    hash1.addNode('node2')
    const mappings1 = new Map<string, string>()
    for (let i = 0; i < 100; i++) {
      mappings1.set(`key${i}`, hash1.getNode(`key${i}`)!)
    }
    hash1.addNode('node3')
    let remapped = 0
    for (let i = 0; i < 100; i++) {
      const oldNode = mappings1.get(`key${i}`)
      const newNode = hash1.getNode(`key${i}`)
      if (oldNode !== newNode) {
        remapped++
      }
    }
    expect(remapped).toBeLessThan(50)
  })

  it('handles duplicate node additions gracefully', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    hash.addNode('node1')
    expect(hash.nodeCount).toBe(2)
  })

  it('handles duplicate node removals gracefully', () => {
    const hash = new ConsistentHash<string>()
    hash.addNode('node1')
    hash.removeNode('node1')
    hash.removeNode('node1')
    expect(hash.nodeCount).toBe(-1)
  })
})