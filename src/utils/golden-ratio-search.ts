export class GoldenRatioSearch {
  static minimize(f: (x: number) => number, a: number, b: number, tol: number = 1e-8): number {
    const gr = (Math.sqrt(5) - 1) / 2
    let x1 = b - gr * (b - a)
    let x2 = a + gr * (b - a)
    let f1 = f(x1)
    let f2 = f(x2)
    while (Math.abs(b - a) > tol) {
      if (f1 < f2) {
        b = x2
        x2 = x1
        f2 = f1
        x1 = b - gr * (b - a)
        f1 = f(x1)
      } else {
        a = x1
        x1 = x2
        f1 = f2
        x2 = a + gr * (b - a)
        f2 = f(x2)
      }
    }
    return (a + b) / 2
  }

  static maximize(f: (x: number) => number, a: number, b: number, tol: number = 1e-8): number {
    return GoldenRatioSearch.minimize((x) => -f(x), a, b, tol)
  }
}
