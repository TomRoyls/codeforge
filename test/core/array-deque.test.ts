import { describe, it, expect } from 'vitest'
import { ArrayDeque } from '../../src/core/array-deque/index.js'

describe('ArrayDeque - Construction', () => {
  it('creates empty deque with default capacity', () => {
    const d = new ArrayDeque<number>()
    expect(d.size).toBe(0)
    expect(d.isEmpty).toBe(true)
    expect(d.capacity).toBe(16)
  })

  it('creates deque with custom initial capacity', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 32 })
    expect(d.capacity).toBe(32)
    expect(d.size).toBe(0)
  })

  it('clamps initial capacity to minimum of 1', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 0 })
    expect(d.capacity).toBe(1)
  })

  it('creates deque with negative initial capacity', () => {
    const d = new ArrayDeque<number>({ initialCapacity: -5 })
    expect(d.capacity).toBe(1)
  })

  it('creates deque with initial capacity of 1', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 1 })
    expect(d.capacity).toBe(1)
  })

  it('creates deque with no options', () => {
    const d = new ArrayDeque<string>()
    expect(d.isEmpty).toBe(true)
    expect(d.capacity).toBe(16)
  })
})

describe('ArrayDeque - pushBack', () => {
  it('pushes to back', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('maintains correct size after pushBack', () => {
    const d = new ArrayDeque<number>()
    expect(d.size).toBe(0)
    d.pushBack(1)
    expect(d.size).toBe(1)
    d.pushBack(2)
    expect(d.size).toBe(2)
  })

  it('pushBack updates back', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    expect(d.back()).toBe(1)
    d.pushBack(2)
    expect(d.back()).toBe(2)
  })

  it('pushBack updates front on first push', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(42)
    expect(d.front()).toBe(42)
  })

  it('multiple pushBack preserves order', () => {
    const d = new ArrayDeque<number>()
    for (let i = 0; i < 5; i++) {
      d.pushBack(i)
    }
    expect(d.toArray()).toEqual([0, 1, 2, 3, 4])
  })
})

describe('ArrayDeque - pushFront', () => {
  it('pushes to front', () => {
    const d = new ArrayDeque<number>()
    d.pushFront(1)
    d.pushFront(2)
    d.pushFront(3)
    expect(d.toArray()).toEqual([3, 2, 1])
  })

  it('pushFront updates front', () => {
    const d = new ArrayDeque<number>()
    d.pushFront(1)
    expect(d.front()).toBe(1)
    d.pushFront(2)
    expect(d.front()).toBe(2)
  })

  it('pushFront updates back on first push', () => {
    const d = new ArrayDeque<number>()
    d.pushFront(42)
    expect(d.back()).toBe(42)
  })

  it('mix of pushFront and pushBack', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(2)
    d.pushFront(1)
    d.pushBack(3)
    d.pushFront(0)
    expect(d.toArray()).toEqual([0, 1, 2, 3])
  })

  it('interleaved pushFront and pushBack', () => {
    const d = new ArrayDeque<number>()
    d.pushFront(3)
    d.pushBack(4)
    d.pushFront(2)
    d.pushBack(5)
    d.pushFront(1)
    expect(d.toArray()).toEqual([1, 2, 3, 4, 5])
  })
})

describe('ArrayDeque - popFront', () => {
  it('pops from front', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    expect(d.popFront()).toBe(1)
    expect(d.popFront()).toBe(2)
    expect(d.popFront()).toBe(3)
    expect(d.isEmpty).toBe(true)
  })

  it('throws on popFront from empty', () => {
    const d = new ArrayDeque<number>()
    expect(() => d.popFront()).toThrow(RangeError)
  })

  it('popFront decreases size', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    d.popFront()
    expect(d.size).toBe(1)
  })

  it('popFront after pushFront', () => {
    const d = new ArrayDeque<number>()
    d.pushFront(1)
    d.pushFront(2)
    expect(d.popFront()).toBe(2)
    expect(d.popFront()).toBe(1)
  })

  it('popFront returns correct value after wrap', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.pushBack(4)
    d.popFront()
    d.popFront()
    d.pushBack(5)
    expect(d.popFront()).toBe(3)
  })
})

