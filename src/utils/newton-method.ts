export class NewtonMethod {
  static findRoot(
    f: (x: number) => number,
    df: (x: number) => number,
    x0: number,
    options?: { tolerance?: number; maxIterations?: number }
  ): number {
    const tol = options?.tolerance ?? 1e-10
    const maxIter = options?.maxIterations ?? 100
    let x = x0
    for (let i = 0; i < maxIter; i++) {
      const fx = f(x)
      const dfx = df(x)
      if (Math.abs(dfx) < 1e-15) break
      const dx = fx / dfx
      x -= dx
      if (Math.abs(dx) < tol) break
    }
    return x
  }

  static findRootWithHistory(
    f: (x: number) => number,
    df: (x: number) => number,
    x0: number,
    options?: { tolerance?: number; maxIterations?: number }
  ): { root: number; iterations: number; converged: boolean; history: number[] } {
    const tol = options?.tolerance ?? 1e-10
    const maxIter = options?.maxIterations ?? 100
    let x = x0
    const history = [x]
    let converged = false
    let iterations = 0
    for (let i = 0; i < maxIter; i++) {
      iterations++
      const fx = f(x)
      const dfx = df(x)
      if (Math.abs(dfx) < 1e-15) break
      const dx = fx / dfx
      x -= dx
      history.push(x)
      if (Math.abs(dx) < tol) {
        converged = true
        break
      }
    }
    return { root: x, iterations, converged, history }
  }

  static sqrt(n: number): number {
    if (n < 0) return NaN
    if (n === 0) return 0
    return NewtonMethod.findRoot(
      (x) => x * x - n,
      (x) => 2 * x,
      n / 2
    )
  }

  static nthRoot(n: number, k: number): number {
    if (n < 0 && k % 2 === 0) return NaN
    return NewtonMethod.findRoot(
      (x) => Math.pow(x, k) - n,
      (x) => k * Math.pow(x, k - 1),
      n / k
    )
  }

  static inverse(f: (x: number) => number, df: (x: number) => number, target: number, x0: number): number {
    return NewtonMethod.findRoot(
      (x) => f(x) - target,
      df,
      x0
    )
  }
}
