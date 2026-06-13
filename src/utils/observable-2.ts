export type Observer2<T> = (value: T) => void
export type ErrorObserver2 = (error: Error) => void
export type CompleteObserver2 = () => void
export type TeardownFn2 = () => void

export type Subscriber2<T> = {
  next: (value: T) => void
  error: (err: Error) => void
  complete: () => void
  closed: boolean
}

export type SubscribeFn2<T> = (subscriber: Subscriber2<T>) => TeardownFn2 | void

export class Observable2<T> {
  private subscribeFn: SubscribeFn2<T>

  constructor(subscribeFn: SubscribeFn2<T>) {
    this.subscribeFn = subscribeFn
  }

  subscribe(
    next?: Observer2<T>,
    error?: ErrorObserver2,
    complete?: CompleteObserver2,
  ): { unsubscribe: () => void } {
    const subscriber: Subscriber2<T> = {
      next: (v: T) => { if (!subscriber.closed && next) next(v) },
      error: (e: Error) => { if (!subscriber.closed) { error?.(e); subscriber.closed = true } },
      complete: () => { if (!subscriber.closed) { complete?.(); subscriber.closed = true } },
      closed: false,
    }

    const teardown = this.subscribeFn(subscriber)

    return {
      unsubscribe: () => {
        subscriber.closed = true
        teardown?.()
      },
    }
  }

  map<U>(project: (value: T) => U): Observable2<U> {
    return new Observable2<U>((sub) => {
      return this.subscribeFn({
        next: (v: T) => sub.next(project(v)),
        error: (e) => sub.error(e),
        complete: () => sub.complete(),
        closed: false,
      })
    })
  }

  filter(predicate: (value: T) => boolean): Observable2<T> {
    return new Observable2<T>((sub) => {
      return this.subscribeFn({
        next: (v: T) => { if (predicate(v)) sub.next(v) },
        error: (e) => sub.error(e),
        complete: () => sub.complete(),
        closed: false,
      })
    })
  }

  take(count: number): Observable2<T> {
    return new Observable2<T>((sub) => {
      let taken = 0
      return this.subscribeFn({
        next: (v: T) => {
          if (taken < count) {
            taken++
            sub.next(v)
            if (taken === count) sub.complete()
          }
        },
        error: (e) => sub.error(e),
        complete: () => sub.complete(),
        closed: false,
      })
    })
  }

  reduce<U>(accumulator: (acc: U, value: T) => U, initialValue: U): Observable2<U> {
    return new Observable2<U>((sub) => {
      let acc = initialValue
      return this.subscribeFn({
        next: (v: T) => { acc = accumulator(acc, v) },
        error: (e) => sub.error(e),
        complete: () => { sub.next(acc); sub.complete() },
        closed: false,
      })
    })
  }

  static from<T>(values: T[]): Observable2<T> {
    return new Observable2<T>((sub) => {
      for (const v of values) {
        if (sub.closed) break
        sub.next(v)
      }
      if (!sub.closed) sub.complete()
    })
  }

  static interval(ms: number, count = Infinity): Observable2<number> {
    return new Observable2<number>((sub) => {
      let i = 0
      const id = setInterval(() => {
        sub.next(i++)
        if (i >= count) {
          sub.complete()
          clearInterval(id)
        }
      }, ms)
      return () => clearInterval(id)
    })
  }

  toArray(): SubscribeFn2<T>[] { return [this.subscribeFn] }
  toString(): string { return 'Observable2' }
  toJSON(): Record<string, unknown> { return { type: 'Observable2' } }
  clone(): Observable2<T> { return new Observable2(this.subscribeFn) }
  equals(other: unknown): boolean { return other instanceof Observable2 }
  clear(): void {}
}
