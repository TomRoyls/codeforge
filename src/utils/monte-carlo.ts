export class MonteCarlo {
  static integrate(
    f: (x: number) => number,
    a: number,
    b: number,
    samples: number,
    options?: { seed?: () => number }
  ): number {
    const rng = options?.seed ?? Math.random
    let sum = 0
    for (let i = 0; i < samples; i++) {
      const x = a + rng() * (b - a)
      sum += f(x)
    }
    return (b - a) * sum / samples
  }

  static integrateWithError(
    f: (x: number) => number,
    a: number,
    b: number,
    samples: number,
    options?: { seed?: () => number }
  ): { value: number; error: number; samples: number } {
    const rng = options?.seed ?? Math.random
    let sum = 0
    let sumSq = 0
    for (let i = 0; i < samples; i++) {
      const x = a + rng() * (b - a)
      const y = f(x)
      sum += y
      sumSq += y * y
    }
    const mean = sum / samples
    const variance = (sumSq / samples - mean * mean) / samples
    const value = (b - a) * mean
    const error = (b - a) * Math.sqrt(Math.max(0, variance))
    return { value, error, samples }
  }

  static pi(samples: number, options?: { seed?: () => number }): number {
    const rng = options?.seed ?? Math.random
    let inside = 0
    for (let i = 0; i < samples; i++) {
      const x = rng() * 2 - 1
      const y = rng() * 2 - 1
      if (x * x + y * y <= 1) inside++
    }
    return 4 * inside / samples
  }

  static integrate2D(
    f: (x: number, y: number) => number,
    ax: number,
    bx: number,
    ay: number,
    by: number,
    samples: number,
    options?: { seed?: () => number }
  ): number {
    const rng = options?.seed ?? Math.random
    let sum = 0
    for (let i = 0; i < samples; i++) {
      const x = ax + rng() * (bx - ax)
      const y = ay + rng() * (by - ay)
      sum += f(x, y)
    }
    return (bx - ax) * (by - ay) * sum / samples
  }
}
