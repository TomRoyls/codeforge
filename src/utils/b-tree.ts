export interface BTreeNode<K, V> {
  keys: K[]
  values: V[]
  children: BTreeNode<K, V>[]
  leaf: boolean
}

export class BTree<K, V> {
  private root: BTreeNode<K, V>
  private t: number
  private compare: (a: K, b: K) => number
  private _size: number

  constructor(order?: number, comparator?: (a: K, b: K) => number) {
    this.t = order ?? 2
    this.compare =
      comparator ?? ((a: K, b: K): number => (a as number) - (b as number))
    this.root = { keys: [], values: [], children: [], leaf: true }
    this._size = 0
  }

  insert(key: K, value: V): void {
    const r = this.root
    if (r.keys.length === 2 * this.t - 1) {
      const s: BTreeNode<K, V> = {
        keys: [],
        values: [],
        children: [r],
        leaf: false,
      }
      this.root = s
      this.splitChild(s, 0)
      this.insertNonFull(s, key, value)
    } else {
      this.insertNonFull(r, key, value)
    }
  }

  private splitChild(parent: BTreeNode<K, V>, i: number): void {
    const y = parent.children[i]
    const z: BTreeNode<K, V> = {
      keys: y.keys.splice(this.t),
      values: y.values.splice(this.t),
      children: y.leaf ? [] : y.children.splice(this.t),
      leaf: y.leaf,
    }
    const midKey = y.keys.pop()!
    const midVal = y.values.pop()!
    parent.keys.splice(i, 0, midKey)
    parent.values.splice(i, 0, midVal)
    parent.children.splice(i + 1, 0, z)
  }

  private insertNonFull(node: BTreeNode<K, V>, key: K, value: V): void {
    let i = node.keys.length - 1
    if (node.leaf) {
      while (i >= 0 && this.compare(key, node.keys[i]) < 0) i--
      if (i >= 0 && this.compare(key, node.keys[i]) === 0) {
        node.values[i] = value
        return
      }
      node.keys.splice(i + 1, 0, key)
      node.values.splice(i + 1, 0, value)
      this._size++
    } else {
      while (i >= 0 && this.compare(key, node.keys[i]) < 0) i--
      if (i >= 0 && this.compare(key, node.keys[i]) === 0) {
        node.values[i] = value
        return
      }
      i++
      if (node.children[i].keys.length === 2 * this.t - 1) {
        this.splitChild(node, i)
        if (this.compare(key, node.keys[i]) > 0) i++
        else if (this.compare(key, node.keys[i]) === 0) {
          node.values[i] = value
          return
        }
      }
      this.insertNonFull(node.children[i], key, value)
    }
  }

  find(key: K): V | undefined {
    let node = this.root
    while (true) {
      let i = 0
      while (i < node.keys.length && this.compare(key, node.keys[i]) > 0) i++
      if (i < node.keys.length && this.compare(key, node.keys[i]) === 0) {
        return node.values[i]
      }
      if (node.leaf) return undefined
      node = node.children[i]
    }
  }

  contains(key: K): boolean {
    return this.find(key) !== undefined
  }

  delete(key: K): boolean {
    if (!this.contains(key)) return false
    this.deleteFromNode(this.root, key)
    this._size--
    if (!this.root.leaf && this.root.keys.length === 0) {
      this.root = this.root.children[0]
    }
    return true
  }

  private deleteFromNode(node: BTreeNode<K, V>, key: K): void {
    let i = 0
    while (i < node.keys.length && this.compare(key, node.keys[i]) > 0) i++

    if (i < node.keys.length && this.compare(key, node.keys[i]) === 0) {
      if (node.leaf) {
        node.keys.splice(i, 1)
        node.values.splice(i, 1)
      } else if (node.children[i].keys.length >= this.t) {
        const pred = this.getPredecessor(node.children[i])
        node.keys[i] = pred.key
        node.values[i] = pred.value
        this.deleteFromNode(node.children[i], pred.key)
      } else if (node.children[i + 1].keys.length >= this.t) {
        const succ = this.getSuccessor(node.children[i + 1])
        node.keys[i] = succ.key
        node.values[i] = succ.value
        this.deleteFromNode(node.children[i + 1], succ.key)
      } else {
        this.merge(node, i)
        this.deleteFromNode(node.children[i], key)
      }
    } else {
      if (node.leaf) return
      if (node.children[i].keys.length < this.t) {
        this.fill(node, i)
      }
      let ci = 0
      while (ci < node.keys.length && this.compare(key, node.keys[ci]) > 0) ci++
      this.deleteFromNode(node.children[ci], key)
    }
  }

