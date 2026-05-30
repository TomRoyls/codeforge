import { describe, it, expect } from 'vitest'
import { MoAlgorithm } from '../../../src/utils/mo-algorithm.js'

describe('MoAlgorithm', () => {
  describe('range sum queries', () => {
    it('computes range sums', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const queries = [
        { l: 0, r: 4 },
        { l: 5, r: 9 },
        { l: 0, r: 9 },
      ]
      const state = { sum: 0 }
      const answers = MoAlgorithm.solve(
        data, queries,
        (s, idx) => { s.sum += data[idx]! },
        (s, idx) => { s.sum += data[idx]! },
        (s, idx) => { s.sum -= data[idx]! },
        (s, idx) => { s.sum -= data[idx]! },
        (s) => s.sum,
        state,
      )
      expect(answers[0]).toBe(15)
      expect(answers[1]).toBe(40)
      expect(answers[2]).toBe(55)
    })

    it('handles single element queries', () => {
      const data = [10, 20, 30]
      const queries = [{ l: 1, r: 1 }]
      const state = { sum: 0 }
      const answers = MoAlgorithm.solve(
        data, queries,
        (s, idx) => { s.sum += data[idx]! },
        (s, idx) => { s.sum += data[idx]! },
        (s, idx) => { s.sum -= data[idx]! },
        (s, idx) => { s.sum -= data[idx]! },
        (s) => s.sum,
        state,
      )
      expect(answers[0]).toBe(20)
    })
  })

  describe('range frequency', () => {
    it('counts distinct elements', () => {
      const data = [1, 2, 1, 3, 2, 1, 4]
      const queries = [
        { l: 0, r: 6 },
        { l: 0, r: 2 },
      ]
      const freq = new Map<number, number>()
      const state = { distinct: 0 }
      const add = (s: typeof state, idx: number) => {
        const val = data[idx]!
        const old = freq.get(val) ?? 0
        if (old === 0) s.distinct++
        freq.set(val, old + 1)
      }
      const remove = (s: typeof state, idx: number) => {
        const val = data[idx]!
        const old = freq.get(val)!
        if (old === 1) s.distinct--
        freq.set(val, old - 1)
      }
      const answers = MoAlgorithm.solve(
        data, queries,
        add, add, remove, remove,
        (s) => s.distinct,
        state,
      )
      expect(answers[0]).toBe(4)
      expect(answers[1]).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles empty queries', () => {
      const answers = MoAlgorithm.solve(
        [1, 2, 3], [],
        () => {}, () => {}, () => {}, () => {},
        () => 0,
        { sum: 0 },
      )
      expect(answers).toEqual([])
    })

    it('handles single element array', () => {
      const data = [42]
      const queries = [{ l: 0, r: 0 }]
      const state = { sum: 0 }
      const answers = MoAlgorithm.solve(
        data, queries,
        (s, idx) => { s.sum += data[idx]! },
        (s, idx) => { s.sum += data[idx]! },
        (s, idx) => { s.sum -= data[idx]! },
        (s, idx) => { s.sum -= data[idx]! },
        (s) => s.sum,
        state,
      )
      expect(answers[0]).toBe(42)
    })
  })
})
