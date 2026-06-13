export interface Poolable2 {
  reset(): void
  isValid(): boolean
}

export class ResourcePool2<T extends Poolable2> {
  private available: T[] = []
  private inUse: Set<T> = new Set()
  private factory: () => T
  private maxSize: number
  private created = 0
  private waitQueue: ((resource: T) => void)[] = []

  constructor(factory: () => T, maxSize = 10) {
    this.factory = factory
    this.maxSize = maxSize
  }

  acquire(): Promise<T> {
    if (this.available.length > 0) {
      const resource = this.available.pop()!
      this.inUse.add(resource)
      return Promise.resolve(resource)
    }

    if (this.created < this.maxSize) {
      const resource = this.factory()
      this.created++
      this.inUse.add(resource)
      return Promise.resolve(resource)
    }

    return new Promise<T>(resolve => {
      this.waitQueue.push(resolve)
    })
  }

  release(resource: T): void {
    if (!this.inUse.has(resource)) return
    this.inUse.delete(resource)

    if (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift()!
      this.inUse.add(resource)
      waiter(resource)
      return
    }

    resource.reset()
    if (resource.isValid()) {
      this.available.push(resource)
    } else {
      this.created--
    }
  }

  async withResource<R>(fn: (resource: T) => Promise<R>): Promise<R> {
    const resource = await this.acquire()
    try {
      return await fn(resource)
    } finally {
      this.release(resource)
    }
  }

  getAvailableCount(): number { return this.available.length }
  getInUseCount(): number { return this.inUse.size }
  getTotalCount(): number { return this.created }
  getMaxSize(): number { return this.maxSize }
  getWaitQueueLength(): number { return this.waitQueue.length }

  drain(): T[] {
    const resources = [...this.available]
    this.available = []
    this.created -= resources.length
    return resources
  }

  prefill(count: number): this {
    for (let i = 0; i < count && this.created < this.maxSize; i++) {
      this.available.push(this.factory())
      this.created++
    }
    return this
  }

  setMaxSize(size: number): this {
    this.maxSize = size
    return this
  }

  count(): number { return this.created }

  toArray(): T[] { return [...this.available] }
  toString(): string { return JSON.stringify({ available: this.getAvailableCount(), inUse: this.getInUseCount(), total: this.getTotalCount() }) }
  toJSON(): Record<string, unknown> { return { available: this.getAvailableCount(), inUse: this.getInUseCount(), total: this.getTotalCount(), max: this.maxSize } }
  clone(): ResourcePool2<T> {
    const pool = new ResourcePool2(this.factory, this.maxSize)
    pool.available = [...this.available]
    pool.inUse = new Set(this.inUse)
    pool.created = this.created
    return pool
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ResourcePool2)) return false
    return this.maxSize === other.maxSize
  }
  clear(): void {
    this.available = []
    this.inUse.clear()
    this.created = 0
    this.waitQueue = []
  }
}
