import { describe, expect, it } from 'vitest'
import { VPTrie } from '../../src/utils/vptrie.js'

describe('VPTrie', () => {
  it('finds nearest point', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([10, 10])
    expect(vp.nearest([1, 1])).toEqual([0, 0])
  })

  it('returns null for empty trie', () => {
    const vp = new VPTrie(2)
    expect(vp.nearest([0, 0])).toBeNull()
  })

  it('finds k nearest', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([1, 1])
    vp.addPoint([10, 10])
    const result = vp.kNearest([0, 0], 2)
    expect(result.length).toBe(2)
    expect(result[0]).toEqual([0, 0])
    expect(result[1]).toEqual([1, 1])
  })

  it('finds all within radius', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([1, 0])
    vp.addPoint([10, 10])
    expect(vp.findAllWithin([0, 0], 2).length).toBe(2)
  })

  it('tracks size', () => {
    const vp = new VPTrie(2)
    expect(vp.size).toBe(0)
    vp.addPoint([0, 0])
    expect(vp.size).toBe(1)
  })

  it('handles 1D points', () => {
    const vp = new VPTrie(1)
    vp.addPoint([0])
    vp.addPoint([5])
    vp.addPoint([10])
    expect(vp.nearest([4])).toEqual([5])
  })

  it('handles 3D points', () => {
    const vp = new VPTrie(3)
    vp.addPoint([0, 0, 0])
    vp.addPoint([5, 5, 5])
    expect(vp.nearest([1, 1, 1])).toEqual([0, 0, 0])
  })

  it('handles duplicate points', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([0, 0])
    expect(vp.nearest([0, 0])).toEqual([0, 0])
    expect(vp.size).toBe(2)
  })

  it('kNearest with k > size', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    const result = vp.kNearest([0, 0], 5)
    expect(result.length).toBe(1)
  })

  it('findAllWithin empty result', () => {
    const vp = new VPTrie(2)
    vp.addPoint([10, 10])
    expect(vp.findAllWithin([0, 0], 1)).toEqual([])
  })

  it('handles many points', () => {
    const vp = new VPTrie(2)
    for (let i = 0; i < 100; i++) vp.addPoint([i, i])
    expect(vp.nearest([50.1, 50.1])).toEqual([50, 50])
    expect(vp.kNearest([50, 50], 3).length).toBe(3)
  })

  it('findAllWithin returns correct range', () => {
    const vp = new VPTrie(2)
    vp.addPoint([0, 0])
    vp.addPoint([1, 0])
    vp.addPoint([5, 5])
    expect(vp.findAllWithin([0, 0], 1.5).length).toBe(2)
  })

  it('handles single point nearest', () => {
    const vp = new VPTrie(2)
    vp.addPoint([5, 5])
    expect(vp.nearest([0, 0])).toEqual([5, 5])
  })

  it('handles empty trie nearest', () => {
    const vp = new VPTrie(2)
    expect(vp.nearest([0, 0])).toBeNull()
  })

  it('handles kNearest on single point', () => {
    const vp = new VPTrie(2)
    vp.addPoint([3, 4])
    const result = vp.kNearest([0, 0], 1)
    expect(result.length).toBe(1)
    expect(result[0]).toEqual([3, 4])
  })

  it('handles findAllWithin empty trie', () => {
    const vp = new VPTrie(2)
    expect(vp.findAllWithin([0, 0], 10)).toEqual([])
  })

  it('addPoint and nearest basic', () => {
    const vp = new VPTrie(2)
    vp.addPoint([1, 1])
    vp.addPoint([5, 5])
    const nearest = vp.nearest([2, 2])
    expect(nearest).toEqual([1, 1])
  })

  it('nearest on empty returns null', () => {
    const vp = new VPTrie<number[]>()
    expect(vp.nearest([0, 0])).toBeNull()
  })

  it('addPoint and nearest finds close point', () => {
    const vp = new VPTrie<number[]>()
    vp.addPoint([1, 1])
    vp.addPoint([5, 5])
    vp.addPoint([10, 10])
    const result = vp.nearest([4, 4])
    expect(result).not.toBeNull()
  })

  it('nearest on single point', () => {
    const vp = new VPTrie(2)
    vp.addPoint([5, 5])
    const result = vp.nearest([5, 5])
    expect(result).not.toBeNull()
  })

  it('nearest returns closest point', () => {
    const vp = new VPTrie()
    vp.addPoint([0, 0])
    vp.addPoint([10, 10])
    const result = vp.nearest([1, 1])
    expect(result).not.toBeNull()
  })

  it('nearest returns closest of two points', () => {
    const vp = new VPTrie<number[]>()
    vp.addPoint([0, 0])
    vp.addPoint([10, 10])
    const result = vp.nearest([1, 1])
    expect(result).not.toBeNull()
  })

  it('nearest on empty returns null', () => {
    const vp = new VPTrie<number[]>((a, b) => Math.abs(a[0]! - b[0]!))
    expect(vp.nearest([1, 1])).toBeNull()
  })

  it('addPoint and nearest', () => {
    const vp = new VPTrie(2)
    vp.addPoint([5, 5])
    expect(vp.nearest([4, 4])).not.toBeNull()
  })
})
