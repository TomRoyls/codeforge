export interface BPlusLeafNode<K, V> {
  keys: K[]
  values: V[]
  next: BPlusLeafNode<K, V> | null
  leaf: true
}

export interface BPlusInternalNode<K, V> {
  keys: K[]
  children: BPlusNode<K, V>[]
  leaf: false
}

export type BPlusNode<K, V> = BPlusLeafNode<K, V> | BPlusInternalNode<K, V>

export class BPlusTree<K, V> {
  private root: BPlusNode<K, V>
  private order: number
  private compare: (a: K, b: K) => number
  private _size: number
  private _height: number

  constructor(order?: number, comparator?: (a: K, b: K) => number) {
    this.order = order ?? 32
    this.compare =
      comparator ?? ((a: K, b: K): number => (a as number) - (b as number))
    this.root = { keys: [], values: [], next: null, leaf: true }
    this._size = 0
    this._height = 0
  }

  private get maxKeys(): number {
    return this.order - 1
  }

  private get minKeys(): number {
    return Math.ceil(this.order / 2) - 1
  }

  private isInternal(node: BPlusNode<K, V>): node is BPlusInternalNode<K, V> {
    return node.leaf === false
  }

  private asLeaf(node: BPlusNode<K, V>): BPlusLeafNode<K, V> {
    return node as BPlusLeafNode<K, V>
  }

  private asInternal(node: BPlusNode<K, V>): BPlusInternalNode<K, V> {
    return node as BPlusInternalNode<K, V>
  }

  insert(key: K, value: V): void {
    if (this.root.keys.length >= this.maxKeys) {
      const oldRoot = this.root
      const newRoot: BPlusInternalNode<K, V> = {
        keys: [],
        children: [oldRoot],
        leaf: false,
      }
      this.root = newRoot
      this._height++
      this.splitChild(newRoot, 0)
      this.insertNonFull(newRoot, key, value)
    } else {
      this.insertNonFull(this.root, key, value)
    }
  }

  private splitChild(parent: BPlusInternalNode<K, V>, idx: number): void {
    const child = parent.children[idx]!
    if (child.leaf) {
      this.splitLeafChild(parent, idx, child as BPlusLeafNode<K, V>)
    } else {
      this.splitInternalChild(parent, idx, child as BPlusInternalNode<K, V>)
    }
  }

  private splitLeafChild(
    parent: BPlusInternalNode<K, V>,
    idx: number,
    leaf: BPlusLeafNode<K, V>,
  ): void {
    const mid = Math.ceil(leaf.keys.length / 2)
    const newLeaf: BPlusLeafNode<K, V> = {
      keys: leaf.keys.splice(mid),
      values: leaf.values.splice(mid),
      next: leaf.next,
      leaf: true,
    }
    leaf.next = newLeaf
    parent.keys.splice(idx, 0, newLeaf.keys[0]!)
    parent.children.splice(idx + 1, 0, newLeaf)
  }

  private splitInternalChild(
    parent: BPlusInternalNode<K, V>,
    idx: number,
    node: BPlusInternalNode<K, V>,
  ): void {
    const mid = Math.floor(node.keys.length / 2)
    const promotedKey = node.keys[mid]
    const sibling: BPlusInternalNode<K, V> = {
      keys: node.keys.splice(mid + 1),
      children: node.children.splice(mid + 1),
      leaf: false,
    }
    node.keys.splice(mid)
    parent.keys.splice(idx, 0, promotedKey!)
    parent.children.splice(idx + 1, 0, sibling)
  }

  private insertNonFull(node: BPlusNode<K, V>, key: K, value: V): void {
    if (node.leaf) {
      this.insertIntoLeaf(node as BPlusLeafNode<K, V>, key, value)
      return
    }
    const internal = node as BPlusInternalNode<K, V>
    let i = 0
    while (i < internal.keys.length && this.compare(key, internal.keys[i]!) >= 0) i++
    const child = internal.children[i]!
    if (child.keys.length >= this.maxKeys) {
      this.splitChild(internal, i)
      if (this.compare(key, internal.keys[i]!) >= 0) i++
    }
    this.insertNonFull(internal.children[i]!, key, value)
  }

  private insertIntoLeaf(leaf: BPlusLeafNode<K, V>, key: K, value: V): void {
    let i = 0
    while (i < leaf.keys.length && this.compare(key, leaf.keys[i]!) > 0) i++
    if (i < leaf.keys.length && this.compare(key, leaf.keys[i]!) === 0) {
      leaf.values[i] = value
      return
    }
    leaf.keys.splice(i, 0, key)
    leaf.values.splice(i, 0, value)
    this._size++
  }

