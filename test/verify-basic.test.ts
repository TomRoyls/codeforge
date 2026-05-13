import { describe, it, expect } from 'vitest'

describe('Verify Basic', () => {
  it('should spread array', () => {
    const arr = [2, 1]
    expect([...arr]).toEqual([2, 1])
  })

  it('should sort array', () => {
    const arr = [2, 1]
    expect(arr.sort((a, b) => a - b)).toEqual([1, 2])
  })
})
