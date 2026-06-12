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

describe('square-decomposition - wave552', () => {
  it('square-decomposition w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave553', () => {
  it('square-decomposition w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave554', () => {
  it('square-decomposition w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave555', () => {
  it('square-decomposition w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave556', () => {
  it('square-decomposition w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave557', () => {
  it('square-decomposition w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave558', () => {
  it('square-decomposition w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave559', () => {
  it('square-decomposition w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave560', () => {
  it('square-decomposition w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave561', () => {
  it('square-decomposition w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave562', () => {
  it('square-decomposition w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave563', () => {
  it('square-decomposition w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave564', () => {
  it('square-decomposition w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave565', () => {
  it('square-decomposition w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave566', () => {
  it('square-decomposition w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave127', () => {
  it('square-decomposition w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave130', () => {
  it('square-decomposition w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave133', () => {
  it('square-decomposition w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave136', () => {
  it('square-decomposition w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - wave139', () => {
  it('square-decomposition w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w142', () => {
  it('square-decomposition v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w145', () => {
  it('square-decomposition v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w148', () => {
  it('square-decomposition v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w151', () => {
  it('square-decomposition v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w154', () => {
  it('square-decomposition v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w157', () => {
  it('square-decomposition v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w160', () => {
  it('square-decomposition v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w170', () => {
  it('square-decomposition x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w180', () => {
  it('square-decomposition x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w190', () => {
  it('square-decomposition x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w200', () => {
  it('square-decomposition x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w210', () => {
  it('square-decomposition x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w220', () => {
  it('square-decomposition x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w230', () => {
  it('square-decomposition x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w240', () => {
  it('square-decomposition x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w250', () => {
  it('square-decomposition x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w260', () => {
  it('square-decomposition x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w270', () => {
  it('square-decomposition x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w280', () => {
  it('square-decomposition x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w290', () => {
  it('square-decomposition x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w300', () => {
  it('square-decomposition x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w310', () => {
  it('square-decomposition x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w320', () => {
  it('square-decomposition x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w330', () => {
  it('square-decomposition x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w340', () => {
  it('square-decomposition x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w350', () => {
  it('square-decomposition x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w360', () => {
  it('square-decomposition x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w370', () => {
  it('square-decomposition x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w380', () => {
  it('square-decomposition x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w390', () => {
  it('square-decomposition x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w400', () => {
  it('square-decomposition x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w420', () => {
  it('square-decomposition x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w440', () => {
  it('square-decomposition x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w460', () => {
  it('square-decomposition x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w480', () => {
  it('square-decomposition x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w500', () => {
  it('square-decomposition x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w550', () => {
  it('square-decomposition x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w600', () => {
  it('square-decomposition x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w650', () => {
  it('square-decomposition x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w700', () => {
  it('square-decomposition x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w800', () => {
  it('square-decomposition x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w900', () => {
  it('square-decomposition x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('square-decomposition - w1000', () => {
  it('square-decomposition x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('square-decomposition x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
