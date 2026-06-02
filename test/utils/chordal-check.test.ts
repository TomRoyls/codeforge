import { describe, expect, it } from 'vitest'
import { ChordalCheck } from '../../src/utils/chordal-check.js'

describe('ChordalCheck', () => {
  it('tree is chordal', () => {
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

  it('K4 is chordal', () => {
    const cc = new ChordalCheck(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        cc.addEdge(i, j)
    expect(cc.isChordal()).toBe(true)
  })

  it('single node is chordal', () => {
    const cc = new ChordalCheck(1)
    expect(cc.isChordal()).toBe(true)
  })

  it('5-cycle is not chordal', () => {
    const cc = new ChordalCheck(5)
    for (let i = 0; i < 5; i++) cc.addEdge(i, (i + 1) % 5)
    expect(cc.isChordal()).toBe(false)
  })

  it('chorded 4-cycle is chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 0)
    cc.addEdge(0, 2)
    expect(cc.isChordal()).toBe(true)
  })

  it('empty graph is chordal', () => {
    const cc = new ChordalCheck(3)
    expect(cc.isChordal()).toBe(true)
  })

  it('single edge is chordal', () => {
    const cc = new ChordalCheck(2)
    cc.addEdge(0, 1)
    expect(cc.isChordal()).toBe(true)
  })

  it('house graph is not chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 0)
    cc.addEdge(0, 4)
    cc.addEdge(1, 4)
    expect(cc.isChordal()).toBe(false)
  })

  it('diamond is chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(0, 2)
    cc.addEdge(0, 3)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    expect(cc.isChordal()).toBe(true)
  })

  it('K3 is chordal', () => {
    const cc = new ChordalCheck(3)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(0, 2)
    expect(cc.isChordal()).toBe(true)
  })

  it('C5 cycle is not chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 4)
    cc.addEdge(4, 0)
    expect(cc.isChordal()).toBe(false)
  })

  it('single node is chordal', () => {
    const cc = new ChordalCheck(1)
    expect(cc.isChordal()).toBe(true)
  })

  it('C4 cycle is not chordal', () => {
    const cc = new ChordalCheck(4)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(2, 3)
    cc.addEdge(3, 0)
    expect(cc.isChordal()).toBe(false)
  })

  it('tree is chordal', () => {
    const cc = new ChordalCheck(5)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(1, 3)
    cc.addEdge(3, 4)
    expect(cc.isChordal()).toBe(true)
  })

  it('K4 is chordal', () => {
    const cc = new ChordalCheck(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        cc.addEdge(i, j)
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

  it('triangle is chordal', () => {
    const cc = new ChordalCheck(3)
    cc.addEdge(0, 1)
    cc.addEdge(1, 2)
    cc.addEdge(0, 2)
    expect(cc.isChordal()).toBe(true)
  })

  it('single node is chordal', () => {
    const cc = new ChordalCheck(1)
    expect(cc.isChordal()).toBe(true)
  })
})
