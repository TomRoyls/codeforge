export interface MinMaxHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export class MinMaxHeap<T> {
  private readonly heap: T[] = []
  private readonly compare: (a: T, b: T) => number

  constructor(options?: MinMaxHeapOptions<T>) {
    this.compare =
      options?.comparator ?? ((a: T, b: T) => (a as number) - (b as number))
  }

  insert(value: T): void {
    this.heap.push(value)
    this.pushUp(this.heap.length - 1)
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

  extractMin(): T | undefined {
    if (this.heap.length === 0) return undefined
    const min = this.heap[0]!
    this.heap[0] = this.heap[this.heap.length - 1]!
    this.heap.pop()
    if (this.heap.length > 0) {
      this.pushDownMin(0)
    }
    return min
  }

  extractMax(): T | undefined {
    if (this.heap.length === 0) return undefined
    const maxIndex = this.maxIndex()
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

  replaceMin(value: T): T | undefined {
    if (this.heap.length === 0) return undefined
    const old = this.heap[0]!
    this.heap[0] = value
    this.pushDownMin(0)
    return old
  }

  replaceMax(value: T): T | undefined {
    if (this.heap.length === 0) return undefined
    const maxIndex = this.maxIndex()
    const old = this.heap[maxIndex]!
    this.heap[maxIndex] = value
    this.pushDownMax(maxIndex)
    return old
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

  private hasParent(index: number): boolean {
    return index > 0
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
    if (!this.hasParent(index)) return
    if (this.isMinLevel(index)) {
      if (this.compare(this.heap[index]!, this.heap[this.parent(index)]!) > 0) {
        this.swap(index, this.parent(index))
        this.pushUpMax(this.parent(index))
      } else {
        this.pushUpMin(index)
      }
    } else {
      if (this.compare(this.heap[index]!, this.heap[this.parent(index)]!) < 0) {
        this.swap(index, this.parent(index))
        this.pushUpMin(this.parent(index))
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

  private maxIndex(): number {
    if (this.heap.length === 1) return 0
    if (this.heap.length === 2) return 1
    return this.compare(this.heap[1]!, this.heap[2]!) >= 0 ? 1 : 2
  }
}
