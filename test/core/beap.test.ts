import { describe, it, expect } from 'vitest'
import { Beap } from '../../src/core/beap/index.js'

describe('Beap', () => {
  describe('constructor', () => {
    it('creates an empty beap with default comparator', () => {
      const beap = new Beap()
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('creates a beap with custom comparator', () => {
      const beap = new Beap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(beap.size).toBe(0)
    })

    it('creates a max-beap with reverse comparator', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      beap.insert(1)
      beap.insert(5)
      beap.insert(3)
      expect(beap.peek()).toBe(5)
    })

    it('works without options argument', () => {
      const beap = new Beap<number>()
      beap.insert(42)
      expect(beap.size).toBe(1)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      expect(beap.size).toBe(1)
      expect(beap.isEmpty).toBe(false)
    })

    it('inserts multiple elements', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(20)
      beap.insert(5)
      expect(beap.size).toBe(3)
    })

    it('updates min on insert of smaller value', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(5)
      expect(beap.peek()).toBe(5)
    })

    it('does not update min on insert of larger value', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(10)
      expect(beap.peek()).toBe(5)
    })

    it('handles duplicate values', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(5)
      beap.insert(5)
      expect(beap.size).toBe(3)
      expect(beap.peek()).toBe(5)
    })

    it('handles negative numbers', () => {
      const beap = new Beap<number>()
      beap.insert(-5)
      beap.insert(-10)
      beap.insert(0)
      expect(beap.peek()).toBe(-10)
    })

    it('handles zero', () => {
      const beap = new Beap<number>()
      beap.insert(0)
      expect(beap.peek()).toBe(0)
    })

    it('handles strings with custom comparator', () => {
      const beap = new Beap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      beap.insert('banana')
      beap.insert('apple')
      beap.insert('cherry')
      expect(beap.peek()).toBe('apple')
    })

    it('maintains heap property after many inserts', () => {
      const beap = new Beap<number>()
      const values = [50, 30, 70, 10, 40, 60, 80, 5, 15, 35]
      for (const v of values) beap.insert(v)
      expect(beap.peek()).toBe(5)
    })

    it('inserts in ascending order', () => {
      const beap = new Beap<number>()
      for (let i = 1; i <= 10; i++) beap.insert(i)
      expect(beap.peek()).toBe(1)
      expect(beap.size).toBe(10)
    })

    it('inserts in descending order', () => {
      const beap = new Beap<number>()
      for (let i = 10; i >= 1; i--) beap.insert(i)
      expect(beap.peek()).toBe(1)
      expect(beap.size).toBe(10)
    })

    it('bubbles up through multiple layers', () => {
      const beap = new Beap<number>()
      beap.insert(100)
      beap.insert(90)
      beap.insert(80)
      beap.insert(70)
      beap.insert(60)
      beap.insert(50)
      beap.insert(1)
      expect(beap.peek()).toBe(1)
    })
  })

  describe('extractMin', () => {
    it('throws on empty beap', () => {
      const beap = new Beap<number>()
      expect(() => beap.extractMin()).toThrow('Beap is empty')
    })

    it('extracts the only element', () => {
      const beap = new Beap<number>()
      beap.insert(42)
      expect(beap.extractMin()).toBe(42)
      expect(beap.size).toBe(0)
    })

    it('extracts minimum from two elements', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(5)
      expect(beap.extractMin()).toBe(5)
      expect(beap.peek()).toBe(10)
    })

    it('extracts elements in sorted order', () => {
      const beap = new Beap<number>()
      const values = [50, 30, 70, 10, 40, 60, 80, 5, 15, 35]
      for (const v of values) beap.insert(v)
      const sorted: number[] = []
      while (!beap.isEmpty) sorted.push(beap.extractMin())
      expect(sorted).toEqual([5, 10, 15, 30, 35, 40, 50, 60, 70, 80])
    })

    it('handles extractMin from large beap', () => {
      const beap = new Beap<number>()
      for (let i = 100; i >= 1; i--) beap.insert(i)
      for (let i = 1; i <= 100; i++) {
        expect(beap.extractMin()).toBe(i)
      }
      expect(beap.isEmpty).toBe(true)
    })

    it('handles duplicates in extraction', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(5)
      beap.insert(3)
      beap.insert(5)
      expect(beap.extractMin()).toBe(3)
      expect(beap.extractMin()).toBe(5)
      expect(beap.extractMin()).toBe(5)
      expect(beap.extractMin()).toBe(5)
    })

    it('maintains heap property after extraction', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(20)
      beap.insert(5)
      beap.insert(15)
      beap.insert(25)
      beap.extractMin()
      expect(beap.peek()).toBe(10)
    })
  })

  describe('peek', () => {
    it('throws on empty beap', () => {
      const beap = new Beap<number>()
      expect(() => beap.peek()).toThrow('Beap is empty')
    })

    it('returns the minimum element', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(5)
      beap.insert(20)
      expect(beap.peek()).toBe(5)
    })

    it('does not remove the element', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.peek()
      expect(beap.size).toBe(1)
    })

    it('returns consistent results', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      expect(beap.peek()).toBe(10)
      expect(beap.peek()).toBe(10)
      expect(beap.peek()).toBe(10)
    })
  })

  describe('contains', () => {
    it('returns false for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.contains(5)).toBe(false)
    })

    it('returns true for existing element', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      expect(beap.contains(10)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      expect(beap.contains(20)).toBe(false)
    })

    it('finds elements in multi-element beap', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(20)
      beap.insert(5)
      beap.insert(30)
      beap.insert(15)
      expect(beap.contains(5)).toBe(true)
      expect(beap.contains(10)).toBe(true)
      expect(beap.contains(15)).toBe(true)
      expect(beap.contains(20)).toBe(true)
      expect(beap.contains(30)).toBe(true)
    })

    it('handles duplicate values', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(5)
      beap.insert(5)
      expect(beap.contains(5)).toBe(true)
    })

    it('finds root element', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      beap.insert(4)
      beap.insert(5)
      beap.insert(6)
      expect(beap.contains(1)).toBe(true)
    })

    it('finds elements at bottom layer', () => {
      const beap = new Beap<number>()
      for (let i = 1; i <= 10; i++) beap.insert(i)
      expect(beap.contains(10)).toBe(true)
    })

    it('works with custom comparator', () => {
      const beap = new Beap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      beap.insert('apple')
      beap.insert('banana')
      beap.insert('cherry')
      expect(beap.contains('banana')).toBe(true)
      expect(beap.contains('grape')).toBe(false)
    })
  })

  describe('delete', () => {
    it('returns false for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.delete(5)).toBe(false)
    })

    it('returns false for non-existing element', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      expect(beap.delete(20)).toBe(false)
    })

    it('deletes the only element', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      expect(beap.delete(10)).toBe(true)
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('deletes root element', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      beap.delete(1)
      expect(beap.peek()).toBe(2)
      expect(beap.size).toBe(2)
    })

    it('deletes middle element', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(20)
      beap.insert(5)
      beap.insert(30)
      beap.insert(15)
      beap.delete(15)
      expect(beap.size).toBe(4)
      expect(beap.contains(15)).toBe(false)
    })

    it('deletes last element', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(20)
      beap.insert(5)
      beap.delete(20)
      expect(beap.size).toBe(2)
      expect(beap.contains(20)).toBe(false)
    })

    it('maintains heap property after delete', () => {
      const beap = new Beap<number>()
      for (let i = 1; i <= 10; i++) beap.insert(i)
      beap.delete(5)
      expect(beap.peek()).toBe(1)
      const sorted = beap.toSortedArray()
      expect(sorted).toEqual([1, 2, 3, 4, 6, 7, 8, 9, 10])
    })

    it('deletes and re-inserts', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(5)
      beap.insert(20)
      beap.delete(5)
      beap.insert(3)
      expect(beap.peek()).toBe(3)
    })

    it('deletes with duplicates removing one', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(5)
      beap.delete(5)
      expect(beap.size).toBe(1)
      expect(beap.contains(5)).toBe(true)
    })

    it('deletes multiple elements', () => {
      const beap = new Beap<number>()
      for (let i = 1; i <= 10; i++) beap.insert(i)
      beap.delete(3)
      beap.delete(7)
      beap.delete(10)
      expect(beap.size).toBe(7)
    })
  })

  describe('size', () => {
    it('returns 0 for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.size).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      expect(beap.size).toBe(3)
    })

    it('updates after extractMin', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.extractMin()
      expect(beap.size).toBe(1)
    })

    it('updates after delete', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.delete(1)
      expect(beap.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new beap', () => {
      const beap = new Beap<number>()
      expect(beap.isEmpty).toBe(true)
    })

    it('returns false after insert', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      expect(beap.isEmpty).toBe(false)
    })

    it('returns true after all elements extracted', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.extractMin()
      expect(beap.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.clear()
      expect(beap.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty beap', () => {
      const beap = new Beap<number>()
      beap.clear()
      expect(beap.size).toBe(0)
    })

    it('clears beap with elements', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      beap.clear()
      expect(beap.size).toBe(0)
      expect(beap.isEmpty).toBe(true)
    })

    it('allows operations after clear', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.clear()
      beap.insert(5)
      expect(beap.peek()).toBe(5)
      expect(beap.size).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.toArray()).toEqual([])
    })

    it('returns copy of internal array', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      const arr = beap.toArray()
      arr.push(100)
      expect(beap.size).toBe(2)
    })

    it('returns all elements', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      expect(beap.toArray().length).toBe(3)
    })
  })

  describe('clone', () => {
    it('clones empty beap', () => {
      const beap = new Beap<number>()
      const cloned = beap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones beap with elements', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      const cloned = beap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.peek()).toBe(beap.peek())
    })

    it('clone is independent', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      const cloned = beap.clone()
      cloned.insert(0)
      expect(beap.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('preserves comparator', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      beap.insert(1)
      beap.insert(5)
      beap.insert(3)
      const cloned = beap.clone()
      expect(cloned.peek()).toBe(5)
    })
  })

  describe('fromArray', () => {
    it('creates beap from empty array', () => {
      const beap = Beap.fromArray([])
      expect(beap.size).toBe(0)
    })

    it('creates beap from single element', () => {
      const beap = Beap.fromArray([42])
      expect(beap.size).toBe(1)
      expect(beap.peek()).toBe(42)
    })

    it('creates beap from multiple elements', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.peek()).toBe(1)
      expect(beap.size).toBe(5)
    })

    it('creates beap with custom comparator', () => {
      const beap = Beap.fromArray([1, 2, 3], {
        comparator: (a, b) => b - a,
      })
      expect(beap.peek()).toBe(3)
    })

    it('handles already sorted input', () => {
      const beap = Beap.fromArray([1, 2, 3, 4, 5])
      expect(beap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles reverse sorted input', () => {
      const beap = Beap.fromArray([5, 4, 3, 2, 1])
      expect(beap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('forEach', () => {
    it('does nothing for empty beap', () => {
      const beap = new Beap<number>()
      const items: number[] = []
      beap.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates all elements', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      const items: number[] = []
      beap.forEach((v) => items.push(v))
      expect(items.length).toBe(3)
    })

    it('provides correct indices', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(20)
      beap.insert(30)
      const indices: number[] = []
      beap.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates empty beap', () => {
      const beap = new Beap<number>()
      const items = [...beap]
      expect(items).toEqual([])
    })

    it('iterates beap elements', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      const items = [...beap]
      expect(items.length).toBe(3)
    })

    it('works with for...of', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(20)
      const items: number[] = []
      for (const v of beap) items.push(v)
      expect(items.length).toBe(2)
    })
  })

  describe('toSortedArray', () => {
    it('returns empty array for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.toSortedArray()).toEqual([])
    })

    it('returns sorted elements', () => {
      const beap = new Beap<number>()
      beap.insert(30)
      beap.insert(10)
      beap.insert(20)
      expect(beap.toSortedArray()).toEqual([10, 20, 30])
    })

    it('does not modify original beap', () => {
      const beap = new Beap<number>()
      beap.insert(3)
      beap.insert(1)
      beap.insert(2)
      beap.toSortedArray()
      expect(beap.size).toBe(3)
      expect(beap.peek()).toBe(1)
    })

    it('handles negative numbers', () => {
      const beap = new Beap<number>()
      beap.insert(-5)
      beap.insert(5)
      beap.insert(0)
      expect(beap.toSortedArray()).toEqual([-5, 0, 5])
    })
  })

  describe('height', () => {
    it('returns correct height for empty beap', () => {
      const beap = new Beap<number>()
      expect(beap.height).toBe(-1)
    })

    it('returns correct height for single element', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      expect(beap.height).toBe(0)
    })

    it('returns correct height for 3 elements (layers 0-1)', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      expect(beap.height).toBe(1)
    })

    it('returns correct height for 6 elements (layers 0-2)', () => {
      const beap = new Beap<number>()
      for (let i = 1; i <= 6; i++) beap.insert(i)
      expect(beap.height).toBe(2)
    })

    it('returns correct height for 10 elements (layers 0-3)', () => {
      const beap = new Beap<number>()
      for (let i = 1; i <= 10; i++) beap.insert(i)
      expect(beap.height).toBe(3)
    })

    it('updates height on insert', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      expect(beap.height).toBe(0)
      beap.insert(2)
      expect(beap.height).toBe(1)
      beap.insert(3)
      expect(beap.height).toBe(1)
      beap.insert(4)
      expect(beap.height).toBe(2)
    })
  })

  describe('triangular structure', () => {
    it('layer 0 has 1 element', () => {
      const beap = Beap.fromArray([1])
      expect(beap.size).toBe(1)
    })

    it('layers 0-1 have 3 elements', () => {
      const beap = Beap.fromArray([1, 2, 3])
      expect(beap.size).toBe(3)
    })

    it('layers 0-2 have 6 elements', () => {
      const beap = Beap.fromArray([1, 2, 3, 4, 5, 6])
      expect(beap.size).toBe(6)
    })

    it('layers 0-3 have 10 elements', () => {
      const beap = Beap.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(beap.size).toBe(10)
    })

    it('partial layers work correctly', () => {
      const beap = Beap.fromArray([1, 2, 3, 4, 5])
      expect(beap.size).toBe(5)
      expect(beap.peek()).toBe(1)
    })
  })

  describe('custom comparator', () => {
    it('supports max-beap (reverse order)', () => {
      const beap = new Beap<number>({ comparator: (a, b) => b - a })
      beap.insert(1)
      beap.insert(5)
      beap.insert(3)
      expect(beap.peek()).toBe(5)
      expect(beap.extractMin()).toBe(5)
      expect(beap.extractMin()).toBe(3)
      expect(beap.extractMin()).toBe(1)
    })

    it('supports string comparator', () => {
      const beap = new Beap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      beap.insert('cherry')
      beap.insert('apple')
      beap.insert('banana')
      expect(beap.toSortedArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('supports object comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const beap = new Beap<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      beap.insert({ priority: 3, name: 'low' })
      beap.insert({ priority: 1, name: 'high' })
      beap.insert({ priority: 2, name: 'medium' })
      expect(beap.peek()!.name).toBe('high')
    })

    it('supports date comparator', () => {
      const beap = new Beap<Date>({
        comparator: (a, b) => a.getTime() - b.getTime(),
      })
      const d1 = new Date(2023, 0, 1)
      const d2 = new Date(2023, 5, 15)
      const d3 = new Date(2022, 11, 31)
      beap.insert(d1)
      beap.insert(d2)
      beap.insert(d3)
      expect(beap.peek()).toBe(d3)
    })
  })

  describe('edge cases', () => {
    it('handles insert after extractMin', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.extractMin()
      beap.insert(5)
      expect(beap.peek()).toBe(5)
    })

    it('handles many operations', () => {
      const beap = new Beap<number>()
      for (let i = 1; i <= 50; i++) beap.insert(i)
      for (let i = 1; i <= 25; i++) beap.extractMin()
      expect(beap.peek()).toBe(26)
      expect(beap.size).toBe(25)
    })

    it('handles alternating insert and extract', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      expect(beap.extractMin()).toBe(3)
      beap.insert(1)
      expect(beap.extractMin()).toBe(1)
      beap.insert(4)
      beap.insert(2)
      expect(beap.extractMin()).toBe(2)
      expect(beap.extractMin()).toBe(4)
      expect(beap.extractMin()).toBe(5)
    })

    it('handles clear and reuse', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.clear()
      beap.insert(10)
      beap.insert(5)
      expect(beap.peek()).toBe(5)
      expect(beap.size).toBe(2)
    })

    it('handles large number of elements', () => {
      const beap = new Beap<number>()
      const n = 200
      for (let i = n; i >= 1; i--) beap.insert(i)
      expect(beap.peek()).toBe(1)
      expect(beap.size).toBe(n)
      for (let i = 1; i <= n; i++) {
        expect(beap.extractMin()).toBe(i)
      }
    })

    it('handles single element lifecycle', () => {
      const beap = new Beap<number>()
      beap.insert(42)
      expect(beap.peek()).toBe(42)
      expect(beap.contains(42)).toBe(true)
      expect(beap.size).toBe(1)
      expect(beap.isEmpty).toBe(false)
      expect(beap.delete(42)).toBe(true)
      expect(beap.isEmpty).toBe(true)
    })

    it('handles negative values', () => {
      const beap = new Beap<number>()
      beap.insert(-100)
      beap.insert(-50)
      beap.insert(-200)
      expect(beap.toSortedArray()).toEqual([-200, -100, -50])
    })

    it('handles floating point values', () => {
      const beap = new Beap<number>()
      beap.insert(1.5)
      beap.insert(0.5)
      beap.insert(2.5)
      expect(beap.toSortedArray()).toEqual([0.5, 1.5, 2.5])
    })

    it('handles identical values', () => {
      const beap = new Beap<number>()
      for (let i = 0; i < 10; i++) beap.insert(42)
      expect(beap.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(beap.extractMin()).toBe(42)
      }
    })
  })

  describe('integration', () => {
    it('mix of all operations', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(5)
      beap.insert(20)
      expect(beap.contains(5)).toBe(true)
      beap.delete(5)
      expect(beap.contains(5)).toBe(false)
      expect(beap.extractMin()).toBe(10)
      beap.insert(1)
      beap.insert(15)
      expect(beap.toSortedArray()).toEqual([1, 15, 20])
    })

    it('clone after modifications', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(5)
      beap.extractMin()
      beap.insert(20)
      const cloned = beap.clone()
      expect(cloned.toSortedArray()).toEqual(beap.toSortedArray())
    })

    it('fromArray then operations', () => {
      const beap = Beap.fromArray([5, 3, 1, 4, 2])
      expect(beap.extractMin()).toBe(1)
      beap.insert(0)
      expect(beap.peek()).toBe(0)
      expect(beap.delete(4)).toBe(true)
      expect(beap.toSortedArray()).toEqual([0, 2, 3, 5])
    })

    it('iterator after modifications', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(5)
      beap.insert(20)
      beap.extractMin()
      const items = [...beap]
      expect(items.length).toBe(2)
    })

    it('forEach after modifications', () => {
      const beap = new Beap<number>()
      beap.insert(10)
      beap.insert(5)
      beap.insert(20)
      beap.delete(10)
      const items: number[] = []
      beap.forEach((v) => items.push(v))
      expect(items.length).toBe(2)
    })
  })

  describe('delete edge cases', () => {
    it('deletes root and bubbles down correctly', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      beap.insert(4)
      beap.insert(5)
      beap.insert(6)
      beap.delete(1)
      expect(beap.peek()).toBe(2)
      const sorted = beap.toSortedArray()
      expect(sorted).toEqual([2, 3, 4, 5, 6])
    })

    it('deletes last element in array', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(1)
      beap.insert(4)
      beap.insert(2)
      beap.insert(6)
      beap.delete(6)
      expect(beap.size).toBe(5)
      expect(beap.toSortedArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('deletes from single element after previous deletes', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      beap.insert(2)
      beap.insert(3)
      beap.delete(2)
      beap.delete(3)
      expect(beap.size).toBe(1)
      expect(beap.peek()).toBe(1)
    })
  })

  describe('heap property verification', () => {
    it('maintains heap property after series of inserts', () => {
      const beap = new Beap<number>()
      const values = [7, 3, 9, 1, 8, 2, 6, 4, 5, 10]
      for (const v of values) beap.insert(v)
      for (let i = 1; i <= 10; i++) {
        expect(beap.extractMin()).toBe(i)
      }
    })

    it('maintains heap property with random input', () => {
      const beap = new Beap<number>()
      const values = Array.from({ length: 50 }, (_, i) => i + 1)
      for (const v of values) beap.insert(v)
      for (let i = 1; i <= 50; i++) {
        expect(beap.extractMin()).toBe(i)
      }
    })

    it('maintains heap property after deletes', () => {
      const beap = new Beap<number>()
      for (let i = 1; i <= 20; i++) beap.insert(i)
      beap.delete(5)
      beap.delete(10)
      beap.delete(15)
      const sorted = beap.toSortedArray()
      expect(sorted).toEqual([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 20])
    })
  })

  describe('type safety', () => {
    it('works with number type', () => {
      const beap = new Beap<number>()
      beap.insert(1)
      const val: number = beap.peek()
      expect(typeof val).toBe('number')
    })

    it('works with string type', () => {
      const beap = new Beap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      beap.insert('hello')
      const val: string = beap.peek()
      expect(typeof val).toBe('string')
    })

    it('works with object type', () => {
      interface Node {
        id: number
      }
      const beap = new Beap<Node>({
        comparator: (a, b) => a.id - b.id,
      })
      beap.insert({ id: 2 })
      beap.insert({ id: 1 })
      expect(beap.peek().id).toBe(1)
    })
  })

  describe('additional coverage', () => {
    it('extractMin after delete maintains correct order', () => {
      const beap = new Beap<number>()
      beap.insert(5)
      beap.insert(3)
      beap.insert(7)
      beap.insert(1)
      beap.insert(9)
      beap.insert(2)
      beap.delete(3)
      expect(beap.extractMin()).toBe(1)
      expect(beap.extractMin()).toBe(2)
    })

    it('fromArray with duplicates produces correct sorted output', () => {
      const beap = Beap.fromArray([3, 1, 4, 1, 5, 9, 2, 6, 5, 3])
      const sorted = beap.toSortedArray()
      expect(sorted).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9])
    })
  })

  describe('exported types', () => {
    it('exports BeapOptions type', () => {
      const options: import('../../src/core/beap/types.js').BeapOptions<number> = {
        comparator: (a, b) => a - b,
      }
      const beap = new Beap(options)
      beap.insert(1)
      expect(beap.peek()).toBe(1)
    })
  })
})
