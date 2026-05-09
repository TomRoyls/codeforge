import type { BPlusNode, BPlusTreeOptions } from './types.js'
import { DEFAULT_BPLUSTREE_OPTIONS } from './types.js'

export class BPlusTree<T> {
  private root: BPlusNode<T> | null = null
  private _size: number = 0
  private order: number

  constructor(options?: Partial<BPlusTreeOptions>) {
    const opts: BPlusTreeOptions = { ...DEFAULT_BPLUSTREE_OPTIONS, ...options }
    if (opts.order < 2) {
      throw new Error('B+ Tree order must be at least 2')
    }
    this.order = opts.order
  }

  private createLeafNode(): BPlusNode<T> {
    return { keys: [], children: [], values: new Map(), isLeaf: true, next: null }
  }

  private createInternalNode(): BPlusNode<T> {
    return { keys: [], children: [], values: new Map(), isLeaf: false, next: null }
  }

  private findKeyIndex(keys: number[], key: number): number {
    let low = 0
    let high = keys.length
    while (low < high) {
      const mid = (low + high) >>> 1
      if (keys[mid]! < key) {
        low = mid + 1
      } else {
        high = mid
      }
    }
    return low
  }

  private navigateToLeaf(key: number): { leaf: BPlusNode<T>, path: BPlusNode<T>[] } {
    const path: BPlusNode<T>[] = []
    let node = this.root!
    while (!node.isLeaf) {
      path.push(node)
      let idx = node.keys.length
      for (let i = 0; i < node.keys.length; i++) {
        if (key < node.keys[i]!) {
          idx = i
          break
        }
      }
      node = node.children[idx]!
    }
    return { leaf: node, path }
  }

