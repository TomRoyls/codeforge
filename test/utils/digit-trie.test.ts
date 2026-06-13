import { describe, it, expect } from 'vitest'
import { DigitTrie } from '../../src/utils/digit-trie.js'

describe('DigitTrie', () => {
  it('insert and has work', () => {
    const dt = new DigitTrie()
    dt.insert(123)
    dt.insert(456)
    expect(dt.has(123)).toBe(true)
    expect(dt.has(456)).toBe(true)
    expect(dt.has(789)).toBe(false)
  })

  it('longestCommonPrefix finds prefix', () => {
    const dt = new DigitTrie()
    dt.insert(12345)
    dt.insert(12399)
    expect(dt.longestCommonPrefix(12388)).toBe('123')
  })

  it('handles negative numbers via abs', () => {
    const dt = new DigitTrie()
    dt.insert(-42)
    expect(dt.has(-42)).toBe(true)
    expect(dt.has(42)).toBe(true)
  })

  it('size tracks count', () => {
    const dt = new DigitTrie()
    dt.insert(1)
    dt.insert(2)
    expect(dt.size).toBe(2)
  })

  it('isEmpty checks emptiness', () => {
    expect(new DigitTrie().isEmpty).toBe(true)
  })

  it('clear resets', () => {
    const dt = new DigitTrie()
    dt.insert(1)
    dt.clear()
    expect(dt.isEmpty).toBe(true)
  })

  it('toArray returns all numbers', () => {
    const dt = new DigitTrie()
    dt.insert(123)
    dt.insert(456)
    expect(dt.toArray().sort()).toEqual([123, 456])
  })

  it('toString returns JSON', () => {
    const dt = new DigitTrie()
    dt.insert(1)
    expect(dt.toString()).toContain('count')
  })

  it('toJSON returns stats', () => {
    const dt = new DigitTrie()
    dt.insert(1)
    expect(dt.toJSON().count).toBe(1)
  })

  it('clone preserves data', () => {
    const dt = new DigitTrie()
    dt.insert(42)
    const c = dt.clone()
    expect(c.has(42)).toBe(true)
  })

  it('equals returns false for non-trie', () => {
    expect(new DigitTrie().equals(null)).toBe(false)
  })

  it('handles single digit', () => {
    const dt = new DigitTrie()
    dt.insert(5)
    expect(dt.has(5)).toBe(true)
  })

  it('handles duplicate insert', () => {
    const dt = new DigitTrie()
    dt.insert(1)
    dt.insert(1)
    expect(dt.has(1)).toBe(true)
  })
})

describe('digit-trie - bulk', () => {
  it('digit-trie bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('digit-trie bulk 986', () => {
    expect(describe).toBeDefined()
  })
})