describe('ArrayDeque - dequeue', () => {
  it('dequeue removes from front', () => {
    const d = new ArrayDeque<number>()
    d.enqueue(1)
    d.enqueue(2)
    d.enqueue(3)
    expect(d.dequeue()).toBe(1)
    expect(d.dequeue()).toBe(2)
    expect(d.dequeue()).toBe(3)
  })

  it('dequeue throws on empty', () => {
    const d = new ArrayDeque<number>()
    expect(() => d.dequeue()).toThrow(RangeError)
  })

  it('dequeue decreases size', () => {
    const d = new ArrayDeque<number>()
    d.enqueue(1)
    d.enqueue(2)
    d.dequeue()
    expect(d.size).toBe(1)
  })
})

describe('ArrayDeque - popBack', () => {
  it('pops from back', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    expect(d.popBack()).toBe(3)
    expect(d.popBack()).toBe(2)
    expect(d.popBack()).toBe(1)
    expect(d.isEmpty).toBe(true)
  })

  it('throws on popBack from empty', () => {
    const d = new ArrayDeque<number>()
    expect(() => d.popBack()).toThrow(RangeError)
  })

  it('popBack decreases size', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    d.popBack()
    expect(d.size).toBe(1)
  })

  it('popBack after pushFront', () => {
    const d = new ArrayDeque<number>()
    d.pushFront(1)
    d.pushFront(2)
    expect(d.popBack()).toBe(1)
    expect(d.popBack()).toBe(2)
  })
})

describe('ArrayDeque - enqueue', () => {
  it('enqueue adds to back', () => {
    const d = new ArrayDeque<number>()
    d.enqueue(1)
    d.enqueue(2)
    d.enqueue(3)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('enqueue increases size', () => {
    const d = new ArrayDeque<number>()
    d.enqueue(1)
    expect(d.size).toBe(1)
    d.enqueue(2)
    expect(d.size).toBe(2)
  })
})

describe('ArrayDeque - front', () => {
  it('returns front element', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    expect(d.front()).toBe(1)
    expect(d.size).toBe(2)
  })

  it('returns undefined on empty deque', () => {
    const d = new ArrayDeque<number>()
    expect(d.front()).toBeUndefined()
  })

  it('front after pushFront returns last pushed', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushFront(0)
    expect(d.front()).toBe(0)
  })
})

describe('ArrayDeque - back', () => {
  it('returns back element', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    expect(d.back()).toBe(2)
    expect(d.size).toBe(2)
  })

  it('returns undefined on empty deque', () => {
    const d = new ArrayDeque<number>()
    expect(d.back()).toBeUndefined()
  })

  it('back after pushFront returns first element', () => {
    const d = new ArrayDeque<number>()
    d.pushFront(1)
    d.pushFront(2)
    expect(d.back()).toBe(1)
  })
})

describe('ArrayDeque - peek', () => {
  it('peek returns front element', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    expect(d.peek()).toBe(1)
  })

  it('peek returns undefined on empty', () => {
    const d = new ArrayDeque<number>()
    expect(d.peek()).toBeUndefined()
  })

  it('peek does not modify deque', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(42)
    d.peek()
    expect(d.size).toBe(1)
    expect(d.front()).toBe(42)
  })
})

describe('ArrayDeque - get', () => {
  it('gets element at index', () => {
    const d = ArrayDeque.fromArray([10, 20, 30, 40])
    expect(d.get(0)).toBe(10)
    expect(d.get(1)).toBe(20)
    expect(d.get(2)).toBe(30)
    expect(d.get(3)).toBe(40)
  })

  it('get throws on negative index', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    expect(() => d.get(-1)).toThrow(RangeError)
  })

  it('get throws on index >= size', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    expect(() => d.get(3)).toThrow(RangeError)
  })

  it('get throws on empty deque', () => {
    const d = new ArrayDeque<number>()
    expect(() => d.get(0)).toThrow(RangeError)
  })

  it('get works after wrap', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.pushBack(4)
    d.popFront()
    d.popFront()
    d.pushBack(5)
    d.pushBack(6)
    expect(d.get(0)).toBe(3)
    expect(d.get(1)).toBe(4)
    expect(d.get(2)).toBe(5)
    expect(d.get(3)).toBe(6)
  })
})

