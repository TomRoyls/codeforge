import { describe, expect, it } from 'vitest'
import { CartesianProduct } from '../../src/utils/cartesian-product.js'

describe('CartesianProduct', () => {
  it('generates product of two sets', () => {
    const result = CartesianProduct.generate([1, 2], ['a', 'b'])
    expect(result).toEqual([[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']])
  })

  it('generates product of three sets', () => {
    const result = CartesianProduct.generate([0, 1], [0, 1], [0, 1])
    expect(result.length).toBe(8)
  })

  it('handles empty input (no sets)', () => {
    expect(CartesianProduct.generate()).toEqual([[]])
  })

  it('handles single set', () => {
    const result = CartesianProduct.generate([1, 2, 3])
    expect(result).toEqual([[1], [2], [3]])
  })

  it('handles empty set in product', () => {
    expect(CartesianProduct.generate([1, 2], [])).toEqual([])
  })

  it('count returns correct product', () => {
    expect(CartesianProduct.count(2, 3, 4)).toBe(24)
    expect(CartesianProduct.count()).toBe(1)
  })

  it('lazy generates same results as eager', () => {
    const eager = CartesianProduct.generate([1, 2], ['a', 'b'])
    const lazy = [...CartesianProduct.lazy([1, 2], ['a', 'b'])]
    expect(lazy).toEqual(eager)
  })

  it('withRepeat generates k-tuples from set', () => {
    const result = CartesianProduct.withRepeat([0, 1], 2)
    expect(result).toEqual([[0, 0], [0, 1], [1, 0], [1, 1]])
  })

  it('withRepeat k=0 returns empty tuple', () => {
    expect(CartesianProduct.withRepeat([1, 2], 0)).toEqual([[]])
  })

  it('handles single element sets', () => {
    const result = CartesianProduct.generate([1], [2], [3])
    expect(result).toEqual([[1, 2, 3]])
  })

  it('lazy yields nothing for empty set', () => {
    const result = [...CartesianProduct.lazy([1], [])]
    expect(result).toEqual([])
  })

  it('generates correct count for larger inputs', () => {
    const result = CartesianProduct.generate([1, 2, 3], [4, 5], [6, 7])
    expect(result.length).toBe(12)
  })

  it('withRepeat for k=3 binary', () => {
    const result = CartesianProduct.withRepeat([0, 1], 3)
    expect(result.length).toBe(8)
  })

  it('preserves order', () => {
    const result = CartesianProduct.generate([1, 2], ['a', 'b', 'c'])
    expect(result[0]).toEqual([1, 'a'])
    expect(result[result.length - 1]).toEqual([2, 'c'])
  })

  it('withRepeat single element returns same tuple', () => {
    const result = CartesianProduct.withRepeat([42], 3)
    expect(result).toEqual([[42, 42, 42]])
  })

  it('count matches generate length', () => {
    const result = CartesianProduct.generate([1, 2, 3], [4, 5])
    expect(result.length).toBe(CartesianProduct.count(3, 2))
  })

  it('generate with empty array returns empty', () => {
    expect(CartesianProduct.generate([1, 2], [])).toEqual([])
  })

  it('generate with single element arrays', () => {
    expect(CartesianProduct.generate([1], [2])).toEqual([[1, 2]])
  })

  it('generate with three arrays', () => {
    expect(CartesianProduct.generate([1], [2], [3])).toEqual([[1, 2, 3]])
  })

  it('generate with empty array returns empty', () => {
    expect(CartesianProduct.generate([], [1])).toEqual([])
  })

  it('generate with two arrays', () => {
    const result = CartesianProduct.generate([1, 2], ['a'])
    expect(result.length).toBe(2)
  })

  it('generate with empty array returns empty', () => {
    const result = CartesianProduct.generate([], ['a'])
    expect(result).toEqual([])
  })

  it('generate single element arrays', () => {
    const result = CartesianProduct.generate([1], ['a'])
    expect(result).toEqual([[1, 'a']])
  })
})
