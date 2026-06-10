import type { BTreeSetOptions } from './types.js'

export type { BTreeSetOptions } from './types.js'

class BTreeNode<T> {
  keys: T[] = []
  children: BTreeNode<T>[] = []
  leaf: boolean = true
}

export class BTreeSet<T> {
  private root: BTreeNode<T>
  private order: number
  private compare: (a: T, b: T) => number
  private _size: number = 0

  constructor(options?: BTreeSetOptions<T>) {
    this.order = options?.order ?? 4
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
    this.root = new BTreeNode<T>()
  }

  add(item: T): boolean {
    if (this.has(item)) return false
    if (this.root.keys.length === this.order - 1) {
      const newRoot = new BTreeNode<T>()
      newRoot.leaf = false
      newRoot.children.push(this.root)
      this.splitChild(newRoot, 0)
      this.root = newRoot
      this.insertNonFull(this.root, item)
    } else {
      this.insertNonFull(this.root, item)
    }
    this._size++
    return true
  }

  private insertNonFull(node: BTreeNode<T>, item: T): void {
    let i = node.keys.length - 1
    if (node.leaf) {
      while (i >= 0 && this.compare(item, node.keys[i]!) < 0) {
        i--
      }
      node.keys.splice(i + 1, 0, item)
    } else {
      while (i >= 0 && this.compare(item, node.keys[i]!) < 0) {
        i--
      }
      i++
      if (node.children[i]!.keys.length === this.order - 1) {
        this.splitChild(node, i)
        if (this.compare(item, node.keys[i]!) > 0) {
          i++
        }
      }
      this.insertNonFull(node.children[i]!, item)
    }
  }

  private splitChild(parent: BTreeNode<T>, index: number): void {
    const child = parent.children[index]!
    const newNode = new BTreeNode<T>()
    newNode.leaf = child.leaf
    const mid = Math.floor((this.order - 1) / 2)
    const midKey = child.keys[mid]!
    newNode.keys = child.keys.splice(mid + 1)
    child.keys.splice(mid)
    if (!child.leaf) {
      newNode.children = child.children.splice(mid + 1)
    }
    parent.keys.splice(index, 0, midKey)
    parent.children.splice(index + 1, 0, newNode)
  }

  has(item: T): boolean {
    return this.search(this.root, item)
  }

  private search(node: BTreeNode<T>, item: T): boolean {
    let i = 0
    while (i < node.keys.length && this.compare(item, node.keys[i]!) > 0) {
      i++
    }
    if (i < node.keys.length && this.compare(item, node.keys[i]!) === 0) {
      return true
    }
    if (node.leaf) return false
    return this.search(node.children[i]!, item)
  }

  delete(item: T): boolean {
    if (!this.has(item)) return false
    this.removeKey(this.root, item)
    this._size--
    if (this.root.keys.length === 0 && !this.root.leaf) {
      this.root = this.root.children[0]!
    }
    return true
  }

  private removeKey(node: BTreeNode<T>, key: T): void {
    const idx = this.findKeyIndex(node, key)
    if (idx < node.keys.length && this.compare(node.keys[idx]!, key) === 0) {
      if (node.leaf) {
        node.keys.splice(idx, 1)
      } else {
        this.removeFromInternal(node, idx)
      }
    } else {
      if (node.leaf) return
      const t = Math.ceil(this.order / 2)
      const isLast = idx === node.keys.length
      if (node.children[idx]!.keys.length < t) {
        this.ensureMinKeys(node, idx)
      }
      const childIdx = isLast && idx > node.keys.length ? idx - 1 : idx
      this.removeKey(node.children[childIdx]!, key)
    }
  }

  private findKeyIndex(node: BTreeNode<T>, item: T): number {
    let idx = 0
    while (idx < node.keys.length && this.compare(node.keys[idx]!, item) < 0) {
      idx++
    }
    return idx
  }

