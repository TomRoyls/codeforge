export interface DoubleEndedPriorityQueueOptions<T> {
  capacity?: number
  comparator?: (a: T, b: T) => number
}

export class DoubleEndedPriorityQueue<T> {
  private readonly heap: T[] = []
  private readonly capacity: number | undefined
  private readonly compare: (a: T, b: T) => number

  constructor(options?: number | DoubleEndedPriorityQueueOptions<T>) {
    if (typeof options === 'number') {
      if (options < 1 || !Number.isFinite(options)) {
        throw new RangeError('Capacity must be a positive finite integer')
      }
      this.capacity = options
      this.compare = (a: T, b: T) => (a as number) - (b as number)
    } else {
      if (options?.capacity !== undefined) {
        if (options.capacity < 1 || !Number.isFinite(options.capacity)) {
          throw new RangeError('Capacity must be a positive finite integer')
        }
        this.capacity = options.capacity
      }
      this.compare =
        options?.comparator ?? ((a: T, b: T) => (a as number) - (b as number))
    }
  }

  push(value: T): void {
    if (this.capacity !== undefined && this.heap.length >= this.capacity) {
      throw new Error('Priority queue is full')
    }
    this.heap.push(value)
    this.pushUp(this.heap.length - 1)
  }

  popMin(): T | undefined {
    if (this.heap.length === 0) return undefined
    const min = this.heap[0]!
    this.heap[0] = this.heap[this.heap.length - 1]!
    this.heap.pop()
    if (this.heap.length > 0) {
      this.pushDownMin(0)
    }
    return min
  }

  popMax(): T | undefined {
    if (this.heap.length === 0) return undefined
    const maxIndex = this.findMaxIndex()
    const max = this.heap[maxIndex]!
    const lastIndex = this.heap.length - 1
    if (maxIndex === lastIndex) {
      this.heap.pop()
      return max
    }
    this.heap[maxIndex] = this.heap[lastIndex]!
    this.heap.pop()
    if (this.heap.length > 0) {
      this.pushDownMax(maxIndex)
    }
    return max
  }

  peekMin(): T | undefined {
    return this.heap[0]
  }

  peekMax(): T | undefined {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap[0]
    if (this.heap.length === 2) return this.heap[1]
    return this.compare(this.heap[1]!, this.heap[2]!) >= 0
      ? this.heap[1]
      : this.heap[2]
  }

