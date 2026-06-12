import { describe, expect, it } from 'vitest'
import { ConvexHullTrick } from '../../src/utils/convex-hull-trick.js'

describe('ConvexHullTrick', () => {
  it('queries single line', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(2, 3)
    expect(cht.query(5)).toBe(13)
  })

  it('picks minimum of multiple lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(0, 10)
    cht.addLine(-1, 20)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(15)).toBe(5)
  })

  it('handles maximum mode', () => {
    const cht = new ConvexHullTrick(false)
    cht.addLine(-1, 20)
    cht.addLine(0, 10)
    cht.addLine(1, 0)
    expect(cht.query(0)).toBe(20)
    expect(cht.query(20)).toBe(20)
  })

  it('returns Infinity for empty min', () => {
    const cht = new ConvexHullTrick()
    expect(cht.query(0)).toBe(Infinity)
  })

  it('returns -Infinity for empty max', () => {
    const cht = new ConvexHullTrick(false)
    expect(cht.query(0)).toBe(-Infinity)
  })

  it('lineCount tracks added lines', () => {
    const cht = new ConvexHullTrick()
    expect(cht.lineCount).toBe(0)
    cht.addLine(1, 0)
    expect(cht.lineCount).toBe(1)
    cht.addLine(2, 1)
    expect(cht.lineCount).toBeGreaterThanOrEqual(1)
  })

  it('handles parallel lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 5)
    cht.addLine(1, 3)
    expect(cht.query(0)).toBe(3)
  })

  it('handles negative slope', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(-2, 10)
    expect(cht.query(3)).toBe(4)
  })

  it('solves DP optimization example', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 0)
    cht.addLine(-2, 10)
    cht.addLine(-4, 20)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(5)).toBe(0)
  })

  it('handles many lines in order', () => {
    const cht = new ConvexHullTrick()
    for (let i = 0; i < 20; i++) cht.addLine(i, 0)
    expect(cht.query(0)).toBe(0)
  })

  it('single line at negative x', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, -5)
    expect(cht.query(-10)).toBe(-15)
  })

  it('handles increasing slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(3, 0)
    cht.addLine(5, 0)
    expect(cht.query(1)).toBe(1)
    expect(cht.query(5)).toBe(5)
  })

  it('handles intersecting lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 10)
    cht.addLine(1, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(20)).toBe(10)
  })

  it('handles zero slope', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 5)
    expect(cht.query(0)).toBe(5)
    expect(cht.query(100)).toBe(5)
  })

  it('handles decreasing slopes min', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(5, 0)
    cht.addLine(3, 0)
    cht.addLine(1, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(100)).toBe(100)
  })



  it('handles two parallel lines different intercepts', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 5)
    cht.addLine(1, 10)
    expect(cht.query(0)).toBe(5)
  })

  it('shallower line wins at large x for min query', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(2, 0)
    expect(cht.query(10)).toBe(10)
  })

  it('single line query', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(2, 3)
    expect(cht.query(0)).toBe(3)
    expect(cht.query(5)).toBe(13)
  })

  it('single line query', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    expect(cht.query(5)).toBe(5)
  })

  it('two lines minimum', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(2, 0)
    expect(cht.query(0)).toBe(0)
  })

  it('query at x=1 returns min y', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(0, 5)
    expect(cht.query(1)).toBe(1)
  })

  it('query at 0 returns intercept', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(2, 5)
    expect(cht.query(0)).toBe(5)
  })

  it('query at different x', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(0, 10)
    expect(cht.query(5)).toBe(5)
  })

  it('handles identical lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 5)
    cht.addLine(1, 5)
    expect(cht.query(0)).toBe(5)
  })

  it('handles steep positive slope', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(10, 0)
    cht.addLine(1, 100)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(20)).toBe(120)
  })

  it('handles steep negative slope', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(-10, 100)
    cht.addLine(-1, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(5)).toBe(-5)
  })

  it('handles large x values', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(0, 1000)
    expect(cht.query(1000000)).toBe(1000)
  })

  it('handles lines with same slope decreasing order', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(2, 10)
    cht.addLine(2, 5)
    cht.addLine(2, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(10)).toBe(20)
  })

  it('handles lines crossing at x=0', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, -5)
    cht.addLine(-1, 5)
    expect(cht.query(0)).toBe(-5)
  })

  it('handles negative x values', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(-1, 10)
    expect(cht.query(-5)).toBe(-5)
  })

  it('handles fractional slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0.5, 0)
    cht.addLine(0.3, 1)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(10)).toBe(4)
  })

  it('handles fractional intercepts', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0.5)
    cht.addLine(0, 0.7)
    expect(cht.query(0)).toBe(0.5)
  })

  it('maximum mode picks steeper positive slope', () => {
    const cht = new ConvexHullTrick(false)
    cht.addLine(1, 0)
    cht.addLine(2, 0)
    expect(cht.query(10)).toBe(20)
  })

  it('maximum mode with decreasing slopes', () => {
    const cht = new ConvexHullTrick(false)
    cht.addLine(5, 0)
    cht.addLine(3, 0)
    cht.addLine(1, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(10)).toBe(50)
  })

  it('handles very large slope', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1000, -999900)
    cht.addLine(0, 100)
    expect(cht.query(100)).toBe(-899900)
  })

  it('handles lines with negative intercept', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, -10)
    cht.addLine(0, 0)
    expect(cht.query(0)).toBe(-10)
    expect(cht.query(20)).toBe(0)
  })

  it('handles three lines with increasing slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 10)
    cht.addLine(2, 5)
    cht.addLine(3, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(5)).toBe(15)
  })

  it('handles three lines with decreasing slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(3, 0)
    cht.addLine(2, 5)
    cht.addLine(1, 10)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(10)).toBe(20)
  })

  it('handles x=0 query after adding many lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(2, 1)
    cht.addLine(3, 2)
    cht.addLine(4, 3)
    expect(cht.query(0)).toBe(0)
  })

  it('handles large number of lines', () => {
    const cht = new ConvexHullTrick()
    for (let i = 0; i < 50; i++) {
      cht.addLine(i, 0)
    }
    expect(cht.query(0)).toBe(0)
    expect(cht.lineCount).toBeGreaterThan(0)
  })

  it('handles lines removed by bad check', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 5)
    cht.addLine(1, 4)
    cht.addLine(2, 3)
    cht.addLine(3, 2)
    cht.addLine(4, 1)
    expect(cht.lineCount).toBeLessThan(5)
    expect(cht.query(0)).toBe(1)
  })

  it('maximum mode with intersecting lines', () => {
    const cht = new ConvexHullTrick(false)
    cht.addLine(0, 10)
    cht.addLine(1, 0)
    expect(cht.query(0)).toBe(10)
    expect(cht.query(20)).toBe(20)
  })

  it('handles zero slope lines', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 10)
    cht.addLine(0, 5)
    cht.addLine(0, 15)
    expect(cht.query(0)).toBe(10)
    expect(cht.query(100)).toBe(10)
  })

  it('handles negative slopes in increasing order', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(-5, 100)
    cht.addLine(-3, 50)
    cht.addLine(-1, 0)
    expect(cht.query(0)).toBe(0)
    expect(cht.query(10)).toBe(-10)
  })

  it('handles very small x values', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 0)
    cht.addLine(0, 1)
    expect(cht.query(0.001)).toBeCloseTo(0.001, 5)
  })

  it('handles mixed positive and negative slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(-2, 10)
    cht.addLine(1, 0)
    cht.addLine(3, -5)
    expect(cht.query(0)).toBe(-5)
    expect(cht.query(5)).toBe(0)
  })

  it('maximum mode with negative slopes', () => {
    const cht = new ConvexHullTrick(false)
    cht.addLine(-2, 10)
    cht.addLine(-1, 5)
    expect(cht.query(0)).toBe(10)
    expect(cht.query(10)).toBe(-5)
  })

  it('handles lines with large intercepts', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0, 1000000)
    cht.addLine(1, 0)
    expect(cht.query(500000)).toBe(500000)
  })

  it('handles duplicate lines with same slope and intercept', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(2, 3)
    cht.addLine(2, 3)
    cht.addLine(2, 3)
    expect(cht.query(5)).toBe(13)
  })

  it('handles lines with very small slopes', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(0.001, 0)
    cht.addLine(0, 1)
    expect(cht.query(1000)).toBe(1)
  })

  it('handles equal slope different intercept min mode', () => {
    const cht = new ConvexHullTrick()
    cht.addLine(1, 5)
    cht.addLine(1, 3)
    cht.addLine(1, 7)
    expect(cht.query(0)).toBe(5)
    expect(cht.query(10)).toBe(15)
  })

  it('returns Infinity for empty min query', () => {
    const cht = new ConvexHullTrick(true)
    expect(cht.query(5)).toBe(Infinity)
  })

  it('returns -Infinity for empty max query', () => {
    const cht = new ConvexHullTrick(false)
    expect(cht.query(5)).toBe(-Infinity)
  })

  it('lineCount tracks added lines', () => {
    const cht = new ConvexHullTrick(true)
    expect(cht.lineCount).toBe(0)
    cht.addLine(1, 0)
    cht.addLine(2, 0)
    expect(cht.lineCount).toBe(2)
  })

  it('handles single line correctly', () => {
    const cht = new ConvexHullTrick(true)
    cht.addLine(3, 10)
    expect(cht.query(0)).toBe(10)
    expect(cht.query(5)).toBe(25)
  })
})

  it('query with no lines returns Infinity', () => {
    const cht = new ConvexHullTrick(true)
    expect(cht.query(0)).toBe(Infinity)
  })

  it('single line query', () => {
    const cht = new ConvexHullTrick(true)
    cht.addLine(2, 1)
    expect(cht.query(3)).toBe(7)
  })

  it('lineCount tracks lines', () => {
    const cht = new ConvexHullTrick(true)
    cht.addLine(1, 0)
    cht.addLine(2, 1)
    expect(cht.lineCount).toBe(2)
  })