  private removeFromInternal(node: BTreeNode<T>, idx: number): void {
    const key = node.keys[idx]!
    const t = Math.ceil(this.order / 2)
    const leftChild = node.children[idx]!
    const rightChild = node.children[idx + 1]!
    if (leftChild.keys.length >= t) {
      const pred = this.getPredecessor(leftChild)
      node.keys.splice(idx, 1, pred)
      this.removeKey(leftChild, pred)
    } else if (rightChild.keys.length >= t) {
      const succ = this.getSuccessor(rightChild)
      node.keys.splice(idx, 1, succ)
      this.removeKey(rightChild, succ)
    } else {
      this.mergeChildren(node, idx)
      this.removeKey(node.children[idx]!, key)
    }
  }

  private getPredecessor(node: BTreeNode<T>): T {
    while (!node.leaf) {
      const lastChild = node.children[node.children.length - 1]!
      if (lastChild.keys.length === 0 && lastChild.leaf) {
        break
      }
      node = lastChild
    }
    return node.keys[node.keys.length - 1]!
  }

  private getSuccessor(node: BTreeNode<T>): T {
    while (!node.leaf) {
      const firstChild = node.children[0]!
      if (firstChild.keys.length === 0 && firstChild.leaf) {
        break
      }
      node = firstChild
    }
    return node.keys[0]!
  }

  private ensureMinKeys(parent: BTreeNode<T>, idx: number): void {
    const t = Math.ceil(this.order / 2)
    if (idx > 0 && parent.children[idx - 1]!.keys.length >= t) {
      this.borrowFromLeft(parent, idx)
    } else if (
      idx < parent.children.length - 1 &&
      parent.children[idx + 1]!.keys.length >= t
    ) {
      this.borrowFromRight(parent, idx)
    } else if (idx < parent.children.length - 1) {
      this.mergeChildren(parent, idx)
    } else {
      this.mergeChildren(parent, idx - 1)
    }
  }

  private borrowFromLeft(parent: BTreeNode<T>, idx: number): void {
    const child = parent.children[idx]!
    const sibling = parent.children[idx - 1]!
    const parentKey = parent.keys[idx - 1]!
    const siblingKey = sibling.keys.pop()!
    parent.keys.splice(idx - 1, 1, siblingKey)
    child.keys.unshift(parentKey)
    if (!child.leaf && sibling.children.length > 0) {
      child.children.unshift(sibling.children.pop()!)
    }
  }

  private borrowFromRight(parent: BTreeNode<T>, idx: number): void {
    const child = parent.children[idx]!
    const sibling = parent.children[idx + 1]!
    const parentKey = parent.keys[idx]!
    const siblingKey = sibling.keys.shift()!
    parent.keys.splice(idx, 1, siblingKey)
    child.keys.push(parentKey)
    if (!child.leaf && sibling.children.length > 0) {
      child.children.push(sibling.children.shift()!)
    }
  }

  private mergeChildren(parent: BTreeNode<T>, idx: number): void {
    const left = parent.children[idx]!
    const right = parent.children[idx + 1]!
    left.keys.push(parent.keys[idx]!)
    left.keys.push(...right.keys)
    if (!left.leaf) {
      left.children.push(...right.children)
    }
    parent.keys.splice(idx, 1)
    parent.children.splice(idx + 1, 1)
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = new BTreeNode<T>()
    this._size = 0
  }

  min(): T | undefined {
    if (this._size === 0) return undefined
    let node = this.root
    while (!node.leaf) {
      node = node.children[0]!
    }
    return node.keys[0]!
  }

  max(): T | undefined {
    if (this._size === 0) return undefined
    let node = this.root
    while (!node.leaf) {
      node = node.children[node.children.length - 1]!
    }
    return node.keys[node.keys.length - 1]!
  }

  toArray(): T[] {
    const result: T[] = []
    this.collectInorder(this.root, result)
    return result
  }

  private collectInorder(node: BTreeNode<T>, result: T[]): void {
    if (node.leaf) {
      for (let i = 0; i < node.keys.length; i++) {
        result.push(node.keys[i]!)
      }
      return
    }
    for (let i = 0; i < node.keys.length; i++) {
      this.collectInorder(node.children[i]!, result)
      result.push(node.keys[i]!)
    }
    this.collectInorder(node.children[node.keys.length]!, result)
  }

