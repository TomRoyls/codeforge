import { describe, expect, it } from 'vitest'
import { VanEmdeBoasTree } from '../../../src/core/van-emde-boas/van-emde-boas.js'

describe('VanEmdeBoasTree', () => {
  it('should construct with default universe size of 16', () => {
    const veb = new VanEmdeBoasTree()
    expect(veb.isEmpty()).toBe(true)
    expect(veb.size()).toBe(0)
  })

  it('should construct with custom universe size of 8', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    expect(veb.isEmpty()).toBe(true)
    expect(veb.size()).toBe(0)
  })

  it('should throw error for universe size less than 2', () => {
    expect(() => new VanEmdeBoasTree({ universeSize: 1 })).toThrow('Universe size must be at least 2')
  })

  it('should throw error for non-power-of-two universe size', () => {
    expect(() => new VanEmdeBoasTree({ universeSize: 5 })).toThrow('Universe size must be a power of 2')
  })

  it('should insert single element', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    veb.insert(3)
    expect(veb.has(3)).toBe(true)
    expect(veb.size()).toBe(1)
    expect(veb.isEmpty()).toBe(false)
  })

  it('should insert multiple elements', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(5)
    veb.insert(10)
    veb.insert(2)
    expect(veb.has(5)).toBe(true)
    expect(veb.has(10)).toBe(true)
    expect(veb.has(2)).toBe(true)
    expect(veb.size()).toBe(3)
  })

  it('should not insert duplicate element', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    veb.insert(3)
    veb.insert(3)
    expect(veb.size()).toBe(1)
  })

  it('should throw RangeError for value out of range', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    expect(() => veb.insert(8)).toThrow('Value 8 out of universe range [0, 8)')
    expect(() => veb.insert(-1)).toThrow('Value -1 out of universe range [0, 8)')
  })

  it('should delete existing element', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    veb.insert(3)
    const deleted = veb.delete(3)
    expect(deleted).toBe(true)
    expect(veb.has(3)).toBe(false)
    expect(veb.size()).toBe(0)
  })

  it('should return false when deleting non-existent element', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    const deleted = veb.delete(3)
    expect(deleted).toBe(false)
  })

  it('should return false for delete out of range', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    expect(veb.delete(-1)).toBe(false)
    expect(veb.delete(8)).toBe(false)
  })

  it('should delete min and max correctly', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(2)
    veb.insert(5)
    veb.insert(10)
    veb.delete(2)
    expect(veb.min()).toBe(5)
    veb.delete(10)
    expect(veb.max()).toBe(5)
  })

  it('should return correct min', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(5)
    veb.insert(2)
    veb.insert(10)
    expect(veb.min()).toBe(2)
  })

  it('should return undefined min for empty tree', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    expect(veb.min()).toBe(undefined)
  })

  it('should return correct max', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(5)
    veb.insert(2)
    veb.insert(10)
    expect(veb.max()).toBe(10)
  })

  it('should return undefined max for empty tree', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    expect(veb.max()).toBe(undefined)
  })

  it('should find successor correctly', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(2)
    veb.insert(5)
    veb.insert(10)
    expect(veb.successor(2)).toBe(5)
    expect(veb.successor(5)).toBe(10)
  })

  it('should return undefined for successor of max', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(2)
    veb.insert(5)
    veb.insert(10)
    expect(veb.successor(10)).toBe(undefined)
  })

  it('should return undefined for successor of out of range', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(2)
    veb.insert(5)
    expect(veb.successor(-1)).toBe(undefined)
    expect(veb.successor(16)).toBe(undefined)
  })

  it('should find predecessor correctly', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(2)
    veb.insert(5)
    veb.insert(10)
    expect(veb.predecessor(5)).toBe(2)
    expect(veb.predecessor(10)).toBe(5)
  })

  it('should return undefined for predecessor of min', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(2)
    veb.insert(5)
    veb.insert(10)
    expect(veb.predecessor(2)).toBe(undefined)
  })

  it('should return undefined for predecessor of out of range', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(5)
    veb.insert(10)
    expect(veb.predecessor(-1)).toBe(undefined)
    expect(veb.predecessor(16)).toBe(undefined)
  })

  it('should handle single element tree', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    veb.insert(3)
    expect(veb.min()).toBe(3)
    expect(veb.max()).toBe(3)
    expect(veb.has(3)).toBe(true)
    expect(veb.successor(3)).toBe(undefined)
    expect(veb.predecessor(3)).toBe(undefined)
  })

  it('should clear all elements', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(2)
    veb.insert(5)
    veb.insert(10)
    veb.clear()
    expect(veb.isEmpty()).toBe(true)
    expect(veb.size()).toBe(0)
    expect(veb.has(2)).toBe(false)
  })

  it('should convert to sorted array', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(10)
    veb.insert(2)
    veb.insert(5)
    veb.insert(7)
    const arr = veb.toArray()
    expect(arr).toEqual([2, 5, 7, 10])
  })

  it('should return empty array for empty tree toArray', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    expect(veb.toArray()).toEqual([])
  })

  it('should handle has for out of range values', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 8 })
    veb.insert(3)
    expect(veb.has(-1)).toBe(false)
    expect(veb.has(8)).toBe(false)
  })

  it('should handle insert, delete, insert sequence', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(3)
    veb.insert(5)
    veb.delete(3)
    veb.insert(3)
    expect(veb.has(3)).toBe(true)
    expect(veb.has(5)).toBe(true)
    expect(veb.size()).toBe(2)
  })

  it('should handle universe size of 2 (minimum)', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 2 })
    veb.insert(0)
    veb.insert(1)
    expect(veb.has(0)).toBe(true)
    expect(veb.has(1)).toBe(true)
    expect(veb.size()).toBe(2)
  })

  it('should handle successor and predecessor with gaps', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    veb.insert(1)
    veb.insert(5)
    veb.insert(10)
    expect(veb.successor(1)).toBe(5)
    expect(veb.successor(5)).toBe(10)
    expect(veb.predecessor(5)).toBe(1)
    expect(veb.predecessor(10)).toBe(5)
  })

  it('should maintain size correctly after operations', () => {
    const veb = new VanEmdeBoasTree({ universeSize: 16 })
    expect(veb.size()).toBe(0)
    veb.insert(2)
    expect(veb.size()).toBe(1)
    veb.insert(5)
    expect(veb.size()).toBe(2)
    veb.delete(2)
    expect(veb.size()).toBe(1)
    veb.insert(10)
    expect(veb.size()).toBe(2)
    veb.delete(5)
    expect(veb.size()).toBe(1)
  })
})