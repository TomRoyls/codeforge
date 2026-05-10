import type { RunLengthPair, RunLengthQueueOptions, RunLengthQueueStats } from './types.js'
import { DEFAULT_RUN_LENGTH_QUEUE_OPTIONS } from './types.js'

export class RunLengthQueue<T = unknown> {
  private runs: RunLengthPair<T>[] = []
  private _size: number = 0
  private equals: (a: T, b: T) => boolean

  constructor(options?: RunLengthQueueOptions<T>) {
    const resolved = { ...DEFAULT_RUN_LENGTH_QUEUE_OPTIONS, ...options }
    this.equals = resolved.equals ?? Object.is
  }

  enqueue(value: T): void {
    if (this.runs.length > 0) {
      const last = this.runs[this.runs.length - 1]!
      if (this.equals(last.value, value)) {
        last.count++
        this._size++
        return
      }
    }
    this.runs.push({ value, count: 1 })
    this._size++
  }

  dequeue(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const first = this.runs[0]!
    const value = first.value
    first.count--
    this._size--
    if (first.count === 0) {
      this.runs.shift()
    }
    return value
  }

  peek(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.runs[0]!.value
  }

  peekBack(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.runs[this.runs.length - 1]!.value
  }

  size(): number {
    return this._size
  }

  runCount(): number {
    return this.runs.length
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.runs = []
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.runs.length; i++) {
      const run = this.runs[i]!
      for (let j = 0; j < run.count; j++) {
        result.push(run.value)
      }
    }
    return result
  }

  compress(value: T, count: number): void {
    if (count <= 0) {
      return
    }
    if (this.runs.length > 0) {
      const last = this.runs[this.runs.length - 1]!
      if (this.equals(last.value, value)) {
        last.count += count
        this._size += count
        return
      }
    }
    this.runs.push({ value, count })
    this._size += count
  }

  static fromArray<U>(items: U[], options?: RunLengthQueueOptions<U>): RunLengthQueue<U> {
    const queue = new RunLengthQueue<U>(options)
    for (const item of items) {
      queue.enqueue(item)
    }
    return queue
  }

  splitAt(position: number): [RunLengthQueue<T>, RunLengthQueue<T>] {
    if (position < 0) {
      position = 0
    }
    if (position > this._size) {
      position = this._size
    }

    const left = new RunLengthQueue<T>({ equals: this.equals })
    const right = new RunLengthQueue<T>({ equals: this.equals })

    let remaining = position

    for (let i = 0; i < this.runs.length; i++) {
      const run = this.runs[i]!
      if (remaining <= 0) {
        right.compress(run.value, run.count)
        continue
      }
      if (remaining >= run.count) {
        left.compress(run.value, run.count)
        remaining -= run.count
      } else {
        left.compress(run.value, remaining)
        right.compress(run.value, run.count - remaining)
        remaining = 0
      }
    }

    return [left, right]
  }

  clone(): RunLengthQueue<T> {
    const copy = new RunLengthQueue<T>({ equals: this.equals })
    for (const run of this.runs) {
      copy.compress(run.value, run.count)
    }
    return copy
  }

  getRuns(): ReadonlyArray<Readonly<RunLengthPair<T>>> {
    return this.runs
  }

  contains(value: T): boolean {
    for (const run of this.runs) {
      if (this.equals(run.value, value)) {
        return true
      }
    }
    return false
  }

  stats(): RunLengthQueueStats {
    return {
      size: this._size,
      runCount: this.runs.length,
      isEmpty: this._size === 0,
      compressionRatio: this._size === 0 ? 1 : this.runs.length / this._size,
    }
  }
}

export { DEFAULT_RUN_LENGTH_QUEUE_OPTIONS } from './types.js'
export type { RunLengthPair, RunLengthQueueOptions, RunLengthQueueStats } from './types.js'
