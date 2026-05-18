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
}