describe('ArrayDeque - set', () => {
  it('sets element at index', () => {
    const d = ArrayDeque.fromArray([10, 20, 30])
    d.set(1, 99)
    expect(d.get(1)).toBe(99)
    expect(d.toArray()).toEqual([10, 99, 30])
  })

  it('set throws on negative index', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    expect(() => d.set(-1, 0)).toThrow(RangeError)
  })

  it('set throws on index >= size', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    expect(() => d.set(3, 0)).toThrow(RangeError)
  })

  it('set on first element', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    d.set(0, 99)
    expect(d.front()).toBe(99)
  })

  it('set on last element', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    d.set(2, 99)
    expect(d.back()).toBe(99)
  })

  it('set works after wrap', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.pushBack(4)
    d.popFront()
    d.pushBack(5)
    d.set(0, 99)
    expect(d.get(0)).toBe(99)
  })
})

describe('ArrayDeque - size', () => {
  it('size tracks elements', () => {
    const d = new ArrayDeque<number>()
    expect(d.size).toBe(0)
    d.pushBack(1)
    expect(d.size).toBe(1)
    d.pushFront(2)
    expect(d.size).toBe(2)
    d.popBack()
    expect(d.size).toBe(1)
    d.popFront()
    expect(d.size).toBe(0)
  })
})

describe('ArrayDeque - isEmpty', () => {
  it('isEmpty is correct', () => {
    const d = new ArrayDeque<number>()
    expect(d.isEmpty).toBe(true)
    d.pushBack(1)
    expect(d.isEmpty).toBe(false)
    d.popFront()
    expect(d.isEmpty).toBe(true)
  })

  it('isEmpty after clear', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    d.clear()
    expect(d.isEmpty).toBe(true)
  })
})

describe('ArrayDeque - capacity', () => {
  it('capacity getter returns current capacity', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 8 })
    expect(d.capacity).toBe(8)
  })
})

describe('ArrayDeque - clear', () => {
  it('clears the deque', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    d.clear()
    expect(d.size).toBe(0)
    expect(d.isEmpty).toBe(true)
    expect(d.toArray()).toEqual([])
  })

  it('clear preserves capacity', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    const cap = d.capacity
    d.clear()
    expect(d.capacity).toBe(cap)
  })

  it('clear on empty deque', () => {
    const d = new ArrayDeque<number>()
    d.clear()
    expect(d.isEmpty).toBe(true)
    expect(d.size).toBe(0)
  })

  it('can push after clear', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    d.clear()
    d.pushBack(4)
    expect(d.toArray()).toEqual([4])
  })
})

describe('ArrayDeque - toArray', () => {
  it('returns empty array for empty deque', () => {
    const d = new ArrayDeque<number>()
    expect(d.toArray()).toEqual([])
  })

  it('returns elements in order', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushFront(2)
    d.pushBack(3)
    expect(d.toArray()).toEqual([2, 1, 3])
  })

  it('toArray does not modify deque', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    d.toArray()
    expect(d.size).toBe(3)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('toArray returns new array each time', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    const a = d.toArray()
    const b = d.toArray()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

describe('ArrayDeque - forEach', () => {
  it('iterates all elements', () => {
    const d = ArrayDeque.fromArray([10, 20, 30])
    const result: number[] = []
    d.forEach((v, i) => result.push(v + i))
    expect(result).toEqual([10, 21, 32])
  })

  it('does not call on empty deque', () => {
    const d = new ArrayDeque<number>()
    let calls = 0
    d.forEach(() => calls++)
    expect(calls).toBe(0)
  })

  it('provides correct indices', () => {
    const d = ArrayDeque.fromArray([5, 6, 7, 8])
    const indices: number[] = []
    d.forEach((_, i) => indices.push(i))
    expect(indices).toEqual([0, 1, 2, 3])
  })

  it('visits elements in order after wrap', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.pushBack(4)
    d.popFront()
    d.popFront()
    d.pushBack(5)
    d.pushBack(6)
    const result: number[] = []
    d.forEach(v => result.push(v))
    expect(result).toEqual([3, 4, 5, 6])
  })

  it('single element forEach', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(42)
    const result: number[] = []
    d.forEach(v => result.push(v))
    expect(result).toEqual([42])
  })
})

describe('ArrayDeque - Symbol.iterator', () => {
  it('is iterable', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    const result = [...d]
    expect(result).toEqual([1, 2, 3])
  })

  it('works with for...of', () => {
    const d = ArrayDeque.fromArray([10, 20])
    const result: number[] = []
    for (const v of d) {
      result.push(v)
    }
    expect(result).toEqual([10, 20])
  })

  it('empty deque iteration', () => {
    const d = new ArrayDeque<number>()
    const result = [...d]
    expect(result).toEqual([])
  })

  it('spread works after wrapping', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.popFront()
    d.pushBack(4)
    expect([...d]).toEqual([2, 3, 4])
  })

  it('single element iteration', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(99)
    expect([...d]).toEqual([99])
  })

  it('works with destructuring', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    const [first, ...rest] = d
    expect(first).toBe(1)
    expect(rest).toEqual([2, 3])
  })
})

