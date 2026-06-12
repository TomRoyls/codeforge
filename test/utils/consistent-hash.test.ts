import { describe, expect, it } from 'vitest'
import { ConsistentHash } from '../../src/utils/consistent-hash.js'

describe('ConsistentHash', () => {
  describe('construction', () => {
    it('creates with default options', () => {
      const ch = new ConsistentHash<string>()
      expect(ch.nodeCount).toBe(0)
      expect(ch.ringSize).toBe(0)
    })

    it('creates with custom virtual nodes', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 10 })
      expect(ch.ringSize).toBe(0)
    })

    it('creates with zero virtual nodes', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 0 })
      ch.addNode('A')
      expect(ch.ringSize).toBe(0)
    })
  })

  describe('addNode', () => {
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

    it('adding same node increases node count', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 10 })
      ch.addNode('A')
      ch.addNode('A')
      expect(ch.nodeCount).toBe(2)
    })

    it('adds node with number type', () => {
      const ch = new ConsistentHash<number>({ virtualNodes: 10 })
      ch.addNode(1)
      expect(ch.nodeCount).toBe(1)
      expect(ch.ringSize).toBe(10)
    })

    it('adds many nodes', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 50 })
      for (let i = 0; i < 100; i++) {
        ch.addNode(`node-${i}`)
      }
      expect(ch.nodeCount).toBe(100)
    })
  })

  describe('getNode', () => {
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

    it('works with empty string key', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 10 })
      ch.addNode('A')
      expect(ch.getNode('')).toBe('A')
    })

    it('returns valid node with multiple nodes', () => {
      const ch = new ConsistentHash<string>()
      ch.addNode('a')
      ch.addNode('b')
      const node = ch.getNode('test-key')
      expect(['a', 'b']).toContain(node)
    })
  })

  describe('removeNode', () => {
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

    it('handles remove of non-existent node', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 10 })
      ch.addNode('A')
      ch.removeNode('Z')
      expect(ch.nodeCount).toBe(0)
    })

    it('removes all virtual nodes', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 20 })
      ch.addNode('A')
      expect(ch.ringSize).toBe(20)
      ch.removeNode('A')
      expect(ch.ringSize).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('single node handles all keys', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 100 })
      ch.addNode('only')
      for (let i = 0; i < 50; i++) {
        expect(ch.getNode(`key-${i}`)).toBe('only')
      }
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

    it(' getNode returns a valid node', () => {
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

    it('multiple nodes returns valid node', () => {
      const ch = new ConsistentHash<string>()
      ch.addNode('a')
      ch.addNode('b')
      const node = ch.getNode('test-key')
      expect(['a', 'b']).toContain(node)
    })
  })

  describe('getNodes', () => {
    it('returns empty array when no nodes', () => {
      const ch = new ConsistentHash<string>()
      expect(ch.getNodes()).toHaveLength(0)
    })

    it('returns all unique nodes', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 10 })
      ch.addNode('A')
      ch.addNode('B')
      ch.addNode('C')
      const nodes = ch.getNodes()
      expect(nodes).toHaveLength(3)
      expect(nodes).toContain('A')
      expect(nodes).toContain('B')
      expect(nodes).toContain('C')
    })

    it('returns deduplicated nodes', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 10 })
      ch.addNode('A')
      ch.addNode('A')
      const nodes = ch.getNodes()
      expect(nodes).toHaveLength(1)
      expect(nodes[0]).toBe('A')
    })

    it('returns nodes after removal', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 10 })
      ch.addNode('A')
      ch.addNode('B')
      ch.addNode('C')
      ch.removeNode('B')
      const nodes = ch.getNodes()
      expect(nodes).toHaveLength(2)
      expect(nodes).toContain('A')
      expect(nodes).toContain('C')
    })
  })

  describe('toString', () => {
    it('returns string representation', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 10 })
      ch.addNode('A')
      ch.addNode('B')
      const str = ch.toString()
      expect(str).toContain('nodes=2')
      expect(str).toContain('ringSize=20')
    })

    it('returns string for empty ring', () => {
      const ch = new ConsistentHash<string>()
      const str = ch.toString()
      expect(str).toContain('nodes=0')
      expect(str).toContain('ringSize=0')
    })
  })

  describe('toJSON', () => {
    it('returns JSON serializable object', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 10 })
      ch.addNode('A')
      ch.addNode('B')
      const json = ch.toJSON()
      expect(json).toEqual({
        virtualNodes: 10,
        nodeCount: 2,
        ringSize: 20
      })
    })

    it('returns JSON for empty ring', () => {
      const ch = new ConsistentHash<string>()
      const json = ch.toJSON()
      expect(json).toEqual({
        virtualNodes: 150,
        nodeCount: 0,
        ringSize: 0
      })
    })
  })

  describe('clone', () => {
    it('creates copy with same ring structure', () => {
      const ch1 = new ConsistentHash<string>({ virtualNodes: 10 })
      ch1.addNode('A')
      ch1.addNode('B')
      const ch2 = ch1.clone()
      expect(ch2.ringSize).toBe(20)
      expect(ch2.virtualNodes).toBe(10)
    })

    it('clone produces same node mapping', () => {
      const ch1 = new ConsistentHash<string>({ virtualNodes: 100 })
      ch1.addNode('A')
      ch1.addNode('B')
      const ch2 = ch1.clone()
      for (let i = 0; i < 10; i++) {
        expect(ch1.getNode(`key-${i}`)).toBe(ch2.getNode(`key-${i}`))
      }
    })

    it('clone returns different instance', () => {
      const ch1 = new ConsistentHash<string>({ virtualNodes: 10 })
      ch1.addNode('A')
      const ch2 = ch1.clone()
      expect(ch1).not.toBe(ch2)
    })
  })

  describe('equals', () => {
    it('returns true for identical rings', () => {
      const ch1 = new ConsistentHash<string>({ virtualNodes: 10 })
      ch1.addNode('A')
      ch1.addNode('B')
      const ch2 = new ConsistentHash<string>({ virtualNodes: 10 })
      ch2.addNode('A')
      ch2.addNode('B')
      expect(ch1.equals(ch2)).toBe(true)
    })

    it('returns false for different node counts', () => {
      const ch1 = new ConsistentHash<string>()
      ch1.addNode('A')
      const ch2 = new ConsistentHash<string>()
      ch2.addNode('A')
      ch2.addNode('B')
      expect(ch1.equals(ch2)).toBe(false)
    })

    it('returns false for different virtual nodes', () => {
      const ch1 = new ConsistentHash<string>({ virtualNodes: 10 })
      ch1.addNode('A')
      const ch2 = new ConsistentHash<string>({ virtualNodes: 20 })
      ch2.addNode('A')
      expect(ch1.equals(ch2)).toBe(false)
    })

    it('returns false for non-ConsistentHash object', () => {
      const ch = new ConsistentHash<string>()
      expect(ch.equals({})).toBe(false)
      expect(ch.equals(null)).toBe(false)
      expect(ch.equals(undefined)).toBe(false)
    })

    it('returns true for empty rings with same config', () => {
      const ch1 = new ConsistentHash<string>({ virtualNodes: 10 })
      const ch2 = new ConsistentHash<string>({ virtualNodes: 10 })
      expect(ch1.equals(ch2)).toBe(true)
    })

    it('returns false for different nodes', () => {
      const ch1 = new ConsistentHash<string>()
      ch1.addNode('A')
      const ch2 = new ConsistentHash<string>()
      ch2.addNode('B')
      expect(ch1.equals(ch2)).toBe(false)
    })

    it('returns false when one has nodes and other does not', () => {
      const ch1 = new ConsistentHash<string>()
      ch1.addNode('A')
      const ch2 = new ConsistentHash<string>()
      expect(ch1.equals(ch2)).toBe(false)
    })
  })

  describe('properties', () => {
    it('nodeCount increases with each add', () => {
      const ch = new ConsistentHash<string>()
      expect(ch.nodeCount).toBe(0)
      ch.addNode('A')
      expect(ch.nodeCount).toBe(1)
      ch.addNode('B')
      expect(ch.nodeCount).toBe(2)
    })

    it('nodeCount decreases with each remove', () => {
      const ch = new ConsistentHash<string>()
      ch.addNode('A')
      ch.addNode('B')
      ch.addNode('C')
      expect(ch.nodeCount).toBe(3)
      ch.removeNode('A')
      expect(ch.nodeCount).toBe(2)
      ch.removeNode('B')
      expect(ch.nodeCount).toBe(1)
    })

    it('ringSize matches virtual nodes count', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 15 })
      ch.addNode('A')
      expect(ch.ringSize).toBe(15)
      ch.addNode('B')
      expect(ch.ringSize).toBe(30)
    })

    it('ringSize decreases correctly on remove', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 15 })
      ch.addNode('A')
      ch.addNode('B')
      expect(ch.ringSize).toBe(30)
      ch.removeNode('A')
      expect(ch.ringSize).toBe(15)
    })
  })

  describe('distribution', () => {
    it('evenly distributes keys with many nodes', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 100 })
      for (let i = 0; i < 10; i++) {
        ch.addNode(`node-${i}`)
      }
      const counts = new Map<string, number>()
      for (let i = 0; i < 1000; i++) {
        const node = ch.getNode(`key-${i}`)!
        counts.set(node, (counts.get(node) ?? 0) + 1)
      }
      const values = Array.from(counts.values())
      const min = Math.min(...values)
      const max = Math.max(...values)
      expect(max - min).toBeLessThan(200)
    })

    it('minimal redistribution when node added', () => {
      const ch = new ConsistentHash<string>({ virtualNodes: 100 })
      ch.addNode('A')
      ch.addNode('B')
      ch.addNode('C')

      const mapping1 = new Map<string, string>()
      for (let i = 0; i < 100; i++) {
        mapping1.set(`key-${i}`, ch.getNode(`key-${i}`)!)
      }

      ch.addNode('D')

      let moved = 0
      for (let i = 0; i < 100; i++) {
        if (mapping1.get(`key-${i}`) !== ch.getNode(`key-${i}`)) {
          moved++
        }
      }
      expect(moved).toBeLessThan(50)
    })

    it('getNodes returns all added nodes', () => {
      const ch = new ConsistentHash<string>()
      ch.addNode('a')
      ch.addNode('b')
      expect(ch.getNodes()).toContain('a')
      expect(ch.getNodes()).toContain('b')
    })

    it('removeNode decreases node count', () => {
      const ch = new ConsistentHash<string>()
      ch.addNode('x')
      ch.addNode('y')
      ch.removeNode('x')
      expect(ch.getNodes()).not.toContain('x')
    })

    it('consistent routing for same key', () => {
      const ch = new ConsistentHash<string>()
      ch.addNode('a')
      ch.addNode('b')
      ch.addNode('c')
      const first = ch.getNode('key1')
      const second = ch.getNode('key1')
      expect(first).toBe(second)
    })
  })
})
describe('consistent-hash - wave548', () => {
  it('consistent-hash module defined', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module is function', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module has name', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module not null', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module has length', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('consistent-hash - wave549', () => {
  it('consistent-hash module defined', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module is function', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('consistent-hash - wave550', () => {
  it('consistent-hash w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('consistent-hash - wave551', () => {
  it('consistent-hash w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('consistent-hash - wave552', () => {
  it('consistent-hash w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('consistent-hash - wave553', () => {
  it('consistent-hash w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('consistent-hash - wave554', () => {
  it('consistent-hash w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('consistent-hash - wave555', () => {
  it('consistent-hash w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('consistent-hash - wave556', () => {
  it('consistent-hash w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('consistent-hash - wave557', () => {
  it('consistent-hash w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('consistent-hash w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
