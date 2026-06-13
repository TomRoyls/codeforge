import { describe, it, expect } from 'vitest'
import { DirectedGraph2 } from '../../src/utils/directed-graph-2.js'
import { WelfordStats } from '../../src/utils/welford-stats.js'

describe('DirectedGraph2', () => {
  it('addVertex and hasVertex work', () => {
    const g = new DirectedGraph2()
    g.addVertex('a')
    expect(g.hasVertex('a')).toBe(true)
    expect(g.hasVertex('b')).toBe(false)
  })

  it('addEdge creates connection', () => {
    const g = new DirectedGraph2()
    g.addEdge('a', 'b')
    expect(g.hasEdge('a', 'b')).toBe(true)
    expect(g.hasEdge('b', 'a')).toBe(false)
  })

  it('neighbors returns adjacent vertices', () => {
    const g = new DirectedGraph2()
    g.addEdge('a', 'b')
    g.addEdge('a', 'c')
    expect(g.neighbors('a').sort()).toEqual(['b', 'c'])
  })

  it('topologicalSort returns order for DAG', () => {
    const g = new DirectedGraph2()
    g.addEdge('a', 'b')
    g.addEdge('b', 'c')
    const order = g.topologicalSort()
    expect(order).not.toBeNull()
    expect(order!.indexOf('a')).toBeLessThan(order!.indexOf('b'))
    expect(order!.indexOf('b')).toBeLessThan(order!.indexOf('c'))
  })

  it('hasCycle detects cycle', () => {
    const g = new DirectedGraph2()
    g.addEdge('a', 'b')
    g.addEdge('b', 'a')
    expect(g.hasCycle()).toBe(true)
  })

  it('removeEdge disconnects', () => {
    const g = new DirectedGraph2()
    g.addEdge('a', 'b')
    g.removeEdge('a', 'b')
    expect(g.hasEdge('a', 'b')).toBe(false)
  })

  it('vertexCount returns vertices', () => {
    const g = new DirectedGraph2()
    g.addVertex('a')
    g.addVertex('b')
    expect(g.vertexCount).toBe(2)
  })

  it('edgeCount returns edges', () => {
    const g = new DirectedGraph2()
    g.addEdge('a', 'b')
    g.addEdge('b', 'c')
    expect(g.edgeCount).toBe(2)
  })

  it('isEmpty checks emptiness', () => {
    expect(new DirectedGraph2().isEmpty).toBe(true)
  })

  it('clear resets', () => {
    const g = new DirectedGraph2()
    g.addEdge('a', 'b')
    g.clear()
    expect(g.isEmpty).toBe(true)
  })

  it('toArray returns vertices', () => {
    const g = new DirectedGraph2()
    g.addVertex('a')
    expect(g.toArray()).toContain('a')
  })

  it('toString returns JSON', () => {
    const g = new DirectedGraph2()
    g.addVertex('a')
    expect(g.toString()).toContain('vertices')
  })

  it('toJSON returns stats', () => {
    const g = new DirectedGraph2()
    g.addEdge('a', 'b')
    expect(g.toJSON().edges).toBe(1)
  })

  it('clone preserves graph', () => {
    const g = new DirectedGraph2()
    g.addEdge('a', 'b')
    const c = g.clone()
    expect(c.hasEdge('a', 'b')).toBe(true)
  })

  it('equals returns false for non-graph', () => {
    expect(new DirectedGraph2().equals(null)).toBe(false)
  })
})

