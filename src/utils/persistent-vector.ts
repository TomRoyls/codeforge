const BITS = 5
const WIDTH = 1 << BITS
const MASK = WIDTH - 1

type Node<T> = T[] | Node<T>[]

export class PersistentVector<T> {
  private readonly _count: number
  private readonly _shift: number
  private readonly _root: Node<T>
  private readonly _tail: T[]

  private constructor(count: number, shift: number, root: Node<T>, tail: T[]) {
    this._count = count
    this._shift = shift
    this._root = root
    this._tail = tail
  }

  static empty<T>(): PersistentVector<T> {
    return new PersistentVector<T>(0, BITS, [], [])
  }

  static of<T>(...items: T[]): PersistentVector<T> {
    let v = PersistentVector.empty<T>()
    for (const item of items) {
      v = v.push(item)
    }
    return v
  }

  static from<T>(items: Iterable<T>): PersistentVector<T> {
    let v = PersistentVector.empty<T>()
    for (const item of items) {
      v = v.push(item)
    }
    return v
  }

  get count(): number {
    return this._count
  }

  get size(): number {
    return this._count
  }

  get isEmpty(): boolean {
    return this._count === 0
  }

  private tailOffset(): number {
    if (this._count < WIDTH) return 0
    return ((this._count - 1) >>> BITS) << BITS
  }

