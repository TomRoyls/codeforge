import { describe, it, expect } from 'vitest'
import { SinglyLinkedList } from '../../src/core/singly-linked-list/singly-linked-list.js'

describe('SinglyLinkedList', () => {
  describe('constructor', () => {
    it('creates empty list with no options', () => {
      const list = new SinglyLinkedList()
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('creates list with initialValues', () => {
      const list = new SinglyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.size()).toBe(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('creates list with comparator', () => {
      const list = new SinglyLinkedList<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
        initialValues: ['A', 'b', 'C'],
      })
      expect(list.contains('a')).toBe(true)
      expect(list.contains('B')).toBe(true)
    })

    it('creates list with empty initialValues', () => {
      const list = new SinglyLinkedList({ initialValues: [] })
      expect(list.size()).toBe(0)
    })
  })

  describe('pushFront', () => {
    it('pushes to empty list', () => {
      const list = new SinglyLinkedList<number>()
      list.pushFront(1)
      expect(list.size()).toBe(1)
      expect(list.peekFront()).toBe(1)
      expect(list.peekBack()).toBe(1)
    })

    it('pushes to non-empty list', () => {
      const list = new SinglyLinkedList<number>()
      list.pushFront(2)
      list.pushFront(1)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('pushes multiple values', () => {
      const list = new SinglyLinkedList<number>()
      list.pushFront(3)
      list.pushFront(2)
      list.pushFront(1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('pushBack', () => {
    it('pushes to empty list', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      expect(list.size()).toBe(1)
      expect(list.peekFront()).toBe(1)
      expect(list.peekBack()).toBe(1)
    })

    it('pushes to non-empty list', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('pushes multiple values', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      list.pushBack(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('popFront', () => {
    it('returns undefined on empty list', () => {
      const list = new SinglyLinkedList()
      expect(list.popFront()).toBeUndefined()
    })

    it('pops from single-element list', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      expect(list.popFront()).toBe(1)
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('pops from multi-element list', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      list.pushBack(3)
      expect(list.popFront()).toBe(1)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('pops all elements', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      expect(list.popFront()).toBe(1)
      expect(list.popFront()).toBe(2)
      expect(list.popFront()).toBeUndefined()
    })
  })

  describe('popBack', () => {
    it('returns undefined on empty list', () => {
      const list = new SinglyLinkedList()
      expect(list.popBack()).toBeUndefined()
    })

    it('pops from single-element list', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      expect(list.popBack()).toBe(1)
      expect(list.size()).toBe(0)
    })

    it('pops from multi-element list', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      list.pushBack(3)
      expect(list.popBack()).toBe(3)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('pops all elements', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      expect(list.popBack()).toBe(2)
      expect(list.popBack()).toBe(1)
      expect(list.popBack()).toBeUndefined()
    })
  })

  describe('peekFront', () => {
    it('returns undefined on empty list', () => {
      const list = new SinglyLinkedList()
      expect(list.peekFront()).toBeUndefined()
    })

    it('returns front element without removing', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      expect(list.peekFront()).toBe(1)
      expect(list.size()).toBe(2)
    })
  })

  describe('peekBack', () => {
    it('returns undefined on empty list', () => {
      const list = new SinglyLinkedList()
      expect(list.peekBack()).toBeUndefined()
    })

    it('returns back element without removing', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      expect(list.peekBack()).toBe(2)
      expect(list.size()).toBe(2)
    })
  })

  describe('get', () => {
    it('returns undefined for out of bounds', () => {
      const list = new SinglyLinkedList<number>()
      expect(list.get(-1)).toBeUndefined()
      expect(list.get(0)).toBeUndefined()
      expect(list.get(1)).toBeUndefined()
    })

    it('returns value at valid index', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [10, 20, 30] })
      expect(list.get(0)).toBe(10)
      expect(list.get(1)).toBe(20)
      expect(list.get(2)).toBe(30)
    })

    it('returns undefined for index equal to size', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      expect(list.get(2)).toBeUndefined()
    })
  })

  describe('set', () => {
    it('returns false for out of bounds', () => {
      const list = new SinglyLinkedList<number>()
      expect(list.set(0, 1)).toBe(false)
      expect(list.set(-1, 1)).toBe(false)
    })

    it('sets value at valid index', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.set(1, 99)).toBe(true)
      expect(list.get(1)).toBe(99)
    })

    it('sets first and last elements', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.set(0, 10)).toBe(true)
      expect(list.set(2, 30)).toBe(true)
      expect(list.toArray()).toEqual([10, 2, 30])
    })
  })

  describe('insertAt', () => {
    it('inserts at front when index <= 0', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [2, 3] })
      list.insertAt(0, 1)
      expect(list.toArray()).toEqual([1, 2, 3])
      list.insertAt(-5, 0)
      expect(list.toArray()).toEqual([0, 1, 2, 3])
    })

    it('inserts at back when index >= size', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      list.insertAt(10, 3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in the middle', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 3] })
      list.insertAt(1, 2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('inserts into empty list', () => {
      const list = new SinglyLinkedList<number>()
      list.insertAt(0, 1)
      expect(list.toArray()).toEqual([1])
    })
  })

  describe('removeAt', () => {
    it('returns undefined for out of bounds', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1] })
      expect(list.removeAt(-1)).toBeUndefined()
      expect(list.removeAt(1)).toBeUndefined()
    })

    it('removes first element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.removeAt(0)).toBe(1)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('removes last element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.removeAt(2)).toBe(3)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('removes middle element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.removeAt(1)).toBe(2)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('removes only element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [42] })
      expect(list.removeAt(0)).toBe(42)
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('remove', () => {
    it('returns false for empty list', () => {
      const list = new SinglyLinkedList<number>()
      expect(list.remove(1)).toBe(false)
    })

    it('removes head element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.remove(1)).toBe(true)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('removes tail element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.remove(3)).toBe(true)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('removes middle element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.remove(2)).toBe(true)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('returns false when not found', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.remove(99)).toBe(false)
    })

    it('removes first occurrence only', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 1] })
      list.remove(1)
      expect(list.toArray()).toEqual([2, 1])
    })

    it('uses comparator for equality', () => {
      const list = new SinglyLinkedList<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
        initialValues: ['Hello', 'World'],
      })
      expect(list.remove('hello')).toBe(true)
      expect(list.toArray()).toEqual(['World'])
    })
  })

  describe('indexOf', () => {
    it('returns -1 for empty list', () => {
      const list = new SinglyLinkedList<number>()
      expect(list.indexOf(1)).toBe(-1)
    })

    it('returns index of found element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [10, 20, 30] })
      expect(list.indexOf(20)).toBe(1)
    })

    it('returns -1 when not found', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.indexOf(99)).toBe(-1)
    })

    it('returns first occurrence index', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 1] })
      expect(list.indexOf(1)).toBe(0)
    })
  })

  describe('contains', () => {
    it('returns false for empty list', () => {
      const list = new SinglyLinkedList<number>()
      expect(list.contains(1)).toBe(false)
    })

    it('returns true when found', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.contains(2)).toBe(true)
    })

    it('returns false when not found', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.contains(99)).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty', () => {
      const list = new SinglyLinkedList()
      expect(list.size()).toBe(0)
    })

    it('returns correct size after operations', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      expect(list.size()).toBe(1)
      list.pushBack(2)
      expect(list.size()).toBe(2)
      list.popFront()
      expect(list.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty list', () => {
      const list = new SinglyLinkedList()
      expect(list.isEmpty()).toBe(true)
    })

    it('returns false for non-empty list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1] })
      expect(list.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears empty list', () => {
      const list = new SinglyLinkedList()
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })

    it('clears non-empty list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      list.clear()
      expect(list.isEmpty()).toBe(true)
      expect(list.size()).toBe(0)
      expect(list.peekFront()).toBeUndefined()
      expect(list.peekBack()).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty list', () => {
      const list = new SinglyLinkedList()
      expect(list.toArray()).toEqual([])
    })

    it('returns array of values', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('fromArray', () => {
    it('replaces contents with array', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      list.fromArray([10, 20, 30])
      expect(list.toArray()).toEqual([10, 20, 30])
    })

    it('handles empty array', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      list.fromArray([])
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('reverse', () => {
    it('handles empty list', () => {
      const list = new SinglyLinkedList<number>()
      list.reverse()
      expect(list.toArray()).toEqual([])
    })

    it('handles single element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1] })
      list.reverse()
      expect(list.toArray()).toEqual([1])
    })

    it('reverses two elements', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      list.reverse()
      expect(list.toArray()).toEqual([2, 1])
    })

    it('reverses multiple elements', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3, 4, 5] })
      list.reverse()
      expect(list.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('maintains head and tail pointers', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      list.reverse()
      expect(list.peekFront()).toBe(3)
      expect(list.peekBack()).toBe(1)
    })
  })

  describe('find', () => {
    it('returns undefined for empty list', () => {
      const list = new SinglyLinkedList<number>()
      expect(list.find(v => v > 0)).toBeUndefined()
    })

    it('returns first matching element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3, 4] })
      expect(list.find(v => v > 2)).toBe(3)
    })

    it('returns undefined when no match', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect(list.find(v => v > 10)).toBeUndefined()
    })

    it('passes index to callback', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [10, 20, 30] })
      const found = list.find((_v, i) => i === 1)
      expect(found).toBe(20)
    })
  })

  describe('filter', () => {
    it('returns empty list for empty input', () => {
      const list = new SinglyLinkedList<number>()
      const result = list.filter(v => v > 0)
      expect(result.size()).toBe(0)
    })

    it('filters elements', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3, 4, 5] })
      const result = list.filter(v => v % 2 === 0)
      expect(result.toArray()).toEqual([2, 4])
    })

    it('returns empty when nothing matches', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 3, 5] })
      const result = list.filter(v => v % 2 === 0)
      expect(result.isEmpty()).toBe(true)
    })

    it('does not modify original list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      list.filter(v => v > 1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('map', () => {
    it('returns empty list for empty input', () => {
      const list = new SinglyLinkedList<number>()
      const result = list.map(v => v * 2)
      expect(result.isEmpty()).toBe(true)
    })

    it('maps elements to new values', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      const result = list.map(v => v * 2)
      expect(result.toArray()).toEqual([2, 4, 6])
    })

    it('maps to different type', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      const result = list.map(v => `num:${v}`)
      expect(result.toArray()).toEqual(['num:1', 'num:2', 'num:3'])
    })

    it('passes index to callback', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [10, 20] })
      const result = list.map((_v, i) => i)
      expect(result.toArray()).toEqual([0, 1])
    })
  })

  describe('reduce', () => {
    it('returns initial value for empty list', () => {
      const list = new SinglyLinkedList<number>()
      expect(list.reduce((acc, v) => acc + v, 0)).toBe(0)
    })

    it('sums elements', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3, 4] })
      expect(list.reduce((acc, v) => acc + v, 0)).toBe(10)
    })

    it('builds a string', () => {
      const list = new SinglyLinkedList<string>({ initialValues: ['a', 'b', 'c'] })
      expect(list.reduce((acc, v) => acc + v, '')).toBe('abc')
    })

    it('passes index to callback', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [10, 20, 30] })
      const result = list.reduce((acc, _v, i) => acc + i, 0)
      expect(result).toBe(3)
    })
  })

  describe('forEach', () => {
    it('does nothing on empty list', () => {
      const list = new SinglyLinkedList<number>()
      const items: number[] = []
      list.forEach(v => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates all elements in order', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      const items: number[] = []
      list.forEach(v => items.push(v))
      expect(items).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [10, 20, 30] })
      const indices: number[] = []
      list.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('forEachReverse', () => {
    it('does nothing on empty list', () => {
      const list = new SinglyLinkedList<number>()
      const items: number[] = []
      list.forEachReverse(v => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates all elements in reverse order', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      const items: number[] = []
      list.forEachReverse(v => items.push(v))
      expect(items).toEqual([3, 2, 1])
    })

    it('provides correct reverse indices', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [10, 20, 30] })
      const indices: number[] = []
      list.forEachReverse((_v, i) => indices.push(i))
      expect(indices).toEqual([2, 1, 0])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates empty list', () => {
      const list = new SinglyLinkedList<number>()
      const items: number[] = []
      for (const v of list) {
        items.push(v)
      }
      expect(items).toEqual([])
    })

    it('iterates non-empty list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      const items: number[] = []
      for (const v of list) {
        items.push(v)
      }
      expect(items).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      expect([...list]).toEqual([1, 2, 3])
    })

    it('works with Array.from', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [5, 6, 7] })
      expect(Array.from(list)).toEqual([5, 6, 7])
    })
  })

  describe('clone', () => {
    it('clones empty list', () => {
      const list = new SinglyLinkedList<number>()
      const cloned = list.clone()
      expect(cloned.toArray()).toEqual([])
      expect(cloned.size()).toBe(0)
    })

    it('clones non-empty list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      const cloned = list.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned).not.toBe(list)
    })

    it('clone is independent', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      const cloned = list.clone()
      cloned.pushBack(4)
      expect(list.size()).toBe(3)
      expect(cloned.size()).toBe(4)
    })

    it('preserves comparator', () => {
      const list = new SinglyLinkedList<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
        initialValues: ['A', 'B'],
      })
      const cloned = list.clone()
      expect(cloned.contains('a')).toBe(true)
    })
  })

  describe('merge', () => {
    it('merges two empty lists', () => {
      const a = new SinglyLinkedList<number>()
      const b = new SinglyLinkedList<number>()
      const result = a.merge(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('merges empty with non-empty', () => {
      const a = new SinglyLinkedList<number>()
      const b = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      const result = a.merge(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('merges non-empty with empty', () => {
      const a = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      const b = new SinglyLinkedList<number>()
      const result = a.merge(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('merges two non-empty lists', () => {
      const a = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      const b = new SinglyLinkedList<number>({ initialValues: [3, 4] })
      const result = a.merge(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('does not modify originals', () => {
      const a = new SinglyLinkedList<number>({ initialValues: [1] })
      const b = new SinglyLinkedList<number>({ initialValues: [2] })
      a.merge(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })
  })

  describe('middle', () => {
    it('returns undefined for empty list', () => {
      const list = new SinglyLinkedList<number>()
      expect(list.middle()).toBeUndefined()
    })

    it('returns element for single-element list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1] })
      expect(list.middle()).toBe(1)
    })

    it('returns first middle for even-length list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3, 4] })
      expect(list.middle()).toBe(2)
    })

    it('returns middle for odd-length list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3, 4, 5] })
      expect(list.middle()).toBe(3)
    })

    it('returns middle for two-element list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      expect(list.middle()).toBe(1)
    })
  })

  describe('detectCycle', () => {
    it('returns false for empty list', () => {
      const list = new SinglyLinkedList<number>()
      expect(list.detectCycle()).toBe(false)
    })

    it('returns false for single-element list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1] })
      expect(list.detectCycle()).toBe(false)
    })

    it('returns false for normal list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3, 4, 5] })
      expect(list.detectCycle()).toBe(false)
    })
  })

  describe('removeDuplicates', () => {
    it('does nothing on empty list', () => {
      const list = new SinglyLinkedList<number>()
      list.removeDuplicates()
      expect(list.toArray()).toEqual([])
    })

    it('does nothing on single-element list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1] })
      list.removeDuplicates()
      expect(list.toArray()).toEqual([1])
    })

    it('removes consecutive duplicates', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 1, 2, 2, 3, 3] })
      list.removeDuplicates()
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('does not remove non-consecutive duplicates', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 1] })
      list.removeDuplicates()
      expect(list.toArray()).toEqual([1, 2, 1])
    })

    it('handles all same elements', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [5, 5, 5, 5] })
      list.removeDuplicates()
      expect(list.toArray()).toEqual([5])
    })

    it('handles no duplicates', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      list.removeDuplicates()
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('uses comparator', () => {
      const list = new SinglyLinkedList<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
        initialValues: ['a', 'A', 'b', 'B'],
      })
      list.removeDuplicates()
      expect(list.toArray()).toEqual(['a', 'b'])
    })
  })

  describe('reverseKGroup', () => {
    it('does nothing on empty list', () => {
      const list = new SinglyLinkedList<number>()
      list.reverseKGroup(2)
      expect(list.toArray()).toEqual([])
    })

    it('does nothing for k <= 1', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      list.reverseKGroup(1)
      expect(list.toArray()).toEqual([1, 2, 3])
      list.reverseKGroup(0)
      expect(list.toArray()).toEqual([1, 2, 3])
      list.reverseKGroup(-1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('reverses in groups of 2', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3, 4] })
      list.reverseKGroup(2)
      expect(list.toArray()).toEqual([2, 1, 4, 3])
    })

    it('reverses in groups of 3', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3, 4, 5, 6] })
      list.reverseKGroup(3)
      expect(list.toArray()).toEqual([3, 2, 1, 6, 5, 4])
    })

    it('leaves remainder when not full group', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3, 4, 5] })
      list.reverseKGroup(2)
      expect(list.toArray()).toEqual([2, 1, 4, 3, 5])
    })

    it('handles k equal to size', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      list.reverseKGroup(3)
      expect(list.toArray()).toEqual([3, 2, 1])
    })

    it('handles k larger than size', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      list.reverseKGroup(10)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('handles single element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1] })
      list.reverseKGroup(2)
      expect(list.toArray()).toEqual([1])
    })
  })

  describe('mixed operations', () => {
    it('push and pop interleaved', () => {
      const list = new SinglyLinkedList<number>()
      list.pushBack(1)
      list.pushFront(0)
      list.pushBack(2)
      expect(list.toArray()).toEqual([0, 1, 2])
      expect(list.popFront()).toBe(0)
      expect(list.popBack()).toBe(2)
      expect(list.toArray()).toEqual([1])
    })

    it('insert and remove interleaved', () => {
      const list = new SinglyLinkedList<number>()
      list.insertAt(0, 2)
      list.insertAt(0, 1)
      list.insertAt(2, 3)
      expect(list.toArray()).toEqual([1, 2, 3])
      list.removeAt(1)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('complex workflow', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [3, 1, 4, 1, 5] })
      list.remove(1)
      expect(list.toArray()).toEqual([3, 4, 1, 5])
      list.reverse()
      expect(list.toArray()).toEqual([5, 1, 4, 3])
      const filtered = list.filter(v => v > 2)
      expect(filtered.toArray()).toEqual([5, 4, 3])
    })
  })

  describe('stress tests', () => {
    it('handles 1000 pushBack operations', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      expect(list.size()).toBe(1000)
      expect(list.peekFront()).toBe(0)
      expect(list.peekBack()).toBe(999)
    })

    it('handles 1000 pushFront operations', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushFront(i)
      }
      expect(list.size()).toBe(1000)
      expect(list.peekFront()).toBe(999)
      expect(list.peekBack()).toBe(0)
    })

    it('handles 1000 popFront operations', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      for (let i = 0; i < 1000; i++) {
        expect(list.popFront()).toBe(i)
      }
      expect(list.isEmpty()).toBe(true)
    })

    it('handles 1000 popBack operations', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      for (let i = 999; i >= 0; i--) {
        expect(list.popBack()).toBe(i)
      }
      expect(list.isEmpty()).toBe(true)
    })

    it('handles 1000 insertAt operations', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.insertAt(0, i)
      }
      expect(list.size()).toBe(1000)
      expect(list.peekFront()).toBe(999)
    })

    it('handles 1000 removeAt operations', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      for (let i = 0; i < 1000; i++) {
        list.removeAt(0)
      }
      expect(list.isEmpty()).toBe(true)
    })

    it('handles large reverse', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      list.reverse()
      expect(list.peekFront()).toBe(999)
      expect(list.peekBack()).toBe(0)
      expect(list.get(500)).toBe(499)
    })

    it('handles large map and reduce', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 1; i <= 1000; i++) {
        list.pushBack(i)
      }
      const doubled = list.map(v => v * 2)
      expect(doubled.size()).toBe(1000)
      const sum = doubled.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(1001000)
    })

    it('handles large clone and merge', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      const cloned = list.clone()
      expect(cloned.size()).toBe(1000)
      const merged = list.merge(cloned)
      expect(merged.size()).toBe(2000)
    })

    it('handles large fromArray and toArray', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      const list = new SinglyLinkedList<number>()
      list.fromArray(arr)
      expect(list.size()).toBe(1000)
      expect(list.toArray()).toEqual(arr)
    })

    it('handles large filter', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      const evens = list.filter(v => v % 2 === 0)
      expect(evens.size()).toBe(500)
    })

    it('handles large forEach', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      let count = 0
      list.forEach(() => { count++ })
      expect(count).toBe(1000)
    })

    it('handles large reverseKGroup', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      list.reverseKGroup(10)
      expect(list.size()).toBe(1000)
    })

    it('handles large removeDuplicates', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 500; i++) {
        list.pushBack(i)
        list.pushBack(i)
      }
      expect(list.size()).toBe(1000)
      list.removeDuplicates()
      expect(list.size()).toBe(500)
    })

    it('handles large middle', () => {
      const list = new SinglyLinkedList<number>()
      for (let i = 0; i < 1001; i++) {
        list.pushBack(i)
      }
      expect(list.middle()).toBe(500)
    })
  })

  describe('edge cases', () => {
    it('handles undefined values', () => {
      const list = new SinglyLinkedList<unknown>()
      list.pushBack(undefined)
      list.pushBack(null)
      expect(list.size()).toBe(2)
      expect(list.get(0)).toBeUndefined()
      expect(list.get(1)).toBeNull()
    })

    it('handles string values', () => {
      const list = new SinglyLinkedList<string>({ initialValues: ['hello', 'world'] })
      expect(list.indexOf('hello')).toBe(0)
      expect(list.contains('world')).toBe(true)
      list.remove('hello')
      expect(list.toArray()).toEqual(['world'])
    })

    it('handles object values with comparator', () => {
      const list = new SinglyLinkedList<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
        initialValues: [{ id: 1 }, { id: 2 }],
      })
      expect(list.contains({ id: 1 })).toBe(true)
      expect(list.indexOf({ id: 2 })).toBe(1)
    })

    it('handles boolean values', () => {
      const list = new SinglyLinkedList<boolean>({ initialValues: [true, false, true] })
      expect(list.toArray()).toEqual([true, false, true])
    })

    it('set then get consistency', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      list.set(0, 100)
      list.set(2, 300)
      expect(list.get(0)).toBe(100)
      expect(list.get(1)).toBe(2)
      expect(list.get(2)).toBe(300)
    })

    it('multiple reverse operations', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      list.reverse()
      expect(list.toArray()).toEqual([3, 2, 1])
      list.reverse()
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('clear then reuse', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3] })
      list.clear()
      list.pushBack(10)
      list.pushBack(20)
      expect(list.toArray()).toEqual([10, 20])
    })

    it('fromArray replaces then operations work', () => {
      const list = new SinglyLinkedList<number>()
      list.fromArray([1, 2, 3])
      expect(list.popFront()).toBe(1)
      expect(list.peekBack()).toBe(3)
      list.pushFront(0)
      expect(list.toArray()).toEqual([0, 2, 3])
    })

    it('forEachReverse on single element', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [42] })
      const items: number[] = []
      list.forEachReverse(v => items.push(v))
      expect(items).toEqual([42])
    })

    it('detectCycle on two-element list', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      expect(list.detectCycle()).toBe(false)
    })

    it('removeDuplicates on two-element list with same values', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [5, 5] })
      list.removeDuplicates()
      expect(list.toArray()).toEqual([5])
    })

    it('merge preserves comparator from first list', () => {
      const a = new SinglyLinkedList<string>({
        comparator: (x, y) => x.toLowerCase().localeCompare(y.toLowerCase()),
        initialValues: ['A'],
      })
      const b = new SinglyLinkedList<string>({ initialValues: ['b'] })
      const result = a.merge(b)
      expect(result.contains('a')).toBe(true)
      expect(result.contains('B')).toBe(true)
    })

    it('map on empty list returns empty list', () => {
      const list = new SinglyLinkedList<number>()
      const result = list.map(v => v * 2)
      expect(result.isEmpty()).toBe(true)
    })

    it('filter preserves comparator', () => {
      const list = new SinglyLinkedList<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
        initialValues: ['A', 'b', 'C'],
      })
      const result = list.filter(v => v === v.toUpperCase())
      expect(result.toArray()).toEqual(['A', 'C'])
    })

    it('remove on two-element list removes head', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      expect(list.remove(1)).toBe(true)
      expect(list.toArray()).toEqual([2])
      expect(list.peekFront()).toBe(2)
      expect(list.peekBack()).toBe(2)
    })

    it('remove on two-element list removes tail', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      expect(list.remove(2)).toBe(true)
      expect(list.toArray()).toEqual([1])
      expect(list.peekFront()).toBe(1)
      expect(list.peekBack()).toBe(1)
    })

    it('insertAt on single-element list at index 1', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1] })
      list.insertAt(1, 2)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('reverseKGroup on two elements with k=2', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2] })
      list.reverseKGroup(2)
      expect(list.toArray()).toEqual([2, 1])
    })

    it('reverseKGroup correct head and tail after', () => {
      const list = new SinglyLinkedList<number>({ initialValues: [1, 2, 3, 4] })
      list.reverseKGroup(2)
      expect(list.peekFront()).toBe(2)
      expect(list.peekBack()).toBe(3)
    })
  })
})
