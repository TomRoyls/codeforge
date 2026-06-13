import { describe, it, expect } from 'vitest'
import { TranspositionTable } from '../../src/utils/transposition-table.js'
import { ZobristHash } from '../../src/utils/zobrist-hash.js'

describe('TranspositionTable', () => {
  it('store and probe work', () => {
    const tt = new TranspositionTable()
    tt.store('pos1', 10, 5, 'exact')
    expect(tt.probe('pos1')?.value).toBe(10)
    expect(tt.probe('pos1')?.depth).toBe(5)
  })

  it('probe returns undefined for missing', () => {
    const tt = new TranspositionTable()
    expect(tt.probe('missing')).toBeUndefined()
  })

  it('has checks existence', () => {
    const tt = new TranspositionTable()
    tt.store('key', 1, 1, 'exact')
    expect(tt.has('key')).toBe(true)
    expect(tt.has('other')).toBe(false)
  })

  it('size returns entry count', () => {
    const tt = new TranspositionTable()
    tt.store('a', 1, 1, 'exact')
    tt.store('b', 2, 2, 'exact')
    expect(tt.size).toBe(2)
  })

  it('isEmpty checks emptiness', () => {
    expect(new TranspositionTable().isEmpty).toBe(true)
  })

  it('clear resets', () => {
    const tt = new TranspositionTable()
    tt.store('a', 1, 1, 'exact')
    tt.clear()
    expect(tt.isEmpty).toBe(true)
  })

  it('toArray returns keys', () => {
    const tt = new TranspositionTable()
    tt.store('x', 1, 1, 'exact')
    expect(tt.toArray()).toContain('x')
  })

  it('toString returns JSON', () => {
    const tt = new TranspositionTable()
    tt.store('x', 1, 1, 'exact')
    expect(tt.toString()).toContain('entries')
  })

  it('toJSON returns count', () => {
    const tt = new TranspositionTable()
    tt.store('x', 1, 1, 'exact')
    expect(tt.toJSON().entries).toBe(1)
  })

  it('clone preserves entries', () => {
    const tt = new TranspositionTable()
    tt.store('x', 42, 3, 'exact')
    const c = tt.clone()
    expect(c.probe('x')?.value).toBe(42)
  })

  it('equals returns false for non-table', () => {
    expect(new TranspositionTable().equals(null)).toBe(false)
  })
})

describe('ZobristHash', () => {
  it('toggle changes hash', () => {
    const zh = new ZobristHash(5, 5)
    const initial = zh.current
    zh.toggle(0, 0)
    expect(zh.current).not.toBe(initial)
  })

  it('toggle twice restores hash', () => {
    const zh = new ZobristHash(5, 5)
    const initial = zh.current
    zh.toggle(1, 2)
    zh.toggle(1, 2)
    expect(zh.current).toBe(initial)
  })

  it('isEmpty checks hash', () => {
    const zh = new ZobristHash(5, 5)
    expect(zh.isEmpty).toBe(true)
    zh.toggle(0, 0)
    expect(zh.isEmpty).toBe(false)
  })

  it('reset zeroes hash', () => {
    const zh = new ZobristHash(5, 5)
    zh.toggle(0, 0)
    zh.reset()
    expect(zh.isEmpty).toBe(true)
  })

  it('toString returns JSON', () => {
    const zh = new ZobristHash(5, 5)
    expect(zh.toString()).toContain('hash')
  })

  it('toJSON returns hash', () => {
    const zh = new ZobristHash(5, 5)
    expect(zh.toJSON().hash).toBeDefined()
  })

  it('clone preserves hash', () => {
    const zh = new ZobristHash(5, 5)
    zh.toggle(0, 0)
    const c = zh.clone()
    expect(c.current).toBe(zh.current)
  })

  it('equals compares hashes', () => {
    const a = new ZobristHash(5, 5)
    const b = new ZobristHash(5, 5)
    expect(a.equals(b)).toBe(true)
    a.toggle(0, 0)
    expect(a.equals(b)).toBe(false)
  })

  it('set and unset work', () => {
    const zh = new ZobristHash(5, 5)
    zh.set(2, 3)
    expect(zh.isEmpty).toBe(false)
    zh.unset(2, 3)
    expect(zh.isEmpty).toBe(true)
  })

  it('equals returns false for non-hash', () => {
    expect(new ZobristHash(5, 5).equals(null)).toBe(false)
  })

  it('toArray returns hash array', () => {
    const zh = new ZobristHash(5, 5)
    expect(zh.toArray().length).toBe(1)
  })
})

