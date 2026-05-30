export class RandomWalk {
  static walk1D(steps: number, options?: { seed?: () => number }): number[] {
    const rng = options?.seed ?? Math.random
    const positions = [0]
    let pos = 0
    for (let i = 0; i < steps; i++) {
      pos += rng() < 0.5 ? -1 : 1
      positions.push(pos)
    }
    return positions
  }

  static walk2D(steps: number, options?: { seed?: () => number }): { x: number; y: number }[] {
    const rng = options?.seed ?? Math.random
    const positions = [{ x: 0, y: 0 }]
    let x = 0
    let y = 0
    for (let i = 0; i < steps; i++) {
      const dir = Math.floor(rng() * 4)
      if (dir === 0) x++
      else if (dir === 1) x--
      else if (dir === 2) y++
      else y--
      positions.push({ x, y })
    }
    return positions
  }

  static maxDistance1D(positions: number[]): number {
    let max = 0
    for (const p of positions) {
      if (Math.abs(p) > max) max = Math.abs(p)
    }
    return max
  }

  static finalPosition1D(positions: number[]): number {
    return positions[positions.length - 1]!
  }

  static returnsToOrigin1D(positions: number[]): boolean {
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] === 0) return true
    }
    return false
  }

  static uniquePositions2D(positions: { x: number; y: number }[]): number {
    const set = new Set<string>()
    for (const p of positions) {
      set.add(`${p.x},${p.y}`)
    }
    return set.size
  }

  static simulateMultiple1D(
    count: number,
    steps: number,
    options?: { seed?: () => number }
  ): { avgFinalPos: number; avgMaxDist: number; returnRate: number } {
    let totalFinal = 0
    let totalMax = 0
    let returns = 0
    for (let i = 0; i < count; i++) {
      const walk = RandomWalk.walk1D(steps, options)
      totalFinal += Math.abs(RandomWalk.finalPosition1D(walk))
      totalMax += RandomWalk.maxDistance1D(walk)
      if (RandomWalk.returnsToOrigin1D(walk)) returns++
    }
    return {
      avgFinalPos: totalFinal / count,
      avgMaxDist: totalMax / count,
      returnRate: returns / count,
    }
  }
}
