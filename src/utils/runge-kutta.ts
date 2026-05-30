export class RungeKutta {
  static solve(
    f: (t: number, y: number) => number,
    t0: number,
    y0: number,
    tEnd: number,
    stepSize: number
  ): { t: number; y: number }[] {
    const result: { t: number; y: number }[] = [{ t: t0, y: y0 }]
    let t = t0
    let y = y0
    while (t < tEnd - stepSize / 2) {
      const h = Math.min(stepSize, tEnd - t)
      const k1 = f(t, y)
      const k2 = f(t + h / 2, y + h * k1 / 2)
      const k3 = f(t + h / 2, y + h * k2 / 2)
      const k4 = f(t + h, y + h * k3)
      y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4)
      t += h
      result.push({ t, y })
    }
    return result
  }

  static solveSystem(
    f: (t: number, y: number[]) => number[],
    t0: number,
    y0: number[],
    tEnd: number,
    stepSize: number
  ): { t: number; y: number[] }[] {
    const n = y0.length
    const result: { t: number; y: number[] }[] = [{ t: t0, y: [...y0] }]
    let t = t0
    const y = [...y0]
    while (t < tEnd - stepSize / 2) {
      const h = Math.min(stepSize, tEnd - t)
      const k1 = f(t, y)
      const k2 = f(t + h / 2, y.map((yi, i) => yi + h * k1[i]! / 2))
      const k3 = f(t + h / 2, y.map((yi, i) => yi + h * k2[i]! / 2))
      const k4 = f(t + h, y.map((yi, i) => yi + h * k3[i]!))
      for (let i = 0; i < n; i++) {
        y[i] = y[i]! + (h / 6) * (k1[i]! + 2 * k2[i]! + 2 * k3[i]! + k4[i]!)
      }
      t += h
      result.push({ t, y: [...y] })
    }
    return result
  }

  static step(
    f: (t: number, y: number) => number,
    t: number,
    y: number,
    h: number
  ): number {
    const k1 = f(t, y)
    const k2 = f(t + h / 2, y + h * k1 / 2)
    const k3 = f(t + h / 2, y + h * k2 / 2)
    const k4 = f(t + h, y + h * k3)
    return y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4)
  }
}
