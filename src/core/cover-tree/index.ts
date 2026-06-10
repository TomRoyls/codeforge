import type { CoverTreeDistance, CoverTreeOptions } from './types.js'
import { numberDistance, DEFAULT_COVERTREE_BASE } from './types.js'

interface CoverTreeNode<T> {
  point: T
  children: CoverTreeNode<T>[]
  level: number
}

export class CoverTree<T = number> {
  private root: CoverTreeNode<T> | null = null
  private _size = 0
  private dist: CoverTreeDistance<T>
  private base: number

  constructor(options?: Partial<CoverTreeOptions<T>>) {
    this.dist = options?.distance ?? (numberDistance as CoverTreeDistance<T>)
    this.base = options?.base ?? DEFAULT_COVERTREE_BASE
  }

  insert(point: T): void {
    if (!this.root) {
      this.root = { point, children: [], level: 0 }
      this._size = 1
      return
    }

    const d = this.dist(point, this.root.point)
    while (d > Math.pow(this.base, this.root.level)) {
      this.root.level++
    }

    this._insert(point, this.root)
    this._size++
  }

  private _insert(point: T, node: CoverTreeNode<T>): void {
    const d = this.dist(point, node.point)

    if (d === 0) {
      const newNode: CoverTreeNode<T> = { point, children: [], level: node.level - 1 }
      node.children.push(newNode)
      return
    }

    let bestChild: CoverTreeNode<T> | null = null
    let bestChildDist = Infinity

    for (const child of node.children) {
      const cd = this.dist(point, child.point)
      if (cd <= Math.pow(this.base, child.level) && cd < bestChildDist) {
        bestChild = child
        bestChildDist = cd
      }
    }

    if (bestChild !== null) {
      this._insert(point, bestChild)
      return
    }

    let newLevel = node.level - 1
    if (d > 0) {
      const logDist = Math.log(d) / Math.log(this.base)
      newLevel = Math.min(node.level - 1, Math.floor(logDist))
    }

    const newNode: CoverTreeNode<T> = { point, children: [], level: newLevel }
    node.children.push(newNode)
  }

  findNearest(point: T): T | undefined {
    if (!this.root) return undefined

    let best = this.root
    let bestDist = this.dist(point, this.root.point)

    const stack: CoverTreeNode<T>[] = [this.root]

    while (stack.length > 0) {
      const current = stack.pop()!

      for (const child of current.children) {
        const cd = this.dist(point, child.point)
        const coverRadius = Math.pow(this.base, child.level + 1)

        if (cd - coverRadius <= bestDist) {
          if (cd < bestDist) {
            bestDist = cd
            best = child
          }
          stack.push(child)
        }
      }
    }

    return best.point
  }

  findKNearest(point: T, k: number): T[] {
    if (k <= 0 || !this.root) return []

    type Entry = { node: CoverTreeNode<T>; dist: number }
    const results: Entry[] = []
    const stack: CoverTreeNode<T>[] = [this.root]

    const maxDist = (): number => {
      if (results.length < k) return Infinity
      return results[results.length - 1]!.dist
    }

    const insertResult = (entry: Entry): void => {
      results.push(entry)
      results.sort((a, b) => a.dist - b.dist)
      if (results.length > k) results.length = k
    }

    const rootDist = this.dist(point, this.root.point)
    insertResult({ node: this.root, dist: rootDist })

    while (stack.length > 0) {
      const current = stack.pop()!

      for (const child of current.children) {
        const cd = this.dist(point, child.point)
        const coverRadius = Math.pow(this.base, child.level + 1)

        if (cd - coverRadius <= maxDist()) {
          insertResult({ node: child, dist: cd })
          stack.push(child)
        }
      }
    }

    return results.map((e) => e.node.point)
  }

  contains(point: T): boolean {
    if (!this.root) return false

    const stack: CoverTreeNode<T>[] = [this.root]

    while (stack.length > 0) {
      const current = stack.pop()!
      if (this.dist(point, current.point) === 0) return true

      for (const child of current.children) {
        const coverRadius = Math.pow(this.base, child.level + 1)
        const cd = this.dist(point, child.point)
        if (cd <= coverRadius) {
          stack.push(child)
        }
      }
    }

    return false
  }

  remove(point: T): boolean {
    if (!this.root) return false

    const found = this._findNodeWithParent(point)
    if (!found) return false

    const { node, parent } = found
    const orphanPoints: T[] = []
    for (const child of node.children) {
      this._collectPoints(child, orphanPoints)
    }

    if (parent) {
      const idx = parent.children.indexOf(node)
      if (idx >= 0) parent.children.splice(idx, 1)
    } else {
      this.root = null
    }

    this._size -= 1 + orphanPoints.length

    for (const p of orphanPoints) {
      this.insert(p)
    }

    return true
  }

  private _findNodeWithParent(
    point: T,
  ): { node: CoverTreeNode<T>; parent: CoverTreeNode<T> | null } | null {
    type Entry = { node: CoverTreeNode<T>; parent: CoverTreeNode<T> | null }
    const stack: Entry[] = [{ node: this.root!, parent: null }]

    while (stack.length > 0) {
      const entry = stack.pop()!
      if (this.dist(point, entry.node.point) === 0) return entry

      for (const child of entry.node.children) {
        const coverRadius = Math.pow(this.base, child.level + 1)
        const cd = this.dist(point, child.point)
        if (cd <= coverRadius) {
          stack.push({ node: child, parent: entry.node })
        }
      }
    }

    return null
  }

  private _collectPoints(node: CoverTreeNode<T>, result: T[]): void {
    result.push(node.point)
    for (const child of node.children) {
      this._collectPoints(child, result)
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    if (this.root) this._collectPoints(this.root, result)
    return result
  }

  *[Symbol.iterator](): Iterator<T> {
    const stack: CoverTreeNode<T>[] = []
    if (this.root) stack.push(this.root)
    while (stack.length > 0) {
      const node = stack.pop()!
      yield node.point
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]!)
      }
    }
  }

  static fromPoints<T>(points: T[], options?: Partial<CoverTreeOptions<T>>): CoverTree<T> {
    const tree = new CoverTree<T>(options)
    for (const p of points) {
      tree.insert(p)
    }
    return tree
  }

  toString(): string {
    return `${CoverTree}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }


  has(point: T): boolean {
    return this.contains(point)
  }

  toJSON() {
    return { type: 'CoverTree', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }



  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  groupBy<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }
}

export { numberDistance, euclideanDistance2D, manhattanDistance2D } from './types.js'
export type { CoverTreeDistance, CoverTreeOptions, Point2D } from './types.js'
