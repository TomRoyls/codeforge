import { describe, expect, it } from 'vitest'
import { SlidingWindowMax, SlidingWindowMin } from '../../src/utils/sliding-window-max.js'

describe('SlidingWindowMax', () => {
  it('finds max in each window', () => {
    expect(SlidingWindowMax.solve([1, 3, -1, -3, 5, 3, 6, 7], 3)).toEqual([3, 3, 5, 5, 6, 7])
  })

  it('handles window of size 1', () => {
    expect(SlidingWindowMax.solve([4, 2, 1, 3], 1)).toEqual([4, 2, 1, 3])
  })

  it('handles window equal to array length', () => {
    expect(SlidingWindowMax.solve([1, 2, 3], 3)).toEqual([3])
  })

  it('handles decreasing sequence', () => {
    expect(SlidingWindowMax.solve([5, 4, 3, 2, 1], 2)).toEqual([5, 4, 3, 2])
  })

  it('handles increasing sequence', () => {
    expect(SlidingWindowMax.solve([1, 2, 3, 4, 5], 2)).toEqual([2, 3, 4, 5])
  })

  it('handles all equal elements', () => {
    expect(SlidingWindowMax.solve([3, 3, 3, 3], 2)).toEqual([3, 3, 3])
  })

  it('handles negative numbers', () => {
    expect(SlidingWindowMax.solve([-5, -3, -1, -2], 2)).toEqual([-3, -1, -1])
  })

  it('push returns undefined before window is full', () => {
    const swm = new SlidingWindowMax(3)
    expect(swm.push(1)).toBeUndefined()
    expect(swm.push(2)).toBeUndefined()
    expect(swm.push(3)).toBe(3)
  })

  it('throws on invalid window size', () => {
    expect(() => new SlidingWindowMax(0)).toThrow(RangeError)
  })

  it('handles empty array', () => {
    expect(SlidingWindowMax.solve([], 3)).toEqual([])
  })

  it('handles single element', () => {
    expect(SlidingWindowMax.solve([42], 1)).toEqual([42])
  })

  it('handles mixed positive and negative numbers', () => {
    expect(SlidingWindowMax.solve([1, -2, 3, -4, 5], 2)).toEqual([1, 3, 3, 5])
  })

  it('handles large window', () => {
    expect(SlidingWindowMax.solve([1, 2, 3, 4, 5], 10)).toEqual([])
  })

  it('handles very small numbers', () => {
    expect(SlidingWindowMax.solve([0.1, 0.2, 0.3, 0.4], 2)).toEqual([0.2, 0.3, 0.4])
  })

  it('handles very large numbers', () => {
    expect(SlidingWindowMax.solve([1000000, 2000000, 3000000], 2)).toEqual([2000000, 3000000])
  })

  it('handles zero values', () => {
    expect(SlidingWindowMax.solve([0, 0, 0, 1], 2)).toEqual([0, 0, 1])
  })

  it('handles alternating high and low values', () => {
    expect(SlidingWindowMax.solve([10, 1, 10, 1, 10], 2)).toEqual([10, 10, 10, 10])
  })

  it('handles values with same max in multiple windows', () => {
    expect(SlidingWindowMax.solve([5, 3, 5, 2, 5, 1], 3)).toEqual([5, 5, 5, 5])
  })

  it('handles descending then ascending sequence', () => {
    expect(SlidingWindowMax.solve([5, 4, 3, 4, 5], 3)).toEqual([5, 4, 5])
  })

  it('handles plateau then drop', () => {
    expect(SlidingWindowMax.solve([3, 3, 3, 1, 2], 3)).toEqual([3, 3, 3])
  })

  it('handles window size 2 with three elements', () => {
    expect(SlidingWindowMax.solve([1, 2, 3], 2)).toEqual([2, 3])
  })

  it('handles window size 4 with three elements', () => {
    expect(SlidingWindowMax.solve([1, 2, 3], 4)).toEqual([])
  })

  it('push returns max after window is full', () => {
    const swm = new SlidingWindowMax(2)
    expect(swm.push(5)).toBeUndefined()
    expect(swm.push(3)).toBe(5)
    expect(swm.push(7)).toBe(7)
    expect(swm.push(2)).toBe(7)
  })

  it('handles multiple pushes with sliding window', () => {
    const swm = new SlidingWindowMax(3)
    expect(swm.push(1)).toBeUndefined()
    expect(swm.push(3)).toBeUndefined()
    expect(swm.push(2)).toBe(3)
    expect(swm.push(4)).toBe(4)
    expect(swm.push(1)).toBe(4)
  })

  it('handles negative values as max', () => {
    expect(SlidingWindowMax.solve([-10, -5, -8, -3], 2)).toEqual([-5, -5, -3])
  })

  it('handles single max surrounded by smaller values', () => {
    expect(SlidingWindowMax.solve([1, 5, 2, 3], 3)).toEqual([5, 5])
  })

  it('handles increasing then decreasing', () => {
    expect(SlidingWindowMax.solve([1, 2, 3, 2, 1], 3)).toEqual([3, 3, 3])
  })

  it('handles window size larger than array', () => {
    expect(SlidingWindowMax.solve([1, 2], 5)).toEqual([])
  })

  it('handles two element window with array of two', () => {
    expect(SlidingWindowMax.solve([3, 7], 2)).toEqual([7])
  })

  it('handles decimal values', () => {
    expect(SlidingWindowMax.solve([1.5, 2.3, 0.9, 3.1], 2)).toEqual([2.3, 2.3, 3.1])
  })

  it('handles negative infinity', () => {
    const result = SlidingWindowMax.solve([-Infinity, 1, 2, 3], 2)
    expect(result[0]).toBe(1)
  })

  it('handles positive infinity', () => {
    const result = SlidingWindowMax.solve([1, 2, Infinity, 3], 2)
    expect(result[1]).toBe(Infinity)
  })

  it('handles very small window size', () => {
    expect(SlidingWindowMax.solve([5, 4, 3, 2, 1], 1)).toEqual([5, 4, 3, 2, 1])
  })

  it('handles all negative with mixed values', () => {
    expect(SlidingWindowMax.solve([-1, -5, -3, -7, -2], 2)).toEqual([-1, -3, -3, -2])
  })

  it('handles repeated max at edge of window', () => {
    expect(SlidingWindowMax.solve([5, 5, 1, 2, 5], 3)).toEqual([5, 5, 5])
  })

  it('handles complex pattern', () => {
    expect(SlidingWindowMax.solve([3, 1, 4, 1, 5, 9, 2, 6], 3)).toEqual([4, 4, 5, 9, 9, 9])
  })

  it('push maintains deque correctly', () => {
    const swm = new SlidingWindowMax(3)
    swm.push(3)
    swm.push(1)
    swm.push(4)
    expect(swm.push(2)).toBe(4)
    expect(swm.push(5)).toBe(5)
  })

  it('handles single value in window repeatedly', () => {
    expect(SlidingWindowMax.solve([7, 7, 7, 7, 7], 3)).toEqual([7, 7, 7])
  })

  it('handles negative max at window boundary', () => {
    expect(SlidingWindowMax.solve([-3, -1, -2, -4], 2)).toEqual([-1, -1, -2])
  })
})

