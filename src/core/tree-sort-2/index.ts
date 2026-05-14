import type { CompareFn } from '../types.js'

class TreeNode<T> {
  value: T
  left: TreeNode<T> | null
  right: TreeNode<T> | null

  constructor(value: T) {
    this.value = value
    this.left = null
    this.right = null
  }
}

export class TreeSort2<T> {
  private compare: CompareFn<T>

  constructor(comparator?: CompareFn<T>) {
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
  }

  sort(arr: T[]): T[] {
    if (arr.length <= 1) {
      return [...arr]
    }

    const root = this.buildTree(arr)
    const result: T[] = []
    this.inOrderTraversal(root, result)
    return result
  }

  sortInPlace(arr: T[]): void {
    if (arr.length <= 1) {
      return
    }

    const root = this.buildTree(arr)
    const result: T[] = []
    this.inOrderTraversal(root, result)
    for (let i = 0; i < arr.length; i++) {
      arr[i] = result[i]!
    }
  }

  private buildTree(arr: T[]): TreeNode<T> | null {
    if (arr.length === 0) {
      return null
    }

    let root: TreeNode<T> | null = null
    for (let i = 0; i < arr.length; i++) {
      root = this.insert(root, arr[i]!)
    }
    return root
  }

  private insert(node: TreeNode<T> | null, value: T): TreeNode<T> {
    if (node === null) {
      return new TreeNode(value)
    }

    const cmp = this.compare(value, node.value)
    if (cmp < 0) {
      node.left = this.insert(node.left, value)
    } else {
      node.right = this.insert(node.right, value)
    }

    return node
  }

  private inOrderTraversal(node: TreeNode<T> | null, result: T[]): void {
    if (node === null) {
      return
    }

    this.inOrderTraversal(node.left, result)
    result.push(node.value)
    this.inOrderTraversal(node.right, result)
  }
}
