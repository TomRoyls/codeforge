interface SetNode<T> {
  parent: T
  rank: number
  size: number
}

export interface DisjointSetStats {
  elementCount: number
  setCount: number
  maxSetSize: number
}

export class DisjointSet<T> {
  private readonly nodes = new Map<T, SetNode<T>>()
  private _setCount = 0

  add(value: T): boolean {
    if (this.nodes.has(value)) return false
    this.nodes.set(value, { parent: value, rank: 0, size: 1 })
    this._setCount++
    return true
  }

  find(value: T): T {
    const node = this.nodes.get(value)
    if (node === undefined) {
      throw new RangeError(`DisjointSet: element not found`)
    }
    if (node.parent === value) return value
    const root = this.find(node.parent)
    node.parent = root
    return root
  }

  union(a: T, b: T): boolean {
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === rootB) return false

    const nodeA = this.nodes.get(rootA)!
    const nodeB = this.nodes.get(rootB)!

    if (nodeA.rank < nodeB.rank) {
      nodeA.parent = rootB
      nodeB.size += nodeA.size
    } else if (nodeA.rank > nodeB.rank) {
      nodeB.parent = rootA
      nodeA.size += nodeB.size
    } else {
      nodeB.parent = rootA
      nodeA.rank++
      nodeA.size += nodeB.size
    }
    this._setCount--
    return true
  }

  connected(a: T, b: T): boolean {
    return this.find(a) === this.find(b)
  }

  componentSize(value: T): number {
    const root = this.find(value)
    return this.nodes.get(root)!.size
  }

  has(value: T): boolean {
    return this.nodes.has(value)
  }

  getComponent(value: T): T[] {
    const root = this.find(value)
    const members: T[] = []
    for (const [key] of this.nodes) {
      if (this.find(key) === root) {
        members.push(key)
      }
    }
    return members
  }

  toArray(): T[][] {
    const rootMap = new Map<T, T[]>()
    for (const [key] of this.nodes) {
      const root = this.find(key)
      let group = rootMap.get(root)
      if (group === undefined) {
        group = []
        rootMap.set(root, group)
      }
      group.push(key)
    }
    return [...rootMap.values()]
  }

  get elementCount(): number {
    return this.nodes.size
  }

  get setCount(): number {
    return this._setCount
  }

  get isEmpty(): boolean {
    return this.nodes.size === 0
  }

  clear(): void {
    this.nodes.clear()
    this._setCount = 0
  }

  stats(): DisjointSetStats {
    let maxSize = 0
    for (const [key] of this.nodes) {
      const node = this.nodes.get(key)!
      if (node.parent === key) {
        if (node.size > maxSize) maxSize = node.size
      }
    }
    return {
      elementCount: this.nodes.size,
      setCount: this._setCount,
      maxSetSize: maxSize,
    }
  }

  toString(): string {
    const pairs: string[] = []
    for (const [key] of this.nodes) {
      pairs.push(`${String(key)}:${String(this.find(key))}`)
    }
    return `{${pairs.join(', ')}}`
  }

  toJSON(): Array<[T, T]> {
    const result: Array<[T, T]> = []
    for (const [key] of this.nodes) {
      result.push([key, this.find(key)])
    }
    return result
  }

  clone(): this {
    const c = new DisjointSet<T>()
    for (const [key, node] of this.nodes) {
      c.nodes.set(key, { parent: node.parent, rank: node.rank, size: node.size })
    }
    c._setCount = this._setCount
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DisjointSet)) return false
    if (this.nodes.size !== other.nodes.size) return false

    const thisPid = new Map<T, number>()
    let next = 0
    for (const key of this.nodes.keys()) {
      const root = this.find(key)
      if (!thisPid.has(root)) {
        thisPid.set(root, next++)
      }
      thisPid.set(key, thisPid.get(root)!)
    }

    const otherPid = new Map<T, number>()
    next = 0
    for (const key of other.nodes.keys()) {
      const root = other.find(key)
      if (!otherPid.has(root)) {
        otherPid.set(root, next++)
      }
      otherPid.set(key, otherPid.get(root)!)
    }

    const thisDistinct = new Set(thisPid.values()).size
    const otherDistinct = new Set(otherPid.values()).size
    if (thisDistinct !== otherDistinct) return false

    const forward = new Map<number, number>()
    const backward = new Map<number, number>()
    for (const [key, tp] of thisPid) {
      const op = otherPid.get(key)
      if (op === undefined) return false
      const f = forward.get(tp)
      if (f === undefined) forward.set(tp, op)
      else if (f !== op) return false
      const b = backward.get(op)
      if (b === undefined) backward.set(op, tp)
      else if (b !== tp) return false
    }
    return true
  }
}
