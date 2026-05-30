export class LSMTree<V> {
  private memtable: Map<string, V> = new Map()
  private tombstones: Set<string> = new Set()
  private readonly flushThreshold: number
  private levels: Array<Map<string, V | undefined>> = []

  constructor(flushThreshold: number = 100) {
    this.flushThreshold = flushThreshold
  }

  set(key: string, value: V): void {
    this.memtable.set(key, value)
    this.tombstones.delete(key)
    if (this.memtable.size >= this.flushThreshold) {
      this.flush()
    }
  }

  get(key: string): V | undefined {
    if (this.tombstones.has(key)) return undefined
    if (this.memtable.has(key)) return this.memtable.get(key)
    for (const level of this.levels) {
      if (level.has(key)) {
        const val = level.get(key)
        return val === undefined ? undefined : val
      }
    }
    return undefined
  }

  delete(key: string): void {
    this.memtable.delete(key)
    this.tombstones.add(key)
    if (this.memtable.size + this.tombstones.size >= this.flushThreshold) {
      this.flush()
    }
  }

  has(key: string): boolean {
    if (this.tombstones.has(key)) return false
    if (this.memtable.has(key)) return true
    for (const level of this.levels) {
      if (level.has(key) && level.get(key) !== undefined) return true
    }
    return false
  }

  entries(): Array<[string, V]> {
    const result = new Map<string, V>()
    for (let i = this.levels.length - 1; i >= 0; i--) {
      for (const [k, v] of this.levels[i]!) {
        if (v !== undefined) result.set(k, v)
        else result.delete(k)
      }
    }
    for (const [k, v] of this.memtable) {
      result.set(k, v)
    }
    for (const k of this.tombstones) {
      result.delete(k)
    }
    return [...result.entries()]
  }

  get memtableSize(): number {
    return this.memtable.size
  }

  get levelCount(): number {
    return this.levels.length
  }

  private flush(): void {
    const flushed = new Map<string, V | undefined>()
    for (const [k, v] of this.memtable) {
      flushed.set(k, v)
    }
    for (const k of this.tombstones) {
      flushed.set(k, undefined)
    }
    this.levels.unshift(flushed)
    this.memtable.clear()
    this.tombstones.clear()
    this.compact()
  }

  private compact(): void {
    if (this.levels.length <= 3) return
    const merged = new Map<string, V | undefined>()
    for (let i = this.levels.length - 1; i >= 0; i--) {
      for (const [k, v] of this.levels[i]!) {
        if (!merged.has(k)) merged.set(k, v)
      }
    }
    this.levels = [merged]
  }
}
