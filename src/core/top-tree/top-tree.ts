import type { TopTreeNode, TopTreeOptions, TopTreeStats, CompareFunction, AggregateType } from './types.js'
import { DEFAULT_TOP_TREE_OPTIONS } from './types.js'

export class TopTree<K, V> {
  private root: TopTreeNode<K, V> | null = null
  private _size: number = 0
  private aggregateType: AggregateType
  private compare: CompareFunction<K>

  constructor(options?: Partial<TopTreeOptions>, compare?: CompareFunction<K>) {
    const opts: TopTreeOptions = { ...DEFAULT_TOP_TREE_OPTIONS, ...options }
    this.aggregateType = opts.aggregate
    this.compare = compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private nodeValue(node: TopTreeNode<K, V>): number {
    const v = node.value
    if (typeof v === 'number') return v
    return 0
  }

  private updateAggregate(node: TopTreeNode<K, V>): void {
    const self = this.nodeValue(node)
    const left = node.left
    const right = node.right
    node.aggregateCount = 1 + (left ? left.aggregateCount : 0) + (right ? right.aggregateCount : 0)
    node.aggregateSum = self + (left ? left.aggregateSum : 0) + (right ? right.aggregateSum : 0)
    node.aggregateMin = Math.min(self, left ? left.aggregateMin : Infinity, right ? right.aggregateMin : Infinity)
    node.aggregateMax = Math.max(self, left ? left.aggregateMax : -Infinity, right ? right.aggregateMax : -Infinity)
  }

  private rotateLeft(x: TopTreeNode<K, V>): void {
    const y = x.right!
    x.right = y.left
    if (y.left) y.left.parent = x
    y.parent = x.parent
    if (!x.parent) {
      this.root = y
    } else if (x === x.parent.left) {
      x.parent.left = y
    } else {
      x.parent.right = y
    }
    y.left = x
    x.parent = y
    this.updateAggregate(x)
    this.updateAggregate(y)
  }

  private rotateRight(x: TopTreeNode<K, V>): void {
    const y = x.left!
    x.left = y.right
    if (y.right) y.right.parent = x
    y.parent = x.parent
    if (!x.parent) {
      this.root = y
    } else if (x === x.parent.right) {
      x.parent.right = y
    } else {
      x.parent.left = y
    }
    y.right = x
    x.parent = y
    this.updateAggregate(x)
    this.updateAggregate(y)
  }

  private splay(node: TopTreeNode<K, V>): void {
    while (node.parent) {
      const parent = node.parent
      const grand = parent.parent
      if (!grand) {
        if (node === parent.left) {
          this.rotateRight(parent)
        } else {
          this.rotateLeft(parent)
        }
      } else if (node === parent.left && parent === grand.left) {
        this.rotateRight(grand)
        this.rotateRight(parent)
      } else if (node === parent.right && parent === grand.right) {
        this.rotateLeft(grand)
        this.rotateLeft(parent)
      } else if (node === parent.right && parent === grand.left) {
        this.rotateLeft(parent)
        this.rotateRight(grand)
      } else {
        this.rotateRight(parent)
        this.rotateLeft(grand)
      }
    }
  }

  private findNode(key: K): TopTreeNode<K, V> | null {
    let node = this.root
    let last: TopTreeNode<K, V> | null = null
    while (node) {
      last = node
      const cmp = this.compare(key, node.key)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        node = node.right
      } else {
        this.splay(node)
        return node
      }
    }
    if (last) this.splay(last)
    return null
  }

