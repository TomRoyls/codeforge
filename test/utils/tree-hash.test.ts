import { describe, expect, it } from 'vitest'
import { TreeHash } from '../../src/utils/tree-hash.js'

describe('TreeHash', () => {
  it('hashes single node', () => {
    const th = new TreeHash(1)
    expect(th.hash(0)).toBeDefined()
  })

  it('hashes path consistently', () => {
    const th = new TreeHash(3)
    th.addEdge(0, 1)
    th.addEdge(1, 2)
    expect(th.hash(0)).toBeDefined()
  })

  it('same tree has same rooted hash', () => {
    const t1 = new TreeHash(3)
    t1.addEdge(0, 1)
    t1.addEdge(0, 2)
    const t2 = new TreeHash(3)
    t2.addEdge(0, 1)
    t2.addEdge(0, 2)
    expect(t1.rootedHash()).toEqual(t2.rootedHash())
  })

  it('different trees have different hashes', () => {
    const t1 = new TreeHash(4)
    t1.addEdge(0, 1)
    t1.addEdge(0, 2)
    t1.addEdge(0, 3)
    const t2 = new TreeHash(4)
    t2.addEdge(0, 1)
    t2.addEdge(1, 2)
    t2.addEdge(2, 3)
    expect(t1.rootedHash()).not.toEqual(t2.rootedHash())
  })

  it('finds center of even-length path', () => {
    const th = new TreeHash(4)
    th.addEdge(0, 1)
    th.addEdge(1, 2)
    th.addEdge(2, 3)
    const center = th.findCenter()
    expect(center.length).toBe(2)
    expect(center).toContain(1)
    expect(center).toContain(2)
  })

  it('finds center of odd-length path', () => {
    const th = new TreeHash(5)
    th.addEdge(0, 1)
    th.addEdge(1, 2)
    th.addEdge(2, 3)
    th.addEdge(3, 4)
    const center = th.findCenter()
    expect(center).toEqual([2])
  })

  it('finds center of star', () => {
    const th = new TreeHash(5)
    th.addEdge(0, 1)
    th.addEdge(0, 2)
    th.addEdge(0, 3)
    th.addEdge(0, 4)
    expect(th.findCenter()).toEqual([0])
  })

  it('detects isomorphic trees', () => {
    const t1 = new TreeHash(4)
    t1.addEdge(0, 1)
    t1.addEdge(0, 2)
    t1.addEdge(0, 3)
    const t2 = new TreeHash(4)
    t2.addEdge(1, 0)
    t2.addEdge(1, 2)
    t2.addEdge(1, 3)
    expect(t1.isIsomorphic(t2, 0, 1)).toBe(true)
  })

  it('detects non-isomorphic trees', () => {
    const t1 = new TreeHash(4)
    t1.addEdge(0, 1)
    t1.addEdge(0, 2)
    t1.addEdge(0, 3)
    const t2 = new TreeHash(4)
    t2.addEdge(0, 1)
    t2.addEdge(1, 2)
    t2.addEdge(2, 3)
    expect(t1.isIsomorphic(t2, 0, 0)).toBe(false)
  })

  it('handles two nodes', () => {
    const th = new TreeHash(2)
    th.addEdge(0, 1)
    const center = th.findCenter()
    expect(center.length).toBe(2)
  })

  it('same subtrees have same hash', () => {
    const th = new TreeHash(7)
    th.addEdge(0, 1)
    th.addEdge(0, 2)
    th.addEdge(1, 3)
    th.addEdge(1, 4)
    th.addEdge(2, 5)
    th.addEdge(2, 6)
    expect(th.rootedHash(1)).toBe(th.rootedHash(2))
  })

  it('different trees different hash', () => {
    const th1 = new TreeHash(4)
    th1.addEdge(0, 1)
    th1.addEdge(0, 2)
    th1.addEdge(0, 3)
    const th2 = new TreeHash(4)
    th2.addEdge(0, 1)
    th2.addEdge(1, 2)
    th2.addEdge(2, 3)
    expect(th1.rootedHash(0)).not.toBe(th2.rootedHash(0))
  })

  it('handles single node', () => {
    const th = new TreeHash(1)
    expect(th.rootedHash(0)).toBeGreaterThanOrEqual(0)
  })

  it('finds center of single node', () => {
    const th = new TreeHash(1)
    expect(th.findCenter()).toEqual([0])
  })

  it('handles two node tree hash', () => {
    const th = new TreeHash(2)
    th.addEdge(0, 1)
    expect(th.rootedHash(0)).toBeGreaterThanOrEqual(0)
    expect(th.rootedHash(1)).toBeGreaterThanOrEqual(0)
  })
})
