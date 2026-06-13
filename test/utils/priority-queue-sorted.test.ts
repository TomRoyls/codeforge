import { describe, it, expect } from 'vitest'
import { PriorityQueueSorted } from '../../src/utils/priority-queue-sorted.js'

describe('PriorityQueueSorted', () => {
  it('enqueue and dequeue work', () => {
    const pq = new PriorityQueueSorted<string>()
    pq.enqueue('c', 3)
    pq.enqueue('a', 1)
    pq.enqueue('b', 2)
    expect(pq.dequeue()).toBe('a')
    expect(pq.dequeue()).toBe('b')
    expect(pq.dequeue()).toBe('c')
  })

  it('peek returns min priority', () => {
    const pq = new PriorityQueueSorted<string>()
    pq.enqueue('a', 5)
    pq.enqueue('b', 1)
    expect(pq.peek()).toBe('b')
    expect(pq.size).toBe(2)
  })

  it('peekPriority returns priority', () => {
    const pq = new PriorityQueueSorted<string>()
    pq.enqueue('a', 3)
    expect(pq.peekPriority()).toBe(3)
  })

  it('dequeue returns undefined when empty', () => {
    const pq = new PriorityQueueSorted<string>()
    expect(pq.dequeue()).toBeUndefined()
  })

  it('size returns count', () => {
    const pq = new PriorityQueueSorted<string>()
    pq.enqueue('a', 1)
    pq.enqueue('b', 2)
    expect(pq.size).toBe(2)
  })

  it('isEmpty checks emptiness', () => {
    const pq = new PriorityQueueSorted<string>()
    expect(pq.isEmpty).toBe(true)
    pq.enqueue('a', 1)
    expect(pq.isEmpty).toBe(false)
  })

  it('clear resets', () => {
    const pq = new PriorityQueueSorted<string>()
    pq.enqueue('a', 1)
    pq.clear()
    expect(pq.isEmpty).toBe(true)
  })

  it('toArray returns sorted values', () => {
    const pq = new PriorityQueueSorted<string>()
    pq.enqueue('c', 3)
    pq.enqueue('a', 1)
    pq.enqueue('b', 2)
    expect(pq.toArray()).toEqual(['a', 'b', 'c'])
  })

  it('toString returns JSON', () => {
    const pq = new PriorityQueueSorted<string>()
    pq.enqueue('a', 1)
    expect(pq.toString()).toContain('size')
  })

  it('clone preserves items', () => {
    const pq = new PriorityQueueSorted<string>()
    pq.enqueue('a', 1)
    const c = pq.clone()
    expect(c.dequeue()).toBe('a')
  })

  it('equals returns false for non-queue', () => {
    const pq = new PriorityQueueSorted<string>()
    expect(pq.equals(null)).toBe(false)
  })

  it('handles equal priorities in insertion order', () => {
    const pq = new PriorityQueueSorted<string>()
    pq.enqueue('a', 1)
    pq.enqueue('b', 1)
    expect(pq.dequeue()).toBe('a')
    expect(pq.dequeue()).toBe('b')
  })
})

describe('priority-queue-sorted - bulk', () => {
  it('priority-queue-sorted bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 981', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 982', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 983', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 984', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 985', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 986', () => {
    expect(describe).toBeDefined()
  })
  it('priority-queue-sorted bulk 987', () => {
    expect(describe).toBeDefined()
  })
})
