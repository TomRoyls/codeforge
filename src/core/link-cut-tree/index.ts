import type { LCTNode, PathAggregateResult } from './types.js'

const EMPTY = -1

export class LinkCutTree {
  private n: number
  private nodes: LCTNode[]

  constructor(n: number) {
    this.n = n
    this.nodes = []
    for (let i = 0; i < n; i++) {
      this.nodes.push({
        left: EMPTY,
        right: EMPTY,
        parent: EMPTY,
        pathParent: EMPTY,
        weight: 0,
        pathMin: 0,
        pathMax: 0,
        pathSum: 0,
        pathSize: 1,
        flip: false,
      })
    }
  }

  private isLeftChild(x: number): boolean {
    return this.nodes[x]!.parent !== EMPTY && this.nodes[this.nodes[x]!.parent]!.left === x
  }

  private isRoot(x: number): boolean {
    const p = this.nodes[x]!.parent
    return p === EMPTY || (this.nodes[p]!.left !== x && this.nodes[p]!.right !== x)
  }

  private pushFlip(x: number): void {
    if (!this.nodes[x]!.flip) return
    this.nodes[x]!.flip = false
    const left = this.nodes[x]!.left
    const right = this.nodes[x]!.right
    this.nodes[x]!.left = right
    this.nodes[x]!.right = left
    if (left !== EMPTY) this.nodes[left]!.flip = !this.nodes[left]!.flip
    if (right !== EMPTY) this.nodes[right]!.flip = !this.nodes[right]!.flip
  }

  private pushPathToRoot(x: number): void {
    if (this.isRoot(x)) {
      this.pushFlip(x)
      return
    }
    const stack: number[] = []
    let cur = x
    while (!this.isRoot(cur)) {
      stack.push(cur)
      cur = this.nodes[cur]!.parent
    }
    stack.push(cur)
    for (let i = stack.length - 1; i >= 0; i--) {
      this.pushFlip(stack[i]!)
    }
  }

  private update(x: number): void {
    const node = this.nodes[x]!
    node.pathMin = node.weight
    node.pathMax = node.weight
    node.pathSum = node.weight
    node.pathSize = 1
    if (node.left !== EMPTY) {
      const left = this.nodes[node.left]!
      node.pathMin = Math.min(node.pathMin, left.pathMin)
      node.pathMax = Math.max(node.pathMax, left.pathMax)
      node.pathSum += left.pathSum
      node.pathSize += left.pathSize
    }
    if (node.right !== EMPTY) {
      const right = this.nodes[node.right]!
      node.pathMin = Math.min(node.pathMin, right.pathMin)
      node.pathMax = Math.max(node.pathMax, right.pathMax)
      node.pathSum += right.pathSum
      node.pathSize += right.pathSize
    }
  }

  private rotate(x: number): void {
    const p = this.nodes[x]!.parent
    const g = this.nodes[p]!.parent
    const savedPathParent = this.nodes[p]!.pathParent
    if (this.isLeftChild(x)) {
      this.nodes[p]!.left = this.nodes[x]!.right
      if (this.nodes[x]!.right !== EMPTY) {
        this.nodes[this.nodes[x]!.right]!.parent = p
      }
      this.nodes[x]!.right = p
      this.nodes[p]!.parent = x
    } else {
      this.nodes[p]!.right = this.nodes[x]!.left
      if (this.nodes[x]!.left !== EMPTY) {
        this.nodes[this.nodes[x]!.left]!.parent = p
      }
      this.nodes[x]!.left = p
      this.nodes[p]!.parent = x
    }
    this.nodes[x]!.pathParent = savedPathParent
    this.nodes[p]!.pathParent = EMPTY
    if (g !== EMPTY) {
      if (this.nodes[g]!.left === p) {
        this.nodes[g]!.left = x
      } else if (this.nodes[g]!.right === p) {
        this.nodes[g]!.right = x
      }
    }
    this.nodes[x]!.parent = g
    this.update(p)
    this.update(x)
  }

  private splay(x: number): void {
    this.pushPathToRoot(x)
    while (!this.isRoot(x)) {
      const p = this.nodes[x]!.parent
      if (this.isRoot(p)) {
        this.rotate(x)
        break
      }
      const g = this.nodes[p]!.parent
      if ((this.nodes[g]!.left === p) === (this.nodes[p]!.left === x)) {
        this.rotate(p)
        this.rotate(x)
      } else {
        this.rotate(x)
        this.rotate(x)
      }
    }
  }

  private access(x: number): void {
    let last = EMPTY
    let cur = x
    while (cur !== EMPTY) {
      this.splay(cur)
      const right = this.nodes[cur]!.right
      if (right !== EMPTY) {
        this.nodes[right]!.pathParent = cur
        this.nodes[right]!.parent = EMPTY
      }
      this.nodes[cur]!.right = last
      if (last !== EMPTY) {
        this.nodes[last]!.parent = cur
        this.nodes[last]!.pathParent = EMPTY
      }
      this.update(cur)
      last = cur
      cur = this.nodes[cur]!.pathParent
    }
    this.splay(x)
  }

