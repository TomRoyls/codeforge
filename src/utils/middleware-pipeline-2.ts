export type Middleware<T = unknown> = (ctx: T, next: () => Promise<void>) => Promise<void>

export class MiddlewarePipeline2<T = unknown> {
  private middlewares: Middleware<T>[] = []
  private errorHandlers: ((err: unknown, ctx: T) => void)[] = []

  use(middleware: Middleware<T>): this {
    this.middlewares.push(middleware)
    return this
  }

  useBefore(middleware: Middleware<T>, before?: Middleware<T>): this {
    if (before) {
      const idx = this.middlewares.indexOf(before)
      if (idx !== -1) {
        this.middlewares.splice(idx, 0, middleware)
        return this
      }
    }
    this.middlewares.unshift(middleware)
    return this
  }

  remove(middleware: Middleware<T>): boolean {
    const idx = this.middlewares.indexOf(middleware)
    if (idx !== -1) {
      this.middlewares.splice(idx, 1)
      return true
    }
    return false
  }

  catchError(handler: (err: unknown, ctx: T) => void): this {
    this.errorHandlers.push(handler)
    return this
  }

  async execute(ctx: T): Promise<T> {
    let index = -1
    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) throw new Error('next() called multiple times')
      index = i
      if (i >= this.middlewares.length) return
      try {
        await this.middlewares[i](ctx, () => dispatch(i + 1))
      } catch (err) {
        if (this.errorHandlers.length > 0) {
          this.errorHandlers.forEach(h => h(err, ctx))
        } else {
          throw err
        }
      }
    }
    await dispatch(0)
    return ctx
  }

  count(): number {
    return this.middlewares.length
  }

  clear(): void {
    this.middlewares = []
    this.errorHandlers = []
  }

  compose(): Middleware<T> {
    return async (ctx: T, next: () => Promise<void>) => {
      await this.execute(ctx)
      await next()
    }
  }

  toArray(): Middleware<T>[] { return [...this.middlewares] }
  toString(): string { return JSON.stringify({ count: this.middlewares.length }) }
  toJSON(): Record<string, number> { return { count: this.middlewares.length, errorHandlers: this.errorHandlers.length } }
  clone(): MiddlewarePipeline2<T> {
    const p = new MiddlewarePipeline2<T>()
    p.middlewares = [...this.middlewares]
    p.errorHandlers = [...this.errorHandlers]
    return p
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MiddlewarePipeline2)) return false
    return this.count() === other.count()
  }
}