  get size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap.length = 0
  }

  toArray(): T[] {
    return [...this.heap]
  }

  toString(): string {
    return JSON.stringify(this.heap)
  }

  toJSON(): T[] {
    return [...this.heap]
  }

  clone(): DoubleEndedPriorityQueue<T> {
    const copy = new DoubleEndedPriorityQueue<T>({
      capacity: this.capacity,
      comparator: this.compare,
    })
    copy.heap.push(...this.heap)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DoubleEndedPriorityQueue)) return false
    if (this.heap.length !== other.heap.length) return false
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i] !== other.heap[i]) return false
    }
    return true
  }

  private isMinLevel(index: number): boolean {
    let level = 0
    let i = index + 1
    while (i > 1) {
      i >>= 1
      level++
    }
    return level % 2 === 0
  }

  private parent(index: number): number {
    return ((index + 1) >> 1) - 1
  }

  private grandparent(index: number): number {
    return this.parent(this.parent(index))
  }

  private hasGrandparent(index: number): boolean {
    return index > 2
  }

  private leftChild(index: number): number {
    return (index << 1) + 1
  }

  private rightChild(index: number): number {
    return (index << 1) + 2
  }

  private swap(i: number, j: number): void {
    ;[this.heap[i], this.heap[j]] = [this.heap[j]!, this.heap[i]!]
  }

  private pushUp(index: number): void {
    if (index === 0) return
    const p = this.parent(index)
    if (this.isMinLevel(index)) {
      if (this.compare(this.heap[index]!, this.heap[p]!) > 0) {
        this.swap(index, p)
        this.pushUpMax(p)
      } else {
        this.pushUpMin(index)
      }
    } else {
      if (this.compare(this.heap[index]!, this.heap[p]!) < 0) {
        this.swap(index, p)
        this.pushUpMin(p)
      } else {
        this.pushUpMax(index)
      }
    }
  }

  private pushUpMin(index: number): void {
    while (this.hasGrandparent(index)) {
      const gp = this.grandparent(index)
      if (this.compare(this.heap[index]!, this.heap[gp]!) < 0) {
        this.swap(index, gp)
        index = gp
      } else {
        break
      }
    }
  }

  private pushUpMax(index: number): void {
    while (this.hasGrandparent(index)) {
      const gp = this.grandparent(index)
      if (this.compare(this.heap[index]!, this.heap[gp]!) > 0) {
        this.swap(index, gp)
        index = gp
      } else {
        break
      }
    }
  }

  private pushDownMin(index: number): void {
    while (true) {
      let smallest = index
      const len = this.heap.length
      const left = this.leftChild(index)
      const right = this.rightChild(index)

      if (left < len && this.compare(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left
      }
      if (right < len && this.compare(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right
      }

      const ll = left < len ? this.leftChild(left) : -1
      const lr = left < len ? this.rightChild(left) : -1
      const rl = right < len ? this.leftChild(right) : -1
      const rr = right < len ? this.rightChild(right) : -1

      if (ll >= 0 && ll < len && this.compare(this.heap[ll]!, this.heap[smallest]!) < 0) {
        smallest = ll
      }
      if (lr >= 0 && lr < len && this.compare(this.heap[lr]!, this.heap[smallest]!) < 0) {
        smallest = lr
      }
      if (rl >= 0 && rl < len && this.compare(this.heap[rl]!, this.heap[smallest]!) < 0) {
        smallest = rl
      }
      if (rr >= 0 && rr < len && this.compare(this.heap[rr]!, this.heap[smallest]!) < 0) {
        smallest = rr
      }

      if (smallest === index) break

      if (smallest === left || smallest === right) {
        this.swap(index, smallest)
        index = smallest
      } else {
        this.swap(index, smallest)
        const p = this.parent(smallest)
        if (this.compare(this.heap[smallest]!, this.heap[p]!) > 0) {
          this.swap(smallest, p)
        }
        index = smallest
      }
    }
  }

  private pushDownMax(index: number): void {
    while (true) {
      let largest = index
      const len = this.heap.length
      const left = this.leftChild(index)
      const right = this.rightChild(index)

      if (left < len && this.compare(this.heap[left]!, this.heap[largest]!) > 0) {
        largest = left
      }
      if (right < len && this.compare(this.heap[right]!, this.heap[largest]!) > 0) {
        largest = right
      }

      const ll = left < len ? this.leftChild(left) : -1
      const lr = left < len ? this.rightChild(left) : -1
      const rl = right < len ? this.leftChild(right) : -1
      const rr = right < len ? this.rightChild(right) : -1

      if (ll >= 0 && ll < len && this.compare(this.heap[ll]!, this.heap[largest]!) > 0) {
        largest = ll
      }
      if (lr >= 0 && lr < len && this.compare(this.heap[lr]!, this.heap[largest]!) > 0) {
        largest = lr
      }
      if (rl >= 0 && rl < len && this.compare(this.heap[rl]!, this.heap[largest]!) > 0) {
        largest = rl
      }
      if (rr >= 0 && rr < len && this.compare(this.heap[rr]!, this.heap[largest]!) > 0) {
        largest = rr
      }

      if (largest === index) break

      if (largest === left || largest === right) {
        this.swap(index, largest)
        index = largest
      } else {
        this.swap(index, largest)
        const p = this.parent(largest)
        if (this.compare(this.heap[largest]!, this.heap[p]!) < 0) {
          this.swap(largest, p)
        }
        index = largest
      }
    }
  }

  private findMaxIndex(): number {
    if (this.heap.length === 1) return 0
    if (this.heap.length === 2) return 1
    return this.compare(this.heap[1]!, this.heap[2]!) >= 0 ? 1 : 2
  }
}
