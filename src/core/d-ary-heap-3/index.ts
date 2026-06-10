export class DAryHeap<T> {
  private heap: T[] = []
  private d: number
  private cmp: (a: T, b: T) => number

  constructor(d?: number, comparator?: (a: T, b: T) => number) {
    this.d = d ?? 4
    if (this.d < 2) {
      this.d = 2
    }
    this.cmp = comparator ?? this.defaultComparator
  }

  private defaultComparator(a: T, b: T): number {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  insert(value: T): void {
    this.heap.push(value)
    this.bubbleUp(this.heap.length - 1)
  }

  extract(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.trickleDown(0)
    }
    return top
  }

  peek(): T | undefined {
    if (this.heap.length === 0) return undefined
    return this.heap[0]!
  }

  size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  heapify(array: T[]): void {
    this.heap = [...array]
    const start = Math.floor((this.heap.length - 2) / this.d)
    for (let i = start; i >= 0; i--) {
      this.trickleDown(i)
    }
  }

  toArray(): T[] {
    return [...this.heap]
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.cmp(this.heap[i]!, value) === 0) return true
    }
    return false
  }

  merge(other: DAryHeap<T>): DAryHeap<T> {
    const result = new DAryHeap<T>(this.d, this.cmp)
    for (let i = 0; i < this.heap.length; i++) {
      result.insert(this.heap[i]!)
    }
    for (let i = 0; i < other.heap.length; i++) {
      result.insert(other.heap[i]!)
    }
    return result
  }

  clear(): void {
    this.heap.length = 0
  }

  update(index: number, value: T): void {
    if (index < 0 || index >= this.heap.length) {
      return
    }
    const old = this.heap[index]!
    this.heap[index] = value
    const cmpResult = this.cmp(value, old)
    if (cmpResult > 0) {
      this.bubbleUp(index)
    } else if (cmpResult < 0) {
      this.trickleDown(index)
    }
  }

  getTimeComplexity(): string {
    const d = this.d
    const insertLog = `O(log${d}(n))`
    const extractLog = `O(${d} * log${d}(n))`
    return `insert: ${insertLog}, extract: ${extractLog}`
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / this.d)
  }

  private child(index: number, k: number): number {
    return this.d * index + k + 1
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const p = this.parent(index)
      if (this.cmp(this.heap[index]!, this.heap[p]!) > 0) {
        this.swap(index, p)
        index = p
      } else {
        break
      }
    }
  }

  private trickleDown(index: number): void {
    const n = this.heap.length
    while (true) {
      let largest = index
      for (let k = 0; k < this.d; k++) {
        const c = this.child(index, k)
        if (c < n && this.cmp(this.heap[c]!, this.heap[largest]!) > 0) {
          largest = c
        }
      }
      if (largest !== index) {
        this.swap(index, largest)
        index = largest
      } else {
        break
      }
    }
  }

  private swap(i: number, j: number): void {
    const tmp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = tmp
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

  toString(): string {
    return `${DAryHeap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'DAryHeap', items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.heap.every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.heap.some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.heap.find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.heap.findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.heap.includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.heap
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.heap.join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.heap.slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }



  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  groupBy<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }

  min(): T | undefined {
    const arr = this.heap
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  max(): T | undefined {
    const arr = this.heap
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.heap.slice(0, n)
  }

  skip(n: number): T[] {
    return this.heap.slice(n)
  }


  tap(fn: (collection: DAryHeap<T>) => void): DAryHeap<T> {
    fn(this)
    return this
  }

  equals(other: DAryHeap<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  static from<T>(items: T[]): DAryHeap<T> {
    const instance = new DAryHeap<T>()
    for (const item of items) {
      instance.insert(item)
    }
    return instance
  }

  static of<T>(...items: T[]): DAryHeap<T> {
    return DAryHeap.from(items)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }
}
