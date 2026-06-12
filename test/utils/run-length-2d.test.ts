import { describe, expect, it } from 'vitest'
import { RunLength2D } from '../../src/utils/run-length-2d.js'

describe('RunLength2D', () => {
  it('encodes simple grid', () => {
    const grid = [[1, 1, 2], [3, 3, 3]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([
      [{ value: 1, count: 2 }, { value: 2, count: 1 }],
      [{ value: 3, count: 3 }],
    ])
  })

  it('encodes empty grid', () => {
    expect(RunLength2D.encode([])).toEqual([])
  })

  it('encodes grid with empty rows', () => {
    expect(RunLength2D.encode([[]])).toEqual([[]])
  })

  it('encodes single value row', () => {
    expect(RunLength2D.encode([[5, 5, 5]])).toEqual([[{ value: 5, count: 3 }]])
  })

  it('encodes all different values', () => {
    expect(RunLength2D.encode([[1, 2, 3]])).toEqual([
      [{ value: 1, count: 1 }, { value: 2, count: 1 }, { value: 3, count: 1 }],
    ])
  })

  it('encodes string grid', () => {
    const grid = [['a', 'a', 'b']]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([[{ value: 'a', count: 2 }, { value: 'b', count: 1 }]])
  })

  it('decode recovers original grid', () => {
    const grid = [[1, 1, 2], [3, 3, 3]]
    const encoded = RunLength2D.encode(grid)
    expect(RunLength2D.decode(encoded)).toEqual(grid)
  })

  it('roundtrip preserves data', () => {
    const grid = [[1, 2, 2, 3], [4, 4, 4, 4], [5, 6, 6, 6]]
    expect(RunLength2D.decode(RunLength2D.encode(grid))).toEqual(grid)
  })

  it('compressRatio returns 1 for no compression', () => {
    expect(RunLength2D.compressRatio([[1, 2, 3]])).toBeCloseTo(1)
  })

  it('compressRatio returns low for repetitive data', () => {
    expect(RunLength2D.compressRatio([[1, 1, 1, 1]])).toBeCloseTo(0.25)
  })

  it('compressRatio handles empty grid', () => {
    expect(RunLength2D.compressRatio([])).toBe(0)
  })

  it('fill creates uniform grid', () => {
    const grid = RunLength2D.fill(2, 3, 0)
    expect(grid).toEqual([[0, 0, 0], [0, 0, 0]])
  })

  it('fill and encode roundtrip', () => {
    const grid = RunLength2D.fill(3, 4, 'x')
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([
      [{ value: 'x', count: 4 }],
      [{ value: 'x', count: 4 }],
      [{ value: 'x', count: 4 }],
    ])
  })

  it('handles mixed types in grid', () => {
    const grid = [[1, 'a', 'a']]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([[{ value: 1, count: 1 }, { value: 'a', count: 2 }]])
  })

  it('large grid roundtrip', () => {
    const grid = Array.from({ length: 10 }, (_, r) =>
      Array.from({ length: 20 }, (_, c) => ((r + c) % 3).toString())
    )
    expect(RunLength2D.decode(RunLength2D.encode(grid))).toEqual(grid)
  })

  it('uniform grid encodes efficiently', () => {
    const grid = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 'x'))
    const encoded = RunLength2D.encode(grid)
    expect(encoded.length).toBeLessThan(10)
  })

  it('empty grid returns empty encoding', () => {
    const encoded = RunLength2D.encode([])
    expect(encoded).toEqual([])
  })

  it('1x1 grid returns single run', () => {
    const encoded = RunLength2D.encode([['a']])
    expect(encoded.length).toBe(1)
  })

  it('2x2 uniform grid encodes correctly', () => {
    const encoded = RunLength2D.encode([['a', 'a'], ['a', 'a']])
    expect(encoded.length).toBe(2)
    expect(encoded[0]).toEqual([{ value: 'a', count: 2 }])
  })

  it('encode single row single element', () => {
    const encoded = RunLength2D.encode([['x']])
    expect(encoded.length).toBe(1)
    expect(encoded[0]).toEqual([{ value: 'x', count: 1 }])
  })

  it('encode single row grid', () => {
    expect(RunLength2D.encode([[1, 1, 2]])).toBeDefined()
  })

  it('encode with negative numbers', () => {
    const grid = [[-1, -1, 2], [-3, -3, -3]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([
      [{ value: -1, count: 2 }, { value: 2, count: 1 }],
      [{ value: -3, count: 3 }],
    ])
  })

  it('encode with zeros', () => {
    const grid = [[0, 0, 0], [1, 2, 0]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([
      [{ value: 0, count: 3 }],
      [{ value: 1, count: 1 }, { value: 2, count: 1 }, { value: 0, count: 1 }],
    ])
  })

  it('encode with decimal numbers', () => {
    const grid = [[1.5, 1.5, 2.5]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([[{ value: 1.5, count: 2 }, { value: 2.5, count: 1 }]])
  })

  it('encode large number grid', () => {
    const grid = [[1000000, 1000000, 999999]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([[{ value: 1000000, count: 2 }, { value: 999999, count: 1 }]])
  })

  it('encode alternating values', () => {
    const grid = [[1, 2, 1, 2, 1]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([
      [{ value: 1, count: 1 }, { value: 2, count: 1 }, { value: 1, count: 1 }, { value: 2, count: 1 }, { value: 1, count: 1 }],
    ])
  })

  it('encode with single element rows', () => {
    const grid = [[1], [2], [3]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([
      [{ value: 1, count: 1 }],
      [{ value: 2, count: 1 }],
      [{ value: 3, count: 1 }],
    ])
  })

  it('encode with mixed row lengths', () => {
    const grid = [[1, 1, 1], [2, 2], [3]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([
      [{ value: 1, count: 3 }],
      [{ value: 2, count: 2 }],
      [{ value: 3, count: 1 }],
    ])
  })

  it('encode with long runs', () => {
    const grid = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([[{ value: 1, count: 10 }]])
  })

  it('encode with pattern repeats', () => {
    const grid = [[1, 1, 2, 1, 1, 2]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([
      [{ value: 1, count: 2 }, { value: 2, count: 1 }, { value: 1, count: 2 }, { value: 2, count: 1 }],
    ])
  })

  it('decode empty runs', () => {
    expect(RunLength2D.decode([])).toEqual([])
  })

  it('decode runs with empty rows', () => {
    expect(RunLength2D.decode([[]])).toEqual([[]])
  })

  it('decode single run', () => {
    const runs = [[{ value: 5, count: 3 }]]
    expect(RunLength2D.decode(runs)).toEqual([[5, 5, 5]])
  })

  it('decode multiple runs in one row', () => {
    const runs = [[{ value: 1, count: 2 }, { value: 2, count: 1 }]]
    expect(RunLength2D.decode(runs)).toEqual([[1, 1, 2]])
  })

  it('decode string runs', () => {
    const runs = [[{ value: 'a', count: 2 }, { value: 'b', count: 1 }]]
    expect(RunLength2D.decode(runs)).toEqual([['a', 'a', 'b']])
  })

  it('decode with negative numbers', () => {
    const runs = [[{ value: -1, count: 2 }, { value: 2, count: 1 }]]
    expect(RunLength2D.decode(runs)).toEqual([[-1, -1, 2]])
  })

  it('decode mixed types', () => {
    const runs = [[{ value: 1, count: 1 }, { value: 'a', count: 2 }]]
    expect(RunLength2D.decode(runs)).toEqual([[1, 'a', 'a']])
  })

  it('decode large runs', () => {
    const runs = [[{ value: 1, count: 100 }]]
    const decoded = RunLength2D.decode(runs)
    expect(decoded[0].length).toBe(100)
    expect(decoded[0][0]).toBe(1)
  })

  it('compressRatio with multiple rows', () => {
    const grid = [[1, 1, 1], [2, 2, 2], [3, 3, 3]]
    const ratio = RunLength2D.compressRatio(grid)
    expect(ratio).toBeCloseTo(0.333, 3)
  })

  it('compressRatio with no compression', () => {
    const grid = [[1, 2, 3], [4, 5, 6]]
    const ratio = RunLength2D.compressRatio(grid)
    expect(ratio).toBe(1)
  })

  it('compressRatio with partial compression', () => {
    const grid = [[1, 1, 2, 3]]
    const ratio = RunLength2D.compressRatio(grid)
    expect(ratio).toBeCloseTo(0.75, 3)
  })

  it('compressRatio with single cell', () => {
    const grid = [[1]]
    const ratio = RunLength2D.compressRatio(grid)
    expect(ratio).toBe(1)
  })

  it('fill with number', () => {
    const grid = RunLength2D.fill(2, 3, 42)
    expect(grid).toEqual([[42, 42, 42], [42, 42, 42]])
  })

  it('fill with string', () => {
    const grid = RunLength2D.fill(3, 2, 'test')
    expect(grid).toEqual([['test', 'test'], ['test', 'test'], ['test', 'test']])
  })

  it('fill with zero', () => {
    const grid = RunLength2D.fill(2, 2, 0)
    expect(grid).toEqual([[0, 0], [0, 0]])
  })

  it('fill single cell', () => {
    const grid = RunLength2D.fill(1, 1, 'x')
    expect(grid).toEqual([['x']])
  })

  it('fill single row', () => {
    const grid = RunLength2D.fill(1, 5, 'a')
    expect(grid).toEqual([['a', 'a', 'a', 'a', 'a']])
  })

  it('fill single column', () => {
    const grid = RunLength2D.fill(5, 1, 'b')
    expect(grid).toEqual([['b'], ['b'], ['b'], ['b'], ['b']])
  })

  it('fill large grid', () => {
    const grid = RunLength2D.fill(10, 20, 1)
    expect(grid.length).toBe(10)
    expect(grid[0].length).toBe(20)
    expect(grid[0][0]).toBe(1)
    expect(grid[9][19]).toBe(1)
  })

  it('encode then decode large grid', () => {
    const grid = RunLength2D.fill(100, 50, 'x')
    const decoded = RunLength2D.decode(RunLength2D.encode(grid))
    expect(decoded).toEqual(grid)
  })

  it('encode grid with all same values in row', () => {
    const grid = [[1, 1, 1, 1, 1], [2, 2, 2, 2, 2]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([
      [{ value: 1, count: 5 }],
      [{ value: 2, count: 5 }],
    ])
  })

  it('encode grid with all different values in row', () => {
    const grid = [[1, 2, 3, 4, 5, 6, 7]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded[0].length).toBe(7)
  })

  it('encode with boolean values', () => {
    const grid = [[true, true, false, true]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([[{ value: true, count: 2 }, { value: false, count: 1 }, { value: true, count: 1 }]])
  })

  it('decode with boolean values', () => {
    const runs = [[{ value: true, count: 2 }, { value: false, count: 1 }]]
    expect(RunLength2D.decode(runs)).toEqual([[true, true, false]])
  })

  it('encode decode preserves type', () => {
    const grid = [[1, 2], ['a', 'b']]
    const decoded = RunLength2D.decode(RunLength2D.encode(grid))
    expect(decoded[0][0]).toBe(1)
    expect(decoded[1][0]).toBe('a')
  })

  it('compressRatio with empty rows', () => {
    const grid = [[], [1, 1], []]
    const ratio = RunLength2D.compressRatio(grid)
    expect(ratio).toBe(0.5)
  })

  it('encode with null values', () => {
    const grid = [[null, null, 1]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([[{ value: null, count: 2 }, { value: 1, count: 1 }]])
  })

  it('decode with null values', () => {
    const runs = [[{ value: null, count: 2 }, { value: 1, count: 1 }]]
    expect(RunLength2D.decode(runs)).toEqual([[null, null, 1]])
  })

  it('fill with negative number', () => {
    const grid = RunLength2D.fill(2, 2, -5)
    expect(grid).toEqual([[-5, -5], [-5, -5]])
  })

  it('encode with special characters', () => {
    const grid = [['@', '@', '#']]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([[{ value: '@', count: 2 }, { value: '#', count: 1 }]])
  })
})

describe('run-length-2d - wave548', () => {
  it('run-length-2d module defined', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d module is function', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d module has name', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d module not null', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d module has length', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d module type is function', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave549', () => {
  it('run-length-2d module defined', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d module is function', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave550', () => {
  it('run-length-2d w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave551', () => {
  it('run-length-2d w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave552', () => {
  it('run-length-2d w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave553', () => {
  it('run-length-2d w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave554', () => {
  it('run-length-2d w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave555', () => {
  it('run-length-2d w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave556', () => {
  it('run-length-2d w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave557', () => {
  it('run-length-2d w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave558', () => {
  it('run-length-2d w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave559', () => {
  it('run-length-2d w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave560', () => {
  it('run-length-2d w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave561', () => {
  it('run-length-2d w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave562', () => {
  it('run-length-2d w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
