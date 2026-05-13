import { describe, it, expect } from 'vitest'
import { PatienceSort3 } from '../src/core/patience-sort-3/index'

describe('Quick Test', () => {
  it('should sort two elements', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sort([2, 1])).toEqual([1, 2])
  })
})
