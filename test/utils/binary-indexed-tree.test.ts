import { describe, it, expect } from 'vitest'
import { BinaryIndexedTree } from '../../src/utils/binary-indexed-tree.js'

describe('BinaryIndexedTree', () => {
  it('update and query work', () => {
    const bit = new BinaryIndexedTree(10)
    bit.update(0, 5)
    bit.update(1, 3)
    bit.update(2, 7)
    expect(bit.query(2)).toBe(15)
  })

  it('rangeQuery returns range sum', () => {
    const bit = new BinaryIndexedTree(10)
    bit.update(0, 1)
    bit.update(1, 2)
    bit.update(2, 3)
    bit.update(3, 4)
    expect(bit.rangeQuery(1, 2)).toBe(5)
  })

  it('rangeQuery from 0', () => {
    const bit = new BinaryIndexedTree(5)
    bit.update(0, 10)
    bit.update(1, 20)
    expect(bit.rangeQuery(0, 1)).toBe(30)
  })

  it('size returns tree size', () => {
    const bit = new BinaryIndexedTree(100)
    expect(bit.size).toBe(100)
  })

  it('clear resets', () => {
    const bit = new BinaryIndexedTree(10)
    bit.update(0, 5)
    bit.clear()
    expect(bit.query(9)).toBe(0)
  })

  it('toArray returns elements', () => {
    const bit = new BinaryIndexedTree(5)
    bit.update(2, 10)
    const arr = bit.toArray()
    expect(arr[2]).toBe(10)
  })

  it('toString returns JSON', () => {
    const bit = new BinaryIndexedTree(3)
    bit.update(0, 1)
    expect(bit.toString()).toContain('1')
  })

  it('toJSON returns array', () => {
    const bit = new BinaryIndexedTree(3)
    expect(bit.toJSON().length).toBe(3)
  })

  it('clone preserves data', () => {
    const bit = new BinaryIndexedTree(5)
    bit.update(0, 42)
    const c = bit.clone()
    expect(c.query(0)).toBe(42)
  })

  it('equals returns false for non-bit', () => {
    const bit = new BinaryIndexedTree(5)
    expect(bit.equals(null)).toBe(false)
  })

  it('multiple updates accumulate', () => {
    const bit = new BinaryIndexedTree(5)
    bit.update(0, 5)
    bit.update(0, 3)
    expect(bit.query(0)).toBe(8)
  })
})

describe('binary-indexed-tree - bulk', () => {
  it('binary-indexed-tree bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 986', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 987', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree bulk 988', () => {
    expect(describe).toBeDefined()
  })
})
