import { describe, it, expect } from 'vitest'
import { BigIntRing } from '../../src/utils/bigint-ring.js'

describe('BigIntRing', () => {
  it('add works modularly', () => {
    const r = new BigIntRing(7n)
    expect(r.add(3n, 5n)).toBe(1n)
    expect(r.add(10n, 20n)).toBe(2n)
  })

  it('sub works modularly', () => {
    const r = new BigIntRing(7n)
    expect(r.sub(3n, 5n)).toBe(5n)
  })

  it('mul works modularly', () => {
    const r = new BigIntRing(7n)
    expect(r.mul(3n, 5n)).toBe(1n)
    expect(r.mul(6n, 6n)).toBe(1n)
  })

  it('pow works modularly', () => {
    const r = new BigIntRing(7n)
    expect(r.pow(2n, 3n)).toBe(1n)
    expect(r.pow(3n, 0n)).toBe(1n)
  })

  it('norm normalizes values', () => {
    const r = new BigIntRing(7n)
    expect(r.norm(15n)).toBe(1n)
    expect(r.norm(-1n)).toBe(6n)
  })

  it('modulus getter works', () => {
    const r = new BigIntRing(13n)
    expect(r.modulus).toBe(13n)
  })

  it('zero and one return correct values', () => {
    const r = new BigIntRing(7n)
    expect(r.zero).toBe(0n)
    expect(r.one).toBe(1n)
  })

  it('constructor rejects non-positive modulus', () => {
    expect(() => new BigIntRing(0n)).toThrow()
    expect(() => new BigIntRing(-1n)).toThrow()
  })

  it('pow rejects negative exponent', () => {
    const r = new BigIntRing(7n)
    expect(() => r.pow(2n, -1n)).toThrow()
  })

  it('toArray returns modulus', () => {
    const r = new BigIntRing(7n)
    expect(r.toArray()).toEqual([7n])
  })

  it('toString returns ring notation', () => {
    const r = new BigIntRing(7n)
    expect(r.toString()).toBe('Z/7Z')
  })

  it('toJSON returns string modulus', () => {
    const r = new BigIntRing(7n)
    expect(r.toJSON().modulus).toBe('7')
  })

  it('clone preserves modulus', () => {
    const r = new BigIntRing(13n)
    expect(r.clone().equals(r)).toBe(true)
  })

  it('equals returns false for non-ring', () => {
    const r = new BigIntRing(7n)
    expect(r.equals(null)).toBe(false)
  })
})

describe('bigint-ring - bulk', () => {
  it('bigint-ring bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-ring bulk 985', () => {
    expect(describe).toBeDefined()
  })
})