describe('ArrayDeque - fromArray', () => {
  it('creates deque from array', () => {
    const d = ArrayDeque.fromArray([5, 6, 7])
    expect(d.toArray()).toEqual([5, 6, 7])
    expect(d.size).toBe(3)
  })

  it('creates deque from empty array', () => {
    const d = ArrayDeque.fromArray([])
    expect(d.isEmpty).toBe(true)
  })

  it('has sufficient capacity', () => {
    const d = ArrayDeque.fromArray([1, 2, 3, 4, 5])
    expect(d.capacity).toBeGreaterThanOrEqual(5)
  })

  it('preserves order', () => {
    const arr = [10, 20, 30, 40, 50]
    const d = ArrayDeque.fromArray(arr)
    expect(d.toArray()).toEqual(arr)
  })
})

describe('ArrayDeque - resizing', () => {
  it('grows when capacity exceeded via pushBack', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 2 })
    d.pushBack(1)
    d.pushBack(2)
    expect(d.capacity).toBe(2)
    d.pushBack(3)
    expect(d.capacity).toBe(4)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('grows when capacity exceeded via pushFront', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 2 })
    d.pushFront(1)
    d.pushFront(2)
    expect(d.capacity).toBe(2)
    d.pushFront(3)
    expect(d.capacity).toBe(4)
    expect(d.toArray()).toEqual([3, 2, 1])
  })

  it('grows correctly with mixed operations', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushFront(0)
    d.pushBack(3)
    expect(d.capacity).toBe(4)
    d.pushBack(4)
    expect(d.capacity).toBe(8)
    expect(d.toArray()).toEqual([0, 1, 2, 3, 4])
  })

  it('handles multiple growth cycles', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 2 })
    for (let i = 0; i < 32; i++) {
      d.pushBack(i)
    }
    expect(d.size).toBe(32)
    expect(d.capacity).toBeGreaterThanOrEqual(32)
    for (let i = 0; i < 32; i++) {
      expect(d.get(i)).toBe(i)
    }
  })

  it('capacity doubles on each growth', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.pushBack(4)
    expect(d.capacity).toBe(4)
    d.pushBack(5)
    expect(d.capacity).toBe(8)
  })
})

describe('ArrayDeque - circular buffer wraparound', () => {
  it('popFront then pushBack wraps correctly', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.pushBack(4)
    d.popFront()
    d.popFront()
    d.pushBack(5)
    d.pushBack(6)
    expect(d.toArray()).toEqual([3, 4, 5, 6])
  })

  it('pushFront wraps correctly', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.pushBack(4)
    d.popBack()
    d.popBack()
    d.pushFront(0)
    d.pushFront(-1)
    expect(d.toArray()).toEqual([-1, 0, 1, 2])
  })

  it('correctly wraps and grows with pushFront then pushBack', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushFront(0)
    d.pushFront(-1)
    expect(d.capacity).toBe(4)
    expect(d.toArray()).toEqual([-1, 0, 1, 2])
    d.pushBack(3)
    expect(d.capacity).toBe(8)
    expect(d.toArray()).toEqual([-1, 0, 1, 2, 3])
  })

  it('full wrap cycle', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 3 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.popFront()
    d.popFront()
    d.popFront()
    d.pushBack(4)
    d.pushBack(5)
    expect(d.toArray()).toEqual([4, 5])
  })

  it('get and set work correctly after wrap', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(10)
    d.pushBack(20)
    d.pushBack(30)
    d.pushBack(40)
    d.popFront()
    d.popFront()
    d.pushBack(50)
    d.pushBack(60)
    expect(d.get(0)).toBe(30)
    expect(d.get(3)).toBe(60)
    d.set(1, 99)
    expect(d.get(1)).toBe(99)
    expect(d.toArray()).toEqual([30, 99, 50, 60])
  })

  it('front and back work after wrap', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.pushBack(4)
    d.popFront()
    d.popFront()
    d.pushBack(5)
    expect(d.front()).toBe(3)
    expect(d.back()).toBe(5)
  })
})

