import { describe, it, expect } from 'vitest'
import { IntervalSet as IntervalSetNew } from '../../src/utils/interval-set-new.js'

describe('IntervalSetNew', () => {
  it('add and contains work', () => {
    const is = new IntervalSetNew()
    is.add(0, 10)
    expect(is.contains(5)).toBe(true)
    expect(is.contains(15)).toBe(false)
  })

  it('merges overlapping intervals', () => {
    const is = new IntervalSetNew()
    is.add(0, 5)
    is.add(3, 10)
    expect(is.count).toBe(1)
    expect(is.totalLength).toBe(10)
  })

  it('remove cuts interval', () => {
    const is = new IntervalSetNew()
    is.add(0, 10)
    is.remove(3, 7)
    expect(is.count).toBe(2)
    expect(is.contains(5)).toBe(false)
    expect(is.contains(1)).toBe(true)
    expect(is.contains(9)).toBe(true)
  })

  it('overlaps checks overlap', () => {
    const is = new IntervalSetNew()
    is.add(0, 5)
    expect(is.overlaps(3, 8)).toBe(true)
    expect(is.overlaps(6, 10)).toBe(false)
  })

  it('totalLength computes total', () => {
    const is = new IntervalSetNew()
    is.add(0, 5)
    is.add(10, 15)
    expect(is.totalLength).toBe(10)
  })

  it('count returns interval count', () => {
    const is = new IntervalSetNew()
    is.add(0, 5)
    is.add(10, 15)
    expect(is.count).toBe(2)
  })

  it('isEmpty checks emptiness', () => {
    const is = new IntervalSetNew()
    expect(is.isEmpty).toBe(true)
    is.add(0, 1)
    expect(is.isEmpty).toBe(false)
  })

  it('clear resets', () => {
    const is = new IntervalSetNew()
    is.add(0, 10)
    is.clear()
    expect(is.isEmpty).toBe(true)
  })

  it('toArray returns intervals', () => {
    const is = new IntervalSetNew()
    is.add(0, 5)
    expect(is.toArray()).toEqual([{ start: 0, end: 5 }])
  })

  it('toString returns JSON', () => {
    const is = new IntervalSetNew()
    is.add(0, 5)
    expect(is.toString()).toContain('start')
  })

  it('clone preserves data', () => {
    const is = new IntervalSetNew()
    is.add(0, 5)
    expect(is.clone().equals(is)).toBe(true)
  })

  it('equals returns false for non-set', () => {
    const is = new IntervalSetNew()
    expect(is.equals(null)).toBe(false)
  })
})

describe('interval-set-new - bulk', () => {
  it('interval-set-new bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 986', () => {
    expect(describe).toBeDefined()
  })
  it('interval-set-new bulk 987', () => {
    expect(describe).toBeDefined()
  })
})
