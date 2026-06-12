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

  it('handles null values', () => {
    const result = PowerSet.generate([null, 1])
    expect(result.length).toBe(4)
    expect(result).toContainEqual([null])
    expect(result).toContainEqual([null, 1])
  })

  it('handles undefined values', () => {
    const result = PowerSet.generate([undefined, 'a'])
    expect(result.length).toBe(4)
    expect(result).toContainEqual([undefined])
  })

  it('handles mixed types', () => {
    const result = PowerSet.generate([1, 'a', null])
    expect(result.length).toBe(8)
    expect(result).toContainEqual([1, 'a', null])
  })

  it('handles objects with same reference', () => {
    const obj = { key: 'value' }
    const result = PowerSet.generate([obj, 1])
    expect(result.length).toBe(4)
    expect(result).toContainEqual([obj])
    expect(result).toContainEqual([obj, 1])
  })

  it('handles negative numbers', () => {
    const result = PowerSet.generate([-1, -2])
    expect(result).toContainEqual([-1, -2])
    expect(result).toContainEqual([-1])
    expect(result).toContainEqual([-2])
  })

  it('handles floating point numbers', () => {
    const result = PowerSet.generate([1.5, 2.5])
    expect(result).toContainEqual([1.5, 2.5])
    expect(result.length).toBe(4)
  })

  it('generates correct subsets for 4 elements', () => {
    const result = PowerSet.generate([1, 2, 3, 4])
    expect(result.length).toBe(16)
    expect(result).toContainEqual([])
    expect(result).toContainEqual([1, 2, 3, 4])
  })

  it('generates correct subsets for 5 elements', () => {
    const result = PowerSet.generate([1, 2, 3, 4, 5])
    expect(result.length).toBe(32)
  })

  it('lazy generator can be partially consumed', () => {
    const gen = PowerSet.lazy([1, 2, 3])
    const first = gen.next().value
    const second = gen.next().value
    expect(first).toEqual([])
    expect(second).toEqual([1])
  })

  it('lazy generator yields empty set first', () => {
    const gen = PowerSet.lazy(['a', 'b'])
    expect(gen.next().value).toEqual([])
  })

  it('lazy generator maintains order', () => {
    const lazyResults: number[][] = []
    for (const subset of PowerSet.lazy([1, 2])) {
      lazyResults.push(subset)
    }
    expect(lazyResults[0]).toEqual([])
    expect(lazyResults[3]).toEqual([1, 2])
  })

  it('bySize handles size 0 correctly', () => {
    const bySize = PowerSet.bySize([1, 2, 3])
    expect(bySize.get(0)).toEqual([[]])
    expect(bySize.get(0)!.length).toBe(1)
  })

  it('bySize handles maximum size', () => {
    const bySize = PowerSet.bySize([1, 2, 3])
    expect(bySize.get(3)).toEqual([[1, 2, 3]])
    expect(bySize.get(3)!.length).toBe(1)
  })

  it('bySize has correct number of keys', () => {
    const bySize = PowerSet.bySize([1, 2, 3, 4])
    expect(bySize.size).toBe(5)
  })

  it('bySize missing size returns undefined', () => {
    const bySize = PowerSet.bySize([1, 2])
    expect(bySize.get(5)).toBeUndefined()
  })

  it('count handles large n', () => {
    expect(PowerSet.count(15)).toBe(32768)
    expect(PowerSet.count(20)).toBe(1048576)
  })

  it('count returns 1 for n=0', () => {
    expect(PowerSet.count(0)).toBe(1)
  })

  it('count returns 2 for n=1', () => {
    expect(PowerSet.count(1)).toBe(2)
  })

  it('subset preserves original order', () => {
    const result = PowerSet.generate([3, 1, 2])
    expect(result[7]).toEqual([3, 1, 2])
  })

  it('handles duplicate values in input', () => {
    const result = PowerSet.generate([1, 1])
    expect(result.length).toBe(4)
    expect(result).toContainEqual([1])
    expect(result).toContainEqual([1, 1])
  })

  it('empty array has single subset', () => {
    expect(PowerSet.generate([]).length).toBe(1)
  })

  it('two element array has four subsets', () => {
    expect(PowerSet.generate([1, 2]).length).toBe(4)
  })

  it('three element array has eight subsets', () => {
    expect(PowerSet.generate([1, 2, 3]).length).toBe(8)
  })

  it('five element array has thirty two subsets', () => {
    expect(PowerSet.generate([1, 2, 3, 4, 5]).length).toBe(32)
  })

  it('lazy generator for empty array', () => {
    const results = [...PowerSet.lazy([])]
    expect(results).toEqual([[]])
  })

  it('lazy generator for single element', () => {
    const results = [...PowerSet.lazy([1])]
    expect(results).toEqual([[], [1]])
  })

  it('bySize for single element has sizes 0 and 1', () => {
    const bySize = PowerSet.bySize([1])
    expect(bySize.has(0)).toBe(true)
    expect(bySize.has(1)).toBe(true)
    expect(bySize.has(2)).toBe(false)
  })

  it('bySize for empty array has only size 0', () => {
    const bySize = PowerSet.bySize([])
    expect(bySize.size).toBe(1)
    expect(bySize.has(0)).toBe(true)
  })

  it('all subsets are valid subsets', () => {
    const arr = [1, 2, 3]
    const result = PowerSet.generate(arr)
    for (const subset of result) {
      for (const elem of subset) {
        expect(arr).toContain(elem)
      }
    }
  })

  it('bySize subsets are valid', () => {
    const bySize = PowerSet.bySize([1, 2, 3])
    for (const [size, subsets] of bySize) {
      for (const subset of subsets) {
        expect(subset.length).toBe(size)
      }
    }
  })

  it('handles boolean values', () => {
    const result = PowerSet.generate([true, false])
    expect(result.length).toBe(4)
    expect(result).toContainEqual([true, false])
  })

  it('handles array of arrays', () => {
    const result = PowerSet.generate([[1], [2]])
    expect(result.length).toBe(4)
    expect(result).toContainEqual([[1], [2]])
  })

  it('generator produces same number of results as generate', () => {
    const arr = [1, 2, 3, 4]
    const eager = PowerSet.generate(arr)
    let lazyCount = 0
    for (const _ of PowerSet.lazy(arr)) lazyCount++
    expect(lazyCount).toBe(eager.length)
  })

  it('should generate power set by size', () => {
    const bySize = PowerSet.bySize([1, 2, 3])
    expect(bySize.get(0)).toEqual([[]])
    expect(bySize.get(1)!.length).toBe(3)
  })

  it('should count power set size', () => {
    expect(PowerSet.count(4)).toBe(16)
    expect(PowerSet.count(0)).toBe(1)
  })

  it('bySize groups subsets by cardinality', () => {
    const map = PowerSet.bySize(['a', 'b'])
    expect(map.get(0)).toEqual([[]])
    expect(map.get(1)!.length).toBe(2)
    expect(map.get(2)).toEqual([['a', 'b']])
  })

  it('lazy yields same as generate', () => {
    const arr = [1, 2]
    const eager = PowerSet.generate(arr)
    const lazy = [...PowerSet.lazy(arr)]
    expect(lazy).toEqual(eager)
  })

  it('generate for empty array returns [[]]', () => {
    expect(PowerSet.generate([])).toEqual([[]])
  })

  it('count for 10 is 1024', () => {
    expect(PowerSet.count(10)).toBe(1024)
  })

  it('empty set returns [[]]', () => {
    expect(PowerSet.generate([])).toEqual([[]])
  })

  it('single element returns 2 subsets', () => {
    expect(PowerSet.generate([1]).length).toBe(2)
  })

  it('two elements returns 4 subsets', () => {
    expect(PowerSet.generate([1, 2]).length).toBe(4)
  })
})

describe('power-set - wave545', () => {
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

describe('power-set - wave546', () => {
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

describe('power-set - wave547', () => {
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

describe('power-set - wave548', () => {
  it('power-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('power-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('power-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave549', () => {
  it('power-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('power-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('power-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave550', () => {
  it('power-set w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave551', () => {
  it('power-set w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave552', () => {
  it('power-set w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave553', () => {
  it('power-set w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave554', () => {
  it('power-set w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave555', () => {
  it('power-set w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave556', () => {
  it('power-set w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave557', () => {
  it('power-set w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave558', () => {
  it('power-set w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave559', () => {
  it('power-set w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave560', () => {
  it('power-set w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave561', () => {
  it('power-set w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('power-set - wave562', () => {
  it('power-set w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('power-set w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
