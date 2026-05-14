export class HybridHeap2<T = unknown> {
  private heap: T[] = []
  private comparator: (a: T, b: T) => number

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator ?? ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
  }

  insert(value: T): void {
    if (this.heap.length < 64) {
      this.heap.push(value)
      this.bubbleUpBinary(this.heap.length - 1)
    } else {
      this.heap.push(value)
      this.bubbleUp4Ary(this.heap.length - 1)
    }
  }

  extractMin(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    const top = this.heap[0]!
    const last = this.heap.pop()
    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last
      if (this.heap.length >= 64) {
        this.sinkDown4Ary(0)
      } else {
        this.sinkDownBinary(0)
      }
    }
    return top
  }

  peek(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }
    return this.heap[0]!
  }

  get size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap = []
  }

  toArray(): T[] {
    const result: T[] = []
    const copy: T[] = [...this.heap]
    while (copy.length > 0) {
      result.push(copy[0]!)
      const last = copy.pop()
      if (copy.length > 0 && last !== undefined) {
        copy[0] = last
        if (copy.length >= 64) {
          this.sinkDown4AryCopy(copy, 0)
        } else {
          this.sinkDownBinaryCopy(copy, 0)
        }
      }
    }
    return result
  }

  static fromArray<T>(values: T[], comparator?: (a: T, b: T) => number): HybridHeap2<T> {
    const heap = new HybridHeap2<T>(comparator)
    for (const value of values) {
      heap.insert(value)
    }
    return heap
  }

  private bubbleUpBinary(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      const current = this.heap[index]!
      const parent = this.heap[parentIndex]!
      if (this.comparator(current, parent) < 0) {
        this.swap(index, parentIndex)
        index = parentIndex
      } else {
        break
      }
    }
  }

  private bubbleUp4Ary(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 4)
      const current = this.heap[index]!
      const parent = this.heap[parentIndex]!
      if (this.comparator(current, parent) < 0) {
        this.swap(index, parentIndex)
        index = parentIndex
      } else {
        break
      }
    }
  }

  private sinkDownBinary(index: number): void {
    const length = this.heap.length
    while (true) {
      let targetIndex = index
      const leftChildIndex = 2 * index + 1
      const rightChildIndex = 2 * index + 2

      if (leftChildIndex < length) {
        const leftChild = this.heap[leftChildIndex]!
        const target = this.heap[targetIndex]!
        if (this.comparator(leftChild, target) < 0) {
          targetIndex = leftChildIndex
        }
      }

      if (rightChildIndex < length) {
        const rightChild = this.heap[rightChildIndex]!
        const target = this.heap[targetIndex]!
        if (this.comparator(rightChild, target) < 0) {
          targetIndex = rightChildIndex
        }
      }

      if (targetIndex !== index) {
        this.swap(index, targetIndex)
        index = targetIndex
      } else {
        break
      }
    }
  }

  private sinkDown4Ary(index: number): void {
    const length = this.heap.length
    while (true) {
      let targetIndex = index
      for (let i = 1; i <= 4; i++) {
        const childIndex = 4 * index + i
        if (childIndex < length) {
          const child = this.heap[childIndex]!
          const target = this.heap[targetIndex]!
          if (this.comparator(child, target) < 0) {
            targetIndex = childIndex
          }
        }
      }

      if (targetIndex !== index) {
        this.swap(index, targetIndex)
        index = targetIndex
      } else {
        break
      }
    }
  }

  private sinkDownBinaryCopy(heap: T[], index: number): void {
    const length = heap.length
    while (true) {
      let targetIndex = index
      const leftChildIndex = 2 * index + 1
      const rightChildIndex = 2 * index + 2

      if (leftChildIndex < length) {
        const leftChild = heap[leftChildIndex]!
        const target = heap[targetIndex]!
        if (this.comparator(leftChild, target) < 0) {
          targetIndex = leftChildIndex
        }
      }

      if (rightChildIndex < length) {
        const rightChild = heap[rightChildIndex]!
        const target = heap[targetIndex]!
        if (this.comparator(rightChild, target) < 0) {
          targetIndex = rightChildIndex
        }
      }

      if (targetIndex !== index) {
        const temp = heap[index]!
        heap[index] = heap[targetIndex]!
        heap[targetIndex] = temp
        index = targetIndex
      } else {
        break
      }
    }
  }

  private sinkDown4AryCopy(heap: T[], index: number): void {
    const length = heap.length
    while (true) {
      let targetIndex = index
      for (let i = 1; i <= 4; i++) {
        const childIndex = 4 * index + i
        if (childIndex < length) {
          const child = heap[childIndex]!
          const target = heap[targetIndex]!
          if (this.comparator(child, target) < 0) {
            targetIndex = childIndex
          }
        }
      }

      if (targetIndex !== index) {
        const temp = heap[index]!
        heap[index] = heap[targetIndex]!
        heap[targetIndex] = temp
        index = targetIndex
      } else {
        break
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }
}
