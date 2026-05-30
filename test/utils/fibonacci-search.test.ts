import { describe, expect, it } from 'vitest'
import { FibonacciSearch } from '../../src/utils/fibonacci-search.js'

describe('FibonacciSearch search', () => {
  it('search in empty array', () => {
    const result = FibonacciSearch.search([], 5)
    expect(result).toBe(-1)
  })

  it('search single element found', () => {
    const result = FibonacciSearch.search([5], 5)
    expect(result).toBe(0)
  })

  it('search single element not found', () => {
    const result = FibonacciSearch.search([5], 3)
    expect(result).toBe(-1)
  })

  it('search in sorted array', () => {
    const arr = [1, 3, 5, 7, 9, 11, 13, 15]
    const result = FibonacciSearch.search(arr, 7)
    expect(result).toBe(3)
  })

  it('search for first element', () => {
    const arr = [1, 3, 5, 7, 9]
    const result = FibonacciSearch.search(arr, 1)
    expect(result).toBe(0)
  })

  it('search for last element', () => {
    const arr = [1, 3, 5, 7, 9]
    const result = FibonacciSearch.search(arr, 9)
    expect(result).toBe(4)
  })

  it('search for element not present', () => {
    const arr = [1, 3, 5, 7, 9]
    const result = FibonacciSearch.search(arr, 4)
    expect(result).toBe(-1)
  })

  it('search with strings', () => {
    const arr = ['apple', 'banana', 'cherry', 'date', 'elderberry']
    const result = FibonacciSearch.search(arr, 'cherry')
    expect(result).toBe(2)
  })

  it('search with large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i * 2)
    const result = FibonacciSearch.search(arr, 500)
    expect(result).toBe(250)
  })
})

describe('FibonacciSearch firstIndexOf', () => {
  it('finds first occurrence with duplicates', () => {
    const arr = [1, 2, 2, 2, 3, 4]
    const result = FibonacciSearch.firstIndexOf(arr, 2)
    expect(result).toBe(1)
  })

  it('returns -1 for element not present', () => {
    const arr = [1, 2, 3, 4]
    const result = FibonacciSearch.firstIndexOf(arr, 5)
    expect(result).toBe(-1)
  })

  it('handles array with all duplicates', () => {
    const arr = [5, 5, 5, 5, 5]
    const result = FibonacciSearch.firstIndexOf(arr, 5)
    expect(result).toBe(0)
  })
})

describe('FibonacciSearch lastIndexOf', () => {
  it('finds last occurrence with duplicates', () => {
    const arr = [1, 2, 2, 2, 3, 4]
    const result = FibonacciSearch.lastIndexOf(arr, 2)
    expect(result).toBe(3)
  })

  it('returns -1 for element not present', () => {
    const arr = [1, 2, 3, 4]
    const result = FibonacciSearch.lastIndexOf(arr, 5)
    expect(result).toBe(-1)
  })

  it('handles array with all duplicates', () => {
    const arr = [5, 5, 5, 5, 5]
    const result = FibonacciSearch.lastIndexOf(arr, 5)
    expect(result).toBe(4)
  })
})

describe('FibonacciSearch insertIndex', () => {
  it('maintains sorted order for new element', () => {
    const arr = [1, 3, 5, 7, 9]
    const result = FibonacciSearch.insertIndex(arr, 4)
    expect(result).toBe(2)
  })

  it('returns index for existing element', () => {
    const arr = [1, 3, 5, 7, 9]
    const result = FibonacciSearch.insertIndex(arr, 5)
    expect(result).toBe(2)
  })

  it('inserts at beginning for smallest element', () => {
    const arr = [3, 5, 7, 9]
    const result = FibonacciSearch.insertIndex(arr, 1)
    expect(result).toBe(0)
  })

  it('inserts at end for largest element', () => {
    const arr = [1, 3, 5, 7]
    const result = FibonacciSearch.insertIndex(arr, 9)
    expect(result).toBe(4)
  })

  it('handles empty array', () => {
    const result = FibonacciSearch.insertIndex([], 5)
    expect(result).toBe(0)
  })

  it('inserts at first position with duplicates', () => {
    const arr = [1, 3, 3, 3, 5]
    const result = FibonacciSearch.insertIndex(arr, 3)
    expect(result).toBe(1)
  })
})

describe('FibonacciSearch custom comparator', () => {
  it('search with reverse sorted comparator', () => {
    const arr = [9, 7, 5, 3, 1]
    const reverseCompare = (a: number, b: number) => {
      if (a > b) return -1
      if (a < b) return 1
      return 0
    }
    const result = FibonacciSearch.search(arr, 5, reverseCompare)
    expect(result).toBe(2)
  })

  it('firstIndexOf with custom comparator', () => {
    const arr = [9, 7, 7, 7, 5]
    const reverseCompare = (a: number, b: number) => {
      if (a > b) return -1
      if (a < b) return 1
      return 0
    }
    const result = FibonacciSearch.firstIndexOf(arr, 7, reverseCompare)
    expect(result).toBe(1)
  })

  it('insertIndex with reverse sorted', () => {
    const arr = [9, 7, 5, 3, 1]
    const reverseCompare = (a: number, b: number) => {
      if (a > b) return -1
      if (a < b) return 1
      return 0
    }
    const result = FibonacciSearch.insertIndex(arr, 6, reverseCompare)
    expect(result).toBe(2)
  })
})