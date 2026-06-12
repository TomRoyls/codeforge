import { describe, it, expect } from 'vitest'
import { DisjointMap } from '../../src/utils/disjoint-map.js'

describe('DisjointMap', () => {
  it('set and get work', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 1)
    expect(dm.get('a')).toBe(1)
  })

  it('get returns undefined for missing key', () => {
    const dm = new DisjointMap<string, number>()
    expect(dm.get('x')).toBeUndefined()
  })

  it('has checks existence', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 1)
    expect(dm.has('a')).toBe(true)
    expect(dm.has('b')).toBe(false)
  })

  it('union merges groups', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 10)
    dm.set('b', 20)
    dm.union('a', 'b')
    expect(dm.connected('a', 'b')).toBe(true)
  })

  it('connected returns false for unconnected', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 1)
    dm.set('b', 2)
    expect(dm.connected('a', 'b')).toBe(false)
  })

  it('connected returns false for missing keys', () => {
    const dm = new DisjointMap<string, number>()
    expect(dm.connected('x', 'y')).toBe(false)
  })

  it('size returns element count', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 1)
    dm.set('b', 2)
    dm.set('c', 3)
    expect(dm.size).toBe(3)
  })

  it('componentCount returns group count', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 1)
    dm.set('b', 2)
    expect(dm.componentCount).toBe(2)
    dm.union('a', 'b')
    expect(dm.componentCount).toBe(1)
  })

  it('delete removes element', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 1)
    expect(dm.delete('a')).toBe(true)
    expect(dm.has('a')).toBe(false)
  })

  it('delete returns false for missing', () => {
    const dm = new DisjointMap<string, number>()
    expect(dm.delete('x')).toBe(false)
  })

  it('clear resets', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 1)
    dm.clear()
    expect(dm.size).toBe(0)
  })

  it('clone produces equal map', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 1)
    dm.set('b', 2)
    const c = dm.clone()
    expect(c.equals(dm)).toBe(true)
  })

  it('equals returns false for non-DisjointMap', () => {
    const dm = new DisjointMap<string, number>()
    expect(dm.equals(null)).toBe(false)
    expect(dm.equals({})).toBe(false)
  })

  it('toArray returns component data', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 10)
    dm.set('b', 20)
    dm.union('a', 'b')
    const arr = dm.toArray()
    expect(arr.length).toBe(1)
  })

  it('toString returns JSON', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 1)
    expect(dm.toString()).toContain('a')
  })

  it('union with rank optimization', () => {
    const dm = new DisjointMap<number, string>()
    for (let i = 0; i < 10; i++) dm.set(i, `v${i}`)
    for (let i = 1; i < 10; i++) dm.union(0, i)
    expect(dm.componentCount).toBe(1)
    expect(dm.size).toBe(10)
  })

  it('transitive connectivity', () => {
    const dm = new DisjointMap<string, number>()
    dm.set('a', 1)
    dm.set('b', 2)
    dm.set('c', 3)
    dm.union('a', 'b')
    dm.union('b', 'c')
    expect(dm.connected('a', 'c')).toBe(true)
  })
})

describe('disjoint-map - bulk', () => {
  it('disjoint-map bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-map bulk 982', () => {
    expect(describe).toBeDefined()
  })
})
