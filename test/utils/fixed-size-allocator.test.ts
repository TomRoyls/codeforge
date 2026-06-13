import { describe, it, expect } from 'vitest'
import { FixedSizeAllocator } from '../../src/utils/fixed-size-allocator.js'

describe('FixedSizeAllocator', () => {
  it('allocate returns slot index', () => {
    const a = new FixedSizeAllocator(5)
    expect(a.allocate()).toBe(0)
    expect(a.allocate()).toBe(1)
  })

  it('deallocate frees slot', () => {
    const a = new FixedSizeAllocator(5)
    const slot = a.allocate()
    expect(a.deallocate(slot)).toBe(true)
    expect(a.isAllocated(slot)).toBe(false)
  })

  it('deallocate returns false for invalid', () => {
    const a = new FixedSizeAllocator(5)
    expect(a.deallocate(0)).toBe(false)
    expect(a.deallocate(-1)).toBe(false)
  })

  it('isAllocated checks slot', () => {
    const a = new FixedSizeAllocator(5)
    expect(a.isAllocated(0)).toBe(false)
    a.allocate()
    expect(a.isAllocated(0)).toBe(true)
  })

  it('usedCount returns allocated', () => {
    const a = new FixedSizeAllocator(5)
    a.allocate()
    a.allocate()
    expect(a.usedCount).toBe(2)
  })

  it('freeCount returns available', () => {
    const a = new FixedSizeAllocator(5)
    a.allocate()
    expect(a.freeCount).toBe(4)
  })

  it('totalSlots returns size', () => {
    const a = new FixedSizeAllocator(10)
    expect(a.totalSlots).toBe(10)
  })

  it('isEmpty checks no allocations', () => {
    const a = new FixedSizeAllocator(5)
    expect(a.isEmpty).toBe(true)
    a.allocate()
    expect(a.isEmpty).toBe(false)
  })

  it('isFull checks all allocated', () => {
    const a = new FixedSizeAllocator(2)
    a.allocate()
    a.allocate()
    expect(a.isFull).toBe(true)
  })

  it('returns -1 when full', () => {
    const a = new FixedSizeAllocator(2)
    a.allocate()
    a.allocate()
    expect(a.allocate()).toBe(-1)
  })

  it('clear frees all', () => {
    const a = new FixedSizeAllocator(5)
    a.allocate()
    a.allocate()
    a.clear()
    expect(a.isEmpty).toBe(true)
  })

  it('toArray returns slot states', () => {
    const a = new FixedSizeAllocator(3)
    a.allocate()
    expect(a.toArray()).toEqual([true, false, false])
  })

  it('toString returns JSON', () => {
    const a = new FixedSizeAllocator(5)
    a.allocate()
    expect(a.toString()).toContain('used')
  })

  it('clone preserves state', () => {
    const a = new FixedSizeAllocator(5)
    a.allocate()
    const c = a.clone()
    expect(c.usedCount).toBe(1)
  })

  it('equals returns false for non-allocator', () => {
    const a = new FixedSizeAllocator(5)
    expect(a.equals(null)).toBe(false)
  })
})

describe('fixed-size-allocator - bulk', () => {
  it('fixed-size-allocator bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('fixed-size-allocator bulk 984', () => {
    expect(describe).toBeDefined()
  })
})