  forEach(callback: (item: T) => void): void {
    this.forEachInorder(this.root, callback)
  }

  private forEachInorder(node: BTreeNode<T>, callback: (item: T) => void): void {
    if (node.leaf) {
      for (const key of node.keys) {
        callback(key)
      }
      return
    }
    for (let i = 0; i < node.keys.length; i++) {
      this.forEachInorder(node.children[i]!, callback)
      callback(node.keys[i]!)
    }
    this.forEachInorder(node.children[node.keys.length]!, callback)
  }

  [Symbol.iterator](): Iterator<T> {
    if (this._size === 0) {
      return { next: () => ({ value: undefined as unknown as T, done: true }) };
    }

    const stack: Array<{ node: BTreeNode<T>; keyIdx: number; childVisited: boolean }> = [];

    const pushLeftmost = (node: BTreeNode<T>): void => {
      let n = node;
      while (true) {
        stack.push({ node: n, keyIdx: 0, childVisited: false });
        if (n.leaf || !n.children[0]) break;
        n = n.children[0]!;
      }
    };

    pushLeftmost(this.root);

    return {
      next(): IteratorResult<T> {
        while (stack.length > 0) {
          const frame = stack[stack.length - 1]!;
          const { node } = frame;

          if (node.leaf) {
            if (frame.keyIdx < node.keys.length) {
              const value = node.keys[frame.keyIdx]!;
              frame.keyIdx++;
              return { value, done: false };
            }
            stack.pop();
            continue;
          }

          if (!frame.childVisited) {
            frame.childVisited = true;
            const child = node.children[frame.keyIdx];
            if (child) {
              pushLeftmost(child);
              continue;
            }
          }

          if (frame.keyIdx < node.keys.length) {
            const value = node.keys[frame.keyIdx]!;
            frame.keyIdx++;
            frame.childVisited = false;
            return { value, done: false };
          }

          stack.pop();
        }

        return { value: undefined as unknown as T, done: true };
      },
    };
  }

  range(min: T, max: T): T[] {
    const result: T[] = []
    this.collectRange(this.root, min, max, result)
    return result
  }

  private collectRange(node: BTreeNode<T>, min: T, max: T, result: T[]): void {
    if (node.leaf) {
      for (const key of node.keys) {
        if (this.compare(key, min) >= 0 && this.compare(key, max) <= 0) {
          result.push(key)
        }
      }
      return
    }
    let i = 0
    while (i < node.keys.length && this.compare(node.keys[i]!, min) < 0) {
      i++
    }
    if (!node.leaf && i < node.children.length) {
      this.collectRange(node.children[i]!, min, max, result)
    }
    while (i < node.keys.length) {
      const key = node.keys[i]!
      const cmpMax = this.compare(key, max)
      if (cmpMax > 0) return
      result.push(key)
      i++
      if (!node.leaf && i < node.children.length) {
        this.collectRange(node.children[i]!, min, max, result)
      }
    }
  }

  lowerBound(item: T): T | undefined {
    return this.findLowerBound(this.root, item)
  }

  private findLowerBound(node: BTreeNode<T>, item: T): T | undefined {
    let i = 0
    while (i < node.keys.length && this.compare(node.keys[i]!, item) < 0) {
      i++
    }
    if (i < node.keys.length && this.compare(node.keys[i]!, item) >= 0) {
      if (node.leaf) return node.keys[i]!
      const childResult = this.findLowerBound(node.children[i]!, item)
      if (childResult !== undefined) return childResult
      return node.keys[i]!
    }
    if (node.leaf) return undefined
    return this.findLowerBound(node.children[i]!, item)
  }

  upperBound(item: T): T | undefined {
    return this.findUpperBound(this.root, item)
  }

  private findUpperBound(node: BTreeNode<T>, item: T): T | undefined {
    let i = 0
    while (i < node.keys.length && this.compare(node.keys[i]!, item) <= 0) {
      i++
    }
    if (i < node.keys.length) {
      if (node.leaf) return node.keys[i]!
      const childResult = this.findUpperBound(node.children[i]!, item)
      if (childResult !== undefined) return childResult
      return node.keys[i]!
    }
    if (node.leaf) return undefined
    return this.findUpperBound(node.children[i]!, item)
  }

