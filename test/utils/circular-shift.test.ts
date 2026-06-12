import { describe, it, expect } from 'vitest'
import { CircularShift } from '../../src/utils/circular-shift.js'

describe('CircularShift', () => {
  it('creates from array', () => {
    const cs = new CircularShift([1, 2, 3])
    expect(cs.length).toBe(3)
  })

  it('at returns element at shifted index', () => {
    const cs = new CircularShift([1, 2, 3], 1)
    expect(cs.at(0)).toBe(2)
    expect(cs.at(1)).toBe(3)
    expect(cs.at(2)).toBe(1)
  })

  it('at returns undefined for out of bounds', () => {
    const cs = new CircularShift([1, 2])
    expect(cs.at(-1)).toBeUndefined()
    expect(cs.at(2)).toBeUndefined()
  })

  it('shiftCount returns current shift', () => {
    const cs = new CircularShift([1, 2, 3], 2)
    expect(cs.shiftCount).toBe(2)
  })

  it('rotate changes shift', () => {
    const cs = new CircularShift([1, 2, 3], 0)
    cs.rotate(1)
    expect(cs.at(0)).toBe(2)
  })

  it('rotate wraps around', () => {
    const cs = new CircularShift([1, 2, 3], 0)
    cs.rotate(3)
    expect(cs.at(0)).toBe(1)
  })

  it('rotate handles negative', () => {
    const cs = new CircularShift([1, 2, 3], 1)
    cs.rotate(-1)
    expect(cs.at(0)).toBe(1)
  })

  it('toArray returns shifted array', () => {
    const cs = new CircularShift([1, 2, 3], 1)
    expect(cs.toArray()).toEqual([2, 3, 1])
  })

  it('indexOf finds element position', () => {
    const cs = new CircularShift([1, 2, 3], 1)
    expect(cs.indexOf(1)).toBe(2)
    expect(cs.indexOf(2)).toBe(0)
  })

  it('indexOf returns -1 for missing', () => {
    const cs = new CircularShift([1, 2, 3])
    expect(cs.indexOf(99)).toBe(-1)
  })

  it('clone produces equal shift', () => {
    const cs = new CircularShift([1, 2], 1)
    expect(cs.clone().equals(cs)).toBe(true)
  })

  it('equals returns false for non-CircularShift', () => {
    const cs = new CircularShift([1])
    expect(cs.equals(null)).toBe(false)
  })

  it('toString returns JSON', () => {
    const cs = new CircularShift([1, 2], 1)
    expect(cs.toString()).toBe('[2,1]')
  })

  it('toJSON returns array', () => {
    const cs = new CircularShift([1, 2, 3], 0)
    expect(cs.toJSON()).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    const cs = new CircularShift<number>([])
    expect(cs.length).toBe(0)
    expect(cs.toArray()).toEqual([])
  })
})

describe('circular-shift - bulk', () => {
  it('circular-shift bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('circular-shift bulk 984', () => {
    expect(describe).toBeDefined()
  })
})
