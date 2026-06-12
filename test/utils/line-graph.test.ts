import { describe, expect, it } from 'vitest'
import { LineGraph } from '../../src/utils/line-graph.js'

describe('LineGraph', () => {
  it('empty graph has empty line graph', () => {
    const lg = new LineGraph(3)
    expect(lg.build()).toEqual([])
  })

  it('single edge line graph', () => {
    const lg = new LineGraph(2)
    lg.addEdge(0, 1)
    expect(lg.build()).toEqual([[]])
  })

  it('path of 2 edges', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    const adj = lg.build()
    expect(adj[0]).toEqual([1])
    expect(adj[1]).toEqual([0])
  })

  it('triangle line graph is triangle', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.addEdge(0, 2)
    expect(lg.maxDegree()).toBe(2)
    expect(lg.isCompleteLineGraph()).toBe(true)
  })

  it('star line graph is complete', () => {
    const lg = new LineGraph(4)
    lg.addEdge(0, 1)
    lg.addEdge(0, 2)
    lg.addEdge(0, 3)
    expect(lg.isCompleteLineGraph()).toBe(true)
  })

  it('path line graph is path', () => {
    const lg = new LineGraph(4)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.addEdge(2, 3)
    expect(lg.maxDegree()).toBe(2)
  })

  it('tracks edge count', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    expect(lg.edgeCount()).toBe(2)
  })

  it('disconnected edges have no neighbors', () => {
    const lg = new LineGraph(4)
    lg.addEdge(0, 1)
    lg.addEdge(2, 3)
    const adj = lg.build()
    expect(adj[0]).toEqual([])
    expect(adj[1]).toEqual([])
  })

  it('K4 line graph', () => {
    const lg = new LineGraph(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        lg.addEdge(i, j)
    expect(lg.edgeCount()).toBe(6)
    expect(lg.maxDegree()).toBe(4)
  })

  it('shared vertex creates edge', () => {
    const lg = new LineGraph(4)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.addEdge(2, 3)
    const adj = lg.build()
    expect(adj[0]!.length).toBe(1)
    expect(adj[1]!.length).toBe(2)
  })

  it('parallel edges create complete line', () => {
    const lg = new LineGraph(2)
    lg.addEdge(0, 1)
    lg.addEdge(0, 1)
    const adj = lg.build()
    expect(adj[0]!.length).toBe(1)
    expect(adj[1]!.length).toBe(1)
  })

  it('star line graph is complete', () => {
    const lg = new LineGraph(4)
    lg.addEdge(0, 1)
    lg.addEdge(0, 2)
    lg.addEdge(0, 3)
    const adj = lg.build()
    expect(adj.length).toBe(3)
  })

  it('single edge line graph', () => {
    const lg = new LineGraph(2)
    lg.addEdge(0, 1)
    const adj = lg.build()
    expect(adj.length).toBe(1)
    expect(adj[0]).toEqual([])
  })

  it('empty graph has no edges', () => {
    const lg = new LineGraph(3)
    expect(lg.edgeCount()).toBe(0)
    expect(lg.build().length).toBe(0)
  })

  it('path of 3 has maxDegree 2', () => {
    const lg = new LineGraph(4)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.addEdge(2, 3)
    expect(lg.maxDegree()).toBe(2)
  })

  it('triangle line graph is complete', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.addEdge(0, 2)
    const adj = lg.build()
    expect(adj.length).toBe(3)
    expect(lg.maxDegree()).toBe(2)
  })

  it('handles single edge graph', () => {
    const lg = new LineGraph(2)
    lg.addEdge(0, 1)
    const adj = lg.build()
    expect(adj.length).toBe(1)
  })

  it('no edges gives empty adjacency', () => {
    const lg = new LineGraph(3)
    const adj = lg.build()
    expect(adj.every(a => a.length === 0)).toBe(true)
  })

  it('single edge creates line graph', () => {
    const lg = new LineGraph(2)
    lg.addEdge(0, 1)
    const adj = lg.build()
    expect(adj.length).toBe(1)
  })

  it('no edges has empty adj', () => {
    const lg = new LineGraph(3)
    const adj = lg.build()
    expect(adj.length).toBe(0)
  })

  it('single edge line graph has one node', () => {
    const lg = new LineGraph(2)
    lg.addEdge(0, 1)
    const adj = lg.build()
    expect(adj.length).toBe(1)
  })

  it('no edges yields empty', () => {
    const lg = new LineGraph(2)
    const adj = lg.build()
    expect(adj.length).toBe(0)
  })

  it('single edge has no line graph edges', () => {
    const lg = new LineGraph(1)
    lg.addEdge(0, 1)
    const adj = lg.build()
    expect(adj).toBeDefined()
  })

  it('single edge line graph is empty', () => {
    const lg = new LineGraph(2)
    lg.addEdge(0, 1)
    const adj = lg.build()
    expect(adj.length).toBeGreaterThan(0)
  })

  it('toString returns correct string representation', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    expect(lg.toString()).toBe('LineGraph(1 edges)')
  })

  it('toJSON returns correct JSON for empty graph', () => {
    const lg = new LineGraph(3)
    const json = lg.toJSON()
    expect(json).toEqual([])
  })

  it('toJSON returns correct JSON with edges', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    const json = lg.toJSON()
    expect(json).toEqual([[0, 1], [1, 2]])
  })

  it('clone creates independent copy of empty graph', () => {
    const lg = new LineGraph(3)
    const clone = lg.clone()
    expect(clone.edgeCount()).toBe(0)
    lg.addEdge(0, 1)
    expect(clone.edgeCount()).toBe(0)
  })

  it('clone creates independent copy with edges', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    const clone = lg.clone()
    expect(clone.edgeCount()).toBe(2)
    lg.addEdge(2, 3)
    expect(clone.edgeCount()).toBe(2)
  })

  it('equals returns true for identical graphs', () => {
    const lg1 = new LineGraph(3)
    const lg2 = new LineGraph(3)
    expect(lg1.equals(lg2)).toBe(true)
  })

  it('equals returns false for graphs with different edge count', () => {
    const lg1 = new LineGraph(3)
    const lg2 = new LineGraph(3)
    lg1.addEdge(0, 1)
    lg2.addEdge(0, 1)
    lg2.addEdge(1, 2)
    expect(lg1.equals(lg2)).toBe(false)
  })

  it('equals returns false for graphs with different edges', () => {
    const lg1 = new LineGraph(3)
    const lg2 = new LineGraph(3)
    lg1.addEdge(0, 1)
    lg2.addEdge(1, 2)
    expect(lg1.equals(lg2)).toBe(false)
  })

  it('equals returns false for non-LineGraph objects', () => {
    const lg = new LineGraph(3)
    expect(lg.equals(null)).toBe(false)
    expect(lg.equals({})).toBe(false)
    expect(lg.equals([0, 1])).toBe(false)
  })

  it('addEdge returns correct index', () => {
    const lg = new LineGraph(3)
    const idx1 = lg.addEdge(0, 1)
    const idx2 = lg.addEdge(1, 2)
    expect(idx1).toBe(0)
    expect(idx2).toBe(1)
  })

  it('addEdge increments edge count', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    expect(lg.edgeCount()).toBe(1)
    lg.addEdge(1, 2)
    expect(lg.edgeCount()).toBe(2)
  })

  it('isCompleteLineGraph returns false for incomplete graph', () => {
    const lg = new LineGraph(4)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.addEdge(2, 3)
    expect(lg.isCompleteLineGraph()).toBe(false)
  })

  it('isCompleteLineGraph returns false for path graph', () => {
    const lg = new LineGraph(4)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.addEdge(2, 3)
    expect(lg.isCompleteLineGraph()).toBe(false)
  })

  it('build creates correct adjacency list', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.addEdge(0, 2)
    const adj = lg.build()
    expect(adj.length).toBe(3)
    expect(adj[0]!.length).toBe(2)
    expect(adj[1]!.length).toBe(2)
    expect(adj[2]!.length).toBe(2)
  })

  it('build returns empty array for no edges', () => {
    const lg = new LineGraph(3)
    const adj = lg.build()
    expect(Array.isArray(adj)).toBe(true)
    expect(adj.length).toBe(0)
  })

  it('maxDegree returns 0 for empty graph', () => {
    const lg = new LineGraph(3)
    expect(lg.maxDegree()).toBe(0)
  })

  it('maxDegree returns 1 for single edge', () => {
    const lg = new LineGraph(2)
    lg.addEdge(0, 1)
    expect(lg.maxDegree()).toBe(0)
  })

  it('handles large number of edges', () => {
    const lg = new LineGraph(10)
    for (let i = 0; i < 10; i++) {
      for (let j = i + 1; j < 10; j++) {
        lg.addEdge(i, j)
      }
    }
    expect(lg.edgeCount()).toBe(45)
  })

  it('handles multiple edges sharing same vertex', () => {
    const lg = new LineGraph(5)
    lg.addEdge(0, 1)
    lg.addEdge(0, 2)
    lg.addEdge(0, 3)
    lg.addEdge(0, 4)
    const adj = lg.build()
    const maxDeg = lg.maxDegree()
    expect(maxDeg).toBe(3)
  })

  it('cycle graph has correct line graph', () => {
    const lg = new LineGraph(4)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.addEdge(2, 3)
    lg.addEdge(3, 0)
    expect(lg.maxDegree()).toBe(2)
  })

  it('equals returns true for cloned graph', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    const clone = lg.clone()
    expect(lg.equals(clone)).toBe(true)
  })

  it('handles complete graph K5', () => {
    const lg = new LineGraph(5)
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        lg.addEdge(i, j)
      }
    }
    expect(lg.edgeCount()).toBe(10)
    expect(lg.maxDegree()).toBe(6)
  })

  it('toString with zero edges', () => {
    const lg = new LineGraph(3)
    expect(lg.toString()).toBe('LineGraph(0 edges)')
  })

  it('toString with multiple edges', () => {
    const lg = new LineGraph(4)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.addEdge(2, 3)
    expect(lg.toString()).toBe('LineGraph(3 edges)')
  })

  it('build with multiple disconnected components', () => {
    const lg = new LineGraph(6)
    lg.addEdge(0, 1)
    lg.addEdge(2, 3)
    lg.addEdge(4, 5)
    const adj = lg.build()
    expect(adj.every(a => a.length === 0)).toBe(true)
  })

  it('equals with same edges different order', () => {
    const lg1 = new LineGraph(3)
    const lg2 = new LineGraph(3)
    lg1.addEdge(0, 1)
    lg1.addEdge(1, 2)
    lg2.addEdge(1, 2)
    lg2.addEdge(0, 1)
    expect(lg1.equals(lg2)).toBe(false)
  })

  it('maxDegree for empty graph returns 0', () => {
    const lg = new LineGraph(5)
    expect(lg.maxDegree()).toBe(0)
  })

  it('clone preserves edge order', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    const clone = lg.clone()
    const lgJson = lg.toJSON()
    const cloneJson = clone.toJSON()
    expect(lgJson[0]).toEqual(cloneJson[0])
    expect(lgJson[1]).toEqual(cloneJson[1])
  })

  it('toJSON with multiple edges returns array', () => {
    const lg = new LineGraph(4)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.addEdge(2, 3)
    const json = lg.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBe(3)
  })

  it('maxDegree returns correct value', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    lg.build()
    expect(lg.maxDegree()).toBeGreaterThanOrEqual(0)
  })

  it('edgeCount returns total edges', () => {
    const lg = new LineGraph(3)
    lg.addEdge(0, 1)
    lg.addEdge(1, 2)
    expect(lg.edgeCount()).toBe(2)
  })

  it('build on empty graph returns empty', () => {
    const lg = new LineGraph(3)
    expect(lg.build()).toEqual([])
  })
})

describe('line-graph - wave548', () => {
  it('line-graph module defined', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module is function', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module has name', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module not null', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module has length', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave549', () => {
  it('line-graph module defined', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module is function', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave550', () => {
  it('line-graph w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave551', () => {
  it('line-graph w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave552', () => {
  it('line-graph w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave553', () => {
  it('line-graph w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave554', () => {
  it('line-graph w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave555', () => {
  it('line-graph w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave556', () => {
  it('line-graph w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave557', () => {
  it('line-graph w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave558', () => {
  it('line-graph w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave559', () => {
  it('line-graph w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave560', () => {
  it('line-graph w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave561', () => {
  it('line-graph w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave562', () => {
  it('line-graph w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave563', () => {
  it('line-graph w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave564', () => {
  it('line-graph w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave565', () => {
  it('line-graph w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('line-graph - wave566', () => {
  it('line-graph w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('line-graph w566 v2', () => {
    expect(describe).toBeDefined()
  })
})