  get(key: K): V | undefined {
    const leaf = this.findLeaf(key)
    if (!leaf) return undefined
    for (let i = 0; i < leaf.keys.length; i++) {
      if (this.compare(key, leaf.keys[i]!) === 0) return leaf.values[i]!
    }
    return undefined
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  private findLeaf(key: K): BPlusLeafNode<K, V> | null {
    let node = this.root
    while (this.isInternal(node)) {
      let i = 0
      while (i < node.keys.length && this.compare(key, node.keys[i]!) >= 0) i++
      node = node.children[i]!
    }
    return this.asLeaf(node)
  }

  delete(key: K): boolean {
    if (this._size === 0) return false
    if (!this.has(key)) return false
    this.deleteFromNode(this.root, key)
    this._size--
    if (this.isInternal(this.root) && this.root.keys.length === 0) {
      this.root = this.root.children[0]!
      this._height--
    }
    return true
  }

  private deleteFromNode(node: BPlusNode<K, V>, key: K): void {
    if (node.leaf) {
      this.deleteFromLeaf(this.asLeaf(node), key)
      return
    }
    const internal = this.asInternal(node)
    let i = 0
    while (i < internal.keys.length && this.compare(key, internal.keys[i]!) >= 0) i++
    const child = internal.children[i]!
    if (child.leaf) {
      this.deleteFromLeaf(this.asLeaf(child), key)
      this.fixAfterLeafDelete(internal, i)
    } else {
      this.deleteFromNode(child, key)
      this.fixAfterInternalDelete(internal, i)
    }
    if (
      this.isInternal(this.root) &&
      this.root.keys.length === 0 &&
      this.root.children.length === 1
    ) {
      this.root = this.root.children[0]!
      this._height--
    }
  }

  private deleteFromLeaf(leaf: BPlusLeafNode<K, V>, key: K): void {
    for (let i = 0; i < leaf.keys.length; i++) {
      if (this.compare(key, leaf.keys[i]!) === 0) {
        leaf.keys.splice(i, 1)
        leaf.values.splice(i, 1)
        return
      }
    }
  }

  private fixAfterLeafDelete(
    parent: BPlusInternalNode<K, V>,
    childIdx: number,
  ): void {
    const child = this.asLeaf(parent.children[childIdx]!)
    if (child.keys.length >= this.minKeys || parent.children.length <= 1) return
    if (childIdx > 0) {
      const left = this.asLeaf(parent.children[childIdx - 1]!)
      if (left.keys.length > this.minKeys) {
        this.borrowFromLeftLeaf(parent, childIdx)
        return
      }
    }
    if (childIdx < parent.children.length - 1) {
      const right = this.asLeaf(parent.children[childIdx + 1]!)
      if (right.keys.length > this.minKeys) {
        this.borrowFromRightLeaf(parent, childIdx)
        return
      }
    }
    if (childIdx > 0) {
      this.mergeLeaves(parent, childIdx - 1)
    } else {
      this.mergeLeaves(parent, childIdx)
    }
  }

  private borrowFromLeftLeaf(
    parent: BPlusInternalNode<K, V>,
    childIdx: number,
  ): void {
    const child = this.asLeaf(parent.children[childIdx]!)
    const left = this.asLeaf(parent.children[childIdx - 1]!)
    const k = left.keys.pop()!
    const v = left.values.pop()!
    child.keys.unshift(k)
    child.values.unshift(v)
    parent.keys[childIdx - 1] = child.keys[0]!
  }

  private borrowFromRightLeaf(
    parent: BPlusInternalNode<K, V>,
    childIdx: number,
  ): void {
    const child = this.asLeaf(parent.children[childIdx]!)
    const right = this.asLeaf(parent.children[childIdx + 1]!)
    const k = right.keys.shift()!
    const v = right.values.shift()!
    child.keys.push(k)
    child.values.push(v)
    parent.keys[childIdx] = right.keys[0]!
  }

  private mergeLeaves(
    parent: BPlusInternalNode<K, V>,
    leftIdx: number,
  ): void {
    const left = this.asLeaf(parent.children[leftIdx]!)
    const right = this.asLeaf(parent.children[leftIdx + 1]!)
    left.keys.push(...right.keys)
    left.values.push(...right.values)
    left.next = right.next
    parent.keys.splice(leftIdx, 1)
    parent.children.splice(leftIdx + 1, 1)
  }

  private fixAfterInternalDelete(
    parent: BPlusInternalNode<K, V>,
    childIdx: number,
  ): void {
    const child = this.asInternal(parent.children[childIdx]!)
    if (child.keys.length >= this.minKeys || parent.children.length <= 1) return
    if (childIdx > 0) {
      const left = this.asInternal(parent.children[childIdx - 1]!)
      if (left.keys.length > this.minKeys) {
        this.borrowFromLeftInternal(parent, childIdx)
        return
      }
    }
    if (childIdx < parent.children.length - 1) {
      const right = this.asInternal(parent.children[childIdx + 1]!)
      if (right.keys.length > this.minKeys) {
        this.borrowFromRightInternal(parent, childIdx)
        return
      }
    }
    if (childIdx > 0) {
      this.mergeInternal(parent, childIdx - 1)
    } else {
      this.mergeInternal(parent, childIdx)
    }
  }

  private borrowFromLeftInternal(
    parent: BPlusInternalNode<K, V>,
    childIdx: number,
  ): void {
    const child = this.asInternal(parent.children[childIdx]!)
    const left = this.asInternal(parent.children[childIdx - 1]!)
    const sep = parent.keys[childIdx - 1]
    parent.keys[childIdx - 1] = left.keys.pop()!
    child.keys.unshift(sep!)
    child.children.unshift(left.children.pop()!)
  }

  private borrowFromRightInternal(
    parent: BPlusInternalNode<K, V>,
    childIdx: number,
  ): void {
    const child = this.asInternal(parent.children[childIdx]!)
    const right = this.asInternal(parent.children[childIdx + 1]!)
    const sep = parent.keys[childIdx]
    parent.keys[childIdx] = right.keys.shift()!
    child.keys.push(sep!)
    child.children.push(right.children.shift()!)
  }

  private mergeInternal(
    parent: BPlusInternalNode<K, V>,
    leftIdx: number,
  ): void {
    const left = this.asInternal(parent.children[leftIdx]!)
    const right = this.asInternal(parent.children[leftIdx + 1]!)
    left.keys.push(parent.keys[leftIdx]!)
    left.keys.push(...right.keys)
    left.children.push(...right.children)
    parent.keys.splice(leftIdx, 1)
    parent.children.splice(leftIdx + 1, 1)
  }

  range(min: K, max: K): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = []
    if (this._size === 0) return result
    if (this.compare(min, max) > 0) return result
    let leaf = this.findLeaf(min)
    while (leaf !== null) {
      for (let i = 0; i < leaf.keys.length; i++) {
        const cmpLo = this.compare(leaf.keys[i]!, min)
        const cmpHi = this.compare(leaf.keys[i]!, max)
        if (cmpLo >= 0 && cmpHi <= 0) {
          result.push({ key: leaf.keys[i]!, value: leaf.values[i]! })
        }
        if (cmpHi > 0) return result
      }
      leaf = leaf.next
    }
    return result
  }

