import { describe, expect, it } from 'vitest'
import { PersistentArray } from '../../src/utils/persistent-array.js'

describe('PersistentArray', () => {
  it('creates from array', () => {
    const arr = PersistentArray.from([1, 2, 3])
    expect(arr.get(0)).toBe(1)
    expect(arr.get(2)).toBe(3)
  })

  it('creates with default value', () => {
    const arr = PersistentArray.create(3, 0)
    expect(arr.length).toBe(3)
    expect(arr.get(0)).toBe(0)
  })

  it('set returns new version', () => {
    const v0 = PersistentArray.from([1, 2, 3])
    const v1 = v0.set(1, 99)
    expect(v0.get(1)).toBe(2)
    expect(v1.get(1)).toBe(99)
  })

  it('toArray returns current state', () => {
    const arr = PersistentArray.from([1, 2, 3]).set(0, 10)
    expect(arr.toArray()).toEqual([10, 2, 3])
  })

  it('map transforms values', () => {
    const arr = PersistentArray.from([1, 2, 3])
    const doubled = arr.map(x => x * 2)
    expect(doubled.toArray()).toEqual([2, 4, 6])
  })

  it('filter returns matching elements', () => {
    const arr = PersistentArray.from([1, 2, 3, 4])
    const evens = arr.filter(x => x % 2 === 0)
    expect(evens.toArray()).toEqual([2, 4])
  })

  it('reduce computes aggregate', () => {
    const arr = PersistentArray.from([1, 2, 3])
    expect(arr.reduce((s, v) => s + v, 0)).toBe(6)
  })

  it('push adds element', () => {
    const arr = PersistentArray.from([1, 2]).push(3)
    expect(arr.length).toBe(3)
    expect(arr.get(2)).toBe(3)
  })

  it('get out of bounds returns undefined', () => {
    const arr = PersistentArray.from([1])
    expect(arr.get(5)).toBeUndefined()
  })

  it('multiple sets preserve history', () => {
    const v0 = PersistentArray.from([1, 2, 3])
    const v1 = v0.set(0, 10)
    const v2 = v1.set(1, 20)
    expect(v0.get(0)).toBe(1)
    expect(v1.get(0)).toBe(10)
    expect(v2.get(0)).toBe(10)
    expect(v2.get(1)).toBe(20)
  })

  it('reduce with index checks all values', () => {
    const arr = PersistentArray.from([10, 20, 30])
    const indices: number[] = []
    arr.reduce<number[]>((acc, v, i) => { indices.push(i); acc.push(v); return acc }, [])
    expect(indices).toEqual([0, 1, 2])
  })

  it('empty array has length 0', () => {
    const arr = PersistentArray.from([])
    expect(arr.length).toBe(0)
  })

  it('set beyond length returns new version', () => {
    const v0 = PersistentArray.from([1, 2])
    const v1 = v0.set(0, 99)
    expect(v0.get(0)).toBe(1)
    expect(v1.get(0)).toBe(99)
    expect(v1.get(1)).toBe(2)
  })

  it('set and get single element', () => {
    const v0 = PersistentArray.from([0])
    const v1 = v0.set(0, 99)
    expect(v0.get(0)).toBe(0)
    expect(v1.get(0)).toBe(99)
  })

  it('map transforms all values', () => {
    const v0 = PersistentArray.from([1, 2, 3])
    const v1 = v0.map((x) => x * 2)
    expect(v1.get(0)).toBe(2)
    expect(v1.get(1)).toBe(4)
    expect(v1.get(2)).toBe(6)
  })

  it('handles empty array', () => {
    const v0 = PersistentArray.from([])
    expect(v0.get(0)).toBeUndefined()
  })

  it('handles set multiple versions', () => {
    const v0 = PersistentArray.from([1, 2, 3])
    const v1 = v0.set(0, 10)
    const v2 = v0.set(0, 20)
    expect(v0.get(0)).toBe(1)
    expect(v1.get(0)).toBe(10)
    expect(v2.get(0)).toBe(20)
  })
})
