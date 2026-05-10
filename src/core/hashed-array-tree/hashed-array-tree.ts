import {
  type HashedArrayTreeOptions,
  type HashedArrayTreeStatistics,
  DEFAULT_HASHED_ARRAY_TREE_OPTIONS,
} from './types.js'

export class HashedArrayTree<T> {
  private leaves: (T[] | undefined)[]
  private _size = 0
  private leafSize: number
  private leafCount: number
  private _resizes = 0
  private growthFactor: number

  constructor(options?: HashedArrayTreeOptions) {
    const opts = { ...DEFAULT_HASHED_ARRAY_TREE_OPTIONS, ...options }
    this.growthFactor = opts.growthFactor
    const cap = Math.max(1, opts.initialCapacity)
    this.leafSize = Math.max(1, Math.ceil(Math.sqrt(cap)))
    this.leafCount = Math.max(1, Math.ceil(cap / this.leafSize))
    this.leaves = new Array(this.leafCount)
    for (let i = 0; i < this.leafCount; i++) {
      this.leaves[i] = new Array<T>(this.leafSize)
    }
  }

  private getLeafAndSlot(index: number): [number, number] {
    const leafIndex = Math.floor(index / this.leafSize)
    const slotIndex = index % this.leafSize
    return [leafIndex, slotIndex]
  }

  private grow(): void {
    this._resizes++
    const newLeafSize = this.leafSize * this.growthFactor
    const newLeafCount = Math.max(1, Math.ceil((this.leafSize * this.leafCount * this.growthFactor) / newLeafSize))
    const newLeaves: (T[] | undefined)[] = new Array(newLeafCount)
    for (let i = 0; i < newLeafCount; i++) {
      newLeaves[i] = new Array<T>(newLeafSize)
    }
    for (let i = 0; i < this._size; i++) {
      const oldLeaf = Math.floor(i / this.leafSize)
      const oldSlot = i % this.leafSize
      const newLeaf = Math.floor(i / newLeafSize)
      const newSlot = i % newLeafSize
      const srcLeaf = this.leaves[oldLeaf]
      const dstLeaf = newLeaves[newLeaf]
      if (srcLeaf && dstLeaf) {
        dstLeaf[newSlot] = srcLeaf[oldSlot]!
      }
    }
    this.leaves = newLeaves
    this.leafSize = newLeafSize
    this.leafCount = newLeafCount
  }

  private shrink(): void {
    if (this.leafSize <= 1) return
    this._resizes++
    const newLeafSize = Math.max(1, Math.floor(this.leafSize / this.growthFactor))
    const newLeafCount = Math.max(1, Math.ceil((this.leafSize * this.leafCount) / newLeafSize / this.growthFactor))
    const newLeaves: (T[] | undefined)[] = new Array(newLeafCount)
    for (let i = 0; i < newLeafCount; i++) {
      newLeaves[i] = new Array<T>(newLeafSize)
    }
    for (let i = 0; i < this._size; i++) {
      const oldLeaf = Math.floor(i / this.leafSize)
      const oldSlot = i % this.leafSize
      const newLeaf = Math.floor(i / newLeafSize)
      const newSlot = i % newLeafSize
      const srcLeaf = this.leaves[oldLeaf]
      const dstLeaf = newLeaves[newLeaf]
      if (srcLeaf && dstLeaf) {
        dstLeaf[newSlot] = srcLeaf[oldSlot]!
      }
    }
    this.leaves = newLeaves
    this.leafSize = newLeafSize
    this.leafCount = newLeafCount
  }

