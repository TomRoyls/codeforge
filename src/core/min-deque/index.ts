import type { MinDequeOptions } from './types.js'

type MinMaxNode<T> = {
  value: T
  count: number
}

export class MinDeque<T = unknown> {
  private elements: T[]
  private minDeque: MinMaxNode<T>[]
  private maxDeque: MinMaxNode<T>[]
  private minDequeHead: number
  private maxDequeHead: number
  private head: number
  private tail: number
  private _size: number
  private _capacity: number
  private comparator: (a: T, b: T) => number

  constructor(options?: MinDequeOptions & { comparator?: (a: T, b: T) => number }) {
    this._capacity = Math.max(1, options?.capacity ?? 16)
    this.elements = new Array<T>(this._capacity)
    this.minDeque = []
    this.maxDeque = []
    this.minDequeHead = 0
    this.maxDequeHead = 0
    this.head = 0
    this.tail = 0
    this._size = 0
    this.comparator = options?.comparator ?? ((a, b) => (a as unknown as number) - (b as unknown as number) as unknown as number)
  }

  private grow(): void {
    const newCapacity = this._capacity * 2
    const newElements = new Array<T>(newCapacity)
    for (let i = 0; i < this._size; i++) {
      newElements[i] = this.elements[(this.head + i) % this._capacity]!
    }
    this.elements = newElements
    this.head = 0
    this.tail = this._size
    this._capacity = newCapacity
  }

  private compare(a: T, b: T): number {
    return this.comparator(a, b)
  }

  pushBack(value: T): void {
    if (this._size === this._capacity) this.grow()
    this.elements[this.tail] = value
    this.tail = (this.tail + 1) % this._capacity
    this._size++

    let insertedToMin = false
    for (let i = this.minDeque.length - 1; i >= this.minDequeHead; i--) {
      if (this.compare(this.minDeque[i]!.value, value) > 0) {
        this.minDeque.splice(i, 1)
      } else if (this.compare(this.minDeque[i]!.value, value) === 0) {
        this.minDeque[i]!.count++
        insertedToMin = true
        break
      } else {
        break
      }
    }
    if (!insertedToMin) {
      this.minDeque.push({ value, count: 1 })
    }

    let insertedToMax = false
    for (let i = this.maxDeque.length - 1; i >= this.maxDequeHead; i--) {
      if (this.compare(this.maxDeque[i]!.value, value) < 0) {
        this.maxDeque.splice(i, 1)
      } else if (this.compare(this.maxDeque[i]!.value, value) === 0) {
        this.maxDeque[i]!.count++
        insertedToMax = true
        break
      } else {
        break
      }
    }
    if (!insertedToMax) {
      this.maxDeque.push({ value, count: 1 })
    }
  }

  pushFront(value: T): void {
    if (this._size === this._capacity) this.grow()
    this.head = (this.head - 1 + this._capacity) % this._capacity
    this.elements[this.head] = value
    this._size++

    while (this.minDeque.length > 0 && this.compare(this.minDeque[this.minDeque.length - 1]!.value, value) > 0) {
      this.minDeque.pop()
    }
    if (this.minDeque.length > 0 && this.compare(this.minDeque[this.minDeque.length - 1]!.value, value) === 0) {
      this.minDeque[this.minDeque.length - 1]!.count++
    } else {
      this.minDeque.push({ value, count: 1 })
    }

    while (this.maxDeque.length > 0 && this.compare(this.maxDeque[this.maxDeque.length - 1]!.value, value) < 0) {
      this.maxDeque.pop()
    }
    if (this.maxDeque.length > 0 && this.compare(this.maxDeque[this.maxDeque.length - 1]!.value, value) === 0) {
      this.maxDeque[this.maxDeque.length - 1]!.count++
    } else {
      this.maxDeque.push({ value, count: 1 })
    }
  }

  popBack(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1 + this._capacity) % this._capacity
    const value = this.elements[this.tail]!
    this.elements[this.tail] = undefined as unknown as T
    this._size--

