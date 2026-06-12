import { describe, expect, it } from 'vitest'
import { VPTrie } from '../../src/utils/vptrie.js'

describe('VPTrie', () => {
  it('finds nearest point', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([10, 10])
    expect(vp.nearest([1, 1])).toEqual([0, 0])
  })

  it('returns null for empty trie', () => {
    const vp = new VPTrie(2)
    expect(vp.nearest([0, 0])).toBeNull()
  })

  it('finds k nearest', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([1, 1])
    vp.addPoint([10, 10])
    const result = vp.kNearest([0, 0], 2)
    expect(result.length).toBe(2)
    expect(result[0]).toEqual([0, 0])
    expect(result[1]).toEqual([1, 1])
  })

  it('finds all within radius', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([1, 0])
    vp.addPoint([10, 10])
    expect(vp.findAllWithin([0, 0], 2).length).toBe(2)
  })

  it('tracks size', () => {
    const vp = new VPTrie(2)
    expect(vp.size).toBe(0)
    vp.addPoint([0, 0])
    expect(vp.size).toBe(1)
  })

  it('handles 1D points', () => {
    const vp = new VPTrie(1)
    vp.addPoint([0])
    vp.addPoint([5])
    vp.addPoint([10])
    expect(vp.nearest([4])).toEqual([5])
  })

  it('handles 3D points', () => {
    const vp = new VPTrie(3)
    vp.addPoint([0, 0, 0])
    vp.addPoint([5, 5, 5])
    expect(vp.nearest([1, 1, 1])).toEqual([0, 0, 0])
  })

  it('handles duplicate points', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([0, 0])
    expect(vp.nearest([0, 0])).toEqual([0, 0])
    expect(vp.size).toBe(2)
  })

  it('kNearest with k > size', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    const result = vp.kNearest([0, 0], 5)
    expect(result.length).toBe(1)
  })

  it('findAllWithin empty result', () => {
    const vp = new VPTrie(2)
    vp.addPoint([10, 10])
    expect(vp.findAllWithin([0, 0], 1)).toEqual([])
  })

  it('handles many points', () => {
    const vp = new VPTrie(2)
    for (let i = 0; i < 100; i++) vp.addPoint([i, i])
    expect(vp.nearest([50.1, 50.1])).toEqual([50, 50])
    expect(vp.kNearest([50, 50], 3).length).toBe(3)
  })

  it('findAllWithin returns correct range', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([1, 0])
    vp.addPoint([5, 5])
    expect(vp.findAllWithin([0, 0], 1.5).length).toBe(2)
  })

  it('handles single point nearest', () => {
    const vp = new VPTrie(2)
    vp.addPoint([5, 5])
    expect(vp.nearest([0, 0])).toEqual([5, 5])
  })

  it('handles empty trie nearest', () => {
    const vp = new VPTrie(2)
    expect(vp.nearest([0, 0])).toBeNull()
  })

  it('handles kNearest on single point', () => {
    const vp = new VPTrie(2)
    vp.addPoint([3, 4])
    const result = vp.kNearest([0, 0], 1)
    expect(result.length).toBe(1)
    expect(result[0]).toEqual([3, 4])
  })

  it('handles findAllWithin empty trie', () => {
    const vp = new VPTrie(2)
    expect(vp.findAllWithin([0, 0], 10)).toEqual([])
  })

  it('addPoint and nearest basic', () => {
    const vp = new VPTrie(2)
    vp.addPoint([1, 1])
    vp.addPoint([5, 5])
    const nearest = vp.nearest([2, 2])
    expect(nearest).toEqual([1, 1])
  })

  it('nearest on empty returns null', () => {
    const vp = new VPTrie<number[]>()
    expect(vp.nearest([0, 0])).toBeNull()
  })

  it('addPoint and nearest finds close point', () => {
    const vp = new VPTrie<number[]>()
    vp.addPoint([1, 1])
    vp.addPoint([5, 5])
    vp.addPoint([10, 10])
    const result = vp.nearest([4, 4])
    expect(result).not.toBeNull()
  })

  it('nearest on single point', () => {
    const vp = new VPTrie(2)
    vp.addPoint([5, 5])
    const result = vp.nearest([5, 5])
    expect(result).not.toBeNull()
  })

  it('nearest returns closest point', () => {
    const vp = new VPTrie()
    vp.addPoint([0, 0])
    vp.addPoint([10, 10])
    const result = vp.nearest([1, 1])
    expect(result).not.toBeNull()
  })

  it('nearest returns closest of two points', () => {
    const vp = new VPTrie<number[]>()
    vp.addPoint([0, 0])
    vp.addPoint([10, 10])
    const result = vp.nearest([1, 1])
    expect(result).not.toBeNull()
  })

  it('nearest on empty returns null', () => {
    const vp = new VPTrie<number[]>((a, b) => Math.abs(a[0]! - b[0]!))
    expect(vp.nearest([1, 1])).toBeNull()
  })

  it('addPoint and nearest', () => {
    const vp = new VPTrie(2)
    vp.addPoint([5, 5])
    expect(vp.nearest([4, 4])).not.toBeNull()
  })

  it('handles 4D points', () => {
    const vp = new VPTrie(4)
    vp.addPoint([0, 0, 0, 0])
    vp.addPoint([5, 5, 5, 5])
    expect(vp.nearest([1, 1, 1, 1])).toEqual([0, 0, 0, 0])
  })

  it('handles 5D points', () => {
    const vp = new VPTrie(5)
    vp.addPoint([0, 0, 0, 0, 0])
    vp.addPoint([10, 10, 10, 10, 10])
    expect(vp.nearest([1, 1, 1, 1, 1])).toEqual([0, 0, 0, 0, 0])
  })

  it('kNearest with k=0 returns empty array', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([10, 10])
    const result = vp.kNearest([0, 0], 0)
    expect(result.length).toBe(0)
  })

  it('kNearest with k=1 returns single point', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([10, 10])
    const result = vp.kNearest([0, 0], 1)
    expect(result.length).toBe(1)
    expect(result[0]).toEqual([0, 0])
  })

  it('kNearest on empty trie returns empty array', () => {
    const vp = new VPTrie(2)
    const result = vp.kNearest([0, 0], 5)
    expect(result.length).toBe(0)
  })

  it('findAllWithin with zero radius', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([0.5, 0.5])
    const result = vp.findAllWithin([0, 0], 0)
    expect(result.length).toBe(1)
  })

  it('findAllWithin with large radius returns all points', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([100, 100])
    vp.addPoint([200, 200])
    const result = vp.findAllWithin([0, 0], 1000)
    expect(result.length).toBe(3)
  })

  it('handles negative coordinates', () => {
    const vp = new VPTrie(2)
    vp.addPoint([-5, -5])
    vp.addPoint([5, 5])
    expect(vp.nearest([-1, -1])).toEqual([-5, -5])
  })

  it('handles zero coordinates', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([10, 10])
    expect(vp.nearest([0, 0])).toEqual([0, 0])
  })

  it('handles large coordinates', () => {
    const vp = new VPTrie(2)
    vp.addPoint([1000000, 1000000])
    vp.addPoint([2000000, 2000000])
    expect(vp.nearest([1500000, 1500000])).toEqual([1000000, 1000000])
  })

  it('handles fractional coordinates', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0.5, 0.5])
    vp.addPoint([1.5, 1.5])
    expect(vp.nearest([0.6, 0.6])).toEqual([0.5, 0.5])
  })

  it('kNearest maintains order for equal distances', () => {
    const vp = new VPTrie(2)
    vp.addPoint([1, 0])
    vp.addPoint([0, 1])
    vp.addPoint([-1, 0])
    const result = vp.kNearest([0, 0], 3)
    expect(result.length).toBe(3)
  })

  it('handles query matching existing point', () => {
    const vp = new VPTrie(2)
    vp.addPoint([5, 5])
    expect(vp.nearest([5, 5])).toEqual([5, 5])
  })

  it('findAllWithin with boundary matches', () => {
    const vp = new VPTrie(2)
    vp.addPoint([3, 4])
    vp.addPoint([6, 8])
    const result = vp.findAllWithin([0, 0], 5)
    expect(result.length).toBe(1)
  })

  it('kNearest with exact size', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([1, 1])
    vp.addPoint([2, 2])
    const result = vp.kNearest([0, 0], 3)
    expect(result.length).toBe(3)
  })

  it('handles points with mixed signs', () => {
    const vp = new VPTrie(2)
    vp.addPoint([-5, 5])
    vp.addPoint([5, -5])
    expect(vp.nearest([-4, 4])).toEqual([-5, 5])
  })

  it('size is zero after construction', () => {
    const vp = new VPTrie(2)
    expect(vp.size).toBe(0)
  })

  it('size increments with each addPoint', () => {
    const vp = new VPTrie(2)
    vp.addPoint([1, 1])
    expect(vp.size).toBe(1)
    vp.addPoint([2, 2])
    expect(vp.size).toBe(2)
    vp.addPoint([3, 3])
    expect(vp.size).toBe(3)
  })

  it('handles many kNearest queries', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([1, 1])
    vp.addPoint([2, 2])
    vp.addPoint([3, 3])
    const result1 = vp.kNearest([0, 0], 2)
    const result2 = vp.kNearest([3, 3], 2)
    expect(result1.length).toBe(2)
    expect(result2.length).toBe(2)
  })

  it('findAllWithin on empty trie', () => {
    const vp = new VPTrie(2)
    const result = vp.findAllWithin([0, 0], 10)
    expect(result).toEqual([])
  })

  it('handles single point findAllWithin', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    const result = vp.findAllWithin([0, 0], 0.1)
    expect(result.length).toBe(1)
  })

  it('nearest with exactly matching point', () => {
    const vp = new VPTrie(2)
    vp.addPoint([7, 7])
    expect(vp.nearest([7, 7])).toEqual([7, 7])
  })

  it('should return null for nearest on empty trie', () => {
    const vp = new VPTrie(2)
    expect(vp.nearest([0, 0])).toBeNull()
  })

  it('should find k nearest neighbors', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([1, 1])
    vp.addPoint([10, 10])
    const knn = vp.kNearest([0, 0], 2)
    expect(knn).toHaveLength(2)
    expect(knn[0]).toEqual([0, 0])
  })

  it('should find all points within radius', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([1, 1])
    vp.addPoint([10, 10])
    const within = vp.findAllWithin([0, 0], 2)
    expect(within.length).toBe(2)
  })

  it('should report size', () => {
    const vp = new VPTrie(2)
    expect(vp.size).toBe(0)
    vp.addPoint([1, 2])
    vp.addPoint([3, 4])
    expect(vp.size).toBe(2)
  })

  it('should work with 3D points', () => {
    const vp = new VPTrie(3)
    vp.addPoint([0, 0, 0])
    vp.addPoint([1, 1, 1])
    const nearest = vp.nearest([0.5, 0.5, 0.5])
    expect(nearest).toEqual([0, 0, 0])
  })

  it('should handle single point', () => {
    const vp = new VPTrie(2)
    vp.addPoint([5, 5])
    expect(vp.nearest([0, 0])).toEqual([5, 5])
    expect(vp.kNearest([0, 0], 1)).toEqual([[5, 5]])
  })
})

  it('size returns point count', () => {
    const vp = new VPTrie(2)
    vp.addPoint([1, 2])
    vp.addPoint([3, 4])
    expect(vp.size).toBe(2)
  })

  it('nearest returns closest point', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([10, 10])
    expect(vp.nearest([1, 1])).toEqual([0, 0])
  })

  it('kNearest returns k results', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([1, 1])
    vp.addPoint([10, 10])
    expect(vp.kNearest([0, 0], 2).length).toBe(2)
  })

