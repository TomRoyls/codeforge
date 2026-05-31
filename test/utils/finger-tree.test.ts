import { describe, expect, it } from 'vitest'
import { FingerTree } from '../../src/utils/finger-tree.js'

describe('FingerTree', () => {
  it('creates empty tree', () => {
    const ft = FingerTree.empty<number>()
    expect(ft.isEmpty).toBe(true)
    expect(ft.size).toBe(0)
  })

  it('pushBack adds elements', () => {
    const ft = FingerTree.from([1, 2, 3])
    expect(ft.size).toBe(3)
    expect(ft.peekFront()).toBe(1)
    expect(ft.peekBack()).toBe(3)
  })

  it('pushFront adds to front', () => {
    const ft = FingerTree.empty<number>().pushBack(2).pushFront(1)
    expect(ft.peekFront()).toBe(1)
  })

  it('popFront removes first element', () => {
    const ft = FingerTree.from([1, 2, 3]).popFront()
    expect(ft.peekFront()).toBe(2)
  })

  it('toArray returns all elements', () => {
    expect(FingerTree.from([1, 2, 3]).toArray()).toEqual([1, 2, 3])
  })

  it('handles single element', () => {
    const ft = FingerTree.from([42])
    expect(ft.peekFront()).toBe(42)
    expect(ft.peekBack()).toBe(42)
  })

  it('handles many elements', () => {
    const arr = Array.from({ length: 50 }, (_, i) => i)
    const ft = FingerTree.from(arr)
    expect(ft.toArray()).toEqual(arr)
  })

  it('from empty array', () => {
    expect(FingerTree.from([]).isEmpty).toBe(true)
  })

  it('popBack removes last element', () => {
    const ft = FingerTree.from([1, 2, 3]).popBack()
    expect(ft.peekBack()).toBe(2)
  })

  it('concat merges two trees', () => {
    const a = FingerTree.from([1, 2])
    const b = FingerTree.from([3, 4])
    expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4])
  })

  it('get returns element at index', () => {
    const ft = FingerTree.from([10, 20, 30])
    expect(ft.get(0)).toBe(10)
    expect(ft.get(2)).toBe(30)
    expect(ft.get(5)).toBeUndefined()
  })

  it('popFront on empty returns empty', () => {
    const ft = FingerTree.empty<number>().popFront()
    expect(ft.isEmpty).toBe(true)
  })

  it('popBack on empty returns empty', () => {
    const ft = FingerTree.empty<number>().popBack()
    expect(ft.isEmpty).toBe(true)
  })

  it('peekFront on empty returns undefined', () => {
    expect(FingerTree.empty<number>().peekFront()).toBeUndefined()
  })

  it('peekBack on empty returns undefined', () => {
    expect(FingerTree.empty<number>().peekBack()).toBeUndefined()
  })

  it('handles pushBack many times', () => {
    let ft = FingerTree.empty<number>()
    for (let i = 0; i < 10; i++) ft = ft.pushBack(i)
    expect(ft.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})
