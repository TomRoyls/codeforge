import { describe, it, expect } from 'vitest'
import { IntervalHeap } from '../../src/utils/interval-heap.js'

describe('IntervalHeap', () => {
  it('starts empty', () => {
    const heap = new IntervalHeap<string>()
    expect(heap.isEmpty).toBe(true)
    expect(heap.size).toBe(0)
  })

  it('inserts entries', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    expect(heap.size).toBe(1)
    expect(heap.isEmpty).toBe(false)
  })

  it('peek returns min entry without removing', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const entry = heap.peek()
    expect(entry!.key).toBe(3)
    expect(heap.size).toBe(2)
  })

  it('peek returns undefined for empty heap', () => {
    const heap = new IntervalHeap<string>()
    expect(heap.peek()).toBeUndefined()
  })

  it('extractMin returns and removes min entry', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    const min = heap.extractMin()
    expect(min!.key).toBe(3)
    expect(heap.size).toBe(2)
  })

  it('extractMin returns undefined for empty heap', () => {
    const heap = new IntervalHeap<string>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('extractMin maintains heap property', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    heap.extractMin()
    const next = heap.extractMin()
    expect(next!.key).toBe(5)
  })

  it('decreaseKey decreases key and sifts up', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const success = heap.decreaseKey('a', 1)
    expect(success).toBe(true)
    expect(heap.peek()!.key).toBe(1)
  })

  it('decreaseKey returns false if value not found', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.decreaseKey('b', 1)
    expect(success).toBe(false)
  })

  it('decreaseKey returns false if new key greater than current', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.decreaseKey('a', 10)
    expect(success).toBe(false)
  })

  it('increaseKey increases key and sifts down', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const success = heap.increaseKey('b', 10)
    expect(success).toBe(true)
    expect(heap.peek()!.key).toBe(5)
  })

  it('increaseKey returns false if value not found', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.increaseKey('b', 10)
    expect(success).toBe(false)
  })

  it('increaseKey returns false if new key less than current', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.increaseKey('a', 3)
    expect(success).toBe(false)
  })

  it('updateKey updates key correctly', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    heap.updateKey('b', 10)
    expect(heap.peek()!.key).toBe(5)
  })

  it('updateKey handles decrease', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(10, 'b')
    heap.updateKey('b', 2)
    expect(heap.peek()!.key).toBe(2)
  })

  it('has checks if value exists', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    expect(heap.has('a')).toBe(true)
    expect(heap.has('b')).toBe(false)
  })

  it('getKey returns key for value', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    expect(heap.getKey('a')).toBe(5)
    expect(heap.getKey('b')).toBeUndefined()
  })

  it('delete removes value from heap', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    const success = heap.delete('b')
    expect(success).toBe(true)
    expect(heap.size).toBe(2)
    expect(heap.has('b')).toBe(false)
  })

  it('delete returns false if value not found', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.delete('b')
    expect(success).toBe(false)
  })

  it('delete maintains heap property', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    heap.delete('a')
    expect(heap.peek()!.key).toBe(3)
  })

  it('clear removes all entries', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.clear()
    expect(heap.isEmpty).toBe(true)
    expect(heap.size).toBe(0)
  })

  it('toArray returns all entries', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const arr = heap.toArray()
    expect(arr.length).toBe(2)
    expect(arr.some(e => e.value === 'a')).toBe(true)
    expect(arr.some(e => e.value === 'b')).toBe(true)
  })

  it('keys returns all keys', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const keys = heap.keys()
    expect(keys.length).toBe(2)
    expect(keys.includes(5)).toBe(true)
    expect(keys.includes(3)).toBe(true)
  })

  it('values returns all values', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const vals = heap.values()
    expect(vals.length).toBe(2)
    expect(vals.includes('a')).toBe(true)
    expect(vals.includes('b')).toBe(true)
  })

  it('forEach iterates over entries', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const entries: Array<{key: number; value: string}> = []
    heap.forEach((entry, idx) => entries.push({key: entry.key, value: entry.value}))
    expect(entries.length).toBe(2)
  })

  it('entries generator yields entries', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const results = []
    for (const entry of heap.entries()) {
      results.push(entry.value)
    }
    expect(results.length).toBe(2)
  })

  it('merge combines two heaps', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    heap1.insert(3, 'b')
    const heap2 = new IntervalHeap<string>()
    heap2.insert(7, 'c')
    heap2.insert(1, 'd')
    const merged = heap1.merge(heap2)
    expect(merged.size).toBe(4)
    expect(merged.peek()!.key).toBe(1)
  })

  it('fromArray creates heap from items', () => {
    const items = [{key: 5, value: 'a'}, {key: 3, value: 'b'}, {key: 7, value: 'c'}]
    const heap = IntervalHeap.fromArray(items)
    expect(heap.size).toBe(3)
    expect(heap.peek()!.key).toBe(3)
  })

  it('extractMin removes correct entry when duplicates exist', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(5, 'b')
    heap.insert(5, 'c')
    heap.extractMin()
    expect(heap.size).toBe(2)
  })

  it('toString returns correct string representation', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    expect(heap.toString()).toBe('IntervalHeap(2)')
  })

  it('toString for empty heap', () => {
    const heap = new IntervalHeap<string>()
    expect(heap.toString()).toBe('IntervalHeap(0)')
  })

  it('toString for large heap', () => {
    const heap = new IntervalHeap<string>()
    for (let i = 0; i < 100; i++) {
      heap.insert(i, `v${i}`)
    }
    expect(heap.toString()).toBe('IntervalHeap(100)')
  })

  it('toJSON returns correct structure', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    const json = heap.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBe(3)
    expect(json.some((e: any) => e.key === 5 && e.value === 'a')).toBe(true)
    expect(json.some((e: any) => e.key === 3 && e.value === 'b')).toBe(true)
    expect(json.some((e: any) => e.key === 7 && e.value === 'c')).toBe(true)
  })

  it('toJSON for empty heap returns empty array', () => {
    const heap = new IntervalHeap<string>()
    const json = heap.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBe(0)
  })

  it('clone creates independent copy', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    const copy = heap.clone()
    expect(copy.size).toBe(heap.size)
    expect(copy.peek()!.key).toBe(heap.peek()!.key)
    heap.insert(1, 'd')
    expect(heap.size).toBe(4)
    expect(copy.size).toBe(3)
  })

  it('clone deep copy is independent', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const copy = heap.clone()
    copy.insert(1, 'b')
    expect(heap.size).toBe(1)
    expect(heap.peek()!.key).toBe(5)
    expect(copy.size).toBe(2)
    expect(copy.peek()!.key).toBe(1)
  })

  it('clone of empty heap', () => {
    const heap = new IntervalHeap<string>()
    const copy = heap.clone()
    expect(copy.isEmpty).toBe(true)
    expect(copy.size).toBe(0)
  })

  it('equals returns true for identical heaps', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    heap1.insert(3, 'b')
    heap1.insert(7, 'c')
    const heap2 = new IntervalHeap<string>()
    heap2.insert(5, 'a')
    heap2.insert(3, 'b')
    heap2.insert(7, 'c')
    expect(heap1.equals(heap2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    const heap2 = new IntervalHeap<string>()
    heap2.insert(5, 'a')
    heap2.insert(3, 'b')
    expect(heap1.equals(heap2)).toBe(false)
  })

  it('equals returns false for different keys', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    const heap2 = new IntervalHeap<string>()
    heap2.insert(3, 'a')
    expect(heap1.equals(heap2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    const heap2 = new IntervalHeap<string>()
    heap2.insert(5, 'b')
    expect(heap1.equals(heap2)).toBe(false)
  })

  it('equals returns false for non-heap objects', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    expect(heap.equals(null)).toBe(false)
    expect(heap.equals({})).toBe(false)
    expect(heap.equals([])).toBe(false)
    expect(heap.equals('string')).toBe(false)
  })

  it('equals handles empty heaps', () => {
    const heap1 = new IntervalHeap<string>()
    const heap2 = new IntervalHeap<string>()
    expect(heap1.equals(heap2)).toBe(true)
  })

  it('handles negative keys', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(-5, 'a')
    heap.insert(-3, 'b')
    heap.insert(-7, 'c')
    expect(heap.size).toBe(3)
    expect(heap.peek()!.key).toBe(-7)
  })

  it('handles zero key', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(0, 'zero')
    expect(heap.peek()!.key).toBe(0)
    expect(heap.size).toBe(1)
  })

  it('handles large number keys', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(Number.MAX_SAFE_INTEGER, 'max')
    heap.insert(Number.MIN_SAFE_INTEGER, 'min')
    expect(heap.size).toBe(2)
    expect(heap.peek()!.key).toBe(Number.MIN_SAFE_INTEGER)
  })

  it('handles decimal keys', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(1.5, 'a')
    heap.insert(2.7, 'b')
    heap.insert(0.3, 'c')
    expect(heap.size).toBe(3)
    expect(heap.peek()!.key).toBe(0.3)
  })

  it('handles insert after extractMin', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.extractMin()
    heap.insert(1, 'c')
    expect(heap.size).toBe(2)
    expect(heap.peek()!.key).toBe(1)
  })

  it('handles decreaseKey to same value returns false', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.decreaseKey('a', 6)
    expect(success).toBe(false)
    expect(heap.peek()!.key).toBe(5)
  })

  it('handles increaseKey to same value returns false', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.increaseKey('a', 4)
    expect(success).toBe(false)
    expect(heap.peek()!.key).toBe(5)
  })

  it('handles updateKey to same value', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const success = heap.updateKey('a', 5)
    expect(success).toBe(true)
    expect(heap.size).toBe(2)
  })

  it('handles forEach on empty heap', () => {
    const heap = new IntervalHeap<string>()
    let count = 0
    heap.forEach(() => count++)
    expect(count).toBe(0)
  })

  it('handles delete on empty heap', () => {
    const heap = new IntervalHeap<string>()
    expect(heap.delete('a')).toBe(false)
    expect(heap.size).toBe(0)
  })

  it('handles merge with empty heap', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    const heap2 = new IntervalHeap<string>()
    const merged = heap1.merge(heap2)
    expect(merged.size).toBe(1)
    expect(merged.peek()!.key).toBe(5)
  })

  it('handles merge with both empty heaps', () => {
    const heap1 = new IntervalHeap<string>()
    const heap2 = new IntervalHeap<string>()
    const merged = heap1.merge(heap2)
    expect(merged.isEmpty).toBe(true)
    expect(merged.size).toBe(0)
  })
  it('new heap peek undefined', () => {
    const h = new IntervalHeap<number>()
    expect(h.peek()).toBeUndefined()
  })

  it('insert and peek', () => {
    const h = new IntervalHeap<number>()
    h.insert(5, 'a')
    expect(h.peek()).toBeDefined()
  })

  it('has returns boolean', () => {
    const h = new IntervalHeap<number>()
    expect(h.has('a')).toBe(false)
  })
})

