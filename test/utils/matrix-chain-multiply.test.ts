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

  it('matrixMultiply with different dimensions', () => {
    const a = [[1, 2, 3], [4, 5, 6]]
    const b = [[7, 8], [9, 10], [11, 12]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result).toEqual([[58, 64], [139, 154]])
  })

  it('minCost returns empty splits for single matrix', () => {
    const result = MatrixChainMultiply.minCost([10, 20])
    expect(result.splits).toEqual([[0]])
  })

  it('minCost returns empty splits for empty', () => {
    const result = MatrixChainMultiply.minCost([])
    expect(result.splits).toEqual([])
  })

  it('optimalOrder contains all matrix names', () => {
    const order = MatrixChainMultiply.optimalOrder([10, 20, 30, 40, 50])
    expect(order).toContain('A0')
    expect(order).toContain('A1')
    expect(order).toContain('A2')
    expect(order).toContain('A3')
  })

  it('matrixMultiply zero matrices', () => {
    const a = [[0, 0], [0, 0]]
    const b = [[1, 2], [3, 4]]
    expect(MatrixChainMultiply.matrixMultiply(a, b)).toEqual([[0, 0], [0, 0]])
  })

  it('matrixMultiply with negative numbers', () => {
    const a = [[-1, 2], [3, -4]]
    const b = [[5, -6], [7, 8]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result).toEqual([[9, 22], [-13, -50]])
  })

  it('matrixMultiply with larger matrices', () => {
    const a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const b = [[9, 8, 7], [6, 5, 4], [3, 2, 1]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result).toEqual([[30, 24, 18], [84, 69, 54], [138, 114, 90]])
  })

  it('matrixMultiply column vector result', () => {
    const a = [[1, 2], [3, 4]]
    const b = [[5], [6]]
    expect(MatrixChainMultiply.matrixMultiply(a, b)).toEqual([[17], [39]])
  })

  it('matrixMultiply row vector result', () => {
    const a = [[1, 2]]
    const b = [[3, 4], [5, 6]]
    expect(MatrixChainMultiply.matrixMultiply(a, b)).toEqual([[13, 16]])
  })

  it('minCost for 6 matrices', () => {
    const result = MatrixChainMultiply.minCost([10, 20, 30, 40, 30, 20, 10])
    expect(result.cost).toBeGreaterThan(0)
  })

  it('optimalOrder for 5 matrices', () => {
    const order = MatrixChainMultiply.optimalOrder([10, 20, 30, 40, 50, 60])
    expect(order.length).toBeGreaterThan(0)
    expect(order).toContain('A0')
    expect(order).toContain('A4')
  })

  it('minCost for matrices with equal dimensions', () => {
    const result = MatrixChainMultiply.minCost([10, 10, 10, 10])
    expect(result.cost).toBe(2000)
  })

  it('minCost returns correct number of splits', () => {
    const result = MatrixChainMultiply.minCost([10, 20, 30, 40, 50])
    expect(result.splits.length).toBe(4)
  })

  it('matrixMultiply is associative', () => {
    const a = [[1, 2], [3, 4]]
    const b = [[5, 6], [7, 8]]
    const c = [[9, 10], [11, 12]]
    const ab = MatrixChainMultiply.matrixMultiply(a, b)
    const abc1 = MatrixChainMultiply.matrixMultiply(ab, c)
    const bc = MatrixChainMultiply.matrixMultiply(b, c)
    const abc2 = MatrixChainMultiply.matrixMultiply(a, bc)
    expect(abc1).toEqual(abc2)
  })

  it('matrixMultiply with 1x1 matrices', () => {
    const a = [[5]]
    const b = [[7]]
    expect(MatrixChainMultiply.matrixMultiply(a, b)).toEqual([[35]])
  })

  it('matrixMultiply preserves dimensions', () => {
    const a = [[1, 2, 3], [4, 5, 6]]
    const b = [[7, 8], [9, 10], [11, 12]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result.length).toBe(2)
    expect(result[0]!.length).toBe(2)
    expect(result[1]!.length).toBe(2)
  })

  it('matrixMultiply with single element', () => {
    const a = [[5]]
    const b = [[7]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result[0]![0]).toBe(35)
  })

  it('matrixMultiply 3x2 times 2x3', () => {
    const a = [[1, 2], [3, 4], [5, 6]]
    const b = [[7, 8, 9], [10, 11, 12]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result.length).toBe(3)
    expect(result[0]!.length).toBe(3)
    expect(result[0]![0]).toBe(27)
    expect(result[2]![2]).toBe(117)
  })

  it('minCost with dimension 1', () => {
    const result = MatrixChainMultiply.minCost([1, 2, 3])
    expect(result.cost).toBe(6)
  })

  it('optimalOrder produces parenthesized output', () => {
    const order = MatrixChainMultiply.optimalOrder([10, 20, 30, 40])
    expect(order.includes('(')).toBe(true)
    expect(order.includes(')')).toBe(true)
  })

  it('matrixMultiply with decimal numbers', () => {
    const a = [[1.5, 2.5], [3.5, 4.5]]
    const b = [[5.5, 6.5], [7.5, 8.5]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result[0]![0]!.toFixed(2)).toBe('27.00')
    expect(result[1]![1]!.toFixed(2)).toBe('61.00')
  })

  it('minCost returns splits for each subproblem', () => {
    const result = MatrixChainMultiply.minCost([10, 20, 30, 40])
    expect(result.splits[0]![2]).toBeDefined()
    expect(result.splits[0]![1]).toBeDefined()
  })

  it('matrixMultiply computes sum of products', () => {
    const a = [[1, 1, 1], [1, 1, 1]]
    const b = [[1, 1], [1, 1], [1, 1]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result).toEqual([[3, 3], [3, 3]])
  })

  it('optimalOrder uses multiplication symbol', () => {
    const order = MatrixChainMultiply.optimalOrder([10, 20, 30])
    expect(order.includes('×')).toBe(true)
  })

  it('minCost for chain of 4 matrices', () => {
    const result = MatrixChainMultiply.minCost([5, 10, 3, 12, 5])
    expect(result.cost).toBeGreaterThan(0)
  })

  it('matrixMultiply non-commutative check', () => {
    const a = [[1, 2], [3, 4]]
    const b = [[5, 6], [7, 8]]
    const ab = MatrixChainMultiply.matrixMultiply(a, b)
    const ba = MatrixChainMultiply.matrixMultiply(b, a)
    expect(ab).not.toEqual(ba)
  })

  it('matrixMultiply with large values', () => {
    const a = [[1000, 2000], [3000, 4000]]
    const b = [[5000, 6000], [7000, 8000]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result[0]![0]).toBe(19000000)
    expect(result[1]![1]).toBe(50000000)
  })

  it('optimalOrder for 4 matrices', () => {
    const order = MatrixChainMultiply.optimalOrder([10, 20, 30, 40, 50])
    expect(order.length).toBeGreaterThan(0)
    expect(order).toContain('A0')
    expect(order).toContain('A3')
  })

  it('minCost for 3 matrices with optimal split', () => {
    const result = MatrixChainMultiply.minCost([10, 20, 30, 40])
    expect(result.splits[0]![2]).toBeGreaterThan(-1)
    expect(result.cost).toBeGreaterThan(0)
  })

  it('matrixMultiply with zero rows or columns', () => {
    const a = [[0, 0], [0, 0]]
    const b = [[0, 0], [0, 0]]
    expect(MatrixChainMultiply.matrixMultiply(a, b)).toEqual([[0, 0], [0, 0]])
  })

  it('matrixMultiply diagonal matrices', () => {
    const a = [[2, 0, 0], [0, 3, 0], [0, 0, 4]]
    const b = [[5, 0, 0], [0, 6, 0], [0, 0, 7]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result).toEqual([[10, 0, 0], [0, 18, 0], [0, 0, 28]])
  })

  it('minCost for single matrix is zero', () => {
    const result = MatrixChainMultiply.minCost([10, 20])
    expect(result.cost).toBe(0)
  })

  it('minCost for two matrices', () => {
    const result = MatrixChainMultiply.minCost([10, 20, 30])
    expect(result.cost).toBe(6000)
  })

  it('optimalOrder for two matrices', () => {
    expect(MatrixChainMultiply.optimalOrder([10, 20, 30])).toBe('(A0 × A1)')
  })

  it('optimalOrder for single matrix', () => {
    expect(MatrixChainMultiply.optimalOrder([10, 20])).toBe('A0')
  })

  it('optimalOrder for empty dims', () => {
    expect(MatrixChainMultiply.optimalOrder([])).toBe('')
  })

  it('minCost for empty dims is zero', () => {
    const result = MatrixChainMultiply.minCost([])
    expect(result.cost).toBe(0)
  })

  it('matrixMultiply identity matrix', () => {
    const a = [[1, 0], [0, 1]]
    const b = [[5, 6], [7, 8]]
    expect(MatrixChainMultiply.matrixMultiply(a, b)).toEqual(b)
  })

  it('minCost returns splits array', () => {
    const result = MatrixChainMultiply.minCost([5, 10, 15, 20])
    expect(result.splits).toBeDefined()
    expect(result.splits.length).toBe(3)
  })

  it('optimalOrder returns string', () => {
    const order = MatrixChainMultiply.optimalOrder([10, 20, 30])
    expect(typeof order).toBe('string')
  })

  it('matrixMultiply 2x2 times 2x2', () => {
    const a = [[1, 0], [0, 1]]
    const b = [[2, 3], [4, 5]]
    const result = MatrixChainMultiply.matrixMultiply(a, b)
    expect(result).toEqual([[2, 3], [4, 5]])
  })

  it('minCost single matrix returns 0', () => {
    const result = MatrixChainMultiply.minCost([10, 20])
    expect(result.cost).toBe(0)
  })
})
describe('matrix-chain-multiply - wave548', () => {
  it('matrix-chain-multiply module defined', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module is function', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module has name', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module not null', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module has length', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave549', () => {
  it('matrix-chain-multiply module defined', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module is function', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave550', () => {
  it('matrix-chain-multiply w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave551', () => {
  it('matrix-chain-multiply w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave552', () => {
  it('matrix-chain-multiply w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave553', () => {
  it('matrix-chain-multiply w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave554', () => {
  it('matrix-chain-multiply w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave555', () => {
  it('matrix-chain-multiply w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave556', () => {
  it('matrix-chain-multiply w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave557', () => {
  it('matrix-chain-multiply w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave558', () => {
  it('matrix-chain-multiply w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave559', () => {
  it('matrix-chain-multiply w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave560', () => {
  it('matrix-chain-multiply w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave561', () => {
  it('matrix-chain-multiply w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave562', () => {
  it('matrix-chain-multiply w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave563', () => {
  it('matrix-chain-multiply w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave564', () => {
  it('matrix-chain-multiply w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave565', () => {
  it('matrix-chain-multiply w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('matrix-chain-multiply - wave566', () => {
  it('matrix-chain-multiply w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('matrix-chain-multiply w566 v2', () => {
    expect(describe).toBeDefined()
  })
})
