export interface MetadataEntry {
  key: string
  value: unknown
  type: string
}

export class MetadataExtractor2 {
  private metadata: Map<string, MetadataEntry> = new Map()

  set(key: string, value: unknown): this {
    this.metadata.set(key, { key, value, type: typeof value })
    return this
  }

  get(key: string): unknown {
    return this.metadata.get(key)?.value
  }

  getEntry(key: string): MetadataEntry | undefined {
    return this.metadata.get(key)
  }

  has(key: string): boolean {
    return this.metadata.has(key)
  }

  remove(key: string): boolean {
    return this.metadata.delete(key)
  }

  keys(): string[] {
    return Array.from(this.metadata.keys())
  }

  values(): unknown[] {
    return Array.from(this.metadata.values()).map(e => e.value)
  }

  entries(): MetadataEntry[] {
    return Array.from(this.metadata.values())
  }

  size(): number {
    return this.metadata.size
  }

  clear(): void {
    this.metadata.clear()
  }

  filterByType(type: string): MetadataEntry[] {
    return this.entries().filter(e => e.type === type)
  }

  filterByPrefix(prefix: string): MetadataEntry[] {
    return this.entries().filter(e => e.key.startsWith(prefix))
  }

  toObject(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    this.metadata.forEach((entry) => { result[entry.key] = entry.value })
    return result
  }

  merge(other: MetadataExtractor2): this {
    other.entries().forEach(e => this.set(e.key, e.value))
    return this
  }

  static fromObject(obj: Record<string, unknown>): MetadataExtractor2 {
    const me = new MetadataExtractor2()
    for (const [key, value] of Object.entries(obj)) {
      me.set(key, value)
    }
    return me
  }

  static extractFunctionInfo(fn: Function): { name: string; arity: number; params: string[] } {
    const fnStr = fn.toString()
    const match = fnStr.match(/(?:function\s+)?(\w+)?\s*\(([^)]*)\)/)
    const name = match?.[1] || fn.name || 'anonymous'
    const paramsStr = match?.[2]?.trim() || ''
    const params = paramsStr ? paramsStr.split(',').map(p => p.trim()) : []
    return { name, arity: params.length, params }
  }

  static extractClassInfo(cls: new (...args: unknown[]) => unknown): { name: string; methods: string[] } {
    const proto = cls.prototype
    const methods = Object.getOwnPropertyNames(proto).filter(m => m !== 'constructor' && typeof proto[m] === 'function')
    return { name: cls.name, methods }
  }

  toArray(): MetadataEntry[] { return this.entries() }
  toString(): string { return JSON.stringify(this.toObject()) }
  toJSON(): Record<string, unknown> { return this.toObject() }
  clone(): MetadataExtractor2 {
    const me = new MetadataExtractor2()
    this.metadata.forEach((entry) => me.set(entry.key, entry.value))
    return me
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MetadataExtractor2)) return false
    return this.size() === other.size()
  }
}
