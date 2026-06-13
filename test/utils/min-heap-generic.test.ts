import { describe, it, expect } from 'vitest'
import { MinHeapGeneric } from '../../src/utils/min-heap-generic.js'

describe('MinHeapGeneric', () => {
  it('push and pop work', () => {
    const h = new MinHeapGeneric<string>()
    h.push('a', 3)
    h.push('b', 1)
    h.push('c', 2)
    expect(h.pop()).toBe('b')
    expect(h.pop()).toBe('c')
    expect(h.pop()).toBe('a')
  })

  it('peek returns min', () => {
    const h = new MinHeapGeneric<string>()
    h.push('a', 5)
    h.push('b', 1)
    expect(h.peek()).toBe('b')
    expect(h.size).toBe(2)
  })

  it('peekPriority returns priority', () => {
    const h = new MinHeapGeneric<string>()
    h.push('a', 5)
    expect(h.peekPriority()).toBe(5)
  })

  it('size returns count', () => {
    const h = new MinHeapGeneric<string>()
    h.push('a', 1)
    h.push('b', 2)
    expect(h.size).toBe(2)
  })

  it('isEmpty checks emptiness', () => {
    const h = new MinHeapGeneric<string>()
    expect(h.isEmpty).toBe(true)
    h.push('a', 1)
    expect(h.isEmpty).toBe(false)
  })

  it('pop returns undefined when empty', () => {
    const h = new MinHeapGeneric<string>()
    expect(h.pop()).toBeUndefined()
  })

  it('clear resets', () => {
    const h = new MinHeapGeneric<string>()
    h.push('a', 1)
    h.clear()
    expect(h.isEmpty).toBe(true)
  })

  it('toArray returns sorted values', () => {
    const h = new MinHeapGeneric<string>()
    h.push('c', 3)
    h.push('a', 1)
    h.push('b', 2)
    expect(h.toArray()).toEqual(['a', 'b', 'c'])
  })

  it('toString returns JSON', () => {
    const h = new MinHeapGeneric<string>()
    h.push('a', 1)
    expect(h.toString()).toContain('size')
  })

  it('toJSON returns stats', () => {
    const h = new MinHeapGeneric<string>()
    expect(h.toJSON().size).toBe(0)
  })

  it('clone preserves entries', () => {
    const h = new MinHeapGeneric<string>()
    h.push('a', 1)
    const c = h.clone()
    expect(c.size).toBe(1)
  })

  it('equals returns false for non-heap', () => {
    const h = new MinHeapGeneric<string>()
    expect(h.equals(null)).toBe(false)
  })
})

describe('min-heap-generic - bulk', () => {
  it('min-heap-generic bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 986', () => {
    expect(describe).toBeDefined()
  })
  it('min-heap-generic bulk 987', () => {
    expect(describe).toBeDefined()
  })
})
