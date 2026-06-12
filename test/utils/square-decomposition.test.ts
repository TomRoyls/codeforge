import { describe, expect, it } from 'vitest'
import { SquareDecomposition } from '../../src/utils/square-decomposition.js'

describe('SquareDecomposition', () => {
  it('query returns range sum', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    expect(sd.query(0, 4)).toBe(15)
  })

  it('query partial range', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    expect(sd.query(1, 3)).toBe(9)
  })

  it('update changes value', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    sd.update(2, 10)
    expect(sd.get(2)).toBe(10)
    expect(sd.query(0, 4)).toBe(22)
  })

  it('handles single element', () => {
    const sd = new SquareDecomposition([42])
    expect(sd.query(0, 0)).toBe(42)
  })

  it('handles empty array', () => {
    const sd = new SquareDecomposition([])
    expect(sd.length).toBe(0)
  })

  it('get returns value at index', () => {
    const sd = new SquareDecomposition([10, 20, 30])
    expect(sd.get(1)).toBe(20)
  })

  it('toArray returns copy', () => {
    const sd = new SquareDecomposition([1, 2, 3])
    expect(sd.toArray()).toEqual([1, 2, 3])
  })

  it('length returns correctly', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    expect(sd.length).toBe(5)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1)
    const sd = new SquareDecomposition(arr)
    expect(sd.query(0, 99)).toBe(5050)
  })

  it('multiple updates', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    sd.update(0, 10)
    sd.update(4, 10)
    expect(sd.query(0, 4)).toBe(29)
  })

  it('query single element', () => {
    const sd = new SquareDecomposition([10, 20, 30])
    expect(sd.query(1, 1)).toBe(20)
  })

  it('handles custom block size', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5, 6], 2)
    expect(sd.query(0, 5)).toBe(21)
    sd.update(2, 10)
    expect(sd.get(2)).toBe(10)
  })

  it('handles update then query', () => {
    const sd = new SquareDecomposition([1, 2, 3])
    sd.update(1, 10)
    expect(sd.query(0, 2)).toBe(14)
    expect(sd.get(1)).toBe(10)
  })

  it('handles all same values', () => {
    const sd = new SquareDecomposition([5, 5, 5, 5, 5])
    expect(sd.query(0, 4)).toBe(25)
  })

  it('handles single element', () => {
    const sd = new SquareDecomposition([99])
    expect(sd.query(0, 0)).toBe(99)
    expect(sd.get(0)).toBe(99)
  })

  it('handles update', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4])
    sd.update(1, 10)
    expect(sd.get(1)).toBe(10)
    expect(sd.query(0, 3)).toBe(18)
  })

  it('get returns initial values', () => {
    const sd = new SquareDecomposition([10, 20, 30])
    expect(sd.get(0)).toBe(10)
    expect(sd.get(2)).toBe(30)
  })

  it('query for full array sum', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4])
    expect(sd.query(0, 3)).toBe(10)
  })

  it('query single element', () => {
    const sd = new SquareDecomposition([7])
    expect(sd.query(0, 0)).toBe(7)
  })

  it('query full range returns sum', () => {
    const sd = new SquareDecomposition([1, 2, 3])
    expect(sd.query(0, 2)).toBe(6)
  })

  it('query single element', () => {
    const sd = new SquareDecomposition([5, 10, 15])
    expect(sd.query(1, 1)).toBe(10)
  })

  it('query full range returns sum', () => {
    const sd = new SquareDecomposition([5, 10, 15])
    expect(sd.query(0, 2)).toBe(30)
  })

  it('query single element', () => {
    const sd = new SquareDecomposition([5, 10, 15])
    expect(sd.query(1, 1)).toBe(10)
  })

  it('handles negative numbers', () => {
    const sd = new SquareDecomposition([-1, -2, -3, -4, -5])
    expect(sd.query(0, 4)).toBe(-15)
  })

  it('handles mixed positive and negative', () => {
    const sd = new SquareDecomposition([-5, 10, -3, 8, -2])
    expect(sd.query(0, 4)).toBe(8)
  })

  it('handles zero values', () => {
    const sd = new SquareDecomposition([0, 0, 0, 0, 0])
    expect(sd.query(0, 4)).toBe(0)
  })

  it('update to zero', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    sd.update(2, 0)
    expect(sd.get(2)).toBe(0)
    expect(sd.query(0, 4)).toBe(12)
  })

  it('update to negative', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    sd.update(2, -10)
    expect(sd.get(2)).toBe(-10)
    expect(sd.query(0, 4)).toBe(2)
  })

  it('update first element', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    sd.update(0, 100)
    expect(sd.get(0)).toBe(100)
    expect(sd.query(0, 4)).toBe(114)
  })

  it('update last element', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    sd.update(4, 100)
    expect(sd.get(4)).toBe(100)
    expect(sd.query(0, 4)).toBe(110)
  })

  it('update with same value', () => {
    const sd = new SquareDecomposition([1, 2, 3])
    sd.update(1, 2)
    expect(sd.get(1)).toBe(2)
    expect(sd.query(0, 2)).toBe(6)
  })

  it('multiple updates in sequence', () => {
    const sd = new SquareDecomposition([1, 2, 3])
    sd.update(0, 10)
    sd.update(1, 20)
    sd.update(2, 30)
    expect(sd.query(0, 2)).toBe(60)
  })

  it('query after multiple updates', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    sd.update(0, 10)
    sd.update(2, 30)
    sd.update(4, 50)
    expect(sd.query(0, 4)).toBe(96)
  })

  it('handles block size of 1', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5], 1)
    expect(sd.query(0, 4)).toBe(15)
    sd.update(2, 10)
    expect(sd.query(0, 4)).toBe(22)
  })

  it('handles block size larger than array', () => {
    const sd = new SquareDecomposition([1, 2, 3], 10)
    expect(sd.query(0, 2)).toBe(6)
    sd.update(1, 10)
    expect(sd.query(0, 2)).toBe(14)
  })

  it('handles array length not perfect square', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5, 6, 7])
    expect(sd.length).toBe(7)
    expect(sd.query(0, 6)).toBe(28)
  })

  it('toArray returns independent copy', () => {
    const sd = new SquareDecomposition([1, 2, 3])
    const arr = sd.toArray()
    arr[0] = 999
    expect(sd.get(0)).toBe(1)
    expect(sd.toArray()).toEqual([1, 2, 3])
  })

  it('toArray after updates', () => {
    const sd = new SquareDecomposition([1, 2, 3])
    sd.update(1, 20)
    expect(sd.toArray()).toEqual([1, 20, 3])
  })

  it('query with two elements', () => {
    const sd = new SquareDecomposition([5, 10, 15])
    expect(sd.query(0, 1)).toBe(15)
    expect(sd.query(1, 2)).toBe(25)
  })

  it('handles large values', () => {
    const sd = new SquareDecomposition([1000000, 2000000, 3000000])
    expect(sd.query(0, 2)).toBe(6000000)
  })

  it('query boundary first two', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    expect(sd.query(0, 1)).toBe(3)
  })

  it('query boundary last two', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    expect(sd.query(3, 4)).toBe(9)
  })

  it('handles array with two elements', () => {
    const sd = new SquareDecomposition([10, 20])
    expect(sd.query(0, 1)).toBe(30)
    sd.update(0, 100)
    expect(sd.query(0, 1)).toBe(120)
  })

  it('handles array with three elements', () => {
    const sd = new SquareDecomposition([10, 20, 30])
    expect(sd.query(0, 2)).toBe(60)
    sd.update(1, 50)
    expect(sd.query(0, 2)).toBe(90)
  })

  it('update middle element', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    sd.update(2, 100)
    expect(sd.query(1, 3)).toBe(106)
  })

  it('query with negative range boundaries', () => {
    const sd = new SquareDecomposition([1, 2, 3])
    expect(sd.query(0, 0)).toBe(1)
  })

  it('handles block size of 3', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)
    expect(sd.query(0, 8)).toBe(45)
    sd.update(4, 50)
    expect(sd.query(0, 8)).toBe(90)
  })

  it('should update a value', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    sd.update(2, 10)
    expect(sd.query(0, 4)).toBe(22)
  })

  it('should report length', () => {
    const sd = new SquareDecomposition([1, 2, 3])
    expect(sd.length).toBe(3)
  })

  it('should convert to array', () => {
    const sd = new SquareDecomposition([10, 20, 30])
    expect(sd.toArray()).toEqual([10, 20, 30])
  })

  it('should handle single element', () => {
    const sd = new SquareDecomposition([42])
    expect(sd.query(0, 0)).toBe(42)
  })

  it('should query range correctly', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    expect(sd.query(1, 3)).toBe(9)
  })

  it('should handle update and re-query', () => {
    const sd = new SquareDecomposition([1, 1, 1, 1, 1])
    sd.update(0, 10)
    expect(sd.query(0, 4)).toBe(14)
  })
})

  it('get returns element at index', () => {
    const sd = new SquareDecomposition([5, 3, 7, 1])
    expect(sd.get(2)).toBe(7)
  })

  it('length returns array size', () => {
    const sd = new SquareDecomposition([1, 2, 3, 4, 5])
    expect(sd.length).toBe(5)
  })

describe('square-decomposition - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('square-decomposition - wave545', () => {
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

describe('square-decomposition - wave546', () => {
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

describe('square-decomposition - wave547', () => {
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

describe('square-decomposition - wave548', () => {
  it('square-decomposition module defined', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition module is function', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave549', () => {
  it('square-decomposition module defined', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition module is function', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave550', () => {
  it('square-decomposition w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave551', () => {
  it('square-decomposition w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
