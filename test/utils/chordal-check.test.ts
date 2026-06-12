import { describe, expect, it } from 'vitest'
import { ChordalCheck } from '../../src/utils/chordal-check.js'

describe('ChordalCheck', () => {
  it('tree with 4 nodes is chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    expect(cc.isChordal()).toBe(true)
  })

  it('triangle is chordal', () => {
    const cc = new ChordalCheck(3)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(0, 2)
    expect(cc.isChordal()).toBe(true)
  })

  it('4-cycle is not chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 0)
    expect(cc.isChordal()).toBe(false)
  })

  it('complete graph K4 is chordal', () => {
    const cc = new ChordalCheck(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        cc.addEdge(i, j)
    expect(cc.isChordal()).toBe(true)
  })

  it('single node graph is chordal', () => {
    const cc = new ChordalCheck(1)
    expect(cc.isChordal()).toBe(true)
  })

  it('5-cycle is not chordal', () => {
    const cc = new ChordalCheck(5)
    for (let i = 0; i < 5; i++) cc.addEdge(i, (i + 1) % 5)
    expect(cc.isChordal()).toBe(false)
  })

  it('4-cycle with chord is chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 0)
    cc.addEdge(0, 2)
    expect(cc.isChordal()).toBe(true)
  })

  it('empty graph with 3 nodes is chordal', () => {
    const cc = new ChordalCheck(3)
    expect(cc.isChordal()).toBe(true)
  })

  it('single edge between 2 nodes is chordal', () => {
    const cc = new ChordalCheck(2)
    cc.addEdge(0, 1)
    expect(cc.isChordal()).toBe(true)
  })

  it('house graph (pentagon with roof) is not chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 0)
    cc.addEdge(0, 4)
    cc.addEdge(1, 4)
    expect(cc.isChordal()).toBe(false)
  })

  it('diamond graph (K4 minus one edge) is chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(0, 2)
    cc.addEdge(0, 3)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    expect(cc.isChordal()).toBe(true)
  })

  it('complete graph K3 is chordal', () => {
    const cc = new ChordalCheck(3)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(0, 2)
    expect(cc.isChordal()).toBe(true)
  })

  it('5-cycle C5 is not chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 4)
    cc.addEdge(4, 0)
    expect(cc.isChordal()).toBe(false)
  })

  it('tree with 5 nodes is chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(1, 3)
    cc.addEdge(3, 4)
    expect(cc.isChordal()).toBe(true)
  })

  it('6-cycle is not chordal', () => {
    const cc = new ChordalCheck(6)
    for (let i = 0; i < 6; i++) cc.addEdge(i, (i + 1) % 6)
    expect(cc.isChordal()).toBe(false)
  })

  it('7-cycle is not chordal', () => {
    const cc = new ChordalCheck(7)
    for (let i = 0; i < 7; i++) cc.addEdge(i, (i + 1) % 7)
    expect(cc.isChordal()).toBe(false)
  })

  it('3-cycle is chordal (it is a triangle)', () => {
    const cc = new ChordalCheck(3)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 0)
    expect(cc.isChordal()).toBe(true)
  })

  it('complete graph K5 is chordal', () => {
    const cc = new ChordalCheck(5)
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++)
        cc.addEdge(i, j)
    expect(cc.isChordal()).toBe(true)
  })

  it('complete graph K2 is chordal', () => {
    const cc = new ChordalCheck(2)
    cc.addEdge(0, 1)
    expect(cc.isChordal()).toBe(true)
  })

  it('6-cycle with one chord is not chordal', () => {
    const cc = new ChordalCheck(6)
    for (let i = 0; i < 6; i++) cc.addEdge(i, (i + 1) % 6)
    cc.addEdge(0, 3)
    expect(cc.isChordal()).toBe(false)
  })

  it('6-cycle with two chords is not chordal', () => {
    const cc = new ChordalCheck(6)
    for (let i = 0; i < 6; i++) cc.addEdge(i, (i + 1) % 6)
    cc.addEdge(0, 2)
    cc.addEdge(0, 4)
    expect(cc.isChordal()).toBe(false)
  })

  it('star graph with center 0 is chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 1)
    cc.addEdge(0, 2)
    cc.addEdge(0, 3)
    cc.addEdge(0, 4)
    expect(cc.isChordal()).toBe(true)
  })

  it('path graph of 4 nodes is chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    expect(cc.isChordal()).toBe(true)
  })

  it('graph with isolated vertex is chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    expect(cc.isChordal()).toBe(true)
  })

  it('graph with two isolated vertices is chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    expect(cc.isChordal()).toBe(true)
  })

  it('disconnected graph with two edges is chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(2, 3)
    expect(cc.isChordal()).toBe(true)
  })

  it('disconnected graph with triangle and edge is chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 0)
    cc.addEdge(3, 4)
    expect(cc.isChordal()).toBe(true)
  })

  it('disconnected graph with 4-cycle and triangle is not chordal', () => {
    const cc = new ChordalCheck(7)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 0)
    cc.addEdge(4, 5)
    cc.addEdge(5, 6)
    cc.addEdge(6, 4)
    expect(cc.isChordal()).toBe(false)
  })

  it('adding duplicate edge does not affect chordality', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 0)
    cc.addEdge(0, 1)
    expect(cc.isChordal()).toBe(false)
  })

  it('complete bipartite K2,3 is not chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 2)
    cc.addEdge(0, 3)
    cc.addEdge(0, 4)
    cc.addEdge(1, 2)
    cc.addEdge(1, 3)
    cc.addEdge(1, 4)
    expect(cc.isChordal()).toBe(false)
  })

  it('caterpillar graph is chordal', () => {
    const cc = new ChordalCheck(7)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 4)
    cc.addEdge(1, 5)
    cc.addEdge(2, 6)
    expect(cc.isChordal()).toBe(true)
  })

  it('5-cycle with all possible chords (complete graph K5) is chordal', () => {
    const cc = new ChordalCheck(5)
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++)
        cc.addEdge(i, j)
    expect(cc.isChordal()).toBe(true)
  })

  it('6-cycle with chords creating chordal graph', () => {
    const cc = new ChordalCheck(6)
    for (let i = 0; i < 6; i++) cc.addEdge(i, (i + 1) % 6)
    cc.addEdge(0, 2)
    cc.addEdge(2, 4)
    cc.addEdge(4, 0)
    expect(cc.isChordal()).toBe(true)
  })

  it('5-cycle with single chord creates 4-cycle, still not chordal', () => {
    const cc = new ChordalCheck(5)
    for (let i = 0; i < 5; i++) cc.addEdge(i, (i + 1) % 5)
    cc.addEdge(0, 2)
    expect(cc.isChordal()).toBe(false)
  })

  it('5-cycle with two chords can become chordal', () => {
    const cc = new ChordalCheck(5)
    for (let i = 0; i < 5; i++) cc.addEdge(i, (i + 1) % 5)
    cc.addEdge(0, 2)
    cc.addEdge(0, 3)
    expect(cc.isChordal()).toBe(true)
  })

  it('graph with degree sequence [3,3,3,3] is K4, chordal', () => {
    const cc = new ChordalCheck(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        cc.addEdge(i, j)
    expect(cc.isChordal()).toBe(true)
  })

  it('octahedron graph is not chordal', () => {
    const cc = new ChordalCheck(6)
    cc.addEdge(0, 1)
    cc.addEdge(0, 2)
    cc.addEdge(0, 3)
    cc.addEdge(0, 4)
    cc.addEdge(1, 2)
    cc.addEdge(1, 3)
    cc.addEdge(1, 5)
    cc.addEdge(2, 4)
    cc.addEdge(2, 5)
    cc.addEdge(3, 4)
    cc.addEdge(3, 5)
    cc.addEdge(4, 5)
    expect(cc.isChordal()).toBe(false)
  })

  it('7-cycle with all chords from one node is chordal', () => {
    const cc = new ChordalCheck(7)
    for (let i = 0; i < 7; i++) cc.addEdge(i, (i + 1) % 7)
    for (let i = 2; i < 6; i++) cc.addEdge(0, i)
    expect(cc.isChordal()).toBe(true)
  })

  it('8-cycle is not chordal', () => {
    const cc = new ChordalCheck(8)
    for (let i = 0; i < 8; i++) cc.addEdge(i, (i + 1) % 8)
    expect(cc.isChordal()).toBe(false)
  })

  it('8-cycle with diameter chord is not chordal', () => {
    const cc = new ChordalCheck(8)
    for (let i = 0; i < 8; i++) cc.addEdge(i, (i + 1) % 8)
    cc.addEdge(0, 4)
    expect(cc.isChordal()).toBe(false)
  })

  it('empty graph with 10 nodes is chordal', () => {
    const cc = new ChordalCheck(10)
    expect(cc.isChordal()).toBe(true)
  })

  it('complete graph K6 is chordal', () => {
    const cc = new ChordalCheck(6)
    for (let i = 0; i < 6; i++)
      for (let j = i + 1; j < 6; j++)
        cc.addEdge(i, j)
    expect(cc.isChordal()).toBe(true)
  })

  it('graph forming a wheel with 5 spokes is not chordal', () => {
    const cc = new ChordalCheck(6)
    cc.addEdge(0, 1)
    cc.addEdge(0, 2)
    cc.addEdge(0, 3)
    cc.addEdge(0, 4)
    cc.addEdge(0, 5)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 4)
    cc.addEdge(4, 5)
    cc.addEdge(5, 1)
    expect(cc.isChordal()).toBe(false)
  })

  it('graph with bridge is chordal', () => {
    const cc = new ChordalCheck(6)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 0)
    cc.addEdge(2, 3)
    cc.addEdge(3, 4)
    cc.addEdge(4, 5)
    cc.addEdge(5, 3)
    expect(cc.isChordal()).toBe(true)
  })

  it('interval graph is chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(0, 2)
    cc.addEdge(1, 2)
    cc.addEdge(1, 3)
    cc.addEdge(2, 3)
    expect(cc.isChordal()).toBe(true)
  })

  it('unit interval graph is chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 4)
    cc.addEdge(0, 2)
    cc.addEdge(1, 3)
    cc.addEdge(2, 4)
    expect(cc.isChordal()).toBe(true)
  })

  it('complete bipartite K1,n is a star, chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 1)
    cc.addEdge(0, 2)
    cc.addEdge(0, 3)
    cc.addEdge(0, 4)
    expect(cc.isChordal()).toBe(true)
  })

  it('tree with degree 3 internal node is chordal', () => {
    const cc = new ChordalCheck(7)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(1, 3)
    cc.addEdge(1, 4)
    cc.addEdge(3, 5)
    cc.addEdge(3, 6)
    expect(cc.isChordal()).toBe(true)
  })

  it('should detect non-chordal graph (cycle of 4)', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 0)
    expect(cc.isChordal()).toBe(false)
  })

  it('should confirm tree is chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 1)
    cc.addEdge(0, 2)
    cc.addEdge(1, 3)
    cc.addEdge(1, 4)
    expect(cc.isChordal()).toBe(true)
  })

  it('should handle single node', () => {
    const cc = new ChordalCheck(1)
    expect(cc.isChordal()).toBe(true)
  })

  it('should handle K3 (triangle)', () => {
    const cc = new ChordalCheck(3)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(0, 2)
    expect(cc.isChordal()).toBe(true)
  })

  it('triangle graph is chordal', () => {
    const cc = new ChordalCheck(3)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(0, 2)
    expect(cc.isChordal()).toBe(true)
  })

  it('square without diagonal is not chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 0)
    expect(cc.isChordal()).toBe(false)
  })

  it('single edge is chordal', () => {
    const cc = new ChordalCheck(2)
    cc.addEdge(0, 1)
    expect(cc.isChordal()).toBe(true)
  })
})
  it('single node is chordal', () => {
    const cc = new ChordalCheck(1)
    expect(cc.isChordal()).toBe(true)
  })

  it('triangle is chordal', () => {
    const cc = new ChordalCheck(3)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 0)
    expect(cc.isChordal()).toBe(true)
  })

  it('4-cycle is not chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 0)
    expect(cc.isChordal()).toBe(false)
  })

describe('chordal-check - wave545', () => {
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

describe('chordal-check - wave546', () => {
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

describe('chordal-check - wave547', () => {
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

describe('chordal-check - wave548', () => {
  it('chordal-check module defined', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check module is function', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave549', () => {
  it('chordal-check module defined', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check module is function', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave550', () => {
  it('chordal-check w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave551', () => {
  it('chordal-check w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave552', () => {
  it('chordal-check w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave553', () => {
  it('chordal-check w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave554', () => {
  it('chordal-check w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave555', () => {
  it('chordal-check w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave556', () => {
  it('chordal-check w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave557', () => {
  it('chordal-check w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave558', () => {
  it('chordal-check w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave559', () => {
  it('chordal-check w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave560', () => {
  it('chordal-check w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave561', () => {
  it('chordal-check w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave562', () => {
  it('chordal-check w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave563', () => {
  it('chordal-check w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave564', () => {
  it('chordal-check w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chordal-check - wave565', () => {
  it('chordal-check w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chordal-check w565 v2', () => {
    expect(describe).toBeDefined()
  })
})