describe('ArrayDeque - edge cases', () => {
  it('push and pop single element repeatedly', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 2 })
    for (let i = 0; i < 100; i++) {
      d.pushBack(i)
      expect(d.popBack()).toBe(i)
      expect(d.isEmpty).toBe(true)
    }
  })

  it('pushFront and popFront single element repeatedly', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 2 })
    for (let i = 0; i < 100; i++) {
      d.pushFront(i)
      expect(d.popFront()).toBe(i)
      expect(d.isEmpty).toBe(true)
    }
  })

  it('alternating pushFront and popBack', () => {
    const d = new ArrayDeque<number>()
    d.pushFront(1)
    d.pushFront(2)
    expect(d.popBack()).toBe(1)
    expect(d.popBack()).toBe(2)
  })

  it('alternating pushBack and popFront', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    expect(d.popFront()).toBe(1)
    expect(d.popFront()).toBe(2)
  })

  it('works with strings', () => {
    const d = ArrayDeque.fromArray(['hello', 'world'])
    expect(d.toArray()).toEqual(['hello', 'world'])
    d.pushFront('foo')
    expect(d.front()).toBe('foo')
  })

  it('works with objects', () => {
    const d = new ArrayDeque<{ x: number }>()
    d.pushBack({ x: 1 })
    d.pushBack({ x: 2 })
    expect(d.get(0)!.x).toBe(1)
    expect(d.get(1)!.x).toBe(2)
  })

  it('works with null values', () => {
    const d = new ArrayDeque<number | null>()
    d.pushBack(1)
    d.pushBack(null)
    d.pushBack(3)
    expect(d.size).toBe(3)
    expect(d.get(1)).toBeNull()
  })

  it('works with undefined values', () => {
    const d = new ArrayDeque<number | undefined>()
    d.pushBack(1)
    d.pushBack(undefined)
    d.pushBack(3)
    expect(d.size).toBe(3)
    expect(d.get(1)).toBeUndefined()
  })

  it('pushBack popFront cycle creates queue behavior', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    expect(d.popFront()).toBe(1)
    d.pushBack(4)
    expect(d.popFront()).toBe(2)
    expect(d.toArray()).toEqual([3, 4])
  })

  it('pushFront popBack cycle creates reverse queue', () => {
    const d = new ArrayDeque<number>()
    d.pushFront(1)
    d.pushFront(2)
    d.pushFront(3)
    expect(d.popBack()).toBe(1)
    d.pushFront(4)
    expect(d.popBack()).toBe(2)
    expect(d.toArray()).toEqual([4, 3])
  })

  it('single element edge case', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(42)
    expect(d.front()).toBe(42)
    expect(d.back()).toBe(42)
    expect(d.get(0)).toBe(42)
    expect(d.size).toBe(1)
    expect(d.isEmpty).toBe(false)
    expect(d.toArray()).toEqual([42])
  })

  it('pop all then push more', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 2 })
    d.pushBack(1)
    d.pushBack(2)
    d.popFront()
    d.popFront()
    expect(d.isEmpty).toBe(true)
    d.pushBack(3)
    d.pushBack(4)
    expect(d.toArray()).toEqual([3, 4])
  })
})

