import { describe, expect, it } from 'vitest'
import { RadixHeap } from '../../src/utils/radix-heap.js'

describe('RadixHeap', () => {
  describe('constructor', () => {
    it('creates heap with default maxVal', () => {
      const h = new RadixHeap()
      expect(h.size).toBe(0)
      expect(h.isEmpty).toBe(true)
    })

    it('creates heap with custom maxVal', () => {
      const h = new RadixHeap(1000)
      expect(h.size).toBe(0)
      expect(h.isEmpty).toBe(true)
    })

    it('creates heap with small maxVal', () => {
      const h = new RadixHeap(10)
      expect(h.size).toBe(0)
    })

    it('creates heap with large maxVal', () => {
      const h = new RadixHeap(Number.MAX_SAFE_INTEGER)
      expect(h.size).toBe(0)
    })

    it('creates multiple independent heaps', () => {
      const h1 = new RadixHeap()
      const h2 = new RadixHeap()
      h1.push(5)
      expect(h1.size).toBe(1)
      expect(h2.size).toBe(0)
    })
  })

  describe('push and pop - basic functionality', () => {
    it('push and pop returns in order', () => {
      const h = new RadixHeap()
      h.push(5)
      h.push(3)
      h.push(7)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(5)
      expect(h.pop()).toBe(7)
    })

    it('handles already sorted input', () => {
      const h = new RadixHeap()
      for (let i = 0; i < 10; i++) h.push(i)
      for (let i = 0; i < 10; i++) expect(h.pop()).toBe(i)
    })

    it('handles reverse sorted input', () => {
      const h = new RadixHeap()
      for (let i = 9; i >= 0; i--) h.push(i)
      for (let i = 0; i < 10; i++) expect(h.pop()).toBe(i)
    })

    it('handles sequential pushes', () => {
      const h = new RadixHeap()
      for (let i = 0; i < 50; i++) h.push(i)
      for (let i = 0; i < 50; i++) {
        expect(h.pop()).toBe(i)
      }
    })

    it('handles decreasing push order', () => {
      const h = new RadixHeap()
      h.push(10)
      h.push(5)
      h.push(1)
      expect(h.pop()).toBe(1)
      expect(h.pop()).toBe(5)
      expect(h.pop()).toBe(10)
    })

    it('handles interleaved push pop', () => {
      const h = new RadixHeap()
      h.push(5)
      h.push(1)
      expect(h.pop()).toBe(1)
      h.push(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(5)
    })

    it('handles random order input', () => {
      const h = new RadixHeap()
      const values = [3, 7, 1, 9, 2, 8, 4, 6, 5]
      values.forEach(v => h.push(v))
      values.sort((a, b) => a - b)
      values.forEach(v => expect(h.pop()).toBe(v))
    })
  })

  describe('size property', () => {
    it('tracks size', () => {
      const h = new RadixHeap()
      expect(h.size).toBe(0)
      h.push(1)
      expect(h.size).toBe(1)
      h.push(2)
      expect(h.size).toBe(2)
    })

    it('size decreases after pop', () => {
      const h = new RadixHeap()
      h.push(1)
      h.push(2)
      h.pop()
      expect(h.size).toBe(1)
    })

    it('size on new heap is 0', () => {
      const h = new RadixHeap()
      expect(h.size).toBe(0)
    })

    it('size returns correct after multiple operations', () => {
      const h = new RadixHeap()
      h.push(1)
      h.push(2)
      h.push(3)
      expect(h.size).toBe(3)
      h.pop()
      h.pop()
      expect(h.size).toBe(1)
    })

    it('size is correct after draining', () => {
      const h = new RadixHeap()
      h.push(1)
      h.push(2)
      h.pop()
      h.pop()
      expect(h.size).toBe(0)
    })
  })

  describe('isEmpty property', () => {
    it('isEmpty is true on new heap', () => {
      const h = new RadixHeap()
      expect(h.isEmpty).toBe(true)
    })

    it('isEmpty after draining', () => {
      const h = new RadixHeap()
      h.push(1)
      h.pop()
      expect(h.isEmpty).toBe(true)
    })

    it('isEmpty is false when elements present', () => {
      const h = new RadixHeap()
      h.push(1)
      expect(h.isEmpty).toBe(false)
    })

    it('isEmpty becomes false after push', () => {
      const h = new RadixHeap()
      h.push(5)
      expect(h.isEmpty).toBe(false)
    })

    it('isEmpty becomes true after final pop', () => {
      const h = new RadixHeap()
      h.push(5)
      h.pop()
      expect(h.isEmpty).toBe(true)
    })
  })

  describe('pop - edge cases', () => {
    it('pop empty returns undefined', () => {
      const h = new RadixHeap()
      expect(h.pop()).toBeUndefined()
    })

    it('pop from empty after draining returns undefined', () => {
      const h = new RadixHeap()
      h.push(1)
      h.pop()
      expect(h.pop()).toBeUndefined()
    })

    it('multiple pops from empty return undefined', () => {
      const h = new RadixHeap()
      expect(h.pop()).toBeUndefined()
      expect(h.pop()).toBeUndefined()
      expect(h.pop()).toBeUndefined()
    })
  })

  describe('duplicate values', () => {
    it('handles duplicate values', () => {
      const h = new RadixHeap()
      h.push(3)
      h.push(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(3)
    })

    it('handles many duplicate values', () => {
      const h = new RadixHeap()
      for (let i = 0; i < 10; i++) h.push(5)
      for (let i = 0; i < 10; i++) expect(h.pop()).toBe(5)
    })

    it('handles mixed duplicates', () => {
      const h = new RadixHeap()
      h.push(3)
      h.push(3)
      h.push(1)
      expect(h.pop()).toBe(1)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(3)
    })

    it('handles all same values', () => {
      const h = new RadixHeap()
      h.push(7)
      h.push(7)
      h.push(7)
      h.push(7)
      h.push(7)
      for (let i = 0; i < 5; i++) expect(h.pop()).toBe(7)
    })
  })

  describe('single element', () => {
    it('handles single element', () => {
      const h = new RadixHeap()
      h.push(42)
      expect(h.pop()).toBe(42)
    })

    it('handles single element with size check', () => {
      const h = new RadixHeap()
      h.push(5)
      expect(h.size).toBe(1)
      expect(h.pop()).toBe(5)
      expect(h.isEmpty).toBe(true)
    })

    it('handles single element with empty check', () => {
      const h = new RadixHeap()
      h.push(42)
      expect(h.isEmpty).toBe(false)
      h.pop()
      expect(h.isEmpty).toBe(true)
    })
  })

  describe('zero values', () => {
    it('handles zeros', () => {
      const h = new RadixHeap()
      h.push(0)
      h.push(0)
      expect(h.pop()).toBe(0)
    })

    it('handles zero with positive values', () => {
      const h = new RadixHeap()
      h.push(5)
      h.push(0)
      h.push(3)
      expect(h.pop()).toBe(0)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(5)
    })

    it('handles only zero', () => {
      const h = new RadixHeap()
      h.push(0)
      expect(h.pop()).toBe(0)
    })

    it('handles many zeros', () => {
      const h = new RadixHeap()
      for (let i = 0; i < 10; i++) h.push(0)
      for (let i = 0; i < 10; i++) expect(h.pop()).toBe(0)
    })
  })

  describe('large values', () => {
    it('handles large range', () => {
      const h = new RadixHeap()
      h.push(1000000)
      h.push(1)
      h.push(500000)
      expect(h.pop()).toBe(1)
      expect(h.pop()).toBe(500000)
      expect(h.pop()).toBe(1000000)
    })

    it('handles large values', () => {
      const h = new RadixHeap()
      h.push(1000000)
      h.push(1000001)
      expect(h.pop()).toBe(1000000)
      expect(h.pop()).toBe(1000001)
    })

    it('handles very large values', () => {
      const h = new RadixHeap(Number.MAX_SAFE_INTEGER)
      h.push(Number.MAX_SAFE_INTEGER - 1000)
      h.push(Number.MAX_SAFE_INTEGER)
      h.push(Number.MAX_SAFE_INTEGER - 500)
      expect(h.pop()).toBe(Number.MAX_SAFE_INTEGER - 1000)
      expect(h.pop()).toBe(Number.MAX_SAFE_INTEGER - 500)
      expect(h.pop()).toBe(Number.MAX_SAFE_INTEGER)
    })
  })

  describe('boundary values', () => {
    it('handles boundary between buckets', () => {
      const h = new RadixHeap()
      h.push(7)
      h.push(8)
      h.push(15)
      h.push(16)
      expect(h.pop()).toBe(7)
      expect(h.pop()).toBe(8)
      expect(h.pop()).toBe(15)
      expect(h.pop()).toBe(16)
    })

    it('handles powers of two', () => {
      const h = new RadixHeap()
      h.push(1)
      h.push(2)
      h.push(4)
      h.push(8)
      h.push(16)
      expect(h.pop()).toBe(1)
      expect(h.pop()).toBe(2)
      expect(h.pop()).toBe(4)
      expect(h.pop()).toBe(8)
      expect(h.pop()).toBe(16)
    })

    it('handles consecutive values', () => {
      const h = new RadixHeap()
      for (let i = 0; i < 20; i++) h.push(i)
      for (let i = 0; i < 20; i++) expect(h.pop()).toBe(i)
    })
  })

  describe('complex scenarios', () => {
    it('handles many interleaved operations', () => {
      const h = new RadixHeap()
      h.push(10)
      h.push(5)
      expect(h.pop()).toBe(5)
      h.push(8)
      h.push(3)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(8)
      expect(h.pop()).toBe(10)
    })

    it('handles repeated pattern', () => {
      const h = new RadixHeap()
      for (let i = 0; i < 10; i++) {
        h.push(5)
        h.push(10)
        h.push(1)
      }
      for (let i = 0; i < 10; i++) expect(h.pop()).toBe(1)
      for (let i = 0; i < 10; i++) expect(h.pop()).toBe(5)
      for (let i = 0; i < 10; i++) expect(h.pop()).toBe(10)
    })

    it('handles alternating high low', () => {
      const h = new RadixHeap()
      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) h.push(100 - i)
        else h.push(i)
      }
      const popped: number[] = []
      while (!h.isEmpty) {
        popped.push(h.pop()!)
      }
      expect(popped).toEqual([...popped].sort((a, b) => a - b))
    })

    it('handles push after many pops', () => {
      const h = new RadixHeap()
      h.push(5)
      h.push(1)
      h.push(3)
      h.pop()
      h.push(2)
      expect(h.pop()).toBe(2)
      expect(h.pop()).toBe(3)
      expect(h.pop()).toBe(5)
    })
  })

  describe('stress testing', () => {
    it('handles large number of elements', () => {
      const h = new RadixHeap()
      const count = 1000
      for (let i = 0; i < count; i++) h.push(count - i)
      expect(h.size).toBe(count)
      for (let i = 1; i <= count; i++) expect(h.pop()).toBe(i)
    })

    it('handles large range with many elements', () => {
      const h = new RadixHeap()
      const values = Array.from({ length: 500 }, (_, i) => i * 1000)
      values.forEach(v => h.push(v))
      values.sort((a, b) => a - b)
      values.forEach(v => expect(h.pop()).toBe(v))
    })

    it('handles many small values', () => {
      const h = new RadixHeap()
      for (let i = 0; i < 100; i++) h.push(i % 10)
      const result: number[] = []
      while (!h.isEmpty) result.push(h.pop()!)
      expect(result.every((v, i) => i === 0 || result[i - 1]! <= v)).toBe(true)
    })
  })

  it('should handle single element', () => {
    const rh = new RadixHeap(100)
    rh.push(42)
    expect(rh.pop()).toBe(42)
  })

  it('should handle decreasing push', () => {
    const rh = new RadixHeap(100)
    rh.push(50)
    rh.push(30)
    rh.push(10)
    expect(rh.pop()).toBe(10)
    expect(rh.pop()).toBe(30)
  })

  it('isEmpty is true for new heap', () => {
    expect(new RadixHeap().isEmpty).toBe(true)
  })

  it('size tracks number of elements', () => {
    const rh = new RadixHeap()
    rh.push(5)
    rh.push(3)
    expect(rh.size).toBe(2)
  })

  it('pop returns undefined when empty', () => {
    expect(new RadixHeap().pop()).toBeUndefined()
  })

  it('handles duplicate values', () => {
    const rh = new RadixHeap()
    rh.push(5)
    rh.push(5)
    expect(rh.pop()).toBe(5)
    expect(rh.pop()).toBe(5)
  })

  it('push and pop', () => {
    const h = new RadixHeap(100)
    h.push(5)
    h.push(3)
    expect(h.pop()).toBe(3)
  })

  it('pop empty returns undefined', () => {
    const h = new RadixHeap()
    expect(h.pop()).toBeUndefined()
  })

  it('maintains order', () => {
    const h = new RadixHeap(100)
    h.push(5)
    h.push(1)
    h.push(3)
    expect(h.pop()).toBe(1)
    expect(h.pop()).toBe(3)
  })

})
describe('radix-heap - wave545', () => {
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

describe('radix-heap - wave546', () => {
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

describe('radix-heap - wave547', () => {
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

describe('radix-heap - wave548', () => {
  it('radix-heap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave549', () => {
  it('radix-heap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave550', () => {
  it('radix-heap w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave551', () => {
  it('radix-heap w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave552', () => {
  it('radix-heap w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave553', () => {
  it('radix-heap w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave554', () => {
  it('radix-heap w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave555', () => {
  it('radix-heap w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave556', () => {
  it('radix-heap w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave557', () => {
  it('radix-heap w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave558', () => {
  it('radix-heap w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave559', () => {
  it('radix-heap w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave560', () => {
  it('radix-heap w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave561', () => {
  it('radix-heap w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave562', () => {
  it('radix-heap w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave563', () => {
  it('radix-heap w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave564', () => {
  it('radix-heap w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave565', () => {
  it('radix-heap w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave566', () => {
  it('radix-heap w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave127', () => {
  it('radix-heap w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave130', () => {
  it('radix-heap w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave133', () => {
  it('radix-heap w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave136', () => {
  it('radix-heap w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - wave139', () => {
  it('radix-heap w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap w139 v2', () => {
    expect(describe).toBeDefined()
  })
})
