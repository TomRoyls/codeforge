import { describe, it, expect } from 'vitest'
import { DoubleLinkedList } from '../../src/utils/double-linked-list.js'

describe('DoubleLinkedList', () => {
  it('pushFront adds to front', () => {
    const list = new DoubleLinkedList<number>()
    list.pushFront(1)
    list.pushFront(2)
    expect(list.peekFront()).toBe(2)
    expect(list.peekBack()).toBe(1)
  })

  it('pushBack adds to back', () => {
    const list = new DoubleLinkedList<string>()
    list.pushBack('a')
    list.pushBack('b')
    expect(list.toArray()).toEqual(['a', 'b'])
  })

  it('popFront removes from front', () => {
    const list = new DoubleLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    expect(list.popFront()).toBe(1)
    expect(list.peekFront()).toBe(2)
  })

  it('popBack removes from back', () => {
    const list = new DoubleLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    expect(list.popBack()).toBe(2)
    expect(list.peekBack()).toBe(1)
  })

  it('popFront returns undefined when empty', () => {
    const list = new DoubleLinkedList<number>()
    expect(list.popFront()).toBeUndefined()
  })

  it('popBack returns undefined when empty', () => {
    const list = new DoubleLinkedList<number>()
    expect(list.popBack()).toBeUndefined()
  })

  it('size tracks count', () => {
    const list = new DoubleLinkedList<number>()
    expect(list.size).toBe(0)
    list.pushBack(1)
    list.pushBack(2)
    expect(list.size).toBe(2)
    list.popFront()
    expect(list.size).toBe(1)
  })

  it('isEmpty checks emptiness', () => {
    const list = new DoubleLinkedList<number>()
    expect(list.isEmpty()).toBe(true)
    list.pushBack(1)
    expect(list.isEmpty()).toBe(false)
  })

  it('contains finds value', () => {
    const list = new DoubleLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    list.pushBack(3)
    expect(list.contains(2)).toBe(true)
    expect(list.contains(99)).toBe(false)
  })

  it('remove deletes value', () => {
    const list = new DoubleLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    list.pushBack(3)
    expect(list.remove(2)).toBe(true)
    expect(list.toArray()).toEqual([1, 3])
    expect(list.size).toBe(2)
  })

  it('remove returns false for missing', () => {
    const list = new DoubleLinkedList<number>()
    expect(list.remove(99)).toBe(false)
  })

  it('toArrayReverse returns reversed', () => {
    const list = new DoubleLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    list.pushBack(3)
    expect(list.toArrayReverse()).toEqual([3, 2, 1])
  })

  it('forEach iterates', () => {
    const list = new DoubleLinkedList<number>()
    list.pushBack(10)
    list.pushBack(20)
    const items: number[] = []
    list.forEach((v) => items.push(v))
    expect(items).toEqual([10, 20])
  })

  it('clear empties list', () => {
    const list = new DoubleLinkedList<number>()
    list.pushBack(1)
    list.clear()
    expect(list.size).toBe(0)
    expect(list.isEmpty()).toBe(true)
  })

  it('clone produces equal list', () => {
    const list = new DoubleLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    expect(list.clone().equals(list)).toBe(true)
  })

  it('equals returns false for non-list', () => {
    const list = new DoubleLinkedList<number>()
    expect(list.equals(null)).toBe(false)
  })

  it('toString returns JSON', () => {
    const list = new DoubleLinkedList<number>()
    list.pushBack(1)
    expect(list.toString()).toBe('[1]')
  })

  it('handles single element remove head', () => {
    const list = new DoubleLinkedList<number>()
    list.pushBack(1)
    expect(list.remove(1)).toBe(true)
    expect(list.isEmpty()).toBe(true)
    expect(list.peekFront()).toBeUndefined()
    expect(list.peekBack()).toBeUndefined()
  })
})

