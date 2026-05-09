import type { CartesianNode, CartesianTreeOptions } from './types.js'
import { defaultComparator } from './types.js'

export class CartesianTree<T> {
  private root: CartesianNode<T> | null = null
  private readonly _values: T[]
  private readonly comparator: (a: T, b: T) => number
  private readonly heapProperty: 'min' | 'max'
  private readonly nodeMap: Map<number, CartesianNode<T>> = new Map()

  constructor(options: CartesianTreeOptions<T>) {
    this._values = [...options.values]
    this.comparator = options.comparator ?? defaultComparator
    this.heapProperty = options.heapProperty ?? 'min'
    this.build()
  }

  private build(): void {
    if (this._values.length === 0) return

    const stack: CartesianNode<T>[] = []

    for (let i = 0; i < this._values.length; i++) {
      const node: CartesianNode<T> = {
        value: this._values[i]!,
        index: i,
        left: null,
        right: null,
        parent: null,
      }

      let last: CartesianNode<T> | null = null
      while (stack.length > 0) {
        const top = stack[stack.length - 1]!
        if (this.shouldBeParent(top, node)) {
          break
        }
        last = stack.pop()!
      }

      if (last !== null) {
        node.left = last
        last.parent = node
      }

      if (stack.length > 0) {
        const parent = stack[stack.length - 1]!
        parent.right = node
        node.parent = parent
      }

      stack.push(node)
      this.nodeMap.set(i, node)
    }

    this.root = stack[0] ?? null
  }

  private shouldBeParent(parent: CartesianNode<T>, child: CartesianNode<T>): boolean {
    const cmp = this.comparator(parent.value, child.value)
    if (this.heapProperty === 'min') {
      return cmp <= 0
    }
    return cmp >= 0
  }

  getRoot(): CartesianNode<T> | null {
    return this.root
  }

  size(): number {
    return this._values.length
  }

  isEmpty(): boolean {
    return this._values.length === 0
  }

  inorder(): T[] {
    const result: T[] = []
    const stack: CartesianNode<T>[] = []
    let current: CartesianNode<T> | null = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      result.push(current.value)
      current = current.right
    }
    return result
  }

  preorder(): T[] {
    const result: T[] = []
    if (this.root === null) return result
    const stack: CartesianNode<T>[] = [this.root]
    while (stack.length > 0) {
      const node = stack.pop()!
      result.push(node.value)
      if (node.right !== null) stack.push(node.right)
      if (node.left !== null) stack.push(node.left)
    }
    return result
  }

  postorder(): T[] {
    const result: T[] = []
    if (this.root === null) return result
    const stack: CartesianNode<T>[] = [this.root]
    const visited = new Set<CartesianNode<T>>()
    while (stack.length > 0) {
      const node = stack[stack.length - 1]!
      if (node.left !== null && !visited.has(node.left)) {
        stack.push(node.left)
        continue
      }
      if (node.right !== null && !visited.has(node.right)) {
        stack.push(node.right)
        continue
      }
      stack.pop()
      visited.add(node)
      result.push(node.value)
    }
    return result
  }

  levelOrder(): T[] {
    if (this.root === null) return []
    const result: T[] = []
    const queue: CartesianNode<T>[] = [this.root]
    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node.value)
      if (node.left !== null) queue.push(node.left)
      if (node.right !== null) queue.push(node.right)
    }
    return result
  }

  find(value: T): CartesianNode<T> | null {
    if (this.root === null) return null
    const stack: CartesianNode<T>[] = [this.root]
    while (stack.length > 0) {
      const node = stack.pop()!
      const cmp = this.comparator(node.value, value)
      if (cmp === 0) return node
      if (node.left !== null) stack.push(node.left)
      if (node.right !== null) stack.push(node.right)
    }
    return null
  }

  getHeight(): number {
    if (this.root === null) return -1
    let height = -1
    const queue: Array<{ node: CartesianNode<T>; level: number }> = [{ node: this.root, level: 0 }]
    while (queue.length > 0) {
      const { node, level } = queue.shift()!
      height = Math.max(height, level)
      if (node.left !== null) queue.push({ node: node.left, level: level + 1 })
      if (node.right !== null) queue.push({ node: node.right, level: level + 1 })
    }
    return height
  }

  toArray(): T[] {
    return this.inorder()
  }

  clone(): CartesianTree<T> {
    return new CartesianTree<T>({
      values: this._values,
      comparator: this.comparator,
      heapProperty: this.heapProperty,
    })
  }

  rangeQuery(start: number, end: number): T[] {
    if (start < 0 || end >= this._values.length || start > end) return []
    const result: T[] = []
    for (let i = start; i <= end; i++) {
      const node = this.nodeMap.get(i)
      if (node !== undefined) {
        result.push(node.value)
      }
    }
    return result
  }

  lowestCommonAncestor(i: number, j: number): T | undefined {
    const nodeI = this.nodeMap.get(i)
    const nodeJ = this.nodeMap.get(j)
    if (nodeI === undefined || nodeJ === undefined) return undefined

    const ancestorsI = new Set<CartesianNode<T>>()
    let current: CartesianNode<T> | null = nodeI
    while (current !== null) {
      ancestorsI.add(current)
      current = current.parent
    }

    current = nodeJ
    while (current !== null) {
      if (ancestorsI.has(current)) return current.value
      current = current.parent
    }

    return this.root?.value
  }

  isValid(): boolean {
    if (this.root === null) return this._values.length === 0
    const stack: CartesianNode<T>[] = [this.root]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (node.left !== null) {
        if (!this.shouldBeParent(node, node.left)) return false
        stack.push(node.left)
      }
      if (node.right !== null) {
        if (!this.shouldBeParent(node, node.right)) return false
        stack.push(node.right)
      }
    }
    const inorderValues = this.inorder()
    if (inorderValues.length !== this._values.length) return false
    for (let k = 0; k < inorderValues.length; k++) {
      if (this.comparator(inorderValues[k]!, this._values[k]!) !== 0) return false
    }
    return true
  }

  static buildFromInorder<T>(values: T[]): CartesianTree<T> {
    return new CartesianTree<T>({ values })
  }
}
