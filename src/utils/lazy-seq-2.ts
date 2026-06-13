export class LazySeq2<T> {
  private generator: () => Generator<T>

  constructor(generator: () => Generator<T>) {
    this.generator = generator
  }

  static fromArray<T>(arr: T[]): LazySeq2<T> {
    return new LazySeq2(function* () { yield* arr })
  }

  static range(start: number, end: number, step = 1): LazySeq2<number> {
    return new LazySeq2(function* () {
      for (let i = start; i < end; i += step) yield i
    })
  }

  map<R>(fn: (v: T) => R): LazySeq2<R> {
    const gen = this.generator
    return new LazySeq2(function* () {
      for (const v of gen()) yield fn(v)
    })
  }

  filter(pred: (v: T) => boolean): LazySeq2<T> {
    const gen = this.generator
    return new LazySeq2(function* () {
      for (const v of gen()) if (pred(v)) yield v
    })
  }

  take(n: number): LazySeq2<T> {
    const gen = this.generator
    return new LazySeq2(function* () {
      let count = 0
      for (const v of gen()) {
        if (count >= n) break
        yield v
        count++
      }
    })
  }

  skip(n: number): LazySeq2<T> {
    const gen = this.generator
    return new LazySeq2(function* () {
      let count = 0
      for (const v of gen()) {
        if (count >= n) yield v
        count++
      }
    })
  }

  reduce<R>(fn: (acc: R, v: T) => R, initial: R): R {
    let acc = initial
    for (const v of this.generator()) acc = fn(acc, v)
    return acc
  }

  forEach(fn: (v: T) => void): void {
    for (const v of this.generator()) fn(v)
  }

  toArray(): T[] {
    return [...this.generator()]
  }

  get length(): number {
    let count = 0
    for (const _ of this.generator()) count++
    return count
  }

  toString(): string { return JSON.stringify({ lazy: true }) }
  toJSON(): Record<string, unknown> { return { lazy: true } }
  clone(): LazySeq2<T> { return new LazySeq2(this.generator) }
  equals(other: unknown): boolean { return other instanceof LazySeq2 }
}
