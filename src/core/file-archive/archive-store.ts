import type { ArchivedFile } from './types.js'
import { sortedBy } from '../../utils/array-helpers.js'

export class ArchiveStore {
  private store = new Map<string, Map<number, ArchivedFile>>()

  add(file: ArchivedFile): void {
    let versions = this.store.get(file.path)
    if (!versions) {
      versions = new Map()
      this.store.set(file.path, versions)
    }
    versions.set(file.version, file)
  }

  get(path: string, version?: number): ArchivedFile | null {
    const versions = this.store.get(path)
    if (!versions) return null
    if (version !== undefined) {
      return versions.get(version) ?? null
    }
    return this.getLatest(path)
  }

  getLatest(path: string): ArchivedFile | null {
    const versions = this.store.get(path)
    if (!versions || versions.size === 0) return null
    let latest: ArchivedFile | null = null
    for (const file of versions.values()) {
      if (!latest || file.version > latest.version) {
        latest = file
      }
    }
    return latest
  }

  getAll(path: string): ArchivedFile[] {
    const versions = this.store.get(path)
    if (!versions) return []
    return sortedBy([...versions.values()], v => v.version)
  }

  remove(path: string, version?: number): boolean {
    const versions = this.store.get(path)
    if (!versions) return false
    if (version !== undefined) {
      const deleted = versions.delete(version)
      if (versions.size === 0) {
        this.store.delete(path)
      }
      return deleted
    }
    return this.store.delete(path)
  }

  exists(path: string): boolean {
    const versions = this.store.get(path)
    return versions !== undefined && versions.size > 0
  }

  getVersions(path: string): number[] {
    const versions = this.store.get(path)
    if (!versions) return []
    return [...versions.keys()].sort((a, b) => a - b)
  }

  size(): number {
    let total = 0
    for (const versions of this.store.values()) {
      total += versions.size
    }
    return total
  }

  clear(): void {
    this.store.clear()
  }

  paths(): string[] {
    return Array.from(this.store.keys())
  }
}