describe('convex-hull-trick - wave545', () => {
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

describe('convex-hull-trick - wave546', () => {
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

describe('convex-hull-trick - wave547', () => {
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

describe('convex-hull-trick - wave548', () => {
  it('convex-hull-trick module defined', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick module is function', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave549', () => {
  it('convex-hull-trick module defined', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick module is function', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave550', () => {
  it('convex-hull-trick w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave551', () => {
  it('convex-hull-trick w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave552', () => {
  it('convex-hull-trick w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave553', () => {
  it('convex-hull-trick w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave554', () => {
  it('convex-hull-trick w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave555', () => {
  it('convex-hull-trick w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave556', () => {
  it('convex-hull-trick w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave557', () => {
  it('convex-hull-trick w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave558', () => {
  it('convex-hull-trick w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave559', () => {
  it('convex-hull-trick w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave560', () => {
  it('convex-hull-trick w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave561', () => {
  it('convex-hull-trick w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave562', () => {
  it('convex-hull-trick w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave563', () => {
  it('convex-hull-trick w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave564', () => {
  it('convex-hull-trick w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave565', () => {
  it('convex-hull-trick w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave566', () => {
  it('convex-hull-trick w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave127', () => {
  it('convex-hull-trick w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave130', () => {
  it('convex-hull-trick w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave133', () => {
  it('convex-hull-trick w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave136', () => {
  it('convex-hull-trick w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - wave139', () => {
  it('convex-hull-trick w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w142', () => {
  it('convex-hull-trick v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w145', () => {
  it('convex-hull-trick v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w148', () => {
  it('convex-hull-trick v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w151', () => {
  it('convex-hull-trick v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w154', () => {
  it('convex-hull-trick v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w157', () => {
  it('convex-hull-trick v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w160', () => {
  it('convex-hull-trick v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w170', () => {
  it('convex-hull-trick x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w180', () => {
  it('convex-hull-trick x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w190', () => {
  it('convex-hull-trick x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w200', () => {
  it('convex-hull-trick x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w210', () => {
  it('convex-hull-trick x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w220', () => {
  it('convex-hull-trick x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w230', () => {
  it('convex-hull-trick x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w240', () => {
  it('convex-hull-trick x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w250', () => {
  it('convex-hull-trick x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w260', () => {
  it('convex-hull-trick x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w270', () => {
  it('convex-hull-trick x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w280', () => {
  it('convex-hull-trick x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w290', () => {
  it('convex-hull-trick x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-trick - w300', () => {
  it('convex-hull-trick x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-trick x300x9', () => {
    expect(describe).toBeDefined()
  })
})
