import {
  type PhantomReferenceOptions,
  type PhantomReferenceStatistics,
  type PhantomRef,
  DEFAULT_PHANTOM_REFERENCE_OPTIONS,
} from './types.js'

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
  private _options: Required<PhantomReferenceOptions>
  private stats: PhantomReferenceStatistics = {
    registered: 0,
    enqueued: 0,
    cleared: 0,
    checks: 0,
  }

  constructor(options?: PhantomReferenceOptions) {
    this._options = {
      ...DEFAULT_PHANTOM_REFERENCE_OPTIONS,
      ...options,
    }
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
    const id = this.queue.shift()
    if (id === undefined) {
      return null
    }
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
    for (const ref of this.refs.values()) {
      if (!ref.cleared) {
        ref.cleared = true
        ref.value = null
        count++
      }
    }
    this.queue.length = 0
    this.stats.cleared += count
    return count
  }

  processQueue(): number {
    let processed = 0
    while (this.queue.length > 0) {
      const queuedId = this.queue[0]
      if (queuedId === undefined) break
      const ref = this.refs.get(queuedId)
      if (ref === undefined) {
        this.queue.shift()
        continue
      }
      if (ref.cleared) {
        this.queue.shift()
        continue
      }
      ref.cleared = true
      ref.value = null
      this.queue.shift()
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
    return processed
  }

  get size(): number {
    let count = 0
    for (const ref of this.refs.values()) {
      if (!ref.cleared) {
        count++
      }
    }
    return count
  }

  get queueSize(): number {
    return this.queue.length
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  getAll(): PhantomRef<T>[] {
    const result: PhantomRef<T>[] = []
    for (const ref of this.refs.values()) {
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
