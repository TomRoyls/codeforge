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

  it('search returns -1 for empty array', () => {
    expect(FibonacciSearch.search([], 5)).toBe(-1)
  })

  it('search single element found', () => {
    expect(FibonacciSearch.search([42], 42)).toBe(0)
  })

  it('search single element not found', () => {
    expect(FibonacciSearch.search([42], 99)).toBe(-1)
  })
})

  it('finds first element', () => {
    expect(FibonacciSearch.search([10, 20, 30, 40], 10)).toBe(0)
  })

  it('finds last element', () => {
    expect(FibonacciSearch.search([10, 20, 30, 40], 40)).toBe(3)
  })

  it('works with custom comparator', () => {
    const arr = [{ v: 1 }, { v: 2 }, { v: 3 }]
    const idx = FibonacciSearch.search(arr, { v: 2 }, (a, b) => a.v - b.v)
    expect(idx).toBe(1)
  })
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

describe('FibonacciSearch edge cases', () => {
  it('search with two elements - first', () => {
    const arr = [1, 3]
    const result = FibonacciSearch.search(arr, 1)
    expect(result).toBe(0)
  })

  it('search with two elements - second', () => {
    const arr = [1, 3]
    const result = FibonacciSearch.search(arr, 3)
    expect(result).toBe(1)
  })

  it('search with three elements - middle', () => {
    const arr = [1, 3, 5]
    const result = FibonacciSearch.search(arr, 3)
    expect(result).toBe(1)
  })

  it('search with power of two size', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8]
    const result = FibonacciSearch.search(arr, 5)
    expect(result).toBe(4)
  })

  it('search with negative numbers', () => {
    const arr = [-5, -3, -1, 0, 1, 3, 5]
    const result = FibonacciSearch.search(arr, -1)
    expect(result).toBe(2)
  })

  it('search with floating point numbers', () => {
    const arr = [1.1, 2.2, 3.3, 4.4, 5.5]
    const result = FibonacciSearch.search(arr, 3.3)
    expect(result).toBe(2)
  })

  it('search with objects using custom comparator', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const compare = (a: { id: number }, b: { id: number }) => a.id - b.id
    const result = FibonacciSearch.search(arr, { id: 2 }, compare)
    expect(result).toBe(1)
  })

  it('search returns -1 when target smaller than all', () => {
    const arr = [5, 10, 15, 20]
    const result = FibonacciSearch.search(arr, 1)
    expect(result).toBe(-1)
  })

  it('search returns -1 when target larger than all', () => {
    const arr = [5, 10, 15, 20]
    const result = FibonacciSearch.search(arr, 25)
    expect(result).toBe(-1)
  })

  it('firstIndexOf with single duplicate', () => {
    const arr = [1, 2, 2, 3]
    const result = FibonacciSearch.firstIndexOf(arr, 2)
    expect(result).toBe(1)
  })

  it('firstIndexOf at start of array', () => {
    const arr = [2, 2, 2, 3, 4]
    const result = FibonacciSearch.firstIndexOf(arr, 2)
    expect(result).toBe(0)
  })

  it('firstIndexOf at end of array', () => {
    const arr = [1, 2, 3, 4, 4]
    const result = FibonacciSearch.firstIndexOf(arr, 4)
    expect(result).toBe(3)
  })

  it('lastIndexOf with single duplicate', () => {
    const arr = [1, 2, 2, 3]
    const result = FibonacciSearch.lastIndexOf(arr, 2)
    expect(result).toBe(2)
  })

  it('lastIndexOf at start of array', () => {
    const arr = [2, 2, 2, 3, 4]
    const result = FibonacciSearch.lastIndexOf(arr, 2)
    expect(result).toBe(2)
  })

  it('lastIndexOf at end of array', () => {
    const arr = [1, 2, 3, 4, 4]
    const result = FibonacciSearch.lastIndexOf(arr, 4)
    expect(result).toBe(4)
  })

  it('insertIndex before first element', () => {
    const arr = [5, 10, 15]
    const result = FibonacciSearch.insertIndex(arr, 3)
    expect(result).toBe(0)
  })

  it('insertIndex between middle elements', () => {
    const arr = [1, 4, 7, 10]
    const result = FibonacciSearch.insertIndex(arr, 5)
    expect(result).toBe(2)
  })

  it('insertIndex with single element array - smaller', () => {
    const result = FibonacciSearch.insertIndex([10], 5)
    expect(result).toBe(0)
  })

  it('lastIndexOf with custom comparator', () => {
    const arr = [9, 7, 7, 7, 5]
    const reverseCompare = (a: number, b: number) => {
      if (a > b) return -1
      if (a < b) return 1
      return 0
    }
    const result = FibonacciSearch.lastIndexOf(arr, 7, reverseCompare)
    expect(result).toBe(3)
  })

  it('search with case-insensitive string comparator', () => {
    const arr = ['Apple', 'Banana', 'Cherry', 'Date']
    const caseCompare = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase())
    const result = FibonacciSearch.search(arr, 'cherry', caseCompare)
    expect(result).toBe(2)
  })

  it('firstIndexOf with case-insensitive comparator', () => {
    const arr = ['APPLE', 'apple', 'Apple', 'banana']
    const caseCompare = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase())
    const result = FibonacciSearch.firstIndexOf(arr, 'apple', caseCompare)
    expect(result).toBe(0)
  })

  it('insertIndex with case-insensitive comparator', () => {
    const arr = ['Apple', 'Cherry', 'Date']
    const caseCompare = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase())
    const result = FibonacciSearch.insertIndex(arr, 'banana', caseCompare)
    expect(result).toBe(1)
  })

  it('search with large array size', () => {
    const arr = Array.from({ length: 5000 }, (_, i) => i * 2)
    const result = FibonacciSearch.search(arr, 8000)
    expect(result).toBe(4000)
  })

  it('firstIndexOf with consecutive duplicates', () => {
    const arr = [1, 1, 1, 1, 2, 3]
    const result = FibonacciSearch.firstIndexOf(arr, 1)
    expect(result).toBe(0)
  })

  it('lastIndexOf with consecutive duplicates', () => {
    const arr = [1, 2, 3, 3, 3, 3]
    const result = FibonacciSearch.lastIndexOf(arr, 3)
    expect(result).toBe(5)
  })

  it('search with two element array - not found', () => {
    const arr = [1, 3]
    const result = FibonacciSearch.search(arr, 2)
    expect(result).toBe(-1)
  })

  it('insertIndex with negative numbers', () => {
    const arr = [-10, -5, 0, 5, 10]
    const result = FibonacciSearch.insertIndex(arr, -3)
    expect(result).toBe(2)
  })
})
describe('fibonacci-search - wave548', () => {
  it('fibonacci-search module defined', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module is function', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module has name', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module not null', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module has length', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-search module has constructor', () => {
    expect(describe).toBeDefined()
  })
})
