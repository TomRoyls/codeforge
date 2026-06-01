import { describe, expect, it } from 'vitest'
import { PowerSet } from '../../src/utils/power-set.js'

describe('PowerSet', () => {
  it('generates power set of [1,2]', () => {
    const result = PowerSet.generate([1, 2])
    expect(result).toEqual([[], [1], [2], [1, 2]])
  })

  it('generates power set of [1,2,3]', () => {
    const result = PowerSet.generate([1, 2, 3])
    expect(result.length).toBe(8)
    expect(result).toContainEqual([])
    expect(result).toContainEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(PowerSet.generate([])).toEqual([[]])
  })

  it('handles single element', () => {
    expect(PowerSet.generate([42])).toEqual([[], [42]])
  })

  it('count returns 2^n', () => {
    expect(PowerSet.count(0)).toBe(1)
    expect(PowerSet.count(3)).toBe(8)
    expect(PowerSet.count(10)).toBe(1024)
  })

  it('lazy generates same results', () => {
    const eager = PowerSet.generate([1, 2, 3])
    const lazy = [...PowerSet.lazy([1, 2, 3])]
    expect(lazy).toEqual(eager)
  })

  it('bySize groups subsets by size', () => {
    const bySize = PowerSet.bySize([1, 2])
    expect(bySize.get(0)).toEqual([[]])
    expect(bySize.get(1)!.length).toBe(2)
    expect(bySize.get(2)).toEqual([[1, 2]])
  })

  it('all subsets are unique', () => {
    const result = PowerSet.generate([1, 2, 3, 4])
    const strings = result.map(s => s.join(','))
    expect(new Set(strings).size).toBe(result.length)
  })

  it('bySize covers all subsets', () => {
    const bySize = PowerSet.bySize([1, 2, 3])
    let total = 0
    for (const subsets of bySize.values()) total += subsets.length
    expect(total).toBe(8)
  })

  it('handles strings', () => {
    const result = PowerSet.generate(['a', 'b'])
    expect(result.length).toBe(4)
    expect(result).toContainEqual(['a', 'b'])
  })

  it('order matches binary counting', () => {
    const result = PowerSet.generate([1, 2, 3])
    expect(result[0]).toEqual([])
    expect(result[7]).toEqual([1, 2, 3])
    expect(result[3]).toEqual([1, 2])
  })

  it('bySize size distribution is binomial', () => {
    const bySize = PowerSet.bySize([1, 2, 3, 4])
    expect(bySize.get(0)!.length).toBe(1)
    expect(bySize.get(1)!.length).toBe(4)
    expect(bySize.get(2)!.length).toBe(6)
    expect(bySize.get(3)!.length).toBe(4)
    expect(bySize.get(4)!.length).toBe(1)
  })

  it('lazy yields correct count', () => {
    let count = 0
    for (const _ of PowerSet.lazy([1, 2, 3])) count++
    expect(count).toBe(8)
  })

  it('includes all individual elements', () => {
    const result = PowerSet.generate(['a', 'b', 'c'])
    expect(result).toContainEqual(['a'])
    expect(result).toContainEqual(['b'])
    expect(result).toContainEqual(['c'])
  })

  it('bySize returns empty map for empty array', () => {
    const bySize = PowerSet.bySize([])
    expect(bySize.get(0)).toEqual([[]])
  })

  it('bySize returns correct sizes for 3 elements', () => {
    const bySize = PowerSet.bySize(['x', 'y', 'z'])
    expect(bySize.get(1)!.length).toBe(3)
    expect(bySize.get(2)!.length).toBe(3)
  })

  it('handles empty set', () => {
    expect(PowerSet.generate([])).toEqual([[]])
  })
})
