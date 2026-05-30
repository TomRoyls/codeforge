import { describe, expect, it } from 'vitest'
import { VanEmdeBoas } from '../../../src/utils/van-emde-boas.js'

describe('VanEmdeBoas', () => {
  it('should throw RangeError for universe size less than 2', () => {
    expect(() => new VanEmdeBoas(1)).toThrow(RangeError)
    expect(() => new VanEmdeBoas(0)).toThrow(RangeError)
    expect(() => new VanEmdeBoas(-5)).toThrow(RangeError)
  })

  it('should throw RangeError for non-power-of-2 universe size', () => {
    expect(() => new VanEmdeBoas(3)).toThrow(RangeError)
    expect(() => new VanEmdeBoas(5)).toThrow(RangeError)
    expect(() => new VanEmdeBoas(6)).toThrow(RangeError)
    expect(() => new VanEmdeBoas(7)).toThrow(RangeError)
  })

  it('should accept valid power-of-2 universe sizes', () => {
    expect(() => new VanEmdeBoas(2)).not.toThrow()
    expect(() => new VanEmdeBoas(4)).not.toThrow()
    expect(() => new VanEmdeBoas(8)).not.toThrow()
    expect(() => new VanEmdeBoas(16)).not.toThrow()
  })

  it('should insert and check values with has', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    expect(veb.has(5)).toBe(true)
    expect(veb.has(6)).toBe(false)
  })

  it('should insert and check values with contains', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    expect(veb.contains(5)).toBe(true)
    expect(veb.contains(6)).toBe(false)
  })

  it('should return correct min value', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.insert(3)
    veb.insert(8)
    expect(veb.min()).toBe(3)
  })

  it('should return correct max value', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.insert(3)
    veb.insert(8)
    expect(veb.max()).toBe(8)
  })

  it('should return undefined min for empty veb', () => {
    const veb = new VanEmdeBoas(16)
    expect(veb.min()).toBeUndefined()
  })

  it('should return undefined max for empty veb', () => {
    const veb = new VanEmdeBoas(16)
    expect(veb.max()).toBeUndefined()
  })

  it('should return empty for newly created veb', () => {
    const veb = new VanEmdeBoas(16)
    expect(veb.isEmpty()).toBe(true)
  })

  it('should not be empty after insertion', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    expect(veb.isEmpty()).toBe(false)
  })

  it('should be empty after clearing', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.insert(3)
    veb.clear()
    expect(veb.isEmpty()).toBe(true)
  })

  it('should delete existing values', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.insert(3)
    veb.delete(5)
    expect(veb.has(5)).toBe(false)
    expect(veb.has(3)).toBe(true)
  })

  it('should not delete non-existent values', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.delete(999)
    expect(veb.has(5)).toBe(true)
  })

  it('should handle universe size 2', () => {
    const veb = new VanEmdeBoas(2)
    veb.insert(0)
    veb.insert(1)
    expect(veb.has(0)).toBe(true)
    expect(veb.has(1)).toBe(true)
    expect(veb.min()).toBe(0)
    expect(veb.max()).toBe(1)
  })

  it('should find successor correctly', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.insert(8)
    veb.insert(12)
    expect(veb.successor(5)).toBe(8)
    expect(veb.successor(8)).toBe(12)
    expect(veb.successor(12)).toBeUndefined()
  })

  it('should return undefined successor for values larger than max', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    expect(veb.successor(10)).toBeUndefined()
  })

  it('should return min as successor for values less than min', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    expect(veb.successor(0)).toBe(5)
  })

  it('should find predecessor correctly', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.insert(8)
    veb.insert(12)
    expect(veb.predecessor(8)).toBe(5)
    expect(veb.predecessor(12)).toBe(8)
    expect(veb.predecessor(5)).toBeUndefined()
  })

  it('should return undefined predecessor for values smaller than min', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    expect(veb.predecessor(0)).toBeUndefined()
  })

  it('should return max as predecessor for values greater than max', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    expect(veb.predecessor(10)).toBe(5)
  })

  it('should track size correctly', () => {
    const veb = new VanEmdeBoas(16)
    expect(veb.size).toBe(0)
    veb.insert(5)
    expect(veb.size).toBe(1)
    veb.insert(3)
    expect(veb.size).toBe(2)
  })

  it('should update size after deletion', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.insert(3)
    veb.delete(5)
    expect(veb.size).toBe(1)
  })

  it('should handle duplicate insertions', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.insert(5)
    expect(veb.size).toBe(1)
    expect(veb.has(5)).toBe(true)
  })

  it('should not contain after delete', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.delete(5)
    expect(veb.contains(5)).toBe(false)
  })

  it('should handle larger universe sizes', () => {
    const veb = new VanEmdeBoas(64)
    veb.insert(15)
    veb.insert(30)
    veb.insert(45)
    expect(veb.has(15)).toBe(true)
    expect(veb.has(30)).toBe(true)
    expect(veb.has(45)).toBe(true)
    expect(veb.min()).toBe(15)
    expect(veb.max()).toBe(45)
  })

  it('should handle successor after deletion', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.insert(8)
    veb.insert(12)
    veb.delete(8)
    expect(veb.successor(5)).toBe(12)
  })

  it('should handle predecessor after deletion', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(5)
    veb.insert(8)
    veb.insert(12)
    veb.delete(8)
    expect(veb.predecessor(12)).toBe(5)
  })

  it('should return universe size', () => {
    const veb = new VanEmdeBoas(16)
    expect(veb.universeSize).toBe(16)
  })

  it('should handle negative values gracefully', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(-5)
    expect(veb.has(-5)).toBe(false)
    expect(veb.size).toBe(0)
  })

  it('should handle values equal to universe size gracefully', () => {
    const veb = new VanEmdeBoas(16)
    veb.insert(16)
    expect(veb.has(16)).toBe(false)
    expect(veb.size).toBe(0)
  })

  it('should handle many operations without losing structure', () => {
    const veb = new VanEmdeBoas(64)
    for (let i = 0; i < 32; i++) {
      veb.insert(i * 2)
    }
    expect(veb.size).toBe(32)
    expect(veb.min()).toBe(0)
    expect(veb.max()).toBe(62)
    for (let i = 0; i < 16; i++) {
      veb.delete(i * 4)
    }
    expect(veb.size).toBe(16)
  })
})