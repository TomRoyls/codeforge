import { describe, it, expect } from 'vitest'
import { Deque2 } from '../../src/core/deque-2/index.js'

describe('Deque2 - Construction', () => {
  it('creates empty deque with default capacity', () => {
    const d = new Deque2<number>()
    expect(d.size).toBe(0)
    expect(d.isEmpty).toBe(true)
    expect(d.capacity).toBe(16)
  })

  it('creates deque with custom initial capacity', () => {
    const d = new Deque2<number>({ initialCapacity: 32 })
    expect(d.capacity).toBe(32)
    expect(d.size).toBe(0)
  })

  it('clamps initial capacity to minimum of 1', () => {
    const d = new Deque2<number>({ initialCapacity: 0 })
    expect(d.capacity).toBe(1)
  })

  it('creates deque with negative initial capacity', () => {
    const d = new Deque2<number>({ initialCapacity: -5 })
    expect(d.capacity).toBe(1)
  })

  it('creates deque with initial capacity of 1', () => {
    const d = new Deque2<number>({ initialCapacity: 1 })
    expect(d.capacity).toBe(1)
  })
})

describe('Deque2 - pushBack / push', () => {
  it('pushes to back', () => {
    const d = new Deque2<number>()
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('push alias works', () => {
    const d = new Deque2<number>()
    d.push(10)
    d.push(20)
    expect(d.toArray()).toEqual([10, 20])
  })

  it('maintains correct size after pushBack', () => {
    const d = new Deque2<number>()
    expect(d.size).toBe(0)
    d.pushBack(1)
    expect(d.size).toBe(1)
    d.pushBack(2)
    expect(d.size).toBe(2)
  })
})

describe('Deque2 - pushFront / unshift', () => {
  it('pushes to front', () => {
    const d = new Deque2<number>()
    d.pushFront(1)
    d.pushFront(2)
    d.pushFront(3)
    expect(d.toArray()).toEqual([3, 2, 1])
  })

  it('unshift alias works', () => {
    const d = new Deque2<number>()
    d.unshift(10)
    d.unshift(20)
    expect(d.toArray()).toEqual([20, 10])
  })

  it('mix of pushFront and pushBack', () => {
    const d = new Deque2<number>()
    d.pushBack(2)
    d.pushFront(1)
    d.pushBack(3)
    d.pushFront(0)
    expect(d.toArray()).toEqual([0, 1, 2, 3])
  })
})

describe('Deque2 - popBack / pop', () => {
  it('pops from back', () => {
    const d = new Deque2<number>()
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    expect(d.popBack()).toBe(3)
    expect(d.popBack()).toBe(2)
    expect(d.popBack()).toBe(1)
    expect(d.isEmpty).toBe(true)
  })

  it('pop alias works', () => {
    const d = new Deque2<number>()
    d.pushBack(42)
    expect(d.pop()).toBe(42)
  })

  it('throws on popBack from empty', () => {
    const d = new Deque2<number>()
    expect(() => d.popBack()).toThrow(RangeError)
  })
})

describe('Deque2 - popFront / shift', () => {
  it('pops from front', () => {
    const d = new Deque2<number>()
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    expect(d.popFront()).toBe(1)
    expect(d.popFront()).toBe(2)
    expect(d.popFront()).toBe(3)
    expect(d.isEmpty).toBe(true)
  })

  it('shift alias works', () => {
    const d = new Deque2<number>()
    d.pushBack(42)
    expect(d.shift()).toBe(42)
  })

  it('throws on popFront from empty', () => {
    const d = new Deque2<number>()
    expect(() => d.popFront()).toThrow(RangeError)
  })
})

describe('Deque2 - peekFront / front', () => {
  it('peeks front element', () => {
    const d = new Deque2<number>()
    d.pushBack(1)
    d.pushBack(2)
    expect(d.peekFront()).toBe(1)
    expect(d.size).toBe(2)
  })

  it('front alias works', () => {
    const d = new Deque2<number>()
    d.pushBack(99)
    expect(d.front()).toBe(99)
  })

  it('returns undefined on empty deque', () => {
    const d = new Deque2<number>()
    expect(d.peekFront()).toBeUndefined()
    expect(d.front()).toBeUndefined()
  })
})

describe('Deque2 - peekBack / back', () => {
  it('peeks back element', () => {
    const d = new Deque2<number>()
    d.pushBack(1)
    d.pushBack(2)
    expect(d.peekBack()).toBe(2)
    expect(d.size).toBe(2)
  })

  it('back alias works', () => {
    const d = new Deque2<number>()
    d.pushBack(99)
    expect(d.back()).toBe(99)
  })

  it('returns undefined on empty deque', () => {
    const d = new Deque2<number>()
    expect(d.peekBack()).toBeUndefined()
    expect(d.back()).toBeUndefined()
  })
})

describe('Deque2 - get / set', () => {
  it('gets element at index', () => {
    const d = Deque2.fromArray([10, 20, 30, 40])
    expect(d.get(0)).toBe(10)
    expect(d.get(1)).toBe(20)
    expect(d.get(2)).toBe(30)
    expect(d.get(3)).toBe(40)
  })

  it('sets element at index', () => {
    const d = Deque2.fromArray([10, 20, 30])
    d.set(1, 99)
    expect(d.get(1)).toBe(99)
    expect(d.toArray()).toEqual([10, 99, 30])
  })

  it('get throws on out of bounds', () => {
    const d = Deque2.fromArray([1, 2, 3])
    expect(() => d.get(-1)).toThrow(RangeError)
    expect(() => d.get(3)).toThrow(RangeError)
  })

  it('set throws on out of bounds', () => {
    const d = Deque2.fromArray([1, 2, 3])
    expect(() => d.set(-1, 0)).toThrow(RangeError)
    expect(() => d.set(3, 0)).toThrow(RangeError)
  })
})

describe('Deque2 - size / isEmpty', () => {
  it('size tracks elements', () => {
    const d = new Deque2<number>()
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

  it('isEmpty is correct', () => {
    const d = new Deque2<number>()
    expect(d.isEmpty).toBe(true)
    d.pushBack(1)
    expect(d.isEmpty).toBe(false)
    d.popFront()
    expect(d.isEmpty).toBe(true)
  })
})

describe('Deque2 - clear', () => {
  it('clears the deque', () => {
    const d = Deque2.fromArray([1, 2, 3])
    d.clear()
    expect(d.size).toBe(0)
    expect(d.isEmpty).toBe(true)
    expect(d.toArray()).toEqual([])
  })

  it('clear preserves capacity', () => {
    const d = Deque2.fromArray([1, 2, 3])
    const cap = d.capacity
    d.clear()
    expect(d.capacity).toBe(cap)
  })
})

describe('Deque2 - toArray', () => {
  it('returns empty array for empty deque', () => {
    const d = new Deque2<number>()
    expect(d.toArray()).toEqual([])
  })

  it('returns elements in order', () => {
    const d = new Deque2<number>()
    d.pushBack(1)
    d.pushFront(2)
    d.pushBack(3)
    expect(d.toArray()).toEqual([2, 1, 3])
  })
})

describe('Deque2 - clone', () => {
  it('clones the deque', () => {
    const d = Deque2.fromArray([1, 2, 3])
    const c = d.clone()
    expect(c.toArray()).toEqual([1, 2, 3])
    expect(c.size).toBe(3)
  })

  it('clone is independent', () => {
    const d = Deque2.fromArray([1, 2, 3])
    const c = d.clone()
    d.set(0, 99)
    expect(c.get(0)).toBe(1)
    expect(d.get(0)).toBe(99)
  })

  it('clone empty deque', () => {
    const d = new Deque2<number>()
    const c = d.clone()
    expect(c.isEmpty).toBe(true)
  })
})

describe('Deque2 - fromArray', () => {
  it('creates deque from array', () => {
    const d = Deque2.fromArray([5, 6, 7])
    expect(d.toArray()).toEqual([5, 6, 7])
    expect(d.size).toBe(3)
  })

  it('creates deque from empty array', () => {
    const d = Deque2.fromArray([])
    expect(d.isEmpty).toBe(true)
  })

  it('has sufficient capacity', () => {
    const d = Deque2.fromArray([1, 2, 3, 4, 5])
    expect(d.capacity).toBeGreaterThanOrEqual(5)
  })
})

describe('Deque2 - forEach', () => {
  it('iterates all elements', () => {
    const d = Deque2.fromArray([10, 20, 30])
    const result: number[] = []
    d.forEach((v, i) => result.push(v + i))
    expect(result).toEqual([10, 21, 32])
  })

  it('does not call on empty deque', () => {
    const d = new Deque2<number>()
    let calls = 0
    d.forEach(() => calls++)
    expect(calls).toBe(0)
  })
})

describe('Deque2 - Symbol.iterator', () => {
  it('is iterable', () => {
    const d = Deque2.fromArray([1, 2, 3])
    const result = [...d]
    expect(result).toEqual([1, 2, 3])
  })

  it('works with for...of', () => {
    const d = Deque2.fromArray([10, 20])
    const result: number[] = []
    for (const v of d) {
      result.push(v)
    }
    expect(result).toEqual([10, 20])
  })
})

describe('Deque2 - indexOf / contains', () => {
  it('finds index of element', () => {
    const d = Deque2.fromArray([10, 20, 30])
    expect(d.indexOf(20)).toBe(1)
    expect(d.indexOf(10)).toBe(0)
    expect(d.indexOf(30)).toBe(2)
  })

  it('returns -1 for not found', () => {
    const d = Deque2.fromArray([1, 2, 3])
    expect(d.indexOf(99)).toBe(-1)
  })

  it('contains returns boolean', () => {
    const d = Deque2.fromArray([1, 2, 3])
    expect(d.contains(2)).toBe(true)
    expect(d.contains(5)).toBe(false)
  })

  it('indexOf uses strict equality', () => {
    const d = Deque2.fromArray(['a', 'b', 'c'])
    expect(d.indexOf('b')).toBe(1)
    expect(d.indexOf('d')).toBe(-1)
  })
})

describe('Deque2 - insertAt', () => {
  it('inserts at beginning', () => {
    const d = Deque2.fromArray([2, 3])
    d.insertAt(0, 1)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('inserts at end', () => {
    const d = Deque2.fromArray([1, 2])
    d.insertAt(2, 3)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('inserts in middle', () => {
    const d = Deque2.fromArray([1, 3])
    d.insertAt(1, 2)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('throws on invalid index', () => {
    const d = Deque2.fromArray([1])
    expect(() => d.insertAt(-1, 0)).toThrow(RangeError)
    expect(() => d.insertAt(2, 0)).toThrow(RangeError)
  })

  it('inserts at index in larger deque (front shift)', () => {
    const d = Deque2.fromArray([1, 2, 3, 4, 5])
    d.insertAt(1, 99)
    expect(d.toArray()).toEqual([1, 99, 2, 3, 4, 5])
  })

  it('inserts at index in larger deque (back shift)', () => {
    const d = Deque2.fromArray([1, 2, 3, 4, 5])
    d.insertAt(4, 99)
    expect(d.toArray()).toEqual([1, 2, 3, 4, 99, 5])
  })

  it('can insert into empty deque at index 0', () => {
    const d = new Deque2<number>()
    d.insertAt(0, 42)
    expect(d.toArray()).toEqual([42])
  })
})

describe('Deque2 - removeAt', () => {
  it('removes from front', () => {
    const d = Deque2.fromArray([1, 2, 3])
    expect(d.removeAt(0)).toBe(1)
    expect(d.toArray()).toEqual([2, 3])
  })

  it('removes from back', () => {
    const d = Deque2.fromArray([1, 2, 3])
    expect(d.removeAt(2)).toBe(3)
    expect(d.toArray()).toEqual([1, 2])
  })

  it('removes from middle', () => {
    const d = Deque2.fromArray([1, 2, 3])
    expect(d.removeAt(1)).toBe(2)
    expect(d.toArray()).toEqual([1, 3])
  })

  it('throws on invalid index', () => {
    const d = Deque2.fromArray([1])
    expect(() => d.removeAt(-1)).toThrow(RangeError)
    expect(() => d.removeAt(1)).toThrow(RangeError)
  })

  it('removes using front shift for front-half elements', () => {
    const d = Deque2.fromArray([10, 20, 30, 40, 50])
    expect(d.removeAt(1)).toBe(20)
    expect(d.toArray()).toEqual([10, 30, 40, 50])
  })

  it('removes using back shift for back-half elements', () => {
    const d = Deque2.fromArray([10, 20, 30, 40, 50])
    expect(d.removeAt(3)).toBe(40)
    expect(d.toArray()).toEqual([10, 20, 30, 50])
  })
})

describe('Deque2 - rotate', () => {
  it('rotates right by positive n', () => {
    const d = Deque2.fromArray([1, 2, 3, 4, 5])
    d.rotate(2)
    expect(d.toArray()).toEqual([3, 4, 5, 1, 2])
  })

  it('rotates left by negative n', () => {
    const d = Deque2.fromArray([1, 2, 3, 4, 5])
    d.rotate(-2)
    expect(d.toArray()).toEqual([4, 5, 1, 2, 3])
  })

  it('no-op on rotate 0', () => {
    const d = Deque2.fromArray([1, 2, 3])
    d.rotate(0)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('no-op on rotate by size', () => {
    const d = Deque2.fromArray([1, 2, 3])
    d.rotate(3)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('no-op on empty deque', () => {
    const d = new Deque2<number>()
    d.rotate(5)
    expect(d.isEmpty).toBe(true)
  })

  it('no-op on single element deque', () => {
    const d = Deque2.fromArray([42])
    d.rotate(1)
    expect(d.toArray()).toEqual([42])
  })

  it('handles n > size', () => {
    const d = Deque2.fromArray([1, 2, 3])
    d.rotate(7)
    expect(d.toArray()).toEqual([2, 3, 1])
  })

  it('handles large negative n', () => {
    const d = Deque2.fromArray([1, 2, 3])
    d.rotate(-5)
    expect(d.toArray()).toEqual([2, 3, 1])
  })
})

describe('Deque2 - reverse', () => {
  it('reverses in place', () => {
    const d = Deque2.fromArray([1, 2, 3, 4])
    d.reverse()
    expect(d.toArray()).toEqual([4, 3, 2, 1])
  })

  it('reverse single element', () => {
    const d = Deque2.fromArray([42])
    d.reverse()
    expect(d.toArray()).toEqual([42])
  })

  it('reverse two elements', () => {
    const d = Deque2.fromArray([1, 2])
    d.reverse()
    expect(d.toArray()).toEqual([2, 1])
  })

  it('reverse empty deque', () => {
    const d = new Deque2<number>()
    d.reverse()
    expect(d.isEmpty).toBe(true)
  })

  it('double reverse restores order', () => {
    const d = Deque2.fromArray([1, 2, 3])
    d.reverse()
    d.reverse()
    expect(d.toArray()).toEqual([1, 2, 3])
  })
})

describe('Deque2 - slice', () => {
  it('slices with start and end', () => {
    const d = Deque2.fromArray([1, 2, 3, 4, 5])
    const s = d.slice(1, 4)
    expect(s.toArray()).toEqual([2, 3, 4])
  })

  it('slices with only start', () => {
    const d = Deque2.fromArray([1, 2, 3, 4])
    const s = d.slice(2)
    expect(s.toArray()).toEqual([3, 4])
  })

  it('slices with no args', () => {
    const d = Deque2.fromArray([1, 2, 3])
    const s = d.slice()
    expect(s.toArray()).toEqual([1, 2, 3])
  })

  it('handles negative indices', () => {
    const d = Deque2.fromArray([1, 2, 3, 4, 5])
    const s = d.slice(-3, -1)
    expect(s.toArray()).toEqual([3, 4])
  })

  it('returns empty for invalid range', () => {
    const d = Deque2.fromArray([1, 2, 3])
    const s = d.slice(3, 5)
    expect(s.toArray()).toEqual([])
  })

  it('clamps end to size', () => {
    const d = Deque2.fromArray([1, 2, 3])
    const s = d.slice(0, 100)
    expect(s.toArray()).toEqual([1, 2, 3])
  })
})

describe('Deque2 - concat', () => {
  it('concatenates two deques', () => {
    const a = Deque2.fromArray([1, 2])
    const b = Deque2.fromArray([3, 4])
    const c = a.concat(b)
    expect(c.toArray()).toEqual([1, 2, 3, 4])
  })

  it('does not modify originals', () => {
    const a = Deque2.fromArray([1])
    const b = Deque2.fromArray([2])
    a.concat(b)
    expect(a.toArray()).toEqual([1])
    expect(b.toArray()).toEqual([2])
  })

  it('concat with empty deque', () => {
    const a = Deque2.fromArray([1, 2])
    const b = new Deque2<number>()
    const c = a.concat(b)
    expect(c.toArray()).toEqual([1, 2])
  })

  it('empty concat non-empty', () => {
    const a = new Deque2<number>()
    const b = Deque2.fromArray([1, 2])
    const c = a.concat(b)
    expect(c.toArray()).toEqual([1, 2])
  })
})

describe('Deque2 - filter', () => {
  it('filters elements', () => {
    const d = Deque2.fromArray([1, 2, 3, 4, 5])
    const f = d.filter(v => v % 2 === 0)
    expect(f.toArray()).toEqual([2, 4])
  })

  it('filters with index', () => {
    const d = Deque2.fromArray([10, 20, 30])
    const f = d.filter((_, i) => i !== 1)
    expect(f.toArray()).toEqual([10, 30])
  })

  it('returns empty when nothing matches', () => {
    const d = Deque2.fromArray([1, 3, 5])
    const f = d.filter(v => v % 2 === 0)
    expect(f.isEmpty).toBe(true)
  })

  it('returns all when all match', () => {
    const d = Deque2.fromArray([2, 4, 6])
    const f = d.filter(v => v % 2 === 0)
    expect(f.toArray()).toEqual([2, 4, 6])
  })
})

describe('Deque2 - map', () => {
  it('maps elements', () => {
    const d = Deque2.fromArray([1, 2, 3])
    const m = d.map(v => v * 2)
    expect(m.toArray()).toEqual([2, 4, 6])
  })

  it('map with index', () => {
    const d = Deque2.fromArray([10, 20, 30])
    const m = d.map((v, i) => v + i)
    expect(m.toArray()).toEqual([10, 21, 32])
  })

  it('map to different type', () => {
    const d = Deque2.fromArray([1, 2, 3])
    const m = d.map(v => String(v))
    expect(m.toArray()).toEqual(['1', '2', '3'])
  })
})

describe('Deque2 - reduce', () => {
  it('reduces to sum', () => {
    const d = Deque2.fromArray([1, 2, 3, 4])
    expect(d.reduce((a, b) => a + b, 0)).toBe(10)
  })

  it('reduces with index', () => {
    const d = Deque2.fromArray([10, 20, 30])
    expect(d.reduce((acc, v, i) => acc + v * i, 0)).toBe(80)
  })

  it('returns initial for empty deque', () => {
    const d = new Deque2<number>()
    expect(d.reduce((a, b) => a + b, 42)).toBe(42)
  })
})

describe('Deque2 - find / findIndex', () => {
  it('finds first matching', () => {
    const d = Deque2.fromArray([1, 2, 3, 4])
    expect(d.find(v => v > 2)).toBe(3)
  })

  it('returns undefined when not found', () => {
    const d = Deque2.fromArray([1, 2, 3])
    expect(d.find(v => v > 10)).toBeUndefined()
  })

  it('findIndex returns index', () => {
    const d = Deque2.fromArray([1, 2, 3, 4])
    expect(d.findIndex(v => v > 2)).toBe(2)
  })

  it('findIndex returns -1 when not found', () => {
    const d = Deque2.fromArray([1, 2, 3])
    expect(d.findIndex(v => v > 10)).toBe(-1)
  })

  it('find with index', () => {
    const d = Deque2.fromArray([10, 20, 30])
    expect(d.find((v, i) => i === 1)).toBe(20)
  })
})

describe('Deque2 - every / some', () => {
  it('every returns true when all match', () => {
    const d = Deque2.fromArray([2, 4, 6])
    expect(d.every(v => v % 2 === 0)).toBe(true)
  })

  it('every returns false when one fails', () => {
    const d = Deque2.fromArray([2, 3, 6])
    expect(d.every(v => v % 2 === 0)).toBe(false)
  })

  it('every returns true for empty', () => {
    const d = new Deque2<number>()
    expect(d.every(() => false)).toBe(true)
  })

  it('some returns true when any match', () => {
    const d = Deque2.fromArray([1, 2, 3])
    expect(d.some(v => v === 2)).toBe(true)
  })

  it('some returns false when none match', () => {
    const d = Deque2.fromArray([1, 3, 5])
    expect(d.some(v => v % 2 === 0)).toBe(false)
  })

  it('some returns false for empty', () => {
    const d = new Deque2<number>()
    expect(d.some(() => true)).toBe(false)
  })
})

describe('Deque2 - join', () => {
  it('joins with default separator', () => {
    const d = Deque2.fromArray([1, 2, 3])
    expect(d.join()).toBe('1,2,3')
  })

  it('joins with custom separator', () => {
    const d = Deque2.fromArray(['a', 'b', 'c'])
    expect(d.join('-')).toBe('a-b-c')
  })

  it('returns empty string for empty deque', () => {
    const d = new Deque2<number>()
    expect(d.join()).toBe('')
  })

  it('single element join', () => {
    const d = Deque2.fromArray([42])
    expect(d.join(',')).toBe('42')
  })
})

describe('Deque2 - capacity management', () => {
  it('capacity getter returns current capacity', () => {
    const d = new Deque2<number>({ initialCapacity: 8 })
    expect(d.capacity).toBe(8)
  })

  it('grows when capacity exceeded via pushBack', () => {
    const d = new Deque2<number>({ initialCapacity: 2 })
    d.pushBack(1)
    d.pushBack(2)
    expect(d.capacity).toBe(2)
    d.pushBack(3)
    expect(d.capacity).toBe(4)
    expect(d.toArray()).toEqual([1, 2, 3])
  })

  it('grows when capacity exceeded via pushFront', () => {
    const d = new Deque2<number>({ initialCapacity: 2 })
    d.pushFront(1)
    d.pushFront(2)
    expect(d.capacity).toBe(2)
    d.pushFront(3)
    expect(d.capacity).toBe(4)
    expect(d.toArray()).toEqual([3, 2, 1])
  })

  it('grows correctly with mixed operations', () => {
    const d = new Deque2<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushFront(0)
    d.pushBack(3)
    expect(d.capacity).toBe(4)
    d.pushBack(4)
    expect(d.capacity).toBe(8)
    expect(d.toArray()).toEqual([0, 1, 2, 3, 4])
  })
})

describe('Deque2 - edge cases', () => {
  it('push and pop single element repeatedly', () => {
    const d = new Deque2<number>({ initialCapacity: 2 })
    for (let i = 0; i < 100; i++) {
      d.pushBack(i)
      expect(d.popBack()).toBe(i)
      expect(d.isEmpty).toBe(true)
    }
  })

  it('pushFront and popFront single element repeatedly', () => {
    const d = new Deque2<number>({ initialCapacity: 2 })
    for (let i = 0; i < 100; i++) {
      d.pushFront(i)
      expect(d.popFront()).toBe(i)
      expect(d.isEmpty).toBe(true)
    }
  })

  it('alternating pushFront and popBack', () => {
    const d = new Deque2<number>()
    d.pushFront(1)
    d.pushFront(2)
    expect(d.popBack()).toBe(1)
    expect(d.popBack()).toBe(2)
  })

  it('alternating pushBack and popFront', () => {
    const d = new Deque2<number>()
    d.pushBack(1)
    d.pushBack(2)
    expect(d.popFront()).toBe(1)
    expect(d.popFront()).toBe(2)
  })

  it('works with strings', () => {
    const d = Deque2.fromArray(['hello', 'world'])
    expect(d.toArray()).toEqual(['hello', 'world'])
    d.pushFront('foo')
    expect(d.peekFront()).toBe('foo')
  })

  it('works with objects', () => {
    const d = new Deque2<{ x: number }>()
    d.pushBack({ x: 1 })
    d.pushBack({ x: 2 })
    expect(d.get(0)!.x).toBe(1)
    expect(d.get(1)!.x).toBe(2)
  })

  it('works with null and undefined values', () => {
    const d = new Deque2<number | null | undefined>()
    d.pushBack(1)
    d.pushBack(null)
    d.pushBack(undefined)
    d.pushBack(4)
    expect(d.size).toBe(4)
    expect(d.get(1)).toBeNull()
    expect(d.get(2)).toBeUndefined()
  })
})

describe('Deque2 - large inputs', () => {
  it('handles 10000 pushBack operations', () => {
    const d = new Deque2<number>({ initialCapacity: 16 })
    for (let i = 0; i < 10000; i++) {
      d.pushBack(i)
    }
    expect(d.size).toBe(10000)
    expect(d.get(0)).toBe(0)
    expect(d.get(9999)).toBe(9999)
  })

  it('handles 10000 pushFront operations', () => {
    const d = new Deque2<number>({ initialCapacity: 16 })
    for (let i = 0; i < 10000; i++) {
      d.pushFront(i)
    }
    expect(d.size).toBe(10000)
    expect(d.get(0)).toBe(9999)
    expect(d.get(9999)).toBe(0)
  })

  it('handles mixed push/pop with growth', () => {
    const d = new Deque2<number>({ initialCapacity: 2 })
    for (let i = 0; i < 1000; i++) {
      d.pushBack(i)
    }
    for (let i = 0; i < 500; i++) {
      expect(d.popFront()).toBe(i)
    }
    expect(d.size).toBe(500)
    expect(d.get(0)).toBe(500)
  })

  it('slice on large deque', () => {
    const d = Deque2.fromArray(Array.from({ length: 1000 }, (_, i) => i))
    const s = d.slice(100, 200)
    expect(s.size).toBe(100)
    expect(s.get(0)).toBe(100)
    expect(s.get(99)).toBe(199)
  })

  it('filter on large deque', () => {
    const d = Deque2.fromArray(Array.from({ length: 1000 }, (_, i) => i))
    const f = d.filter(v => v % 2 === 0)
    expect(f.size).toBe(500)
    expect(f.get(0)).toBe(0)
    expect(f.get(499)).toBe(998)
  })

  it('map on large deque', () => {
    const d = Deque2.fromArray(Array.from({ length: 100 }, (_, i) => i))
    const m = d.map(v => v * 2)
    expect(m.get(50)).toBe(100)
  })

  it('reduce on large deque', () => {
    const d = Deque2.fromArray(Array.from({ length: 100 }, (_, i) => i + 1))
    expect(d.reduce((a, b) => a + b, 0)).toBe(5050)
  })

  it('reverse large deque', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)
    const d = Deque2.fromArray(arr)
    d.reverse()
    expect(d.get(0)).toBe(999)
    expect(d.get(999)).toBe(0)
  })

  it('rotate large deque', () => {
    const d = Deque2.fromArray(Array.from({ length: 100 }, (_, i) => i))
    d.rotate(10)
    expect(d.get(0)).toBe(10)
    expect(d.get(90)).toBe(0)
  })

  it('insertAt and removeAt on large deque', () => {
    const d = Deque2.fromArray(Array.from({ length: 100 }, (_, i) => i))
    d.insertAt(50, 999)
    expect(d.get(50)).toBe(999)
    expect(d.size).toBe(101)
    d.removeAt(50)
    expect(d.size).toBe(100)
    expect(d.get(50)).toBe(50)
  })
})

describe('Deque2 - growth behavior with wrapping', () => {
  it('correctly wraps and grows with pushFront then pushBack', () => {
    const d = new Deque2<number>({ initialCapacity: 4 })
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

  it('popFront then pushBack wraps correctly', () => {
    const d = new Deque2<number>({ initialCapacity: 4 })
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

  it('handles multiple growth cycles', () => {
    const d = new Deque2<number>({ initialCapacity: 2 })
    for (let i = 0; i < 32; i++) {
      d.pushBack(i)
    }
    expect(d.size).toBe(32)
    expect(d.capacity).toBeGreaterThanOrEqual(32)
    for (let i = 0; i < 32; i++) {
      expect(d.get(i)).toBe(i)
    }
  })
})

describe('Deque2 - forEach order after wrapping', () => {
  it('forEach visits elements in correct order after wrapping', () => {
    const d = new Deque2<number>({ initialCapacity: 4 })
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
})

describe('Deque2 - iterator after wrapping', () => {
  it('spread works after wrapping', () => {
    const d = new Deque2<number>({ initialCapacity: 4 })
    d.pushBack(1)
    d.pushBack(2)
    d.pushBack(3)
    d.popFront()
    d.pushBack(4)
    expect([...d]).toEqual([2, 3, 4])
  })
})

describe('Deque2 - insertAt triggers growth', () => {
  it('insertAt grows buffer when full', () => {
    const d = new Deque2<number>({ initialCapacity: 2 })
    d.pushBack(1)
    d.pushBack(2)
    d.insertAt(1, 99)
    expect(d.toArray()).toEqual([1, 99, 2])
    expect(d.capacity).toBeGreaterThanOrEqual(3)
  })
})
