import { describe, it, expect, beforeEach } from 'vitest'
import { ImplicitTreap } from '../../src/core/treap-implicit/treap-implicit.js'

describe('ImplicitTreap', () => {
  describe('constructor', () => {
    it('should create empty treap', () => {
      const t = new ImplicitTreap<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create treap with initialValues', () => {
      const t = new ImplicitTreap<number>({ initialValues: [1, 2, 3] })
      expect(t.size()).toBe(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle empty initialValues', () => {
      const t = new ImplicitTreap<number>({ initialValues: [] })
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle no options', () => {
      const t = new ImplicitTreap<string>()
      expect(t.size()).toBe(0)
    })

    it('should handle single element initialValues', () => {
      const t = new ImplicitTreap({ initialValues: [42] })
      expect(t.size()).toBe(1)
      expect(t.get(0)).toBe(42)
    })

    it('should maintain insertion order with initialValues', () => {
      const t = new ImplicitTreap({ initialValues: [5, 3, 1, 4, 2] })
      expect(t.toArray()).toEqual([5, 3, 1, 4, 2])
    })

    it('should handle string values', () => {
      const t = new ImplicitTreap({ initialValues: ['a', 'b', 'c'] })
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should handle object values', () => {
      const t = new ImplicitTreap({ initialValues: [{ x: 1 }, { x: 2 }] })
      expect(t.size()).toBe(2)
    })
  })

  describe('pushBack', () => {
    it('should push single element', () => {
      const t = new ImplicitTreap<number>()
      t.pushBack(1)
      expect(t.size()).toBe(1)
      expect(t.get(0)).toBe(1)
    })

    it('should push multiple elements in order', () => {
      const t = new ImplicitTreap<number>()
      t.pushBack(1)
      t.pushBack(2)
      t.pushBack(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should push 100 elements', () => {
      const t = new ImplicitTreap<number>()
      for (let i = 0; i < 100; i++) t.pushBack(i)
      expect(t.size()).toBe(100)
      expect(t.get(0)).toBe(0)
      expect(t.get(99)).toBe(99)
    })
  })

  describe('pushFront', () => {
    it('should push single element', () => {
      const t = new ImplicitTreap<number>()
      t.pushFront(1)
      expect(t.size()).toBe(1)
      expect(t.get(0)).toBe(1)
    })

    it('should push multiple elements in reverse', () => {
      const t = new ImplicitTreap<number>()
      t.pushFront(1)
      t.pushFront(2)
      t.pushFront(3)
      expect(t.toArray()).toEqual([3, 2, 1])
    })

    it('should interleave pushFront and pushBack', () => {
      const t = new ImplicitTreap<number>()
      t.pushBack(2)
      t.pushFront(1)
      t.pushBack(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('popBack', () => {
    it('should return undefined on empty treap', () => {
      const t = new ImplicitTreap<number>()
      expect(t.popBack()).toBeUndefined()
    })

    it('should pop single element', () => {
      const t = new ImplicitTreap({ initialValues: [1] })
      expect(t.popBack()).toBe(1)
      expect(t.isEmpty()).toBe(true)
    })

    it('should pop elements in reverse order', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.popBack()).toBe(3)
      expect(t.popBack()).toBe(2)
      expect(t.popBack()).toBe(1)
      expect(t.isEmpty()).toBe(true)
    })

    it('should pop all elements', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2] })
      t.popBack()
      t.popBack()
      expect(t.size()).toBe(0)
      expect(t.popBack()).toBeUndefined()
    })
  })

  describe('popFront', () => {
    it('should return undefined on empty treap', () => {
      const t = new ImplicitTreap<number>()
      expect(t.popFront()).toBeUndefined()
    })

    it('should pop single element', () => {
      const t = new ImplicitTreap({ initialValues: [1] })
      expect(t.popFront()).toBe(1)
      expect(t.isEmpty()).toBe(true)
    })

    it('should pop elements in order', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.popFront()).toBe(1)
      expect(t.popFront()).toBe(2)
      expect(t.popFront()).toBe(3)
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('get', () => {
    it('should return undefined for out of bounds', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.get(-1)).toBeUndefined()
      expect(t.get(3)).toBeUndefined()
      expect(t.get(100)).toBeUndefined()
    })

    it('should return undefined on empty treap', () => {
      const t = new ImplicitTreap<number>()
      expect(t.get(0)).toBeUndefined()
    })

    it('should get elements by index', () => {
      const t = new ImplicitTreap({ initialValues: [10, 20, 30, 40, 50] })
      expect(t.get(0)).toBe(10)
      expect(t.get(1)).toBe(20)
      expect(t.get(2)).toBe(30)
      expect(t.get(3)).toBe(40)
      expect(t.get(4)).toBe(50)
    })

    it('should get elements after modifications', () => {
      const t = new ImplicitTreap<number>()
      t.pushBack(1)
      t.pushBack(2)
      t.pushBack(3)
      t.removeAt(1)
      expect(t.get(0)).toBe(1)
      expect(t.get(1)).toBe(3)
    })
  })

  describe('set', () => {
    it('should set value at index', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.set(1, 20)
      expect(t.get(1)).toBe(20)
      expect(t.toArray()).toEqual([1, 20, 3])
    })

    it('should not modify out of bounds', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.set(-1, 99)
      t.set(3, 99)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should set first element', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.set(0, 10)
      expect(t.get(0)).toBe(10)
    })

    it('should set last element', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.set(2, 30)
      expect(t.get(2)).toBe(30)
    })

    it('should handle multiple sets', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.set(0, 10)
      t.set(2, 30)
      t.set(4, 50)
      expect(t.toArray()).toEqual([10, 2, 30, 4, 50])
    })
  })

  describe('insertAt', () => {
    it('should insert at beginning', () => {
      const t = new ImplicitTreap({ initialValues: [2, 3] })
      t.insertAt(0, 1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should insert at end', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2] })
      t.insertAt(2, 3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should insert in middle', () => {
      const t = new ImplicitTreap({ initialValues: [1, 3] })
      t.insertAt(1, 2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle negative index as 0', () => {
      const t = new ImplicitTreap({ initialValues: [2, 3] })
      t.insertAt(-5, 1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle index beyond size as append', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2] })
      t.insertAt(100, 3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should insert into empty treap', () => {
      const t = new ImplicitTreap<number>()
      t.insertAt(0, 1)
      expect(t.toArray()).toEqual([1])
    })
  })

  describe('removeAt', () => {
    it('should return undefined for out of bounds', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.removeAt(-1)).toBeUndefined()
      expect(t.removeAt(3)).toBeUndefined()
    })

    it('should return undefined on empty treap', () => {
      const t = new ImplicitTreap<number>()
      expect(t.removeAt(0)).toBeUndefined()
    })

    it('should remove first element', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.removeAt(0)).toBe(1)
      expect(t.toArray()).toEqual([2, 3])
    })

    it('should remove last element', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.removeAt(2)).toBe(3)
      expect(t.toArray()).toEqual([1, 2])
    })

    it('should remove middle element', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.removeAt(1)).toBe(2)
      expect(t.toArray()).toEqual([1, 3])
    })

    it('should remove all elements one by one', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.removeAt(1)
      t.removeAt(0)
      t.removeAt(0)
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const t = new ImplicitTreap<number>()
      expect(t.size()).toBe(0)
      t.pushBack(1)
      expect(t.size()).toBe(1)
      t.pushBack(2)
      expect(t.size()).toBe(2)
      t.popBack()
      expect(t.size()).toBe(1)
    })

    it('should track isEmpty correctly', () => {
      const t = new ImplicitTreap<number>()
      expect(t.isEmpty()).toBe(true)
      t.pushBack(1)
      expect(t.isEmpty()).toBe(false)
      t.popBack()
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty treap', () => {
      const t = new ImplicitTreap<number>()
      t.clear()
      expect(t.isEmpty()).toBe(true)
    })

    it('should clear non-empty treap', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.clear()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
      expect(t.toArray()).toEqual([])
    })

    it('should allow operations after clear', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.clear()
      t.pushBack(4)
      expect(t.toArray()).toEqual([4])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty treap', () => {
      const t = new ImplicitTreap<number>()
      expect(t.toArray()).toEqual([])
    })

    it('should return all elements in order', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should return new array each call', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2] })
      const a = t.toArray()
      const b = t.toArray()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })
  })

  describe('reverse', () => {
    it('should reverse entire treap', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.reverse()
      expect(t.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('should reverse subrange', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.reverse(1, 4)
      expect(t.toArray()).toEqual([1, 4, 3, 2, 5])
    })

    it('should handle reverse with default params', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.reverse()
      expect(t.toArray()).toEqual([3, 2, 1])
    })

    it('should handle single element reverse', () => {
      const t = new ImplicitTreap({ initialValues: [1] })
      t.reverse()
      expect(t.toArray()).toEqual([1])
    })

    it('should handle empty treap reverse', () => {
      const t = new ImplicitTreap<number>()
      t.reverse()
      expect(t.toArray()).toEqual([])
    })

    it('should handle reverse of two elements', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2] })
      t.reverse()
      expect(t.toArray()).toEqual([2, 1])
    })

    it('should handle multiple reverses', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.reverse(0, 3)
      t.reverse(3, 5)
      expect(t.toArray()).toEqual([3, 2, 1, 5, 4])
    })

    it('should double reverse to original', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4] })
      t.reverse(1, 3)
      t.reverse(1, 3)
      expect(t.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should handle reverse of single element range (no-op)', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.reverse(1, 2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle invalid ranges gracefully', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.reverse(-1, 2)
      t.reverse(2, 2)
      t.reverse(3, 5)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should reverse and then access elements', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.reverse(1, 4)
      expect(t.get(0)).toBe(1)
      expect(t.get(1)).toBe(4)
      expect(t.get(2)).toBe(3)
      expect(t.get(3)).toBe(2)
      expect(t.get(4)).toBe(5)
    })

    it('should reverse then insert', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.reverse()
      t.insertAt(2, 99)
      expect(t.toArray()).toEqual([5, 4, 99, 3, 2, 1])
    })

    it('should reverse then remove', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.reverse()
      t.removeAt(2)
      expect(t.toArray()).toEqual([5, 4, 2, 1])
    })
  })

  describe('rotateLeft', () => {
    it('should rotate by 1', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.rotateLeft(1)
      expect(t.toArray()).toEqual([2, 3, 4, 5, 1])
    })

    it('should rotate by 2', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.rotateLeft(2)
      expect(t.toArray()).toEqual([3, 4, 5, 1, 2])
    })

    it('should rotate by 0 (no-op)', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.rotateLeft(0)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should rotate by size (no-op)', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.rotateLeft(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle negative rotation', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.rotateLeft(-1)
      expect(t.toArray()).toEqual([5, 1, 2, 3, 4])
    })

    it('should handle rotation larger than size', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.rotateLeft(7)
      expect(t.toArray()).toEqual([2, 3, 1])
    })

    it('should handle empty treap', () => {
      const t = new ImplicitTreap<number>()
      t.rotateLeft(5)
      expect(t.toArray()).toEqual([])
    })

    it('should handle single element', () => {
      const t = new ImplicitTreap({ initialValues: [1] })
      t.rotateLeft(5)
      expect(t.toArray()).toEqual([1])
    })

    it('should rotate full cycle', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.rotateLeft(1)
      t.rotateLeft(1)
      t.rotateLeft(1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('slice', () => {
    it('should slice entire treap', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      const s = t.slice(0)
      expect(s.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should slice from start', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      const s = t.slice(0, 3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should slice from middle', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      const s = t.slice(2, 4)
      expect(s.toArray()).toEqual([3, 4])
    })

    it('should slice to end', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      const s = t.slice(3)
      expect(s.toArray()).toEqual([4, 5])
    })

    it('should slice single element', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      const s = t.slice(1, 2)
      expect(s.toArray()).toEqual([2])
    })

    it('should handle negative start', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      const s = t.slice(-2)
      expect(s.toArray()).toEqual([4, 5])
    })

    it('should handle negative end', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      const s = t.slice(1, -1)
      expect(s.toArray()).toEqual([2, 3, 4])
    })

    it('should return empty for invalid range', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      const s = t.slice(3, 1)
      expect(s.toArray()).toEqual([])
    })

    it('should return empty for out of bounds', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      const s = t.slice(10, 20)
      expect(s.toArray()).toEqual([])
    })

    it('should not modify original', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.slice(1, 3)
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should return independent treap', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      const s = t.slice(0, 2)
      s.set(0, 99)
      expect(t.get(0)).toBe(1)
      expect(s.get(0)).toBe(99)
    })
  })

  describe('concat', () => {
    it('should concat two non-empty treaps', () => {
      const a = new ImplicitTreap({ initialValues: [1, 2] })
      const b = new ImplicitTreap({ initialValues: [3, 4] })
      const c = a.concat(b)
      expect(c.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should concat with empty left', () => {
      const a = new ImplicitTreap<number>()
      const b = new ImplicitTreap({ initialValues: [1, 2] })
      const c = a.concat(b)
      expect(c.toArray()).toEqual([1, 2])
    })

    it('should concat with empty right', () => {
      const a = new ImplicitTreap({ initialValues: [1, 2] })
      const b = new ImplicitTreap<number>()
      const c = a.concat(b)
      expect(c.toArray()).toEqual([1, 2])
    })

    it('should concat two empty treaps', () => {
      const a = new ImplicitTreap<number>()
      const b = new ImplicitTreap<number>()
      const c = a.concat(b)
      expect(c.isEmpty()).toBe(true)
    })

    it('should not modify originals', () => {
      const a = new ImplicitTreap({ initialValues: [1, 2] })
      const b = new ImplicitTreap({ initialValues: [3, 4] })
      a.concat(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([3, 4])
    })

    it('should return independent treap', () => {
      const a = new ImplicitTreap({ initialValues: [1] })
      const b = new ImplicitTreap({ initialValues: [2] })
      const c = a.concat(b)
      c.set(0, 99)
      expect(a.get(0)).toBe(1)
    })
  })

  describe('indexOf', () => {
    it('should find element at beginning', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.indexOf(1)).toBe(0)
    })

    it('should find element in middle', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.indexOf(2)).toBe(1)
    })

    it('should find element at end', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.indexOf(3)).toBe(2)
    })

    it('should return -1 for missing element', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.indexOf(4)).toBe(-1)
    })

    it('should return -1 on empty treap', () => {
      const t = new ImplicitTreap<number>()
      expect(t.indexOf(1)).toBe(-1)
    })

    it('should find first occurrence of duplicates', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 2, 3] })
      expect(t.indexOf(2)).toBe(1)
    })

    it('should respect fromIndex', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 2, 3] })
      expect(t.indexOf(2, 2)).toBe(2)
    })

    it('should return -1 if fromIndex is too large', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.indexOf(1, 5)).toBe(-1)
    })

    it('should find using reference equality for objects', () => {
      const obj = { x: 1 }
      const t = new ImplicitTreap({ initialValues: [obj] })
      expect(t.indexOf(obj)).toBe(0)
    })
  })

  describe('contains', () => {
    it('should return true for existing element', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.contains(2)).toBe(true)
    })

    it('should return false for missing element', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect(t.contains(4)).toBe(false)
    })

    it('should return false on empty treap', () => {
      const t = new ImplicitTreap<number>()
      expect(t.contains(1)).toBe(false)
    })
  })

  describe('clone', () => {
    it('should clone empty treap', () => {
      const t = new ImplicitTreap<number>()
      const c = t.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('should clone non-empty treap', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      const c = t.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
    })

    it('should produce independent copy', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      const c = t.clone()
      c.set(0, 99)
      expect(t.get(0)).toBe(1)
      expect(c.get(0)).toBe(99)
    })

    it('should preserve size', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      const c = t.clone()
      expect(c.size()).toBe(t.size())
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate empty treap', () => {
      const t = new ImplicitTreap<number>()
      const result: number[] = []
      for (const v of t) result.push(v)
      expect(result).toEqual([])
    })

    it('should iterate all elements in order', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      const result: number[] = []
      for (const v of t) result.push(v)
      expect(result).toEqual([1, 2, 3])
    })

    it('should work with spread operator', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      expect([...t]).toEqual([1, 2, 3])
    })

    it('should work with Array.from', () => {
      const t = new ImplicitTreap({ initialValues: [4, 5, 6] })
      expect(Array.from(t)).toEqual([4, 5, 6])
    })
  })

  describe('forEach', () => {
    it('should call callback for each element', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      const result: number[] = []
      t.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('should pass correct indices', () => {
      const t = new ImplicitTreap({ initialValues: [10, 20, 30] })
      const indices: number[] = []
      t.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not call on empty treap', () => {
      const t = new ImplicitTreap<number>()
      let count = 0
      t.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('split/merge internals', () => {
    it('should handle alternating push/pop', () => {
      const t = new ImplicitTreap<number>()
      for (let i = 0; i < 50; i++) t.pushBack(i)
      for (let i = 0; i < 25; i++) t.popFront()
      expect(t.size()).toBe(25)
      expect(t.get(0)).toBe(25)
    })

    it('should handle push/pop interleaving', () => {
      const t = new ImplicitTreap<number>()
      t.pushBack(1)
      t.pushFront(0)
      t.pushBack(2)
      t.popFront()
      t.pushBack(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle many insertions and deletions', () => {
      const t = new ImplicitTreap<number>()
      for (let i = 0; i < 100; i++) t.insertAt(i, i)
      for (let i = 99; i >= 0; i -= 2) t.removeAt(i)
      expect(t.size()).toBe(50)
    })
  })

  describe('edge cases', () => {
    it('should handle large number of elements', () => {
      const t = new ImplicitTreap<number>()
      for (let i = 0; i < 1000; i++) t.pushBack(i)
      expect(t.size()).toBe(1000)
      expect(t.get(0)).toBe(0)
      expect(t.get(999)).toBe(999)
      expect(t.toArray()).toEqual(Array.from({ length: 1000 }, (_, i) => i))
    })

    it('should handle stress: 1000 insertions and deletions', () => {
      const t = new ImplicitTreap<number>()
      for (let i = 0; i < 1000; i++) t.pushBack(i)
      for (let i = 0; i < 500; i++) t.removeAt(0)
      expect(t.size()).toBe(500)
      expect(t.get(0)).toBe(500)
    })

    it('should handle stress: 1000 pushFront', () => {
      const t = new ImplicitTreap<number>()
      for (let i = 0; i < 1000; i++) t.pushFront(i)
      expect(t.size()).toBe(1000)
      expect(t.get(0)).toBe(999)
      expect(t.get(999)).toBe(0)
    })

    it('should handle stress: reverse 1000 elements', () => {
      const t = new ImplicitTreap<number>()
      for (let i = 0; i < 1000; i++) t.pushBack(i)
      t.reverse()
      expect(t.get(0)).toBe(999)
      expect(t.get(999)).toBe(0)
    })

    it('should handle stress: rotate 1000 elements', () => {
      const t = new ImplicitTreap<number>()
      for (let i = 0; i < 1000; i++) t.pushBack(i)
      t.rotateLeft(500)
      expect(t.get(0)).toBe(500)
      expect(t.get(999)).toBe(499)
    })

    it('should handle stress: 1000 slice operations', () => {
      const t = new ImplicitTreap<number>()
      for (let i = 0; i < 1000; i++) t.pushBack(i)
      for (let i = 0; i < 10; i++) {
        const s = t.slice(i * 100, (i + 1) * 100)
        expect(s.size()).toBe(100)
        expect(s.get(0)).toBe(i * 100)
      }
    })

    it('should handle stress: mixed operations on 1000 elements', () => {
      const t = new ImplicitTreap<number>()
      for (let i = 0; i < 1000; i++) t.pushBack(i)
      t.reverse(100, 900)
      t.rotateLeft(100)
      t.removeAt(500)
      t.insertAt(500, -1)
      expect(t.size()).toBe(1000)
    })

    it('should handle undefined values', () => {
      const t = new ImplicitTreap<number | undefined>({ initialValues: [1, undefined, 3] })
      expect(t.get(1)).toBeUndefined()
      expect(t.indexOf(undefined)).toBe(1)
    })

    it('should handle null values', () => {
      const t = new ImplicitTreap<number | null>({ initialValues: [1, null, 3] })
      expect(t.get(1)).toBeNull()
    })

    it('should handle boolean values', () => {
      const t = new ImplicitTreap({ initialValues: [true, false, true] })
      expect(t.toArray()).toEqual([true, false, true])
    })

    it('should handle string values', () => {
      const t = new ImplicitTreap({ initialValues: ['hello', 'world'] })
      expect(t.indexOf('world')).toBe(1)
    })
  })

  describe('reverse combined with other operations', () => {
    it('should reverse then concat', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.reverse()
      const t2 = new ImplicitTreap({ initialValues: [4, 5] })
      const c = t.concat(t2)
      expect(c.toArray()).toEqual([3, 2, 1, 4, 5])
    })

    it('should reverse then slice', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.reverse()
      const s = t.slice(1, 4)
      expect(s.toArray()).toEqual([4, 3, 2])
    })

    it('should reverse then indexOf', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.reverse()
      expect(t.indexOf(1)).toBe(4)
      expect(t.indexOf(5)).toBe(0)
    })

    it('should reverse subrange then toArray', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.reverse(0, 5)
      expect(t.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('should reverse then forEach', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.reverse()
      const result: number[] = []
      t.forEach((v) => result.push(v))
      expect(result).toEqual([3, 2, 1])
    })

    it('should handle reverse followed by set', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.reverse(1, 4)
      t.set(2, 99)
      expect(t.toArray()).toEqual([1, 4, 99, 2, 5])
    })

    it('should handle multiple partial reverses', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5, 6] })
      t.reverse(0, 3)
      t.reverse(3, 6)
      expect(t.toArray()).toEqual([3, 2, 1, 6, 5, 4])
    })

    it('should handle reverse then clone', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.reverse()
      const c = t.clone()
      expect(c.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('rotate combined with other operations', () => {
    it('should rotate then reverse', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.rotateLeft(2)
      t.reverse()
      expect(t.toArray()).toEqual([2, 1, 5, 4, 3])
    })

    it('should rotate then slice', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3, 4, 5] })
      t.rotateLeft(2)
      const s = t.slice(0, 3)
      expect(s.toArray()).toEqual([3, 4, 5])
    })

    it('should rotate then concat', () => {
      const t = new ImplicitTreap({ initialValues: [1, 2, 3] })
      t.rotateLeft(1)
      const t2 = new ImplicitTreap({ initialValues: [4, 5] })
      const c = t.concat(t2)
      expect(c.toArray()).toEqual([2, 3, 1, 4, 5])
    })
  })
})
