import { describe, it, expect } from 'vitest'
import { VersionVector } from '../../src/utils/version-vector.js'

// ─── Constructor ──────────────────────────────────────────
describe('VersionVector - constructor', () => {
  it('creates with nodeId', () => {
    const vv = new VersionVector({ nodeId: 'node-1' })
    expect(vv.getNodeId()).toBe('node-1')
    expect(vv.size).toBe(0)
  })
})

// ─── Increment ────────────────────────────────────────────
describe('VersionVector - increment', () => {
  it('increments own version', () => {
    const vv = new VersionVector({ nodeId: 'a' })
    expect(vv.increment()).toBe(1)
    expect(vv.increment()).toBe(2)
    expect(vv.get('a')).toBe(2)
  })

  it('returns 0 for unknown node', () => {
    const vv = new VersionVector({ nodeId: 'a' })
    expect(vv.get('b')).toBe(0)
  })
})

// ─── Merge ────────────────────────────────────────────────
describe('VersionVector - merge', () => {
  it('takes max version per node', () => {
    const vv1 = new VersionVector({ nodeId: 'a' })
    vv1.increment()
    const vv2 = new VersionVector({ nodeId: 'b' })
    vv2.increment()
    vv2.increment()
    vv1.merge(vv2)
    expect(vv1.get('a')).toBe(1)
    expect(vv1.get('b')).toBe(2)
  })
})

// ─── Compare ──────────────────────────────────────────────
describe('VersionVector - compare', () => {
  it('returns equal for identical vectors', () => {
    const vv1 = new VersionVector({ nodeId: 'a' })
    const vv2 = new VersionVector({ nodeId: 'a' })
    expect(vv1.compare(vv2)).toBe('equal')
  })

  it('returns before for older vector', () => {
    const vv1 = new VersionVector({ nodeId: 'a' })
    const vv2 = new VersionVector({ nodeId: 'a' })
    vv2.increment()
    expect(vv1.compare(vv2)).toBe('before')
  })

  it('returns after for newer vector', () => {
    const vv1 = new VersionVector({ nodeId: 'a' })
    const vv2 = new VersionVector({ nodeId: 'a' })
    vv1.increment()
    expect(vv1.compare(vv2)).toBe('after')
  })

  it('returns concurrent for divergent vectors', () => {
    const vv1 = new VersionVector({ nodeId: 'a' })
    vv1.increment()
    const vv2 = new VersionVector({ nodeId: 'b' })
    vv2.increment()
    expect(vv1.compare(vv2)).toBe('concurrent')
  })
})

// ─── Clone ────────────────────────────────────────────────
describe('VersionVector - clone', () => {
  it('creates independent copy', () => {
    const vv = new VersionVector({ nodeId: 'a' })
    vv.increment()
    const copy = vv.clone()
    vv.increment()
    expect(vv.get('a')).toBe(2)
    expect(copy.get('a')).toBe(1)
  })
})

// ─── toArray ───────────────────────────────────────────────
describe('VersionVector - toArray', () => {
  it('returns entries', () => {
    const vv = new VersionVector({ nodeId: 'a' })
    vv.increment()
    const arr = vv.toArray()
    expect(arr).toContainEqual(['a', 1])
  })
})
