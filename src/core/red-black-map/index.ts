import type { RBColor, RBNode, CompareFunction, RedBlackMapOptions } from './types.js'

export class RedBlackMap<K, V> {
  private root: RBNode<K, V> | null = null
  private _size: number = 0
  private compare: CompareFunction<K>

  constructor(entries?: Iterable<[K, V]>, options?: RedBlackMapOptions<K>) {
    this.compare =
      options?.compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value)
      }
    }
  }

  private leftRotate(x: RBNode<K, V>): void {
    const y = x.right!
    x.right = y.left
    if (y.left !== null) {
      y.left.parent = x
    }
    y.parent = x.parent
    if (x.parent === null) {
      this.root = y
    } else if (x === x.parent.left) {
      x.parent.left = y
    } else {
      x.parent.right = y
    }
    y.left = x
    x.parent = y
  }

  private rightRotate(y: RBNode<K, V>): void {
    const x = y.left!
    y.left = x.right
    if (x.right !== null) {
      x.right.parent = y
    }
    x.parent = y.parent
    if (y.parent === null) {
      this.root = x
    } else if (y === y.parent.right) {
      y.parent.right = x
    } else {
      y.parent.left = x
    }
    x.right = y
    y.parent = x
  }

  private insertFixup(z: RBNode<K, V>): void {
    while (z.parent !== null && z.parent.color === 'red') {
      if (z.parent === z.parent.parent!.left) {
        const y = z.parent.parent!.right
        if (y !== null && y.color === 'red') {
          z.parent.color = 'black'
          y.color = 'black'
          z.parent.parent!.color = 'red'
          z = z.parent.parent!
        } else {
          if (z === z.parent.right) {
            z = z.parent
            this.leftRotate(z)
          }
          z.parent!.color = 'black'
          z.parent!.parent!.color = 'red'
          this.rightRotate(z.parent!.parent!)
        }
      } else {
        const y = z.parent.parent!.left
        if (y !== null && y.color === 'red') {
          z.parent.color = 'black'
          y.color = 'black'
          z.parent.parent!.color = 'red'
          z = z.parent.parent!
        } else {
          if (z === z.parent.left) {
            z = z.parent
            this.rightRotate(z)
          }
          z.parent!.color = 'black'
          z.parent!.parent!.color = 'red'
          this.leftRotate(z.parent!.parent!)
        }
      }
    }
    this.root!.color = 'black'
  }

  set(key: K, value: V): void {
    let parent: RBNode<K, V> | null = null
    let current = this.root
    while (current !== null) {
      parent = current
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        current.value = value
        return
      }
    }
    const newNode: RBNode<K, V> = {
      key,
      value,
      color: 'red',
      left: null,
      right: null,
      parent,
    }
    if (parent === null) {
      this.root = newNode
    } else if (this.compare(key, parent.key) < 0) {
      parent.left = newNode
    } else {
      parent.right = newNode
    }
    this._size++
    this.insertFixup(newNode)
  }

  get(key: K): V | undefined {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return current.value
      }
    }
    return undefined
  }

  has(key: K): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return true
      }
    }
    return false
  }

  private findNode(key: K): RBNode<K, V> | null {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return current
      }
    }
    return null
  }

  private transplant(u: RBNode<K, V>, v: RBNode<K, V> | null): void {
    if (u.parent === null) {
      this.root = v
    } else if (u === u.parent.left) {
      u.parent.left = v
    } else {
      u.parent.right = v
    }
    if (v !== null) {
      v.parent = u.parent
    }
  }

  private minimum(node: RBNode<K, V>): RBNode<K, V> {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  private maximum(node: RBNode<K, V>): RBNode<K, V> {
    while (node.right !== null) {
      node = node.right
    }
    return node
  }

  private deleteFixup(x: RBNode<K, V> | null, parent: RBNode<K, V> | null): void {
    while (x !== this.root && (x === null || x.color === 'black')) {
      if (x !== null) {
        parent = x.parent
      }
      if (parent === null) break
      if (x === parent.left) {
        let w = parent.right
        if (w !== null && w.color === 'red') {
          w.color = 'black'
          parent.color = 'red'
          this.leftRotate(parent)
          w = parent.right
        }
        if (
          (w === null || w.left === null || w.left.color === 'black') &&
          (w === null || w.right === null || w.right.color === 'black')
        ) {
          if (w !== null) w.color = 'red'
          x = parent
        } else {
          if (w === null || w.right === null || w.right.color === 'black') {
            if (w !== null && w.left !== null) w.left.color = 'black'
            if (w !== null) w.color = 'red'
            if (w !== null) this.rightRotate(w)
            w = parent.right
          }
          if (w !== null) w.color = parent.color
          parent.color = 'black'
          if (w !== null && w.right !== null) w.right.color = 'black'
          this.leftRotate(parent)
          x = this.root
        }
      } else {
        let w = parent.left
        if (w !== null && w.color === 'red') {
          w.color = 'black'
          parent.color = 'red'
          this.rightRotate(parent)
          w = parent.left
        }
        if (
          (w === null || w.right === null || w.right.color === 'black') &&
          (w === null || w.left === null || w.left.color === 'black')
        ) {
          if (w !== null) w.color = 'red'
          x = parent
        } else {
          if (w === null || w.left === null || w.left.color === 'black') {
            if (w !== null && w.right !== null) w.right.color = 'black'
            if (w !== null) w.color = 'red'
            if (w !== null) this.leftRotate(w)
            w = parent.left
          }
          if (w !== null) w.color = parent.color
          parent.color = 'black'
          if (w !== null && w.left !== null) w.left.color = 'black'
          this.rightRotate(parent)
          x = this.root
        }
      }
    }
    if (x !== null) {
      x.color = 'black'
    }
  }

  delete(key: K): boolean {
    const z = this.findNode(key)
    if (z === null) return false

    let y: RBNode<K, V> = z
    let yOriginalColor: RBColor = y.color
    let x: RBNode<K, V> | null = null
    let xParent: RBNode<K, V> | null = null

    if (z.left === null) {
      x = z.right
      xParent = z.parent
      this.transplant(z, z.right)
    } else if (z.right === null) {
      x = z.left
      xParent = z.parent
      this.transplant(z, z.left)
    } else {
      y = this.minimum(z.right)
      yOriginalColor = y.color
      x = y.right
      if (y.parent === z) {
        xParent = y
      } else {
        xParent = y.parent
        this.transplant(y, y.right)
        y.right = z.right
        y.right!.parent = y
      }
      this.transplant(z, y)
      y.left = z.left
      y.left!.parent = y
      y.color = z.color
    }

    this._size--

    if (yOriginalColor === 'black') {
      this.deleteFixup(x, xParent)
    }

    return true
  }

  min(): [K, V] | undefined {
    if (this.root === null) return undefined
    const node = this.minimum(this.root)
    return [node.key, node.value]
  }

  max(): [K, V] | undefined {
    if (this.root === null) return undefined
    const node = this.maximum(this.root)
    return [node.key, node.value]
  }

  lowerBound(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp >= 0) {
        result = [node.key, node.value]
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  upperBound(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp > 0) {
        result = [node.key, node.value]
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  floor(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp === 0) {
        return [node.key, node.value]
      }
      if (cmp < 0) {
        result = [node.key, node.value]
        node = node.right
      } else {
        node = node.left
      }
    }
    return result
  }

  ceil(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp === 0) {
        return [node.key, node.value]
      }
      if (cmp > 0) {
        result = [node.key, node.value]
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  private inOrderTraversal(node: RBNode<K, V> | null, result: [K, V][]): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push([node.key, node.value])
    this.inOrderTraversal(node.right, result)
  }

  keys(): K[] {
    const result: [K, V][] = []
    this.inOrderTraversal(this.root, result)
    return result.map(([k]) => k)
  }

  values(): V[] {
    const result: [K, V][] = []
    this.inOrderTraversal(this.root, result)
    return result.map(([, v]) => v)
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  toArray(): [K, V][] {
    return this.entries()
  }

  forEach(callback: (value: V, key: K, map: RedBlackMap<K, V>) => void): void {
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      callback(value, key, this)
    }
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const allEntries = this.entries()
    let index = 0
    return {
      next: () => {
        if (index < allEntries.length) {
          const value = allEntries[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<[K, V]>
      },
    }
  }

  clone(): RedBlackMap<K, V> {
    const result = new RedBlackMap<K, V>(undefined, { compare: this.compare })
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      result.set(key, value)
    }
    return result
  }

  private rangeTraversal(node: RBNode<K, V> | null, from: K, to: K, result: [K, V][]): void {
    if (node === null) return
    const cmpFrom = this.compare(node.key, from)
    const cmpTo = this.compare(node.key, to)
    if (cmpFrom > 0) {
      this.rangeTraversal(node.left, from, to, result)
    }
    if (cmpFrom >= 0 && cmpTo <= 0) {
      result.push([node.key, node.value])
    }
    if (cmpTo < 0) {
      this.rangeTraversal(node.right, from, to, result)
    }
  }

  rangeEntries(from: K, to: K): [K, V][] {
    if (this.compare(from, to) > 0) return []
    const result: [K, V][] = []
    this.rangeTraversal(this.root, from, to, result)
    return result
  }

  static fromEntries<K, V>(
    entries: Iterable<[K, V]>,
    options?: RedBlackMapOptions<K>,
  ): RedBlackMap<K, V> {
    return new RedBlackMap<K, V>(entries, options)
  }

  static fromKeys<K>(
    keys: Iterable<K>,
    options?: RedBlackMapOptions<K>,
  ): RedBlackMap<K, K> {
    const map = new RedBlackMap<K, K>(undefined, options)
    for (const key of keys) {
      map.set(key, key)
    }
    return map
  }

  toString(): string {
    return `RedBlackMap({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RedBlackMap', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'RedBlackMap'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}

export type { RBNode, RBColor, CompareFunction, RedBlackMapOptions } from './types.js'