  private arrayFor(index: number): T[] | Node<T> {
    if (index >= this.tailOffset()) return this._tail
    let node: Node<T> = this._root
    for (let level = this._shift; level > 0; level -= BITS) {
      node = (node as Node<T>[])[(index >>> level) & MASK]!
    }
    return node
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._count) return undefined
    const arr = this.arrayFor(index)
    return (arr as T[])[index & MASK]
  }

  set(index: number, value: T): PersistentVector<T> {
    if (index < 0 || index >= this._count) return this
    if (index >= this.tailOffset()) {
      const newTail = this._tail.slice()
      newTail[index & MASK] = value
      return new PersistentVector(this._count, this._shift, this._root, newTail)
    }
    return new PersistentVector(
      this._count,
      this._shift,
      this.doSet(this._shift, this._root, index, value),
      this._tail,
    )
  }

  private doSet(level: number, node: Node<T>, index: number, value: T): Node<T> {
    const ret = (node as unknown[]).slice() as Node<T>
    if (level === 0) {
      ;(ret as T[])[index & MASK] = value
    } else {
      const subidx = (index >>> level) & MASK
      ;(ret as Node<T>[])[subidx] = this.doSet(
        level - BITS,
        (node as Node<T>[])[subidx]!,
        index,
        value,
      )
    }
    return ret
  }

  push(value: T): PersistentVector<T> {
    if (this._count - this.tailOffset() < WIDTH) {
      const newTail = [...this._tail, value]
      return new PersistentVector(this._count + 1, this._shift, this._root, newTail)
    }
    const tailNode = this._tail
    let newShift = this._shift
    let newRoot: Node<T>
    const overflow = this._count >>> BITS > 1 << this._shift
    if (overflow) {
      newRoot = [this._root, this.newPath(this._shift, tailNode)]
      newShift += BITS
    } else {
      newRoot = this.pushTail(this._shift, this._root, tailNode)
    }
    return new PersistentVector(this._count + 1, newShift, newRoot, [value])
  }

  private pushTail(level: number, parent: Node<T>, tailNode: T[]): Node<T> {
    const subidx = ((this._count - 1) >>> level) & MASK
    const ret = (parent as unknown[]).slice() as Node<T>
    let nodeToInsert: Node<T>
    if (level === BITS) {
      nodeToInsert = tailNode
    } else {
      const child = (parent as Node<T>[])[subidx]
      nodeToInsert = child
        ? this.pushTail(level - BITS, child, tailNode)
        : this.newPath(level - BITS, tailNode)
    }
    ;(ret as Node<T>[])[subidx] = nodeToInsert
    return ret
  }

  private newPath(level: number, node: Node<T>): Node<T> {
    if (level === 0) return node
    return [this.newPath(level - BITS, node)]
  }

  pop(): PersistentVector<T> {
    if (this._count === 0) return this
    if (this._count === 1) return PersistentVector.empty<T>()
    if (this._count - this.tailOffset() > 1) {
      const newTail = this._tail.slice(0, -1)
      return new PersistentVector(this._count - 1, this._shift, this._root, newTail)
    }
    const newTail = this.arrayFor(this._count - 2) as T[]
    const newShiftAndRoot = this.popTail(this._shift, this._root)
    const newShift = newShiftAndRoot.shift
    const newRoot = newShiftAndRoot.root
    if (newRoot.length === 0) {
      return new PersistentVector(
        this._count - 1,
        newShift,
        [],
        (newTail as T[]).slice(),
      )
    }
    return new PersistentVector(this._count - 1, newShift, newRoot, (newTail as T[]).slice())
  }

  private popTail(level: number, node: Node<T>): { shift: number; root: Node<T> } {
    const subidx = ((this._count - 2) >>> level) & MASK
    if (level > BITS) {
      const newChild = this.popTail(level - BITS, (node as Node<T>[])[subidx]!)
      if (newChild.root.length === 0 && subidx === 0) {
        if (level === this._shift) {
          return { shift: level - BITS, root: (node as Node<T>[])[0]! }
        }
        return { shift: this._shift, root: [] }
      }
      const ret = (node as unknown[]).slice() as Node<T>
      ;(ret as Node<T>[])[subidx] = newChild.root
      return { shift: this._shift, root: ret }
    }
    if (subidx === 0) {
      if (level === this._shift) {
        return { shift: level - BITS, root: (node as Node<T>[])[0]! }
      }
      return { shift: this._shift, root: [] }
    }
    const ret = (node as unknown[]).slice() as Node<T>
    ;(ret as Node<T>[]).length = subidx
    return { shift: this._shift, root: ret }
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._count; i++) {
      const val = this.get(i)
      if (val !== undefined) callback(val, i)
    }
  }

  map<U>(callback: (value: T, index: number) => U): PersistentVector<U> {
    let result: PersistentVector<U> = PersistentVector.empty<U>()
    for (let i = 0; i < this._count; i++) {
      const val = this.get(i)
      if (val !== undefined) result = result.push(callback(val, i))
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): PersistentVector<T> {
    let result: PersistentVector<T> = PersistentVector.empty<T>()
    for (let i = 0; i < this._count; i++) {
      const val = this.get(i)
      if (val !== undefined && predicate(val, i)) result = result.push(val)
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: T, index: number) => U, initial: U): U {
    let acc = initial
    for (let i = 0; i < this._count; i++) {
      const val = this.get(i)
      if (val !== undefined) acc = callback(acc, val, i)
    }
    return acc
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    for (let i = 0; i < this._count; i++) {
      const val = this.get(i)
      if (val !== undefined && predicate(val, i)) return val
    }
    return undefined
  }

  findIndex(predicate: (value: T, index: number) => boolean): number {
    for (let i = 0; i < this._count; i++) {
      const val = this.get(i)
      if (val !== undefined && predicate(val, i)) return i
    }
    return -1
  }

  some(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._count; i++) {
      const val = this.get(i)
      if (val !== undefined && predicate(val, i)) return true
    }
    return false
  }

  every(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._count; i++) {
      const val = this.get(i)
      if (val !== undefined && !predicate(val, i)) return false
    }
    return true
  }

  includes(value: T): boolean {
    return this.some((v) => v === value)
  }

  indexOf(value: T): number {
    return this.findIndex((v) => v === value)
  }

  lastIndexOf(value: T): number {
    for (let i = this._count - 1; i >= 0; i--) {
      const val = this.get(i)
      if (val !== undefined && val === value) return i
    }
    return -1
  }

  join(separator: string = ','): string {
    let result = ''
    let first = true
    for (let i = 0; i < this._count; i++) {
      const val = this.get(i)
      if (val !== undefined) {
        if (!first) result += separator
        result += String(val)
        first = false
      }
    }
    return result
  }

  slice(start: number = 0, end?: number): PersistentVector<T> {
    const len = this._count
    const s = start < 0 ? Math.max(0, len + start) : Math.min(start, len)
    const e = end === undefined ? len : end < 0 ? Math.max(0, len + end) : Math.min(end, len)
    let result: PersistentVector<T> = PersistentVector.empty<T>()
    for (let i = s; i < e; i++) {
      const val = this.get(i)
      if (val !== undefined) result = result.push(val)
    }
    return result
  }

  concat(other: PersistentVector<T>): PersistentVector<T> {
    let result: PersistentVector<T> = this
    for (let i = 0; i < other._count; i++) {
      const val = other.get(i)
      if (val !== undefined) result = result.push(val)
    }
    return result
  }

  reverse(): PersistentVector<T> {
    let result: PersistentVector<T> = PersistentVector.empty<T>()
    for (let i = this._count - 1; i >= 0; i--) {
      const val = this.get(i)
      if (val !== undefined) result = result.push(val)
    }
    return result
  }

  sort(compare?: (a: T, b: T) => number): PersistentVector<T> {
    return PersistentVector.from(this.toArray().sort(compare))
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._count; i++) {
      const val = this.get(i)
      if (val !== undefined) result.push(val)
    }
    return result
  }

  [Symbol.iterator](): Iterator<T> {
    let i = 0
    return {
      next: () => {
        if (i >= this._count) return { value: undefined, done: true } as IteratorResult<T>
        const val = this.get(i)
        i++
        return { value: val as T, done: false }
      },
    }
  }

  equals(other: PersistentVector<T>, comparator?: (a: T, b: T) => boolean): boolean {
    if (this._count !== other._count) return false
    const eq = comparator ?? ((a: T, b: T) => a === b)
    for (let i = 0; i < this._count; i++) {
      const a = this.get(i)
      const b = other.get(i)
      if (a === undefined || b === undefined || !eq(a, b)) return false
    }
    return true
  }

  first(): T | undefined {
    return this.get(0)
  }

  last(): T | undefined {
    return this.get(this._count - 1)
  }

  take(n: number): PersistentVector<T> {
    return this.slice(0, n)
  }

  drop(n: number): PersistentVector<T> {
    return this.slice(n)
  }

  update(index: number, updater: (value: T) => T): PersistentVector<T> {
    const val = this.get(index)
    if (val === undefined) return this
    return this.set(index, updater(val))
  }
}
