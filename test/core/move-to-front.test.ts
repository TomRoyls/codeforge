import { describe, it, expect } from 'vitest'
import { MoveToFront } from '../../src/core/move-to-front/index.js'

describe('MoveToFront', () => {
  describe('constructor', () => {
    it('creates empty list with no arguments', () => {
      const mtf = new MoveToFront<number>()
      expect(mtf.size()).toBe(0)
      expect(mtf.isEmpty()).toBe(true)
      expect(mtf.toArray()).toEqual([])
    })

    it('creates list with initial items', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.size()).toBe(3)
      expect(mtf.isEmpty()).toBe(false)
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('preserves order of initial items', () => {
      const mtf = new MoveToFront<string>(['a', 'b', 'c', 'd'])
      expect(mtf.toArray()).toEqual(['a', 'b', 'c', 'd'])
    })

    it('handles single initial item', () => {
      const mtf = new MoveToFront<number>([42])
      expect(mtf.size()).toBe(1)
      expect(mtf.toArray()).toEqual([42])
    })

    it('handles empty array argument', () => {
      const mtf = new MoveToFront<number>([])
      expect(mtf.size()).toBe(0)
      expect(mtf.isEmpty()).toBe(true)
    })

    it('does not share state between instances', () => {
      const mtf1 = new MoveToFront<number>([1, 2])
      const mtf2 = new MoveToFront<number>([3, 4])
      mtf1.access(1)
      expect(mtf1.toArray()).toEqual([1, 2])
      expect(mtf2.toArray()).toEqual([3, 4])
    })

    it('works with string items', () => {
      const mtf = new MoveToFront<string>(['x', 'y', 'z'])
      expect(mtf.toArray()).toEqual(['x', 'y', 'z'])
    })

    it('works with object items by reference', () => {
      const obj = { id: 1 }
      const mtf = new MoveToFront<object>([obj])
      expect(mtf.contains(obj)).toBe(true)
    })
  })

  describe('access', () => {
    it('returns position of existing item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.access(3)).toBe(2)
    })

    it('moves accessed item to front', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(3)
      expect(mtf.toArray()).toEqual([3, 1, 2])
    })

    it('returns 0 when accessing front item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.access(1)).toBe(0)
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('returns -1 and adds to front for missing item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.access(99)).toBe(-1)
      expect(mtf.toArray()).toEqual([99, 1, 2, 3])
      expect(mtf.size()).toBe(4)
    })

    it('handles consecutive accesses', () => {
      const mtf = new MoveToFront<number>([1, 2, 3, 4, 5])
      mtf.access(3)
      expect(mtf.toArray()).toEqual([3, 1, 2, 4, 5])
      mtf.access(5)
      expect(mtf.toArray()).toEqual([5, 3, 1, 2, 4])
      mtf.access(3)
      expect(mtf.toArray()).toEqual([3, 5, 1, 2, 4])
    })

    it('accessing same item twice returns different positions', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.access(3)).toBe(2)
      expect(mtf.access(3)).toBe(0)
    })

    it('access on empty list adds item', () => {
      const mtf = new MoveToFront<number>()
      expect(mtf.access(10)).toBe(-1)
      expect(mtf.toArray()).toEqual([10])
      expect(mtf.size()).toBe(1)
    })

    it('tracks frequency on access', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(2)
      mtf.access(2)
      mtf.access(2)
      expect(mtf.frequency().get(2)).toBe(3)
    })
  })

  describe('accessAt', () => {
    it('returns item at given index', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.accessAt(0)).toBe(1)
    })

    it('moves item at index to front', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.accessAt(2)
      expect(mtf.toArray()).toEqual([3, 1, 2])
    })

    it('returns middle item and moves to front', () => {
      const mtf = new MoveToFront<number>([10, 20, 30])
      expect(mtf.accessAt(1)).toBe(20)
      expect(mtf.toArray()).toEqual([20, 10, 30])
    })

    it('throws on negative index', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(() => mtf.accessAt(-1)).toThrow(RangeError)
    })

    it('throws on index >= size', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(() => mtf.accessAt(3)).toThrow(RangeError)
      expect(() => mtf.accessAt(100)).toThrow(RangeError)
    })

    it('throws on empty list', () => {
      const mtf = new MoveToFront<number>()
      expect(() => mtf.accessAt(0)).toThrow(RangeError)
    })

    it('accessAt(0) returns front item without reorder', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.accessAt(0)).toBe(1)
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('tracks frequency on accessAt', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.accessAt(2)
      expect(mtf.frequency().get(3)).toBe(1)
    })

    it('handles last item correctly', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const val = mtf.accessAt(2)
      expect(val).toBe(3)
      expect(mtf.toArray()).toEqual([3, 1, 2])
    })
  })

  describe('contains', () => {
    it('returns true for existing item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.contains(2)).toBe(true)
    })

    it('returns false for missing item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.contains(99)).toBe(false)
    })

    it('returns false on empty list', () => {
      const mtf = new MoveToFront<number>()
      expect(mtf.contains(1)).toBe(false)
    })

    it('does not modify list order', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.contains(2)
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('returns true for front item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.contains(1)).toBe(true)
    })

    it('returns true for back item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.contains(3)).toBe(true)
    })
  })

  describe('positionOf', () => {
    it('returns correct position', () => {
      const mtf = new MoveToFront<number>([10, 20, 30])
      expect(mtf.positionOf(10)).toBe(0)
      expect(mtf.positionOf(20)).toBe(1)
      expect(mtf.positionOf(30)).toBe(2)
    })

    it('returns -1 for missing item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.positionOf(99)).toBe(-1)
    })

    it('returns -1 on empty list', () => {
      const mtf = new MoveToFront<number>()
      expect(mtf.positionOf(1)).toBe(-1)
    })

    it('does not modify list order', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.positionOf(3)
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('updates position after access', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(3)
      expect(mtf.positionOf(3)).toBe(0)
      expect(mtf.positionOf(1)).toBe(1)
      expect(mtf.positionOf(2)).toBe(2)
    })
  })

  describe('remove', () => {
    it('removes existing item and returns true', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.remove(2)).toBe(true)
      expect(mtf.toArray()).toEqual([1, 3])
      expect(mtf.size()).toBe(2)
    })

    it('returns false for missing item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.remove(99)).toBe(false)
    })

    it('removes front item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.remove(1)).toBe(true)
      expect(mtf.toArray()).toEqual([2, 3])
    })

    it('removes back item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.remove(3)).toBe(true)
      expect(mtf.toArray()).toEqual([1, 2])
    })

    it('removes single item leaving empty list', () => {
      const mtf = new MoveToFront<number>([42])
      expect(mtf.remove(42)).toBe(true)
      expect(mtf.size()).toBe(0)
      expect(mtf.isEmpty()).toBe(true)
      expect(mtf.toArray()).toEqual([])
    })

    it('removing from empty list returns false', () => {
      const mtf = new MoveToFront<number>()
      expect(mtf.remove(1)).toBe(false)
    })

    it('can remove all items one by one', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.remove(1)
      mtf.remove(2)
      mtf.remove(3)
      expect(mtf.isEmpty()).toBe(true)
    })

    it('item is no longer contained after removal', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.remove(2)
      expect(mtf.contains(2)).toBe(false)
    })

    it('clears frequency for removed item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(2)
      mtf.access(2)
      mtf.remove(2)
      expect(mtf.frequency().has(2)).toBe(false)
    })
  })

  describe('add', () => {
    it('adds new item to front', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.add(99)
      expect(mtf.toArray()).toEqual([99, 1, 2, 3])
      expect(mtf.size()).toBe(4)
    })

    it('adds to empty list', () => {
      const mtf = new MoveToFront<number>()
      mtf.add(42)
      expect(mtf.toArray()).toEqual([42])
      expect(mtf.size()).toBe(1)
    })

    it('moves existing item to front on re-add', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.add(3)
      expect(mtf.toArray()).toEqual([3, 1, 2])
      expect(mtf.size()).toBe(3)
    })

    it('multiple adds build list in reverse order', () => {
      const mtf = new MoveToFront<number>()
      mtf.add(1)
      mtf.add(2)
      mtf.add(3)
      expect(mtf.toArray()).toEqual([3, 2, 1])
    })

    it('tracks frequency when adding existing item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.add(2)
      mtf.add(2)
      expect(mtf.frequency().get(2)).toBe(2)
    })

    it('tracks frequency when adding new item', () => {
      const mtf = new MoveToFront<number>()
      mtf.add(5)
      expect(mtf.frequency().get(5)).toBe(1)
    })
  })

  describe('size and isEmpty', () => {
    it('size returns 0 for empty', () => {
      const mtf = new MoveToFront<number>()
      expect(mtf.size()).toBe(0)
    })

    it('size reflects additions', () => {
      const mtf = new MoveToFront<number>()
      mtf.add(1)
      mtf.add(2)
      expect(mtf.size()).toBe(2)
    })

    it('size reflects removals', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.remove(2)
      expect(mtf.size()).toBe(2)
    })

    it('size reflects access adding new item', () => {
      const mtf = new MoveToFront<number>([1, 2])
      mtf.access(99)
      expect(mtf.size()).toBe(3)
    })

    it('isEmpty is true after removing all items', () => {
      const mtf = new MoveToFront<number>([1])
      mtf.remove(1)
      expect(mtf.isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty list', () => {
      const mtf = new MoveToFront<number>()
      expect(mtf.toArray()).toEqual([])
    })

    it('returns items in current order', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('reflects modifications', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(3)
      expect(mtf.toArray()).toEqual([3, 1, 2])
    })

    it('returns copy not internal reference', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const arr = mtf.toArray()
      arr.push(99)
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('encode', () => {
    it('encodes a simple sequence', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const encoded = mtf.encode([1, 2, 3, 2, 1])
      expect(encoded).toEqual([0, 1, 2, 1, 2])
    })

    it('encodes with unknown items returning -1', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const encoded = mtf.encode([1, 99])
      expect(encoded[0]).toBe(0)
      expect(encoded[1]).toBe(-1)
    })

    it('encodes empty sequence', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.encode([])).toEqual([])
    })

    it('encodes single item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.encode([1])).toEqual([0])
    })

    it('encoding modifies list state', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.encode([3, 2, 1])
      expect(mtf.toArray()[0]).toBe(1)
    })

    it('encodes repeated items', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const encoded = mtf.encode([1, 1, 1])
      expect(encoded).toEqual([0, 0, 0])
    })

    it('encodes byte-like sequence', () => {
      const alphabet = Array.from({ length: 256 }, (_, i) => i)
      const mtf = new MoveToFront<number>(alphabet)
      const encoded = mtf.encode([0, 0, 0])
      expect(encoded).toEqual([0, 0, 0])
    })
  })

  describe('decode', () => {
    it('decodes a simple sequence', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const decoded = mtf.decode([0, 1, 2])
      expect(decoded).toEqual([1, 2, 3])
    })

    it('roundtrip encode/decode with same initial alphabet', () => {
      const alphabet = [1, 2, 3, 4, 5]
      const data = [1, 2, 3, 2, 1, 4, 5, 3]
      const encoder = new MoveToFront(alphabet)
      const encoded = encoder.encode(data)
      const decoder = new MoveToFront(alphabet)
      const decoded = decoder.decode(encoded)
      expect(decoded).toEqual(data)
    })

    it('roundtrip with byte values', () => {
      const alphabet = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      const data = [5, 3, 1, 9, 0, 5, 3, 1]
      const encoder = new MoveToFront(alphabet)
      const encoded = encoder.encode(data)
      const decoder = new MoveToFront(alphabet)
      const decoded = decoder.decode(encoded)
      expect(decoded).toEqual(data)
    })

    it('roundtrip with strings', () => {
      const alphabet = ['a', 'b', 'c', 'd']
      const data = ['c', 'a', 'b', 'd', 'c']
      const encoder = new MoveToFront(alphabet)
      const encoded = encoder.encode(data)
      const decoder = new MoveToFront(alphabet)
      const decoded = decoder.decode(encoded)
      expect(decoded).toEqual(data)
    })

    it('roundtrip with repeated same item', () => {
      const alphabet = [1, 2, 3]
      const data = [2, 2, 2, 2]
      const encoder = new MoveToFront(alphabet)
      const encoded = encoder.encode(data)
      const decoder = new MoveToFront(alphabet)
      const decoded = decoder.decode(encoded)
      expect(decoded).toEqual(data)
    })

    it('decode with custom alphabet', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const decoded = mtf.decode([0, 1, 2], [10, 20, 30])
      expect(decoded).toEqual([10, 20, 30])
    })

    it('decode does not modify original list', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.decode([0, 1, 2])
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('throws on out-of-bounds position in decode', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(() => mtf.decode([0, 99])).toThrow(RangeError)
    })

    it('roundtrip with single item', () => {
      const alphabet = [42]
      const data = [42, 42, 42]
      const encoder = new MoveToFront(alphabet)
      const encoded = encoder.encode(data)
      const decoder = new MoveToFront(alphabet)
      const decoded = decoder.decode(encoded)
      expect(decoded).toEqual(data)
    })

    it('roundtrip with large alphabet', () => {
      const alphabet = Array.from({ length: 100 }, (_, i) => i)
      const data = [99, 0, 50, 25, 75, 10]
      const encoder = new MoveToFront(alphabet)
      const encoded = encoder.encode(data)
      const decoder = new MoveToFront(alphabet)
      const decoded = decoder.decode(encoded)
      expect(decoded).toEqual(data)
    })
  })

  describe('reset', () => {
    it('resets to initial order', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(3)
      mtf.access(2)
      mtf.reset()
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('resets size to initial', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.add(99)
      mtf.reset()
      expect(mtf.size()).toBe(3)
    })

    it('resets after adding new items', () => {
      const mtf = new MoveToFront<number>([1, 2])
      mtf.access(99)
      mtf.reset()
      expect(mtf.toArray()).toEqual([1, 2])
      expect(mtf.contains(99)).toBe(false)
    })

    it('clears frequencies on reset', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(1)
      mtf.access(1)
      mtf.access(1)
      mtf.reset()
      expect(mtf.frequency().size).toBe(0)
    })

    it('reset on empty-initialized list', () => {
      const mtf = new MoveToFront<number>()
      mtf.add(1)
      mtf.add(2)
      mtf.reset()
      expect(mtf.isEmpty()).toBe(true)
      expect(mtf.toArray()).toEqual([])
    })

    it('multiple resets are idempotent', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(3)
      mtf.reset()
      mtf.reset()
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('frequency', () => {
    it('returns empty map for unused list', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.frequency().size).toBe(0)
    })

    it('tracks access frequency', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(1)
      mtf.access(2)
      mtf.access(1)
      const freq = mtf.frequency()
      expect(freq.get(1)).toBe(2)
      expect(freq.get(2)).toBe(1)
      expect(freq.has(3)).toBe(false)
    })

    it('tracks add frequency for existing items', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.add(1)
      expect(mtf.frequency().get(1)).toBe(1)
    })

    it('tracks accessAt frequency', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.accessAt(0)
      mtf.accessAt(0)
      mtf.accessAt(0)
      expect(mtf.frequency().get(1)).toBe(3)
    })

    it('returns a copy of the frequency map', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(1)
      const freq = mtf.frequency()
      freq.set(99, 999)
      expect(mtf.frequency().has(99)).toBe(false)
    })

    it('frequency cleared on remove', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(1)
      mtf.access(1)
      mtf.remove(1)
      expect(mtf.frequency().has(1)).toBe(false)
    })

    it('frequency counts access of new item', () => {
      const mtf = new MoveToFront<number>([1, 2])
      mtf.access(99)
      expect(mtf.frequency().get(99)).toBe(1)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const cloned = mtf.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size()).toBe(3)
    })

    it('clone preserves current order', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(3)
      const cloned = mtf.clone()
      expect(cloned.toArray()).toEqual([3, 1, 2])
    })

    it('modifications to clone do not affect original', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const cloned = mtf.clone()
      cloned.access(1)
      expect(mtf.toArray()).toEqual([1, 2, 3])
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('modifications to original do not affect clone', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const cloned = mtf.clone()
      mtf.access(3)
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('clone preserves frequencies', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(1)
      mtf.access(2)
      mtf.access(1)
      const cloned = mtf.clone()
      expect(cloned.frequency().get(1)).toBe(2)
      expect(cloned.frequency().get(2)).toBe(1)
    })

    it('clone empty list', () => {
      const mtf = new MoveToFront<number>()
      const cloned = mtf.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size()).toBe(0)
    })

    it('clone of clone works', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const clone1 = mtf.clone()
      const clone2 = clone1.clone()
      expect(clone2.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('handles alternating access pattern', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(1)
      mtf.access(3)
      mtf.access(1)
      mtf.access(3)
      expect(mtf.toArray()).toEqual([3, 1, 2])
    })

    it('handles access-add-remove cycles', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(3)
      mtf.add(99)
      mtf.remove(1)
      expect(mtf.toArray()).toEqual([99, 3, 2])
    })

    it('handles add after all items removed', () => {
      const mtf = new MoveToFront<number>([1])
      mtf.remove(1)
      expect(mtf.isEmpty()).toBe(true)
      mtf.add(2)
      expect(mtf.toArray()).toEqual([2])
    })

    it('handles access after remove and re-add', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.remove(2)
      mtf.add(2)
      expect(mtf.toArray()).toEqual([2, 1, 3])
    })

    it('handles string items throughout', () => {
      const mtf = new MoveToFront<string>(['hello', 'world', 'foo'])
      expect(mtf.access('foo')).toBe(2)
      expect(mtf.toArray()).toEqual(['foo', 'hello', 'world'])
      mtf.remove('hello')
      expect(mtf.toArray()).toEqual(['foo', 'world'])
      mtf.add('bar')
      expect(mtf.toArray()).toEqual(['bar', 'foo', 'world'])
    })

    it('handles boolean items', () => {
      const mtf = new MoveToFront<boolean>([true, false])
      expect(mtf.access(true)).toBe(0)
      expect(mtf.access(false)).toBe(1)
      expect(mtf.access(false)).toBe(0)
    })

    it('handles NaN correctly via Map', () => {
      const mtf = new MoveToFront<number>()
      mtf.add(NaN)
      expect(mtf.contains(NaN)).toBe(true)
    })
  })

  describe('duplicate handling', () => {
    it('constructor with duplicate items keeps first occurrence', () => {
      const mtf = new MoveToFront<number>([1, 2, 2, 3])
      expect(mtf.size()).toBe(3)
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('add duplicate moves to front', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.add(3)
      expect(mtf.size()).toBe(3)
      expect(mtf.toArray()).toEqual([3, 1, 2])
    })

    it('access on duplicate from constructor returns position', () => {
      const mtf = new MoveToFront<number>([1, 2, 2, 3])
      expect(mtf.positionOf(2)).toBe(1)
    })
  })

  describe('large sequences', () => {
    it('handles large initial list', () => {
      const items = Array.from({ length: 1000 }, (_, i) => i)
      const mtf = new MoveToFront(items)
      expect(mtf.size()).toBe(1000)
      expect(mtf.positionOf(999)).toBe(999)
    })

    it('handles large encode/decode roundtrip', () => {
      const alphabet = Array.from({ length: 50 }, (_, i) => i)
      const data = Array.from({ length: 200 }, () => Math.floor(Math.random() * 50))
      const encoder = new MoveToFront(alphabet)
      const encoded = encoder.encode(data)
      const decoder = new MoveToFront(alphabet)
      const decoded = decoder.decode(encoded)
      expect(decoded).toEqual(data)
    })

    it('handles sequential access pattern', () => {
      const items = Array.from({ length: 100 }, (_, i) => i)
      const mtf = new MoveToFront(items)
      for (let i = 99; i >= 0; i--) {
        mtf.access(i)
      }
      expect(mtf.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })

    it('handles many add/remove cycles', () => {
      const mtf = new MoveToFront<number>()
      for (let i = 0; i < 100; i++) {
        mtf.add(i)
      }
      for (let i = 0; i < 100; i++) {
        mtf.remove(i)
      }
      expect(mtf.isEmpty()).toBe(true)
    })

    it('handles large frequency tracking', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      for (let i = 0; i < 100; i++) {
        mtf.access(1)
      }
      expect(mtf.frequency().get(1)).toBe(100)
    })
  })

  describe('MTF transform properties', () => {
    it('all-zeros encode for accessing front repeatedly', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const encoded = mtf.encode([1, 1, 1, 1])
      expect(encoded).toEqual([0, 0, 0, 0])
    })

    it('worst case access pattern produces increasing indices', () => {
      const mtf = new MoveToFront<number>([1, 2, 3, 4, 5])
      const encoded = mtf.encode([1, 2, 3, 4, 5])
      expect(encoded).toEqual([0, 1, 2, 3, 4])
    })

    it('accessing back to front produces decreasing then zero pattern', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(3)
      expect(mtf.toArray()).toEqual([3, 1, 2])
      mtf.access(2)
      expect(mtf.toArray()).toEqual([2, 3, 1])
      mtf.access(1)
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('encode/decode roundtrip preserves exact data', () => {
      const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
      const message = 'mississippi'.split('')
      const encoder = new MoveToFront(alphabet)
      const encoded = encoder.encode(message)
      const decoder = new MoveToFront(alphabet)
      const decoded = decoder.decode(encoded)
      expect(decoded).toEqual(message)
    })
  })

  describe('additional coverage', () => {
    it('access returns correct position for middle item', () => {
      const mtf = new MoveToFront<number>([10, 20, 30, 40, 50])
      expect(mtf.access(30)).toBe(2)
      expect(mtf.toArray()).toEqual([30, 10, 20, 40, 50])
    })

    it('accessAt on single element list', () => {
      const mtf = new MoveToFront<number>([42])
      expect(mtf.accessAt(0)).toBe(42)
      expect(mtf.toArray()).toEqual([42])
    })

    it('remove middle element preserves links', () => {
      const mtf = new MoveToFront<number>([1, 2, 3, 4, 5])
      mtf.remove(3)
      expect(mtf.toArray()).toEqual([1, 2, 4, 5])
    })

    it('remove then add same item', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.remove(2)
      mtf.add(2)
      expect(mtf.toArray()).toEqual([2, 1, 3])
      expect(mtf.size()).toBe(3)
    })

    it('remove then access same item adds it back', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.remove(2)
      const pos = mtf.access(2)
      expect(pos).toBe(-1)
      expect(mtf.contains(2)).toBe(true)
    })

    it('positionOf after multiple operations', () => {
      const mtf = new MoveToFront<number>([1, 2, 3, 4, 5])
      mtf.access(5)
      mtf.access(4)
      mtf.remove(1)
      expect(mtf.positionOf(4)).toBe(0)
      expect(mtf.positionOf(5)).toBe(1)
      expect(mtf.positionOf(2)).toBe(2)
      expect(mtf.positionOf(3)).toBe(3)
    })

    it('reset after encoding', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.encode([3, 2, 1])
      mtf.reset()
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('clone after modifications', () => {
      const mtf = new MoveToFront<number>([1, 2, 3, 4, 5])
      mtf.access(5)
      mtf.remove(3)
      const cloned = mtf.clone()
      expect(cloned.toArray()).toEqual([5, 1, 2, 4])
      expect(cloned.size()).toBe(4)
    })

    it('frequency accumulation across methods', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(1)
      mtf.accessAt(0)
      mtf.add(1)
      expect(mtf.frequency().get(1)).toBe(3)
    })

    it('multiple resets with interleaved operations', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(3)
      mtf.add(99)
      mtf.reset()
      expect(mtf.toArray()).toEqual([1, 2, 3])
      mtf.access(2)
      mtf.remove(1)
      mtf.reset()
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('encode single item repeated many times', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const encoded = mtf.encode([2, 2, 2, 2, 2])
      expect(encoded).toEqual([1, 0, 0, 0, 0])
    })

    it('decode with custom alphabet different from initial', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const decoded = mtf.decode([2, 0, 1], [10, 20, 30])
      expect(decoded).toEqual([30, 30, 10])
    })

    it('accessing items with same string value', () => {
      const mtf = new MoveToFront<string>(['a', 'b', 'c'])
      expect(mtf.access('b')).toBe(1)
      expect(mtf.access('a')).toBe(1)
      expect(mtf.access('c')).toBe(2)
    })

    it('toArray after partial operations', () => {
      const mtf = new MoveToFront<number>([1, 2, 3, 4, 5])
      mtf.remove(3)
      mtf.access(5)
      mtf.add(10)
      expect(mtf.toArray()).toEqual([10, 5, 1, 2, 4])
    })

    it('large alphabet roundtrip stress test', () => {
      const alphabet = Array.from({ length: 256 }, (_, i) => i)
      const data = [0, 255, 0, 255, 128, 1, 127, 64]
      const enc = new MoveToFront(alphabet)
      const encoded = enc.encode(data)
      const dec = new MoveToFront(alphabet)
      expect(dec.decode(encoded)).toEqual(data)
    })

    it('add multiple new items sequentially', () => {
      const mtf = new MoveToFront<number>()
      mtf.add(1)
      mtf.add(2)
      mtf.add(3)
      mtf.add(4)
      expect(mtf.toArray()).toEqual([4, 3, 2, 1])
    })

    it('accessAt after previous modifications', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(3)
      expect(mtf.accessAt(1)).toBe(1)
      expect(mtf.toArray()).toEqual([1, 3, 2])
    })
  })
})
