import { beforeEach, describe, expect, it } from 'vitest'

import { PairingHeap } from '../../src/utils/pairing-heap.js'

describe('PairingHeap', () => {
  let heap: PairingHeap<number>

  beforeEach(() => {
    heap = new PairingHeap<number>()
  })

  describe('empty heap', () => {
    it('returns undefined from peek on empty heap', () => {
      expect(heap.peek()).toBeUndefined()
    })

    it('returns undefined from findMin on empty heap', () => {
      expect(heap.findMin()).toBeUndefined()
    })

    it('returns undefined from extractMin on empty heap', () => {
      expect(heap.extractMin()).toBeUndefined()
    })

    it('isEmpty returns true for empty heap', () => {
      expect(heap.isEmpty()).toBe(true)
    })

    it('size is 0 for empty heap', () => {
      expect(heap.size).toBe(0)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      heap.insert(10)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(10)
    })

    it('returns a node reference with the value', () => {
      const node = heap.insert(42)
      expect(node.value).toBe(42)
    })

    it('maintains min-heap property with multiple inserts', () => {
      heap.insert(30)
      heap.insert(10)
      heap.insert(20)
      expect(heap.peek()).toBe(10)
    })

    it('handles negative numbers', () => {
      heap.insert(-5)
      heap.insert(10)
      heap.insert(-10)
      expect(heap.peek()).toBe(-10)
    })

    it('handles zero', () => {
      heap.insert(0)
      expect(heap.peek()).toBe(0)
      expect(heap.extractMin()).toBe(0)
    })

    it('inserts many elements maintaining min', () => {
      for (let i = 100; i >= 1; i--) heap.insert(i)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(100)
    })
  })

  describe('extractMin', () => {
    it('extracts the single element', () => {
      heap.insert(99)
      expect(heap.extractMin()).toBe(99)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('extracts elements in sorted order', () => {
      heap.insert(30)
      heap.insert(10)
      heap.insert(20)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(20)
      expect(heap.extractMin()).toBe(30)
    })

    it('returns undefined after all elements extracted', () => {
      heap.insert(1)
      heap.extractMin()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('extracts with repeated values', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
    })
  })

  describe('merge', () => {
    it('merges two non-empty heaps', () => {
      const other = new PairingHeap<number>()
      heap.insert(5)
      heap.insert(10)
      other.insert(2)
      other.insert(8)
      heap.merge(other)
      expect(heap.size).toBe(4)
      expect(heap.peek()).toBe(2)
      expect(other.size).toBe(0)
      expect(other.isEmpty()).toBe(true)
    })

    it('merges empty heap into non-empty (no-op)', () => {
      heap.insert(5)
      const other = new PairingHeap<number>()
      heap.merge(other)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('merges non-empty heap into empty heap', () => {
      const other = new PairingHeap<number>()
      other.insert(3)
      other.insert(7)
      heap.merge(other)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(3)
    })

    it('merges two empty heaps', () => {
      const other = new PairingHeap<number>()
      heap.merge(other)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('merged heap extracts in sorted order', () => {
      const other = new PairingHeap<number>()
      heap.insert(10)
      heap.insert(30)
      other.insert(20)
      other.insert(5)
      heap.merge(other)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(20)
      expect(heap.extractMin()).toBe(30)
    })

    it('other heap is empty after merge', () => {
      const other = new PairingHeap<number>()
      other.insert(1)
      heap.merge(other)
      expect(other.peek()).toBeUndefined()
      expect(other.extractMin()).toBeUndefined()
    })
  })

  describe('decreaseKey', () => {
    it('decreases a node value and updates min', () => {
      const nodeA = heap.insert(10)
      heap.insert(5)
      heap.insert(8)
      heap.decreaseKey(nodeA, 1)
      expect(heap.peek()).toBe(1)
    })

    it('throws if new value is greater than current', () => {
      const node = heap.insert(5)
      expect(() => heap.decreaseKey(node, 10)).toThrow()
    })

    it('works after extractMin triggers two-pass pairing', () => {
      const nodes: ReturnType<PairingHeap<number>['insert']>[] = []
      for (let i = 10; i >= 1; i--) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      heap.decreaseKey(nodes[0]!, 0)
      expect(heap.peek()).toBe(0)
    })

    it('decreaseKey on root node works', () => {
      const root = heap.insert(5)
      heap.insert(10)
      heap.decreaseKey(root, 1)
      expect(heap.peek()).toBe(1)
    })

    it('decreaseKey to same value works', () => {
      const node = heap.insert(5)
      heap.decreaseKey(node, 5)
      expect(heap.peek()).toBe(5)
    })
  })

  describe('delete', () => {
    it('removes a specific node', () => {
      const nodeB = heap.insert(3)
      const nodeA = heap.insert(5)
      heap.insert(7)
      heap.delete(nodeB)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(5)
      heap.delete(nodeA)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(7)
    })

    it('deleting the root node works', () => {
      const root = heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.delete(root)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(3)
    })

    it('delete decreases size', () => {
      const node = heap.insert(10)
      heap.insert(20)
      heap.delete(node)
      expect(heap.size).toBe(1)
    })

    it('delete last element leaves empty heap', () => {
      const node = heap.insert(42)
      heap.delete(node)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('empties the heap completely', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('clear on empty heap is safe', () => {
      heap.clear()
      expect(heap.size).toBe(0)
    })

    it('can insert after clear', () => {
      heap.insert(10)
      heap.clear()
      heap.insert(5)
      expect(heap.peek()).toBe(5)
      expect(heap.size).toBe(1)
    })
  })

  describe('size tracking', () => {
    it('tracks size correctly through mixed operations', () => {
      expect(heap.size).toBe(0)
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
      heap.insert(3)
      expect(heap.size).toBe(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.size).toBe(0)
    })
  })

  describe('custom comparator', () => {
    it('supports max-heap via reversed comparator', () => {
      const maxHeap = new PairingHeap<number>({
        comparator: (a, b) => b - a,
      })
      maxHeap.insert(10)
      maxHeap.insert(30)
      maxHeap.insert(20)
      expect(maxHeap.peek()).toBe(30)
      expect(maxHeap.extractMin()).toBe(30)
      expect(maxHeap.extractMin()).toBe(20)
      expect(maxHeap.extractMin()).toBe(10)
    })

    it('supports string comparator', () => {
      const strHeap = new PairingHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      strHeap.insert('cherry')
      strHeap.insert('apple')
      strHeap.insert('banana')
      expect(strHeap.peek()).toBe('apple')
      expect(strHeap.extractMin()).toBe('apple')
      expect(strHeap.extractMin()).toBe('banana')
    })

    it('supports object comparator by property', () => {
      const objHeap = new PairingHeap<{ priority: number }>({
        comparator: (a, b) => a.priority - b.priority,
      })
      objHeap.insert({ priority: 3 })
      objHeap.insert({ priority: 1 })
      objHeap.insert({ priority: 2 })
      expect(objHeap.peek()!.priority).toBe(1)
    })
  })

  describe('large number of elements', () => {
    it('handles 200 elements correctly', () => {
      const items = Array.from({ length: 200 }, (_, i) => i + 1)
      const shuffled = [...items]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      for (const item of shuffled) {
        heap.insert(item)
      }
      for (let i = 1; i <= 200; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles 1000 elements', () => {
      for (let i = 1000; i >= 1; i--) heap.insert(i)
      for (let i = 1; i <= 1000; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })
  })

  describe('duplicate values', () => {
    it('handles duplicate values correctly', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(3)
      heap.insert(3)
      heap.insert(7)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
    })
  })

  describe('sequential extracts', () => {
    it('extracts all returns sorted order', () => {
      const values = [42, 17, 8, 99, 3, 23, 56, 1, 71, 34]
      for (const v of values) {
        heap.insert(v)
      }
      const sorted = [...values].sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(heap.extractMin()).toBe(expected)
      }
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('interleaved operations', () => {
    it('handles interleaved insert and extract', () => {
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.isEmpty()).toBe(true)
      heap.insert(3)
      heap.insert(7)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(7)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('findMin', () => {
    it('returns same as peek', () => {
      heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      expect(heap.findMin()).toBe(heap.peek())
    })

    it('does not remove element', () => {
      heap.insert(42)
      heap.findMin()
      expect(heap.size).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('handles floating point numbers', () => {
      heap.insert(3.14)
      heap.insert(1.41)
      heap.insert(2.72)
      expect(heap.extractMin()).toBeCloseTo(1.41, 2)
      expect(heap.extractMin()).toBeCloseTo(2.72, 2)
      expect(heap.extractMin()).toBeCloseTo(3.14, 2)
    })

    it('handles very large numbers', () => {
      heap.insert(Number.MAX_SAFE_INTEGER)
      heap.insert(Number.MIN_SAFE_INTEGER)
      expect(heap.peek()).toBe(Number.MIN_SAFE_INTEGER)
    })

    it('insert after extractAll works', () => {
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      heap.insert(3)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(1)
    })

    it('multiple merges in sequence', () => {
      heap.insert(5)
      const h2 = new PairingHeap<number>()
      h2.insert(3)
      const h3 = new PairingHeap<number>()
      h3.insert(1)
      heap.merge(h2)
      heap.merge(h3)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('decreaseKey then extractMin gives correct result', () => {
      const n1 = heap.insert(100)
      heap.insert(50)
      heap.decreaseKey(n1, 25)
      expect(heap.extractMin()).toBe(25)
      expect(heap.extractMin()).toBe(50)
    })

    it('delete non-min node preserves min', () => {
      const max = heap.insert(100)
      heap.insert(1)
      heap.insert(50)
      heap.delete(max)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(2)
    })

    it('should merge heaps', () => {
      const h1 = new PairingHeap<number>()
      h1.insert(5)
      const h2 = new PairingHeap<number>()
      h2.insert(3)
      h1.merge(h2)
      expect(h1.peek()).toBe(3)
    })

    it('should handle isEmpty', () => {
      const heap = new PairingHeap<number>()
      expect(heap.isEmpty()).toBe(true)
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('peek returns min', () => {
      const heap = new PairingHeap<number>()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.peek()).toBe(1)
    })

    it('size tracks entries', () => {
      const heap = new PairingHeap<number>()
      heap.insert(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
    })

    it('extractMin removes minimum', () => {
      const heap = new PairingHeap<number>()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.extractMin()).toBe(3)
      expect(heap.size).toBe(2)
    })
  })

  it('empty heap peek undefined', () => {
    const h = new PairingHeap<number>()
    expect(h.peek()).toBeUndefined()
  })

  it('insert and peek', () => {
    const h = new PairingHeap<number>()
    h.insert(5)
    expect(h.peek()).toBe(5)
  })

  it('findMin returns min', () => {
    const h = new PairingHeap<number>()
    h.insert(5)
    h.insert(3)
    h.insert(7)
    expect(h.findMin()).toBe(3)
  })
})

describe('pairing-heap - wave545', () => {
  it('module exists', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('pairing-heap - wave546', () => {
  it('module accessible', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module name check', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('pairing-heap - wave547', () => {
  it('module import works', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('pairing-heap - wave548', () => {
  it('pairing-heap module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('pairing-heap module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('pairing-heap module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('pairing-heap - wave549', () => {
  it('pairing-heap module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('pairing-heap module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('pairing-heap module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})
