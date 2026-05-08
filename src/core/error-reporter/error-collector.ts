import type { ErrorEntry } from './types.js'

export class ErrorCollector {
  private entries: Map<string, ErrorEntry> = new Map()

  add(error: ErrorEntry): void {
    this.entries.set(error.id, error)
  }

  addMany(errors: ErrorEntry[]): void {
    for (const error of errors) {
      this.entries.set(error.id, error)
    }
  }

  remove(id: string): boolean {
    return this.entries.delete(id)
  }

  clear(): void {
    this.entries.clear()
  }

  getAll(): ErrorEntry[] {
    return Array.from(this.entries.values())
  }

  getById(id: string): ErrorEntry | null {
    return this.entries.get(id) ?? null
  }

  getByFile(filePath: string): ErrorEntry[] {
    const result: ErrorEntry[] = []
    for (const entry of this.entries.values()) {
      if (entry.filePath === filePath) {
        result.push(entry)
      }
    }
    return result
  }

  getByRule(ruleId: string): ErrorEntry[] {
    const result: ErrorEntry[] = []
    for (const entry of this.entries.values()) {
      if (entry.ruleId === ruleId) {
        result.push(entry)
      }
    }
    return result
  }

  getBySeverity(severity: ErrorEntry['severity']): ErrorEntry[] {
    const result: ErrorEntry[] = []
    for (const entry of this.entries.values()) {
      if (entry.severity === severity) {
        result.push(entry)
      }
    }
    return result
  }

  getFixable(): ErrorEntry[] {
    const result: ErrorEntry[] = []
    for (const entry of this.entries.values()) {
      if (entry.fix !== undefined) {
        result.push(entry)
      }
    }
    return result
  }

  count(): number {
    return this.entries.size
  }
}
