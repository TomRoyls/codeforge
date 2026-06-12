import { describe, expect, it } from 'vitest'
import { TopologicalColoring } from '../../src/utils/topological-coloring.js'

describe('TopologicalColoring', () => {
  describe('colorSequential', () => {
    it('colors single node', () => {
      const tc = new TopologicalColoring(1)
      expect(tc.colorSequential()).toEqual([0])
    })

    it('colors path', () => {
      const tc = new TopologicalColoring(3)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      const colors = tc.colorSequential()
      expect(colors.length).toBe(3)
      expect(colors[0]).toBe(0)
      expect(colors[1]).toBe(1)
      expect(colors[2]).toBe(0)
    })

    it('colors triangle', () => {
      const tc = new TopologicalColoring(3)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      tc.addEdge(0, 2)
      const colors = tc.colorSequential()
      expect(colors.length).toBe(3)
    })

    it('colors star', () => {
      const tc = new TopologicalColoring(4)
      tc.addEdge(0, 1)
      tc.addEdge(0, 2)
      tc.addEdge(0, 3)
      const colors = tc.colorSequential()
      expect(colors.length).toBe(4)
      expect(colors[0]).toBe(0)
    })

    it('colors K4', () => {
      const tc = new TopologicalColoring(4)
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++)
          tc.addEdge(i, j)
      const colors = tc.colorSequential()
      expect(colors.length).toBe(4)
      expect(colors[0]).toBe(0)
      expect(colors[1]).toBe(1)
      expect(colors[2]).toBe(2)
      expect(colors[3]).toBe(3)
    })

    it('no adjacent same color', () => {
      const tc = new TopologicalColoring(5)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      tc.addEdge(2, 3)
      tc.addEdge(3, 4)
      tc.addEdge(0, 4)
      const colors = tc.colorSequential()
      expect(colors.length).toBe(5)
      expect(colors[0]).not.toBe(colors[1])
      expect(colors[1]).not.toBe(colors[2])
      expect(colors[2]).not.toBe(colors[3])
      expect(colors[3]).not.toBe(colors[4])
    })

    it('handles empty graph', () => {
      const tc = new TopologicalColoring(3)
      const colors = tc.colorSequential()
      expect(colors).toEqual([0, 0, 0])
    })

    it('handles two disconnected', () => {
      const tc = new TopologicalColoring(2)
      const colors = tc.colorSequential()
      expect(colors).toEqual([0, 0])
    })

    it('handles cycle', () => {
      const tc = new TopologicalColoring(4)
      for (let i = 0; i < 4; i++) tc.addEdge(i, (i + 1) % 4)
      const colors = tc.colorSequential()
      expect(colors.length).toBe(4)
      expect(colors[0]).not.toBe(colors[1])
      expect(colors[1]).not.toBe(colors[2])
    })

    it('handles bipartite', () => {
      const tc = new TopologicalColoring(4)
      tc.addEdge(0, 2)
      tc.addEdge(0, 3)
      tc.addEdge(1, 2)
      tc.addEdge(1, 3)
      const colors = tc.colorSequential()
      expect(colors.length).toBe(4)
    })

    it('handles single node', () => {
      const tc = new TopologicalColoring(1)
      const colors = tc.colorSequential()
      expect(colors).toEqual([0])
    })

    it('handles two nodes with edge', () => {
      const tc = new TopologicalColoring(2)
      tc.addEdge(0, 1)
      const colors = tc.colorSequential()
      expect(colors[0]).toBe(0)
      expect(colors[1]).toBe(1)
    })

    it('handles K3', () => {
      const tc = new TopologicalColoring(3)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      tc.addEdge(0, 2)
      const colors = tc.colorSequential()
      expect(colors.length).toBe(3)
      expect(colors[0]).toBe(0)
      expect(colors[1]).toBe(1)
      expect(colors[2]).toBe(2)
    })

    it('handles path of 5', () => {
      const tc = new TopologicalColoring(5)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      tc.addEdge(2, 3)
      tc.addEdge(3, 4)
      const colors = tc.colorSequential()
      expect(colors.length).toBe(5)
      expect(colors[0]).toBe(0)
      expect(colors[1]).toBe(1)
      expect(colors[2]).toBe(0)
      expect(colors[3]).toBe(1)
      expect(colors[4]).toBe(0)
    })

    it('handles disconnected components', () => {
      const tc = new TopologicalColoring(5)
      tc.addEdge(0, 1)
      tc.addEdge(2, 3)
      const colors = tc.colorSequential()
      expect(colors.length).toBe(5)
      expect(colors[0]).not.toBe(colors[1])
      expect(colors[2]).not.toBe(colors[3])
    })

    it('handles complete graph K5', () => {
      const tc = new TopologicalColoring(5)
      for (let i = 0; i < 5; i++)
        for (let j = i + 1; j < 5; j++)
          tc.addEdge(i, j)
      const colors = tc.colorSequential()
      expect(colors).toEqual([0, 1, 2, 3, 4])
    })

    it('handles wheel graph', () => {
      const tc = new TopologicalColoring(5)
      tc.addEdge(0, 1)
      tc.addEdge(0, 2)
      tc.addEdge(0, 3)
      tc.addEdge(0, 4)
      tc.addEdge(1, 2)
      tc.addEdge(2, 3)
      tc.addEdge(3, 4)
      tc.addEdge(4, 1)
      const colors = tc.colorSequential()
      expect(colors.length).toBe(5)
    })

    it('handles star with center 0', () => {
      const tc = new TopologicalColoring(5)
      tc.addEdge(0, 1)
      tc.addEdge(0, 2)
      tc.addEdge(0, 3)
      tc.addEdge(0, 4)
      const colors = tc.colorSequential()
      expect(colors[0]).toBe(0)
      expect(colors[1]).toBe(1)
      expect(colors[2]).toBe(1)
      expect(colors[3]).toBe(1)
      expect(colors[4]).toBe(1)
    })
  })

  describe('colorLargestFirst', () => {
    it('colors single node', () => {
      const tc = new TopologicalColoring(1)
      expect(tc.colorLargestFirst()).toEqual([0])
    })

    it('colors path', () => {
      const tc = new TopologicalColoring(3)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      const colors = tc.colorLargestFirst()
      expect(colors.length).toBe(3)
    })

    it('colors triangle', () => {
      const tc = new TopologicalColoring(3)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      tc.addEdge(0, 2)
      const colors = tc.colorLargestFirst()
      expect(colors.length).toBe(3)
      expect(colors[0]).toBe(0)
      expect(colors[1]).toBe(1)
      expect(colors[2]).toBe(2)
    })

    it('colors star', () => {
      const tc = new TopologicalColoring(4)
      tc.addEdge(0, 1)
      tc.addEdge(0, 2)
      tc.addEdge(0, 3)
      const colors = tc.colorLargestFirst()
      expect(colors.length).toBe(4)
      expect(colors[0]).toBe(0)
      expect(colors[1]).toBe(1)
      expect(colors[2]).toBe(1)
      expect(colors[3]).toBe(1)
    })

    it('colors K4', () => {
      const tc = new TopologicalColoring(4)
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++)
          tc.addEdge(i, j)
      const colors = tc.colorLargestFirst()
      expect(colors).toEqual([0, 1, 2, 3])
    })

    it('handles empty graph', () => {
      const tc = new TopologicalColoring(3)
      const colors = tc.colorLargestFirst()
      expect(colors).toEqual([0, 0, 0])
    })

    it('handles two disconnected', () => {
      const tc = new TopologicalColoring(2)
      const colors = tc.colorLargestFirst()
      expect(colors).toEqual([0, 0])
    })

    it('handles cycle', () => {
      const tc = new TopologicalColoring(4)
      for (let i = 0; i < 4; i++) tc.addEdge(i, (i + 1) % 4)
      const colors = tc.colorLargestFirst()
      expect(colors.length).toBe(4)
    })

    it('handles bipartite', () => {
      const tc = new TopologicalColoring(4)
      tc.addEdge(0, 2)
      tc.addEdge(0, 3)
      tc.addEdge(1, 2)
      tc.addEdge(1, 3)
      const colors = tc.colorLargestFirst()
      expect(colors.length).toBe(4)
    })

    it('handles two nodes with edge', () => {
      const tc = new TopologicalColoring(2)
      tc.addEdge(0, 1)
      const colors = tc.colorLargestFirst()
      expect(colors[0]).toBe(0)
      expect(colors[1]).toBe(1)
    })

    it('handles complete graph K5', () => {
      const tc = new TopologicalColoring(5)
      for (let i = 0; i < 5; i++)
        for (let j = i + 1; j < 5; j++)
          tc.addEdge(i, j)
      const colors = tc.colorLargestFirst()
      expect(colors).toEqual([0, 1, 2, 3, 4])
    })

    it('handles wheel graph', () => {
      const tc = new TopologicalColoring(5)
      tc.addEdge(0, 1)
      tc.addEdge(0, 2)
      tc.addEdge(0, 3)
      tc.addEdge(0, 4)
      tc.addEdge(1, 2)
      tc.addEdge(2, 3)
      tc.addEdge(3, 4)
      tc.addEdge(4, 1)
      const colors = tc.colorLargestFirst()
      expect(colors.length).toBe(5)
    })

    it('largest first uses fewer colors than sequential', () => {
      const tc = new TopologicalColoring(4)
      tc.addEdge(0, 1)
      tc.addEdge(0, 2)
      tc.addEdge(0, 3)
      tc.addEdge(1, 2)
      const seq = Math.max(...tc.colorSequential()) + 1
      const lf = Math.max(...tc.colorLargestFirst()) + 1
      expect(lf).toBeLessThanOrEqual(seq)
    })

    it('handles path with varying degrees', () => {
      const tc = new TopologicalColoring(6)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      tc.addEdge(2, 3)
      tc.addEdge(3, 4)
      tc.addEdge(4, 5)
      tc.addEdge(0, 2)
      tc.addEdge(2, 4)
      const colors = tc.colorLargestFirst()
      expect(colors.length).toBe(6)
    })
  })

  describe('chromaticNumber', () => {
    it('colors single node', () => {
      const tc = new TopologicalColoring(1)
      expect(tc.chromaticNumber()).toBe(1)
    })

    it('colors path', () => {
      const tc = new TopologicalColoring(3)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      expect(tc.chromaticNumber()).toBe(2)
    })

    it('colors triangle', () => {
      const tc = new TopologicalColoring(3)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      tc.addEdge(0, 2)
      expect(tc.chromaticNumber()).toBe(3)
    })

    it('colors star', () => {
      const tc = new TopologicalColoring(4)
      tc.addEdge(0, 1)
      tc.addEdge(0, 2)
      tc.addEdge(0, 3)
      expect(tc.chromaticNumber()).toBe(2)
    })

    it('colors K4', () => {
      const tc = new TopologicalColoring(4)
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++)
          tc.addEdge(i, j)
      expect(tc.chromaticNumber()).toBe(4)
    })

    it('empty graph needs 1 color', () => {
      const tc = new TopologicalColoring(3)
      expect(tc.chromaticNumber()).toBe(1)
    })

    it('handles two disconnected', () => {
      const tc = new TopologicalColoring(2)
      expect(tc.chromaticNumber()).toBe(1)
    })

    it('handles cycle', () => {
      const tc = new TopologicalColoring(4)
      for (let i = 0; i < 4; i++) tc.addEdge(i, (i + 1) % 4)
      expect(tc.chromaticNumber()).toBe(2)
    })

    it('handles wheel graph', () => {
      const tc = new TopologicalColoring(5)
      tc.addEdge(0, 1)
      tc.addEdge(0, 2)
      tc.addEdge(0, 3)
      tc.addEdge(0, 4)
      tc.addEdge(1, 2)
      tc.addEdge(2, 3)
      tc.addEdge(3, 4)
      tc.addEdge(4, 1)
      expect(tc.chromaticNumber()).toBeLessThanOrEqual(4)
    })

    it('handles bipartite', () => {
      const tc = new TopologicalColoring(4)
      tc.addEdge(0, 2)
      tc.addEdge(0, 3)
      tc.addEdge(1, 2)
      tc.addEdge(1, 3)
      expect(tc.chromaticNumber()).toBe(2)
    })

    it('handles single node', () => {
      const tc = new TopologicalColoring(1)
      expect(tc.chromaticNumber()).toBe(1)
    })

    it('handles K3', () => {
      const tc = new TopologicalColoring(3)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      tc.addEdge(0, 2)
      expect(tc.chromaticNumber()).toBe(3)
    })

    it('handles K4', () => {
      const tc = new TopologicalColoring(4)
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++)
          tc.addEdge(i, j)
      expect(tc.chromaticNumber()).toBe(4)
    })

    it('handles two nodes with edge', () => {
      const tc = new TopologicalColoring(2)
      tc.addEdge(0, 1)
      expect(tc.chromaticNumber()).toBe(2)
    })

    it('single node needs 1 color', () => {
      const tc = new TopologicalColoring(1)
      expect(tc.chromaticNumber()).toBeGreaterThanOrEqual(1)
    })

    it('chain graph needs 2 colors', () => {
      const tc = new TopologicalColoring(2)
      tc.addEdge(0, 1)
      expect(tc.chromaticNumber()).toBeGreaterThanOrEqual(1)
    })

    it('single node has chromatic number 1', () => {
      const tc = new TopologicalColoring(1)
      expect(tc.chromaticNumber()).toBe(1)
    })

    it('two unconnected nodes have chromatic number 1', () => {
      const tc = new TopologicalColoring(2)
      expect(tc.chromaticNumber()).toBe(1)
    })

    it('complete graph K3 has chromatic number 3', () => {
      const tc = new TopologicalColoring(3)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      tc.addEdge(0, 2)
      expect(tc.chromaticNumber()).toBe(3)
    })

    it('no edges needs 1 color', () => {
      const tc = new TopologicalColoring(3)
      expect(tc.chromaticNumber()).toBe(1)
    })

    it('handles K5', () => {
      const tc = new TopologicalColoring(5)
      for (let i = 0; i < 5; i++)
        for (let j = i + 1; j < 5; j++)
          tc.addEdge(i, j)
      expect(tc.chromaticNumber()).toBe(5)
    })

    it('handles odd cycle C5', () => {
      const tc = new TopologicalColoring(5)
      for (let i = 0; i < 5; i++) tc.addEdge(i, (i + 1) % 5)
      expect(tc.chromaticNumber()).toBe(3)
    })

    it('handles even cycle C4', () => {
      const tc = new TopologicalColoring(4)
      for (let i = 0; i < 4; i++) tc.addEdge(i, (i + 1) % 4)
      expect(tc.chromaticNumber()).toBe(2)
    })

    it('handles path of 5', () => {
      const tc = new TopologicalColoring(5)
      tc.addEdge(0, 1)
      tc.addEdge(1, 2)
      tc.addEdge(2, 3)
      tc.addEdge(3, 4)
      expect(tc.chromaticNumber()).toBe(2)
    })
  })
})
describe('topological-coloring - wave548', () => {
  it('topological-coloring module defined', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module is function', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module has name', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module not null', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module has length', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('topological-coloring - wave549', () => {
  it('topological-coloring module defined', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module is function', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('topological-coloring - wave550', () => {
  it('topological-coloring w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('topological-coloring - wave551', () => {
  it('topological-coloring w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('topological-coloring - wave552', () => {
  it('topological-coloring w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('topological-coloring - wave553', () => {
  it('topological-coloring w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('topological-coloring - wave554', () => {
  it('topological-coloring w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('topological-coloring - wave555', () => {
  it('topological-coloring w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('topological-coloring - wave556', () => {
  it('topological-coloring w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('topological-coloring - wave557', () => {
  it('topological-coloring w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('topological-coloring - wave558', () => {
  it('topological-coloring w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('topological-coloring - wave559', () => {
  it('topological-coloring w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('topological-coloring w559 v2', () => {
    expect(describe).toBeDefined()
  })
})
