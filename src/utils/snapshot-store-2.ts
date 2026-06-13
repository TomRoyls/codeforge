export interface Snapshot2<T = unknown> {
  id: string
  data: T
  timestamp: number
  label?: string
}

export class SnapshotStore2<T = unknown> {
  private snapshots: Map<string, Snapshot2<T>> = new Map()
  private order: string[] = []
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  take(data: T, label?: string): string {
    const id = `snap_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const snapshot: Snapshot2<T> = { id, data, timestamp: Date.now(), label }
    this.snapshots.set(id, snapshot)
    this.order.push(id)
    this.enforceLimit()
    return id
  }

  restore(id: string): T | undefined {
    return this.snapshots.get(id)?.data
  }

  get(id: string): Snapshot2<T> | undefined {
    return this.snapshots.get(id)
  }

  has(id: string): boolean {
    return this.snapshots.has(id)
  }

  remove(id: string): boolean {
    if (!this.snapshots.delete(id)) return false
    this.order = this.order.filter(i => i !== id)
    return true
  }

  latest(): Snapshot2<T> | undefined {
    if (this.order.length === 0) return undefined
    return this.snapshots.get(this.order[this.order.length - 1])
  }

  oldest(): Snapshot2<T> | undefined {
    if (this.order.length === 0) return undefined
    return this.snapshots.get(this.order[0])
  }

  all(): Snapshot2<T>[] {
    return this.order.map(id => this.snapshots.get(id)!).filter(Boolean)
  }

  findByLabel(label: string): Snapshot2<T>[] {
    return this.all().filter(s => s.label === label)
  }

  count(): number { return this.snapshots.size }

  clear(): void {
    this.snapshots.clear()
    this.order = []
  }

  diff(id1: string, id2: string): { added: string[]; removed: string[]; changed: string[] } | null {
    const s1 = this.snapshots.get(id1)
    const s2 = this.snapshots.get(id2)
    if (!s1 || !s2) return null
    const obj1 = s1.data as Record<string, unknown>
    const obj2 = s2.data as Record<string, unknown>
    const keys1 = new Set(Object.keys(obj1))
    const keys2 = new Set(Object.keys(obj2))
    const added = [...keys2].filter(k => !keys1.has(k))
    const removed = [...keys1].filter(k => !keys2.has(k))
    const changed = [...keys1].filter(k => keys2.has(k) && JSON.stringify(obj1[k]) !== JSON.stringify(obj2[k]))
    return { added, removed, changed }
  }

  private enforceLimit(): void {
    while (this.order.length > this.maxSize) {
      const oldest = this.order.shift()!
      this.snapshots.delete(oldest)
    }
  }

  toArray(): string[] { return [...this.order] }
  toString(): string { return JSON.stringify({ count: this.count() }) }
  toJSON(): Record<string, unknown> { return { count: this.count(), maxSize: this.maxSize } }
  clone(): SnapshotStore2<T> {
    const ss = new SnapshotStore2<T>(this.maxSize)
    this.snapshots.forEach((s, id) => { ss.snapshots.set(id, { ...s }); })
    ss.order = [...this.order]
    return ss
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SnapshotStore2)) return false
    return this.count() === other.count()
  }
}
