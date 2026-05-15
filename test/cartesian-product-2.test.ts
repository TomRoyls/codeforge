import { describe, it, expect } from 'vitest'
import { CartesianProduct2 } from '../src/core/cartesian-product-2/index.js'

describe('CartesianProduct2', () => {
  describe('empty input', () => {
    it('handles empty sets array', () => {
      const cp = new CartesianProduct2<number>([])
      expect(cp.size()).toBe(0)
      expect(cp.dimensions()).toBe(0)
      expect(cp.at(0)).toBe(undefined)
      expect(cp.toArray()).toEqual([])
    })
  })

  describe('empty inner arrays', () => {
    it('handles set with empty inner array', () => {
      const cp = new CartesianProduct2<number>([[], [1, 2]])
      expect(cp.size()).toBe(0)
      expect(cp.at(0)).toBe(undefined)
      expect(cp.toArray()).toEqual([])
    })

    it('handles multiple empty inner arrays', () => {
      const cp = new CartesianProduct2<number>([[], []])
      expect(cp.size()).toBe(0)
      expect(cp.at(0)).toBe(undefined)
    })
  })

  describe('single set', () => {
    it('computes product of single set', () => {
      const cp = new CartesianProduct2<number>([[1, 2, 3]])
      expect(cp.size()).toBe(3)
      expect(cp.dimensions()).toBe(1)
      expect(cp.at(0)).toEqual([1])
      expect(cp.at(1)).toEqual([2])
      expect(cp.at(2)).toEqual([3])
    })

    it('toArray for single set', () => {
      const cp = new CartesianProduct2<number>([[1, 2, 3]])
      expect(cp.toArray()).toEqual([[1], [2], [3]])
    })

    it('forEach for single set', () => {
      const cp = new CartesianProduct2<number>([[1, 2, 3]])
      const results: number[][] = []
      cp.forEach((element) => {
        results.push(element)
      })
      expect(results).toEqual([[1], [2], [3]])
    })
  })

  describe('two sets', () => {
    it('computes product of two sets', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.size()).toBe(4)
      expect(cp.dimensions()).toBe(2)
      expect(cp.at(0)).toEqual([1, 3])
      expect(cp.at(1)).toEqual([2, 3])
      expect(cp.at(2)).toEqual([1, 4])
      expect(cp.at(3)).toEqual([2, 4])
    })

    it('toArray for two sets', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.toArray()).toEqual([
        [1, 3],
        [2, 3],
        [1, 4],
        [2, 4]
      ])
    })
  })

  describe('three sets', () => {
    it('computes product of three sets', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4], [5, 6]])
      expect(cp.size()).toBe(8)
      expect(cp.dimensions()).toBe(3)
      expect(cp.at(0)).toEqual([1, 3, 5])
      expect(cp.at(1)).toEqual([2, 3, 5])
      expect(cp.at(2)).toEqual([1, 4, 5])
      expect(cp.at(3)).toEqual([2, 4, 5])
      expect(cp.at(4)).toEqual([1, 3, 6])
      expect(cp.at(5)).toEqual([2, 3, 6])
      expect(cp.at(6)).toEqual([1, 4, 6])
      expect(cp.at(7)).toEqual([2, 4, 6])
    })

    it('indexOf for three sets', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4], [5, 6]])
      expect(cp.indexOf([1, 3, 5])).toBe(0)
      expect(cp.indexOf([2, 3, 5])).toBe(1)
      expect(cp.indexOf([1, 4, 5])).toBe(2)
      expect(cp.indexOf([2, 4, 5])).toBe(3)
      expect(cp.indexOf([1, 3, 6])).toBe(4)
      expect(cp.indexOf([2, 3, 6])).toBe(5)
      expect(cp.indexOf([1, 4, 6])).toBe(6)
      expect(cp.indexOf([2, 4, 6])).toBe(7)
    })
  })

  describe('at with valid index', () => {
    it('returns element at valid index', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4, 5]])
      expect(cp.at(0)).toEqual([1, 3])
      expect(cp.at(2)).toEqual([1, 4])
      expect(cp.at(5)).toEqual([2, 5])
    })
  })

  describe('at with invalid index', () => {
    it('returns undefined for negative index', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.at(-1)).toBe(undefined)
    })

    it('returns undefined for index greater than size', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.at(4)).toBe(undefined)
      expect(cp.at(100)).toBe(undefined)
    })
  })

  describe('indexOf', () => {
    it('finds index of existing element', () => {
      const cp = new CartesianProduct2<number>([[1, 2, 3], [4, 5]])
      expect(cp.indexOf([1, 4])).toBe(0)
      expect(cp.indexOf([2, 4])).toBe(1)
      expect(cp.indexOf([3, 4])).toBe(2)
      expect(cp.indexOf([1, 5])).toBe(3)
      expect(cp.indexOf([2, 5])).toBe(4)
      expect(cp.indexOf([3, 5])).toBe(5)
    })

    it('returns -1 for non-existing element', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.indexOf([5, 6])).toBe(-1)
      expect(cp.indexOf([1, 6])).toBe(-1)
    })

    it('returns -1 for element with wrong dimensions', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.indexOf([1])).toBe(-1)
      expect(cp.indexOf([1, 2, 3])).toBe(-1)
    })
  })

  describe('size', () => {
    it('calculates correct size for multiple sets', () => {
      const cp1 = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp1.size()).toBe(4)

      const cp2 = new CartesianProduct2<number>([[1, 2, 3], [4, 5, 6]])
      expect(cp2.size()).toBe(9)

      const cp3 = new CartesianProduct2<number>([[1], [2], [3]])
      expect(cp3.size()).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing element', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.has([1, 3])).toBe(true)
      expect(cp.has([2, 4])).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.has([5, 6])).toBe(false)
      expect(cp.has([1, 6])).toBe(false)
    })

    it('returns false for element with wrong dimensions', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.has([1])).toBe(false)
      expect(cp.has([1, 2, 3])).toBe(false)
    })
  })

  describe('dimensions', () => {
    it('returns number of sets', () => {
      const cp1 = new CartesianProduct2<number>([[1, 2]])
      expect(cp1.dimensions()).toBe(1)

      const cp2 = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp2.dimensions()).toBe(2)

      const cp3 = new CartesianProduct2<number>([[1, 2], [3, 4], [5, 6]])
      expect(cp3.dimensions()).toBe(3)
    })
  })

  describe('toArray', () => {
    it('returns all combinations', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      const result = cp.toArray()
      expect(result).toEqual([
        [1, 3],
        [2, 3],
        [1, 4],
        [2, 4]
      ])
      expect(result.length).toBe(4)
    })
  })

  describe('forEach', () => {
    it('iterates all combinations', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      const results: number[][] = []
      const indices: number[] = []

      cp.forEach((element, index) => {
        results.push(element)
        indices.push(index)
      })

      expect(results).toEqual([
        [1, 3],
        [2, 3],
        [1, 4],
        [2, 4]
      ])
      expect(indices).toEqual([0, 1, 2, 3])
    })
  })

  describe('single element sets', () => {
    it('handles sets with single elements', () => {
      const cp = new CartesianProduct2<number>([[1], [2], [3]])
      expect(cp.size()).toBe(1)
      expect(cp.at(0)).toEqual([1, 2, 3])
      expect(cp.indexOf([1, 2, 3])).toBe(0)
      expect(cp.has([1, 2, 3])).toBe(true)
    })
  })

  describe('larger combinations', () => {
    it('handles larger cartesian product', () => {
      const cp = new CartesianProduct2<number>([[1, 2, 3], [4, 5, 6], [7, 8]])
      expect(cp.size()).toBe(18)
      expect(cp.at(0)).toEqual([1, 4, 7])
      expect(cp.at(17)).toEqual([3, 6, 8])
    })

    it('handles mixed size sets', () => {
      const cp = new CartesianProduct2<number>([[1], [2, 3], [4, 5, 6]])
      expect(cp.size()).toBe(6)
      expect(cp.at(0)).toEqual([1, 2, 4])
      expect(cp.at(5)).toEqual([1, 3, 6])
    })

    it('indexOf and at are inverses', () => {
      const cp = new CartesianProduct2<number>([[1, 2, 3], [4, 5], [6, 7, 8, 9]])
      const size = cp.size()
      for (let i = 0; i < size; i++) {
        const element = cp.at(i)!
        const index = cp.indexOf(element)
        expect(index).toBe(i)
      }
    })
  })

  describe('additional coverage', () => {
    it('should handle empty sets', () => {
      const cp = new CartesianProduct2<number>([])
      expect(cp.size()).toBe(0)
      expect(cp.dimensions()).toBe(0)
      expect(cp.at(0)).toBeUndefined()
    })

    it('should handle set with empty sub-array', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [], [3]])
      expect(cp.size()).toBe(0)
    })

    it('should handle forEach iteration', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      const results: number[][] = []
      cp.forEach(el => results.push(el))
      expect(results).toHaveLength(4)
      expect(results).toContainEqual([1, 3])
      expect(results).toContainEqual([2, 4])
    })

    it('should handle has for non-existent element', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.has([1, 3])).toBe(true)
      expect(cp.has([5, 6])).toBe(false)
      expect(cp.has([1])).toBe(false)
    })

    it('should handle toArray', () => {
      const cp = new CartesianProduct2<string>([['a', 'b'], ['x']])
      const arr = cp.toArray()
      expect(arr).toHaveLength(2)
      expect(arr).toContainEqual(['a', 'x'])
      expect(arr).toContainEqual(['b', 'x'])
    })

    it('should handle dimensions', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4], [5, 6]])
      expect(cp.dimensions()).toBe(3)
    })

    it('should handle size', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.size()).toBe(4)
    })

    it('should handle forEach', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3]])
      let count = 0
      cp.forEach(() => count++)
      expect(count).toBe(2)
    })

    it('should handle has', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3, 4]])
      expect(cp.has([1, 3])).toBe(true)
      expect(cp.has([1, 5])).toBe(false)
    })

    it('should handle toArray', () => {
      const cp = new CartesianProduct2<number>([[1, 2], [3]])
      const arr = cp.toArray()
      expect(arr).toHaveLength(2)
      expect(arr[0]).toHaveLength(2)
      expect(arr[1]).toHaveLength(2)
    })

    it('should handle empty dimensions', () => {
      const cp = new CartesianProduct2<number>([])
      expect(cp.size()).toBe(0)
    })
  })
})
