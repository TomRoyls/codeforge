import { describe, expect, it } from 'vitest'
import { XorLinkedList } from '../../src/utils/xor-linked-list.js'

describe('XorLinkedList', () => {
  it('pushBack and toArray', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    list.pushBack(3)
    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('pushFront', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(2)
    list.pushFront(1)
    expect(list.toArray()).toEqual([1, 2])
  })

  it('toArrayReverse', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    list.pushBack(3)
    expect(list.toArrayReverse()).toEqual([3, 2, 1])
  })

  it('get by index', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(10)
    list.pushBack(20)
    list.pushBack(30)
    expect(list.get(0)).toBe(10)
    expect(list.get(2)).toBe(30)
    expect(list.get(5)).toBeUndefined()
  })

  it('size and isEmpty', () => {
    const list = new XorLinkedList<string>()
    expect(list.isEmpty).toBe(true)
    list.pushBack('a')
    expect(list.size).toBe(1)
    expect(list.isEmpty).toBe(false)
  })

  it('handles single element', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(42)
    expect(list.toArray()).toEqual([42])
    expect(list.toArrayReverse()).toEqual([42])
  })

  it('handles many pushFront', () => {
    const list = new XorLinkedList<number>()
    for (let i = 5; i >= 0; i--) list.pushFront(i)
    expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('handles mixed pushFront and pushBack', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(2)
    list.pushFront(1)
    list.pushBack(3)
    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('handles alternating front and back', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(3)
    list.pushFront(1)
    list.pushBack(4)
    list.pushFront(0)
    expect(list.toArray()).toEqual([0, 1, 3, 4])
  })

  it('get on large list', () => {
    const list = new XorLinkedList<number>()
    for (let i = 0; i < 20; i++) list.pushBack(i)
    expect(list.get(0)).toBe(0)
    expect(list.get(19)).toBe(19)
    expect(list.get(10)).toBe(10)
  })

  it('handles negative index as undefined', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    expect(list.get(-1)).toBeUndefined()
  })

  it('preserves order after many operations', () => {
    const list = new XorLinkedList<number>()
    list.pushFront(3)
    list.pushFront(1)
    list.pushBack(5)
    list.pushFront(0)
    list.pushBack(7)
    expect(list.toArray()).toEqual([0, 1, 3, 5, 7])
    expect(list.size).toBe(5)
  })

  it('handles empty list get', () => {
    const list = new XorLinkedList<number>()
    expect(list.get(0)).toBeUndefined()
    expect(list.size).toBe(0)
  })

  it('toArrayReverse matches reverse of toArray', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    list.pushBack(3)
    expect(list.toArrayReverse()).toEqual([3, 2, 1])
  })

  it('handles out of bounds get', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    expect(list.get(5)).toBeUndefined()
    expect(list.get(2)).toBeUndefined()
  })

  it('pushFront then pushBack alternates', () => {
    const list = new XorLinkedList<number>()
    list.pushFront(2)
    list.pushBack(3)
    list.pushFront(1)
    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('size tracks length', () => {
    const list = new XorLinkedList<number>()
    expect(list.size).toBe(0)
    list.pushBack(1)
    list.pushBack(2)
    expect(list.size).toBe(2)
  })

  it('empty list has size 0', () => {
    const list = new XorLinkedList<number>()
    expect(list.size).toBe(0)
  })

  it('pushBack and iterate', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    expect(list.size).toBe(2)
  })

  it('empty list size is 0', () => {
    const list = new XorLinkedList<number>()
    expect(list.size).toBe(0)
  })

  it('push increases size', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    expect(list.size).toBe(2)
  })

  it('empty list has size 0', () => {
    const list = new XorLinkedList<number>()
    expect(list.size).toBe(0)
  })

  it('pushBack increases size', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(42)
    expect(list.size).toBe(1)
  })

  it('pushFront increases size', () => {
    const list = new XorLinkedList<number>()
    list.pushFront(42)
    expect(list.size).toBe(1)
  })

  it('handles string values', () => {
    const list = new XorLinkedList<string>()
    list.pushBack('hello')
    list.pushBack('world')
    expect(list.toArray()).toEqual(['hello', 'world'])
  })

  it('handles object values', () => {
    const list = new XorLinkedList<{ id: number }>()
    list.pushBack({ id: 1 })
    list.pushBack({ id: 2 })
    expect(list.toArray()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('handles boolean values', () => {
    const list = new XorLinkedList<boolean>()
    list.pushBack(true)
    list.pushBack(false)
    expect(list.toArray()).toEqual([true, false])
  })

  it('pushFront to empty list', () => {
    const list = new XorLinkedList<number>()
    list.pushFront(1)
    expect(list.toArray()).toEqual([1])
    expect(list.size).toBe(1)
  })

  it('pushBack to empty list', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    expect(list.toArray()).toEqual([1])
    expect(list.size).toBe(1)
  })

  it('handles zero as value', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(0)
    list.pushFront(0)
    expect(list.toArray()).toEqual([0, 0])
  })

  it('sequential get operations', () => {
    const list = new XorLinkedList<number>()
    for (let i = 0; i < 10; i++) list.pushBack(i)
    expect(list.get(0)).toBe(0)
    expect(list.get(1)).toBe(1)
    expect(list.get(2)).toBe(2)
    expect(list.get(3)).toBe(3)
  })

  it('handles large list with pushFront', () => {
    const list = new XorLinkedList<number>()
    for (let i = 0; i < 50; i++) list.pushFront(i)
    expect(list.size).toBe(50)
    expect(list.get(0)).toBe(49)
    expect(list.get(49)).toBe(0)
  })

  it('handles large list with pushBack', () => {
    const list = new XorLinkedList<number>()
    for (let i = 0; i < 50; i++) list.pushBack(i)
    expect(list.size).toBe(50)
    expect(list.get(0)).toBe(0)
    expect(list.get(49)).toBe(49)
  })

  it('get returns undefined for negative index', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    expect(list.get(-5)).toBeUndefined()
  })

  it('get returns undefined for index equal to size', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    expect(list.get(2)).toBeUndefined()
  })

  it('get returns undefined for very large index', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    expect(list.get(1000000)).toBeUndefined()
  })

  it('toArrayReverse on empty list', () => {
    const list = new XorLinkedList<number>()
    expect(list.toArrayReverse()).toEqual([])
  })

  it('toArrayReverse on single element', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(42)
    expect(list.toArrayReverse()).toEqual([42])
  })

  it('toArrayReverse preserves order correctly', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    list.pushBack(3)
    const forward = list.toArray()
    const reverse = list.toArrayReverse()
    expect(reverse).toEqual([3, 2, 1])
    expect(forward).toEqual([1, 2, 3])
  })

  it('multiple toArray calls return same values', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    const first = list.toArray()
    const second = list.toArray()
    expect(first).toEqual(second)
  })

  it('multiple toArrayReverse calls return same values', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    const first = list.toArrayReverse()
    const second = list.toArrayReverse()
    expect(first).toEqual(second)
  })

  it('isEmpty after many operations', () => {
    const list = new XorLinkedList<number>()
    expect(list.isEmpty).toBe(true)
    list.pushBack(1)
    list.pushBack(2)
    expect(list.isEmpty).toBe(false)
  })

  it('size after mixed operations', () => {
    const list = new XorLinkedList<number>()
    for (let i = 0; i < 10; i++) list.pushBack(i)
    for (let i = 0; i < 5; i++) list.pushFront(i)
    expect(list.size).toBe(15)
  })

  it('handles null as value', () => {
    const list = new XorLinkedList<number | null>()
    list.pushBack(null)
    list.pushBack(1)
    expect(list.toArray()).toEqual([null, 1])
  })

  it('handles undefined as value', () => {
    const list = new XorLinkedList<number | undefined>()
    list.pushBack(undefined)
    list.pushBack(1)
    expect(list.toArray()).toEqual([undefined, 1])
  })

  it('get last element', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    list.pushBack(3)
    expect(list.get(2)).toBe(3)
  })

  it('get middle element', () => {
    const list = new XorLinkedList<number>()
    for (let i = 0; i < 9; i++) list.pushBack(i)
    expect(list.get(4)).toBe(4)
  })

  it('alternating pushFront and pushBack maintains order', () => {
    const list = new XorLinkedList<number>()
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) list.pushBack(i)
      else list.pushFront(i)
    }
    expect(list.size).toBe(10)
  })

  it('toArrayReverse after alternating operations', () => {
    const list = new XorLinkedList<number>()
    list.pushFront(3)
    list.pushBack(4)
    list.pushFront(2)
    list.pushBack(5)
    list.pushFront(1)
    expect(list.toArrayReverse()).toEqual([5, 4, 3, 2, 1])
  })

  it('get on list created with pushFront only', () => {
    const list = new XorLinkedList<number>()
    list.pushFront(3)
    list.pushFront(2)
    list.pushFront(1)
    expect(list.get(0)).toBe(1)
    expect(list.get(1)).toBe(2)
    expect(list.get(2)).toBe(3)
  })

  it('size remains consistent', () => {
    const list = new XorLinkedList<number>()
    for (let i = 0; i < 20; i++) {
      list.pushBack(i)
      expect(list.size).toBe(i + 1)
    }
  })

  it('toArrayReverse returns elements in reverse', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    list.pushBack(2)
    list.pushBack(3)
    expect(list.toArrayReverse()).toEqual([3, 2, 1])
  })

  it('get returns correct element', () => {
    const list = new XorLinkedList<string>()
    list.pushBack('a')
    list.pushBack('b')
    list.pushBack('c')
    expect(list.get(0)).toBe('a')
    expect(list.get(2)).toBe('c')
  })

  it('get returns undefined for out of bounds', () => {
    const list = new XorLinkedList<number>()
    list.pushBack(1)
    expect(list.get(5)).toBeUndefined()
  })

  it('pushFront adds to beginning', () => {
    const list = new XorLinkedList<number>()
    list.pushFront(2)
    list.pushFront(1)
    expect(list.toArray()).toEqual([1, 2])
  })
})
