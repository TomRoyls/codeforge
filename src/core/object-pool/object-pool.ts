import type { ObjectPoolOptions, ObjectPoolStats } from './types.js'

export class ObjectPool<T> {
  private pool: T[] = []
  private _allocated: number = 0
  private _inUse: number = 0
  private factory: () => T
  private resetFn: ((obj: T) => void) | undefined
  private maxCapacity: number | undefined

  constructor(
    factory: () => T,
    reset?: (obj: T) => void,
    initialSize?: number,
  ) {
    this.factory = factory
    this.resetFn = reset
    this.maxCapacity = undefined
    if (initialSize !== undefined && initialSize > 0) {
      this.preallocate(initialSize)
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!
      this._inUse++
      return obj
    }
    this._allocated++
    this._inUse++
    return this.factory()
  }

  release(obj: T): void {
    if (this.maxCapacity !== undefined && this.pool.length >= this.maxCapacity) {
      this._inUse--
      this._allocated--
      return
    }
    if (this.resetFn) {
      this.resetFn(obj)
    }
    this.pool.push(obj)
    this._inUse--
  }

  get size(): number {
    return this.pool.length
  }

  get allocated(): number {
    return this._allocated
  }

  get inUse(): number {
    return this._inUse
  }

  isEmpty(): boolean {
    return this.pool.length === 0
  }

  isFull(): boolean {
    if (this.maxCapacity === undefined) {
      return false
    }
    return this.pool.length >= this.maxCapacity
  }

  clear(): void {
    this.pool.length = 0
  }

  preallocate(count: number): void {
    if (count <= 0) return
    const toCreate = this.maxCapacity !== undefined
      ? Math.min(count, this.maxCapacity - this.pool.length)
      : count
    for (let i = 0; i < toCreate; i++) {
      this.pool.push(this.factory())
      this._allocated++
    }
  }

  trim(count: number): void {
    if (count <= 0) return
    const toRemove = Math.min(count, this.pool.length)
    for (let i = 0; i < toRemove; i++) {
      this.pool.pop()!
      this._allocated--
    }
  }

  forEach(callback: (obj: T) => void): void {
    for (const obj of this.pool) {
      callback(obj)
    }
  }

  clone(): ObjectPool<T> {
    const cloned = new ObjectPool<T>(this.factory, this.resetFn)
    cloned.maxCapacity = this.maxCapacity
    for (const obj of this.pool) {
      cloned.pool.push(obj)
    }
    cloned._allocated = this._allocated
    cloned._inUse = this._inUse
    return cloned
  }

  getStats(): ObjectPoolStats {
    return {
      size: this.pool.length,
      allocated: this._allocated,
      inUse: this._inUse,
      isEmpty: this.pool.length === 0,
      isFull: this.maxCapacity !== undefined && this.pool.length >= this.maxCapacity,
      maxCapacity: this.maxCapacity,
    }
  }

  static create<T>(factory: () => T, options?: ObjectPoolOptions<T>): ObjectPool<T> {
    const pool = new ObjectPool<T>(factory, options?.reset)
    if (options?.maxCapacity !== undefined) {
      pool.maxCapacity = options.maxCapacity
    }
    if (options?.initialSize !== undefined && options.initialSize > 0) {
      pool.preallocate(options.initialSize)
    }
    return pool
  }
}

export type { ObjectPoolOptions, ObjectPoolStats } from './types.js'
