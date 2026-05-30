import { describe, it, expect } from 'vitest'
import { PersistentVector } from '../../../src/utils/persistent-vector.js'

describe('PersistentVector', () => {
  describe('construction', () => {
    it('creates empty vector', () => {
      const v = PersistentVector.empty<number>()
      expect(v.count).toBe(0)
      expect(v.size).toBe(0)
      expect(v.isEmpty).toBe(true)
    })

    it('creates from static of', () => {
      const v = PersistentVector.of(1, 2, 3)
      expect(v.count).toBe(3)
      expect(v.get(0)).toBe(1)
      expect(v.get(1)).toBe(2)
      expect(v.get(2)).toBe(3)
    })

    it('creates from iterable', () => {
      const v = PersistentVector.from([10, 20, 30, 40])
      expect(v.count).toBe(4)
      expect(v.get(1)).toBe(20)
    })

    it('creates from generator', () => {
      function* gen() {
        yield 5
        yield 10
        yield 15
      }
      const v = PersistentVector.from(gen())
      expect(v.count).toBe(3)
      expect(v.get(1)).toBe(10)
    })
  })

  describe('get', () => {
    it('returns undefined for out of bounds', () => {
      const v = PersistentVector.of(1, 2, 3)
      expect(v.get(-1)).toBeUndefined()
      expect(v.get(3)).toBeUndefined()
      expect(v.get(100)).toBeUndefined()
    })

    it('returns values at valid indices', () => {
      const v = PersistentVector.of(10, 20, 30)
      expect(v.get(0)).toBe(10)
      expect(v.get(1)).toBe(20)
      expect(v.get(2)).toBe(30)
    })
  })

  describe('push', () => {
    it('pushes to empty vector', () => {
      const v = PersistentVector.empty<number>().push(42)
      expect(v.count).toBe(1)
      expect(v.get(0)).toBe(42)
    })

    it('pushes multiple elements', () => {
      let v = PersistentVector.empty<number>()
      for (let i = 0; i < 100; i++) {
        v = v.push(i)
      }
      expect(v.count).toBe(100)
      expect(v.get(0)).toBe(0)
      expect(v.get(99)).toBe(99)
    })

    it('handles tail overflow creating tree levels', () => {
      let v = PersistentVector.empty<number>()
      for (let i = 0; i < 64; i++) {
        v = v.push(i)
      }
      expect(v.count).toBe(64)
      expect(v.get(0)).toBe(0)
      expect(v.get(32)).toBe(32)
      expect(v.get(63)).toBe(63)
    })

    it('does not mutate original', () => {
      const v1 = PersistentVector.of(1, 2, 3)
      const v2 = v1.push(4)
      expect(v1.count).toBe(3)
      expect(v2.count).toBe(4)
      expect(v1.get(3)).toBeUndefined()
      expect(v2.get(3)).toBe(4)
    })
  })

  describe('set', () => {
    it('sets value at index', () => {
      const v1 = PersistentVector.of(1, 2, 3)
      const v2 = v1.set(1, 99)
      expect(v1.get(1)).toBe(2)
      expect(v2.get(1)).toBe(99)
    })

    it('returns same vector for out of bounds', () => {
      const v = PersistentVector.of(1, 2, 3)
      expect(v.set(-1, 99)).toBe(v)
      expect(v.set(3, 99)).toBe(v)
    })

    it('sets in tail', () => {
      let v = PersistentVector.empty<number>()
      for (let i = 0; i < 10; i++) v = v.push(i)
      const v2 = v.set(9, 999)
      expect(v2.get(9)).toBe(999)
    })

    it('sets in tree', () => {
      let v = PersistentVector.empty<number>()
      for (let i = 0; i < 100; i++) v = v.push(i)
      const v2 = v.set(50, 999)
      expect(v2.get(50)).toBe(999)
      expect(v.get(50)).toBe(50)
    })
  })

  describe('pop', () => {
    it('pops from single element vector', () => {
      const v = PersistentVector.of(42).pop()
      expect(v.count).toBe(0)
      expect(v.isEmpty).toBe(true)
    })

    it('pops from empty vector returns empty', () => {
      const v = PersistentVector.empty<number>().pop()
      expect(v.count).toBe(0)
    })

    it('pops multiple elements', () => {
      let v = PersistentVector.of(1, 2, 3, 4, 5)
      v = v.pop()
      expect(v.count).toBe(4)
      expect(v.get(3)).toBe(4)
      v = v.pop()
      expect(v.count).toBe(3)
      expect(v.get(2)).toBe(3)
    })

    it('does not mutate original', () => {
      const v1 = PersistentVector.of(1, 2, 3)
      const v2 = v1.pop()
      expect(v1.count).toBe(3)
      expect(v2.count).toBe(2)
    })

    it('handles popping through tree levels', () => {
      let v = PersistentVector.empty<number>()
      for (let i = 0; i < 64; i++) v = v.push(i)
      for (let i = 63; i >= 0; i--) {
        expect(v.get(i)).toBe(i)
        v = v.pop()
      }
      expect(v.isEmpty).toBe(true)
    })
  })

  describe('iteration', () => {
    it('iterates with for-of', () => {
      const v = PersistentVector.of(10, 20, 30)
      const result: number[] = []
      for (const val of v) {
        result.push(val)
      }
      expect(result).toEqual([10, 20, 30])
    })

    it('forEach iterates all elements', () => {
      const v = PersistentVector.of(1, 2, 3)
      const result: number[] = []
      v.forEach((val, idx) => result.push(val + idx))
      expect(result).toEqual([1, 3, 5])
    })
  })

  describe('map', () => {
    it('maps values', () => {
      const v = PersistentVector.of(1, 2, 3)
      const mapped = v.map((x) => x * 10)
      expect(mapped.toArray()).toEqual([10, 20, 30])
    })

    it('preserves original', () => {
      const v = PersistentVector.of(1, 2, 3)
      v.map((x) => x * 10)
      expect(v.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('filter', () => {
    it('filters values', () => {
      const v = PersistentVector.of(1, 2, 3, 4, 5)
      const filtered = v.filter((x) => x % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })
  })

  describe('reduce', () => {
    it('reces values', () => {
      const v = PersistentVector.of(1, 2, 3, 4)
      expect(v.reduce((acc, x) => acc + x, 0)).toBe(10)
    })
  })

  describe('find', () => {
    it('finds element', () => {
      const v = PersistentVector.of(1, 2, 3, 4)
      expect(v.find((x) => x > 2)).toBe(3)
    })

    it('returns undefined when not found', () => {
      const v = PersistentVector.of(1, 2, 3)
      expect(v.find((x) => x > 10)).toBeUndefined()
    })
  })

  describe('findIndex', () => {
    it('finds index', () => {
      const v = PersistentVector.of(10, 20, 30)
      expect(v.findIndex((x) => x === 20)).toBe(1)
    })

    it('returns -1 when not found', () => {
      const v = PersistentVector.of(1, 2, 3)
      expect(v.findIndex((x) => x > 10)).toBe(-1)
    })
  })

  describe('some/every', () => {
    it('some returns true when predicate matches', () => {
      expect(PersistentVector.of(1, 2, 3).some((x) => x > 2)).toBe(true)
    })

    it('some returns false when no match', () => {
      expect(PersistentVector.of(1, 2, 3).some((x) => x > 10)).toBe(false)
    })

    it('every returns true when all match', () => {
      expect(PersistentVector.of(2, 4, 6).every((x) => x % 2 === 0)).toBe(true)
    })

    it('every returns false when some dont match', () => {
      expect(PersistentVector.of(2, 3, 6).every((x) => x % 2 === 0)).toBe(false)
    })
  })

  describe('includes/indexOf/lastIndexOf', () => {
    it('includes checks for value', () => {
      expect(PersistentVector.of(1, 2, 3).includes(2)).toBe(true)
      expect(PersistentVector.of(1, 2, 3).includes(5)).toBe(false)
    })

    it('indexOf finds first occurrence', () => {
      expect(PersistentVector.of(1, 2, 2, 3).indexOf(2)).toBe(1)
      expect(PersistentVector.of(1, 2, 3).indexOf(5)).toBe(-1)
    })

    it('lastIndexOf finds last occurrence', () => {
      expect(PersistentVector.of(1, 2, 2, 3).lastIndexOf(2)).toBe(2)
      expect(PersistentVector.of(1, 2, 3).lastIndexOf(5)).toBe(-1)
    })
  })

  describe('join', () => {
    it('joins elements', () => {
      expect(PersistentVector.of(1, 2, 3).join(',')).toBe('1,2,3')
    })

    it('joins with default separator', () => {
      expect(PersistentVector.of(1, 2, 3).join()).toBe('1,2,3')
    })

    it('empty vector returns empty string', () => {
      expect(PersistentVector.empty<number>().join()).toBe('')
    })
  })

  describe('slice', () => {
    it('slices with start and end', () => {
      expect(PersistentVector.of(1, 2, 3, 4, 5).slice(1, 4).toArray()).toEqual([2, 3, 4])
    })

    it('slices with negative indices', () => {
      expect(PersistentVector.of(1, 2, 3, 4, 5).slice(-3, -1).toArray()).toEqual([3, 4])
    })

    it('slices with only start', () => {
      expect(PersistentVector.of(1, 2, 3, 4, 5).slice(2).toArray()).toEqual([3, 4, 5])
    })

    it('slices empty', () => {
      expect(PersistentVector.of(1, 2, 3).slice(5, 8).toArray()).toEqual([])
    })
  })

  describe('concat', () => {
    it('concats two vectors', () => {
      const v1 = PersistentVector.of(1, 2)
      const v2 = PersistentVector.of(3, 4)
      expect(v1.concat(v2).toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('reverse', () => {
    it('reverses vector', () => {
      expect(PersistentVector.of(1, 2, 3).reverse().toArray()).toEqual([3, 2, 1])
    })
  })

  describe('sort', () => {
    it('sorts with default comparator', () => {
      expect(PersistentVector.of(3, 1, 2).sort().toArray()).toEqual([1, 2, 3])
    })

    it('sorts with custom comparator', () => {
      const sorted = PersistentVector.of(1, 2, 3).sort((a, b) => b - a)
      expect(sorted.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('toArray', () => {
    it('converts to array', () => {
      expect(PersistentVector.of(10, 20, 30).toArray()).toEqual([10, 20, 30])
    })

    it('empty vector to empty array', () => {
      expect(PersistentVector.empty<number>().toArray()).toEqual([])
    })
  })

  describe('equals', () => {
    it('equal vectors', () => {
      expect(PersistentVector.of(1, 2, 3).equals(PersistentVector.of(1, 2, 3))).toBe(true)
    })

    it('different length', () => {
      expect(PersistentVector.of(1, 2).equals(PersistentVector.of(1, 2, 3))).toBe(false)
    })

    it('different values', () => {
      expect(PersistentVector.of(1, 2, 3).equals(PersistentVector.of(1, 2, 4))).toBe(false)
    })

    it('with custom comparator', () => {
      const v1 = PersistentVector.of({ a: 1 }, { a: 2 })
      const v2 = PersistentVector.of({ a: 1 }, { a: 2 })
      expect(v1.equals(v2, (a, b) => a.a === b.a)).toBe(true)
    })
  })

  describe('first/last', () => {
    it('returns first and last', () => {
      const v = PersistentVector.of(10, 20, 30)
      expect(v.first()).toBe(10)
      expect(v.last()).toBe(30)
    })

    it('returns undefined for empty', () => {
      const v = PersistentVector.empty<number>()
      expect(v.first()).toBeUndefined()
      expect(v.last()).toBeUndefined()
    })
  })

  describe('take/drop', () => {
    it('takes first n', () => {
      expect(PersistentVector.of(1, 2, 3, 4, 5).take(3).toArray()).toEqual([1, 2, 3])
    })

    it('drops first n', () => {
      expect(PersistentVector.of(1, 2, 3, 4, 5).drop(2).toArray()).toEqual([3, 4, 5])
    })

    it('take more than length', () => {
      expect(PersistentVector.of(1, 2).take(5).toArray()).toEqual([1, 2])
    })

    it('drop more than length', () => {
      expect(PersistentVector.of(1, 2).drop(5).toArray()).toEqual([])
    })
  })

  describe('update', () => {
    it('updates value at index', () => {
      const v = PersistentVector.of(1, 2, 3).update(1, (x) => x * 10)
      expect(v.toArray()).toEqual([1, 20, 3])
    })

    it('returns same for invalid index', () => {
      const v = PersistentVector.of(1, 2, 3)
      expect(v.update(5, (x) => x)).toBe(v)
    })
  })

  describe('large vector', () => {
    it('handles 1000 elements', () => {
      let v = PersistentVector.empty<number>()
      for (let i = 0; i < 1000; i++) v = v.push(i)
      expect(v.count).toBe(1000)
      expect(v.get(0)).toBe(0)
      expect(v.get(500)).toBe(500)
      expect(v.get(999)).toBe(999)
    })

    it('handles 1000 push and 500 pop', () => {
      let v = PersistentVector.empty<number>()
      for (let i = 0; i < 1000; i++) v = v.push(i)
      for (let i = 0; i < 500; i++) v = v.pop()
      expect(v.count).toBe(500)
      expect(v.get(499)).toBe(499)
    })

    it('sets across tree levels', () => {
      let v = PersistentVector.empty<number>()
      for (let i = 0; i < 200; i++) v = v.push(i)
      v = v.set(0, 999)
      v = v.set(100, 888)
      v = v.set(199, 777)
      expect(v.get(0)).toBe(999)
      expect(v.get(100)).toBe(888)
      expect(v.get(199)).toBe(777)
    })
  })

  describe('structural sharing', () => {
    it('branching preserves shared structure', () => {
      let base = PersistentVector.empty<number>()
      for (let i = 0; i < 50; i++) base = base.push(i)
      const branch1 = base.push(100)
      const branch2 = base.push(200)
      expect(branch1.get(50)).toBe(100)
      expect(branch2.get(50)).toBe(200)
      expect(branch1.get(49)).toBe(49)
      expect(branch2.get(49)).toBe(49)
      expect(base.get(50)).toBeUndefined()
    })
  })

  describe('string elements', () => {
    it('works with strings', () => {
      const v = PersistentVector.of('hello', 'world')
      expect(v.get(0)).toBe('hello')
      expect(v.join(' ')).toBe('hello world')
    })
  })

  describe('object elements', () => {
    it('works with objects', () => {
      const v = PersistentVector.of({ x: 1 }, { x: 2 }, { x: 3 })
      expect(v.get(1)!.x).toBe(2)
      const mapped = v.map((obj) => ({ x: obj.x * 2 }))
      expect(mapped.get(1)!.x).toBe(4)
    })
  })
})
