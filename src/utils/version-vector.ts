export interface VersionVectorOptions {
  nodeId: string
}

export class VersionVector {
  private readonly vector: Map<string, number> = new Map()
  private readonly nodeId: string

  constructor(options: VersionVectorOptions) {
    this.nodeId = options.nodeId
  }

  public increment(): number {
    const current = this.vector.get(this.nodeId) ?? 0
    const next = current + 1
    this.vector.set(this.nodeId, next)
    return next
  }

  public get(nodeId: string): number {
    return this.vector.get(nodeId) ?? 0
  }

  public merge(other: VersionVector): void {
    other.vector.forEach((version, nodeId) => {
      const current = this.vector.get(nodeId) ?? 0
      if (version > current) {
        this.vector.set(nodeId, version)
      }
    })
  }

  public compare(other: VersionVector): 'before' | 'after' | 'concurrent' | 'equal' {
    let thisBefore = false
    let otherBefore = false

    const allKeys = new Set([...this.vector.keys(), ...other.vector.keys()])
    for (const key of allKeys) {
      const a = this.vector.get(key) ?? 0
      const b = other.vector.get(key) ?? 0
      if (a < b) thisBefore = true
      if (a > b) otherBefore = true
    }

    if (!thisBefore && !otherBefore) return 'equal'
    if (thisBefore && !otherBefore) return 'before'
    if (!thisBefore && otherBefore) return 'after'
    return 'concurrent'
  }

  public clone(): VersionVector {
    const cloned = new VersionVector({ nodeId: this.nodeId })
    this.vector.forEach((v, k) => cloned.vector.set(k, v))
    return cloned
  }

  public toArray(): Array<[string, number]> {
    return [...this.vector.entries()]
  }

  public get size(): number {
    return this.vector.size
  }

  public getNodeId(): string {
    return this.nodeId
  }
}
