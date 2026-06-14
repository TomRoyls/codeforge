export type OverlayStrategy2 = 'merge' | 'replace' | 'deep-merge' | 'first-wins' | 'last-wins'

export interface ConfigLayer2 {
  name: string
  priority: number
  enabled: boolean
  data: Record<string, unknown>
  strategy: OverlayStrategy2
}

export class ConfigOverlay2 {
  private layers: Map<string, ConfigLayer2> = new Map()
  private watchers: Map<string, Array<(key: string, value: unknown) => void>> = new Map()

  addLayer(name: string, data: Record<string, unknown>, priority = 0, strategy: OverlayStrategy2 = 'deep-merge'): this {
    this.layers.set(name, { name, priority, enabled: true, data, strategy })
    return this
  }

  removeLayer(name: string): boolean {
    return this.layers.delete(name)
  }

  enableLayer(name: string): boolean {
    const layer = this.layers.get(name)
    if (!layer) return false
    layer.enabled = true
    return true
  }

  disableLayer(name: string): boolean {
    const layer = this.layers.get(name)
    if (!layer) return false
    layer.enabled = false
    return true
  }

  setPriority(name: string, priority: number): boolean {
    const layer = this.layers.get(name)
    if (!layer) return false
    layer.priority = priority
    return true
  }

  setStrategy(name: string, strategy: OverlayStrategy2): boolean {
    const layer = this.layers.get(name)
    if (!layer) return false
    layer.strategy = strategy
    return true
  }

  getLayer(name: string): ConfigLayer2 | undefined { return this.layers.get(name) }

  getLayers(): ConfigLayer2[] {
    return Array.from(this.layers.values()).sort((a, b) => b.priority - a.priority)
  }

  getActiveLayers(): ConfigLayer2[] {
    return this.getLayers().filter(l => l.enabled)
  }

  resolve(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    const layers = [...this.getActiveLayers()].reverse()
    for (const layer of layers) {
      this.applyStrategy(result, layer.data, layer.strategy)
    }
    return result
  }

  resolveKey(key: string): unknown {
    return this.resolve()[key]
  }

  private applyStrategy(target: Record<string, unknown>, source: Record<string, unknown>, strategy: OverlayStrategy2): void {
    switch (strategy) {
      case 'replace':
        for (const k of Object.keys(source)) target[k] = source[k]
        break
      case 'merge':
        Object.assign(target, source)
        break
      case 'deep-merge':
        this.deepMerge(target, source)
        break
      case 'first-wins':
        for (const k of Object.keys(source)) {
          if (!(k in target)) target[k] = source[k]
        }
        break
      case 'last-wins':
        for (const k of Object.keys(source)) target[k] = source[k]
        break
    }
  }

  private deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
    for (const key of Object.keys(source)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) &&
          typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
        this.deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
      } else {
        target[key] = source[key]
      }
    }
  }

  watch(key: string, callback: (key: string, value: unknown) => void): this {
    if (!this.watchers.has(key)) this.watchers.set(key, [])
    this.watchers.get(key)!.push(callback)
    return this
  }

  unwatch(key: string): boolean { return this.watchers.delete(key) }

  notifyWatchers(key: string, value: unknown): void {
    this.watchers.get(key)?.forEach(cb => cb(key, value))
  }

  updateLayer(name: string, data: Record<string, unknown>): boolean {
    const layer = this.layers.get(name)
    if (!layer) return false
    layer.data = data
    Object.keys(data).forEach(k => this.notifyWatchers(k, data[k]))
    return true
  }

  setLayerValue(name: string, key: string, value: unknown): boolean {
    const layer = this.layers.get(name)
    if (!layer) return false
    layer.data[key] = value
    this.notifyWatchers(key, value)
    return true
  }

  hasConflict(key: string): boolean {
    const values: unknown[] = []
    this.getActiveLayers().forEach(l => { if (key in l.data) values.push(l.data[key]) })
    const first = values[0]
    return values.some(v => v !== first)
  }

  getConflicts(): string[] {
    const allKeys = new Set<string>()
    this.getActiveLayers().forEach(l => Object.keys(l.data).forEach(k => allKeys.add(k)))
    return Array.from(allKeys).filter(k => this.hasConflict(k))
  }

  getSummary(): { layers: number; active: number; conflicts: number } {
    return {
      layers: this.layers.size,
      active: this.getActiveLayers().length,
      conflicts: this.getConflicts().length,
    }
  }

  count(): number { return this.layers.size }

  toArray(): ConfigLayer2[] { return Array.from(this.layers.values()) }
  toString(): string { return JSON.stringify(this.getSummary()) }
  toJSON(): Record<string, unknown> { return this.getSummary() }
  clone(): ConfigOverlay2 {
    const co = new ConfigOverlay2()
    this.layers.forEach((l, name) => co.layers.set(name, { ...l, data: { ...l.data } }))
    return co
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ConfigOverlay2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.layers.clear()
    this.watchers.clear()
  }
}
