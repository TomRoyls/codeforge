import { describe, it, expect } from 'vitest'
import { RankedMap } from '../../src/core/ranked-map/ranked-map.js'

describe('RankedMap', () => {
  describe('construction', () => {
    it('creates empty map with no arguments', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.size).toBe(0)
      expect(rm.isEmpty()).toBe(true)
    })

    it('creates map with default descending comparator', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      expect(rm.getByRank(1)?.score).toBe(200)
      expect(rm.getByRank(3)?.score).toBe(50)
    })

    it('creates map with ascending comparator', () => {
      const rm = new RankedMap<string, number>({ compareScores: (a, b) => a - b })
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      expect(rm.getByRank(1)?.score).toBe(50)
      expect(rm.getByRank(3)?.score).toBe(200)
    })

    it('creates map with custom comparator', () => {
      const rm = new RankedMap<string, number>({
        compareScores: (a, b) => Math.abs(b) - Math.abs(a),
      })
      rm.set('a', 1, -100)
      rm.set('b', 2, 50)
      rm.set('c', 3, -25)
      expect(rm.getByRank(1)?.score).toBe(-100)
      expect(rm.getByRank(3)?.score).toBe(-25)
    })

    it('creates map with empty options', () => {
      const rm = new RankedMap<number, string>({})
      rm.set(1, 'a', 10)
      expect(rm.size).toBe(1)
    })
  })

  describe('set/get/has', () => {
    it('sets and gets entries', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      expect(rm.get('a')).toEqual({ value: 1, score: 100 })
      expect(rm.get('b')).toEqual({ value: 2, score: 200 })
    })

    it('returns undefined for missing key', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.get('missing')).toBeUndefined()
    })

    it('has returns true for existing key', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.has('a')).toBe(true)
    })

    it('has returns false for missing key', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.has('a')).toBe(false)
    })

    it('has returns false after delete', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.delete('a')
      expect(rm.has('a')).toBe(false)
    })

    it('overwrites value and score for same key', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('a', 2, 200)
      expect(rm.get('a')).toEqual({ value: 2, score: 200 })
      expect(rm.size).toBe(1)
    })

    it('overwrites value only when score unchanged', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('a', 2, 100)
      expect(rm.get('a')).toEqual({ value: 2, score: 100 })
      expect(rm.size).toBe(1)
    })

    it('handles many entries', () => {
      const rm = new RankedMap<number, string>()
      for (let i = 0; i < 100; i++) {
        rm.set(i, `v${i}`, i * 10)
      }
      expect(rm.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(rm.get(i)).toEqual({ value: `v${i}`, score: i * 10 })
      }
    })

    it('handles string keys', () => {
      const rm = new RankedMap<string, number>()
      rm.set('alice', 25, 100)
      rm.set('bob', 30, 200)
      expect(rm.get('alice')).toEqual({ value: 25, score: 100 })
      expect(rm.get('bob')).toEqual({ value: 30, score: 200 })
    })

    it('handles null and undefined values', () => {
      const rm1 = new RankedMap<string, string | null>()
      rm1.set('a', null, 10)
      expect(rm1.get('a')).toEqual({ value: null, score: 10 })

      const rm2 = new RankedMap<string, string | undefined>()
      rm2.set('b', undefined, 20)
      expect(rm2.get('b')).toEqual({ value: undefined, score: 20 })
    })

    it('handles object values', () => {
      const rm = new RankedMap<string, { name: string }>()
      rm.set('a', { name: 'test' }, 100)
      expect(rm.get('a')?.value.name).toBe('test')
    })

    it('handles negative scores', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, -10)
      rm.set('b', 2, -20)
      rm.set('c', 3, -5)
      expect(rm.getByRank(1)?.score).toBe(-5)
      expect(rm.getByRank(3)?.score).toBe(-20)
    })

    it('handles zero scores', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 0)
      rm.set('b', 2, 10)
      rm.set('c', 3, -5)
      expect(rm.getRank('a')).toBe(2)
    })

    it('handles floating point scores', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 1.5)
      rm.set('b', 2, 2.7)
      rm.set('c', 3, 0.3)
      expect(rm.getByRank(1)?.score).toBe(2.7)
      expect(rm.getByRank(3)?.score).toBe(0.3)
    })
  })

  describe('getByRank', () => {
    it('returns entry at rank 1 (highest score with descending)', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      expect(rm.getByRank(1)).toEqual({ key: 'b', value: 2, score: 200 })
    })

    it('returns entry at last rank (lowest score)', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      expect(rm.getByRank(3)).toEqual({ key: 'c', value: 3, score: 50 })
    })

    it('returns undefined for rank 0', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.getByRank(0)).toBeUndefined()
    })

    it('returns undefined for rank beyond size', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.getByRank(2)).toBeUndefined()
    })

    it('returns undefined for negative rank', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.getByRank(-1)).toBeUndefined()
    })

    it('returns undefined for empty map', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.getByRank(1)).toBeUndefined()
    })

    it('returns correct entries for all ranks', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 300)
      rm.set('b', 2, 200)
      rm.set('c', 3, 100)
      expect(rm.getByRank(1)?.score).toBe(300)
      expect(rm.getByRank(2)?.score).toBe(200)
      expect(rm.getByRank(3)?.score).toBe(100)
    })

    it('works with ascending comparator', () => {
      const rm = new RankedMap<string, number>({ compareScores: (a, b) => a - b })
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      expect(rm.getByRank(1)).toEqual({ key: 'c', value: 3, score: 50 })
      expect(rm.getByRank(3)).toEqual({ key: 'b', value: 2, score: 200 })
    })

    it('handles single entry', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.getByRank(1)).toEqual({ key: 'a', value: 1, score: 100 })
    })
  })

  describe('getRank', () => {
    it('returns correct rank for entries', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      expect(rm.getRank('b')).toBe(1)
      expect(rm.getRank('a')).toBe(2)
      expect(rm.getRank('c')).toBe(3)
    })

    it('returns -1 for missing key', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.getRank('missing')).toBe(-1)
    })

    it('returns -1 for empty map', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.getRank('a')).toBe(-1)
    })

    it('returns 1 for only entry', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.getRank('a')).toBe(1)
    })

    it('rank and getByRank are inverse operations', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      for (let i = 1; i <= 3; i++) {
        const entry = rm.getByRank(i)!
        expect(rm.getRank(entry.key)).toBe(i)
      }
    })

    it('updates rank after deletion', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      rm.delete('b')
      expect(rm.getRank('a')).toBe(1)
      expect(rm.getRank('c')).toBe(2)
    })

    it('updates rank after updateScore', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      rm.updateScore('c', 300)
      expect(rm.getRank('c')).toBe(1)
      expect(rm.getRank('b')).toBe(2)
      expect(rm.getRank('a')).toBe(3)
    })
  })

  describe('topK/bottomK', () => {
    it('returns top k entries', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      rm.set('d', 4, 400)
      const top = rm.topK(2)
      expect(top).toEqual([
        { key: 'd', value: 4, score: 400 },
        { key: 'c', value: 3, score: 300 },
      ])
    })

    it('returns bottom k entries', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      rm.set('d', 4, 400)
      const bottom = rm.bottomK(2)
      expect(bottom).toEqual([
        { key: 'b', value: 2, score: 200 },
        { key: 'a', value: 1, score: 100 },
      ])
    })

    it('returns all entries when k exceeds size', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      expect(rm.topK(10).length).toBe(2)
      expect(rm.bottomK(10).length).toBe(2)
    })

    it('returns empty for empty map', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.topK(5)).toEqual([])
      expect(rm.bottomK(5)).toEqual([])
    })

    it('returns empty for k=0', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.topK(0)).toEqual([])
      expect(rm.bottomK(0)).toEqual([])
    })

    it('topK(1) returns same as getByRank(1)', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      const top1 = rm.topK(1)
      expect(top1[0]).toEqual(rm.getByRank(1))
    })

    it('bottomK(1) returns same as getByRank(size)', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      const bottom1 = rm.bottomK(1)
      expect(bottom1[0]).toEqual(rm.getByRank(rm.size))
    })
  })

  describe('updateScore', () => {
    it('updates score and reorders', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      rm.updateScore('a', 300)
      expect(rm.getRank('a')).toBe(1)
      expect(rm.getByRank(1)).toEqual({ key: 'a', value: 1, score: 300 })
    })

    it('returns true for existing key', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.updateScore('a', 200)).toBe(true)
    })

    it('returns false for missing key', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.updateScore('a', 200)).toBe(false)
    })

    it('preserves value when updating score', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 42, 100)
      rm.updateScore('a', 200)
      expect(rm.get('a')).toEqual({ value: 42, score: 200 })
    })

    it('handles update to same score', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.updateScore('a', 100)).toBe(true)
      expect(rm.getRank('a')).toBe(1)
    })

    it('handles multiple updates', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      rm.updateScore('a', 400)
      rm.updateScore('c', 50)
      expect(rm.getByRank(1)).toEqual({ key: 'a', value: 1, score: 400 })
      expect(rm.getByRank(2)).toEqual({ key: 'b', value: 2, score: 200 })
      expect(rm.getByRank(3)).toEqual({ key: 'c', value: 3, score: 50 })
    })

    it('updates score on empty map returns false', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.updateScore('a', 100)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes existing entry', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.delete('a')).toBe(true)
      expect(rm.size).toBe(0)
      expect(rm.has('a')).toBe(false)
    })

    it('returns false for missing key', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.delete('a')).toBe(false)
    })

    it('returns false for empty map', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.delete('a')).toBe(false)
    })

    it('maintains order after deletion', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      rm.delete('b')
      expect(rm.getByRank(1)).toEqual({ key: 'c', value: 3, score: 300 })
      expect(rm.getByRank(2)).toEqual({ key: 'a', value: 1, score: 100 })
    })

    it('handles deleting all entries', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.delete('a')
      rm.delete('b')
      expect(rm.isEmpty()).toBe(true)
    })

    it('handles set-delete-set cycle', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.delete('a')
      rm.set('a', 2, 200)
      expect(rm.get('a')).toEqual({ value: 2, score: 200 })
      expect(rm.size).toBe(1)
    })

    it('handles deleting middle entry', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 300)
      rm.set('b', 2, 200)
      rm.set('c', 3, 100)
      rm.delete('b')
      expect(rm.size).toBe(2)
      expect(rm.getRank('a')).toBe(1)
      expect(rm.getRank('c')).toBe(2)
    })

    it('handles deleting first ranked entry', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 300)
      rm.set('b', 2, 200)
      rm.set('c', 3, 100)
      rm.delete('a')
      expect(rm.getByRank(1)).toEqual({ key: 'b', value: 2, score: 200 })
    })

    it('handles deleting last ranked entry', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 300)
      rm.set('b', 2, 200)
      rm.set('c', 3, 100)
      rm.delete('c')
      expect(rm.getByRank(rm.size)).toEqual({ key: 'b', value: 2, score: 200 })
    })
  })

  describe('rangeByRank', () => {
    it('returns entries in rank range', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      rm.set('d', 4, 400)
      rm.set('e', 5, 500)
      const range = rm.rangeByRank(2, 4)
      expect(range).toEqual([
        { key: 'd', value: 4, score: 400 },
        { key: 'c', value: 3, score: 300 },
        { key: 'b', value: 2, score: 200 },
      ])
    })

    it('returns single entry for equal ranks', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      expect(rm.rangeByRank(1, 1)).toEqual([{ key: 'b', value: 2, score: 200 }])
    })

    it('returns empty for invalid range', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.rangeByRank(3, 1)).toEqual([])
    })

    it('returns empty for empty map', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.rangeByRank(1, 3)).toEqual([])
    })

    it('clamps to valid range', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      const range = rm.rangeByRank(0, 10)
      expect(range.length).toBe(2)
    })

    it('returns full range', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      expect(rm.rangeByRank(1, 3).length).toBe(3)
    })
  })

  describe('betweenRanks', () => {
    it('is alias for rangeByRank', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      expect(rm.betweenRanks(1, 2)).toEqual(rm.rangeByRank(1, 2))
    })
  })

  describe('rangeByScore', () => {
    it('returns entries within score range', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      rm.set('d', 4, 400)
      rm.set('e', 5, 500)
      const range = rm.rangeByScore(200, 400)
      expect(range).toEqual([
        { key: 'd', value: 4, score: 400 },
        { key: 'c', value: 3, score: 300 },
        { key: 'b', value: 2, score: 200 },
      ])
    })

    it('returns single entry for exact score', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      const range = rm.rangeByScore(200, 200)
      expect(range).toEqual([{ key: 'b', value: 2, score: 200 }])
    })

    it('returns empty for no matching scores', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      expect(rm.rangeByScore(300, 400)).toEqual([])
    })

    it('returns empty for empty map', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.rangeByScore(0, 100)).toEqual([])
    })

    it('handles full range', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      expect(rm.rangeByScore(50, 350).length).toBe(3)
    })

    it('works with ascending comparator', () => {
      const rm = new RankedMap<string, number>({ compareScores: (a, b) => a - b })
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 300)
      const range = rm.rangeByScore(100, 200)
      expect(range).toEqual([
        { key: 'a', value: 1, score: 100 },
        { key: 'b', value: 2, score: 200 },
      ])
    })
  })

  describe('size/isEmpty/clear', () => {
    it('tracks size through operations', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.size).toBe(0)
      rm.set('a', 1, 100)
      expect(rm.size).toBe(1)
      rm.set('b', 2, 200)
      expect(rm.size).toBe(2)
      rm.set('a', 3, 300)
      expect(rm.size).toBe(2)
      rm.delete('a')
      expect(rm.size).toBe(1)
      rm.delete('missing')
      expect(rm.size).toBe(1)
      rm.clear()
      expect(rm.size).toBe(0)
    })

    it('isEmpty reflects state', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.isEmpty()).toBe(true)
      rm.set('a', 1, 100)
      expect(rm.isEmpty()).toBe(false)
      rm.delete('a')
      expect(rm.isEmpty()).toBe(true)
    })

    it('clear empties map', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.clear()
      expect(rm.isEmpty()).toBe(true)
      expect(rm.size).toBe(0)
      expect(rm.get('a')).toBeUndefined()
    })

    it('allows reuse after clear', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.clear()
      rm.set('b', 2, 200)
      expect(rm.size).toBe(1)
      expect(rm.get('b')).toEqual({ value: 2, score: 200 })
    })

    it('clear empty map is safe', () => {
      const rm = new RankedMap<string, number>()
      rm.clear()
      expect(rm.isEmpty()).toBe(true)
    })
  })

  describe('keys/values/entries', () => {
    it('keys returns keys in rank order', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      expect(rm.keys()).toEqual(['b', 'a', 'c'])
    })

    it('values returns values in rank order', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      expect(rm.values()).toEqual([2, 1, 3])
    })

    it('entries returns entries in rank order', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      expect(rm.entries()).toEqual([
        { key: 'b', value: 2, score: 200 },
        { key: 'a', value: 1, score: 100 },
        { key: 'c', value: 3, score: 50 },
      ])
    })

    it('returns empty arrays for empty map', () => {
      const rm = new RankedMap<string, number>()
      expect(rm.keys()).toEqual([])
      expect(rm.values()).toEqual([])
      expect(rm.entries()).toEqual([])
    })
  })

  describe('iteration', () => {
    it('iterates with Symbol.iterator in rank order', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      rm.set('c', 3, 50)
      const result = [...rm]
      expect(result).toEqual([
        { key: 'b', value: 2, score: 200 },
        { key: 'a', value: 1, score: 100 },
        { key: 'c', value: 3, score: 50 },
      ])
    })

    it('iterates empty map', () => {
      const rm = new RankedMap<string, number>()
      expect([...rm]).toEqual([])
    })

    it('works with for of', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 200)
      const keys: string[] = []
      for (const entry of rm) {
        keys.push(entry.key)
      }
      expect(keys).toEqual(['b', 'a'])
    })
  })

  describe('tie-breaking by insertion order', () => {
    it('breaks ties by insertion order (first inserted ranks higher)', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 100)
      rm.set('c', 3, 100)
      expect(rm.getRank('a')).toBe(1)
      expect(rm.getRank('b')).toBe(2)
      expect(rm.getRank('c')).toBe(3)
    })

    it('maintains insertion order after score update to same score', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      rm.set('b', 2, 100)
      rm.updateScore('a', 200)
      rm.updateScore('a', 100)
      expect(rm.getRank('a')).toBe(1)
      expect(rm.getRank('b')).toBe(2)
    })

    it('handles mixed scores and ties', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 200)
      rm.set('b', 2, 100)
      rm.set('c', 3, 100)
      rm.set('d', 4, 300)
      expect(rm.getRank('d')).toBe(1)
      expect(rm.getRank('a')).toBe(2)
      expect(rm.getRank('b')).toBe(3)
      expect(rm.getRank('c')).toBe(4)
    })
  })

  describe('edge cases', () => {
    it('handles single element operations', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, 100)
      expect(rm.getByRank(1)).toEqual({ key: 'a', value: 1, score: 100 })
      expect(rm.getRank('a')).toBe(1)
      expect(rm.topK(1)).toEqual([{ key: 'a', value: 1, score: 100 }])
      expect(rm.bottomK(1)).toEqual([{ key: 'a', value: 1, score: 100 }])
    })

    it('handles empty string key', () => {
      const rm = new RankedMap<string, number>()
      rm.set('', 0, 100)
      expect(rm.get('')).toEqual({ value: 0, score: 100 })
      expect(rm.has('')).toBe(true)
    })

    it('handles number keys', () => {
      const rm = new RankedMap<number, string>()
      rm.set(0, 'zero', 100)
      rm.set(-1, 'neg', 200)
      expect(rm.get(0)).toEqual({ value: 'zero', score: 100 })
      expect(rm.get(-1)).toEqual({ value: 'neg', score: 200 })
    })

    it('handles very large scores', () => {
      const rm = new RankedMap<string, number>()
      rm.set('a', 1, Number.MAX_SAFE_INTEGER)
      rm.set('b', 2, Number.MIN_SAFE_INTEGER)
      expect(rm.getByRank(1)?.key).toBe('a')
      expect(rm.getByRank(2)?.key).toBe('b')
    })

    it('handles many duplicate scores', () => {
      const rm = new RankedMap<string, number>()
      for (let i = 0; i < 100; i++) {
        rm.set(`k${i}`, i, 50)
      }
      expect(rm.size).toBe(100)
      expect(rm.getByRank(1)?.score).toBe(50)
      expect(rm.getByRank(100)?.score).toBe(50)
    })

    it('handles set-delete-set cycle repeatedly', () => {
      const rm = new RankedMap<string, number>()
      for (let round = 0; round < 10; round++) {
        rm.set('a', round, round * 100)
        expect(rm.size).toBe(1)
        expect(rm.get('a')).toEqual({ value: round, score: round * 100 })
        rm.delete('a')
        expect(rm.size).toBe(0)
      }
    })
  })

  describe('stress tests', () => {
    it('handles 1000 insertions', () => {
      const rm = new RankedMap<number, string>()
      for (let i = 0; i < 1000; i++) {
        rm.set(i, `v${i}`, Math.random() * 10000)
      }
      expect(rm.size).toBe(1000)
    })

    it('handles 1000 sequential insertions and getByRank', () => {
      const rm = new RankedMap<number, string>()
      for (let i = 0; i < 1000; i++) {
        rm.set(i, `v${i}`, i)
      }
      expect(rm.getByRank(1)?.score).toBe(999)
      expect(rm.getByRank(1000)?.score).toBe(0)
    })

    it('handles 1000 insertions and deletions', () => {
      const rm = new RankedMap<number, string>()
      for (let i = 0; i < 1000; i++) rm.set(i, `v${i}`, i)
      for (let i = 0; i < 500; i++) rm.delete(i)
      expect(rm.size).toBe(500)
      expect(rm.getByRank(1)?.score).toBe(999)
      expect(rm.getByRank(500)?.score).toBe(500)
    })

    it('handles random operations', () => {
      const rm = new RankedMap<number, number>()
      const reference = new Map<number, number>()
      for (let i = 0; i < 500; i++) {
        const key = Math.floor(Math.random() * 200)
        const score = Math.floor(Math.random() * 1000)
        const op = Math.random()
        if (op < 0.7) {
          rm.set(key, score, score)
          reference.set(key, score)
        } else {
          rm.delete(key)
          reference.delete(key)
        }
      }
      expect(rm.size).toBe(reference.size)
      for (const [k, v] of reference) {
        expect(rm.get(k)).toEqual({ value: v, score: v })
      }
    })

    it('handles large number of updateScore calls', () => {
      const rm = new RankedMap<number, number>()
      for (let i = 0; i < 200; i++) rm.set(i, i, i)
      for (let i = 0; i < 200; i++) {
        rm.updateScore(i, 200 - i)
      }
      expect(rm.getByRank(1)?.key).toBe(0)
      expect(rm.getByRank(200)?.key).toBe(199)
    })

    it('handles topK and bottomK on large map', () => {
      const rm = new RankedMap<number, number>()
      for (let i = 0; i < 1000; i++) rm.set(i, i, i)
      const top10 = rm.topK(10)
      const bottom10 = rm.bottomK(10)
      expect(top10.length).toBe(10)
      expect(bottom10.length).toBe(10)
      expect(top10[0]!.score).toBe(999)
      expect(bottom10[0]!.score).toBe(9)
    })

    it('handles rangeByScore on large map', () => {
      const rm = new RankedMap<number, number>()
      for (let i = 0; i < 1000; i++) rm.set(i, i, i)
      const range = rm.rangeByScore(400, 600)
      expect(range.length).toBe(201)
      expect(range[0]!.score).toBe(600)
      expect(range[range.length - 1]!.score).toBe(400)
    })

    it('handles rangeByRank on large map', () => {
      const rm = new RankedMap<number, number>()
      for (let i = 0; i < 1000; i++) rm.set(i, i, i)
      const range = rm.rangeByRank(100, 200)
      expect(range.length).toBe(101)
    })

    it('handles insert then delete all', () => {
      const rm = new RankedMap<number, number>()
      for (let i = 0; i < 500; i++) rm.set(i, i, i)
      for (let i = 0; i < 500; i++) rm.delete(i)
      expect(rm.isEmpty()).toBe(true)
    })

    it('handles reverse order deletion', () => {
      const rm = new RankedMap<number, number>()
      for (let i = 0; i < 200; i++) rm.set(i, i, i)
      for (let i = 199; i >= 0; i--) rm.delete(i)
      expect(rm.isEmpty()).toBe(true)
    })

    it('handles alternating insert and delete', () => {
      const rm = new RankedMap<number, number>()
      for (let i = 0; i < 100; i++) {
        rm.set(i, i, i)
        if (i > 0) rm.delete(i - 1)
      }
      expect(rm.size).toBe(1)
      expect(rm.getByRank(1)?.key).toBe(99)
    })

    it('getByRank and getRank consistency on large map', () => {
      const rm = new RankedMap<number, number>()
      for (let i = 0; i < 500; i++) rm.set(i, i, i)
      for (let rank = 1; rank <= 500; rank++) {
        const entry = rm.getByRank(rank)!
        expect(rm.getRank(entry.key)).toBe(rank)
      }
    })

    it('handles clear and reuse with large data', () => {
      const rm = new RankedMap<number, number>()
      for (let i = 0; i < 500; i++) rm.set(i, i, i)
      rm.clear()
      expect(rm.isEmpty()).toBe(true)
      for (let i = 0; i < 500; i++) rm.set(i, i, i * 2)
      expect(rm.size).toBe(500)
      expect(rm.getByRank(1)?.score).toBe(998)
    })
  })
})
