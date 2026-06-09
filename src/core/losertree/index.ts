import type { Comparator, ForEachCallback, LoserTreeOptions } from './types.js'

const SENTINEL_INDEX = -1

const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class LoserTree<T = number> {
  private _k: number
  private _comparator: Comparator<T>
  private _tree: number[]
  private _runs: (T[])[]
  private _cursors: number[]
  private _initialized: boolean

  constructor(k: number, comparator?: Comparator<T>)
  constructor(k: number, options?: LoserTreeOptions<T>)
  constructor(k: number, arg?: Comparator<T> | LoserTreeOptions<T>) {
    if (k < 1) {
      throw new Error('k must be at least 1')
    }
    this._k = k
    if (typeof arg === 'function') {
      this._comparator = arg
    } else {
      this._comparator = arg?.comparator ?? defaultComparator
    }
    this._tree = new Array<number>(k).fill(SENTINEL_INDEX)
    this._runs = []
    this._cursors = new Array<number>(k).fill(0)
    this._initialized = false
  }

  initialize(runs: T[][]): void {
    if (runs.length !== this._k) {
      throw new Error(`Expected ${this._k} runs, got ${runs.length}`)
    }
    this._runs = runs.map(r => [...r])
    this._cursors = new Array<number>(this._k).fill(0)
    this._tree = new Array<number>(this._k).fill(SENTINEL_INDEX)
    this._buildTree()
    this._initialized = true
  }

  private _firstBeats(a: T | undefined, b: T | undefined): boolean {
    if (a === undefined && b === undefined) return true
    if (a === undefined) return false
    if (b === undefined) return true
    return this._comparator(a, b) <= 0
  }

  private _buildTree(): void {
    const winner = new Array<number>(this._k).fill(SENTINEL_INDEX)

    for (let i = 0; i < this._k; i++) {
      let current = i
      let parent = (i + this._k) >> 1

      while (parent > 0) {
        if (winner[parent] === SENTINEL_INDEX) {
          winner[parent] = current
          break
        }

        const other = winner[parent]!
        const cv = this._peekAt(current)
        const ov = this._peekAt(other)

        if (this._firstBeats(cv, ov)) {
          this._tree[parent] = other
          winner[parent] = current
        } else {
          this._tree[parent] = current
          winner[parent] = other
        }

        current = winner[parent]!
        parent >>= 1
      }

      if (parent === 0) {
        this._tree[0] = current
      }
    }
  }

  private _adjust(leafIndex: number): void {
    let current = leafIndex
    let parent = (current + this._k) >> 1
    while (parent > 0) {
      const stored = this._tree[parent]!
      if (stored === SENTINEL_INDEX) {
        this._tree[parent] = current
      } else {
        const cv = this._peekAt(current)
        const sv = this._peekAt(stored)
        if (this._firstBeats(cv, sv)) {
          this._tree[parent] = stored
        } else {
          this._tree[parent] = current
          current = stored
        }
      }
      parent >>= 1
    }
    this._tree[0] = current
  }

  private _peekAt(runIndex: number): T | undefined {
    const run = this._runs[runIndex]
    if (run === undefined) return undefined
    const cursor = this._cursors[runIndex]!
    if (cursor >= run.length) return undefined
    return run[cursor]
  }

  private _advanceRun(runIndex: number): void {
    this._cursors[runIndex] = this._cursors[runIndex]! + 1
  }

  private _winnerIndex(): number {
    if (!this._initialized) {
      throw new Error('LoserTree not initialized. Call initialize() first.')
    }
    return this._tree[0]!
  }

  next(): T | undefined {
    if (!this._initialized) {
      throw new Error('LoserTree not initialized. Call initialize() first.')
    }
    const winner = this._winnerIndex()
    const val = this._peekAt(winner)
    if (val === undefined) return undefined
    this._advanceRun(winner)
    this._adjust(winner)
    return val
  }

  replaceMin(newElement: T): T | undefined {
    if (!this._initialized) {
      throw new Error('LoserTree not initialized. Call initialize() first.')
    }
    const winner = this._winnerIndex()
    const oldVal = this._peekAt(winner)
    this._runs[winner]![this._cursors[winner]!] = newElement
    this._adjust(winner)
    return oldVal
  }

  get isEmpty(): boolean {
    if (!this._initialized) return true
    const winner = this._tree[0]!
    return this._peekAt(winner) === undefined
  }

  peek(): T | undefined {
    if (!this._initialized) return undefined
    const winner = this._tree[0]!
    return this._peekAt(winner)
  }

  get size(): number {
    return this._k
  }

  get totalElements(): number {
    if (!this._initialized) return 0
    let total = 0
    for (let i = 0; i < this._k; i++) {
      const run = this._runs[i]
      if (run !== undefined) {
        total += Math.max(0, run.length - this._cursors[i]!)
      }
    }
    return total
  }

  get exhaustedRuns(): number {
    if (!this._initialized) return this._k
    let count = 0
    for (let i = 0; i < this._k; i++) {
      const run = this._runs[i]
      if (run === undefined || this._cursors[i]! >= run.length) {
        count++
      }
    }
    return count
  }

  static merge<U>(sortedArrays: U[][], comparator?: Comparator<U>): U[] {
    const k = sortedArrays.length
    if (k === 0) return []
    if (k === 1) return [...sortedArrays[0]!]
    const tree = new LoserTree<U>(k, comparator)
    tree.initialize(sortedArrays)
    const result: U[] = []
    while (!tree.isEmpty) {
      const val = tree.next()
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  update(index: number, value: T): void {
    if (!this._initialized) {
      throw new Error('LoserTree not initialized. Call initialize() first.')
    }
    if (index < 0 || index >= this._k) {
      throw new Error(`Index ${index} out of range [0, ${this._k})`)
    }
    const run = this._runs[index]!
    const cursor = this._cursors[index]!
    const wasExhausted = cursor >= run.length
    if (wasExhausted) {
      run.push(value)
      this._tree = new Array<number>(this._k).fill(SENTINEL_INDEX)
      this._buildTree()
    } else {
      run[cursor] = value
      this._adjust(index)
    }
  }

  reset(runs: T[][]): void {
    this.initialize(runs)
  }

  toArray(): T[] {
    if (!this._initialized) return []
    const result: T[] = []
    const savedCursors = [...this._cursors]
    const savedTree = [...this._tree]
    while (!this.isEmpty) {
      const val = this.next()
      if (val !== undefined) {
        result.push(val)
      }
    }
    this._cursors = savedCursors
    this._tree = savedTree
    return result
  }

  clone(): LoserTree<T> {
    const copy = new LoserTree<T>(this._k, this._comparator)
    if (this._initialized) {
      const runsCopy = this._runs.map((run, idx) => {
        return run.slice(this._cursors[idx]!)
      })
      copy.initialize(runsCopy)
    }
    return copy
  }

  forEach(callback: ForEachCallback<T>): void {
    if (!this._initialized) return
    let idx = 0
    const savedCursors = [...this._cursors]
    const savedTree = [...this._tree]
    while (!this.isEmpty) {
      const val = this.next()
      if (val !== undefined) {
        callback(val, idx++)
      }
    }
    this._cursors = savedCursors
    this._tree = savedTree
  }

  *[Symbol.iterator](): Iterator<T> {
    if (!this._initialized) return
    const savedCursors = [...this._cursors]
    const savedTree = [...this._tree]
    while (!this.isEmpty) {
      const val = this.next()
      if (val !== undefined) {
        yield val
      }
    }
    this._cursors = savedCursors
    this._tree = savedTree
  }

  toString(): string {
    return `LoserTree({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'LoserTree', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }
}

export type { Comparator, ForEachCallback, LoserTreeOptions } from './types.js'