  min(): K | undefined {
    if (this._size === 0) return undefined
    let node = this.root
    while (this.isInternal(node)) node = node.children[0]!
    return this.asLeaf(node).keys[0]!
  }

  max(): K | undefined {
    if (this._size === 0) return undefined
    let node = this.root
    while (this.isInternal(node)) node = node.children[node.children.length - 1]!
    const leaf = this.asLeaf(node)
    return leaf.keys[leaf.keys.length - 1]!
  }

  get size(): number {
    return this._size
  }

  get height(): number {
    return this._height
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = { keys: [], values: [], next: null, leaf: true }
    this._size = 0
    this._height = 0
  }

  keys(): K[] {
    const result: K[] = []
    let leaf = this.getLeftmostLeaf()
    while (leaf !== null) {
      for (let i = 0; i < leaf.keys.length; i++) result.push(leaf.keys[i]!)
      leaf = leaf.next
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    let leaf = this.getLeftmostLeaf()
    while (leaf !== null) {
      for (let i = 0; i < leaf.values.length; i++) result.push(leaf.values[i]!)
      leaf = leaf.next
    }
    return result
  }

  entries(): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = []
    let leaf = this.getLeftmostLeaf()
    while (leaf !== null) {
      for (let i = 0; i < leaf.keys.length; i++) {
        result.push({ key: leaf.keys[i]!, value: leaf.values[i]! })
      }
      leaf = leaf.next
    }
    return result
  }

  private getLeftmostLeaf(): BPlusLeafNode<K, V> | null {
    let node = this.root
    while (this.isInternal(node)) node = node.children[0]!
    return this.asLeaf(node)
  }

  toString(): string {
    return `BPlusTree(order=${this.order}, size=${this._size}, height=${this._height})`
  }

  toJSON(): Array<{ key: K; value: V }> {
    return this.entries()
  }

  clone(): this {
    const c = new BPlusTree<K, V>(this.order, this.compare)
    for (const { key, value } of this.entries()) {
      c.insert(key, value)
    }
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BPlusTree)) return false
    if (this._size !== other._size) return false
    const a = this.entries()
    const b = other.entries()
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i]!.key, b[i]!.key)) return false
      if (!Object.is(a[i]!.value, b[i]!.value)) return false
    }
    return true
  }
}
