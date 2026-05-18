import { describe, it, expect } from 'vitest'
import { RingHash2 } from '../../src/core/ring-hash-2/index.js'

// ─── Constructor ───

describe('RingHash2', () => {
  describe('constructor', () => {
    it('creates a ring with default 100 virtual nodes', () => {
      const ring = new RingHash2()
      expect(ring.size()).toBe(0)
      expect(ring.nodes()).toEqual([])
    })

    it('creates a ring with custom virtual node count', () => {
      const ring = new RingHash2(50)
      ring.addNode('A')
      expect(ring.size()).toBe(50)
    })

    it('creates a ring with single virtual node', () => {
      const ring = new RingHash2(1)
      ring.addNode('A')
      expect(ring.size()).toBe(1)
    })
  })

  // ─── addNode ───

  describe('addNode', () => {
    it('adds a single node', () => {
      const ring = new RingHash2(10)
      ring.addNode('server-1')
      expect(ring.nodes()).toContain('server-1')
      expect(ring.size()).toBe(10)
    })

    it('adds multiple nodes', () => {
      const ring = new RingHash2(10)
      ring.addNode('A')
      ring.addNode('B')
      ring.addNode('C')
      expect(ring.nodes()).toHaveLength(3)
      expect(ring.size()).toBe(30)
    })

    it('ignores duplicate node', () => {
      const ring = new RingHash2(10)
      ring.addNode('A')
      ring.addNode('A')
      expect(ring.nodes()).toHaveLength(1)
      expect(ring.size()).toBe(10)
    })
  })

  // ─── removeNode ───

  describe('removeNode', () => {
    it('removes an existing node', () => {
      const ring = new RingHash2(10)
      ring.addNode('A')
      ring.addNode('B')
      ring.removeNode('A')
      expect(ring.nodes()).not.toContain('A')
      expect(ring.nodes()).toContain('B')
      expect(ring.size()).toBe(10)
    })

    it('no-op when removing non-existent node', () => {
      const ring = new RingHash2(10)
      ring.addNode('A')
      ring.removeNode('ghost')
      expect(ring.nodes()).toHaveLength(1)
      expect(ring.size()).toBe(10)
    })

    it('removes all nodes leaving empty ring', () => {
      const ring = new RingHash2(5)
      ring.addNode('A')
      ring.addNode('B')
      ring.removeNode('A')
      ring.removeNode('B')
      expect(ring.nodes()).toEqual([])
      expect(ring.size()).toBe(0)
    })
  })

  // ─── getNode ───

  describe('getNode', () => {
    it('returns undefined for empty ring', () => {
      const ring = new RingHash2()
      expect(ring.getNode('key1')).toBeUndefined()
    })

    it('returns the only node for any key', () => {
      const ring = new RingHash2(10)
      ring.addNode('only')
      expect(ring.getNode('key1')).toBe('only')
      expect(ring.getNode('key2')).toBe('only')
    })

    it('distributes keys across nodes', () => {
      const ring = new RingHash2(200)
      ring.addNode('A')
      ring.addNode('B')
      ring.addNode('C')
      const assigned = new Set<string>()
      for (let i = 0; i < 10000; i++) {
        assigned.add(ring.getNode(`user_${i}_session_${i * 7}`)!)
      }
      expect(assigned.size).toBeGreaterThanOrEqual(2)
    })

    it('returns consistent mapping for same key', () => {
      const ring = new RingHash2(100)
      ring.addNode('A')
      ring.addNode('B')
      const first = ring.getNode('my-key')
      const second = ring.getNode('my-key')
      expect(first).toBe(second)
    })

    it('reassigns keys after node removal', () => {
      const ring = new RingHash2(100)
      ring.addNode('A')
      ring.addNode('B')
      const before = ring.getNode('test-key')
      ring.removeNode(before!)
      const after = ring.getNode('test-key')
      expect(after).toBeDefined()
      expect(after).not.toBe(before)
    })
  })

  // ─── nodes ───

  describe('nodes', () => {
    it('returns empty array for empty ring', () => {
      const ring = new RingHash2()
      expect(ring.nodes()).toEqual([])
    })

    it('returns all added nodes', () => {
      const ring = new RingHash2()
      ring.addNode('X')
      ring.addNode('Y')
      const ns = ring.nodes()
      expect(ns).toContain('X')
      expect(ns).toContain('Y')
    })
  })

  // ─── size ───

  describe('size', () => {
    it('returns total virtual node count', () => {
      const ring = new RingHash2(20)
      ring.addNode('A')
      ring.addNode('B')
      expect(ring.size()).toBe(40)
    })

    it('returns 0 after clear', () => {
      const ring = new RingHash2(20)
      ring.addNode('A')
      ring.clear()
      expect(ring.size()).toBe(0)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('clears all nodes', () => {
      const ring = new RingHash2(10)
      ring.addNode('A')
      ring.addNode('B')
      ring.clear()
      expect(ring.size()).toBe(0)
      expect(ring.nodes()).toEqual([])
      expect(ring.getNode('key')).toBeUndefined()
    })

    it('ring is reusable after clear', () => {
      const ring = new RingHash2(10)
      ring.addNode('A')
      ring.clear()
      ring.addNode('B')
      expect(ring.size()).toBe(10)
      expect(ring.getNode('key')).toBe('B')
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles many nodes', () => {
      const ring = new RingHash2(10)
      for (let i = 0; i < 100; i++) {
        ring.addNode(`node-${i}`)
      }
      expect(ring.nodes()).toHaveLength(100)
      expect(ring.size()).toBe(1000)
      const node = ring.getNode('some-key')
      expect(node).toBeDefined()
    })

    it('handles single virtual node', () => {
      const ring = new RingHash2(1)
      ring.addNode('A')
      ring.addNode('B')
      expect(ring.size()).toBe(2)
      expect(ring.getNode('key')).toBeDefined()
    })

    it('getNode wraps around to first node', () => {
      const ring = new RingHash2(1)
      ring.addNode('first')
      const node = ring.getNode('\xff\xff\xff\xff')
      expect(node).toBe('first')
    })

    it('add and remove cycles', () => {
      const ring = new RingHash2(5)
      for (let cycle = 0; cycle < 10; cycle++) {
        ring.addNode(`node-${cycle}`)
      }
      for (let cycle = 0; cycle < 10; cycle++) {
        ring.removeNode(`node-${cycle}`)
      }
      expect(ring.size()).toBe(0)
      expect(ring.nodes()).toEqual([])
    })
  })
})
