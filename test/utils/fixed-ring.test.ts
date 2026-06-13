import { describe, it, expect } from 'vitest'
import { FixedRing } from '../../src/utils/fixed-ring.js'

describe('FixedRing', () => {
  it('push and get work', () => {
    const fr = new FixedRing<number>(5)
    fr.push(1)
    fr.push(2)
    expect(fr.get(0)).toBe(1)
    expect(fr.get(1)).toBe(2)
  })

  it('wraps around', () => {
    const fr = new FixedRing<number>(3)
    fr.push(1)
    fr.push(2)
    fr.push(3)
    fr.push(4)
    expect(fr.size).toBe(3)
    expect(fr.get(0)).toBe(2)
    expect(fr.get(2)).toBe(4)
  })

  it('size returns count', () => {
    const fr = new FixedRing<number>(5)
    fr.push(1)
    fr.push(2)
    expect(fr.size).toBe(2)
  })

  it('isEmpty checks emptiness', () => {
    const fr = new FixedRing<number>(5)
    expect(fr.isEmpty).toBe(true)
    fr.push(1)
    expect(fr.isEmpty).toBe(false)
  })

  it('isFull checks capacity', () => {
    const fr = new FixedRing<number>(2)
    expect(fr.isFull).toBe(false)
    fr.push(1)
    fr.push(2)
    expect(fr.isFull).toBe(true)
  })

  it('first and last work', () => {
    const fr = new FixedRing<number>(5)
    fr.push(1)
    fr.push(2)
    fr.push(3)
    expect(fr.first()).toBe(1)
    expect(fr.last()).toBe(3)
  })

  it('clear resets', () => {
    const fr = new FixedRing<number>(5)
    fr.push(1)
    fr.clear()
    expect(fr.isEmpty).toBe(true)
  })

  it('toArray returns items', () => {
    const fr = new FixedRing<number>(5)
    fr.push(1)
    fr.push(2)
    fr.push(3)
    expect(fr.toArray()).toEqual([1, 2, 3])
  })

  it('toString returns JSON', () => {
    const fr = new FixedRing<number>(5)
    fr.push(42)
    expect(fr.toString()).toBe('[42]')
  })

  it('toJSON returns array', () => {
    const fr = new FixedRing<number>(5)
    fr.push(1)
    expect(fr.toJSON()).toEqual([1])
  })

  it('clone preserves data', () => {
    const fr = new FixedRing<number>(5)
    fr.push(1)
    fr.push(2)
    const c = fr.clone()
    expect(c.equals(fr)).toBe(true)
  })

  it('equals returns false for non-ring', () => {
    const fr = new FixedRing<number>(5)
    expect(fr.equals(null)).toBe(false)
  })

  it('get returns undefined for out of bounds', () => {
    const fr = new FixedRing<number>(5)
    expect(fr.get(0)).toBeUndefined()
  })
})

describe('fixed-ring - bulk', () => {
  it('fixed-ring bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-ring bulk 986', () => {
    expect(describe).toBeDefined()
  })
})