  union(other: BTreeSet<T>): BTreeSet<T> {
    const result = new BTreeSet<T>({
      order: this.order,
      comparator: this.compare,
    })
    for (const item of this) {
      result.add(item)
    }
    for (const item of other) {
      result.add(item)
    }
    return result
  }

  intersection(other: BTreeSet<T>): BTreeSet<T> {
    const result = new BTreeSet<T>({
      order: this.order,
      comparator: this.compare,
    })
    for (const item of this) {
      if (other.has(item)) {
        result.add(item)
      }
    }
    return result
  }

  difference(other: BTreeSet<T>): BTreeSet<T> {
    const result = new BTreeSet<T>({
      order: this.order,
      comparator: this.compare,
    })
    for (const item of this) {
      if (!other.has(item)) {
        result.add(item)
      }
    }
    return result
  }

  isSubsetOf(other: BTreeSet<T>): boolean {
    for (const item of this) {
      if (!other.has(item)) return false
    }
    return true
  }

  clone(): BTreeSet<T> {
    const result = new BTreeSet<T>({
      order: this.order,
      comparator: this.compare,
    })
    for (const item of this) {
      result.add(item)
    }
    return result
  }

  toString(): string {
    return `${BTreeSet}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'BTreeSet', items: this.toArray() }
  }

  map<R>(fn: (item: T) => R): R[] {
    return this.toArray().map(fn)
  }

  filter(fn: (item: T) => boolean): T[] {
    return this.toArray().filter(fn)
  }

  reduce<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduce(fn, initial)
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
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

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  tap(fn: (collection: BTreeSet<T>) => void): BTreeSet<T> {
    fn(this)
    return this
  }

  equals(other: BTreeSet<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  zip<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: [T, U][] = []
    for (let i = 0; i < len; i++) {
      result.push([a[i]!, b[i]!])
    }
    return result
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  static empty<T>(): BTreeSet<T> {
    return new BTreeSet<T>()
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: Iterable<T>): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }

  pluck<K extends keyof T>(key: K): T[K][] {
    return this.toArray().map(item => item[key])
  }

  nth(n: number): T | undefined {
    return this.at(n - 1)
  }

  reduceRight<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduceRight(fn, initial)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  static from<T>(items: T[]): BTreeSet<T> {
    const instance = new BTreeSet<T>()
    for (const item of items) {
      instance.add(item)
    }
    return instance
  }

  static of<T>(...items: T[]): BTreeSet<T> {
    return BTreeSet.from(items)
  }


  toReversed(): T[] {
    return [...this.toArray()].reverse()
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  toSpliced(start: number, deleteCount?: number): T[] {
    const arr = this.toArray()
    arr.splice(start, deleteCount ?? arr.length - start)
    return arr
  }

  with(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    arr[index] = value
    return arr
  }

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  filterMap<U>(fn: (item: T) => U | undefined): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      const mapped = fn(item)
      if (mapped !== undefined) {
        result.push(mapped)
      }
    }
    return result
  }

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
  }

  distinctBy<K>(keyFn: (item: T) => K): T[] {
    const seen = new Set<K>()
    const result: T[] = []
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!seen.has(key)) {
        seen.add(key)
        result.push(item)
      }
    }
    return result
  }

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  pipe<U>(transform: (items: T[]) => U[]): U[] {
    return transform(this.toArray())
  }

  reduceWhile<U>(
    predicate: (acc: U) => boolean,
    reducer: (acc: U, item: T) => U,
    initialValue: U
  ): U {
    let acc = initialValue
    for (const item of this.toArray()) {
      if (!predicate(acc)) break
      acc = reducer(acc, item)
    }
    return acc
  }

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
  }

  shuffle(): T[] {
    const arr = [...this.toArray()]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = arr[i]!
      arr[i] = arr[j]!
      arr[j] = tmp
    }
    return arr
  }
}
