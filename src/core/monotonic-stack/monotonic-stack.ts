import type { MonotonicStackOptions, MonotonicStackStats } from './types.js'
import { defaultComparator } from './types.js'

export class MonotonicStack<T = unknown> {
  private stack: T[] = []
  private compare: (a: T, b: T) => number
  private mode: 'increasing' | 'decreasing'
  private _totalPushed: number = 0
  private _totalPopped: number = 0

  constructor(options?: MonotonicStackOptions<T>) {
    this.compare = options?.comparator ?? defaultComparator
    this.mode = options?.mode ?? 'increasing'
  }

  push(value: T): T[] {
    const popped: T[] = []
    if (this.mode === 'increasing') {
      while (
        this.stack.length > 0 &&
        this.compare(this.stack[this.stack.length - 1]!, value) > 0
      ) {
        popped.push(this.stack.pop()!)
      }
    } else {
      while (
        this.stack.length > 0 &&
        this.compare(this.stack[this.stack.length - 1]!, value) < 0
      ) {
        popped.push(this.stack.pop()!)
      }
    }
    this.stack.push(value)
    this._totalPushed++
    this._totalPopped += popped.length
    return popped
  }

  pop(): T | undefined {
    const val = this.stack.pop()
    if (val !== undefined) {
      this._totalPopped++
    }
    return val
  }

  peek(): T | undefined {
    return this.stack[this.stack.length - 1]
  }

  size(): number {
    return this.stack.length
  }

  isEmpty(): boolean {
    return this.stack.length === 0
  }

  toArray(): T[] {
    return [...this.stack]
  }

  clear(): void {
    this.stack = []
  }

  clone(): MonotonicStack<T> {
    const s = new MonotonicStack<T>({
      comparator: this.compare,
      mode: this.mode,
    })
    s.stack = [...this.stack]
    s._totalPushed = this._totalPushed
    s._totalPopped = this._totalPopped
    return s
  }

  static from<T>(items: T[], options?: MonotonicStackOptions<T>): MonotonicStack<T> {
    const s = new MonotonicStack<T>(options)
    for (const item of items) {
      s.push(item)
    }
    return s
  }

  stats(): MonotonicStackStats {
    return {
      size: this.stack.length,
      isEmpty: this.stack.length === 0,
      mode: this.mode,
      totalPushed: this._totalPushed,
      totalPopped: this._totalPopped,
    }
  }

  static nextGreater<T>(elements: T[], comparator?: (a: T, b: T) => number): (T | undefined)[] {
    const compare = comparator ?? defaultComparator
    const result: (T | undefined)[] = new Array(elements.length).fill(undefined)
    const stack: number[] = []
    for (let i = 0; i < elements.length; i++) {
      while (
        stack.length > 0 &&
        compare(elements[stack[stack.length - 1]!]!, elements[i]!) < 0
      ) {
        result[stack.pop()!] = elements[i]
      }
      stack.push(i)
    }
    return result
  }

  static nextSmaller<T>(elements: T[], comparator?: (a: T, b: T) => number): (T | undefined)[] {
    const compare = comparator ?? defaultComparator
    const result: (T | undefined)[] = new Array(elements.length).fill(undefined)
    const stack: number[] = []
    for (let i = 0; i < elements.length; i++) {
      while (
        stack.length > 0 &&
        compare(elements[stack[stack.length - 1]!]!, elements[i]!) > 0
      ) {
        result[stack.pop()!] = elements[i]
      }
      stack.push(i)
    }
    return result
  }

  static previousGreater<T>(elements: T[], comparator?: (a: T, b: T) => number): (T | undefined)[] {
    const compare = comparator ?? defaultComparator
    const result: (T | undefined)[] = new Array(elements.length).fill(undefined)
    const stack: number[] = []
    for (let i = elements.length - 1; i >= 0; i--) {
      while (
        stack.length > 0 &&
        compare(elements[stack[stack.length - 1]!]!, elements[i]!) < 0
      ) {
        result[stack.pop()!] = elements[i]
      }
      stack.push(i)
    }
    return result
  }

  static previousSmaller<T>(elements: T[], comparator?: (a: T, b: T) => number): (T | undefined)[] {
    const compare = comparator ?? defaultComparator
    const result: (T | undefined)[] = new Array(elements.length).fill(undefined)
    const stack: number[] = []
    for (let i = elements.length - 1; i >= 0; i--) {
      while (
        stack.length > 0 &&
        compare(elements[stack[stack.length - 1]!]!, elements[i]!) > 0
      ) {
        result[stack.pop()!] = elements[i]
      }
      stack.push(i)
    }
    return result
  }

  static largestRectangleInHistogram(heights: number[]): number {
    const stack: number[] = []
    let maxArea = 0
    const n = heights.length
    for (let i = 0; i <= n; i++) {
      const h = i < n ? heights[i]! : 0
      while (stack.length > 0 && heights[stack[stack.length - 1]!]! > h) {
        const top = stack.pop()!
        const width = stack.length === 0 ? i : i - stack[stack.length - 1]! - 1
        maxArea = Math.max(maxArea, heights[top]! * width)
      }
      stack.push(i)
    }
    return maxArea
  }
}

export { defaultComparator } from './types.js'
export type { MonotonicStackOptions, MonotonicStackStats } from './types.js'
