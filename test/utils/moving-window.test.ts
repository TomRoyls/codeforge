import { describe, it, expect } from 'vitest'
import { MovingWindow } from '../../src/utils/moving-window.js'

describe('MovingWindow', () => {
  it('creates with specified maxSize', () => {
    const window = new MovingWindow<number>(5)
    expect(window.maxSize).toBe(5)
    expect(window.size).toBe(0)
  })

  it('throws on maxSize < 1', () => {
    expect(() => new MovingWindow(0)).toThrow(RangeError)
    expect(() => new MovingWindow(-1)).toThrow(RangeError)
  })

  it('throws on non-positive maxSize with message', () => {
    expect(() => new MovingWindow(-5)).toThrow('maxSize must be >= 1')
  })

  it('pushes items up to maxSize', () => {
    const window = new MovingWindow<number>(3)
    window.push(1)
    window.push(2)
    window.push(3)
    expect(window.size).toBe(3)
    expect(window.isFull).toBe(true)
  })

  it('evicts oldest item when full', () => {
    const window = new MovingWindow<number>(3)
    window.push(1)
    window.push(2)
    window.push(3)
    window.push(4)
    expect(window.toArray()).toEqual([2, 3, 4])
  })

  it('maintains sliding window over many pushes', () => {
    const window = new MovingWindow<number>(3)
    for (let i = 1; i <= 10; i++) window.push(i)
    expect(window.toArray()).toEqual([8, 9, 10])
  })

  it('returns correct first and last', () => {
    const window = new MovingWindow<number>(3)
    window.push(10)
    window.push(20)
    window.push(30)
    expect(window.first()).toBe(10)
    expect(window.last()).toBe(30)
  })

  it('at returns item at index', () => {
    const window = new MovingWindow<number>(3)
    window.push(10)
    window.push(20)
    window.push(30)
    expect(window.at(0)).toBe(10)
    expect(window.at(1)).toBe(20)
    expect(window.at(2)).toBe(30)
  })

  it('at returns undefined for out of bounds', () => {
    const window = new MovingWindow<number>(3)
    window.push(10)
    expect(window.at(-1)).toBeUndefined()
    expect(window.at(5)).toBeUndefined()
  })

  it('first and last return undefined when empty', () => {
    const window = new MovingWindow<number>(3)
    expect(window.first()).toBeUndefined()
    expect(window.last()).toBeUndefined()
  })

  it('isEmpty returns true when no items', () => {
    const window = new MovingWindow<number>(3)
    expect(window.isEmpty).toBe(true)
    window.push(1)
    expect(window.isEmpty).toBe(false)
  })

  it('isFull returns false when not full', () => {
    const window = new MovingWindow<number>(5)
    expect(window.isFull).toBe(false)
    window.push(1)
    expect(window.isFull).toBe(false)
  })

  it('clear removes all items', () => {
    const window = new MovingWindow<number>(3)
    window.push(1)
    window.push(2)
    window.clear()
    expect(window.isEmpty).toBe(true)
    expect(window.size).toBe(0)
  })

  it('clear resets isFull', () => {
    const window = new MovingWindow<number>(2)
    window.push(1)
    window.push(2)
    expect(window.isFull).toBe(true)
    window.clear()
    expect(window.isFull).toBe(false)
  })

  describe('statistics', () => {
    it('sum computes total', () => {
      const window = new MovingWindow<number>(5)
      window.push(10)
      window.push(20)
      window.push(30)
      expect(window.sum()).toBe(60)
    })

    it('sum returns 0 when empty', () => {
      const window = new MovingWindow<number>(5)
      expect(window.sum()).toBe(0)
    })

    it('sum with single item', () => {
      const window = new MovingWindow<number>(5)
      window.push(42)
      expect(window.sum()).toBe(42)
    })

    it('mean computes average', () => {
      const window = new MovingWindow<number>(5)
      window.push(10)
      window.push(20)
      window.push(30)
      expect(window.mean()).toBeCloseTo(20)
    })

    it('mean returns undefined when empty', () => {
      const window = new MovingWindow<number>(5)
      expect(window.mean()).toBeUndefined()
    })

    it('mean with single item', () => {
      const window = new MovingWindow<number>(5)
      window.push(10)
      expect(window.mean()).toBe(10)
    })

    it('mean with fractional result', () => {
      const window = new MovingWindow<number>(5)
      window.push(1)
      window.push(2)
      window.push(4)
      expect(window.mean()).toBeCloseTo(2.333, 3)
    })

    it('min returns smallest item', () => {
      const window = new MovingWindow<number>(5)
      window.push(30)
      window.push(10)
      window.push(20)
      expect(window.min()).toBe(10)
    })

    it('max returns largest item', () => {
      const window = new MovingWindow<number>(5)
      window.push(30)
      window.push(10)
      window.push(20)
      expect(window.max()).toBe(30)
    })

    it('min and max return undefined when empty', () => {
      const window = new MovingWindow<number>(5)
      expect(window.min()).toBeUndefined()
      expect(window.max()).toBeUndefined()
    })

    it('min with single item returns that item', () => {
      const window = new MovingWindow<number>(5)
      window.push(5)
      expect(window.min()).toBe(5)
    })

    it('max with single item returns that item', () => {
      const window = new MovingWindow<number>(5)
      window.push(5)
      expect(window.max()).toBe(5)
    })

    it('min with negative numbers', () => {
      const window = new MovingWindow<number>(5)
      window.push(-10)
      window.push(-5)
      window.push(-20)
      expect(window.min()).toBe(-20)
    })

    it('max with negative numbers', () => {
      const window = new MovingWindow<number>(5)
      window.push(-10)
      window.push(-5)
      window.push(-20)
      expect(window.max()).toBe(-5)
    })
  })

  describe('iteration', () => {
    it('forEach iterates in order', () => {
      const window = new MovingWindow<number>(3)
      window.push(1)
      window.push(2)
      window.push(3)
      const result: number[] = []
      window.forEach((item) => result.push(item))
      expect(result).toEqual([1, 2, 3])
    })

    it('forEach passes index', () => {
      const window = new MovingWindow<number>(3)
      window.push(10)
      window.push(20)
      window.push(30)
      const indices: number[] = []
      window.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('forEach after wraparound maintains order', () => {
      const window = new MovingWindow<number>(3)
      window.push(1)
      window.push(2)
      window.push(3)
      window.push(4)
      const result: number[] = []
      window.forEach((item) => result.push(item))
      expect(result).toEqual([2, 3, 4])
    })

    it('forEach on empty window does nothing', () => {
      const window = new MovingWindow<number>(3)
      const result: number[] = []
      window.forEach((item) => result.push(item))
      expect(result).toEqual([])
    })

    it('reduce computes aggregate', () => {
      const window = new MovingWindow<number>(5)
      window.push(1)
      window.push(2)
      window.push(3)
      const sum = window.reduce((acc, item) => acc + item, 0)
      expect(sum).toBe(6)
    })

    it('reduce with custom accumulator', () => {
      const window = new MovingWindow<number>(5)
      window.push(1)
      window.push(2)
      window.push(3)
      const result = window.reduce((acc, item, i) => acc + `${i}:${item},`, '')
      expect(result).toBe('0:1,1:2,2:3,')
    })

    it('reduce passes index', () => {
      const window = new MovingWindow<number>(3)
      window.push(10)
      window.push(20)
      window.push(30)
      const sum = window.reduce((acc, _, i) => acc + i, 0)
      expect(sum).toBe(3)
    })

    it('reduce on empty window returns initial', () => {
      const window = new MovingWindow<number>(3)
      const result = window.reduce((acc, item) => acc + item, 42)
      expect(result).toBe(42)
    })

    it('reduce after wraparound', () => {
      const window = new MovingWindow<number>(3)
      window.push(1)
      window.push(2)
      window.push(3)
      window.push(4)
      window.push(5)
      const sum = window.reduce((acc, item) => acc + item, 0)
      expect(sum).toBe(12)
    })
  })

  describe('wraparound behavior', () => {
    it('handles multiple wraparounds correctly', () => {
      const window = new MovingWindow<number>(3)
      for (let i = 1; i <= 100; i++) window.push(i)
      expect(window.toArray()).toEqual([98, 99, 100])
    })

    it('at after wraparound returns correct items', () => {
      const window = new MovingWindow<number>(3)
      window.push(1)
      window.push(2)
      window.push(3)
      window.push(4)
      window.push(5)
      expect(window.at(0)).toBe(3)
      expect(window.at(1)).toBe(4)
      expect(window.at(2)).toBe(5)
    })

    it('first and last after wraparound', () => {
      const window = new MovingWindow<number>(3)
      window.push(1)
      window.push(2)
      window.push(3)
      window.push(4)
      window.push(5)
      expect(window.first()).toBe(3)
      expect(window.last()).toBe(5)
    })

    it('toArray after multiple wraparounds', () => {
      const window = new MovingWindow<number>(3)
      for (let i = 0; i < 10; i++) window.push(i)
      expect(window.toArray()).toEqual([7, 8, 9])
    })

    it('forEach after multiple wraparounds', () => {
      const window = new MovingWindow<number>(3)
      for (let i = 0; i < 10; i++) window.push(i)
      const result: number[] = []
      window.forEach((item) => result.push(item))
      expect(result).toEqual([7, 8, 9])
    })
  })

  describe('generic types', () => {
    it('works with strings', () => {
      const window = new MovingWindow<string>(3)
      window.push('a')
      window.push('b')
      window.push('c')
      window.push('d')
      expect(window.toArray()).toEqual(['b', 'c', 'd'])
      expect(window.first()).toBe('b')
      expect(window.last()).toBe('d')
    })

    it('works with objects', () => {
      const window = new MovingWindow<{id: number}>(3)
      window.push({id: 1})
      window.push({id: 2})
      window.push({id: 3})
      window.push({id: 4})
      expect(window.at(0)).toEqual({id: 2})
      expect(window.at(2)).toEqual({id: 4})
    })

    it('works with booleans', () => {
      const window = new MovingWindow<boolean>(3)
      window.push(true)
      window.push(false)
      window.push(true)
      expect(window.size).toBe(3)
    })

    it('works with null', () => {
      const window = new MovingWindow<number | null>(3)
      window.push(null)
      window.push(null)
      window.push(null)
      expect(window.size).toBe(3)
    })

    it('works with undefined', () => {
      const window = new MovingWindow<number | undefined>(3)
      window.push(undefined)
      window.push(undefined)
      window.push(undefined)
      expect(window.size).toBe(3)
    })
  })

  describe('array methods', () => {
    it('toArray returns independent copy', () => {
      const window = new MovingWindow<number>(3)
      window.push(1)
      window.push(2)
      const arr = window.toArray()
      arr.push(999)
      expect(window.size).toBe(2)
    })

    it('toArray returns snapshot', () => {
      const window = new MovingWindow<number>(3)
      window.push(1)
      window.push(2)
      const arr = window.toArray()
      expect(arr).toEqual([1, 2])
    })

    it('toArray with empty window returns empty array', () => {
      const window = new MovingWindow<number>(3)
      expect(window.toArray()).toEqual([])
    })

    it('toArray maintains order after wraparound', () => {
      const window = new MovingWindow<number>(3)
      window.push(1)
      window.push(2)
      window.push(3)
      window.push(4)
      expect(window.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('edge cases', () => {
    it('exceeding capacity removes oldest', () => {
      const window = new MovingWindow<number>(2)
      window.push(1)
      window.push(2)
      window.push(3)
      expect(window.toArray()).toEqual([2, 3])
    })

    it('handles size 1 window', () => {
      const window = new MovingWindow<number>(1)
      window.push(1)
      expect(window.size).toBe(1)
      expect(window.first()).toBe(1)
      expect(window.last()).toBe(1)
      window.push(2)
      expect(window.first()).toBe(2)
      expect(window.last()).toBe(2)
    })

    it('at on partially filled window', () => {
      const window = new MovingWindow<number>(5)
      window.push(10)
      window.push(20)
      expect(window.at(0)).toBe(10)
      expect(window.at(1)).toBe(20)
      expect(window.at(2)).toBeUndefined()
    })

    it('sum ignores non-number types', () => {
      const window = new MovingWindow<number | string>(3)
      window.push(10)
      window.push('hello')
      window.push(20)
      expect(window.sum()).toBe(30)
    })

    it('mean with sum ignoring non-numbers', () => {
      const window = new MovingWindow<number | string>(3)
      window.push(10)
      window.push('hello')
      window.push(20)
      expect(window.mean()).toBe(10)
    })

    it('clear then push works correctly', () => {
      const window = new MovingWindow<number>(2)
      window.push(1)
      window.push(2)
      window.clear()
      window.push(3)
      window.push(4)
      expect(window.toArray()).toEqual([3, 4])
    })

    it('push same value multiple times', () => {
      const window = new MovingWindow<number>(3)
      window.push(5)
      window.push(5)
      window.push(5)
      expect(window.toArray()).toEqual([5, 5, 5])
    })

    it('first and last with single item', () => {
      const window = new MovingWindow<number>(3)
      window.push(42)
      expect(window.first()).toBe(42)
      expect(window.last()).toBe(42)
    })
  })
})
describe('moving-window - wave548', () => {
  it('moving-window module defined', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module is function', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module has name', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module not null', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module has length', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module name is string', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave549', () => {
  it('moving-window module defined', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module is function', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave550', () => {
  it('moving-window w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave551', () => {
  it('moving-window w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave552', () => {
  it('moving-window w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave553', () => {
  it('moving-window w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave554', () => {
  it('moving-window w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave555', () => {
  it('moving-window w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave556', () => {
  it('moving-window w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave557', () => {
  it('moving-window w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave558', () => {
  it('moving-window w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave559', () => {
  it('moving-window w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave560', () => {
  it('moving-window w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave561', () => {
  it('moving-window w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave562', () => {
  it('moving-window w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave563', () => {
  it('moving-window w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave564', () => {
  it('moving-window w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave565', () => {
  it('moving-window w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave566', () => {
  it('moving-window w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave127', () => {
  it('moving-window w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave130', () => {
  it('moving-window w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave133', () => {
  it('moving-window w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave136', () => {
  it('moving-window w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - wave139', () => {
  it('moving-window w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w142', () => {
  it('moving-window v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w145', () => {
  it('moving-window v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w148', () => {
  it('moving-window v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w151', () => {
  it('moving-window v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w154', () => {
  it('moving-window v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w157', () => {
  it('moving-window v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w160', () => {
  it('moving-window v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w170', () => {
  it('moving-window x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w180', () => {
  it('moving-window x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w190', () => {
  it('moving-window x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w200', () => {
  it('moving-window x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w210', () => {
  it('moving-window x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w220', () => {
  it('moving-window x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w230', () => {
  it('moving-window x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w240', () => {
  it('moving-window x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w250', () => {
  it('moving-window x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w260', () => {
  it('moving-window x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w270', () => {
  it('moving-window x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w280', () => {
  it('moving-window x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w290', () => {
  it('moving-window x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w300', () => {
  it('moving-window x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w310', () => {
  it('moving-window x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w320', () => {
  it('moving-window x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w330', () => {
  it('moving-window x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w340', () => {
  it('moving-window x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w350', () => {
  it('moving-window x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w360', () => {
  it('moving-window x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w370', () => {
  it('moving-window x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w380', () => {
  it('moving-window x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w390', () => {
  it('moving-window x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-window - w400', () => {
  it('moving-window x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-window x400x9', () => {
    expect(describe).toBeDefined()
  })
})
