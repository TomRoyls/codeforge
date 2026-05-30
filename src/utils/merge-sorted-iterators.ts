export class MergeSortedIterators<T> {
  private readonly sources: Array<{
    iterator: Iterator<T>
    current: IteratorResult<T>
    sourceIndex: number
  }> = []
  private readonly compare: (a: T, b: T) => number

  constructor(
    sources: Iterator<T>[],
    compare: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0),
  ) {
    this.compare = compare
    for (let i = 0; i < sources.length; i++) {
      const iterator = sources[i]!
      const current = iterator.next()
      if (!current.done) {
        this.sources.push({ iterator, current, sourceIndex: i })
      }
    }
    this.heapify()
  }

  next(): IteratorResult<T> {
    if (this.sources.length === 0) {
      return { done: true, value: undefined }
    }
    const top = this.sources[0]!
    const value = top.current.value
    top.current = top.iterator.next()
    if (top.current.done) {
      this.removeMin()
    } else {
      this.siftDown(0)
    }
    return { done: false, value }
  }

  *[Symbol.iterator](): Iterator<T> {
    while (this.sources.length > 0) {
      const result = this.next()
      if (result.done) return
      yield result.value
    }
  }

  toArray(): T[] {
    const result: T[] = []
    for (const value of this) {
      result.push(value)
    }
    return result
  }

  get activeSources(): number {
    return this.sources.length
  }

  private heapify(): void {
    for (let i = (this.sources.length >>> 1) - 1; i >= 0; i--) {
      this.siftDown(i)
    }
  }

  private siftDown(index: number): void {
    const n = this.sources.length
    let current = index
    while (true) {
      let smallest = current
      const left = 2 * current + 1
      const right = 2 * current + 2
      if (left < n && this.compare(this.sources[left]!.current.value, this.sources[smallest]!.current.value) < 0) {
        smallest = left
      }
      if (right < n && this.compare(this.sources[right]!.current.value, this.sources[smallest]!.current.value) < 0) {
        smallest = right
      }
      if (smallest !== current) {
        const temp = this.sources[current]!
        this.sources[current] = this.sources[smallest]!
        this.sources[smallest] = temp
        current = smallest
      } else {
        break
      }
    }
  }

  private removeMin(): void {
    const last = this.sources.pop()!
    if (this.sources.length > 0) {
      this.sources[0] = last
      this.siftDown(0)
    }
  }

  static fromArrays<U>(
    arrays: U[][],
    compare?: (a: U, b: U) => number,
  ): MergeSortedIterators<U> {
    const iterators: Iterator<U>[] = arrays.map((arr) => arr[Symbol.iterator]())
    return new MergeSortedIterators(iterators, compare)
  }

  static merge<U>(
    a: Iterable<U>,
    b: Iterable<U>,
    compare?: (a: U, b: U) => number,
  ): U[] {
    const iterators: Iterator<U>[] = [a[Symbol.iterator](), b[Symbol.iterator]()]
    const merger = new MergeSortedIterators(iterators, compare)
    return merger.toArray()
  }
}
