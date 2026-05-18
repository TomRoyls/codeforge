export interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason: unknown) => void
}

export function createDeferred<T>(): Deferred<T> {
  let resolveFn!: (value: T) => void
  let rejectFn!: (reason: unknown) => void

  const promise = new Promise<T>((resolve, reject) => {
    resolveFn = resolve
    rejectFn = reject
  })

  return {
    promise,
    resolve: resolveFn,
    reject: rejectFn,
  }
}

export class DeferredBarrier {
  private readonly pending = new Map<string, Deferred<unknown>>()

  public create<T>(key: string): Deferred<T> {
    if (this.pending.has(key)) {
      throw new Error(`Deferred already exists for key: ${key}`)
    }
    const d = createDeferred<T>()
    this.pending.set(key, d as Deferred<unknown>)
    d.promise.catch(() => {}).finally(() => { this.pending.delete(key) })
    return d
  }

  public get<T>(key: string): Deferred<T> | undefined {
    return this.pending.get(key) as Deferred<T> | undefined
  }

  public resolve<T>(key: string, value: T): boolean {
    const d = this.pending.get(key)
    if (d) {
      d.resolve(value)
      return true
    }
    return false
  }

  public reject(key: string, reason: unknown): boolean {
    const d = this.pending.get(key)
    if (d) {
      d.reject(reason)
      return true
    }
    return false
  }

  public get size(): number {
    return this.pending.size
  }
}
