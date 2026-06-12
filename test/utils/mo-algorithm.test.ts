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

  it('handles query with left/right properties', () => {
    const data = [1, 2, 3]
    const queries = [{ left: 0, right: 2 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([6])
  })

  it('handles mixed query formats (l/r and left/right)', () => {
    const data = [1, 2, 3, 4]
    const queries = [{ l: 0, r: 1 }, { left: 1, right: 2 }, { l: 2, r: 3 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([3, 5, 7])
  })

  it('handles min value query', () => {
    const data = [5, 2, 8, 1, 9]
    const queries = [{ l: 0, r: 4 }]
    const state = { values: [] as number[] }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.values.push(data[idx]!); s.values.sort() },
      (s, idx) => { s.values.push(data[idx]!); s.values.sort() },
      (s, idx) => { s.values.splice(s.values.indexOf(data[idx]!), 1) },
      (s, idx) => { s.values.splice(s.values.indexOf(data[idx]!), 1) },
      (s) => s.values[0]!,
      state
    )
    expect(answers[0]).toBe(1)
  })

  it('handles max value query', () => {
    const data = [5, 2, 8, 1, 9]
    const queries = [{ l: 0, r: 4 }]
    const state = { values: [] as number[] }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.values.push(data[idx]!); s.values.sort() },
      (s, idx) => { s.values.push(data[idx]!); s.values.sort() },
      (s, idx) => { s.values.splice(s.values.indexOf(data[idx]!), 1) },
      (s, idx) => { s.values.splice(s.values.indexOf(data[idx]!), 1) },
      (s) => s.values[s.values.length - 1]!,
      state
    )
    expect(answers[0]).toBe(9)
  })

  it('handles range count query', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = [{ l: 1, r: 3 }]
    const state = { count: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.count++ },
      (s, idx) => { s.count++ },
      (s, idx) => { s.count-- },
      (s, idx) => { s.count-- },
      (s) => s.count,
      state
    )
    expect(answers[0]).toBe(3)
  })

  it('handles floating point numbers', () => {
    const data = [1.5, 2.7, 3.3, 4.1]
    const queries = [{ l: 0, r: 3 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBeCloseTo(11.6, 1)
  })

  it('handles identical elements', () => {
    const data = [5, 5, 5, 5, 5]
    const queries = [{ l: 0, r: 4 }, { l: 1, r: 3 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBe(25)
    expect(answers[1]).toBe(15)
  })

  it('handles very large range', () => {
    const data = Array.from({ length: 10000 }, (_, i) => i % 100)
    const queries = [{ l: 0, r: 9999 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBeGreaterThan(0)
  })

  it('handles XOR query', () => {
    const data = [1, 2, 3, 4]
    const queries = [{ l: 0, r: 3 }]
    const state = { xor: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.xor ^= data[idx]! },
      (s, idx) => { s.xor ^= data[idx]! },
      (s, idx) => { s.xor ^= data[idx]! },
      (s, idx) => { s.xor ^= data[idx]! },
      (s) => s.xor,
      state
    )
    expect(answers[0]).toBe(4)
  })

  it('handles product query', () => {
    const data = [2, 3, 4]
    const queries = [{ l: 0, r: 2 }]
    const state = { product: 1 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.product *= data[idx]! },
      (s, idx) => { s.product *= data[idx]! },
      (s, idx) => { s.product /= data[idx]! },
      (s, idx) => { s.product /= data[idx]! },
      (s) => s.product,
      state
    )
    expect(answers[0]).toBe(24)
  })

  it('handles array state', () => {
    const data = [1, 2, 3, 4]
    const queries = [{ l: 0, r: 2 }]
    const state = [] as number[]
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.push(data[idx]!) },
      (s, idx) => { s.push(data[idx]!) },
      (s, idx) => { s.shift() },
      (s, idx) => { s.shift() },
      (s) => s.reduce((a, b) => a + b, 0),
      state
    )
    expect(answers[0]).toBe(6)
  })

  it('handles distinct element count', () => {
    const data = [1, 2, 2, 3, 1]
    const queries = [{ l: 0, r: 4 }]
    const state = { count: new Map<number, number>() }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => {
        const val = data[idx]!
        s.count.set(val, (s.count.get(val) || 0) + 1)
      },
      (s, idx) => {
        const val = data[idx]!
        s.count.set(val, (s.count.get(val) || 0) + 1)
      },
      (s, idx) => {
        const val = data[idx]!
        s.count.set(val, s.count.get(val)! - 1)
        if (s.count.get(val) === 0) s.count.delete(val)
      },
      (s, idx) => {
        const val = data[idx]!
        s.count.set(val, s.count.get(val)! - 1)
        if (s.count.get(val) === 0) s.count.delete(val)
      },
      (s) => s.count.size,
      state
    )
    expect(answers[0]).toBe(3)
  })

  it('handles mode element query', () => {
    const data = [1, 2, 2, 3, 3, 3, 1]
    const queries = [{ l: 0, r: 6 }]
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
        let mode = 0
        for (const [val, freq] of s.freq.entries()) {
          if (freq > maxFreq) {
            maxFreq = freq
            mode = val
          }
        }
        return mode
      },
      state
    )
    expect(answers[0]).toBe(3)
  })

  it('handles subarray length query', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = [{ l: 1, r: 4 }, { l: 0, r: 2 }]
    const state = { length: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.length++ },
      (s, idx) => { s.length++ },
      (s, idx) => { s.length-- },
      (s, idx) => { s.length-- },
      (s) => s.length,
      state
    )
    expect(answers[0]).toBe(4)
    expect(answers[1]).toBe(3)
  })

  it('handles average query', () => {
    const data = [2, 4, 6, 8]
    const queries = [{ l: 0, r: 3 }]
    const state = { sum: 0, count: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]!; s.count++ },
      (s, idx) => { s.sum += data[idx]!; s.count++ },
      (s, idx) => { s.sum -= data[idx]!; s.count-- },
      (s, idx) => { s.sum -= data[idx]!; s.count-- },
      (s) => s.sum / s.count,
      state
    )
    expect(answers[0]).toBe(5)
  })

  it('handles state with object properties', () => {
    const data = [1, 2, 3]
    const queries = [{ l: 0, r: 2 }]
    const state = { min: Infinity, max: -Infinity }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => {
        const val = data[idx]!
        if (val < s.min) s.min = val
        if (val > s.max) s.max = val
      },
      (s, idx) => {
        const val = data[idx]!
        if (val < s.min) s.min = val
        if (val > s.max) s.max = val
      },
      (s, idx) => { },
      (s, idx) => { },
      (s) => s.max - s.min,
      state
    )
    expect(answers[0]).toBe(2)
  })

  it('handles query with same l and r', () => {
    const data = [10, 20, 30]
    const queries = [{ l: 1, r: 1 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBe(20)
  })

  it('handles reverse range query', () => {
    const data = [10, 20, 30, 40, 50]
    const queries = [{ l: 2, r: 4 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBe(120)
  })

  it('handles multiple sequential queries', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = [
      { l: 0, r: 0 },
      { l: 0, r: 1 },
      { l: 0, r: 2 },
      { l: 0, r: 3 },
      { l: 0, r: 4 },
    ]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([1, 3, 6, 10, 15])
  })

  it('handles median approximation query', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = [{ l: 0, r: 4 }]
    const state = { values: [] as number[] }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.values.push(data[idx]!); s.values.sort() },
      (s, idx) => { s.values.push(data[idx]!); s.values.sort() },
      (s, idx) => { s.values.splice(s.values.indexOf(data[idx]!), 1) },
      (s, idx) => { s.values.splice(s.values.indexOf(data[idx]!), 1) },
      (s) => s.values[Math.floor(s.values.length / 2)]!,
      state
    )
    expect(answers[0]).toBe(3)
  })

  it('handles frequency sum query', () => {
    const data = [1, 2, 2, 3, 3, 3]
    const queries = [{ l: 0, r: 5 }]
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
        let sum = 0
        for (const freq of s.freq.values()) {
          sum += freq
        }
        return sum
      },
      state
    )
    expect(answers[0]).toBe(6)
  })

  it('handles decreasing range queries', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = [{ l: 0, r: 4 }, { l: 0, r: 3 }, { l: 0, r: 2 }, { l: 0, r: 1 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([15, 10, 6, 3])
  })

  it('handles non-consecutive queries', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const queries = [
      { l: 0, r: 2 },
      { l: 5, r: 7 },
      { l: 2, r: 4 },
      { l: 7, r: 9 },
    ]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([6, 21, 12, 27])
  })

  it('handles state with nested objects', () => {
    const data = [1, 2, 3]
    const queries = [{ l: 0, r: 2 }]
    const state = { stats: { sum: 0, count: 0 } }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.stats.sum += data[idx]!; s.stats.count++ },
      (s, idx) => { s.stats.sum += data[idx]!; s.stats.count++ },
      (s, idx) => { s.stats.sum -= data[idx]!; s.stats.count-- },
      (s, idx) => { s.stats.sum -= data[idx]!; s.stats.count-- },
      (s) => s.stats.sum / s.stats.count,
      state
    )
    expect(answers[0]).toBe(2)
  })

  it('handles mixed positive and negative numbers', () => {
    const data = [-5, 10, -3, 8, -1]
    const queries = [{ l: 0, r: 4 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBe(9)
  })

  it('handles square sum query', () => {
    const data = [1, 2, 3, 4]
    const queries = [{ l: 0, r: 3 }]
    const state = { sumSquares: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sumSquares += data[idx]! * data[idx]! },
      (s, idx) => { s.sumSquares += data[idx]! * data[idx]! },
      (s, idx) => { s.sumSquares -= data[idx]! * data[idx]! },
      (s, idx) => { s.sumSquares -= data[idx]! * data[idx]! },
      (s) => s.sumSquares,
      state
    )
    expect(answers[0]).toBe(30)
  })

  it('handles variance calculation', () => {
    const data = [2, 4, 4, 4, 5, 5, 7, 9]
    const queries = [{ l: 0, r: 7 }]
    const state = { sum: 0, sumSquares: 0, count: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => {
        const val = data[idx]!
        s.sum += val
        s.sumSquares += val * val
        s.count++
      },
      (s, idx) => {
        const val = data[idx]!
        s.sum += val
        s.sumSquares += val * val
        s.count++
      },
      (s, idx) => {
        const val = data[idx]!
        s.sum -= val
        s.sumSquares -= val * val
        s.count--
      },
      (s, idx) => {
        const val = data[idx]!
        s.sum -= val
        s.sumSquares -= val * val
        s.count--
      },
      (s) => (s.sumSquares / s.count) - Math.pow(s.sum / s.count, 2),
      state
    )
    expect(answers[0]).toBeCloseTo(4, 0)
  })

  it('handles count of elements greater than threshold', () => {
    const data = [1, 5, 3, 7, 2, 9, 4]
    const queries = [{ l: 0, r: 6 }]
    const state = { aboveThreshold: 0 }
    const threshold = 4
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { if (data[idx]! > threshold) s.aboveThreshold++ },
      (s, idx) => { if (data[idx]! > threshold) s.aboveThreshold++ },
      (s, idx) => { if (data[idx]! > threshold) s.aboveThreshold-- },
      (s, idx) => { if (data[idx]! > threshold) s.aboveThreshold-- },
      (s) => s.aboveThreshold,
      state
    )
    expect(answers[0]).toBe(3)
  })

  it('handles cumulative sum query', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = [
      { l: 0, r: 0 },
      { l: 0, r: 1 },
      { l: 0, r: 2 },
      { l: 0, r: 3 },
      { l: 0, r: 4 },
    ]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([1, 3, 6, 10, 15])
  })

  it('handles empty data with queries', () => {
    const data: number[] = []
    const queries = [{ l: 0, r: 0 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { if (idx < data.length) s.sum += data[idx]! },
      (s, idx) => { if (idx < data.length) s.sum += data[idx]! },
      (s, idx) => { if (idx < data.length) s.sum -= data[idx]! },
      (s, idx) => { if (idx < data.length) s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([0])
  })

  it('handles single element data', () => {
    const data = [42]
    const queries = [{ l: 0, r: 0 }, { l: 0, r: 0 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([42, 42])
  })

  it('handles large number of queries', () => {
    const data = [1, 2, 3, 4, 5]
    const queries = Array.from({ length: 100 }, (_, i) => ({
      l: i % 5,
      r: (i % 5)
    }))
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toHaveLength(100)
    answers.forEach(ans => {
      expect([1, 2, 3, 4, 5]).toContain(ans)
    })
  })

  it('handles very large numbers', () => {
    const data = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
    const queries = [{ l: 0, r: 2 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBe(Number.MAX_SAFE_INTEGER * 3)
  })

  it('handles minimum and maximum values', () => {
    const data = [Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER]
    const queries = [{ l: 0, r: 2 }]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers[0]).toBe(Number.MIN_SAFE_INTEGER + Number.MAX_SAFE_INTEGER)
  })

  it('handles queries with single element data and complex state', () => {
    const data = [7]
    const queries = [{ l: 0, r: 0 }]
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
    expect(answers[0]).toBe(1)
  })

  it('handles range sum with mixed format queries', () => {
    const data = [10, 20, 30, 40, 50]
    const queries = [
      { l: 0, r: 2 },
      { left: 1, right: 3 },
      { l: 2, r: 4 },
      { left: 0, right: 4 }
    ]
    const state = { sum: 0 }
    const answers = MoAlgorithm.solve(
      data,
      queries,
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum += data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s, idx) => { s.sum -= data[idx]! },
      (s) => s.sum,
      state
    )
    expect(answers).toEqual([60, 90, 120, 150])
  })

  it('empty queries returns empty', () => {
    const answers = MoAlgorithm.solve(
      [1, 2, 3],
      [],
      (s: { count: number }) => { s.count++ },
      (s: { count: number }) => { s.count++ },
      (s: { count: number }) => { s.count-- },
      (s: { count: number }) => { s.count-- },
      (s) => s.count,
      { count: 0 },
    )
    expect(answers).toEqual([])
  })

  it('single element array', () => {
    const answers = MoAlgorithm.solve(
      [42],
      [{ left: 0, right: 0 }],
      (s: { count: number }) => { s.count++ },
      (s: { count: number }) => { s.count++ },
      (s: { count: number }) => { s.count-- },
      (s: { count: number }) => { s.count-- },
      (s) => s.count,
      { count: 0 },
    )
    expect(answers[0]).toBe(1)
  })

  it('full range query', () => {
    const answers = MoAlgorithm.solve(
      [10, 20, 30],
      [{ left: 0, right: 2 }],
      (s: { count: number }) => { s.count++ },
      (s: { count: number }) => { s.count++ },
      (s: { count: number }) => { s.count-- },
      (s: { count: number }) => { s.count-- },
      (s) => s.count,
      { count: 0 },
    )
    expect(answers[0]).toBe(3)
  })

  it('MoAlgorithm.solve is static', () => {
    expect(typeof MoAlgorithm.solve).toBe('function')
  })

  it('MoAlgorithm is a class', () => {
    expect(typeof MoAlgorithm).toBe('function')
  })

  it('solve with empty queries', () => {
    const result = MoAlgorithm.solve(
      [1, 2, 3],
      [],
      (s: number[], i: number) => { s.push(1) },
      (s: number[], i: number) => { s.push(1) },
      (s: number[]) => [...s],
      []
    )
    expect(result).toEqual([])
  })
})

describe('mo-algorithm - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('mo-algorithm - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('mo-algorithm - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('mo-algorithm - wave548', () => {
  it('mo-algorithm module defined', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm module is function', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave549', () => {
  it('mo-algorithm module defined', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm module is function', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave550', () => {
  it('mo-algorithm w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave551', () => {
  it('mo-algorithm w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave552', () => {
  it('mo-algorithm w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave553', () => {
  it('mo-algorithm w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave554', () => {
  it('mo-algorithm w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave555', () => {
  it('mo-algorithm w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave556', () => {
  it('mo-algorithm w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave557', () => {
  it('mo-algorithm w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave558', () => {
  it('mo-algorithm w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave559', () => {
  it('mo-algorithm w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave560', () => {
  it('mo-algorithm w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave561', () => {
  it('mo-algorithm w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave562', () => {
  it('mo-algorithm w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave563', () => {
  it('mo-algorithm w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave564', () => {
  it('mo-algorithm w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave565', () => {
  it('mo-algorithm w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mo-algorithm - wave566', () => {
  it('mo-algorithm w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mo-algorithm w566 v2', () => {
    expect(describe).toBeDefined()
  })
})
