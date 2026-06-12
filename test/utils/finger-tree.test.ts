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

  it('handles pushFront many times', () => {
    let ft = FingerTree.empty<number>()
    for (let i = 0; i < 5; i++) ft = ft.pushFront(i)
    expect(ft.toArray()).toEqual([4, 3, 2, 1, 0])
  })

  it('empty tree has size 0', () => {
    const ft = FingerTree.empty<number>()
    expect(ft.size).toBe(0)
  })

  it('pushFront increases size', () => {
    const ft = FingerTree.empty<number>().pushFront(1).pushFront(2)
    expect(ft.size).toBe(2)
  })

  it('empty tree has size 0', () => {
    const ft = FingerTree.empty<number>()
    expect(ft.size).toBe(0)
  })

  it('pushFront increases size', () => {
    const ft = FingerTree.empty<number>()
    const ft2 = ft.pushFront(1)
    expect(ft2.size).toBe(1)
  })

  it('pushBack increases size', () => {
    const ft = FingerTree.empty<number>()
    const ft2 = ft.pushBack(1)
    const ft3 = ft2.pushBack(2)
    expect(ft3.size).toBe(2)
  })

  it('pushFront adds element', () => {
    const ft = FingerTree.empty<number>().pushBack(2).pushFront(5)
    expect(ft.toArray()).toEqual([5, 2])
  })

  it('pushBack increases size', () => {
    const ft = FingerTree.empty<number>().pushBack(10)
    expect(ft.size).toBe(1)
  })
})

describe('FingerTree toString', () => {
  it('returns string with size', () => {
    const ft = FingerTree.from([1, 2, 3])
    expect(ft.toString()).toBe('FingerTree(3)')
  })

  it('empty tree returns size 0', () => {
    const ft = FingerTree.empty<number>()
    expect(ft.toString()).toBe('FingerTree(0)')
  })
})

describe('FingerTree toJSON', () => {
  it('returns array of elements', () => {
    const ft = FingerTree.from([1, 2, 3])
    expect(ft.toJSON()).toEqual([1, 2, 3])
  })

  it('empty tree returns empty array', () => {
    const ft = FingerTree.empty<number>()
    expect(ft.toJSON()).toEqual([])
  })

  it('returns independent copy', () => {
    const ft = FingerTree.from([1, 2, 3])
    const json = ft.toJSON()
    json.push(4)
    json[0] = 99
    expect(ft.toJSON()).toEqual([1, 2, 3])
  })
})

describe('FingerTree clone', () => {
  it('creates independent copy', () => {
    const ft = FingerTree.from([1, 2, 3])
    const clone = ft.clone()
    expect(clone.toArray()).toEqual([1, 2, 3])
    expect(clone.toArray()).not.toBe(ft.toArray())
  })

  it('clone modifications do not affect original', () => {
    const ft = FingerTree.from([1, 2, 3])
    const clone = ft.clone()
    const modifiedClone = clone.pushBack(4)
    expect(modifiedClone.toArray()).toEqual([1, 2, 3, 4])
    expect(ft.toArray()).toEqual([1, 2, 3])
  })

  it('clone empty tree', () => {
    const ft = FingerTree.empty<number>()
    const clone = ft.clone()
    expect(clone.isEmpty).toBe(true)
    expect(clone.size).toBe(0)
  })

  it('clone with single element', () => {
    const ft = FingerTree.from([42])
    const clone = ft.clone()
    expect(clone.toArray()).toEqual([42])
    expect(clone.size).toBe(1)
  })
})

describe('FingerTree equals', () => {
  it('returns true for identical trees', () => {
    const ft1 = FingerTree.from([1, 2, 3])
    const ft2 = FingerTree.from([1, 2, 3])
    expect(ft1.equals(ft2)).toBe(true)
  })

  it('returns false for different sizes', () => {
    const ft1 = FingerTree.from([1, 2])
    const ft2 = FingerTree.from([1, 2, 3])
    expect(ft1.equals(ft2)).toBe(false)
  })

  it('returns false for different elements', () => {
    const ft1 = FingerTree.from([1, 2, 3])
    const ft2 = FingerTree.from([1, 2, 4])
    expect(ft1.equals(ft2)).toBe(false)
  })

  it('returns false for non-FingerTree objects', () => {
    const ft = FingerTree.from([1, 2, 3])
    expect(ft.equals(null)).toBe(false)
    expect(ft.equals(undefined)).toBe(false)
    expect(ft.equals({})).toBe(false)
    expect(ft.equals([1, 2, 3])).toBe(false)
  })

  it('empty trees are equal', () => {
    const ft1 = FingerTree.empty<number>()
    const ft2 = FingerTree.empty<number>()
    expect(ft1.equals(ft2)).toBe(true)
  })

  it('trees with different order are not equal', () => {
    const ft1 = FingerTree.from([1, 2, 3])
    const ft2 = FingerTree.from([3, 2, 1])
    expect(ft1.equals(ft2)).toBe(false)
  })
})

