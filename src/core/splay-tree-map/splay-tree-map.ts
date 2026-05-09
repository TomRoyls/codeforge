import type { SplayNode, CompareFunction } from './types.js'

export class SplayTreeMap<K, V> {
  private root: SplayNode<K, V> | null = null
  private _size: number = 0
  private compare: CompareFunction<K>

  constructor(compare?: CompareFunction<K>) {
    this.compare = compare ?? ((a: K, b: K) => (a as number) - (b as number))
  }

  private rotateRight(x: SplayNode<K, V>): void {
    const y = x.parent!
    const p = y.parent
    y.left = x.right
    if (x.right !== null) x.right.parent = y
    x.right = y
    y.parent = x
    x.parent = p
    if (p !== null) {
      if (p.left === y) p.left = x
      else p.right = x
    } else {
      this.root = x
    }
  }

  private rotateLeft(x: SplayNode<K, V>): void {
    const y = x.parent!
    const p = y.parent
    y.right = x.left
    if (x.left !== null) x.left.parent = y
    x.left = y
    y.parent = x
    x.parent = p
    if (p !== null) {
      if (p.left === y) p.left = x
      else p.right = x
    } else {
      this.root = x
    }
  }

  private splay(node: SplayNode<K, V>): void {
    while (node.parent !== null) {
      const parent = node.parent
      const grandparent = parent.parent
      if (grandparent === null) {
        if (parent.left === node) {
          this.rotateRight(node)
        } else {
          this.rotateLeft(node)
        }
      } else if (parent.left === node && grandparent.left === parent) {
        this.rotateRight(parent)
        this.rotateRight(node)
      } else if (parent.right === node && grandparent.right === parent) {
        this.rotateLeft(parent)
        this.rotateLeft(node)
      } else if (parent.left === node && grandparent.right === parent) {
        this.rotateRight(node)
        this.rotateLeft(node)
      } else {
        this.rotateLeft(node)
        this.rotateRight(node)
      }
    }
    this.root = node
  }

  get(key: K): V | undefined {
    let current = this.root
    let last: SplayNode<K, V> | null = null
    while (current !== null) {
      last = current
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        this.splay(current)
        return current.value
      }
    }
    if (last !== null) this.splay(last)
    return undefined
  }

  set(key: K, value: V): void {
    if (this.root === null) {
      this.root = { key, value, left: null, right: null, parent: null }
      this._size++
      return
    }
    let current = this.root
    while (true) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        if (current.left === null) {
          const node: SplayNode<K, V> = { key, value, left: null, right: null, parent: current }
          current.left = node
          this._size++
          this.splay(node)
          return
        }
        current = current.left
      } else if (cmp > 0) {
        if (current.right === null) {
          const node: SplayNode<K, V> = { key, value, left: null, right: null, parent: current }
          current.right = node
          this._size++
          this.splay(node)
          return
        }
        current = current.right
      } else {
        current.value = value
        this.splay(current)
        return
      }
    }
  }

  has(key: K): boolean {
    let current = this.root
    let last: SplayNode<K, V> | null = null
    while (current !== null) {
      last = current
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        this.splay(current)
        return true
      }
    }
    if (last !== null) this.splay(last)
    return false
  }

  delete(key: K): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        break
      }
    }
    if (current === null) return false
    this.splay(current)
    if (current.left === null) {
      this.root = current.right
      if (this.root !== null) this.root.parent = null
    } else if (current.right === null) {
      this.root = current.left
      this.root.parent = null
    } else {
      let maxLeft = current.left
      while (maxLeft.right !== null) {
        maxLeft = maxLeft.right
      }
      this.splay(maxLeft)
      maxLeft.right = current.right
      current.right.parent = maxLeft
      this.root = maxLeft
      maxLeft.parent = null
    }
    this._size--
    return true
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

  min(): [K, V] | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.left !== null) {
      current = current.left
    }
    this.splay(current)
    return [current.key, current.value]
  }

  max(): [K, V] | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.right !== null) {
      current = current.right
    }
    this.splay(current)
    return [current.key, current.value]
  }

  private inOrderTraversal(node: SplayNode<K, V> | null, result: [K, V][]): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push([node.key, node.value])
    this.inOrderTraversal(node.right, result)
  }

  forEach(callback: (value: V, key: K) => void): void {
    const entries = this.entries()
    for (const [key, value] of entries) {
      callback(value, key)
    }
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

  clone(): SplayTreeMap<K, V> {
    const result = new SplayTreeMap<K, V>(this.compare)
    const entries = this.entries()
    for (const [key, value] of entries) {
      result.set(key, value)
    }
    return result
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const entries = this.entries()
    let index = 0
    return {
      next: () => {
        if (index < entries.length) {
          const value = entries[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<[K, V]>
      },
    }
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
    if (result !== undefined) {
      const found = this.findNode(result[0])
      if (found !== null) this.splay(found)
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
    if (result !== undefined) {
      const found = this.findNode(result[0])
      if (found !== null) this.splay(found)
    }
    return result
  }

  private findNode(key: K): SplayNode<K, V> | null {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) current = current.left
      else if (cmp > 0) current = current.right
      else return current
    }
    return null
  }

  range(start: K, end: K): [K, V][] {
    if (this.compare(start, end) > 0) return []
    const result: [K, V][] = []
    this.rangeTraversal(this.root, start, end, result)
    return result
  }

  private rangeTraversal(node: SplayNode<K, V> | null, start: K, end: K, result: [K, V][]): void {
    if (node === null) return
    const cmpStart = this.compare(node.key, start)
    const cmpEnd = this.compare(node.key, end)
    if (cmpStart > 0) {
      this.rangeTraversal(node.left, start, end, result)
    }
    if (cmpStart >= 0 && cmpEnd <= 0) {
      result.push([node.key, node.value])
    }
    if (cmpEnd < 0) {
      this.rangeTraversal(node.right, start, end, result)
    }
  }

  static fromEntries<K, V>(entries: [K, V][], compare?: CompareFunction<K>): SplayTreeMap<K, V> {
    const map = new SplayTreeMap<K, V>(compare)
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }
}

export type { SplayNode, CompareFunction } from './types.js'
