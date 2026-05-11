import type { AugmentedQueueOptions } from './types.js'

interface StackEntry {
  value: number
  runningMin: number
  runningMax: number
  runningSum: number
}

export class AugmentedQueue {
  private frontStack: StackEntry[] = []
  private backStack: StackEntry[] = []
  private _size = 0

  constructor(options?: AugmentedQueueOptions) {
    if (options?.elements) {
      for (const el of options.elements) {
        this.enqueue(el)
      }
    }
  }

  enqueue(item: number): void {
    const top = this.backStack[this.backStack.length - 1]
    this.backStack.push({
      value: item,
      runningMin: top ? Math.min(item, top.runningMin) : item,
      runningMax: top ? Math.max(item, top.runningMax) : item,
      runningSum: top ? top.runningSum + item : item,
    })
    this._size++
  }

  dequeue(): number {
    if (this._size === 0) {
      throw new Error('AugmentedQueue is empty')
    }
    if (this.frontStack.length === 0) {
      this.transferBackToFront()
    }
    this._size--
    return this.frontStack.pop()!.value
  }

  private transferBackToFront(): void {
    while (this.backStack.length > 0) {
      const item = this.backStack.pop()!.value
      const top = this.frontStack[this.frontStack.length - 1]
      this.frontStack.push({
        value: item,
        runningMin: top ? Math.min(item, top.runningMin) : item,
        runningMax: top ? Math.max(item, top.runningMax) : item,
        runningSum: top ? top.runningSum + item : item,
      })
    }
  }

  peek(): number {
    if (this._size === 0) {
      throw new Error('AugmentedQueue is empty')
    }
    if (this.frontStack.length > 0) {
      return this.frontStack[this.frontStack.length - 1]!.value
    }
    return this.backStack[0]!.value
  }

  peekBack(): number {
    if (this._size === 0) {
      throw new Error('AugmentedQueue is empty')
    }
    if (this.backStack.length > 0) {
      return this.backStack[this.backStack.length - 1]!.value
    }
    return this.frontStack[0]!.value
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.frontStack = []
    this.backStack = []
    this._size = 0
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = this.frontStack.length - 1; i >= 0; i--) {
      result.push(this.frontStack[i]!.value)
    }
    for (let i = 0; i < this.backStack.length; i++) {
      result.push(this.backStack[i]!.value)
    }
    return result
  }

  min(): number {
    if (this._size === 0) {
      throw new Error('AugmentedQueue is empty')
    }
    const frontMin = this.getFrontMin()
    const backMin = this.getBackMin()
    if (frontMin !== undefined && backMin !== undefined) {
      return Math.min(frontMin, backMin)
    }
    return (frontMin ?? backMin)!
  }

  max(): number {
    if (this._size === 0) {
      throw new Error('AugmentedQueue is empty')
    }
    const frontMax = this.getFrontMax()
    const backMax = this.getBackMax()
    if (frontMax !== undefined && backMax !== undefined) {
      return Math.max(frontMax, backMax)
    }
    return (frontMax ?? backMax)!
  }

  sum(): number {
    if (this._size === 0) {
      throw new Error('AugmentedQueue is empty')
    }
    const frontSum = this.getFrontSum()
    const backSum = this.getBackSum()
    return (frontSum ?? 0) + (backSum ?? 0)
  }

  average(): number {
    if (this._size === 0) {
      throw new Error('AugmentedQueue is empty')
    }
    return this.sum() / this._size
  }

  private getFrontMin(): number | undefined {
    if (this.frontStack.length === 0) return undefined
    return this.frontStack[this.frontStack.length - 1]!.runningMin
  }

  private getBackMin(): number | undefined {
    if (this.backStack.length === 0) return undefined
    return this.backStack[this.backStack.length - 1]!.runningMin
  }

  private getFrontMax(): number | undefined {
    if (this.frontStack.length === 0) return undefined
    return this.frontStack[this.frontStack.length - 1]!.runningMax
  }

  private getBackMax(): number | undefined {
    if (this.backStack.length === 0) return undefined
    return this.backStack[this.backStack.length - 1]!.runningMax
  }

  private getFrontSum(): number | undefined {
    if (this.frontStack.length === 0) return undefined
    return this.frontStack[this.frontStack.length - 1]!.runningSum
  }

  private getBackSum(): number | undefined {
    if (this.backStack.length === 0) return undefined
    return this.backStack[this.backStack.length - 1]!.runningSum
  }

  clone(): AugmentedQueue {
    const result = new AugmentedQueue()
    result.frontStack = this.frontStack.map((e) => ({ ...e }))
    result.backStack = this.backStack.map((e) => ({ ...e }))
    result._size = this._size
    return result
  }

  forEach(callback: (item: number, index: number) => void): void {
    let idx = 0
    for (let i = this.frontStack.length - 1; i >= 0; i--) {
      callback(this.frontStack[i]!.value, idx++)
    }
    for (let i = 0; i < this.backStack.length; i++) {
      callback(this.backStack[i]!.value, idx++)
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    for (let i = this.frontStack.length - 1; i >= 0; i--) {
      yield this.frontStack[i]!.value
    }
    for (let i = 0; i < this.backStack.length; i++) {
      yield this.backStack[i]!.value
    }
  }

  static fromArray(items: number[]): AugmentedQueue {
    const queue = new AugmentedQueue()
    for (const item of items) {
      queue.enqueue(item)
    }
    return queue
  }
}

export type { AugmentedQueueOptions } from './types.js'
