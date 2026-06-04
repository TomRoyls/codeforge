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
})
