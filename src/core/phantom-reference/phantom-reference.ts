import type { PhantomReferenceOptions, PhantomReferenceStatistics, PhantomRef } from './types.js'
import { DEFAULT_PHANTOM_REFERENCE_OPTIONS } from './types.js'

interface InternalRef<T> {
  id: number
  value: T | null
  enqueued: boolean
  cleared: boolean
  onFinalize?: ((ref: PhantomRef<T>) => void) | undefined
}

export class PhantomReferenceQueue<T> {
  private refs: Map<number, InternalRef<T>> = new Map()
  private queue: number[] = []
  private nextId = 1
  private _checkInterval: number
  private _head = 0
  private stats: PhantomReferenceStatistics = {
    registered: 0,
    enqueued: 0,
    cleared: 0,
    checks: 0,
  }

  constructor(options?: PhantomReferenceOptions) {
    const resolved = { ...DEFAULT_PHANTOM_REFERENCE_OPTIONS, ...options }
    this._checkInterval = resolved.checkInterval
  }

  get checkInterval(): number {
    return this._checkInterval
  }

  register(value: T, onFinalize?: (ref: PhantomRef<T>) => void): number {
    const id = this.nextId++
    this.refs.set(id, {
      id,
      value,
      enqueued: false,
      cleared: false,
      onFinalize,
    })
    this.stats.registered++
    return id
  }

  isRegistered(id: number): boolean {
    const ref = this.refs.get(id)
    return ref !== undefined && !ref.cleared
  }

  enqueue(id: number): boolean {
    const ref = this.refs.get(id)
    if (ref === undefined || ref.cleared || ref.enqueued) {
      return false
    }
    ref.enqueued = true
    ref.value = null
    this.queue.push(id)
    this.stats.enqueued++
    return true
  }

  poll(): PhantomRef<T> | null {
    if (this._head >= this.queue.length) {
      return null
    }
    const id = this.queue[this._head++]!
    const ref = this.refs.get(id)
    if (ref === undefined) {
      return null
    }
    const result: PhantomRef<T> = {
      id: ref.id,
      value: ref.value,
      enqueued: ref.enqueued,
      cleared: ref.cleared,
    }
    ref.cleared = true
    ref.value = null
    this.refs.delete(id)
    this._compact()
    return result
  }

  clear(id: number): boolean {
    const ref = this.refs.get(id)
    if (ref === undefined || ref.cleared) {
      return false
    }
    ref.cleared = true
    ref.value = null
    if (ref.enqueued) {
      const idx = this.queue.indexOf(id)
      if (idx !== -1) {
        this.queue.splice(idx, 1)
      }
    }
    this.stats.cleared++
    return true
  }

  clearAll(): number {
    let count = 0
    for (const ref of Array.from(this.refs.values())) {
      if (!ref.cleared) {
        ref.cleared = true
        ref.value = null
        count++
      }
    }
    this.queue.length = 0
    this._head = 0
    this.stats.cleared += count
    return count
  }

  private _compact(): void {
    if (this._head > this.queue.length / 2) {
      this.queue = this.queue.slice(this._head)
      this._head = 0
    }
  }

  processQueue(): number {
    let processed = 0
    while (this.queue.length - this._head > 0) {
      const queuedId = this.queue[this._head]!
      const ref = this.refs.get(queuedId)
      if (ref === undefined) {
        this._head++
        continue
      }
      if (ref.cleared) {
        this._head++
        continue
      }
      ref.cleared = true
      ref.value = null
      this._head++
      this.stats.cleared++
      if (ref.onFinalize) {
        const phantomRef: PhantomRef<T> = {
          id: ref.id,
          value: null,
          enqueued: ref.enqueued,
          cleared: ref.cleared,
        }
        ref.onFinalize(phantomRef)
      }
      processed++
    }
    this._compact()
    return processed
  }

  get size(): number {
    let count = 0
    for (const ref of Array.from(this.refs.values())) {
      if (!ref.cleared) {
        count++
      }
    }
    return count
  }

  get queueSize(): number {
    return this.queue.length - this._head
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  getAll(): PhantomRef<T>[] {
    const result: PhantomRef<T>[] = []
    for (const ref of Array.from(this.refs.values())) {
      if (!ref.cleared) {
        result.push({
          id: ref.id,
          value: ref.value,
          enqueued: ref.enqueued,
          cleared: ref.cleared,
        })
      }
    }
    return result
  }

  getStatistics(): PhantomReferenceStatistics {
    this.stats.checks++
    return {
      registered: this.stats.registered,
      enqueued: this.stats.enqueued,
      cleared: this.stats.cleared,
      checks: this.stats.checks,
    }
  }
}
