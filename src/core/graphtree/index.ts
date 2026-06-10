import type { TraversalOrder } from './types.js'

export type GraphTreePredicate<T> = (node: GraphTree<T>) => boolean

export class GraphTree<T = unknown> {
  private _value: T
  private _children: GraphTree<T>[] = []
  private _parent: GraphTree<T> | null = null

  constructor(value?: T) {
    this._value = value as T
  }

  getValue(): T {
    return this._value
  }

  setValue(value: T): void {
    this._value = value
  }

  getParent(): GraphTree<T> | null {
    return this._parent
  }

  getChildren(): GraphTree<T>[] {
    return [...this._children]
  }

  addChild(value: T): GraphTree<T> {
    const child = new GraphTree<T>(value)
    child._parent = this
    this._children.push(child)
    return child
  }

  removeChild(node: GraphTree<T>): boolean {
    const idx = this._children.indexOf(node)
    if (idx === -1) return false
    node._parent = null
    this._children.splice(idx, 1)
    return true
  }

  get isLeaf(): boolean {
    return this._children.length === 0
  }

  get isRoot(): boolean {
    return this._parent === null
  }

  get depth(): number {
    let d = 0
    let current = this._parent
    while (current !== null) {
      d++
      current = current._parent
    }
    return d
  }

  get height(): number {
    if (this._children.length === 0) return 0
    let maxChildHeight = 0
    for (const child of this._children) {
      const h = child.height
      if (h > maxChildHeight) maxChildHeight = h
    }
    return maxChildHeight + 1
  }

  get size(): number {
    let count = 1
    for (const child of this._children) {
      count += child.size
    }
    return count
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  find(predicate: GraphTreePredicate<T>): GraphTree<T> | undefined {
    if (predicate(this)) return this
    for (const child of this._children) {
      const found = child.find(predicate)
      if (found !== undefined) return found
    }
    return undefined
  }

  findAll(predicate: GraphTreePredicate<T>): GraphTree<T>[] {
    const results: GraphTree<T>[] = []
    this._collectAll(predicate, results)
    return results
  }

  private _collectAll(predicate: GraphTreePredicate<T>, results: GraphTree<T>[]): void {
    if (predicate(this)) results.push(this)
    for (const child of this._children) {
      child._collectAll(predicate, results)
    }
  }

  traverse(order: TraversalOrder): GraphTree<T>[] {
    const result: GraphTree<T>[] = []
    if (order === 'pre') {
      this._traversePre(result)
    } else if (order === 'post') {
      this._traversePost(result)
    } else {
      this._traverseLevel(result)
    }
    return result
  }

  private _traversePre(result: GraphTree<T>[]): void {
    result.push(this)
    for (const child of this._children) {
      child._traversePre(result)
    }
  }

  private _traversePost(result: GraphTree<T>[]): void {
    for (const child of this._children) {
      child._traversePost(result)
    }
    result.push(this)
  }

  private _traverseLevel(result: GraphTree<T>[]): void {
    const queue: GraphTree<T>[] = [this]
    let _qi = 0;
    while (_qi < queue.length) {
      const node = queue[_qi++]!
      result.push(node)
      for (const child of node._children) {
        queue.push(child)
      }
    }
  }

  clone(): GraphTree<T> {
    const cloned = new GraphTree<T>(this._value)
    for (const child of this._children) {
      const clonedChild = child.clone()
      clonedChild._parent = cloned
      cloned._children.push(clonedChild)
    }
    return cloned
  }

  toString(): string {
    return this._toString(0)
  }

  private _toString(indent: number): string {
    const prefix = '  '.repeat(indent)
    let result = `${prefix}${String(this._value)}`
    for (const child of this._children) {
      result += `\n${child._toString(indent + 1)}`
    }
    return result
  }

  static empty<T>(): GraphTree<T> {
    return new GraphTree<T>()
  }
}

export type { TraversalOrder, GraphTreeNode } from './types.js'