    if (this.minDeque.length > this.minDequeHead && this.minDeque[this.minDequeHead]!.value === value) {
      this.minDeque[this.minDequeHead]!.count--
      if (this.minDeque[this.minDequeHead]!.count === 0) {
        this.minDequeHead++
      }
    } else if (this.minDeque.length > this.minDequeHead && this.minDeque[this.minDeque.length - 1]!.value === value) {
      this.minDeque[this.minDeque.length - 1]!.count--
      if (this.minDeque[this.minDeque.length - 1]!.count === 0) {
        this.minDeque.pop()
      }
    }

    if (this.maxDeque.length > this.maxDequeHead && this.maxDeque[this.maxDequeHead]!.value === value) {
      this.maxDeque[this.maxDequeHead]!.count--
      if (this.maxDeque[this.maxDequeHead]!.count === 0) {
        this.maxDequeHead++
      }
    } else if (this.maxDeque.length > this.maxDequeHead && this.maxDeque[this.maxDeque.length - 1]!.value === value) {
      this.maxDeque[this.maxDeque.length - 1]!.count--
      if (this.maxDeque[this.maxDeque.length - 1]!.count === 0) {
        this.maxDeque.pop()
      }
    }

    return value
  }

  popFront(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.elements[this.head]!
    this.elements[this.head] = undefined as unknown as T
    this.head = (this.head + 1) % this._capacity
    this._size--

    const minFront = this.minDeque.length > this.minDequeHead ? this.minDeque[this.minDequeHead] : undefined
    if (minFront && minFront.value === value) {
      minFront.count--
      if (minFront.count === 0) {
        this.minDequeHead++
      }
    }

    const maxFront = this.maxDeque.length > this.maxDequeHead ? this.maxDeque[this.maxDequeHead] : undefined
    if (maxFront && maxFront.value === value) {
      maxFront.count--
      if (maxFront.count === 0) {
        this.maxDequeHead++
      }
    }

    return value
  }

  min(): T | undefined {
    if (this._size === 0 || this.minDeque.length === this.minDequeHead) return undefined
    return this.minDeque[this.minDequeHead]!.value
  }

  max(): T | undefined {
    if (this._size === 0 || this.maxDeque.length === this.maxDequeHead) return undefined
    return this.maxDeque[this.maxDequeHead]!.value
  }

  front(): T | undefined {
    if (this._size === 0) return undefined
    return this.elements[this.head]
  }

  back(): T | undefined {
    if (this._size === 0) return undefined
    return this.elements[(this.tail - 1 + this._capacity) % this._capacity]
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.elements = new Array<T>(this._capacity)
    this.minDeque = []
    this.maxDeque = []
    this.minDequeHead = 0
    this.maxDequeHead = 0
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = new Array(this._size)
    for (let i = 0; i < this._size; i++) {
      result[i] = this.elements[(this.head + i) % this._capacity]!
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.elements[(this.head + i) % this._capacity]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.elements[(this.head + i) % this._capacity]!
    }
  }

  static slidingWindowMin<U>(arr: U[], windowSize: number): U[] {
    if (windowSize <= 0 || windowSize > arr.length) return []
    const result: U[] = []
    const dq = new MinDeque<U>({ capacity: windowSize })
    
    for (let i = 0; i < arr.length; i++) {
      dq.pushBack(arr[i]!)
      if (i >= windowSize - 1) {
        result.push(dq.min()!)
        dq.popFront()
      }
    }
    
    return result
  }

  static slidingWindowMax<U>(arr: U[], windowSize: number): U[] {
    if (windowSize <= 0 || windowSize > arr.length) return []
    const result: U[] = []
    const dq = new MinDeque<U>({ capacity: windowSize })
    
    for (let i = 0; i < arr.length; i++) {
      dq.pushBack(arr[i]!)
      if (i >= windowSize - 1) {
        result.push(dq.max()!)
        dq.popFront()
      }
    }
    
    return result
  }

  toString(): string {
    return `MinDeque({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'MinDeque', size: this.size, items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }
}

export type { MinDequeOptions } from './types.js'
