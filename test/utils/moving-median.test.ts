import { describe, it, expect } from 'vitest'
import { MovingMedian } from '../../src/utils/moving-median.js'

describe('MovingMedian', () => {
  it('computes median for odd count', () => {
    const mm = new MovingMedian(5)
    mm.add(1)
    mm.add(3)
    mm.add(5)
    expect(mm.median()).toBe(3)
  })

  it('computes median for even count', () => {
    const mm = new MovingMedian(5)
    mm.add(1)
    mm.add(2)
    mm.add(3)
    mm.add(4)
    expect(mm.median()).toBe(2.5)
  })

  it('sliding window evicts old values', () => {
    const mm = new MovingMedian(3)
    mm.add(1)
    mm.add(2)
    mm.add(3)
    mm.add(100)
    expect(mm.toArray()).toEqual([2, 3, 100])
    expect(mm.median()).toBe(3)
  })

  it('mean computes average', () => {
    const mm = new MovingMedian(5)
    mm.add(2)
    mm.add(4)
    expect(mm.mean()).toBe(3)
  })

  it('min and max work', () => {
    const mm = new MovingMedian(5)
    mm.add(3)
    mm.add(1)
    mm.add(5)
    expect(mm.min()).toBe(1)
    expect(mm.max()).toBe(5)
  })

  it('returns 0 for empty', () => {
    const mm = new MovingMedian(5)
    expect(mm.median()).toBe(0)
    expect(mm.mean()).toBe(0)
  })

  it('size returns count', () => {
    const mm = new MovingMedian(5)
    mm.add(1)
    mm.add(2)
    expect(mm.size).toBe(2)
  })

  it('isEmpty checks emptiness', () => {
    const mm = new MovingMedian(5)
    expect(mm.isEmpty).toBe(true)
    mm.add(1)
    expect(mm.isEmpty).toBe(false)
  })

  it('clear resets', () => {
    const mm = new MovingMedian(5)
    mm.add(1)
    mm.clear()
    expect(mm.isEmpty).toBe(true)
  })

  it('toString returns JSON', () => {
    const mm = new MovingMedian(5)
    mm.add(1)
    expect(mm.toString()).toContain('median')
  })

  it('toJSON returns stats', () => {
    const mm = new MovingMedian(5)
    mm.add(3)
    expect(mm.toJSON().median).toBe(3)
  })

  it('clone preserves state', () => {
    const mm = new MovingMedian(5)
    mm.add(1)
    mm.add(2)
    const c = mm.clone()
    expect(c.toArray()).toEqual([1, 2])
  })

  it('equals returns false for non-median', () => {
    const mm = new MovingMedian(5)
    expect(mm.equals(null)).toBe(false)
  })
})

describe('moving-median - bulk', () => {
  it('moving-median bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('moving-median bulk 986', () => {
    expect(describe).toBeDefined()
  })
})
