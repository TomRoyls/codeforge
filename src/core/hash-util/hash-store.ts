import type { HashEntry, HashAlgorithm } from './types.js'

export class HashStore {
  private entries: Map<string, HashEntry> = new Map()
  private algorithm: HashAlgorithm

  constructor(algorithm: HashAlgorithm = 'djb2') {
    this.algorithm = algorithm
  }

  add(key: string, hash: string, metadata: Record<string, unknown> = {}): void {
    this.entries.set(key, {
      key,
      hash,
      algorithm: this.algorithm,
      size: hash.length,
      createdAt: Date.now(),
      metadata,
    })
  }

  get(key: string): HashEntry | null {
    return this.entries.get(key) ?? null
  }

  has(key: string): boolean {
    return this.entries.has(key)
  }

  remove(key: string): boolean {
    return this.entries.delete(key)
  }

  findByHash(hash: string): HashEntry[] {
    const results: HashEntry[] = []
    for (const entry of this.entries.values()) {
      if (entry.hash === hash) {
        results.push(entry)
      }
    }
    return results
  }

  getAll(): HashEntry[] {
    return Array.from(this.entries.values())
  }

  size(): number {
    return this.entries.size
  }

  clear(): void {
    this.entries.clear()
  }

  export(): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [key, entry] of this.entries) {
      result[key] = entry.hash
    }
    return result
  }

  import(data: Record<string, string>): void {
    for (const [key, hash] of Object.entries(data)) {
      this.add(key, hash)
    }
  }
}
