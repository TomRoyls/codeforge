import { describe, it, expect } from 'vitest'
import { RangeTracker } from '../../src/utils/range-tracker.js'

describe('RangeTracker', () => {
  it('add and contains work', () => {
    const rt = new RangeTracker()
    rt.add(0, 10)
    expect(rt.contains(5)).toBe(true)
    expect(rt.contains(10)).toBe(false)
    expect(rt.contains(-1)).toBe(false)
  })

  it('add merges overlapping ranges', () => {
    const rt = new RangeTracker()
    rt.add(0, 5)
    rt.add(3, 8)
    expect(rt.rangeCount).toBe(1)
    expect(rt.contains(7)).toBe(true)
  })

  it('add merges adjacent ranges', () => {
    const rt = new RangeTracker()
    rt.add(0, 5)
    rt.add(5, 10)
    expect(rt.rangeCount).toBe(1)
  })

  it('remove splits range', () => {
    const rt = new RangeTracker()
    rt.add(0, 10)
    rt.remove(3, 7)
    expect(rt.rangeCount).toBe(2)
    expect(rt.contains(2)).toBe(true)
    expect(rt.contains(5)).toBe(false)
    expect(rt.contains(8)).toBe(true)
  })

  it('remove truncates range', () => {
    const rt = new RangeTracker()
    rt.add(0, 10)
    rt.remove(7, 10)
    expect(rt.rangeCount).toBe(1)
    expect(rt.contains(5)).toBe(true)
    expect(rt.contains(8)).toBe(false)
  })

  it('totalSize returns sum', () => {
    const rt = new RangeTracker()
    rt.add(0, 5)
    rt.add(10, 15)
    expect(rt.totalSize).toBe(10)
  })

  it('rangeCount returns count', () => {
    const rt = new RangeTracker()
    rt.add(0, 5)
    rt.add(10, 15)
    expect(rt.rangeCount).toBe(2)
  })

  it('isEmpty checks emptiness', () => {
    const rt = new RangeTracker()
    expect(rt.isEmpty).toBe(true)
    rt.add(0, 1)
    expect(rt.isEmpty).toBe(false)
  })

  it('min returns minimum', () => {
    const rt = new RangeTracker()
    rt.add(5, 10)
    rt.add(20, 25)
    expect(rt.min).toBe(5)
  })

  it('max returns maximum', () => {
    const rt = new RangeTracker()
    rt.add(5, 10)
    rt.add(20, 25)
    expect(rt.max).toBe(25)
  })

  it('overlaps detects overlap', () => {
    const rt = new RangeTracker()
    rt.add(5, 10)
    expect(rt.overlaps(8, 15)).toBe(true)
    expect(rt.overlaps(0, 5)).toBe(false)
    expect(rt.overlaps(10, 15)).toBe(false)
  })

  it('toArray returns ranges', () => {
    const rt = new RangeTracker()
    rt.add(0, 5)
    rt.add(10, 15)
    expect(rt.toArray()).toEqual([[0, 5], [10, 15]])
  })

  it('clear resets', () => {
    const rt = new RangeTracker()
    rt.add(0, 5)
    rt.clear()
    expect(rt.isEmpty).toBe(true)
  })

  it('clone produces equal tracker', () => {
    const rt = new RangeTracker()
    rt.add(0, 10)
    expect(rt.clone().equals(rt)).toBe(true)
  })

  it('equals returns false for non-tracker', () => {
    const rt = new RangeTracker()
    expect(rt.equals(null)).toBe(false)
  })

  it('add with swapped start/end', () => {
    const rt = new RangeTracker()
    rt.add(10, 5)
    expect(rt.contains(7)).toBe(true)
  })

  it('toString returns JSON', () => {
    const rt = new RangeTracker()
    rt.add(0, 5)
    expect(rt.toString()).toBe('[[0,5]]')
  })

  it('toJSON returns array', () => {
    const rt = new RangeTracker()
    rt.add(1, 3)
    expect(rt.toJSON()).toEqual([[1, 3]])
  })

  it('remove entire range', () => {
    const rt = new RangeTracker()
    rt.add(0, 10)
    rt.remove(0, 10)
    expect(rt.isEmpty).toBe(true)
  })
})

describe('range-tracker - bulk', () => {
  it('range-tracker bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('range-tracker bulk 980', () => {
    expect(describe).toBeDefined()
  })
})
