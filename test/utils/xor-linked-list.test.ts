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
})
