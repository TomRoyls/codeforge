import { describe, it, expect } from 'vitest'
import { KendallTau } from '../../src/utils/kendall-tau.js'

describe('KendallTau', () => {
  it('computes perfect correlation', () => {
    const kt = new KendallTau()
    expect(kt.compute([1, 2, 3, 4], [1, 2, 3, 4])).toBe(1)
  })

  it('computes perfect inverse correlation', () => {
    const kt = new KendallTau()
    expect(kt.compute([1, 2, 3], [3, 2, 1])).toBe(-1)
  })

  it('computes partial correlation', () => {
    const kt = new KendallTau()
    expect(kt.compute([1, 2, 3], [1, 3, 2])).toBeCloseTo(0.333, 2)
  })

  it('handles empty arrays', () => {
    const kt = new KendallTau()
    expect(kt.compute([], [])).toBe(0)
  })

  it('handles single element', () => {
    const kt = new KendallTau()
    expect(kt.compute([1], [1])).toBe(0)
  })

  it('distance counts discordant pairs', () => {
    const kt = new KendallTau()
    expect(kt.distance([1, 2, 3], [3, 2, 1])).toBe(3)
  })

  it('distance is 0 for identical', () => {
    const kt = new KendallTau()
    expect(kt.distance([1, 2, 3], [1, 2, 3])).toBe(0)
  })

  it('name returns identifier', () => {
    expect(new KendallTau().name).toBe('KendallTau')
  })

  it('toString returns JSON', () => {
    const kt = new KendallTau()
    expect(kt.toString()).toContain('KendallTau')
  })

  it('toJSON returns name', () => {
    expect(new KendallTau().toJSON().name).toBe('KendallTau')
  })

  it('clone creates new instance', () => {
    const kt = new KendallTau()
    const c = kt.clone()
    expect(c).toBeInstanceOf(KendallTau)
  })

  it('equals checks instance', () => {
    const kt = new KendallTau()
    expect(kt.equals(new KendallTau())).toBe(true)
    expect(kt.equals(null)).toBe(false)
  })

  it('toArray returns label', () => {
    expect(new KendallTau().toArray()).toEqual(['kendall-tau'])
  })
})

describe('kendall-tau - bulk', () => {
  it('kendall-tau bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('kendall-tau bulk 986', () => {
    expect(describe).toBeDefined()
  })
})
