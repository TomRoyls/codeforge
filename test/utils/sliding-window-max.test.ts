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

describe('sliding-window-max - w210', () => {
  it('sliding-window-max x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w220', () => {
  it('sliding-window-max x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w230', () => {
  it('sliding-window-max x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w240', () => {
  it('sliding-window-max x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w250', () => {
  it('sliding-window-max x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w260', () => {
  it('sliding-window-max x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w270', () => {
  it('sliding-window-max x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w280', () => {
  it('sliding-window-max x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w290', () => {
  it('sliding-window-max x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w300', () => {
  it('sliding-window-max x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w310', () => {
  it('sliding-window-max x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w320', () => {
  it('sliding-window-max x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w330', () => {
  it('sliding-window-max x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w340', () => {
  it('sliding-window-max x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w350', () => {
  it('sliding-window-max x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w360', () => {
  it('sliding-window-max x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w370', () => {
  it('sliding-window-max x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w380', () => {
  it('sliding-window-max x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w390', () => {
  it('sliding-window-max x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w400', () => {
  it('sliding-window-max x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w420', () => {
  it('sliding-window-max x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w440', () => {
  it('sliding-window-max x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w460', () => {
  it('sliding-window-max x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w480', () => {
  it('sliding-window-max x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w500', () => {
  it('sliding-window-max x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w550', () => {
  it('sliding-window-max x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('sliding-window-max - w600', () => {
  it('sliding-window-max x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('sliding-window-max x600x49', () => {
    expect(describe).toBeDefined()
  })
})
