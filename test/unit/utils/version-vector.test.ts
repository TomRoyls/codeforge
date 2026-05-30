import { describe, expect, it } from 'vitest'
import { VersionVector } from '../../../src/utils/version-vector.js'

describe('VersionVector', () => {
  it('should return 1 on first increment', () => {
    const vv = new VersionVector({ nodeId: 'node1' })
    expect(vv.increment()).toBe(1)
  })

  it('should return increasing versions on increment', () => {
    const vv = new VersionVector({ nodeId: 'node1' })
    expect(vv.increment()).toBe(1)
    expect(vv.increment()).toBe(2)
    expect(vv.increment()).toBe(3)
    expect(vv.increment()).toBe(4)
  })

  it('should return 0 for unknown nodes', () => {
    const vv = new VersionVector({ nodeId: 'node1' })
    vv.increment()
    expect(vv.get('node2')).toBe(0)
    expect(vv.get('node3')).toBe(0)
  })

  it('should return correct version for known nodes', () => {
    const vv = new VersionVector({ nodeId: 'node1' })
    vv.increment()
    vv.increment()
    expect(vv.get('node1')).toBe(2)
  })

  it('should compare equal vectors', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node1' })
    vv1.increment()
    vv2.increment()
    expect(vv1.compare(vv2)).toBe('equal')
  })

  it('should compare empty vectors as equal', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node2' })
    expect(vv1.compare(vv2)).toBe('equal')
  })

  it('should detect vector before another', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node1' })
    vv1.increment()
    vv2.increment()
    vv2.increment()
    expect(vv1.compare(vv2)).toBe('before')
    expect(vv2.compare(vv1)).toBe('after')
  })

  it('should detect vector after another', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node1' })
    vv2.increment()
    vv1.increment()
    vv1.increment()
    expect(vv1.compare(vv2)).toBe('after')
    expect(vv2.compare(vv1)).toBe('before')
  })

  it('should detect concurrent vectors', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node2' })
    vv1.increment()
    vv2.increment()
    expect(vv1.compare(vv2)).toBe('concurrent')
  })

  it('should merge vectors taking max', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node2' })
    vv1.increment()
    vv1.increment()
    vv2.increment()
    vv1.merge(vv2)
    expect(vv1.get('node1')).toBe(2)
    expect(vv1.get('node2')).toBe(1)
  })

  it('should merge vectors with same node', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node1' })
    vv1.increment()
    vv2.increment()
    vv2.increment()
    vv1.merge(vv2)
    expect(vv1.get('node1')).toBe(2)
  })

  it('should handle cross-node merge', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node2' })
    vv1.increment()
    vv1.increment()
    vv2.increment()
    vv2.increment()
    vv1.merge(vv2)
    expect(vv1.get('node1')).toBe(2)
    expect(vv1.get('node2')).toBe(2)
  })

  it('should clone vector', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    vv1.increment()
    vv1.increment()
    const vv2 = vv1.clone()
    expect(vv2.get('node1')).toBe(2)
    vv1.increment()
    expect(vv1.get('node1')).toBe(3)
    expect(vv2.get('node1')).toBe(2)
  })

  it('should convert to array', () => {
    const vv = new VersionVector({ nodeId: 'node1' })
    vv.increment()
    vv.increment()
    const arr = vv.toArray()
    expect(arr).toEqual([['node1', 2]])
  })

  it('should return size', () => {
    const vv = new VersionVector({ nodeId: 'node1' })
    expect(vv.size).toBe(0)
    vv.increment()
    expect(vv.size).toBe(1)
    vv.increment()
    expect(vv.size).toBe(1)
  })

  it('should get node id', () => {
    const vv = new VersionVector({ nodeId: 'node1' })
    expect(vv.getNodeId()).toBe('node1')
  })

  it('should handle multiple increments', () => {
    const vv = new VersionVector({ nodeId: 'node1' })
    for (let i = 0; i < 10; i++) {
      vv.increment()
    }
    expect(vv.get('node1')).toBe(10)
  })

  it('should detect concurrent with different increments', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node2' })
    vv1.increment()
    vv1.increment()
    vv2.increment()
    expect(vv1.compare(vv2)).toBe('concurrent')
  })

  it('should merge and result in equal', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node1' })
    vv1.increment()
    vv1.increment()
    vv2.increment()
    vv2.increment()
    expect(vv1.compare(vv2)).toBe('equal')
    vv1.merge(vv2)
    expect(vv1.compare(vv2)).toBe('equal')
  })

  it('should handle merge with larger version', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node2' })
    vv1.increment()
    vv2.increment()
    vv2.increment()
    vv2.increment()
    vv1.merge(vv2)
    expect(vv1.get('node1')).toBe(1)
    expect(vv1.get('node2')).toBe(3)
  })

  it('should not change original after merge', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node2' })
    vv1.increment()
    vv2.increment()
    const vv1Before = vv1.get('node1')
    vv2.merge(vv1)
    expect(vv1.get('node1')).toBe(vv1Before)
    expect(vv2.get('node1')).toBe(1)
    expect(vv2.get('node2')).toBe(1)
  })

  it('should handle three-way concurrent', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node2' })
    const vv3 = new VersionVector({ nodeId: 'node3' })
    vv1.increment()
    vv2.increment()
    vv3.increment()
    expect(vv1.compare(vv2)).toBe('concurrent')
    expect(vv2.compare(vv3)).toBe('concurrent')
    expect(vv1.compare(vv3)).toBe('concurrent')
  })

  it('should return empty array for empty vector', () => {
    const vv = new VersionVector({ nodeId: 'node1' })
    expect(vv.toArray()).toEqual([])
  })

  it('should maintain size after multiple increments on same node', () => {
    const vv = new VersionVector({ nodeId: 'node1' })
    vv.increment()
    vv.increment()
    vv.increment()
    expect(vv.size).toBe(1)
  })

  it('should handle complex merge scenario', () => {
    const vv1 = new VersionVector({ nodeId: 'node1' })
    const vv2 = new VersionVector({ nodeId: 'node2' })
    vv1.increment()
    vv1.increment()
    vv2.increment()
    vv1.merge(vv2)
    vv2.increment()
    vv2.increment()
    vv1.merge(vv2)
    expect(vv1.get('node1')).toBe(2)
    expect(vv1.get('node2')).toBe(3)
  })
})