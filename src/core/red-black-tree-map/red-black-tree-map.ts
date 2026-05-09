import type { RBNode, RBTreeMapOptions, RBTreeEntry } from './types.js'
import { Color, defaultComparator } from './types.js'

export class RedBlackTreeMap<K, V> {
  private NIL: RBNode<K, V>
  private root: RBNode<K, V>
  private _size: number = 0
  private compare: (a: K, b: K) => number

  constructor(options?: RBTreeMapOptions<K, V>) {
    this.NIL = { key: undefined as K, value: undefined as V, color: Color.BLACK, left: null as unknown as RBNode<K, V>, right: null as unknown as RBNode<K, V>, parent: null as unknown as RBNode<K, V>, size: 0 }
    this.NIL.left = this.NIL
    this.NIL.right = this.NIL
    this.NIL.parent = this.NIL
    this.root = this.NIL
    this.compare = options?.comparator ?? (defaultComparator as (a: K, b: K) => number)
    if (options?.entries) {
      for (const [key, value] of options.entries) {
        this.set(key, value)
      }
    }
  }

  private isNil(node: RBNode<K, V>): boolean {
    return node === this.NIL
  }

  private makeNode(key: K, value: V): RBNode<K, V> {
    const node: RBNode<K, V> = {
      key,
      value,
      color: Color.RED,
      left: this.NIL,
      right: this.NIL,
      parent: this.NIL,
      size: 1,
    }
    return node
  }

  private updateSize(node: RBNode<K, V>): void {
    if (this.isNil(node)) return
    node.size = 1 + node.left.size + node.right.size
  }

  private updateSizeUp(node: RBNode<K, V>): void {
    let current = node
    while (!this.isNil(current)) {
      this.updateSize(current)
      current = current.parent
    }
  }

  private leftRotate(x: RBNode<K, V>): void {
    const y = x.right
    x.right = y.left
    if (!this.isNil(y.left)) {
      y.left.parent = x
    }
    y.parent = x.parent
    if (this.isNil(x.parent)) {
      this.root = y
    } else if (x === x.parent.left) {
      x.parent.left = y
    } else {
      x.parent.right = y
    }
    y.left = x
    x.parent = y
    this.updateSize(x)
    this.updateSize(y)
  }

  private rightRotate(y: RBNode<K, V>): void {
    const x = y.left
    y.left = x.right
    if (!this.isNil(x.right)) {
      x.right.parent = y
    }
    x.parent = y.parent
    if (this.isNil(y.parent)) {
      this.root = x
    } else if (y === y.parent.right) {
      y.parent.right = x
    } else {
      y.parent.left = x
    }
    x.right = y
    y.parent = x
    this.updateSize(y)
    this.updateSize(x)
  }

  private insertFixup(z: RBNode<K, V>): void {
    while (z.parent.color === Color.RED) {
      if (z.parent === z.parent.parent.left) {
        const y = z.parent.parent.right
        if (y.color === Color.RED) {
          z.parent.color = Color.BLACK
          y.color = Color.BLACK
          z.parent.parent.color = Color.RED
          z = z.parent.parent
        } else {
          if (z === z.parent.right) {
            z = z.parent
            this.leftRotate(z)
          }
          z.parent.color = Color.BLACK
          z.parent.parent.color = Color.RED
          this.rightRotate(z.parent.parent)
        }
      } else {
        const y = z.parent.parent.left
        if (y.color === Color.RED) {
          z.parent.color = Color.BLACK
          y.color = Color.BLACK
          z.parent.parent.color = Color.RED
          z = z.parent.parent
        } else {
          if (z === z.parent.left) {
            z = z.parent
            this.rightRotate(z)
          }
          z.parent.color = Color.BLACK
          z.parent.parent.color = Color.RED
          this.leftRotate(z.parent.parent)
        }
      }
    }
    this.root.color = Color.BLACK
  }

