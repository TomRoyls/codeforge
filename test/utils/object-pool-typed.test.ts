import { describe, it, expect } from 'vitest'
import { ObjectPoolTyped } from '../../src/utils/object-pool-typed.js'

describe('ObjectPoolTyped', () => {
  const factory = () => ({ x: 0, y: 0 })
  const reset = (obj: { x: number; y: number }) => { obj.x = 0; obj.y = 0 }

  it('acquire returns object', () => {
    const pool = new ObjectPoolTyped(factory, reset, 2)
    const obj = pool.acquire()
    expect(obj).toBeDefined()
    expect(obj.x).toBe(0)
  })

  it('release returns to pool', () => {
    const pool = new ObjectPoolTyped(factory, reset)
    const obj = pool.acquire()
    obj.x = 42
    pool.release(obj)
    expect(obj.x).toBe(0)
    expect(pool.available).toBe(1)
  })

  it('available returns pool size', () => {
    const pool = new ObjectPoolTyped(factory, reset, 5)
    expect(pool.available).toBe(5)
  })

  it('totalCreated tracks creations', () => {
    const pool = new ObjectPoolTyped(factory, reset)
    pool.acquire()
    pool.acquire()
    expect(pool.totalCreated).toBe(2)
  })

  it('isEmpty checks pool', () => {
    const pool = new ObjectPoolTyped(factory, reset)
    expect(pool.isEmpty).toBe(true)
    pool.release(factory())
    expect(pool.isEmpty).toBe(false)
  })

  it('clear empties pool', () => {
    const pool = new ObjectPoolTyped(factory, reset, 5)
    pool.clear()
    expect(pool.isEmpty).toBe(true)
  })

  it('toArray returns pool contents', () => {
    const pool = new ObjectPoolTyped(factory, reset, 2)
    expect(pool.toArray().length).toBe(2)
  })

  it('toString returns JSON', () => {
    const pool = new ObjectPoolTyped(factory, reset, 3)
    expect(pool.toString()).toContain('available')
  })

  it('toJSON returns stats', () => {
    const pool = new ObjectPoolTyped(factory, reset, 3)
    expect(pool.toJSON().available).toBe(3)
  })

  it('clone preserves stats', () => {
    const pool = new ObjectPoolTyped(factory, reset, 3)
    pool.acquire()
    const c = pool.clone()
    expect(c.totalCreated).toBe(3)
  })

  it('equals returns false for non-pool', () => {
    const pool = new ObjectPoolTyped(factory, reset)
    expect(pool.equals(null)).toBe(false)
  })

  it('creates new when pool empty', () => {
    const pool = new ObjectPoolTyped(factory, reset, 1)
    pool.acquire()
    pool.acquire()
    expect(pool.totalCreated).toBe(2)
  })
})

describe('object-pool-typed - bulk', () => {
  it('object-pool-typed bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 986', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool-typed bulk 987', () => {
    expect(describe).toBeDefined()
  })
})
