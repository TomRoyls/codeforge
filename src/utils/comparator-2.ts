export type CompareFn<T> = (a: T, b: T) => number

export class Comparator2 {
  static default<T>(): CompareFn<T> {
    return (a, b) => a < b ? -1 : a > b ? 1 : 0
  }

  static reverse<T>(cmp: CompareFn<T>): CompareFn<T> {
    return (a, b) => -cmp(a, b)
  }

  static byKey<T, K>(fn: (t: T) => K, keyCmp: CompareFn<K> = Comparator2.default<K>()): CompareFn<T> {
    return (a, b) => keyCmp(fn(a), fn(b))
  }

  static chain<T>(...cmps: CompareFn<T>[]): CompareFn<T> {
    return (a, b) => {
      for (const cmp of cmps) {
        const result = cmp(a, b)
        if (result !== 0) return result
      }
      return 0
    }
  }

  static numeric(): CompareFn<number> {
    return (a, b) => a - b
  }

  static lexicographic(): CompareFn<string> {
    return (a, b) => a.localeCompare(b)
  }

  static natural(): CompareFn<string> {
    const extractNums = (s: string): (string | number)[] => {
      const parts: (string | number)[] = []
      const regex = /(\d+)|(\D+)/g
      let m: RegExpExecArray | null
      while ((m = regex.exec(s)) !== null) {
        if (m[1] !== undefined) parts.push(parseInt(m[1], 10))
        else parts.push(m[2])
      }
      return parts
    }
    return (a, b) => {
      const pa = extractNums(a)
      const pb = extractNums(b)
      const len = Math.min(pa.length, pb.length)
      for (let i = 0; i < len; i++) {
        const x = pa[i], y = pb[i]
        if (typeof x === 'number' && typeof y === 'number') {
          if (x !== y) return x - y
        } else {
          const cmp = String(x).localeCompare(String(y))
          if (cmp !== 0) return cmp
        }
      }
      return pa.length - pb.length
    }
  }

  static byLength(): CompareFn<string> {
    return (a, b) => a.length - b.length
  }

  static less<T>(cmp: CompareFn<T>, a: T, b: T): boolean { return cmp(a, b) < 0 }
  static greater<T>(cmp: CompareFn<T>, a: T, b: T): boolean { return cmp(a, b) > 0 }
  static equal<T>(cmp: CompareFn<T>, a: T, b: T): boolean { return cmp(a, b) === 0 }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): Comparator2 { return new Comparator2() }
  equals(other: unknown): boolean { return other instanceof Comparator2 }
}