  set(key: K, value: V): void {
    let y = this.NIL
    let x = this.root
    while (!this.isNil(x)) {
      y = x
      const cmp = this.compare(key, x.key)
      if (cmp < 0) {
        x = x.left
      } else if (cmp > 0) {
        x = x.right
      } else {
        x.value = value
        return
      }
    }
    const z = this.makeNode(key, value)
    z.parent = y
    if (this.isNil(y)) {
      this.root = z
    } else if (this.compare(key, y.key) < 0) {
      y.left = z
    } else {
      y.right = z
    }
    this._size++
    this.updateSizeUp(z)
    this.insertFixup(z)
  }

  private findNode(key: K): RBNode<K, V> {
    let current = this.root
    while (!this.isNil(current)) {
      const cmp = this.compare(key, current.key)
      if (cmp === 0) return current
      current = cmp < 0 ? current.left : current.right
    }
    return this.NIL
  }

  get(key: K): V | undefined {
    const node = this.findNode(key)
    return this.isNil(node) ? undefined : node.value
  }

  has(key: K): boolean {
    return !this.isNil(this.findNode(key))
  }

  private transplant(u: RBNode<K, V>, v: RBNode<K, V>): void {
    if (this.isNil(u.parent)) {
      this.root = v
    } else if (u === u.parent.left) {
      u.parent.left = v
    } else {
      u.parent.right = v
    }
    v.parent = u.parent
  }

  private minimum(node: RBNode<K, V>): RBNode<K, V> {
    while (!this.isNil(node.left)) {
      node = node.left
    }
    return node
  }

  private maximum(node: RBNode<K, V>): RBNode<K, V> {
    while (!this.isNil(node.right)) {
      node = node.right
    }
    return node
  }

  private deleteFixup(x: RBNode<K, V>): void {
    while (x !== this.root && x.color === Color.BLACK) {
      if (x === x.parent.left) {
        let w = x.parent.right
        if (w.color === Color.RED) {
          w.color = Color.BLACK
          x.parent.color = Color.RED
          this.leftRotate(x.parent)
          w = x.parent.right
        }
        if (w.left.color === Color.BLACK && w.right.color === Color.BLACK) {
          w.color = Color.RED
          x = x.parent
        } else {
          if (w.right.color === Color.BLACK) {
            w.left.color = Color.BLACK
            w.color = Color.RED
            this.rightRotate(w)
            w = x.parent.right
          }
          w.color = x.parent.color
          x.parent.color = Color.BLACK
          w.right.color = Color.BLACK
          this.leftRotate(x.parent)
          x = this.root
        }
      } else {
        let w = x.parent.left
        if (w.color === Color.RED) {
          w.color = Color.BLACK
          x.parent.color = Color.RED
          this.rightRotate(x.parent)
          w = x.parent.left
        }
        if (w.right.color === Color.BLACK && w.left.color === Color.BLACK) {
          w.color = Color.RED
          x = x.parent
        } else {
          if (w.left.color === Color.BLACK) {
            w.right.color = Color.BLACK
            w.color = Color.RED
            this.leftRotate(w)
            w = x.parent.left
          }
          w.color = x.parent.color
          x.parent.color = Color.BLACK
          w.left.color = Color.BLACK
          this.rightRotate(x.parent)
          x = this.root
        }
      }
    }
    x.color = Color.BLACK
  }

  private deleteNode(z: RBNode<K, V>): void {
    let y = z
    let yOriginalColor = y.color
    let x: RBNode<K, V>
    if (this.isNil(z.left)) {
      x = z.right
      this.transplant(z, z.right)
      this.updateSizeUp(z.parent)
    } else if (this.isNil(z.right)) {
      x = z.left
      this.transplant(z, z.left)
      this.updateSizeUp(z.parent)
    } else {
      y = this.minimum(z.right)
      yOriginalColor = y.color
      x = y.right
      if (y.parent === z) {
        x.parent = y
      } else {
        this.transplant(y, y.right)
        y.right = z.right
        y.right.parent = y
      }
      this.transplant(z, y)
      y.left = z.left
      y.left.parent = y
      y.color = z.color
      this.updateSize(y)
      let p = y.parent
      if (y.parent !== z.parent) {
        while (!this.isNil(p)) {
          this.updateSize(p)
          p = p.parent
        }
      } else {
        this.updateSizeUp(p)
      }
    }
    this._size--
    if (yOriginalColor === Color.BLACK) {
      this.deleteFixup(x)
    }
  }

