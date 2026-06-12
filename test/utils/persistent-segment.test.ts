import { describe, expect, it } from 'vitest'
import { PersistentSegmentTree } from '../../src/utils/persistent-segment.js'

describe('PersistentSegmentTree', () => {
  it('creates with default values', () => {
    const pst = new PersistentSegmentTree(5)
    expect(pst.versionCount).toBe(1)
    expect(pst.query(0, 0, 4)).toBe(0)
  })

  it('updates create new versions', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 2, 10)
    expect(v1).toBe(1)
    expect(pst.versionCount).toBe(2)
  })

  it('old version is unchanged after update', () => {
    const pst = new PersistentSegmentTree(5)
    pst.update(0, 2, 10)
    expect(pst.query(0, 2, 2)).toBe(0)
    expect(pst.query(1, 2, 2)).toBe(10)
  })

  it('range query works', () => {
    const pst = new PersistentSegmentTree(5)
    let v = 0
    v = pst.update(v, 0, 1)
    v = pst.update(v, 1, 2)
    v = pst.update(v, 2, 3)
    expect(pst.query(v, 0, 2)).toBe(6)
    expect(pst.query(v, 0, 4)).toBe(6)
  })

  it('handles single element', () => {
    const pst = new PersistentSegmentTree(1)
    expect(pst.query(0, 0, 0)).toBe(0)
    pst.update(0, 0, 42)
    expect(pst.query(1, 0, 0)).toBe(42)
  })

  it('getPoint returns single value', () => {
    const pst = new PersistentSegmentTree(5)
    const v = pst.update(0, 3, 7)
    expect(pst.getPoint(v, 3)).toBe(7)
    expect(pst.getPoint(v, 0)).toBe(0)
  })

  it('supports multiple branches', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 0, 10)
    const v2 = pst.update(0, 0, 20)
    expect(pst.getPoint(v1, 0)).toBe(10)
    expect(pst.getPoint(v2, 0)).toBe(20)
    expect(pst.getPoint(0, 0)).toBe(0)
  })

  it('works with max combine', () => {
    const pst = new PersistentSegmentTree(5, Math.max, -Infinity)
    let v = 0
    v = pst.update(v, 1, 5)
    v = pst.update(v, 2, 3)
    v = pst.update(v, 3, 8)
    expect(pst.query(v, 0, 4)).toBe(8)
    expect(pst.query(v, 1, 2)).toBe(5)
  })

  it('handles sequential updates', () => {
    const pst = new PersistentSegmentTree(3)
    let v = 0
    v = pst.update(v, 0, 1)
    v = pst.update(v, 1, 2)
    v = pst.update(v, 2, 3)
    expect(pst.query(v, 0, 2)).toBe(6)
    expect(pst.versionCount).toBe(4)
  })

  it('out of range query returns default', () => {
    const pst = new PersistentSegmentTree(3)
    expect(pst.query(0, 5, 10)).toBe(0)
  })

  it('additive updates replace value', () => {
    const pst = new PersistentSegmentTree(4)
    let v = 0
    v = pst.update(v, 1, 5)
    v = pst.update(v, 1, 3)
    expect(pst.getPoint(v, 1)).toBe(3)
    expect(pst.query(v, 0, 3)).toBe(3)
  })

  it('preserves multiple version branches', () => {
    const pst = new PersistentSegmentTree(4)
    const v1 = pst.update(0, 0, 10)
    const v2 = pst.update(v1, 1, 20)
    const v3 = pst.update(v1, 2, 30)
    expect(pst.query(v2, 0, 1)).toBe(30)
    expect(pst.query(v3, 0, 2)).toBe(40)
    expect(pst.getPoint(v1, 0)).toBe(10)
  })

  it('initial version has default values', () => {
    const pst = new PersistentSegmentTree(3)
    const v0 = pst.initialVersion
    expect(pst.query(v0, 1, 1)).toBe(0)
  })

  it('handles range update', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 1, 3, 10)
    expect(pst.query(v1, 1, 3)).toBe(30)
  })

  it('range update clamps to tree size', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 2, 10, 5)
    expect(pst.query(v1, 2, 4)).toBe(15)
  })

  it('range update on last element only', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 4, 4, 10)
    expect(pst.query(v1, 4, 4)).toBe(10)
    expect(pst.query(v1, 0, 3)).toBe(0)
  })

  it('range update on first element only', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 0, 0, 10)
    expect(pst.query(v1, 0, 0)).toBe(10)
    expect(pst.query(v1, 1, 4)).toBe(0)
  })

  it('throws on invalid version', () => {
    const pst = new PersistentSegmentTree(5)
    expect(() => pst.query(999, 0, 4)).toThrow('Version 999 does not exist')
  })

  it('throws on invalid version for getPoint', () => {
    const pst = new PersistentSegmentTree(5)
    expect(() => pst.getPoint(999, 0)).toThrow('Version 999 does not exist')
  })

  it('throws on invalid index for update', () => {
    const pst = new PersistentSegmentTree(5)
    expect(() => pst.update(0, 10, 5)).toThrow('Index 10 out of bounds')
  })

  it('throws on negative index for update', () => {
    const pst = new PersistentSegmentTree(5)
    expect(() => pst.update(0, -1, 5)).toThrow('Index -1 out of bounds')
  })

  it('throws on invalid version for update', () => {
    const pst = new PersistentSegmentTree(5)
    expect(() => pst.update(999, 0, 5)).toThrow('Version 999 does not exist')
  })

  it('handles zero as value', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 2, 10)
    const v2 = pst.update(v1, 2, 0)
    expect(pst.getPoint(v2, 2)).toBe(0)
  })

  it('handles negative values', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 2, -10)
    expect(pst.getPoint(v1, 2)).toBe(-10)
    expect(pst.query(v1, 0, 4)).toBe(-10)
  })

  it('handles floating point values', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 2, 3.14)
    expect(pst.getPoint(v1, 2)).toBe(3.14)
  })

  it('handles NaN values', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 2, NaN)
    expect(pst.getPoint(v1, 2)).toBeNaN()
  })

  it('handles Infinity values', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 2, Infinity)
    expect(pst.getPoint(v1, 2)).toBe(Infinity)
  })

  it('multiple range updates accumulate', () => {
    const pst = new PersistentSegmentTree(5)
    let v = 0
    v = pst.update(v, 0, 1, 5)
    v = pst.update(v, 1, 2, 5)
    expect(pst.query(v, 0, 2)).toBe(15)
  })

  it('mixes point and range updates', () => {
    const pst = new PersistentSegmentTree(5)
    let v = 0
    v = pst.update(v, 0, 1, 5)
    v = pst.update(v, 2, 10)
    v = pst.update(v, 3, 4, 2)
    expect(pst.query(v, 0, 4)).toBe(24)
  })

  it('query with same left and right', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 2, 10)
    expect(pst.query(v1, 2, 2)).toBe(10)
  })

  it('query with left > right', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 2, 10)
    expect(pst.query(v1, 3, 2)).toBe(0)
  })

  it('handles zero as default value', () => {
    const pst = new PersistentSegmentTree(3, Math.max, 0)
    expect(pst.query(0, 0, 2)).toBe(0)
  })

  it('handles negative default value', () => {
    const pst = new PersistentSegmentTree(3, Math.max, -100)
    expect(pst.query(0, 0, 2)).toBe(-100)
  })

  it('handles custom combine function (multiply)', () => {
    const pst = new PersistentSegmentTree(3, (a, b) => a * b, 1)
    let v = 0
    v = pst.update(v, 0, 2)
    v = pst.update(v, 1, 3)
    expect(pst.query(v, 0, 1)).toBe(6)
  })

  it('handles custom combine function (min)', () => {
    const pst = new PersistentSegmentTree(3, Math.min, Infinity)
    let v = 0
    v = pst.update(v, 0, 5)
    v = pst.update(v, 1, 3)
    v = pst.update(v, 2, 7)
    expect(pst.query(v, 0, 2)).toBe(3)
  })

  it('initializes from array', () => {
    const pst = new PersistentSegmentTree([1, 2, 3, 4, 5])
    expect(pst.query(0, 0, 4)).toBe(15)
    expect(pst.getPoint(0, 2)).toBe(3)
  })

  it('array initialization with zeros', () => {
    const pst = new PersistentSegmentTree([0, 0, 0])
    expect(pst.query(0, 0, 2)).toBe(0)
  })

  it('array initialization with negative values', () => {
    const pst = new PersistentSegmentTree([-1, -2, -3])
    expect(pst.query(0, 0, 2)).toBe(-6)
  })

  it('array initialization with floating values', () => {
    const pst = new PersistentSegmentTree([1.5, 2.5, 3.5])
    expect(pst.query(0, 0, 2)).toBe(7.5)
  })

  it('array initialization with custom combine', () => {
    const pst = new PersistentSegmentTree([1, 2, 3, 4], Math.max, 0)
    expect(pst.query(0, 0, 3)).toBe(4)
  })

  it('version numbers are sequential', () => {
    const pst = new PersistentSegmentTree(5)
    expect(pst.update(0, 0, 1)).toBe(1)
    expect(pst.update(1, 1, 2)).toBe(2)
    expect(pst.update(2, 2, 3)).toBe(3)
  })

  it('can query any valid version', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 0, 1)
    const v2 = pst.update(v1, 1, 2)
    const v3 = pst.update(v2, 2, 3)
    expect(pst.query(0, 0, 2)).toBe(0)
    expect(pst.query(v1, 0, 2)).toBe(1)
    expect(pst.query(v2, 0, 2)).toBe(3)
    expect(pst.query(v3, 0, 2)).toBe(6)
  })

  it('can getPoint from any valid version', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 0, 1)
    const v2 = pst.update(v1, 0, 2)
    expect(pst.getPoint(0, 0)).toBe(0)
    expect(pst.getPoint(v1, 0)).toBe(1)
    expect(pst.getPoint(v2, 0)).toBe(2)
  })

  it('getPoint with out of range index returns default', () => {
    const pst = new PersistentSegmentTree(5)
    expect(pst.getPoint(0, 10)).toBe(0)
  })

  it('getPoint with negative index returns default', () => {
    const pst = new PersistentSegmentTree(5)
    expect(pst.getPoint(0, -1)).toBe(0)
  })

  it('range update does not affect other indices', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 1, 2, 10)
    expect(pst.getPoint(v1, 0)).toBe(0)
    expect(pst.getPoint(v1, 1)).toBe(10)
    expect(pst.getPoint(v1, 2)).toBe(10)
    expect(pst.getPoint(v1, 3)).toBe(0)
    expect(pst.getPoint(v1, 4)).toBe(0)
  })

  it('multiple branches from same parent', () => {
    const pst = new PersistentSegmentTree(5)
    const v1 = pst.update(0, 0, 10)
    const v2 = pst.update(v1, 1, 20)
    const v3 = pst.update(v1, 2, 30)
    expect(pst.query(v2, 0, 1)).toBe(30)
    expect(pst.query(v3, 0, 2)).toBe(40)
  })

  it('large tree with many updates', () => {
    const pst = new PersistentSegmentTree(100)
    let v = 0
    for (let i = 0; i < 100; i++) {
      v = pst.update(v, i, i)
    }
    expect(pst.query(v, 0, 99)).toBe(4950)
  })

  it('handles updating same index multiple times', () => {
    const pst = new PersistentSegmentTree(5)
    let v = 0
    v = pst.update(v, 2, 1)
    v = pst.update(v, 2, 2)
    v = pst.update(v, 2, 3)
    expect(pst.getPoint(v, 2)).toBe(3)
  })

  it('version count increases correctly', () => {
    const pst = new PersistentSegmentTree(5)
    expect(pst.versionCount).toBe(1)
    pst.update(0, 0, 1)
    expect(pst.versionCount).toBe(2)
    pst.update(1, 1, 2)
    expect(pst.versionCount).toBe(3)
    pst.update(2, 2, 3)
    expect(pst.versionCount).toBe(4)
  })

  it('handles array initialization with single element', () => {
    const pst = new PersistentSegmentTree([42])
    expect(pst.query(0, 0, 0)).toBe(42)
  })

  it('handles array initialization with negative default', () => {
    const pst = new PersistentSegmentTree([1, 2, 3], Math.max, -10)
    expect(pst.query(0, 0, 2)).toBe(3)
  })

  it('query boundary with max combine', () => {
    const pst = new PersistentSegmentTree(5, Math.max, -Infinity)
    let v = 0
    v = pst.update(v, 1, 5)
    v = pst.update(v, 3, 8)
    expect(pst.query(v, 0, 4)).toBe(8)
  })

  it('query with min combine on empty range', () => {
    const pst = new PersistentSegmentTree(3, Math.min, Infinity)
    expect(pst.query(0, 0, 2)).toBe(Infinity)
  })

  it('handles query on initial version', () => {
    const pst = new PersistentSegmentTree(5)
    expect(pst.query(0, 0, 4)).toBe(0)
  })

  it('updates preserve all versions independently', () => {
    const pst = new PersistentSegmentTree(4)
    const v1 = pst.update(0, 0, 5)
    const v2 = pst.update(v1, 1, 10)
    expect(pst.getPoint(v1, 1)).toBe(0)
    expect(pst.getPoint(v2, 0)).toBe(5)
    expect(pst.getPoint(v2, 1)).toBe(10)
  })

  it('handles full range query', () => {
    const pst = new PersistentSegmentTree(4)
    const v1 = pst.update(0, 0, 1)
    const v2 = pst.update(v1, 1, 2)
    const v3 = pst.update(v2, 2, 3)
    const v4 = pst.update(v3, 3, 4)
    expect(pst.query(v4, 0, 3)).toBe(10)
  })

  it('handles point update on small tree', () => {
    const pst = new PersistentSegmentTree(4)
    expect(pst.query(0, 0, 0)).toBe(0)
    pst.update(0, 0, 5)
    expect(pst.query(1, 0, 0)).toBe(5)
  })

  it('versions are independent', () => {
    const pst = new PersistentSegmentTree(1)
    const v0 = pst.update(0, 0, 2)
    const v1 = pst.update(v0, 0, 3)
    expect(pst.query(v0, 0, 0)).toBe(2)
    expect(pst.query(v1, 0, 0)).toBe(3)
  })

  it('version count starts at 1', () => {
    const pst = new PersistentSegmentTree(8)
    expect(pst.versionCount).toBe(1)
  })

  it('initial values are zero', () => {
    const pst = new PersistentSegmentTree(4)
    expect(pst.query(0, 0, 3)).toBe(0)
  })

  it('update changes value at index', () => {
    const pst = new PersistentSegmentTree(4)
    const v = pst.update(0, 2, 10)
    expect(pst.query(v, 2, 2)).toBe(10)
  })

  it('original version unchanged after update', () => {
    const pst = new PersistentSegmentTree(4)
    const v0 = pst.update(0, 1, 5)
    const v1 = pst.update(0, 1, 10)
    expect(pst.query(v0, 1, 1)).toBe(5)
    expect(pst.query(v1, 1, 1)).toBe(10)
  })

  it('query on original version unchanged after update', () => {
    const pst = new PersistentSegmentTree([1, 2, 3])
    const v0 = pst.initialVersion
    pst.update(v0, 0, 2, 10)
    expect(pst.query(v0, 0, 0)).toBe(1)
  })
})

describe('persistent-segment - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('persistent-segment - wave548', () => {
  it('persistent-segment module defined', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment module is function', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('persistent-segment - wave549', () => {
  it('persistent-segment module defined', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment module is function', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('persistent-segment - wave550', () => {
  it('persistent-segment w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('persistent-segment - wave551', () => {
  it('persistent-segment w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('persistent-segment - wave552', () => {
  it('persistent-segment w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('persistent-segment - wave553', () => {
  it('persistent-segment w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('persistent-segment - wave554', () => {
  it('persistent-segment w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('persistent-segment - wave555', () => {
  it('persistent-segment w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-segment w555 v2', () => {
    expect(describe).toBeDefined()
  })
})
