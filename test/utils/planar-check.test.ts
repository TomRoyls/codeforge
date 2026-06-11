import { describe, expect, it } from 'vitest'
import { PlanarCheck } from '../../src/utils/planar-check.js'

describe('PlanarCheck', () => {
  it('K4 is planar', () => {
    const pc = new PlanarCheck(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        pc.addEdge(i, j)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K5 is not planar', () => {
    const pc = new PlanarCheck(5)
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++)
        pc.addEdge(i, j)
    expect(pc.isPlanar()).toBe(false)
  })

  it('tree is planar', () => {
    const pc = new PlanarCheck(5)
    pc.addEdge(0, 1)
    pc.addEdge(0, 2)
    pc.addEdge(0, 3)
    pc.addEdge(0, 4)
    expect(pc.isPlanar()).toBe(true)
  })

  it('single edge is planar', () => {
    const pc = new PlanarCheck(2)
    pc.addEdge(0, 1)
    expect(pc.isPlanar()).toBe(true)
  })

  it('cycle is planar', () => {
    const pc = new PlanarCheck(5)
    for (let i = 0; i < 5; i++) pc.addEdge(i, (i + 1) % 5)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K3,3 is not planar', () => {
    const pc = new PlanarCheck(6)
    for (let i = 0; i < 3; i++)
      for (let j = 3; j < 6; j++)
        pc.addEdge(i, j)
    expect(pc.isPlanar()).toBe(false)
  })

  it('empty graph is planar', () => {
    const pc = new PlanarCheck(3)
    expect(pc.isPlanar()).toBe(true)
  })

  it('single node is planar', () => {
    const pc = new PlanarCheck(1)
    expect(pc.isPlanar()).toBe(true)
  })

  it('path is planar', () => {
    const pc = new PlanarCheck(4)
    pc.addEdge(0, 1)
    pc.addEdge(1, 2)
    pc.addEdge(2, 3)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K2,3 is planar', () => {
    const pc = new PlanarCheck(5)
    pc.addEdge(0, 2)
    pc.addEdge(0, 3)
    pc.addEdge(0, 4)
    pc.addEdge(1, 2)
    pc.addEdge(1, 3)
    pc.addEdge(1, 4)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K3,3 with extra edge still not planar', () => {
    const pc = new PlanarCheck(6)
    for (let i = 0; i < 3; i++)
      for (let j = 3; j < 6; j++)
        pc.addEdge(i, j)
    pc.addEdge(0, 1)
    expect(pc.isPlanar()).toBe(false)
  })

  it('two nodes with edge is planar', () => {
    const pc = new PlanarCheck(2)
    pc.addEdge(0, 1)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K3 is planar', () => {
    const pc = new PlanarCheck(3)
    pc.addEdge(0, 1)
    pc.addEdge(1, 2)
    pc.addEdge(0, 2)
    expect(pc.isPlanar()).toBe(true)
  })

  it('triangle graph is planar', () => {
    const pc = new PlanarCheck(3)
    pc.addEdge(0, 1)
    pc.addEdge(1, 2)
    pc.addEdge(0, 2)
    expect(pc.isPlanar()).toBe(true)
  })

  it('graph with 0 nodes is planar', () => {
    const pc = new PlanarCheck(0)
    expect(pc.isPlanar()).toBe(true)
  })

  it('two nodes without edge is planar', () => {
    const pc = new PlanarCheck(2)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K2 is planar', () => {
    const pc = new PlanarCheck(2)
    pc.addEdge(0, 1)
    expect(pc.isPlanar()).toBe(true)
  })

  it('square with diagonal is planar', () => {
    const pc = new PlanarCheck(4)
    pc.addEdge(0, 1)
    pc.addEdge(1, 2)
    pc.addEdge(2, 3)
    pc.addEdge(3, 0)
    pc.addEdge(0, 2)
    expect(pc.isPlanar()).toBe(true)
  })

  it('square with both diagonals is planar', () => {
    const pc = new PlanarCheck(4)
    pc.addEdge(0, 1)
    pc.addEdge(1, 2)
    pc.addEdge(2, 3)
    pc.addEdge(3, 0)
    pc.addEdge(0, 2)
    pc.addEdge(1, 3)
    expect(pc.isPlanar()).toBe(true)
  })

  it('pentagon is planar', () => {
    const pc = new PlanarCheck(5)
    for (let i = 0; i < 5; i++) pc.addEdge(i, (i + 1) % 5)
    expect(pc.isPlanar()).toBe(true)
  })

  it('hexagon is planar', () => {
    const pc = new PlanarCheck(6)
    for (let i = 0; i < 6; i++) pc.addEdge(i, (i + 1) % 6)
    expect(pc.isPlanar()).toBe(true)
  })

  it('octagon is planar', () => {
    const pc = new PlanarCheck(8)
    for (let i = 0; i < 8; i++) pc.addEdge(i, (i + 1) % 8)
    expect(pc.isPlanar()).toBe(true)
  })

  it('star graph is planar', () => {
    const pc = new PlanarCheck(6)
    for (let i = 1; i < 6; i++) pc.addEdge(0, i)
    expect(pc.isPlanar()).toBe(true)
  })

  it('complete bipartite K1,4 is planar', () => {
    const pc = new PlanarCheck(5)
    for (let i = 1; i < 5; i++) pc.addEdge(0, i)
    expect(pc.isPlanar()).toBe(true)
  })

  it('complete bipartite K2,2 is planar', () => {
    const pc = new PlanarCheck(4)
    pc.addEdge(0, 2)
    pc.addEdge(0, 3)
    pc.addEdge(1, 2)
    pc.addEdge(1, 3)
    expect(pc.isPlanar()).toBe(true)
  })

  it('graph with high degree node but planar', () => {
    const pc = new PlanarCheck(6)
    for (let i = 1; i < 6; i++) pc.addEdge(0, i)
    pc.addEdge(1, 2)
    pc.addEdge(2, 3)
    expect(pc.isPlanar()).toBe(true)
  })

  it('disconnected graph is planar', () => {
    const pc = new PlanarCheck(6)
    pc.addEdge(0, 1)
    pc.addEdge(1, 2)
    pc.addEdge(3, 4)
    pc.addEdge(4, 5)
    expect(pc.isPlanar()).toBe(true)
  })

  it('multiple disconnected components are planar', () => {
    const pc = new PlanarCheck(8)
    pc.addEdge(0, 1)
    pc.addEdge(2, 3)
    pc.addEdge(3, 4)
    pc.addEdge(5, 6)
    expect(pc.isPlanar()).toBe(true)
  })

  it('planar graph with 10 nodes is planar', () => {
    const pc = new PlanarCheck(10)
    for (let i = 0; i < 10; i++) pc.addEdge(i, (i + 1) % 10)
    expect(pc.isPlanar()).toBe(true)
  })

  it('graph with 12 nodes in cycle is planar', () => {
    const pc = new PlanarCheck(12)
    for (let i = 0; i < 12; i++) pc.addEdge(i, (i + 1) % 12)
    expect(pc.isPlanar()).toBe(true)
  })

  it('sparse graph is planar', () => {
    const pc = new PlanarCheck(15)
    pc.addEdge(0, 1)
    pc.addEdge(1, 2)
    pc.addEdge(2, 3)
    pc.addEdge(3, 4)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K4 subdivision is planar', () => {
    const pc = new PlanarCheck(5)
    pc.addEdge(0, 4)
    pc.addEdge(4, 1)
    pc.addEdge(0, 2)
    pc.addEdge(1, 3)
    pc.addEdge(2, 4)
    pc.addEdge(3, 4)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K5 subdivision is not planar', () => {
    const pc = new PlanarCheck(6)
    for (let i = 0; i < 6; i++)
      for (let j = i + 1; j < 6; j++)
        pc.addEdge(i, j)
    expect(pc.isPlanar()).toBe(false)
  })

  it('K33 subdivision is not planar', () => {
    const pc = new PlanarCheck(7)
    for (let i = 0; i < 3; i++)
      for (let j = 3; j < 7; j++)
        pc.addEdge(i, j)
    expect(pc.isPlanar()).toBe(false)
  })

  it('graph near edge limit but planar', () => {
    const pc = new PlanarCheck(6)
    for (let i = 0; i < 6; i++) pc.addEdge(i, (i + 1) % 6)
    pc.addEdge(0, 2)
    pc.addEdge(0, 3)
    expect(pc.isPlanar()).toBe(true)
  })

  it('graph over edge limit is not planar', () => {
    const pc = new PlanarCheck(6)
    for (let i = 0; i < 6; i++)
      for (let j = i + 1; j < 6; j++)
        pc.addEdge(i, j)
    expect(pc.isPlanar()).toBe(false)
  })

  it('planar graph with 7 nodes', () => {
    const pc = new PlanarCheck(7)
    for (let i = 0; i < 7; i++) pc.addEdge(i, (i + 1) % 7)
    pc.addEdge(0, 3)
    expect(pc.isPlanar()).toBe(true)
  })

  it('planar graph with 8 nodes complex', () => {
    const pc = new PlanarCheck(8)
    for (let i = 0; i < 8; i++) pc.addEdge(i, (i + 1) % 8)
    pc.addEdge(0, 2)
    pc.addEdge(0, 4)
    pc.addEdge(1, 3)
    pc.addEdge(2, 5)
    expect(pc.isPlanar()).toBe(true)
  })

  it('complete bipartite K2,4 is planar', () => {
    const pc = new PlanarCheck(6)
    for (let i = 2; i < 6; i++) {
      pc.addEdge(0, i)
      pc.addEdge(1, i)
    }
    expect(pc.isPlanar()).toBe(true)
  })

  it('grid 2x3 is planar', () => {
    const pc = new PlanarCheck(6)
    pc.addEdge(0, 1)
    pc.addEdge(1, 2)
    pc.addEdge(3, 4)
    pc.addEdge(4, 5)
    pc.addEdge(0, 3)
    pc.addEdge(1, 4)
    pc.addEdge(2, 5)
    expect(pc.isPlanar()).toBe(true)
  })

  it('grid 3x3 is planar', () => {
    const pc = new PlanarCheck(9)
    for (let i = 0; i < 9; i++) {
      if (i % 3 !== 2) pc.addEdge(i, i + 1)
      if (i < 6) pc.addEdge(i, i + 3)
    }
    expect(pc.isPlanar()).toBe(true)
  })

  it('binary tree is planar', () => {
    const pc = new PlanarCheck(7)
    pc.addEdge(0, 1)
    pc.addEdge(0, 2)
    pc.addEdge(1, 3)
    pc.addEdge(1, 4)
    pc.addEdge(2, 5)
    pc.addEdge(2, 6)
    expect(pc.isPlanar()).toBe(true)
  })

  it('path of 10 nodes is planar', () => {
    const pc = new PlanarCheck(10)
    for (let i = 0; i < 9; i++) pc.addEdge(i, i + 1)
    expect(pc.isPlanar()).toBe(true)
  })

  it('multiple triangles sharing edges is planar', () => {
    const pc = new PlanarCheck(6)
    pc.addEdge(0, 1)
    pc.addEdge(1, 2)
    pc.addEdge(2, 0)
    pc.addEdge(2, 3)
    pc.addEdge(3, 4)
    pc.addEdge(4, 2)
    pc.addEdge(4, 5)
    pc.addEdge(5, 0)
    expect(pc.isPlanar()).toBe(true)
  })

  it('Wagner graph (K5 subdivision) is planar', () => {
    const pc = new PlanarCheck(8)
    for (let i = 0; i < 8; i++) pc.addEdge(i, (i + 1) % 8)
    pc.addEdge(0, 2)
    pc.addEdge(0, 4)
    pc.addEdge(0, 6)
    expect(pc.isPlanar()).toBe(true)
  })

  it('Petersen graph is planar', () => {
    const pc = new PlanarCheck(10)
    const outer = [0, 1, 2, 3, 4]
    const inner = [5, 6, 7, 8, 9]
    for (let i = 0; i < 5; i++) {
      pc.addEdge(outer[i]!, outer[(i + 1) % 5])
      pc.addEdge(inner[i]!, inner[(i + 2) % 5])
      pc.addEdge(outer[i]!, inner[i]!)
    }
    expect(pc.isPlanar()).toBe(true)
  })

  it('K5 with one edge removed is planar', () => {
    const pc = new PlanarCheck(5)
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++)
        if (!(i === 0 && j === 1)) pc.addEdge(i, j)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K33 with one edge removed is planar', () => {
    const pc = new PlanarCheck(6)
    for (let i = 0; i < 3; i++)
      for (let j = 3; j < 6; j++)
        if (!(i === 0 && j === 3)) pc.addEdge(i, j)
    expect(pc.isPlanar()).toBe(true)
  })
})