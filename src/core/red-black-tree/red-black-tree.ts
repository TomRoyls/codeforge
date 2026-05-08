import type { Color, RBNode, RBTreeOptions, RBTreeStats } from './types.js'
import { DEFAULT_RB_TREE_OPTIONS } from './types.js'

export class RedBlackTree<T> {
  private root: RBNode<T> | null = null
  private _size: number = 0
  private allowDuplicates: boolean

  constructor(options?: Partial<RBTreeOptions>) {
    const opts: RBTreeOptions = { ...DEFAULT_RB_TREE_OPTIONS, ...options }
    this.allowDuplicates = opts.allowDuplicates
  }

  private createNode(key: number, value: T): RBNode<T> {
    return { key, value, color: 'red', left: null, right: null, parent: null }
  }

  private leftRotate(x: RBNode<T>): void {
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

  private rightRotate(y: RBNode<T>): void {
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

  private insertFixup(z: RBNode<T>): void {
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

  insert(key: number, value: T): void {
    if (!this.allowDuplicates && this.has(key)) {
      const node = this.findNode(key)
      if (node !== null) {
        node.value = value
      }
      return
    }

    const z = this.createNode(key, value)
    let y: RBNode<T> | null = null
    let x = this.root

    while (x !== null) {
      y = x
      if (z.key < x.key) {
        x = x.left
      } else {
        x = x.right
      }
    }

    z.parent = y
    if (y === null) {
      this.root = z
    } else if (z.key < y.key) {
      y.left = z
    } else {
      y.right = z
    }

    this._size++
    this.insertFixup(z)
  }

  private findNode(key: number): RBNode<T> | null {
    let current = this.root
    while (current !== null) {
      if (key === current.key) {
        return current
      } else if (key < current.key) {
        current = current.left
      } else {
        current = current.right
      }
    }
    return null
  }

  search(key: number): T | undefined {
    const node = this.findNode(key)
    return node !== null ? node.value : undefined
  }

  has(key: number): boolean {
    return this.findNode(key) !== null
  }

  private transplant(u: RBNode<T>, v: RBNode<T> | null): void {
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

  private minimum(node: RBNode<T>): RBNode<T> {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  private maximum(node: RBNode<T>): RBNode<T> {
    while (node.right !== null) {
      node = node.right
    }
    return node
  }

  private deleteFixup(x: RBNode<T> | null, parent: RBNode<T> | null): void {
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

  delete(key: number): boolean {
    const z = this.findNode(key)
    if (z === null) return false

    let y: RBNode<T> = z
    let yOriginalColor: Color = y.color
    let x: RBNode<T> | null = null
    let xParent: RBNode<T> | null = null

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
        if (x !== null) {
          xParent = y
        } else {
          xParent = y
        }
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

  getMin(): T | undefined {
    if (this.root === null) return undefined
    return this.minimum(this.root).value
  }

  getMax(): T | undefined {
    if (this.root === null) return undefined
    return this.maximum(this.root).value
  }

  private inOrderWalk(node: RBNode<T> | null, result: [number, T][]): void {
    if (node !== null) {
      this.inOrderWalk(node.left, result)
      result.push([node.key, node.value])
      this.inOrderWalk(node.right, result)
    }
  }

  inOrder(): [number, T][] {
    const result: [number, T][] = []
    this.inOrderWalk(this.root, result)
    return result
  }

  private preOrderWalk(node: RBNode<T> | null, result: [number, T][]): void {
    if (node !== null) {
      result.push([node.key, node.value])
      this.preOrderWalk(node.left, result)
      this.preOrderWalk(node.right, result)
    }
  }

  preOrder(): [number, T][] {
    const result: [number, T][] = []
    this.preOrderWalk(this.root, result)
    return result
  }

  private postOrderWalk(node: RBNode<T> | null, result: [number, T][]): void {
    if (node !== null) {
      this.postOrderWalk(node.left, result)
      this.postOrderWalk(node.right, result)
      result.push([node.key, node.value])
    }
  }

  postOrder(): [number, T][] {
    const result: [number, T][] = []
    this.postOrderWalk(this.root, result)
    return result
  }

  range(min: number, max: number): [number, T][] {
    const result: [number, T][] = []
    this.rangeWalk(this.root, min, max, result)
    return result
  }

  private rangeWalk(node: RBNode<T> | null, min: number, max: number, result: [number, T][]): void {
    if (node === null) return
    if (min <= node.key) {
      this.rangeWalk(node.left, min, max, result)
    }
    if (node.key >= min && node.key <= max) {
      result.push([node.key, node.value])
    }
    if (max >= node.key) {
      this.rangeWalk(node.right, min, max, result)
    }
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

  private computeBlackHeight(node: RBNode<T> | null): number {
    if (node === null) return 1
    const leftHeight = this.computeBlackHeight(node.left)
    const rightHeight = this.computeBlackHeight(node.right)
    if (leftHeight === -1 || rightHeight === -1 || leftHeight !== rightHeight) return -1
    return leftHeight + (node.color === 'black' ? 1 : 0)
  }

  private verifyRBProperties(node: RBNode<T> | null): boolean {
    if (node === null) return true
    if (node.color === 'red') {
      if (node.left !== null && node.left.color === 'red') return false
      if (node.right !== null && node.right.color === 'red') return false
    }
    return this.verifyRBProperties(node.left) && this.verifyRBProperties(node.right)
  }

  getStats(): RBTreeStats {
    const nodeCount = this._size
    const blackHeight = this.root === null ? 0 : this.computeBlackHeight(this.root)
    const isBalanced = blackHeight !== -1 && this.verifyRBProperties(this.root)

    let minKey: number | null = null
    let maxKey: number | null = null
    if (this.root !== null) {
      minKey = this.minimum(this.root).key
      maxKey = this.maximum(this.root).key
    }

    return {
      nodeCount,
      blackHeight: blackHeight === -1 ? 0 : blackHeight,
      isBalanced,
      minKey,
      maxKey,
    }
  }
}

export { DEFAULT_RB_TREE_OPTIONS } from './types.js'
export type { Color, RBNode, RBTreeOptions, RBTreeStats } from './types.js'
