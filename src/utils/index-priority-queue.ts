export class IndexPriorityQueue<T> {
  private readonly heap: number[] = []
  private readonly values: (T | undefined)[]
  private readonly position: Int32Array
  private readonly present: Uint8Array
  private readonly _capacity: number
  private _size = 0
  private readonly compare: (a: T, b: T) => number

  constructor(capacity: number, comparator?: (a: T, b: T) => number) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new RangeError(`capacity must be a positive integer, got ${capacity}`)
    }
    this._capacity = capacity
    this.values = new Array(capacity)
    this.position = new Int32Array(capacity).fill(-1)
    this.present = new Uint8Array(capacity)
    this.compare = comparator ?? ((a: T, b: T) => (a as number) - (b as number))
  }

  insert(index: number, value: T): void {
    this.validateIndex(index)
    if (this.present[index]) {
      throw new Error(`index ${index} is already in the queue`)
    }
    this.values[index] = value
    this.present[index] = 1
    this.position[index] = this.heap.length
    this.heap.push(index)
    this.bubbleUp(this.heap.length - 1)
    this._size++
  }

  changeValue(index: number, value: T): void {
    this.validateIndex(index)
    if (!this.present[index]) {
      throw new Error(`index ${index} is not in the queue`)
    }
    const oldValue = this.values[index]!
    this.values[index] = value
    const pos = this.position[index]!
    const cmp = this.compare(value, oldValue)
    if (cmp < 0) {
      this.bubbleUp(pos)
    } else if (cmp > 0) {
      this.sinkDown(pos)
    }
  }

  delete(index: number): void {
    this.validateIndex(index)
    if (!this.present[index]) return
    const pos = this.position[index]!
    this.removeAt(pos)
  }

  contains(index: number): boolean {
    if (index < 0 || index >= this._capacity) return false
    return this.present[index] === 1
  }

  peek(): { index: number; value: T } | undefined {
    if (this._size === 0) return undefined
    const idx = this.heap[0]!
    return { index: idx, value: this.values[idx]! }
  }

  pop(): { index: number; value: T } | undefined {
    if (this._size === 0) return undefined
    const idx = this.heap[0]!
    const result = { index: idx, value: this.values[idx]! }
    this.removeAt(0)
    return result
  }

  getValue(index: number): T | undefined {
    if (index < 0 || index >= this._capacity) return undefined
    if (!this.present[index]) return undefined
    return this.values[index]!
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      const idx = this.heap[i]!
      this.present[idx] = 0
      this.position[idx] = -1
      this.values[idx] = undefined
    }
    this.heap.length = 0
    this._size = 0
  }

  toArray(): Array<{ index: number; value: T }> {
    const result: Array<{ index: number; value: T }> = []
    for (let i = 0; i < this.heap.length; i++) {
      const idx = this.heap[i]!
      result.push({ index: idx, value: this.values[idx]! })
    }
    return result
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  clone(): IndexPriorityQueue<T> {
    const copy = new IndexPriorityQueue<T>(this._capacity, this.compare)
    for (let i = 0; i < this.heap.length; i++) {
      const idx = this.heap[i]!
      copy.values[idx] = this.values[idx]
      copy.present[idx] = this.present[idx] ?? 0
      copy.position[idx] = this.position[idx] ?? 0
      copy.heap.push(idx)
    }
    copy._size = this._size
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof IndexPriorityQueue)) return false
    if (this._size !== other._size) return false
    if (this._capacity !== other._capacity) return false
    for (let i = 0; i < this.heap.length; i++) {
      const aIdx = this.heap[i]!
      const bIdx = other.heap[i]!
      if (aIdx !== bIdx) return false
      if (this.values[aIdx] !== other.values[bIdx]) return false
    }
    return true
  }

  private validateIndex(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this._capacity) {
      throw new RangeError(`index ${index} out of bounds [0, ${this._capacity - 1}]`)
    }
  }

  private removeAt(pos: number): void {
    const removedIdx = this.heap[pos]!
    const lastIdx = this.heap.pop()!
    this._size--
    this.present[removedIdx] = 0
    this.position[removedIdx] = -1
    this.values[removedIdx] = undefined
    if (pos < this.heap.length) {
      this.heap[pos] = lastIdx
      this.position[lastIdx] = pos
      if (pos > 0) {
        const parent = (pos - 1) >> 1
        if (this.compare(this.values[this.heap[pos]!]!, this.values[this.heap[parent]!]!) < 0) {
          this.bubbleUp(pos)
          return
        }
      }
      this.sinkDown(pos)
    }
  }

  private bubbleUp(pos: number): void {
    while (pos > 0) {
      const parent = (pos - 1) >> 1
      if (this.compare(this.values[this.heap[pos]!]!, this.values[this.heap[parent]!]!) < 0) {
        this.swap(pos, parent)
        pos = parent
      } else {
        break
      }
    }
  }

  private sinkDown(pos: number): void {
    const len = this.heap.length
    while (true) {
      let target = pos
      const left = (pos << 1) + 1
      const right = (pos << 1) + 2
      if (left < len && this.compare(this.values[this.heap[left]!]!, this.values[this.heap[target]!]!) < 0) {
        target = left
      }
      if (right < len && this.compare(this.values[this.heap[right]!]!, this.values[this.heap[target]!]!) < 0) {
        target = right
      }
      if (target === pos) break
      this.swap(pos, target)
      pos = target
    }
  }

  private swap(i: number, j: number): void {
    const a = this.heap[i]!
    const b = this.heap[j]!
    this.heap[i] = b
    this.heap[j] = a
    this.position[a] = j
    this.position[b] = i
  }
}
