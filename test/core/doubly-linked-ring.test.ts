import { describe, it, expect } from 'vitest'
import { DoublyLinkedRing, DEFAULT_DOUBLY_LINKED_RING_OPTIONS } from '../../src/core/doubly-linked-ring/doubly-linked-ring.js'

describe('DoublyLinkedRing', () => {
  describe('construction', () => {
    it('creates empty ring with default options', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.size).toBe(0)
      expect(ring.isEmpty()).toBe(true)
      expect(ring.isCircular).toBe(true)
    })

    it('creates ring with circular=false', () => {
      const ring = new DoublyLinkedRing<number>({ circular: false })
      expect(ring.isCircular).toBe(false)
    })

    it('creates ring with circular=true explicitly', () => {
      const ring = new DoublyLinkedRing<number>({ circular: true })
      expect(ring.isCircular).toBe(true)
    })

    it('DEFAULT_DOUBLY_LINKED_RING_OPTIONS has circular=true', () => {
      expect(DEFAULT_DOUBLY_LINKED_RING_OPTIONS.circular).toBe(true)
    })

    it('has null head and tail when empty', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.headNode).toBeNull()
      expect(ring.tailNode).toBeNull()
    })
  })

  describe('push', () => {
    it('pushes to empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      expect(ring.size).toBe(1)
      expect(ring.headNode?.value).toBe(1)
      expect(ring.tailNode?.value).toBe(1)
    })

    it('pushes multiple values', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.size).toBe(3)
      expect(ring.toArray()).toEqual([1, 2, 3])
    })

    it('updates tail on push', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      expect(ring.tailNode?.value).toBe(2)
    })

    it('headNode and tailNode are same for single element', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(42)
      expect(ring.headNode).toBe(ring.tailNode)
    })
  })

  describe('pop', () => {
    it('returns undefined on empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.pop()).toBeUndefined()
    })

    it('pops from single element ring', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      expect(ring.pop()).toBe(1)
      expect(ring.size).toBe(0)
      expect(ring.isEmpty()).toBe(true)
    })

    it('pops LIFO order', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.pop()).toBe(3)
      expect(ring.pop()).toBe(2)
      expect(ring.pop()).toBe(1)
      expect(ring.pop()).toBeUndefined()
    })
  })

  describe('unshift', () => {
    it('unshifts to empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.unshift(1)
      expect(ring.size).toBe(1)
      expect(ring.headNode?.value).toBe(1)
    })

    it('unshifts multiple values', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.unshift(3)
      ring.unshift(2)
      ring.unshift(1)
      expect(ring.toArray()).toEqual([1, 2, 3])
    })

    it('updates head on unshift', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.unshift(2)
      ring.unshift(1)
      expect(ring.headNode?.value).toBe(1)
    })
  })

  describe('shift', () => {
    it('returns undefined on empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.shift()).toBeUndefined()
    })

    it('shifts from single element ring', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      expect(ring.shift()).toBe(1)
      expect(ring.size).toBe(0)
    })

    it('shifts FIFO order', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.shift()).toBe(1)
      expect(ring.shift()).toBe(2)
      expect(ring.shift()).toBe(3)
    })
  })

  describe('circular property verification', () => {
    it('head.prev === tail in circular ring with multiple elements', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.headNode!.prev).toBe(ring.tailNode)
    })

    it('tail.next === head in circular ring with multiple elements', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.tailNode!.next).toBe(ring.headNode)
    })

    it('head.prev === tail === head for single element circular ring', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(42)
      expect(ring.headNode!.prev).toBe(ring.tailNode)
      expect(ring.tailNode!.next).toBe(ring.headNode)
    })

    it('head.prev is null in non-circular ring', () => {
      const ring = new DoublyLinkedRing<number>({ circular: false })
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.headNode!.prev).toBeNull()
    })

    it('tail.next is null in non-circular ring', () => {
      const ring = new DoublyLinkedRing<number>({ circular: false })
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.tailNode!.next).toBeNull()
    })

    it('circular links maintained after push', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      expect(ring.headNode!.prev).toBe(ring.tailNode)
      expect(ring.tailNode!.next).toBe(ring.headNode)
    })

    it('circular links maintained after pop', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.pop()
      expect(ring.headNode!.prev).toBe(ring.tailNode)
      expect(ring.tailNode!.next).toBe(ring.headNode)
    })

    it('circular links maintained after shift', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.shift()
      expect(ring.headNode!.prev).toBe(ring.tailNode)
      expect(ring.tailNode!.next).toBe(ring.headNode)
    })

    it('circular links maintained after unshift', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.unshift(0)
      expect(ring.headNode!.prev).toBe(ring.tailNode)
      expect(ring.tailNode!.next).toBe(ring.headNode)
    })
  })

  describe('get with positive indices', () => {
    it('gets value at index 0', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(10)
      ring.push(20)
      ring.push(30)
      expect(ring.get(0)).toBe(10)
    })

    it('gets value at middle index', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(10)
      ring.push(20)
      ring.push(30)
      expect(ring.get(1)).toBe(20)
    })

    it('gets value at last index', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(10)
      ring.push(20)
      ring.push(30)
      expect(ring.get(2)).toBe(30)
    })

    it('returns undefined for out-of-bounds index', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      expect(ring.get(5)).toBeUndefined()
    })

    it('returns undefined for empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.get(0)).toBeUndefined()
    })
  })

  describe('get with negative indices', () => {
    it('gets last element with -1', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(10)
      ring.push(20)
      ring.push(30)
      expect(ring.get(-1)).toBe(30)
    })

    it('gets first element with -size', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(10)
      ring.push(20)
      ring.push(30)
      expect(ring.get(-3)).toBe(10)
    })

    it('gets middle element with negative index', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(10)
      ring.push(20)
      ring.push(30)
      expect(ring.get(-2)).toBe(20)
    })
  })

  describe('set', () => {
    it('sets value at index', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.set(1, 99)).toBe(true)
      expect(ring.get(1)).toBe(99)
    })

    it('returns false for invalid index', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      expect(ring.set(5, 99)).toBe(false)
    })

    it('sets value at negative index', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.set(-1, 99)).toBe(true)
      expect(ring.get(-1)).toBe(99)
    })
  })

  describe('insert', () => {
    it('inserts at beginning (index <= 0)', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(2)
      ring.push(3)
      ring.insert(0, 1)
      expect(ring.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at end (index >= size)', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.insert(10, 3)
      expect(ring.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in the middle', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(3)
      ring.insert(1, 2)
      expect(ring.toArray()).toEqual([1, 2, 3])
    })

    it('inserts into empty ring at negative index', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.insert(-5, 1)
      expect(ring.toArray()).toEqual([1])
    })

    it('maintains circular links after insert', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(3)
      ring.insert(1, 2)
      expect(ring.headNode!.prev).toBe(ring.tailNode)
      expect(ring.tailNode!.next).toBe(ring.headNode)
    })
  })

  describe('delete', () => {
    it('deletes from beginning', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.delete(0)).toBe(1)
      expect(ring.toArray()).toEqual([2, 3])
    })

    it('deletes from end', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.delete(2)).toBe(3)
      expect(ring.toArray()).toEqual([1, 2])
    })

    it('deletes from middle', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.delete(1)).toBe(2)
      expect(ring.toArray()).toEqual([1, 3])
    })

    it('returns undefined for invalid index', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.delete(0)).toBeUndefined()
    })

    it('deletes single element', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      expect(ring.delete(0)).toBe(1)
      expect(ring.size).toBe(0)
      expect(ring.headNode).toBeNull()
      expect(ring.tailNode).toBeNull()
    })

    it('supports negative index deletion', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.delete(-1)).toBe(3)
      expect(ring.toArray()).toEqual([1, 2])
    })
  })

  describe('rotate', () => {
    it('rotates forward by 1', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.push(4)
      ring.rotate(1)
      expect(ring.toArray()).toEqual([2, 3, 4, 1])
    })

    it('rotates forward by 2', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.push(4)
      ring.rotate(2)
      expect(ring.toArray()).toEqual([3, 4, 1, 2])
    })

    it('rotates backward by 1', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.push(4)
      ring.rotate(-1)
      expect(ring.toArray()).toEqual([4, 1, 2, 3])
    })

    it('rotates backward by 2', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.push(4)
      ring.rotate(-2)
      expect(ring.toArray()).toEqual([3, 4, 1, 2])
    })

    it('no-op on empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.rotate(5)
      expect(ring.size).toBe(0)
    })

    it('no-op on single element ring', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.rotate(3)
      expect(ring.toArray()).toEqual([1])
    })

    it('full rotation is no-op', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.rotate(3)
      expect(ring.toArray()).toEqual([1, 2, 3])
    })

    it('rotation larger than size wraps', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.rotate(7)
      expect(ring.toArray()).toEqual([2, 3, 1])
    })

    it('maintains circular links after rotate', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.rotate(1)
      expect(ring.headNode!.prev).toBe(ring.tailNode)
      expect(ring.tailNode!.next).toBe(ring.headNode)
    })
  })

  describe('splice', () => {
    it('removes elements from start', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      const removed = ring.splice(0, 2)
      expect(removed).toEqual([1, 2])
      expect(ring.toArray()).toEqual([3])
    })

    it('removes and inserts elements', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      const removed = ring.splice(1, 1, 20, 30)
      expect(removed).toEqual([2])
      expect(ring.toArray()).toEqual([1, 20, 30, 3])
    })

    it('removes all elements when deleteCount exceeds size', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      const removed = ring.splice(0, 100)
      expect(removed).toEqual([1, 2])
      expect(ring.size).toBe(0)
    })

    it('inserts without deleting when deleteCount is 0', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(3)
      ring.splice(1, 0, 2)
      expect(ring.toArray()).toEqual([1, 2, 3])
    })

    it('deletes to end when deleteCount is omitted', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      const removed = ring.splice(1)
      expect(removed).toEqual([2, 3])
      expect(ring.toArray()).toEqual([1])
    })
  })

  describe('slice', () => {
    it('slices with start and end', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.push(4)
      ring.push(5)
      const sliced = ring.slice(1, 4)
      expect(sliced.toArray()).toEqual([2, 3, 4])
    })

    it('slices with only start', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      const sliced = ring.slice(1)
      expect(sliced.toArray()).toEqual([2, 3])
    })

    it('slices with no args returns copy', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      const sliced = ring.slice()
      expect(sliced.toArray()).toEqual([1, 2, 3])
      expect(sliced).not.toBe(ring)
    })

    it('returns empty for invalid range', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      const sliced = ring.slice(2, 1)
      expect(sliced.toArray()).toEqual([])
    })

    it('returns empty for empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      const sliced = ring.slice()
      expect(sliced.toArray()).toEqual([])
    })
  })

  describe('reverse', () => {
    it('reverses ring in place', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.reverse()
      expect(ring.toArray()).toEqual([3, 2, 1])
    })

    it('reverse of single element is no-op', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.reverse()
      expect(ring.toArray()).toEqual([1])
    })

    it('reverse of empty ring is no-op', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.reverse()
      expect(ring.size).toBe(0)
    })

    it('maintains circular links after reverse', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.reverse()
      expect(ring.headNode!.prev).toBe(ring.tailNode)
      expect(ring.tailNode!.next).toBe(ring.headNode)
    })

    it('double reverse restores original', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.reverse()
      ring.reverse()
      expect(ring.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('concatenate', () => {
    it('concatenates two rings', () => {
      const ring1 = new DoublyLinkedRing<number>()
      ring1.push(1)
      ring1.push(2)
      const ring2 = new DoublyLinkedRing<number>()
      ring2.push(3)
      ring2.push(4)
      const result = ring1.concatenate(ring2)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('concatenates with empty ring', () => {
      const ring1 = new DoublyLinkedRing<number>()
      ring1.push(1)
      ring1.push(2)
      const ring2 = new DoublyLinkedRing<number>()
      const result = ring1.concatenate(ring2)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('concatenates empty with non-empty', () => {
      const ring1 = new DoublyLinkedRing<number>()
      const ring2 = new DoublyLinkedRing<number>()
      ring2.push(3)
      ring2.push(4)
      const result = ring1.concatenate(ring2)
      expect(result.toArray()).toEqual([3, 4])
    })

    it('does not modify original rings', () => {
      const ring1 = new DoublyLinkedRing<number>()
      ring1.push(1)
      const ring2 = new DoublyLinkedRing<number>()
      ring2.push(2)
      ring1.concatenate(ring2)
      expect(ring1.toArray()).toEqual([1])
      expect(ring2.toArray()).toEqual([2])
    })

    it('result ring is circular when originals are circular', () => {
      const ring1 = new DoublyLinkedRing<number>()
      ring1.push(1)
      const ring2 = new DoublyLinkedRing<number>()
      ring2.push(2)
      const result = ring1.concatenate(ring2)
      expect(result.headNode!.prev).toBe(result.tailNode)
      expect(result.tailNode!.next).toBe(result.headNode)
    })
  })

  describe('split', () => {
    it('splits at middle index', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.push(4)
      const [left, right] = ring.split(2)
      expect(left.toArray()).toEqual([1, 2])
      expect(right.toArray()).toEqual([3, 4])
    })

    it('splits at 0 gives empty left', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      const [left, right] = ring.split(0)
      expect(left.toArray()).toEqual([])
      expect(right.toArray()).toEqual([1, 2])
    })

    it('splits at size gives empty right', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      const [left, right] = ring.split(2)
      expect(left.toArray()).toEqual([1, 2])
      expect(right.toArray()).toEqual([])
    })

    it('splits empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      const [left, right] = ring.split(0)
      expect(left.toArray()).toEqual([])
      expect(right.toArray()).toEqual([])
    })
  })

  describe('iteration', () => {
    it('iterates with for-of', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      const result: number[] = []
      for (const val of ring) {
        result.push(val)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('iterates empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      const result: number[] = []
      for (const val of ring) {
        result.push(val)
      }
      expect(result).toEqual([])
    })

    it('spread into array', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      expect([...ring]).toEqual([1, 2])
    })
  })

  describe('forEach', () => {
    it('calls callback for each element with index', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(10)
      ring.push(20)
      ring.push(30)
      const result: Array<{ value: number; index: number }> = []
      ring.forEach((value, index) => {
        result.push({ value, index })
      })
      expect(result).toEqual([
        { value: 10, index: 0 },
        { value: 20, index: 1 },
        { value: 30, index: 2 },
      ])
    })

    it('does not call on empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      let called = false
      ring.forEach(() => {
        called = true
      })
      expect(called).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('finds index of existing value', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(10)
      ring.push(20)
      ring.push(30)
      expect(ring.indexOf(20)).toBe(1)
    })

    it('returns -1 for non-existent value', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      expect(ring.indexOf(99)).toBe(-1)
    })

    it('returns -1 on empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.indexOf(1)).toBe(-1)
    })

    it('finds first occurrence', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(1)
      expect(ring.indexOf(1)).toBe(0)
    })
  })

  describe('includes', () => {
    it('returns true for existing value', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      expect(ring.includes(2)).toBe(true)
    })

    it('returns false for non-existent value', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      expect(ring.includes(99)).toBe(false)
    })

    it('returns false on empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.includes(1)).toBe(false)
    })
  })

  describe('find', () => {
    it('finds first matching element', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.find((v) => v > 1)).toBe(2)
    })

    it('returns undefined when no match', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      expect(ring.find((v) => v > 10)).toBeUndefined()
    })

    it('returns undefined on empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.find((v) => v > 0)).toBeUndefined()
    })
  })

  describe('findLast', () => {
    it('finds last matching element', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.push(4)
      expect(ring.findLast((v) => v > 2)).toBe(4)
    })

    it('returns undefined when no match', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      expect(ring.findLast((v) => v > 10)).toBeUndefined()
    })

    it('returns undefined on empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.findLast(() => true)).toBeUndefined()
    })
  })

  describe('some', () => {
    it('returns true when any element matches', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.some((v) => v === 2)).toBe(true)
    })

    it('returns false when no element matches', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      expect(ring.some((v) => v > 10)).toBe(false)
    })

    it('returns false on empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.some(() => true)).toBe(false)
    })
  })

  describe('every', () => {
    it('returns true when all elements match', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(2)
      ring.push(4)
      ring.push(6)
      expect(ring.every((v) => v % 2 === 0)).toBe(true)
    })

    it('returns false when any element does not match', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(2)
      ring.push(3)
      ring.push(4)
      expect(ring.every((v) => v % 2 === 0)).toBe(false)
    })

    it('returns true on empty ring', () => {
      const ring = new DoublyLinkedRing<number>()
      expect(ring.every(() => false)).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears ring with elements', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.clear()
      expect(ring.size).toBe(0)
      expect(ring.isEmpty()).toBe(true)
      expect(ring.headNode).toBeNull()
      expect(ring.tailNode).toBeNull()
      expect(ring.toArray()).toEqual([])
    })

    it('clear on empty ring is no-op', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.clear()
      expect(ring.size).toBe(0)
    })
  })

  describe('statistics', () => {
    it('tracks insertions via push', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      expect(ring.statistics.insertions).toBe(2)
    })

    it('tracks insertions via unshift', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.unshift(1)
      expect(ring.statistics.insertions).toBe(1)
    })

    it('tracks deletions via pop', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.pop()
      expect(ring.statistics.deletions).toBe(1)
    })

    it('tracks deletions via shift', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.shift()
      expect(ring.statistics.deletions).toBe(1)
    })

    it('tracks rotations', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.rotate(1)
      expect(ring.statistics.rotations).toBe(1)
    })

    it('statistics returns a copy', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      const stats1 = ring.statistics
      const stats2 = ring.statistics
      expect(stats1).not.toBe(stats2)
      expect(stats1).toEqual(stats2)
    })
  })

  describe('edge cases', () => {
    it('handles push then pop then push', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.pop()
      ring.push(2)
      expect(ring.toArray()).toEqual([2])
    })

    it('handles unshift then shift then unshift', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.unshift(1)
      ring.shift()
      ring.unshift(2)
      expect(ring.toArray()).toEqual([2])
    })

    it('handles mixed push and unshift', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(2)
      ring.unshift(1)
      ring.push(3)
      expect(ring.toArray()).toEqual([1, 2, 3])
    })

    it('handles string values', () => {
      const ring = new DoublyLinkedRing<string>()
      ring.push('a')
      ring.push('b')
      ring.push('c')
      expect(ring.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('handles object values', () => {
      const ring = new DoublyLinkedRing<{ id: number }>()
      ring.push({ id: 1 })
      ring.push({ id: 2 })
      expect(ring.get(0)?.id).toBe(1)
      expect(ring.get(1)?.id).toBe(2)
    })

    it('large sequence push and verify', () => {
      const ring = new DoublyLinkedRing<number>()
      for (let i = 0; i < 100; i++) {
        ring.push(i)
      }
      expect(ring.size).toBe(100)
      expect(ring.get(0)).toBe(0)
      expect(ring.get(99)).toBe(99)
      expect(ring.get(50)).toBe(50)
    })

    it('large sequence shift all', () => {
      const ring = new DoublyLinkedRing<number>()
      for (let i = 0; i < 50; i++) {
        ring.push(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(ring.shift()).toBe(i)
      }
      expect(ring.isEmpty()).toBe(true)
    })

    it('large sequence pop all', () => {
      const ring = new DoublyLinkedRing<number>()
      for (let i = 0; i < 50; i++) {
        ring.push(i)
      }
      for (let i = 49; i >= 0; i--) {
        expect(ring.pop()).toBe(i)
      }
      expect(ring.isEmpty()).toBe(true)
    })

    it('non-circular push/pop works', () => {
      const ring = new DoublyLinkedRing<number>({ circular: false })
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.headNode!.prev).toBeNull()
      expect(ring.tailNode!.next).toBeNull()
      expect(ring.toArray()).toEqual([1, 2, 3])
    })

    it('non-circular unshift/shift works', () => {
      const ring = new DoublyLinkedRing<number>({ circular: false })
      ring.unshift(3)
      ring.unshift(2)
      ring.unshift(1)
      expect(ring.shift()).toBe(1)
      expect(ring.headNode!.prev).toBeNull()
    })

    it('splice on empty ring with items', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.splice(0, 0, 1, 2, 3)
      expect(ring.toArray()).toEqual([1, 2, 3])
    })

    it('slice with negative indices', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.push(4)
      ring.push(5)
      const sliced = ring.slice(-3, -1)
      expect(sliced.toArray()).toEqual([3, 4])
    })

    it('delete with negative index wraps correctly', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      expect(ring.delete(-2)).toBe(2)
      expect(ring.toArray()).toEqual([1, 3])
    })

    it('reverse two elements', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.reverse()
      expect(ring.toArray()).toEqual([2, 1])
    })

    it('insert maintains correct size', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(3)
      ring.insert(1, 2)
      expect(ring.size).toBe(3)
    })

    it('delete from middle maintains size', () => {
      const ring = new DoublyLinkedRing<number>()
      ring.push(1)
      ring.push(2)
      ring.push(3)
      ring.delete(1)
      expect(ring.size).toBe(2)
    })
  })
})
