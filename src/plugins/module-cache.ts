import path from 'node:path'

interface CacheEntry {
  loadedAt: number
  module: unknown
}

let reloadCounter = 0

export class ModuleCache {
  private entries = new Map<string, CacheEntry>()

  public track(filePath: string, module: unknown): void {
    const key = path.resolve(filePath)
    this.entries.set(key, { loadedAt: Date.now(), module })
  }

  public get(filePath: string): unknown | undefined {
    return this.entries.get(path.resolve(filePath))?.module
  }

  public invalidate(filePath: string): boolean {
    return this.entries.delete(path.resolve(filePath))
  }

  public invalidateAll(): number {
    const count = this.entries.size
    this.entries.clear()
    return count
  }

  public has(filePath: string): boolean {
    return this.entries.has(path.resolve(filePath))
  }

  public get size(): number {
    return this.entries.size
  }

  public async reload(filePath: string): Promise<unknown> {
    const resolved = path.resolve(filePath)
    this.entries.delete(resolved)
    const cacheBust = `${Date.now()}-${reloadCounter++}`
    const imported = await import(`${resolved}?t=${cacheBust}`)
    this.entries.set(resolved, { loadedAt: Date.now(), module: imported })
    return imported
  }
}