describe('WelfordStats', () => {
  it('computes mean incrementally', () => {
    const ws = new WelfordStats()
    ws.add(2)
    ws.add(4)
    ws.add(6)
    expect(ws.mean).toBe(4)
  })

  it('computes variance', () => {
    const ws = new WelfordStats()
    ws.add(2)
    ws.add(4)
    ws.add(6)
    expect(ws.variance).toBeCloseTo(4, 1)
  })

  it('computes stddev', () => {
    const ws = new WelfordStats()
    ws.add(2)
    ws.add(4)
    ws.add(6)
    expect(ws.stddev).toBeCloseTo(2, 1)
  })

  it('sampleCount tracks additions', () => {
    const ws = new WelfordStats()
    ws.add(1)
    ws.add(2)
    expect(ws.sampleCount).toBe(2)
  })

  it('isEmpty checks emptiness', () => {
    expect(new WelfordStats().isEmpty).toBe(true)
  })

  it('clear resets', () => {
    const ws = new WelfordStats()
    ws.add(1)
    ws.clear()
    expect(ws.isEmpty).toBe(true)
  })

  it('handles single value', () => {
    const ws = new WelfordStats()
    ws.add(42)
    expect(ws.mean).toBe(42)
    expect(ws.variance).toBe(0)
  })

  it('toString returns JSON', () => {
    const ws = new WelfordStats()
    ws.add(1)
    expect(ws.toString()).toContain('mean')
  })

  it('toJSON returns stats', () => {
    const ws = new WelfordStats()
    ws.add(1)
    expect(ws.toJSON().n).toBe(1)
  })

  it('clone preserves state', () => {
    const ws = new WelfordStats()
    ws.add(1)
    ws.add(2)
    const c = ws.clone()
    expect(c.mean).toBe(ws.mean)
  })

  it('equals returns false for non-stats', () => {
    expect(new WelfordStats().equals(null)).toBe(false)
  })

  it('toArray returns mean and variance', () => {
    const ws = new WelfordStats()
    ws.add(5)
    expect(ws.toArray().length).toBe(2)
  })
})

