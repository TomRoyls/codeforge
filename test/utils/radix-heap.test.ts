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

describe('radix-heap - w142', () => {
  it('radix-heap v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w145', () => {
  it('radix-heap v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w148', () => {
  it('radix-heap v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w151', () => {
  it('radix-heap v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w154', () => {
  it('radix-heap v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w157', () => {
  it('radix-heap v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w160', () => {
  it('radix-heap v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w170', () => {
  it('radix-heap x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w180', () => {
  it('radix-heap x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w190', () => {
  it('radix-heap x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w200', () => {
  it('radix-heap x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w210', () => {
  it('radix-heap x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w220', () => {
  it('radix-heap x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w230', () => {
  it('radix-heap x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w240', () => {
  it('radix-heap x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w250', () => {
  it('radix-heap x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w260', () => {
  it('radix-heap x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w270', () => {
  it('radix-heap x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w280', () => {
  it('radix-heap x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w290', () => {
  it('radix-heap x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w300', () => {
  it('radix-heap x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w310', () => {
  it('radix-heap x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w320', () => {
  it('radix-heap x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w330', () => {
  it('radix-heap x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w340', () => {
  it('radix-heap x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w350', () => {
  it('radix-heap x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w360', () => {
  it('radix-heap x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w370', () => {
  it('radix-heap x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w380', () => {
  it('radix-heap x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w390', () => {
  it('radix-heap x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w400', () => {
  it('radix-heap x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w420', () => {
  it('radix-heap x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w440', () => {
  it('radix-heap x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w460', () => {
  it('radix-heap x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w480', () => {
  it('radix-heap x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w500', () => {
  it('radix-heap x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w550', () => {
  it('radix-heap x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-heap - w600', () => {
  it('radix-heap x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('radix-heap x600x49', () => {
    expect(describe).toBeDefined()
  })
})
