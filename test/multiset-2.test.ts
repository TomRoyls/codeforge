import { Multiset } from '../src/core/multiset-2/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('Multiset', () => {
  describe('constructor', () => {
    it('creates empty multiset', () => {
      const ms = new Multiset<number>()
      expect(ms.size).toBe(0)
      expect(ms.uniqueSize).toBe(0)
      expect(ms.isEmpty()).toBe(true)
    })

    it('creates from elements', () => {
      const ms = new Multiset<number>({ elements: [1, 2, 2, 3] })
      expect(ms.size).toBe(4)
      expect(ms.uniqueSize).toBe(3)
    })

    it('creates from entries', () => {
      const ms = new Multiset<string>({ entries: [['a', 3], ['b', 2]] })
      expect(ms.size).toBe(5)
      expect(ms.count('a')).toBe(3)
    })

    it('ignores zero/negative counts in entries', () => {
      const ms = new Multiset<string>({ entries: [['a', 0], ['b', -1], ['c', 2]] })
      expect(ms.uniqueSize).toBe(1)
    })
  })

  // ─── Add ─────────────────────────────────────────────────────────────────

  describe('add', () => {
    it('adds single element', () => {
      const ms = new Multiset<number>()
      ms.add(5)
      expect(ms.has(5)).toBe(true)
      expect(ms.count(5)).toBe(1)
    })

    it('adds with count', () => {
      const ms = new Multiset<number>()
      ms.add(5, 3)
      expect(ms.count(5)).toBe(3)
      expect(ms.size).toBe(3)
    })

    it('ignores zero/negative count', () => {
      const ms = new Multiset<number>()
      ms.add(5, 0)
      ms.add(5, -1)
      expect(ms.has(5)).toBe(false)
    })
  })

  // ─── Delete ──────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes one occurrence by default', () => {
      const ms = new Multiset<number>({ elements: [1, 1, 1] })
      ms.delete(1)
      expect(ms.count(1)).toBe(2)
    })

    it('deletes multiple occurrences', () => {
      const ms = new Multiset<number>({ elements: [1, 1, 1] })
      ms.delete(1, 2)
      expect(ms.count(1)).toBe(1)
    })

    it('removes element when count reaches zero', () => {
      const ms = new Multiset<number>({ elements: [1, 1] })
      ms.delete(1, 2)
      expect(ms.has(1)).toBe(false)
    })

    it('returns false for missing element', () => {
      const ms = new Multiset<number>()
      expect(ms.delete(5)).toBe(false)
    })
  })

  // ─── Count / Has ─────────────────────────────────────────────────────────

  describe('count and has', () => {
    it('count returns 0 for missing', () => {
      const ms = new Multiset<number>()
      expect(ms.count(99)).toBe(0)
    })

    it('has checks existence', () => {
      const ms = new Multiset<number>({ elements: [1, 2] })
      expect(ms.has(1)).toBe(true)
      expect(ms.has(3)).toBe(false)
    })
  })

  // ─── Set Operations ──────────────────────────────────────────────────────

  describe('set operations', () => {
    it('union takes max counts', () => {
      const a = new Multiset<string>({ entries: [['x', 2], ['y', 5]] })
      const b = new Multiset<string>({ entries: [['x', 4], ['z', 1]] })
      const u = a.union(b)
      expect(u.count('x')).toBe(4)
      expect(u.count('y')).toBe(5)
      expect(u.count('z')).toBe(1)
    })

    it('intersection takes min counts', () => {
      const a = new Multiset<string>({ entries: [['x', 2], ['y', 5]] })
      const b = new Multiset<string>({ entries: [['x', 4], ['y', 1]] })
      const i = a.intersection(b)
      expect(i.count('x')).toBe(2)
      expect(i.count('y')).toBe(1)
    })

    it('sum adds counts', () => {
      const a = new Multiset<string>({ entries: [['x', 2]] })
      const b = new Multiset<string>({ entries: [['x', 3]] })
      const s = a.sum(b)
      expect(s.count('x')).toBe(5)
    })

    it('isSubsetOf checks inclusion', () => {
      const a = new Multiset<number>({ entries: [['x' as unknown as number, 2]] })
      const b = new Multiset<number>({ entries: [['x' as unknown as number, 5]] })
      expect(a.isSubsetOf(b)).toBe(true)
      expect(b.isSubsetOf(a)).toBe(false)
    })

    it('isSupersetOf is inverse of isSubsetOf', () => {
      const a = new Multiset<number>({ entries: [['x' as unknown as number, 5]] })
      const b = new Multiset<number>({ entries: [['x' as unknown as number, 2]] })
      expect(a.isSupersetOf(b)).toBe(true)
    })

    it('equals checks exact equality', () => {
      const a = new Multiset<number>({ elements: [1, 2, 2] })
      const b = new Multiset<number>({ elements: [1, 2, 2] })
      const c = new Multiset<number>({ elements: [1, 2] })
      expect(a.equals(b)).toBe(true)
      expect(a.equals(c)).toBe(false)
    })
  })

  // ─── Clone / Set ─────────────────────────────────────────────────────────

  describe('clone and set', () => {
    it('clone creates independent copy', () => {
      const ms = new Multiset<number>({ elements: [1, 2, 3] })
      const cloned = ms.clone()
      ms.delete(1)
      expect(cloned.has(1)).toBe(true)
    })

    it('set overwrites count', () => {
      const ms = new Multiset<number>({ elements: [1, 1, 1] })
      ms.set(1, 10)
      expect(ms.count(1)).toBe(10)
    })

    it('set with 0 removes element', () => {
      const ms = new Multiset<number>({ elements: [1, 1] })
      ms.set(1, 0)
      expect(ms.has(1)).toBe(false)
    })
  })

  // ─── Iteration ────────────────────────────────────────────────────────────

  describe('iteration', () => {
    it('toArray expands all occurrences', () => {
      const ms = new Multiset<string>({ entries: [['a', 3], ['b', 1]] })
      const arr = ms.toArray()
      expect(arr.filter((x) => x === 'a').length).toBe(3)
    })

    it('forEach iterates unique values with counts', () => {
      const ms = new Multiset<number>({ elements: [1, 1, 2] })
      const collected: Array<[number, number]> = []
      ms.forEach((v, c) => collected.push([v, c]))
      expect(collected).toContainEqual([1, 2])
      expect(collected).toContainEqual([2, 1])
    })

    it('entries yields unique entries', () => {
      const ms = new Multiset<string>({ entries: [['a', 2], ['b', 3]] })
      const entries = [...ms.entries()]
      expect(entries.length).toBe(2)
    })

    it('values yields all with repetitions', () => {
      const ms = new Multiset<number>({ entries: [[1, 2]] })
      expect([...ms.values()]).toEqual([1, 1])
    })

    it('uniqueValues yields distinct', () => {
      const ms = new Multiset<number>({ elements: [1, 1, 2] })
      expect([...ms.uniqueValues()]).toEqual([1, 2])
    })

    it('Symbol.iterator works', () => {
      const ms = new Multiset<number>({ elements: [1, 2] })
      expect([...ms].length).toBe(2)
    })
  })

  // ─── Static Methods ──────────────────────────────────────────────────────

  describe('static methods', () => {
    it('from creates from elements', () => {
      const ms = Multiset.from([1, 2, 2, 3])
      expect(ms.size).toBe(4)
    })

    it('fromEntries creates from entries', () => {
      const ms = Multiset.fromEntries([['a', 5]])
      expect(ms.count('a')).toBe(5)
    })
  })

  // ─── Clear ───────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clear empties multiset', () => {
      const ms = new Multiset<number>({ elements: [1, 2] })
      ms.clear()
      expect(ms.isEmpty()).toBe(true)
      expect(ms.size).toBe(0)
    })
  })
})
