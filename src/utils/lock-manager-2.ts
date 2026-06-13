export class LockManager2 {
  private locks: Map<string, { count: number; queue: (() => void)[] }> = new Map()

  async acquire(key: string): Promise<() => void> {
    if (!this.locks.has(key)) {
      this.locks.set(key, { count: 0, queue: [] })
    }

    const lock = this.locks.get(key)!
    if (lock.count > 0) {
      await new Promise<void>(resolve => lock.queue.push(resolve))
    }

    lock.count++
    let released = false

    return () => {
      if (released) return
      released = true
      lock.count--
      if (lock.queue.length > 0) {
        const next = lock.queue.shift()!
        next()
      } else if (lock.count === 0) {
        this.locks.delete(key)
      }
    }
  }

  async withLock<R>(key: string, fn: () => Promise<R>): Promise<R> {
    const release = await this.acquire(key)
    try {
      return await fn()
    } finally {
      release()
    }
  }

  isLocked(key: string): boolean {
    return (this.locks.get(key)?.count ?? 0) > 0
  }

  getLockedKeys(): string[] {
    return Array.from(this.locks.keys()).filter(k => this.isLocked(k))
  }

  count(): number { return this.locks.size }

  toArray(): string[] { return this.getLockedKeys() }
  toString(): string { return JSON.stringify({ locks: this.count() }) }
  toJSON(): Record<string, unknown> { return { locks: this.getLockedKeys() } }
  clone(): LockManager2 { return new LockManager2() }
  equals(other: unknown): boolean {
    if (!(other instanceof LockManager2)) return false
    return this.count() === other.count()
  }
  clear(): void { this.locks.clear() }
}