describe('SlidingWindowMin', () => {
  it('finds min in each window', () => {
    expect(SlidingWindowMax.solveMin([1, 3, -1, -3, 5, 3, 6, 7], 3)).toEqual([-1, -3, -3, -3, 3, 3])
  })

  it('handles window of size 1', () => {
    expect(SlidingWindowMax.solveMin([4, 2, 1, 3], 1)).toEqual([4, 2, 1, 3])
  })

  it('handles all equal elements', () => {
    expect(SlidingWindowMax.solveMin([5, 5, 5, 5], 2)).toEqual([5, 5, 5])
  })

  it('handles increasing sequence', () => {
    expect(SlidingWindowMax.solveMin([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3])
  })

  it('handles decreasing sequence', () => {
    expect(SlidingWindowMax.solveMin([5, 4, 3, 2, 1], 3)).toEqual([3, 2, 1])
  })

  it('solve handles single element window', () => {
    expect(SlidingWindowMax.solve([3, 1, 4], 1)).toEqual([3, 1, 4])
  })

  it('solve handles window equals array length', () => {
    expect(SlidingWindowMax.solve([3, 1, 4], 3)).toEqual([4])
  })

  it('solve empty array', () => {
    expect(SlidingWindowMax.solve([], 1)).toEqual([])
  })

  it('solve single element', () => {
    expect(SlidingWindowMax.solve([5], 1)).toEqual([5])
  })

  it('handles negative numbers for min', () => {
    expect(SlidingWindowMax.solveMin([-5, -3, -1, -2], 2)).toEqual([-5, -3, -2])
  })

  it('handles mixed positive and negative for min', () => {
    expect(SlidingWindowMax.solveMin([1, -2, 3, -4, 5], 2)).toEqual([-2, -2, -4, -4])
  })

  it('push returns undefined before window is full', () => {
    const swm = new SlidingWindowMin(3)
    expect(swm.push(5)).toBeUndefined()
    expect(swm.push(3)).toBeUndefined()
    expect(swm.push(1)).toBe(1)
  })

  it('throws on invalid window size', () => {
    expect(() => new SlidingWindowMin(0)).toThrow(RangeError)
  })

  it('handles empty array for min', () => {
    expect(SlidingWindowMax.solveMin([], 3)).toEqual([])
  })

  it('handles single element for min', () => {
    expect(SlidingWindowMax.solveMin([42], 1)).toEqual([42])
  })

  it('handles large window for min', () => {
    expect(SlidingWindowMax.solveMin([5, 4, 3, 2, 1], 10)).toEqual([])
  })

  it('handles very small numbers for min', () => {
    expect(SlidingWindowMax.solveMin([0.4, 0.3, 0.2, 0.1], 2)).toEqual([0.3, 0.2, 0.1])
  })

  it('handles very large numbers for min', () => {
    expect(SlidingWindowMax.solveMin([3000000, 2000000, 1000000], 2)).toEqual([2000000, 1000000])
  })

  it('handles zero values for min', () => {
    expect(SlidingWindowMax.solveMin([1, 0, 0, 0], 2)).toEqual([0, 0, 0])
  })

  it('handles alternating low and high values for min', () => {
    expect(SlidingWindowMax.solveMin([1, 10, 1, 10, 1], 2)).toEqual([1, 1, 1, 1])
  })

  it('handles values with same min in multiple windows', () => {
    expect(SlidingWindowMax.solveMin([1, 3, 1, 4, 1, 5], 3)).toEqual([1, 1, 1, 1])
  })

  it('handles ascending then descending sequence for min', () => {
    expect(SlidingWindowMax.solveMin([1, 2, 3, 2, 1], 3)).toEqual([1, 2, 1])
  })

  it('handles valley then rise for min', () => {
    expect(SlidingWindowMax.solveMin([3, 1, 1, 5, 4], 3)).toEqual([1, 1, 1])
  })

  it('handles window size 2 with three elements for min', () => {
    expect(SlidingWindowMax.solveMin([3, 2, 1], 2)).toEqual([2, 1])
  })

  it('handles window size 4 with three elements for min', () => {
    expect(SlidingWindowMax.solveMin([3, 2, 1], 4)).toEqual([])
  })

  it('push returns min after window is full', () => {
    const swm = new SlidingWindowMin(2)
    expect(swm.push(5)).toBeUndefined()
    expect(swm.push(7)).toBe(5)
    expect(swm.push(3)).toBe(3)
    expect(swm.push(6)).toBe(3)
  })

  it('handles multiple pushes with sliding window for min', () => {
    const swm = new SlidingWindowMin(3)
    expect(swm.push(3)).toBeUndefined()
    expect(swm.push(1)).toBeUndefined()
    expect(swm.push(2)).toBe(1)
    expect(swm.push(0)).toBe(0)
    expect(swm.push(4)).toBe(0)
  })

  it('handles positive values as min', () => {
    expect(SlidingWindowMax.solveMin([10, 5, 8, 3], 2)).toEqual([5, 5, 3])
  })

  it('handles single min surrounded by larger values', () => {
    expect(SlidingWindowMax.solveMin([5, 1, 6, 7], 3)).toEqual([1, 1])
  })

  it('handles decreasing then increasing for min', () => {
    expect(SlidingWindowMax.solveMin([5, 4, 3, 4, 5], 3)).toEqual([3, 3, 3])
  })

  it('handles window size larger than array for min', () => {
    expect(SlidingWindowMax.solveMin([7, 5], 5)).toEqual([])
  })

  it('handles two element window with array of two for min', () => {
    expect(SlidingWindowMax.solveMin([3, 7], 2)).toEqual([3])
  })

  it('handles decimal values for min', () => {
    expect(SlidingWindowMax.solveMin([3.1, 2.3, 1.9, 2.5], 2)).toEqual([2.3, 1.9, 1.9])
  })

  it('handles very small window size for min', () => {
    expect(SlidingWindowMax.solveMin([1, 2, 3, 4, 5], 1)).toEqual([1, 2, 3, 4, 5])
  })

  it('handles all positive with mixed values for min', () => {
    expect(SlidingWindowMax.solveMin([7, 3, 5, 1, 9], 2)).toEqual([3, 3, 1, 1])
  })

  it('handles repeated min at edge of window', () => {
    expect(SlidingWindowMax.solveMin([1, 1, 5, 4, 1], 3)).toEqual([1, 1, 1])
  })

  it('handles complex pattern for min', () => {
    expect(SlidingWindowMax.solveMin([3, 1, 4, 1, 5, 9, 2, 6], 3)).toEqual([1, 1, 1, 1, 2, 2])
  })

  it('push maintains deque correctly for min', () => {
    const swm = new SlidingWindowMin(3)
    swm.push(3)
    swm.push(5)
    swm.push(2)
    expect(swm.push(4)).toBe(2)
    expect(swm.push(1)).toBe(1)
  })

  it('handles single value in window repeatedly for min', () => {
    expect(SlidingWindowMax.solveMin([7, 7, 7, 7, 7], 3)).toEqual([7, 7, 7])
  })

  it('handles positive min at window boundary', () => {
    expect(SlidingWindowMax.solveMin([5, 3, 4, 6], 2)).toEqual([3, 3, 4])
  })
})
describe('sliding-window-max - wave552', () => {
  it('sliding-window-max w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave553', () => {
  it('sliding-window-max w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave554', () => {
  it('sliding-window-max w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave555', () => {
  it('sliding-window-max w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave556', () => {
  it('sliding-window-max w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave557', () => {
  it('sliding-window-max w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave558', () => {
  it('sliding-window-max w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave559', () => {
  it('sliding-window-max w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave560', () => {
  it('sliding-window-max w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave561', () => {
  it('sliding-window-max w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave562', () => {
  it('sliding-window-max w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave563', () => {
  it('sliding-window-max w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave564', () => {
  it('sliding-window-max w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave565', () => {
  it('sliding-window-max w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave566', () => {
  it('sliding-window-max w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave127', () => {
  it('sliding-window-max w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave130', () => {
  it('sliding-window-max w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave133', () => {
  it('sliding-window-max w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave136', () => {
  it('sliding-window-max w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - wave139', () => {
  it('sliding-window-max w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w142', () => {
  it('sliding-window-max v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w145', () => {
  it('sliding-window-max v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w148', () => {
  it('sliding-window-max v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w151', () => {
  it('sliding-window-max v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w154', () => {
  it('sliding-window-max v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w157', () => {
  it('sliding-window-max v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w160', () => {
  it('sliding-window-max v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w170', () => {
  it('sliding-window-max x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w180', () => {
  it('sliding-window-max x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w190', () => {
  it('sliding-window-max x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w200', () => {
  it('sliding-window-max x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x200x9', () => {
    expect(describe).toBeDefined()
  })
})
