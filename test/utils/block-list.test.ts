import { describe, expect, it } from 'vitest'
import { BlockList } from '../../src/utils/block-list.js'

describe('BlockList', () => {
  it('pushBack and size', () => {
    const bl = new BlockList<number>(4)
    bl.pushBack(1)
    bl.pushBack(2)
    bl.pushBack(3)
    expect(bl.size).toBe(3)
    expect(bl.isEmpty).toBe(false)
  })

  it('pushFront', () => {
    const bl = new BlockList<number>(4)
    bl.pushBack(2)
    bl.pushFront(1)
    expect(bl.toArray()).toEqual([1, 2])
  })

  it('popBack', () => {
    const bl = BlockList.from([1, 2, 3], 4)
    expect(bl.popBack()).toBe(3)
    expect(bl.size).toBe(2)
  })

  it('popFront', () => {
    const bl = BlockList.from([1, 2, 3], 4)
    expect(bl.popFront()).toBe(1)
    expect(bl.toArray()).toEqual([2, 3])
  })

  it('get by index', () => {
    const bl = BlockList.from([10, 20, 30], 4)
    expect(bl.get(0)).toBe(10)
    expect(bl.get(2)).toBe(30)
    expect(bl.get(5)).toBeUndefined()
  })

  it('set by index', () => {
    const bl = BlockList.from([1, 2, 3], 4)
    expect(bl.set(1, 99)).toBe(true)
    expect(bl.get(1)).toBe(99)
    expect(bl.set(10, 0)).toBe(false)
  })

  it('handles multiple blocks', () => {
    const bl = new BlockList<number>(3)
    for (let i = 0; i < 10; i++) bl.pushBack(i)
    expect(bl.size).toBe(10)
    expect(bl.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('empty list operations', () => {
    const bl = new BlockList<number>()
    expect(bl.isEmpty).toBe(true)
    expect(bl.popBack()).toBeUndefined()
    expect(bl.popFront()).toBeUndefined()
  })

  it('iteration via Symbol.iterator', () => {
    const bl = BlockList.from([1, 2, 3], 2)
    const result: number[] = []
    for (const v of bl) result.push(v)
    expect(result).toEqual([1, 2, 3])
  })

  it('from static creates blocklist', () => {
    const bl = BlockList.from([1, 2, 3])
    expect(bl.toArray()).toEqual([1, 2, 3])
  })

  it('large pushBack with small block size', () => {
    const bl = new BlockList<number>(2)
    for (let i = 0; i < 8; i++) bl.pushBack(i)
    expect(bl.size).toBe(8)
    expect(bl.get(0)).toBe(0)
    expect(bl.get(7)).toBe(7)
  })

  it('pushFront and popBack mix', () => {
    const bl = new BlockList<number>(3)
    bl.pushFront(3)
    bl.pushFront(2)
    bl.pushFront(1)
    expect(bl.popBack()).toBe(3)
    expect(bl.toArray()).toEqual([1, 2])
  })

  it('handles set operation', () => {
    const bl = BlockList.from([10, 20, 30], 2)
    bl.set(1, 99)
    expect(bl.get(1)).toBe(99)
    expect(bl.toArray()).toEqual([10, 99, 30])
  })

  it('handles pushFront all then popBack all', () => {
    const bl = new BlockList<number>(2)
    bl.pushFront(3)
    bl.pushFront(2)
    bl.pushFront(1)
    expect(bl.popBack()).toBe(3)
    expect(bl.popBack()).toBe(2)
    expect(bl.popBack()).toBe(1)
    expect(bl.isEmpty).toBe(true)
  })

  it('handles get on empty', () => {
    const bl = new BlockList<number>(4)
    expect(bl.get(0)).toBeUndefined()
  })

  it('handles large pushBack sequence', () => {
    const bl = new BlockList<number>(4)
    for (let i = 0; i < 20; i++) bl.pushBack(i)
    expect(bl.size).toBe(20)
    expect(bl.get(0)).toBe(0)
    expect(bl.get(19)).toBe(19)
  })

  it('handles from with single element', () => {
    const bl = BlockList.from([42], 2)
    expect(bl.size).toBe(1)
    expect(bl.get(0)).toBe(42)
  })

  it('pushBack and size tracking', () => {
    const bl = new BlockList<number>(2)
    bl.pushBack(1)
    bl.pushBack(2)
    bl.pushBack(3)
    expect(bl.size).toBe(3)
  })

  it('pushFront adds to front', () => {
    const bl = new BlockList<number>()
    bl.pushBack(1)
    bl.pushFront(0)
    expect(bl.get(0)).toBe(0)
    expect(bl.get(1)).toBe(1)
  })

  it('size returns element count', () => {
    const bl = new BlockList<number>()
    bl.pushBack(10)
    bl.pushBack(20)
    expect(bl.size).toBe(2)
  })

  it('pushFront adds to front', () => {
    const bl = new BlockList<number>()
    bl.pushBack(10)
    bl.pushFront(5)
    expect(bl.size).toBe(2)
  })

  it('get returns element at index', () => {
    const bl = new BlockList<number>()
    bl.pushBack(10)
    bl.pushBack(20)
    expect(bl.get(0)).toBe(10)
  })

  it('size returns correct count', () => {
    const bl = new BlockList<number>()
    bl.pushBack(1)
    bl.pushBack(2)
    bl.pushBack(3)
    expect(bl.size).toBe(3)
  })

  it('get returns element at index', () => {
    const bl = new BlockList<number>()
    bl.pushBack(10)
    bl.pushBack(20)
    expect(bl.get(0)).toBe(10)
    expect(bl.get(1)).toBe(20)
  })
})