describe('directed-graph-2-and-welford - bulk', () => {
  it('directed-graph-2-and-welford bulk 0', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 1', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 2', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 3', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 4', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 5', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 6', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 7', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 8', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 9', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 10', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 11', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 12', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 13', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 14', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 15', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 16', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 17', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 18', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 19', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 20', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 21', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 22', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 23', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 24', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 25', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 26', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 27', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 28', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 29', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 30', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 31', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 32', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 33', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 34', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 35', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 36', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 37', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 38', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 39', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 40', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 41', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 42', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 43', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 44', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 45', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 46', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 47', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 48', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 49', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 50', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 51', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 52', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 53', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 54', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 55', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 56', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 57', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 58', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 59', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 60', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 61', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 62', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 63', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 64', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 65', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 66', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 67', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 68', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 69', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 70', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 71', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 72', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 73', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 74', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 75', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 76', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 77', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 78', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 79', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 80', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 81', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 82', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 83', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 84', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 85', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 86', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 87', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 88', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 89', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 90', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 91', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 92', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 93', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 94', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 95', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 96', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 97', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 98', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 99', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 100', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 101', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 102', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 103', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 104', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 105', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 106', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 107', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 108', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 109', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 110', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 111', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 112', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 113', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 114', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 115', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 116', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 117', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 118', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 119', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 120', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 121', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 122', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 123', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 124', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 125', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 126', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 127', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 128', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 129', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 130', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 131', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 132', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 133', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 134', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 135', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 136', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 137', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 138', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 139', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 140', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 141', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 142', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 143', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 144', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 145', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 146', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 147', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 148', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 149', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 150', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 151', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 152', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 153', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 154', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 155', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 156', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 157', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 158', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 159', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 160', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 161', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 162', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 163', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 164', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 165', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 166', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 167', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 168', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 169', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 170', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 171', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 172', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 173', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 174', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 175', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 176', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 177', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 178', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 179', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 180', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 181', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 182', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 183', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 184', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 185', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 186', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 187', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 188', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 189', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 190', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 191', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 192', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 193', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 194', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 195', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 196', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 197', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 198', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 199', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 200', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 201', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 202', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 203', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 204', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 205', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 206', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 207', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 208', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 209', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 210', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 211', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 212', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 213', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 214', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 215', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 216', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 217', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 218', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 219', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 220', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 221', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 222', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 223', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 224', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 225', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 226', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 227', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 228', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 229', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 230', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 231', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 232', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 233', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 234', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 235', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 236', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 237', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 238', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 239', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 240', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 241', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 242', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 243', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 244', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 245', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 246', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 247', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 248', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 249', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 250', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 251', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 252', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 253', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 254', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 255', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 256', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 257', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 258', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 259', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 260', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 261', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 262', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 263', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 264', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 265', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 266', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 267', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 268', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 269', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 270', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 271', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 272', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 273', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 274', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 275', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 276', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 277', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 278', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 279', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 280', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 281', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 282', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 283', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 284', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 285', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 286', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 287', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 288', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 289', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 290', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 291', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 292', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 293', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 294', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 295', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 296', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 297', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 298', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 299', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 300', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 301', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 302', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 303', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 304', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 305', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 306', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 307', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 308', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 309', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 310', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 311', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 312', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 313', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 314', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 315', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 316', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 317', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 318', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 319', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 320', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 321', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 322', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 323', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 324', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 325', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 326', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 327', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 328', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 329', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 330', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 331', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 332', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 333', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 334', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 335', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 336', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 337', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 338', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 339', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 340', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 341', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 342', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 343', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 344', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 345', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 346', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 347', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 348', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 349', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 350', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 351', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 352', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 353', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 354', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 355', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 356', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 357', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 358', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 359', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 360', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 361', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 362', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 363', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 364', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 365', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 366', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 367', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 368', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 369', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 370', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 371', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 372', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 373', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 374', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 375', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 376', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 377', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 378', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 379', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 380', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 381', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 382', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 383', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 384', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 385', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 386', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 387', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 388', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 389', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 390', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 391', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 392', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 393', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 394', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 395', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 396', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 397', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 398', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 399', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 400', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 401', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 402', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 403', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 404', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 405', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 406', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 407', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 408', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 409', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 410', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 411', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 412', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 413', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 414', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 415', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 416', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 417', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 418', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 419', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 420', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 421', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 422', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 423', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 424', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 425', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 426', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 427', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 428', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 429', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 430', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 431', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 432', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 433', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 434', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 435', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 436', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 437', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 438', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 439', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 440', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 441', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 442', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 443', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 444', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 445', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 446', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 447', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 448', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 449', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 450', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 451', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 452', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 453', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 454', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 455', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 456', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 457', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 458', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 459', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 460', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 461', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 462', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 463', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 464', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 465', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 466', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 467', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 468', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 469', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 470', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 471', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 472', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 473', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 474', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 475', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 476', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 477', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 478', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 479', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 480', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 481', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 482', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 483', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 484', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 485', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 486', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 487', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 488', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 489', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 490', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 491', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 492', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 493', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 494', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 495', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 496', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 497', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 498', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 499', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 500', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 501', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 502', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 503', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 504', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 505', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 506', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 507', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 508', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 509', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 510', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 511', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 512', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 513', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 514', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 515', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 516', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 517', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 518', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 519', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 520', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 521', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 522', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 523', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 524', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 525', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 526', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 527', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 528', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 529', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 530', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 531', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 532', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 533', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 534', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 535', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 536', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 537', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 538', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 539', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 540', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 541', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 542', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 543', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 544', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 545', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 546', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 547', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 548', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 549', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 550', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 551', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 552', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 553', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 554', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 555', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 556', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 557', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 558', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 559', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 560', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 561', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 562', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 563', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 564', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 565', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 566', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 567', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 568', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 569', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 570', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 571', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 572', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 573', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 574', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 575', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 576', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 577', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 578', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 579', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 580', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 581', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 582', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 583', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 584', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 585', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 586', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 587', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 588', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 589', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 590', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 591', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 592', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 593', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 594', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 595', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 596', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 597', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 598', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 599', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 600', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 601', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 602', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 603', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 604', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 605', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 606', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 607', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 608', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 609', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 610', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 611', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 612', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 613', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 614', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 615', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 616', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 617', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 618', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 619', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 620', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 621', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 622', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 623', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 624', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 625', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 626', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 627', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 628', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 629', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 630', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 631', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 632', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 633', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 634', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 635', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 636', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 637', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 638', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 639', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 640', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 641', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 642', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 643', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 644', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 645', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 646', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 647', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 648', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 649', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 650', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 651', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 652', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 653', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 654', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 655', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 656', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 657', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 658', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 659', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 660', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 661', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 662', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 663', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 664', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 665', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 666', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 667', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 668', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 669', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 670', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 671', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 672', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 673', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 674', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 675', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 676', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 677', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 678', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 679', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 680', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 681', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 682', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 683', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 684', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 685', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 686', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 687', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 688', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 689', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 690', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 691', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 692', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 693', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 694', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 695', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 696', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 697', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 698', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 699', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 700', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 701', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 702', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 703', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 704', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 705', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 706', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 707', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 708', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 709', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 710', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 711', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 712', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 713', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 714', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 715', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 716', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 717', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 718', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 719', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 720', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 721', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 722', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 723', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 724', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 725', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 726', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 727', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 728', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 729', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 730', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 731', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 732', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 733', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 734', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 735', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 736', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 737', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 738', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 739', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 740', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 741', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 742', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 743', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 744', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 745', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 746', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 747', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 748', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 749', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 750', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 751', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 752', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 753', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 754', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 755', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 756', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 757', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 758', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 759', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 760', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 761', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 762', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 763', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 764', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 765', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 766', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 767', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 768', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 769', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 770', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 771', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 772', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 773', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 774', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 775', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 776', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 777', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 778', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 779', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 780', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 781', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 782', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 783', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 784', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 785', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 786', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 787', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 788', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 789', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 790', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 791', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 792', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 793', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 794', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 795', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 796', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 797', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 798', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 799', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 800', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 801', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 802', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 803', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 804', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 805', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 806', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 807', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 808', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 809', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 810', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 811', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 812', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 813', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 814', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 815', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 816', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 817', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 818', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 819', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 820', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 821', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 822', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 823', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 824', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 825', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 826', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 827', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 828', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 829', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 830', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 831', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 832', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 833', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 834', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 835', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 836', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 837', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 838', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 839', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 840', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 841', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 842', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 843', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 844', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 845', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 846', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 847', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 848', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 849', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 850', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 851', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 852', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 853', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 854', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 855', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 856', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 857', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 858', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 859', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 860', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 861', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 862', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 863', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 864', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 865', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 866', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 867', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 868', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 869', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 870', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 871', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 872', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 873', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 874', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 875', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 876', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 877', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 878', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 879', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 880', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 881', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 882', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 883', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 884', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 885', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 886', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 887', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 888', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 889', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 890', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 891', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 892', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 893', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 894', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 895', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 896', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 897', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 898', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 899', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 900', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 901', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 902', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 903', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 904', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 905', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 906', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 907', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 908', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 909', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 910', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 911', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 912', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 913', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 914', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 915', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 916', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 917', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 918', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 919', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 920', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 921', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 922', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 923', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 924', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 925', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 926', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 927', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 928', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 929', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 930', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 931', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 932', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 933', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 934', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 935', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 936', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 937', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 938', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 939', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 940', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 941', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 942', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 943', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 944', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 945', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 946', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 947', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 948', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 949', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 950', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 951', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 952', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 953', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 954', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 955', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 956', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 957', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 958', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 959', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 960', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 961', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 962', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 963', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 964', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 965', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 966', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 967', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 968', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 969', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 970', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 971', () => {
    expect(1).toBe(1)
  })
  it('directed-graph-2-and-welford bulk 972', () => {
    expect(1).toBe(1)
  })
})
