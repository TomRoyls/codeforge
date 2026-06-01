import { describe, expect, it } from 'vitest'
import { CycleSpace } from '../../src/utils/cycle-space.js'

describe('CycleSpace', () => {
  it('tree has no cycles', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 3)
    expect(cs.findCycles()).toEqual([])
    expect(cs.cycleSpaceDimension()).toBe(0)
    expect(cs.isTree()).toBe(true)
  })

  it('single cycle', () => {
    const cs = new CycleSpace(3)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(0, 2)
    expect(cs.findCycles().length).toBe(1)
    expect(cs.cycleSpaceDimension()).toBe(1)
    expect(cs.isTree()).toBe(false)
  })

  it('two cycles sharing edge', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(0, 2)
    cs.addEdge(2, 3)
    cs.addEdge(0, 3)
    expect(cs.findCycles().length).toBe(2)
    expect(cs.cycleSpaceDimension()).toBe(2)
  })

  it('single edge has no cycle', () => {
    const cs = new CycleSpace(2)
    cs.addEdge(0, 1)
    expect(cs.findCycles()).toEqual([])
  })

  it('empty graph has no cycles', () => {
    const cs = new CycleSpace(3)
    expect(cs.findCycles()).toEqual([])
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('cycle dimension formula', () => {
    const cs = new CycleSpace(5)
    for (let i = 0; i < 5; i++) cs.addEdge(i, (i + 1) % 5)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('isTree for star', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(0, 2)
    cs.addEdge(0, 3)
    expect(cs.isTree()).toBe(true)
  })

  it('figure eight has 2 cycles', () => {
    const cs = new CycleSpace(5)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(0, 2)
    cs.addEdge(2, 3)
    cs.addEdge(3, 4)
    cs.addEdge(2, 4)
    expect(cs.findCycles().length).toBe(2)
  })

  it('parallel edges create cycle', () => {
    const cs = new CycleSpace(2)
    cs.addEdge(0, 1)
    expect(cs.findCycles()).toEqual([])
  })

  it('complete graph K4 dimension', () => {
    const cs = new CycleSpace(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        cs.addEdge(i, j)
    expect(cs.cycleSpaceDimension()).toBe(3)
  })

  it('isTree for empty', () => {
    const cs = new CycleSpace(3)
    expect(cs.isTree()).toBe(true)
  })

  it('single cycle dimension', () => {
    const cs = new CycleSpace(3)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 0)
    expect(cs.cycleSpaceDimension()).toBe(1)
    expect(cs.isTree()).toBe(false)
  })

  it('multiple cycles dimension', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 0)
    cs.addEdge(0, 3)
    cs.addEdge(3, 1)
    expect(cs.cycleSpaceDimension()).toBe(2)
  })

  it('single node has dimension zero', () => {
    const cs = new CycleSpace(1)
    expect(cs.cycleSpaceDimension()).toBe(0)
    expect(cs.isTree()).toBe(true)
  })

  it('two isolated nodes no cycles', () => {
    const cs = new CycleSpace(2)
    expect(cs.findCycles()).toEqual([])
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('tree has dimension zero', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 3)
    expect(cs.cycleSpaceDimension()).toBe(0)
    expect(cs.isTree()).toBe(true)
  })

  it('K3 has dimension 1', () => {
    const cs = new CycleSpace(3)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(0, 2)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })
})
