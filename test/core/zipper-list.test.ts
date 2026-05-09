import { describe, it, expect } from 'vitest'
import { ZipperList } from '../../src/core/zipper-list/zipper-list.js'

describe('ZipperList', () => {
  describe('constructor', () => {
    it('creates empty zipper with no options', () => {
      const z = new ZipperList()
      expect(z.isEmpty).toBe(true)
      expect(z.length).toBe(0)
    })

    it('creates zipper with initialValues', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect(z.length).toBe(3)
      expect(z.focus()).toBe(1)
    })

    it('creates zipper with empty initialValues', () => {
      const z = new ZipperList({ initialValues: [] })
      expect(z.isEmpty).toBe(true)
      expect(z.length).toBe(0)
    })

    it('creates zipper with single value', () => {
      const z = new ZipperList({ initialValues: [42] })
      expect(z.length).toBe(1)
      expect(z.focus()).toBe(42)
    })

    it('creates zipper with string values', () => {
      const z = new ZipperList({ initialValues: ['a', 'b', 'c'] })
      expect(z.toList()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('static from', () => {
    it('creates zipper from array', () => {
      const z = ZipperList.from([10, 20, 30])
      expect(z.length).toBe(3)
      expect(z.focus()).toBe(10)
    })

    it('creates empty zipper from empty array', () => {
      const z = ZipperList.from([])
      expect(z.isEmpty).toBe(true)
    })

    it('creates zipper preserving order', () => {
      const z = ZipperList.from([3, 1, 4, 1, 5])
      expect(z.toList()).toEqual([3, 1, 4, 1, 5])
    })
  })

  describe('focus', () => {
    it('returns first element initially', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect(z.focus()).toBe(1)
    })

    it('returns undefined for empty zipper', () => {
      const z = new ZipperList()
      expect(z.focus()).toBeUndefined()
    })

    it('returns current element after forward', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      expect(z.focus()).toBe(2)
    })

    it('returns current element after backward', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward().backward()
      expect(z.focus()).toBe(1)
    })
  })

  describe('forward', () => {
    it('moves focus right', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      expect(z.focus()).toBe(2)
    })

    it('moves focus to last element', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(2)
      expect(z.focus()).toBe(3)
    })

    it('stays at end when already at last', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(2).forward()
      expect(z.focus()).toBe(3)
      expect(z.isLast).toBe(true)
    })

    it('returns new zipper list', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      const moved = original.forward()
      expect(original.focus()).toBe(1)
      expect(moved.focus()).toBe(2)
    })

    it('does not mutate original', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      original.forward()
      expect(original.focus()).toBe(1)
    })

    it('updates left and right', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      expect(z.getLeft()).toEqual([1])
      expect(z.getRight()).toEqual([2, 3])
    })
  })

  describe('backward', () => {
    it('moves focus left', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward().backward()
      expect(z.focus()).toBe(1)
    })

    it('stays at start when already at first', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).backward()
      expect(z.focus()).toBe(1)
      expect(z.isFirst).toBe(true)
    })

    it('returns new zipper list', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      const moved = original.backward()
      expect(original.focus()).toBe(2)
      expect(moved.focus()).toBe(1)
    })

    it('does not mutate original', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      original.backward()
      expect(original.focus()).toBe(2)
    })

    it('updates left and right', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward().backward()
      expect(z.getLeft()).toEqual([])
      expect(z.getRight()).toEqual([1, 2, 3])
    })
  })

  describe('insert', () => {
    it('inserts before focus', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).insert(0)
      expect(z.toList()).toEqual([0, 1, 2, 3])
      expect(z.focus()).toBe(0)
    })

    it('inserts into empty zipper', () => {
      const z = new ZipperList().insert(42)
      expect(z.length).toBe(1)
      expect(z.focus()).toBe(42)
    })

    it('inserts at middle position', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward().insert(10)
      expect(z.toList()).toEqual([1, 10, 2, 3])
      expect(z.focus()).toBe(10)
    })

    it('does not mutate original', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      original.insert(0)
      expect(original.toList()).toEqual([1, 2, 3])
    })

    it('returns new zipper list', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      const inserted = original.insert(0)
      expect(original.length).toBe(3)
      expect(inserted.length).toBe(4)
    })

    it('can insert multiple values', () => {
      const z = new ZipperList({ initialValues: [3] }).insert(2).insert(1)
      expect(z.toList()).toEqual([1, 2, 3])
    })
  })

  describe('delete', () => {
    it('deletes the focus element', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).delete()
      expect(z.toList()).toEqual([2, 3])
      expect(z.focus()).toBe(2)
    })

    it('deletes from single element list', () => {
      const z = new ZipperList({ initialValues: [1] }).delete()
      expect(z.isEmpty).toBe(true)
      expect(z.length).toBe(0)
    })

    it('returns unchanged zipper when empty', () => {
      const z = new ZipperList().delete()
      expect(z.isEmpty).toBe(true)
    })

    it('deletes at middle position', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward().delete()
      expect(z.toList()).toEqual([1, 3])
      expect(z.focus()).toBe(3)
    })

    it('does not mutate original', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      original.delete()
      expect(original.toList()).toEqual([1, 2, 3])
    })

    it('can delete all elements', () => {
      let z = new ZipperList({ initialValues: [1, 2] })
      z = z.delete()
      expect(z.length).toBe(1)
      z = z.delete()
      expect(z.isEmpty).toBe(true)
    })
  })

  describe('replace', () => {
    it('replaces the focus element', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).replace(99)
      expect(z.toList()).toEqual([99, 2, 3])
      expect(z.focus()).toBe(99)
    })

    it('replaces at middle position', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward().replace(99)
      expect(z.toList()).toEqual([1, 99, 3])
      expect(z.focus()).toBe(99)
    })

    it('returns unchanged zipper when empty', () => {
      const z = new ZipperList().replace(99)
      expect(z.isEmpty).toBe(true)
    })

    it('does not mutate original', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      original.replace(99)
      expect(original.toList()).toEqual([1, 2, 3])
    })

    it('replaces single element', () => {
      const z = new ZipperList({ initialValues: [1] }).replace(42)
      expect(z.toList()).toEqual([42])
      expect(z.focus()).toBe(42)
    })

    it('preserves position after replace', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3, 4] }).goForward(2).replace(99)
      expect(z.getLeft()).toEqual([1, 2])
      expect(z.focus()).toBe(99)
      expect(z.getRight()).toEqual([99, 4])
    })
  })

  describe('isFirst', () => {
    it('returns true at start', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect(z.isFirst).toBe(true)
    })

    it('returns false after forward', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      expect(z.isFirst).toBe(false)
    })

    it('returns true after backward to start', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward().backward()
      expect(z.isFirst).toBe(true)
    })

    it('returns true for empty zipper', () => {
      const z = new ZipperList()
      expect(z.isFirst).toBe(true)
    })

    it('returns true for single element', () => {
      const z = new ZipperList({ initialValues: [1] })
      expect(z.isFirst).toBe(true)
    })
  })

  describe('isLast', () => {
    it('returns true at last element', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(2)
      expect(z.isLast).toBe(true)
    })

    it('returns false at first element', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect(z.isLast).toBe(false)
    })

    it('returns true for single element', () => {
      const z = new ZipperList({ initialValues: [1] })
      expect(z.isLast).toBe(true)
    })

    it('returns true for empty zipper', () => {
      const z = new ZipperList()
      expect(z.isLast).toBe(true)
    })

    it('returns false at middle', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      expect(z.isLast).toBe(false)
    })
  })

  describe('toList', () => {
    it('returns full list', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect(z.toList()).toEqual([1, 2, 3])
    })

    it('returns empty list for empty zipper', () => {
      const z = new ZipperList()
      expect(z.toList()).toEqual([])
    })

    it('preserves order after navigation', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      expect(z.toList()).toEqual([1, 2, 3])
    })

    it('preserves order after modification', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward().replace(99)
      expect(z.toList()).toEqual([1, 99, 3])
    })

    it('preserves order after insert', () => {
      const z = new ZipperList({ initialValues: [1, 3] }).forward().insert(2)
      expect(z.toList()).toEqual([1, 2, 3])
    })

    it('preserves order after delete', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward().delete()
      expect(z.toList()).toEqual([1, 3])
    })
  })

  describe('getLeft', () => {
    it('returns empty at start', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect(z.getLeft()).toEqual([])
    })

    it('returns elements left of focus', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      expect(z.getLeft()).toEqual([1])
    })

    it('returns all but last at end', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(2)
      expect(z.getLeft()).toEqual([1, 2])
    })

    it('returns empty for empty zipper', () => {
      const z = new ZipperList()
      expect(z.getLeft()).toEqual([])
    })
  })

  describe('getRight', () => {
    it('returns all elements at start', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect(z.getRight()).toEqual([1, 2, 3])
    })

    it('returns elements from focus right', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      expect(z.getRight()).toEqual([2, 3])
    })

    it('returns only focus at end', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(2)
      expect(z.getRight()).toEqual([3])
    })

    it('returns empty for empty zipper', () => {
      const z = new ZipperList()
      expect(z.getRight()).toEqual([])
    })
  })

  describe('length', () => {
    it('returns 0 for empty zipper', () => {
      const z = new ZipperList()
      expect(z.length).toBe(0)
    })

    it('returns correct length', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect(z.length).toBe(3)
    })

    it('preserves length after navigation', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      expect(z.length).toBe(3)
    })

    it('increases after insert', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).insert(0)
      expect(z.length).toBe(4)
    })

    it('decreases after delete', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).delete()
      expect(z.length).toBe(2)
    })

    it('preserves length after replace', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).replace(99)
      expect(z.length).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty zipper', () => {
      const z = new ZipperList()
      expect(z.isEmpty).toBe(true)
    })

    it('returns false for non-empty zipper', () => {
      const z = new ZipperList({ initialValues: [1] })
      expect(z.isEmpty).toBe(false)
    })

    it('returns true after deleting all elements', () => {
      const z = new ZipperList({ initialValues: [1] }).delete()
      expect(z.isEmpty).toBe(true)
    })

    it('returns false after insert into empty', () => {
      const z = new ZipperList().insert(1)
      expect(z.isEmpty).toBe(false)
    })
  })

  describe('goForward', () => {
    it('moves forward n positions', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3, 4, 5] }).goForward(3)
      expect(z.focus()).toBe(4)
    })

    it('moves forward 0 positions', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(0)
      expect(z.focus()).toBe(1)
    })

    it('clamps at end when n exceeds length', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(100)
      expect(z.focus()).toBe(3)
      expect(z.isLast).toBe(true)
    })

    it('moves forward 1 position', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(1)
      expect(z.focus()).toBe(2)
    })

    it('preserves list contents', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3, 4] }).goForward(2)
      expect(z.toList()).toEqual([1, 2, 3, 4])
    })
  })

  describe('goBackward', () => {
    it('moves backward n positions', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3, 4, 5] }).goForward(3).goBackward(2)
      expect(z.focus()).toBe(2)
    })

    it('moves backward 0 positions', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward().goBackward(0)
      expect(z.focus()).toBe(2)
    })

    it('clamps at start when n exceeds position', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward().goBackward(100)
      expect(z.focus()).toBe(1)
      expect(z.isFirst).toBe(true)
    })

    it('moves backward 1 position', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(2).goBackward(1)
      expect(z.focus()).toBe(2)
    })

    it('preserves list contents', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3, 4] }).goForward(2).goBackward(1)
      expect(z.toList()).toEqual([1, 2, 3, 4])
    })
  })

  describe('goToStart', () => {
    it('moves to start', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(2).goToStart()
      expect(z.focus()).toBe(1)
      expect(z.isFirst).toBe(true)
    })

    it('stays at start when already at start', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goToStart()
      expect(z.focus()).toBe(1)
      expect(z.isFirst).toBe(true)
    })

    it('returns unchanged zipper for empty list', () => {
      const z = new ZipperList().goToStart()
      expect(z.isEmpty).toBe(true)
    })

    it('preserves list contents', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(2).goToStart()
      expect(z.toList()).toEqual([1, 2, 3])
    })
  })

  describe('goToEnd', () => {
    it('moves to end', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goToEnd()
      expect(z.focus()).toBe(3)
      expect(z.isLast).toBe(true)
    })

    it('stays at end when already at end', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(2).goToEnd()
      expect(z.focus()).toBe(3)
    })

    it('returns unchanged zipper for empty list', () => {
      const z = new ZipperList().goToEnd()
      expect(z.isEmpty).toBe(true)
    })

    it('preserves list contents', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goToEnd()
      expect(z.toList()).toEqual([1, 2, 3])
    })
  })

  describe('find', () => {
    it('finds matching element', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect(z.find((v) => v === 2)).toBe(2)
    })

    it('returns undefined when not found', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect(z.find((v) => v === 99)).toBeUndefined()
    })

    it('finds with index', () => {
      const z = new ZipperList({ initialValues: [10, 20, 30] })
      expect(z.find((_v, i) => i === 1)).toBe(20)
    })

    it('returns undefined for empty zipper', () => {
      const z = new ZipperList()
      expect(z.find((v) => v === 1)).toBeUndefined()
    })

    it('finds first matching element', () => {
      const z = new ZipperList({ initialValues: [1, 2, 2, 3] })
      expect(z.find((v) => v === 2)).toBe(2)
    })
  })

  describe('forEach', () => {
    it('iterates all elements', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      const collected: number[] = []
      z.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const z = new ZipperList({ initialValues: [10, 20, 30] })
      const indices: number[] = []
      z.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing for empty zipper', () => {
      const z = new ZipperList()
      let count = 0
      z.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates in list order regardless of focus', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      const collected: number[] = []
      z.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })
  })

  describe('map', () => {
    it('maps all elements', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      const mapped = z.map((v) => v * 2)
      expect(mapped.toList()).toEqual([2, 4, 6])
    })

    it('provides correct indices', () => {
      const z = new ZipperList({ initialValues: [10, 20, 30] })
      const mapped = z.map((v, i) => v + i)
      expect(mapped.toList()).toEqual([10, 21, 32])
    })

    it('returns empty zipper for empty input', () => {
      const z = new ZipperList()
      const mapped = z.map((v) => v)
      expect(mapped.isEmpty).toBe(true)
    })

    it('preserves type transformation', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      const mapped = z.map((v) => String(v))
      expect(mapped.toList()).toEqual(['1', '2', '3'])
    })

    it('returns new zipper starting at beginning', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      const mapped = z.map((v) => v * 2)
      expect(mapped.focus()).toBe(2)
      expect(mapped.isFirst).toBe(true)
    })
  })

  describe('filter', () => {
    it('filters elements', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3, 4, 5] })
      const filtered = z.filter((v) => v % 2 === 0)
      expect(filtered.toList()).toEqual([2, 4])
    })

    it('provides correct indices', () => {
      const z = new ZipperList({ initialValues: [10, 20, 30] })
      const filtered = z.filter((_v, i) => i !== 1)
      expect(filtered.toList()).toEqual([10, 30])
    })

    it('returns empty zipper when nothing matches', () => {
      const z = new ZipperList({ initialValues: [1, 3, 5] })
      const filtered = z.filter((v) => v % 2 === 0)
      expect(filtered.isEmpty).toBe(true)
    })

    it('returns all elements when all match', () => {
      const z = new ZipperList({ initialValues: [2, 4, 6] })
      const filtered = z.filter((v) => v % 2 === 0)
      expect(filtered.toList()).toEqual([2, 4, 6])
    })

    it('returns empty zipper for empty input', () => {
      const z = new ZipperList()
      const filtered = z.filter(() => true)
      expect(filtered.isEmpty).toBe(true)
    })

    it('returns new zipper starting at beginning', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      const filtered = z.filter((v) => v > 0)
      expect(filtered.isFirst).toBe(true)
    })
  })

  describe('getStats', () => {
    it('returns correct stats at start', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect(z.getStats()).toEqual({ length: 3, position: 0 })
    })

    it('returns correct stats after navigation', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      expect(z.getStats()).toEqual({ length: 3, position: 1 })
    })

    it('returns correct stats at end', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).goForward(2)
      expect(z.getStats()).toEqual({ length: 3, position: 2 })
    })

    it('returns correct stats for empty', () => {
      const z = new ZipperList()
      expect(z.getStats()).toEqual({ length: 0, position: 0 })
    })

    it('returns correct stats after insert', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).insert(0)
      expect(z.getStats()).toEqual({ length: 4, position: 0 })
    })

    it('returns correct stats after delete', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).delete()
      expect(z.getStats()).toEqual({ length: 2, position: 0 })
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates all elements', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      const collected: number[] = []
      for (const item of z) {
        collected.push(item)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('works with spread', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      expect([...z]).toEqual([1, 2, 3])
    })

    it('works with empty zipper', () => {
      const z = new ZipperList()
      expect([...z]).toEqual([])
    })

    it('iterates in list order regardless of focus', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      expect([...z]).toEqual([1, 2, 3])
    })
  })

  describe('persistence', () => {
    it('old zipper unchanged after forward', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      const moved = original.forward()
      expect(original.focus()).toBe(1)
      expect(original.toList()).toEqual([1, 2, 3])
      expect(moved.focus()).toBe(2)
    })

    it('old zipper unchanged after backward', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] }).forward()
      const moved = original.backward()
      expect(original.focus()).toBe(2)
      expect(moved.focus()).toBe(1)
    })

    it('old zipper unchanged after insert', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      const inserted = original.insert(0)
      expect(original.toList()).toEqual([1, 2, 3])
      expect(inserted.toList()).toEqual([0, 1, 2, 3])
    })

    it('old zipper unchanged after delete', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      const deleted = original.delete()
      expect(original.toList()).toEqual([1, 2, 3])
      expect(deleted.toList()).toEqual([2, 3])
    })

    it('old zipper unchanged after replace', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      const replaced = original.replace(99)
      expect(original.toList()).toEqual([1, 2, 3])
      expect(replaced.toList()).toEqual([99, 2, 3])
    })

    it('old zipper unchanged after goForward', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      const moved = original.goForward(2)
      expect(original.focus()).toBe(1)
      expect(moved.focus()).toBe(3)
    })

    it('old zipper unchanged after goToStart', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] }).goForward(2)
      const moved = original.goToStart()
      expect(original.focus()).toBe(3)
      expect(moved.focus()).toBe(1)
    })

    it('old zipper unchanged after goToEnd', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      const moved = original.goToEnd()
      expect(original.focus()).toBe(1)
      expect(moved.focus()).toBe(3)
    })

    it('old zipper unchanged after map', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      original.map((v) => v * 2)
      expect(original.toList()).toEqual([1, 2, 3])
    })

    it('old zipper unchanged after filter', () => {
      const original = new ZipperList({ initialValues: [1, 2, 3] })
      original.filter((v) => v > 1)
      expect(original.toList()).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('handles empty list operations', () => {
      const z = new ZipperList()
      expect(z.forward().isEmpty).toBe(true)
      expect(z.backward().isEmpty).toBe(true)
      expect(z.delete().isEmpty).toBe(true)
      expect(z.replace(1).isEmpty).toBe(true)
      expect(z.goForward(5).isEmpty).toBe(true)
      expect(z.goBackward(5).isEmpty).toBe(true)
    })

    it('handles single element', () => {
      const z = new ZipperList({ initialValues: [42] })
      expect(z.isFirst).toBe(true)
      expect(z.isLast).toBe(true)
      expect(z.forward().focus()).toBe(42)
      expect(z.backward().focus()).toBe(42)
    })

    it('handles boundary navigation', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
      const atStart = z.backward()
      expect(atStart.isFirst).toBe(true)
      const atEnd = z.goForward(2).forward()
      expect(atEnd.isLast).toBe(true)
    })

    it('handles two elements', () => {
      const z = new ZipperList({ initialValues: [1, 2] })
      expect(z.isFirst).toBe(true)
      expect(z.isLast).toBe(false)
      const moved = z.forward()
      expect(moved.isFirst).toBe(false)
      expect(moved.isLast).toBe(true)
    })

    it('handles large list', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i)
      const z = ZipperList.from(items)
      expect(z.length).toBe(1000)
      expect(z.focus()).toBe(0)
      const atEnd = z.goToEnd()
      expect(atEnd.focus()).toBe(999)
      const atStart = atEnd.goToStart()
      expect(atStart.focus()).toBe(0)
    })

    it('handles large list forward and back', () => {
      const items = Array.from({ length: 100 }, (_, i) => i)
      const z = ZipperList.from(items).goForward(50)
      expect(z.focus()).toBe(50)
      const back = z.goBackward(25)
      expect(back.focus()).toBe(25)
    })

    it('handles consecutive inserts', () => {
      let z = new ZipperList<number>()
      for (let i = 5; i >= 1; i--) {
        z = z.insert(i)
      }
      expect(z.toList()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles consecutive deletes', () => {
      let z = new ZipperList({ initialValues: [1, 2, 3, 4, 5] })
      while (!z.isEmpty) {
        z = z.delete()
      }
      expect(z.isEmpty).toBe(true)
    })

    it('handles complex sequence of operations', () => {
      const z = new ZipperList({ initialValues: [1, 2, 3] })
        .forward()
        .replace(20)
        .forward()
        .delete()
        .insert(30)

      expect(z.toList()).toEqual([1, 20, 30])
      expect(z.focus()).toBe(30)
    })

    it('handles goForward clamping at boundary', () => {
      const z = new ZipperList({ initialValues: [1, 2] }).goForward(10)
      expect(z.focus()).toBe(2)
      expect(z.isLast).toBe(true)
    })

    it('handles goBackward clamping at boundary', () => {
      const z = new ZipperList({ initialValues: [1, 2] }).forward().goBackward(10)
      expect(z.focus()).toBe(1)
      expect(z.isFirst).toBe(true)
    })
  })

  describe('type generics', () => {
    it('works with string type', () => {
      const z = new ZipperList({ initialValues: ['hello', 'world'] })
      expect(z.focus()).toBe('hello')
      expect(z.forward().focus()).toBe('world')
    })

    it('works with object type', () => {
      const z = new ZipperList({ initialValues: [{ x: 1 }, { x: 2 }] })
      expect(z.focus()).toEqual({ x: 1 })
    })

    it('works with nullable types', () => {
      const z = new ZipperList({ initialValues: [1, null, 3] })
      expect(z.forward().focus()).toBeNull()
    })
  })
})
