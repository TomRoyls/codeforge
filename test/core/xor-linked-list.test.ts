import { describe, it, expect } from 'vitest'
import { XORLinkedList } from '../../src/core/xor-linked-list/xor-linked-list.js'
import type { XORLinkedListOptions, XORNodeResult, XORLinkedListStats } from '../../src/core/xor-linked-list/types.js'

describe('XORLinkedList', () => {
  describe('Construction', () => {
    it('creates an empty list with no options', () => {
      const list = new XORLinkedList()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('creates a list with initial values', () => {
      const list = new XORLinkedList({ initialValues: [1, 2, 3] })
      expect(list.size).toBe(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('creates a list with a comparator', () => {
      const list = new XORLinkedList<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
        initialValues: [{ id: 1 }, { id: 2 }],
      })
      expect(list.find({ id: 1 })).toBeDefined()
      expect(list.find({ id: 3 })).toBeUndefined()
    })

    it('creates a list with empty initial values', () => {
      const list = new XORLinkedList({ initialValues: [] })
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('handles undefined options', () => {
      const list = new XORLinkedList<number>(undefined)
      expect(list.size).toBe(0)
    })

    it('preserves order of initial values', () => {
      const list = new XORLinkedList({ initialValues: [10, 20, 30, 40, 50] })
      expect(list.toArray()).toEqual([10, 20, 30, 40, 50])
    })
  })

  describe('append', () => {
    it('appends to empty list', () => {
      const list = new XORLinkedList<number>()
      const id = list.append(1)
      expect(id).toBe(1)
      expect(list.size).toBe(1)
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })

    it('appends multiple values', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('returns incrementing ids', () => {
      const list = new XORLinkedList<number>()
      expect(list.append('a')).toBe(1)
      expect(list.append('b')).toBe(2)
      expect(list.append('c')).toBe(3)
    })

    it('updates last after append', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      expect(list.last).toBe(2)
    })

    it('first remains unchanged after append', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      expect(list.first).toBe(1)
    })
  })

  describe('prepend', () => {
    it('prepends to empty list', () => {
      const list = new XORLinkedList<number>()
      const id = list.prepend(1)
      expect(id).toBe(1)
      expect(list.size).toBe(1)
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })

    it('prepends multiple values', () => {
      const list = new XORLinkedList<number>()
      list.prepend(1)
      list.prepend(2)
      list.prepend(3)
      expect(list.toArray()).toEqual([3, 2, 1])
    })

    it('returns incrementing ids', () => {
      const list = new XORLinkedList<number>()
      expect(list.prepend('a')).toBe(1)
      expect(list.prepend('b')).toBe(2)
      expect(list.prepend('c')).toBe(3)
    })

    it('updates first after prepend', () => {
      const list = new XORLinkedList<number>()
      list.prepend(1)
      list.prepend(2)
      expect(list.first).toBe(2)
    })

    it('last remains unchanged after prepend', () => {
      const list = new XORLinkedList<number>()
      list.prepend(1)
      list.prepend(2)
      expect(list.last).toBe(1)
    })
  })

  describe('insertAfter', () => {
    it('returns undefined for non-existent node', () => {
      const list = new XORLinkedList<number>()
      expect(list.insertAfter(999, 5)).toBeUndefined()
    })

    it('inserts after head', () => {
      const list = new XORLinkedList<number>()
      const headId = list.append(1)
      list.append(3)
      list.insertAfter(headId, 2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('inserts after middle node', () => {
      const list = new XORLinkedList<number>()
      const id1 = list.append(1)
      const id2 = list.append(2)
      list.append(4)
      list.insertAfter(id2, 3)
      expect(list.toArray()).toEqual([1, 2, 3, 4])
    })

    it('inserts after tail delegates to append', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      const tailId = list.append(3)
      list.insertAfter(tailId, 4)
      expect(list.toArray()).toEqual([1, 2, 3, 4])
    })

    it('inserts into single-node list', () => {
      const list = new XORLinkedList<number>()
      const id = list.append(1)
      list.insertAfter(id, 2)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('returns new node id', () => {
      const list = new XORLinkedList<number>()
      const id1 = list.append(1)
      const newId = list.insertAfter(id1, 2)
      expect(newId).toBe(2)
    })

    it('can chain multiple insertAfter', () => {
      const list = new XORLinkedList<number>()
      const id1 = list.append(1)
      list.append(5)
      const id2 = list.insertAfter(id1, 2)
      const id3 = list.insertAfter(id2, 3)
      list.insertAfter(id3, 4)
      expect(list.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('insertBefore', () => {
    it('returns undefined for non-existent node', () => {
      const list = new XORLinkedList<number>()
      expect(list.insertBefore(999, 5)).toBeUndefined()
    })

    it('inserts before tail', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(3)
      const tailId = list.append(4)
      list.insertBefore(tailId, 2)
      expect(list.toArray()).toEqual([1, 3, 2, 4])
    })

    it('inserts before middle node', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      const id2 = list.append(3)
      list.append(4)
      list.insertBefore(id2, 2)
      expect(list.toArray()).toEqual([1, 2, 3, 4])
    })

    it('inserts before head delegates to prepend', () => {
      const list = new XORLinkedList<number>()
      const headId = list.append(2)
      list.append(3)
      list.insertBefore(headId, 1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('inserts into single-node list', () => {
      const list = new XORLinkedList<number>()
      const id = list.append(2)
      list.insertBefore(id, 1)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('returns new node id', () => {
      const list = new XORLinkedList<number>()
      const id1 = list.append(2)
      const newId = list.insertBefore(id1, 1)
      expect(newId).toBe(2)
    })
  })

  describe('remove', () => {
    it('returns undefined for non-existent node', () => {
      const list = new XORLinkedList<number>()
      expect(list.remove(999)).toBeUndefined()
    })

    it('removes the only node', () => {
      const list = new XORLinkedList<number>()
      const id = list.append(1)
      expect(list.remove(id)).toBe(1)
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.toArray()).toEqual([])
    })

    it('removes head from two-node list', () => {
      const list = new XORLinkedList<number>()
      const headId = list.append(1)
      list.append(2)
      list.remove(headId)
      expect(list.toArray()).toEqual([2])
      expect(list.first).toBe(2)
      expect(list.last).toBe(2)
    })

    it('removes tail from two-node list', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      const tailId = list.append(2)
      list.remove(tailId)
      expect(list.toArray()).toEqual([1])
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })

    it('removes head from multi-node list', () => {
      const list = new XORLinkedList<number>()
      const headId = list.append(1)
      list.append(2)
      list.append(3)
      list.remove(headId)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('removes tail from multi-node list', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      const tailId = list.append(3)
      list.remove(tailId)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('removes middle node', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      const midId = list.append(2)
      list.append(3)
      list.remove(midId)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('returns removed value', () => {
      const list = new XORLinkedList<string>()
      const id = list.append('hello')
      expect(list.remove(id)).toBe('hello')
    })

    it('decrements size', () => {
      const list = new XORLinkedList<number>()
      const id = list.append(1)
      list.append(2)
      expect(list.size).toBe(2)
      list.remove(id)
      expect(list.size).toBe(1)
    })

    it('removes all nodes one by one', () => {
      const list = new XORLinkedList<number>()
      const ids = [list.append(1), list.append(2), list.append(3)]
      list.remove(ids[0]!)
      list.remove(ids[2]!)
      list.remove(ids[1]!)
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('removes from empty list returns undefined', () => {
      const list = new XORLinkedList<number>()
      expect(list.remove(1)).toBeUndefined()
    })
  })

  describe('get', () => {
    it('returns node result for existing node', () => {
      const list = new XORLinkedList<number>()
      const id = list.append(42)
      const result = list.get(id)
      expect(result).toEqual({ id, value: 42 })
    })

    it('returns undefined for non-existent node', () => {
      const list = new XORLinkedList<number>()
      expect(list.get(999)).toBeUndefined()
    })

    it('returns correct result after multiple operations', () => {
      const list = new XORLinkedList<string>()
      const id1 = list.append('a')
      const id2 = list.append('b')
      expect(list.get(id1)).toEqual({ id: id1, value: 'a' })
      expect(list.get(id2)).toEqual({ id: id2, value: 'b' })
    })
  })

  describe('find', () => {
    it('finds existing value', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.find(2)).toBe(2)
    })

    it('returns undefined for non-existent value', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      expect(list.find(99)).toBeUndefined()
    })

    it('finds first occurrence', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(2)
      const found = list.find(2)
      expect(found).toBe(2)
    })

    it('returns undefined on empty list', () => {
      const list = new XORLinkedList<number>()
      expect(list.find(1)).toBeUndefined()
    })

    it('finds value using custom comparator', () => {
      const list = new XORLinkedList<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
      })
      list.append({ id: 1 })
      list.append({ id: 2 })
      expect(list.find({ id: 2 })).toBeDefined()
    })

    it('finds head value', () => {
      const list = new XORLinkedList<number>()
      list.append(10)
      list.append(20)
      expect(list.find(10)).toBe(1)
    })

    it('finds tail value', () => {
      const list = new XORLinkedList<number>()
      list.append(10)
      list.append(20)
      expect(list.find(20)).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty list', () => {
      const list = new XORLinkedList<number>()
      expect(list.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      expect(list.toArray()).toEqual([1])
    })

    it('returns all elements in order', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('reflects modifications', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.remove(2)
      expect(list.toArray()).toEqual([1, 3])
    })
  })

  describe('toReversedArray', () => {
    it('returns empty array for empty list', () => {
      const list = new XORLinkedList<number>()
      expect(list.toReversedArray()).toEqual([])
    })

    it('returns single element reversed', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      expect(list.toReversedArray()).toEqual([1])
    })

    it('returns elements in reverse order', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.toReversedArray()).toEqual([3, 2, 1])
    })

    it('is consistent after reverse()', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.reverse()
      expect(list.toReversedArray()).toEqual([1, 2, 3])
    })
  })

  describe('first and last', () => {
    it('first is undefined on empty list', () => {
      const list = new XORLinkedList<number>()
      expect(list.first).toBeUndefined()
    })

    it('last is undefined on empty list', () => {
      const list = new XORLinkedList<number>()
      expect(list.last).toBeUndefined()
    })

    it('first and last are same for single node', () => {
      const list = new XORLinkedList<number>()
      list.append(42)
      expect(list.first).toBe(42)
      expect(list.last).toBe(42)
    })

    it('first and last differ for multiple nodes', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.first).toBe(1)
      expect(list.last).toBe(3)
    })

    it('first updates after prepend', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.prepend(0)
      expect(list.first).toBe(0)
    })

    it('last updates after append', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      expect(list.last).toBe(2)
    })
  })

  describe('size', () => {
    it('is 0 for empty list', () => {
      const list = new XORLinkedList()
      expect(list.size).toBe(0)
    })

    it('increments on append', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      expect(list.size).toBe(1)
      list.append(2)
      expect(list.size).toBe(2)
    })

    it('increments on prepend', () => {
      const list = new XORLinkedList<number>()
      list.prepend(1)
      expect(list.size).toBe(1)
    })

    it('decrements on remove', () => {
      const list = new XORLinkedList<number>()
      const id = list.append(1)
      list.remove(id)
      expect(list.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('is true for new list', () => {
      expect(new XORLinkedList().isEmpty()).toBe(true)
    })

    it('is false after append', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      expect(list.isEmpty()).toBe(false)
    })

    it('is true after removing all nodes', () => {
      const list = new XORLinkedList<number>()
      const id = list.append(1)
      list.remove(id)
      expect(list.isEmpty()).toBe(true)
    })

    it('is true after clear', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty list without error', () => {
      const list = new XORLinkedList()
      list.clear()
      expect(list.size).toBe(0)
    })

    it('clears single-node list', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.first).toBeUndefined()
      expect(list.last).toBeUndefined()
    })

    it('clears multi-node list', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.toArray()).toEqual([])
    })

    it('allows operations after clear', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.clear()
      list.append(2)
      expect(list.toArray()).toEqual([2])
    })
  })

  describe('forEach', () => {
    it('does nothing on empty list', () => {
      const list = new XORLinkedList<number>()
      const values: number[] = []
      list.forEach((v) => values.push(v))
      expect(values).toEqual([])
    })

    it('iterates single element', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      const values: number[] = []
      list.forEach((v) => values.push(v))
      expect(values).toEqual([1])
    })

    it('iterates all elements in order', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const values: number[] = []
      list.forEach((v) => values.push(v))
      expect(values).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const list = new XORLinkedList<number>()
      list.append(10)
      list.append(20)
      list.append(30)
      const indices: number[] = []
      list.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides correct node id', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      const ids: number[] = []
      list.forEach((_v, _i, id) => ids.push(id))
      expect(ids).toEqual([1, 2])
    })
  })

  describe('forEachReverse', () => {
    it('does nothing on empty list', () => {
      const list = new XORLinkedList<number>()
      const values: number[] = []
      list.forEachReverse((v) => values.push(v))
      expect(values).toEqual([])
    })

    it('iterates single element', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      const values: number[] = []
      list.forEachReverse((v) => values.push(v))
      expect(values).toEqual([1])
    })

    it('iterates in reverse order', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const values: number[] = []
      list.forEachReverse((v) => values.push(v))
      expect(values).toEqual([3, 2, 1])
    })

    it('provides correct reverse index', () => {
      const list = new XORLinkedList<number>()
      list.append(10)
      list.append(20)
      list.append(30)
      const indices: number[] = []
      list.forEachReverse((_v, i) => indices.push(i))
      expect(indices).toEqual([2, 1, 0])
    })

    it('provides correct node id in reverse', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const ids: number[] = []
      list.forEachReverse((_v, _i, id) => ids.push(id))
      expect(ids).toEqual([3, 2, 1])
    })
  })

  describe('fromArray', () => {
    it('creates list from array', () => {
      const list = new XORLinkedList<number>()
      list.fromArray([1, 2, 3])
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('replaces existing contents', () => {
      const list = new XORLinkedList<number>()
      list.append(99)
      list.fromArray([1, 2, 3])
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.fromArray([])
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('handles single element', () => {
      const list = new XORLinkedList<number>()
      list.fromArray([42])
      expect(list.size).toBe(1)
      expect(list.first).toBe(42)
    })
  })

  describe('reverse', () => {
    it('does nothing on empty list', () => {
      const list = new XORLinkedList<number>()
      list.reverse()
      expect(list.toArray()).toEqual([])
    })

    it('does nothing on single-node list', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.reverse()
      expect(list.toArray()).toEqual([1])
    })

    it('reverses two nodes', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.reverse()
      expect(list.toArray()).toEqual([2, 1])
    })

    it('reverses multiple nodes', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.append(4)
      list.reverse()
      expect(list.toArray()).toEqual([4, 3, 2, 1])
    })

    it('double reverse restores original order', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.reverse()
      list.reverse()
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('swap head and tail after reverse', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.reverse()
      expect(list.first).toBe(3)
      expect(list.last).toBe(1)
    })

    it('toReversedArray after reverse equals original toArray', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const original = list.toArray()
      list.reverse()
      expect(list.toReversedArray()).toEqual(original)
    })

    it('supports operations after reverse', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.reverse()
      list.append(3)
      expect(list.toArray()).toEqual([2, 1, 3])
    })
  })

  describe('stats', () => {
    it('returns stats for empty list', () => {
      const list = new XORLinkedList<number>()
      const s = list.stats()
      expect(s.size).toBe(0)
      expect(s.memoryUsedBytes).toBe(0)
      expect(s.nodeIdRange).toEqual({ min: 0, max: 0 })
      expect(s.uniqueValues).toBe(0)
    })

    it('returns stats for single-node list', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      const s = list.stats()
      expect(s.size).toBe(1)
      expect(s.memoryUsedBytes).toBe(24)
      expect(s.nodeIdRange).toEqual({ min: 1, max: 1 })
      expect(s.uniqueValues).toBe(1)
    })

    it('returns correct stats for multi-node list', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const s = list.stats()
      expect(s.size).toBe(3)
      expect(s.memoryUsedBytes).toBe(72)
      expect(s.nodeIdRange).toEqual({ min: 1, max: 3 })
    })

    it('counts unique values', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(1)
      list.append(2)
      const s = list.stats()
      expect(s.uniqueValues).toBe(2)
    })

    it('all unique values', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.stats().uniqueValues).toBe(3)
    })
  })

  describe('Edge cases - two nodes', () => {
    it('append then remove head', () => {
      const list = new XORLinkedList<number>()
      const id1 = list.append(1)
      list.append(2)
      list.remove(id1)
      expect(list.toArray()).toEqual([2])
      expect(list.first).toBe(2)
      expect(list.last).toBe(2)
    })

    it('append then remove tail', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      const id2 = list.append(2)
      list.remove(id2)
      expect(list.toArray()).toEqual([1])
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })

    it('insertAfter on first of two', () => {
      const list = new XORLinkedList<number>()
      const id1 = list.append(1)
      list.append(3)
      list.insertAfter(id1, 2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('insertBefore on second of two', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      const id2 = list.append(3)
      list.insertBefore(id2, 2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('Edge cases - single node', () => {
    it('remove single node then re-add', () => {
      const list = new XORLinkedList<number>()
      const id = list.append(1)
      list.remove(id)
      list.append(2)
      expect(list.toArray()).toEqual([2])
    })

    it('get after remove returns undefined', () => {
      const list = new XORLinkedList<number>()
      const id = list.append(1)
      list.remove(id)
      expect(list.get(id)).toBeUndefined()
    })

    it('reverse single node is no-op', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.reverse()
      expect(list.toArray()).toEqual([1])
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })
  })

  describe('Iteration consistency', () => {
    it('forEach and forEachReverse visit same elements', () => {
      const list = new XORLinkedList<number>()
      list.fromArray([1, 2, 3, 4, 5])
      const forward: number[] = []
      const reverse: number[] = []
      list.forEach((v) => forward.push(v))
      list.forEachReverse((v) => reverse.push(v))
      expect(forward).toEqual([1, 2, 3, 4, 5])
      expect(reverse).toEqual([5, 4, 3, 2, 1])
    })

    it('toArray and toReversedArray are consistent', () => {
      const list = new XORLinkedList<number>()
      list.fromArray([10, 20, 30])
      expect(list.toArray()).toEqual(list.toReversedArray().reverse())
    })

    it('size equals forEach iteration count', () => {
      const list = new XORLinkedList<number>()
      list.fromArray([1, 2, 3, 4])
      let count = 0
      list.forEach(() => count++)
      expect(count).toBe(list.size)
    })

    it('size equals forEachReverse iteration count', () => {
      const list = new XORLinkedList<number>()
      list.fromArray([1, 2, 3, 4])
      let count = 0
      list.forEachReverse(() => count++)
      expect(count).toBe(list.size)
    })
  })

  describe('Large lists', () => {
    it('handles 10000 appends', () => {
      const list = new XORLinkedList<number>()
      for (let i = 0; i < 10000; i++) {
        list.append(i)
      }
      expect(list.size).toBe(10000)
      expect(list.first).toBe(0)
      expect(list.last).toBe(9999)
    })

    it('handles 10000 prepends', () => {
      const list = new XORLinkedList<number>()
      for (let i = 0; i < 10000; i++) {
        list.prepend(i)
      }
      expect(list.size).toBe(10000)
      expect(list.first).toBe(9999)
      expect(list.last).toBe(0)
    })

    it('toArray on large list', () => {
      const list = new XORLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.append(i)
      }
      const arr = list.toArray()
      expect(arr.length).toBe(1000)
      expect(arr[0]).toBe(0)
      expect(arr[999]).toBe(999)
    })

    it('toReversedArray on large list', () => {
      const list = new XORLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.append(i)
      }
      const arr = list.toReversedArray()
      expect(arr.length).toBe(1000)
      expect(arr[0]).toBe(999)
      expect(arr[999]).toBe(0)
    })

    it('forEach on large list', () => {
      const list = new XORLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.append(i)
      }
      let sum = 0
      list.forEach((v) => { sum += v })
      expect(sum).toBe(499500)
    })

    it('reverse on large list', () => {
      const list = new XORLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.append(i)
      }
      list.reverse()
      expect(list.first).toBe(999)
      expect(list.last).toBe(0)
      expect(list.toArray()[0]).toBe(999)
    })

    it('fromArray large list', () => {
      const list = new XORLinkedList<number>()
      const arr = Array.from({ length: 5000 }, (_, i) => i)
      list.fromArray(arr)
      expect(list.size).toBe(5000)
      expect(list.first).toBe(0)
      expect(list.last).toBe(4999)
    })

    it('remove middle from large list', () => {
      const list = new XORLinkedList<number>()
      for (let i = 0; i < 1000; i++) {
        list.append(i)
      }
      const midId = list.find(500)!
      list.remove(midId)
      expect(list.size).toBe(999)
      expect(list.find(500)).toBeUndefined()
    })
  })

  describe('Complex operations', () => {
    it('mixed append and prepend', () => {
      const list = new XORLinkedList<number>()
      list.append(2)
      list.prepend(1)
      list.append(3)
      list.prepend(0)
      expect(list.toArray()).toEqual([0, 1, 2, 3])
    })

    it('insert after removal', () => {
      const list = new XORLinkedList<number>()
      const id1 = list.append(1)
      list.append(3)
      list.remove(id1)
      const newId = list.append(4)
      list.insertAfter(newId, 5)
      expect(list.toArray()).toEqual([3, 4, 5])
    })

    it('multiple removes from middle', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      const id2 = list.append(2)
      const id3 = list.append(3)
      const id4 = list.append(4)
      list.append(5)
      list.remove(id3)
      list.remove(id2)
      list.remove(id4)
      expect(list.toArray()).toEqual([1, 5])
    })

    it('clear and rebuild', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.clear()
      list.append(3)
      list.append(4)
      expect(list.toArray()).toEqual([3, 4])
    })

    it('reverse then insert', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.reverse()
      const headId = list.find(3)!
      list.insertAfter(headId, 10)
      expect(list.toArray()).toEqual([3, 10, 2, 1])
    })

    it('find after multiple operations', () => {
      const list = new XORLinkedList<number>()
      list.append(10)
      list.append(20)
      list.append(30)
      const id = list.find(20)!
      list.insertBefore(id, 15)
      list.insertAfter(id, 25)
      expect(list.toArray()).toEqual([10, 15, 20, 25, 30])
    })

    it('handles object values', () => {
      const list = new XORLinkedList<{ x: number; y: number }>({
        comparator: (a, b) => a.x - b.x || a.y - b.y,
      })
      list.append({ x: 1, y: 2 })
      list.append({ x: 3, y: 4 })
      expect(list.find({ x: 1, y: 2 })).toBeDefined()
      expect(list.find({ x: 5, y: 6 })).toBeUndefined()
    })

    it('handles string values', () => {
      const list = new XORLinkedList<string>()
      list.append('hello')
      list.append('world')
      expect(list.toArray()).toEqual(['hello', 'world'])
      expect(list.find('hello')).toBeDefined()
    })

    it('handles null values', () => {
      const list = new XORLinkedList<null>()
      list.append(null)
      list.append(null)
      expect(list.size).toBe(2)
      expect(list.find(null)).toBeDefined()
    })

    it('handles undefined values', () => {
      const list = new XORLinkedList<undefined>()
      list.append(undefined)
      expect(list.size).toBe(1)
      expect(list.find(undefined)).toBeDefined()
    })

    it('stats after complex operations', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.remove(2)
      const s = list.stats()
      expect(s.size).toBe(2)
      expect(s.uniqueValues).toBe(2)
    })
  })

  describe('Type exports', () => {
    it('XORLinkedListOptions type is accessible', () => {
      const opts: XORLinkedListOptions<number> = { initialValues: [1, 2, 3] }
      const list = new XORLinkedList(opts)
      expect(list.size).toBe(3)
    })

    it('XORNodeResult type is accessible', () => {
      const list = new XORLinkedList<number>()
      const id = list.append(42)
      const result: XORNodeResult<number> | undefined = list.get(id)
      expect(result?.value).toBe(42)
    })

    it('XORLinkedListStats type is accessible', () => {
      const list = new XORLinkedList<number>()
      list.append(1)
      const s: XORLinkedListStats = list.stats()
      expect(s.size).toBe(1)
    })
  })
})