describe('ArrayDeque - large inputs', () => {
  it('handles 10000 pushBack operations', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 16 })
    for (let i = 0; i < 10000; i++) {
      d.pushBack(i)
    }
    expect(d.size).toBe(10000)
    expect(d.get(0)).toBe(0)
    expect(d.get(9999)).toBe(9999)
  })

  it('handles 10000 pushFront operations', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 16 })
    for (let i = 0; i < 10000; i++) {
      d.pushFront(i)
    }
    expect(d.size).toBe(10000)
    expect(d.get(0)).toBe(9999)
    expect(d.get(9999)).toBe(0)
  })

  it('handles mixed push/pop with growth', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 2 })
    for (let i = 0; i < 1000; i++) {
      d.pushBack(i)
    }
    for (let i = 0; i < 500; i++) {
      expect(d.popFront()).toBe(i)
    }
    expect(d.size).toBe(500)
    expect(d.get(0)).toBe(500)
  })

  it('toArray on large deque', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)
    const d = ArrayDeque.fromArray(arr)
    expect(d.toArray()).toEqual(arr)
  })

  it('forEach on large deque', () => {
    const d = ArrayDeque.fromArray(Array.from({ length: 1000 }, (_, i) => i))
    let sum = 0
    d.forEach(v => sum += v)
    expect(sum).toBe(499500)
  })

  it('iteration on large deque', () => {
    const d = ArrayDeque.fromArray(Array.from({ length: 1000 }, (_, i) => i))
    let count = 0
    for (const _ of d) {
      count++
    }
    expect(count).toBe(1000)
  })

  it('get on large deque', () => {
    const d = ArrayDeque.fromArray(Array.from({ length: 100 }, (_, i) => i))
    expect(d.get(50)).toBe(50)
  })

  it('set on large deque', () => {
    const d = ArrayDeque.fromArray(Array.from({ length: 100 }, (_, i) => i))
    d.set(50, 999)
    expect(d.get(50)).toBe(999)
  })

  it('pushFront large then popBack all', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 16 })
    for (let i = 0; i < 1000; i++) {
      d.pushFront(i)
    }
    for (let i = 0; i < 1000; i++) {
      expect(d.popBack()).toBe(i)
    }
    expect(d.isEmpty).toBe(true)
  })

  it('pushBack large then popFront all', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 16 })
    for (let i = 0; i < 1000; i++) {
      d.pushBack(i)
    }
    for (let i = 0; i < 1000; i++) {
      expect(d.popFront()).toBe(i)
    }
    expect(d.isEmpty).toBe(true)
  })
})

describe('ArrayDeque - queue semantics', () => {
  it('enqueue/dequeue FIFO order', () => {
    const d = new ArrayDeque<string>()
    d.enqueue('a')
    d.enqueue('b')
    d.enqueue('c')
    expect(d.dequeue()).toBe('a')
    expect(d.dequeue()).toBe('b')
    expect(d.dequeue()).toBe('c')
  })

  it('peek shows next dequeue item', () => {
    const d = new ArrayDeque<number>()
    d.enqueue(10)
    d.enqueue(20)
    expect(d.peek()).toBe(10)
    d.dequeue()
    expect(d.peek()).toBe(20)
  })

  it('peek on empty returns undefined', () => {
    const d = new ArrayDeque<number>()
    expect(d.peek()).toBeUndefined()
  })

  it('interleaved enqueue and dequeue', () => {
    const d = new ArrayDeque<number>()
    d.enqueue(1)
    d.enqueue(2)
    expect(d.dequeue()).toBe(1)
    d.enqueue(3)
    expect(d.dequeue()).toBe(2)
    expect(d.dequeue()).toBe(3)
    expect(d.isEmpty).toBe(true)
  })
})

describe('ArrayDeque - type safety', () => {
  it('works with number type', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    expect(d.popFront() + d.popFront()).toBe(3)
  })

  it('works with string type', () => {
    const d = new ArrayDeque<string>()
    d.pushBack('a')
    d.pushBack('b')
    expect(d.popFront() + d.popFront()).toBe('ab')
  })

  it('works with boolean type', () => {
    const d = new ArrayDeque<boolean>()
    d.pushBack(true)
    d.pushBack(false)
    expect(d.toArray()).toEqual([true, false])
  })

  it('works with generic objects', () => {
    const d = new ArrayDeque<{ id: number; name: string }>()
    d.pushBack({ id: 1, name: 'a' })
    d.pushBack({ id: 2, name: 'b' })
    expect(d.get(0)!.name).toBe('a')
    expect(d.get(1)!.id).toBe(2)
  })
})

describe('ArrayDeque - stress tests', () => {
  it('rapid push/pop cycle', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    for (let i = 0; i < 500; i++) {
      d.pushBack(i)
      if (i % 3 === 0 && d.size > 0) {
        d.popFront()
      }
    }
    expect(d.size).toBeGreaterThan(0)
  })

  it('alternating front and back operations', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    for (let i = 0; i < 200; i++) {
      if (i % 2 === 0) {
        d.pushFront(i)
      } else {
        d.pushBack(i)
      }
    }
    expect(d.size).toBe(200)
    expect(d.front()).toBe(198)
    expect(d.back()).toBe(199)
  })

  it('drain and refill', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    for (let round = 0; round < 10; round++) {
      for (let i = 0; i < 50; i++) {
        d.pushBack(round * 50 + i)
      }
      while (!d.isEmpty) {
        d.popFront()
      }
    }
    expect(d.isEmpty).toBe(true)
  })

  it('wrap with many popFront and pushBack', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 8 })
    for (let i = 0; i < 20; i++) {
      d.pushBack(i)
    }
    for (let i = 0; i < 15; i++) {
      d.popFront()
    }
    for (let i = 20; i < 30; i++) {
      d.pushBack(i)
    }
    expect(d.size).toBe(15)
    expect(d.front()).toBe(15)
    expect(d.back()).toBe(29)
  })
})

