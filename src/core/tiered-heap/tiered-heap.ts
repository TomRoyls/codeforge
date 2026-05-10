import { defaultComparator } from './types.js'

class MinHeap<T> {
  private data: T[] = []
  private readonly compare: (a: T, b: T) => number

  constructor(comparator: (a: T, b: T) => number) {
    this.compare = comparator
  }

  push(item: T): void {
    this.data.push(item)
    this.bubbleUp(this.data.length - 1)
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined
    const top = this.data[0]!
    const last = this.data.pop()
    if (this.data.length > 0 && last !== undefined) {
      this.data[0] = last
      this.sinkDown(0)
    }
    return top
  }

  peek(): T | undefined {
    return this.data[0]
  }

  get length(): number {
    return this.data.length
  }

  toArray(): T[] {
    return [...this.data]
  }

  indexOf(item: T): number {
    for (let i = 0; i < this.data.length; i++) {
      if (this.compare(this.data[i]!, item) === 0) return i
    }
    return -1
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.data.length) return undefined
    const item = this.data[index]!
    const last = this.data.pop()
    if (index < this.data.length && last !== undefined) {
      this.data[index] = last
      this.bubbleUp(index)
      this.sinkDown(index)
    }
    return item
  }

  clear(): void {
    this.data = []
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.compare(this.data[index]!, this.data[parent]!) < 0) {
        this.swap(index, parent)
        index = parent
      } else {
        break
      }
    }
  }

  private sinkDown(index: number): void {
    const length = this.data.length
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < length && this.compare(this.data[left]!, this.data[smallest]!) < 0) {
        smallest = left
      }
      if (right < length && this.compare(this.data[right]!, this.data[smallest]!) < 0) {
        smallest = right
      }
      if (smallest !== index) {
        this.swap(index, smallest)
        index = smallest
      } else {
        break
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.data[i]!
    this.data[i] = this.data[j]!
    this.data[j] = temp
  }
}

export class TieredHeap<T = number> {
  private heaps: MinHeap<T>[]
  private totalSize = 0
  private readonly compare: (a: T, b: T) => number
  private readonly tierCount: number

  constructor(tiers: number = 3, comparator?: (a: T, b: T) => number) {
    if (tiers < 1) throw new Error('TieredHeap requires at least 1 tier')
    this.tierCount = tiers
    this.compare = comparator ?? defaultComparator
    this.heaps = []
    for (let i = 0; i < tiers; i++) {
      this.heaps.push(new MinHeap<T>(this.compare))
    }
  }

  insert(item: T, tier: number): void {
    this.validateTier(tier)
    this.heaps[tier]!.push(item)
    this.totalSize++
  }

  extractMin(): T | undefined {
    if (this.totalSize === 0) return undefined
    for (let i = 0; i < this.tierCount; i++) {
      if (this.heaps[i]!.length > 0) {
        const item = this.heaps[i]!.pop()!
        this.totalSize--
        return item
      }
    }
    return undefined
  }

  peek(): T | undefined {
    for (let i = 0; i < this.tierCount; i++) {
      if (this.heaps[i]!.length > 0) {
        return this.heaps[i]!.peek()
      }
    }
    return undefined
  }

  peekTier(): number {
    for (let i = 0; i < this.tierCount; i++) {
      if (this.heaps[i]!.length > 0) {
        return i
      }
    }
    return -1
  }

  size(): number {
    return this.totalSize
  }

  isEmpty(): boolean {
    return this.totalSize === 0
  }

  clear(): void {
    for (let i = 0; i < this.tierCount; i++) {
      this.heaps[i]!.clear()
    }
    this.totalSize = 0
  }

  sizeOfTier(tier: number): number {
    this.validateTier(tier)
    return this.heaps[tier]!.length
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.tierCount; i++) {
      result.push(...this.heaps[i]!.toArray())
    }
    return result
  }

  merge(other: TieredHeap<T>): void {
    if (other.tierCount !== this.tierCount) {
      throw new Error('Cannot merge heaps with different tier counts')
    }
    for (let i = 0; i < this.tierCount; i++) {
      const items = other.heaps[i]!.toArray()
      for (const item of items) {
        this.heaps[i]!.push(item)
        this.totalSize++
      }
    }
  }

  contains(item: T): boolean {
    for (let i = 0; i < this.tierCount; i++) {
      if (this.heaps[i]!.indexOf(item) !== -1) return true
    }
    return false
  }

  remove(item: T): boolean {
    for (let i = 0; i < this.tierCount; i++) {
      const idx = this.heaps[i]!.indexOf(item)
      if (idx !== -1) {
        this.heaps[i]!.removeAt(idx)
        this.totalSize--
        return true
      }
    }
    return false
  }

  updateTier(item: T, newTier: number): boolean {
    this.validateTier(newTier)
    for (let i = 0; i < this.tierCount; i++) {
      const idx = this.heaps[i]!.indexOf(item)
      if (idx !== -1) {
        if (i === newTier) return true
        this.heaps[i]!.removeAt(idx)
        this.heaps[newTier]!.push(item)
        return true
      }
    }
    return false
  }

  get tiers(): number {
    return this.tierCount
  }

  get currentTier(): number {
    return this.peekTier()
  }

  toArrayGrouped(): T[][] {
    const result: T[][] = []
    for (let i = 0; i < this.tierCount; i++) {
      result.push(this.heaps[i]!.toArray())
    }
    return result
  }

  private validateTier(tier: number): void {
    if (tier < 0 || tier >= this.tierCount) {
      throw new Error(`Tier ${tier} is out of range [0, ${this.tierCount - 1}]`)
    }
  }
}

export { defaultComparator } from './types.js'
export type { TieredHeapOptions } from './types.js'
