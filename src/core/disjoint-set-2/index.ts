import type { DisjointSetOptions, DisjointSetStats } from './types.js'

export class DisjointSet<T> {
  private parent: Map<T, T>
  private rank: Map<T, number>
  private _size = 0

  constructor(_options?: DisjointSetOptions) {
    this.parent = new Map<T, T>()
    this.rank = new Map<T, number>()
  }

  get size(): number {
    return this._size
  }

  makeSet(element: T): void {
    if (this.parent.has(element)) return
    this.parent.set(element, element)
    this.rank.set(element, 0)
    this._size++
  }

  find(element: T): T | undefined {
    if (!this.parent.has(element)) return undefined
    let current = element
    const path: T[] = []
    while (this.parent.get(current) !== current) {
      path.push(current)
      const p = this.parent.get(current)!
      current = p
    }
    for (const node of path) {
      this.parent.set(node, current)
    }
    return current
  }

  union(a: T, b: T): boolean {
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === undefined || rootB === undefined) return false
    if (rootA === rootB) return false
    const rankA = this.rank.get(rootA)!
    const rankB = this.rank.get(rootB)!
    if (rankA < rankB) {
      this.parent.set(rootA, rootB)
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA)
    } else {
      this.parent.set(rootB, rootA)
      this.rank.set(rootA, rankA + 1)
    }
    return true
  }

  connected(a: T, b: T): boolean {
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === undefined || rootB === undefined) return false
    return rootA === rootB
  }

  has(element: T): boolean {
    return this.parent.has(element)
  }

  componentCount(): number {
    let count = 0
    for (const [element] of this.parent) {
      if (this.parent.get(element) === element) {
        count++
      }
    }
    return count
  }

  getComponent(element: T): T[] {
    const root = this.find(element)
    if (root === undefined) return []
    const result: T[] = []
    for (const [node] of this.parent) {
      if (this.find(node) === root) {
        result.push(node)
      }
    }
    return result
  }

  getAllComponents(): T[][] {
    const rootMap = new Map<T, T[]>()
    for (const [element] of this.parent) {
      const root = this.find(element)!
      let group = rootMap.get(root)
      if (group === undefined) {
        group = []
        rootMap.set(root, group)
      }
      group.push(element)
    }
    return [...rootMap.values()]
  }

  getComponentSize(element: T): number {
    const root = this.find(element)
    if (root === undefined) return 0
    let count = 0
    for (const [node] of this.parent) {
      if (this.find(node) === root) {
        count++
      }
    }
    return count
  }

  getStats(): DisjointSetStats {
    const components = this.getAllComponents()
    const componentCount = components.length
    let maxComponentSize = 0
    let minComponentSize = this._size > 0 ? this._size : 0
    let totalComponentSize = 0
    for (const comp of components) {
      const len = comp.length
      if (len > maxComponentSize) maxComponentSize = len
      if (len < minComponentSize) minComponentSize = len
      totalComponentSize += len
    }
    if (componentCount === 0) {
      minComponentSize = 0
    }
    return {
      elementCount: this._size,
      componentCount,
      maxComponentSize,
      minComponentSize,
      avgComponentSize: componentCount > 0 ? totalComponentSize / componentCount : 0,
    }
  }

  clear(): void {
    this.parent.clear()
    this.rank.clear()
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (const [element] of this.parent) {
      result.push(element)
    }
    return result
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clone(): DisjointSet<T> {
    const result = new DisjointSet<T>()
    for (const [element] of this.parent) {
      result.parent.set(element, this.parent.get(element)!)
      result.rank.set(element, this.rank.get(element)!)
    }
    result._size = this._size
    return result
  }

  static from<T>(elements: Iterable<T>): DisjointSet<T> {
    const ds = new DisjointSet<T>()
    for (const element of elements) {
      ds.makeSet(element)
    }
    return ds
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `${DisjointSet}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'DisjointSet', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }
}