describe('ArrayDeque - additional resize tests', () => {
  it('resize preserves order with pushFront only', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushFront(4)
    d.pushFront(3)
    d.pushFront(2)
    d.pushFront(1)
    d.pushFront(0)
    expect(d.toArray()).toEqual([0, 1, 2, 3, 4])
  })

  it('resize after mixed pushFront and popBack', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.popFront()
    d.pushFront(0)
    d.pushFront(-1)
    d.pushFront(-2)
    expect(d.toArray()).toEqual([-2, -1, 0, 2, 3])
  })

  it('capacity 1 resize', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 1 })
    d.pushBack(1)
    expect(d.capacity).toBe(1)
    d.pushBack(2)
    expect(d.capacity).toBe(2)
    d.pushBack(3)
    expect(d.capacity).toBe(4)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('multiple resizes with get verify', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 2 })
    for (let i = 0; i < 64; i++) {
      d.pushBack(i)
    }
    expect(d.size).toBe(64)
    expect(d.get(0)).toBe(0)
    expect(d.get(32)).toBe(32)
    expect(d.get(63)).toBe(63)
  })

  it('resize after popBack frees space', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 2 })
    d.pushBack(1)
    d.pushBack(2)
    d.popBack()
    d.pushBack(3)
    d.pushBack(4)
    expect(d.toArray()).toEqual([1, 3, 4])
  })
})

describe('ArrayDeque - forEach edge cases', () => {
  it('forEach with mutation through set', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    d.forEach((_, i) => d.set(i, d.get(i) * 2))
    expect(d.toArray()).toEqual([2, 4, 6])
  })

  it('forEach captures correct values', () => {
    const d = ArrayDeque.fromArray([10, 20, 30, 40, 50])
    const result: string[] = []
    d.forEach((v, i) => result.push(`${i}:${v}`))
    expect(result).toEqual(['0:10', '1:20', '2:30', '3:40', '4:50'])
  })

  it('forEach on single element', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(99)
    let count = 0
    d.forEach(v => {
      expect(v).toBe(99)
      count++
    })
    expect(count).toBe(1)
  })
})

describe('ArrayDeque - iterator edge cases', () => {
  it('iterator after partial drain', () => {
    const d = ArrayDeque.fromArray([1, 2, 3, 4, 5])
    d.popFront()
    d.popFront()
    expect([...d]).toEqual([3, 4, 5])
  })

  it('iterator after partial drain from back', () => {
    const d = ArrayDeque.fromArray([1, 2, 3, 4, 5])
    d.popBack()
    d.popBack()
    expect([...d]).toEqual([1, 2, 3])
  })

  it('iterator with Array.from', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    expect(Array.from(d)).toEqual([1, 2, 3])
  })

  it('iterator with reduce', () => {
    const d = ArrayDeque.fromArray([1, 2, 3, 4])
    const sum = [...d].reduce((a, b) => a + b, 0)
    expect(sum).toBe(10)
  })

  it('iterator with filter', () => {
    const d = ArrayDeque.fromArray([1, 2, 3, 4, 5])
    const evens = [...d].filter(v => v % 2 === 0)
    expect(evens).toEqual([2, 4])
  })

  it('iterator with map', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    const doubled = [...d].map(v => v * 2)
    expect(doubled).toEqual([2, 4, 6])
  })
})

describe('ArrayDeque - toArray edge cases', () => {
  it('toArray after wrap and growth', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.pushBack(4)
    d.popFront()
    d.popFront()
    d.pushBack(5)
    d.pushBack(6)
    d.pushBack(7)
    expect(d.toArray()).toEqual([3, 4, 5, 6, 7])
  })

  it('toArray preserves reference types', () => {
    const obj = { x: 1 }
    const d = new ArrayDeque<{ x: number }>()
    d.pushBack(obj)
    expect(d.toArray()[0]).toBe(obj)
  })

  it('toArray with mixed pushFront pushBack', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(3)
    d.pushFront(2)
    d.pushBack(4)
    d.pushFront(1)
    expect(d.toArray()).toEqual([1, 2, 3, 4])
  })
})

