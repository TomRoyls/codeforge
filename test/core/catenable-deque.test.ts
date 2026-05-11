import { describe, it, expect } from 'vitest'
import { CatenableDeque } from '../../src/core/catenable-deque/index.js'

describe('CatenableDeque', () => {
  describe('construction', () => {
    it('creates empty deque', () => {
      const d = CatenableDeque.empty<number>()
      expect(d.size).toBe(0)
      expect(d.isEmpty).toBe(true)
    })

    it('creates from array', () => {
      const d = CatenableDeque.fromArray([1, 2, 3])
      expect(d.size).toBe(3)
      expect(d.isEmpty).toBe(false)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('creates from empty array', () => {
      const d = CatenableDeque.fromArray([])
      expect(d.size).toBe(0)
      expect(d.isEmpty).toBe(true)
    })

    it('creates from single element', () => {
      const d = CatenableDeque.fromArray([42])
      expect(d.size).toBe(1)
      expect(d.front()).toBe(42)
      expect(d.back()).toBe(42)
    })

    it('creates with of() variadic', () => {
      const d = CatenableDeque.of(10, 20, 30)
      expect(d.toArray()).toEqual([10, 20, 30])
    })

    it('creates with of() no args', () => {
      const d = CatenableDeque.of<number>()
      expect(d.size).toBe(0)
    })

    it('creates with of() single arg', () => {
      const d = CatenableDeque.of(99)
      expect(d.size).toBe(1)
      expect(d.front()).toBe(99)
    })
  })

  describe('pushFront', () => {
    it('pushes to empty', () => {
      const d = CatenableDeque.empty<number>().pushFront(1)
      expect(d.size).toBe(1)
      expect(d.front()).toBe(1)
      expect(d.back()).toBe(1)
    })

    it('pushes multiple maintaining order', () => {
      const d = CatenableDeque.empty<number>().pushFront(1).pushFront(2).pushFront(3)
      expect(d.toArray()).toEqual([3, 2, 1])
    })

    it('preserves existing elements', () => {
      const d = CatenableDeque.fromArray([10, 20]).pushFront(5)
      expect(d.toArray()).toEqual([5, 10, 20])
    })

    it('handles many pushes', () => {
      let d = CatenableDeque.empty<number>()
      for (let i = 100; i >= 1; i--) d = d.pushFront(i)
      expect(d.size).toBe(100)
      expect(d.front()).toBe(1)
      expect(d.back()).toBe(100)
    })

    it('works with strings', () => {
      const d = CatenableDeque.empty<string>().pushFront('c').pushFront('b').pushFront('a')
      expect(d.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('works with objects', () => {
      const d = CatenableDeque.empty<{ x: number }>().pushFront({ x: 1 }).pushFront({ x: 2 })
      expect(d.size).toBe(2)
      expect(d.front()?.x).toBe(2)
    })

    it('is immutable', () => {
      const d1 = CatenableDeque.fromArray([1, 2])
      const d2 = d1.pushFront(0)
      expect(d1.toArray()).toEqual([1, 2])
      expect(d2.toArray()).toEqual([0, 1, 2])
    })
  })

  describe('pushBack', () => {
    it('pushes to empty', () => {
      const d = CatenableDeque.empty<number>().pushBack(1)
      expect(d.size).toBe(1)
      expect(d.front()).toBe(1)
      expect(d.back()).toBe(1)
    })

    it('pushes multiple maintaining order', () => {
      const d = CatenableDeque.empty<number>().pushBack(1).pushBack(2).pushBack(3)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('preserves existing elements', () => {
      const d = CatenableDeque.fromArray([10, 20]).pushBack(30)
      expect(d.toArray()).toEqual([10, 20, 30])
    })

    it('handles many pushes', () => {
      let d = CatenableDeque.empty<number>()
      for (let i = 1; i <= 100; i++) d = d.pushBack(i)
      expect(d.size).toBe(100)
      expect(d.front()).toBe(1)
      expect(d.back()).toBe(100)
    })

    it('is immutable', () => {
      const d1 = CatenableDeque.fromArray([1, 2])
      const d2 = d1.pushBack(3)
      expect(d1.toArray()).toEqual([1, 2])
      expect(d2.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('popFront', () => {
    it('pops from empty returns empty', () => {
      const d = CatenableDeque.empty<number>().popFront()
      expect(d.size).toBe(0)
      expect(d.isEmpty).toBe(true)
    })

    it('pops from single returns empty', () => {
      const d = CatenableDeque.fromArray([1]).popFront()
      expect(d.size).toBe(0)
    })

    it('pops from two returns single', () => {
      const d = CatenableDeque.fromArray([1, 2]).popFront()
      expect(d.size).toBe(1)
      expect(d.front()).toBe(2)
    })

    it('pops front element', () => {
      const d = CatenableDeque.fromArray([1, 2, 3]).popFront()
      expect(d.toArray()).toEqual([2, 3])
    })

    it('is immutable', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      const d2 = d1.popFront()
      expect(d1.toArray()).toEqual([1, 2, 3])
      expect(d2.toArray()).toEqual([2, 3])
    })

    it('pops all elements', () => {
      let d = CatenableDeque.fromArray([1, 2, 3])
      d = d.popFront().popFront().popFront()
      expect(d.size).toBe(0)
    })
  })

  describe('popBack', () => {
    it('pops from empty returns empty', () => {
      const d = CatenableDeque.empty<number>().popBack()
      expect(d.size).toBe(0)
    })

    it('pops from single returns empty', () => {
      const d = CatenableDeque.fromArray([1]).popBack()
      expect(d.size).toBe(0)
    })

    it('pops back element', () => {
      const d = CatenableDeque.fromArray([1, 2, 3]).popBack()
      expect(d.toArray()).toEqual([1, 2])
    })

    it('is immutable', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      const d2 = d1.popBack()
      expect(d1.toArray()).toEqual([1, 2, 3])
      expect(d2.toArray()).toEqual([1, 2])
    })

    it('pops all elements', () => {
      let d = CatenableDeque.fromArray([1, 2, 3])
      d = d.popBack().popBack().popBack()
      expect(d.size).toBe(0)
    })
  })

  describe('front', () => {
    it('returns undefined on empty', () => {
      expect(CatenableDeque.empty().front()).toBeUndefined()
    })

    it('returns first element', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).front()).toBe(1)
    })

    it('returns first after pushFront', () => {
      expect(CatenableDeque.fromArray([2, 3]).pushFront(1).front()).toBe(1)
    })
  })

  describe('back', () => {
    it('returns undefined on empty', () => {
      expect(CatenableDeque.empty().back()).toBeUndefined()
    })

    it('returns last element', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).back()).toBe(3)
    })

    it('returns last after pushBack', () => {
      expect(CatenableDeque.fromArray([1, 2]).pushBack(3).back()).toBe(3)
    })
  })

  describe('size', () => {
    it('returns 0 for empty', () => {
      expect(CatenableDeque.empty().size).toBe(0)
    })

    it('returns correct size after pushes', () => {
      const d = CatenableDeque.empty<number>().pushBack(1).pushBack(2).pushBack(3)
      expect(d.size).toBe(3)
    })

    it('returns correct size after pops', () => {
      const d = CatenableDeque.fromArray([1, 2, 3, 4]).popFront().popBack()
      expect(d.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('is true for empty', () => {
      expect(CatenableDeque.empty().isEmpty).toBe(true)
    })

    it('is false after push', () => {
      expect(CatenableDeque.empty().pushBack(1).isEmpty).toBe(false)
    })

    it('is true after popping all', () => {
      expect(CatenableDeque.fromArray([1]).popFront().isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('returns empty deque', () => {
      const d = CatenableDeque.fromArray([1, 2, 3]).clear()
      expect(d.size).toBe(0)
      expect(d.isEmpty).toBe(true)
    })

    it('does not mutate original', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      const d2 = d1.clear()
      expect(d1.size).toBe(3)
      expect(d2.size).toBe(0)
    })
  })

  describe('concat', () => {
    it('concatenates two empty deques', () => {
      const d = CatenableDeque.empty<number>().concat(CatenableDeque.empty())
      expect(d.size).toBe(0)
    })

    it('concatenates empty with non-empty', () => {
      const d = CatenableDeque.empty<number>().concat(CatenableDeque.fromArray([1, 2]))
      expect(d.toArray()).toEqual([1, 2])
    })

    it('concatenates non-empty with empty', () => {
      const d = CatenableDeque.fromArray([1, 2]).concat(CatenableDeque.empty())
      expect(d.toArray()).toEqual([1, 2])
    })

    it('concatenates two non-empty deques', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      const d2 = CatenableDeque.fromArray([4, 5, 6])
      const d = d1.concat(d2)
      expect(d.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('preserves original deques', () => {
      const d1 = CatenableDeque.fromArray([1, 2])
      const d2 = CatenableDeque.fromArray([3, 4])
      d1.concat(d2)
      expect(d1.toArray()).toEqual([1, 2])
      expect(d2.toArray()).toEqual([3, 4])
    })

    it('chains concatenations', () => {
      const d1 = CatenableDeque.fromArray([1])
      const d2 = CatenableDeque.fromArray([2])
      const d3 = CatenableDeque.fromArray([3])
      const result = d1.concat(d2).concat(d3)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('concatenates large deques', () => {
      let d1 = CatenableDeque.empty<number>()
      let d2 = CatenableDeque.empty<number>()
      for (let i = 0; i < 50; i++) d1 = d1.pushBack(i)
      for (let i = 50; i < 100; i++) d2 = d2.pushBack(i)
      const result = d1.concat(d2)
      expect(result.size).toBe(100)
      expect(result.front()).toBe(0)
      expect(result.back()).toBe(99)
    })

    it('concatenates single element deques', () => {
      const d1 = CatenableDeque.fromArray([1])
      const d2 = CatenableDeque.fromArray([2])
      expect(d1.concat(d2).toArray()).toEqual([1, 2])
    })

    it('handles many concatenations', () => {
      let result = CatenableDeque.empty<number>()
      for (let i = 0; i < 10; i++) {
        result = result.concat(CatenableDeque.fromArray([i * 10, i * 10 + 1]))
      }
      expect(result.size).toBe(20)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty deque', () => {
      expect(CatenableDeque.empty().toArray()).toEqual([])
    })

    it('returns elements in order', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).toArray()).toEqual([1, 2, 3])
    })

    it('returns new array each time', () => {
      const d = CatenableDeque.fromArray([1, 2, 3])
      const a1 = d.toArray()
      const a2 = d.toArray()
      a1.push(4)
      expect(a2).toEqual([1, 2, 3])
    })
  })

  describe('forEach', () => {
    it('does nothing on empty', () => {
      const items: number[] = []
      CatenableDeque.empty<number>().forEach(v => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates all elements in order', () => {
      const items: number[] = []
      CatenableDeque.fromArray([1, 2, 3]).forEach(v => items.push(v))
      expect(items).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const indices: number[] = []
      CatenableDeque.fromArray([10, 20, 30]).forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('map', () => {
    it('returns empty for empty', () => {
      const d = CatenableDeque.empty<number>().map(x => x * 2)
      expect(d.size).toBe(0)
    })

    it('maps elements', () => {
      const d = CatenableDeque.fromArray([1, 2, 3]).map(x => x * 2)
      expect(d.toArray()).toEqual([2, 4, 6])
    })

    it('preserves size', () => {
      const d = CatenableDeque.fromArray([1, 2, 3]).map(x => String(x))
      expect(d.size).toBe(3)
    })

    it('provides correct indices', () => {
      const d = CatenableDeque.fromArray([10, 20, 30]).map((v, i) => v + i)
      expect(d.toArray()).toEqual([10, 21, 32])
    })

    it('transforms types', () => {
      const d = CatenableDeque.fromArray([1, 2, 3]).map(x => `item-${x}`)
      expect(d.toArray()).toEqual(['item-1', 'item-2', 'item-3'])
    })
  })

  describe('filter', () => {
    it('returns empty for empty', () => {
      const d = CatenableDeque.empty<number>().filter(() => true)
      expect(d.size).toBe(0)
    })

    it('filters elements', () => {
      const d = CatenableDeque.fromArray([1, 2, 3, 4, 5]).filter(x => x % 2 === 0)
      expect(d.toArray()).toEqual([2, 4])
    })

    it('filters all out', () => {
      const d = CatenableDeque.fromArray([1, 2, 3]).filter(() => false)
      expect(d.size).toBe(0)
    })

    it('keeps all', () => {
      const d = CatenableDeque.fromArray([1, 2, 3]).filter(() => true)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const d = CatenableDeque.fromArray([10, 20, 30, 40]).filter((_, i) => i % 2 === 0)
      expect(d.toArray()).toEqual([10, 30])
    })
  })

  describe('reverse', () => {
    it('reverses empty', () => {
      expect(CatenableDeque.empty().reverse().toArray()).toEqual([])
    })

    it('reverses single', () => {
      expect(CatenableDeque.fromArray([1]).reverse().toArray()).toEqual([1])
    })

    it('reverses multiple', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).reverse().toArray()).toEqual([3, 2, 1])
    })

    it('does not mutate original', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      d1.reverse()
      expect(d1.toArray()).toEqual([1, 2, 3])
    })

    it('double reverse restores order', () => {
      const d = CatenableDeque.fromArray([1, 2, 3]).reverse().reverse()
      expect(d.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('clone', () => {
    it('clones empty', () => {
      const d = CatenableDeque.empty().clone()
      expect(d.size).toBe(0)
    })

    it('clones with elements', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      const d2 = d1.clone()
      expect(d2.toArray()).toEqual([1, 2, 3])
    })

    it('produces independent copy', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      const d2 = d1.clone()
      expect(d2.toArray()).toEqual(d1.toArray())
    })
  })

  describe('reduce', () => {
    it('returns initial for empty', () => {
      expect(CatenableDeque.empty<number>().reduce((a, b) => a + b, 0)).toBe(0)
    })

    it('sums elements', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).reduce((a, b) => a + b, 0)).toBe(6)
    })

    it('concatenates strings', () => {
      expect(CatenableDeque.fromArray(['a', 'b', 'c']).reduce((a, b) => a + b, '')).toBe('abc')
    })
  })

  describe('find', () => {
    it('returns undefined for empty', () => {
      expect(CatenableDeque.empty<number>().find(() => true)).toBeUndefined()
    })

    it('finds matching element', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).find(x => x > 1)).toBe(2)
    })

    it('returns undefined when not found', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).find(x => x > 10)).toBeUndefined()
    })
  })

  describe('findIndex', () => {
    it('returns -1 for empty', () => {
      expect(CatenableDeque.empty<number>().findIndex(() => true)).toBe(-1)
    })

    it('finds index', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).findIndex(x => x === 2)).toBe(1)
    })

    it('returns -1 when not found', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).findIndex(x => x === 99)).toBe(-1)
    })
  })

  describe('some', () => {
    it('returns false for empty', () => {
      expect(CatenableDeque.empty<number>().some(() => true)).toBe(false)
    })

    it('returns true when match exists', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).some(x => x === 2)).toBe(true)
    })

    it('returns false when no match', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).some(x => x > 10)).toBe(false)
    })
  })

  describe('every', () => {
    it('returns true for empty', () => {
      expect(CatenableDeque.empty<number>().every(() => false)).toBe(true)
    })

    it('returns true when all match', () => {
      expect(CatenableDeque.fromArray([2, 4, 6]).every(x => x % 2 === 0)).toBe(true)
    })

    it('returns false when some dont match', () => {
      expect(CatenableDeque.fromArray([2, 3, 6]).every(x => x % 2 === 0)).toBe(false)
    })
  })

  describe('contains', () => {
    it('returns false for empty', () => {
      expect(CatenableDeque.empty<number>().contains(1)).toBe(false)
    })

    it('returns true when present', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).contains(2)).toBe(true)
    })

    it('returns false when absent', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).contains(99)).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('returns -1 for empty', () => {
      expect(CatenableDeque.empty<number>().indexOf(1)).toBe(-1)
    })

    it('returns index when found', () => {
      expect(CatenableDeque.fromArray([10, 20, 30]).indexOf(20)).toBe(1)
    })

    it('returns -1 when not found', () => {
      expect(CatenableDeque.fromArray([10, 20, 30]).indexOf(99)).toBe(-1)
    })

    it('returns first occurrence', () => {
      expect(CatenableDeque.fromArray([1, 2, 2, 3]).indexOf(2)).toBe(1)
    })
  })

  describe('lastIndexOf', () => {
    it('returns -1 for empty', () => {
      expect(CatenableDeque.empty<number>().lastIndexOf(1)).toBe(-1)
    })

    it('returns last occurrence', () => {
      expect(CatenableDeque.fromArray([1, 2, 2, 3]).lastIndexOf(2)).toBe(2)
    })

    it('returns -1 when not found', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).lastIndexOf(99)).toBe(-1)
    })
  })

  describe('get', () => {
    it('returns undefined for empty', () => {
      expect(CatenableDeque.empty<number>().get(0)).toBeUndefined()
    })

    it('returns element at index', () => {
      expect(CatenableDeque.fromArray([10, 20, 30]).get(1)).toBe(20)
    })

    it('returns undefined for negative index', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).get(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).get(5)).toBeUndefined()
    })

    it('returns first element', () => {
      expect(CatenableDeque.fromArray([10, 20, 30]).get(0)).toBe(10)
    })

    it('returns last element', () => {
      expect(CatenableDeque.fromArray([10, 20, 30]).get(2)).toBe(30)
    })
  })

  describe('slice', () => {
    it('slices empty', () => {
      expect(CatenableDeque.empty<number>().slice().toArray()).toEqual([])
    })

    it('slices entire deque', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).slice().toArray()).toEqual([1, 2, 3])
    })

    it('slices from start', () => {
      expect(CatenableDeque.fromArray([1, 2, 3, 4, 5]).slice(0, 3).toArray()).toEqual([1, 2, 3])
    })

    it('slices from middle', () => {
      expect(CatenableDeque.fromArray([1, 2, 3, 4, 5]).slice(2, 4).toArray()).toEqual([3, 4])
    })

    it('slices to end', () => {
      expect(CatenableDeque.fromArray([1, 2, 3, 4, 5]).slice(2).toArray()).toEqual([3, 4, 5])
    })
  })

  describe('take', () => {
    it('takes 0 from empty', () => {
      expect(CatenableDeque.empty<number>().take(0).size).toBe(0)
    })

    it('takes first n elements', () => {
      expect(CatenableDeque.fromArray([1, 2, 3, 4, 5]).take(3).toArray()).toEqual([1, 2, 3])
    })

    it('takes more than size returns all', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).take(10).toArray()).toEqual([1, 2, 3])
    })

    it('takes 0 returns empty', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).take(0).size).toBe(0)
    })

    it('takes negative returns empty', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).take(-1).size).toBe(0)
    })
  })

  describe('drop', () => {
    it('drops 0 from empty', () => {
      expect(CatenableDeque.empty<number>().drop(0).size).toBe(0)
    })

    it('drops first n elements', () => {
      expect(CatenableDeque.fromArray([1, 2, 3, 4, 5]).drop(2).toArray()).toEqual([3, 4, 5])
    })

    it('drops more than size returns empty', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).drop(10).size).toBe(0)
    })

    it('drops 0 returns copy', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).drop(0).toArray()).toEqual([1, 2, 3])
    })
  })

  describe('join', () => {
    it('joins empty', () => {
      expect(CatenableDeque.empty().join()).toBe('')
    })

    it('joins with default separator', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).join()).toBe('1,2,3')
    })

    it('joins with custom separator', () => {
      expect(CatenableDeque.fromArray(['a', 'b', 'c']).join('-')).toBe('a-b-c')
    })
  })

  describe('equals', () => {
    it('empty equals empty', () => {
      expect(CatenableDeque.empty<number>().equals(CatenableDeque.empty())).toBe(true)
    })

    it('same elements are equal', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).equals(CatenableDeque.fromArray([1, 2, 3]))).toBe(true)
    })

    it('different sizes not equal', () => {
      expect(CatenableDeque.fromArray([1, 2]).equals(CatenableDeque.fromArray([1, 2, 3]))).toBe(false)
    })

    it('different elements not equal', () => {
      expect(CatenableDeque.fromArray([1, 2, 3]).equals(CatenableDeque.fromArray([1, 2, 4]))).toBe(false)
    })

    it('uses custom comparator', () => {
      const d1 = CatenableDeque.fromArray([{ x: 1 }, { x: 2 }])
      const d2 = CatenableDeque.fromArray([{ x: 1 }, { x: 2 }])
      expect(d1.equals(d2, (a, b) => a.x === b.x)).toBe(true)
    })
  })

  describe('flatMap', () => {
    it('returns empty for empty', () => {
      expect(CatenableDeque.empty<number>().flatMap(x => CatenableDeque.of(x)).size).toBe(0)
    })

    it('flattens mapped results', () => {
      const d = CatenableDeque.fromArray([1, 2, 3]).flatMap(x => CatenableDeque.of(x, x * 10))
      expect(d.toArray()).toEqual([1, 10, 2, 20, 3, 30])
    })

    it('handles empty inner deques', () => {
      const d = CatenableDeque.fromArray([1, 2, 3]).flatMap(x =>
        x % 2 === 0 ? CatenableDeque.of(x) : CatenableDeque.empty()
      )
      expect(d.toArray()).toEqual([2])
    })
  })

  describe('iterator', () => {
    it('iterates empty', () => {
      const items: number[] = []
      for (const v of CatenableDeque.empty<number>()) items.push(v)
      expect(items).toEqual([])
    })

    it('iterates elements in order', () => {
      const items: number[] = []
      for (const v of CatenableDeque.fromArray([1, 2, 3])) items.push(v)
      expect(items).toEqual([1, 2, 3])
    })

    it('works with spread', () => {
      const arr = [...CatenableDeque.fromArray([1, 2, 3])]
      expect(arr).toEqual([1, 2, 3])
    })

    it('works with Array.from', () => {
      const arr = Array.from(CatenableDeque.fromArray([4, 5, 6]))
      expect(arr).toEqual([4, 5, 6])
    })

    it('works with destructuring', () => {
      const [a, b, c] = CatenableDeque.fromArray([1, 2, 3])
      expect([a, b, c]).toEqual([1, 2, 3])
    })
  })

  describe('stats', () => {
    it('returns stats for empty', () => {
      const s = CatenableDeque.empty().stats()
      expect(s.size).toBe(0)
      expect(s.depth).toBe(0)
    })

    it('returns stats for non-empty', () => {
      const s = CatenableDeque.fromArray([1, 2, 3]).stats()
      expect(s.size).toBe(3)
      expect(s.depth).toBeGreaterThan(0)
    })
  })

  describe('combined operations', () => {
    it('push and pop interleaved', () => {
      let d = CatenableDeque.empty<number>()
      d = d.pushBack(1)
      d = d.pushBack(2)
      d = d.pushFront(0)
      expect(d.toArray()).toEqual([0, 1, 2])
      d = d.popFront()
      expect(d.toArray()).toEqual([1, 2])
      d = d.popBack()
      expect(d.toArray()).toEqual([1])
    })

    it('concat then pop', () => {
      const d1 = CatenableDeque.fromArray([1, 2])
      const d2 = CatenableDeque.fromArray([3, 4])
      const d = d1.concat(d2).popFront()
      expect(d.toArray()).toEqual([2, 3, 4])
    })

    it('map then filter', () => {
      const d = CatenableDeque.fromArray([1, 2, 3, 4])
        .map(x => x * 2)
        .filter(x => x > 4)
      expect(d.toArray()).toEqual([6, 8])
    })

    it('filter then map', () => {
      const d = CatenableDeque.fromArray([1, 2, 3, 4])
        .filter(x => x % 2 === 0)
        .map(x => x * 10)
      expect(d.toArray()).toEqual([20, 40])
    })

    it('reverse then concat', () => {
      const d1 = CatenableDeque.fromArray([1, 2]).reverse()
      const d2 = CatenableDeque.fromArray([3, 4])
      expect(d1.concat(d2).toArray()).toEqual([2, 1, 3, 4])
    })

    it('concat then reverse', () => {
      const d1 = CatenableDeque.fromArray([1, 2])
      const d2 = CatenableDeque.fromArray([3, 4])
      expect(d1.concat(d2).reverse().toArray()).toEqual([4, 3, 2, 1])
    })

    it('take then drop', () => {
      const d = CatenableDeque.fromArray([1, 2, 3, 4, 5]).take(4).drop(1)
      expect(d.toArray()).toEqual([2, 3, 4])
    })

    it('map after concat', () => {
      const d = CatenableDeque.fromArray([1, 2])
        .concat(CatenableDeque.fromArray([3, 4]))
        .map(x => x * 10)
      expect(d.toArray()).toEqual([10, 20, 30, 40])
    })

    it('filter after concat', () => {
      const d = CatenableDeque.fromArray([1, 2, 3])
        .concat(CatenableDeque.fromArray([4, 5, 6]))
        .filter(x => x % 2 === 0)
      expect(d.toArray()).toEqual([2, 4, 6])
    })
  })

  describe('stress tests', () => {
    it('handles 1000 pushes', () => {
      let d = CatenableDeque.empty<number>()
      for (let i = 0; i < 1000; i++) d = d.pushBack(i)
      expect(d.size).toBe(1000)
      expect(d.front()).toBe(0)
      expect(d.back()).toBe(999)
    })

    it('handles 1000 front pushes', () => {
      let d = CatenableDeque.empty<number>()
      for (let i = 0; i < 1000; i++) d = d.pushFront(i)
      expect(d.size).toBe(1000)
      expect(d.front()).toBe(999)
      expect(d.back()).toBe(0)
    })

    it('handles alternating pushes', () => {
      let d = CatenableDeque.empty<number>()
      for (let i = 0; i < 500; i++) {
        d = d.pushFront(i)
        d = d.pushBack(i + 1000)
      }
      expect(d.size).toBe(1000)
    })

    it('handles push then pop all', () => {
      let d = CatenableDeque.empty<number>()
      for (let i = 0; i < 100; i++) d = d.pushBack(i)
      for (let i = 0; i < 100; i++) d = d.popFront()
      expect(d.size).toBe(0)
    })

    it('handles many concatenations', () => {
      const deques: CatenableDeque<number>[] = []
      for (let i = 0; i < 20; i++) {
        deques.push(CatenableDeque.fromArray([i * 5, i * 5 + 1, i * 5 + 2, i * 5 + 3, i * 5 + 4]))
      }
      let result = deques[0]!
      for (let i = 1; i < deques.length; i++) {
        result = result.concat(deques[i]!)
      }
      expect(result.size).toBe(100)
      expect(result.front()).toBe(0)
      expect(result.back()).toBe(99)
    })

    it('handles reduce over large deque', () => {
      let d = CatenableDeque.empty<number>()
      for (let i = 1; i <= 100; i++) d = d.pushBack(i)
      expect(d.reduce((a, b) => a + b, 0)).toBe(5050)
    })

    it('handles map over large deque', () => {
      let d = CatenableDeque.empty<number>()
      for (let i = 0; i < 100; i++) d = d.pushBack(i)
      const mapped = d.map(x => x * 2)
      expect(mapped.size).toBe(100)
      expect(mapped.front()).toBe(0)
      expect(mapped.back()).toBe(198)
    })

    it('handles filter over large deque', () => {
      let d = CatenableDeque.empty<number>()
      for (let i = 0; i < 100; i++) d = d.pushBack(i)
      const filtered = d.filter(x => x % 2 === 0)
      expect(filtered.size).toBe(50)
    })

    it('handles reverse of large deque', () => {
      let d = CatenableDeque.empty<number>()
      for (let i = 0; i < 100; i++) d = d.pushBack(i)
      const r = d.reverse()
      expect(r.front()).toBe(99)
      expect(r.back()).toBe(0)
    })

    it('handles forEach over large deque', () => {
      let d = CatenableDeque.empty<number>()
      for (let i = 0; i < 100; i++) d = d.pushBack(i)
      let sum = 0
      d.forEach(v => { sum += v })
      expect(sum).toBe(4950)
    })
  })

  describe('generics', () => {
    it('works with strings', () => {
      const d = CatenableDeque.fromArray(['hello', 'world'])
      expect(d.front()).toBe('hello')
      expect(d.back()).toBe('world')
    })

    it('works with objects', () => {
      const d = CatenableDeque.fromArray([{ id: 1 }, { id: 2 }])
      expect(d.front()?.id).toBe(1)
      expect(d.back()?.id).toBe(2)
    })

    it('works with null', () => {
      const d = CatenableDeque.fromArray([null, null, null])
      expect(d.size).toBe(3)
    })

    it('works with undefined', () => {
      const d = CatenableDeque.fromArray([undefined, undefined])
      expect(d.size).toBe(2)
    })

    it('works with mixed number types', () => {
      const d = CatenableDeque.fromArray([1, 2.5, -3, 0])
      expect(d.size).toBe(4)
      expect(d.toArray()).toEqual([1, 2.5, -3, 0])
    })

    it('works with boolean', () => {
      const d = CatenableDeque.fromArray([true, false, true])
      expect(d.filter(x => x).toArray()).toEqual([true, true])
    })
  })

  describe('immutability', () => {
    it('pushFront does not mutate', () => {
      const d1 = CatenableDeque.fromArray([1, 2])
      d1.pushFront(0)
      expect(d1.toArray()).toEqual([1, 2])
    })

    it('pushBack does not mutate', () => {
      const d1 = CatenableDeque.fromArray([1, 2])
      d1.pushBack(3)
      expect(d1.toArray()).toEqual([1, 2])
    })

    it('popFront does not mutate', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      d1.popFront()
      expect(d1.toArray()).toEqual([1, 2, 3])
    })

    it('popBack does not mutate', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      d1.popBack()
      expect(d1.toArray()).toEqual([1, 2, 3])
    })

    it('concat does not mutate', () => {
      const d1 = CatenableDeque.fromArray([1, 2])
      const d2 = CatenableDeque.fromArray([3, 4])
      d1.concat(d2)
      expect(d1.toArray()).toEqual([1, 2])
      expect(d2.toArray()).toEqual([3, 4])
    })

    it('map does not mutate', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      d1.map(x => x * 2)
      expect(d1.toArray()).toEqual([1, 2, 3])
    })

    it('filter does not mutate', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      d1.filter(x => x > 1)
      expect(d1.toArray()).toEqual([1, 2, 3])
    })

    it('reverse does not mutate', () => {
      const d1 = CatenableDeque.fromArray([1, 2, 3])
      d1.reverse()
      expect(d1.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('pop front then push back', () => {
      const d = CatenableDeque.fromArray([1, 2]).popFront().pushBack(3)
      expect(d.toArray()).toEqual([2, 3])
    })

    it('pop back then push front', () => {
      const d = CatenableDeque.fromArray([1, 2]).popBack().pushFront(0)
      expect(d.toArray()).toEqual([0, 1])
    })

    it('empty concat empty', () => {
      const d = CatenableDeque.empty<number>().concat(CatenableDeque.empty())
      expect(d.size).toBe(0)
    })

    it('single element operations', () => {
      let d = CatenableDeque.of(42)
      expect(d.front()).toBe(42)
      expect(d.back()).toBe(42)
      expect(d.size).toBe(1)
      d = d.popFront()
      expect(d.size).toBe(0)
      d = d.pushBack(99)
      expect(d.front()).toBe(99)
    })

    it('concat self', () => {
      const d = CatenableDeque.fromArray([1, 2, 3])
      const doubled = d.concat(d)
      expect(doubled.toArray()).toEqual([1, 2, 3, 1, 2, 3])
    })

    it('multiple front/back operations on two elements', () => {
      let d = CatenableDeque.fromArray([1, 2])
      d = d.popFront()
      expect(d.toArray()).toEqual([2])
      d = d.pushFront(10)
      expect(d.toArray()).toEqual([10, 2])
      d = d.popBack()
      expect(d.toArray()).toEqual([10])
    })

    it('large to array preserves order', () => {
      const items = Array.from({ length: 50 }, (_, i) => i)
      const d = CatenableDeque.fromArray(items)
      expect(d.toArray()).toEqual(items)
    })
  })
})
