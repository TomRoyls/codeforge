import { describe, it, expect } from 'vitest'
import { MoAlgorithm } from '../../src/utils/mo-algorithm.js'

describe('MoAlgorithm', () => {
  it('handles empty queries array', () => {
    const data = [1, 2, 3, 4, 5]
    const queries: Array<{ l: number; r: number }> = []
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([])
  })

  it('handles single query', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = [{ l: 0, r: 2 }]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([6])
  })

  it('handles multiple queries in order', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = [{ l: 0, r: 0 }, { l: 1, r: 3 }, { l: 2, r: 4 }]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBe(1)
    expect(answers[1]).toBe(9)
    expect(answers[2]).toBe(12)
  })

  it('handles queries that extend to end of array', () => {
    const data = [1, 2, 3]
    const queries = [{ l: 0, r: 2 }]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBe(6)
  })

  it('handles single element queries', () => {
    const data = [5, 10, 15]
    const queries = [{ l: 0, r: 0 }, { l: 1, r: 1 }, { l: 2, r: 2 }]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([5, 10, 15])
  })

  it('handles negative numbers', () => {
    const data = [-1, -2, 3, -4]
    const queries = [{ l: 0, r: 3 }]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBe(-4)
  })

  it('handles zero values', () => {
    const data = [0, 0, 0, 0]
    const queries = [{ l: 0, r: 3 }]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBe(0)
  })

  it('correctly counts elements in state', () => {
    const data = [1, 2, 3, 4]
    const queries = [{ l: 0, r: 1 }, { l: 2, r: 3 }]
    const state = { count: 0, sum: 0 }
    MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.count,
      state
    )
    expect(state.count).toBe(2)
  })

  it('handles large data array', () => {
    const data = Array.from({ length: 1000 }, (_, i) => i)
    const queries = [{ l: 0, r: 999 }, { l: 100, r: 200 }]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    const expectedSum1 = data.slice(0, 1000).reduce((a, b) => a + b, 0)
    const expectedSum2 = data.slice(100, 201).reduce((a, b) => a + b, 0)
    expect(answers[0]).toBe(expectedSum1)
    expect(answers[1]).toBe(expectedSum2)
  })

  it('returns answers in original query order', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = [{ l: 4, r: 4 }, { l: 0, r: 0 }, { l: 2, r: 2 }]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([5, 1, 3])
  })

  it('handles complex state with frequency map', () => {
    const data = [1, 2, 1, 3, 1]
    const queries = [{ l: 0, r: 4 }]
    const state = { freq: new Map<number, number>() }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => {
        const val = data[idx]!
        s.freq.set(val, (s.freq.get(val) || 0) + 1)
      },
      (s, idx) => {
        const val = data[idx]!
        s.freq.set(val, (s.freq.get(val) || 0) + 1)
      },
      (s, idx) => {
        const val = data[idx]!
        s.freq.set(val, s.freq.get(val)! - 1)
        if (s.freq.get(val) === 0) s.freq.delete(val)
      },
      (s, idx) => {
        const val = data[idx]!
        s.freq.set(val, s.freq.get(val)! - 1)
        if (s.freq.get(val) === 0) s.freq.delete(val)
      },
      (s) => {
        let maxFreq = 0
        for (const freq of s.freq.values()) {
          if (freq > maxFreq) maxFreq = freq
        }
        return maxFreq
      },
      state
    )
    expect(answers[0]).toBe(3)
  })

  it('handles duplicate queries', () => {
    const data = [1, 2, 3]
    const queries = [{ l: 0, r: 2 }, { l: 0, r: 2 }, { l: 0, r: 2 }]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([6, 6, 6])
  })

  it('handles unsorted queries', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = [{ l: 3, r: 4 }, { l: 0, r: 1 }, { l: 2, r: 3 }]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([9, 3, 7])
  })

  it('preserves initial state across processing', () => {
    const data = [1, 2, 3]
    const queries = [{ l: 0, r: 1 }]
    const initialState = { multiplier: 10 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { },
      (s, idx) => { },
      (s, idx) => { },
      (s, idx) => { },
      (s) => s.multiplier,
      initialState
    )
    expect(initialState.multiplier).toBe(10)
    expect(answers[0]).toBe(10)
  })

  it('handles many overlapping queries', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const queries = [
      { l: 0, r: 9 },
      { l: 0, r: 4 },
      { l: 5, r: 9 },
      { l: 2, r: 7 },
      { l: 0, r: 0 },
    ]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBe(55)
    expect(answers[1]).toBe(15)
    expect(answers[2]).toBe(40)
    expect(answers[3]).toBe(33)
    expect(answers[4]).toBe(1)
  })

  it('handles adjacent queries efficiently', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = [{ l: 0, r: 2 }, { l: 1, r: 3 }, { l: 2, r: 4 }]
    const state = { count: 0, sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count++; s.sum += data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s, idx) => { s.count--; s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([6, 9, 12])
  })

  it('handles single query', () => {
    const arr = [1, 2, 3, 4, 5]
    const answers = MoAlgorithm.solve(
      arr,
      [{ l: 0, r: 4 }],
      (state, idx) => { state.sum += arr[idx]! },
      (state, idx) => { state.sum += arr[idx]! },
      (state, idx) => { state.sum -= arr[idx]! },
      (state, idx) => { state.sum -= arr[idx]! },
      (state) => state.sum,
      { sum: 0 },
    )
    expect(answers).toEqual([15])
  })
})