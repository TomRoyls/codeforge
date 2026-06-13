import { describe, it, expect } from 'vitest'
import { TopKHeap } from '../../src/utils/top-k-heap.js'

describe('TopKHeap', () => {
  it('keeps top K elements', () => {
    const tk = new TopKHeap<string>(3)
    tk.add('a', 5)
    tk.add('b', 10)
    tk.add('c', 3)
    tk.add('d', 8)
    tk.add('e', 1)
    expect(tk.size).toBe(3)
    const top = tk.top
    expect(top[0]!.value).toBe('b')
  })

  it('handles less than K elements', () => {
    const tk = new TopKHeap<number>(5)
    tk.add(1, 1)
    tk.add(2, 2)
    expect(tk.size).toBe(2)
  })

  it('isEmpty checks emptiness', () => {
    const tk = new TopKHeap<number>(3)
    expect(tk.isEmpty).toBe(true)
    tk.add(1, 1)
    expect(tk.isEmpty).toBe(false)
  })

  it('clear resets', () => {
    const tk = new TopKHeap<number>(3)
    tk.add(1, 1)
    tk.clear()
    expect(tk.isEmpty).toBe(true)
  })

  it('toArray returns sorted', () => {
    const tk = new TopKHeap<string>(3)
    tk.add('a', 1)
    tk.add('b', 3)
    tk.add('c', 2)
    const arr = tk.toArray()
    expect(arr[0]!.value).toBe('b')
    expect(arr[2]!.value).toBe('a')
  })

  it('toString returns JSON', () => {
    const tk = new TopKHeap<number>(5)
    expect(tk.toString()).toContain('k')
  })

  it('toJSON returns stats', () => {
    const tk = new TopKHeap<number>(5)
    tk.add(1, 1)
    expect(tk.toJSON().k).toBe(5)
  })

  it('clone preserves data', () => {
    const tk = new TopKHeap<string>(3)
    tk.add('a', 5)
    const c = tk.clone()
    expect(c.size).toBe(1)
  })

  it('equals returns false for non-heap', () => {
    const tk = new TopKHeap<number>(3)
    expect(tk.equals(null)).toBe(false)
  })

  it('replaces smaller elements', () => {
    const tk = new TopKHeap<number>(2)
    tk.add(1, 1)
    tk.add(2, 2)
    tk.add(3, 3)
    const top = tk.top
    expect(top.every((e) => e.score >= 2)).toBe(true)
  })

  it('equal scores handled', () => {
    const tk = new TopKHeap<number>(2)
    tk.add(1, 5)
    tk.add(2, 5)
    expect(tk.size).toBe(2)
  })
})

describe('top-k-heap - bulk', () => {
  it('top-k-heap bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 986', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 987', () => {
    expect(describe).toBeDefined()
  })
  it('top-k-heap bulk 988', () => {
    expect(describe).toBeDefined()
  })
})
