export class CatMap2<T> {
  private map: Map<T, T>
  private inverse: Map<T, T>
  private readonly domain: Set<T>

  constructor(pairs: [T, T][]) {
    this.map = new Map()
    this.inverse = new Map()
    this.domain = new Set()

    for (const [a, b] of pairs) {
      this.map.set(a, b)
      this.inverse.set(b, a)
      this.domain.add(a)
      this.domain.add(b)
    }
  }

  apply(value: T): T | undefined {
    return this.map.get(value)
  }

  invert(value: T): T | undefined {
    return this.inverse.get(value)
  }

  has(value: T): boolean {
    return this.domain.has(value)
  }

  getDomain(): T[] {
    return Array.from(this.domain)
  }

  size(): number {
    return this.map.size
  }

  isEmpty(): boolean {
    return this.map.size === 0
  }

  clear(): void {
    this.map.clear()
    this.inverse.clear()
  }

  compose(other: CatMap2<T>): CatMap2<T> {
    const pairs: [T, T][] = []
    for (const [a, b] of this.map) {
      const c = other.apply(b)
      if (c !== undefined) {
        pairs.push([a, c])
      }
    }
    return new CatMap2(pairs)
  }

  isPermutation(): boolean {
    const values = new Set(this.map.values())
    return values.size === this.map.size && this.map.size > 0
  }

  isIdentity(): boolean {
    for (const [a, b] of this.map) {
      if (a !== b) return false
    }
    return this.map.size > 0
  }

  getPairs(): [T, T][] {
    return Array.from(this.map.entries())
  }

  power(n: number): CatMap2<T> {
    if (n <= 0) return new CatMap2<T>([])
    if (n === 1) return new CatMap2<T>(this.getPairs())

    let result = new CatMap2<T>(this.getPairs())
    for (let i = 1; i < n; i++) {
      result = result.compose(this)
    }
    return result
  }
  *[Symbol.iterator]() {
    yield* this.getPairs()
  }

  toArray() {
    return this.getPairs()
  }

  toString(): string {
    return `${CatMap2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: [T, T], index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }
}
