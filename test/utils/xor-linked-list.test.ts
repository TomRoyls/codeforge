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
})
