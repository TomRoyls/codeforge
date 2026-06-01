import { describe, expect, it } from 'vitest'
import { MatrixChainMultiply } from '../../src/utils/matrix-chain-multiply.js'

describe('MatrixChainMultiply', () => {
  it('minCost for single matrix is 0', () => {
    expect(MatrixChainMultiply.minCost([10, 20]).cost).toBe(0)
  })

  it('minCost for two matrices', () => {
    expect(MatrixChainMultiply.minCost([10, 20, 30]).cost).toBe(6000)
  })

  it('minCost for classic example', () => {
    const result = MatrixChainMultiply.minCost([10, 30, 5, 60])
    expect(result.cost).toBe(4500)
  })

  it('minCost for empty dims', () => {
    expect(MatrixChainMultiply.minCost([]).cost).toBe(0)
  })

  it('minCost for larger chain', () => {
    const result = MatrixChainMultiply.minCost([40, 20, 30, 10, 30])
    expect(result.cost).toBe(26000)
  })

  it('optimalOrder for two matrices', () => {
    expect(MatrixChainMultiply.optimalOrder([10, 20, 30])).toBe('(A0 × A1)')
  })

  it('optimalOrder for single matrix', () => {
    expect(MatrixChainMultiply.optimalOrder([10, 20])).toBe('A0')
  })

  it('optimalOrder for empty', () => {
    expect(MatrixChainMultiply.optimalOrder([])).toBe('')
  })

  it('optimalOrder for three matrices', () => {
    const order = MatrixChainMultiply.optimalOrder([10, 30, 5, 60])
    expect(order).toContain('A0')
    expect(order).toContain('A1')
    expect(order).toContain('A2')
  })

  it('matrixMultiply computes correct product', () => {
    const a = [[1, 2], [3, 4]]
    const b = [[5, 6], [7, 8]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result).toEqual([[19, 22], [43, 50]])
  })

  it('matrixMultiply handles non-square', () => {
    const a = [[1, 2, 3]]
    const b = [[4], [5], [6]]
    expect(MatrixChainMultiply.matrixMultiply(a, b)).toEqual([[32]])
  })

  it('minCost returns splits array', () => {
    const result = MatrixChainMultiply.minCost([10, 20, 30, 40])
    expect(result.splits.length).toBeGreaterThan(0)
  })

  it('matrixMultiply identity', () => {
    const a = [[1, 0], [0, 1]]
    const b = [[5, 6], [7, 8]]
    expect(MatrixChainMultiply.matrixMultiply(a, b)).toEqual([[5, 6], [7, 8]])
  })

  it('minCost for 5 matrices', () => {
    const result = MatrixChainMultiply.minCost([30, 35, 15, 5, 10, 20])
    expect(result.cost).toBe(11875)
  })

  it('minCost for 3 matrices', () => {
    const result = MatrixChainMultiply.minCost([10, 30, 5, 60])
    expect(result.cost).toBe(4500)
  })
})
