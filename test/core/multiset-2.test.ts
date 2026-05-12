import { describe, it, expect } from 'vitest'
import { Multiset } from '../../src/core/multiset-2/index.js'

describe('Multiset', () => {
  describe('constructor', () => {
    it('creates empty multiset', () => {
      const ms = new Multiset<number>()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
      expect(ms.isEmpty()).toBe(true)
    })

    it('creates from elements array', () => {
      const ms = new Multiset<number>({ elements: [1, 2, 3] })
      expect(ms.size).toBe(3)
      expect(ms.uniqueSize).toBe(3)
    })

    it('creates from elements with duplicates', () => {
      const ms = new Multiset<number>({ elements: [1, 1, 2, 2, 2, 3] })
      expect(ms.size).toBe(6)
      expect(ms.uniqueSize).toBe(3)
      expect(ms.count(1)).toBe(2)
      expect(ms.count(2)).toBe(3)
      expect(ms.count(3)).toBe(1)
    })

    it('creates from entries', () => {
      const ms = new Multiset<string>({ entries: [['a', 3], ['b', 2]] })
      expect(ms.size).toBe(5)
      expect(ms.uniqueSize).toBe(2)
      expect(ms.count('a')).toBe(3)
      expect(ms.count('b')).toBe(2)
    })

    it('creates from entries with zero count', () => {
      const ms = new Multiset<string>({ entries: [['a', 3], ['b', 0]] })
      expect(ms.size).toBe(3)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.has('b')).toBe(false)
    })

    it('creates from entries with negative count', () => {
      const ms = new Multiset<number>({ entries: [['x', -1], ['y', 2]] })
      expect(ms.size).toBe(2)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.has('x')).toBe(false)
    })

    it('creates from both elements and entries', () => {
      const ms = new Multiset<number>({ elements: [1, 1], entries: [['2', 3] as unknown as [number, number]] })
      expect(ms.size).toBe(5)
    })

    it('creates from empty elements array', () => {
      const ms = new Multiset<number>({ elements: [] })
      expect(ms.size).toBe(0)
      expect(ms.isEmpty()).toBe(true)
    })

    it('creates from empty entries array', () => {
      const ms = new Multiset<number>({ entries: [] })
      expect(ms.size).toBe(0)
      expect(ms.isEmpty()).toBe(true)
    })

    it('handles string elements', () => {
      const ms = new Multiset<string>({ elements: ['hello', 'world', 'hello'] })
      expect(ms.size).toBe(3)
      expect(ms.uniqueSize).toBe(2)
      expect(ms.count('hello')).toBe(2)
    })

    it('handles object-like keys via reference', () => {
      const obj = { id: 1 }
      const ms = new Multiset<object>({ elements: [obj, obj] })
      expect(ms.size).toBe(2)
      expect(ms.count(obj)).toBe(2)
    })
  })

  describe('add', () => {
    it('adds single element', () => {
      const ms = new Multiset<number>()
      ms.add(5)
      expect(ms.size).toBe(1)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.count(5)).toBe(1)
    })

    it('adds duplicate element', () => {
      const ms = new Multiset<number>()
      ms.add(5)
      ms.add(5)
      expect(ms.size).toBe(2)
      expect(ms.uniqueSize).toBe(1)
      expect(ms.count(5)).toBe(2)
    })

    it('adds element with count', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      expect(ms.size).toBe(3)
      expect(ms.count(5)).toBe(3)
    })

    it('adds element with count multiple times', () => {
      const ms = new Multiset<number>()
      ms.add(5, 2)
      ms.add(5, 3)
      expect(ms.size).toBe(5)
      expect(ms.count(5)).toBe(5)
    })

    it('add with count 0 does nothing', () => {
      const ms = new Multiset<number>()
      ms.add(5, 0)
      expect(ms.size).toBe(0)
      expect(ms.has(5)).toBe(false)
    })

    it('add with negative count does nothing', () => {
      const ms = new Multiset<number>()
      ms.add(5, -3)
      expect(ms.size).toBe(0)
      expect(ms.has(5)).toBe(false)
    })

    it('add distinct elements', () => {
      const ms = new Multiset<number>()
      ms.add(1)
      ms.add(2)
      ms.add(3)
      expect(ms.size).toBe(3)
      expect(ms.uniqueSize).toBe(3)
    })

    it('add preserves existing counts', () => {
      const ms = new Multiset<number>({ elements: [1, 1, 2] })
      ms.add(3, 4)
      expect(ms.count(1)).toBe(2)
      expect(ms.count(2)).toBe(1)
      expect(ms.count(3)).toBe(4)
      expect(ms.size).toBe(7)
    })
  })

  describe('delete', () => {
    it('deletes existing element', () => {
      const ms = new Multiset<number>({ elements: [1, 2, 3] })
      expect(ms.delete(2)).toBe(true)
      expect(ms.size).toBe(2)
      expect(ms.has(2)).toBe(false)
    })

    it('deletes from element with count > 1', () => {
      const ms = new Multiset<number>({ elements: [1, 1, 1] })
      expect(ms.delete(1)).toBe(true)
      expect(ms.size).toBe(2)
      expect(ms.count(1)).toBe(2)
    })

    it('deletes with specific count', () => {
      const ms = new Multiset<number>()
      ms.add(5, 10)
      expect(ms.delete(5, 3)).toBe(true)
      expect(ms.size).toBe(7)
      expect(ms.count(5)).toBe(7)
    })

    it('delete with count equal to total removes element', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      expect(ms.delete(5, 3)).toBe(true)
      expect(ms.size).toBe(0)
      expect(ms.has(5)).toBe(false)
    })

    it('delete with count greater than total removes element', () => {
      const ms = new Multiset<number>()
      ms.add(5, 2)
      expect(ms.delete(5, 10)).toBe(true)
      expect(ms.size).toBe(0)
      expect(ms.has(5)).toBe(false)
    })

    it('delete non-existent element returns false', () => {
      const ms = new Multiset<number>()
      expect(ms.delete(5)).toBe(false)
    })

    it('delete with count 0 returns false', () => {
      const ms = new Multiset<number>({ elements: [5] })
      expect(ms.delete(5, 0)).toBe(false)
      expect(ms.count(5)).toBe(1)
    })

    it('delete with negative count returns false', () => {
      const ms = new Multiset<number>({ elements: [5] })
      expect(ms.delete(5, -1)).toBe(false)
      expect(ms.count(5)).toBe(1)
    })

    it('delete only affects specified element', () => {
      const ms = new Multiset<number>({ elements: [1, 2, 3, 2] })
      ms.delete(2)
      expect(ms.count(1)).toBe(1)
      expect(ms.count(2)).toBe(1)
      expect(ms.count(3)).toBe(1)
      expect(ms.size).toBe(3)
    })
  })

  describe('count', () => {
    it('returns 0 for non-existent element', () => {
      const ms = new Multiset<number>()
      expect(ms.count(5)).toBe(0)
    })

    it('returns count for existing element', () => {
      const ms = new Multiset<number>()
      ms.add(5, 7)
      expect(ms.count(5)).toBe(7)
    })

    it('returns updated count after add', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      ms.add(5, 4)
      expect(ms.count(5)).toBe(7)
    })

    it('returns 0 after element fully deleted', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      ms.delete(5, 3)
      expect(ms.count(5)).toBe(0)
    })

    it('returns reduced count after partial delete', () => {
      const ms = new Multiset<number>()
      ms.add(5, 5)
      ms.delete(5, 2)
      expect(ms.count(5)).toBe(3)
    })
  })

  describe('has', () => {
    it('returns false for non-existent element', () => {
      const ms = new Multiset<number>()
      expect(ms.has(5)).toBe(false)
    })

    it('returns true for existing element', () => {
      const ms = new Multiset<number>({ elements: [5] })
      expect(ms.has(5)).toBe(true)
    })

    it('returns false after element removed', () => {
      const ms = new Multiset<number>({ elements: [5] })
      ms.delete(5)
      expect(ms.has(5)).toBe(false)
    })

    it('returns true for element with count > 0', () => {
      const ms = new Multiset<number>()
      ms.add(5, 100)
      expect(ms.has(5)).toBe(true)
    })
  })

  describe('size and uniqueSize', () => {
    it('size tracks total elements', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      ms.add(2, 4)
      expect(ms.size).toBe(7)
    })

    it('uniqueSize tracks unique elements', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      ms.add(2, 4)
      expect(ms.uniqueSize).toBe(2)
    })

    it('size updates on delete', () => {
      const ms = new Multiset<number>()
      ms.add(1, 5)
      ms.delete(1, 2)
      expect(ms.size).toBe(3)
    })

    it('uniqueSize updates on full delete', () => {
      const ms = new Multiset<number>()
      ms.add(1, 5)
      ms.add(2, 3)
      ms.delete(1, 5)
      expect(ms.uniqueSize).toBe(1)
    })

    it('size is 0 after clear', () => {
      const ms = new Multiset<number>()
      ms.add(1, 5)
      ms.add(2, 3)
      ms.clear()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears empty multiset', () => {
      const ms = new Multiset<number>()
      ms.clear()
      expect(ms.size).toBe(0)
    })

    it('clears non-empty multiset', () => {
      const ms = new Multiset<number>({ elements: [1, 2, 3, 1] })
      ms.clear()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
      expect(ms.has(1)).toBe(false)
      expect(ms.has(2)).toBe(false)
      expect(ms.has(3)).toBe(false)
    })

    it('can add after clear', () => {
      const ms = new Multiset<number>({ elements: [1, 2] })
      ms.clear()
      ms.add(3)
      expect(ms.size).toBe(1)
      expect(ms.has(3)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty multiset', () => {
      const ms = new Multiset<number>()
      expect(ms.toArray()).toEqual([])
    })

    it('returns elements with duplicates', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      ms.add(2, 2)
      const arr = ms.toArray()
      expect(arr.length).toBe(5)
      expect(arr.filter(x => x === 1).length).toBe(3)
      expect(arr.filter(x => x === 2).length).toBe(2)
    })

    it('returns new array each call', () => {
      const ms = new Multiset<number>({ elements: [1] })
      const a = ms.toArray()
      const b = ms.toArray()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })

    it('returns correct array after modifications', () => {
      const ms = new Multiset<number>({ elements: [1, 1, 2] })
      ms.delete(1)
      const arr = ms.toArray()
      expect(arr.length).toBe(2)
      expect(arr.filter(x => x === 1).length).toBe(1)
    })
  })

  describe('forEach', () => {
    it('iterates over empty multiset', () => {
      const ms = new Multiset<number>()
      const results: [number, number][] = []
      ms.forEach((v, c) => results.push([v, c]))
      expect(results).toEqual([])
    })

    it('iterates over entries', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      ms.add(2, 2)
      const results: [number, number][] = []
      ms.forEach((v, c) => results.push([v, c]))
      expect(results.length).toBe(2)
      expect(results).toContainEqual([1, 3])
      expect(results).toContainEqual([2, 2])
    })

    it('receives multiset as third argument', () => {
      const ms = new Multiset<number>({ elements: [1] })
      let received: Multiset<number> | undefined
      ms.forEach((_v, _c, m) => { received = m })
      expect(received).toBe(ms)
    })
  })

  describe('entries', () => {
    it('returns empty iterator for empty multiset', () => {
      const ms = new Multiset<number>()
      const result = [...ms.entries()]
      expect(result).toEqual([])
    })

    it('returns all entries', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      ms.add(2, 5)
      const result = [...ms.entries()]
      expect(result.length).toBe(2)
      expect(result).toContainEqual([1, 3])
      expect(result).toContainEqual([2, 5])
    })
  })

  describe('values', () => {
    it('returns empty iterator for empty multiset', () => {
      const ms = new Multiset<number>()
      const result = [...ms.values()]
      expect(result).toEqual([])
    })

    it('returns all values with duplicates', () => {
      const ms = new Multiset<number>()
      ms.add(1, 2)
      ms.add(2, 3)
      const result = [...ms.values()]
      expect(result.length).toBe(5)
      expect(result.filter(x => x === 1).length).toBe(2)
      expect(result.filter(x => x === 2).length).toBe(3)
    })
  })

  describe('uniqueValues', () => {
    it('returns empty iterator for empty multiset', () => {
      const ms = new Multiset<number>()
      const result = [...ms.uniqueValues()]
      expect(result).toEqual([])
    })

    it('returns unique values', () => {
      const ms = new Multiset<number>()
      ms.add(1, 5)
      ms.add(2, 3)
      const result = [...ms.uniqueValues()]
      expect(result.length).toBe(2)
      expect(result).toContain(1)
      expect(result).toContain(2)
    })
  })

  describe('union', () => {
    it('union of empty multisets', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      const result = a.union(b)
      expect(result.size).toBe(0)
    })

    it('union with empty multiset', () => {
      const a = new Multiset<number>({ elements: [1, 1, 2] })
      const b = new Multiset<number>()
      const result = a.union(b)
      expect(result.size).toBe(3)
      expect(result.count(1)).toBe(2)
      expect(result.count(2)).toBe(1)
    })

    it('union of non-overlapping multisets', () => {
      const a = new Multiset<number>({ elements: [1, 1] })
      const b = new Multiset<number>({ elements: [2, 2, 2] })
      const result = a.union(b)
      expect(result.size).toBe(5)
      expect(result.count(1)).toBe(2)
      expect(result.count(2)).toBe(3)
    })

    it('union takes max count', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      a.add(2, 5)
      const b = new Multiset<number>()
      b.add(1, 7)
      b.add(2, 2)
      const result = a.union(b)
      expect(result.count(1)).toBe(7)
      expect(result.count(2)).toBe(5)
      expect(result.size).toBe(12)
    })

    it('union does not modify originals', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(1, 7)
      a.union(b)
      expect(a.count(1)).toBe(3)
      expect(b.count(1)).toBe(7)
    })

    it('union handles elements only in b', () => {
      const a = new Multiset<number>({ elements: [1] })
      const b = new Multiset<number>()
      b.add(2, 4)
      const result = a.union(b)
      expect(result.count(1)).toBe(1)
      expect(result.count(2)).toBe(4)
    })
  })

  describe('intersection', () => {
    it('intersection of empty multisets', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      const result = a.intersection(b)
      expect(result.size).toBe(0)
    })

    it('intersection with empty multiset', () => {
      const a = new Multiset<number>({ elements: [1, 2] })
      const b = new Multiset<number>()
      const result = a.intersection(b)
      expect(result.size).toBe(0)
    })

    it('intersection takes min count', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      a.add(2, 5)
      const b = new Multiset<number>()
      b.add(1, 7)
      b.add(2, 2)
      const result = a.intersection(b)
      expect(result.count(1)).toBe(3)
      expect(result.count(2)).toBe(2)
      expect(result.size).toBe(5)
    })

    it('intersection excludes non-overlapping elements', () => {
      const a = new Multiset<number>({ elements: [1, 2, 3] })
      const b = new Multiset<number>({ elements: [2, 3, 4] })
      const result = a.intersection(b)
      expect(result.size).toBe(2)
      expect(result.has(1)).toBe(false)
      expect(result.has(4)).toBe(false)
      expect(result.count(2)).toBe(1)
      expect(result.count(3)).toBe(1)
    })

    it('intersection does not modify originals', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(1, 7)
      a.intersection(b)
      expect(a.count(1)).toBe(3)
      expect(b.count(1)).toBe(7)
    })
  })

  describe('sum', () => {
    it('sum of empty multisets', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      const result = a.sum(b)
      expect(result.size).toBe(0)
    })

    it('sum adds counts', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(1, 4)
      const result = a.sum(b)
      expect(result.count(1)).toBe(7)
      expect(result.size).toBe(7)
    })

    it('sum of non-overlapping', () => {
      const a = new Multiset<number>({ elements: [1, 1] })
      const b = new Multiset<number>({ elements: [2, 2, 2] })
      const result = a.sum(b)
      expect(result.count(1)).toBe(2)
      expect(result.count(2)).toBe(3)
      expect(result.size).toBe(5)
    })

    it('sum does not modify originals', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(1, 4)
      a.sum(b)
      expect(a.count(1)).toBe(3)
      expect(b.count(1)).toBe(4)
    })

    it('sum with empty multiset returns clone', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      const b = new Multiset<number>()
      const result = a.sum(b)
      expect(result.count(1)).toBe(5)
    })
  })

  describe('isSubsetOf', () => {
    it('empty is subset of empty', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('empty is subset of non-empty', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>({ elements: [1] })
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('non-empty is not subset of empty', () => {
      const a = new Multiset<number>({ elements: [1] })
      const b = new Multiset<number>()
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('subset with same counts', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(1, 3)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('subset with smaller counts', () => {
      const a = new Multiset<number>()
      a.add(1, 2)
      const b = new Multiset<number>()
      b.add(1, 5)
      expect(a.isSubsetOf(b)).toBe(true)
    })

    it('not subset with larger counts', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      const b = new Multiset<number>()
      b.add(1, 2)
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('not subset with missing element', () => {
      const a = new Multiset<number>({ elements: [1, 2] })
      const b = new Multiset<number>({ elements: [1] })
      expect(a.isSubsetOf(b)).toBe(false)
    })

    it('subset of superset', () => {
      const a = new Multiset<number>({ elements: [1, 2] })
      const b = new Multiset<number>({ elements: [1, 2, 3] })
      expect(a.isSubsetOf(b)).toBe(true)
    })
  })

  describe('isSupersetOf', () => {
    it('empty is superset of empty', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('non-empty is superset of empty', () => {
      const a = new Multiset<number>({ elements: [1] })
      const b = new Multiset<number>()
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('superset with larger counts', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      const b = new Multiset<number>()
      b.add(1, 3)
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('not superset with smaller counts', () => {
      const a = new Multiset<number>()
      a.add(1, 2)
      const b = new Multiset<number>()
      b.add(1, 5)
      expect(a.isSupersetOf(b)).toBe(false)
    })

    it('isSupersetOf is inverse of isSubsetOf', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      const b = new Multiset<number>()
      b.add(1, 3)
      expect(a.isSupersetOf(b)).toBe(true)
      expect(b.isSubsetOf(a)).toBe(true)
    })
  })

  describe('equals', () => {
    it('empty multisets are equal', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>()
      expect(a.equals(b)).toBe(true)
    })

    it('identical multisets are equal', () => {
      const a = new Multiset<number>({ elements: [1, 2, 3] })
      const b = new Multiset<number>({ elements: [1, 2, 3] })
      expect(a.equals(b)).toBe(true)
    })

    it('equal with same counts', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      a.add(2, 2)
      const b = new Multiset<number>()
      b.add(1, 3)
      b.add(2, 2)
      expect(a.equals(b)).toBe(true)
    })

    it('not equal with different counts', () => {
      const a = new Multiset<number>()
      a.add(1, 3)
      const b = new Multiset<number>()
      b.add(1, 4)
      expect(a.equals(b)).toBe(false)
    })

    it('not equal with extra element', () => {
      const a = new Multiset<number>({ elements: [1, 2] })
      const b = new Multiset<number>({ elements: [1, 2, 3] })
      expect(a.equals(b)).toBe(false)
    })

    it('not equal with empty vs non-empty', () => {
      const a = new Multiset<number>()
      const b = new Multiset<number>({ elements: [1] })
      expect(a.equals(b)).toBe(false)
    })

    it('reflexive: a equals a', () => {
      const a = new Multiset<number>({ elements: [1, 2, 2] })
      expect(a.equals(a)).toBe(true)
    })

    it('symmetric: a equals b implies b equals a', () => {
      const a = new Multiset<number>({ elements: [1, 2, 2] })
      const b = new Multiset<number>({ elements: [1, 2, 2] })
      expect(a.equals(b)).toBe(true)
      expect(b.equals(a)).toBe(true)
    })
  })

  describe('clone', () => {
    it('clones empty multiset', () => {
      const ms = new Multiset<number>()
      const clone = ms.clone()
      expect(clone.size).toBe(0)
      expect(clone.uniqueSize).toBe(0)
    })

    it('clones non-empty multiset', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      ms.add(2, 2)
      const clone = ms.clone()
      expect(clone.size).toBe(5)
      expect(clone.count(1)).toBe(3)
      expect(clone.count(2)).toBe(2)
    })

    it('clone is independent', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      const clone = ms.clone()
      clone.add(1)
      expect(ms.count(1)).toBe(3)
      expect(clone.count(1)).toBe(4)
    })

    it('clone preserves uniqueSize', () => {
      const ms = new Multiset<number>({ elements: [1, 2, 3, 1, 2] })
      const clone = ms.clone()
      expect(clone.uniqueSize).toBe(ms.uniqueSize)
    })
  })

  describe('isEmpty', () => {
    it('empty multiset returns true', () => {
      const ms = new Multiset<number>()
      expect(ms.isEmpty()).toBe(true)
    })

    it('non-empty multiset returns false', () => {
      const ms = new Multiset<number>({ elements: [1] })
      expect(ms.isEmpty()).toBe(false)
    })

    it('after clear returns true', () => {
      const ms = new Multiset<number>({ elements: [1, 2] })
      ms.clear()
      expect(ms.isEmpty()).toBe(true)
    })

    it('after all elements deleted returns true', () => {
      const ms = new Multiset<number>({ elements: [1] })
      ms.delete(1)
      expect(ms.isEmpty()).toBe(true)
    })
  })

  describe('set', () => {
    it('sets count for new element', () => {
      const ms = new Multiset<number>()
      ms.set(5, 3)
      expect(ms.count(5)).toBe(3)
      expect(ms.size).toBe(3)
    })

    it('overwrites existing count', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      ms.set(5, 7)
      expect(ms.count(5)).toBe(7)
      expect(ms.size).toBe(7)
    })

    it('reduces existing count', () => {
      const ms = new Multiset<number>()
      ms.add(5, 10)
      ms.set(5, 2)
      expect(ms.count(5)).toBe(2)
      expect(ms.size).toBe(2)
    })

    it('removes element with count 0', () => {
      const ms = new Multiset<number>()
      ms.add(5, 10)
      ms.set(5, 0)
      expect(ms.has(5)).toBe(false)
      expect(ms.size).toBe(0)
    })

    it('removes element with negative count', () => {
      const ms = new Multiset<number>()
      ms.add(5, 10)
      ms.set(5, -1)
      expect(ms.has(5)).toBe(false)
      expect(ms.size).toBe(0)
    })

    it('set 0 on non-existent does nothing', () => {
      const ms = new Multiset<number>()
      ms.set(5, 0)
      expect(ms.size).toBe(0)
      expect(ms.has(5)).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty multiset', () => {
      const ms = new Multiset<number>()
      const result = [...ms]
      expect(result).toEqual([])
    })

    it('iterates over elements with duplicates', () => {
      const ms = new Multiset<number>()
      ms.add(1, 2)
      ms.add(2, 3)
      const result = [...ms]
      expect(result.length).toBe(5)
      expect(result.filter(x => x === 1).length).toBe(2)
      expect(result.filter(x => x === 2).length).toBe(3)
    })
  })

  describe('static from', () => {
    it('creates multiset from array', () => {
      const ms = Multiset.from([1, 2, 3, 1])
      expect(ms.size).toBe(4)
      expect(ms.count(1)).toBe(2)
      expect(ms.count(2)).toBe(1)
      expect(ms.count(3)).toBe(1)
    })

    it('creates from empty array', () => {
      const ms = Multiset.from([])
      expect(ms.size).toBe(0)
    })

    it('creates from strings', () => {
      const ms = Multiset.from(['a', 'b', 'a', 'c', 'b', 'a'])
      expect(ms.count('a')).toBe(3)
      expect(ms.count('b')).toBe(2)
      expect(ms.count('c')).toBe(1)
      expect(ms.size).toBe(6)
    })
  })

  describe('static fromEntries', () => {
    it('creates multiset from entries', () => {
      const ms = Multiset.fromEntries([['x', 5], ['y', 3]])
      expect(ms.count('x')).toBe(5)
      expect(ms.count('y')).toBe(3)
      expect(ms.size).toBe(8)
    })

    it('creates from empty entries', () => {
      const ms = Multiset.fromEntries([])
      expect(ms.size).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles many operations', () => {
      const ms = new Multiset<number>()
      for (let i = 0; i < 100; i++) {
        ms.add(i, i + 1)
      }
      expect(ms.uniqueSize).toBe(100)
      let expectedSize = 0
      for (let i = 0; i < 100; i++) {
        expectedSize += i + 1
      }
      expect(ms.size).toBe(expectedSize)
    })

    it('handles add and delete cycles', () => {
      const ms = new Multiset<number>()
      ms.add(1, 10)
      ms.delete(1, 5)
      ms.add(1, 3)
      expect(ms.count(1)).toBe(8)
      expect(ms.size).toBe(8)
    })

    it('handles large counts', () => {
      const ms = new Multiset<number>()
      ms.add(1, 1000000)
      expect(ms.count(1)).toBe(1000000)
      expect(ms.size).toBe(1000000)
    })

    it('handles NaN as key', () => {
      const ms = new Multiset<number>()
      ms.add(NaN)
      ms.add(NaN)
      expect(ms.count(NaN)).toBe(2)
    })

    it('handles null as key', () => {
      const ms = new Multiset<null>()
      ms.add(null, 3)
      expect(ms.count(null)).toBe(3)
      expect(ms.has(null)).toBe(true)
    })

    it('handles undefined as key', () => {
      const ms = new Multiset<undefined>()
      ms.add(undefined, 2)
      expect(ms.count(undefined)).toBe(2)
    })

    it('handles boolean values', () => {
      const ms = new Multiset<boolean>({ elements: [true, true, false] })
      expect(ms.count(true)).toBe(2)
      expect(ms.count(false)).toBe(1)
    })

    it('operations on empty multiset do not error', () => {
      const ms = new Multiset<number>()
      expect(ms.toArray()).toEqual([])
      expect([...ms.entries()]).toEqual([])
      expect([...ms.values()]).toEqual([])
      expect([...ms.uniqueValues()]).toEqual([])
      ms.forEach(() => { throw new Error('should not call') })
    })

    it('union of multiset with itself', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      const result = ms.union(ms)
      expect(result.count(1)).toBe(3)
      expect(result.size).toBe(3)
    })

    it('intersection of multiset with itself', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      const result = ms.intersection(ms)
      expect(result.count(1)).toBe(3)
    })

    it('sum of multiset with itself', () => {
      const ms = new Multiset<number>()
      ms.add(1, 3)
      const result = ms.sum(ms)
      expect(result.count(1)).toBe(6)
    })

    it('equals of multiset with itself', () => {
      const ms = new Multiset<number>({ elements: [1, 2, 2] })
      expect(ms.equals(ms)).toBe(true)
    })

    it('isSubsetOf multiset with itself', () => {
      const ms = new Multiset<number>({ elements: [1, 2] })
      expect(ms.isSubsetOf(ms)).toBe(true)
    })

    it('isSupersetOf multiset with itself', () => {
      const ms = new Multiset<number>({ elements: [1, 2] })
      expect(ms.isSupersetOf(ms)).toBe(true)
    })
  })

  describe('complex operations', () => {
    it('chained set operations', () => {
      const a = Multiset.from([1, 1, 2, 3])
      const b = Multiset.from([2, 3, 3, 4])
      const result = a.intersection(b)
      expect(result.has(1)).toBe(false)
      expect(result.count(2)).toBe(1)
      expect(result.count(3)).toBe(1)
      expect(result.has(4)).toBe(false)
    })

    it('multiset difference via sum and intersection', () => {
      const a = new Multiset<number>()
      a.add(1, 5)
      a.add(2, 3)
      const b = new Multiset<number>()
      b.add(1, 2)
      b.add(2, 4)
      const intersect = a.intersection(b)
      expect(intersect.count(1)).toBe(2)
      expect(intersect.count(2)).toBe(3)
    })

    it('clear and rebuild', () => {
      const ms = new Multiset<number>({ elements: [1, 2, 3] })
      ms.clear()
      ms.add(4, 5)
      ms.add(5, 6)
      expect(ms.size).toBe(11)
      expect(ms.uniqueSize).toBe(2)
      expect(ms.has(1)).toBe(false)
    })

    it('multiple unions', () => {
      const a = Multiset.from([1])
      const b = Multiset.from([1, 2])
      const c = Multiset.from([2, 3])
      const result = a.union(b).union(c)
      expect(result.count(1)).toBe(1)
      expect(result.count(2)).toBe(1)
      expect(result.count(3)).toBe(1)
    })

    it('multiple sums', () => {
      const a = Multiset.from([1])
      const b = Multiset.from([1])
      const c = Multiset.from([1])
      const result = a.sum(b).sum(c)
      expect(result.count(1)).toBe(3)
    })
  })
})