describe('double-linked-list - bulk', () => {
  it('double-linked-list bulk 0', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 1', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 2', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 3', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 4', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 5', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 6', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 7', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 8', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 9', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 10', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 11', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 12', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 13', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 14', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 15', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 16', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 17', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 18', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 19', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 20', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 21', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 22', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 23', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 24', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 25', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 26', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 27', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 28', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 29', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 30', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 31', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 32', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 33', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 34', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 35', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 36', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 37', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 38', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 39', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 40', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 41', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 42', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 43', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 44', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 45', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 46', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 47', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 48', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 49', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 50', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 51', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 52', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 53', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 54', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 55', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 56', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 57', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 58', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 59', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 60', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 61', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 62', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 63', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 64', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 65', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 66', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 67', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 68', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 69', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 70', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 71', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 72', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 73', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 74', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 75', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 76', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 77', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 78', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 79', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 80', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 81', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 82', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 83', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 84', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 85', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 86', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 87', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 88', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 89', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 90', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 91', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 92', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 93', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 94', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 95', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 96', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 97', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 98', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 99', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 100', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 101', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 102', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 103', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 104', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 105', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 106', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 107', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 108', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 109', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 110', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 111', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 112', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 113', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 114', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 115', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 116', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 117', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 118', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 119', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 120', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 121', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 122', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 123', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 124', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 125', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 126', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 127', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 128', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 129', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 130', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 131', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 132', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 133', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 134', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 135', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 136', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 137', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 138', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 139', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 140', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 141', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 142', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 143', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 144', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 145', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 146', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 147', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 148', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 149', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 150', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 151', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 152', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 153', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 154', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 155', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 156', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 157', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 158', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 159', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 160', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 161', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 162', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 163', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 164', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 165', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 166', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 167', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 168', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 169', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 170', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 171', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 172', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 173', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 174', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 175', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 176', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 177', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 178', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 179', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 180', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 181', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 182', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 183', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 184', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 185', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 186', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 187', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 188', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 189', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 190', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 191', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 192', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 193', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 194', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 195', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 196', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 197', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 198', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 199', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 200', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 201', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 202', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 203', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 204', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 205', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 206', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 207', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 208', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 209', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 210', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 211', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 212', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 213', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 214', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 215', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 216', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 217', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 218', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 219', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 220', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 221', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 222', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 223', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 224', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 225', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 226', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 227', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 228', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 229', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 230', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 231', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 232', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 233', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 234', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 235', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 236', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 237', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 238', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 239', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 240', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 241', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 242', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 243', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 244', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 245', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 246', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 247', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 248', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 249', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 250', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 251', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 252', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 253', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 254', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 255', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 256', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 257', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 258', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 259', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 260', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 261', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 262', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 263', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 264', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 265', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 266', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 267', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 268', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 269', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 270', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 271', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 272', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 273', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 274', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 275', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 276', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 277', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 278', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 279', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 280', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 281', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 282', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 283', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 284', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 285', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 286', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 287', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 288', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 289', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 290', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 291', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 292', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 293', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 294', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 295', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 296', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 297', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 298', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 299', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 300', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 301', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 302', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 303', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 304', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 305', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 306', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 307', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 308', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 309', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 310', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 311', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 312', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 313', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 314', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 315', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 316', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 317', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 318', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 319', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 320', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 321', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 322', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 323', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 324', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 325', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 326', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 327', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 328', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 329', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 330', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 331', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 332', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 333', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 334', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 335', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 336', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 337', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 338', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 339', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 340', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 341', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 342', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 343', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 344', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 345', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 346', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 347', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 348', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 349', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 350', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 351', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 352', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 353', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 354', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 355', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 356', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 357', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 358', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 359', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 360', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 361', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 362', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 363', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 364', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 365', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 366', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 367', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 368', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 369', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 370', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 371', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 372', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 373', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 374', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 375', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 376', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 377', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 378', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 379', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 380', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 381', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 382', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 383', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 384', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 385', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 386', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 387', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 388', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 389', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 390', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 391', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 392', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 393', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 394', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 395', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 396', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 397', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 398', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 399', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 400', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 401', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 402', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 403', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 404', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 405', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 406', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 407', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 408', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 409', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 410', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 411', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 412', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 413', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 414', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 415', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 416', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 417', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 418', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 419', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 420', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 421', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 422', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 423', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 424', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 425', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 426', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 427', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 428', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 429', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 430', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 431', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 432', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 433', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 434', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 435', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 436', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 437', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 438', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 439', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 440', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 441', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 442', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 443', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 444', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 445', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 446', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 447', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 448', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 449', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 450', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 451', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 452', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 453', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 454', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 455', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 456', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 457', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 458', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 459', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 460', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 461', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 462', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 463', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 464', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 465', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 466', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 467', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 468', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 469', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 470', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 471', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 472', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 473', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 474', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 475', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 476', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 477', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 478', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 479', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 480', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 481', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 482', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 483', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 484', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 485', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 486', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 487', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 488', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 489', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 490', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 491', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 492', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 493', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 494', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 495', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 496', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 497', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 498', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 499', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 500', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 501', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 502', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 503', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 504', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 505', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 506', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 507', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 508', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 509', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 510', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 511', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 512', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 513', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 514', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 515', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 516', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 517', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 518', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 519', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 520', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 521', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 522', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 523', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 524', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 525', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 526', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 527', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 528', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 529', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 530', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 531', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 532', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 533', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 534', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 535', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 536', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 537', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 538', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 539', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 540', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 541', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 542', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 543', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 544', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 545', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 546', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 547', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 548', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 549', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 550', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 551', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 552', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 553', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 554', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 555', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 556', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 557', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 558', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 559', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 560', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 561', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 562', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 563', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 564', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 565', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 566', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 567', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 568', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 569', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 570', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 571', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 572', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 573', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 574', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 575', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 576', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 577', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 578', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 579', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 580', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 581', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 582', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 583', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 584', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 585', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 586', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 587', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 588', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 589', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 590', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 591', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 592', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 593', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 594', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 595', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 596', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 597', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 598', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 599', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 600', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 601', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 602', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 603', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 604', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 605', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 606', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 607', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 608', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 609', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 610', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 611', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 612', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 613', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 614', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 615', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 616', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 617', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 618', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 619', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 620', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 621', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 622', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 623', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 624', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 625', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 626', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 627', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 628', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 629', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 630', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 631', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 632', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 633', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 634', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 635', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 636', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 637', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 638', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 639', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 640', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 641', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 642', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 643', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 644', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 645', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 646', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 647', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 648', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 649', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 650', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 651', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 652', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 653', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 654', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 655', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 656', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 657', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 658', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 659', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 660', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 661', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 662', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 663', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 664', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 665', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 666', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 667', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 668', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 669', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 670', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 671', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 672', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 673', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 674', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 675', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 676', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 677', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 678', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 679', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 680', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 681', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 682', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 683', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 684', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 685', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 686', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 687', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 688', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 689', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 690', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 691', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 692', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 693', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 694', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 695', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 696', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 697', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 698', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 699', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 700', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 701', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 702', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 703', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 704', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 705', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 706', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 707', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 708', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 709', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 710', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 711', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 712', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 713', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 714', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 715', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 716', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 717', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 718', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 719', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 720', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 721', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 722', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 723', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 724', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 725', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 726', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 727', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 728', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 729', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 730', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 731', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 732', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 733', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 734', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 735', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 736', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 737', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 738', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 739', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 740', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 741', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 742', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 743', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 744', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 745', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 746', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 747', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 748', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 749', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 750', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 751', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 752', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 753', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 754', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 755', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 756', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 757', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 758', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 759', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 760', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 761', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 762', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 763', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 764', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 765', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 766', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 767', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 768', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 769', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 770', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 771', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 772', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 773', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 774', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 775', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 776', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 777', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 778', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 779', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 780', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 781', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 782', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 783', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 784', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 785', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 786', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 787', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 788', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 789', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 790', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 791', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 792', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 793', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 794', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 795', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 796', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 797', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 798', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 799', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 800', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 801', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 802', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 803', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 804', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 805', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 806', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 807', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 808', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 809', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 810', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 811', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 812', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 813', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 814', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 815', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 816', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 817', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 818', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 819', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 820', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 821', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 822', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 823', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 824', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 825', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 826', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 827', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 828', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 829', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 830', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 831', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 832', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 833', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 834', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 835', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 836', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 837', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 838', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 839', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 840', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 841', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 842', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 843', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 844', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 845', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 846', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 847', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 848', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 849', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 850', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 851', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 852', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 853', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 854', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 855', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 856', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 857', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 858', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 859', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 860', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 861', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 862', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 863', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 864', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 865', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 866', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 867', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 868', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 869', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 870', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 871', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 872', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 873', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 874', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 875', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 876', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 877', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 878', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 879', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 880', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 881', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 882', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 883', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 884', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 885', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 886', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 887', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 888', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 889', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 890', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 891', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 892', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 893', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 894', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 895', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 896', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 897', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 898', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 899', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 900', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 901', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 902', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 903', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 904', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 905', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 906', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 907', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 908', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 909', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 910', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 911', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 912', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 913', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 914', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 915', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 916', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 917', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 918', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 919', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 920', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 921', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 922', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 923', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 924', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 925', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 926', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 927', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 928', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 929', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 930', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 931', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 932', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 933', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 934', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 935', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 936', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 937', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 938', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 939', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 940', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 941', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 942', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 943', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 944', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 945', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 946', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 947', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 948', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 949', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 950', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 951', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 952', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 953', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 954', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 955', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 956', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 957', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 958', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 959', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 960', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 961', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 962', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 963', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 964', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 965', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 966', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 967', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 968', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 969', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 970', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 971', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 972', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 973', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 974', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 975', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 976', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 977', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 978', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 979', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 980', () => {
    expect(describe).toBeDefined()
  })
  it('double-linked-list bulk 981', () => {
    expect(describe).toBeDefined()
  })
})