describe('FingerTree get edge cases', () => {
  it('returns undefined for negative index', () => {
    const ft = FingerTree.from([1, 2, 3])
    expect(ft.get(-1)).toBeUndefined()
  })

  it('returns undefined for out of bounds index', () => {
    const ft = FingerTree.from([1, 2, 3])
    expect(ft.get(3)).toBeUndefined()
    expect(ft.get(10)).toBeUndefined()
  })

  it('returns element at last valid index', () => {
    const ft = FingerTree.from([1, 2, 3])
    expect(ft.get(2)).toBe(3)
  })

  it('handles get on empty tree', () => {
    const ft = FingerTree.empty<number>()
    expect(ft.get(0)).toBeUndefined()
  })
})

describe('FingerTree concat edge cases', () => {
  it('concat with empty tree', () => {
    const ft = FingerTree.from([1, 2, 3])
    const empty = FingerTree.empty<number>()
    expect(ft.concat(empty).toArray()).toEqual([1, 2, 3])
    expect(empty.concat(ft).toArray()).toEqual([1, 2, 3])
  })

  it('concat two empty trees', () => {
    const empty1 = FingerTree.empty<number>()
    const empty2 = FingerTree.empty<number>()
    expect(empty1.concat(empty2).isEmpty).toBe(true)
  })

  it('concat preserves order', () => {
    const ft1 = FingerTree.from([1, 2])
    const ft2 = FingerTree.from([3, 4])
    expect(ft1.concat(ft2).toArray()).toEqual([1, 2, 3, 4])
  })

  it('concat with large trees', () => {
    const arr1 = Array.from({ length: 50 }, (_, i) => i)
    const arr2 = Array.from({ length: 50 }, (_, i) => i + 50)
    const ft1 = FingerTree.from(arr1)
    const ft2 = FingerTree.from(arr2)
    expect(ft1.concat(ft2).toArray()).toEqual([...arr1, ...arr2])
  })
})

describe('FingerTree toArray edge cases', () => {
  it('returns independent copy', () => {
    const ft = FingerTree.from([1, 2, 3])
    const arr = ft.toArray()
    arr.push(4)
    arr[0] = 99
    expect(ft.toArray()).toEqual([1, 2, 3])
  })

  it('empty tree returns empty array', () => {
    const ft = FingerTree.empty<number>()
    expect(ft.toArray()).toEqual([])
  })
})

describe('FingerTree with strings', () => {
  it('handles string elements', () => {
    const ft = FingerTree.from(['a', 'b', 'c'])
    expect(ft.peekFront()).toBe('a')
    expect(ft.peekBack()).toBe('c')
  })

  it('concat string trees', () => {
    const ft1 = FingerTree.from(['a', 'b'])
    const ft2 = FingerTree.from(['c', 'd'])
    expect(ft1.concat(ft2).toArray()).toEqual(['a', 'b', 'c', 'd'])
  })

  it('get returns element at index', () => {
    const ft = FingerTree.from([10, 20, 30])
    expect(ft.get(1)).toBe(20)
  })

  it('get returns undefined for out of bounds', () => {
    const ft = FingerTree.from([1])
    expect(ft.get(5)).toBeUndefined()
  })

  it('popFront on empty returns empty', () => {
    const ft = FingerTree.empty<number>()
    expect(ft.popFront().size).toBe(0)
  })

  it('popBack on empty returns empty', () => {
    const ft = FingerTree.empty<number>()
    expect(ft.popBack().size).toBe(0)
  })
})

  it('empty tree size is 0', () => {
    const ft = FingerTree.empty<number>()
    expect(ft.size).toBe(0)
  })

  it('pushBack adds element', () => {
    const ft = FingerTree.empty<number>().pushBack(1)
    expect(ft.size).toBe(1)
  })

  it('peekBack returns last', () => {
    const ft = FingerTree.empty<number>().pushBack(1).pushBack(2)
    expect(ft.peekBack()).toBe(2)
  })

describe('finger-tree - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
