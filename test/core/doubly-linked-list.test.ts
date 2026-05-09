import { describe, it, expect } from 'vitest'
import { DoublyLinkedList } from '../../src/core/doubly-linked-list/doubly-linked-list.js'

describe('DoublyLinkedList', () => {
  describe('Construction', () => {
    it('creates an empty list with no options', () => {
      const list = new DoublyLinkedList()
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('creates a list with initial values', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.size()).toBe(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('creates a list with a comparator', () => {
      const list = new DoublyLinkedList<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
        initialValues: [{ id: 1 }, { id: 2 }],
      })
      expect(list.contains({ id: 1 })).toBe(true)
      expect(list.contains({ id: 3 })).toBe(false)
    })

    it('creates a list with empty initial values', () => {
      const list = new DoublyLinkedList({ initialValues: [] })
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('handles undefined options', () => {
      const list = new DoublyLinkedList<number>(undefined)
      expect(list.size()).toBe(0)
    })
  })

  describe('pushFront', () => {
    it('pushes to front of empty list', () => {
      const list = new DoublyLinkedList<number>()
      list.pushFront(1)
      expect(list.size()).toBe(1)
      expect(list.peekFront()).toBe(1)
      expect(list.peekBack()).toBe(1)
    })

    it('pushes multiple items to front', () => {
      const list = new DoublyLinkedList<number>()
      list.pushFront(1)
      list.pushFront(2)
      list.pushFront(3)
      expect(list.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('pushBack', () => {
    it('pushes to back of empty list', () => {
      const list = new DoublyLinkedList<number>()
      list.pushBack(1)
      expect(list.size()).toBe(1)
      expect(list.peekFront()).toBe(1)
      expect(list.peekBack()).toBe(1)
    })

    it('pushes multiple items to back', () => {
      const list = new DoublyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      list.pushBack(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('popFront', () => {
    it('returns undefined for empty list', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.popFront()).toBeUndefined()
    })

    it('pops from single element list', () => {
      const list = new DoublyLinkedList<number>()
      list.pushBack(1)
      expect(list.popFront()).toBe(1)
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('pops elements in FIFO order', () => {
      const list = new DoublyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      list.pushBack(3)
      expect(list.popFront()).toBe(1)
      expect(list.popFront()).toBe(2)
      expect(list.popFront()).toBe(3)
      expect(list.popFront()).toBeUndefined()
    })
  })

  describe('popBack', () => {
    it('returns undefined for empty list', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.popBack()).toBeUndefined()
    })

    it('pops from single element list', () => {
      const list = new DoublyLinkedList<number>()
      list.pushBack(1)
      expect(list.popBack()).toBe(1)
      expect(list.size()).toBe(0)
    })

    it('pops elements in LIFO order', () => {
      const list = new DoublyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      list.pushBack(3)
      expect(list.popBack()).toBe(3)
      expect(list.popBack()).toBe(2)
      expect(list.popBack()).toBe(1)
      expect(list.popBack()).toBeUndefined()
    })
  })

  describe('peekFront', () => {
    it('returns undefined for empty list', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.peekFront()).toBeUndefined()
    })

    it('returns first element without removing', () => {
      const list = new DoublyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      expect(list.peekFront()).toBe(1)
      expect(list.size()).toBe(2)
    })
  })

  describe('peekBack', () => {
    it('returns undefined for empty list', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.peekBack()).toBeUndefined()
    })

    it('returns last element without removing', () => {
      const list = new DoublyLinkedList<number>()
      list.pushBack(1)
      list.pushBack(2)
      expect(list.peekBack()).toBe(2)
      expect(list.size()).toBe(2)
    })
  })

  describe('get', () => {
    it('returns undefined for out of bounds index', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.get(0)).toBeUndefined()
      expect(list.get(-1)).toBeUndefined()
    })

    it('returns element at given index', () => {
      const list = new DoublyLinkedList({ initialValues: [10, 20, 30, 40, 50] })
      expect(list.get(0)).toBe(10)
      expect(list.get(2)).toBe(30)
      expect(list.get(4)).toBe(50)
    })

    it('returns undefined for index equal to size', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.get(3)).toBeUndefined()
    })

    it('optimizes access from tail side', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })
      expect(list.get(9)).toBe(10)
      expect(list.get(8)).toBe(9)
    })
  })

  describe('set', () => {
    it('returns false for out of bounds index', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.set(0, 1)).toBe(false)
    })

    it('sets value at given index', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.set(1, 20)).toBe(true)
      expect(list.get(1)).toBe(20)
    })

    it('sets value at head and tail', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.set(0, 10)).toBe(true)
      expect(list.set(2, 30)).toBe(true)
      expect(list.toArray()).toEqual([10, 2, 30])
    })
  })

  describe('insertAt', () => {
    it('inserts at front when index <= 0', () => {
      const list = new DoublyLinkedList({ initialValues: [2, 3] })
      list.insertAt(0, 1)
      expect(list.toArray()).toEqual([1, 2, 3])
      list.insertAt(-5, 0)
      expect(list.toArray()).toEqual([0, 1, 2, 3])
    })

    it('inserts at back when index >= size', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2] })
      list.insertAt(10, 3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in the middle', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 3] })
      list.insertAt(1, 2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('inserts into empty list', () => {
      const list = new DoublyLinkedList<number>()
      list.insertAt(0, 1)
      expect(list.toArray()).toEqual([1])
    })
  })

  describe('removeAt', () => {
    it('returns undefined for out of bounds index', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.removeAt(0)).toBeUndefined()
      expect(list.removeAt(-1)).toBeUndefined()
    })

    it('removes from front', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.removeAt(0)).toBe(1)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('removes from back', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.removeAt(2)).toBe(3)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('removes from middle', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.removeAt(1)).toBe(2)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('removes single element', () => {
      const list = new DoublyLinkedList({ initialValues: [1] })
      expect(list.removeAt(0)).toBe(1)
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('remove', () => {
    it('removes existing value', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.remove(2)).toBe(true)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('returns false for non-existing value', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.remove(5)).toBe(false)
    })

    it('removes first occurrence', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 2, 3] })
      expect(list.remove(2)).toBe(true)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('removes head value', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.remove(1)).toBe(true)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('removes tail value', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.remove(3)).toBe(true)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('works with comparator', () => {
      const list = new DoublyLinkedList<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
        initialValues: [{ id: 1 }, { id: 2 }],
      })
      expect(list.remove({ id: 1 })).toBe(true)
      expect(list.size()).toBe(1)
    })
  })

  describe('indexOf', () => {
    it('returns -1 for empty list', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.indexOf(1)).toBe(-1)
    })

    it('returns index of found element', () => {
      const list = new DoublyLinkedList({ initialValues: [10, 20, 30] })
      expect(list.indexOf(20)).toBe(1)
    })

    it('returns -1 for not found element', () => {
      const list = new DoublyLinkedList({ initialValues: [10, 20, 30] })
      expect(list.indexOf(40)).toBe(-1)
    })

    it('returns first occurrence index', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 2, 3] })
      expect(list.indexOf(2)).toBe(1)
    })
  })

  describe('contains', () => {
    it('returns false for empty list', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.contains(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.contains(2)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.contains(4)).toBe(false)
    })
  })

  describe('size and isEmpty', () => {
    it('tracks size correctly', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.size()).toBe(0)
      list.pushBack(1)
      expect(list.size()).toBe(1)
      list.pushBack(2)
      expect(list.size()).toBe(2)
      list.popFront()
      expect(list.size()).toBe(1)
      list.popFront()
      expect(list.size()).toBe(0)
    })

    it('isEmpty reflects state', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.isEmpty()).toBe(true)
      list.pushBack(1)
      expect(list.isEmpty()).toBe(false)
      list.popFront()
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty list', () => {
      const list = new DoublyLinkedList<number>()
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })

    it('clears non-empty list', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      list.clear()
      expect(list.isEmpty()).toBe(true)
      expect(list.size()).toBe(0)
      expect(list.peekFront()).toBeUndefined()
      expect(list.peekBack()).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty list', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.toArray()).toEqual([])
    })

    it('returns array of all elements', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('fromArray', () => {
    it('replaces contents with array elements', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2] })
      list.fromArray([10, 20, 30])
      expect(list.toArray()).toEqual([10, 20, 30])
    })

    it('clears list with empty array', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      list.fromArray([])
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('reverse', () => {
    it('reverses empty list', () => {
      const list = new DoublyLinkedList<number>()
      list.reverse()
      expect(list.toArray()).toEqual([])
    })

    it('reverses single element', () => {
      const list = new DoublyLinkedList({ initialValues: [1] })
      list.reverse()
      expect(list.toArray()).toEqual([1])
    })

    it('reverses multiple elements', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4] })
      list.reverse()
      expect(list.toArray()).toEqual([4, 3, 2, 1])
    })

    it('reverses two elements', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2] })
      list.reverse()
      expect(list.toArray()).toEqual([2, 1])
    })

    it('double reverse restores original', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      list.reverse()
      list.reverse()
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('rotateLeft', () => {
    it('rotates empty list', () => {
      const list = new DoublyLinkedList<number>()
      list.rotateLeft(1)
      expect(list.toArray()).toEqual([])
    })

    it('rotates single element', () => {
      const list = new DoublyLinkedList({ initialValues: [1] })
      list.rotateLeft(1)
      expect(list.toArray()).toEqual([1])
    })

    it('rotates left by 1', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4] })
      list.rotateLeft(1)
      expect(list.toArray()).toEqual([2, 3, 4, 1])
    })

    it('rotates left by 2', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4] })
      list.rotateLeft(2)
      expect(list.toArray()).toEqual([3, 4, 1, 2])
    })

    it('rotates left by size returns same', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      list.rotateLeft(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('handles rotation larger than size', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      list.rotateLeft(5)
      expect(list.toArray()).toEqual([3, 1, 2])
    })

    it('handles zero rotation', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      list.rotateLeft(0)
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('rotateRight', () => {
    it('rotates empty list', () => {
      const list = new DoublyLinkedList<number>()
      list.rotateRight(1)
      expect(list.toArray()).toEqual([])
    })

    it('rotates right by 1', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4] })
      list.rotateRight(1)
      expect(list.toArray()).toEqual([4, 1, 2, 3])
    })

    it('rotates right by 2', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4] })
      list.rotateRight(2)
      expect(list.toArray()).toEqual([3, 4, 1, 2])
    })

    it('handles rotation larger than size', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      list.rotateRight(5)
      expect(list.toArray()).toEqual([2, 3, 1])
    })
  })

  describe('slice', () => {
    it('slices empty list', () => {
      const list = new DoublyLinkedList<number>()
      const sliced = list.slice(0)
      expect(sliced.toArray()).toEqual([])
    })

    it('slices from start to end', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4, 5] })
      const sliced = list.slice(1, 3)
      expect(sliced.toArray()).toEqual([2, 3])
    })

    it('slices with only start', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4, 5] })
      const sliced = list.slice(2)
      expect(sliced.toArray()).toEqual([3, 4, 5])
    })

    it('slices entire list', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      const sliced = list.slice(0)
      expect(sliced.toArray()).toEqual([1, 2, 3])
    })

    it('handles negative indices', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4, 5] })
      const sliced = list.slice(-3)
      expect(sliced.toArray()).toEqual([3, 4, 5])
    })

    it('returns independent list', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      const sliced = list.slice(0, 2)
      sliced.set(0, 100)
      expect(list.get(0)).toBe(1)
    })
  })

  describe('splice', () => {
    it('splices empty list with no deletions', () => {
      const list = new DoublyLinkedList<number>()
      const removed = list.splice(0, 0, 1, 2)
      expect(removed).toEqual([])
      expect(list.toArray()).toEqual([1, 2])
    })

    it('removes elements without inserting', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4] })
      const removed = list.splice(1, 2)
      expect(removed).toEqual([2, 3])
      expect(list.toArray()).toEqual([1, 4])
    })

    it('removes and inserts elements', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4] })
      const removed = list.splice(1, 2, 20, 30)
      expect(removed).toEqual([2, 3])
      expect(list.toArray()).toEqual([1, 20, 30, 4])
    })

    it('removes all from start with no deleteCount', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      const removed = list.splice(1)
      expect(removed).toEqual([2, 3])
      expect(list.toArray()).toEqual([1])
    })

    it('handles start beyond size', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2] })
      const removed = list.splice(10, 0, 3)
      expect(removed).toEqual([])
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('handles deleteCount beyond remaining', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      const removed = list.splice(1, 100)
      expect(removed).toEqual([2, 3])
      expect(list.toArray()).toEqual([1])
    })
  })

  describe('sort', () => {
    it('sorts empty list', () => {
      const list = new DoublyLinkedList<number>()
      list.sort()
      expect(list.toArray()).toEqual([])
    })

    it('sorts single element', () => {
      const list = new DoublyLinkedList({ initialValues: [1] })
      list.sort()
      expect(list.toArray()).toEqual([1])
    })

    it('sorts with default comparator', () => {
      const list = new DoublyLinkedList({ initialValues: [3, 1, 4, 1, 5, 9, 2, 6] })
      list.sort()
      expect(list.toArray()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('sorts with custom comparator', () => {
      const list = new DoublyLinkedList({ initialValues: [3, 1, 2] })
      list.sort((a, b) => b - a)
      expect(list.toArray()).toEqual([3, 2, 1])
    })

    it('sorts strings', () => {
      const list = new DoublyLinkedList({ initialValues: ['banana', 'apple', 'cherry'] })
      list.sort((a, b) => a.localeCompare(b))
      expect(list.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('uses provided instance comparator', () => {
      const list = new DoublyLinkedList<{ v: number }>({
        comparator: (a, b) => a.v - b.v,
        initialValues: [{ v: 3 }, { v: 1 }, { v: 2 }],
      })
      list.sort()
      expect(list.toArray().map((x) => x.v)).toEqual([1, 2, 3])
    })
  })

  describe('forEach', () => {
    it('iterates over empty list', () => {
      const list = new DoublyLinkedList<number>()
      const result: number[] = []
      list.forEach((v) => result.push(v))
      expect(result).toEqual([])
    })

    it('iterates over all elements with correct indices', () => {
      const list = new DoublyLinkedList({ initialValues: [10, 20, 30] })
      const result: { val: number; idx: number }[] = []
      list.forEach((v, i) => result.push({ val: v, idx: i }))
      expect(result).toEqual([
        { val: 10, idx: 0 },
        { val: 20, idx: 1 },
        { val: 30, idx: 2 },
      ])
    })
  })

  describe('forEachReverse', () => {
    it('iterates empty list', () => {
      const list = new DoublyLinkedList<number>()
      const result: number[] = []
      list.forEachReverse((v) => result.push(v))
      expect(result).toEqual([])
    })

    it('iterates in reverse order with correct indices', () => {
      const list = new DoublyLinkedList({ initialValues: [10, 20, 30] })
      const result: { val: number; idx: number }[] = []
      list.forEachReverse((v, i) => result.push({ val: v, idx: i }))
      expect(result).toEqual([
        { val: 30, idx: 2 },
        { val: 20, idx: 1 },
        { val: 10, idx: 0 },
      ])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty list', () => {
      const list = new DoublyLinkedList<number>()
      expect([...list]).toEqual([])
    })

    it('iterates over all elements', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect([...list]).toEqual([1, 2, 3])
    })

    it('works with for-of loop', () => {
      const list = new DoublyLinkedList({ initialValues: [10, 20, 30] })
      const sum = [...list].reduce((a, b) => a + b, 0)
      expect(sum).toBe(60)
    })
  })

  describe('clone', () => {
    it('clones empty list', () => {
      const list = new DoublyLinkedList<number>()
      const cloned = list.clone()
      expect(cloned.toArray()).toEqual([])
      expect(cloned.size()).toBe(0)
    })

    it('clones with all elements', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      const cloned = list.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned).not.toBe(list)
    })

    it('clone is independent', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      const cloned = list.clone()
      cloned.pushBack(4)
      expect(list.size()).toBe(3)
      expect(cloned.size()).toBe(4)
    })

    it('preserves comparator', () => {
      const cmp = (a: number, b: number) => a - b
      const list = new DoublyLinkedList({ initialValues: [1, 2], comparator: cmp })
      const cloned = list.clone()
      cloned.pushBack(1)
      expect(cloned.indexOf(1)).toBe(0)
    })
  })

  describe('merge', () => {
    it('merges two empty lists', () => {
      const list1 = new DoublyLinkedList<number>()
      const list2 = new DoublyLinkedList<number>()
      const merged = list1.merge(list2)
      expect(merged.toArray()).toEqual([])
    })

    it('merges empty with non-empty', () => {
      const list1 = new DoublyLinkedList<number>()
      const list2 = new DoublyLinkedList({ initialValues: [1, 2] })
      const merged = list1.merge(list2)
      expect(merged.toArray()).toEqual([1, 2])
    })

    it('merges non-empty lists', () => {
      const list1 = new DoublyLinkedList({ initialValues: [1, 2] })
      const list2 = new DoublyLinkedList({ initialValues: [3, 4] })
      const merged = list1.merge(list2)
      expect(merged.toArray()).toEqual([1, 2, 3, 4])
    })

    it('does not modify original lists', () => {
      const list1 = new DoublyLinkedList({ initialValues: [1] })
      const list2 = new DoublyLinkedList({ initialValues: [2] })
      list1.merge(list2)
      expect(list1.toArray()).toEqual([1])
      expect(list2.toArray()).toEqual([2])
    })
  })

  describe('find', () => {
    it('returns undefined for empty list', () => {
      const list = new DoublyLinkedList<number>()
      expect(list.find(() => true)).toBeUndefined()
    })

    it('returns first matching element', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4] })
      expect(list.find((v) => v > 2)).toBe(3)
    })

    it('returns undefined when no match', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.find((v) => v > 10)).toBeUndefined()
    })

    it('uses correct index', () => {
      const list = new DoublyLinkedList({ initialValues: [10, 20, 30] })
      expect(list.find((_v, i) => i === 1)).toBe(20)
    })
  })

  describe('filter', () => {
    it('filters empty list', () => {
      const list = new DoublyLinkedList<number>()
      const filtered = list.filter(() => true)
      expect(filtered.toArray()).toEqual([])
    })

    it('filters elements', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4, 5] })
      const filtered = list.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('returns independent list', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      const filtered = list.filter(() => true)
      filtered.clear()
      expect(list.size()).toBe(3)
    })

    it('uses correct indices', () => {
      const list = new DoublyLinkedList({ initialValues: [10, 20, 30, 40] })
      const filtered = list.filter((_v, i) => i % 2 === 0)
      expect(filtered.toArray()).toEqual([10, 30])
    })
  })

  describe('map', () => {
    it('maps empty list', () => {
      const list = new DoublyLinkedList<number>()
      const mapped = list.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([])
    })

    it('maps elements to new type', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      const mapped = list.map((v) => `item-${v}`)
      expect(mapped.toArray()).toEqual(['item-1', 'item-2', 'item-3'])
    })

    it('maps with index', () => {
      const list = new DoublyLinkedList({ initialValues: [10, 20, 30] })
      const mapped = list.map((v, i) => v + i)
      expect(mapped.toArray()).toEqual([10, 21, 32])
    })

    it('returns independent list', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      const mapped = list.map((v) => v * 2)
      list.pushBack(4)
      expect(mapped.size()).toBe(3)
    })
  })

  describe('reduce', () => {
    it('reduces empty list to initial value', () => {
      const list = new DoublyLinkedList<number>()
      const result = list.reduce((acc, v) => acc + v, 0)
      expect(result).toBe(0)
    })

    it('sums elements', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3, 4] })
      const result = list.reduce((acc, v) => acc + v, 0)
      expect(result).toBe(10)
    })

    it('builds string from elements', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      const result = list.reduce((acc, v) => acc + String(v), '')
      expect(result).toBe('123')
    })

    it('uses correct index in callback', () => {
      const list = new DoublyLinkedList({ initialValues: [10, 20, 30] })
      const result = list.reduce((acc, _v, i) => acc + i, 0)
      expect(result).toBe(3)
    })
  })

  describe('Edge cases', () => {
    it('handles alternating push and pop', () => {
      const list = new DoublyLinkedList<number>()
      list.pushBack(1)
      list.popFront()
      list.pushFront(2)
      list.popBack()
      expect(list.isEmpty()).toBe(true)
    })

    it('handles single element operations', () => {
      const list = new DoublyLinkedList<number>()
      list.pushBack(42)
      expect(list.get(0)).toBe(42)
      expect(list.removeAt(0)).toBe(42)
      expect(list.isEmpty()).toBe(true)
    })

    it('handles negative indices gracefully', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      expect(list.get(-1)).toBeUndefined()
      expect(list.removeAt(-1)).toBeUndefined()
    })

    it('handles mixed push front and back', () => {
      const list = new DoublyLinkedList<number>()
      list.pushFront(2)
      list.pushBack(3)
      list.pushFront(1)
      list.pushBack(4)
      expect(list.toArray()).toEqual([1, 2, 3, 4])
    })

    it('handles objects by reference', () => {
      const obj = { x: 1 }
      const list = new DoublyLinkedList<typeof obj>()
      list.pushBack(obj)
      expect(list.contains(obj)).toBe(true)
      expect(list.contains({ x: 1 })).toBe(false)
    })

    it('handles null and undefined values', () => {
      const list = new DoublyLinkedList<number | null | undefined>()
      list.pushBack(null)
      list.pushBack(undefined)
      list.pushBack(1)
      expect(list.size()).toBe(3)
      expect(list.toArray()).toEqual([null, undefined, 1])
    })

    it('clear and reuse', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      list.clear()
      list.pushBack(4)
      expect(list.toArray()).toEqual([4])
    })

    it('handles large deleteCount in splice', () => {
      const list = new DoublyLinkedList({ initialValues: [1, 2, 3] })
      const removed = list.splice(0, 1000)
      expect(removed).toEqual([1, 2, 3])
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('Stress tests', () => {
    it('handles 1000 pushBack operations', () => {
      const list = new DoublyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      expect(list.size()).toBe(1000)
      expect(list.peekFront()).toBe(0)
      expect(list.peekBack()).toBe(999)
    })

    it('handles 1000 pushFront operations', () => {
      const list = new DoublyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushFront(i)
      }
      expect(list.size()).toBe(1000)
      expect(list.peekFront()).toBe(999)
      expect(list.peekBack()).toBe(0)
    })

    it('handles 1000 mixed operations', () => {
      const list = new DoublyLinkedList<number>()
      for (let i = 0; i < 500; i++) {
        list.pushBack(i)
      }
      for (let i = 0; i < 500; i++) {
        list.pushFront(i)
      }
      expect(list.size()).toBe(1000)
    })

    it('handles 1000 pop operations', () => {
      const list = new DoublyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      for (let i = 0; i < 1000; i++) {
        list.popFront()
      }
      expect(list.isEmpty()).toBe(true)
    })

    it('handles reverse of 1000 elements', () => {
      const list = new DoublyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      list.reverse()
      expect(list.peekFront()).toBe(999)
      expect(list.peekBack()).toBe(0)
      expect(list.get(500)).toBe(499)
    })

    it('handles sort of 1000 elements', () => {
      const list = new DoublyLinkedList<number>()
      for (let i = 999; i >= 0; i--) {
        list.pushBack(i)
      }
      list.sort()
      expect(list.get(0)).toBe(0)
      expect(list.get(999)).toBe(999)
    })

    it('handles forEach on 1000 elements', () => {
      const list = new DoublyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      let sum = 0
      list.forEach((v) => {
        sum += v
      })
      expect(sum).toBe(499500)
    })

    it('handles iterator on 1000 elements', () => {
      const list = new DoublyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      let count = 0
      for (const _ of list) {
        count++
      }
      expect(count).toBe(1000)
    })

    it('handles map/reduce on 1000 elements', () => {
      const list = new DoublyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      const doubled = list.map((v) => v * 2)
      const sum = doubled.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(999000)
    })

    it('handles rotate on 1000 elements', () => {
      const list = new DoublyLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.pushBack(i)
      }
      list.rotateLeft(500)
      expect(list.peekFront()).toBe(500)
      expect(list.peekBack()).toBe(499)
    })
  })
})