  private findNodeNoSplay(key: K): TopTreeNode<K, V> | null {
    let node = this.root
    while (node) {
      const cmp = this.compare(key, node.key)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        node = node.right
      } else {
        return node
      }
    }
    return null
  }

  insert(key: K, value?: V): void {
    const v = value === undefined ? (undefined as V) : value
    if (!this.root) {
      this.root = this.createNode(key, v)
      this._size++
      return
    }
    let node: TopTreeNode<K, V> | null = this.root
    let parent: TopTreeNode<K, V> | null = null
    while (node) {
      parent = node
      const cmp = this.compare(key, node.key)
      if (cmp < 0) {
        node = node.left!
      } else if (cmp > 0) {
        node = node.right!
      } else {
        node.value = v
        this.splay(node)
        this.updateAggregatesToRoot(node)
        return
      }
    }
    const newNode = this.createNode(key, v)
    newNode.parent = parent
    const cmp = this.compare(key, parent!.key)
    if (cmp < 0) {
      parent!.left = newNode
    } else {
      parent!.right = newNode
    }
    this._size++
    this.splay(newNode)
    this.updateAggregatesToRoot(newNode)
  }

  private createNode(key: K, value: V): TopTreeNode<K, V> {
    const numVal = typeof value === 'number' ? value : 0
    return {
      key,
      value,
      left: null,
      right: null,
      parent: null,
      aggregateSum: numVal,
      aggregateMin: numVal,
      aggregateMax: numVal,
      aggregateCount: 1,
    }
  }

  private updateAggregatesToRoot(node: TopTreeNode<K, V> | null): void {
    while (node) {
      this.updateAggregate(node)
      node = node.parent
    }
  }

  delete(key: K): boolean {
    const node = this.findNode(key)
    if (!node) return false
    this.splay(node)
    this._size--
    if (!node.left && !node.right) {
      this.root = null
    } else if (!node.left) {
      this.root = node.right!
      this.root.parent = null
    } else if (!node.right) {
      this.root = node.left!
      this.root.parent = null
    } else {
      const leftTree = node.left
      leftTree.parent = null
      const rightTree = node.right
      rightTree.parent = null
      let maxLeft = leftTree
      while (maxLeft.right) maxLeft = maxLeft.right
      this.splay(maxLeft)
      maxLeft.right = rightTree
      rightTree.parent = maxLeft
      this.root = maxLeft
      this.root.parent = null
      this.updateAggregate(maxLeft)
    }
    return true
  }

  has(key: K): boolean {
    const result = this.findNode(key)
    return result !== null
  }

  get(key: K): V | undefined {
    const node = this.findNode(key)
    if (!node) return undefined
    return node.value
  }

  get min(): [K, V] | undefined {
    if (!this.root) return undefined
    let node = this.root
    while (node.left) node = node.left
    this.splay(node)
    return [node.key, node.value]
  }

  get max(): [K, V] | undefined {
    if (!this.root) return undefined
    let node = this.root
    while (node.right) node = node.right
    this.splay(node)
    return [node.key, node.value]
  }

  get size(): number {
    return this._size
  }

  pathQuery(from: K, to: K, aggregate?: AggregateType): number | undefined {
    const aggType = aggregate ?? this.aggregateType
    if (!this.root) return undefined
    const fromExists = this.findNodeNoSplay(from)
    if (!fromExists) return undefined
    const toExists = this.findNodeNoSplay(to)
    if (!toExists) return undefined
    if (this.compare(from, to) === 0) {
      const val = this.nodeValue(fromExists)
      switch (aggType) {
        case 'sum': return val
        case 'min': return val
        case 'max': return val
        case 'count': return 1
      }
    }
    const pathValues = this.collectPathValues(from, to)
    if (pathValues.length === 0) return undefined
    switch (aggType) {
      case 'sum': {
        let s = 0
        for (let i = 0; i < pathValues.length; i++) s += pathValues[i]!
        return s
      }
      case 'min': {
        let mn = pathValues[0]!
        for (let i = 1; i < pathValues.length; i++) {
          if (pathValues[i]! < mn) mn = pathValues[i]!
        }
        return mn
      }
      case 'max': {
        let mx = pathValues[0]!
        for (let i = 1; i < pathValues.length; i++) {
          if (pathValues[i]! > mx) mx = pathValues[i]!
        }
        return mx
      }
      case 'count':
        return pathValues.length
    }
  }

  private collectPathValues(from: K, to: K): number[] {
    const [lo, hi] = this.compare(from, to) < 0 ? [from, to] : [to, from]
    const values: number[] = []
    let node = this.root!
    while (node) {
      const cmpLo = this.compare(lo, node.key)
      const cmpHi = this.compare(hi, node.key)
      if (cmpLo <= 0 && cmpHi >= 0) {
        values.push(this.nodeValue(node))
        this.collectPathDown(node.left, lo, values, true)
        this.collectPathDown(node.right, hi, values, false)
        break
      }
      if (cmpHi < 0) {
        node = node.left!
      } else {
        node = node.right!
      }
    }
    return values
  }

  private collectPathDown(node: TopTreeNode<K, V> | null, target: K, values: number[], isLeft: boolean): void {
    let current = node
    while (current) {
      const cmp = this.compare(target, current.key)
      if (isLeft) {
        if (cmp <= 0) {
          values.push(this.nodeValue(current))
          if (current.right) {
            this.collectRightEdge(current.right, values)
          }
          current = current.left!
        } else {
          current = current.right!
        }
      } else {
        if (cmp >= 0) {
          values.push(this.nodeValue(current))
          if (current.left) {
            this.collectLeftEdge(current.left, values)
          }
          current = current.right!
        } else {
          current = current.left!
        }
      }
    }
  }

  private collectRightEdge(node: TopTreeNode<K, V>, values: number[]): void {
    values.push(this.nodeValue(node))
    if (node.right) this.collectRightEdge(node.right, values)
  }

  private collectLeftEdge(node: TopTreeNode<K, V>, values: number[]): void {
    values.push(this.nodeValue(node))
    if (node.left) this.collectLeftEdge(node.left, values)
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.inOrder(this.root, callback)
  }

  private inOrder(node: TopTreeNode<K, V> | null, callback: (value: V, key: K) => void): void {
    if (!node) return
    this.inOrder(node.left, callback)
    callback(node.value, node.key)
    this.inOrder(node.right, callback)
  }

  toArray(): [K, V][] {
    const result: [K, V][] = []
    this.forEach((value, key) => {
      result.push([key, value])
    })
    return result
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  clone(): TopTree<K, V> {
    const result = new TopTree<K, V>({ aggregate: this.aggregateType }, this.compare)
    result.root = this.cloneNode(this.root, null)
    result._size = this._size
    return result
  }

  private cloneNode(node: TopTreeNode<K, V> | null, parent: TopTreeNode<K, V> | null): TopTreeNode<K, V> | null {
    if (!node) return null
    const cloned: TopTreeNode<K, V> = {
      key: node.key,
      value: node.value,
      left: null,
      right: null,
      parent,
      aggregateSum: node.aggregateSum,
      aggregateMin: node.aggregateMin,
      aggregateMax: node.aggregateMax,
      aggregateCount: node.aggregateCount,
    }
    cloned.left = this.cloneNode(node.left, cloned)
    cloned.right = this.cloneNode(node.right, cloned)
    return cloned
  }

  static from<K, V>(entries: [K, V?][], options?: Partial<TopTreeOptions>, compare?: CompareFunction<K>): TopTree<K, V> {
    const tree = new TopTree<K, V>(options, compare)
    for (const [key, value] of entries) {
      tree.insert(key, value)
    }
    return tree
  }

  private heightNode(node: TopTreeNode<K, V> | null): number {
    if (!node) return 0
    return 1 + Math.max(this.heightNode(node.left), this.heightNode(node.right))
  }

  private checkBalanced(node: TopTreeNode<K, V> | null): boolean {
    if (!node) return true
    const leftH = this.heightNode(node.left)
    const rightH = this.heightNode(node.right)
    if (Math.abs(leftH - rightH) > 1) return false
    return this.checkBalanced(node.left) && this.checkBalanced(node.right)
  }

  validate(): boolean {
    const stack: [TopTreeNode<K, V> | null, K | null, K | null][] = [[this.root, null, null]]
    while (stack.length > 0) {
      const [node, lo, hi] = stack.pop()!
      if (!node) continue
      if (lo !== null && this.compare(node.key, lo) <= 0) return false
      if (hi !== null && this.compare(node.key, hi) >= 0) return false
      stack.push([node.left, lo, node.key])
      stack.push([node.right, node.key, hi])
    }
    return true
  }

  stats(): TopTreeStats {
    const arr = this.toArray()
    const minKey = arr.length > 0 && typeof arr[0]![0] === 'number' ? (arr[0]![0] as unknown as number) : null
    const maxKey = arr.length > 0 && typeof arr[arr.length - 1]![0] === 'number' ? (arr[arr.length - 1]![0] as unknown as number) : null
    return {
      nodeCount: this._size,
      height: this.heightNode(this.root),
      isBalanced: this.checkBalanced(this.root),
      minKey,
      maxKey,
    }
  }
}

export { DEFAULT_TOP_TREE_OPTIONS } from './types.js'
export type { TopTreeNode, TopTreeOptions, TopTreeStats, CompareFunction, AggregateType } from './types.js'
