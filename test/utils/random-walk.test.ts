import { describe, expect, it } from 'vitest'
import { RandomWalk } from '../../src/utils/random-walk.js'

describe('RandomWalk', () => {
  it('walk1D returns correct number of steps', () => {
    const walk = RandomWalk.walk1D(10)
    expect(walk.length).toBe(11)
    expect(walk[0]).toBe(0)
  })

  it('walk1D with deterministic seed', () => {
    let seed = 42
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const walk1 = RandomWalk.walk1D(5, { seed: rng })
    seed = 42
    const rng2 = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const walk2 = RandomWalk.walk1D(5, { seed: rng2 })
    expect(walk1).toEqual(walk2)
  })

  it('walk1D steps are +/- 1', () => {
    const walk = RandomWalk.walk1D(100)
    for (let i = 1; i < walk.length; i++) {
      expect(Math.abs(walk[i]! - walk[i - 1]!)).toBe(1)
    }
  })

  it('walk1D handles 0 steps', () => {
    expect(RandomWalk.walk1D(0)).toEqual([0])
  })

  it('walk1D with 1 step', () => {
    const walk = RandomWalk.walk1D(1)
    expect(walk.length).toBe(2)
    expect(walk[0]).toBe(0)
    expect(Math.abs(walk[1]!)).toBe(1)
  })

  it('maxDistance1D returns correct max', () => {
    expect(RandomWalk.maxDistance1D([0, 1, 2, 1, 0, -1, -2])).toBe(2)
  })

  it('maxDistance1D handles single point', () => {
    expect(RandomWalk.maxDistance1D([0])).toBe(0)
  })

  it('maxDistance1D handles all zeros', () => {
    expect(RandomWalk.maxDistance1D([0, 0, 0, 0])).toBe(0)
  })

  it('maxDistance1D handles negative values', () => {
    expect(RandomWalk.maxDistance1D([-5, -3, -1])).toBe(5)
  })

  it('maxDistance1D handles mixed values', () => {
    expect(RandomWalk.maxDistance1D([-3, 0, 2, -1, 4])).toBe(4)
  })

  it('finalPosition1D returns last position', () => {
    expect(RandomWalk.finalPosition1D([0, 1, 2, 3])).toBe(3)
  })

  it('finalPosition1D handles single element', () => {
    expect(RandomWalk.finalPosition1D([5])).toBe(5)
  })

  it('finalPosition1D handles negative', () => {
    expect(RandomWalk.finalPosition1D([0, -1, -2])).toBe(-2)
  })

  it('returnsToOrigin1D detects return', () => {
    expect(RandomWalk.returnsToOrigin1D([0, 1, 0])).toBe(true)
  })

  it('returnsToOrigin1D no return', () => {
    expect(RandomWalk.returnsToOrigin1D([0, 1, 2])).toBe(false)
  })

  it('returnsToOrigin1D returns immediately', () => {
    expect(RandomWalk.returnsToOrigin1D([0, 1, 0, 1])).toBe(true)
  })

  it('returnsToOrigin1D single element no return', () => {
    expect(RandomWalk.returnsToOrigin1D([0])).toBe(false)
  })

  it('walk2D returns correct number of steps', () => {
    const walk = RandomWalk.walk2D(5)
    expect(walk.length).toBe(6)
    expect(walk[0]).toEqual({ x: 0, y: 0 })
  })

  it('walk2D steps are unit moves', () => {
    const walk = RandomWalk.walk2D(100)
    for (let i = 1; i < walk.length; i++) {
      const dx = Math.abs(walk[i]!.x - walk[i - 1]!.x)
      const dy = Math.abs(walk[i]!.y - walk[i - 1]!.y)
      expect(dx + dy).toBe(1)
    }
  })

  it('walk2D handles 0 steps', () => {
    expect(RandomWalk.walk2D(0)).toEqual([{ x: 0, y: 0 }])
  })

  it('walk2D with 1 step', () => {
    const walk = RandomWalk.walk2D(1)
    expect(walk.length).toBe(2)
    expect(walk[0]).toEqual({ x: 0, y: 0 })
    const d = Math.abs(walk[1]!.x) + Math.abs(walk[1]!.y)
    expect(d).toBe(1)
  })

  it('walk2D with deterministic seed', () => {
    let seed = 42
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const walk1 = RandomWalk.walk2D(5, { seed: rng })
    seed = 42
    const rng2 = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const walk2 = RandomWalk.walk2D(5, { seed: rng2 })
    expect(walk1).toEqual(walk2)
  })

  it('uniquePositions2D counts correctly', () => {
    const positions = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }]
    expect(RandomWalk.uniquePositions2D(positions)).toBe(2)
  })

  it('uniquePositions2D counts single point', () => {
    expect(RandomWalk.uniquePositions2D([{ x: 0, y: 0 }])).toBe(1)
  })

  it('uniquePositions2D all unique', () => {
    const positions = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]
    expect(RandomWalk.uniquePositions2D(positions)).toBe(3)
  })

  it('uniquePositions2D all same', () => {
    const positions = [{ x: 5, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 5 }]
    expect(RandomWalk.uniquePositions2D(positions)).toBe(1)
  })

  it('simulateMultiple1D returns statistics', () => {
    const result = RandomWalk.simulateMultiple1D(50, 20)
    expect(result.avgFinalPos).toBeGreaterThanOrEqual(0)
    expect(result.avgMaxDist).toBeGreaterThanOrEqual(0)
    expect(result.returnRate).toBeGreaterThanOrEqual(0)
    expect(result.returnRate).toBeLessThanOrEqual(1)
  })

  it('simulateMultiple1D with deterministic seed', () => {
    let seed = 42
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    let seed2 = 42
    const rng2 = () => {
      seed2 = (seed2 * 1103515245 + 12345) & 0x7fffffff
      return seed2 / 0x7fffffff
    }
    const r1 = RandomWalk.simulateMultiple1D(10, 5, { seed: rng })
    const r2 = RandomWalk.simulateMultiple1D(10, 5, { seed: rng2 })
    expect(r1).toEqual(r2)
  })

  it('walk1D produces integer positions', () => {
    const walk = RandomWalk.walk1D(20)
    for (const p of walk) {
      expect(Number.isInteger(p)).toBe(true)
    }
  })

  it('walk2D produces integer coordinates', () => {
    const walk = RandomWalk.walk2D(20)
    for (const p of walk) {
      expect(Number.isInteger(p.x)).toBe(true)
      expect(Number.isInteger(p.y)).toBe(true)
    }
  })

  it('maxDistance1D with empty array returns 0', () => {
    expect(RandomWalk.maxDistance1D([])).toBe(0)
  })

  it('walk1D large step count', () => {
    const walk = RandomWalk.walk1D(1000)
    expect(walk.length).toBe(1001)
  })

  it('walk2D large step count', () => {
    const walk = RandomWalk.walk2D(500)
    expect(walk.length).toBe(501)
  })

  it('simulateMultiple1D return rate is between 0 and 1', () => {
    const result = RandomWalk.simulateMultiple1D(100, 10)
    expect(result.returnRate).toBeGreaterThanOrEqual(0)
    expect(result.returnRate).toBeLessThanOrEqual(1)
  })

  it('walk1D with always-up seed', () => {
    const alwaysUp = () => 0.9
    const walk = RandomWalk.walk1D(5, { seed: alwaysUp })
    expect(walk).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('walk1D with always-down seed', () => {
    const alwaysDown = () => 0.1
    const walk = RandomWalk.walk1D(5, { seed: alwaysDown })
    expect(walk).toEqual([0, -1, -2, -3, -4, -5])
  })

  it('walk2D with deterministic seed produces valid moves', () => {
    const walk = RandomWalk.walk2D(50)
    for (let i = 1; i < walk.length; i++) {
      const dx = walk[i]!.x - walk[i - 1]!.x
      const dy = walk[i]!.y - walk[i - 1]!.y
      expect([[-1, 0], [1, 0], [0, -1], [0, 1]].some(([ex, ey]) => dx === ex && dy === ey)).toBe(true)
    }
  })

  it('uniquePositions2D handles empty array', () => {
    expect(RandomWalk.uniquePositions2D([])).toBe(0)
  })

  it('simulateMultiple1D avgMaxDist is positive for nonzero steps', () => {
    const result = RandomWalk.simulateMultiple1D(50, 100)
    expect(result.avgMaxDist).toBeGreaterThan(0)
  })

  it('finalPosition1D matches last element', () => {
    const walk = RandomWalk.walk1D(10)
    expect(RandomWalk.finalPosition1D(walk)).toBe(walk[walk.length - 1])
  })

  it('maxDistance1D matches walk1D positions', () => {
    const walk = RandomWalk.walk1D(50)
    const max = RandomWalk.maxDistance1D(walk)
    for (const p of walk) {
      expect(Math.abs(p)).toBeLessThanOrEqual(max)
    }
  })

  it('returnsToOrigin1D with long walk likely returns', () => {
    let returned = false
    for (let i = 0; i < 10; i++) {
      const walk = RandomWalk.walk1D(100)
      if (RandomWalk.returnsToOrigin1D(walk)) returned = true
    }
    expect(returned).toBe(true)
  })

  it('walk1D parity matches step count', () => {
    const alwaysUp = () => 0.9
    const walk = RandomWalk.walk1D(10, { seed: alwaysUp })
    expect(walk[10]).toBe(10)
  })

  it('walk2D with seed=always-3 moves down', () => {
    const alwaysDown = () => 0.99
    const walk = RandomWalk.walk2D(3, { seed: alwaysDown })
    for (const p of walk.slice(1)) {
      expect(p.y).toBeLessThan(p.x === 0 ? 0 : p.y)
    }
  })

  it('uniquePositions2D with large positions', () => {
    const positions = [{ x: 1000000, y: -1000000 }, { x: 0, y: 0 }]
    expect(RandomWalk.uniquePositions2D(positions)).toBe(2)
  })

  it('simulateMultiple1D avgFinalPos is non-negative', () => {
    const result = RandomWalk.simulateMultiple1D(30, 20)
    expect(result.avgFinalPos).toBeGreaterThanOrEqual(0)
  })
})
