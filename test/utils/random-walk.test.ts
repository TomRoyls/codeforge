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

  it('maxDistance1D returns correct max', () => {
    expect(RandomWalk.maxDistance1D([0, 1, 2, 1, 0, -1, -2])).toBe(2)
  })

  it('finalPosition1D returns last position', () => {
    expect(RandomWalk.finalPosition1D([0, 1, 2, 3])).toBe(3)
  })

  it('returnsToOrigin1D detects return', () => {
    expect(RandomWalk.returnsToOrigin1D([0, 1, 0])).toBe(true)
    expect(RandomWalk.returnsToOrigin1D([0, 1, 2])).toBe(false)
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

  it('uniquePositions2D counts correctly', () => {
    const positions = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }]
    expect(RandomWalk.uniquePositions2D(positions)).toBe(2)
  })

  it('simulateMultiple1D returns statistics', () => {
    const result = RandomWalk.simulateMultiple1D(50, 20)
    expect(result.avgFinalPos).toBeGreaterThanOrEqual(0)
    expect(result.avgMaxDist).toBeGreaterThanOrEqual(0)
    expect(result.returnRate).toBeGreaterThanOrEqual(0)
    expect(result.returnRate).toBeLessThanOrEqual(1)
  })

  it('walk2D handles 0 steps', () => {
    expect(RandomWalk.walk2D(0)).toEqual([{ x: 0, y: 0 }])
  })

  it('maxDistance1D handles single point', () => {
    expect(RandomWalk.maxDistance1D([0])).toBe(0)
  })

  it('uniquePositions2D counts single point', () => {
    expect(RandomWalk.uniquePositions2D([{ x: 0, y: 0 }])).toBe(1)
  })

  it('walk1D returns correct length', () => {
    const walk = RandomWalk.walk1D(10)
    expect(walk.length).toBe(11)
    expect(walk[0]).toBe(0)
  })

  it('walk2D returns correct length', () => {
    const walk = RandomWalk.walk2D(5)
    expect(walk.length).toBe(6)
    expect(walk[0]).toEqual({ x: 0, y: 0 })
  })
})
