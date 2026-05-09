import { describe, it, expect, beforeEach } from 'vitest'
import { TreapImplicitMeld } from '../../src/core/treap-implicit-meld/treap-implicit-meld.js'

describe('TreapImplicitMeld', () => {
  describe('constructor', () => {
    it('should create empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('static fromArray', () => {
    it('should create from empty array', () => {
      const t = TreapImplicitMeld.fromArray([])
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create from single element array', () => {
      const t = TreapImplicitMeld.fromArray([42])
      expect(t.size()).toBe(1)
      expect(t.get(0)).toBe(42)
    })

    it('should create from multiple elements', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should create from string array', () => {
      const t = TreapImplicitMeld.fromArray(['a', 'b', 'c'])
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should create independent treap from array', () => {
      const arr = [1, 2, 3]
      const t = TreapImplicitMeld.fromArray(arr)
      arr.push(4)
      expect(t.size()).toBe(3)
    })
  })

  describe('push', () => {
    it('should push single element', () => {
      const t = new TreapImplicitMeld<number>()
      t.push(1)
      expect(t.size()).toBe(1)
      expect(t.get(0)).toBe(1)
    })

    it('should push multiple elements in order', () => {
      const t = new TreapImplicitMeld<number>()
      t.push(1)
      t.push(2)
      t.push(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should push 100 elements', () => {
      const t = new TreapImplicitMeld<number>()
      for (let i = 0; i < 100; i++) t.push(i)
      expect(t.size()).toBe(100)
      expect(t.get(0)).toBe(0)
      expect(t.get(99)).toBe(99)
    })
  })

  describe('pop', () => {
    it('should return undefined on empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      expect(t.pop()).toBeUndefined()
    })

    it('should pop single element', () => {
      const t = TreapImplicitMeld.fromArray([1])
      expect(t.pop()).toBe(1)
      expect(t.isEmpty()).toBe(true)
    })

    it('should pop elements in reverse order', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.pop()).toBe(3)
      expect(t.pop()).toBe(2)
      expect(t.pop()).toBe(1)
      expect(t.isEmpty()).toBe(true)
    })

    it('should pop all elements then return undefined', () => {
      const t = TreapImplicitMeld.fromArray([1, 2])
      t.pop()
      t.pop()
      expect(t.pop()).toBeUndefined()
    })

    it('should handle push after pop', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.pop()
      t.push(4)
      expect(t.toArray()).toEqual([1, 2, 4])
    })
  })

  describe('shift', () => {
    it('should return undefined on empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      expect(t.shift()).toBeUndefined()
    })

    it('should shift single element', () => {
      const t = TreapImplicitMeld.fromArray([1])
      expect(t.shift()).toBe(1)
      expect(t.isEmpty()).toBe(true)
    })

    it('should shift elements in order', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.shift()).toBe(1)
      expect(t.shift()).toBe(2)
      expect(t.shift()).toBe(3)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle push after shift', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.shift()
      t.push(4)
      expect(t.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('unshift', () => {
    it('should unshift single element', () => {
      const t = new TreapImplicitMeld<number>()
      t.unshift(1)
      expect(t.size()).toBe(1)
      expect(t.get(0)).toBe(1)
    })

    it('should unshift multiple elements in reverse', () => {
      const t = new TreapImplicitMeld<number>()
      t.unshift(1)
      t.unshift(2)
      t.unshift(3)
      expect(t.toArray()).toEqual([3, 2, 1])
    })

    it('should interleave unshift and push', () => {
      const t = new TreapImplicitMeld<number>()
      t.push(2)
      t.unshift(1)
      t.push(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('insert', () => {
    it('should insert at beginning', () => {
      const t = TreapImplicitMeld.fromArray([2, 3])
      t.insert(0, 1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should insert at end', () => {
      const t = TreapImplicitMeld.fromArray([1, 2])
      t.insert(2, 3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should insert in middle', () => {
      const t = TreapImplicitMeld.fromArray([1, 3])
      t.insert(1, 2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle negative index as 0', () => {
      const t = TreapImplicitMeld.fromArray([2, 3])
      t.insert(-5, 1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle index beyond size as append', () => {
      const t = TreapImplicitMeld.fromArray([1, 2])
      t.insert(100, 3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should insert into empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      t.insert(0, 1)
      expect(t.toArray()).toEqual([1])
    })
  })

  describe('remove', () => {
    it('should return undefined for out of bounds', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.remove(-1)).toBeUndefined()
      expect(t.remove(3)).toBeUndefined()
    })

    it('should return undefined on empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      expect(t.remove(0)).toBeUndefined()
    })

    it('should remove first element', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.remove(0)).toBe(1)
      expect(t.toArray()).toEqual([2, 3])
    })

    it('should remove last element', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.remove(2)).toBe(3)
      expect(t.toArray()).toEqual([1, 2])
    })

    it('should remove middle element', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.remove(1)).toBe(2)
      expect(t.toArray()).toEqual([1, 3])
    })

    it('should remove all elements one by one', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.remove(1)
      t.remove(0)
      t.remove(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle remove then insert', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4])
      t.remove(1)
      t.insert(1, 99)
      expect(t.toArray()).toEqual([1, 99, 3, 4])
    })
  })

  describe('get', () => {
    it('should return undefined for out of bounds', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.get(-1)).toBeUndefined()
      expect(t.get(3)).toBeUndefined()
      expect(t.get(100)).toBeUndefined()
    })

    it('should return undefined on empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      expect(t.get(0)).toBeUndefined()
    })

    it('should get elements by index', () => {
      const t = TreapImplicitMeld.fromArray([10, 20, 30, 40, 50])
      expect(t.get(0)).toBe(10)
      expect(t.get(1)).toBe(20)
      expect(t.get(2)).toBe(30)
      expect(t.get(3)).toBe(40)
      expect(t.get(4)).toBe(50)
    })

    it('should get elements after modifications', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.remove(1)
      expect(t.get(0)).toBe(1)
      expect(t.get(1)).toBe(3)
    })
  })

  describe('set', () => {
    it('should set value at index', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.set(1, 20)
      expect(t.get(1)).toBe(20)
      expect(t.toArray()).toEqual([1, 20, 3])
    })

    it('should not modify out of bounds', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.set(-1, 99)
      t.set(3, 99)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should set first element', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.set(0, 10)
      expect(t.get(0)).toBe(10)
    })

    it('should set last element', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.set(2, 30)
      expect(t.get(2)).toBe(30)
    })

    it('should handle multiple sets', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.set(0, 10)
      t.set(2, 30)
      t.set(4, 50)
      expect(t.toArray()).toEqual([10, 2, 30, 4, 50])
    })
  })

  describe('slice', () => {
    it('should slice entire treap', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      expect(t.slice()).toEqual([1, 2, 3, 4, 5])
    })

    it('should slice from start', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      expect(t.slice(0, 3)).toEqual([1, 2, 3])
    })

    it('should slice from middle', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      expect(t.slice(2, 4)).toEqual([3, 4])
    })

    it('should slice to end', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      expect(t.slice(3)).toEqual([4, 5])
    })

    it('should slice single element', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.slice(1, 2)).toEqual([2])
    })

    it('should handle negative start', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      expect(t.slice(-2)).toEqual([4, 5])
    })

    it('should handle negative end', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      expect(t.slice(1, -1)).toEqual([2, 3, 4])
    })

    it('should return empty for invalid range', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.slice(3, 1)).toEqual([])
    })

    it('should return empty for out of bounds', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.slice(10, 20)).toEqual([])
    })

    it('should not modify original', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.slice(1, 3)
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should return new array each call', () => {
      const t = TreapImplicitMeld.fromArray([1, 2])
      const a = t.slice()
      const b = t.slice()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })

    it('should handle empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      expect(t.slice()).toEqual([])
    })
  })

  describe('concat', () => {
    it('should concat two non-empty treaps', () => {
      const a = TreapImplicitMeld.fromArray([1, 2])
      const b = TreapImplicitMeld.fromArray([3, 4])
      const c = a.concat(b)
      expect(c.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should concat with empty left', () => {
      const a = new TreapImplicitMeld<number>()
      const b = TreapImplicitMeld.fromArray([1, 2])
      const c = a.concat(b)
      expect(c.toArray()).toEqual([1, 2])
    })

    it('should concat with empty right', () => {
      const a = TreapImplicitMeld.fromArray([1, 2])
      const b = new TreapImplicitMeld<number>()
      const c = a.concat(b)
      expect(c.toArray()).toEqual([1, 2])
    })

    it('should concat two empty treaps', () => {
      const a = new TreapImplicitMeld<number>()
      const b = new TreapImplicitMeld<number>()
      const c = a.concat(b)
      expect(c.isEmpty()).toBe(true)
    })

    it('should not modify originals', () => {
      const a = TreapImplicitMeld.fromArray([1, 2])
      const b = TreapImplicitMeld.fromArray([3, 4])
      a.concat(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([3, 4])
    })

    it('should return independent treap', () => {
      const a = TreapImplicitMeld.fromArray([1])
      const b = TreapImplicitMeld.fromArray([2])
      const c = a.concat(b)
      c.set(0, 99)
      expect(a.get(0)).toBe(1)
    })
  })

  describe('reverse', () => {
    it('should reverse entire treap', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverse()
      expect(t.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle single element reverse', () => {
      const t = TreapImplicitMeld.fromArray([1])
      t.reverse()
      expect(t.toArray()).toEqual([1])
    })

    it('should handle empty treap reverse', () => {
      const t = new TreapImplicitMeld<number>()
      t.reverse()
      expect(t.toArray()).toEqual([])
    })

    it('should handle reverse of two elements', () => {
      const t = TreapImplicitMeld.fromArray([1, 2])
      t.reverse()
      expect(t.toArray()).toEqual([2, 1])
    })

    it('should double reverse to original', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4])
      t.reverse()
      t.reverse()
      expect(t.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should reverse and then access elements', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverse()
      expect(t.get(0)).toBe(5)
      expect(t.get(1)).toBe(4)
      expect(t.get(2)).toBe(3)
      expect(t.get(3)).toBe(2)
      expect(t.get(4)).toBe(1)
    })

    it('should reverse then insert', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverse()
      t.insert(2, 99)
      expect(t.toArray()).toEqual([5, 4, 99, 3, 2, 1])
    })

    it('should reverse then remove', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverse()
      t.remove(2)
      expect(t.toArray()).toEqual([5, 4, 2, 1])
    })

    it('should reverse then push', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.reverse()
      t.push(4)
      expect(t.toArray()).toEqual([3, 2, 1, 4])
    })

    it('should reverse then shift', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.reverse()
      expect(t.shift()).toBe(3)
      expect(t.toArray()).toEqual([2, 1])
    })
  })

  describe('reverseRange', () => {
    it('should reverse subrange', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverseRange(1, 4)
      expect(t.toArray()).toEqual([1, 4, 3, 2, 5])
    })

    it('should handle reverse of single element range (no-op)', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.reverseRange(1, 2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle invalid ranges gracefully', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.reverseRange(-1, 2)
      t.reverseRange(2, 2)
      t.reverseRange(3, 5)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle multiple partial reverses', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5, 6])
      t.reverseRange(0, 3)
      t.reverseRange(3, 6)
      expect(t.toArray()).toEqual([3, 2, 1, 6, 5, 4])
    })

    it('should double reverse range to original', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4])
      t.reverseRange(1, 3)
      t.reverseRange(1, 3)
      expect(t.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should handle reverseRange then get', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverseRange(1, 4)
      expect(t.get(0)).toBe(1)
      expect(t.get(1)).toBe(4)
      expect(t.get(2)).toBe(3)
      expect(t.get(3)).toBe(2)
      expect(t.get(4)).toBe(5)
    })

    it('should handle reverseRange on full range like reverse', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverseRange(0, 5)
      expect(t.toArray()).toEqual([5, 4, 3, 2, 1])
    })
  })

  describe('indexOf', () => {
    it('should find element at beginning', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.indexOf(1)).toBe(0)
    })

    it('should find element in middle', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.indexOf(2)).toBe(1)
    })

    it('should find element at end', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.indexOf(3)).toBe(2)
    })

    it('should return -1 for missing element', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.indexOf(4)).toBe(-1)
    })

    it('should return -1 on empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      expect(t.indexOf(1)).toBe(-1)
    })

    it('should find first occurrence of duplicates', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 2, 3])
      expect(t.indexOf(2)).toBe(1)
    })

    it('should respect fromIndex', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 2, 3])
      expect(t.indexOf(2, 2)).toBe(2)
    })

    it('should return -1 if fromIndex is too large', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.indexOf(1, 5)).toBe(-1)
    })

    it('should find using reference equality for objects', () => {
      const obj = { x: 1 }
      const t = TreapImplicitMeld.fromArray([obj])
      expect(t.indexOf(obj)).toBe(0)
    })
  })

  describe('includes', () => {
    it('should return true for existing element', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.includes(2)).toBe(true)
    })

    it('should return false for missing element', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect(t.includes(4)).toBe(false)
    })

    it('should return false on empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      expect(t.includes(1)).toBe(false)
    })

    it('should find first element', () => {
      const t = TreapImplicitMeld.fromArray([10, 20, 30])
      expect(t.includes(10)).toBe(true)
    })

    it('should find last element', () => {
      const t = TreapImplicitMeld.fromArray([10, 20, 30])
      expect(t.includes(30)).toBe(true)
    })
  })

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const t = new TreapImplicitMeld<number>()
      expect(t.size()).toBe(0)
      t.push(1)
      expect(t.size()).toBe(1)
      t.push(2)
      expect(t.size()).toBe(2)
      t.pop()
      expect(t.size()).toBe(1)
    })

    it('should track isEmpty correctly', () => {
      const t = new TreapImplicitMeld<number>()
      expect(t.isEmpty()).toBe(true)
      t.push(1)
      expect(t.isEmpty()).toBe(false)
      t.pop()
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      t.clear()
      expect(t.isEmpty()).toBe(true)
    })

    it('should clear non-empty treap', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.clear()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
      expect(t.toArray()).toEqual([])
    })

    it('should allow operations after clear', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.clear()
      t.push(4)
      expect(t.toArray()).toEqual([4])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      expect(t.toArray()).toEqual([])
    })

    it('should return all elements in order', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should return new array each call', () => {
      const t = TreapImplicitMeld.fromArray([1, 2])
      const a = t.toArray()
      const b = t.toArray()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })
  })

  describe('forEach', () => {
    it('should call callback for each element', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      const result: number[] = []
      t.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('should pass correct indices', () => {
      const t = TreapImplicitMeld.fromArray([10, 20, 30])
      const indices: number[] = []
      t.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not call on empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      let count = 0
      t.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('map', () => {
    it('should map to new treap', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      const mapped = t.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('should map empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      const mapped = t.map((v) => v * 2)
      expect(mapped.isEmpty()).toBe(true)
    })

    it('should map with index', () => {
      const t = TreapImplicitMeld.fromArray([10, 20, 30])
      const mapped = t.map((v, i) => v + i)
      expect(mapped.toArray()).toEqual([10, 21, 32])
    })

    it('should not modify original', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.map((v) => v * 2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should map to different type', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      const mapped = t.map((v) => String(v))
      expect(mapped.toArray()).toEqual(['1', '2', '3'])
    })

    it('should return independent treap', () => {
      const t = TreapImplicitMeld.fromArray([1, 2])
      const mapped = t.map((v) => v)
      mapped.set(0, 99)
      expect(t.get(0)).toBe(1)
      expect(mapped.get(0)).toBe(99)
    })
  })

  describe('filter', () => {
    it('should filter elements', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      const filtered = t.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('should filter to empty', () => {
      const t = TreapImplicitMeld.fromArray([1, 3, 5])
      const filtered = t.filter((v) => v % 2 === 0)
      expect(filtered.isEmpty()).toBe(true)
    })

    it('should filter with index', () => {
      const t = TreapImplicitMeld.fromArray([10, 20, 30, 40])
      const filtered = t.filter((_v, i) => i % 2 === 0)
      expect(filtered.toArray()).toEqual([10, 30])
    })

    it('should not modify original', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.filter((v) => v > 1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should filter empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      const filtered = t.filter((v) => v > 0)
      expect(filtered.isEmpty()).toBe(true)
    })

    it('should keep all elements', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      const filtered = t.filter(() => true)
      expect(filtered.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('clone', () => {
    it('should clone empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      const c = t.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('should clone non-empty treap', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      const c = t.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
    })

    it('should produce independent copy', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      const c = t.clone()
      c.set(0, 99)
      expect(t.get(0)).toBe(1)
      expect(c.get(0)).toBe(99)
    })

    it('should preserve size', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      const c = t.clone()
      expect(c.size()).toBe(t.size())
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate empty treap', () => {
      const t = new TreapImplicitMeld<number>()
      const result: number[] = []
      for (const v of t) result.push(v)
      expect(result).toEqual([])
    })

    it('should iterate all elements in order', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      const result: number[] = []
      for (const v of t) result.push(v)
      expect(result).toEqual([1, 2, 3])
    })

    it('should work with spread operator', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      expect([...t]).toEqual([1, 2, 3])
    })

    it('should work with Array.from', () => {
      const t = TreapImplicitMeld.fromArray([4, 5, 6])
      expect(Array.from(t)).toEqual([4, 5, 6])
    })
  })

  describe('meld internals', () => {
    it('should handle alternating push/pop', () => {
      const t = new TreapImplicitMeld<number>()
      for (let i = 0; i < 50; i++) t.push(i)
      for (let i = 0; i < 25; i++) t.shift()
      expect(t.size()).toBe(25)
      expect(t.get(0)).toBe(25)
    })

    it('should handle push/pop interleaving', () => {
      const t = new TreapImplicitMeld<number>()
      t.push(1)
      t.unshift(0)
      t.push(2)
      t.shift()
      t.push(3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should handle many insertions and deletions', () => {
      const t = new TreapImplicitMeld<number>()
      for (let i = 0; i < 100; i++) t.insert(i, i)
      for (let i = 99; i >= 0; i -= 2) t.remove(i)
      expect(t.size()).toBe(50)
    })
  })

  describe('combined operations', () => {
    it('should reverse then concat', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.reverse()
      const t2 = TreapImplicitMeld.fromArray([4, 5])
      const c = t.concat(t2)
      expect(c.toArray()).toEqual([3, 2, 1, 4, 5])
    })

    it('should reverse then slice', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverse()
      expect(t.slice(1, 4)).toEqual([4, 3, 2])
    })

    it('should reverse then indexOf', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverse()
      expect(t.indexOf(1)).toBe(4)
      expect(t.indexOf(5)).toBe(0)
    })

    it('should reverse then forEach', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.reverse()
      const result: number[] = []
      t.forEach((v) => result.push(v))
      expect(result).toEqual([3, 2, 1])
    })

    it('should handle reverse followed by set', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverseRange(1, 4)
      t.set(2, 99)
      expect(t.toArray()).toEqual([1, 4, 99, 2, 5])
    })

    it('should reverse then clone', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.reverse()
      const c = t.clone()
      expect(c.toArray()).toEqual([3, 2, 1])
    })

    it('should reverse then map', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3])
      t.reverse()
      const mapped = t.map((v) => v * 10)
      expect(mapped.toArray()).toEqual([30, 20, 10])
    })

    it('should reverse then filter', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverse()
      const filtered = t.filter((v) => v % 2 !== 0)
      expect(filtered.toArray()).toEqual([5, 3, 1])
    })

    it('should concat then reverse', () => {
      const a = TreapImplicitMeld.fromArray([1, 2])
      const b = TreapImplicitMeld.fromArray([3, 4])
      const c = a.concat(b)
      c.reverse()
      expect(c.toArray()).toEqual([4, 3, 2, 1])
    })

    it('should filter then map', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      const result = t.filter((v) => v > 2).map((v) => v * 10)
      expect(result.toArray()).toEqual([30, 40, 50])
    })

    it('should map then filter', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      const result = t.map((v) => v * 2).filter((v) => v > 4)
      expect(result.toArray()).toEqual([6, 8, 10])
    })

    it('should slice then concat', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      const s = t.slice(1, 3)
      expect(s).toEqual([2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle large number of elements', () => {
      const t = new TreapImplicitMeld<number>()
      for (let i = 0; i < 1000; i++) t.push(i)
      expect(t.size()).toBe(1000)
      expect(t.get(0)).toBe(0)
      expect(t.get(999)).toBe(999)
      expect(t.toArray()).toEqual(Array.from({ length: 1000 }, (_, i) => i))
    })

    it('should handle stress: 1000 insertions and deletions', () => {
      const t = new TreapImplicitMeld<number>()
      for (let i = 0; i < 1000; i++) t.push(i)
      for (let i = 0; i < 500; i++) t.remove(0)
      expect(t.size()).toBe(500)
      expect(t.get(0)).toBe(500)
    })

    it('should handle stress: 1000 unshift', () => {
      const t = new TreapImplicitMeld<number>()
      for (let i = 0; i < 1000; i++) t.unshift(i)
      expect(t.size()).toBe(1000)
      expect(t.get(0)).toBe(999)
      expect(t.get(999)).toBe(0)
    })

    it('should handle stress: reverse 1000 elements', () => {
      const t = new TreapImplicitMeld<number>()
      for (let i = 0; i < 1000; i++) t.push(i)
      t.reverse()
      expect(t.get(0)).toBe(999)
      expect(t.get(999)).toBe(0)
    })

    it('should handle stress: 1000 slice operations', () => {
      const t = new TreapImplicitMeld<number>()
      for (let i = 0; i < 1000; i++) t.push(i)
      for (let i = 0; i < 10; i++) {
        const s = t.slice(i * 100, (i + 1) * 100)
        expect(s.length).toBe(100)
        expect(s[0]).toBe(i * 100)
      }
    })

    it('should handle stress: mixed operations on 1000 elements', () => {
      const t = new TreapImplicitMeld<number>()
      for (let i = 0; i < 1000; i++) t.push(i)
      t.reverseRange(100, 900)
      t.remove(500)
      t.insert(500, -1)
      expect(t.size()).toBe(1000)
    })

    it('should handle undefined values', () => {
      const t = TreapImplicitMeld.fromArray<number | undefined>([1, undefined, 3])
      expect(t.get(1)).toBeUndefined()
      expect(t.indexOf(undefined)).toBe(1)
    })

    it('should handle null values', () => {
      const t = TreapImplicitMeld.fromArray<number | null>([1, null, 3])
      expect(t.get(1)).toBeNull()
    })

    it('should handle boolean values', () => {
      const t = TreapImplicitMeld.fromArray([true, false, true])
      expect(t.toArray()).toEqual([true, false, true])
    })

    it('should handle string values', () => {
      const t = TreapImplicitMeld.fromArray(['hello', 'world'])
      expect(t.indexOf('world')).toBe(1)
    })

    it('should handle object values', () => {
      const t = TreapImplicitMeld.fromArray([{ x: 1 }, { x: 2 }])
      expect(t.size()).toBe(2)
    })

    it('should handle chaining push/unshift', () => {
      const t = new TreapImplicitMeld<number>()
      t.push(2)
      t.unshift(1)
      t.push(3)
      t.unshift(0)
      expect(t.toArray()).toEqual([0, 1, 2, 3])
    })

    it('should handle interleaved pop and shift', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4])
      expect(t.shift()).toBe(1)
      expect(t.pop()).toBe(4)
      expect(t.shift()).toBe(2)
      expect(t.pop()).toBe(3)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle reverseRange at boundaries', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverseRange(0, 2)
      expect(t.toArray()).toEqual([2, 1, 3, 4, 5])
    })

    it('should handle reverseRange at end boundary', () => {
      const t = TreapImplicitMeld.fromArray([1, 2, 3, 4, 5])
      t.reverseRange(3, 5)
      expect(t.toArray()).toEqual([1, 2, 3, 5, 4])
    })
  })
})
