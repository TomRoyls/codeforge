export interface ConsistentHashOptions {
  virtualNodes: number
}

export class ConsistentHash<T> {
  private readonly ring = new Map<number, T>()
  private readonly sortedKeys: number[] = []
  private _nodeCount: number = 0
  private readonly virtualNodes: number

  constructor(options: Partial<ConsistentHashOptions> = {}) {
    this.virtualNodes = options.virtualNodes ?? 150
  }

  public addNode(node: T): void {
    const nodeStr = String(node)
    for (let i = 0; i < this.virtualNodes; i++) {
      const hash = this.hash(`${nodeStr}:${i}`)
      this.ring.set(hash, node)
    }
    this.sortedKeys.length = 0
    this.ring.forEach((_, key) => { this.sortedKeys.push(key) })
    this.sortedKeys.sort((a, b) => a - b)
    this._nodeCount++
  }

  public removeNode(node: T): void {
    const nodeStr = String(node)
    for (let i = 0; i < this.virtualNodes; i++) {
      const hash = this.hash(`${nodeStr}:${i}`)
      this.ring.delete(hash)
    }
    this.sortedKeys.length = 0
    this.ring.forEach((_, key) => { this.sortedKeys.push(key) })
    this.sortedKeys.sort((a, b) => a - b)
    this._nodeCount--
  }

  public getNode(key: string): T | undefined {
    if (this.ring.size === 0) return undefined
    const hash = this.hash(key)
    const idx = this.binarySearch(hash)
    return this.ring.get(this.sortedKeys[idx]!)
  }

  public get nodeCount(): number {
    return this._nodeCount
  }

  public get ringSize(): number {
    return this.ring.size
  }

  private binarySearch(hash: number): number {
    let lo = 0
    let hi = this.sortedKeys.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.sortedKeys[mid]! < hash) lo = mid + 1
      else hi = mid
    }
    return lo < this.sortedKeys.length ? lo : 0
  }

  private hash(key: string): number {
    let h = 2166136261
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }

  getNodes(): T[] {
    return Array.from(new Set(this.ring.values()))
  }

  toString(): string {
    return `ConsistentHash(nodes=${this._nodeCount}, ringSize=${this.ring.size})`
  }

  toJSON(): unknown {
    return { virtualNodes: this.virtualNodes, nodeCount: this._nodeCount, ringSize: this.ring.size }
  }

  clone(): ConsistentHash<T> {
    const copy = new ConsistentHash<T>({ virtualNodes: this.virtualNodes })
    for (const [, node] of this.ring) {
      copy.addNode(node)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ConsistentHash)) return false
    if (this.virtualNodes !== other.virtualNodes) return false
    if (this._nodeCount !== other._nodeCount) return false
    if (this.ring.size !== other.ring.size) return false
    for (const [hash, node] of this.ring) {
      if (other.ring.get(hash) !== node) return false
    }
    return true
  }
}
