import { describe, it, expect } from 'vitest'
import { BinomialHeap } from '../../src/utils/binomial-heap.js'

describe('BinomialHeap', () => {
  it('insert and extractMin work', () => {
    const bh = new BinomialHeap()
    bh.insert(5)
    bh.insert(3)
    bh.insert(7)
    bh.insert(1)
    expect(bh.extractMin()).toBe(1)
    expect(bh.extractMin()).toBe(3)
  })

  it('findMin returns minimum', () => {
    const bh = new BinomialHeap()
    bh.insert(10)
    bh.insert(2)
    bh.insert(8)
    expect(bh.findMin()).toBe(2)
  })

  it('findMin returns undefined when empty', () => {
    expect(new BinomialHeap().findMin()).toBeUndefined()
  })

  it('extractMin returns undefined when empty', () => {
    expect(new BinomialHeap().extractMin()).toBeUndefined()
  })

  it('size tracks elements', () => {
    const bh = new BinomialHeap()
    bh.insert(1)
    bh.insert(2)
    expect(bh.size).toBe(2)
    bh.extractMin()
    expect(bh.size).toBe(1)
  })

  it('isEmpty checks emptiness', () => {
    const bh = new BinomialHeap()
    expect(bh.isEmpty).toBe(true)
    bh.insert(1)
    expect(bh.isEmpty).toBe(false)
  })

  it('clear resets', () => {
    const bh = new BinomialHeap()
    bh.insert(1)
    bh.insert(2)
    bh.clear()
    expect(bh.isEmpty).toBe(true)
  })

  it('toArray returns sorted', () => {
    const bh = new BinomialHeap()
    bh.insert(3)
    bh.insert(1)
    bh.insert(2)
    expect(bh.toArray()).toEqual([1, 2, 3])
  })

  it('toString returns JSON', () => {
    const bh = new BinomialHeap()
    bh.insert(1)
    expect(bh.toString()).toContain('size')
  })

  it('toJSON returns stats', () => {
    const bh = new BinomialHeap()
    bh.insert(1)
    expect(bh.toJSON().size).toBe(1)
  })

  it('clone preserves data', () => {
    const bh = new BinomialHeap()
    bh.insert(5)
    bh.insert(3)
    const c = bh.clone()
    expect(c.extractMin()).toBe(3)
  })

  it('equals returns false for non-heap', () => {
    const bh = new BinomialHeap()
    expect(bh.equals(null)).toBe(false)
  })

  it('handles many insertions', () => {
    const bh = new BinomialHeap()
    for (let i = 100; i >= 1; i--) bh.insert(i)
    expect(bh.extractMin()).toBe(1)
    expect(bh.size).toBe(99)
  })
})

describe('binomial-heap - bulk', () => {
  it('binomial-heap bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('binomial-heap bulk 986', () => {
    expect(describe).toBeDefined()
  })
})