  delete(key: K): boolean {
    const node = this.findNode(key)
    if (this.isNil(node)) return false
    this.deleteNode(node)
    return true
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = this.NIL
    this._size = 0
  }

  getMin(): RBTreeEntry<K, V> | undefined {
    if (this.isNil(this.root)) return undefined
    const node = this.minimum(this.root)
    return { key: node.key, value: node.value }
  }

  getMax(): RBTreeEntry<K, V> | undefined {
    if (this.isNil(this.root)) return undefined
    const node = this.maximum(this.root)
    return { key: node.key, value: node.value }
  }

  extractMin(): RBTreeEntry<K, V> | undefined {
    if (this.isNil(this.root)) return undefined
    const node = this.minimum(this.root)
    const entry: RBTreeEntry<K, V> = { key: node.key, value: node.value }
    this.deleteNode(node)
    return entry
  }

  extractMax(): RBTreeEntry<K, V> | undefined {
    if (this.isNil(this.root)) return undefined
    const node = this.maximum(this.root)
    const entry: RBTreeEntry<K, V> = { key: node.key, value: node.value }
    this.deleteNode(node)
    return entry
  }

  predecessor(key: K): RBTreeEntry<K, V> | undefined {
    let result: RBNode<K, V> | undefined
    let current = this.root
    while (!this.isNil(current)) {
      const cmp = this.compare(key, current.key)
      if (cmp > 0) {
        result = current
        current = current.right
      } else {
        current = current.left
      }
    }
    return result !== undefined ? { key: result.key, value: result.value } : undefined
  }