  private getPredecessor(node: BTreeNode<K, V>): { key: K; value: V } {
    while (!node.leaf) node = node.children[node.keys.length]
    return {
      key: node.keys[node.keys.length - 1],
      value: node.values[node.values.length - 1],
    }
  }

  private getSuccessor(node: BTreeNode<K, V>): { key: K; value: V } {
    while (!node.leaf) node = node.children[0]
    return { key: node.keys[0], value: node.values[0] }
  }

  private merge(parent: BTreeNode<K, V>, i: number): void {
    const left = parent.children[i]
    const right = parent.children[i + 1]
    left.keys.push(parent.keys[i], ...right.keys)
    left.values.push(parent.values[i], ...right.values)
    if (!left.leaf) left.children.push(...right.children)
    parent.keys.splice(i, 1)
    parent.values.splice(i, 1)
    parent.children.splice(i + 1, 1)
  }

  private fill(node: BTreeNode<K, V>, i: number): void {
    if (i > 0 && node.children[i - 1].keys.length >= this.t) {
      this.borrowFromPrev(node, i)
    } else if (i < node.keys.length && node.children[i + 1].keys.length >= this.t) {
      this.borrowFromNext(node, i)
    } else if (i < node.keys.length) {
      this.merge(node, i)
    } else {
      this.merge(node, i - 1)
    }
  }

  private borrowFromPrev(parent: BTreeNode<K, V>, i: number): void {
    const child = parent.children[i]
    const sibling = parent.children[i - 1]
    child.keys.unshift(parent.keys[i - 1])
    child.values.unshift(parent.values[i - 1])
    parent.keys[i - 1] = sibling.keys.pop()!
    parent.values[i - 1] = sibling.values.pop()!
    if (!child.leaf) child.children.unshift(sibling.children.pop()!)
  }

  private borrowFromNext(parent: BTreeNode<K, V>, i: number): void {
    const child = parent.children[i]
    const sibling = parent.children[i + 1]
    child.keys.push(parent.keys[i])
    child.values.push(parent.values[i])
    parent.keys[i] = sibling.keys.shift()!
    parent.values[i] = sibling.values.shift()!
    if (!child.leaf) child.children.push(sibling.children.shift()!)
  }

  get min(): K | undefined {
    if (this._size === 0) return undefined
    let node = this.root
    while (!node.leaf) node = node.children[0]
    return node.keys[0]
  }

  get max(): K | undefined {
    if (this._size === 0) return undefined
    let node = this.root
    while (!node.leaf) node = node.children[node.keys.length]
    return node.keys[node.keys.length - 1]
  }

  get size(): number {
    return this._size
  }

  get height(): number {
    let h = 0
    let node = this.root
    while (!node.leaf) {
      node = node.children[0]
      h++
    }
    return h
  }

  forEach(callback: (key: K, value: V) => void): void {
    this.inOrder(this.root, callback)
  }

  private inOrder(
    node: BTreeNode<K, V>,
    callback: (key: K, value: V) => void,
  ): void {
    if (node.leaf) {
      for (let i = 0; i < node.keys.length; i++) {
        callback(node.keys[i], node.values[i])
      }
    } else {
      for (let i = 0; i < node.keys.length; i++) {
        this.inOrder(node.children[i], callback)
        callback(node.keys[i], node.values[i])
      }
      this.inOrder(node.children[node.keys.length], callback)
    }
  }

  clear(): void {
    this.root = { keys: [], values: [], children: [], leaf: true }
    this._size = 0
  }

  isEmpty(): boolean {
    return this._size === 0
  }
}
