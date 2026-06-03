import { describe, expect, it } from 'vitest'
import { ImplicitKeyTree } from '../../src/utils/implicit-key-tree.js'

describe('ImplicitKeyTree', () => {
  it('insert and get', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 10)
    t.insert(1, 20)
    expect(t.get(0)).toBe(10)
    expect(t.get(1)).toBe(20)
  })

  it('insert at beginning', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(0, 2)
    expect(t.toArray()).toEqual([2, 1])
  })

  it('insert in middle', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(1, 3)
    t.insert(1, 2)
    expect(t.toArray()).toEqual([1, 2, 3])
  })

  it('remove element', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 10)
    t.insert(1, 20)
    t.insert(2, 30)
    expect(t.remove(1)).toBe(20)
    expect(t.toArray()).toEqual([10, 30])
  })

  it('length tracks correctly', () => {
    const t = new ImplicitKeyTree()
    expect(t.length).toBe(0)
    t.insert(0, 1)
    expect(t.length).toBe(1)
    t.remove(0)
    expect(t.length).toBe(0)
  })

  it('handles many inserts', () => {
    const t = new ImplicitKeyTree()
    for (let i = 0; i < 100; i++) t.insert(i, i)
    expect(t.length).toBe(100)
    expect(t.get(0)).toBe(0)
    expect(t.get(99)).toBe(99)
  })

  it('remove from beginning', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(1, 2)
    t.insert(2, 3)
    expect(t.remove(0)).toBe(1)
    expect(t.toArray()).toEqual([2, 3])
  })

  it('remove from end', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(1, 2)
    t.insert(2, 3)
    expect(t.remove(2)).toBe(3)
    expect(t.toArray()).toEqual([1, 2])
  })

  it('get out of bounds returns undefined', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    expect(t.get(5)).toBeUndefined()
  })

  it('remove from empty returns undefined', () => {
    const t = new ImplicitKeyTree()
    expect(t.remove(0)).toBeUndefined()
  })

  it('toArray returns correct order', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 3)
    t.insert(0, 1)
    t.insert(1, 2)
    expect(t.toArray()).toEqual([1, 2, 3])
  })

  it('handles many insertions', () => {
    const t = new ImplicitKeyTree()
    for (let i = 0; i < 50; i++) t.insert(i, i)
    expect(t.get(0)).toBe(0)
    expect(t.get(49)).toBe(49)
  })

  it('insert after removes preserves order', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 10)
    t.insert(1, 20)
    t.remove(0)
    t.insert(0, 99)
    expect(t.get(0)).toBe(99)
    expect(t.get(1)).toBe(20)
  })

  it('get negative index returns undefined', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    expect(t.get(-1)).toBeUndefined()
  })

  it('length after mixed operations', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(1, 2)
    t.remove(0)
    expect(t.length).toBe(1)
  })

  it('handles get out of bounds', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(1, 2)
    expect(t.get(5)).toBeUndefined()
  })

  it('length after multiple inserts', () => {
    const t = new ImplicitKeyTree<number, number>()
    for (let i = 0; i < 5; i++) t.insert(i, i * 10)
    expect(t.length).toBe(5)
  })

  it('get returns correct value', () => {
    const t = new ImplicitKeyTree<number, number>()
    t.insert(0, 42)
    t.insert(1, 99)
    expect(t.get(0)).toBe(42)
    expect(t.get(1)).toBe(99)
  })

  it('toArray returns all elements', () => {
    const t = new ImplicitKeyTree<number, number>()
    t.insert(0, 10)
    t.insert(1, 20)
    t.insert(2, 30)
    expect(t.toArray()).toEqual([10, 20, 30])
  })

  it('toArray returns empty for empty tree', () => {
    const t = new ImplicitKeyTree<number>()
    expect(t.toArray()).toEqual([])
  })

  it('insert increases toArray length', () => {
    const t = new ImplicitKeyTree<number>()
    t.insert(5)
    expect(t.toArray().length).toBe(1)
  })

  it('insert at index and get', () => {
    const t = new ImplicitKeyTree<number>()
    t.insert(0, 10)
    t.insert(1, 20)
    expect(t.get(0)).toBe(10)
    expect(t.get(1)).toBe(20)
  })
})
