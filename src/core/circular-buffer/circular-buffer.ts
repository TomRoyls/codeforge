import type { CircularBufferOptions } from './types.js'
import { DEFAULT_CIRCULAR_BUFFER_OPTIONS } from './types.js'

export class CircularBuffer<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0
  private options: CircularBufferOptions

  constructor(options?: Partial<CircularBufferOptions>) {
    this.options = { ...DEFAULT_CIRCULAR_BUFFER_OPTIONS, ...options }
    this.buffer = new Array<T | undefined>(this.options.capacity)
  }

  write(item: T): boolean {
    if (this._size === this.options.capacity) {
      if (!this.options.overwrite) {
        return false
      }
      this.head = (this.head + 1) % this.options.capacity
      this._size--
    }
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this.options.capacity
    this._size++
    return true
  }

  read(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const item = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this.options.capacity
    this._size--
    return item
  }

  peek(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.buffer[this.head]
  }

  peekAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    return this.buffer[(this.head + index) % this.options.capacity]
  }

  isFull(): boolean {
    return this._size === this.options.capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  size(): number {
    return this._size
  }

  capacity(): number {
    return this.options.capacity
  }

  available(): number {
    return this.options.capacity - this._size
  }

  clear(): void {
    this.buffer = new Array<T | undefined>(this.options.capacity)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this.head + i) % this.options.capacity]
      if (item !== undefined) {
        result.push(item)
      }
    }
    return result
  }

  fromArray(items: T[]): void {
    this.clear()
    for (const item of items) {
      this.write(item)
    }
  }

  contains(item: T): boolean {
    for (let i = 0; i < this._size; i++) {
      const element = this.buffer[(this.head + i) % this.options.capacity]
      if (element === item) {
        return true
      }
    }
    return false
  }

  indexOf(item: T): number {
    for (let i = 0; i < this._size; i++) {
      const element = this.buffer[(this.head + i) % this.options.capacity]
      if (element === item) {
        return i
      }
    }
    return -1
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const item = this.buffer[(this.head + i) % this.options.capacity]
      if (item !== undefined) {
        callback(item, i)
      }
    }
  }

  rotateLeft(n: number): void {
    if (this._size === 0) return
    const rotations = ((n % this._size) + this._size) % this._size
    if (rotations === 0) return
    const items = this.toArray()
    const rotated = [...items.slice(rotations), ...items.slice(0, rotations)]
    this.clear()
    for (const item of rotated) {
      this.write(item)
    }
  }

  rotateRight(n: number): void {
    if (this._size === 0) return
    const rotations = ((n % this._size) + this._size) % this._size
    if (rotations === 0) return
    const items = this.toArray()
    const split = items.length - rotations
    const rotated = [...items.slice(split), ...items.slice(0, split)]
    this.clear()
    for (const item of rotated) {
      this.write(item)
    }
  }
}

export { DEFAULT_CIRCULAR_BUFFER_OPTIONS } from './types.js'
export type { CircularBufferOptions } from './types.js'
