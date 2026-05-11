import { describe, it, expect } from 'vitest'
import { FingerTree2 } from '../../src/core/finger-tree-2/index.js'

describe('FingerTree2', () => {
  describe('construction', () => {
    it('creates empty tree with no arguments', () => {
      const t = new FingerTree2()
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('creates tree from array', () => {
      const t = new FingerTree2([1, 2, 3])
      expect(t.size).toBe(3)
      expect(t.isEmpty).toBe(false)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('creates tree from empty array', () => {
      const t = new FingerTree2([])
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('creates tree from single element', () => {
      const t = new FingerTree2([42])
      expect(t.size).toBe(1)
      expect(t.toArray()).toEqual([42])
    })

    it('creates tree from generator', () => {
      function* gen() { yield 1; yield 2; yield 3 }
      const t = new FingerTree2(gen())
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('creates tree from large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      const t = new FingerTree2(arr)
      expect(t.size).toBe(1000)
      expect(t.toArray()).toEqual(arr)
    })

    it('preserves element order', () => {
      const t = new FingerTree2(['a', 'b', 'c', 'd', 'e'])
      expect(t.toArray()).toEqual(['a', 'b', 'c', 'd', 'e'])
    })
  })

  describe('pushFront', () => {
    it('pushes to empty tree', () => {
      const t = new FingerTree2<number>().pushFront(1)
      expect(t.size).toBe(1)
      expect(t.front()).toBe(1)
      expect(t.back()).toBe(1)
    })

    it('pushes to single element tree', () => {
      const t = new FingerTree2([2]).pushFront(1)
      expect(t.toArray()).toEqual([1, 2])
    })

    it('returns new tree without modifying original', () => {
      const original = new FingerTree2([2, 3])
      const modified = original.pushFront(1)
      expect(original.toArray()).toEqual([2, 3])
      expect(modified.toArray()).toEqual([1, 2, 3])
    })

    it('pushes multiple elements', () => {
      let t = new FingerTree2<number>()
      t = t.pushFront(3).pushFront(2).pushFront(1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('handles many pushFront operations', () => {
      let t = new FingerTree2<number>()
      for (let i = 99; i >= 0; i--) t = t.pushFront(i)
      expect(t.size).toBe(100)
      expect(t.front()).toBe(0)
      expect(t.back()).toBe(99)
    })

    it('preserves immutability across chains', () => {
      const t1 = new FingerTree2<number>()
      const t2 = t1.pushFront(1)
      const t3 = t2.pushFront(2)
      const t4 = t3.pushFront(3)
      expect(t1.size).toBe(0)
      expect(t2.toArray()).toEqual([1])
      expect(t3.toArray()).toEqual([2, 1])
      expect(t4.toArray()).toEqual([3, 2, 1])
    })

    it('pushes strings', () => {
      const t = new FingerTree2<string>().pushFront('hello')
      expect(t.front()).toBe('hello')
    })

    it('pushes objects', () => {
      const obj = { x: 1 }
      const t = new FingerTree2<object>().pushFront(obj)
      expect(t.front()).toBe(obj)
    })

    it('pushes null and undefined values', () => {
      const t = new FingerTree2<null | undefined>().pushFront(null).pushFront(undefined)
      expect(t.size).toBe(2)
    })
  })

  describe('pushBack', () => {
    it('pushes to empty tree', () => {
      const t = new FingerTree2<number>().pushBack(1)
      expect(t.size).toBe(1)
      expect(t.front()).toBe(1)
      expect(t.back()).toBe(1)
    })

    it('pushes to single element tree', () => {
      const t = new FingerTree2([1]).pushBack(2)
      expect(t.toArray()).toEqual([1, 2])
    })

    it('returns new tree without modifying original', () => {
      const original = new FingerTree2([1, 2])
      const modified = original.pushBack(3)
      expect(original.toArray()).toEqual([1, 2])
      expect(modified.toArray()).toEqual([1, 2, 3])
    })

    it('pushes multiple elements', () => {
      let t = new FingerTree2<number>()
      t = t.pushBack(1).pushBack(2).pushBack(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('handles many pushBack operations', () => {
      let t = new FingerTree2<number>()
      for (let i = 0; i < 100; i++) t = t.pushBack(i)
      expect(t.size).toBe(100)
      expect(t.front()).toBe(0)
      expect(t.back()).toBe(99)
    })

    it('works with mixed pushFront and pushBack', () => {
      const t = new FingerTree2([2]).pushFront(1).pushBack(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('popFront', () => {
    it('returns empty tree when popping from empty', () => {
      const t = new FingerTree2<number>()
      const popped = t.popFront()
      expect(popped.size).toBe(0)
      expect(popped.isEmpty).toBe(true)
    })

    it('pops from single element tree', () => {
      const t = new FingerTree2([1])
      const popped = t.popFront()
      expect(popped.isEmpty).toBe(true)
      expect(t.toArray()).toEqual([1])
    })

    it('pops from multi element tree', () => {
      const t = new FingerTree2([1, 2, 3])
      const popped = t.popFront()
      expect(popped.toArray()).toEqual([2, 3])
    })

    it('returns new tree without modifying original', () => {
      const original = new FingerTree2([1, 2, 3])
      const popped = original.popFront()
      expect(original.toArray()).toEqual([1, 2, 3])
      expect(popped.toArray()).toEqual([2, 3])
    })

    it('can pop all elements', () => {
      let t = new FingerTree2([1, 2, 3])
      t = t.popFront().popFront().popFront()
      expect(t.isEmpty).toBe(true)
    })

    it('pops from tree with many elements', () => {
      let t = new FingerTree2(Array.from({ length: 50 }, (_, i) => i))
      for (let i = 0; i < 50; i++) {
        expect(t.front()).toBe(i)
        t = t.popFront()
      }
      expect(t.isEmpty).toBe(true)
    })

    it('popping from empty multiple times is safe', () => {
      const t = new FingerTree2<number>()
      expect(t.popFront().popFront().popFront().isEmpty).toBe(true)
    })
  })

  describe('popBack', () => {
    it('returns empty tree when popping from empty', () => {
      const t = new FingerTree2<number>()
      const popped = t.popBack()
      expect(popped.isEmpty).toBe(true)
    })

    it('pops from single element tree', () => {
      const t = new FingerTree2([1])
      const popped = t.popBack()
      expect(popped.isEmpty).toBe(true)
    })

    it('pops from multi element tree', () => {
      const t = new FingerTree2([1, 2, 3])
      const popped = t.popBack()
      expect(popped.toArray()).toEqual([1, 2])
    })

    it('returns new tree without modifying original', () => {
      const original = new FingerTree2([1, 2, 3])
      const popped = original.popBack()
      expect(original.toArray()).toEqual([1, 2, 3])
      expect(popped.toArray()).toEqual([1, 2])
    })

    it('can pop all elements', () => {
      let t = new FingerTree2([1, 2, 3])
      t = t.popBack().popBack().popBack()
      expect(t.isEmpty).toBe(true)
    })

    it('pops from tree with many elements', () => {
      let t = new FingerTree2(Array.from({ length: 50 }, (_, i) => i))
      for (let i = 49; i >= 0; i--) {
        expect(t.back()).toBe(i)
        t = t.popBack()
      }
      expect(t.isEmpty).toBe(true)
    })
  })

  describe('front and back', () => {
    it('front returns undefined on empty tree', () => {
      expect(new FingerTree2().front()).toBeUndefined()
    })

    it('back returns undefined on empty tree', () => {
      expect(new FingerTree2().back()).toBeUndefined()
    })

    it('front returns first element', () => {
      expect(new FingerTree2([10, 20, 30]).front()).toBe(10)
    })

    it('back returns last element', () => {
      expect(new FingerTree2([10, 20, 30]).back()).toBe(30)
    })

    it('front and back on single element', () => {
      const t = new FingerTree2([42])
      expect(t.front()).toBe(42)
      expect(t.back()).toBe(42)
    })

    it('front after pushFront', () => {
      const t = new FingerTree2([2, 3]).pushFront(1)
      expect(t.front()).toBe(1)
    })

    it('back after pushBack', () => {
      const t = new FingerTree2([1, 2]).pushBack(3)
      expect(t.back()).toBe(3)
    })

    it('front after popFront', () => {
      const t = new FingerTree2([1, 2, 3]).popFront()
      expect(t.front()).toBe(2)
    })

    it('back after popBack', () => {
      const t = new FingerTree2([1, 2, 3]).popBack()
      expect(t.back()).toBe(2)
    })
  })

  describe('peekFront and peekBack', () => {
    it('peekFront aliases front', () => {
      const t = new FingerTree2([1, 2, 3])
      expect(t.peekFront()).toBe(t.front())
    })

    it('peekBack aliases back', () => {
      const t = new FingerTree2([1, 2, 3])
      expect(t.peekBack()).toBe(t.back())
    })

    it('peekFront returns undefined on empty', () => {
      expect(new FingerTree2().peekFront()).toBeUndefined()
    })

    it('peekBack returns undefined on empty', () => {
      expect(new FingerTree2().peekBack()).toBeUndefined()
    })
  })

  describe('get', () => {
    it('returns element at valid index', () => {
      const t = new FingerTree2([10, 20, 30, 40, 50])
      expect(t.get(0)).toBe(10)
      expect(t.get(2)).toBe(30)
      expect(t.get(4)).toBe(50)
    })

    it('returns undefined for negative index', () => {
      expect(new FingerTree2([1, 2, 3]).get(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds index', () => {
      expect(new FingerTree2([1, 2, 3]).get(3)).toBeUndefined()
      expect(new FingerTree2([1, 2, 3]).get(100)).toBeUndefined()
    })

    it('returns undefined on empty tree', () => {
      expect(new FingerTree2().get(0)).toBeUndefined()
    })

    it('works on single element tree', () => {
      const t = new FingerTree2([42])
      expect(t.get(0)).toBe(42)
      expect(t.get(1)).toBeUndefined()
    })

    it('works on large tree', () => {
      const arr = Array.from({ length: 200 }, (_, i) => i * 10)
      const t = new FingerTree2(arr)
      expect(t.get(0)).toBe(0)
      expect(t.get(100)).toBe(1000)
      expect(t.get(199)).toBe(1990)
    })

    it('returns correct values after pushFront', () => {
      const t = new FingerTree2([20, 30]).pushFront(10)
      expect(t.get(0)).toBe(10)
      expect(t.get(1)).toBe(20)
      expect(t.get(2)).toBe(30)
    })

    it('returns correct values after pushBack', () => {
      const t = new FingerTree2([10, 20]).pushBack(30)
      expect(t.get(0)).toBe(10)
      expect(t.get(1)).toBe(20)
      expect(t.get(2)).toBe(30)
    })
  })

  describe('set', () => {
    it('sets value at valid index', () => {
      const t = new FingerTree2([1, 2, 3]).set(1, 99)
      expect(t.toArray()).toEqual([1, 99, 3])
    })

    it('sets first element', () => {
      const t = new FingerTree2([1, 2, 3]).set(0, 99)
      expect(t.toArray()).toEqual([99, 2, 3])
    })

    it('sets last element', () => {
      const t = new FingerTree2([1, 2, 3]).set(2, 99)
      expect(t.toArray()).toEqual([1, 2, 99])
    })

    it('returns same tree for invalid index', () => {
      const original = new FingerTree2([1, 2, 3])
      const modified = original.set(-1, 99)
      expect(modified.toArray()).toEqual([1, 2, 3])
    })

    it('returns same tree for out of bounds index', () => {
      const original = new FingerTree2([1, 2, 3])
      const modified = original.set(5, 99)
      expect(modified.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify original tree', () => {
      const original = new FingerTree2([1, 2, 3])
      original.set(1, 99)
      expect(original.toArray()).toEqual([1, 2, 3])
    })

    it('works on single element tree', () => {
      const t = new FingerTree2([1]).set(0, 42)
      expect(t.toArray()).toEqual([42])
    })

    it('sets on large tree', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i)
      const t = new FingerTree2(arr).set(50, 999)
      expect(t.get(50)).toBe(999)
      expect(t.get(49)).toBe(49)
      expect(t.get(51)).toBe(51)
    })

    it('chains set operations', () => {
      const t = new FingerTree2([0, 0, 0, 0, 0])
        .set(0, 1)
        .set(2, 3)
        .set(4, 5)
      expect(t.toArray()).toEqual([1, 0, 3, 0, 5])
    })
  })

  describe('concat', () => {
    it('concats two non-empty trees', () => {
      const a = new FingerTree2([1, 2])
      const b = new FingerTree2([3, 4])
      expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4])
    })

    it('concats empty with non-empty', () => {
      const a = new FingerTree2<number>()
      const b = new FingerTree2([1, 2])
      expect(a.concat(b).toArray()).toEqual([1, 2])
    })

    it('concats non-empty with empty', () => {
      const a = new FingerTree2([1, 2])
      const b = new FingerTree2<number>()
      expect(a.concat(b).toArray()).toEqual([1, 2])
    })

    it('concats two empty trees', () => {
      const a = new FingerTree2<number>()
      const b = new FingerTree2<number>()
      expect(a.concat(b).isEmpty).toBe(true)
    })

    it('does not modify original trees', () => {
      const a = new FingerTree2([1, 2])
      const b = new FingerTree2([3, 4])
      a.concat(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([3, 4])
    })

    it('concats single element trees', () => {
      const a = new FingerTree2([1])
      const b = new FingerTree2([2])
      expect(a.concat(b).toArray()).toEqual([1, 2])
    })

    it('concats large trees', () => {
      const a = new FingerTree2(Array.from({ length: 100 }, (_, i) => i))
      const b = new FingerTree2(Array.from({ length: 100 }, (_, i) => i + 100))
      const result = a.concat(b)
      expect(result.size).toBe(200)
      expect(result.get(0)).toBe(0)
      expect(result.get(99)).toBe(99)
      expect(result.get(100)).toBe(100)
      expect(result.get(199)).toBe(199)
    })

    it('chains concat operations', () => {
      const a = new FingerTree2([1])
      const b = new FingerTree2([2])
      const c = new FingerTree2([3])
      expect(a.concat(b).concat(c).toArray()).toEqual([1, 2, 3])
    })
  })

  describe('split', () => {
    it('splits in the middle', () => {
      const t = new FingerTree2([1, 2, 3, 4, 5])
      const [left, right] = t.split(2)
      expect(left.toArray()).toEqual([1, 2])
      expect(right.toArray()).toEqual([3, 4, 5])
    })

    it('splits at beginning', () => {
      const t = new FingerTree2([1, 2, 3])
      const [left, right] = t.split(0)
      expect(left.isEmpty).toBe(true)
      expect(right.toArray()).toEqual([1, 2, 3])
    })

    it('splits at end', () => {
      const t = new FingerTree2([1, 2, 3])
      const [left, right] = t.split(3)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.isEmpty).toBe(true)
    })

    it('splits with negative index', () => {
      const t = new FingerTree2([1, 2, 3])
      const [left, right] = t.split(-1)
      expect(left.isEmpty).toBe(true)
      expect(right.toArray()).toEqual([1, 2, 3])
    })

    it('splits with index beyond size', () => {
      const t = new FingerTree2([1, 2, 3])
      const [left, right] = t.split(100)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.isEmpty).toBe(true)
    })

    it('splits single element tree', () => {
      const t = new FingerTree2([42])
      const [left, right] = t.split(1)
      expect(left.toArray()).toEqual([42])
      expect(right.isEmpty).toBe(true)
    })

    it('splits empty tree', () => {
      const t = new FingerTree2<number>()
      const [left, right] = t.split(0)
      expect(left.isEmpty).toBe(true)
      expect(right.isEmpty).toBe(true)
    })

    it('does not modify original', () => {
      const original = new FingerTree2([1, 2, 3, 4, 5])
      original.split(2)
      expect(original.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('splitting and rejoining preserves content', () => {
      const t = new FingerTree2([1, 2, 3, 4, 5])
      const [left, right] = t.split(3)
      expect(left.concat(right).toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('split at index 1', () => {
      const t = new FingerTree2([1, 2, 3])
      const [left, right] = t.split(1)
      expect(left.toArray()).toEqual([1])
      expect(right.toArray()).toEqual([2, 3])
    })
  })

  describe('size and isEmpty', () => {
    it('empty tree has size 0', () => {
      expect(new FingerTree2().size).toBe(0)
    })

    it('single element has size 1', () => {
      expect(new FingerTree2([1]).size).toBe(1)
    })

    it('size reflects number of elements', () => {
      expect(new FingerTree2([1, 2, 3]).size).toBe(3)
    })

    it('isEmpty is true for empty tree', () => {
      expect(new FingerTree2().isEmpty).toBe(true)
    })

    it('isEmpty is false for non-empty tree', () => {
      expect(new FingerTree2([1]).isEmpty).toBe(false)
    })

    it('size updates after pushFront', () => {
      const t = new FingerTree2([1, 2]).pushFront(0)
      expect(t.size).toBe(3)
    })

    it('size updates after pushBack', () => {
      const t = new FingerTree2([1, 2]).pushBack(3)
      expect(t.size).toBe(3)
    })

    it('size updates after popFront', () => {
      const t = new FingerTree2([1, 2, 3]).popFront()
      expect(t.size).toBe(2)
    })

    it('size updates after popBack', () => {
      const t = new FingerTree2([1, 2, 3]).popBack()
      expect(t.size).toBe(2)
    })

    it('size updates after concat', () => {
      const a = new FingerTree2([1, 2])
      const b = new FingerTree2([3, 4])
      expect(a.concat(b).size).toBe(4)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      expect(new FingerTree2().toArray()).toEqual([])
    })

    it('returns array with all elements', () => {
      expect(new FingerTree2([1, 2, 3]).toArray()).toEqual([1, 2, 3])
    })

    it('preserves order after pushFront', () => {
      const t = new FingerTree2([2, 3]).pushFront(1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('preserves order after pushBack', () => {
      const t = new FingerTree2([1, 2]).pushBack(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('preserves order after popFront', () => {
      const t = new FingerTree2([1, 2, 3]).popFront()
      expect(t.toArray()).toEqual([2, 3])
    })

    it('preserves order after popBack', () => {
      const t = new FingerTree2([1, 2, 3]).popBack()
      expect(t.toArray()).toEqual([1, 2])
    })

    it('returns new array each time', () => {
      const t = new FingerTree2([1, 2, 3])
      const a1 = t.toArray()
      const a2 = t.toArray()
      expect(a1).not.toBe(a2)
      expect(a1).toEqual(a2)
    })
  })

  describe('forEach', () => {
    it('iterates all elements', () => {
      const t = new FingerTree2([1, 2, 3])
      const collected: number[] = []
      t.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const t = new FingerTree2([10, 20, 30])
      const indices: number[] = []
      t.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides value and index together', () => {
      const t = new FingerTree2([10, 20])
      const pairs: [number, number][] = []
      t.forEach((v, i) => pairs.push([v, i]))
      expect(pairs).toEqual([[10, 0], [20, 1]])
    })

    it('does not call on empty tree', () => {
      let count = 0
      new FingerTree2().forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates single element', () => {
      const t = new FingerTree2([42])
      const collected: number[] = []
      t.forEach((v) => collected.push(v))
      expect(collected).toEqual([42])
    })
  })

  describe('map', () => {
    it('maps over elements', () => {
      const t = new FingerTree2([1, 2, 3])
      const mapped = t.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('provides correct indices', () => {
      const t = new FingerTree2([10, 20, 30])
      const mapped = t.map((_v, i) => i)
      expect(mapped.toArray()).toEqual([0, 1, 2])
    })

    it('returns empty tree for empty input', () => {
      const t = new FingerTree2<number>()
      const mapped = t.map((v) => v * 2)
      expect(mapped.isEmpty).toBe(true)
    })

    it('does not modify original', () => {
      const original = new FingerTree2([1, 2, 3])
      original.map((v) => v * 2)
      expect(original.toArray()).toEqual([1, 2, 3])
    })

    it('maps to different type', () => {
      const t = new FingerTree2([1, 2, 3])
      const mapped = t.map((v) => `item-${v}`)
      expect(mapped.toArray()).toEqual(['item-1', 'item-2', 'item-3'])
    })

    it('maps single element', () => {
      const t = new FingerTree2([5])
      const mapped = t.map((v) => v + 1)
      expect(mapped.toArray()).toEqual([6])
    })
  })

  describe('Symbol.iterator', () => {
    it('spreads into array', () => {
      const t = new FingerTree2([1, 2, 3])
      expect([...t]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const t = new FingerTree2([10, 20, 30])
      const collected: number[] = []
      for (const v of t) collected.push(v)
      expect(collected).toEqual([10, 20, 30])
    })

    it('yields nothing for empty tree', () => {
      expect([...new FingerTree2()]).toEqual([])
    })

    it('matches toArray output', () => {
      const t = new FingerTree2([1, 2, 3, 4, 5])
      expect([...t]).toEqual(t.toArray())
    })
  })

  describe('static methods', () => {
    it('fromArray creates tree from array', () => {
      const t = FingerTree2.fromArray([1, 2, 3])
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('fromArray with empty array', () => {
      const t = FingerTree2.fromArray([])
      expect(t.isEmpty).toBe(true)
    })

    it('empty creates empty tree', () => {
      const t = FingerTree2.empty<number>()
      expect(t.isEmpty).toBe(true)
      expect(t.size).toBe(0)
    })

    it('empty tree can be used as base', () => {
      const t = FingerTree2.empty<number>().pushBack(1).pushBack(2)
      expect(t.toArray()).toEqual([1, 2])
    })
  })

  describe('edge cases', () => {
    it('handles single element throughout lifecycle', () => {
      let t = new FingerTree2([42])
      expect(t.size).toBe(1)
      expect(t.front()).toBe(42)
      expect(t.back()).toBe(42)
      expect(t.get(0)).toBe(42)
      t = t.popFront()
      expect(t.isEmpty).toBe(true)
    })

    it('push and pop alternating', () => {
      let t = new FingerTree2<number>()
      t = t.pushBack(1)
      expect(t.toArray()).toEqual([1])
      t = t.pushBack(2)
      expect(t.toArray()).toEqual([1, 2])
      t = t.popFront()
      expect(t.toArray()).toEqual([2])
      t = t.pushBack(3)
      expect(t.toArray()).toEqual([2, 3])
    })

    it('split then modify both halves', () => {
      const t = new FingerTree2([1, 2, 3, 4, 5])
      const [left, right] = t.split(2)
      const newLeft = left.pushBack(99)
      const newRight = right.pushFront(88)
      expect(newLeft.toArray()).toEqual([1, 2, 99])
      expect(newRight.toArray()).toEqual([88, 3, 4, 5])
    })

    it('concat split results', () => {
      const original = new FingerTree2(Array.from({ length: 20 }, (_, i) => i))
      const [left, right] = original.split(10)
      const rejoined = left.concat(right)
      expect(rejoined.toArray()).toEqual(original.toArray())
    })

    it('large tree operations', () => {
      let t = new FingerTree2<number>()
      for (let i = 0; i < 500; i++) t = t.pushBack(i)
      expect(t.size).toBe(500)
      expect(t.front()).toBe(0)
      expect(t.back()).toBe(499)
      expect(t.get(250)).toBe(250)

      const [left, right] = t.split(250)
      expect(left.size).toBe(250)
      expect(right.size).toBe(250)
      expect(left.back()).toBe(249)
      expect(right.front()).toBe(250)

      const rejoined = left.concat(right)
      expect(rejoined.size).toBe(500)
    })

    it('mixed operations sequence', () => {
      let t = new FingerTree2<number>()
      t = t.pushBack(1).pushBack(2).pushBack(3).pushFront(0)
      expect(t.toArray()).toEqual([0, 1, 2, 3])
      t = t.set(2, 99)
      expect(t.toArray()).toEqual([0, 1, 99, 3])
      t = t.popFront().popBack()
      expect(t.toArray()).toEqual([1, 99])
    })

    it('set then get returns set value', () => {
      const t = new FingerTree2([1, 2, 3, 4, 5]).set(2, 99)
      expect(t.get(2)).toBe(99)
      expect(t.get(1)).toBe(2)
      expect(t.get(3)).toBe(4)
    })

    it('handles boolean values', () => {
      const t = new FingerTree2([true, false, true])
      expect(t.get(0)).toBe(true)
      expect(t.get(1)).toBe(false)
    })

    it('handles string values', () => {
      const t = new FingerTree2(['hello', 'world'])
      expect(t.front()).toBe('hello')
      expect(t.back()).toBe('world')
    })

    it('handles zero as valid value', () => {
      const t = new FingerTree2([0, 0, 0])
      expect(t.size).toBe(3)
      expect(t.get(1)).toBe(0)
    })

    it('handles false as valid value', () => {
      const t = new FingerTree2([false, false])
      expect(t.size).toBe(2)
      expect(t.get(0)).toBe(false)
    })

    it('handles empty string as valid value', () => {
      const t = new FingerTree2(['', 'hello', ''])
      expect(t.size).toBe(3)
      expect(t.get(0)).toBe('')
    })

    it('multiple splits', () => {
      const t = new FingerTree2([1, 2, 3, 4, 5, 6, 7, 8])
      const [a, rest] = t.split(3)
      const [b, c] = rest.split(2)
      expect(a.toArray()).toEqual([1, 2, 3])
      expect(b.toArray()).toEqual([4, 5])
      expect(c.toArray()).toEqual([6, 7, 8])
    })
  })

  describe('immutability', () => {
    it('pushFront is immutable', () => {
      const t = new FingerTree2([2, 3])
      const t2 = t.pushFront(1)
      expect(t.toArray()).toEqual([2, 3])
      expect(t2.toArray()).toEqual([1, 2, 3])
    })

    it('pushBack is immutable', () => {
      const t = new FingerTree2([1, 2])
      const t2 = t.pushBack(3)
      expect(t.toArray()).toEqual([1, 2])
      expect(t2.toArray()).toEqual([1, 2, 3])
    })

    it('popFront is immutable', () => {
      const t = new FingerTree2([1, 2, 3])
      const t2 = t.popFront()
      expect(t.toArray()).toEqual([1, 2, 3])
      expect(t2.toArray()).toEqual([2, 3])
    })

    it('popBack is immutable', () => {
      const t = new FingerTree2([1, 2, 3])
      const t2 = t.popBack()
      expect(t.toArray()).toEqual([1, 2, 3])
      expect(t2.toArray()).toEqual([1, 2])
    })

    it('set is immutable', () => {
      const t = new FingerTree2([1, 2, 3])
      const t2 = t.set(1, 99)
      expect(t.toArray()).toEqual([1, 2, 3])
      expect(t2.toArray()).toEqual([1, 99, 3])
    })

    it('concat is immutable', () => {
      const a = new FingerTree2([1, 2])
      const b = new FingerTree2([3, 4])
      a.concat(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([3, 4])
    })

    it('split is immutable', () => {
      const t = new FingerTree2([1, 2, 3, 4, 5])
      t.split(2)
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('large trees', () => {
    it('build with 1000 pushBacks', () => {
      let t = new FingerTree2<number>()
      for (let i = 0; i < 1000; i++) t = t.pushBack(i)
      expect(t.size).toBe(1000)
      expect(t.get(0)).toBe(0)
      expect(t.get(999)).toBe(999)
    })

    it('build with 1000 pushFronts', () => {
      let t = new FingerTree2<number>()
      for (let i = 0; i < 1000; i++) t = t.pushFront(i)
      expect(t.size).toBe(1000)
      expect(t.get(0)).toBe(999)
      expect(t.get(999)).toBe(0)
    })

    it('split large tree', () => {
      let t = new FingerTree2<number>()
      for (let i = 0; i < 200; i++) t = t.pushBack(i)
      const [left, right] = t.split(100)
      expect(left.size).toBe(100)
      expect(right.size).toBe(100)
      expect(left.get(99)).toBe(99)
      expect(right.get(0)).toBe(100)
    })

    it('concat large trees', () => {
      let a = new FingerTree2<number>()
      let b = new FingerTree2<number>()
      for (let i = 0; i < 200; i++) a = a.pushBack(i)
      for (let i = 200; i < 400; i++) b = b.pushBack(i)
      const c = a.concat(b)
      expect(c.size).toBe(400)
      expect(c.get(0)).toBe(0)
      expect(c.get(399)).toBe(399)
    })

    it('forEach on large tree', () => {
      let t = new FingerTree2<number>()
      for (let i = 0; i < 100; i++) t = t.pushBack(i)
      let sum = 0
      t.forEach((v) => { sum += v })
      expect(sum).toBe(4950)
    })

    it('map on large tree', () => {
      let t = new FingerTree2<number>()
      for (let i = 0; i < 50; i++) t = t.pushBack(i)
      const mapped = t.map((v) => v * 2)
      expect(mapped.get(0)).toBe(0)
      expect(mapped.get(49)).toBe(98)
    })

    it('set on large tree at various positions', () => {
      let t = new FingerTree2<number>()
      for (let i = 0; i < 100; i++) t = t.pushBack(i)
      t = t.set(0, -1).set(50, -50).set(99, -99)
      expect(t.get(0)).toBe(-1)
      expect(t.get(50)).toBe(-50)
      expect(t.get(99)).toBe(-99)
      expect(t.get(1)).toBe(1)
    })
  })

  describe('popFront and popBack combined', () => {
    it('alternating popFront and popBack', () => {
      let t = new FingerTree2([1, 2, 3, 4])
      t = t.popFront()
      expect(t.toArray()).toEqual([2, 3, 4])
      t = t.popBack()
      expect(t.toArray()).toEqual([2, 3])
      t = t.popFront()
      expect(t.toArray()).toEqual([3])
      t = t.popBack()
      expect(t.isEmpty).toBe(true)
    })

    it('pop all from front', () => {
      let t = new FingerTree2([1, 2, 3])
      t = t.popFront()
      t = t.popFront()
      t = t.popFront()
      expect(t.isEmpty).toBe(true)
    })

    it('pop all from back', () => {
      let t = new FingerTree2([1, 2, 3])
      t = t.popBack()
      t = t.popBack()
      t = t.popBack()
      expect(t.isEmpty).toBe(true)
    })

    it('pushFront then popBack alternating', () => {
      let t = FingerTree2.empty<number>()
      t = t.pushFront(3).pushFront(2).pushFront(1)
      expect(t.toArray()).toEqual([1, 2, 3])
      expect(t.back()).toBe(3)
      t = t.popBack()
      expect(t.toArray()).toEqual([1, 2])
    })
  })
})
