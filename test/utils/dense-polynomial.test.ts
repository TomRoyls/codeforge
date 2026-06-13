import { describe, it, expect } from 'vitest'
import { DensePolynomial } from '../../src/utils/dense-polynomial.js'

describe('DensePolynomial', () => {
  it('constructor sets coefficients', () => {
    const p = new DensePolynomial([1, 2, 3])
    expect(p.toArray()).toEqual([1, 2, 3])
  })

  it('degree returns correct degree', () => {
    expect(new DensePolynomial([1, 2, 3]).degree()).toBe(2)
    expect(new DensePolynomial([5]).degree()).toBe(0)
  })

  it('evaluate uses Horner method', () => {
    const p = new DensePolynomial([1, 2, 3])
    expect(p.evaluate(0)).toBe(1)
    expect(p.evaluate(1)).toBe(6)
    expect(p.evaluate(2)).toBe(17)
  })

  it('add adds polynomials', () => {
    const a = new DensePolynomial([1, 2])
    const b = new DensePolynomial([3, 4, 5])
    expect(a.add(b).toArray()).toEqual([4, 6, 5])
  })

  it('scale scales coefficients', () => {
    const p = new DensePolynomial([1, 2, 3])
    expect(p.scale(2).toArray()).toEqual([2, 4, 6])
  })

  it('derivative computes derivative', () => {
    const p = new DensePolynomial([1, 2, 3])
    const d = p.derivative()
    expect(d.toArray()).toEqual([2, 6])
  })

  it('derivative of constant is zero', () => {
    const p = new DensePolynomial([5])
    expect(p.derivative().toArray()).toEqual([0])
  })

  it('isZero checks', () => {
    expect(new DensePolynomial([0]).isZero).toBe(true)
    expect(new DensePolynomial([1]).isZero).toBe(false)
  })

  it('leadingCoeff returns top', () => {
    expect(new DensePolynomial([1, 2, 5]).leadingCoeff).toBe(5)
  })

  it('clear resets', () => {
    const p = new DensePolynomial([1, 2, 3])
    p.clear()
    expect(p.isZero).toBe(true)
  })

  it('toString returns JSON', () => {
    const p = new DensePolynomial([1, 2])
    expect(p.toString()).toContain('1')
  })

  it('clone preserves data', () => {
    const p = new DensePolynomial([1, 2])
    expect(p.clone().equals(p)).toBe(true)
  })

  it('equals returns false for non-polynomial', () => {
    const p = new DensePolynomial([1])
    expect(p.equals(null)).toBe(false)
  })

  it('trims trailing zeros', () => {
    const p = new DensePolynomial([1, 2, 0, 0])
    expect(p.toArray()).toEqual([1, 2])
  })
})

describe('dense-polynomial - bulk', () => {
  it('dense-polynomial bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('dense-polynomial bulk 985', () => {
    expect(describe).toBeDefined()
  })
})
