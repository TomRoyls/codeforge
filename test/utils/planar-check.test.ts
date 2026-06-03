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

  it('handles tree is planar', () => {
    const pc = new PlanarCheck(5)
    pc.addEdge(0, 1)
    pc.addEdge(0, 2)
    pc.addEdge(0, 3)
    pc.addEdge(0, 4)
    expect(pc.isPlanar()).toBe(true)
  })

  it('empty graph is planar', () => {
    const pc = new PlanarCheck(3)
    expect(pc.isPlanar()).toBe(true)
  })

  it('two nodes with edge is planar', () => {
    const pc = new PlanarCheck(2)
    pc.addEdge(0, 1)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K4 is planar', () => {
    const pc = new PlanarCheck(4)
    pc.addEdge(0, 1)
    pc.addEdge(0, 2)
    pc.addEdge(0, 3)
    pc.addEdge(1, 2)
    pc.addEdge(1, 3)
    pc.addEdge(2, 3)
    expect(pc.isPlanar()).toBe(true)
  })

  it('single node is planar', () => {
    const pc = new PlanarCheck(1)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K3 is planar', () => {
    const pc = new PlanarCheck(3)
    pc.addEdge(0, 1)
    pc.addEdge(1, 2)
    pc.addEdge(0, 2)
    expect(pc.isPlanar()).toBe(true)
  })

  it('single edge is planar', () => {
    const pc = new PlanarCheck(2)
    pc.addEdge(0, 1)
    expect(pc.isPlanar()).toBe(true)
  })

  it('K5 is not planar', () => {
    const pc = new PlanarCheck(5)
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        pc.addEdge(i, j)
      }
    }
    expect(pc.isPlanar()).toBe(false)
  })

  it('single node is planar', () => {
    const pc = new PlanarCheck(1)
    expect(pc.isPlanar()).toBe(true)
  })

  it('two nodes with edge is planar', () => {
    const pc = new PlanarCheck(2)
    pc.addEdge(0, 1)
    expect(pc.isPlanar()).toBe(true)
  })

  it('no edges is planar', () => {
    const pc = new PlanarCheck(3)
    expect(pc.isPlanar()).toBe(true)
  })

  it('single edge is planar', () => {
    const pc = new PlanarCheck(2)
    pc.addEdge(0, 1)
    expect(pc.isPlanar()).toBe(true)
  })
})