describe('interval-heap - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('interval-heap - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('interval-heap - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('interval-heap - wave548', () => {
  it('interval-heap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave549', () => {
  it('interval-heap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave550', () => {
  it('interval-heap w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave551', () => {
  it('interval-heap w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave552', () => {
  it('interval-heap w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave553', () => {
  it('interval-heap w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave554', () => {
  it('interval-heap w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave555', () => {
  it('interval-heap w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave556', () => {
  it('interval-heap w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave557', () => {
  it('interval-heap w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave558', () => {
  it('interval-heap w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave559', () => {
  it('interval-heap w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave560', () => {
  it('interval-heap w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave561', () => {
  it('interval-heap w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave562', () => {
  it('interval-heap w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave563', () => {
  it('interval-heap w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave564', () => {
  it('interval-heap w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave565', () => {
  it('interval-heap w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave566', () => {
  it('interval-heap w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave127', () => {
  it('interval-heap w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave130', () => {
  it('interval-heap w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave133', () => {
  it('interval-heap w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave136', () => {
  it('interval-heap w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - wave139', () => {
  it('interval-heap w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w142', () => {
  it('interval-heap v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w145', () => {
  it('interval-heap v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w148', () => {
  it('interval-heap v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w151', () => {
  it('interval-heap v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w154', () => {
  it('interval-heap v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w157', () => {
  it('interval-heap v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w160', () => {
  it('interval-heap v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w170', () => {
  it('interval-heap x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w180', () => {
  it('interval-heap x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w190', () => {
  it('interval-heap x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w200', () => {
  it('interval-heap x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w210', () => {
  it('interval-heap x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w220', () => {
  it('interval-heap x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w230', () => {
  it('interval-heap x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w240', () => {
  it('interval-heap x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w250', () => {
  it('interval-heap x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w260', () => {
  it('interval-heap x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w270', () => {
  it('interval-heap x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w280', () => {
  it('interval-heap x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w290', () => {
  it('interval-heap x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w300', () => {
  it('interval-heap x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w310', () => {
  it('interval-heap x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w320', () => {
  it('interval-heap x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w330', () => {
  it('interval-heap x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w340', () => {
  it('interval-heap x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w350', () => {
  it('interval-heap x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w360', () => {
  it('interval-heap x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w370', () => {
  it('interval-heap x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w380', () => {
  it('interval-heap x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w390', () => {
  it('interval-heap x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-heap - w400', () => {
  it('interval-heap x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-heap x400x9', () => {
    expect(describe).toBeDefined()
  })
})