describe('ArrayDeque - clear edge cases', () => {
  it('clear then pushFront works', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    d.clear()
    d.pushFront(4)
    expect(d.toArray()).toEqual([4])
    expect(d.front()).toBe(4)
    expect(d.back()).toBe(4)
  })

  it('clear then fromArray works', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    d.clear()
    const d2 = ArrayDeque.fromArray([4, 5])
    expect(d2.toArray()).toEqual([4, 5])
  })

  it('multiple clears in a row', () => {
    const d = ArrayDeque.fromArray([1, 2, 3])
    d.clear()
    d.clear()
    d.clear()
    expect(d.isEmpty).toBe(true)
    expect(d.size).toBe(0)
  })
})

describe('ArrayDeque - fromArray edge cases', () => {
  it('fromArray with single element', () => {
    const d = ArrayDeque.fromArray([42])
    expect(d.size).toBe(1)
    expect(d.front()).toBe(42)
    expect(d.back()).toBe(42)
  })

  it('fromArray with objects', () => {
    const d = ArrayDeque.fromArray([{ x: 1 }, { x: 2 }])
    expect(d.get(0)!.x).toBe(1)
    expect(d.get(1)!.x).toBe(2)
  })

  it('fromArray with capacity check for small arrays', () => {
    const d = ArrayDeque.fromArray([1])
    expect(d.capacity).toBeGreaterThanOrEqual(1)
  })

  it('fromArray creates independent copy', () => {
    const arr = [1, 2, 3]
    const d = ArrayDeque.fromArray(arr)
    arr.push(4)
    expect(d.size).toBe(3)
  })
})

describe('ArrayDeque - mixed operations', () => {
  it('stack behavior with pushBack and popBack', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    expect(d.popBack()).toBe(3)
    expect(d.popBack()).toBe(2)
    expect(d.popBack()).toBe(1)
  })

  it('stack behavior with pushFront and popFront', () => {
    const d = new ArrayDeque<number>()
    d.pushFront(1)
    d.pushFront(2)
    d.pushFront(3)
    expect(d.popFront()).toBe(3)
    expect(d.popFront()).toBe(2)
    expect(d.popFront()).toBe(1)
  })

  it('mixed push and pop from both ends', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(1)
    d.pushFront(0)
    d.pushBack(2)
    d.pushFront(-1)
    expect(d.toArray()).toEqual([-1, 0, 1, 2])
    expect(d.popFront()).toBe(-1)
    expect(d.popBack()).toBe(2)
    expect(d.toArray()).toEqual([0, 1])
  })

  it('size consistency through many operations', () => {
    const d = new ArrayDeque<number>({ initialCapacity: 4 })
    let expected = 0
    for (let i = 0; i < 50; i++) {
      d.pushBack(i)
      expected++
      if (i % 3 === 0) {
        d.popFront()
        expected--
      }
      expect(d.size).toBe(expected)
    }
  })

  it('front and back consistency', () => {
    const d = new ArrayDeque<number>()
    d.pushBack(10)
    d.pushBack(20)
    d.pushBack(30)
    expect(d.front()).toBe(d.get(0))
    expect(d.back()).toBe(d.get(d.size - 1))
    d.pushFront(5)
    expect(d.front()).toBe(d.get(0))
    expect(d.back()).toBe(d.get(d.size - 1))
  })

  it('get sequential access pattern', () => {
    const d = ArrayDeque.fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    for (let i = 0; i < 10; i++) {
      expect(d.get(i)).toBe(i)
    }
  })

  it('set then get round trip', () => {
    const d = ArrayDeque.fromArray([0, 0, 0, 0, 0])
    for (let i = 0; i < 5; i++) {
      d.set(i, i * 10)
    }
    for (let i = 0; i < 5; i++) {
      expect(d.get(i)).toBe(i * 10)
    }
  })

  it('peek is consistent with front', () => {
    const d = new ArrayDeque<number>()
    d.enqueue(1)
    d.enqueue(2)
    d.enqueue(3)
    expect(d.peek()).toBe(d.front())
    d.dequeue()
    expect(d.peek()).toBe(d.front())
  })
})