  private makeRoot(x: number): void {
    this.access(x)
    this.nodes[x]!.flip = !this.nodes[x]!.flip
    this.pushFlip(x)
  }

  link(u: number, v: number): void {
    if (u < 0 || u >= this.n || v < 0 || v >= this.n) return
    if (u === v) return
    if (this.connected(u, v)) return
    this.makeRoot(u)
    this.nodes[u]!.pathParent = v
  }

  cut(u: number): void {
    if (u < 0 || u >= this.n) return
    this.access(u)
    const left = this.nodes[u]!.left
    if (left === EMPTY) return
    this.nodes[left]!.parent = EMPTY
    this.nodes[left]!.pathParent = EMPTY
    this.nodes[u]!.left = EMPTY
    this.update(u)
  }

  findRoot(u: number): number {
    if (u < 0 || u >= this.n) return -1
    this.access(u)
    let cur = u
    while (this.nodes[cur]!.left !== EMPTY) {
      this.pushFlip(cur)
      cur = this.nodes[cur]!.left
    }
    this.pushFlip(cur)
    this.splay(cur)
    return cur
  }

  isSameTree(u: number, v: number): boolean {
    if (u < 0 || u >= this.n || v < 0 || v >= this.n) return false
    if (u === v) return true
    return this.findRoot(u) === this.findRoot(v)
  }

  getParent(u: number): number {
    if (u < 0 || u >= this.n) return -1
    this.access(u)
    const left = this.nodes[u]!.left
    if (left === EMPTY) return -1
    let cur = left
    while (this.nodes[cur]!.right !== EMPTY) {
      this.pushFlip(cur)
      cur = this.nodes[cur]!.right
    }
    this.pushFlip(cur)
    this.splay(cur)
    return cur
  }

  getDepth(u: number): number {
    if (u < 0 || u >= this.n) return -1
    this.access(u)
    const left = this.nodes[u]!.left
    if (left === EMPTY) return 0
    return this.nodes[left]!.pathSize
  }

  lca(u: number, v: number): number {
    if (u < 0 || u >= this.n || v < 0 || v >= this.n) return -1
    if (u === v) return u
    if (!this.connected(u, v)) return -1
    this.access(u)
    this.access(v)
    if (this.nodes[u]!.pathParent !== EMPTY) {
      return this.nodes[u]!.pathParent
    }
    return u
  }

  pathAggregate(u: number, v: number): PathAggregateResult {
    const empty: PathAggregateResult = { min: 0, max: 0, sum: 0, size: 0 }
    if (u < 0 || u >= this.n || v < 0 || v >= this.n) return empty
    if (!this.connected(u, v)) return empty
    if (u === v) {
      return {
        min: this.nodes[u]!.weight,
        max: this.nodes[u]!.weight,
        sum: this.nodes[u]!.weight,
        size: 1,
      }
    }
    this.makeRoot(u)
    this.access(v)
    const node = this.nodes[v]!
    return {
      min: node.pathMin,
      max: node.pathMax,
      sum: node.pathSum,
      size: node.pathSize,
    }
  }

  pathMin(u: number, v: number): number {
    return this.pathAggregate(u, v).min
  }

  pathMax(u: number, v: number): number {
    return this.pathAggregate(u, v).max
  }

  pathSum(u: number, v: number): number {
    return this.pathAggregate(u, v).sum
  }

  setWeight(node: number, weight: number): void {
    if (node < 0 || node >= this.n) return
    this.access(node)
    this.nodes[node]!.weight = weight
    this.update(node)
  }

  getWeight(node: number): number {
    if (node < 0 || node >= this.n) return 0
    return this.nodes[node]!.weight
  }

  getValue(node: number): number {
    return this.getWeight(node)
  }

  setValue(node: number, value: number): void {
    this.setWeight(node, value)
  }

  get size(): number {
    return this.n
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  getSize(): number {
    return this.n
  }

  connected(u: number, v: number): boolean {
    return this.isSameTree(u, v)
  }

  isConnected(a: number, b: number): boolean {
    return this.isSameTree(a, b)
  }

  clone(): LinkCutTree {
    const copy = new LinkCutTree(this.n)
    for (let i = 0; i < this.n; i++) {
      copy.nodes[i]!.weight = this.nodes[i]!.weight
    }
    const edgeSet = new Set<string>()
    for (let i = 0; i < this.n; i++) {
      this.access(i)
      let cur = i
      while (this.nodes[cur]!.left !== EMPTY) {
        const left = this.nodes[cur]!.left
        const a = Math.min(cur, left)
        const b = Math.max(cur, left)
        edgeSet.add(`${a},${b}`)
        cur = left
      }
    }
    const edgeArr = [...edgeSet]
    const sortedEdges = edgeArr.sort()
    for (const key of sortedEdges) {
      const parts = key.split(',')
      const a = parseInt(parts[0]!)
      const b = parseInt(parts[1]!)
      copy.link(a, b)
    }
    return copy
  }
}
