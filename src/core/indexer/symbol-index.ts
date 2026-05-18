import type { SymbolEntry, IndexStats } from './types.js'
import { append } from '../../utils/map-helpers.js'

export class SymbolIndex {
  private symbols: Map<string, SymbolEntry[]> = new Map()
  private fileSymbols: Map<string, SymbolEntry[]> = new Map()
  private lastUpdated: number = 0

  addSymbol(entry: SymbolEntry): void {
    append(this.symbols, entry.name, entry)

    const fileExisting = this.fileSymbols.get(entry.filePath)
    if (fileExisting) {
      fileExisting.push(entry)
    } else {
      this.fileSymbols.set(entry.filePath, [entry])
    }

    for (const child of entry.children) {
      this.addSymbol(child)
    }

    this.lastUpdated = Date.now()
  }

  removeSymbolsForFile(filePath: string): void {
    const entries = this.fileSymbols.get(filePath)
    if (!entries) return

    for (const entry of entries) {
      const named = this.symbols.get(entry.name)
      if (named) {
        const filtered = named.filter((s) => s.filePath !== filePath)
        if (filtered.length === 0) {
          this.symbols.delete(entry.name)
        } else {
          this.symbols.set(entry.name, filtered)
        }
      }
    }

    this.fileSymbols.delete(filePath)
    this.lastUpdated = Date.now()
  }

  lookup(name: string): SymbolEntry[] {
    return this.symbols.get(name) ?? []
  }

  lookupByKind(kind: SymbolEntry['kind']): SymbolEntry[] {
    const result: SymbolEntry[] = []
    for (const entries of this.symbols.values()) {
      for (const entry of entries) {
        if (entry.kind === kind) {
          result.push(entry)
        }
      }
    }
    return result
  }

  getAll(): SymbolEntry[] {
    const result: SymbolEntry[] = []
    for (const entries of this.symbols.values()) {
      result.push(...entries)
    }
    return result
  }

  getStats(): IndexStats {
    let totalSymbols = 0
    const byKind = new Map<string, number>()

    for (const entries of this.symbols.values()) {
      for (const entry of entries) {
        totalSymbols++
        const count = byKind.get(entry.kind) ?? 0
        byKind.set(entry.kind, count + 1)
      }
    }

    return {
      totalFiles: this.fileSymbols.size,
      totalSymbols,
      indexSize: this.symbols.size,
      lastUpdated: this.lastUpdated,
      byKind,
    }
  }

  clear(): void {
    this.symbols.clear()
    this.fileSymbols.clear()
    this.lastUpdated = 0
  }
}