  push(value: T): void {
    const totalCapacity = this.leafSize * this.leafCount
    if (this._size >= totalCapacity) {
      this.grow()
    }
    const [leafIdx] = this.getLeafAndSlot(this._size)
    if (leafIdx >= this.leafCount) {
      this.grow()
    }
    const [li, si] = this.getLeafAndSlot(this._size)
    const leaf = this.leaves[li]
    if (leaf) {
      leaf[si] = value
    }
    this._size++
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    this._size--
    const [leafIdx, slotIdx] = this.getLeafAndSlot(this._size)
    const leaf = this.leaves[leafIdx]
    let value: T | undefined
    if (leaf) {
      value = leaf[slotIdx]
      leaf[slotIdx] = undefined!
    }
    const totalCapacity = this.leafSize * this.leafCount
    if (this._size > 0 && this._size <= totalCapacity / (this.growthFactor * this.growthFactor)) {
      this.shrink()
    }
    return value
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    const [leafIdx, slotIdx] = this.getLeafAndSlot(index)
    const leaf = this.leaves[leafIdx]
    return leaf?.[slotIdx]
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const [leafIdx, slotIdx] = this.getLeafAndSlot(index)
    const leaf = this.leaves[leafIdx]
    if (leaf) {
      leaf[slotIdx] = value
    }
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size}]`)
    }
    if (index === this._size) {
      this.push(value)
      return
    }
    const totalCapacity = this.leafSize * this.leafCount
    if (this._size >= totalCapacity) {
      this.grow()
    }
    for (let i = this._size; i > index; i--) {
      const [dstLeaf, dstSlot] = this.getLeafAndSlot(i)
      const [srcLeaf, srcSlot] = this.getLeafAndSlot(i - 1)
      const dst = this.leaves[dstLeaf]
      const src = this.leaves[srcLeaf]
      if (dst && src) {
        dst[dstSlot] = src[srcSlot]!
      }
    }
    const [leafIdx, slotIdx] = this.getLeafAndSlot(index)
    const leaf = this.leaves[leafIdx]
    if (leaf) {
      leaf[slotIdx] = value
    }
    this._size++
  }

  delete(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    const [leafIdx, slotIdx] = this.getLeafAndSlot(index)
    const leaf = this.leaves[leafIdx]
    const value = leaf?.[slotIdx]
    for (let i = index; i < this._size - 1; i++) {
      const [dstLeaf, dstSlot] = this.getLeafAndSlot(i)
      const [srcLeaf, srcSlot] = this.getLeafAndSlot(i + 1)
      const dst = this.leaves[dstLeaf]
      const src = this.leaves[srcLeaf]
      if (dst && src) {
        dst[dstSlot] = src[srcSlot]!
      }
    }
    this._size--
    const [lastLeaf, lastSlot] = this.getLeafAndSlot(this._size)
    const last = this.leaves[lastLeaf]
    if (last) {
      last[lastSlot] = undefined!
    }
    const totalCapacity = this.leafSize * this.leafCount
    if (this._size > 0 && this._size <= totalCapacity / (this.growthFactor * this.growthFactor)) {
      this.shrink()
    }
    return value
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this.leafSize * this.leafCount
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this.leafCount; i++) {
      const leaf = this.leaves[i]
      if (leaf) {
        for (let j = 0; j < this.leafSize; j++) {
          leaf[j] = undefined!
        }
      }
    }
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = new Array(this._size)
    for (let i = 0; i < this._size; i++) {
      const [leafIdx, slotIdx] = this.getLeafAndSlot(i)
      const leaf = this.leaves[leafIdx]
      if (leaf) {
        result[i] = leaf[slotIdx]!
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number, tree: HashedArrayTree<T>) => void): void {
    for (let i = 0; i < this._size; i++) {
      const [leafIdx, slotIdx] = this.getLeafAndSlot(i)
      const leaf = this.leaves[leafIdx]
      if (leaf) {
        callback(leaf[slotIdx]!, i, this)
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      const [leafIdx, slotIdx] = this.getLeafAndSlot(i)
      const leaf = this.leaves[leafIdx]
      if (leaf) {
        yield leaf[slotIdx]!
      }
    }
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._size; i++) {
      const [leafIdx, slotIdx] = this.getLeafAndSlot(i)
      const leaf = this.leaves[leafIdx]
      if (leaf && leaf[slotIdx] === value) {
        return i
      }
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  map<U>(callback: (value: T, index: number, tree: HashedArrayTree<T>) => U): HashedArrayTree<U> {
    const result = new HashedArrayTree<U>({ initialCapacity: Math.max(16, this._size) })
    for (let i = 0; i < this._size; i++) {
      const [leafIdx, slotIdx] = this.getLeafAndSlot(i)
      const leaf = this.leaves[leafIdx]
      if (leaf) {
        result.push(callback(leaf[slotIdx]!, i, this))
      }
    }
    return result
  }

  filter(callback: (value: T, index: number, tree: HashedArrayTree<T>) => boolean): HashedArrayTree<T> {
    const result = new HashedArrayTree<T>({ initialCapacity: Math.max(16, this._size) })
    for (let i = 0; i < this._size; i++) {
      const [leafIdx, slotIdx] = this.getLeafAndSlot(i)
      const leaf = this.leaves[leafIdx]
      if (leaf && callback(leaf[slotIdx]!, i, this)) {
        result.push(leaf[slotIdx]!)
      }
    }
    return result
  }

  reduce<U>(callback: (accumulator: U, value: T, index: number, tree: HashedArrayTree<T>) => U, initialValue: U): U {
    let acc = initialValue
    for (let i = 0; i < this._size; i++) {
      const [leafIdx, slotIdx] = this.getLeafAndSlot(i)
      const leaf = this.leaves[leafIdx]
      if (leaf) {
        acc = callback(acc, leaf[slotIdx]!, i, this)
      }
    }
    return acc
  }

  slice(start?: number, end?: number): HashedArrayTree<T> {
    const s = start ?? 0
    const e = end ?? this._size
    const actualStart = s < 0 ? Math.max(0, this._size + s) : Math.min(s, this._size)
    const actualEnd = e < 0 ? Math.max(0, this._size + e) : Math.min(e, this._size)
    const result = new HashedArrayTree<T>({ initialCapacity: 16 })
    for (let i = actualStart; i < actualEnd; i++) {
      const val = this.get(i)
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  concat(other: HashedArrayTree<T>): HashedArrayTree<T> {
    const result = new HashedArrayTree<T>({ initialCapacity: Math.max(16, this._size + other.size) })
    for (let i = 0; i < this._size; i++) {
      const val = this.get(i)
      if (val !== undefined) {
        result.push(val)
      }
    }
    for (let i = 0; i < other.size; i++) {
      const val = other.get(i)
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  reverse(): HashedArrayTree<T> {
    for (let i = 0; i < Math.floor(this._size / 2); i++) {
      const j = this._size - 1 - i
      const [li, si] = this.getLeafAndSlot(i)
      const [lj, sj] = this.getLeafAndSlot(j)
      const leafI = this.leaves[li]
      const leafJ = this.leaves[lj]
      if (leafI && leafJ) {
        const tmp = leafI[si]!
        leafI[si] = leafJ[sj]!
        leafJ[sj] = tmp
      }
    }
    return this
  }

  sort(comparator?: (a: T, b: T) => number): HashedArrayTree<T> {
    const arr = this.toArray()
    if (comparator) {
      arr.sort(comparator)
    } else {
      arr.sort()
    }
    this.clear()
    for (const item of arr) {
      this.push(item)
    }
    return this
  }

  reserve(n: number): void {
    const totalCapacity = this.leafSize * this.leafCount
    if (n <= totalCapacity) return
    this._resizes++
    const newLeafSize = Math.max(this.leafSize, Math.max(1, Math.ceil(Math.sqrt(n))))
    const newLeafCount = Math.max(1, Math.ceil(n / newLeafSize))
    const newLeaves: (T[] | undefined)[] = new Array(newLeafCount)
    for (let i = 0; i < newLeafCount; i++) {
      newLeaves[i] = new Array<T>(newLeafSize)
    }
    for (let i = 0; i < this._size; i++) {
      const oldLeaf = Math.floor(i / this.leafSize)
      const oldSlot = i % this.leafSize
      const newLeaf = Math.floor(i / newLeafSize)
      const newSlot = i % newLeafSize
      const srcLeaf = this.leaves[oldLeaf]
      const dstLeaf = newLeaves[newLeaf]
      if (srcLeaf && dstLeaf) {
        dstLeaf[newSlot] = srcLeaf[oldSlot]!
      }
    }
    this.leaves = newLeaves
    this.leafSize = newLeafSize
    this.leafCount = newLeafCount
  }

  shrinkToFit(): void {
    if (this._size === 0) {
      this.leafSize = 1
      this.leafCount = 1
      this.leaves = [new Array<T>(1)]
      return
    }
    this._resizes++
    const newLeafSize = Math.max(1, Math.ceil(Math.sqrt(this._size)))
    const newLeafCount = Math.max(1, Math.ceil(this._size / newLeafSize))
    const newLeaves: (T[] | undefined)[] = new Array(newLeafCount)
    for (let i = 0; i < newLeafCount; i++) {
      newLeaves[i] = new Array<T>(newLeafSize)
    }
    for (let i = 0; i < this._size; i++) {
      const oldLeaf = Math.floor(i / this.leafSize)
      const oldSlot = i % this.leafSize
      const newLeaf = Math.floor(i / newLeafSize)
      const newSlot = i % newLeafSize
      const srcLeaf = this.leaves[oldLeaf]
      const dstLeaf = newLeaves[newLeaf]
      if (srcLeaf && dstLeaf) {
        dstLeaf[newSlot] = srcLeaf[oldSlot]!
      }
    }
    this.leaves = newLeaves
    this.leafSize = newLeafSize
    this.leafCount = newLeafCount
  }

  compact(): void {
    this.shrinkToFit()
  }

  getStatistics(): HashedArrayTreeStatistics {
    const totalCapacity = this.leafSize * this.leafCount
    return {
      resizes: this._resizes,
      totalCapacity,
      wastedSpace: totalCapacity - this._size,
    }
  }

  getWastePercentage(): number {
    const totalCapacity = this.leafSize * this.leafCount
    if (totalCapacity === 0) return 0
    return ((totalCapacity - this._size) / totalCapacity) * 100
  }
}
