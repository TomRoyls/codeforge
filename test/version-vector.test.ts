import { describe, expect, it } from 'vitest'

import { VersionVector } from '../src/utils/version-vector.js'

// ─── increment/get ────────────────────────────────────
describe('VersionVector increment/get', () => {
  it('starts at 0 for own node', () => {
    const vv = new VersionVector({ nodeId: 'node-1' })
    expect(vv.get('node-1')).toBe(0)
  })

  it('increments own counter', () => {
    const vv = new VersionVector({ nodeId: 'node-1' })
    vv.increment()
    vv.increment()
    expect(vv.get('node-1')).toBe(2)
  })

  it('returns 0 for unknown node', () => {
    const vv = new VersionVector({ nodeId: 'a' })
    expect(vv.get('unknown')).toBe(0)
  })

  it('returns node ID', () => {
    const vv = new VersionVector({ nodeId: 'server-3' })
    expect(vv.getNodeId()).toBe('server-3')
  })
})

// ─── merge ────────────────────────────────────────────
describe('VersionVector merge', () => {
  it('merges higher version from other', () => {
    const vv1 = new VersionVector({ nodeId: 'a' })
    const vv2 = new VersionVector({ nodeId: 'b' })
    vv1.increment()
    vv2.increment()
    vv2.increment()

    vv1.merge(vv2)
    expect(vv1.get('a')).toBe(1)
    expect(vv1.get('b')).toBe(2)
  })

  it('keeps own higher version on merge', () => {
    const vv1 = new VersionVector({ nodeId: 'a' })
    const vv2 = new VersionVector({ nodeId: 'a' })
    vv1.increment()
    vv1.increment()
    vv1.increment()
    vv2.increment()

    vv1.merge(vv2)
    expect(vv1.get('a')).toBe(3)
  })
})

// ─── compare ──────────────────────────────────────────
describe('VersionVector compare', () => {
  it('returns equal for identical vectors', () => {
    const vv1 = new VersionVector({ nodeId: 'a' })
    const vv2 = new VersionVector({ nodeId: 'a' })
    expect(vv1.compare(vv2)).toBe('equal')
  })

  it('returns before when all versions are lower', () => {
    const vv1 = new VersionVector({ nodeId: 'a' })
    const vv2 = new VersionVector({ nodeId: 'a' })
    vv2.increment()
    expect(vv1.compare(vv2)).toBe('before')
  })

  it('returns after when all versions are higher', () => {
    const vv1 = new VersionVector({ nodeId: 'a' })
    const vv2 = new VersionVector({ nodeId: 'a' })
    vv1.increment()
    expect(vv1.compare(vv2)).toBe('after')
  })

  it('returns concurrent when versions diverge', () => {
    const vv1 = new VersionVector({ nodeId: 'a' })
    const vv2 = new VersionVector({ nodeId: 'b' })
    vv1.increment()
    vv2.increment()
    expect(vv1.compare(vv2)).toBe('concurrent')
  })
})

// ─── clone/toArray ────────────────────────────────────
describe('VersionVector clone', () => {
  it('clones independently', () => {
    const vv = new VersionVector({ nodeId: 'a' })
    vv.increment()
    const cloned = vv.clone()
    cloned.increment()
    expect(vv.get('a')).toBe(1)
    expect(cloned.get('a')).toBe(2)
  })

  it('toArray returns entries', () => {
    const vv = new VersionVector({ nodeId: 'a' })
    vv.increment()
    const entries = vv.toArray()
    expect(entries).toEqual([['a', 1]])
  })

  it('size tracks node count', () => {
    const vv = new VersionVector({ nodeId: 'a' })
    expect(vv.size).toBe(0)
    vv.increment()
    expect(vv.size).toBe(1)
  })
})
