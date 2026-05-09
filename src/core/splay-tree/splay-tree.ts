import type { SplayNode, SplayTreeOptions } from './types.js'
import { DEFAULT_SPLAYTREE_OPTIONS } from './types.js'

export class SplayTree<T> {
  private root: SplayNode<T> | null = null
  private _size: number = 0

  constructor(_options?: Partial<SplayTreeOptions>) {
    void DEFAULT_SPLAYTREE_OPTIONS
  }

  private rotateRight(x: SplayNode<T>): void {
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

  private rotateLeft(x: SplayNode<T>): void {
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

  private splay(node: SplayNode<T>): void {
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

  insert(key: number, value: T): void {
    if (this.root === null) {
      this.root = { key, value, left: null, right: null, parent: null }
      this._size++
      return
    }
    let current = this.root
    while (true) {
      if (key < current.key) {
        if (current.left === null) {
          const node: SplayNode<T> = { key, value, left: null, right: null, parent: current }
          current.left = node
          this._size++
          this.splay(node)
          return
        }
        current = current.left
      } else if (key > current.key) {
        if (current.right === null) {
          const node: SplayNode<T> = { key, value, left: null, right: null, parent: current }
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

  search(key: number): T | undefined {
    let current = this.root
    while (current !== null) {
      if (key < current.key) {
        current = current.left
      } else if (key > current.key) {
        current = current.right
      } else {
        this.splay(current)
        return current.value
      }
    }
    return undefined
  }

  has(key: number): boolean {
    let current = this.root
    while (current !== null) {
      if (key < current.key) {
        current = current.left
      } else if (key > current.key) {
        current = current.right
      } else {
        this.splay(current)
        return true
      }
    }
    return false
  }

  delete(key: number): boolean {
    let current = this.root
    while (current !== null) {
      if (key < current.key) {
        current = current.left
      } else if (key > current.key) {
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

  min(): { key: number; value: T } | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.left !== null) {
      current = current.left
    }
    this.splay(current)
    return { key: current.key, value: current.value }
  }

  max(): { key: number; value: T } | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.right !== null) {
      current = current.right
    }
    this.splay(current)
    return { key: current.key, value: current.value }
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

  forEach(callback: (key: number, value: T) => void): void {
    const traverse = (node: SplayNode<T> | null): void => {
      if (node === null) return
      traverse(node.left)
      callback(node.key, node.value)
      traverse(node.right)
    }
    traverse(this.root)
  }

  toArray(): Array<{ key: number; value: T }> {
    const result: Array<{ key: number; value: T }> = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  private inOrderTraversal(node: SplayNode<T> | null, result: Array<{ key: number; value: T }>): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push({ key: node.key, value: node.value })
    this.inOrderTraversal(node.right, result)
  }

  containsRange(min: number, max: number): boolean {
    return this.containsRangeCheck(this.root, min, max)
  }

  private containsRangeCheck(node: SplayNode<T> | null, min: number, max: number): boolean {
    if (node === null) return false
    if (node.key >= min && node.key <= max) return true
    if (node.key > max) return this.containsRangeCheck(node.left, min, max)
    return this.containsRangeCheck(node.right, min, max)
  }

  range(min: number, max: number): Array<{ key: number; value: T }> {
    const result: Array<{ key: number; value: T }> = []
    this.rangeTraversal(this.root, min, max, result)
    return result
  }

  private rangeTraversal(node: SplayNode<T> | null, min: number, max: number, result: Array<{ key: number; value: T }>): void {
    if (node === null) return
    if (min < node.key) this.rangeTraversal(node.left, min, max, result)
    if (node.key >= min && node.key <= max) result.push({ key: node.key, value: node.value })
    if (max > node.key) this.rangeTraversal(node.right, min, max, result)
  }
}

export { DEFAULT_SPLAYTREE_OPTIONS } from './types.js'
export type { SplayNode, SplayTreeOptions } from './types.js'
