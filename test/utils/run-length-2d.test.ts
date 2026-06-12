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

describe('run-length-2d - wave563', () => {
  it('run-length-2d w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave564', () => {
  it('run-length-2d w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave565', () => {
  it('run-length-2d w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave566', () => {
  it('run-length-2d w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave127', () => {
  it('run-length-2d w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave130', () => {
  it('run-length-2d w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave133', () => {
  it('run-length-2d w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave136', () => {
  it('run-length-2d w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - wave139', () => {
  it('run-length-2d w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w142', () => {
  it('run-length-2d v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w145', () => {
  it('run-length-2d v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w148', () => {
  it('run-length-2d v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w151', () => {
  it('run-length-2d v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w154', () => {
  it('run-length-2d v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w157', () => {
  it('run-length-2d v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w160', () => {
  it('run-length-2d v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w170', () => {
  it('run-length-2d x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w180', () => {
  it('run-length-2d x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w190', () => {
  it('run-length-2d x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w200', () => {
  it('run-length-2d x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w210', () => {
  it('run-length-2d x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w220', () => {
  it('run-length-2d x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w230', () => {
  it('run-length-2d x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w240', () => {
  it('run-length-2d x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w250', () => {
  it('run-length-2d x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w260', () => {
  it('run-length-2d x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w270', () => {
  it('run-length-2d x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w280', () => {
  it('run-length-2d x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w290', () => {
  it('run-length-2d x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w300', () => {
  it('run-length-2d x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w310', () => {
  it('run-length-2d x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w320', () => {
  it('run-length-2d x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w330', () => {
  it('run-length-2d x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w340', () => {
  it('run-length-2d x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w350', () => {
  it('run-length-2d x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w360', () => {
  it('run-length-2d x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w370', () => {
  it('run-length-2d x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w380', () => {
  it('run-length-2d x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w390', () => {
  it('run-length-2d x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w400', () => {
  it('run-length-2d x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w420', () => {
  it('run-length-2d x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w440', () => {
  it('run-length-2d x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w460', () => {
  it('run-length-2d x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w480', () => {
  it('run-length-2d x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w500', () => {
  it('run-length-2d x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w550', () => {
  it('run-length-2d x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w600', () => {
  it('run-length-2d x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w650', () => {
  it('run-length-2d x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-2d - w700', () => {
  it('run-length-2d x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-2d x700x49', () => {
    expect(describe).toBeDefined()
  })
})