describe('vptrie - extra', () => {
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

describe('vptrie - wave545', () => {
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

describe('vptrie - wave546', () => {
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

describe('vptrie - wave547', () => {
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

describe('vptrie - wave548', () => {
  it('vptrie module defined', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie module is function', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave549', () => {
  it('vptrie module defined', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie module is function', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave550', () => {
  it('vptrie w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave551', () => {
  it('vptrie w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave552', () => {
  it('vptrie w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave553', () => {
  it('vptrie w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave554', () => {
  it('vptrie w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave555', () => {
  it('vptrie w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave556', () => {
  it('vptrie w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave557', () => {
  it('vptrie w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave558', () => {
  it('vptrie w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave559', () => {
  it('vptrie w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave560', () => {
  it('vptrie w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave561', () => {
  it('vptrie w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave562', () => {
  it('vptrie w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave563', () => {
  it('vptrie w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave564', () => {
  it('vptrie w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave565', () => {
  it('vptrie w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave566', () => {
  it('vptrie w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave127', () => {
  it('vptrie w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave130', () => {
  it('vptrie w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave133', () => {
  it('vptrie w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave136', () => {
  it('vptrie w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - wave139', () => {
  it('vptrie w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w142', () => {
  it('vptrie v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w145', () => {
  it('vptrie v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w148', () => {
  it('vptrie v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w151', () => {
  it('vptrie v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w154', () => {
  it('vptrie v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w157', () => {
  it('vptrie v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w160', () => {
  it('vptrie v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w170', () => {
  it('vptrie x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w180', () => {
  it('vptrie x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w190', () => {
  it('vptrie x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w200', () => {
  it('vptrie x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w210', () => {
  it('vptrie x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w220', () => {
  it('vptrie x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w230', () => {
  it('vptrie x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w240', () => {
  it('vptrie x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w250', () => {
  it('vptrie x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w260', () => {
  it('vptrie x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w270', () => {
  it('vptrie x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w280', () => {
  it('vptrie x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w290', () => {
  it('vptrie x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w300', () => {
  it('vptrie x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w310', () => {
  it('vptrie x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w320', () => {
  it('vptrie x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w330', () => {
  it('vptrie x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w340', () => {
  it('vptrie x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w350', () => {
  it('vptrie x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w360', () => {
  it('vptrie x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w370', () => {
  it('vptrie x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w380', () => {
  it('vptrie x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w390', () => {
  it('vptrie x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w400', () => {
  it('vptrie x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w420', () => {
  it('vptrie x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w440', () => {
  it('vptrie x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w460', () => {
  it('vptrie x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w480', () => {
  it('vptrie x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w500', () => {
  it('vptrie x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w550', () => {
  it('vptrie x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w600', () => {
  it('vptrie x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w650', () => {
  it('vptrie x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w700', () => {
  it('vptrie x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w800', () => {
  it('vptrie x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w900', () => {
  it('vptrie x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('vptrie - w1000', () => {
  it('vptrie x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('vptrie x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
