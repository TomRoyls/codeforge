export interface HeapEntry<T> {
  key: number
  value: T
}

export class IntervalHeap<T> {
  private heap: HeapEntry<T>[] = []
  private indices: Map<T, number> = new Map()

  get size(): number {
    return this.heap.length
  }

  get isEmpty(): boolean {
    return this.heap.length === 0
  }

  insert(key: number, value: T): void {
    const entry: HeapEntry<T> = { key, value }
    this.heap.push(entry)
    const idx = this.heap.length - 1
    this.indices.set(value, idx)
    this.siftUp(idx)
  }

  peek(): HeapEntry<T> | undefined {
    return this.heap[0]
  }

  extractMin(): HeapEntry<T> | undefined {
    if (this.heap.length === 0) return undefined
    const min = this.heap[0]!
    this.indices.delete(min.value)
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.indices.set(last.value, 0)
      this.siftDown(0)
    }
    return min
  }

  decreaseKey(value: T, newKey: number): boolean {
    const idx = this.indices.get(value)
    if (idx === undefined) return false
    const entry = this.heap[idx]!
    if (newKey > entry.key) return false
    entry.key = newKey
    this.siftUp(idx)
    return true
  }

  increaseKey(value: T, newKey: number): boolean {
    const idx = this.indices.get(value)
    if (idx === undefined) return false
    const entry = this.heap[idx]!
    if (newKey < entry.key) return false
    entry.key = newKey
    this.siftDown(idx)
    return true
  }

  updateKey(value: T, newKey: number): boolean {
    const idx = this.indices.get(value)
    if (idx === undefined) return false
    const entry = this.heap[idx]!
    const oldKey = entry.key
    entry.key = newKey
    if (newKey < oldKey) {
      this.siftUp(idx)
    } else if (newKey > oldKey) {
      this.siftDown(idx)
    }
    return true
  }

  has(value: T): boolean {
    return this.indices.has(value)
  }

  getKey(value: T): number | undefined {
    const idx = this.indices.get(value)
    if (idx === undefined) return undefined
    return this.heap[idx]!.key
  }

  delete(value: T): boolean {
    const idx = this.indices.get(value)
    if (idx === undefined) return false
    this.indices.delete(value)
    const entry = this.heap[idx]!
    const last = this.heap.pop()!
    if (idx < this.heap.length) {
      this.heap[idx] = last
      this.indices.set(last.value, idx)
      if (last.key < entry.key) {
        this.siftUp(idx)
      } else {
        this.siftDown(idx)
      }
    }
    return true
  }

  clear(): void {
    this.heap.length = 0
    this.indices.clear()
  }

  toArray(): HeapEntry<T>[] {
    return this.heap.map((e) => ({ key: e.key, value: e.value }))
  }

  keys(): number[] {
    return this.heap.map((e) => e.key)
  }

  values(): T[] {
    return this.heap.map((e) => e.value)
  }

  forEach(callback: (entry: HeapEntry<T>, index: number) => void): void {
    for (let i = 0; i < this.heap.length; i++) {
      callback(this.heap[i]!, i)
    }
  }

  *entries(): Generator<HeapEntry<T>> {
    for (const entry of this.heap) {
      yield entry
    }
  }

  merge(other: IntervalHeap<T>): IntervalHeap<T> {
    const result = new IntervalHeap<T>()
    for (const entry of this.heap) {
      result.insert(entry.key, entry.value)
    }
    for (const entry of other.heap) {
      result.insert(entry.key, entry.value)
    }
    return result
  }

  private siftUp(idx: number): void {
    while (idx > 0) {
      const parent = (idx - 1) >> 1
      if (this.heap[idx]!.key < this.heap[parent]!.key) {
        this.swap(idx, parent)
        idx = parent
      } else {
        break
      }
    }
  }

  private siftDown(idx: number): void {
    const len = this.heap.length
    while (true) {
      let smallest = idx
      const left = 2 * idx + 1
      const right = 2 * idx + 2
      if (left < len && this.heap[left]!.key < this.heap[smallest]!.key) {
        smallest = left
      }
      if (right < len && this.heap[right]!.key < this.heap[smallest]!.key) {
        smallest = right
      }
      if (smallest !== idx) {
        this.swap(idx, smallest)
        idx = smallest
      } else {
        break
      }
    }
  }

  private swap(a: number, b: number): void {
    const temp = this.heap[a]!
    this.heap[a] = this.heap[b]!
    this.heap[b] = temp
    this.indices.set(this.heap[a]!.value, a)
    this.indices.set(this.heap[b]!.value, b)
  }

  static fromArray<T>(items: Array<{ key: number; value: T }>): IntervalHeap<T> {
    const heap = new IntervalHeap<T>()
    for (const item of items) {
      heap.insert(item.key, item.value)
    }
    return heap
  }
}
