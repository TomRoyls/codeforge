export class AdaptivePQ2<T> {
  private threshold: number
  private items: {priority: number, value: T}[] = []
  private _head = 0
  private _heapMode = false

  constructor(threshold?: number) {
    this.threshold = threshold ?? 64
  }

  push(priority: number, value: T): void {
    if (this.shouldUseHeap()) {
      this.heapPush(priority, value)
    } else {
      this.sortedInsert(priority, value)
    }
  }

  pop(): {priority: number, value: T} | undefined {
    if (this.items.length - this._head === 0) {
      return undefined
    }

    if (this.shouldUseHeap()) {
      return this.heapPop()
    } else {
      const result = this.items[this._head]!
      this._head++
      if (this._head > (this.items.length / 2)) {
        this._compact()
      }
      return result
    }
  }

  peek(): {priority: number, value: T} | undefined {
    if (this.items.length - this._head === 0) {
      return undefined
    }

    if (this.shouldUseHeap()) {
      return this.items[0]
    } else {
      return this.items[this._head]
    }
  }

  get size(): number {
    return this.items.length - this._head
  }

  isEmpty(): boolean {
    return this.items.length - this._head === 0
  }

  clear(): void {
    this.items = []
    this._head = 0
    this._heapMode = false
  }

  toArray(): {priority: number, value: T}[] {
    if (this.shouldUseHeap()) {
      const sorted: {priority: number, value: T}[] = []
      const copy = [...this.items]

      while (copy.length > 0) {
        sorted.push(copy[0]!)
        this.heapSwap(copy, 0, copy.length - 1)
        copy.pop()

        if (copy.length > 0) {
          this.heapifyDownArray(copy, 0)
        }
      }

      return sorted
    } else {
      return this.items.slice(this._head)
    }
  }

  contains(value: T): boolean {
    for (let i = this._head; i < this.items.length; i++) {
      if (this.items[i]!.value === value) return true
    }
    return false
  }

  remove(value: T): boolean {
    let index = -1
    for (let i = this._head; i < this.items.length; i++) {
      if (this.items[i]!.value === value) {
        index = i
        break
      }
    }
    if (index === -1) {
      return false
    }

    if (this.shouldUseHeap()) {
      this.heapRemove(index)
    } else {
      this.items.splice(index, 1)
    }

    return true
  }

  update(value: T, newPriority: number): boolean {
    let index = -1
    for (let i = this._head; i < this.items.length; i++) {
      if (this.items[i]!.value === value) {
        index = i
        break
      }
    }
    if (index === -1) {
      return false
    }

    if (this.shouldUseHeap()) {
      this.items[index++]!.priority = newPriority
      const parentIndex = this.heapParent(index)
      if (parentIndex >= 0 && this.items[index++]!.priority < this.items[parentIndex]!.priority) {
        this.heapifyUp(index)
      } else {
        this.heapifyDown(index)
      }
    } else {
      this.items.splice(index, 1)
      this.sortedInsert(newPriority, value)
    }

    return true
  }

  private shouldUseHeap(): boolean {
    if (this._heapMode) return true
    const effectiveSize = this.items.length - this._head
    if (effectiveSize > this.threshold) {
      this._heapMode = true
      if (this._head > 0) this._compact()
      return true
    }
    return false
  }

  private sortedInsert(priority: number, value: T): void {
    let low = 0
    let high = this.items.length - this._head

    while (low < high) {
      const mid = Math.floor((low + high) / 2)
      if (this.items[mid + this._head]!.priority < priority) {
        low = mid + 1
      } else {
        high = mid
      }
    }

    this.items.splice(low + this._head, 0, { priority, value })
  }

  private heapPush(priority: number, value: T): void {
    this.items.push({ priority, value })
    this.heapifyUp(this.items.length - 1)
  }

  private heapPop(): {priority: number, value: T} | undefined {
    if (this.items.length === 0) {
      return undefined
    }

    if (this.items.length === 1) {
      return this.items.pop()
    }

    const result = this.items[0]
    this.items[0] = this.items.pop()!
    this.heapifyDown(0)

    return result
  }

  private heapRemove(index: number): void {
    if (index === this.items.length - 1) {
      this.items.pop()
      return
    }

    this.items[index] = this.items.pop()!

    const parentIndex = this.heapParent(index)
    if (parentIndex >= 0 && this.items[index++]!.priority < this.items[parentIndex]!.priority) {
      this.heapifyUp(index)
    } else {
      this.heapifyDown(index)
    }
  }

  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIndex = this.heapParent(index)
      if (this.items[index++]!.priority >= this.items[parentIndex]!.priority) {
        break
      }

      this.heapSwap(this.items, index, parentIndex)
      index = parentIndex
    }
  }

  private heapifyDown(index: number): void {
    const length = this.items.length

    while (true) {
      let smallest = index
      const leftIndex = this.heapLeft(index)
      const rightIndex = this.heapRight(index)

      if (leftIndex < length && this.items[leftIndex]!.priority < this.items[smallest]!.priority) {
        smallest = leftIndex
      }

      if (rightIndex < length && this.items[rightIndex]!.priority < this.items[smallest]!.priority) {
        smallest = rightIndex
      }

      if (smallest === index) {
        break;
      }

      this.heapSwap(this.items, index, smallest)
      index = smallest
    }
  }

  private heapifyDownArray(arr: {priority: number, value: T}[], index: number): void {
    const length = arr.length

    while (true) {
      let smallest = index
      const leftIndex = this.heapLeft(index)
      const rightIndex = this.heapRight(index)

      if (leftIndex < length && arr[leftIndex]!.priority < arr[smallest]!.priority) {
        smallest = leftIndex
      }

      if (rightIndex < length && arr[rightIndex]!.priority < arr[smallest]!.priority) {
        smallest = rightIndex
      }

      if (smallest === index) {
        break
      }

      this.heapSwap(arr, index, smallest)
      index = smallest
    }
  }

  private heapParent(index: number): number {
    return Math.floor((index - 1) / 2)
  }

  private heapLeft(index: number): number {
    return 2 * index + 1
  }

  private heapRight(index: number): number {
    return 2 * index + 2
  }

  private _compact(): void {
    if (this._head > 0) {
      this.items = this.items.slice(this._head)
      this._head = 0
    }
  }

  private heapSwap(arr: {priority: number, value: T}[], i: number, j: number): void {
    const temp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = temp
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }
}