  successor(key: K): RBTreeEntry<K, V> | undefined {
    let result: RBNode<K, V> | undefined
    let current = this.root
    while (!this.isNil(current)) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        result = current
        current = current.left
      } else {
        current = current.right
      }
    }
    return result !== undefined ? { key: result.key, value: result.value } : undefined
  }

  private rangeTraversal(node: RBNode<K, V>, start: K, end: K, result: RBTreeEntry<K, V>[]): void {
    if (this.isNil(node)) return
    const cmpStart = this.compare(node.key, start)
    const cmpEnd = this.compare(node.key, end)
    if (cmpStart > 0) {
      this.rangeTraversal(node.left, start, end, result)
    }
    if (cmpStart >= 0 && cmpEnd <= 0) {
      result.push({ key: node.key, value: node.value })
    }
    if (cmpEnd < 0) {
      this.rangeTraversal(node.right, start, end, result)
    }
  }

  range(start: K, end: K): RBTreeEntry<K, V>[] {
    const result: RBTreeEntry<K, V>[] = []
    this.rangeTraversal(this.root, start, end, result)
    return result
  }

  private collectInorder(node: RBNode<K, V>, keys: K[], values: V[], entries: RBTreeEntry<K, V>[]): void {
    if (this.isNil(node)) return
    this.collectInorder(node.left, keys, values, entries)
    keys.push(node.key)
    values.push(node.value)
    entries.push({ key: node.key, value: node.value })
    this.collectInorder(node.right, keys, values, entries)
  }

  keys(): K[] {
    const keys: K[] = []
    const values: V[] = []
    const entries: RBTreeEntry<K, V>[] = []
    this.collectInorder(this.root, keys, values, entries)
    return keys
  }

  values(): V[] {
    const keys: K[] = []
    const values: V[] = []
    const entries: RBTreeEntry<K, V>[] = []
    this.collectInorder(this.root, keys, values, entries)
    return values
  }

  entries(): RBTreeEntry<K, V>[] {
    const keys: K[] = []
    const values: V[] = []
    const entries: RBTreeEntry<K, V>[] = []
    this.collectInorder(this.root, keys, values, entries)
    return entries
  }

  private nodeAtIndex(node: RBNode<K, V>, index: number): RBTreeEntry<K, V> | undefined {
    if (this.isNil(node) || index < 0 || index >= node.size) return undefined
    const leftSize = node.left.size
    if (index < leftSize) {
      return this.nodeAtIndex(node.left, index)
    }
    if (index === leftSize) {
      return { key: node.key, value: node.value }
    }
    return this.nodeAtIndex(node.right, index - leftSize - 1)
  }

  atIndex(index: number): RBTreeEntry<K, V> | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.nodeAtIndex(this.root, index)
  }

  private indexOfNode(node: RBNode<K, V>, key: K): number {
    if (this.isNil(node)) return -1
    const cmp = this.compare(key, node.key)
    if (cmp === 0) return node.left.size
    if (cmp < 0) return this.indexOfNode(node.left, key)
    const rightIdx = this.indexOfNode(node.right, key)
    if (rightIdx === -1) return -1
    return node.left.size + 1 + rightIdx
  }

  indexOf(key: K): number {
    return this.indexOfNode(this.root, key)
  }

  forEach(callback: (entry: RBTreeEntry<K, V>, index: number) => void): void {
    let idx = 0
    const traverse = (node: RBNode<K, V>): void => {
      if (this.isNil(node)) return
      traverse(node.left)
      callback({ key: node.key, value: node.value }, idx++)
      traverse(node.right)
    }
    traverse(this.root)
  }

  *[Symbol.iterator](): Iterator<RBTreeEntry<K, V>> {
    const stack: RBNode<K, V>[] = []
    let current = this.root
    while (!this.isNil(current) || stack.length > 0) {
      while (!this.isNil(current)) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield { key: current.key, value: current.value }
      current = current.right
    }
  }

  toArray(): RBTreeEntry<K, V>[] {
    return this.entries()
  }

  clone(): RedBlackTreeMap<K, V> {
    const result = new RedBlackTreeMap<K, V>({ comparator: this.compare })
    for (const entry of this) {
      result.set(entry.key, entry.value)
    }
    return result
  }

  merge(other: RedBlackTreeMap<K, V>): RedBlackTreeMap<K, V> {
    const result = this.clone()
    for (const entry of other) {
      result.set(entry.key, entry.value)
    }
    return result
  }

  private checkBST(node: RBNode<K, V>, min: K | undefined, max: K | undefined): boolean {
    if (this.isNil(node)) return true
    if (min !== undefined && this.compare(node.key, min) <= 0) return false
    if (max !== undefined && this.compare(node.key, max) >= 0) return false
    return this.checkBST(node.left, min, node.key) && this.checkBST(node.right, node.key, max)
  }

  private checkColors(node: RBNode<K, V>): boolean {
    if (this.isNil(node)) return true
    if (node.color === Color.RED) {
      if (node.left.color === Color.RED || node.right.color === Color.RED) return false
    }
    return this.checkColors(node.left) && this.checkColors(node.right)
  }

  private blackHeight(node: RBNode<K, V>): number {
    if (this.isNil(node)) return 1
    const left = this.blackHeight(node.left)
    const right = this.blackHeight(node.right)
    if (left === -1 || right === -1 || left !== right) return -1
    return node.color === Color.BLACK ? left + 1 : left
  }

  private checkSizes(node: RBNode<K, V>): boolean {
    if (this.isNil(node)) return node.size === 0
    if (node.size !== 1 + node.left.size + node.right.size) return false
    return this.checkSizes(node.left) && this.checkSizes(node.right)
  }

  isValid(): boolean {
    if (this.isNil(this.root)) return true
    if (this.root.color !== Color.BLACK) return false
    if (this.blackHeight(this.root) === -1) return false
    return this.checkColors(this.root) && this.checkBST(this.root, undefined, undefined) && this.checkSizes(this.root)
  }

  private computeHeight(node: RBNode<K, V>): number {
    if (this.isNil(node)) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  getHeight(): number {
    return this.computeHeight(this.root)
  }
}

export { Color, defaultComparator } from './types.js'
export type { RBNode, RBTreeMapOptions, RBTreeEntry } from './types.js'