  private findLeafExhaustive(key: number): BPlusNode<T> | null {
    if (this.root === null) return null
    const stack: BPlusNode<T>[] = [this.root]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (node.isLeaf) {
        if (node.keys.includes(key)) return node
      } else {
        for (const child of node.children) {
          stack.push(child)
        }
      }
    }
    return null
  }

  private findLeaf(key: number): BPlusNode<T> {
    let node = this.root!
    while (!node.isLeaf) {
      let idx = node.keys.length
      for (let i = 0; i < node.keys.length; i++) {
        if (key < node.keys[i]!) {
          idx = i
          break
        }
      }
      node = node.children[idx]!
    }
    return node
  }

  insert(key: number, value: T): void {
    if (this.root === null) {
      this.root = this.createLeafNode()
      this.root.keys.push(key)
      this.root.values.set(key, [value])
      this._size++
      return
    }

    const { leaf, path } = this.navigateToLeaf(key)
    const keyIdx = this.findKeyIndex(leaf.keys, key)

    if (keyIdx < leaf.keys.length && leaf.keys[keyIdx] === key) {
      leaf.values.get(key)!.push(value)
      return
    }

    this._size++
    leaf.keys.splice(keyIdx, 0, key)
    leaf.values.set(key, [value])

    if (leaf.keys.length > 2 * this.order - 1) {
      this.splitLeaf(leaf, path)
    }
  }

  private splitLeaf(leaf: BPlusNode<T>, path: BPlusNode<T>[]): void {
    const splitIdx = Math.ceil(leaf.keys.length / 2)
    const newLeaf = this.createLeafNode()
    newLeaf.keys = leaf.keys.splice(splitIdx)
    for (const k of newLeaf.keys) {
      const v = leaf.values.get(k)!
      newLeaf.values.set(k, v)
      leaf.values.delete(k)
    }
    newLeaf.next = leaf.next
    leaf.next = newLeaf
    this.insertIntoParent(leaf, newLeaf.keys[0]!, newLeaf, path)
  }

  private insertIntoParent(left: BPlusNode<T>, key: number, right: BPlusNode<T>, path: BPlusNode<T>[]): void {
    if (path.length === 0) {
      const newRoot = this.createInternalNode()
      newRoot.keys.push(key)
      newRoot.children.push(left, right)
      this.root = newRoot
      return
    }

    const parent = path.pop()!
    const idx = parent.children.indexOf(left)
    parent.keys.splice(idx, 0, key)
    parent.children.splice(idx + 1, 0, right)

    if (parent.keys.length > 2 * this.order - 1) {
      this.splitInternal(parent, path)
    }
  }

  private splitInternal(node: BPlusNode<T>, path: BPlusNode<T>[]): void {
    const midIdx = Math.floor(node.keys.length / 2)
    const promotedKey = node.keys[midIdx]!
    const newNode = this.createInternalNode()
    newNode.keys = node.keys.splice(midIdx + 1)
    newNode.children = node.children.splice(midIdx + 1)
    node.keys.splice(midIdx)
    this.insertIntoParent(node, promotedKey, newNode, path)
  }

  search(key: number): T[] {
    if (this.root === null) return []
    const leaf = this.findLeaf(key)
    if (!leaf.keys.includes(key)) return []
    return [...leaf.values.get(key)!]
  }

  has(key: number): boolean {
    if (this.root === null) return false
    const leaf = this.findLeaf(key)
    return leaf.keys.includes(key)
  }

  delete(key: number, value?: T): boolean {
    if (this.root === null) return false

    let { leaf, path } = this.navigateToLeaf(key)
    let keyIdx = leaf.keys.indexOf(key)

    if (keyIdx === -1) {
      const found = this.findLeafExhaustive(key)
      if (found === null) return false
      leaf = found
      keyIdx = leaf.keys.indexOf(key)
      if (keyIdx === -1) return false
      const nav = this.navigateToLeaf(key)
      path = nav.path
    }

    const values = leaf.values.get(key)!
    if (value !== undefined) {
      const valIdx = values.indexOf(value)
      if (valIdx === -1) return false
      values.splice(valIdx, 1)
      if (values.length > 0) return true
    }

    leaf.keys.splice(keyIdx, 1)
    leaf.values.delete(key)
    this._size--

    if (leaf.keys.length === 0) {
      if (path.length === 0) {
        this.root = null
      } else {
        this.removeEmptyLeaf(leaf, path)
      }
    } else {
      this.fixInternalKeys(key, path)
    }

    return true
  }

  private findPrevLeaf(target: BPlusNode<T>): BPlusNode<T> | null {
    let node = this.root!
    while (!node.isLeaf) {
      node = node.children[0]!
    }
    let prev: BPlusNode<T> | null = null
    while (node !== null && node !== target) {
      prev = node
      node = node.next!
    }
    return prev
  }

  private removeEmptyLeaf(leaf: BPlusNode<T>, path: BPlusNode<T>[]): void {
    const prevLeaf = this.findPrevLeaf(leaf)
    if (prevLeaf !== null) {
      prevLeaf.next = leaf.next
    }

    let current: BPlusNode<T> | null = leaf
    const currentPath = [...path]

    while (currentPath.length > 0 && current !== null) {
      const parent = currentPath.pop()!
      const idx = parent.children.indexOf(current)
      if (idx === -1) break

      parent.children.splice(idx, 1)
      if (idx < parent.keys.length) {
        parent.keys.splice(idx, 1)
      } else if (parent.keys.length > 0) {
        parent.keys.splice(parent.keys.length - 1, 1)
      }

      if (parent.keys.length > 0) break

      if (parent.children.length === 1) {
        const grandparent = currentPath.length > 0 ? currentPath[currentPath.length - 1]! : null
        if (grandparent !== null) {
          const parentIdx = grandparent.children.indexOf(parent)
          if (parentIdx !== -1) {
            grandparent.children[parentIdx] = parent.children[0]!
          }
        } else {
          this.root = parent.children[0]!
        }
        break
      }

      if (parent.children.length === 0) {
        current = parent
      } else {
        break
      }
    }

    if (this.root !== null && this.root.keys.length === 0) {
      if (this.root.children.length > 0) {
        this.root = this.root.children[0]!
      } else {
        this.root = null
      }
    }
  }

  private fixInternalKeys(deletedKey: number, path: BPlusNode<T>[]): void {
    for (let i = path.length - 1; i >= 0; i--) {
      const node = path[i]!
      const keyIdx = node.keys.indexOf(deletedKey)
      if (keyIdx !== -1) {
        let child = node.children[keyIdx + 1]!
        while (!child.isLeaf) {
          child = child.children[0]!
        }
        if (child.keys.length > 0) {
          node.keys[keyIdx] = child.keys[0]!
        }
        break
      }
    }
  }

  range(min: number, max: number): Array<{ key: number, values: T[] }> {
    if (this.root === null || min > max) return []

    const leaf = this.findLeaf(min)
    const result: Array<{ key: number, values: T[] }> = []
    let current: BPlusNode<T> | null = leaf

    while (current !== null) {
      for (const k of current.keys) {
        if (k > max) return result
        if (k >= min) {
          result.push({ key: k, values: [...current.values.get(k)!] })
        }
      }
      current = current.next
    }

    return result
  }

  min(): { key: number, values: T[] } | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (!node.isLeaf) {
      node = node.children[0]!
    }
    if (node.keys.length === 0) return undefined
    const key = node.keys[0]!
    return { key, values: [...node.values.get(key)!] }
  }

  max(): { key: number, values: T[] } | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (!node.isLeaf) {
      node = node.children[node.children.length - 1]!
    }
    if (node.keys.length === 0) return undefined
    const key = node.keys[node.keys.length - 1]!
    return { key, values: [...node.values.get(key)!] }
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  forEach(callback: (key: number, values: T[]) => void): void {
    if (this.root === null) return
    let node = this.root
    while (!node.isLeaf) {
      node = node.children[0]!
    }
    let current: BPlusNode<T> | null = node
    while (current !== null) {
      for (const k of current.keys) {
        callback(k, [...current.values.get(k)!])
      }
      current = current.next
    }
  }

  toArray(): Array<{ key: number, values: T[] }> {
    const result: Array<{ key: number, values: T[] }> = []
    this.forEach((key, values) => {
      result.push({ key, values })
    })
    return result
  }
}

export { DEFAULT_BPLUSTREE_OPTIONS } from './types.js'
export type { BPlusNode, BPlusTreeOptions } from './types.js'