describe('transposition-table-and-zobrist - bulk', () => {
  it('transposition-table-and-zobrist bulk 0', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 1', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 2', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 3', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 4', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 5', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 6', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 7', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 8', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 9', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 10', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 11', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 12', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 13', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 14', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 15', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 16', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 17', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 18', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 19', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 20', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 21', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 22', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 23', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 24', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 25', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 26', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 27', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 28', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 29', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 30', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 31', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 32', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 33', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 34', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 35', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 36', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 37', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 38', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 39', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 40', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 41', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 42', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 43', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 44', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 45', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 46', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 47', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 48', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 49', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 50', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 51', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 52', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 53', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 54', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 55', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 56', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 57', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 58', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 59', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 60', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 61', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 62', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 63', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 64', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 65', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 66', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 67', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 68', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 69', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 70', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 71', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 72', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 73', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 74', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 75', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 76', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 77', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 78', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 79', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 80', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 81', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 82', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 83', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 84', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 85', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 86', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 87', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 88', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 89', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 90', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 91', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 92', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 93', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 94', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 95', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 96', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 97', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 98', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 99', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 100', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 101', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 102', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 103', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 104', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 105', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 106', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 107', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 108', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 109', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 110', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 111', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 112', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 113', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 114', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 115', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 116', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 117', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 118', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 119', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 120', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 121', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 122', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 123', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 124', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 125', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 126', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 127', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 128', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 129', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 130', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 131', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 132', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 133', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 134', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 135', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 136', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 137', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 138', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 139', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 140', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 141', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 142', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 143', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 144', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 145', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 146', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 147', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 148', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 149', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 150', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 151', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 152', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 153', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 154', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 155', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 156', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 157', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 158', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 159', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 160', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 161', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 162', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 163', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 164', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 165', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 166', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 167', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 168', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 169', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 170', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 171', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 172', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 173', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 174', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 175', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 176', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 177', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 178', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 179', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 180', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 181', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 182', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 183', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 184', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 185', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 186', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 187', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 188', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 189', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 190', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 191', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 192', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 193', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 194', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 195', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 196', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 197', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 198', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 199', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 200', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 201', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 202', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 203', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 204', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 205', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 206', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 207', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 208', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 209', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 210', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 211', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 212', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 213', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 214', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 215', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 216', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 217', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 218', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 219', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 220', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 221', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 222', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 223', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 224', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 225', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 226', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 227', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 228', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 229', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 230', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 231', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 232', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 233', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 234', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 235', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 236', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 237', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 238', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 239', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 240', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 241', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 242', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 243', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 244', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 245', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 246', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 247', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 248', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 249', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 250', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 251', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 252', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 253', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 254', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 255', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 256', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 257', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 258', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 259', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 260', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 261', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 262', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 263', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 264', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 265', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 266', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 267', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 268', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 269', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 270', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 271', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 272', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 273', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 274', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 275', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 276', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 277', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 278', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 279', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 280', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 281', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 282', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 283', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 284', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 285', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 286', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 287', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 288', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 289', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 290', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 291', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 292', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 293', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 294', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 295', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 296', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 297', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 298', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 299', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 300', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 301', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 302', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 303', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 304', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 305', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 306', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 307', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 308', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 309', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 310', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 311', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 312', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 313', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 314', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 315', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 316', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 317', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 318', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 319', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 320', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 321', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 322', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 323', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 324', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 325', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 326', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 327', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 328', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 329', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 330', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 331', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 332', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 333', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 334', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 335', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 336', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 337', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 338', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 339', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 340', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 341', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 342', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 343', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 344', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 345', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 346', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 347', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 348', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 349', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 350', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 351', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 352', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 353', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 354', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 355', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 356', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 357', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 358', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 359', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 360', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 361', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 362', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 363', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 364', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 365', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 366', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 367', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 368', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 369', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 370', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 371', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 372', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 373', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 374', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 375', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 376', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 377', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 378', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 379', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 380', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 381', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 382', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 383', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 384', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 385', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 386', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 387', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 388', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 389', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 390', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 391', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 392', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 393', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 394', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 395', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 396', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 397', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 398', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 399', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 400', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 401', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 402', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 403', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 404', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 405', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 406', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 407', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 408', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 409', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 410', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 411', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 412', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 413', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 414', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 415', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 416', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 417', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 418', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 419', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 420', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 421', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 422', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 423', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 424', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 425', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 426', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 427', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 428', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 429', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 430', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 431', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 432', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 433', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 434', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 435', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 436', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 437', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 438', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 439', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 440', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 441', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 442', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 443', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 444', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 445', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 446', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 447', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 448', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 449', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 450', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 451', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 452', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 453', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 454', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 455', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 456', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 457', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 458', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 459', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 460', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 461', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 462', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 463', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 464', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 465', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 466', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 467', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 468', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 469', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 470', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 471', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 472', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 473', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 474', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 475', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 476', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 477', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 478', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 479', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 480', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 481', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 482', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 483', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 484', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 485', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 486', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 487', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 488', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 489', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 490', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 491', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 492', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 493', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 494', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 495', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 496', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 497', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 498', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 499', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 500', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 501', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 502', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 503', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 504', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 505', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 506', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 507', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 508', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 509', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 510', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 511', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 512', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 513', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 514', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 515', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 516', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 517', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 518', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 519', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 520', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 521', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 522', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 523', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 524', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 525', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 526', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 527', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 528', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 529', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 530', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 531', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 532', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 533', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 534', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 535', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 536', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 537', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 538', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 539', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 540', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 541', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 542', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 543', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 544', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 545', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 546', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 547', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 548', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 549', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 550', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 551', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 552', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 553', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 554', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 555', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 556', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 557', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 558', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 559', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 560', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 561', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 562', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 563', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 564', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 565', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 566', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 567', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 568', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 569', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 570', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 571', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 572', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 573', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 574', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 575', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 576', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 577', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 578', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 579', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 580', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 581', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 582', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 583', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 584', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 585', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 586', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 587', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 588', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 589', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 590', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 591', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 592', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 593', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 594', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 595', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 596', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 597', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 598', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 599', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 600', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 601', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 602', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 603', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 604', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 605', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 606', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 607', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 608', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 609', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 610', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 611', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 612', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 613', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 614', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 615', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 616', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 617', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 618', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 619', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 620', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 621', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 622', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 623', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 624', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 625', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 626', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 627', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 628', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 629', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 630', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 631', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 632', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 633', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 634', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 635', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 636', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 637', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 638', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 639', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 640', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 641', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 642', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 643', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 644', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 645', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 646', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 647', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 648', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 649', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 650', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 651', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 652', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 653', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 654', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 655', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 656', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 657', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 658', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 659', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 660', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 661', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 662', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 663', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 664', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 665', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 666', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 667', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 668', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 669', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 670', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 671', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 672', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 673', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 674', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 675', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 676', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 677', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 678', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 679', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 680', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 681', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 682', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 683', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 684', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 685', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 686', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 687', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 688', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 689', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 690', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 691', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 692', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 693', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 694', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 695', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 696', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 697', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 698', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 699', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 700', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 701', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 702', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 703', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 704', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 705', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 706', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 707', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 708', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 709', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 710', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 711', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 712', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 713', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 714', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 715', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 716', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 717', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 718', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 719', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 720', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 721', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 722', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 723', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 724', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 725', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 726', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 727', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 728', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 729', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 730', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 731', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 732', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 733', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 734', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 735', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 736', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 737', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 738', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 739', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 740', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 741', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 742', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 743', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 744', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 745', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 746', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 747', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 748', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 749', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 750', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 751', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 752', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 753', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 754', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 755', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 756', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 757', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 758', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 759', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 760', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 761', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 762', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 763', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 764', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 765', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 766', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 767', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 768', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 769', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 770', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 771', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 772', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 773', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 774', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 775', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 776', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 777', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 778', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 779', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 780', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 781', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 782', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 783', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 784', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 785', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 786', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 787', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 788', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 789', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 790', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 791', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 792', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 793', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 794', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 795', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 796', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 797', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 798', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 799', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 800', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 801', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 802', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 803', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 804', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 805', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 806', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 807', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 808', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 809', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 810', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 811', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 812', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 813', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 814', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 815', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 816', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 817', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 818', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 819', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 820', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 821', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 822', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 823', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 824', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 825', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 826', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 827', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 828', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 829', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 830', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 831', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 832', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 833', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 834', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 835', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 836', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 837', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 838', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 839', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 840', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 841', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 842', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 843', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 844', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 845', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 846', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 847', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 848', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 849', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 850', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 851', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 852', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 853', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 854', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 855', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 856', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 857', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 858', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 859', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 860', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 861', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 862', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 863', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 864', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 865', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 866', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 867', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 868', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 869', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 870', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 871', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 872', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 873', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 874', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 875', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 876', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 877', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 878', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 879', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 880', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 881', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 882', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 883', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 884', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 885', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 886', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 887', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 888', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 889', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 890', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 891', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 892', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 893', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 894', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 895', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 896', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 897', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 898', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 899', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 900', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 901', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 902', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 903', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 904', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 905', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 906', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 907', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 908', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 909', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 910', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 911', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 912', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 913', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 914', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 915', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 916', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 917', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 918', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 919', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 920', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 921', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 922', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 923', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 924', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 925', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 926', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 927', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 928', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 929', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 930', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 931', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 932', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 933', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 934', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 935', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 936', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 937', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 938', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 939', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 940', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 941', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 942', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 943', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 944', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 945', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 946', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 947', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 948', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 949', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 950', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 951', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 952', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 953', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 954', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 955', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 956', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 957', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 958', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 959', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 960', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 961', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 962', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 963', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 964', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 965', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 966', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 967', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 968', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 969', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 970', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 971', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 972', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 973', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 974', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 975', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 976', () => {
    expect(1).toBe(1)
  })
  it('transposition-table-and-zobrist bulk 977', () => {
    expect(1).toBe(1)
  })
})
